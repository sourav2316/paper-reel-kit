import React from "react";
import { spring, useVideoConfig } from "remotion";
import { C, DISPLAY_FONT, W, H } from "../theme";
import { clamp01 } from "./anim";
import type { Headline as HL } from "./types";

const colorOf = (c: HL["bigColor"], dark: boolean) =>
  c === "blue" ? C.blue : c === "mustard" ? C.mustard : c === "cream" ? C.cream : c === "ink" ? (dark ? C.cream : C.ink) : dark ? "#E2553F" : C.red;

// Anton is ~0.47em per uppercase glyph (spaces narrower). Keeps every line on ONE line.
const fit = (text: string, max: number, maxWidth: number) => {
  const units = [...text].reduce((a, ch) => a + (ch === " " ? 0.22 : ch === "." || ch === "," || ch === "'" ? 0.2 : 0.5), 0);
  return Math.min(max, maxWidth / Math.max(1, units));
};

/** Top-left two-line headline: small line fades in, big red line slams in. */
export const HeadlineView: React.FC<{ h: HL; until: number; t: number; dark: boolean }> = ({ h, until, t, dark }) => {
  const { fps } = useVideoConfig();
  if (t < h.at || t > until + 0.2) return null;
  const out = clamp01((t - until) / 0.18);
  const smallP = clamp01((t - h.at) / 0.25);
  const bigAt = h.bigAt ?? h.at + (h.small ? 0.35 : 0);
  const bigS = spring({ frame: Math.round((t - bigAt) * fps), fps, config: { damping: 13, stiffness: 180, mass: 0.6 } });
  const showBig = h.big && t >= bigAt;
  const smallSize = fit(h.small ?? "", 68, W * 0.86);
  const bigSize = fit(h.big ?? "", 160, W * 0.88);
  return (
    <div style={{ position: "absolute", left: W * 0.06, top: H * (h.y ?? 0.128), width: W * 0.9, opacity: 1 - out, lineHeight: 0.95 }}>
      {h.small ? (
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: smallSize, color: dark ? C.cream : C.ink, letterSpacing: 0.5, whiteSpace: "nowrap",
          opacity: smallP, transform: `translateY(${(1 - smallP) * 18}px)`, textShadow: dark ? "none" : "0 2px 0 rgba(255,255,255,0.25)" }}>
          {h.small}
        </div>
      ) : null}
      {showBig ? (
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: bigSize, color: colorOf(h.bigColor, dark), letterSpacing: -0.5, marginTop: 4, whiteSpace: "nowrap",
          transformOrigin: "left center", transform: `scale(${1.35 - 0.35 * bigS})`, opacity: clamp01(bigS * 2.5),
          filter: `blur(${Math.max(0, (1 - bigS) * 8)}px)`, textShadow: "3px 5px 0 rgba(0,0,0,0.18)" }}>
          {h.big}
        </div>
      ) : null}
    </div>
  );
};
