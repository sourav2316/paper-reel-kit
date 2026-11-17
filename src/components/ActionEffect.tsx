import React, {useId} from "react";
import {clamp01, rand} from "../engine/anim";

export type ActionKind = "torch" | "powder" | "radar" | "breath" | "flame" | "depth" | "radio" | "rotor";

export const ActionEffect: React.FC<{kind: ActionKind; time: number}> = ({kind,time}) => {
  const id=useId();
  const beam="url(#"+id+"-beam)";
  const vapor="url(#"+id+"-vapor)";
  const angle=Math.sin(time*2.3);
  return <svg width="100%" viewBox="0 0 400 400" style={{display:"block",overflow:"visible"}} aria-hidden="true">
    <defs>
      <linearGradient id={id+"-beam"}><stop stopColor="#ffe3a0" stopOpacity=".65"/><stop offset="1" stopColor="#ffd690" stopOpacity=".06"/></linearGradient>
      <radialGradient id={id+"-vapor"}><stop stopColor={kind==="powder"?"#dce8ef":"#e7eefa"} stopOpacity=".59"/><stop offset="1" stopColor="#edf7ff" stopOpacity="0"/></radialGradient>
    </defs>
    {kind==="torch" && <g transform={`rotate(${angle*16} 8 200)`}>
      <path d="M8 194L378 121Q403 200 378 278L8 205Z" fill={beam}/>
      <ellipse cx="365" cy="200" rx="36" ry="74" fill={vapor} opacity=".69"/>
    </g>}
    {kind==="powder" && Array.from({length:16},(_,i)=>{
      const p=clamp01((time-.8-rand(i+20)*.55)/2.1);
      return <ellipse key={i} cx={-59+440*p+rand(i+3)*118} cy={182+rand(i+61)*125-p*(43+rand(i+1)*70)} rx={44+p*76} ry={27+p*41} fill={vapor} opacity={Math.sin(p*Math.PI)*.69}/>;
    })}
    {kind==="radar" && <g>
      {[25,50,80,112].map(r=><circle key={r} cx="200" cy="200" r={r} stroke="#b2dcab" opacity=".55" strokeWidth="2" fill="none"/>)}
      <g transform={`rotate(${time*220} 200 200)`}>
        <path d="M200 200V88 A112 112 0 0 1 271 113Z" fill="#b2f2ac" opacity=".3"/>
        <path d="M200 200V88" stroke="#ddffb1" strokeWidth="4"/>
      </g>
      <circle cx="243" cy="174" r="7" fill="#ddffb1" opacity={.25+Math.abs(Math.sin(time*4))*.75}/>
    </g>}
    {kind==="breath" && Array.from({length:7},(_,i)=>{
      const p=(time*.65+i*.055)%1;
      return <ellipse key={i} cx={65+p*208} cy={209-p*61+rand(i+3)*24} rx={12+p*62} ry={12+p*38} fill={vapor} opacity={Math.sin(p*Math.PI)*.61}/>;
    })}
    {kind==="flame" && <g transform={`translate(${Math.sin(time*8)*6} 0) rotate(${angle*11} 200 250)`}>
      <path d={`M200 253 C151 243 183 194 ${205+angle*12} 151 C194 192 249 228 200 253Z`} fill="#ef9d42" opacity=".8"/>
      <path d="M201 252 C181 246 190 228 203 198 C205 225 226 241 201 252Z" fill="#ffe4a0"/>
    </g>}
    {kind==="depth" && <g stroke="#eaf3f5" strokeWidth="4" opacity=".85">
      <path d={`M120 35v${clamp01(time/1.12)*310}`}/>
      {[0,1,2,3,4,5].map(i=>time>((i/5)*1.12) && <path key={i} d={`M120 ${35+i*62}h${i%5===0?40:23}`}/>)}
    </g>}
    {kind==="radio" && <g fill="#e5b36f">{Array.from({length:8},(_,i)=>{
      const height=24+Math.abs(Math.sin(time*12+i*1.2))*92;
      return <rect key={i} x={48+i*40} y={245-height} width="16" height={height} rx="4" opacity={.48+i*.059}/>;
    })}</g>}
    {kind==="rotor" && <g stroke="#575c59" strokeLinecap="round" transform={`translate(200 200) scale(1 .2) rotate(${time*2450})`}>
      <path d="M37 0H-165 M-37 0H165 M0 37V-165 M0 -37V165" strokeWidth="15" opacity=".55"/>
    </g>}
  </svg>;
};
