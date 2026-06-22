import {
  buildMuxThumbnailPatchScript,
  buildProjectIds,
  buildRuntimeProjects,
} from "../runtime-patches/mux-thumbnail-patch";
import type { HomeContent, RuntimeContent } from "./types";

type HomeRuntimeProps = {
  runtime: RuntimeContent;
  projects: HomeContent["projects"]["items"];
};

// Cache-bust the prebaked reel chunks (stable filenames served with
// must-revalidate) so devices reliably pick up chunk fixes instead of replaying
// a stale cached copy. Bump on every chunk edit.
const ASSET_VERSION = "20260622b";

export function HomeRuntime({ runtime, projects }: HomeRuntimeProps) {
  // Rewrite the baked-in flight payload (which only ships two projects) so the
  // home film strip renders every project from home.json in order.
  const patchScript = buildMuxThumbnailPatchScript({
    runtimeProjects: buildRuntimeProjects(projects),
    projectIds: buildProjectIds(projects),
  });

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: "window.next=window.next||{};",
        }}
      />
      <script dangerouslySetInnerHTML={{ __html: patchScript }} />
      <script src={`${runtime.flightScript}?v=${ASSET_VERSION}`} />
      {runtime.chunks.map((chunk) => (
        <script key={chunk} src={`${runtime.chunkBase}/${chunk}?v=${ASSET_VERSION}`} />
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

// Scroll-driven carousel for projects section
(() => {
  const SLIDE_COUNT = Math.max(
    1,
    globalThis.__SHADER_HOME_CONTENT__?.projects?.items?.length ?? 2,
  );
  const DEBOUNCE_MS = 500;
  const ENTRY_GRACE_MS = 1500;
  let lastWheelTime = 0;
  let lastActivePage = null;
  let pageEnteredAt = 0;
  let prevPage = null;

  // Reset carousel to slide 0 when entering projects from another page
  const resetCarouselToZero = () => {
    const projectsStore = globalThis.__PROJECTS_STORE__;
    if (!projectsStore) return;
    const projState = projectsStore.getState();
    if (projState.selectedProjectIndex && projState.selectedProjectIndex.set) {
      projState.selectedProjectIndex.set(0);
    }
  };

  const trackActivePage = () => {
    const pagesStore = globalThis.__PAGES_STORE__;
    if (!pagesStore) return;
    const state = pagesStore.getState();
    const activePage = state.activePage && state.activePage.get ? state.activePage.get() : null;
    if (activePage !== lastActivePage) {
      prevPage = lastActivePage;
      lastActivePage = activePage;
      if (activePage === 'projects') {
        pageEnteredAt = Date.now();
        // Reset to first slide when entering from outside
        resetCarouselToZero();
        // Also reset again after grace period in case momentum still pushed it
        setTimeout(resetCarouselToZero, 200);
        setTimeout(resetCarouselToZero, 500);
        setTimeout(resetCarouselToZero, 1000);
      }
    }
  };
  setInterval(trackActivePage, 50);

  const onWheel = (e) => {
    const pagesStore = globalThis.__PAGES_STORE__;
    const projectsStore = globalThis.__PROJECTS_STORE__;
    if (!pagesStore || !projectsStore) return;

    const state = pagesStore.getState();
    const activePage = state.activePage && state.activePage.get ? state.activePage.get() : null;
    if (activePage !== 'projects') return;

    const now = Date.now();

    // Grace period after entering projects section - block everything
    if (now - pageEnteredAt < ENTRY_GRACE_MS) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (now - lastWheelTime < DEBOUNCE_MS) {
      e.preventDefault();
      return;
    }

    const projState = projectsStore.getState();
    const currentIdx = projState.selectedProjectIndex && projState.selectedProjectIndex.get
      ? projState.selectedProjectIndex.get() : 0;
    const normalizedIdx = ((currentIdx % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT;

    const direction = e.deltaY > 0 ? 1 : -1;

    if (direction > 0 && normalizedIdx < SLIDE_COUNT - 1) {
      e.preventDefault();
      e.stopPropagation();
      projState.selectedProjectIndex.set(currentIdx + 1);
      lastWheelTime = now;
    } else if (direction < 0 && normalizedIdx > 0) {
      e.preventDefault();
      e.stopPropagation();
      projState.selectedProjectIndex.set(currentIdx - 1);
      lastWheelTime = now;
    }
  };

  window.addEventListener('wheel', onWheel, { passive: false, capture: true });
})();
`,
        }}
      />
    </>
  );
}
