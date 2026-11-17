
import React, { useId } from "react";
import { AbsoluteFill } from "remotion";
import { rand } from "../engine/anim";
import type { SetMotion } from "../engine/types";

const specs = {
  sunlight: { color: "#ffcc76", count: 24, center: [30, 53], strength: .24, drift: 8 },
  plaque: { color: "#7fe0e0", count: 28, center: [57, 68], strength: .21, drift: 16 },
  specimen: { color: "#ffd29d", count: 12, center: [54, 51], strength: .22, drift: 7 },
  clinic: { color: "#f1d19e", count: 13, center: [64, 48], strength: .19, drift: 7 },
};

export const SetAtmosphere: React.FC<{ kind: SetMotion; time: number }> = ({kind, time}) => {
  const id = useId();
  const { color, count, center, strength, drift } = specs[kind];
  const shift = Math.sin(time * .93);
  return <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
    <div style={{position:"absolute",inset:"-8%",mixBlendMode:"screen",opacity:strength,
      transform:`translateX(${shift * 5}%)`,
      background: `radial-gradient(ellipse 35% 44% at ${center[0]}% ${center[1]}%, ${color}99, transparent 88%)`}}/>
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id={id} x2=".9" y2="1"><stop stopColor={color} stopOpacity=".3"/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      {kind === "sunlight" && <g transform={`translate(${shift * 2.7} 0)`} style={{mixBlendMode:"screen"}}>
        <path d="M35 32L57 36 21 82 2 70Z M60 35L69 37 45 76 34 77Z" fill={`url(#${id})`} opacity=".55"/>
      </g>}
      {count > 0 && Array.from({length:count}, (_, i) => {
        const cycle = (time * (.07 + rand(i+27)*.03) + rand(i+97)) % 1;
        const x = rand(i*7+4)*109 - 5 + cycle * drift;
        const y = 29 + rand(i*7+5)*62 - cycle*9;
        return <ellipse key={i} cx={x} cy={y} rx={.12 + rand(i*7+6)*.34} ry={.08+rand(i*7+9)*.17}
          fill={color} opacity={Math.sin(cycle*Math.PI) * (.18 + rand(i+8)*.41)}/>;
      })}
    </svg>
  </AbsoluteFill>;
};
