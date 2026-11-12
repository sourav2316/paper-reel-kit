import React from "react";
import { DISPLAY_FONT } from "../theme";

/** Phone showing an endless vertical reels feed; swipes every `interval` s, counter "REEL #from → #to". Designed 600 px wide. */
export const ReelFeed: React.FC<{ local: number; from?: number; to?: number; interval?: number; boxW?: number; label?: string }> = ({ local, from = 1, to, interval = 0.9, boxW = 600, label = "REEL" }) => {
  const idx = Math.floor(local / interval);
  const ph = (local % interval) / interval;
  const swipe = ph > 0.75 ? (ph - 0.75) / 0.25 : 0; // last quarter of each interval = swipe up
  const e = swipe * swipe * (3 - 2 * swipe);
  const n = to !== undefined ? Math.min(from + idx, to) : from + idx;
  const palette = [["#FF7A59", "#7A3CFF"], ["#1FB6A6", "#0E3B66"], ["#FFC93C", "#FF4B6E"], ["#6EE7B7", "#3B82F6"], ["#F472B6", "#7C3AED"], ["#F59E0B", "#B91C1C"]];
  const card = (k: number, y: number) => {
    const [a, b] = palette[k % palette.length];
    return (
      <div key={k} style={{ position: "absolute", left: 0, right: 0, top: y, height: 1000, background: `linear-gradient(160deg, ${a}, ${b})` }}>
        <svg viewBox="0 0 540 1000" width="100%" height="100%">
          <circle cx={270} cy={330} r={70} fill="#00000040" />
          <rect x={200} y={400} width={140} height={260} rx={60} fill="#00000040" />
          <path d={`M230 650 L 210 ${800 + Math.sin(local * 8 + k) * 20} M310 650 L 330 ${800 - Math.sin(local * 8 + k) * 20}`} stroke="#00000040" strokeWidth={50} strokeLinecap="round" />
          {[0, 1, 2].map((i) => <circle key={i} cx={490} cy={560 + i * 110} r={30} fill="#ffffffcc" />)}
          <path d="M478 556 q 12 -18 24 0 q -12 22 -12 22 q 0 0 -12 -22 z" fill="#ff3b5c" />
          <rect x={30} y={860} width={300} height={22} rx={11} fill="#ffffffcc" />
          <rect x={30} y={900} width={210} height={18} rx={9} fill="#ffffff99" />
        </svg>
      </div>
    );
  };
  return (
    <div style={{ width: 600, zoom: boxW / 600 }}>
      <div style={{ background: "#121212", borderRadius: 70, padding: 22, boxShadow: "0 30px 60px rgba(0,0,0,0.5), 0 0 120px rgba(143,211,255,0.35)" }}>
        <div style={{ position: "relative", height: 1000, borderRadius: 50, overflow: "hidden", background: "#000" }}>
          {card(idx, -e * 1000)}
          {card(idx + 1, 1000 - e * 1000)}
          <div style={{ position: "absolute", top: 26, left: 0, right: 0, textAlign: "center", fontFamily: DISPLAY_FONT, fontSize: 46, color: "#fff", textShadow: "0 3px 8px #000" }}>
            {label} #{n}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Open book; `text` on the right page (e.g. "THE END"). */
export const Book: React.FC<{ text?: string }> = ({ text = "THE END" }) => (
  <svg viewBox="0 0 700 440" width="100%" style={{ filter: "drop-shadow(8px 14px 10px rgba(0,0,0,0.35))" }}>
    <path d="M20 60 Q 180 20 350 70 L 350 420 Q 180 370 20 410 Z" fill="#F4ECD9" stroke="#b9a988" strokeWidth={3} />
    <path d="M680 60 Q 520 20 350 70 L 350 420 Q 520 370 680 410 Z" fill="#F7F0DF" stroke="#b9a988" strokeWidth={3} />
    {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={60} x2={310} y1={110 + i * 30} y2={115 + i * 30 - i} stroke="#9a8f78" strokeWidth={5} opacity={0.5} />)}
    {Array.from({ length: 4 }).map((_, i) => <line key={i} x1={390} x2={640} y1={110 + i * 30} y2={105 + i * 30} stroke="#9a8f78" strokeWidth={5} opacity={0.5} />)}
    <text x={515} y={300} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={54} fill="#7A2E2E">{text}</text>
    <line x1={350} y1={70} x2={350} y2={420} stroke="#8a7a5a" strokeWidth={4} />
  </svg>
);

/** Phone on a charging dock with a cable and a glowing bolt. */
export const Charger: React.FC<{ local: number }> = ({ local }) => (
  <svg viewBox="0 0 300 470" width="100%" style={{ overflow: "visible", filter: "drop-shadow(8px 14px 10px rgba(0,0,0,0.35))" }}>
    <path d="M150 440 C 150 470, 260 470, 290 430" stroke="#ddd" strokeWidth={8} fill="none" />
    <path d="M60 400 L 240 400 L 220 440 L 80 440 Z" fill="#cfd4d8" />
    <g transform="rotate(-6 150 225)">
      <rect x={80} y={40} width={140} height={370} rx={22} fill="#151515" />
      <rect x={92} y={56} width={116} height={338} rx={14} fill="#1f2a3a" />
      <path d="M160 160 L 128 236 L 152 236 L 138 300 L 182 214 L 156 214 L 172 160 Z" fill="#7CFF8B" opacity={0.6 + 0.4 * Math.abs(Math.sin(local * 3))} />
    </g>
  </svg>
);
