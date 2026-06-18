"use client";

import { useEffect, useRef } from "react";

/**
 * Reusable WebGL CRT "vintage monitor" overlay.
 *
 * shader.se renders its CRT look as a pmndrs/postprocessing stack on top of a
 * live WebGL scene (those effects live in the precompiled static chunks and
 * can't be reused here). This is a faithful reimplementation of that same look
 * as a transparent, `multiply`-blended overlay, so it can sit on top of plain
 * DOM pages while keeping the text selectable.
 *
 * Drop it onto any page:
 *   <CrtOverlay scene="contact" />              // accessibility-statement look
 *   <CrtOverlay scene="about-us" />             // about scene look
 *   <CrtOverlay params={{ ...custom }} />       // fully custom
 *
 * The per-scene numbers below are lifted verbatim from shader.se's effect
 * config so each named scene matches the original page that uses it. The route
 * → scene mapping in the original bundle includes
 * `"accessibility-statement": "contact"`, which is why /about uses "contact".
 *
 * Honest limitation: because this is a multiply overlay (not a postprocessing
 * pass over a rendered scene), additive effects — bloom and any brightness
 * lift — can't be reproduced; multiply can only darken/tint. The visible
 * elements (grain, sepia, chromatic aberration, gentle curvature, vignette)
 * are faithful.
 */

import { CRT_SCENES, type CrtScene, type CrtSceneParams } from "./crtScenes";

export { CRT_SCENES, type CrtScene, type CrtSceneParams };

type CrtOverlayProps = {
  /** Named preset to use. Defaults to "contact". Ignored if `params` is set. */
  scene?: CrtScene;
  /** Fully custom params, overriding `scene`. */
  params?: CrtSceneParams;
  /** Stacking order of the overlay canvas. */
  zIndex?: number;
  /** Overall overlay strength. */
  opacity?: number;
  /** Canvas blend mode. "multiply" reads most like a real CRT mask. */
  blendMode?: React.CSSProperties["mixBlendMode"];
  /**
   * Drive a scroll-reactive refresh-bar / sync-wobble so the page feels like
   * an old monitor as it scrolls. Listens to window scroll. Default false.
   */
  scrollReactive?: boolean;
};

const VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Outputs an opaque RGB "shadow mask" colour. The <canvas> is composited with
// mix-blend-mode: multiply, so white = untouched page, darker/tinted = CRT mask.
const FRAG = `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2  uResolution;

uniform float uSepia;
uniform float uNoiseVel;
uniform float uNoiseInt;
uniform float uLensDist;
uniform float uBorders;
uniform float uAberration;
uniform float uContrast;
uniform float uSaturation;
uniform float uVignRadius;
uniform float uVignSmooth;
uniform float uVignIntensity;

uniform float uScroll;     // accumulated scroll, in screen-heights (fractional)
uniform float uScrollVel;  // |scroll velocity|, ~0..1, decays to 0 when idle

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Barrel distortion of the sampling coordinate (CRT screen curvature).
vec2 barrel(vec2 uv, float amount) {
  vec2 cc = uv - 0.5;
  float dist = dot(cc, cc);
  return uv + cc * dist * amount;
}

void main() {
  vec2 uv = vUv;

  // --- screen curvature -------------------------------------------------
  vec2 cuv = barrel(uv, uLensDist);

  vec3 mask = vec3(1.0);

  // --- chromatic aberration (edge colour fringe) ------------------------
  // Scrolling spikes the fringe, like a CRT struggling to keep sync.
  vec2 dir = cuv - 0.5;
  float edge = dot(dir, dir);
  float ab = uAberration * edge * 0.22 * (1.0 + uScrollVel * 3.0);
  mask.r *= 1.0 - ab;
  mask.b *= 1.0 - ab * 0.8;

  // --- horizontal sync wobble while scrolling ---------------------------
  // A faint left/right shimmer across rows, only present mid-scroll.
  float wobble = sin(cuv.y * 80.0 + uTime * 30.0) * 0.5 + 0.5;
  mask *= 1.0 - wobble * 0.05 * uScrollVel;

  // --- sweeping refresh bar (scroll-driven) -----------------------------
  // A soft dark band that rolls down the tube as the page scrolls. Strength
  // is purely velocity-driven: fully invisible at rest (a constant floor
  // here reads as stray translucent black stripes across the page).
  float barPos = fract(cuv.y * 1.5 - uScroll * 2.0);
  float bar = smoothstep(0.0, 0.04, barPos) * smoothstep(0.16, 0.04, barPos);
  mask *= 1.0 - bar * 0.17 * uScrollVel;

  // --- animated film grain ----------------------------------------------
  // Sampled below native resolution and kept low-amplitude so it reads as
  // grain, not TV snow; velocity drives how fast it churns. The grain phase
  // tracks scroll so it crawls with the content rather than sitting still.
  float gphase = floor(uTime * uNoiseVel * 12.0) + floor(uScroll * 240.0);
  float g = hash(floor(cuv * uResolution.xy * 0.5) + gphase);
  mask *= 1.0 - (g - 0.5) * 0.05 * uNoiseInt;

  // --- contrast / saturation approximation (multiply-safe) --------------
  mask = mix(mask, mask * 0.97 + 0.02, 1.0 - uContrast);
  float luma = dot(mask, vec3(0.299, 0.587, 0.114));
  mask = mix(vec3(luma), mask, uSaturation);

  // --- vignette ---------------------------------------------------------
  float d = distance(cuv, vec2(0.5));
  float vd = smoothstep(uVignRadius, uVignRadius + uVignSmooth + 0.0001, d);
  mask *= 1.0 - vd * uVignIntensity;

  // --- sepia / warm tint ------------------------------------------------
  vec3 warm = vec3(1.0, 0.95, 0.86);
  mask *= mix(vec3(1.0), warm, uSepia * 0.55);

  // --- composite as a transparent darkening layer (normal blend) --------
  // The mask above is ~white; convert "how far below white" into an alpha so
  // the layer is fully transparent where neutral. This makes the overlay
  // physically incapable of washing the page dark, and a non-rendering canvas
  // (cleared transparent) is a harmless no-op rather than an opaque black.
  vec3 tint = clamp(mask, 0.0, 1.0);
  float darken = clamp(1.0 - dot(tint, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);

  // --- curved-tube bezel (when lensDistortionBorders is on) -------------
  // The barrel pushes corner samples outside 0..1; covering that region
  // gives the naturally rounded CRT-glass corners. Feathered with a
  // smoothstep band (plus a soft inner shadow) instead of a hard cut so the
  // corner edge is anti-aliased, not stair-stepped.
  if (uBorders > 0.5) {
    vec2 outside = max(max(-cuv, cuv - 1.0), 0.0);
    float od = length(outside);
    float cover = smoothstep(0.0, 0.004, od);
    darken = max(darken, cover);
  }

  gl_FragColor = vec4(0.0, 0.0, 0.0, darken);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("CRT shader compile error:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function CrtOverlay({
  scene = "contact",
  params,
  zIndex = 21,
  opacity = 0.9,
  blendMode = "normal",
  scrollReactive = false,
}: CrtOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cfg = params ?? CRT_SCENES[scene];
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false }) ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("CRT program link error:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const uTime = u("uTime");
    const uResolution = u("uResolution");
    const uSepia = u("uSepia");
    const uNoiseVel = u("uNoiseVel");
    const uNoiseInt = u("uNoiseInt");
    const uLensDist = u("uLensDist");
    const uBorders = u("uBorders");
    const uAberration = u("uAberration");
    const uContrast = u("uContrast");
    const uSaturation = u("uSaturation");
    const uVignRadius = u("uVignRadius");
    const uVignSmooth = u("uVignSmooth");
    const uVignIntensity = u("uVignIntensity");
    const uScroll = u("uScroll");
    const uScrollVel = u("uScrollVel");

    // A single NaN uniform turns the whole mask NaN, and clamp(NaN) is 0 on
    // many GPUs — i.e. an opaque black screen. Refuse non-finite params.
    const fin = (v: number, fallback: number) => (Number.isFinite(v) ? v : fallback);
    const applyParams = () => {
      const p = cfgRef.current;
      gl.uniform1f(uSepia, fin(p.sepia, 0));
      gl.uniform1f(uNoiseVel, fin(p.noiseVelocity, 0));
      gl.uniform1f(uNoiseInt, fin(p.noiseIntensity, 0));
      gl.uniform1f(uLensDist, fin(p.lensDistortion, 0));
      gl.uniform1f(uBorders, fin(p.lensDistortionBorders, 0));
      gl.uniform1f(uAberration, fin(p.aberration, 0));
      gl.uniform1f(uContrast, fin(p.contrast, 1));
      gl.uniform1f(uSaturation, fin(p.saturation, 1));
      gl.uniform1f(uVignRadius, fin(p.vignetteRadius, 0));
      gl.uniform1f(uVignSmooth, fin(p.vignetteSmoothness, 0));
      gl.uniform1f(uVignIntensity, fin(p.vignetteIntensity, 0));
    };
    applyParams();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // --- scroll tracking (optional) -------------------------------------
    let lastScrollY = window.scrollY;
    let scrollVel = 0; // decaying magnitude, fed to the shader
    const onScroll = () => {
      const y = window.scrollY;
      const dy = Math.abs(y - lastScrollY);
      lastScrollY = y;
      // Normalise by viewport so the feel is resolution-independent, clamp.
      scrollVel = Math.min(1, scrollVel + dy / Math.max(1, window.innerHeight));
    };
    if (scrollReactive) {
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    let raf = 0;
    const start = performance.now();
    const render = (now: number) => {
      applyParams(); // cheap; lets scene/params change live
      gl.uniform1f(uTime, (now - start) / 1000);
      if (scrollReactive) {
        scrollVel *= 0.9; // ease back to rest
        gl.uniform1f(uScroll, window.scrollY / Math.max(1, window.innerHeight));
        gl.uniform1f(uScrollVel, scrollVel);
      } else {
        gl.uniform1f(uScroll, 0);
        gl.uniform1f(uScrollVel, 0);
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = window.requestAnimationFrame(render);
    };
    raf = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (scrollReactive) window.removeEventListener("scroll", onScroll);
      // NB: do NOT call loseContext() here. Under React StrictMode (dev) the
      // effect mounts, cleans up, then remounts on the same canvas; losing the
      // context in cleanup leaves the remount with a dead context, so the
      // overlay paints black and the multiply blend darkens the whole page.
    };
  }, [scrollReactive]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex,
        pointerEvents: "none",
        mixBlendMode: blendMode,
        opacity,
      }}
    />
  );
}
