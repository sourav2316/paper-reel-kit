import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, W, H, DISPLAY_FONT } from "../theme";
import { rand } from "../engine/anim";
import { SkyClouds } from "../components/Bits";
import type { BuiltinSet } from "../engine/types";
import { Showroom, Bank, Iceberg } from "./Sets2";
import { LayeredPaperStage } from "./LayeredPaperStage";
import { Bedroom, Library } from "./Sets3";

type Opts = Record<string, any>;
const svgBox = { position: "absolute" as const, inset: 0 };

const Sky: React.FC<{ to?: number; top?: string; bottom?: string }> = ({ to = H, top = C.skyTop, bottom = "#C9D6CF" }) => (
  <svg width={W} height={to} style={svgBox}>
    <defs><linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient></defs>
    <rect width={W} height={to} fill="url(#sky)" />
  </svg>
);

/** Flat apartment block with balconies + water tanks. */
const Block: React.FC<{ x: number; y: number; w: number; h: number; seed: number; tone?: string }> = ({ x, y, w, h, seed, tone = "#E8E1D3" }) => {
  const floors = Math.floor(h / 95);
  const cols = Math.max(2, Math.floor(w / 110));
  return (
    <g>
      <rect x={x + 10} y={y + 10} width={w} height={h} fill="#000" opacity={0.12} />
      <rect x={x} y={y} width={w} height={h} fill={tone} stroke="#b9ad97" strokeWidth={2} />
      {[0.2, 0.7].map((p, i) => (
        <g key={i}><rect x={x + w * p} y={y - 46} width={44} height={46} rx={6} fill="#2f2f2f" /><rect x={x + w * p - 4} y={y - 8} width={52} height={8} fill="#555" /></g>
      ))}
      {Array.from({ length: floors }).map((_, f) =>
        Array.from({ length: cols }).map((__, c) => {
          const cx = x + 18 + c * ((w - 36) / cols);
          const cy = y + 20 + f * 95;
          const cw = (w - 36) / cols - 16;
          const lit = rand(seed * 31 + f * 7 + c) > 0.5;
          return (
            <g key={`${f}-${c}`}>
              <rect x={cx} y={cy} width={cw} height={58} fill={lit ? "#6d6a63" : "#4a4844"} />
              <rect x={cx - 4} y={cy + 52} width={cw + 8} height={14} fill={rand(seed + f + c) > 0.6 ? C.red : "#cfc6b4"} opacity={0.85} />
              {rand(seed * 3 + f * 2 + c) > 0.65 ? <rect x={cx + 8} y={cy + 36} width={cw * 0.5} height={16} fill={[C.blue, C.mustard, C.red][(f + c) % 3]} /> : null}
            </g>
          );
        })
      )}
    </g>
  );
};

const FarCity: React.FC<{ y: number; color?: string; opacity?: number; seed?: number }> = ({ y, color = "#B7BDB4", opacity = 0.9, seed = 1 }) => (
  <g opacity={opacity}>
    {Array.from({ length: 14 }).map((_, i) => {
      const w = 90 + rand(seed + i) * 110;
      const h = 120 + rand(seed + i * 3) * 260;
      const x = i * 80 - 40;
      return (
        <g key={i}>
          <rect x={x} y={y - h} width={w} height={h + 40} fill={color} stroke="#a3a89e" strokeWidth={1} />
          {Array.from({ length: Math.floor(h / 40) }).map((_, r) => Array.from({ length: Math.floor(w / 30) }).map((__, c) => (
            <rect key={`${r}${c}`} x={x + 10 + c * 30} y={y - h + 14 + r * 40} width={14} height={18} fill="#9fa59a" />
          )))}
        </g>
      );
    })}
  </g>
);

const Road: React.FC<{ y: number; h: number; zebra?: boolean; dashOffset?: number }> = ({ y, h, zebra, dashOffset = 0 }) => (
  <g>
    <rect x={0} y={y} width={W} height={h} fill={C.road} />
    <rect x={0} y={y} width={W} height={h} fill="url(#asphalt)" opacity={0.4} />
    {Array.from({ length: 9 }).map((_, i) => (
      <rect key={i} x={((i * 150 - dashOffset) % (W + 150)) - 50} y={y + h * 0.42} width={80} height={8} fill="#e8e2d0" opacity={0.85} />
    ))}
    {zebra ? Array.from({ length: 8 }).map((_, i) => (
      <rect key={i} x={W * 0.12 - i * 4} y={y + h * 0.62 + i * 26} width={W * 0.76 + i * 8} height={14} fill="#ece6d4" opacity={0.92} />
    )) : null}
    <defs>
      <pattern id="asphalt" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#222" /><circle cx="6" cy="5" r="0.8" fill="#777" /></pattern>
    </defs>
  </g>
);

const Kerb: React.FC<{ y: number }> = ({ y }) => (
  <g>{Array.from({ length: 14 }).map((_, i) => <rect key={i} x={i * 80} y={y} width={80} height={26} fill={i % 2 ? "#2a2a2a" : C.mustard} />)}</g>
);

const Footpath: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <rect x={0} y={y} width={W} height={H - y} fill="#D9C7A8" />
    {Array.from({ length: 8 }).map((_, r) => (
      <g key={r}>
        <rect x={0} y={y + r * 48} width={W} height={46} fill={r % 3 === 1 ? "#C98C6E" : "#DCCBAE"} />
        {Array.from({ length: 10 }).map((__, c) => <line key={c} x1={c * 120 + (r % 2) * 60} x2={c * 120 + (r % 2) * 60} y1={y + r * 48} y2={y + r * 48 + 46} stroke="#b7a383" strokeWidth={2} />)}
      </g>
    ))}
  </g>
);

const Shop: React.FC<{ x: number; y: number; w: number; sign: string; color: string; seed: number }> = ({ x, y, w, sign, color, seed }) => (
  <g>
    <rect x={x} y={y} width={w} height={70} fill={color} stroke="#3a2a1a" strokeWidth={3} />
    <text x={x + w / 2} y={y + 47} fontFamily={DISPLAY_FONT} fontSize={30} fill="#F6EEDB" textAnchor="middle" letterSpacing={1}>{sign}</text>
    <rect x={x} y={y + 70} width={w} height={300} fill="#3b2c22" />
    {Array.from({ length: 5 }).map((_, r) => (
      <g key={r}>
        <rect x={x + 10} y={y + 100 + r * 54} width={w - 20} height={6} fill="#6b5137" />
        {Array.from({ length: Math.floor((w - 20) / 26) }).map((__, c) => (
          <rect key={c} x={x + 14 + c * 26} y={y + 74 + r * 54} width={20} height={26} fill={["#c9a35b", "#8c4a3a", "#d8d2c0", "#5d7a5a", "#b25a3c"][Math.floor(rand(seed + r * 11 + c) * 5)]} />
        ))}
      </g>
    ))}
    <rect x={x - 6} y={y + 60} width={12} height={320} fill="#cfc2a6" />
  </g>
);

export const SetView: React.FC<{ name: BuiltinSet; options?: Opts; tAbs?: number }> = ({ name, options = {}, tAbs = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  switch (name) {
    case "layered-paper-stage": return <LayeredPaperStage time={tAbs} location={options.location} dawn={options.dawn} />;
    case "skyline":
      return (
        <AbsoluteFill>
          <Sky />
          <SkyClouds count={3} top={180} />
          <svg width={W} height={H} style={svgBox}>
            <FarCity y={1250} seed={3} />
            <Block x={-60} y={760} w={380} h={560} seed={1} />
            <Block x={760} y={820} w={380} h={500} seed={2} />
            <rect x={0} y={1290} width={W} height={60} fill="#8a8578" />
            <Road y={1340} h={430} zebra />
            <Kerb y={1770} />
            <rect x={0} y={1796} width={W} height={130} fill="#D9C7A8" />
          </svg>
        </AbsoluteFill>
      );
    case "street": {
      const signs: { text: string; color: string }[] = options.signs ?? [
        { text: "KIRANA STORE", color: "#D9A13B" }, { text: "SHARMA MEDICAL", color: "#2F6B4F" },
        { text: "RAJU CHAI CORNER", color: C.red }, { text: "NEW BHARAT MOBILE", color: "#D97A2B" },
      ];
      const sw = W / signs.length + 40;
      return (
        <AbsoluteFill>
          <Sky to={900} />
          <SkyClouds count={3} top={100} spread={250} />
          <svg width={W} height={H} style={svgBox}>
            <rect x={0} y={560} width={W} height={330} fill="#E5DCCB" />
            {Array.from({ length: 6 }).map((_, i) => (
              <g key={i}>
                <rect x={i * 190 + 20} y={600} width={130} height={90} fill="#5a5651" />
                <rect x={i * 190 + 10} y={688} width={150} height={16} fill="#cfc6b4" />
                <rect x={i * 190 + 30} y={740} width={110} height={70} fill="#6b665e" />
                <rect x={i * 190 + 60} y={540} width={44} height={40} rx={6} fill="#2f2f2f" />
              </g>
            ))}
            {signs.map((s, i) => <Shop key={i} x={i * sw - 40} y={850} w={sw - 12} sign={s.text} color={s.color} seed={i * 17} />)}
            <Kerb y={1218} />
            <Road y={1244} h={380} />
            <Kerb y={1624} />
            <Footpath y={1650} />
          </svg>
        </AbsoluteFill>
      );
    }
    case "balcony":
      return (
        <AbsoluteFill>
          <Sky />
          <SkyClouds count={3} top={60} spread={220} />
          <svg width={W} height={H} style={svgBox}>
            <circle cx={880} cy={760} r={90} fill="#F3D27A" opacity={0.9} />
            <circle cx={880} cy={760} r={140} fill="#F3D27A" opacity={0.2} />
            <FarCity y={1300} color="#C4C2B3" seed={9} />
            <path d={`M-20 640 Q ${W / 2} ${700 + Math.sin(t) * 6} ${W + 20} 640`} stroke="#3a3a3a" strokeWidth={4} fill="none" />
            {[{ x: 60, c: "#E6DCC4", h: 240 }, { x: 200, c: C.red, h: 200, check: true }, { x: 640, c: C.mustard, h: 300 }, { x: 800, c: "#E6DCC4", h: 210 }].map((cl, i) => (
              <g key={i} transform={`rotate(${Math.sin(t * 1.5 + i) * 3} ${cl.x + 60} 660)`}>
                <rect x={cl.x} y={660} width={120} height={cl.h} fill={cl.c} stroke="#00000033" strokeWidth={2} />
                {cl.check ? Array.from({ length: 6 }).map((_, k) => <line key={k} x1={cl.x} x2={cl.x + 120} y1={680 + k * 32} y2={680 + k * 32} stroke="#fff" strokeWidth={6} opacity={0.6} />) : null}
                {cl.check ? Array.from({ length: 4 }).map((_, k) => <line key={k} x1={cl.x + 15 + k * 30} x2={cl.x + 15 + k * 30} y1={660} y2={660 + cl.h} stroke="#fff" strokeWidth={6} opacity={0.6} />) : null}
                <rect x={cl.x + 20} y={652} width={10} height={22} fill="#8b6b3d" /><rect x={cl.x + 90} y={652} width={10} height={22} fill="#8b6b3d" />
              </g>
            ))}
            <rect x={0} y={1270} width={W} height={18} fill="#2F4A3A" />
            {Array.from({ length: 28 }).map((_, i) => <rect key={i} x={i * 40 + 8} y={1288} width={10} height={170} fill="#2F4A3A" />)}
            <rect x={0} y={1350} width={W} height={10} fill="#2F4A3A" />
            <rect x={0} y={1450} width={W} height={50} fill="#C9B590" />
            <rect x={0} y={1500} width={W} height={H - 1500} fill="#DCC9A4" />
          </svg>
        </AbsoluteFill>
      );
    case "anatomy":
      return (
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, ${C.slateLight} 0%, ${C.slate} 55%, #121819 100%)` }}>
          <svg width={W} height={H} style={svgBox} opacity={0.06}>
            {Array.from({ length: 30 }).map((_, i) => <line key={i} x1={0} x2={W} y1={i * 70} y2={i * 70} stroke="#fff" />)}
          </svg>
        </AbsoluteFill>
      );
    case "room": {
      const wall = options.wall ?? "#8E9F78";
      return (
        <AbsoluteFill>
          <svg width={W} height={H} style={svgBox}>
            <rect width={W} height={1330} fill={wall} />
            <rect width={W} height={1330} fill="url(#wallShade)" />
            <rect x={0} y={1060} width={W} height={10} fill="#00000022" />
            <rect x={650} y={600} width={60} height={560} fill="#D7A64A" />
            {Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={680} cy={630 + i * 38} r={5} fill="#a97a22" />)}
            <rect x={720} y={620} width={300} height={430} fill="#4F5A66" stroke="#C7B48C" strokeWidth={14} />
            {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={740 + i * 46} y={630} width={10} height={410} fill="#2c3238" />)}
            <rect x={700} y={590} width={340} height={14} fill="#d8d0bd" />
            <rect x={0} y={1330} width={W} height={H - 1330} fill="#7A2F22" />
            <polygon points={`120,1470 960,1470 1080,1920 0,1920`} fill="#E9DDC4" />
            {Array.from({ length: 9 }).map((_, i) => {
              const y0 = 1470 + i * 52; const y1 = y0 + 26;
              const k0 = (y0 - 1470) / 450, k1 = (y1 - 1470) / 450;
              return <polygon key={i} points={`${120 - 120 * k0},${y0} ${960 + 120 * k0},${y0} ${960 + 120 * k1},${y1} ${120 - 120 * k1},${y1}`} fill={[C.red, "#2F4E6B", C.mustard][i % 3]} />;
            })}
            <defs><linearGradient id="wallShade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0.18" /><stop offset="0.6" stopColor="#000" stopOpacity="0" /></linearGradient></defs>
          </svg>
        </AbsoluteFill>
      );
    }
    case "office":
      return (
        <AbsoluteFill>
          <Sky to={560} />
          <svg width={W} height={H} style={svgBox}>
            <FarCity y={560} color="#C9CCC3" seed={21} />
            {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={i * 230 - 10} y={0} width={20} height={560} fill="#5d6a6c" />)}
            <rect x={0} y={0} width={W} height={40} fill="#e8e3d6" />
            <rect x={0} y={540} width={W} height={30} fill="#d6d0c0" />
            <rect x={0} y={570} width={W} height={720} fill="#7F8C77" />
            {[{ x: 160, y: 700, c: "#F2D46B" }, { x: 860, y: 680, c: "#F2D46B" }, { x: 930, y: 760, c: "#EE9A8E" }].map((n, i) => (
              <g key={i} transform={`rotate(${(i - 1) * 5} ${n.x} ${n.y})`}><rect x={n.x} y={n.y} width={80} height={80} fill={n.c} /><path d={`M${n.x + 15} ${n.y + 40} l12 -10 l12 10 l12 -10 l12 10`} stroke={C.red} strokeWidth={3} fill="none" /></g>
            ))}
            <rect x={0} y={1290} width={W} height={630} fill="#C99A5C" />
            <rect x={0} y={1290} width={W} height={20} fill="#a8783e" />
          </svg>
        </AbsoluteFill>
      );
    case "kitchen":
      return (
        <AbsoluteFill>
          <svg width={W} height={H} style={svgBox}>
            <rect width={W} height={H} fill="#E3C77E" />
            <rect x={600} y={480} width={330} height={420} fill="#9fb7b5" stroke="#3E6B5A" strokeWidth={16} />
            {Array.from({ length: 7 }).map((_, i) => <rect key={i} x={612 + i * 46} y={488} width={9} height={404} fill="#3E6B5A" />)}
            <rect x={20} y={640} width={520} height={14} fill="#8b8b85" />
            {Array.from({ length: 6 }).map((_, i) => <ellipse key={i} cx={70 + i * 34} cy={600} rx={30} ry={42} fill="#dcdcd6" stroke="#9a9a94" strokeWidth={3} />)}
            {Array.from({ length: 4 }).map((_, i) => <rect key={i} x={300 + i * 60} y={570} width={46} height={70} rx={6} fill="#b9bab5" stroke="#8a8a85" strokeWidth={3} />)}
            {Array.from({ length: 14 }).map((_, i) => <rect key={i} x={i * 80} y={1060} width={60} height={60} transform={`rotate(45 ${i * 80 + 30} 1090)`} fill={i % 2 ? "#5b6f86" : "#ece4cf"} />)}
            <rect x={0} y={1130} width={W} height={40} fill="#2f2f2f" />
            <rect x={0} y={1170} width={W} height={750} fill="#9A6A3A" />
            {Array.from({ length: 4 }).map((_, i) => <rect key={i} x={i * 280 + 20} y={1210} width={250} height={620} fill="#A97A46" stroke="#7b5126" strokeWidth={4} />)}
          </svg>
        </AbsoluteFill>
      );
    case "checker-room":
      return (
        <AbsoluteFill>
          <svg width={W} height={H} style={svgBox}>
            <rect width={W} height={1260} fill="#E9D9B5" />
            <rect width={W} height={210} fill={C.sky} />
            {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M${i * 130} 200 v-120 a65 65 0 0 1 130 0 v120`} stroke="#2F4A3A" strokeWidth={10} fill="none" />)}
            <rect x={0} y={190} width={W} height={20} fill="#2F4A3A" />
            {Array.from({ length: 7 }).map((_, r) => Array.from({ length: 10 }).map((__, c) => {
              const y0 = 1260 + Math.pow(r / 7, 1.4) * 660, y1 = 1260 + Math.pow((r + 1) / 7, 1.4) * 660;
              const sp0 = 1 + r * 0.12, sp1 = 1 + (r + 1) * 0.12;
              const x = (k: number, s: number) => W / 2 + (k * 130 - W / 2 - 65) * s;
              return <polygon key={`${r}${c}`} points={`${x(c, sp0)},${y0} ${x(c + 1, sp0)},${y0} ${x(c + 1, sp1)},${y1} ${x(c, sp1)},${y1}`} fill={(r + c) % 2 ? "#C2603D" : "#EBDDBF"} />;
            }))}
          </svg>
        </AbsoluteFill>
      );
    case "night-city":
      return (
        <AbsoluteFill style={{ background: "linear-gradient(#0f1626, #1b2338 60%, #2a2f3d)" }}>
          <svg width={W} height={H} style={svgBox}>
            {Array.from({ length: 70 }).map((_, i) => <circle key={i} cx={rand(i) * W} cy={rand(i + 50) * 1100} r={1.5 + rand(i + 3) * 2} fill="#fff" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))} />)}
            <circle cx={860} cy={340} r={60} fill="#F2E7C4" /><circle cx={860} cy={340} r={110} fill="#F2E7C4" opacity={0.12} />
            {Array.from({ length: 12 }).map((_, i) => {
              const w = 120 + rand(i) * 100, h = 300 + rand(i + 9) * 500, x = i * 95 - 30;
              const off = options.lightsOffFrom ?? 999;
              return (
                <g key={i}>
                  <rect x={x} y={1700 - h} width={w} height={h + 250} fill="#1d2433" stroke="#2c3446" />
                  {Array.from({ length: Math.floor(h / 50) }).map((_, r) => Array.from({ length: Math.floor(w / 34) }).map((__, c) => {
                    const id = i * 100 + r * 10 + c;
                    const on = rand(id) > 0.55 && t < off + rand(id + 1) * 2.5;
                    return <rect key={`${r}${c}`} x={x + 10 + c * 34} y={1700 - h + 16 + r * 50} width={18} height={24} fill={on ? "#F2C46B" : "#2a3142"} />;
                  }))}
                </g>
              );
            })}
            <rect x={0} y={1820} width={W} height={100} fill="#15181f" />
          </svg>
        </AbsoluteFill>
      );
    case "sunrise": {
      const pulse = 1 + Math.sin(t * 1.5) * 0.03;
      return (
        <AbsoluteFill style={{ background: "linear-gradient(#C9A5A8 0%, #EBC08F 45%, #F2D7A4 70%)" }}>
          <SkyClouds count={3} top={120} spread={300} />
          <svg width={W} height={H} style={svgBox}>
            <circle cx={W / 2 + 120} cy={820} r={110 * pulse} fill="#F7D774" /><circle cx={W / 2 + 120} cy={820} r={190 * pulse} fill="#F7D774" opacity={0.18} />
            <FarCity y={1150} color="#D9BFA0" opacity={0.75} seed={41} />
            <path d="M-50 900 Q 200 820 420 1100 L 420 1920 L -50 1920 Z" fill="#7C8C4A" />
            <path d="M1130 880 Q 860 820 660 1100 L 660 1920 L 1130 1920 Z" fill="#6E7F42" />
            <rect x={0} y={1160} width={W} height={800} fill="#8E9A55" />
            <polygon points="470,1160 610,1160 900,1920 180,1920" fill="#CDB58E" opacity={0.9} />
          </svg>
        </AbsoluteFill>
      );
    }
    case "jungle":
      return (
        <AbsoluteFill>
          <Sky />
          <SkyClouds count={2} top={80} spread={200} />
          <svg width={W} height={H} style={svgBox}>
            <rect x={0} y={780} width={W} height={200} fill="#8FA58A" opacity={0.6} />
            {[{ x: 120, y: 620 }, { x: 900, y: 560 }].map((tr, i) => (
              <g key={i} transform={`rotate(${Math.sin(t + i) * 1.2} ${tr.x} ${tr.y + 300})`}>
                <rect x={tr.x - 18} y={tr.y + 120} width={36} height={260} fill="#5a4129" />
                {Array.from({ length: 9 }).map((_, k) => <circle key={k} cx={tr.x + Math.cos(k) * 110 * rand(k + i)} cy={tr.y + Math.sin(k * 2) * 80} r={90 + rand(k * 3 + i) * 40} fill={["#3F6B35", "#4F7D3F", "#35592C"][k % 3]} />)}
              </g>
            ))}
            {Array.from({ length: 140 }).map((_, i) => {
              const x = rand(i) * W, h = 200 + rand(i + 7) * 300, base = 1220 + rand(i + 3) * 60;
              const sw = Math.sin(t * 1.8 + x * 0.01) * 18;
              return <path key={i} d={`M${x} ${base} Q ${x + sw * 0.5} ${base - h / 2} ${x + sw} ${base - h}`} stroke={["#7C8F45", "#5E7436", "#A2A75A"][i % 3]} strokeWidth={6} fill="none" />;
            })}
            <rect x={0} y={1250} width={W} height={670} fill="#9A9A55" />
            {Array.from({ length: 14 }).map((_, i) => <ellipse key={i} cx={rand(i + 20) * W} cy={1320 + rand(i + 30) * 560} rx={40} ry={8} fill="#7E7E45" />)}
          </svg>
        </AbsoluteFill>
      );
    case "lab":
    case "corkboard":
      return (
        <AbsoluteFill style={{ background: C.sage }}>
          <svg width={W} height={H} style={svgBox}>
            {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={i * 92} x2={i * 92} y1={0} y2={H} stroke="#9AAA86" strokeWidth={3} />)}
            {Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={rand(i) * W} cy={rand(i + 5) * 1500} r={3} fill="#8c9b78" />)}
            <rect x={0} y={1560} width={W} height={20} fill="#9a8d70" />
            <rect x={0} y={1580} width={W} height={340} fill="#CFC3A6" />
            {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={i * 120 - 300 + i * 30} x2={i * 120 + i * 60 - 200} y1={1580} y2={1920} stroke="#b4a687" strokeWidth={2} />)}
            {name === "corkboard" ? (
              <g>
                <rect x={110} y={520} width={860} height={940} fill="#000" opacity={0.2} transform="translate(10,14)" />
                <rect x={110} y={520} width={860} height={940} fill="#C49A63" stroke="#8a6436" strokeWidth={18} />
                {Array.from({ length: 160 }).map((_, i) => <circle key={i} cx={130 + rand(i) * 820} cy={540 + rand(i + 99) * 900} r={2} fill="#9c7444" />)}
              </g>
            ) : null}
          </svg>
        </AbsoluteFill>
      );
    case "wood-desk":
      return (
        <AbsoluteFill style={{ background: "#C29361" }}>
          <svg width={W} height={H} style={svgBox}>
            {Array.from({ length: 7 }).map((_, i) => (
              <g key={i}>
                <rect x={i * 160} y={0} width={156} height={H} fill={["#C99C68", "#BE8F5B", "#D2A673"][i % 3]} />
                {Array.from({ length: 6 }).map((__, k) => <path key={k} d={`M${i * 160 + 20 + k * 22} 0 Q ${i * 160 + 40 + k * 22} ${H / 2} ${i * 160 + 15 + k * 22} ${H}`} stroke="#7a4f24" strokeWidth={1.5} fill="none" opacity={0.35} />)}
                <rect x={i * 160 + 156} y={0} width={4} height={H} fill="#5e3b18" />
              </g>
            ))}
            <rect width={W} height={H} fill="url(#deskVig)" />
            <defs><radialGradient id="deskVig" cx="50%" cy="45%" r="75%"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.3" /></radialGradient></defs>
          </svg>
        </AbsoluteFill>
      );
    case "showroom": return <Showroom options={options} />;
    case "bank": return <Bank options={options} />;
    case "iceberg": return <Iceberg options={options} />;
    case "bedroom": return <Bedroom options={options} tAbs={tAbs} />;
    case "library": return <Library options={options} />;
    case "paper":
    default:
      return <AbsoluteFill style={{ background: C.paper }} />;
  }
};
