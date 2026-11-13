import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { IsoFonts } from "./iso/fonts";
import { NAVY, YEL, FONT } from "./iso/theme";

const WHITE = "#ffffff";
type Item =
  | { kind: "tag"; t0: number; t1: number; label: string; words: string[]; ar?: string; accent?: number }
  | { kind: "stat"; t0: number; t1: number; label: string; num: number; prefix?: string; unit: string; sub: string; ar?: string }
  | { kind: "stack"; t0: number; lines: { t: number; text: string; red?: boolean }[]; t1: number }
  | { kind: "cta"; t0: number; t1: number };

// timing calé sur la voix off (alignement par pauses + poids des mots)
const ITEMS: Item[] = [
  { kind: "tag", t0: 1.45, t1: 3.05, label: "VOUS ÊTES ENTREPRENEUR ?", words: ["PLUSIEURS", "CHANTIERS"], ar: "أكثر من شانطي", accent: 1 },
  { kind: "tag", t0: 3.0, t1: 4.35, label: "RÉSULTAT", words: ["TEMPS", "=", "ARGENT"], ar: "وقت وفلوس", accent: 2 },
  { kind: "tag", t0: 4.7, t1: 6.95, label: "LA SOLUTION GEP", words: ["GAGNEZ", "TEMPS", "& ARGENT"], ar: "الحل إلي يربحك", accent: 2 },
  { kind: "tag", t0: 7.35, t1: 8.95, label: "DALLE ALVÉOLÉE", words: ["PRÊTE", "À", "POSER"], ar: "الحاضرة", accent: 2 },
  { kind: "tag", t0: 9.0, t1: 10.4, label: "SUR CHANTIER", words: ["MOINS DE", "COFFRAGE"], ar: "تنقص في الكفراج", accent: 1 },
  { kind: "tag", t0: 10.45, t1: 11.95, label: "MONTAGE", words: ["POSE", "ULTRA-RAPIDE"], ar: "التركيب ساهل", accent: 1 },
  { kind: "stat", t0: 12.0, t1: 13.55, label: "CHRONO", num: 48, unit: "H", sub: "de pose", ar: "ثمنية وأربعين ساعة" },
  { kind: "stat", t0: 13.6, t1: 15.4, label: "EN 48 H", num: 1000, prefix: "+", unit: "m²", sub: "posés", ar: "أكثر من ألف مترو" },
  { kind: "tag", t0: 15.85, t1: 17.7, label: "DÈS LE JOUR MÊME", words: ["TRAVAILLEZ", "EN DESSOUS"], ar: "تخدم تحتها منهارك", accent: 1 },
  { kind: "tag", t0: 17.75, t1: 19.9, label: "ZÉRO ATTENTE", words: ["SANS", "ATTENDRE"], ar: "من غير ما تقعد تستنى", accent: 1 },
  { kind: "tag", t0: 20.1, t1: 22.0, label: "BILAN", words: ["MOINS DE JOURS", "DE TRAVAIL"], ar: "أيامات الخدمة ينقصوا", accent: 0 },
  { kind: "tag", t0: 22.1, t1: 24.75, label: "CHANTIERS", words: ["LIVRÉS", "PLUS VITE"], ar: "تسكر شانطي فيسع", accent: 1 },
  { kind: "stack", t0: 25.0, t1: 28.1, lines: [{ t: 25.05, text: "+ DE PROJETS" }, { t: 26.08, text: "+ D'ARGENT" }, { t: 27.08, text: "= PROFIT NET", red: true }] },
  { kind: "tag", t0: 28.3, t1: 29.5, label: "N'ATTENDEZ PAS", words: ["SAISISSEZ", "L'OCCASION"], ar: "ما تضيعش الفرصة", accent: 1 },
  { kind: "cta", t0: 29.55, t1: 33.0 },
];

const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
const useIn = (t0: number, d = 0.5, delay = 0) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - Math.round((t0 + delay) * fps), fps, config: { damping: 16, stiffness: 150, mass: 0.7 }, durationInFrames: Math.round(d * fps) });
};
const useOut = (t1: number, d = 0.2) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return interpolate(f, [Math.round((t1 - d) * fps), Math.round(t1 * fps)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
};
const useBeat = () => { // pulsation sur le tempo musical (112 BPM)
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const ph = ((f / fps) * (112 / 60)) % 1; return 1 + 0.018 * Math.exp(-ph * 6);
};

const Block: React.FC<{ children: React.ReactNode; out: number; bottom?: number }> = ({ children, out, bottom = 520 }) => (
  <div style={{ position: "absolute", left: 70, right: 170, bottom, opacity: 1 - out, transform: `translateY(${out * 24}px)`, fontFamily: FONT }}>{children}</div>
);

const Label: React.FC<{ text: string; p: number }> = ({ text, p }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 18, opacity: p, transform: `translateX(${(1 - p) * -30}px)` }}>
    <div style={{ width: 54 * p, height: 6, background: YEL, borderRadius: 3 }} />
    <div style={{ color: WHITE, fontWeight: 700, fontSize: 30, letterSpacing: 5, textShadow: "0 2px 12px rgba(25,34,109,0.6)" }}>{text}</div>
  </div>
);

const Tag: React.FC<{ it: Extract<Item, { kind: "tag" }> }> = ({ it }) => {
  const out = useOut(it.t1); const beat = useBeat();
  const lp = useIn(it.t0, 0.4);
  return (
    <Block out={out} bottom={500}>
      <Label text={it.label} p={lp} />
      <div style={{ transform: `scale(${beat})`, transformOrigin: "left bottom" }}>
        {it.words.map((w, i) => {
          const p = useIn(it.t0, 0.5, 0.07 + i * 0.1);
          return (
            <div key={i} style={{ overflow: "hidden", lineHeight: 1.02, paddingTop: 4 }}>
              <div style={{ transform: `translateY(${(1 - p) * 115}%)`, fontWeight: 800, fontSize: 92, color: it.accent === i ? YEL : WHITE, textShadow: it.accent === i ? "0 3px 16px rgba(10,14,60,0.85), 0 0 2px rgba(10,14,60,0.6)" : "0 4px 22px rgba(25,34,109,0.7)", letterSpacing: -1 }}>{w}</div>
            </div>
          );
        })}
      </div>
      {it.ar && (() => { const p = useIn(it.t0, 0.5, 0.35); return (
        <div style={{ direction: "rtl", textAlign: "right", marginTop: 12, fontSize: 42, fontWeight: 700, color: WHITE, opacity: p * 0.92, transform: `translateY(${(1 - p) * 20}px)`, textShadow: "0 2px 14px rgba(25,34,109,0.8)" }}>{it.ar}</div>); })()}
    </Block>
  );
};

const Stat: React.FC<{ it: Extract<Item, { kind: "stat" }> }> = ({ it }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const out = useOut(it.t1); const p = useIn(it.t0, 0.45); const beat = useBeat();
  const c = interpolate(f, [it.t0 * fps, (it.t0 + 0.7) * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const val = Math.round(it.num * c);
  const txt = it.num >= 1000 ? val.toLocaleString("fr-FR").replace(/ | /g, " ") : String(val);
  const bar = interpolate(f, [(it.t0 + 0.15) * fps, (it.t0 + 0.6) * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <Block out={out} bottom={470}>
      <Label text={it.label} p={p} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, transform: `scale(${(0.9 + 0.1 * p) * beat})`, transformOrigin: "left bottom", opacity: p }}>
        <span style={{ fontWeight: 800, fontSize: 250, lineHeight: 0.95, color: WHITE, letterSpacing: -6, textShadow: "0 6px 30px rgba(25,34,109,0.75)" }}>{it.prefix}{txt}</span>
        <span style={{ fontWeight: 800, fontSize: 110, color: YEL }}>{it.unit}</span>
      </div>
      <div style={{ height: 8, width: 520 * bar, background: YEL, borderRadius: 4, margin: "10px 0 14px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", opacity: p }}>
        <span style={{ fontWeight: 700, fontSize: 56, color: WHITE, textShadow: "0 3px 16px rgba(25,34,109,0.7)" }}>{it.sub}</span>
        {it.ar && <span style={{ direction: "rtl", fontWeight: 700, fontSize: 40, color: WHITE, opacity: 0.9 }}>{it.ar}</span>}
      </div>
    </Block>
  );
};

const Stack: React.FC<{ it: Extract<Item, { kind: "stack" }> }> = ({ it }) => {
  const out = useOut(it.t1); const beat = useBeat();
  return (
    <Block out={out} bottom={470}>
      <Label text="LE RÉSULTAT" p={useIn(it.t0, 0.4)} />
      <div style={{ transform: `scale(${beat})`, transformOrigin: "left bottom" }}>
        {it.lines.map((l, i) => {
          const p = useIn(l.t, 0.45);
          return (
            <div key={i} style={{ overflow: "hidden", lineHeight: 1.04 }}>
              <div style={{ transform: `translateY(${(1 - p) * 110}%) `, fontWeight: 800, fontSize: l.red ? 104 : 96, color: l.red ? YEL : WHITE, textShadow: "0 4px 22px rgba(25,34,109,0.7)", letterSpacing: -1 }}>{l.text}</div>
            </div>
          );
        })}
      </div>
      <div style={{ direction: "rtl", textAlign: "right", marginTop: 12, fontSize: 42, fontWeight: 700, color: WHITE, opacity: useIn(it.lines[2].t, 0.4) * 0.92 }}>أزيد projets, أزيد فلوس, و ربح صافي</div>
    </Block>
  );
};

const Cta: React.FC<{ it: Extract<Item, { kind: "cta" }> }> = ({ it }) => {
  const beat = useBeat(); const p1 = useIn(it.t0, 0.5); const p2 = useIn(it.t0, 0.5, 0.9); const p3 = useIn(it.t0, 0.5, 1.7);
  return (
    <Block out={0} bottom={430}>
      <Label text="CALCULEZ VOTRE GAIN" p={p1} />
      <div style={{ overflow: "hidden", lineHeight: 1.02 }}>
        <div style={{ transform: `translateY(${(1 - p1) * 115}%)`, fontWeight: 800, fontSize: 92, color: WHITE, textShadow: "0 4px 22px rgba(25,34,109,0.7)" }}>CONTACTEZ-</div>
      </div>
      <div style={{ overflow: "hidden", lineHeight: 1.02 }}>
        <div style={{ transform: `translateY(${(1 - Math.min(1, p1 * 1.1)) * 115}%)`, fontWeight: 800, fontSize: 92, color: YEL }}>NOUS</div>
      </div>
      <div style={{ marginTop: 22, display: "inline-flex", alignItems: "center", gap: 18, background: WHITE, borderRadius: 60, padding: "16px 34px 16px 22px", opacity: p2, transform: `translateY(${(1 - p2) * 30}px) scale(${beat})`, boxShadow: "0 10px 40px rgba(25,34,109,0.45)" }}>
        <div style={{ width: 56, height: 56, borderRadius: 28, background: YEL, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.3.2 2.500.6 3.600a1 1 0 01-.25 1z" /></svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: 52, color: NAVY, letterSpacing: 0.5 }}>+216 29 611 748</span>
      </div>
      <div style={{ marginTop: 16, fontWeight: 600, fontSize: 34, color: WHITE, opacity: p3, letterSpacing: 1, textShadow: "0 2px 12px rgba(25,34,109,0.8)" }}>devis@comptoir-gep.tn · www.comptoir-gep.tn</div>
    </Block>
  );
};

export const Livraison: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = f / fps;
  // scrim bas, plus marqué quand un texte est actif
  const cl = (x: number) => Math.max(0, Math.min(1, x));
  const active = Math.max(...ITEMS.map((i) => cl((t - (i.t0 - 0.2)) / 0.25) * cl((i.t1 + 0.1 - t) / 0.25)));
  const sc = interpolate(f, [0, 1], [0, 1]);
  return (
    <IsoFonts>
      <AbsoluteFill style={{ background: NAVY }}>
        <OffthreadVideo src={staticFile("liv_base.mp4")} style={{ width: 1080, height: 1920 }} muted />
        <AbsoluteFill style={{ background: `linear-gradient(to top, rgba(25,34,109,${0.8 * active}) 0%, rgba(25,34,109,${0.5 * active}) 24%, rgba(25,34,109,0) 46%)`, opacity: sc }} />
        {ITEMS.map((it, i) => {
          const fr = it.t0 * fps; const to = it.t1 * fps;
          if (f < fr - 1 || f > to + 1) return null;
          if (it.kind === "tag") return <Tag key={i} it={it} />;
          if (it.kind === "stat") return <Stat key={i} it={it} />;
          if (it.kind === "stack") return <Stack key={i} it={it} />;
          return <Cta key={i} it={it} />;
        })}
      </AbsoluteFill>
    </IsoFonts>
  );
};
