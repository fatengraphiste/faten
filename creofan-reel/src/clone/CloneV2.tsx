import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Loop, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { MixedText } from "../components";
import { OutroIcon } from "../outro/OutroIcon";
import { ENV } from "./envelope";
import "../theme";

// CREOFAN — motion v2 : point qui trace la ligne + texte, carte profil, bande de voix réelle, packaging.
// Règles : jamais de rouge sur rouge, aucun élément superposé, tout apparaît au moment où la voix le dit.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const RED = "#f7322a";
const PINK = "#fa8985";
const BEIGE = "#fff5f5";
const CHAR = "#1A1A1A";
const WHITE = "#ffffff";
const FONT = "Poppins, sans-serif";
const L = 90;
const RG = 900;
const W = RG - L; // 810
const CX = (L + RG) / 2;

const SEG: [number, number][] = [[0, 0.83], [1.31, 3.93], [4.47, 5.89], [6.24, 7.43], [7.76, 9.88], [10.29, 12.88], [13.2, 14.49], [14.87, 18.44], [18.87, 22.65], [22.98, 24.1], [24.47, 25.9], [26.11, 28.41], [28.79, 31.88], [32.25, 34.27]];
const TXT: string[][] = [
  ["شنوة", "رايك؟"],
  ["أكيد", "الـ", "produit", "متاعك", "زاد", "نوّر", "في", "الفيديو", "هذا!"],
  ["معاك", "فاتن", "من", "Creofan"],
  ["ومن", "غير", "ما", "نطول", "عليك،"],
  ["هذي", "هي", "الـ", "qualité", "اللي", "نجم", "نخدمك", "بيها."],
  ["إنت", "ما", "عليك", "كان", "تبعثلي", "التصاور", "والـ", "charte", "متاعكم،"],
  ["وأنا", "نتكفل", "بالباقي:"],
  ["الفكرة،", "السكريبت،", "والـ", "voix-off", "التونسية", "اللي", "تسمع", "فيها", "توا."],
  ["نجمو", "نخدمو", "بـ", "Packs", "متاع", "4،", "6،", "ولا", "8", "فيديوهات..."],
  ["ولا", "بنظام", "الـ", "Crédits:"],
  ["تشري", "رصيد", "متاع", "فيديوهات"],
  ["وتستهلكو", "على", "3", "شهور", "وقت", "ما", "تستحق."],
  ["كان", "عجبك", "الـ", "style", "وتحب", "نخرجو", "الـ", "produits", "متاعكم", "هكا،"],
  ["تواصل", "معايا", "وخلينا", "نحكيو."],
];
const WT: number[][] = TXT.map((ws, k) => {
  const [a, b] = SEG[k];
  const tot = ws.reduce((n, w) => n + w.length + 1.5, 0);
  let acc = 0;
  return ws.map((w) => {
    const at = s(a + ((b - a) * acc) / tot);
    acc += w.length + 1.5;
    return at;
  });
});
const wt = (k: number, i: number) => WT[k][i];
const segEnd = (k: number) => s(SEG[k][1]);

const CUT = [0, s(1.07), s(4.2), s(6.05), s(10.1), s(13.0), s(14.7), s(18.65), s(22.8), s(24.3), s(28.6), s(32.05)];
const OUT = s(34.3);
export const CLONE2_DURATION = OUT + 140;
const BG = (i: number) => (i % 2 === 0 ? RED : BEIGE);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number, a: number, d: number, e = Easing.bezier(0.65, 0, 0.35, 1)) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: e });
const outE = (t: number, a: number, d: number) => ease(t, a, d, Easing.bezier(0.16, 1, 0.3, 1));
const el = (t: number, a: number, damping = 12) => (t < a ? 0 : spring({ frame: t - a, fps: FPS, config: { damping, stiffness: 170, mass: 0.8 } }));
const ARABIC = /[؀-ۿ]/;

const Big: React.FC<{ size: number; color: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color, children, style }) => (
  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 0.95, letterSpacing: -size * 0.035, color, whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Pill: React.FC<{ text: string; c: string; fg: string; size?: number; style?: React.CSSProperties }> = ({ text, c, fg, size = 44, style }) => (
  <span style={{ display: "inline-block", backgroundColor: c, borderRadius: 999, padding: `${size * 0.12}px ${size * 0.62}px ${size * 0.22}px`, whiteSpace: "nowrap", ...style }}>
    <MixedText text={text} size={size} color={fg} latinColor={fg} style={{ lineHeight: 1.15 }} />
  </span>
);
const Box: React.FC<{ x: number; y: number; w: number; h: number; c: string; k?: number; r?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, c, k = 1, r = 40, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, backgroundColor: c, borderRadius: r, overflow: "hidden", transform: `translateY(${(1 - k) * 70}px) scale(${0.92 + 0.08 * k})`, opacity: Math.min(1, k * 1.5), ...style }}>{children}</div>
);

// Palette par fond : jamais rouge sur rouge
type Th = { bg: string; ink: string; accent: string; card: string; cardInk: string; cardAccent: string; pillBg: string; pillFg: string };
const TH_RED: Th = { bg: RED, ink: WHITE, accent: WHITE, card: WHITE, cardInk: CHAR, cardAccent: RED, pillBg: CHAR, pillFg: WHITE };
const TH_BEIGE: Th = { bg: BEIGE, ink: CHAR, accent: RED, card: CHAR, cardInk: WHITE, cardAccent: RED, pillBg: RED, pillFg: WHITE };
const THEME = (i: number) => (i % 2 === 0 ? TH_RED : TH_BEIGE);

/* ---------- Ligne de texte + point qui trace la ligne (synchro voix) ---------- */
// Regroupe « الـ » (ou « بـ ») avec le mot latin qui suit
type Unit = { ids: number[] };
const unitsOf = (seg: number, from: number, to: number): Unit[] => {
  const out: Unit[] = [];
  for (let i = from; i < to; i++) {
    const w = TXT[seg][i];
    const next = TXT[seg][i + 1];
    if (ARABIC.test(w) && /ـ$/.test(w) && next && !ARABIC.test(next) && i + 1 < to) { out.push({ ids: [i, i + 1] }); i++; } else out.push({ ids: [i] });
  }
  return out;
};
const Line: React.FC<{ t: number; th: Th; seg: number; from?: number; to?: number; y: number; size: number; hot?: number[]; dot?: boolean }> = ({ t, th, seg, from = 0, to = TXT[seg].length, y, size: sizeIn, hot = [], dot = true }) => {
  let size = sizeIn;
  const units = unitsOf(seg, from, to);
  // taille ajustée pour que la ligne tienne dans la largeur
  const est = (sz: number) => {
    let w = 0;
    for (const u of units) for (const i of u.ids) { const x = TXT[seg][i]; w += ARABIC.test(x) ? x.length * 0.5 * sz * (x.includes("ـ") ? 0.8 : 1) : x.length * 0.62 * 0.78 * sz + 1.3 * 0.78 * sz; }
    return w + units.length * 0.3 * sz;
  };
  size = size * Math.min(1, (W * 0.97) / est(size));
  const tStart = wt(seg, from);
  const tEnd = to < TXT[seg].length ? wt(seg, to) : segEnd(seg);
  const n = units.length;
  // position du point : chaque unité occupe 1/n de la largeur, atteinte à l'instant où la voix la dit
  const keys = units.map((u, j) => ({ at: wt(seg, u.ids[0]), p: j / n }));
  keys.push({ at: tEnd, p: 1 });
  let p = 0;
  if (t >= keys[0].at) {
    p = 1;
    for (let j = 0; j < keys.length - 1; j++) if (t < keys[j + 1].at) { p = interpolate(t, [keys[j].at, keys[j + 1].at], [keys[j].p, keys[j + 1].p], clamp); break; }
  }
  const dropK = el(t, tStart - 8, 10);
  const ly = y + size * 1.42;
  const dx = RG - p * W;
  const done = t >= tEnd;
  const bounce = done ? Math.abs(Math.sin(Math.min(1, (t - tEnd) / 14) * Math.PI)) * 16 : 0;
  return (
    <>
      <div dir="rtl" style={{ position: "absolute", left: L, width: W, top: y, display: "flex", justifyContent: "center", alignItems: "center", gap: `0 ${size * 0.3}px`, flexWrap: "nowrap" }}>
        {units.map((u, j) => {
          const k = el(t, wt(seg, u.ids[0]), 10);
          return (
            <div key={j} dir="rtl" style={{ display: "flex", alignItems: "center", gap: size * 0.1, opacity: Math.min(1, k * 2), transform: `translateY(${(1 - k) * size * 0.45}px) scale(${0.72 + 0.28 * k})` }}>
              {u.ids.map((i) => {
                const w = TXT[seg][i];
                return ARABIC.test(w) ? <MixedText key={i} text={w} size={size} color={hot.includes(i) ? (th.accent === WHITE ? CHAR : RED) : th.ink} /> : <Pill key={i} text={w} c={th.pillBg} fg={th.pillFg} size={size * 0.78} />;
              })}
            </div>
          );
        })}
      </div>
      {dot ? (
        <>
          <div style={{ position: "absolute", left: dx, top: ly - 3, width: RG - dx, height: 6, borderRadius: 6, backgroundColor: th.ink, opacity: 0.4 * Math.min(1, dropK * 2) }} />
          <div style={{ position: "absolute", left: dx - 19, top: ly - 19 - (1 - dropK) * 90 - bounce, width: 38, height: 38, borderRadius: 99, backgroundColor: th.accent, opacity: Math.min(1, dropK * 2) }} />
        </>
      ) : null}
    </>
  );
};

/* ---------- Cercles concentriques (fond) ---------- */
const Rings: React.FC<{ t: number; at: number; th: Th; cy?: number }> = ({ t, at, th, cy = 700 }) => {
  const dark = th.bg === RED;
  const k = outE(t, at, 24);
  const pulse = 1 + Math.sin(t / 22) * 0.02;
  const rings = [{ r: 820, c: dark ? "rgba(255,255,255,0.06)" : "rgba(250,137,133,0.22)" }, { r: 520, c: dark ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.7)" }, { r: 260, c: dark ? "rgba(255,255,255,0.06)" : "rgba(250,137,133,0.22)" }];
  return (
    <>
      {rings.map((rg, i) => {
        const r = rg.r * k * pulse;
        return <div key={i} style={{ position: "absolute", left: CX - r, top: cy - r, width: 2 * r, height: 2 * r, borderRadius: 9999, backgroundColor: rg.c }} />;
      })}
    </>
  );
};

/* ---------- Icônes au trait ---------- */
const Ico: React.FC<{ d: string; c: string; size: number; w?: number; fill?: string }> = ({ d, c, size, w = 1.8, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const I_BULB = "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z";
const I_DOC = "M6 3h9l3 3v15H6zM9 10h6M9 14h6M9 18h4";
const I_MIC = "M9 3h6v10a3 3 0 0 1-6 0zM5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7";
const I_PLAY = "M8 5l11 7-11 7z";
const I_STAR = "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z";
const I_MSG = "M4 5h16v11H9l-5 4zM8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01";
const I_BELL = "M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 21h4";
const HEART = "M12 20.5S3 15 3 8.8A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 9 2.4C21 15 12 20.5 12 20.5z";
const FOLLOW = "M15 19c0-3.3-2.7-6-6-6s-6 2.7-6 6M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M19 8v6M16 11h6";
const REPOST = "M17 2.5l3.5 3.5-3.5 3.5M3.5 11.5v-1A4.5 4.5 0 0 1 8 6h12.5M7 21.5L3.5 18 7 14.5M20.5 12.5v1A4.5 4.5 0 0 1 16 18H3.5";
const WA = "M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2C11 19.5 4.5 13 4.5 5a2 2 0 0 1 2-2z";

/* ---------- Packaging premium (à plat, sans mockup) ---------- */
// plain : boîte neutre ; sinon boîte de marque. `shine` 0→1 : un reflet traverse la face avant.
const Pack: React.FC<{ w: number; h: number; plain?: boolean; reveal: number; shine?: number; t: number }> = ({ w, h, plain, reveal, shine = 0, t }) => {
  const sd = w * 0.2; // épaisseur de la face latérale
  const front = plain ? "#e9ddd9" : CHAR;
  const side = plain ? "#d6c8c3" : "#000000";
  const topc = plain ? "#f4ebe8" : "#3a3a3a";
  const ink = plain ? "#b9a9a4" : WHITE;
  const draw = (a: number, b: number) => ease(reveal, a, b - a, Easing.out(Easing.cubic));
  const cx = (w - sd) / 2;
  const sx = interpolate(shine, [0, 1], [-w * 0.6, w * 1.3]);
  return (
    <svg width={w + sd} height={h + sd * 0.6} viewBox={`0 0 ${w + sd} ${h + sd * 0.6}`}>
      <defs>
        <clipPath id={`fc${plain ? 0 : 1}`}><rect x={0} y={sd * 0.6} width={w - sd * 0.0} height={h} rx={10} /></clipPath>
      </defs>
      {/* face latérale */}
      <polygon points={`${w},${sd * 0.6} ${w + sd},0 ${w + sd},${h} ${w},${h + sd * 0.6}`} fill={side} />
      {/* dessus */}
      <polygon points={`0,${sd * 0.6} ${sd},0 ${w + sd},0 ${w},${sd * 0.6}`} fill={topc} />
      {/* face avant */}
      <rect x={0} y={sd * 0.6} width={w} height={h} rx={6} fill={front} />
      <g clipPath={`url(#fc${plain ? 0 : 1})`}>
        {!plain ? <rect x={0} y={sd * 0.6 + h * 0.72} width={w} height={h * 0.28 * draw(0.2, 0.6)} fill={RED} /> : null}
        <rect x={0} y={sd * 0.6 + h * 0.06} width={w} height={3} fill={plain ? "#cdbdb8" : PINK} opacity={draw(0.1, 0.4)} />
        {/* emblème : cercle qui se dessine */}
        <circle cx={cx} cy={sd * 0.6 + h * 0.3} r={w * 0.2} fill="none" stroke={ink} strokeWidth={plain ? 3 : 4} pathLength={1} strokeDasharray={`${draw(0, 0.5)} 1`} transform={`rotate(-90 ${cx} ${sd * 0.6 + h * 0.3})`} />
        {!plain ? <circle cx={cx} cy={sd * 0.6 + h * 0.3} r={w * 0.06} fill={WHITE} opacity={draw(0.4, 0.7)} /> : null}
        {/* lignes de texte */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={w * 0.14} y={sd * 0.6 + h * 0.52 + i * h * 0.05} width={(w * 0.72) * draw(0.3 + i * 0.1, 0.6 + i * 0.1) * (i === 2 ? 0.55 : 1)} height={h * 0.014} rx={3} fill={ink} opacity={plain ? 0.7 : 0.85} />
        ))}
        {/* reflet */}
        {shine > 0 ? <polygon points={`${sx},${sd * 0.6 + h} ${sx + w * 0.22},${sd * 0.6} ${sx + w * 0.42},${sd * 0.6} ${sx + w * 0.2},${sd * 0.6 + h}`} fill={WHITE} opacity={0.16} /> : null}
      </g>
      {!plain ? <circle cx={w - 18} cy={sd * 0.6 + 18} r={4 + Math.sin(t / 6) * 0.8} fill={RED} /> : null}
    </svg>
  );
};

/* ---------- Carte profil persistante : avatar réduit, nom, fonction, bande de voix ---------- */
const CARD_TOP0 = 1165;
const CARD_H0 = 315;
const CARD_H1 = 755;
const Profile: React.FC<{ t: number; th: Th; open: number; follow: number }> = ({ t, th, open, follow }) => {
  const h = interpolate(open, [0, 1], [CARD_H0, CARD_H1]);
  const top = CARD_TOP0 + CARD_H0 - h;
  const D = 190;
  const speaking = SEG.some(([a, b]) => t >= s(a) && t <= s(b) + 3);
  const e = (f: number) => ENV[Math.max(0, Math.min(ENV.length - 1, f))] ?? 0;
  const pulse = speaking ? 1 + e(t) * 0.07 : 1;
  const fg = th.cardInk;
  const tagBg = th.card === WHITE ? BEIGE : "#2f2f2f";
  return (
    <div style={{ position: "absolute", left: L, top, width: W, height: h, borderRadius: 48, backgroundColor: th.card, overflow: "hidden", zIndex: 25 }}>
      {/* en-tête : avatar + nom + fonction */}
      <div style={{ position: "absolute", left: 30, top: 28, width: D, height: D }}>
        <div style={{ position: "absolute", left: -10, top: -10, width: D + 20, height: D + 20, borderRadius: 9999, border: `5px solid ${RED}`, opacity: speaking ? 1 : 0.35, transform: `scale(${pulse})` }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 9999, overflow: "hidden", backgroundColor: CHAR }}>
          <OffthreadVideo src={staticFile("clone/clone.mp4")} muted style={{ position: "absolute", left: -2, top: D / 2 - 640 * 0.23, width: 1080 * 0.23, height: 1920 * 0.23, objectFit: "cover" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 255, top: 44 }}>
        <Big size={58} color={fg}>Faten Torki</Big>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 29, color: fg, opacity: 0.75, marginTop: 14, whiteSpace: "nowrap" }}>Graphiste · Motion designer</div>
        <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 10, backgroundColor: RED, borderRadius: 999, padding: "6px 20px 8px" }}>
          <span style={{ width: 14, height: 14, borderRadius: 99, backgroundColor: WHITE, opacity: 0.6 + 0.4 * Math.abs(Math.sin(t / 10)) }} />
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: 2, color: WHITE }}>FONDATRICE · CREOFAN</span>
        </div>
      </div>
      {/* bloc déployé : tags, description, bouton Suivre */}
      <div style={{ position: "absolute", left: 30, right: 30, top: 250, opacity: ease(open, 0.35, 0.55), transform: `translateY(${(1 - open) * 40}px)` }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "nowrap" }}>
          {["Motion design", "Canva × IA", "Voix-off IA"].map((tg) => (
            <span key={tg} style={{ backgroundColor: tagBg, color: fg, fontFamily: FONT, fontWeight: 600, fontSize: 26, borderRadius: 999, padding: "8px 22px 10px", whiteSpace: "nowrap" }}>{tg}</span>
          ))}
        </div>
        <div style={{ marginTop: 26, fontFamily: FONT, fontWeight: 400, fontSize: 31, lineHeight: 1.4, color: fg, opacity: 0.8, width: 740 }}>
          Graphiste tunisienne. Je crée visuels, vidéos motion et voix-off avec l'IA pour les marques.
        </div>
        <div style={{ marginTop: 34, display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 430, height: 104, borderRadius: 999, backgroundColor: follow > 0.5 ? RED : th.card === WHITE ? CHAR : WHITE, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, transform: `scale(${1 - 0.06 * Math.sin(Math.min(1, follow) * Math.PI)})` }}>
            <Ico d={follow > 0.5 ? "M5 12.5l4.5 4.5L19 7.5" : "M12 5v14M5 12h14"} c={follow > 0.5 || th.card === WHITE ? WHITE : CHAR} size={44} w={2.6} />
            <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 38, color: follow > 0.5 || th.card === WHITE ? WHITE : CHAR }}>{follow > 0.5 ? "Suivie" : "Suivre"}</span>
          </div>
          {[I_MSG, I_BELL].map((d, i) => (
            <div key={i} style={{ width: 104, height: 104, borderRadius: 99, border: `3px solid ${th.card === WHITE ? "#e8e0dd" : "#444"}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico d={d} c={fg} size={46} w={1.6} /></div>
          ))}
        </div>
      </div>
      {/* bande de voix : l'amplitude réelle de la voix, défilante */}
      <div style={{ position: "absolute", left: 30, right: 30, top: h - 100, height: 70, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 56, height: 56, borderRadius: 99, backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico d={I_MIC} c={WHITE} size={30} w={2} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, height: 70, flex: 1, justifyContent: "flex-end", overflow: "hidden" }}>
          {Array.from({ length: 36 }).map((_, j) => {
            const v = speaking || t < OUT ? e(t - (35 - j)) : 0;
            return <div key={j} style={{ width: 11, flexShrink: 0, borderRadius: 6, backgroundColor: j > 31 ? RED : th.card === WHITE ? "#cfc6c3" : "#6a6a6a", height: 8 + v * 58 }} />;
          })}
        </div>
      </div>
    </div>
  );
};

/* ---------- Scènes : zone principale y 330 → 1100 (la carte occupe 1165 → 1480) ---------- */
type SP = { t: number; th: Th };

const SA: React.FC<SP> = ({ t, th }) => (
  <>
    <Rings t={t} at={0} th={th} cy={640} />
    <Line t={t} th={th} seg={0} from={0} to={1} y={400} size={230} />
    <Line t={t} th={th} seg={0} from={1} to={2} y={720} size={230} />
  </>
);
const SB: React.FC<SP> = ({ t, th }) => {
  const reveal = ease(t, wt(1, 2), 40);
  const shine = ease(t, wt(1, 5), 24);
  return (
    <>
      <Rings t={t} at={CUT[1]} th={th} cy={720} />
      <Line t={t} th={th} seg={1} from={0} to={4} y={330} size={96} />
      <Line t={t} th={th} seg={1} from={4} y={480} size={96} hot={[5]} />
      <div style={{ position: "absolute", left: CX - 168, top: 640 + (1 - el(t, wt(1, 2), 11)) * 120, width: 336, opacity: Math.min(1, el(t, wt(1, 2), 11) * 2) }}>
        <Pack w={280} h={400} reveal={reveal} shine={shine} t={t} />
      </div>
    </>
  );
};
const SC: React.FC<SP> = ({ t, th }) => (
  <>
    <Rings t={t} at={CUT[2]} th={th} cy={520} />
    <Line t={t} th={th} seg={2} from={0} to={2} y={340} size={130} />
    <Line t={t} th={th} seg={2} from={2} y={540} size={96} />
  </>
);
const SD: React.FC<SP> = ({ t, th }) => (
  <>
    <Rings t={t} at={CUT[3]} th={th} cy={700} />
    <Line t={t} th={th} seg={3} y={340} size={92} />
    <Line t={t} th={th} seg={4} from={0} to={4} y={500} size={120} />
    <Line t={t} th={th} seg={4} from={4} y={670} size={92} />
    <div style={{ position: "absolute", left: L, width: W, top: 850, display: "flex", justifyContent: "center", gap: 24 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const k = el(t, wt(4, 3) + i * 4, 8);
        return <div key={i} style={{ transform: `scale(${k}) rotate(${(1 - k) * 50}deg)` }}><Ico d={I_STAR} c={th.accent} size={112} fill={th.accent} /></div>;
      })}
    </div>
  </>
);
const SE: React.FC<SP> = ({ t, th }) => {
  const cw = (W - 110) / 2;
  const sw = [RED, PINK, BEIGE, CHAR];
  const wk = el(t, wt(5, 5), 11), wk2 = el(t, wt(5, 7), 11);
  return (
    <>
      <Rings t={t} at={CUT[4]} th={th} cy={700} />
      <Line t={t} th={th} seg={5} from={0} to={5} y={340} size={100} />
      <Box x={L} y={560} w={cw} h={480} c={WHITE} k={wk}>
        <div style={{ position: "absolute", left: 36, right: 36, top: 36, height: 250, borderRadius: 28, backgroundColor: BEIGE, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 40, top: 34, width: 66, height: 66, borderRadius: 99, backgroundColor: RED }} />
          <svg width={cw - 72} height={250} style={{ position: "absolute", inset: 0 }}><polygon points={`0,250 130,100 210,180 270,130 ${cw - 72},210 ${cw - 72},250`} fill={CHAR} /></svg>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, textAlign: "center" }}><MixedText text="التصاور" size={70} color={CHAR} /></div>
      </Box>
      <div style={{ position: "absolute", left: L + cw, top: 760, width: 110, display: "flex", justifyContent: "center", transform: `scale(${wk2})` }}>
        <div style={{ width: 70, height: 70, borderRadius: 99, backgroundColor: CHAR, display: "flex", alignItems: "center", justifyContent: "center" }}><Big size={52} color={WHITE}>+</Big></div>
      </div>
      <Box x={L + cw + 110} y={560} w={cw} h={480} c={CHAR} k={wk2}>
        <div style={{ position: "absolute", left: 36, right: 36, top: 36, height: 250, display: "flex", gap: 14 }}>
          {sw.map((c, i) => <div key={i} style={{ flex: 1, borderRadius: 24, backgroundColor: c, transform: `scaleY(${el(t, wt(5, 7) + i * 3, 9)})`, transformOrigin: "50% 100%" }} />)}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, textAlign: "center" }}><Pill text="charte" c={RED} fg={WHITE} size={56} /></div>
      </Box>
    </>
  );
};
const SF: React.FC<SP> = ({ t, th }) => {
  const draw = ease(t, wt(6, 1) + 4, 16);
  return (
    <>
      <Rings t={t} at={CUT[5]} th={th} cy={700} />
      <Line t={t} th={th} seg={6} from={0} to={2} y={360} size={120} />
      <Line t={t} th={th} seg={6} from={2} y={560} size={120} hot={[2]} />
      <div style={{ position: "absolute", left: CX - 120, top: 790, width: 240, height: 240, borderRadius: 9999, backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${el(t, wt(6, 1), 9)})` }}>
        <svg width={150} height={150} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={WHITE} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} /></svg>
      </div>
    </>
  );
};
const SG: React.FC<SP> = ({ t, th }) => {
  const rows: [string, string, string, string, string, number][] = [
    ["01", "الفكرة", I_BULB, WHITE, CHAR, 0],
    ["02", "السكريبت", I_DOC, CHAR, WHITE, 1],
    ["03", "voix-off", I_MIC, BEIGE, CHAR, 3],
  ];
  return (
    <>
      <Rings t={t} at={CUT[6]} th={th} cy={700} />
      {rows.map(([n, label, ic, c, fg, wi], i) => {
        const k = el(t, wt(7, wi), 11);
        const y = 335 + i * 250;
        const latin = !ARABIC.test(label);
        return (
          <Box key={n} x={L} y={y} w={W} h={220} c={c} k={k}>
            <Big size={108} color={c === CHAR ? PINK : RED} style={{ position: "absolute", left: 34, top: 56, letterSpacing: -6 }}>{n}</Big>
            <div style={{ position: "absolute", right: 150, top: 62 }}>{latin ? <Pill text={label} c={RED} fg={WHITE} size={62} /> : <MixedText text={label} size={78} color={fg} />}</div>
            <div style={{ position: "absolute", right: 36, top: 62 }}><Ico d={ic} c={c === CHAR ? WHITE : RED} size={90} w={1.6} /></div>
            {i === 2 ? (
              <div style={{ position: "absolute", left: 230, top: 140, display: "flex", alignItems: "flex-end", gap: 8, height: 56 }}>
                {Array.from({ length: 16 }).map((_, j) => <div key={j} style={{ width: 10, borderRadius: 6, backgroundColor: RED, height: 12 + (t >= wt(7, 6) ? (ENV[Math.max(0, t - j * 2)] ?? 0) * 42 : 0) }} />)}
              </div>
            ) : null}
          </Box>
        );
      })}
    </>
  );
};
const SH: React.FC<SP> = ({ t, th }) => {
  const cw = (W - 56) / 3;
  const packs: [string, string, string, number][] = [["4", RED, WHITE, 5], ["6", CHAR, WHITE, 6], ["8", PINK, CHAR, 8]];
  return (
    <>
      <Rings t={t} at={CUT[7]} th={th} cy={780} />
      <Line t={t} th={th} seg={8} from={0} to={5} y={340} size={100} />
      {packs.map(([n, c, fg, wi], i) => {
        const k = el(t, wt(8, wi), 10);
        return (
          <Box key={n} x={L + i * (cw + 28)} y={520} w={cw} h={430} c={c} k={k} r={56}>
            <Big size={230} color={fg} style={{ position: "absolute", left: 0, right: 0, top: 36, textAlign: "center", letterSpacing: -12 }}>{n}</Big>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 38, display: "flex", justifyContent: "center", gap: 8 }}>
              {Array.from({ length: Number(n) > 4 ? 3 : 2 }).map((_, j) => <Ico key={j} d={I_PLAY} c={fg} size={40} fill={fg} />)}
            </div>
          </Box>
        );
      })}
      <div style={{ position: "absolute", left: L, width: W, top: 1000, textAlign: "center", transform: `scale(${el(t, wt(8, 9), 9)})` }}>
        <Pill text="فيديوهات" c={th.pillBg} fg={th.pillFg} size={52} />
      </div>
    </>
  );
};
const SI: React.FC<SP> = ({ t, th }) => {
  const k = el(t, wt(9, 3), 11);
  return (
    <>
      <Rings t={t} at={CUT[8]} th={th} cy={700} />
      <Line t={t} th={th} seg={9} from={0} to={3} y={330} size={104} />
      <Line t={t} th={th} seg={9} from={3} y={490} size={130} />
      {/* carte de crédits, à plat */}
      <div style={{ position: "absolute", left: CX - 270, top: 700, width: 540, height: 340, borderRadius: 40, backgroundColor: WHITE, transform: `translateY(${(1 - k) * 120}px) scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k * 2) }}>
        <div style={{ position: "absolute", left: 40, top: 44, width: 90, height: 68, borderRadius: 14, backgroundColor: PINK }} />
        <Big size={44} color={CHAR} style={{ position: "absolute", left: 40, bottom: 44, letterSpacing: 4 }}>CRÉDITS · 3 MOIS</Big>
        <div style={{ position: "absolute", right: 40, top: 44, width: 76, height: 76, borderRadius: 99, backgroundColor: RED }} />
        <div style={{ position: "absolute", right: 80, top: 44, width: 76, height: 76, borderRadius: 99, backgroundColor: CHAR, opacity: 0.9 }} />
      </div>
    </>
  );
};
const SJ: React.FC<SP> = ({ t, th }) => {
  const prog = ease(t, wt(11, 3) - 2, s(1.9));
  const used = Math.floor(prog * 8);
  return (
    <>
      <Rings t={t} at={CUT[9]} th={th} cy={680} />
      <Line t={t} th={th} seg={10} y={340} size={100} />
      <div style={{ position: "absolute", left: CX - 170, top: 490, width: 340, height: 340, transform: `scale(${el(t, wt(11, 0), 10)})` }}>
        <svg width={340} height={340} viewBox="0 0 340 340" style={{ position: "absolute", inset: 0 }}>
          <circle cx={170} cy={170} r={145} fill="none" stroke={PINK} strokeWidth={28} opacity={0.45} />
          <circle cx={170} cy={170} r={145} fill="none" stroke={RED} strokeWidth={28} strokeLinecap="round" strokeDasharray={`${prog * 911} 911`} transform="rotate(-90 170 170)" />
        </svg>
        <Big size={150} color={CHAR} style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", letterSpacing: -8 }}>3</Big>
        <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center" }}><MixedText text="شهور" size={58} color={CHAR} /></div>
      </div>
      <div style={{ position: "absolute", left: L, width: W, top: 870, display: "flex", justifyContent: "center", gap: 14 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ width: 80, height: 80, borderRadius: 22, backgroundColor: i < used ? "#e8d9d6" : RED, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${el(t, CUT[9] + 10 + i * 2, 9)})` }}>
            <Ico d={I_PLAY} c={i < used ? "#c9b5b0" : WHITE} size={36} fill={i < used ? "#c9b5b0" : WHITE} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: L, width: W, top: 990, textAlign: "center", transform: `scale(${el(t, wt(11, 4), 9)})` }}>
        <Pill text="وقت ما تستحق" c={CHAR} fg={WHITE} size={46} />
      </div>
    </>
  );
};
const SK: React.FC<SP> = ({ t, th }) => {
  const reveal = ease(t, wt(12, 7), 40);
  const shine = ease(t, wt(12, 8), 24);
  const aft = el(t, wt(12, 7), 11);
  return (
    <>
      <Rings t={t} at={CUT[10]} th={th} cy={760} />
      <Line t={t} th={th} seg={12} from={0} to={4} y={330} size={96} />
      <Line t={t} th={th} seg={12} from={4} y={480} size={76} />
      <div style={{ position: "absolute", left: L + 40, top: 690 + (1 - el(t, wt(12, 5), 11)) * 100, opacity: Math.min(1, el(t, wt(12, 5), 11) * 2) }}>
        <Pack w={200} h={320} plain reveal={1} t={t} />
      </div>
      <div style={{ position: "absolute", left: CX - 40, top: 820, width: 80, height: 80, borderRadius: 99, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${aft})` }}>
        <Ico d="M5 12h13M13 6l6 6-6 6" c={CHAR} size={46} w={2.6} />
      </div>
      <div style={{ position: "absolute", left: RG - 290, top: 690 + (1 - aft) * 100, opacity: Math.min(1, aft * 2) }}>
        <Pack w={200} h={320} reveal={reveal} shine={shine} t={t} />
      </div>
    </>
  );
};
const SL: React.FC<SP> = ({ t, th }) => (
  <>
    <Rings t={t} at={CUT[11]} th={th} cy={700} />
    <Line t={t} th={th} seg={13} from={0} to={2} y={340} size={150} />
    <Line t={t} th={th} seg={13} from={2} y={540} size={110} hot={[3]} />
    <div style={{ position: "absolute", left: CX - 330, top: 790, width: 660, transform: `scale(${el(t, wt(13, 2), 9) * (1 + Math.sin(t / 8) * 0.012)})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, backgroundColor: RED, borderRadius: 999, padding: "20px 44px 20px 26px" }}>
        <div style={{ width: 96, height: 96, borderRadius: 99, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico d={WA} c={RED} size={58} w={2} fill={RED} /></div>
        <Big size={76} color={WHITE}>51 097 272</Big>
      </div>
    </div>
  </>
);

// Outro : même fin que les autres vidéos, avec le numéro WhatsApp
const ICONS = [{ label: "Suivre", d: FOLLOW, fill: false }, { label: "J'aime", d: HEART, fill: true }, { label: "Partager", d: REPOST, fill: false }];
const Outro: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ backgroundColor: RED }}>
    <OutroIcon f={t - OUT} fg={WHITE} bg="transparent" size={420} cy={760} />
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1060, display: "flex", justifyContent: "center", gap: 70 }}>
      {ICONS.map((ic, i) => {
        const at = OUT + 58 + i * 6;
        const k = el(t, at, 9);
        const tapAt = OUT + 88 + i * 14;
        const tap = interpolate(t, [tapAt - 4, tapAt, tapAt + 8], [1, 0.82, 1], clamp);
        const on = t >= tapAt;
        return (
          <div key={ic.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: t >= at ? 1 : 0, transform: `translateY(${(1 - k) * 120}px) scale(${k * tap})` }}>
            <div style={{ width: 150, height: 150, borderRadius: 999, border: `5px solid ${WHITE}`, backgroundColor: on ? WHITE : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={78} height={78} viewBox="0 0 24 24" fill={on && ic.fill ? RED : "none"} stroke={on ? RED : WHITE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={ic.d} /></svg>
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 34, color: WHITE }}>{ic.label}</div>
          </div>
        );
      })}
    </div>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1340, display: "flex", justifyContent: "center", transform: `scale(${el(t, OUT + 104, 9)})` }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 16, backgroundColor: WHITE, borderRadius: 999, padding: "14px 36px 14px 20px" }}>
        <span style={{ width: 62, height: 62, borderRadius: 99, backgroundColor: RED, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Ico d={WA} c={WHITE} size={36} w={2} fill={WHITE} /></span>
        <Big size={52} color={RED}>51 097 272</Big>
      </span>
    </div>
  </AbsoluteFill>
);

// Transition : disque de la couleur du plan suivant, bordé d'un anneau de contraste
const Ripple: React.FC<{ t: number; at: number; c: string }> = ({ t, at, c }) => {
  if (t < at - 12 || t > at + 1) return null;
  const r = interpolate(t, [at - 12, at], [0, 1500], { ...clamp, easing: Easing.bezier(0.7, 0, 0.3, 1) });
  return (
    <>
      <div style={{ position: "absolute", left: CX - r - 34, top: 720 - r - 34, width: 2 * r + 68, height: 2 * r + 68, borderRadius: 9999, backgroundColor: c === RED ? CHAR : RED, zIndex: 40 }} />
      <div style={{ position: "absolute", left: CX - r, top: 720 - r, width: 2 * r, height: 2 * r, borderRadius: 9999, backgroundColor: c, zIndex: 41 }} />
    </>
  );
};

type S = [string, number, number, number];
const SFX: S[] = [
  ["cc/pop.wav", wt(0, 0), 6, 0.6],
  ["regard/snap.wav", wt(0, 1), 4, 0.5],
  ["cc/pop.wav", wt(1, 2), 6, 0.5],
  ["ame/shimmer.wav", wt(1, 5), 50, 0.4],
  ["cc/ding.wav", wt(2, 3), 30, 0.4],
  ["ame/boom.wav", CUT[2] + 4, 40, 0.35],
  ...[0, 1, 2, 3, 4].map((i) => ["cc/pop.wav", wt(4, 3) + i * 4, 6, 0.35] as S),
  ["cc/pop.wav", wt(5, 5), 6, 0.5],
  ["cc/pop.wav", wt(5, 7), 6, 0.5],
  ["cc/click.wav", wt(6, 1) + 4, 3, 0.7],
  ...[0, 1, 3].map((i) => ["cc/pop.wav", wt(7, i), 6, 0.5] as S),
  ...[5, 6, 8].map((i) => ["cc/pop.wav", wt(8, i), 6, 0.55] as S),
  ...[0, 1, 2].map((i) => ["cc/click.wav", wt(9, 3) + i * 3, 3, 0.5] as S),
  ["cc/ding.wav", wt(10, 1), 30, 0.35],
  ["regard/riser.wav", wt(11, 3), 50, 0.3],
  ["cc/pop.wav", wt(11, 4), 6, 0.5],
  ["cc/pop.wav", wt(12, 5), 6, 0.5],
  ["cc/whoosh.wav", wt(12, 7), 15, 0.45],
  ["cc/pop.wav", wt(13, 2), 6, 0.55],
  ["cc/ding.wav", wt(13, 3), 30, 0.4],
  ["cc/click.wav", wt(2, 3) + 6, 3, 0.7],
  ...CUT.slice(1).map((c) => ["cc/whoosh.wav", c - 10, 15, 0.45] as S),
  ["cc/whoosh.wav", OUT - 10, 15, 0.45],
  ["ame/shimmer.wav", OUT, 60, 0.35],
  ["ame/boom.wav", OUT + 62, 60, 0.4],
  ...[0, 1, 2].map((i) => ["cc/pop.wav", OUT + 58 + i * 6, 6, 0.45] as S),
  ...[0, 1, 2].map((i) => ["cc/click.wav", OUT + 88 + i * 14, 3, 0.6] as S),
  ["cc/pop.wav", OUT + 104, 6, 0.5],
];

const SCENES = [SA, SB, SC, SD, SE, SF, SG, SH, SI, SJ, SK, SL];

export const CloneV2: React.FC = () => {
  const t = useCurrentFrame();
  let i = 0;
  while (i < 11 && t >= CUT[i + 1]) i++;
  const Scene = SCENES[i];
  const th = THEME(i);
  const inOutro = t >= OUT;
  // la carte profil s'ouvre pendant « معاك فاتن من Creofan », puis se referme
  const open = ease(t, CUT[2] + 2, 14) * (1 - ease(t, CUT[3] - 12, 12));
  const follow = ease(t, wt(2, 3) + 6, 10) * (open > 0.5 ? 1 : 0);
  return (
    <AbsoluteFill style={{ backgroundColor: inOutro ? RED : th.bg, overflow: "hidden" }}>
      {!inOutro ? (
        <>
          <Scene t={t} th={th} />
          <Profile t={t} th={th} open={open} follow={follow} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 236, display: "flex", justifyContent: "center", zIndex: 20 }}>
            <div style={{ width: 84, height: 84, borderRadius: 99, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 62, height: 62 }} />
            </div>
          </div>
        </>
      ) : (
        <Outro t={t} />
      )}
      {CUT.slice(1).map((c, k) => (
        <Ripple key={c} t={t} at={c} c={BG(k + 1)} />
      ))}
      <Ripple t={t} at={OUT} c={RED} />
      <Audio src={staticFile("clone/voix.mp3")} />
      <Loop durationInFrames={1020}>
        <Audio src={staticFile("cc/music.mp3")} volume={0.1} />
      </Loop>
      {SFX.map(([file, at, len, vol], k) => (
        <Sequence key={k} from={Math.max(0, at)} durationInFrames={len}>
          <Audio src={staticFile(file)} volume={vol * 0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const CoverClone2: React.FC = () => {
  const th = TH_BEIGE;
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      <Rings t={100} at={0} th={th} cy={640} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 236, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 84, height: 84, borderRadius: 99, backgroundColor: CHAR, display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 62, height: 62 }} /></div>
      </div>
      <div dir="rtl" style={{ position: "absolute", left: L, width: W, top: 380, textAlign: "center" }}><MixedText text="شنوة رايك؟" size={190} color={CHAR} /></div>
      <div style={{ position: "absolute", left: CX - 168, top: 640 }}>
        <Pack w={280} h={400} reveal={1} shine={0.6} t={100} />
      </div>
      <Profile t={100} th={th} open={0} follow={0} />
    </AbsoluteFill>
  );
};
