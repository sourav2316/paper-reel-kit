import React from "react";
import { DISPLAY_FONT } from "../theme";

/**
 * Human figure in two styles:
 *  - "paper" (default): paper-cutout person — skin, hair, shirt, pants, simple face, white cut border + drop shadow
 *  - "silhouette": dark mannequin with a coloured rim light
 * Poses: stand, walk, slump, stretch, sit-phone, sit-desk, lie-phone, sleep, lie-awake.
 */
export type Pose = "stand" | "walk" | "slump" | "stretch" | "sit-phone" | "sit-desk" | "lie-phone" | "sleep" | "lie-awake";
type Part = "skin" | "shirt" | "pants" | "shoe";
type P = [number, number];

const rot = (o: P, p: P, deg: number): P => {
  const r = (deg * Math.PI) / 180, dx = p[0] - o[0], dy = p[1] - o[1];
  return [o[0] + dx * Math.cos(r) - dy * Math.sin(r), o[1] + dx * Math.sin(r) + dy * Math.cos(r)];
};

const Phone: React.FC<{ x: number; y: number; rotate?: number; t: number; w?: number }> = ({ x, y, rotate = 0, t, w = 46 }) => (
  <g transform={`translate(${x},${y}) rotate(${rotate})`}>
    <circle r={w * 2.2} fill="#8FD3FF" opacity={0.18 + 0.05 * Math.sin(t * 9)} />
    <rect x={-w / 2 - 4} y={-w * 0.9 - 4} width={w + 8} height={w * 1.8 + 8} rx={9} fill="#FBF6EC" />
    <rect x={-w / 2} y={-w * 0.9} width={w} height={w * 1.8} rx={7} fill="#111" />
    <rect x={-w / 2 + 4} y={-w * 0.9 + 5} width={w - 8} height={w * 1.8 - 10} rx={4} fill="#BFE8FF" opacity={0.85 + 0.15 * Math.sin(t * 13)} />
  </g>
);

export const Figure: React.FC<{
  pose: Pose; local: number; style?: "paper" | "silhouette";
  skin?: string; hair?: string; shirt?: string; pants?: string; color?: string; rim?: string; blanket?: string;
}> = ({ pose, local, style = "paper", skin = "#C68B59", hair = "#2B1E17", shirt = "#2F6B8F", pants = "#2E3442", color = "#1E1B2E", rim = "#7FA8D9", blanket = "#3b4f7a" }) => {
  const t = local;
  const breathe = Math.sin(t * 2.2) * 2;
  const paper = style === "paper";
  const partColor: Record<Part, string> = paper ? { skin, shirt, pants, shoe: "#1d1d1d" } : { skin: color, shirt: color, pants: color, shoe: color };
  let headC: P = [0, 0], headR = 0;

  const build = (col: (p: Part) => string, extra: number) => {
    const L: React.ReactNode[] = [];
    const head = (c: P, r: number) => { headC = c; headR = r; L.push(<circle key={`h${extra}`} cx={c[0]} cy={c[1]} r={r + extra / 2} fill={col("skin")} />); };
    const add = (a: P, b: P, w: number, part: Part, k: string) =>
      L.push(<line key={k + extra} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={col(part)} strokeWidth={w + extra} strokeLinecap="round" />);
    switch (pose) {
      case "stand": case "slump": case "stretch": case "walk": {
        const slump = pose === "slump" ? 1 : 0;
        const hip: P = [200, 290], neck: P = [200 + slump * 14, 128 + slump * 20 + breathe];
        const sw = pose === "walk" ? Math.sin(t * 6) * 26 : 0;
        const hL: P = [hip[0] - 18, hip[1]], hR: P = [hip[0] + 18, hip[1]];
        const kneeL = rot(hL, [180, 385], sw), kneeR = rot(hR, [220, 385], -sw);
        const footL = rot(kneeL, [kneeL[0] - 2, kneeL[1] + 95], sw * 0.6), footR = rot(kneeR, [kneeR[0] + 2, kneeR[1] + 95], -sw * 0.6);
        add(hL, kneeL, 42, "pants", "tl"); add(kneeL, footL, 38, "pants", "sl");
        add(hR, kneeR, 42, "pants", "tr"); add(kneeR, footR, 38, "pants", "sr");
        add([footL[0] - 6, footL[1] + 4], [footL[0] - 30, footL[1] + 6], 22, "shoe", "fL");
        add([footR[0] + 6, footR[1] + 4], [footR[0] + 30, footR[1] + 6], 22, "shoe", "fR");
        add([neck[0], neck[1] - 14], neck, 26, "skin", "neck");
        add(neck, hip, 78, "shirt", "torso");
        const shL: P = [neck[0] - 42, neck[1] + 18], shR: P = [neck[0] + 42, neck[1] + 18];
        add(shL, shR, 36, "shirt", "shoulders");
        if (pose === "stretch") {
          const up = Math.sin(t * 1.5) * 6;
          add(shL, [140, 60 - up], 30, "shirt", "al"); add([140, 60 - up], [128, -20 - up], 24, "skin", "fl");
          add(shR, [260, 60 - up], 30, "shirt", "ar"); add([260, 60 - up], [272, -20 - up], 24, "skin", "fr");
        } else {
          const as = pose === "walk" ? -sw * 0.8 : 0;
          const eL = rot(shL, [shL[0] - 8 + slump * 18, shL[1] + 80], as), eR = rot(shR, [shR[0] + 8 + slump * 8, shR[1] + 80], -as);
          add(shL, eL, 30, "shirt", "al"); add(eL, rot(eL, [eL[0] - 2 + slump * 22, eL[1] + 76], as), 24, "skin", "fl");
          add(shR, eR, 30, "shirt", "ar"); add(eR, rot(eR, [eR[0] + 2 + slump * 12, eR[1] + 76], -as), 24, "skin", "fr");
        }
        head([200 + slump * 26, 78 + slump * 42 + breathe], 40);
        break;
      }
      case "sit-phone": case "sit-desk": {
        const desk = pose === "sit-desk";
        const hip: P = [170, 320], neck: P = [205, 175 + breathe];
        add(hip, [290, 330], 44, "pants", "thigh"); add([290, 330], [292, 450], 38, "pants", "shin");
        add([292, 452], [322, 456], 22, "shoe", "foot");
        add([neck[0] + 8, neck[1] - 16], neck, 26, "skin", "neck");
        add(neck, hip, 76, "shirt", "torso");
        const sh: P = [210, 190];
        if (desk) {
          const tap = Math.sin(t * 14) * 3;
          add(sh, [262, 265], 32, "shirt", "ua"); add([262, 265], [335, 270 + tap], 26, "skin", "fa");
        } else {
          add(sh, [258, 270], 32, "shirt", "ua"); add([258, 270], [282, 215], 26, "skin", "fa");
        }
        head([232, 125 + breathe], 38);
        break;
      }
      case "lie-phone": case "sleep": case "lie-awake": {
        if (pose === "lie-phone") {
          const sh: P = [165, 175];
          add(sh, [205, 110], 30, "shirt", "ua"); add([205, 110], [190, 62], 24, "skin", "fa");
        }
        head([110, 170 + breathe * 0.3], 40);
        break;
      }
    }
    return L;
  };

  const isLying = pose === "lie-phone" || pose === "sleep" || pose === "lie-awake";
  const vb = isLying ? "0 0 600 320" : "0 -40 400 540";
  const body = build((p) => partColor[p], 0);
  const outline = paper ? build(() => "#FBF6EC", 16) : build(() => rim, 7);

  // hair + face (paper style only)
  const [cx, cy] = headC, r = headR;
  const side = pose === "sit-phone" || pose === "sit-desk";
  const hairRot = isLying ? -90 : side ? -20 : 0;
  const face = paper ? (
    <g>
      <g transform={`rotate(${hairRot} ${cx} ${cy})`}>
        <path d={`M${cx - r - 2} ${cy + 4} A ${r + 2} ${r + 2} 0 0 1 ${cx + r + 2} ${cy + 4} Q ${cx + r * 0.2} ${cy - r * 0.45} ${cx - r * 0.5} ${cy - r * 0.1} Q ${cx - r * 0.85} ${cy + 2} ${cx - r - 2} ${cy + 4} Z`} fill={hair} />
      </g>
      {pose === "sleep" ? (
        <g stroke="#2b1e17" strokeWidth={4} fill="none" strokeLinecap="round">
          <path d={`M${cx + r * 0.05} ${cy - r * 0.45} q 8 6 16 0`} /><path d={`M${cx + r * 0.05} ${cy - r * 0.05} q 8 6 16 0`} />
        </g>
      ) : isLying ? (
        <g fill="#1d1410"><circle cx={cx + r * 0.3} cy={cy - r * 0.35} r={5} /><circle cx={cx + r * 0.3} cy={cy + r * 0.05} r={5} /></g>
      ) : side ? (
        <g fill="#1d1410"><circle cx={cx + r * 0.5} cy={cy + r * 0.05} r={5} /></g>
      ) : pose === "slump" ? (
        <g stroke="#1d1410" strokeWidth={4} strokeLinecap="round"><line x1={cx - r * 0.42} y1={cy + r * 0.2} x2={cx - r * 0.16} y2={cy + r * 0.2} /><line x1={cx + r * 0.16} y1={cy + r * 0.2} x2={cx + r * 0.42} y2={cy + r * 0.2} /></g>
      ) : (
        <g fill="#1d1410"><circle cx={cx - r * 0.3} cy={cy + r * 0.1} r={5} /><circle cx={cx + r * 0.3} cy={cy + r * 0.1} r={5} />
          <path d={`M${cx - r * 0.18} ${cy + r * 0.45} q ${r * 0.18} ${r * 0.14} ${r * 0.36} 0`} stroke="#7a3b2a" strokeWidth={3} fill="none" /></g>
      )}
    </g>
  ) : null;

  return (
    <svg viewBox={vb} width="100%" style={{ overflow: "visible" }}>
      {isLying ? <ellipse cx={110} cy={205} rx={95} ry={34} fill="#E8E4F2" opacity={0.9} /> : null}
      {pose === "sit-phone" || pose === "sit-desk" ? (
        <g>
          <rect x={110} y={330} width={150} height={26} rx={8} fill="#3a2f2a" />
          <rect x={120} y={356} width={14} height={110} fill="#2a221e" /><rect x={236} y={356} width={14} height={110} fill="#2a221e" />
          <rect x={92} y={190} width={26} height={166} rx={10} fill="#3a2f2a" />
        </g>
      ) : null}
      {pose === "sit-desk" ? (
        <g>
          <rect x={300} y={278} width={150} height={18} fill="#6e4f35" /><rect x={430} y={296} width={14} height={170} fill="#5a3f2a" />
          <path d="M318 278 L 392 278 L 400 216 L 326 216 Z" fill="#222" />
          <path d="M324 274 L 388 274 L 395 221 L 331 221 Z" fill="#BFE8FF" opacity={0.8 + 0.2 * Math.sin(local * 11)} />
          <circle cx={360} cy={250} r={110} fill="#8FD3FF" opacity={0.12} />
        </g>
      ) : null}
      <g style={paper ? { filter: "drop-shadow(6px 10px 7px rgba(0,0,0,0.35))" } : undefined}>
        <g transform={paper ? undefined : "translate(3,-3)"} opacity={paper ? 1 : 0.9}>{outline}</g>
        <g>{body}</g>
        {face}
      </g>
      {isLying ? (
        <path d={`M150 ${190 + Math.sin(local * 2.2) * 2} C 210 ${150 + Math.sin(local * 2.2) * 3}, 420 ${150}, 560 200 L 590 300 L 140 300 Z`} fill={blanket} stroke={paper ? "#FBF6EC" : "#00000033"} strokeWidth={paper ? 8 : 4} />
      ) : null}
      {pose === "lie-phone" ? <Phone x={190} y={40} rotate={-15} t={local} /> : null}
      {pose === "sit-phone" ? <Phone x={290} y={196} rotate={-25} t={local} w={40} /> : null}
      {pose === "lie-phone" || pose === "sit-phone" ? <circle cx={pose === "lie-phone" ? 120 : 236} cy={pose === "lie-phone" ? 160 : 125} r={44} fill="#8FD3FF" opacity={0.2} /> : null}
      {pose === "sleep" ? [0, 1, 2].map((k) => {
        const p = (local * 0.6 + k / 3) % 1;
        return <text key={k} x={150 + p * 90} y={120 - p * 110} fontFamily={DISPLAY_FONT} fontSize={30 + p * 26} fill="#E9E4FF" opacity={Math.sin(p * Math.PI)}>Z</text>;
      }) : null}
    </svg>
  );
};
