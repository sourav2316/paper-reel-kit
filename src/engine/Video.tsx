import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PaperOverlay } from "../components/PaperOverlay";
import { SceneView, isDarkScene, transitionSeconds } from "./SceneView";
import { resolvePath } from "./LayerView";
import type { Storyboard } from "./types";
import musicDefaults from "../music-defaults.json";

export type VideoProps = {
  storyboard: Storyboard;
  frameRate?: number;
  base: string;                 // e.g. "projects/demo"
  available?: string[] | null;  // list of existing public/ files (passed by the render script)
};

/** Default background-music level for every video (0.08 = 8%). Override per video with "musicVolume". */
export const MUSIC_VOLUME = musicDefaults.musicVolume;

export const totalSeconds = (sb: Storyboard) => {
  const last = Math.max(...sb.scenes.map((s) => s.end));
  return last + (sb.endPadding ?? 0.5);
};

export const Video: React.FC<VideoProps> = ({ storyboard, base, available }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;
  const scenes = [...storyboard.scenes].sort((a, b) => a.start - b.start);
  const has = (p: string) => !available || available.includes(p);

  const current = scenes.filter((s) => s.start <= t).pop() ?? scenes[0];

  const sfx: { src: string; at: number; vol: number }[] = [];
  for (const s of scenes) for (const l of s.layers ?? []) if (l.sfx) sfx.push({ src: resolvePath(base, l.sfx), at: l.at ?? s.start, vol: l.sfxVolume ?? 0.6 });

  return (
    <AbsoluteFill style={{ background: "#1a1a1a" }}>
      {scenes.map((s, i) => {
        const from = Math.round(s.start * fps);
        const next = scenes[i + 1];
        const endSec = next ? next.start + transitionSeconds(next) : durationInFrames / fps;
        const dur = Math.max(1, Math.round(endSec * fps) - from);
        return (
          <Sequence key={s.id + i} from={from} durationInFrames={dur} name={s.id}>
            <SceneView scene={s} seqStart={s.start} base={base} available={available} isFirst={i === 0} next={next} />
          </Sequence>
        );
      })}
      <PaperOverlay dark={isDarkScene(current)} creases={storyboard.paperCreases} />
      {storyboard.audio && has(resolvePath(base, storyboard.audio)) ? <Audio src={staticFile(resolvePath(base, storyboard.audio))} volume={storyboard.audioVolume ?? 1} /> : null}
      {storyboard.music && has(resolvePath(base, storyboard.music)) ? (
        <Audio src={staticFile(resolvePath(base, storyboard.music))} loop
          volume={(f) => {
            // kit default: background music under the voice with a 1s fade-in, 1.5s fade-out at the end
            const base = storyboard.musicVolume ?? MUSIC_VOLUME;
            const fadeIn = Math.min(1, f / fps);
            const fadeOut = Math.min(1, (durationInFrames - f) / (1.5 * fps));
            return base * Math.max(0, Math.min(fadeIn, fadeOut));
          }} />
      ) : null}
      {sfx.filter((x) => has(x.src)).map((x, i) => (
        <Sequence key={i} from={Math.round(x.at * fps)} durationInFrames={Math.round(3 * fps)}>
          <Audio src={staticFile(x.src)} volume={x.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
