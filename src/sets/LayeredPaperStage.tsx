import React, { useId } from "react";
import { rand } from "../engine/anim";

type Location = "yard" | "ritual" | "bedside" | "clinic" | "stable" | "board";
const tones: Record<Location, [string, string, string]> = {
  yard: ["#152b43", "#465e53", "#684c34"],
  ritual: ["#2e2328", "#8c4e32", "#4b2930"],
  bedside: ["#101c33", "#344c59", "#392e36"],
  clinic: ["#17343b", "#839887", "#4f615b"],
  stable: ["#263039", "#806344", "#55422f"],
  board: ["#252e37", "#384957", "#26343c"],
};

export const LayeredPaperStage: React.FC<{ location?: Location; time: number; dawn?: boolean }> = ({ location = "yard", time, dawn }) => {
  const id = useId();
  const [top, wall, ground] = tones[location] ?? tones.yard;
  const yard = location === "yard";
  const isBoard = location === "board";
  const bed = location === "bedside";
  const clinic = location === "clinic";
  const stable = location === "stable";
  const breeze = Math.sin(time * 2.35);
  const aperture = clinic ? [609, 474, 286, 418] : [696, 510, 250, 410];
  const [wx, wy, ww, wh] = aperture;

  return (
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{display:"block"}} aria-hidden="true">
      <defs>
        <linearGradient id={id+"-wash"} x2="0" y2="1">
          <stop stopColor={dawn ? "#3f3545" : top} /><stop offset="1" stopColor={wall} />
        </linearGradient>
        <radialGradient id={id+"-lamp"}><stop stopColor="#ffd083" stopOpacity=".66"/><stop offset="1" stopColor="#e78d48" stopOpacity="0"/></radialGradient>
        <linearGradient id={id+"-outside"} x2="0" y2="1"><stop stopColor={dawn?"#787295":"#1e3157"}/><stop offset="1" stopColor={dawn?"#ed9a68":"#4b7790"}/></linearGradient>
        <pattern id={id+"-ink"} width="31" height="31" patternUnits="userSpaceOnUse">
          <path d="M2 5l4 1m9 7l5 1m-16 9l2 1m17-3l6 2m-5-18l2 1" fill="none" stroke="#edd8a9" opacity=".13"/>
        </pattern>
        <clipPath id={id+"-pane"}><rect x={wx} y={wy} width={ww} height={wh}/></clipPath>
      </defs>
      <rect width="1080" height="1920" fill={`url(#${id}-wash)`}/>
      {yard && <>
        <g transform={`translate(${7*breeze} 0)`}>
          <circle cx="850" cy="425" r="62" fill="#e6cfa4" opacity=".83"/>
          <path d="M0 882L129 840 207 694 354 667 451 781 523 814 608 766 766 669 925 697 1080 794V1234H0Z" fill="#263942"/>
          <path d="M0 891L175 817l168 25 80 46v400H0ZM696 873l181-104 203 55v459H696Z" fill="#775743"/>
          <path d="M0 894l175-90 259 52-17 37-249-30L0 935Zm666-11 212-125 202 52v47l-200-42-188 104Z" fill="#3a3839"/>
          <rect x="71" y="972" width="113" height="147" fill="#c68e44" opacity=".65" />
          <rect x="821" y="905" width="102" height="173" fill="#cb9c57" opacity=".68" />
        </g>
        <path d="M0 1128Q430 1044 1080 1051V1920H0Z" fill={ground}/>
        <path d="M425 1131 672 1089 1086 1516v404H80Z" fill="#9a704c" opacity=".53"/>
        {[0,1,2,3,4,5,6,7,8,9].map(i=>{
          const x = i < 5 ? 46+i*48 : 1050-(i-5)*46;
          return <g key={i} transform={`translate(${x},${1380+rand(i+3)*420}) rotate(${Math.sin(time*2.9+i)*8})`}>
            <path d="M0 4Q-28-96-48-113Q-10-100 0 4Q6-113 30-145Q22-66 0 4Q28-59 61-84Q40-38 0 4" fill={i%2?"#727951":"#4b594a"} />
          </g>;
        })}
      </>}
      {!yard && !isBoard && <>
        <path d="M0 405L59 422 53 1300H0ZM1080 426l-85 48 9 826h76Z" fill="#2a282e" opacity=".68"/>
        {stable && [0,1,2,3,4,5,6,7,8].map(i=><path key={i} d={`M${i*145} 503v772`} stroke="#352c2a" strokeWidth="12" opacity=".29"/>)}
        <rect x={wx-18} y={wy-19} width={ww+36} height={wh+38} rx="5" fill="#262529" />
        <g clipPath={`url(#${id}-pane)`}>
          <rect x={wx} y={wy} width={ww} height={wh} fill={`url(#${id}-outside)`} />
          <path d={`M${wx-20} ${wy+300}q80-61 171-60l170 45v160h-341Z`} fill="#354b51" opacity=".7" />
          <circle cx={wx+ww*.69} cy={wy+95} r={dawn?46:32} fill={dawn?"#ffc284":"#e7d5b6"}/>
          <path d={`M${wx-45+breeze*20} ${wy+140}h160m21 40h115`} stroke="#cfd6cb" strokeWidth="7" strokeLinecap="round" opacity=".19"/>
        </g>
        <path d={`M${wx+ww/2} ${wy}v${wh}M${wx} ${wy+wh*.55}h${ww}`} stroke="#333235" strokeWidth="12" />
        {bed && <g transform={`rotate(${breeze*2.6} ${wx+24} ${wy-10})`}><path d={`M${wx-20} ${wy-28}h77v429q-28 28-83 16Z`} fill="#a37c66"/><path d={`M${wx-7} ${wy-15}l-8 380m36-380v397`} stroke="#e0ab7c" strokeWidth="7" opacity=".32"/></g>}
        <g opacity={clinic?.21:bed?.24:.58}><ellipse cx={clinic?380:290} cy="870" rx="450" ry="620" fill={`url(#${id}-lamp)`} opacity={.82+breeze*.11}/></g>
        <path d="M0 1210Q460 1250 1090 1175V1920H0Z" fill={ground}/>
        <path d="M0 1240L1080 1205" stroke="#dfb488" strokeOpacity=".21" strokeWidth="14"/>
        {bed && <g>
          <path d="M47 1270L812 1221 1054 1411 909 1523 0 1560Z" fill="#936148"/>
          <path d="M64 1285L814 1232 1000 1403 893 1451 12 1483Z" fill="#657684"/>
          {[0,1,2,3,4,5,6,7,8].map(i=><path key={i} d={`M${66+i*95} 1284l-47 188`} stroke="#caa68a" strokeWidth="5" opacity=".35"/>)}
          <path d="M31 1486L37 1697M940 1438v171M815 1254v142" stroke="#5e3b30" strokeWidth="23"/>
          <path d="M72 1291q67-79 255-12l-33 82-216 7Z" fill="#bca88f"/>
        </g>}
        {clinic && <g opacity=".65"><path d="M0 1520h1080v287H0Z" fill="#416467"/><path d="M0 1517h1080v30H0Z" fill="#dad6bc"/><path d="M536 1570v180" stroke="#293c40" strokeWidth="12"/></g>}
      </>}
      {isBoard && <g>
        <path d="M46 565L1008 524l-26 1040-934 43Z" fill="#1b252c" opacity=".43" />
        <path d="M60 564L1011 539l-21 1002-949 41Z" fill="#435560"/>
        <path d="M110 626L969 610v882l-862 30Z" fill="#4c6069" opacity=".38"/>
        <path d="M0 1570h1080v350H0Z" fill={ground} />
      </g>}
      <rect width="1080" height="1920" fill={`url(#${id}-ink)`}/>
      {Array.from({length:14},(_,i)=>{
        const x=(rand(i+2)*1100+time*(8+rand(i+70)*20))%1110;
        const y=430+rand(i+44)*1330+Math.sin(time*1.4+i)*20;
        return <circle key={i} cx={x} cy={y} r={1.5+rand(i+30)*3.4} fill="#f4cb96" opacity={.13+rand(i+23)*.26}/>;
      })}
    </svg>
  );
};
