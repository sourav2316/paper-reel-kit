
import React, { useId } from "react";
import { clamp01, rand } from "../engine/anim";
import { W, H } from "../theme";

type Point = [number, number];

export const WaterFlow: React.FC<{ source: Point; target: Point; width?: number; time: number }> = ({ source, target, width = 19, time }) => {
  const id = useId();
  const [sx, sy] = [source[0] * W, source[1] * H];
  const [tx, ty] = [target[0] * W, target[1] * H];
  const height = ty - sy;
  const arrival = clamp01(time / .21);
  const stream = (p: number) => ({
    x: sx + (tx - sx) * p ** 1.8 + Math.sin(p * 19 - time * 22) * p * 2.3,
    y: sy + height * p,
    radius: width * (.50 - p * .22) + Math.sin(p * 32 - time * 26) * .75 * p,
  });
  const points = Array.from({ length: 22 }, (_, i) => stream(i / 21));
  const sides = points.map(p => [p.x - p.radius, p.y]).concat(points.slice().reverse().map(p => [p.x + p.radius, p.y]));
  const path = sides.map(([x, y], index) => (index ? "L" : "M") + x + " " + y).join(" ") + "Z";

  return <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
    <defs>
      <linearGradient id={id + "-water"}>
        <stop stopColor="#d2f6fb" stopOpacity=".76" />
        <stop offset=".23" stopColor="#e6fbff" stopOpacity=".56" />
        <stop offset=".53" stopColor="#7eaab0" stopOpacity=".28" />
        <stop offset=".81" stopColor="#e0f4f1" stopOpacity=".6" />
        <stop offset="1" stopColor="#c0e5e6" stopOpacity=".58" />
      </linearGradient>
      <clipPath id={id + "-column"}><path d={path}/></clipPath>
    </defs>
    {arrival >= 1 && <>
      <ellipse cx={tx} cy={ty} rx={33} ry={6} fill="#cadcda" opacity=".26" />
      {[0, .33, .66].map(offset => {
        const cycle = (time * 2.6 + offset) % 1;
        return <ellipse key={offset} cx={tx} cy={ty+2} rx={5+42*cycle} ry={2+10*cycle}
          fill="none" stroke="#e0f6f3" strokeWidth={1.6} opacity={.63*(1-cycle)} />;
      })}
      {Array.from({length:14}, (_, i) => {
        const age=(time*(2.7+rand(i+32)) + rand(i+81))%1;
        const direction=rand(i+3)-.52;
        return <ellipse key={i} cx={tx+direction*age*(45+rand(i+22)*47)} cy={ty-Math.sin(age*Math.PI)*(6+rand(i+10)*34)}
          rx={1+rand(i+45)*1.9} ry={1.1+rand(i+64)*2.2} fill="#e9faf8" opacity={.8*Math.sin(age*Math.PI)} />;
      })}
    </>}
    <path d={path} fill={`url(#${id}-water)`} opacity={arrival}/>
    <g clipPath={`url(#${id}-column)`}>
      {Array.from({ length: 23 }, (_, i) => {
        const phase=(time*(2.2+rand(i+20)*.45)+i/23)%1;
        const p=phase**1.58;
        const position=stream(p);
        return <ellipse key={i} cx={position.x+(rand(i+51)-.5)*position.radius*1.44} cy={position.y}
          rx={1.1+rand(i+75)*1.35} ry={2+6*p+rand(i+9)*3} fill="#f4feff" opacity={arrival*(.23+rand(i+61)*.54)} />;
      })}
    </g>
  </svg>;
};
