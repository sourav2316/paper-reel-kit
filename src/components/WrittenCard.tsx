import React from "react";
import { Img, staticFile } from "remotion";
import { clamp01 } from "../engine/anim";
import { createStrokes } from "./WritingStrokes";

type Point = [number, number];
const between = (from: Point, to: Point, p: number): Point => [from[0] + (to[0]-from[0])*p, from[1] + (to[1]-from[1])*p];

export const WrittenCard: React.FC<{ rows: { text: string; at: number; dur: number }[]; local: number; hand: string; handTip?: Point; textScale?: number; rowSpacing?: number }> = ({ rows, local, hand, handTip, textScale = 1, rowSpacing = 105 }) => {
  const nib = handTip ?? [.11962, .83014];
  const height = 102 + rows.length * rowSpacing;
  let tip: Point | undefined;
  let lastTip: Point | undefined;
  let opacity = 0;
  const ink = rows.flatMap(({ text, at, dur }, rowIndex) => {
    const strokes = createStrokes(text, 60, 72 + rowIndex * rowSpacing, textScale);
    const distance = strokes.reduce((sum, { length }) => sum + length, 0);
    let remaining = distance * clamp01((local - at) / dur);
    const paths: React.ReactNode[] = [];
    for (const [i, { from, to, length, ink }] of strokes.entries()) {
      if (remaining <= 0) break;
      const end = between(from, to, Math.min(1, remaining / length));
      if (ink) paths.push(<line key={rowIndex + "-" + i} x1={from[0]} y1={from[1]} x2={end[0]} y2={end[1]} />);
      remaining -= length;
      if (local >= at && local <= at + dur) {
        const lift = !ink && handTip ? Math.sin(Math.PI * Math.min(1, (remaining + length) / length)) * 9 : 0;
        tip = [end[0], end[1] - lift];
        opacity = 1;
      }
    }
    const start = strokes[0]?.from;
    if (start && local >= at - .26 && local <= at) {
      const p = clamp01((local - at + .26) / .26);
      tip = between(lastTip ?? [900, height + 120], start, p);
      opacity = lastTip ? 1 : p;
    }
    const end = strokes[strokes.length - 1]?.to;
    if (end && local > at + dur) {
      const exit = rows[rowIndex + 1] ? 0 : clamp01((local - at - dur) / .34);
      tip = [end[0] + exit * 300, end[1] + exit * 180];
      opacity = 1 - exit;
    }
    lastTip = end;
    return paths;
  });
  const paper = "M8 8H885L890 " + (height - 9) + " 4 " + (height - 4) + "Z";
  return <div style={{position:"relative",width:"100%",aspectRatio:"900 / " + height,transform:"rotate(-2deg)"}}>
    <svg viewBox={"0 0 900 " + height} width="100%" style={{display:"block",overflow:"visible"}}>
      <path d={paper} fill="#614530" opacity=".54" transform="translate(8 12)"/>
      <path d={paper} fill="#ebd9ad" stroke="#b79d70" strokeWidth="3"/>
      {rows.map((_, i) => <path key={i} d={"M35 " + (72 + 55 * textScale + i * rowSpacing) + "h827"} stroke="#a78e63" opacity=".36" strokeWidth="2"/>)}
      <g stroke="#873f2c" strokeWidth="5" fill="none" strokeLinecap="round">{ink}</g>
    </svg>
    {tip && opacity > 0 && <Img src={staticFile(hand)} style={{position:"absolute",left:tip[0]/9+"%",top:tip[1]/height*100+"%",width:"37%",maxWidth:"none",opacity,transform:`translate(${-100 * nib[0]}%, ${-100 * nib[1]}%)`,filter:"drop-shadow(7px 9px 10px #2a231966)"}}/>}
  </div>;
};
