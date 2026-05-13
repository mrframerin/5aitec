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
    </>
  );
}
