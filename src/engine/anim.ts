import { interpolate, spring, Easing } from "remotion";

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Spring 0→1 starting at `startFrame` (overshoot look used everywhere). */
export const pop = (frame: number, fps: number, startFrame: number, damping = 11, durationInFrames?: number) =>
  spring({ frame: frame - startFrame, fps, config: { damping, stiffness: 140, mass: 0.7 }, durationInFrames });

export const ease = (frame: number, from: number, to: number, outFrom = 0, outTo = 1, e = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, [from, to], [outFrom, outTo], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

/** Deterministic pseudo random 0..1 from a seed. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export type EnterKind =
  | "pop" | "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right"
  | "drop" | "zoom-in" | "grow-up" | "none";

/** Returns transform/opacity for an entrance animation. p = spring progress (0..1, may overshoot). */
export const enterStyle = (kind: EnterKind, p: number, lin: number) => {
  switch (kind) {
    case "none": return { tx: 0, ty: 0, s: 1, o: 1, sy: 1 };
    case "fade": return { tx: 0, ty: 0, s: 1, o: lin, sy: 1 };
    case "pop": return { tx: 0, ty: 0, s: p, o: clamp01(lin * 3), sy: 1 };
    case "zoom-in": return { tx: 0, ty: 0, s: 0.6 + 0.4 * p, o: lin, sy: 1 };
    case "slide-up": return { tx: 0, ty: (1 - p) * 900, s: 1, o: 1, sy: 1 };
    case "slide-down": return { tx: 0, ty: -(1 - p) * 900, s: 1, o: 1, sy: 1 };
    case "slide-left": return { tx: (1 - p) * 1100, ty: 0, s: 1, o: 1, sy: 1 };
    case "slide-right": return { tx: -(1 - p) * 1100, ty: 0, s: 1, o: 1, sy: 1 };
    case "drop": return { tx: 0, ty: -(1 - p) * 500, s: 1, o: clamp01(lin * 4), sy: p > 0.95 ? 1 - Math.sin(Math.min(1, (p - 0.95) * 20) * Math.PI) * 0.06 : 1 };
    case "grow-up": return { tx: 0, ty: 0, s: 1, o: 1, sy: Math.max(0, p) };
    default: return { tx: 0, ty: 0, s: 1, o: 1, sy: 1 };
  }
};

export type Ambient = "bob" | "sway" | "breathe" | "jiggle" | "vibrate" | "spin" | "drift" | "flicker" | "none";

/** Continuous idle motion so nothing is ever static. t = seconds, seed separates elements. */
export const ambientStyle = (kind: Ambient | undefined, t: number, seed = 1, amount = 1) => {
  const ph = seed * 1.7;
  switch (kind) {
    case "bob": return { tx: 0, ty: Math.sin(t * 2.2 + ph) * 8 * amount, r: 0, s: 1, o: 1 };
    case "sway": return { tx: 0, ty: 0, r: Math.sin(t * 1.6 + ph) * 3 * amount, s: 1, o: 1 };
    case "breathe": return { tx: 0, ty: 0, r: 0, s: 1 + Math.sin(t * 1.8 + ph) * 0.025 * amount, o: 1 };
    case "jiggle": return { tx: Math.sin(t * 5 + ph) * 4 * amount, ty: Math.cos(t * 4.3 + ph) * 4 * amount, r: Math.sin(t * 3 + ph) * 4 * amount, s: 1, o: 1 };
    case "vibrate": return { tx: Math.sin(t * 70 + ph) * 3 * amount, ty: 0, r: Math.sin(t * 55 + ph) * 3 * amount, s: 1, o: 1 };
    case "spin": return { tx: 0, ty: 0, r: t * 120 * amount, s: 1, o: 1 };
    case "drift": return { tx: t * 14 * amount, ty: 0, r: 0, s: 1, o: 1 };
    case "flicker": return { tx: 0, ty: 0, r: 0, s: 1, o: 0.75 + 0.25 * Math.abs(Math.sin(t * 9 + ph)) };
    default: return { tx: 0, ty: 0, r: 0, s: 1, o: 1 };
  }
};
