import React from "react";
import { Img, staticFile } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { clamp01 } from "../engine/anim";

export type ClinicalKind = "monitor" | "prohibit" | "anatomy-travel";
const route = "M157 568 C190 546 213 513 236 486 C257 462 265 447 285 429 C315 395 327 361 340 332 C356 296 371 264 405 241 C432 220 405 201 394 176 C382 147 394 124 392 96 C391 83 385 71 383 64";
const routeLength = getLength(route);

export const ClinicalMotion: React.FC<{kind: ClinicalKind; local: number; dur?: number; src?: string}> = ({kind, local, dur=2, src}) => {
  if (kind === "anatomy-travel") {
    const travel = clamp01((local - .76) / dur);
    const point = getPointAtLength(route, routeLength * travel) ?? {x:169,y:571};
    const zoom = 1 + .90 * Math.sin(travel * Math.PI) + .67 * clamp01((travel - .76) / .24);
    const focusX = Math.min(450, Math.max(195, point.x));
    const focusY = Math.min(474, Math.max(115, point.y));
    const tx = (300-focusX) * (zoom-1);
    const ty = (285-focusY) * (zoom-1);
    return <div style={{position:"relative", aspectRatio:"600 / 640", overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,transform:"translate("+tx/6+"%, "+ty/6.4+"%) scale("+zoom+")",transformOrigin:focusX/6+"% "+focusY/6.4+"%"}}>
        {src && <Img src={staticFile(src)} style={{position:"absolute",height:"100%",width:"100%",objectFit:"contain"}}/>}
        <svg viewBox="0 0 600 640" width="100%" style={{position:"absolute",inset:0}}>
          <path d={route} fill="none" stroke="#f5c982" strokeWidth="9" opacity=".26"/>
          <path d={route} fill="none" stroke="#ffd493" strokeWidth="4" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-travel}/>
          <circle cx={point.x} cy={point.y} r={10 + Math.sin(local*12)*3} fill="#fa8f55" stroke="#ffe2a5" strokeWidth="3"/>
          {travel > .88 && [0,1,2].map(i => <circle key={i} cx={383} cy={64} r={12+(travel-.88)*245+i*13} fill="none" stroke="#ffd493" opacity={.65-i*.18} strokeWidth="2"/>)}
        </svg>
      </div>
    </div>;
  }
  if (kind === "monitor") {
    const until = clamp01(local / dur);
    const phase = Math.max(0, local * 100);
    const heartbeat = (x: number) => {
      const k = ((x - phase + 9000) % 136 + 136) % 136;
      const profile = [[0,0],[20,0],[29,-11],[36,0],[49,0],[54,15],[61,-51],[68,30],[78,0],[88,-5],[101,0],[136,0]];
      const i = profile.findIndex(([px]) => px >= k);
      const a = profile[Math.max(0,i-1)], b=profile[Math.max(1,i)];
      return a[1]+(b[1]-a[1])*(k-a[0])/(b[0]-a[0]);
    };
    const points = Array.from({length:301},(_,i) => {
      const x = 18 + i * 2;
      const amp = local < dur ? 1 : clamp01((540 * (1 - clamp01((local-dur)/.37)) - x)/100);
      return x + "," + (113+heartbeat(x)*amp);
    }).join(" ");
    return <svg width="100%" viewBox="0 0 635 210" style={{display:"block"}}>
      <rect x="3" y="4" width="629" height="202" rx="29" fill="#2f3531" stroke="#716d57" strokeWidth="5"/>
      <rect x="12" y="13" width="611" height="183" rx="22" fill="#10201c"/>
      {Array.from({length:19},(_,i)=><path key={i} d={"M"+(24+i*32)+" 29v150 M25 "+(35+(i%7)*22)+"h580"} stroke="#273f32" strokeWidth="1"/>)}
      <polyline points={points} fill="none" stroke={until < 1 ? "#b5ce87" : "#ff7e60"} strokeWidth="3.7" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx="598" cy="36" r="4" fill={until < 1 ? "#b5ce87" : "#f76547"}/>
    </svg>;
  }
  return <svg width="100%" viewBox="0 0 240 240" style={{display:"block",overflow:"visible",filter:"drop-shadow(5px 14px 10px #24100da0)"}}>
    <g fill="none" strokeLinecap="round">
      <circle cx="120" cy="120" r="91" stroke="#8c281e" strokeWidth="32" transform="translate(0 4)"/>
      <circle cx="120" cy="120" r="91" stroke="#d4422e" strokeWidth="26"/>
      <path d="M58 58L182 182" stroke="#d4422e" strokeWidth="28"/>
    </g>
  </svg>;
};
