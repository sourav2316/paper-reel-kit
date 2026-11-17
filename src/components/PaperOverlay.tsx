import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { W, H, MONO_FONT } from "../theme";

/** Folded-poster look on top of every frame: grain, creases, vignette, rule line, punch dots. */
export const PaperOverlay: React.FC<{ dark?: boolean; caption?: string; creases?: boolean }> = ({ dark, caption, creases = true }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 12; // film-grain flicker
  const ruleColor = dark ? "rgba(240,230,210,0.35)" : "rgba(40,40,40,0.55)";
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id={`grain${seed}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer><feFuncA type="table" tableValues="0 0.5" /></feComponentTransfer>
          </filter>
          <filter id="fibers" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.08" numOctaves={3} seed={7} />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer><feFuncA type="table" tableValues="0 0.35" /></feComponentTransfer>
          </filter>
          <radialGradient id="vig" cx="50%" cy="45%" r="75%">
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#2a1a08" stopOpacity="0.45" />
          </radialGradient>
          {creases && (
            <>
              <linearGradient id="creaseV" x1="0" x2="1">
                <stop offset="0" stopColor="#000" stopOpacity="0" />
                <stop offset="0.45" stopColor="#000" stopOpacity="0.10" />
                <stop offset="0.5" stopColor="#fff" stopOpacity="0.28" />
                <stop offset="0.56" stopColor="#000" stopOpacity="0.06" />
                <stop offset="1" stopColor="#000" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="creaseH" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#000" stopOpacity="0" />
                <stop offset="0.45" stopColor="#000" stopOpacity="0.08" />
                <stop offset="0.5" stopColor="#fff" stopOpacity="0.22" />
                <stop offset="0.56" stopColor="#000" stopOpacity="0.05" />
                <stop offset="1" stopColor="#000" stopOpacity="0" />
              </linearGradient>
            </>
          )}
        </defs>
        {/* warm paper tone */}
        <rect width={W} height={H} fill="#d9b98a" opacity={0.10} style={{ mixBlendMode: "multiply" }} />
        <rect width={W} height={H} filter="url(#fibers)" opacity={0.5} style={{ mixBlendMode: "multiply" }} />
        <rect width={W} height={H} filter={`url(#grain${seed})`} opacity={0.55} style={{ mixBlendMode: "overlay" }} />
        {creases && (
          <>
            <rect x={W * 0.63 - 14} y={0} width={28} height={H} fill="url(#creaseV)" />
            <rect x={0} y={H * 0.333 - 12} width={W} height={24} fill="url(#creaseH)" />
            <rect x={0} y={H * 0.666 - 12} width={W} height={24} fill="url(#creaseH)" />
          </>
        )}
        <rect width={W} height={H} fill="url(#vig)" />
        {/* top rule + punch dots */}
        <line x1={W * 0.06} x2={W * 0.94} y1={H * 0.118} y2={H * 0.118} stroke={ruleColor} strokeWidth={2} />
        {[0.135, 0.27, 0.5, 0.73, 0.86].map((y, i) => (
          <circle key={i} cx={36} cy={H * y} r={9} fill={dark ? "#0d1112" : "#6b6255"} opacity={0.55} />
        ))}
      </svg>
      {caption ? (
        <div style={{ position: "absolute", right: W * 0.06, top: H * 0.124, fontFamily: MONO_FONT, fontSize: 20, letterSpacing: 2,
          color: dark ? "rgba(240,230,210,0.55)" : "rgba(40,40,40,0.6)", textTransform: "uppercase" }}>{caption}</div>
      ) : null}
    </AbsoluteFill>
  );
};
