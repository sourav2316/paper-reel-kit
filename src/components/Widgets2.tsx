import React from "react";
import { spring } from "remotion";
import { C, DISPLAY_FONT, MONO_FONT } from "../theme";
import { clamp01, rand } from "../engine/anim";
import { MarkerRing, type HandLink } from "./HandDraw";

const paperShadow = "drop-shadow(8px 14px 12px rgba(0,0,0,0.32))";

/**
 * Old newspaper clipping (fictional masthead). markAt = the marker hand circles the headline.
 * Designed at 900px wide, scaled to the layer width.
 */
export const Newspaper: React.FC<{ masthead?: string; date?: string; headline: string; sub?: string; local: number; markAt?: number; links?: Record<string, HandLink>; boxW?: number }> = ({
  masthead = "THE DAILY KHABAR", date = "", headline, sub, local, markAt, links = {}, boxW = 900 }) => (
  <div style={{ width: 900, zoom: boxW / 900, filter: paperShadow }}>
    <div style={{ background: "#EFE7D2", padding: "34px 40px 44px", color: "#2a261f", fontFamily: MONO_FONT,
      clipPath: "polygon(0 1%, 4% 0, 12% 1.5%, 30% 0, 52% 1%, 70% 0, 88% 1.2%, 100% 0, 99% 30%, 100% 62%, 99% 100%, 70% 98.6%, 40% 100%, 12% 98.8%, 0 100%, 1% 60%)" }}>
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: 74, textAlign: "center", letterSpacing: 6, borderBottom: "4px double #2a261f", paddingBottom: 8 }}>{masthead}</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, padding: "8px 0", borderBottom: "2px solid #2a261f", letterSpacing: 2 }}>
        <span>NEW DELHI</span><span>{date}</span><span>PRICE ₹3</span>
      </div>
      <div style={{ position: "relative", fontFamily: DISPLAY_FONT, fontSize: 86, lineHeight: 1.0, margin: "22px 0 12px", textAlign: "center" }}>
        {headline}
        <MarkerRing t={markAt === undefined ? -1 : local - markAt} padX="-3%" padY="-12%" link={links.markAt} />
      </div>
      {sub ? <div style={{ fontSize: 26, textAlign: "center", fontStyle: "italic", marginBottom: 18, color: "#4a4337" }}>{sub}</div> : null}
      <div style={{ display: "flex", gap: 22 }}>
        <div style={{ flex: 1.1, height: 230, background: "repeating-linear-gradient(45deg,#8f877a 0 3px,#a39b8e 3px 6px)", opacity: 0.7 }} />
        {[0, 1].map((c) => (
          <div key={c} style={{ flex: 1 }}>
            {Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ height: 8, background: "#7d7566", opacity: 0.55, marginBottom: 11, width: `${70 + rand(c * 20 + i) * 30}%` }} />)}
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Balance scale (taraazu). The left pan is loaded first (beam tips left); the right pan lands at rightAt
 * and the beam swings to level (equal) or tips right (if right is heavier).
 */
export const Balance: React.FC<{ left: { label: string; value: string; weight?: number }; right: { label: string; value: string; weight?: number };
  rightAt?: number; local: number; fps?: number; leftColor?: string; rightColor?: string }> = ({ left, right, rightAt = 1.2, local, fps = 30, leftColor = "#3a8a4a", rightColor = C.red }) => {
  const lw = left.weight ?? 1, rw = right.weight ?? 1;
  const rIn = clamp01((local - rightAt) / 0.35);
  const settle = spring({ frame: Math.round((local - rightAt) * fps), fps, config: { damping: 6, stiffness: 90, mass: 0.8 } });
  const startTilt = -14; // left heavy
  const endTilt = Math.max(-14, Math.min(14, (rw - lw) * 14));
  const tilt = local < rightAt ? startTilt * clamp01(local / 0.6) : startTilt + (endTilt - startTilt) * settle;
  const rad = (tilt * Math.PI) / 180;
  const arm = 300;
  const L = { x: 450 - arm * Math.cos(rad), y: 260 - arm * Math.sin(rad) };
  const R = { x: 450 + arm * Math.cos(rad), y: 260 + arm * Math.sin(rad) };
  const pan = (p: { x: number; y: number }, item: { label: string; value: string }, color: string, show: number, dropY: number) => (
    <g>
      <line x1={p.x} y1={p.y} x2={p.x - 110} y2={p.y + 190} stroke="#8a6a2a" strokeWidth={4} />
      <line x1={p.x} y1={p.y} x2={p.x + 110} y2={p.y + 190} stroke="#8a6a2a" strokeWidth={4} />
      <path d={`M${p.x - 140} ${p.y + 190} Q ${p.x} ${p.y + 260} ${p.x + 140} ${p.y + 190} Z`} fill="#D9B054" stroke="#8a6a2a" strokeWidth={4} />
      {show > 0 ? (
        <g transform={`translate(0,${-(1 - show) * dropY})`} opacity={show}>
          <rect x={p.x - 120} y={p.y + 70} width={240} height={118} rx={12} fill={color} stroke="#2b2b2b" strokeWidth={4} />
          <text x={p.x} y={p.y + 112} textAnchor="middle" fontFamily={MONO_FONT} fontSize={24} fill="#fff" letterSpacing={2}>{item.label}</text>
          <text x={p.x} y={p.y + 170} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={56} fill="#fff">{item.value}</text>
        </g>
      ) : null}
    </g>
  );
  return (
    <svg viewBox="0 0 900 820" width="100%" style={{ overflow: "visible", filter: "drop-shadow(8px 14px 10px rgba(0,0,0,0.3))" }}>
      <rect x={430} y={260} width={40} height={470} fill="#B88A3A" stroke="#7a5a1e" strokeWidth={4} />
      <path d="M300 800 Q 450 700 600 800 Z" fill="#9C7430" stroke="#6e4f1c" strokeWidth={4} />
      <rect x={280} y={790} width={340} height={26} rx={8} fill="#7a5a1e" />
      <line x1={L.x} y1={L.y} x2={R.x} y2={R.y} stroke="#B88A3A" strokeWidth={22} strokeLinecap="round" />
      <circle cx={450} cy={260} r={30} fill="#E0BE63" stroke="#7a5a1e" strokeWidth={5} />
      <path d={`M450 230 L 438 180 L 462 180 Z`} fill="#7a5a1e" />
      {pan(L, left, leftColor, clamp01(local / 0.35), 120)}
      {pan(R, right, rightColor, rIn, 160)}
    </svg>
  );
};

/** UPI QR payment stand (generic, no brand logos). */
export const QrStand: React.FC<{ label?: string }> = ({ label = "SCAN & PAY" }) => {
  const n = 21;
  return (
    <svg viewBox="0 0 400 560" width="100%" style={{ filter: "drop-shadow(8px 14px 10px rgba(0,0,0,0.3))" }}>
      <path d="M60 520 L 340 520 L 300 560 L 100 560 Z" fill="#cfd6d8" />
      <rect x={40} y={0} width={320} height={520} rx={20} fill="#F7F7F2" stroke="#d0d4d6" strokeWidth={4} />
      <rect x={40} y={0} width={320} height={90} rx={20} fill="#2F5D7A" /><rect x={40} y={60} width={320} height={30} fill="#2F5D7A" />
      <text x={200} y={60} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={44} fill="#fff" letterSpacing={2}>{label}</text>
      <g transform="translate(80,120)">
        <rect width={240} height={240} fill="#fff" />
        {Array.from({ length: n * n }).map((_, i) => {
          const x = i % n, y = Math.floor(i / n);
          const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
          if (finder) return null;
          return rand(i * 7 + 3) > 0.52 ? <rect key={i} x={x * (240 / n)} y={y * (240 / n)} width={240 / n} height={240 / n} fill="#111" /> : null;
        })}
        {[[0, 0], [n - 7, 0], [0, n - 7]].map(([fx, fy], k) => (
          <g key={k} transform={`translate(${fx * (240 / n)},${fy * (240 / n)})`}>
            <rect width={7 * (240 / n)} height={7 * (240 / n)} fill="#111" /><rect x={240 / n} y={240 / n} width={5 * (240 / n)} height={5 * (240 / n)} fill="#fff" />
            <rect x={2 * (240 / n)} y={2 * (240 / n)} width={3 * (240 / n)} height={3 * (240 / n)} fill="#111" />
          </g>
        ))}
      </g>
      <text x={200} y={420} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={40} fill="#2b2b2b">UPI · CARD · CASH</text>
      <text x={200} y={470} textAnchor="middle" fontFamily={MONO_FONT} fontSize={22} fill="#666">MOBILE ZONE</text>
    </svg>
  );
};
