import React from "react";
import { C, DISPLAY_FONT, MONO_FONT } from "../theme";
import { clamp01 } from "../engine/anim";
import { Bell } from "../components/Body";
import type { PropName } from "../engine/types";
import { QrStand } from "../components/Widgets2";
import { Book, Charger } from "../components/Widgets3";

const sh = "drop-shadow(6px 10px 8px rgba(0,0,0,0.3))";

/** Built-in SVG props. All render at width 100% of their layer box. `local` = seconds since the layer appeared. */
export const Prop: React.FC<{ name: PropName; local: number; text?: string; color?: string; value?: number; ringing?: boolean }> = ({ name, local, text, color, value, ringing }) => {
  const t = local;
  switch (name) {
    case "alarm-clock": {
      const sh2 = ringing ? Math.sin(t * 50) * 4 : 0;
      return (
        <svg viewBox="0 0 300 320" width="100%" style={{ overflow: "visible", filter: sh }}>
          <g transform={`rotate(${sh2} 150 170)`}>
            <circle cx={75} cy={60} r={40} fill="#d8d8d0" stroke="#666" strokeWidth={5} /><circle cx={225} cy={60} r={40} fill="#d8d8d0" stroke="#666" strokeWidth={5} />
            <rect x={140} y={40} width={20} height={30} fill="#666" />
            <circle cx={150} cy={170} r={115} fill="#e9e5da" stroke="#555" strokeWidth={10} />
            <circle cx={150} cy={170} r={98} fill="#F6F0DE" />
            {Array.from({ length: 12 }).map((_, i) => <text key={i} x={150 + Math.sin((i + 1) * Math.PI / 6) * 78} y={180 - Math.cos((i + 1) * Math.PI / 6) * 78} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={22} fill="#222">{i + 1}</text>)}
            <line x1={150} y1={170} x2={150 + Math.sin(t * 0.5) * 50} y2={170 - Math.cos(t * 0.5) * 50} stroke="#111" strokeWidth={7} strokeLinecap="round" />
            <line x1={150} y1={170} x2={150 + Math.sin(t * 3) * 75} y2={170 - Math.cos(t * 3) * 75} stroke="#111" strokeWidth={4} strokeLinecap="round" />
            <line x1={80} y1={275} x2={60} y2={310} stroke="#555" strokeWidth={10} /><line x1={220} y1={275} x2={240} y2={310} stroke="#555" strokeWidth={10} />
          </g>
          {ringing ? [0, 1].map((k) => <g key={k} opacity={Math.abs(Math.sin(t * 8 + k))}>
            <path d={`M${20 - k * 25} 60 q -25 50 0 100`} stroke={C.red} strokeWidth={7} fill="none" strokeLinecap="round" />
            <path d={`M${280 + k * 25} 60 q 25 50 0 100`} stroke={C.red} strokeWidth={7} fill="none" strokeLinecap="round" />
          </g>) : null}
        </svg>
      );
    }
    case "phone":
      return (
        <svg viewBox="0 0 260 520" width="100%" style={{ filter: sh }}>
          <rect x={0} y={0} width={260} height={520} rx={36} fill="#1c1c1e" />
          <rect x={14} y={30} width={232} height={460} rx={22} fill={color ?? "#24313a"} />
          <rect x={95} y={14} width={70} height={10} rx={5} fill="#333" />
          {text ? <text x={130} y={110} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={30} fill="#fff">{text}</text> : null}
          {Array.from({ length: Math.min(4, Math.floor(t / 0.4) + 1) }).map((_, i) => (
            <g key={i}><rect x={30} y={150 + i * 80} width={200} height={64} rx={12} fill="#F3EEE2" /><circle cx={55} cy={182 + i * 80} r={10} fill={[C.red, C.mustard, "#3a8a5a", C.red][i]} /><rect x={75} y={172 + i * 80} width={130} height={8} fill="#aaa" /><rect x={75} y={188 + i * 80} width={90} height={8} fill="#ccc" /></g>
          ))}
        </svg>
      );
    case "chai":
      return (
        <svg viewBox="0 0 200 240" width="100%" style={{ filter: sh }}>
          <path d="M20 20 L180 20 L160 230 L40 230 Z" fill="#ffffff55" stroke="#ffffffaa" strokeWidth={4} />
          <path d="M28 70 L172 70 L160 225 L40 225 Z" fill="#C8955A" />
          <ellipse cx={100} cy={70} rx={72} ry={10} fill="#D9A970" />
          {Array.from({ length: 5 }).map((_, i) => <line key={i} x1={30 + i * 35} y1={22} x2={42 + i * 30} y2={228} stroke="#fff" strokeWidth={2} opacity={0.3} />)}
        </svg>
      );
    case "battery": {
      const lvl = Math.min(4, Math.max(0, value ?? Math.floor(clamp01(t / 1.6) * 4.99)));
      const low = lvl <= 1;
      return (
        <svg viewBox="0 0 200 320" width="100%" style={{ filter: sh }}>
          <rect x={70} y={0} width={60} height={30} rx={6} fill="#E8DFC8" stroke="#555" strokeWidth={4} />
          <rect x={10} y={26} width={180} height={290} rx={22} fill="#E8DFC8" stroke="#555" strokeWidth={8} />
          {lvl === 0 ? <rect x={32} y={290} width={136} height={14} rx={4} fill={C.red} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 5))} /> : null}
          {Array.from({ length: lvl }).map((_, i) => <rect key={i} x={32} y={256 - i * 62} width={136} height={48} rx={6} fill={low ? C.red : C.mustard} stroke={low ? "#7a1e14" : "#a37c1c"} strokeWidth={3} />)}
          {text ? <text x={100} y={175} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={70} fill={low ? C.red : "#2b2b2b"}>{text}</text> : null}
        </svg>
      );
    }
    case "stopwatch":
      return (
        <svg viewBox="0 0 220 260" width="100%" style={{ filter: sh }}>
          <rect x={95} y={0} width={30} height={30} fill="#888" /><circle cx={110} cy={150} r={100} fill="#E9E3D2" stroke="#666" strokeWidth={10} />
          <path d={`M110 150 L110 60 A90 90 0 ${t * 40 > 180 ? 1 : 0} 1 ${110 + Math.sin(Math.min(t * 40, 359) * Math.PI / 180) * 90} ${150 - Math.cos(Math.min(t * 40, 359) * Math.PI / 180) * 90} Z`} fill={C.red} opacity={0.75} />
          <line x1={110} y1={150} x2={110 + Math.sin(t * 40 * Math.PI / 180) * 85} y2={150 - Math.cos(t * 40 * Math.PI / 180) * 85} stroke="#111" strokeWidth={5} />
        </svg>
      );
    case "bell":
      return <svg viewBox="-170 -110 340 260" width="100%" style={{ overflow: "visible", filter: sh }}><Bell t={t} ringing={ringing} /></svg>;
    case "switch":
      return (
        <svg viewBox="0 0 200 260" width="100%" style={{ filter: sh }}>
          <circle cx={100} cy={100} r={90} fill="#B9A27A" stroke="#6b5530" strokeWidth={6} />
          <rect x={85} y={text === "ON" ? 20 : 90} width={30} height={90} rx={12} fill="#333" />
          <rect x={40} y={205} width={120} height={50} fill="#F1E9D6" /><text x={100} y={242} textAnchor="middle" fontFamily={MONO_FONT} fontSize={32} fill="#222">{text ?? "OFF"}</text>
        </svg>
      );
    case "lightbulb":
      return (
        <svg viewBox="0 0 200 300" width="100%" style={{ overflow: "visible" }}>
          <circle cx={100} cy={100} r={130} fill="#FFE38A" opacity={0.25 + 0.1 * Math.sin(t * 4)} />
          <circle cx={100} cy={100} r={80} fill="#FFE38A" stroke="#c9a23a" strokeWidth={5} />
          <rect x={65} y={170} width={70} height={70} fill="#9a9a9a" />
        </svg>
      );
    case "question":
    case "exclaim":
      return (
        <svg viewBox="0 0 120 200" width="100%" style={{ overflow: "visible", filter: sh }}>
          <text x={60} y={170} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={190} fill={color ?? C.red} transform={`rotate(${Math.sin(t * 5) * 8} 60 110)`}>{name === "question" ? "?" : "!"}</text>
        </svg>
      );
    case "heart-icon":
      return <svg viewBox="0 0 200 180" width="100%" style={{ filter: sh }}><path d="M100 170 C 20 110 0 70 30 35 C 60 0 100 30 100 50 C 100 30 140 0 170 35 C 200 70 180 110 100 170 Z" fill={color ?? C.red} /></svg>;
    case "moon":
      return <svg viewBox="0 0 200 200" width="100%"><circle cx={100} cy={100} r={90} fill="#F2E7C4" /><circle cx={130} cy={80} r={80} fill="#1b2338" /></svg>;
    case "sun":
      return <svg viewBox="0 0 200 200" width="100%" style={{ overflow: "visible" }}><circle cx={100} cy={100} r={150} fill="#F7D774" opacity={0.2} /><circle cx={100} cy={100} r={90} fill="#F7D774" /></svg>;
    case "shield": {
      const p = clamp01(t / 0.9);
      return (
        <svg viewBox="0 0 800 1000" width="100%" style={{ overflow: "visible" }}>
          <path d="M400 30 L 760 120 L 740 560 C 720 800 560 920 400 980 C 240 920 80 800 60 560 L 40 120 Z" fill="none" stroke="#E8DCC0" strokeWidth={26}
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeLinejoin="round" style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.5))" }} />
        </svg>
      );
    }
    case "pen":
      return <svg viewBox="0 0 600 80" width="100%" style={{ filter: sh }}><rect x={60} y={20} width={520} height={40} rx={18} fill="#E9EEF2" stroke="#9fb0bd" strokeWidth={3} /><rect x={420} y={22} width={160} height={36} rx={16} fill="#2E4FA8" /><polygon points="60,20 0,40 60,60" fill="#d8d0b8" /><polygon points="12,36 0,40 12,44" fill="#2E4FA8" /></svg>;
    case "coffee":
      return <svg viewBox="0 0 260 220" width="100%" style={{ filter: sh }}><path d="M190 80 q 70 0 60 40 q -10 30 -55 25" stroke="#F1E9D6" strokeWidth={20} fill="none" /><circle cx={110} cy={110} r={100} fill="#F1E9D6" stroke={C.red} strokeWidth={8} /><circle cx={110} cy={110} r={78} fill="#6B3E1E" /><circle cx={90} cy={90} r={30} fill="#8a5a33" opacity={0.6} /></svg>;
    case "glasses":
      return <svg viewBox="0 0 300 130" width="100%" style={{ filter: sh }}><circle cx={75} cy={70} r={55} fill="#ffffff22" stroke="#2b2116" strokeWidth={10} /><circle cx={225} cy={70} r={55} fill="#ffffff22" stroke="#2b2116" strokeWidth={10} /><path d="M130 65 q 20 -18 40 0" stroke="#2b2116" strokeWidth={9} fill="none" /></svg>;
    case "ladder":
      return <svg viewBox="0 0 160 600" width="100%" style={{ filter: sh }}><rect x={10} y={0} width={18} height={600} fill="#8a6a44" /><rect x={132} y={0} width={18} height={600} fill="#8a6a44" />{Array.from({ length: 8 }).map((_, i) => <rect key={i} x={20} y={40 + i * 72} width={120} height={14} fill="#a07a4e" />)}</svg>;
    case "paper":
      return <svg viewBox="0 0 300 400" width="100%" style={{ filter: sh }}><rect width={300} height={400} fill="#F6F1E5" />{Array.from({ length: 11 }).map((_, i) => <rect key={i} x={24} y={40 + i * 30} width={250 - (i % 3) * 40} height={7} fill="#cdc4b0" />)}</svg>;
    case "pole":
      return <svg viewBox="0 0 60 1400" width="100%"><rect x={18} y={0} width={24} height={1400} fill="#8d9196" /><rect x={24} y={0} width={6} height={1400} fill="#b9bdc2" /><rect x={6} y={1320} width={48} height={80} fill="#6f7378" /></svg>;
    case "plant":
      return (
        <svg viewBox="0 0 260 300" width="100%" style={{ filter: sh, overflow: "visible" }}>
          {Array.from({ length: 14 }).map((_, i) => {
            const a = -70 + i * 10 + Math.sin(t * 2 + i) * 4;
            return <g key={i} transform={`translate(130,170) rotate(${a})`}><line x1={0} y1={0} x2={0} y2={-110} stroke="#4E7A3A" strokeWidth={4} /><ellipse cx={0} cy={-110} rx={16} ry={26} fill={i % 2 ? "#5E8F45" : "#6FA352"} /></g>;
          })}
          <path d="M60 170 L200 170 L180 290 L80 290 Z" fill="#C46A3D" /><rect x={50} y={160} width={160} height={24} fill="#B55E33" />
        </svg>
      );
    case "book":
      return <Book text={text} />;
    case "charger":
      return <Charger local={local} />;
    case "qr-stand":
      return <QrStand label={text} />;
    default:
      return null;
  }
};
