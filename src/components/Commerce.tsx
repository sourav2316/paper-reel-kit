import React from "react";
import { Img, staticFile } from "remotion";
import { C, DISPLAY_FONT, MONO_FONT } from "../theme";
import { clamp01, rand } from "../engine/anim";
import { MarkerRing, type HandLink } from "./HandDraw";

const sm = (x: number) => x * x * (3 - 2 * x);

const shadow = "drop-shadow(6px 12px 10px rgba(0,0,0,0.3))";
/** Indian digit grouping: 11796 → 11,796 ; 150000 → 1,50,000 */
export const inr = (n: number) => {
  const s = String(Math.round(Math.abs(n)));
  if (s.length <= 3) return s;
  const last3 = s.slice(-3), rest = s.slice(0, -3);
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
};

/**
 * Price display. style: "tag" (paper swing tag), "plain" (big digits), "card" (sticker).
 * scan: brain reads left→right — a highlight sweeps, locks on the first digit, the rest fades.
 * countTo: number animates from value to countTo starting countAt seconds after appear.
 */
export const Price: React.FC<{
  value: string; old?: string; prefix?: string; style?: "tag" | "plain" | "card"; color?: string;
  scan?: boolean; countTo?: number; countAt?: number; countDur?: number; local: number; label?: string;
  markAt?: number; markFirstAt?: number; markLastAt?: number; markColor?: string; hand?: boolean; links?: Record<string, HandLink>;
}> = ({ value, old, prefix = "₹", style = "tag", color, scan, countTo, countAt = 0.6, countDur = 0.8, local, label, markAt, markFirstAt, markLastAt, markColor, hand = true, links = {} }) => {
  const tAll = markAt === undefined ? -1 : local - markAt;
  const tFirst = markFirstAt === undefined ? -1 : local - markFirstAt;
  const tLast = markLastAt === undefined ? -1 : local - markLastAt;
  let text = value;
  if (countTo !== undefined) {
    const from = Number(value.replace(/[^0-9]/g, ""));
    const p = sm(clamp01((local - countAt) / countDur));
    text = inr(from + (countTo - from) * p);
  }
  const chars = text.split("");
  // scan: cursor goes over digits for 0.6s; then everything after the first digit fades
  const firstDigitIdx = chars.findIndex((c) => /\d/.test(c));
  const cursor = scan ? clamp01(local / 0.55) * chars.length : -1;
  const fadeRest = scan ? clamp01((local - 0.75) / 0.35) : 0;
  const ink = color ?? (style === "plain" ? C.ink : "#2B2B2B");
  const digits = (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", fontFamily: DISPLAY_FONT, lineHeight: 1, color: ink, whiteSpace: "nowrap", position: "relative" }}>
      <MarkerRing t={tAll} color={markColor} padX="-6%" padY="-16%" hand={hand} link={links.markAt} />
      <span style={{ fontSize: "0.62em", marginRight: "0.06em", opacity: scan ? 1 - fadeRest * 0.75 : 1 }}>{prefix}</span>
      {(() => {
        const digitIdx = chars.map((c, i) => (/[0-9]/.test(c) ? i : -1)).filter((i) => i >= 0);
        const lastStart = digitIdx.length >= 2 ? digitIdx[digitIdx.length - 2] : chars.length;
        const render = (ch: string, i: number) => {
        const isFirst = i === firstDigitIdx;
        const lit = scan && cursor > i && cursor < i + 1.6;
        return (
          <span key={i} style={{
            position: "relative",
            opacity: scan && !isFirst ? 1 - fadeRest * 0.8 : 1,
            color: scan && isFirst && fadeRest > 0 ? C.red : undefined,
            transform: scan && isFirst && fadeRest > 0 ? `scale(${1 + fadeRest * 0.25})` : undefined,
            display: "inline-block", transition: "none",
            textShadow: lit ? `0 0 18px ${C.mustard}, 0 0 4px #fff` : undefined,
          }}>{ch === " " ? " " : ch}{isFirst ? <MarkerRing t={tFirst} color={markColor} padX="-34%" padY="-4%" hand={hand} link={links.markFirstAt} /> : null}</span>
        );
        };
        return (<>
          {chars.slice(0, lastStart).map((ch, i) => render(ch, i))}
          <span style={{ position: "relative", display: "inline-flex", alignItems: "baseline" }}>
            {chars.slice(lastStart).map((ch, k) => render(ch, lastStart + k))}
            <MarkerRing t={tLast} color={markColor} padX="-16%" padY="-10%" hand={hand} link={links.markLastAt} />
          </span>
        </>);
      })()}
    </div>
  );
  const oldEl = old ? (
    <div style={{ fontFamily: DISPLAY_FONT, fontSize: "0.36em", color: "#7a7062", textDecoration: "line-through", textDecorationColor: C.red, textDecorationThickness: 4, textAlign: "center" }}>{prefix}{old}</div>
  ) : null;
  const labelEl = label ? <div style={{ fontFamily: MONO_FONT, fontSize: "0.2em", letterSpacing: 2, color: "#6d655a", textAlign: "center", marginBottom: "0.1em" }}>{label}</div> : null;

  // auto-fit: font size follows the layer width (container query units), so text never overflows its tag
  const glyphs = [...text].reduce((a, ch) => a + (ch === "," || ch === "." ? 0.24 : 0.56), 0) + 0.42;
  const pad = style === "tag" ? 0.95 : style === "card" ? 0.5 : 0.08;
  const fs = `calc(100cqw / ${(glyphs + pad).toFixed(2)})`;
  const wrap = (el: React.ReactNode) => <div style={{ containerType: "inline-size", width: "100%", textAlign: "center" }}>{el}</div>;
  if (style === "plain") return wrap(<div style={{ fontSize: fs, display: "inline-block", filter: "drop-shadow(4px 6px 0 rgba(0,0,0,0.15))" }}>{labelEl}{oldEl}{digits}</div>);
  if (style === "card") return wrap(
    <div style={{ fontSize: fs, display: "inline-block", background: C.mustard, padding: "0.12em 0.22em", borderRadius: 18, border: "6px solid #2b2b2b", filter: shadow, transform: "rotate(-3deg)" }}>{labelEl}{oldEl}{digits}</div>
  );
  // paper swing tag
  return wrap(
    <div style={{ position: "relative", filter: shadow, fontSize: fs, display: "inline-block" }}>
      <svg viewBox="0 0 100 40" style={{ position: "absolute", left: "-14%", top: "8%", width: "30%", overflow: "visible" }}>
        <path d="M100 30 C 70 10, 40 0, 0 -40" stroke="#8a7a5a" strokeWidth={1.6} fill="none" />
      </svg>
      <div style={{ padding: "0.16em 0.3em 0.16em 0.55em", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "#F4ECD9", clipPath: "polygon(14% 0, 100% 0, 100% 100%, 14% 100%, 0 50%)" }} />
        <div style={{ position: "absolute", left: "0.2em", top: "50%", width: "0.16em", height: "0.16em", marginTop: "-0.08em", borderRadius: "50%", background: "#3a3328" }} />
        {labelEl}{oldEl}{digits}
      </div>
    </div>
  );
};

/** Generic shopping-app product card (no real brand marks). */
export const Listing: React.FC<{ title: string; price: string; old?: string; off?: string; rating?: number; img?: string | null; local: number; badge?: string; markAt?: number; links?: Record<string, HandLink> }> = ({ title, price, old, off, rating = 4.3, img, local, badge, markAt, links = {} }) => (
  <div style={{ background: "#FFFDF7", borderRadius: 26, padding: 26, display: "flex", gap: 24, alignItems: "center", filter: shadow, border: "2px solid #e4dccb" }}>
    <div style={{ width: 230, height: 230, background: "#F1ECE2", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
      {img ? <Img src={staticFile(img)} style={{ maxWidth: "88%", maxHeight: "88%" }} /> : (
        <svg viewBox="0 0 120 220" height="80%"><rect x={5} y={5} width={110} height={210} rx={18} fill="#1f1f22" /><rect x={12} y={20} width={96} height={180} rx={10} fill="#3a5a7a" /><circle cx={60} cy={12} r={3} fill="#555" /></svg>
      )}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      {badge ? <div style={{ display: "inline-block", background: C.red, color: "#fff", fontFamily: DISPLAY_FONT, fontSize: 26, padding: "2px 12px", borderRadius: 6, marginBottom: 8 }}>{badge}</div> : null}
      <div style={{ fontFamily: MONO_FONT, fontSize: 30, color: "#333", lineHeight: 1.2, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: 28, color: "#3a8a4a", marginBottom: 6 }}>
        {"★★★★★".slice(0, Math.round(rating))}<span style={{ color: "#ccc" }}>{"★★★★★".slice(Math.round(rating))}</span> <span style={{ fontFamily: MONO_FONT, color: "#777", fontSize: 22 }}>{rating}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        {off ? <span style={{ fontFamily: DISPLAY_FONT, fontSize: 40, color: "#3a8a4a" }}>↓{off}</span> : null}
        {old ? <span style={{ fontFamily: MONO_FONT, fontSize: 28, color: "#888", textDecoration: "line-through" }}>₹{old}</span> : null}
        <span style={{ fontFamily: DISPLAY_FONT, fontSize: 72, color: "#111", position: "relative" }}>₹{price}
          <MarkerRing t={markAt === undefined ? -1 : local - markAt} padX="-10%" padY="-14%" handScale={0.8} link={links.markAt} /></span>
      </div>
      <div style={{ marginTop: 10, background: C.mustard, borderRadius: 10, padding: "8px 0", textAlign: "center", fontFamily: DISPLAY_FONT, fontSize: 30, color: "#2b2b2b",
        transform: `scale(${1 + Math.max(0, Math.sin(local * 4)) * 0.03})` }}>ADD TO CART</div>
    </div>
  </div>
);

/** Phone chat (generic messenger look). Messages appear one by one; "me" bubbles on the right. */
export const Chat: React.FC<{ name?: string; messages: { from: "me" | "them"; text: string; at?: number }[]; local: number; interval?: number }> = ({ name = "Rahul", messages, local, interval = 0.9 }) => (
  <div style={{ background: "#1c1c1e", borderRadius: 60, padding: 18, filter: shadow }}>
    <div style={{ background: "#EDE6D8", borderRadius: 44, overflow: "hidden", minHeight: 640, display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#2F5D50", color: "#fff", padding: "34px 30px 22px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: C.mustard, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY_FONT, fontSize: 36, color: "#2b2b2b" }}>{name[0]}</div>
        <div><div style={{ fontFamily: DISPLAY_FONT, fontSize: 38 }}>{name}</div><div style={{ fontFamily: MONO_FONT, fontSize: 20, opacity: 0.8 }}>online</div></div>
      </div>
      <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 18 }}>
        {messages.map((m, i) => {
          const at = m.at ?? i * interval;
          const p = clamp01((local - at) / 0.25);
          if (p <= 0) {
            // typing dots right before a "them" message
            if (m.from === "them" && local > at - 0.6 && local < at) return (
              <div key={i} style={{ alignSelf: "flex-start", background: "#fff", borderRadius: 24, padding: "18px 26px", fontSize: 40, letterSpacing: 6 }}>
                {[0, 1, 2].map((k) => <span key={k} style={{ opacity: 0.3 + 0.7 * Math.abs(Math.sin(local * 8 + k)) }}>•</span>)}
              </div>
            );
            return null;
          }
          const me = m.from === "me";
          return (
            <div key={i} style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: "82%", background: me ? "#D3EDB8" : "#FFFFFF", borderRadius: 24,
              borderTopRightRadius: me ? 4 : 24, borderTopLeftRadius: me ? 24 : 4, padding: "18px 24px", fontFamily: MONO_FONT, fontSize: 32, color: "#222", lineHeight: 1.3,
              transform: `translateY(${(1 - sm(p)) * 30}px) scale(${0.9 + 0.1 * sm(p)})`, opacity: p, boxShadow: "0 3px 6px rgba(0,0,0,0.12)" }}>
              {m.text}
              <div style={{ textAlign: "right", fontSize: 18, color: "#888", marginTop: 4 }}>{me ? "12:0" + (i % 10) + " ✓✓" : "12:0" + (i % 10)}</div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

/** Paper bill: items print one by one, total counts up, optional budget line + OVER BUDGET stamp. */
/**
 * Paper bill. Items print one by one (each at its own `at` seconds, or every `interval`), the total counts up.
 * Negative prices show as "−₹1,500" (discounts). Optional: budget line + stamp when over budget, or a
 * forced `stamp` at `stampAt`; `markTotalAt` = the marker hand circles the total.
 * Designed at 760px wide and scaled to the layer width, so it stays sharp at any size.
 */
export const Receipt: React.FC<{ title?: string; items: { label: string; price: number; at?: number }[]; budget?: number; local: number; interval?: number;
  stamp?: string; stampAt?: number; markTotalAt?: number; totalLabel?: string; links?: Record<string, HandLink>; boxW?: number }> = ({ title = "BILL", items, budget, local, interval = 0.7, stamp = "OVER BUDGET", stampAt, markTotalAt, totalLabel = "TOTAL", links = {}, boxW = 760 }) => {
  const atOf = (i: number) => items[i].at ?? i * interval;
  const shownIdx = items.map((_, i) => i).filter((i) => local >= atOf(i));
  const shown = shownIdx.map((i) => items[i]);
  const totalTarget = shown.reduce((a, b) => a + b.price, 0);
  const lastAt = shownIdx.length ? atOf(shownIdx[shownIdx.length - 1]) : 0;
  const prevTotal = shown.slice(0, -1).reduce((a, b) => a + b.price, 0);
  const total = Math.round(prevTotal + (totalTarget - prevTotal) * sm(clamp01((local - lastAt) / 0.45)));
  const allAt = atOf(items.length - 1);
  const stampTime = stampAt ?? (budget !== undefined ? allAt + 0.5 : undefined);
  const showStamp = stampTime !== undefined && local >= stampTime && (stampAt !== undefined || (budget !== undefined && total > budget));
  const money = (n: number) => (n < 0 ? "−₹" : "₹") + inr(n);
  const zig = Array.from({ length: 21 }).map((_, i) => `${100 - i * 5}% ${i % 2 ? 100 : 97}%`).join(", ");
  return (
    <div style={{ width: "100%" }}>
      <div style={{ width: 760, zoom: boxW / 760, position: "relative", filter: shadow }}>
        <div style={{ background: "#FBF8F0", padding: "40px 46px 70px", fontFamily: MONO_FONT, color: "#2b2b2b", clipPath: `polygon(0 0, 100% 0, ${zig})` }}>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 64, textAlign: "center", letterSpacing: 4 }}>{title}</div>
          <div style={{ borderTop: "3px dashed #999", margin: "14px 0 18px" }} />
          {shownIdx.map((i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 38, marginBottom: 12, opacity: clamp01((local - atOf(i)) / 0.2),
              color: items[i].price < 0 ? "#3a8a4a" : undefined, transform: `translateY(${(1 - clamp01((local - atOf(i)) / 0.2)) * 12}px)` }}>
              <span>{items[i].label}</span><span>{money(items[i].price)}</span>
            </div>
          ))}
          <div style={{ borderTop: "3px dashed #999", margin: "16px 0 14px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: DISPLAY_FONT, fontSize: 64, color: showStamp ? C.red : "#2b2b2b" }}>
            <span>{totalLabel}</span>
            <span style={{ position: "relative" }}>{money(total)}
              <MarkerRing t={markTotalAt === undefined ? -1 : local - markTotalAt} padX="-12%" padY="-16%" link={links.markTotalAt} /></span>
          </div>
          {budget !== undefined ? <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: "#777", marginTop: 6 }}><span>BUDGET</span><span>₹{inr(budget)}</span></div> : null}
        </div>
        {showStamp ? (
          <div style={{ position: "absolute", left: "50%", top: "52%", transform: `translate(-50%,-50%) rotate(-14deg) scale(${1 + (1 - clamp01((local - (stampTime as number)) / 0.25)) * 0.8})`,
            border: `9px solid ${C.red}`, color: C.red, fontFamily: DISPLAY_FONT, fontSize: 92, padding: "4px 26px", whiteSpace: "nowrap", opacity: 0.92, background: "rgba(251,248,240,0.4)" }}>{stamp}</div>
        ) : null}
      </div>
    </div>
  );
};

/** small helper so seeds look random but stable */
export const jitter = (i: number) => (rand(i) - 0.5) * 6;
