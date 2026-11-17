import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { W, H, MONO_FONT } from "../theme";
import { SetView } from "../sets/Sets";
import { LayerView, resolvePath } from "./LayerView";
import { SetAtmosphere } from "../components/SetAtmosphere";
import { HeadlineView } from "./Headline";
import { clamp01, ease, ambientStyle } from "./anim";
import type { Scene, Tint } from "./types";
import { HAND_LEAD, HAND_TRAVEL, type HandLink } from "../components/HandDraw";

/**
 * One continuous hand per scene: marks that follow each other closely are chained, so the hand
 * stays on screen, travels to the next mark, and only leaves after the last one.
 */
const CHAIN_GAP = 0.8; // max seconds between the end of one stroke and the start of the next to chain them
export const computeHandLinks = (scene: Scene): Record<string, HandLink>[] => {
  type Ev = { li: number; key: string; start: number; dur: number; cx: number; cy: number };
  const evs: Ev[] = [];
  (scene.layers ?? []).forEach((l, li) => {
    if ((l as { hand?: boolean }).hand === false) return;
    const at = l.at ?? scene.start, cx = (l.x ?? 0.5) * W, cy = (l.y ?? 0.5) * H;
    if (l.type === "mark") evs.push({ li, key: "mark", start: at, dur: l.dur ?? 0.5, cx, cy });
    if (l.type === "price" || l.type === "listing" || l.type === "receipt" || l.type === "newspaper")
      for (const key of ["markAt", "markFirstAt", "markLastAt", "markTotalAt"] as const) {
        const v = (l as Record<string, unknown>)[key];
        if (typeof v === "number") evs.push({ li, key, start: at + v, dur: 0.42, cx, cy });
      }
  });
  evs.sort((a, b) => a.start - b.start);
  const out: Record<string, HandLink>[] = (scene.layers ?? []).map(() => ({}));
  for (let i = 0; i < evs.length - 1; i++) {
    const a = evs[i], b = evs[i + 1];
    const aLead = out[a.li][a.key]?.from ? HAND_TRAVEL : HAND_LEAD;
    const aEnd = a.start + aLead + a.dur;
    if (b.start < aEnd - 0.01 || b.start - aEnd > CHAIN_GAP) continue;
    out[a.li][a.key] = { ...out[a.li][a.key], holdUntil: b.start - a.start };
    out[b.li][b.key] = { ...out[b.li][b.key], from: [a.cx - b.cx, a.cy - b.cy] };
  }
  return out;
};

// [grayscale, brightness, sepia, hueRotate, saturate]
const TINTS: Record<Tint, number[]> = {
  normal: [0, 1, 0, 0, 1],
  desaturate: [0.85, 0.72, 0.1, 0, 0.8],
  night: [0.2, 0.55, 0, 190, 0.7],
  sunset: [0, 0.95, 0.35, -18, 1.15],
  calm: [0.1, 1, 0, 170, 0.75],
  warm: [0, 1.02, 0.25, -8, 1.1],
  dark: [0.3, 0.45, 0, 0, 0.8],
};
const tintFilter = (v: number[]) => `grayscale(${v[0]}) brightness(${v[1]}) sepia(${v[2]}) hue-rotate(${v[3]}deg) saturate(${v[4]})`;

export const isDarkScene = (s: Scene) => s.dark ?? ("builtin" in s.set && (s.set.builtin === "anatomy" || s.set.builtin === "night-city" || s.set.builtin === "library" ||
  (s.set.builtin === "bedroom" && (s.set.options?.light ?? "phone") !== "day" && (s.set.options?.sky ?? "night") !== "day")));

export const transitionSeconds = (s: Scene) => (s.transitionIn === "cut" ? 0 : s.transitionDuration ?? (s.transitionIn === "scan" ? 0.9 : 0.6));

export const SceneView: React.FC<{ scene: Scene; seqStart: number; base: string; available?: string[] | null; isFirst: boolean; next?: Scene }> = ({ scene, seqStart, base, available, isFirst, next }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = seqStart + frame / fps; // absolute seconds
  const local = t - scene.start;
  const dark = isDarkScene(scene);

  // tint (with animated changes)
  let tv = TINTS[scene.tint ?? "normal"];
  for (const ch of scene.tintChanges ?? []) {
    const k = clamp01((t - ch.at) / 0.6);
    if (k > 0) tv = tv.map((v, i) => v + (TINTS[ch.tint][i] - v) * k);
  }

  // camera
  const cam = scene.camera ?? {};
  const dur = Math.max(0.1, scene.end - scene.start);
  let zoom = (cam.zoomFrom ?? 1) + ((cam.zoomTo ?? 1.04) - (cam.zoomFrom ?? 1)) * clamp01(local / dur);
  if (cam.pushAt !== undefined) zoom *= 1 + ((cam.pushTo ?? 1.4) - 1) * ease(t, cam.pushAt, cam.pushAt + 0.7);
  const cameraProgress = ease(local, 0, dur);
  const focusX = cam.focusX ?? 0.5, focusY = cam.focusY ?? 0.5;
  const cameraX = focusX + ((cam.focusToX ?? focusX) - focusX) * cameraProgress;
  const cameraY = focusY + ((cam.focusToY ?? focusY) - focusY) * cameraProgress;
  let shx = 0, shy = 0;
  for (const s of cam.shakeAt ?? []) {
    const k = t - s;
    if (k >= 0 && k < 0.35) { const a = (1 - k / 0.35) * 18; shx += Math.sin(k * 90) * a; shy += Math.cos(k * 70) * a; }
  }

  const keys = cam.keyframes;
  let framedCamera: React.CSSProperties | undefined;
  if (keys?.length) {
    const last = keys.length - 1;
    const next = keys.findIndex(({ at }) => at > local);
    const first = next < 0 ? keys[last] : keys[Math.max(0, next - 1)];
    const second = next < 0 ? first : keys[next];
    const p = first === second ? 0 : ease(local, first.at, second.at);
    const scale = first.zoom + (second.zoom - first.zoom) * p;
    const x = first.x + (second.x - first.x) * p;
    const y = first.y + (second.y - first.y) * p;
    const left = Math.max(W * (1 - scale), Math.min(0, W * (.5 - x * scale)));
    const top = Math.max(H * (1 - scale), Math.min(0, H * (.5 - y * scale)));
    framedCamera = {
      transform: `translate(${left}px, ${top}px) scale(${scale})`,
      transformOrigin: "0 0",
    };
  }

  // transition in
  const T = isFirst ? 0 : transitionSeconds(scene);
  const p = T > 0 ? ease(local, 0, T) : 1;
  let wrap: React.CSSProperties = {};
  let scanBar: React.ReactNode = null;
  switch (isFirst ? "cut" : scene.transitionIn ?? "blur") {
    case "travel": {
      const focus = scene.transitionFocus ?? { x: .5, y: .5 };
      wrap = { opacity: p, transform: `scale(${1 + .15 * (1-p)})`, transformOrigin: `${focus.x * 100}% ${focus.y * 100}%` };
      break;
    }
    case "fade": wrap = { opacity: p }; break;
    case "blur": wrap = { opacity: p, filter: `blur(${(1 - p) * 14}px)` }; break;
    case "push": wrap = { opacity: clamp01(p * 2), transform: `scale(${1.25 - 0.25 * p})` }; break;
    case "wipe-left": wrap = { clipPath: `inset(0 0 0 ${(1 - p) * 100}%)` }; break;
    case "scan":
      wrap = { clipPath: `inset(0 0 ${(1 - p) * 100}% 0)` };
      if (p < 1) scanBar = (
        <div style={{ position: "absolute", left: 0, right: 0, top: p * H - 60, height: 120, pointerEvents: "none",
          background: "linear-gradient(transparent, rgba(220,240,255,0.35) 35%, rgba(255,255,255,0.95) 50%, rgba(220,240,255,0.35) 65%, transparent)",
          boxShadow: "0 0 60px 20px rgba(190,225,255,0.35)" }} />
      );
      break;
    default: break;
  }

  const setAmb = "image" in scene.set ? ambientStyle(scene.set.ambient, t, 3) : null;
  const headlines = scene.headlines ?? [];
  const leaving = next?.transitionIn === "travel" ? ease(t, next.start, next.start + transitionSeconds(next)) : 0;
  const exitFocus = next?.transitionFocus ?? { x: .5, y: .5 };
  const exits = leaving > 0 ? {
    transform: `scale(${1 + leaving * .18})`,
    transformOrigin: `${exitFocus.x * 100}% ${exitFocus.y * 100}%`,
  } : undefined;
  const handLinks = computeHandLinks(scene);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ ...wrap, overflow: "hidden" }}>
        <AbsoluteFill style={{ ...exits, filter: (scene.tint && scene.tint !== "normal") || scene.tintChanges?.length ? tintFilter(tv) : undefined }}>
          <AbsoluteFill style={framedCamera ?? { transform: `translate(${shx}px, ${shy}px) scale(${zoom})`, transformOrigin: `${cameraX * 100}% ${cameraY * 100}%` }}>
            {"builtin" in scene.set ? (
              <SetView name={scene.set.builtin} options={scene.set.options} tAbs={t} />
            ) : available && !available.includes(resolvePath(base, scene.set.image)) ? (
              <AbsoluteFill style={{ background: "#d9cdb4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO_FONT, fontSize: 34, color: "#7a1e14" }}>
                MISSING BACKGROUND: {scene.set.image}
              </AbsoluteFill>
            ) : (
              <AbsoluteFill style={{ transform: setAmb ? `translate(${setAmb.tx}px, ${setAmb.ty}px) scale(${setAmb.s})` : undefined }}>
                <Img src={staticFile(resolvePath(base, scene.set.image))} style={{ width: W, height: H, objectFit: scene.set.fit ?? "cover" }} />
                {(scene.set.variants ?? []).filter((v) => !available || available.includes(resolvePath(base, v.image))).map((v, i) => {
                  const k = clamp01((t - v.at) / (v.fade ?? 1.2));
                  return k > 0 ? (
                    <Img key={i} src={staticFile(resolvePath(base, v.image))} style={{ position: "absolute", inset: 0, width: W, height: H,
                      objectFit: ("image" in scene.set && scene.set.fit) || "cover", opacity: k }} />
                  ) : null;
                })}
              </AbsoluteFill>
            )}
            {"image" in scene.set && scene.set.motion && <SetAtmosphere kind={scene.set.motion} time={t} />}
            {(scene.layers ?? []).map((l, i) => !l.screenSpace && <LayerView key={i} layer={l} t={t} sceneStart={scene.start} index={i} ctx={{ base, available, sceneEnd: scene.end, links: handLinks[i] }} />)}
          </AbsoluteFill>
        </AbsoluteFill>
        {(scene.layers ?? []).map((l, i) => l.screenSpace && <LayerView key={i} layer={l} t={t} sceneStart={scene.start} index={i} ctx={{ base, available, sceneEnd: scene.end, links: handLinks[i] }} />)}
        {headlines.map((h, i) => (
          <HeadlineView key={i} h={h} t={t} dark={dark} until={h.until ?? (headlines[i + 1] ? headlines[i + 1].at - 0.05 : next?.transitionIn === "travel" ? scene.end - .08 : scene.end + 1)} />
        ))}
        {(scene.caption ?? (dark && "builtin" in scene.set && scene.set.builtin === "anatomy" ? "GRAY'S ANATOMY, 1918" : undefined)) ? (
          <div style={{ position: "absolute", right: W * 0.06, top: H * 0.124, fontFamily: MONO_FONT, fontSize: 20, letterSpacing: 2,
            color: dark ? "rgba(240,230,210,0.5)" : "rgba(40,40,40,0.55)" }}>{scene.caption ?? "GRAY'S ANATOMY, 1918"}</div>
        ) : null}
      </AbsoluteFill>
      {scanBar}
    </AbsoluteFill>
  );
};
