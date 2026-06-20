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

export type HomeProject = {
  uid: string;
  url: string;
  title: string;
  subtitle?: string;
  siteUrl?: string;
  description?: string;
};

function dedupeProjects(projects: HomeProject[]): HomeProject[] {
  return projects.filter(
    (project, index, list) =>
      list.findIndex((item) => item.uid === project.uid) === index,
  );
}

export function buildRuntimeProject(project: HomeProject) {
  const projectIndex = getProjectIndexByUid(project.uid) ?? 0;
  return {
    uid: project.uid,
    url: project.url,
    title: project.title,
    subtitle: project.subtitle ?? "",
    site_link: project.siteUrl
      ? {
          link_type: "Web",
          key: `local-${project.uid}`,
          url: project.siteUrl,
          target: "_blank",
        }
      : null,
    collaborator: null,
    mux_playback_id: `local-project-${projectIndex}`,
    brightness: null,
    contrast: null,
    project_media: [{ mux_playback_id: `local-project-${projectIndex}` }],
    description: project.description ?? "",
  };
}

export function buildRuntimeProjects(projects: HomeProject[]) {
  return dedupeProjects(projects).map(buildRuntimeProject);
}

export function buildProjectIds(projects: HomeProject[]): string[] {
  return dedupeProjects(projects).map((project) => project.uid);
}

export function buildMuxThumbnailPatchScript({
  fallbackIndex = null,
  nextProject = null,
  projectIds = [],
  runtimeProjects = [],
}: Options = {}): string {
  return `
(() => {
  // On-screen diagnostic, only active with ?debug in the URL. Lets us read the
  // reel's texture state on a real device without USB remote-debugging.
  if (typeof location !== "undefined" && /[?&]debug\\b/.test(location.search)) {
    var __dbgState = {};
    var __dbgFails = {};
    var __dbgOverlay = null;
    var __ensureOverlay = function () {
      if (__dbgOverlay && document.body && document.body.contains(__dbgOverlay)) return;
      if (!document.body) return;
      __dbgOverlay = document.createElement("div");
      __dbgOverlay.setAttribute("style", [
        "position:fixed","top:0","left:0","right:0","z-index:2147483647",
        "background:rgba(0,0,0,0.85)","color:#0f0","font:11px/1.35 monospace",
        "padding:6px 8px","white-space:pre-wrap","pointer-events:none",
        "max-height:55vh","overflow:hidden","border-bottom:1px solid #0f0",
      ].join(";"));
      document.body.appendChild(__dbgOverlay);
    };
    var __render = function (sel, keys) {
      __ensureOverlay();
      if (!__dbgOverlay) return;
      var lines = ["[REELDEBUG] selectedIndex=" + sel + "  keys(" + keys.length + ")=" + JSON.stringify(keys)];
      keys.forEach(function (k) { lines.push("  " + k + " => " + (__dbgState[k] || "pending")); });
      var fk = Object.keys(__dbgFails);
      if (fk.length) { lines.push("IMG FAILED:"); fk.forEach(function (u) { lines.push("  " + u); }); }
      __dbgOverlay.textContent = lines.join("\\n");
    };

    window.addEventListener("error", function (e) {
      var target = e && e.target;
      if (target && target.tagName === "IMG") {
        var src = target.currentSrc || target.src || "";
        if (src.indexOf("/textures/projects/") >= 0 || src.indexOf("/api/mux-image/") >= 0) {
          __dbgFails[src] = 1;
        }
      }
    }, true);

    var __reelDump = function () {
      try {
        var ps = globalThis.__PROJECTS_STORE__;
        if (!ps) { __ensureOverlay(); if (__dbgOverlay) __dbgOverlay.textContent = "[REELDEBUG] projects store not ready"; return; }
        var st = ps.getState();
        var sel = st.selectedProjectIndex && st.selectedProjectIndex.get ? st.selectedProjectIndex.get() : "?";
        var tex = st.projectThumbnailTextures && st.projectThumbnailTextures.get ? st.projectThumbnailTextures.get() : {};
        var keys = Object.keys(tex || {});
        keys.forEach(function (k) {
          if (__dbgState[k] && __dbgState[k].indexOf("RESOLVED") === 0) return;
          Promise.resolve(tex[k]).then(function (texture) {
            var img = texture && texture.image;
            __dbgState[k] = "RESOLVED " + (img ? (img.width + "x" + img.height) : "NO IMAGE");
          }).catch(function (err) {
            __dbgState[k] = "REJECTED " + ((err && (err.message || err)) || "unknown");
          });
        });
        __render(sel, keys);
      } catch (e) { __ensureOverlay(); if (__dbgOverlay) __dbgOverlay.textContent = "[REELDEBUG] dump error " + e; }
    };
    setInterval(__reelDump, 1500);
  }
  const map = ${JSON.stringify(playbackIdToIndex)};
  const fallbackIndex = ${fallbackIndex === null ? "null" : JSON.stringify(fallbackIndex)};
  const nextProject = ${nextProject === null ? "null" : JSON.stringify(nextProject)};
  const projectIds = ${JSON.stringify(projectIds)};
  const runtimeProjects = ${JSON.stringify(runtimeProjects)};
  const projectThumbnailIndices = Array.from(
    new Set(
      runtimeProjects
        .map((project) => {
          const local = String(project?.mux_playback_id ?? "").match(/^local-project-(\\d+)$/);
          return local ? Number(local[1]) : null;
        })
        .filter((idx) => typeof idx === "number"),
    ),
  );
  const preloadProjectThumbnails = () => {
    for (const idx of projectThumbnailIndices) {
      for (const href of [
        "/textures/projects/project_thumb_" + idx + ".jpg",
        "/textures/projects/project_thumb_order_" + idx + ".jpg",
      ]) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        img.src = href;
      }
    }
  };
  preloadProjectThumbnails();
  const needsFlightRewrite =
    fallbackIndex != null || runtimeProjects.length > 0 || projectIds.length > 0;
  const scrubProjectMedia = (value) => {
    if (typeof value !== "string") return value;
    let nextValue = value;
    if (fallbackIndex != null) {
      nextValue = nextValue.replace(
        /"project_media":\\[(\\{"mux_playback_id":"[^"]+"\\})(?:,\\{"mux_playback_id":"[^"]+"\\})*\\]/g,
        '"project_media":[$1]',
      );
    }
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
  }

  if (needsFlightRewrite) {
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
    const local = typeof id === "string" && id.match(/^local-project-(\\d+)$/);
    if (local) return Number(local[1]);
    return fallbackIndex;
  };
  const resolveThumbnailPath = (idx) => {
    return "/textures/projects/project_thumb_order_" + idx + ".jpg";
  };
  const isMuxVideoUrl = (u) => typeof u === "string" && (u.includes("stream.mux.com/") || /\\.m3u8(\\?|$)/.test(u) || /\\.ts(\\?|$)/.test(u));
  const rewriteMuxImageUrl = (value) => {
    if (typeof value !== "string") return value;
    const m = value.match(/\\/api\\/mux-image\\/([^/]+)\\//);
    if (!m) return value;
    const idx = resolveIndex(m[1]);
    if (idx == null) return value;
    return resolveThumbnailPath(idx);
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
