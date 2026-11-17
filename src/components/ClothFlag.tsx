import React, { useId } from "react";
import { Img, staticFile } from "remotion";

export const ClothFlag: React.FC<{ src: string; time: number; wind?: number }> = ({ src, time, wind = 1 }) => {
  const id = useId();
  const url = staticFile(src);
  const count = 18;
  const width = 144, height = 96, left = 8, top = 12;
  const point = (u: number) => {
    const phase = u * 8.3 - time * (4 + wind * 2);
    return {
      x: left + u * width - Math.sin(Math.PI * u / 2) * (7 + Math.cos(phase) * 5) * wind,
      y: top + u * (5 + Math.sin(phase) * 9) * wind,
    };
  };
  return (
    <div style={{ width: "100%", aspectRatio: "157 / 156", position: "relative" }}>
      <Img src={url} style={{ width: 1, height: 1, position: "absolute", opacity: 0 }} />
      <svg viewBox="0 0 157 156" width="100%" height="100%" aria-hidden="true">
        <path d="M7 155 V7" stroke="#212e3b" strokeWidth="5.8" />
        <path d="M6.35 155 V7" stroke="#a99a77" strokeWidth="2" />
        <circle cx="7" cy="6" r="3.6" fill="#b7a582" />
        {Array.from({ length: count }, (_, i) => {
          const u = i / count;
          const start = point(u), end = point((i + 1) / count);
          const x = u * width, span = width / count;
          const scale = (end.x - start.x) / span, shear = (end.y - start.y) / span;
          const clip = id + "-panel-" + i;
          const lighting = Math.sin(u * 8.3 - time * (4 + wind * 2));
          return (
            <g key={i} transform={`matrix(${scale} ${shear} 0 1 ${start.x - scale * x} ${start.y - shear * x})`}>
              <defs><clipPath id={clip}><rect x={x} width={span + 0.55} height={height} /></clipPath></defs>
              <g clipPath={`url(#${clip})`}>
                <image href={url} width={width} height={height} preserveAspectRatio="none" />
                <rect x={x} width={span + 0.55} height={height} fill={lighting > 0 ? "#fff1c7" : "#172633"} opacity={0.15 * Math.abs(lighting) * wind} />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
