import React from "react";
import { Img, staticFile, useVideoConfig, interpolate, Easing } from "remotion";
import { W, H, DISPLAY_FONT, MONO_FONT, C } from "../theme";
import { ambientStyle, clamp01, enterStyle, pop } from "./anim";
import type { Layer } from "./types";
import { CloudShape, Birds, Steam, Rain, Starburst } from "../components/Bits";
import { Bubble, Note, Notifications, Stamp, Mark, Counter, Isotype, Bars, Ecg, Calendar, Orbit } from "../components/Widgets";
import { Body } from "../components/Body";
import { Prop } from "../props/Props";
import { Price, Listing, Chat, Receipt } from "../components/Commerce";
import { Newspaper, Balance, QrStand } from "../components/Widgets2";
import { ReelFeed } from "../components/Widgets3";
import { Figure } from "../components/Figure";
import type { HandLink } from "../components/HandDraw";

export const resolvePath = (base: string, p: string) => (p.startsWith("/") ? p.slice(1) : `${base}/${p}`);

const DEFAULT_W: Partial<Record<Layer["type"], number>> = {
  image: 0.4, prop: 0.25, cloud: 0.36, burst: 0.28, bubble: 0.55, note: 0.32, notifications: 0.6, stamp: 0.5, mark: 0.35,
  counter: 0.5, isotype: 0.8, bars: 0.72, ecg: 0.7, calendar: 0.6, body: 1, orbit: 0.85, text: 0.8, steam: 0.1,
  price: 0.6, listing: 0.86, chat: 0.62, receipt: 0.62, newspaper: 0.86, balance: 0.85, figure: 0.5, reelfeed: 0.5,
};

type Ctx = { base: string; available?: string[] | null; sceneEnd: number; links?: Record<string, HandLink> };

export const LayerView: React.FC<{ layer: Layer; t: number; sceneStart: number; index: number; ctx: Ctx }> = ({ layer, t, sceneStart, index, ctx }) => {
  const { fps } = useVideoConfig();
  const at = layer.at ?? sceneStart;
  if (t < at - 0.001) return null;
  // full-frame effects don't need a box
  if (layer.type === "birds") return <Birds count={layer.count} local={t - at} y={(layer.y ?? 0.25) * H} />;
  if (layer.type === "rain") return <Rain />;
  if (layer.type === "sfx") return null;
  if (layer.type === "flare") {
    const p = clamp01((t - at) / 0.8);
    const o = Math.sin(p * Math.PI);
    return <div style={{ position: "absolute", left: (layer.x ?? 0.5) * W - 700, top: (layer.y ?? 0.4) * H - 60, width: 1400, height: 120, opacity: o,
      background: "radial-gradient(ellipse at center, rgba(255,240,200,0.95) 0%, rgba(255,170,90,0.45) 25%, rgba(0,0,0,0) 65%)", mixBlendMode: "screen" }} />;
  }

  const local = t - at;
  const enter = layer.enter ?? (layer.type === "mark" || layer.type === "steam" ? "none" : layer.type === "stamp" ? "zoom-in" : "pop");
  const p = pop(Math.round(t * fps), fps, Math.round(at * fps), enter === "drop" ? 9 : 11);
  const lin = clamp01(local / 0.3);
  const en = enterStyle(enter, p, lin);
  const amb = ambientStyle(layer.ambient, t, index + 1, layer.ambientAmount ?? 1);

  // exit
  let exitO = 1, exitS = 1, exitX = 0, exitY = 0;
  if (layer.out !== undefined && t > layer.out) {
    const e = clamp01((t - layer.out) / 0.3);
    const kind = layer.exit ?? "fade";
    if (kind === "fade") exitO = 1 - e;
    if (kind === "pop") { exitS = 1 - e; exitO = 1 - e; }
    if (kind === "slide-down") exitY = e * e * 1200;
    if (kind === "slide-left") exitX = -e * e * 1300;
    if (kind === "slide-right") exitX = e * e * 1300;
    if (e >= 1) return null;
  }

  // movement
  let x = layer.x ?? 0.5, y = layer.y ?? 0.5, w = layer.w ?? DEFAULT_W[layer.type] ?? 0.3;
  if (layer.move) {
    const mAt = layer.move.at ?? at;
    const dur = layer.move.dur ?? 2;
    const e = layer.move.ease === "linear" ? Easing.linear : layer.move.ease === "out" ? Easing.out(Easing.cubic) : Easing.inOut(Easing.cubic);
    const k = interpolate(t, [mAt, mAt + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
    if (layer.move.toX !== undefined) x = x + (layer.move.toX - x) * k;
    if (layer.move.toY !== undefined) y = y + (layer.move.toY - y) * k;
    if (layer.move.toW !== undefined) w = w + (layer.move.toW - w) * k;
  }

  // stamp slam override
  let extraS = 1;
  if (layer.type === "stamp") extraS = 1 + (1 - Math.min(1, p)) * 1.2;

  const transform = [
    "translate(-50%, -50%)",
    `translate(${en.tx + amb.tx + exitX}px, ${en.ty + amb.ty + exitY}px)`,
    `rotate(${(layer.rotate ?? 0) + amb.r}deg)`,
    `scale(${en.s * amb.s * exitS * extraS}, ${en.s * amb.s * exitS * extraS * en.sy})`,
    layer.flipX ? "scaleX(-1)" : "",
  ].join(" ");

  const isCutout = layer.type === "image";
  const shadow = (layer.shadow ?? isCutout) ? "drop-shadow(0px 22px 16px rgba(0,0,0,0.38))" : "";
  const glow = layer.glow ? `drop-shadow(0 0 ${18 + Math.sin(t * 6) * 6}px ${C.glow})` : "";

  return (
    <div style={{ position: "absolute", left: x * W, top: y * H, width: w * W, transform, transformOrigin: enter === "grow-up" ? "50% 100%" : "50% 50%",
      opacity: en.o * amb.o * exitO * (layer.opacity ?? 1), filter: [shadow, glow].filter(Boolean).join(" ") || undefined, zIndex: layer.z ?? index + 1 }}>
      <Inner layer={layer} local={local} ctx={ctx} boxW={w * W} />
    </div>
  );
};

const Placeholder: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ width: "100%", aspectRatio: "1 / 1", border: "6px dashed #C0392B", background: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: MONO_FONT, fontSize: 26, color: "#7a1e14", textAlign: "center", padding: 12 }}>MISSING ASSET<br />{label}</div>
);

const Inner: React.FC<{ layer: Layer; local: number; ctx: Ctx; boxW: number }> = ({ layer, local, ctx, boxW }) => {
  switch (layer.type) {
    case "image": {
      const path = resolvePath(ctx.base, layer.src);
      if (ctx.available && !ctx.available.includes(path)) return <Placeholder label={layer.label ?? layer.src} />;
      return <Img src={staticFile(path)} style={{ width: "100%", display: "block", mixBlendMode: layer.blend === "multiply" ? "multiply" : undefined }} />;
    }
    case "prop": return <Prop name={layer.name} local={local} text={layer.text} color={layer.color} value={layer.value} ringing={layer.ringing} />;
    case "cloud": return <CloudShape variant={layer.variant} />;
    case "steam": return <Steam />;
    case "burst": return <div style={{ transform: `rotate(${Math.sin(local * 18) * 5 * Math.max(0, 1 - local)}deg)` }}><Starburst text={layer.text} /></div>;
    case "bubble": return <Bubble text={layer.text} check={layer.check} local={local} />;
    case "note": return <Note text={layer.text} sub={layer.sub} stamp={layer.stamp} />;
    case "notifications": return <Notifications items={layer.items} local={local} interval={layer.interval} />;
    case "stamp": return <Stamp text={layer.text} color={layer.color} />;
    case "mark": return <Mark kind={layer.kind} color={layer.color} local={local} dur={layer.dur} h={layer.h} hand={layer.hand} link={ctx.links?.mark} />;
    case "counter": return <Counter from={layer.from} to={layer.to} digits={layer.digits} suffix={layer.suffix} local={local} dur={layer.dur} />;
    case "isotype": return <Isotype rows={layer.rows} cols={layer.cols} fill={layer.fill} fillColor={layer.fillColor} baseColor={layer.baseColor} local={local} dur={layer.dur} />;
    case "bars": return <Bars values={layer.values} labels={layer.labels} colors={layer.colors} max={layer.max} local={local} dur={layer.dur} />;
    case "ecg": return <Ecg local={local} dur={layer.dur} />;
    case "calendar": return <Calendar month={layer.month} year={layer.year} crossed={layer.crossed} flipTo={layer.flipTo} local={local} dur={layer.dur} />;
    case "body": {
      const { type, x, y, w, z, at, out, enter, exit, ambient, ambientAmount, rotate, flipX, opacity, move, parallax, shadow, sfx, sfxVolume, glow, ...rest } = layer;
      return <Body local={local} {...rest} />;
    }
    case "orbit": return <Orbit items={layer.items} local={local} rx={layer.rx} ry={layer.ry} />;
    case "price": return <Price value={layer.value} old={layer.old} prefix={layer.prefix} style={layer.style} color={layer.color} scan={layer.scan}
      countTo={layer.countTo} countAt={layer.countAt} countDur={layer.countDur} label={layer.label} markAt={layer.markAt} markFirstAt={layer.markFirstAt} markLastAt={layer.markLastAt} markColor={layer.markColor} hand={layer.hand} links={ctx.links} local={local} />;
    case "listing": {
      const path = layer.img ? resolvePath(ctx.base, layer.img) : null;
      const ok = path && (!ctx.available || ctx.available.includes(path));
      return <Listing title={layer.title} price={layer.price} old={layer.old} off={layer.off} rating={layer.rating} badge={layer.badge} markAt={layer.markAt} links={ctx.links} img={ok ? path : null} local={local} />;
    }
    case "chat": return <Chat name={layer.name} messages={layer.messages} interval={layer.interval} local={local} />;
    case "receipt": return <Receipt title={layer.title} items={layer.items} budget={layer.budget} interval={layer.interval} stamp={layer.stamp} stampAt={layer.stampAt} markTotalAt={layer.markTotalAt} totalLabel={layer.totalLabel} links={ctx.links} boxW={boxW} local={local} />;
    case "newspaper": return <Newspaper masthead={layer.masthead} date={layer.date} headline={layer.headline} sub={layer.sub} markAt={layer.markAt} links={ctx.links} boxW={boxW} local={local} />;
    case "balance": return <Balance left={layer.left} right={layer.right} rightAt={layer.rightAt} leftColor={layer.leftColor} rightColor={layer.rightColor} local={local} />;
    case "figure": return <Figure pose={layer.pose} local={local} style={layer.style} skin={layer.skin} hair={layer.hair} shirt={layer.shirt} pants={layer.pants} color={layer.color} rim={layer.rim} blanket={layer.blanket} />;
    case "reelfeed": return <ReelFeed local={local} from={layer.from} to={layer.to} interval={layer.interval} label={layer.label} boxW={boxW} />;
    case "text": return <div style={{ fontFamily: layer.font === "mono" ? MONO_FONT : DISPLAY_FONT, fontSize: layer.size ?? 60, color: layer.color ?? C.ink, lineHeight: 1 }}>{layer.text}</div>;
    default: return null;
  }
};
