import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { IsoFonts } from "./iso/fonts";
import { NAVY, YEL as RED, FONT } from "./iso/theme";
import { LOGO_PATHS } from "./logo";

// ───────── easings façon anime.js ─────────
const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const elastic = (x: number, amp = 1, per = 0.55) => {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const a = Math.max(1, amp); const s = (per / (2 * Math.PI)) * Math.asin(1 / a);
  return 1 - a * Math.pow(2, -10 * x) * Math.sin(((x + s) * 2 * Math.PI) / per);
};
const expoOut = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const prog = (t: number, t0: number, d: number) => cl((t - t0) / d);

const isLatin = (w: string) => /^[A-Za-z0-9+=%²·.\-]+$/.test(w);
const SHADOW = "0 4px 26px rgba(10,14,60,0.85), 0 0 3px rgba(10,14,60,0.7)";

type Line = { text: string; size: number; hl?: number[]; delay?: number; color?: string; dir?: "up" | "down" | "left" | "right" };
type Box = { x: number; y: number; w: number; a: "r" | "l" | "c" };
type Piece = { t0: number; t1: number; box: Box; lines: Line[]; deco?: "under" | "brackets" | "arrow" };
type Stat = { t0: number; t1: number; box: Box; num: number; prefix?: string; unit: string; sub?: string };

// ───────── contenu : derja tunisien (mots techniques en français) ─────────
const PIECES: Piece[] = [
  { t0: 1.45, t1: 3.05, box: { x: 70, y: 1080, w: 840, a: "r" }, deco: "under", lines: [{ text: "أكثر من شانطي", size: 118, hl: [2] }, { text: "مربوط بالوقت و الفلوس", size: 54, delay: 0.55, dir: "left" }] },
  { t0: 3.0, t1: 4.35, box: { x: 70, y: 700, w: 940, a: "c" }, lines: [{ text: "وقت = فلوس", size: 190, hl: [2], dir: "down" }] },
  { t0: 4.7, t1: 6.95, box: { x: 70, y: 390, w: 840, a: "r" }, deco: "under", lines: [{ text: "عنا الحل", size: 140, hl: [1] }, { text: "إلي يربحك فلوس و وقت", size: 58, delay: 0.45, dir: "left" }] },
  { t0: 7.35, t1: 8.95, box: { x: 70, y: 880, w: 940, a: "l" }, deco: "brackets", lines: [{ text: "DALLA الحاضرة", size: 118, hl: [1] }, { text: "الحسبة تتبدل", size: 70, delay: 0.75, dir: "up" }] },
  { t0: 9.0, t1: 10.4, box: { x: 70, y: 1130, w: 840, a: "r" }, lines: [{ text: "تنقص برشة", size: 124, hl: [0] }, { text: "في الكفراج", size: 92, delay: 0.3, dir: "left" }] },
  { t0: 10.45, t1: 11.95, box: { x: 70, y: 390, w: 940, a: "c" }, deco: "under", lines: [{ text: "التركيب", size: 100 }, { text: "ساهل ماكس", size: 138, hl: [1], delay: 0.22, dir: "down" }] },
  { t0: 15.85, t1: 17.7, box: { x: 70, y: 980, w: 840, a: "r" }, lines: [{ text: "تخدم تحتها", size: 124, hl: [1] }, { text: "منهارك", size: 112, delay: 0.3, dir: "left" }] },
  { t0: 17.75, t1: 19.9, box: { x: 70, y: 1210, w: 940, a: "c" }, deco: "under", lines: [{ text: "من غير ما", size: 70 }, { text: "تقعد تستنى", size: 128, hl: [1], delay: 0.25, dir: "up" }] },
  { t0: 20.1, t1: 22.0, box: { x: 70, y: 390, w: 840, a: "r" }, deco: "arrow", lines: [{ text: "أيامات الخدمة", size: 104 }, { text: "ينقصوا", size: 156, hl: [0], delay: 0.3, dir: "down" }] },
  { t0: 22.1, t1: 24.75, box: { x: 70, y: 880, w: 700, a: "l" }, deco: "brackets", lines: [{ text: "تسكر شانطي", size: 104 }, { text: "فيسع", size: 170, hl: [0], delay: 0.3, dir: "right" }] },
  { t0: 28.3, t1: 29.5, box: { x: 70, y: 760, w: 940, a: "c" }, deco: "under", lines: [{ text: "ما تضيعش", size: 132 }, { text: "الفرصة", size: 176, hl: [0], delay: 0.25, dir: "up" }] },
  { t0: 29.55, t1: 31.55, box: { x: 70, y: 1010, w: 840, a: "r" }, deco: "under", lines: [{ text: "كلمنا توا", size: 150, hl: [1] }, { text: "و إحسب ربحك", size: 72, delay: 0.7, dir: "left" }] },
];
const STATS: Stat[] = [
  { t0: 12.0, t1: 13.55, box: { x: 70, y: 600, w: 940, a: "c" }, num: 48, unit: "ساعة" },
  { t0: 13.6, t1: 15.4, box: { x: 70, y: 1010, w: 940, a: "l" }, num: 1000, prefix: "+", unit: "m²", sub: "أكثر من ألف مترو" },
];
// cascade « أزيد projets / أزيد فلوس / و ربح صافي »
const CASCADE = { t0: 25.0, t1: 28.1, rows: [
  { t: 25.05, text: "أزيد projets", size: 118, box: { x: 70, y: 1010, w: 840, a: "r" as const } },
  { t: 26.08, text: "أزيد فلوس", size: 118, box: { x: 70, y: 1170, w: 840, a: "c" as const } },
  { t: 27.08, text: "و ربح صافي", size: 132, box: { x: 70, y: 1330, w: 840, a: "l" as const }, hl: [1, 2] },
] };

// fin : flou progressif + logo + swipe vers l'outro (qui porte les contacts)
const BLUR0 = 30.7, BLUR1 = 32.0, LOGO_T = 31.55, SWIPE_T = 32.62;

const beatScale = (t: number) => 1 + 0.016 * Math.exp(-(((t * 112) / 60) % 1) * 6);

const Hl: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const p = expoOut(prog(t, t0 + 0.12, 0.45));
  return <div style={{ position: "absolute", inset: "6% -2% 2% -2%", background: RED, borderRadius: 18, transformOrigin: "right center", transform: `scaleX(${p})`, boxShadow: "0 8px 28px rgba(10,14,60,0.45)" }} />;
};

const Word: React.FC<{ w: string; t: number; t0: number; i: number; size: number; hl: boolean; dir: Line["dir"]; color?: string }> = ({ w, t, t0, i, size, hl, dir, color }) => {
  const d = t0 + i * 0.09;
  if (isLatin(w)) {
    return (
      <span style={{ position: "relative", display: "inline-block", padding: "0 .08em", direction: "ltr" }}>
        {hl && <Hl t={t} t0={d} />}
        {[...w].map((ch, k) => {
          const x = prog(t, d + k * 0.04, 0.9); const e = elastic(x, 1.1, 0.5);
          return <span key={k} style={{ display: "inline-block", fontWeight: 800, fontSize: size, color: "#fff", textShadow: SHADOW, opacity: cl(x * 6), transform: `translateY(${(1 - e) * -70}px) rotate(${(1 - e) * 24}deg) scale(${0.35 + 0.65 * e})`, transformOrigin: "50% 100%" }}>{ch}</span>;
        })}
      </span>
    );
  }
  const x = prog(t, d, 0.95); const e = elastic(x, 1, 0.6);
  const o = 1 - e;
  const tx = dir === "left" ? -o * 160 : dir === "right" ? o * 160 : 0;
  const ty = dir === "down" ? -o * 130 : dir === "up" ? o * 130 : dir === "left" || dir === "right" ? 0 : o * 90;
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 .1em" }}>
      {hl && <Hl t={t} t0={d} />}
      <span style={{ position: "relative", display: "inline-block", fontWeight: 800, fontSize: size, lineHeight: 1.25, color: color || "#fff", textShadow: hl ? "0 2px 10px rgba(10,14,60,0.5)" : SHADOW, opacity: cl(x * 5), transform: `translate(${tx}px, ${ty}px) scale(${0.6 + 0.4 * e}) skewX(${o * -10}deg)`, filter: `blur(${(1 - cl(x * 2.2)) * 10}px)` }}>{w}</span>
    </span>
  );
};

const justify = (a: Box["a"]) => (a === "r" ? "flex-start" : a === "l" ? "flex-end" : "center"); // direction:rtl inverse

const Deco: React.FC<{ kind: NonNullable<Piece["deco"]>; box: Box; t: number; t0: number; yEnd: number }> = ({ kind, box, t, t0, yEnd }) => {
  const p = expoOut(prog(t, t0 + 0.5, 0.7));
  const x2 = box.x + box.w; const cx = box.x + box.w / 2;
  const S = { position: "absolute" as const, left: 0, top: 0, overflow: "visible" as const };
  if (kind === "under") {
    const len = 360; const sx = box.a === "r" ? x2 - len : box.a === "l" ? box.x : cx - len / 2;
    return <svg width={1080} height={1920} style={S}><path d={`M${sx} ${yEnd + 18} q ${len / 4} -16 ${len / 2} 0 t ${len / 2} 0`} pathLength={1} fill="none" stroke={RED} strokeWidth={9} strokeLinecap="round" strokeDasharray={1} strokeDashoffset={1 - p} /></svg>;
  }
  if (kind === "brackets") {
    const l = 56; const y0 = box.y - 26; const x0 = box.x - 20; const x1 = x0 + Math.min(box.w, 640);
    return <svg width={1080} height={1920} style={S}>
      <path d={`M${x0} ${y0 + l} V${y0} H${x0 + l}`} pathLength={1} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeDasharray={1} strokeDashoffset={1 - p} />
      <path d={`M${x1} ${yEnd + 20 - l} V${yEnd + 20} H${x1 - l}`} pathLength={1} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeDasharray={1} strokeDashoffset={1 - p} /></svg>;
  }
  const ax = box.a === "r" ? x2 - 60 : cx; const y0 = yEnd + 10;
  return <svg width={1080} height={1920} style={S}><path d={`M${ax} ${y0} V${y0 + 90} M${ax - 26} ${y0 + 62} L${ax} ${y0 + 92} L${ax + 26} ${y0 + 62}`} pathLength={1} fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1} strokeDashoffset={1 - p} /></svg>;
};

const PieceView: React.FC<{ p: Piece; t: number }> = ({ p, t }) => {
  const e = expoOut(prog(t, p.t1 - 0.26, 0.26));
  const heights = p.lines.map((l) => l.size * 1.3);
  const total = heights.reduce((a, b) => a + b, 0);
  return (
    <>
      <div style={{ position: "absolute", left: p.box.x, top: p.box.y, width: p.box.w, fontFamily: FONT, direction: "rtl", opacity: 1 - e, transform: `translateY(${e * -26}px) scale(${1 - e * 0.05})`, filter: `blur(${e * 8}px)` }}>
        {p.lines.map((l, i) => (
          <div key={i} style={{ display: "flex", flexWrap: "wrap", justifyContent: justify(p.box.a), alignItems: "center", gap: `0 ${Math.round(l.size * 0.16)}px`, lineHeight: 1.3, height: heights[i] }}>
            {l.text.split(" ").map((w, k) => <Word key={k} w={w} t={t} t0={p.t0 + (l.delay || 0)} i={k} size={l.size} hl={!!l.hl?.includes(k)} dir={l.dir} color={l.color} />)}
          </div>
        ))}
      </div>
      {p.deco && <div style={{ opacity: 1 - e }}><Deco kind={p.deco} box={p.box} t={t} t0={p.t0} yEnd={p.box.y + total} /></div>}
    </>
  );
};

const StatView: React.FC<{ s: Stat; t: number }> = ({ s, t }) => {
  const out = expoOut(prog(t, s.t1 - 0.26, 0.26));
  const c = expoOut(prog(t, s.t0 + 0.05, 0.85));
  const v = Math.round(s.num * c);
  const txt = s.num >= 1000 ? String(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : String(v);
  const x = prog(t, s.t0, 0.9); const e = elastic(x, 1.15, 0.55);
  const bar = expoOut(prog(t, s.t0 + 0.2, 0.6));
  const sp = expoOut(prog(t, s.t0 + 0.45, 0.4));
  return (
    <div style={{ position: "absolute", left: s.box.x, top: s.box.y, width: s.box.w, fontFamily: FONT, opacity: 1 - out, transform: `translateY(${out * -26}px) scale(${beatScale(t)})`, filter: `blur(${out * 8}px)` }}>
      <div style={{ display: "flex", justifyContent: s.box.a === "c" ? "center" : "flex-start", alignItems: "baseline", gap: 22, opacity: cl(x * 6), transform: `scale(${0.4 + 0.6 * e}) rotate(${(1 - e) * -6}deg)`, transformOrigin: "50% 80%" }}>
        <span style={{ fontWeight: 800, fontSize: 280, lineHeight: 1, color: "#fff", letterSpacing: -8, textShadow: SHADOW }}>{s.prefix}{txt}</span>
        <span style={{ fontWeight: 800, fontSize: 100, color: "#fff", textShadow: SHADOW }}>{s.unit}</span>
      </div>
      <div style={{ height: 10, width: 560 * bar, background: RED, borderRadius: 5, margin: s.box.a === "c" ? "6px auto 14px" : "6px 0 14px", boxShadow: "0 4px 14px rgba(10,14,60,0.5)" }} />
      {s.sub && <div style={{ direction: "rtl", textAlign: s.box.a === "l" ? "left" : "center", fontWeight: 800, fontSize: 64, color: "#fff", textShadow: SHADOW, opacity: sp, transform: `translateY(${(1 - sp) * 30}px)` }}>{s.sub}</div>}
    </div>
  );
};

const Cascade: React.FC<{ t: number }> = ({ t }) => {
  const out = expoOut(prog(t, CASCADE.t1 - 0.26, 0.26));
  return (
    <div style={{ opacity: 1 - out, filter: `blur(${out * 8}px)` }}>
      {CASCADE.rows.map((r, i) => {
        const p: Piece = { t0: r.t, t1: 99, box: r.box, lines: [{ text: r.text, size: r.size, hl: (r as { hl?: number[] }).hl, dir: i === 1 ? "down" : i === 2 ? "right" : "left" }] };
        return <PieceView key={i} p={p} t={t} />;
      })}
    </div>
  );
};

const LogoEnd: React.FC<{ t: number }> = ({ t }) => {
  const x = prog(t, LOGO_T, 1.0); const e = elastic(x, 1.15, 0.55);
  const ring = expoOut(prog(t, LOGO_T + 0.05, 0.7));
  const s = 0.56;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: cl(x * 5) }}>
      <circle cx={540} cy={900} r={340} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} transform="rotate(-90 540 900)" />
      <g transform={`translate(540 900) scale(${s * (0.5 + 0.5 * e)}) translate(-485 -125)`}>
        {LOGO_PATHS.map((p, i) => (p.rect ? <rect key={i} x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} fill="#fff" /> : <path key={i} d={p.d} fill={p.c === "r" ? RED : "#fff"} />))}
      </g>
    </svg>
  );
};

const Swipe: React.FC<{ t: number }> = ({ t }) => {
  if (t < SWIPE_T) return null;
  const a = expoOut(prog(t, SWIPE_T, 0.2)); const b = expoOut(prog(t, SWIPE_T + 0.07, 0.2));
  return (<>
    <div style={{ position: "absolute", inset: 0, background: RED, transform: `translateX(${(1 - a) * -1080}px)` }} />
    <div style={{ position: "absolute", inset: 0, background: NAVY, transform: `translateX(${(1 - b) * -1080}px)` }} />
  </>);
};

export const Livraison: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = f / fps;
  const blur = interpolate(t, [BLUR0, BLUR1], [0, 34], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tint = interpolate(t, [BLUR0, BLUR1], [0.0, 0.62], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = interpolate(t, [BLUR0, SWIPE_T + 0.3], [1, 1.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <IsoFonts>
      <AbsoluteFill style={{ background: NAVY, overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: `scale(${zoom})`, filter: `blur(${blur}px)` }}>
          <OffthreadVideo src={staticFile("liv_base.mp4")} style={{ width: 1080, height: 1920 }} muted />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(25,34,109,0.18), rgba(25,34,109,0.28))" }} />
        <AbsoluteFill style={{ background: NAVY, opacity: tint }} />
        {PIECES.map((p, i) => (t >= p.t0 - 0.02 && t <= p.t1 + 0.05 ? <PieceView key={i} p={p} t={t} /> : null))}
        {STATS.map((s, i) => (t >= s.t0 - 0.02 && t <= s.t1 + 0.05 ? <StatView key={i} s={s} t={t} /> : null))}
        {t >= CASCADE.t0 - 0.02 && t <= CASCADE.t1 + 0.05 && <Cascade t={t} />}
        {t >= LOGO_T && <LogoEnd t={t} />}
        <Swipe t={t} />
      </AbsoluteFill>
    </IsoFonts>
  );
};
