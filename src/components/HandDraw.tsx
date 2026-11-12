import React from "react";
import { Img, staticFile } from "remotion";
import { getLength, getPointAtLength, getSubpaths } from "@remotion/paths";
import { C } from "../theme";
import { clamp01 } from "../engine/anim";

/** Kit-wide marker hand (real photo cutout). TIP = pen tip position as a fraction of the image. */
const HAND_SRC = "hands/marker_hand.png";
const HAND_TIP = { x: 0.004, y: 0.982 };
const HAND_W = 360; // px in the element's own coordinates

/** Timing used everywhere: hand enters (0.25s) → draws (dur) → leaves (0.3s). */
export const HAND_LEAD = 0.2;
export const HAND_EXIT = 0.2;
/** Total time one hand is on screen for a mark of duration `dur` — keep marks at least this far apart. */
export const handWindow = (dur: number) => HAND_LEAD + dur + HAND_EXIT;
/** Time the hand takes to travel from one mark to the next when marks are chained. */
export const HAND_TRAVEL = 0.3;

/**
 * Chaining between consecutive marks (computed by the engine per scene):
 * from      = where the hand comes from, in px relative to this mark's start point (the previous mark's end)
 * holdUntil = seconds after this mark starts when the hand hands over to the next mark (no exit animation)
 */
export type HandLink = { from?: [number, number]; holdUntil?: number };

/**
 * Draws an SVG path progressively and (optionally) moves a real hand holding a marker so the pen tip
 * sits exactly on the end of the stroke. Fills its positioned parent box.
 * t = seconds since the mark was triggered (negative = not yet).
 */
export const HandDraw: React.FC<{
  d: string; vbW: number; vbH: number; t: number; dur?: number; color?: string; width?: number;
  hand?: boolean; stretch?: boolean; style?: React.CSSProperties; handScale?: number; link?: HandLink;
}> = ({ d, vbW, vbH, t, dur = 0.5, color = C.red, width = 6, hand = true, stretch = false, style, handScale = 1, link }) => {
  if (t < 0) return null;
  const lead = !hand ? 0 : link?.from ? HAND_TRAVEL : HAND_LEAD;
  const progress = clamp01((t - lead) / dur);
  const subs = getSubpaths(d);
  const lens = subs.map((s) => getLength(s));
  const total = lens.reduce((a, b) => a + b, 0);
  let remaining = progress * total;
  const polylines: string[] = [];
  let tip = getPointAtLength(subs[0], 0) ?? { x: 0, y: 0 };
  subs.forEach((s, i) => {
    if (remaining <= 0) return;
    const L = Math.min(lens[i], remaining);
    const n = Math.max(2, Math.ceil((L / Math.max(1, lens[i])) * 70));
    const pts: string[] = [];
    for (let k = 0; k <= n; k++) { const p = getPointAtLength(s, (L * k) / n); if (!p) continue; pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`); tip = p; }
    polylines.push(pts.join(" "));
    remaining -= lens[i];
  });

  // hand motion: slide in from bottom-right, follow the tip, slide out
  let handOff = { x: 0, y: 0 }, handO = 1;
  const enter = lead > 0 ? clamp01(t / lead) : 1;
  const holding = link?.holdUntil !== undefined;
  const exit = holding ? 0 : clamp01((t - lead - dur) / HAND_EXIT);
  if (hand) {
    if (link?.from) {
      // travel from the previous mark's end point (ease in-out), fully visible
      const e = enter < 0.5 ? 4 * enter ** 3 : 1 - Math.pow(-2 * enter + 2, 3) / 2;
      handOff = { x: link.from[0] * (1 - e), y: link.from[1] * (1 - e) - Math.sin(e * Math.PI) * 30 };
      handO = 1;
    } else {
      const e = 1 - Math.pow(1 - enter, 3);
      handOff = { x: (1 - e) * 260, y: (1 - e) * 340 };
      handO = clamp01(enter * 3);
    }
    if (!holding) { handOff = { x: handOff.x + exit * exit * 320, y: handOff.y + exit * exit * 420 }; handO = Math.min(handO, 1 - exit); }
    if (holding && t >= (link!.holdUntil as number)) handO = 0; // next mark takes the hand over
  }
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", ...style }}>
      <svg viewBox={`0 0 ${vbW} ${vbH}`} preserveAspectRatio={stretch ? "none" : "xMidYMid meet"} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
        {polylines.map((pl, i) => (
          <polyline key={i} points={pl} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {hand && handO > 0 ? (
        <Img src={staticFile(HAND_SRC)} style={{
          position: "absolute", left: `${(tip.x / vbW) * 100}%`, top: `${(tip.y / vbH) * 100}%`, width: HAND_W * handScale, maxWidth: "none",
          transform: `translate(${-HAND_TIP.x * 100}%, ${-HAND_TIP.y * 100}%) translate(${handOff.x}px, ${handOff.y}px)`,
          opacity: handO, filter: "drop-shadow(10px 18px 14px rgba(0,0,0,0.35))", zIndex: 50,
        }} />
      ) : null}
    </div>
  );
};

/** Hand-drawn ellipse around the parent element (parent must be position: relative). */
export const MarkerRing: React.FC<{ t: number; color?: string; padX?: string; padY?: string; hand?: boolean; handScale?: number; dur?: number; link?: HandLink }> = ({ t, color = C.red, padX = "-14%", padY = "-20%", hand = true, handScale = 1, dur = 0.42, link }) => (
  <HandDraw t={t} dur={dur} color={color} width={6} hand={hand} stretch handScale={handScale} link={link}
    d="M118 8 C 186 10, 198 84, 104 93 C 18 99, 0 20, 88 9 C 112 6, 132 9, 146 15"
    vbW={200} vbH={100} style={{ left: padX, right: padX, top: padY, bottom: padY, inset: undefined }} />
);
