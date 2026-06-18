"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { CrtOverlay, type CrtScene, type CrtSceneParams } from "./CrtOverlay";

/**
 * Reusable "old CRT monitor" screen wrapper.
 *
 * Wraps page content and presents it the way shader.se presents the
 * accessibility-statement page:
 *
 *   1. Smooth inertia scrolling — native scroll drives a lerped virtual
 *      position, so the document glides instead of snapping. This is the part
 *      that makes it feel like a heavy glass tube rather than a flat web page.
 *   2. A curved-screen presentation — perspective + a scroll-velocity flex so
 *      the content bows on the tube as it moves.
 *   3. The CRT post overlay (grain / sepia / chromatic aberration / refresh
 *      bar) via <CrtOverlay scrollReactive />.
 *
 * Drop-in:
 *   <CrtScreen scene="contact">
 *     ...page content...
 *   </CrtScreen>
 *
 * Fixed-position siblings (nav, close buttons) should live OUTSIDE this wrapper
 * so they stay pinned and aren't carried by the smooth-scroll transform.
 *
 * Honest limitation: the curvature is a CSS perspective bend, not a true
 * per-pixel barrel warp of the content. A pixel-exact barrel (like shader.se,
 * which authors its document directly in WebGL) would require rasterising the
 * DOM to a texture and mapping it onto a curved mesh — heavy, and it degrades
 * font/image fidelity. This approach keeps the real DOM live, selectable and
 * crisp while reproducing the smooth-scroll + curved-tube + CRT-grain feel.
 */

type CrtScreenProps = {
  children: ReactNode;
  /** CRT overlay scene preset. */
  scene?: CrtScene;
  /** Custom overlay params (overrides scene). */
  params?: CrtSceneParams;
  /** Smooth-scroll easing per frame, 0..1 (higher = snappier). */
  ease?: number;
  /** Curvature/flex strength multiplier. */
  curvature?: number;
  /**
   * Real barrel-distortion of the live DOM, in pixels of max edge
   * displacement (0 = off). Bends the actual content like curved CRT glass via
   * an SVG displacement filter. ~16–32 reads as a convex tube; too high blurs
   * text. Note: enabling this flattens the perspective push (SVG filters can't
   * preserve 3D), but the barrel itself supplies the depth illusion.
   */
  warp?: number;
  /**
   * Render the WebGL CRT grain/aberration overlay. Default true. Set false for
   * a guaranteed-bright page that relies only on smooth scroll + the CSS frame
   * (the WebGL overlay can wash dark in some browser/HMR states).
   */
  overlay?: boolean;
  /** Extra class for the curved content layer. */
  className?: string;
};

export function CrtScreen({
  children,
  scene = "contact",
  params,
  ease = 0.12,
  curvature = 1,
  warp = 0,
  overlay = true,
  className,
}: CrtScreenProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const feImageRef = useRef<SVGFEImageElement | null>(null);
  const feDispRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const filterRef = useRef<SVGFilterElement | null>(null);
  // useId is SSR-stable; a module counter desyncs between server and client
  // and hydration leaves the viewport's filter url() pointing at a dead id.
  const warpId = `crt-warp-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const content = contentRef.current;
    const spacer = spacerRef.current;
    if (!content || !spacer) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Mirror the content's height onto an in-flow spacer so the native
    // scrollbar range matches, while the content itself is fixed + translated.
    const syncHeight = () => {
      spacer.style.height = `${content.offsetHeight}px`;
    };
    syncHeight();
    const ro = new ResizeObserver(syncHeight);
    ro.observe(content);
    window.addEventListener("resize", syncHeight);

    // Build a barrel displacement map (R = x-offset, G = y-offset) sized to the
    // viewport, and point the SVG filter at it.
    //
    // Convex tube = each output pixel samples INWARD (toward centre): the
    // centre content stretches out over the edges, exactly like glass bulging
    // toward the viewer. Sampling outward (the naive sign) does the opposite —
    // and worse, edge pixels sample outside the source, so feDisplacementMap
    // clamp-smears the last row of pixels across the corners.
    //
    // The radial term r² reaches 2.0 in the corners, so it's encoded at half
    // amplitude to stay inside the 8-bit channel (no clipping = no flat spots
    // in the corners) and the lost factor is restored on the `scale` attr.
    const buildWarpMap = () => {
      if (warp <= 0 || !feImageRef.current || !filterRef.current || !feDispRef.current) return;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const N = 512;
      const c = document.createElement("canvas");
      c.width = N;
      c.height = N;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const img = ctx.createImageData(N, N);
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const nx = (i / (N - 1)) * 2 - 1;
          const ny = (j / (N - 1)) * 2 - 1;
          const r2 = (nx * nx + ny * ny) * 0.5; // 0 centre → 1 corner
          const dx = -nx * r2; // inward sample = convex bulge, |dx| ≤ 1
          const dy = -ny * r2;
          const o = (j * N + i) * 4;
          img.data[o] = Math.round(128 + dx * 127);
          img.data[o + 1] = Math.round(128 + dy * 127);
          img.data[o + 2] = 128;
          img.data[o + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      const url = c.toDataURL();
      const f = filterRef.current;
      f.setAttribute("x", "0");
      f.setAttribute("y", "0");
      f.setAttribute("width", `${W}`);
      f.setAttribute("height", `${H}`);
      const fe = feImageRef.current;
      fe.setAttribute("width", `${W}`);
      fe.setAttribute("height", `${H}`);
      fe.setAttribute("preserveAspectRatio", "none");
      fe.setAttribute("href", url);
      fe.setAttributeNS("http://www.w3.org/1999/xlink", "href", url);
      feDispRef.current.setAttribute("scale", `${warp * 2}`);
    };
    buildWarpMap();
    window.addEventListener("resize", buildWarpMap);

    let current = window.scrollY;
    let lastSmoothed = current;
    let lastTransform = "";
    let raf = 0;

    const loop = () => {
      const target = window.scrollY;
      current += (target - current) * (reduce ? 1 : ease);
      // Snap when close: endless sub-pixel writes keep invalidating the SVG
      // filter (a full re-rasterise per frame), which is what makes idle and
      // slow scrolling feel laggy. Settled = identical transform string =
      // no style write = no filter work.
      if (Math.abs(target - current) < 0.3) current = target;

      // velocity of the *smoothed* position -> drives the curved-tube flex
      const dy = current - lastSmoothed;
      lastSmoothed = current;
      const vel = Math.min(1, Math.abs(dy) / Math.max(1, window.innerHeight) * 16);
      const settledVel = vel < 0.004 ? 0 : vel;

      // translate the document + bow it on the tube
      const flex = settledVel * 0.018 * curvature;
      const push = settledVel * 22 * curvature;
      // SVG filter flattens 3D, so skip the translateZ push when warping.
      const next = warp > 0
        ? `translate3d(0, ${-current.toFixed(2)}px, 0) scaleY(${(1 - flex).toFixed(4)})`
        : `translate3d(0, ${-current.toFixed(2)}px, ${(-push).toFixed(2)}px) ` +
          `scaleY(${(1 - flex).toFixed(4)})`;
      if (next !== lastTransform) {
        content.style.transform = next;
        lastTransform = next;
      }

      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", syncHeight);
      window.removeEventListener("resize", buildWarpMap);
    };
  }, [ease, curvature, warp]);

  return (
    <>
      {/* SVG barrel-distortion filter (live-DOM curvature). */}
      {warp > 0 && (
        <svg
          aria-hidden="true"
          width="0"
          height="0"
          style={{ position: "absolute", width: 0, height: 0 }}
        >
          <filter
            ref={filterRef}
            id={warpId}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feImage ref={feImageRef} result="warpMap" />
            <feDisplacementMap
              ref={feDispRef}
              in="SourceGraphic"
              in2="warpMap"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
      )}

      {/* Fixed, perspective viewport that clips the curved screen. */}
      <div
        aria-hidden={false}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          overflow: "hidden",
          perspective: "1400px",
          perspectiveOrigin: "50% 42%",
          pointerEvents: "none",
          filter: warp > 0 ? `url(#${warpId})` : undefined,
        }}
      >
        <div
          ref={contentRef}
          className={className}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transformOrigin: "50% 50%",
            willChange: "transform",
            pointerEvents: "auto",
          }}
        >
          {children}
        </div>
      </div>

      {/* In-flow spacer that gives the page its real scroll height. */}
      <div ref={spacerRef} aria-hidden="true" style={{ pointerEvents: "none" }} />

      {/* CRT post. */}
      {overlay && <CrtOverlay scene={scene} params={params} scrollReactive />}
    </>
  );
}
