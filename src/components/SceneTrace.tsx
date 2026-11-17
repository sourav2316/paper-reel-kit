import React from "react";
import { getLength, getPointAtLength } from "@remotion/paths";
import { clamp01 } from "../engine/anim";

export const SceneTrace: React.FC<{
  path: string;
  time: number;
  seconds: number;
  tone?: string;
  kind?: "line" | "air";
  weight?: number;
}> = ({ path, time, seconds, tone = "#ffe2a5", kind = "line", weight = 2 }) => {
  const length = getLength(path);
  const progress = clamp01(time / seconds);
  const markers = kind === "air" ? [0, 0.17, 0.34, 0.51, 0.68, 0.85] : [0];
  const cycle = time / seconds;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" style={{ pointerEvents: "none" }} aria-hidden="true">
      <path d={path} fill="none" stroke="#12212c" strokeOpacity="0.5" strokeWidth={weight * 2.25} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - progress} />
      <path d={path} fill="none" stroke={tone} strokeOpacity={kind === "air" ? 0.32 : 0.9} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - progress} />
      {markers.map((delay, i) => {
        const age = cycle - delay;
        if (age < 0) return null;
        const step = kind === "air" ? age % 1 : progress;
        const point = getPointAtLength(path, step * length);
        if (!point) return null;
        return <g key={i} transform={`translate(${point.x} ${point.y})`} opacity={kind === "air" ? Math.sin(Math.PI * step) * 0.8 : 1}>
          <ellipse rx="1.55" ry="0.87" fill={tone} opacity="0.21" />
          <ellipse rx=".6" ry=".34" fill={tone} />
        </g>;
      })}
    </svg>
  );
};
