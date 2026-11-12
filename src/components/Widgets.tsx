import React from "react";
import { C, DISPLAY_FONT, MONO_FONT } from "../theme";
import { clamp01, rand } from "../engine/anim";
import { HandDraw, type HandLink } from "./HandDraw";

const paperShadow = "drop-shadow(6px 10px 8px rgba(0,0,0,0.28))";
const sm = (x: number) => x * x * (3 - 2 * x);

/** Thought bubble with optional text + self-drawing tick. viewBox 600x380. */
export const Bubble: React.FC<{ text?: string; check?: boolean; local: number }> = ({ text, check, local }) => {
  const d = "M120 300 C40 300 30 220 90 205 C50 140 120 80 190 110 C220 40 340 30 380 95 C440 50 540 90 520 170 C590 190 580 290 500 300 Z";
  const tick = clamp01((local - 0.5) / 0.4);
  return (
    <svg viewBox="0 0 600 380" width="100%" style={{ overflow: "visible", filter: paperShadow }}>
      <path d={d} fill="#FBF6EC" stroke="#FBF6EC" strokeWidth={20} strokeLinejoin="round" />
      <path d={d} fill={C.cloud} stroke="#c9bb9c" strokeWidth={2} />
      <circle cx={130} cy={335} r={16} fill={C.cloud} stroke="#c9bb9c" strokeWidth={2} />
      <circle cx={95} cy={365} r={9} fill={C.cloud} stroke="#c9bb9c" strokeWidth={2} />
      {text ? <text x={check ? 270 : 300} y={225} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={72} fill={C.ink}>{text}</text> : null}
      {check ? <path d="M420 200 l25 30 l55 -75" stroke={C.red} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} /> : null}
    </svg>
  );
};

/** Paper slip / document with a headline and fake text lines; optional red rubber stamp. viewBox 400x500. */
export const Note: React.FC<{ text: string; sub?: string; stamp?: string }> = ({ text, sub, stamp }) => (
  <svg viewBox="0 0 400 500" width="100%" style={{ overflow: "visible", filter: paperShadow }}>
    <rect x={0} y={0} width={400} height={500} fill="#F7F2E6" stroke="#d8ceb8" strokeWidth={2} />
    <text x={30} y={70} fontFamily={DISPLAY_FONT} fontSize={44} fill={C.ink}>{text}</text>
    {sub ? <text x={30} y={110} fontFamily={MONO_FONT} fontSize={20} fill="#6d655a">{sub}</text> : null}
    {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={30} y={150 + i * 30} width={300 - rand(i) * 120} height={8} fill="#cfc7b6" />)}
    {stamp ? (
      <g transform="rotate(-10 200 260)">
        <rect x={70} y={200} width={260} height={90} fill="none" stroke={C.red} strokeWidth={8} />
        <text x={200} y={268} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={58} fill={C.red}>{stamp}</text>
      </g>
    ) : null}
    <circle cx={330} cy={440} r={26} fill="none" stroke={C.red} strokeWidth={3} opacity={0.6} />
  </svg>
);

/** Stack of notification slips that appear one after another. */
export const Notifications: React.FC<{ items: string[]; local: number; interval?: number }> = ({ items, local, interval = 0.45 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    {items.map((it, i) => {
      const p = clamp01((local - i * interval) / 0.3);
      const s = sm(p);
      return (
        <div key={i} style={{ transform: `translateX(${(1 - s) * 60}px) rotate(${(rand(i) - 0.5) * 6}deg) scale(${0.8 + 0.2 * s})`, opacity: s,
          background: "#F4EEDF", padding: "16px 24px", fontFamily: DISPLAY_FONT, fontSize: 34, color: C.ink, display: "flex", alignItems: "center", gap: 14,
          boxShadow: "4px 8px 12px rgba(0,0,0,0.3)", clipPath: "polygon(0 4%, 100% 0, 99% 96%, 1% 100%)" }}>
          <span style={{ width: 18, height: 18, borderRadius: 9, background: C.red, display: "inline-block" }} />{it}
        </div>
      );
    })}
  </div>
);

/** Rubber stamp text (slams down). */
export const Stamp: React.FC<{ text: string; color?: string }> = ({ text, color = C.red }) => (
  <div style={{ display: "inline-block", border: `8px solid ${color}`, padding: "6px 24px", color, fontFamily: DISPLAY_FONT, fontSize: 90, lineHeight: 1,
    transform: "rotate(-8deg)", opacity: 0.92, maskImage: "radial-gradient(circle at 30% 40%, #000 60%, rgba(0,0,0,0.75) 100%)", whiteSpace: "nowrap", background: "rgba(255,255,255,0.05)" }}>{text}</div>
);

/** Hand-drawn marker marks. A real hand with a marker draws them (hand: false to hide it). viewBox 400 x h */
export const Mark: React.FC<{ kind: "circle" | "check" | "cross" | "underline" | "squiggle" | "arrow"; color?: string; local: number; dur?: number; h?: number; hand?: boolean; link?: HandLink }> = ({ kind, color = C.red, local, dur = 0.5, h = 260, hand = true, link }) => {
  const paths: Record<string, string> = {
    circle: `M215 ${h * 0.08} C 360 ${h * 0.06}, 395 ${h * 0.9}, 200 ${h * 0.93} C 20 ${h * 0.95}, 5 ${h * 0.12}, 190 ${h * 0.09} L 250 ${h * 0.12}`,
    check: `M60 ${h * 0.55} L 160 ${h * 0.85} L 360 ${h * 0.1}`,
    cross: `M60 ${h * 0.1} L 340 ${h * 0.9} M 340 ${h * 0.1} L 60 ${h * 0.9}`,
    underline: `M10 ${h * 0.6} Q 200 ${h * 0.4} 390 ${h * 0.55}`,
    squiggle: `M10 ${h * 0.6} ${Array.from({ length: 12 }).map(() => `q 15 ${-h * 0.3} 30 0`).join(" ")}`,
    arrow: `M20 ${h * 0.8} Q 200 ${h * 0.1} 360 ${h * 0.35} M 300 ${h * 0.15} L 360 ${h * 0.35} L 290 ${h * 0.5}`,
  };
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: `400 / ${h}` }}>
      <HandDraw d={paths[kind]} vbW={400} vbH={h} t={local} dur={dur} color={color} width={9} hand={hand} link={link} />
    </div>
  );
};

/** Split-flap counter. */
export const Counter: React.FC<{ from?: number; to: number; digits?: number; suffix?: string; local: number; dur?: number }> = ({ from = 0, to, digits, suffix, local, dur = 1.6 }) => {
  const p = sm(clamp01(local / dur));
  const val = Math.round(from + (to - from) * p);
  const n = digits ?? String(to).length;
  const str = String(val).padStart(n, "0");
  const flipping = p < 1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, padding: 14, background: "#8a6a3a", borderRadius: 10, boxShadow: "6px 10px 14px rgba(0,0,0,0.35)", border: "4px solid #5e4422" }}>
        {str.split("").map((ch, i) => (
          <div key={i} style={{ position: "relative", width: 96, height: 140, background: "#F1E9D6", borderRadius: 6, fontFamily: DISPLAY_FONT, fontSize: 120, color: "#1d1d1d",
            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.12)" }}>
            <span style={{ transform: flipping && i >= n - 2 ? `scaleY(${0.6 + 0.4 * Math.abs(Math.cos(local * 25 + i))})` : undefined }}>{ch}</span>
            <div style={{ position: "absolute", left: 0, right: 0, top: 69, height: 2, background: "rgba(0,0,0,0.35)" }} />
          </div>
        ))}
      </div>
      {suffix ? <div style={{ fontFamily: DISPLAY_FONT, fontSize: 110, color: C.ink }}>{suffix}</div> : null}
    </div>
  );
};

/** Isotype grid of seated figures; `fill` of them turn red one by one. viewBox width 1000. */
export const Isotype: React.FC<{ rows?: number; cols?: number; fill: number; fillColor?: string; baseColor?: string; local: number; dur?: number }> = ({ rows = 10, cols = 10, fill, fillColor = C.red, baseColor = "#3E5A7A", local, dur = 1.5 }) => {
  const total = rows * cols;
  const shown = Math.round((fill / 100) * total * sm(clamp01(local / dur)));
  const order = Array.from({ length: total }).map((_, i) => i).sort((a, b) => rand(a + 3) - rand(b + 3));
  const red = new Set(order.slice(0, shown));
  const cw = 1000 / cols, ch = cw * 1.25;
  return (
    <svg viewBox={`0 0 1000 ${rows * ch}`} width="100%">
      {Array.from({ length: total }).map((_, i) => {
        const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch;
        const col = red.has(i) ? fillColor : baseColor;
        const s = cw / 100;
        return (
          <g key={i} transform={`translate(${x - 30 * s},${y}) scale(${s})`} fill={col}>
            <circle cx={30} cy={14} r={11} />
            <path d="M20 28 h18 l6 40 h18 v14 h-26 l-4 -20 z" />
            <rect x={44} y={82} width={6} height={30} /><rect x={18} y={70} width={6} height={42} />
          </g>
        );
      })}
    </svg>
  );
};

/** Bars that grow, with optional labels. viewBox 800x700. */
export const Bars: React.FC<{ values: number[]; labels?: string[]; colors?: string[]; max?: number; local: number; dur?: number }> = ({ values, labels, colors, max, local, dur = 1.2 }) => {
  const m = max ?? Math.max(...values) * 1.15;
  const bw = 560 / values.length;
  return (
    <svg viewBox="0 0 800 700" width="100%" style={{ filter: paperShadow }}>
      <rect width={800} height={700} fill="#F1EADB" />
      {[1, 2, 3].map((k) => <g key={k}><line x1={110} x2={760} y1={600 - (k / 3) * 480} y2={600 - (k / 3) * 480} stroke="#bbb" strokeDasharray="8 8" /><text x={60} y={608 - (k / 3) * 480} fontFamily={MONO_FONT} fontSize={26} fill="#555">×{Math.round((m * k) / 3 * 10) / 10}</text></g>)}
      <line x1={110} x2={110} y1={80} y2={600} stroke={C.ink} strokeWidth={5} /><line x1={110} x2={770} y1={600} y2={600} stroke={C.ink} strokeWidth={5} />
      {values.map((v, i) => {
        const p = sm(clamp01((local - i * 0.35) / dur));
        const h = (v / m) * 480 * p;
        return (
          <g key={i}>
            <rect x={160 + i * (bw + 40)} y={600 - h} width={bw - 40} height={h} fill={colors?.[i] ?? (i === values.length - 1 ? C.red : "#6E7B7E")} />
            {labels?.[i] ? <text x={160 + i * (bw + 40) + (bw - 40) / 2} y={650} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={34} fill={C.ink}>{labels[i]}</text> : null}
          </g>
        );
      })}
    </svg>
  );
};

/** ECG strip that draws left→right. viewBox 800x200. */
export const Ecg: React.FC<{ local: number; dur?: number }> = ({ local, dur = 1.5 }) => {
  const p = clamp01(local / dur);
  let d = "M20 100";
  for (let i = 0; i < 4; i++) { const x = 20 + i * 190; d += ` L${x + 80} 100 L${x + 95} 80 L${x + 105} 150 L${x + 120} 20 L${x + 135} 120 L${x + 150} 100 L${x + 190} 100`; }
  return (
    <svg viewBox="0 0 800 200" width="100%" style={{ filter: paperShadow }}>
      <rect width={800} height={200} fill="#F1E3CF" />
      {Array.from({ length: 20 }).map((_, i) => <line key={i} x1={i * 40} x2={i * 40} y1={0} y2={200} stroke="#e3b8a8" strokeWidth={1} />)}
      {Array.from({ length: 5 }).map((_, i) => <line key={i} x1={0} x2={800} y1={i * 40} y2={i * 40} stroke="#e3b8a8" strokeWidth={1} />)}
      <path d={d} stroke={C.red} strokeWidth={5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeLinejoin="round" />
    </svg>
  );
};

/** Wall calendar: crossed days (X marks appear one by one) and optional month flips. viewBox 700x760 */
export const Calendar: React.FC<{ month?: string; year?: string; crossed?: number; flipTo?: string[]; local: number; dur?: number }> = ({ month = "OCTOBER", year = "2026", crossed = 0, flipTo, local, dur = 1.5 }) => {
  const months = [month, ...(flipTo ?? [])];
  const flipIdx = flipTo?.length ? Math.min(months.length - 1, Math.floor(local / 0.5)) : 0;
  const shownX = Math.floor(crossed * clamp01(local / dur));
  return (
    <svg viewBox="0 0 700 760" width="100%" style={{ overflow: "visible", filter: paperShadow }}>
      {months.slice(0, flipIdx).map((m, i) => (
        <g key={i} transform={`translate(${-60 - i * 20},${40 + i * 30}) rotate(${-14 - i * 6} 350 380)`} opacity={0.95}>
          <rect width={700} height={720} fill="#F3EDE0" stroke="#ccc" /><rect width={700} height={130} fill={C.red} />
          <text x={350} y={95} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={70} fill="#fff">{m}</text>
        </g>
      ))}
      <rect width={700} height={740} fill="#F3EDE0" stroke="#d6cdb8" strokeWidth={2} />
      <rect width={700} height={140} fill={C.red} />
      <circle cx={230} cy={10} r={14} fill="#333" /><circle cx={470} cy={10} r={14} fill="#333" />
      <text x={350} y={50} textAnchor="middle" fontFamily={MONO_FONT} fontSize={28} fill="#fff">{year}</text>
      <text x={350} y={118} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={64} fill="#fff">{months[flipIdx]}</text>
      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <text key={i} x={60 + i * 96} y={190} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={30} fill={i === 6 ? C.red : "#444"}>{d}</text>)}
      {Array.from({ length: 31 }).map((_, i) => {
        const x = 18 + (i % 7) * 96, y = 210 + Math.floor(i / 7) * 100;
        return (
          <g key={i}>
            <rect x={x} y={y} width={88} height={92} fill="none" stroke="#d8d0bf" />
            <text x={x + 10} y={y + 30} fontFamily={MONO_FONT} fontSize={22} fill="#444">{i + 1}</text>
            {i < shownX ? <path d={`M${x + 18} ${y + 22} L${x + 72} ${y + 80} M${x + 72} ${y + 22} L${x + 18} ${y + 80}`} stroke={C.red} strokeWidth={7} strokeLinecap="round" /> : null}
          </g>
        );
      })}
    </svg>
  );
};

/** Items orbiting on a dashed ellipse (overthinking loop). */
export const Orbit: React.FC<{ items: string[]; local: number; rx?: number; ry?: number }> = ({ items, local, rx = 360, ry = 130 }) => (
  <svg viewBox={`${-rx - 120} ${-ry - 120} ${2 * rx + 240} ${2 * ry + 240}`} width="100%" style={{ overflow: "visible" }}>
    <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="none" stroke="#333" strokeWidth={4} strokeDasharray="14 12" strokeDashoffset={-local * 40} />
    {items.map((it, i) => {
      const a = local * 0.9 + (i / items.length) * Math.PI * 2;
      const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
      return (
        <g key={i} transform={`translate(${x},${y}) rotate(${Math.sin(a) * 8})`}>
          <rect x={-90} y={-46} width={180} height={92} fill="#F6F0E2" stroke="#c9bfa8" strokeWidth={2} style={{ filter: "drop-shadow(3px 6px 4px rgba(0,0,0,0.3))" }} />
          <text x={0} y={12} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={34} fill={C.red}>{it}</text>
        </g>
      );
    })}
  </svg>
);
