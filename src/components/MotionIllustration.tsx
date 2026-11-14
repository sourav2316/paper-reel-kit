import React, { useId } from "react";
import { getLength, getPointAtLength } from "@remotion/paths";
import { clamp01 } from "../engine/anim";

export type MotionKind = "shield" | "particle" | "entry" | "route" | "brain" | "stream" | "foliage" | "week" | "year" | "light" | "ball" | "pulse";

const amber = "#e3b23c";
const chalk = "#efe6d2";
const brick = "#c0392b";
const slate = "#1f2a2c";
const route = "M 84,544 C 116,493 199,488 243,431 C 288,371 217,353 238,290 C 258,227 321,223 326,165 S 351,103 339,55";
const length = getLength(route);
const brainPath = "M135 152 C92 148 67 118 77 86 C58 46 101 19 123 25 C146 -4 188 6 203 20 C231 0 259 11 278 27 C312 17 343 38 345 70 C379 93 360 125 331 144 C307 174 244 168 225 159 C211 183 179 187 168 169 Z";

const Capsule = ({ x = 0, y = 0, angle = 0, scale = 1, fill }: {x?: number; y?: number; angle?: number; scale?: number; fill: string}) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    {Array.from({length: 13}, (_, i) => (
      <g key={i} stroke={chalk} strokeWidth="2" opacity=".75">
        <path d={`M${i * 9 - 54},-29 v-7 m0,65 v7`}/><circle cx={i * 9 - 54} cy="-37" r="1.6"/><circle cx={i * 9 - 54} cy="37" r="1.6"/>
      </g>
    ))}
    <path d="M-55,-30 H29 A30,30 0 0 1 29,30 H-55Z" fill={fill} stroke={chalk} strokeWidth="3"/>
    <path d="M-49 0 C-30 -21 -14 20 4 0 S39 -16 48 0" fill="none" stroke={chalk} strokeWidth="4" opacity=".72"/>
  </g>
);

const Brain = ({ x, y, scale, glow }: {x: number; y: number; scale: number; glow: number}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M230 142 Q239 200 271 208 L251 159Z" fill={brick} stroke={chalk} strokeWidth="3"/>
    <path d={brainPath} fill={glow > .5 ? brick : "#985f49"} stroke={chalk} strokeWidth="4"/>
    {[0,1,2,3,4,5].map(i => (
      <path key={i} d="M0 0 q10 -34 42 -17 q34 16 25 38 q-9 21 -38 15" transform={`translate(${98 + i * 38} ${i % 2 ? 108 : 72}) rotate(${i % 2 ? -24 : 25})`} fill="none" stroke={chalk} strokeWidth="3" opacity={.45 + glow * .4}/>
    ))}
  </g>
);

export const MotionIllustration: React.FC<{ kind: MotionKind; local: number; dur?: number; tone?: string }> = ({kind, local, dur = 2.5, tone}) => {
  const id = useId();
  const p = clamp01(local / dur);
  const wave = Math.sin(local * 4);
  const gold = `url(#${id}-gold)`;
  const metal = `url(#${id}-metal)`;
  const glow = `url(#${id}-glow)`;
  const pulse = .6 + .4 * Math.sin(local * 8);
  const at = getPointAtLength(route, length * p) ?? {x: 84, y: 544};
  const height = kind === "route" ? 600 : kind === "stream" ? 390 : 400;

  const picture: Record<MotionKind, () => React.ReactNode> = {
    shield: () => <>
      <circle cx="200" cy="207" r={142 + wave * 6} fill="none" stroke={amber} strokeWidth="2" strokeDasharray="2 12" opacity=".55"/>
      {[0,1,2,3,4,5].map(i => {
        const offset = (local * .67 + i * .23) % 1;
        const side = i % 2 ? 1 : -1;
        return <g key={i} opacity={Math.sin(offset * Math.PI)}><Capsule x={200 + side * (199 - 107 * Math.sin(offset * Math.PI))} y={92 + 41 * i + offset * 58} angle={side * (50 + 80 * offset)} scale={.17} fill={gold}/></g>;
      })}
      <g transform={`translate(0 ${wave * 4})`}>
        <path d="M200 65 Q251 96 309 93 L299 227 Q286 293 200 350 Q114 293 101 227 L91 93 Q149 96 200 65Z" fill="#804721" stroke="#683b2b" strokeWidth="13"/>
        <path d="M200 54 Q251 85 309 82 L299 216 Q286 282 200 339 Q114 282 101 216 L91 82 Q149 85 200 54Z" fill={gold} stroke={chalk} strokeWidth="6"/>
        <path d="M200 76 Q250 100 285 102 L280 205 Q268 266 200 310 Q132 266 120 205 L115 102 Q150 100 200 76Z" fill={metal} stroke={slate} strokeWidth="4"/>
        <path d="m147 193 39 38 74 -86" fill="none" stroke={chalk} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - clamp01(local / .58)}/>
      </g>
    </>,
    particle: () => <>
      <circle cx="200" cy="200" r="184" fill={glow}/>
      {[100,147,177].map(r => <circle key={r} cx="200" cy="200" r={r} fill="none" stroke={amber} opacity=".38" strokeDasharray="3 9"/>)}
      {Array.from({length: 9}, (_, i) => {
        const a = (i * 2 * Math.PI / 9) + local * .61;
        return <Capsule key={i} x={200 + 150 * Math.cos(a)} y={200 + 127 * Math.sin(a)} angle={a * 55} scale={.14 + .06 * Math.sin(a)} fill={metal}/>;
      })}
      <Capsule x={200} y={200 + 8 * wave} angle={-33 + local * 32} scale={1.82 + .12 * wave} fill={gold}/>
    </>,
    entry: () => <>
      <path d="M-5 115 Q69 93 140 120 T243 122 Q259 124 260 153 Q278 127 291 122 T410 108 V318 H0Z" fill="#aa674d" stroke={chalk} strokeWidth="4"/>
      <path d="M0 210 Q72 175 151 205 T400 195 V293 H0Z" fill="#dd9166"/>
      <path d="M0 278 Q97 249 188 281 T400 257 V406 H0Z" fill="#9d6d40"/>
      {[0,1,2].map(i => <path key={i} d={`M-30 ${330 + i * 16} Q130 ${284 + i * 7} 230 327 T425 ${298 + i * 14}`} fill="none" stroke={chalk} strokeOpacity=".65" strokeWidth="3"/>)}
      <path d={tone === "deep" ? "M251 118 L239 268 262 249 285 119" : "M251 116 L260 151 284 119"} stroke={brick} strokeWidth="7" fill="#62392b"/>
      <Capsule x={267 - p * 35} y={119 + p * 185} angle={77} scale={.32} fill={gold}/>
      <circle cx={267 - p * 35} cy={119 + p * 185} r={25 + wave * 6} fill="none" stroke={chalk} opacity=".65"/>
    </>,
    route: () => {
      const focus = Math.max(0, Math.sin(p * Math.PI));
      const zoom = 1 + .72 * focus;
      return <svg x="0" y="0" width="400" height="600" viewBox="0 0 400 600" overflow="visible">
        <g transform={`translate(${-at.x * (zoom-1)} ${-at.y * (zoom-1)}) scale(${zoom})`}>
          <path d="M270 196 Q295 144 290 101 Q255 57 289 20 Q342 -7 385 31 Q410 69 383 114 L383 169 Q416 202 438 259 L452 603 H149 L142 539 93 586 Q61 595 54 559 L172 338 Q198 278 270 196Z" fill={metal} opacity=".7" stroke={chalk} strokeWidth="2"/>
          {[0,1,2,3].map(i => <path key={i} d={`M${59 + i * 7} 544 Q120 ${480 - i * 10} 237 430 Q266 ${318 + i * 2} 242 298 Q250 244 ${290 + i * 8} 221 Q325 173 349 ${114 + i * 9}`} fill="none" stroke={chalk} strokeWidth="2" opacity=".4"/>)}
          <path d={route} fill="none" stroke={amber} strokeWidth="12" opacity=".18"/>
          <path d={route} fill="none" stroke={amber} strokeWidth="4" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p}/>
          <Brain x={267} y={16} scale={.32} glow={clamp01((p - .77) / .22) * pulse}/>
          <circle cx={at.x} cy={at.y} r={28 + wave * 6} fill={glow}/>
          <Capsule x={at.x} y={at.y} scale={.24} angle={-48} fill={gold}/>
        </g>
      </svg>;
    },
    brain: () => <>
      <circle cx="200" cy="207" r={100 + 70 * p} fill={glow}/>
      <g transform={`translate(200 200) scale(${.85 + .17 * p}) translate(-200 -200)`}>
        <Brain x={-18} y={105} scale={1.04} glow={p * pulse}/>
        {Array.from({length: 16}, (_, i) => {
          const a = i * Math.PI / 8, travel = clamp01(p * 1.7 - i * .028);
          return <circle key={i} cx={200 + Math.cos(a) * 137 * travel} cy={182 + Math.sin(a) * 72 * travel} r={3 + (i % 3)} fill={amber} opacity={travel * (1.15 - p * .4)}/>;
        })}
      </g>
    </>,
    stream: () => <>
      {[0,1,2,3,4].map(i => <path key={i} d={`M${185 + i * 7} 4 Q${198 + i * 9 + wave * 8} 114 ${157 + i * 8} 260`} fill="none" stroke={i % 2 ? chalk : "#c0e4e7"} strokeWidth={4 + i % 3} strokeOpacity=".78" strokeDasharray={`${48 + i * 8} 11 13 9`} strokeDashoffset={-local * (260 + i * 22)}/>)}
      {Array.from({length: 24}, (_, i) => {
        const k = (local * (1.1 + (i % 4) * .2) + i * .171) % 1;
        return <ellipse key={i} cx={178 + Math.cos(i * 9) * k * (60 + i * 3)} cy={257 - 116 * k + 168 * k * k} rx={2 + i % 3} ry={4 + i % 4} opacity={.9 * (1 - k)} fill={chalk}/>;
      })}
    </>,
    foliage: () => <g transform={`rotate(${wave * 4} 399 195)`}>
      <path d="M417 198 Q264 167 35 108" fill="none" stroke="#5d4926" strokeWidth="8"/>
      {Array.from({length: 17}, (_, i) => {
        const x = 20 + i * 23, y = 98 + i * 5, turn = i % 2 === 0 ? -63 : 52;
        return <g key={i} transform={`translate(${x} ${y}) rotate(${turn + Math.sin(local * 4 + i) * 8})`}><path d="M0 0 Q-22 -19 -17 -52 Q27 -55 25 -28 Q18 -10 0 0" fill={["#65754b","#9a9f57","#a68b45"][i % 3]} stroke="#b9c6a3" strokeWidth="1.2"/><path d="M0 0 Q11 -20 13 -44" fill="none" stroke="#4c5938" strokeWidth="1.8"/></g>;
      })}
    </g>,
    week: () => <>
      {Array.from({length: 7}, (_, i) => {
        const x = 39 + (i % 4) * 86, y = 97 + Math.floor(i / 4) * 100, progress = clamp01(p * 8 - i);
        return <g key={i} transform={`translate(${x} ${y + 20 * (1 - progress)}) rotate(${(i % 3 - 1) * 4})`}>
          <rect x="3" y="7" width="70" height="81" fill="#41352b" opacity=".5"/>
          <rect width="70" height="81" fill={progress > .5 ? chalk : "#d5c6ab"}/><path d="M0 0H70V16H0Z" fill={brick}/>
          <text x="35" y="59" fill={slate} textAnchor="middle" fontFamily="Georgia" fontSize="38" fontWeight="bold">{i+1}</text>
        </g>;
      })}
    </>,
    year: () => <>
      <circle cx="200" cy="200" r="140" fill={metal} stroke={chalk} strokeWidth="2"/>
      {Array.from({length: 12}, (_, i) => {
        const angle = (i / 12 * 360) - 90;
        const a = angle * Math.PI / 180;
        return <g key={i} transform={`translate(${200+143*Math.cos(a)} ${200+143*Math.sin(a)}) rotate(${angle+90})`} opacity={clamp01(p * 16 - i) * .65 + .35}><rect x="-18" y="-25" width="36" height="50" fill={["#b9c6a3",amber,"#b7774d","#8fb3d9"][Math.floor(i/3)]} stroke={chalk}/><path d="M-10 -14H10 M-10 -7H10 M-10 0H10" stroke={slate}/></g>;
      })}
      <text x="200" y="217" fill={chalk} textAnchor="middle" fontFamily="Georgia" fontSize="38" fontWeight="bold">12 MAHINE</text>
    </>,
    light: () => <ellipse cx={170 + wave * 47} cy="200" rx="175" ry="128" fill={glow} opacity=".55" transform="rotate(-31 170 200)"/>,
    ball: () => <g transform={`translate(200 ${213 - Math.abs(wave) * 28}) rotate(${local * 185})`}><circle r="53" fill={gold} stroke={chalk} strokeWidth="3"/><path d="M-46 27 Q-17 -20 45 -24 M-35 -40 Q12 -33 43 31" fill="none" stroke={brick} strokeWidth="11"/></g>,
    pulse: () => <>{[0,1,2].map(i => {const k = (local * .65 + i / 3) % 1; return <circle key={i} cx="200" cy="200" r={30 + k * 150} stroke={tone ?? amber} strokeWidth={2 + 7 * (1-k)} fill="none" opacity={1-k}/>;})}<circle cx="200" cy="200" r="53" fill={glow}/></>,
  };

  return <svg viewBox={`0 0 400 ${height}`} width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop stopColor="#f1c974"/><stop offset=".48" stopColor="#ce8b32"/><stop offset="1" stopColor="#96513b"/></linearGradient>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop stopColor="#567977"/><stop offset="1" stopColor="#1b3d3c"/></linearGradient>
      <radialGradient id={`${id}-glow`}><stop stopColor={tone && tone.startsWith("#") ? tone : amber} stopOpacity=".56"/><stop offset="1" stopColor={amber} stopOpacity="0"/></radialGradient>
    </defs>
    {picture[kind]()}
  </svg>;
};
