import React, { useId } from "react";
import { clamp01, ease, rand } from "../engine/anim";

export type PaperDiagramKind = "globe" | "count" | "species" | "fang" | "pulse" | "clock" | "blocked" | "eye" | "breathing" | "antibodies" | "route" | "prompt";
type Props = { kind: PaperDiagramKind; time: number; mode?: string; value?: number };
const ink = "#242f39", cream = "#f2dfba", amber = "#e9a757", rust = "#c54e38", blue = "#6696a8";

const dropPath = "M0-20C-7-9-15-2-15 8a15 15 0 0 0 30 0C15-2 7-9 0-20Z";
const coil = "M-23 16C-40 4-20-12-1-7S34 16 11 20-8-2 6-12s22-12 29-4";
const cellPath = "M-28-11Q-16-34 9-26t20 22Q26 22 10 27T-20 17-28-11Z";
const continent = "M63 111l28-32 52-18 23 9 8 19-19 13-5 12 17 14-31 21-24-2-6 31-22-9-8-27-18-13Zm51 73 22-7 47 18 12 20-20 34-16 32-16 7-10-38-9-20Zm100-87 26-14 44 2 18-20 39 6 27 24-11 19-41 13-22 39-19-10-13-22-25 6-12-15-21-2Zm22 54 31 1 19 19-4 24-22 47-13-22-4-26-19-14Zm68 9 15-13 20 18-17 26-13-5Zm23 73 20-22 33 9 18 22-15 16-39-4Z";

export const PaperDiagram: React.FC<Props> = ({ kind, time, mode, value }) => {
  const id=useId();
  const progress=ease(time,0,1.2);
  const angle=time*43;
  const chart=mode==="venomous";
  const label=(value ?? 0).toLocaleString("en-IN");
  return <svg width="100%" viewBox="0 0 400 360" style={{display:"block",overflow:"visible",filter:"drop-shadow(3px 11px 8px #12242b77)"}} aria-hidden="true">
    <defs>
      <radialGradient id={id+"-light"}><stop stopColor={amber} stopOpacity=".47"/><stop offset="1" stopColor={amber} stopOpacity="0"/></radialGradient>
      <radialGradient id={id+"-orb"} cx=".34" cy=".27"><stop stopColor="#679a98"/><stop offset="1" stopColor="#1f4853"/></radialGradient>
      <pattern id={id+"-paper"} width="11" height="13" patternUnits="userSpaceOnUse"><path d="M1 3h3m3 6h3m-8 3l2-1" stroke="#89765a" opacity=".32" strokeWidth=".56"/></pattern>
      <clipPath id={id+"-world"}><circle cx="200" cy="174" r="134"/></clipPath>
    </defs>
    {kind==="globe" && <>
      <ellipse cx="200" cy="329" rx="113" ry="16" fill={ink} opacity=".45"/>
      <path d="M141 335h118v-12h-45v-40h-24v40h-49Z" fill="#bd974e" stroke={ink} strokeWidth="4"/>
      <circle cx="200" cy="174" r="141" fill="#d5b47e" stroke={ink} strokeWidth="5"/>
      <circle cx="200" cy="174" r="134" fill={`url(#${id}-orb)`}/>
      <g clipPath={`url(#${id}-world)`}>
        <g fill="none" stroke="#e9d8b0" strokeWidth="1.2" opacity=".3">
          <ellipse cx="200" cy="174" rx={49+27*Math.sin(time*.8)} ry="136"/><ellipse cx="200" cy="174" rx="101" ry="136"/>
          {[104,175,246].map(y=><ellipse key={y} cx="200" cy={y} rx="136" ry="25"/>)}
        </g>
        <g transform={`translate(${19*progress-22} 2)`} fill="#d4af70" stroke="#896d55" strokeWidth="1.5">
          <path d={continent}/>
          {mode==="focus" && <><circle cx="312" cy="165" r={12+Math.sin(time*5)*2} fill={rust}/><circle cx="312" cy="165" r={23+Math.sin(time*4)*4} fill="none" stroke={cream} opacity=".75" strokeWidth="2"/></>}
        </g>
      </g>
    </>}
    {kind==="count" && <g transform={`translate(0 ${(1-progress)*23})`}>
      <path d="M19 110L375 94l12 133-357 15Z" fill="#14262c"/><path d="M20 101l355-11 7 120-352 13Z" fill={cream}/>
      <path d="M20 101l355-11 7 120-352 13Z" fill={`url(#${id}-paper)`}/>
      <text x="200" y="173" textAnchor="middle" dominantBaseline="middle" fill={rust} fontFamily="Arial,sans-serif" fontWeight="900" fontSize="73">{Math.round((value??0)*progress).toLocaleString("en-IN")}</text>
      <path d="M44 266h308" stroke={amber} strokeWidth="3"/>
      {Array.from({length:15},(_,i)=><circle key={i} cx={46+i*22} cy="266" r={i%5===0?6:3} fill={i/15<progress?amber:"#617482"}/>)}
    </g>}
    {kind==="species" && <g>
      <path d="M30 29L365 21l9 314-329 8Z" fill={cream} stroke="#c9aa76" strokeWidth="3"/>
      <path d="M30 29L365 21l9 314-329 8Z" fill={`url(#${id}-paper)`}/>
      {Array.from({length:30},(_,i)=>{
        const visible=clamp01(time*6-i*.19);
        const selected=chart && [2,6,14,20,25,29].includes(i);
        return <g key={i} transform={`translate(${65+i%5*67} ${57+Math.floor(i/5)*50}) scale(.62)`} opacity={visible*(chart&&!selected?.31:1)}>
          <path d={coil} fill="none" stroke={selected?rust:"#554743"} strokeWidth={selected?7:5} strokeLinecap="round"/>
          <circle cx="36" cy="-16" r="6" fill={selected?rust:"#5b554b"}/>
          {selected && <circle cy="4" r="32" stroke={rust} fill="none" strokeWidth="3"/>}
        </g>;
      })}
    </g>}
    {kind==="fang" && <>
      <ellipse cx="200" cy="173" rx="171" ry="149" fill={`url(#${id}-light)`}/>
      <path d="M26 129Q184 57 373 147L375 193Q199 118 26 178Z" fill="#7c857d" stroke={cream} strokeWidth="3"/>
      <g transform={`rotate(${-6+progress*9} 203 137)`}><path d="M184 135q26-22 44 6c20 51-5 85-33 110 13-50 4-64-11-79Z" fill={cream} stroke="#766a64" strokeWidth="3"/>
      <path d="M208 151Q225 193 199 234" fill="none" stroke={mode==="dry"?"#a68c71":amber} strokeWidth="5" opacity=".8"/></g>
      <path d="M-5 278q106-13 177 0 35 11 64-2 66-19 165 0v91H-5Z" fill="#bf855d"/>
      {mode==="dry" ? <g transform="translate(273 269)" opacity={progress}><path d={dropPath} fill="none" stroke={cream} strokeWidth="3"/><path d="M-21 21 22-20" stroke={rust} strokeWidth="8" strokeLinecap="round"/></g>
        : [0,1,2,3].map(i=>{const p=(time*.72+i*.24)%1;return <g key={i} transform={`translate(${215+p*94} ${246+p*92}) scale(${.23+p*.34})`} opacity={Math.sin(Math.PI*p)}><path d={dropPath} fill={amber}/></g>;})}
    </>}
    {kind==="pulse" && <>
      <rect x="18" y="85" width="364" height="190" rx="18" fill="#163b41" stroke="#cfad77" strokeWidth="4"/>
      {[125,165,205,245].map(y=><path key={y} d={`M32 ${y}H370`} stroke="#60848a" opacity=".45"/>)}
      <path d="M35 179H98l16-22 13 49 18-98 17 71h61l14-24 16 50 18-91 17 65h77" fill="none" stroke="#d1e6a7" strokeWidth="5" pathLength={1} strokeDasharray={1} strokeDashoffset={1-progress}/>
    </>}
    {kind==="clock" && <g>
      <circle cx="200" cy="180" r="132" fill="#271e20" opacity=".55"/>
      <circle cx="195" cy="171" r="127" fill="#944c35" stroke="#dfb174" strokeWidth="6"/><circle cx="195" cy="171" r="111" fill={cream}/>
      {Array.from({length:12},(_,i)=><path key={i} d="M195 74v13" transform={`rotate(${i*30} 195 171)`} stroke={ink} strokeWidth={i%3===0?5:2}/>)}
      <path d="M195 173v-72" stroke={ink} strokeWidth="6" transform={`rotate(${angle*2.6} 195 171)`} strokeLinecap="round"/>
      <path d="M195 175v-43" stroke={rust} strokeWidth="9" transform={`rotate(${angle*.61-53} 195 171)`} strokeLinecap="round"/><circle cx="195" cy="171" r="6" fill={ink}/>
    </g>}
    {kind==="blocked" && <g transform={`translate(200 183) scale(${.72+.28*progress})`} stroke={rust} fill="none" strokeWidth="17">
      <circle r="101"/><path d="M-71 71L71-71" strokeLinecap="round"/>
    </g>}
    {kind==="eye" && <g>
      <path d="M32 183q153-166 337 0Q194 302 32 183Z" fill="#d9a387" stroke={ink} strokeWidth="8"/>
      <path d="M47 181q150-125 306 0-154 105-306 0Z" fill={cream}/>
      <circle cx="204" cy="176" r="52" fill="#8b6443" stroke={ink} strokeWidth="5"/><circle cx="204" cy="176" r="24" fill={ink}/><circle cx="188" cy="163" r="9" fill="#fff4d6"/>
      <path d={`M34 181Q184 -${Math.round(4+progress*23)} 366 181Q214 ${114+progress*111} 34 181Z`} fill="#b67e68" stroke={ink} strokeWidth="5"/>
    </g>}
    {kind==="breathing" && <g transform={`translate(200 160) scale(${.97+Math.sin(time*3.8)*.036})`}>
      <path d="M-20-110v80L-73 38M20-110v80l53 68" stroke={cream} strokeWidth="14" fill="none" strokeLinecap="round"/>
      <path d="M-26-34q-58-23-101 72-25 67 8 82 77 28 95-18Zm53 0q61-21 101 72 25 67-8 82-80 28-95-18Z" fill="#d68f7c" stroke="#643b3e" strokeWidth="5"/>
      <path d="M-25-12l-74 90m124-90 74 90M-71 45l-22-20M70 45l23-20" fill="none" stroke="#f2c2a4" strokeWidth="4"/>
    </g>}
    {kind==="antibodies" && <>
      <circle cx="200" cy="180" r="144" fill="#343858" stroke="#9290ac" strokeWidth="3"/>
      {Array.from({length:5},(_,i)=>{
        const a=i*1.27+time*.25;
        const radius=118-progress*53;
        return <g key={i} transform={`translate(${200+Math.cos(a)*radius} ${180+Math.sin(a)*radius}) rotate(${a*57.3+84})`}>
          <path d="M0 21V0L-14-15M0 0l14-15" fill="none" stroke={amber} strokeWidth="7" strokeLinecap="round"/>
        </g>;
      })}
      <path d={cellPath} transform="translate(200 180) scale(1.27)" fill={blue} stroke={cream} strokeWidth="2"/>
      {[0,1,2,3,4,5,6].map(i=><circle key={i} cx={184+rand(i+101)*32} cy={164+rand(i+110)*32} r={2+rand(i+3)*3} fill={ink} opacity=".72"/>)}
    </>}
    {kind==="route" && <>
      <path d="M54 270Q90 237 136 241T209 197q15-25 54-35t70-67" fill="none" stroke={cream} strokeWidth="4" strokeDasharray="6 10"/>
      <circle cx={54+progress*276} cy={270-progress*170+Math.sin(progress*Math.PI)*38} r="8" fill={amber} opacity=".9"/>
      <g transform="translate(265 60)"><rect width="110" height="103" rx="9" fill="#d3d8b8"/><path d="M48 17h16v21h21v16H64v21H48V54H27V38h21Z" fill={rust}/></g>
      <path d="M42 262c-12-6-14-21-6-32l10-14 8 13c4 6 3 14-2 17l23 25c7-5 12-5 16 3l7 13-13 8c-16 9-38-18-43-33Z" fill={cream}/>
    </>}
    {kind==="prompt" && <g transform={`translate(${(1-progress)*-14} ${(1-progress)*33})`}>
      <path d="M42 82Q41 69 63 68l282 5q23 0 23 23l-2 116q-1 19-22 19H138l-53 36 13-36H64q-22 0-22-23Z" fill={cream} stroke="#d0ad77" strokeWidth="4"/>
      {[0,1,2].map(i=><circle key={i} cx={151+i*49} cy="147" r="13" fill={ink} opacity={.42+.54*Math.abs(Math.sin(time*3+i*.65))}/>)}
    </g>}
  </svg>;
};
