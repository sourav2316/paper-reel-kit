import React from "react";
import { rand } from "../engine/anim";
import { W, H } from "../theme";

export const SnowDrift: React.FC<{time: number; density?: number; speed?: number; near?: boolean}> = ({time, density = 36, speed = 1, near}) => {
  const restart = (number: number, period: number) => ((number % period) + period) % period;
  return <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position:"absolute",inset:0,pointerEvents:"none"}} aria-hidden="true">
    {Array.from({length: density}, (_, index) => {
      const random = (seed: number) => rand(index * 7 + seed);
      const depth = .35 + random(5) * .85;
      const x = restart(random(2) * W + time * 160 * speed * depth, W + 180) - 90;
      const y = restart(random(3) * H + time * 39 * speed * depth + Math.sin(time * .95 + index) * 38, H + 80) - 40;
      const opacity = (.24 + random(6) * .46) * (near ? .79 : .64);
      return <ellipse key={index} cx={x} cy={y} rx={(near ? 7 : 3) * depth} ry={(near ? 2.2 : 1.35) * depth} fill="#eef6f8" opacity={opacity} transform={`rotate(12 ${x} ${y})`}/>;
    })}
  </svg>;
};
