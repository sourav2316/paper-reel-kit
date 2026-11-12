import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneView } from "./engine/SceneView";
import { PaperOverlay } from "./components/PaperOverlay";
import { DISPLAY_FONT, W, H } from "./theme";
import type { Scene } from "./engine/types";

/**
 * Thumbnail = one frozen moment of a scene + dramatic grade + big 2-line title (yellow / red, thick dark outline).
 * public/projects/<name>/thumbnail.json:
 * { "at": 1.5, "title": { "l1": "₹9,999", "l2": "KA JAAL!" }, "scene": { ...a normal scene with start 0... }, "grade": "dramatic" }
 */
export type ThumbProps = {
  base: string;
  available?: string[] | null;
  at: number;
  title: { l1: string; l2?: string; c1?: string; c2?: string; y?: number; size?: number };
  scene: Scene;
  grade?: "dramatic" | "warm" | "none";
};

const fit = (text: string, max: number) => {
  const units = [...text].reduce((a, ch) => a + (ch === " " ? 0.24 : ch === "," || ch === "." || ch === "'" ? 0.22 : 0.52), 0);
  return Math.min(max, (W * 0.9) / Math.max(1, units));
};

const Line: React.FC<{ text: string; color: string; size: number; rotate: number }> = ({ text, color, size, rotate }) => (
  <div style={{ fontFamily: DISPLAY_FONT, fontSize: size, lineHeight: 0.98, color, whiteSpace: "nowrap", transform: `rotate(${rotate}deg)`,
    WebkitTextStroke: `${Math.round(size * 0.075)}px #160c06`, paintOrder: "stroke fill", letterSpacing: 1,
    textShadow: `0 ${Math.round(size * 0.05)}px 0 #160c06, 0 ${Math.round(size * 0.09)}px ${Math.round(size * 0.12)}px rgba(0,0,0,0.65)` }}>{text}</div>
);

export const Thumb: React.FC<ThumbProps> = ({ base, available, at, title, scene, grade = "dramatic" }) => {
  const s1 = title.size ?? fit(title.l1, 210), s2 = title.size ?? fit(title.l2 ?? "", 230);
  const sc: Scene = { ...scene, headlines: [], start: scene.start ?? 0, end: Math.max(scene.end ?? at + 1, at + 1) };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: grade === "none" ? undefined : grade === "warm" ? "saturate(1.2) contrast(1.08)" : "saturate(1.25) contrast(1.15) brightness(0.95)" }}>
        <SceneView scene={sc} seqStart={at} base={base} available={available} isFirst />
      </AbsoluteFill>
      <PaperOverlay />
      {grade !== "none" ? (
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 58%, rgba(0,0,0,0) 38%, rgba(10,4,0,0.62) 100%)" }} />
      ) : null}
      <AbsoluteFill style={{ background: "linear-gradient(rgba(10,5,0,0.6) 0%, rgba(10,5,0,0.25) 22%, rgba(0,0,0,0) 34%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: H * (title.y ?? 0.05), display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <Line text={title.l1} color={title.c1 ?? "#FFD34D"} size={s1} rotate={-2} />
        {title.l2 ? <Line text={title.l2} color={title.c2 ?? "#F2402E"} size={s2} rotate={-2} /> : null}
      </div>
    </AbsoluteFill>
  );
};
