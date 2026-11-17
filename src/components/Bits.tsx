import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, W, H, DISPLAY_FONT } from "../theme";
import { rand } from "../engine/anim";

/** Paper-cutout cloud: cream fill, thick white outline, soft drop shadow. Width ~ 420 units. */
export const CloudShape: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const paths = [
    "M60 170 C10 170 10 110 60 105 C55 55 120 35 160 70 C185 10 290 10 305 75 C350 50 410 80 395 130 C440 140 430 175 395 175 Z",
    "M50 165 C5 160 15 105 70 110 C80 60 150 55 175 90 C205 40 280 50 285 100 C330 95 360 130 340 168 Z",
    "M40 160 C0 150 20 100 70 108 C85 40 200 30 215 90 C250 70 300 95 290 140 C330 140 335 165 300 168 Z",
  ];
  const d = paths[variant % paths.length];
  return (
    <svg viewBox="0 0 440 200" width="100%" style={{ overflow: "visible", display: "block" }}>
      <path d={d} fill="#000" opacity={0.18} transform="translate(8,12)" style={{ filter: "blur(6px)" }} />
      <path d={d} fill="#FBF6EC" stroke="#FBF6EC" strokeWidth={22} strokeLinejoin="round" />
      <path d={d} fill={C.cloud} stroke="#d9cdb4" strokeWidth={2} />
      <path d={d} fill="url(#cloudShade)" opacity={0.5} />
      <defs>
        <linearGradient id="cloudShade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#b9a98a" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/** Several drifting clouds for sky sets. */
export const SkyClouds: React.FC<{ count?: number; top?: number; spread?: number }> = ({ count = 3, top = 120, spread = 380 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const w = 300 + rand(i + 3) * 220;
        const baseX = (rand(i + 11) * 1.1 - 0.1) * W;
        const speed = 6 + rand(i + 5) * 10;
        const x = ((baseX + t * speed + W + 400) % (W + 800)) - 400;
        const y = top + rand(i + 7) * spread;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: w }}>
            <CloudShape variant={i} />
          </div>
        );
      })}
    </>
  );
};

/** A small flock that flies across. */
export const Birds: React.FC<{ count?: number; local: number; y?: number }> = ({ count = 4, local, y = 500 }) => {
  const t = local;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = -80 + t * (150 + i * 25) + rand(i) * 200;
        const yy = y + rand(i + 4) * 160 - t * 12 + Math.sin(t * 2 + i) * 10;
        const flap = Math.sin(t * 14 + i * 2) * 10;
        return (
          <path key={i} d={`M${x - 18} ${yy - flap} Q${x - 8} ${yy - 6} ${x} ${yy} Q${x + 8} ${yy - 6} ${x + 18} ${yy - flap}`}
            stroke="#2b2b2b" strokeWidth={4} fill="none" strokeLinecap="round" />
        );
      })}
    </svg>
  );
};

/** Wavy rising steam (place over a cup). Renders in a 120x220 box. */
export const Steam: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <svg viewBox="0 0 120 220" width="100%" style={{ overflow: "visible" }}>
      {[0, 1, 2].map((i) => {
        const off = (t * 40 + i * 60) % 180;
        const o = Math.sin((off / 180) * Math.PI) * 0.8;
        const x = 30 + i * 30;
        const w = Math.sin(t * 3 + i) * 10;
        return (
          <path key={i} d={`M${x} ${210 - off} c ${w} -20 ${-w} -40 0 -60 c ${w} -20 ${-w} -30 0 -45`}
            stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={o} />
        );
      })}
    </svg>
  );
};

export const Rain: React.FC = () => {
  const { fps } = useVideoConfig();
  const elapsed = useCurrentFrame() / fps;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 90 }).map((_, i) => {
        const x = rand(i) * W;
        const speed = 1200 + rand(i + 9) * 750;
        const y = ((rand(i + 3) * H + elapsed * speed) % (H + 100)) - 100;
        return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 40} stroke="#dfe6ea" strokeWidth={2} opacity={0.45} />;
      })}
    </svg>
  );
};

/** Comic "PEEP!" starburst. Box 320x200. */
export const Starburst: React.FC<{ text: string }> = ({ text }) => {
  const n = 14;
  const pts = Array.from({ length: n * 2 }).map((_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 1 : 0.72 + rand(i) * 0.08;
    return `${160 + Math.cos(a) * 150 * r},${100 + Math.sin(a) * 92 * r}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 320 200" width="100%" style={{ overflow: "visible" }}>
      <polygon points={pts} fill="#000" opacity={0.2} transform="translate(6,8)" />
      <polygon points={pts} fill="#F1C94A" stroke="#7a5a10" strokeWidth={3} />
      <text x={160} y={118} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={52} fill={C.red} transform="rotate(-8 160 100)">{text}</text>
    </svg>
  );
};
