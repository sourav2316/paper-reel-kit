import React, { useId } from "react";
import { rand } from "../engine/anim";

export type AtmosphereKind = "night-window" | "lamplight" | "breath" | "signal";

export const Atmosphere: React.FC<{kind: AtmosphereKind; local: number; tone?: string; dim?: boolean}> = ({kind, local, tone, dim}) => {
  const id = useId();
  const color = tone ?? (kind === "lamplight" ? "#ffa24c" : "#8cbacb");
  const breath = Math.sin(local * 2.9);
  return <svg width="100%" viewBox="0 0 360 300" style={{display:"block",overflow:"visible"}} aria-hidden="true">
    <defs>
      <radialGradient id={id}><stop stopColor={color} stopOpacity=".68"/><stop offset="1" stopColor={color} stopOpacity="0"/></radialGradient>
      <clipPath id={id+"-pane"}><rect x="7" y="7" width="346" height="285" rx="10"/></clipPath>
    </defs>
    {kind === "lamplight" && <ellipse cx="180" cy="150" rx="173" ry="143" fill={"url(#"+id+")"} opacity={.57+.16*Math.sin(local*2.3)+.05*Math.sin(local*11.6)}/>}
    {kind === "night-window" && <g clipPath={"url(#"+id+"-pane)"}>
      {Array.from({length:17},(_,i)=><circle key={i} cx={12+rand(i+207)*336} cy={15+rand(i+28)*138} r={1+rand(i+4)*1.8} fill="#d7ecf7" opacity={.27+.25*Math.sin(i+local*1.45)}/>)}
      <g transform={"translate("+((local*23+32)%560-100)+" 0)"} opacity=".27" fill={"url(#"+id+")"}>
        <ellipse cx="30" cy="35" rx="100" ry="23"/><ellipse cx="98" cy="43" rx="102" ry="26"/>
      </g>
    </g>}
    {kind === "breath" && <g fill="none" stroke={color}>
      <path d={"M56 "+(157-breath*9)+" Q180 "+(193+breath*18)+" 304 "+(157-breath*9)} strokeWidth="5" strokeLinecap="round" opacity=".86"/>
      {[0,1,2].map(i=>{const p=(local*.65+i/3)%1;return <path key={i} d={"M"+(124-p*40)+" "+(144+p*39)+" Q180 "+(170+p*53)+" "+(236+p*40)+" "+(144+p*39)} strokeWidth="2" opacity={(1-p)*.74}/>;})}
    </g>}
    {kind === "signal" && <g>
      <circle cx="180" cy="150" r="65" fill={"url(#"+id+")"} opacity={dim?.19:.88}/>
      <circle cx="180" cy="150" r="27" fill={dim?"#583d34":color} stroke="#e4cb98" strokeWidth="3" opacity={dim?.82:.79+.13*Math.sin(local*5)}/>
      <path d="M180 135V151 M168 140 A16 16 0 1 0 192 140" fill="none" stroke="#f6e6c1" strokeWidth="3.3" strokeLinecap="round" opacity={dim?.47:1}/>
    </g>}
  </svg>;
};
