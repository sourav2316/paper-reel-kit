import React, { useId } from "react";
import { Img, interpolate, Easing, staticFile } from "remotion";

type Point = [number, number];
type Pose = [seconds: number, degrees: number];

export type CutoutPart = {
  outline: string;
  pivot?: Point;
  poses?: Pose[];
  shifts?: [seconds: number, x: number, y: number][];
  folds?: [seconds: number, scaleX: number][];
  children?: CutoutPart[];
  trail?: { tip: Point; drift: Point; tone: string };
  light?: { tip: Point; angle: number; reach: number; spread: number; lens?: boolean };
};

const sample = (keys: number[][] = [], time: number, value: number, fallback: number) => {
  if (keys.length < 2) return keys[0]?.[value] ?? fallback;
  return interpolate(time, keys.map(([at]) => at), keys.map((key) => key[value]), {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
};

const Piece: React.FC<{ part: CutoutPart; src: string; time: number; gradient: string }> = ({ part, src, time, gradient }) => {
  const id = useId();
  const [x, y] = part.pivot ?? [0, 0];
  const degrees = sample(part.poses, time, 1, 0);
  const tx = sample(part.shifts, time, 1, 0);
  const ty = sample(part.shifts, time, 2, 0);
  const fold = sample(part.folds, time, 1, 1);
  const light = part.light;
  return (
    <g transform={`translate(${tx} ${ty}) rotate(${degrees} ${x} ${y}) translate(${x} 0) scale(${fold} 1) translate(${-x} 0)`}>
      <defs><clipPath id={id}><path d={part.outline} /></clipPath></defs>
      {light && (
        <g transform={`translate(${light.tip.join(" ")}) rotate(${light.angle})`}>
          <path d={`M 0 -1 L ${light.reach} ${-light.spread * 1.4} L ${light.reach} ${light.spread * 1.4} L 0 1 Z`} fill={`url(#${gradient})`} opacity="0.24" />
          <path d={`M 0 -0.7 L ${light.reach} ${-light.spread} L ${light.reach} ${light.spread} L 0 0.7 Z`} fill={`url(#${gradient})`} opacity="0.68" />
          <ellipse rx="1.4" ry="1" fill="#fff1bc" opacity="0.78" />
        </g>
      )}
      <image href={src} width="100" height="100" preserveAspectRatio="none" clipPath={`url(#${id})`} />
      {light?.lens && <g transform={`translate(${light.tip.join(" ")}) rotate(${light.angle})`}>
        <ellipse rx="1.6" ry="2.35" fill="#ffc974" opacity="0.55" />
        <ellipse rx=".75" ry="1.42" fill="#fff0bd" />
      </g>}
      {part.trail && Array.from({length: 6}, (_, i) => {
        const trail = part.trail!;
        const phase = (time * .95 + i / 6) % 1;
        const x = trail.tip[0] + trail.drift[0] * phase + Math.sin(i + time * 3) * phase * 3;
        const y = trail.tip[1] + trail.drift[1] * phase;
        return <g key={i} transform={`translate(${x} ${y})`} opacity={Math.sin(Math.PI * phase)}>
          <ellipse rx="2.5" ry="3.1" fill={trail.tone} opacity=".21" />
          <ellipse rx="1.35" ry="1.65" fill={trail.tone} />
        </g>;
      })}
      {part.children?.map((child, i) => <Piece key={i} part={child} src={src} time={time} gradient={gradient} />)}
    </g>
  );
};

export const ArticulatedCutout: React.FC<{ src: string; ratio: number; parts: CutoutPart[]; time: number }> = ({ src, ratio, parts, time }) => {
  const gradient = useId();
  const url = staticFile(src);
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: ratio }}>
      <Img src={url} style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" style={{ display:"block", overflow:"visible" }} aria-hidden="true">
        <defs>
          <linearGradient id={gradient}>
            <stop stopColor="#ffe0a0" stopOpacity="0.68" />
            <stop offset="0.55" stopColor="#ffd177" stopOpacity="0.28" />
            <stop offset="1" stopColor="#ffd177" stopOpacity="0" />
          </linearGradient>
        </defs>
        {parts.map((part, i) => <Piece key={i} part={part} src={url} time={time} gradient={gradient} />)}
      </svg>
    </div>
  );
};
