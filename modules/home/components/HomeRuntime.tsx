import { buildMuxThumbnailPatchScript } from "../runtime-patches/mux-thumbnail-patch";
import type { RuntimeContent } from "./types";

type HomeRuntimeProps = {
  runtime: RuntimeContent;
};

export function HomeRuntime({ runtime }: HomeRuntimeProps) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: "window.next=window.next||{};",
        }}
      />
      <script
        dangerouslySetInnerHTML={{ __html: buildMuxThumbnailPatchScript() }}
      />
      <script src={runtime.flightScript} />
      {runtime.chunks.map((chunk) => (
        <script key={chunk} src={`${runtime.chunkBase}/${chunk}`} />
      ))}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(() => {
  const syncMetadata = () => {
    const content = window.__SHADER_HOME_CONTENT__;
    if (!content?.document) return;

    document.title = content.document.title;

    const canonicalHref = content.document.canonical;
    document.querySelectorAll('link[rel="canonical"]').forEach((link, index) => {
      if (index === 0) {
        link.setAttribute("href", canonicalHref);
        return;
      }
      link.remove();
    });

    if (!document.querySelector('link[rel="canonical"]')) {
      const canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      canonical.setAttribute("href", canonicalHref);
      document.head.appendChild(canonical);
    }
  };

  syncMetadata();
  requestAnimationFrame(syncMetadata);
  setTimeout(syncMetadata, 500);
  setTimeout(syncMetadata, 2000);
})();
`,
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
(() => {
  const isWorkDetail = () => window.location.pathname.startsWith("/work/");
  const removeAntiPortfolioSection = () => {
    document
      .querySelectorAll(".anti-portfolio-home, #anti-portfolio-a11y")
      .forEach((node) => node.remove());
  };
  const removeIfWorkDetail = () => {
    if (!isWorkDetail()) return false;
    removeAntiPortfolioSection();
    return true;
  };
  const watchWorkDetailPath = () => {
    const notifyPathChange = () => {
      requestAnimationFrame(removeIfWorkDetail);
      setTimeout(removeIfWorkDetail, 150);
      setTimeout(removeIfWorkDetail, 600);
    };
    for (const method of ["pushState", "replaceState"]) {
      const original = history[method];
      history[method] = function patchedHistoryMethod() {
        const result = original.apply(this, arguments);
        notifyPathChange();
        return result;
      };
    }
    window.addEventListener("popstate", notifyPathChange);
    window.addEventListener("hashchange", notifyPathChange);
    notifyPathChange();
  };
  watchWorkDetailPath();
  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const buildAntiPortfolioSection = () => {
    if (removeIfWorkDetail()) {
      return null;
    }
    const antiPortfolio = window.__SHADER_HOME_CONTENT__?.antiPortfolio;
    if (!antiPortfolio || document.querySelector(".anti-portfolio-home")) {
      return document.querySelector(".anti-portfolio-home");
    }

    const section = document.createElement("section");
    section.className = "anti-portfolio-home anti-portfolio-home--mounted";
    section.id = "anti-portfolio";
    section.setAttribute("aria-label", antiPortfolio.title);
    section.innerHTML = \`
      <div class="anti-portfolio-home__inner">
        <p class="anti-portfolio-home__eyebrow">The Attempt Ledger / Vol. I</p>
        <div class="anti-portfolio-home__header">
          <div>
            <h2>\${escapeHtml(antiPortfolio.title)}</h2>
            <p>\${escapeHtml(antiPortfolio.subline)}</p>
          </div>
          <span aria-label="\${antiPortfolio.items.length} R.I.P. ventures">\${antiPortfolio.items.length} R.I.P.</span>
        </div>
        <div class="anti-portfolio-home__grid">
          \${antiPortfolio.items
            .map(
              (item, index) => \`
                <article class="anti-portfolio-home__card">
                  <div class="anti-portfolio-home__card-top">
                    <small>\${String(index + 1).padStart(2, "0")}</small>
                    <small>R.I.P.</small>
                  </div>
                  <h3>\${escapeHtml(item.name)}</h3>
                  <p>\${escapeHtml(item.oneLiner)}</p>
                </article>
              \`,
            )
            .join("")}
        </div>
      </div>
    \`;
    return section;
  };

  const mountAntiPortfolio = () => {
    if (removeIfWorkDetail()) {
      return false;
    }
    const section = buildAntiPortfolioSection();
    const scrollContainer = document.getElementById("scroll-container");
    if (!section || !scrollContainer) return false;

    section.classList.add("anti-portfolio-home--mounted");
    if (section.parentElement !== scrollContainer) {
      scrollContainer.appendChild(section);
    }
    return true;
  };

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (removeIfWorkDetail()) {
      window.clearInterval(timer);
      return;
    }
    if (mountAntiPortfolio() || attempts > 80) {
      window.clearInterval(timer);
    }
  }, 150);
})();
`,
        }}
      />
    </>
  );
}
