import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { MixedText } from "../components";
import { OutroIcon } from "../outro/OutroIcon";
import "../theme";

// CREOFAN — services (V2 LinkedIn, 4:5 = 1080×1350). Voix : Faty (derja sérieuse), 34,9 s. Sous-titres français incrustés.
const FPS = 30;
const RED = "#f7322a", PINK = "#fa8985", BEIGE = "#fff5f5", CHAR = "#1A1A1A", WHITE = "#ffffff", GREY = "#8a8a8a";
const FONT = "Poppins, sans-serif";
const S = (x: number) => Math.round(x * FPS);
export const SERV2_VOICE = "services/v2-final.mp3";
const OUT = S(35.2);
export const SERV2_TOTAL = OUT + 90;
export const SERV2_W = 1080, SERV2_H = 1350;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number, a: number, d: number, e = Easing.bezier(0.65, 0, 0.35, 1)) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: e });
const sp = (t: number, a: number, damping = 14) => (t < a ? 0 : spring({ frame: t - a, fps: FPS, config: { damping, stiffness: 160, mass: 0.8 } }));
const SH = "0 14px 40px rgba(26,26,26,0.10)";
const win = (t: number, a: number, b: number) => Math.min(ease(t, a, 8), 1 - ease(t, b - 6, 6));

const Logo: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 56, display: "flex", justifyContent: "center", zIndex: 40 }}>
    <div style={{ width: 84, height: 84, borderRadius: 99, backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 62, height: 62, filter: "brightness(0) invert(1)" }} />
    </div>
  </div>
);
const Sub: React.FC<{ parts: [string, boolean?][]; t: number; a: number; b: number }> = ({ parts, t, a, b }) => {
  if (t < a - 1 || t >= b) return null;
  const k = sp(t, a, 18) * (1 - ease(t, b - 5, 5));
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1010, display: "flex", justifyContent: "center", transform: `translateY(${(1 - k) * 30}px)`, opacity: k, zIndex: 30 }}>
      <div style={{ backgroundColor: WHITE, borderRadius: 36, boxShadow: SH, padding: "20px 38px 26px", fontFamily: FONT, fontWeight: 600, fontSize: 46, lineHeight: 1.22, color: CHAR, textAlign: "center", maxWidth: 960 }}>
        {parts.map(([w, hl], i) => <span key={i} style={hl ? { color: RED, fontWeight: 800 } : undefined}>{w}</span>)}
      </div>
    </div>
  );
};
const Ar: React.FC<{ text: string; size: number; color?: string }> = ({ text, size, color = RED }) => <div dir="rtl"><MixedText text={text} size={size} color={color} style={{ whiteSpace: "nowrap" }} /></div>;
const Center: React.FC<{ top: number; children: React.ReactNode; k?: number }> = ({ top, children, k = 1 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", gap: 28, transform: `scale(${0.9 + 0.1 * k})`, opacity: k }}>{children}</div>
);

// ---- visuels ----
const BrandCard: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const bar = ease(t, a + 6, 40, Easing.out(Easing.cubic)) * 0.08;
  return (
    <div style={{ width: 760, backgroundColor: WHITE, borderRadius: 40, boxShadow: SH, padding: "40px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ width: 96, height: 96, borderRadius: 28, backgroundColor: RED, color: WHITE, fontFamily: FONT, fontWeight: 800, fontSize: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>?</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 48, color: CHAR }}>Votre marque</div>
      </div>
      <div style={{ marginTop: 32, fontFamily: FONT, fontWeight: 600, fontSize: 30, color: GREY }}>Notoriété</div>
      <div style={{ marginTop: 12, height: 26, borderRadius: 13, backgroundColor: "#eee", overflow: "hidden" }}><div style={{ width: `${bar * 100 + 4}%`, height: "100%", backgroundColor: RED, borderRadius: 13 }} /></div>
    </div>
  );
};
const Forgettable: React.FC<{ t: number; a: number }> = ({ t, a }) => (
  <div style={{ display: "flex", gap: 22 }}>
    {[0, 1, 2, 3, 4].map((i) => {
      const k = sp(t, a + i * 3);
      const mine = i === 2;
      return <div key={i} style={{ width: 160, height: 160, borderRadius: 36, backgroundColor: mine ? "#e9e9e9" : "#dcdcdc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 80, color: mine ? RED : "#b9b9b9", transform: `scale(${k})`, outline: mine ? `6px solid ${RED}` : "none" }}>{mine ? "?" : "★"}</div>;
    })}
  </div>
);
const OldWeb: React.FC = () => (
  <div style={{ width: 460, height: 340, borderRadius: 26, overflow: "hidden", backgroundColor: "#ece9d8", boxShadow: SH }}>
    <div style={{ height: 46, backgroundColor: "#1a4fa3", display: "flex", alignItems: "center", gap: 8, paddingLeft: 16 }}>{["#e0463b", "#e6b93a", "#58a845"].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c }} />)}</div>
    <div style={{ padding: 20, fontFamily: "Times New Roman, serif" }}><div style={{ fontSize: 32, color: "#0000ee", textDecoration: "underline" }}>Bienvenue sur notre site</div><div style={{ marginTop: 14, display: "flex", gap: 10 }}>{["#ff00ff", "#00cc66", "#ffcc00"].map((c) => <div key={c} style={{ width: 90, height: 70, backgroundColor: c }} />)}</div></div>
  </div>
);
const Mess: React.FC = () => (
  <div style={{ width: 340, height: 340, borderRadius: 26, overflow: "hidden", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, padding: 6, backgroundColor: WHITE, boxShadow: SH }}>
    {["#e63946", "#3a86ff", "#ffbe0b", "#8338ec", "#06d6a0", "#fb5607", "#222", "#ff70a6", "#70d6ff"].map((c, i) => <div key={i} style={{ backgroundColor: c, borderRadius: i % 2 ? 24 : 4 }} />)}
  </div>
);
const PILLARS = [
  { n: "Identité visuelle", a: S(14.4), d: "M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" },
  { n: "Site web", a: S(15.75), d: "M3 5h18v14H3zM3 9h18M7 7h.01M10 7h.01" },
  { n: "Contenu prêt à publier", a: S(17.3), d: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" },
  { n: "Motion design", a: S(19.3), d: "M5 3l14 9-14 9z" },
];
const Pillars: React.FC<{ t: number; light: boolean }> = ({ t, light }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, width: 860 }}>
    {PILLARS.map((p, i) => {
      const on = light ? t >= p.a : t >= S(10.9) + i * 6;
      const k = sp(t, light ? p.a : S(10.9) + i * 6, 12);
      return (
        <div key={i} style={{ height: 250, borderRadius: 40, backgroundColor: on ? RED : WHITE, boxShadow: SH, border: on ? "none" : "3px dashed #e3c5c3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, transform: `scale(${on ? 0.95 + 0.05 * k : 1})` }}>
          <svg width={92} height={92} viewBox="0 0 24 24" fill="none" stroke={on ? WHITE : "#d9b9b7"} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d={p.d} /></svg>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 34, color: on ? WHITE : "#c9a9a7" }}>{p.n}</div>
        </div>
      );
    })}
  </div>
);
const Check: React.FC<{ t: number; a: number; text: string }> = ({ t, a, text }) => {
  const k = sp(t, a);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26, transform: `translateX(${(1 - k) * 80}px)`, opacity: k, width: 900 }}>
      <div style={{ width: 84, height: 84, borderRadius: 99, backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 52, color: CHAR, lineHeight: 1.1 }}>{text}</div>
    </div>
  );
};

export const ServV2: React.FC = () => {
  const t = useCurrentFrame();
  const inOutro = t >= OUT;
  const seg = (a: number, b: number) => t >= S(a) - 1 && t < S(b);
  const w = (a: number, b: number) => win(t, S(a), S(b));
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      {!inOutro ? (<>
        <Logo />

        {/* 1 — Vous avez une marque… mais pas connue (0 → 2,5) */}
        {seg(0, 2.5) ? <div style={{ opacity: w(0, 2.5) }}><Center top={250} k={sp(t, 1)}><Ar text="عندك marque" size={120} /><BrandCard t={t} a={0} /></Center></div> : null}
        <Sub t={t} a={S(0.1)} b={S(2.5)} parts={[["Vous avez une marque… "], ["mais personne ne vous connaît.", true]]} />

        {/* 2 — logo oublié (2,5 → 4,1) */}
        {seg(2.5, 4.1) ? <div style={{ opacity: w(2.5, 4.1) }}><Center top={330} k={sp(t, S(2.6))}><Forgettable t={t} a={S(2.6)} /></Center></div> : null}
        <Sub t={t} a={S(2.6)} b={S(4.1)} parts={[["Un logo que "], ["personne ne retient.", true]]} />

        {/* 3 — site dépassé + réseaux sans style (4,1 → 7,8) */}
        {seg(4.1, 7.85) ? <div style={{ opacity: w(4.1, 7.85) }}><Center top={290} k={sp(t, S(4.2))}><div style={{ display: "flex", gap: 30, alignItems: "center" }}><OldWeb /><Mess /></div><Ar text="بلا style unique" size={74} /></Center></div> : null}
        <Sub t={t} a={S(4.2)} b={S(7.85)} parts={[["Un site dépassé. Des réseaux "], ["sans style unique ni clarté.", true]]} />

        {/* 4 — « passez votre chemin » (7,9 → 9,6) */}
        {seg(7.9, 9.7) ? (() => { const k = sp(t, S(7.95), 8); const sh = Math.sin(t * 13) * 5 * Math.max(0, 1 - (t - S(7.95)) / 14); return <div style={{ opacity: w(7.9, 9.7) }}><Center top={330} k={1}><div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 300, letterSpacing: -10, color: RED, transform: `scale(${1.8 - 0.8 * k}) translateX(${sh}px)` }}>PASS</div></Center></div>; })() : null}
        <Sub t={t} a={S(7.95)} b={S(9.7)} parts={[["Chaque détail dit au client : "], ["« passez votre chemin ».", true]]} />

        {/* 5 — Creofan construit l'inverse : système (9,8 → 14,2) */}
        {seg(9.8, 14.3) ? <div style={{ opacity: w(9.8, 14.3) }}><Center top={250} k={sp(t, S(9.9))}>
          <Ar text="هوية متكاملة" size={110} /><Pillars t={t} light={false} /></Center></div> : null}
        <Sub t={t} a={S(9.9)} b={S(14.3)} parts={[["Chez Creofan, nous construisons l'inverse : "], ["une identité complète.", true]]} />

        {/* 6 — les piliers, un par un (14,3 → 21,2) */}
        {seg(14.3, 21.2) ? <div style={{ opacity: w(14.3, 21.2) }}><Center top={250} k={sp(t, S(14.4))}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, color: CHAR }}>Un système cohérent</div><Pillars t={t} light /></Center></div> : null}
        <Sub t={t} a={S(14.35)} b={S(17.1)} parts={[["Identité visuelle. "], ["Site web", true], [" au service de vos objectifs."]]} />
        <Sub t={t} a={S(17.15)} b={S(21.2)} parts={[["Contenu prêt à publier. "], ["Motion design", true], [" qui fait passer votre message."]]} />

        {/* 7 — vision long terme, résultats, qualité (21,3 → 26,5) */}
        {seg(21.3, 26.5) ? <div style={{ opacity: w(21.3, 26.5) }}><Center top={300} k={1}>
          <Check t={t} a={S(21.4)} text="Vision long terme" />
          <Check t={t} a={S(23.0)} text="Résultats visibles dès les premières semaines" />
          <Check t={t} a={S(24.9)} text="Aucun compromis sur la qualité" />
        </Center></div> : null}
        <Sub t={t} a={S(21.35)} b={S(26.5)} parts={[["Une vision long terme, des résultats "], ["dès les premières semaines", true], [", et jamais de compromis sur la qualité."]]} />

        {/* 8 — pas de bla-bla → marque pro (26,6 → 31,6) */}
        {seg(26.6, 31.6) ? (() => {
          const strike = ease(t, S(27.8), 10);
          return <div style={{ opacity: w(26.6, 31.6) }}><Center top={330} k={sp(t, S(26.7))}>
            <div style={{ position: "relative", fontFamily: FONT, fontWeight: 800, fontSize: 190, color: CHAR }}>Bla bla<div style={{ position: "absolute", left: -10, top: 100, height: 16, width: `${strike * 105}%`, backgroundColor: RED, borderRadius: 8 }} /></div>
            <div style={{ opacity: ease(t, S(29.3), 8), transform: `translateY(${(1 - ease(t, S(29.3), 8)) * 30}px)` }}><Ar text="ماركة محترفة" size={120} /></div>
          </Center></div>;
        })() : null}
        <Sub t={t} a={S(26.7)} b={S(29.2)} parts={[["Le blabla ? "], ["Pas dans notre dictionnaire.", true]]} />
        <Sub t={t} a={S(29.3)} b={S(31.6)} parts={[["Une marque "], ["professionnelle", true], [", de bout en bout."]]} />

        {/* 9 — la question (31,8 → 35,2) */}
        {t >= S(31.7) ? (() => { const k = sp(t, S(31.8), 12); return <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, k * 1.5) }}>
          <Center top={250} k={k}><div style={{ width: 880, fontFamily: FONT, fontWeight: 800, fontSize: 74, lineHeight: 1.15, color: CHAR, textAlign: "center" }}>Quelle est la <span style={{ color: RED }}>première chose</span> que vos clients voient de vous ?</div><Ar text="و انتِ؟" size={110} /></Center></div>; })() : null}
      </>) : (
        <AbsoluteFill style={{ backgroundColor: RED }}><OutroIcon f={t - OUT} fg={WHITE} bg="transparent" size={420} cy={640} /></AbsoluteFill>
      )}

      <Audio src={staticFile(SERV2_VOICE)} />
      <Audio src={staticFile("services/music-v2.mp3")} volume={(f) => interpolate(f, [0, 20, SERV2_TOTAL - 45, SERV2_TOTAL], [0, 0.15, 0.15, 0], clamp)} />
      {[S(0.05), S(2.6), S(4.2), S(7.95), S(9.9), S(14.4), S(15.75), S(17.3), S(19.3), S(21.4), S(23.0), S(24.9), S(26.7), S(31.8)].map((f) => <Sequence key={f} from={f} durationInFrames={14}><Audio src={staticFile("cc/pop.wav")} volume={0.22} /></Sequence>)}
      <Sequence from={S(7.95)} durationInFrames={20}><Audio src={staticFile("habouba/sfx-boom.wav")} volume={0.35} /></Sequence>
    </AbsoluteFill>
  );
};
void PINK; void CHAR;
