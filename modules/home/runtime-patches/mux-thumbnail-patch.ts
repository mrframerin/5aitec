import projectThumbnails from "../content/project-thumbnails.json";

type Options = {
  fallbackIndex?: number | null;
  nextProject?: Record<string, unknown> | null;
  projectIds?: string[];
  runtimeProjects?: Record<string, unknown>[];
};

const { playbackIdToIndex, uidToIndex } = projectThumbnails as {
  playbackIdToIndex: Record<string, number>;
  uidToIndex: Record<string, number>;
};

export function getProjectIndexByUid(uid: string): number | null {
  const idx = uidToIndex[uid];
  return typeof idx === "number" ? idx : null;
}

export function buildMuxThumbnailPatchScript({
  fallbackIndex = null,
  nextProject = null,
  projectIds = [],
  runtimeProjects = [],
}: Options = {}): string {
  return `
(() => {
  const map = ${JSON.stringify(playbackIdToIndex)};
  const fallbackIndex = ${fallbackIndex === null ? "null" : JSON.stringify(fallbackIndex)};
  const nextProject = ${nextProject === null ? "null" : JSON.stringify(nextProject)};
  const projectIds = ${JSON.stringify(projectIds)};
  const runtimeProjects = ${JSON.stringify(runtimeProjects)};
  const scrubProjectMedia = (value) => {
    if (fallbackIndex == null || typeof value !== "string") return value;
    let nextValue = value.replace(
      /"project_media":\\[(\\{"mux_playback_id":"[^"]+"\\})(?:,\\{"mux_playback_id":"[^"]+"\\})*\\]/g,
      '"project_media":[$1]',
    );
    if (projectIds.length) {
      nextValue = nextValue.replace(
        /"projectIds":\\[[^\\]]*\\]/g,
        '"projectIds":' + JSON.stringify(projectIds),
      );
    }
    if (runtimeProjects.length) {
      const projectsStartMarker = '"projects":[';
      const projectsEndMarker = '],"a11yChildren"';
      const projectsStart = nextValue.indexOf(projectsStartMarker);
      const projectsEnd = nextValue.indexOf(projectsEndMarker, projectsStart);
      if (projectsStart >= 0 && projectsEnd > projectsStart) {
        nextValue =
          nextValue.slice(0, projectsStart) +
          '"projects":' + JSON.stringify(runtimeProjects) +
          nextValue.slice(projectsEnd + 1);
      }
    }
    if (nextProject) {
      nextValue = nextValue.replace(
        /"nextProject":\\{[\\s\\S]*?\\}\\}\\],\\[\\[/g,
        '"nextProject":' + JSON.stringify(nextProject) + '}],[[',
      );
    }
    return nextValue;
  };
  if (fallbackIndex != null) {
    const removeAntiPortfolioSection = () => {
      document
        .querySelectorAll?.(".anti-portfolio-home, #anti-portfolio, #anti-portfolio-a11y")
        ?.forEach((node) => node.remove());
    };
    const antiPortfolioStyle = document.createElement("style");
    antiPortfolioStyle.textContent =
      ".anti-portfolio-home,#anti-portfolio,#anti-portfolio-a11y{display:none!important}";
    document.documentElement.appendChild(antiPortfolioStyle);
    if (document.body) removeAntiPortfolioSection();
    else document.addEventListener("DOMContentLoaded", removeAntiPortfolioSection);
    const antiPortfolioObserver = new MutationObserver(removeAntiPortfolioSection);
    if (document.documentElement) {
      antiPortfolioObserver.observe(document.documentElement, { subtree: true, childList: true });
    }

    self.__next_f = self.__next_f || [];
    const origPush = self.__next_f.push.bind(self.__next_f);
    self.__next_f.push = function patchedNextFlightPush() {
      for (const payload of arguments) {
        if (Array.isArray(payload) && typeof payload[1] === "string") {
          payload[1] = scrubProjectMedia(payload[1]);
        }
      }
      return origPush.apply(this, arguments);
    };
    for (const payload of self.__next_f) {
      if (Array.isArray(payload) && typeof payload[1] === "string") {
        payload[1] = scrubProjectMedia(payload[1]);
      }
    }
  }
  const resolveIndex = (id) => {
    const v = map[id];
    if (typeof v === "number") return v;
    return fallbackIndex;
  };
  const isMuxVideoUrl = (u) => typeof u === "string" && (u.includes("stream.mux.com/") || /\\.m3u8(\\?|$)/.test(u) || /\\.ts(\\?|$)/.test(u));
  const rewriteMuxImageUrl = (value) => {
    if (typeof value !== "string") return value;
    const m = value.match(/\\/api\\/mux-image\\/([^/]+)\\//);
    if (!m) return value;
    const idx = resolveIndex(m[1]);
    if (idx == null) return value;
    return "/textures/projects/project_thumb_" + idx + ".jpg";
  };

  const origFetch = window.fetch.bind(window);
  window.fetch = function patchedFetch(input, init) {
    const url = typeof input === "string" ? input : input?.url;
    if (typeof url === "string") {
      if (isMuxVideoUrl(url)) {
        return Promise.resolve(new Response("", { status: 404, statusText: "Not Found" }));
      }
      const m = url.match(/\\/api\\/mux-image\\/([^/]+)\\//);
      if (m && !m[1].startsWith("local-project-")) {
        const idx = resolveIndex(m[1]);
        if (idx != null) {
          const newUrl = url.replace(/\\/api\\/mux-image\\/[^/]+\\//, "/api/mux-image/local-project-" + idx + "/");
          if (typeof input === "string") return origFetch(newUrl, init);
          return origFetch(new Request(newUrl, input), init);
        }
      }
    }
    return origFetch(input, init);
  };

  const OrigXHR = window.XMLHttpRequest;
  const origOpen = OrigXHR.prototype.open;
  const origSend = OrigXHR.prototype.send;
  OrigXHR.prototype.open = function (method, url) {
    this.__muxBlocked = isMuxVideoUrl(url);
    return origOpen.apply(this, arguments);
  };
  OrigXHR.prototype.send = function () {
    if (this.__muxBlocked) {
      setTimeout(() => {
        Object.defineProperty(this, "readyState", { value: 4, configurable: true });
        Object.defineProperty(this, "status", { value: 404, configurable: true });
        Object.defineProperty(this, "responseText", { value: "", configurable: true });
        Object.defineProperty(this, "response", { value: "", configurable: true });
        this.dispatchEvent(new Event("readystatechange"));
        this.dispatchEvent(new Event("error"));
      }, 0);
      return;
    }
    return origSend.apply(this, arguments);
  };

  const imgProto = HTMLImageElement.prototype;
  const imgSrcDesc = Object.getOwnPropertyDescriptor(imgProto, "src") ||
                     Object.getOwnPropertyDescriptor(HTMLElement.prototype, "src");
  if (imgSrcDesc && imgSrcDesc.set) {
    Object.defineProperty(imgProto, "src", {
      configurable: true,
      enumerable: imgSrcDesc.enumerable,
      get: imgSrcDesc.get,
      set(value) { imgSrcDesc.set.call(this, rewriteMuxImageUrl(value)); },
    });
  }

  const mediaProto = HTMLMediaElement.prototype;
  const srcDesc = Object.getOwnPropertyDescriptor(mediaProto, "src") ||
                  Object.getOwnPropertyDescriptor(HTMLElement.prototype, "src");
  if (srcDesc && srcDesc.set) {
    Object.defineProperty(mediaProto, "src", {
      configurable: true,
      enumerable: srcDesc.enumerable,
      get: srcDesc.get,
      set(value) {
        if (isMuxVideoUrl(value)) return;
        srcDesc.set.call(this, value);
      },
    });
  }

  const origSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    if (name === "src") {
      const tag = this.tagName;
      if ((tag === "VIDEO" || tag === "AUDIO" || tag === "SOURCE") && isMuxVideoUrl(value)) return;
      if (tag === "IMG") return origSetAttribute.call(this, name, rewriteMuxImageUrl(value));
    }
    return origSetAttribute.call(this, name, value);
  };

  const neutralizeVideos = () => {
    document.querySelectorAll("video, audio, source").forEach((v) => {
      const cur = v.getAttribute && v.getAttribute("src");
      if (cur && isMuxVideoUrl(cur)) {
        if (typeof v.pause === "function") v.pause();
        v.removeAttribute("src");
        if (typeof v.load === "function") v.load();
      }
    });
  };
  const startObserver = () => {
    const mo = new MutationObserver(neutralizeVideos);
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });
  };
  if (document.body) startObserver();
  else document.addEventListener("DOMContentLoaded", startObserver);
  setInterval(neutralizeVideos, 500);
})();
`;
}
