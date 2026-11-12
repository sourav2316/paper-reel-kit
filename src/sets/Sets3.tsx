import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, W, H, DISPLAY_FONT } from "../theme";
import { rand, clamp01 } from "../engine/anim";

type Opts = Record<string, any>;
const box = { position: "absolute" as const, inset: 0 };

// ---------- colour helpers ----------
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join("");
};

export type SkyMode = "night" | "dawn" | "day" | "dusk";
const SKY: Record<SkyMode, { top: string; bot: string; sun: number; moon: number; stars: number; lights: number; city: string }> = {
  night: { top: "#0B1530", bot: "#24356A", sun: 0, moon: 1, stars: 1, lights: 1, city: "#141a30" },
  dawn: { top: "#6C7FB8", bot: "#F2B27A", sun: 0.6, moon: 0.2, stars: 0.1, lights: 0.4, city: "#3b3550" },
  day: { top: "#73AEDF", bot: "#CFE8F4", sun: 1, moon: 0, stars: 0, lights: 0, city: "#6f8293" },
  dusk: { top: "#3D2A6B", bot: "#E77E86", sun: 0.5, moon: 0.3, stars: 0.3, lights: 0.7, city: "#2a2240" },
};

/** Resolve the sky at time t from a list of changes (each fades over `fade` seconds). */
export const skyAt = (base: SkyMode, changes: { at: number; sky: SkyMode }[] | undefined, t: number, fade = 0.8) => {
  let cur = { ...SKY[base] };
  for (const ch of changes ?? []) {
    const k = clamp01((t - ch.at) / fade);
    if (k <= 0) continue;
    const to = SKY[ch.sky];
    cur = { top: mix(cur.top, to.top, k), bot: mix(cur.bot, to.bot, k), city: mix(cur.city, to.city, k),
      sun: cur.sun + (to.sun - cur.sun) * k, moon: cur.moon + (to.moon - cur.moon) * k, stars: cur.stars + (to.stars - cur.stars) * k, lights: cur.lights + (to.lights - cur.lights) * k };
  }
  return cur;
};

/** Sky + city skyline drawn into a rectangle (used inside windows). Sun/moon arc across as time passes. */
export const SkyView: React.FC<{ x: number; y: number; w: number; h: number; t: number; sky: ReturnType<typeof skyAt>; id: string }> = ({ x, y, w, h, t, sky, id }) => (
  <g>
    <defs>
      <linearGradient id={`sky${id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={sky.top} /><stop offset="1" stopColor={sky.bot} /></linearGradient>
      <clipPath id={`clip${id}`}><rect x={x} y={y} width={w} height={h} /></clipPath>
    </defs>
    <g clipPath={`url(#clip${id})`}>
      <rect x={x} y={y} width={w} height={h} fill={`url(#sky${id})`} />
      {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={x + rand(i) * w} cy={y + rand(i + 40) * h * 0.6} r={1.5 + rand(i + 3) * 2} fill="#fff" opacity={sky.stars * (0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)))} />)}
      <circle cx={x + w * 0.72} cy={y + h * 0.25} r={Math.min(w, h) * 0.09} fill="#F4ECCB" opacity={sky.moon} />
      <circle cx={x + w * 0.72 + Math.min(w, h) * 0.04} cy={y + h * 0.23} r={Math.min(w, h) * 0.08} fill={sky.top} opacity={sky.moon * 0.9} />
      <circle cx={x + w * 0.3} cy={y + h * (0.55 - 0.3 * sky.sun)} r={Math.min(w, h) * 0.11} fill="#FFE08A" opacity={sky.sun} />
      <circle cx={x + w * 0.3} cy={y + h * (0.55 - 0.3 * sky.sun)} r={Math.min(w, h) * 0.2} fill="#FFE08A" opacity={sky.sun * 0.25} />
      {Array.from({ length: 9 }).map((_, i) => {
        const bw = w / 7, bh = h * (0.25 + rand(i + 7) * 0.3), bx = x + i * bw * 0.85 - bw * 0.3;
        return (
          <g key={i}>
            <rect x={bx} y={y + h - bh} width={bw} height={bh} fill={sky.city} />
            {Array.from({ length: 8 }).map((__, k) => (
              <rect key={k} x={bx + 8 + (k % 3) * (bw / 3.4)} y={y + h - bh + 12 + Math.floor(k / 3) * 26} width={bw / 6} height={12}
                fill="#FFD67A" opacity={sky.lights * (rand(i * 9 + k) > 0.45 ? 0.9 : 0)} />
            ))}
          </g>
        );
      })}
    </g>
  </g>
);

/** Curtain with waving folds (cloth in a breeze). */
export const Curtain: React.FC<{ x: number; y: number; w: number; h: number; t: number; color?: string; side?: "left" | "right"; strength?: number }> = ({ x, y, w, h, t, color = "#7A2E3A", side = "right", strength = 1 }) => {
  const folds = 5;
  const pts: string[] = [];
  const steps = 24;
  // outer edge waves more at the bottom
  for (let s = 0; s <= steps; s++) {
    const k = s / steps, yy = y + k * h;
    const off = Math.sin(t * 1.6 + k * 3) * 18 * k * strength + Math.sin(t * 2.7 + k * 7) * 6 * k * strength;
    pts.push(`${(side === "right" ? x : x + w) + off} ${yy}`);
  }
  const edge = side === "right" ? x + w : x;
  const d = `M${edge} ${y} L ${pts.join(" L ")} L ${edge} ${y + h} Z`;
  return (
    <g>
      <path d={d} fill={color} />
      {Array.from({ length: folds }).map((_, i) => {
        const fx = x + (w / (folds + 1)) * (i + 1);
        return <path key={i} d={`M${fx} ${y} Q ${fx + Math.sin(t * 1.6 + i) * 10 * strength} ${y + h * 0.6} ${fx + Math.sin(t * 1.6 + i + 1) * 16 * strength} ${y + h}`}
          stroke="#000" strokeOpacity={0.22} strokeWidth={10} fill="none" />;
      })}
      {Array.from({ length: folds }).map((_, i) => {
        const fx = x + (w / (folds + 1)) * (i + 1) + 12;
        return <path key={`h${i}`} d={`M${fx} ${y} Q ${fx + Math.sin(t * 1.6 + i) * 10 * strength} ${y + h * 0.6} ${fx + Math.sin(t * 1.6 + i + 1) * 16 * strength} ${y + h}`}
          stroke="#fff" strokeOpacity={0.1} strokeWidth={6} fill="none" />;
      })}
      <rect x={x - 20} y={y - 18} width={w + 40} height={14} rx={7} fill="#8a6a44" />
    </g>
  );
};

/**
 * Night bedroom (POV of the bed). Options:
 *  sky: base sky in the window ("night" | "dawn" | "day" | "dusk"), skyChanges: [{ at: absSec, sky }] = time-lapse
 *  light: "phone" (cold blue glow) | "lamp" (warm) | "day" | "dark"; clock: "3:00"; curtain: true; wall: colour
 */
export const Bedroom: React.FC<{ options?: Opts; tAbs: number }> = ({ options = {}, tAbs }) => {
  const t = useCurrentFrame() / 30;
  const sky = skyAt((options.sky ?? "night") as SkyMode, options.skyChanges, tAbs);
  const light: string = options.light ?? "phone";
  const dayK = sky.sun; // room brightens with daylight
  const wall = mix(options.wall ?? "#2B2A4E", "#B9C7D9", dayK * 0.75);
  const [hh, mm] = String(options.clock ?? "3:00").split(":").map(Number);
  const lampOn = light === "lamp";
  const flick = 0.85 + 0.15 * Math.abs(Math.sin(t * 7)) * Math.abs(Math.sin(t * 3.1));
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={box}>
        <defs>
          <radialGradient id="bLamp" cx="22%" cy="50%" r="45%"><stop offset="0" stopColor="#FFC870" stopOpacity={0.55 * flick} /><stop offset="1" stopColor="#FFC870" stopOpacity="0" /></radialGradient>
          <radialGradient id="bPhone" cx="45%" cy="68%" r="40%"><stop offset="0" stopColor="#8FD3FF" stopOpacity={0.35 + 0.08 * Math.sin(t * 9)} /><stop offset="1" stopColor="#8FD3FF" stopOpacity="0" /></radialGradient>
          <radialGradient id="bWin" cx="70%" cy="30%" r="45%"><stop offset="0" stopColor={sky.bot} stopOpacity={0.25 + dayK * 0.3} /><stop offset="1" stopColor={sky.bot} stopOpacity="0" /></radialGradient>
        </defs>
        <rect width={W} height={1260} fill={wall} />
        {Array.from({ length: 14 }).map((_, i) => <rect key={i} x={i * 80} y={0} width={2} height={1260} fill="#000" opacity={0.06} />)}
        <rect width={W} height={H} fill="url(#bWin)" />
        {/* window */}
        <rect x={545} y={520} width={450} height={480} fill="#151525" />
        <SkyView x={560} y={535} w={420} h={450} t={t} sky={sky} id="bed" />
        {Array.from({ length: 7 }).map((_, i) => <rect key={i} x={560 + i * 64} y={535} width={7} height={450} fill="#2a2d3a" />)}
        <rect x={545} y={520} width={450} height={480} fill="none" stroke="#4a4a5e" strokeWidth={18} />
        <rect x={530} y={990} width={480} height={22} fill="#5e5a6a" />
        {options.curtain !== false ? <Curtain x={890} y={505} w={170} h={600} t={t} color={mix("#7A2E3A", "#C46A6A", dayK * 0.5)} side="right" /> : null}
        {/* wall clock */}
        <g transform="translate(250,640)">
          <circle r={78} fill="#F3EEDD" stroke="#3a3328" strokeWidth={9} />
          {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-3} y={-68} width={6} height={12} fill="#3a3328" transform={`rotate(${i * 30})`} />)}
          <line x1={0} y1={0} x2={Math.sin(((hh % 12) + mm / 60) * Math.PI / 6) * 38} y2={-Math.cos(((hh % 12) + mm / 60) * Math.PI / 6) * 38} stroke="#222" strokeWidth={9} strokeLinecap="round" />
          <line x1={0} y1={0} x2={Math.sin(mm * Math.PI / 30) * 58} y2={-Math.cos(mm * Math.PI / 30) * 58} stroke="#222" strokeWidth={6} strokeLinecap="round" />
          <line x1={0} y1={0} x2={Math.sin(t * Math.PI / 30 * 6) * 62} y2={-Math.cos(t * Math.PI / 30 * 6) * 62} stroke={C.red} strokeWidth={3} />
          <circle r={7} fill="#222" />
        </g>
        {/* side table + lamp */}
        <rect x={40} y={1080} width={300} height={180} fill="#5a3f2a" /><rect x={30} y={1070} width={320} height={18} fill="#6e4f35" />
        <rect x={180} y={930} width={14} height={140} fill="#C9A24A" />
        <path d="M110 940 L 260 940 L 230 840 L 140 840 Z" fill={lampOn ? "#F7D98A" : "#B9A67A"} />
        {lampOn ? <rect width={W} height={H} fill="url(#bLamp)" /> : null}
        {/* bed */}
        <rect x={360} y={1000} width={720} height={240} rx={20} fill="#4b3446" />
        <rect x={360} y={1220} width={720} height={60} fill="#3a2838" />
        <path d="M330 1240 L 1080 1240 L 1080 1920 L 250 1920 Z" fill={mix("#3b4f7a", "#6f86b5", dayK * 0.6)} />
        {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M${330 + i * 90} 1240 Q ${300 + i * 95} 1580 ${260 + i * 100} 1920`} stroke="#fff" strokeOpacity={0.07} strokeWidth={14} fill="none" />)}
        <rect x={0} y={1260} width={W} height={660} fill="#000" opacity={0} />
        <rect x={0} y={1255} width={260} height={665} fill="#2a1f1a" />
        {light === "phone" ? <rect width={W} height={H} fill="url(#bPhone)" /> : null}
        {light === "dark" || light === "phone" ? <rect width={W} height={H} fill="#05040f" opacity={0.25 * (1 - dayK)} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

/** Library / study: tall bookshelves, reading lamp, desk. Good for "a study found…", books, exams. */
export const Library: React.FC<{ options?: Opts }> = ({ options = {} }) => {
  const t = useCurrentFrame() / 30;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={box}>
        <rect width={W} height={H} fill="#3B2A22" />
        {Array.from({ length: 6 }).map((_, r) => (
          <g key={r}>
            <rect x={0} y={250 + r * 170} width={W} height={14} fill="#6E4A2E" />
            {Array.from({ length: 30 }).map((_, k) => {
              const bw = 22 + rand(r * 40 + k) * 18, bh = 110 + rand(r * 7 + k) * 40;
              const x = k * 37 + rand(k + r) * 4;
              return <rect key={k} x={x} y={250 + r * 170 - bh} width={bw} height={bh} rx={2}
                fill={["#7A2E2E", "#2F4E6B", "#C9A24A", "#3F6B4A", "#8A6A44", "#5A3A6A", "#B9A67A"][Math.floor(rand(r * 31 + k) * 7)]} opacity={0.92} />;
            })}
          </g>
        ))}
        <rect width={W} height={1250} fill="url(#libShade)" />
        <defs>
          <linearGradient id="libShade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0.45" /><stop offset="1" stopColor="#000" stopOpacity="0.1" /></linearGradient>
          <radialGradient id="libLamp" cx="70%" cy="62%" r="45%"><stop offset="0" stopColor="#FFD58A" stopOpacity={0.5 + 0.05 * Math.sin(t * 5)} /><stop offset="1" stopColor="#FFD58A" stopOpacity="0" /></radialGradient>
        </defs>
        <rect x={0} y={1250} width={W} height={60} fill="#7A5236" />
        <rect x={0} y={1310} width={W} height={610} fill="#5A3B26" />
        <g transform="translate(760,1250)">
          <rect x={-6} y={-260} width={12} height={260} fill="#2F4E3A" />
          <path d="M-90 -250 L 90 -250 L 60 -320 L -60 -320 Z" fill="#2F6B4F" />
          <ellipse cx={0} cy={-250} rx={90} ry={12} fill="#FFE2A0" />
        </g>
        <rect width={W} height={H} fill="url(#libLamp)" />
        {options.title ? <text x={W / 2} y={1420} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={40} fill="#E9D9B5" opacity={0.6}>{options.title}</text> : null}
      </svg>
    </AbsoluteFill>
  );
};
