/**
 * CRT scene presets, lifted verbatim from shader.se's effect config.
 *
 * Plain data module — deliberately NOT "use client". Server components (e.g.
 * app/about/page.tsx) import the presets from here; importing them from the
 * "use client" CrtOverlay module instead hands the server an opaque client
 * reference, and spreading that proxy yields `undefined` for every field,
 * which reaches the shader as NaN and renders the overlay opaque black.
 *
 * The route → scene mapping in the original shader.se bundle includes
 * `"accessibility-statement": "contact"`, which is why /about uses "contact".
 */

export type CrtSceneParams = {
  /** sepiaIntensity — warm tint amount */
  sepia: number;
  /** noiseVelocity — grain animation speed */
  noiseVelocity: number;
  /** noiseIntensity — grain amount */
  noiseIntensity: number;
  /** lensDistortion — barrel curvature */
  lensDistortion: number;
  /** lensDistortionBorders — 0/1, darken curved-off edges into a bezel */
  lensDistortionBorders: number;
  /** chromaticAbberationStrength — edge colour fringe */
  aberration: number;
  /** contrast — <1 softens */
  contrast: number;
  /** saturation — <1 desaturates */
  saturation: number;
  /** vignetteRadius — distance at which darkening starts */
  vignetteRadius: number;
  /** vignetteSmoothness — falloff width */
  vignetteSmoothness: number;
  /** vignetteIntensity — darkening amount (0 = vignette off) */
  vignetteIntensity: number;
};

export const CRT_SCENES = {
  contact: {
    sepia: 0.5,
    noiseVelocity: 3.5,
    noiseIntensity: 0.7,
    lensDistortion: 0.16,
    lensDistortionBorders: 0,
    aberration: 1.15,
    contrast: 0.92,
    saturation: 0.85,
    vignetteRadius: 0,
    vignetteSmoothness: 0,
    vignetteIntensity: 0,
  },
  "about-us": {
    sepia: 0.4,
    noiseVelocity: 0.05,
    noiseIntensity: 1,
    lensDistortion: 0.16,
    lensDistortionBorders: 0,
    aberration: 0.8,
    contrast: 1,
    saturation: 1,
    vignetteRadius: 0.79,
    vignetteSmoothness: 0.13,
    vignetteIntensity: 0,
  },
  hero: {
    sepia: 0.22,
    noiseVelocity: 1,
    noiseIntensity: 1.12,
    lensDistortion: 0,
    lensDistortionBorders: 0,
    aberration: 1.04,
    contrast: 0.97,
    saturation: 1,
    vignetteRadius: 0.5,
    vignetteSmoothness: 0.3,
    vignetteIntensity: 0.1,
  },
  projects: {
    sepia: 0.28,
    noiseVelocity: 1,
    noiseIntensity: 0.87,
    lensDistortion: 0.16,
    lensDistortionBorders: 1,
    aberration: 1,
    contrast: 0.98,
    saturation: 0.92,
    vignetteRadius: 0,
    vignetteSmoothness: 0.32,
    vignetteIntensity: 0,
  },
  office: {
    sepia: 0.81,
    noiseVelocity: 1,
    noiseIntensity: 1.48,
    lensDistortion: 0.16,
    lensDistortionBorders: 1,
    aberration: 2.5,
    contrast: 1,
    saturation: 0.56,
    vignetteRadius: 0.5,
    vignetteSmoothness: 0.83,
    vignetteIntensity: 0.45,
  },
} satisfies Record<string, CrtSceneParams>;

export type CrtScene = keyof typeof CRT_SCENES;
