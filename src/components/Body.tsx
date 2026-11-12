import React from "react";
import { C } from "../theme";
import { clamp01, rand } from "../engine/anim";
import type { OrganState } from "../engine/types";

type Props = {
  local: number;
  brain?: OrganState; lungs?: OrganState; heart?: OrganState; stomach?: OrganState; adrenals?: OrganState; kidneys?: OrganState;
  bell?: boolean; ringing?: boolean; switchState?: "off" | "on" | "broken" | "none"; particles?: boolean; gears?: boolean; calm?: boolean;
  zoom?: "full" | "head" | "torso";
};

const LINE = "rgba(236,228,210,0.85)";
const FAINT = "rgba(236,228,210,0.35)";

const glowFilter = (st: OrganState | undefined, t: number, color = C.glow) =>
  st === "glow" ? `drop-shadow(0 0 ${14 + Math.sin(t * 6) * 6}px ${color}) drop-shadow(0 0 30px ${color}88)` : undefined;

const Gear: React.FC<{ x: number; y: number; r: number; a: number }> = ({ x, y, r, a }) => (
  <g transform={`translate(${x},${y}) rotate(${a})`}>
    {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={-r * 0.18} y={-r * 1.25} width={r * 0.36} height={r * 0.5} fill="#C9A24A" transform={`rotate(${i * 45})`} />)}
    <circle r={r} fill="#C9A24A" stroke="#7a5d1e" strokeWidth={3} /><circle r={r * 0.35} fill="#5a4416" />
  </g>
);

export const Bell: React.FC<{ t: number; ringing?: boolean }> = ({ t, ringing }) => {
  const shake = ringing ? Math.sin(t * 60) * 5 : 0;
  return (
    <g>
      <defs>
        <radialGradient id="brass" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#FFF0B0" /><stop offset="0.4" stopColor="#D9AE45" /><stop offset="1" stopColor="#6E4E12" /></radialGradient>
      </defs>
      <g transform={`rotate(${shake} 0 0)`}>
        <path d="M-70 40 L-80 120 L80 120 L70 40 Z" fill="#B53A2A" stroke="#6a1d12" strokeWidth={3} />
        <circle r={78} fill="url(#brass)" stroke="#6E4E12" strokeWidth={4} />
        <circle r={22} fill="#8a6418" /><circle r={10} fill="#F4DE8E" />
        <rect x={-6} y={60} width={12} height={40} fill="#3a2a10" />
      </g>
      {ringing ? [0, 1].map((k) => (
        <g key={k} opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 8 + k))}>
          <path d={`M${-110 - k * 30} -60 Q ${-140 - k * 30} 0 ${-110 - k * 30} 60`} stroke={C.mustard} strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d={`M${110 + k * 30} -60 Q ${140 + k * 30} 0 ${110 + k * 30} 60`} stroke={C.mustard} strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
      )) : null}
    </g>
  );
};

export const Body: React.FC<Props> = (p) => {
  const t = p.local;
  const head = p.zoom === "head";
  const st = {
    brain: p.brain ?? "on", lungs: p.lungs ?? (head ? "line" : "on"), heart: p.heart ?? (head ? "hidden" : "on"),
    stomach: p.stomach ?? "line", adrenals: p.adrenals ?? "line", kidneys: p.kidneys ?? "line",
  };
  const vb = p.zoom === "head" ? "180 20 760 760" : p.zoom === "torso" ? "120 480 760 900" : "0 0 1000 1700";
  const brainColor = p.calm ? C.blue : "#D98A55";
  const sw = p.switchState ?? (p.bell ? "none" : "none");
  const brokenT = clamp01(t / 0.8);
  return (
    <svg viewBox={vb} width="100%" style={{ overflow: "visible" }}>
      <defs>
        <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="10" stroke="#EDE6D6" strokeWidth="2" opacity="0.55" /></pattern>
        <pattern id="hlines" width="12" height="12" patternUnits="userSpaceOnUse"><line x1="0" y1="6" x2="12" y2="6" stroke="#D9A066" strokeWidth="2" opacity="0.6" /></pattern>
        <radialGradient id="headGlow"><stop offset="0" stopColor={p.calm ? "#6f9ccc" : "#ffb070"} stopOpacity="0.35" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
      </defs>
      {/* silhouette */}
      <circle cx={500} cy={260} r={150} fill="url(#headGlow)" stroke={LINE} strokeWidth={4} />
      <path d="M445 405 L445 470 C 320 490 200 520 180 660 L 160 1700 M555 405 L555 470 C 680 490 800 520 820 660 L 840 1700" stroke={LINE} strokeWidth={4} fill="none" />
      <path d="M250 700 L 270 1700 M750 700 L 730 1700" stroke={FAINT} strokeWidth={3} fill="none" />
      {Array.from({ length: 30 }).map((_, i) => <rect key={i} x={488} y={430 + i * 36} width={24} height={26} rx={7} fill="none" stroke={FAINT} strokeWidth={2.5} />)}
      {/* brain */}
      {st.brain !== "hidden" ? (
        <g style={{ filter: glowFilter(st.brain, t, p.calm ? C.blue : C.glow) }}>
          <ellipse cx={500} cy={235} rx={115} ry={82} fill={st.brain === "line" ? "none" : `${brainColor}33`} stroke={brainColor} strokeWidth={4} />
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={i} d={`M${400 + rand(i) * 30} ${190 + i * 10} q 25 ${-20 + rand(i + 1) * 40} 50 0 t 50 0 t 50 0 t 40 0`} stroke={brainColor} strokeWidth={3} fill="none" opacity={0.85} />
          ))}
          {p.gears ? (<>
            <Gear x={455} y={215} r={22} a={t * 160} /><Gear x={520} y={200} r={26} a={-t * 140} /><Gear x={560} y={255} r={18} a={t * 200} /><Gear x={470} y={270} r={16} a={-t * 220} />
            {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={395 + rand(i) * 210} cy={165 + rand(i + 40) * 140} r={3} fill="#FFE2A8" opacity={0.3 + 0.7 * Math.abs(Math.sin(t * 5 + i))} />)}
          </>) : null}
        </g>
      ) : null}
      {/* bell + wire */}
      {p.bell ? (<>
        <path d={`M600 250 C 680 250 700 ${300 + Math.sin(t * 3) * 6} 760 290`} stroke={p.ringing ? "#FFC870" : "#C9A87A"} strokeWidth={5} fill="none"
          style={{ filter: p.ringing ? "drop-shadow(0 0 8px #ffb060)" : undefined }} />
        <g transform="translate(830,250) scale(0.75)"><Bell t={t} ringing={p.ringing} /></g>
      </>) : null}
      {sw !== "none" ? (
        <g transform={sw === "broken" ? `translate(${830 + brokenT * 60},${450 + brokenT * brokenT * 700}) rotate(${brokenT * 160})` : "translate(830,450)"}>
          <circle r={48} fill="#B9A27A" stroke="#6b5530" strokeWidth={4} />
          <rect x={-10} y={sw === "on" ? -50 : -10} width={20} height={60} rx={8} fill="#3a3a3a" />
          <rect x={-40} y={62} width={80} height={34} fill="#F1E9D6" /><text x={0} y={88} textAnchor="middle" fontFamily="Space Mono" fontSize={22} fill="#222">{sw === "on" ? "ON" : "OFF"}</text>
        </g>
      ) : null}
      {/* lungs */}
      {st.lungs !== "hidden" ? (
        <g opacity={st.lungs === "line" ? 0.5 : 1}>
          <path d="M488 560 C 420 560 330 640 320 800 C 315 900 360 960 420 950 C 470 940 490 900 490 840 Z" fill="url(#hatch)" stroke={LINE} strokeWidth={3} />
          <path d="M512 560 C 580 560 670 640 680 800 C 685 900 640 960 580 950 C 530 940 510 900 510 840 Z" fill="url(#hatch)" stroke={LINE} strokeWidth={3} />
          <path d="M500 470 L500 560 M500 560 L 440 620 M500 560 L 560 620" stroke={LINE} strokeWidth={8} fill="none" />
        </g>
      ) : null}
      {/* heart */}
      {st.heart !== "hidden" ? (
        <g style={{ filter: glowFilter(st.heart, t) }} transform={`translate(530,820) scale(${st.heart === "glow" ? 1 + Math.max(0, Math.sin(t * 9)) * 0.08 : 1}) translate(-530,-820)`}>
          <path d="M530 740 C 600 720 640 790 610 850 C 590 890 540 910 520 900 C 470 880 450 820 480 780 C 490 760 510 745 530 740 Z"
            fill={st.heart === "line" ? "none" : "#A8654B"} stroke={LINE} strokeWidth={3} />
          <path d="M500 790 q 30 30 60 10 M505 830 q 40 20 80 -10" stroke="#ead7c4" strokeWidth={2} fill="none" opacity={0.7} />
        </g>
      ) : null}
      {/* stomach */}
      {st.stomach !== "hidden" ? (
        <path d="M560 960 C 600 960 640 1000 620 1070 C 600 1130 520 1140 490 1100 C 470 1070 500 1050 530 1060 C 560 1060 570 1020 550 990 Z"
          fill={st.stomach === "line" ? "none" : "url(#hlines)"} stroke={st.stomach === "line" ? FAINT : "#D9A066"} strokeWidth={3} style={{ filter: glowFilter(st.stomach, t) }} />
      ) : null}
      {/* kidneys + adrenals */}
      {st.kidneys !== "hidden" ? [400, 600].map((x, i) => (
        <path key={i} d={`M${x} 1150 c ${i ? 50 : -50} 0 ${i ? 60 : -60} 120 0 130 c ${i ? -40 : 40} 0 ${i ? -30 : 30} -40 ${i ? -10 : 10} -60 c ${i ? -20 : 20} -20 ${i ? -10 : 10} -70 0 -70 z`}
          fill={st.kidneys === "line" ? "none" : "url(#hlines)"} stroke={st.kidneys === "line" ? FAINT : "#D9A066"} strokeWidth={3} />
      )) : null}
      {st.adrenals !== "hidden" ? [400, 600].map((x, i) => (
        <path key={i} d={`M${x - 30} 1150 Q ${x} 1100 ${x + 30} 1150 Z`} fill={st.adrenals === "line" ? "none" : C.mustard} stroke={st.adrenals === "line" ? FAINT : "#8a6418"} strokeWidth={3}
          style={{ filter: glowFilter(st.adrenals, t, "#FFD36B") }} />
      )) : null}
      {/* hormone particles flowing up from adrenals */}
      {p.particles ? Array.from({ length: 26 }).map((_, i) => {
        const k = ((t * 0.7 + rand(i)) % 1);
        const sx = i % 2 ? 400 : 600;
        const x = sx + (500 - sx) * k + Math.sin(k * 8 + i) * 25;
        const y = 1120 - k * 380;
        return <ellipse key={i} cx={x} cy={y} rx={7} ry={12} fill="#FFD36B" opacity={Math.sin(k * Math.PI)} style={{ filter: "drop-shadow(0 0 8px #ffb030)" }} />;
      }) : null}
    </svg>
  );
};
