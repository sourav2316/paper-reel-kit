import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, W, H, DISPLAY_FONT, MONO_FONT } from "../theme";
import { rand } from "../engine/anim";

type Opts = Record<string, any>;
const box = { position: "absolute" as const, inset: 0 };

/** Phone / electronics showroom: spotlit wall shelves with boxes, swinging sale banner, glass display counter. */
export const Showroom: React.FC<{ options?: Opts }> = ({ options = {} }) => {
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const banner: string = options.banner ?? "MEGA SALE";
  const banner2: string | undefined = options.banner2;
  const sw = Math.sin(t * 1.4) * 2.2;
  const by: number = options.bannerY ?? 520; // banner top (keeps the headline zone clear)
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={box}>
        <defs>
          <linearGradient id="srWall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#E9DCC1" /><stop offset="1" stopColor="#D8C6A3" /></linearGradient>
          <radialGradient id="spot" cx="50%" cy="0%" r="100%"><stop offset="0" stopColor="#FFF6DC" stopOpacity="0.75" /><stop offset="1" stopColor="#FFF6DC" stopOpacity="0" /></radialGradient>
          <linearGradient id="glass" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#CFE3E6" stopOpacity="0.9" /><stop offset="1" stopColor="#9FC0C6" stopOpacity="0.55" /></linearGradient>
        </defs>
        <rect width={W} height={1300} fill="url(#srWall)" />
        {/* vertical wall panels */}
        {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={i * 180 + 4} y={70} width={172} height={1230} fill="none" stroke="#c9b48c" strokeWidth={3} opacity={0.6} />)}
        {/* ceiling + track lights */}
        <rect width={W} height={70} fill="#3a352d" />
        {[160, 420, 680, 940].map((x, i) => (
          <g key={i}>
            <polygon points={`${x - 30},70 ${x + 30},70 ${x + 230},1250 ${x - 230},1250`} fill="url(#spot)" opacity={0.55 + 0.05 * Math.sin(t * 2 + i)} />
            <rect x={x - 22} y={60} width={44} height={34} rx={6} fill="#222" /><circle cx={x} cy={94} r={12} fill="#FFF2C8" />
          </g>
        ))}
        {/* shelves with phone boxes + display phones */}
        {[600, 820, 1040].map((y, r) => (
          <g key={r}>
            <rect x={40} y={y} width={1000} height={16} fill="#8a6a44" /><rect x={40} y={y + 16} width={1000} height={8} fill="#5e4422" opacity={0.6} />
            {Array.from({ length: 9 }).map((_, k) => {
              const x = 70 + k * 108, phone = (k + r) % 3 === 0;
              const col = ["#2F4E6B", "#C0392B", "#2b2b2b", "#E3B23C", "#3a6a5a"][Math.floor(rand(r * 13 + k) * 5)];
              return phone ? (
                <g key={k}><rect x={x + 12} y={y - 150} width={70} height={140} rx={12} fill="#1d1d20" /><rect x={x + 17} y={y - 143} width={60} height={124} rx={8} fill={["#5d8fb3", "#c98f5d", "#7d6bb0"][k % 3]} /><rect x={x + 22} y={y - 12} width={50} height={12} fill="#aaa" /></g>
              ) : (
                <g key={k}><rect x={x + 6} y={y - 120} width={84} height={120} fill={col} stroke="#00000033" /><rect x={x + 18} y={y - 96} width={60} height={70} rx={8} fill="#ffffff22" /><rect x={x + 16} y={y - 18} width={64} height={6} fill="#ffffff55" /></g>
              );
            })}
          </g>
        ))}
        {/* hanging banner(s) */}
        <g transform={`rotate(${sw} ${W / 2} 70)`}>
          <line x1={W / 2 - 300} y1={70} x2={W / 2 - 300} y2={by} stroke="#555" strokeWidth={3} /><line x1={W / 2 + 300} y1={70} x2={W / 2 + 300} y2={by} stroke="#555" strokeWidth={3} />
          <path d={`M${W / 2 - 360} ${by} h720 v140 l-40 30 l-40 -30 l-40 30 l-40 -30 l-40 30 l-40 -30 l-40 30 l-40 -30 l-40 30 l-40 -30 l-40 30 l-40 -30 l-40 30 l-40 -30 l-40 30 l-40 -30 l-40 30 l-40 -30 z`} fill={C.red} stroke="#7a1e14" strokeWidth={3} />
          <text x={W / 2} y={by + 105} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={96} fill="#FBF2DD" letterSpacing={4}>{banner}</text>
        </g>
        {banner2 ? (
          <g transform={`rotate(${-sw * 1.3} ${W - 170} 70)`}>
            <line x1={W - 170} y1={70} x2={W - 170} y2={by + 260} stroke="#555" strokeWidth={3} />
            <circle cx={W - 170} cy={by + 350} r={95} fill={C.mustard} stroke="#7a5a10" strokeWidth={4} />
            <text x={W - 170} y={by + 368} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={44} fill={C.red}>{banner2}</text>
          </g>
        ) : null}
        {/* glass display counter */}
        <rect x={0} y={1290} width={W} height={630} fill="#7A2F22" />
        <rect x={0} y={1290} width={W} height={26} fill="#E9E2D2" />
        <rect x={30} y={1330} width={W - 60} height={300} fill="url(#glass)" stroke="#e6f1f2" strokeWidth={4} />
        {Array.from({ length: 7 }).map((_, k) => (
          <g key={k}><rect x={70 + k * 140} y={1430} width={80} height={150} rx={12} fill="#1d1d20" /><rect x={76 + k * 140} y={1437} width={68} height={136} rx={8} fill={["#5d8fb3", "#c98f5d", "#7d6bb0", "#4f8f6a"][k % 4]} />
            <rect x={60 + k * 140} y={1590} width={100} height={20} rx={4} fill="#F4ECD9" /></g>
        ))}
        <rect x={30} y={1330} width={W - 60} height={300} fill="#fff" opacity={0.12} />
        <path d="M60 1340 L 260 1340 L 120 1620 L 40 1620 Z" fill="#fff" opacity={0.18} />
        <rect x={0} y={1660} width={W} height={10} fill="#5e2018" />
        {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={i * 100} x2={i * 100} y1={1670} y2={1920} stroke="#5e2018" strokeWidth={4} opacity={0.5} />)}
      </svg>
    </AbsoluteFill>
  );
};

/** Bank hall: teller windows with signs, LED token board, ceiling fan, wall clock, wooden counter, rope barrier. */
export const Bank: React.FC<{ options?: Opts }> = ({ options = {} }) => {
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const windows: string[] = options.windows ?? ["LOANS", "EMI", "CASH"];
  const token = `A-${String(27 + Math.floor(t / 2.5)).padStart(2, "0")}`;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={box}>
        <rect width={W} height={H} fill="#C9D2C0" />
        <rect y={0} width={W} height={60} fill="#e8e3d6" />
        {/* ceiling fan */}
        <g transform={`translate(${W / 2},90)`}>
          <line x1={0} y1={-30} x2={0} y2={0} stroke="#555" strokeWidth={8} />
          <g transform={`rotate(${t * 900})`} opacity={0.75}>
            {[0, 120, 240].map((a) => <ellipse key={a} cx={0} cy={0} rx={190} ry={16} fill="#8a7a64" transform={`rotate(${a}) translate(100,0)`} />)}
          </g>
          <circle r={26} fill="#6b5a44" />
        </g>
        {/* wall clock */}
        <g transform="translate(150,500)">
          <circle r={50} fill="#F6F0DE" stroke="#5e4422" strokeWidth={8} />
          <line x1={0} y1={0} x2={Math.sin(t * 0.3) * 40} y2={-Math.cos(t * 0.3) * 40} stroke="#222" strokeWidth={7} strokeLinecap="round" />
          <line x1={0} y1={0} x2={Math.sin(t * 6) * 60} y2={-Math.cos(t * 6) * 60} stroke={C.red} strokeWidth={3} />
        </g>
        {/* LED token board */}
        <g transform="translate(830,462) scale(0.6)">
          <rect width={300} height={160} rx={10} fill="#1b1b1b" stroke="#555" strokeWidth={6} />
          <text x={150} y={45} textAnchor="middle" fontFamily={MONO_FONT} fontSize={22} fill="#aaa">NOW SERVING</text>
          <text x={150} y={128} textAnchor="middle" fontFamily={MONO_FONT} fontSize={72} fontWeight={700} fill="#FF4B2E" opacity={0.75 + 0.25 * Math.abs(Math.sin(t * 3))}>{token}</text>
        </g>
        {/* teller windows */}
        {windows.slice(0, 3).map((w, i) => {
          const x = 60 + i * 330;
          return (
            <g key={i}>
              <rect x={x} y={560} width={300} height={70} fill={["#2F5D7A", C.red, "#2F6B4F"][i % 3]} />
              <text x={x + 150} y={612} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={46} fill="#FBF2DD">{w}</text>
              <rect x={x} y={640} width={300} height={500} fill="#5f6f6c" />
              <rect x={x + 16} y={656} width={268} height={470} fill="#A9C4C9" opacity={0.75} />
              {Array.from({ length: 8 }).map((_, k) => <line key={k} x1={x + 16 + k * 38} x2={x + 16 + k * 38} y1={656} y2={1126} stroke="#7e8f8c" strokeWidth={3} />)}
              <path d={`M${x + 40} 1040 h220 a40 40 0 0 1 -40 40 h-140 a40 40 0 0 1 -40 -40 z`} fill="#2b2b2b" opacity={0.6} />
              <rect x={x + 16} y={656} width={268} height={470} fill="#fff" opacity={0.08} />
            </g>
          );
        })}
        {/* counter */}
        <rect x={0} y={1140} width={W} height={40} fill="#B08350" />
        <rect x={0} y={1180} width={W} height={340} fill="#8C5F31" />
        {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={20 + i * 180} y={1210} width={160} height={280} fill="none" stroke="#6e4720" strokeWidth={5} />)}
        {/* marble floor */}
        {Array.from({ length: 6 }).map((_, r) => Array.from({ length: 8 }).map((__, c) => (
          <rect key={`${r}${c}`} x={c * 140 - (r % 2) * 70} y={1520 + r * 70} width={140} height={70} fill={(r + c) % 2 ? "#DAD5C8" : "#EDE8DC"} stroke="#c8c1b0" />
        )))}
        {/* rope barrier */}
        {[120, 540, 960].map((x, i) => <g key={i}><rect x={x - 8} y={1560} width={16} height={240} fill="#C9A24A" /><circle cx={x} cy={1555} r={18} fill="#E0BE63" /><rect x={x - 40} y={1795} width={80} height={16} rx={8} fill="#8a6a2a" /></g>)}
        <path d="M120 1580 Q 330 1680 540 1580 Q 750 1680 960 1580" stroke={C.red} strokeWidth={16} fill="none" />
      </svg>
    </AbsoluteFill>
  );
};

/** Iceberg: small tip above the waterline, huge hidden mass below. Labels go on top as layers. */
export const Iceberg: React.FC<{ options?: Opts }> = ({ options = {} }) => {
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const wl = options.waterline ?? 720; // waterline y
  const bob = Math.sin(t * 1.2) * 6;
  const wave = (yy: number, amp: number, ph: number) =>
    `M0 ${yy} ` + Array.from({ length: 13 }).map((_, i) => `Q ${i * 90 + 45} ${yy + Math.sin(t * 2 + i + ph) * amp - amp} ${(i + 1) * 90} ${yy}`).join(" ") + ` V ${H} H 0 Z`;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={box}>
        <defs>
          <linearGradient id="isky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#B9D3D8" /><stop offset="1" stopColor="#E6EEE8" /></linearGradient>
          <linearGradient id="isea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#4F8FA0" /><stop offset="0.45" stopColor="#2C5C72" /><stop offset="1" stopColor="#13283A" /></linearGradient>
          <linearGradient id="ice" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#BFE0EA" /></linearGradient>
          <linearGradient id="iceDeep" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#9CC9D6" stopOpacity="0.85" /><stop offset="1" stopColor="#4C7F94" stopOpacity="0.55" /></linearGradient>
        </defs>
        <rect width={W} height={wl + 40} fill="url(#isky)" />
        <circle cx={860} cy={300} r={70} fill="#F7E6A8" opacity={0.9} />
        <path d={wave(wl, 10, 0)} fill="url(#isea)" />
        <g transform={`translate(0,${bob})`}>
          {/* hidden mass */}
          <path d={`M330 ${wl} L 210 ${wl + 260} L 120 ${wl + 640} L 200 ${wl + 980} L 420 ${wl + 1120} L 700 ${wl + 1080} L 930 ${wl + 860} L 960 ${wl + 520} L 860 ${wl + 220} L 760 ${wl} Z`} fill="url(#iceDeep)" />
          <path d={`M330 ${wl} L 420 ${wl + 400} L 300 ${wl + 760} M 760 ${wl} L 640 ${wl + 500} L 800 ${wl + 900} M 420 ${wl + 400} L 640 ${wl + 500}`} stroke="#D5EEF3" strokeWidth={4} opacity={0.35} fill="none" />
          {/* visible tip */}
          <path d={`M330 ${wl + 4} L 420 ${wl - 120} L 470 ${wl - 90} L 540 ${wl - 230} L 610 ${wl - 120} L 680 ${wl - 150} L 760 ${wl + 4} Z`} fill="url(#ice)" stroke="#9cc6d2" strokeWidth={3} />
          <path d={`M540 ${wl - 230} L 520 ${wl} M 420 ${wl - 120} L 450 ${wl}`} stroke="#9cc6d2" strokeWidth={3} opacity={0.7} />
        </g>
        <path d={wave(wl + 6, 7, 2)} fill="#5E9EAE" opacity={0.35} />
        {Array.from({ length: 24 }).map((_, i) => {
          const y = H - ((t * (30 + rand(i) * 40) + rand(i + 9) * H) % (H - wl - 40));
          return <circle key={i} cx={rand(i + 3) * W} cy={y} r={3 + rand(i) * 5} fill="#D5EEF3" opacity={0.35} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
