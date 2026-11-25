import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { MixedText } from "../components";
import { OutroIcon } from "../outro/OutroIcon";
import "../theme";

// CREOFAN — services (V2 LinkedIn, 4:5 = 1080×1350). Voix Faty (derja sérieuse), 34,9 s. Sous-titres français.
// Parti pris : montrer le savoir-faire « de l'intérieur » (grille de logos, revue de design, construction de marque,
// site, kit de contenu, timeline motion, courbe de croissance), et caler chaque impact sur les attaques de la voix.
const FPS = 30;
const RED = "#f7322a", PINK = "#fa8985", BEIGE = "#fff5f5", CHAR = "#1A1A1A", WHITE = "#ffffff", GREY = "#8a8a8a", LG = "#e4e0e0";
const FONT = "Poppins, sans-serif";
const S = (x: number) => Math.round(x * FPS);
export const SERV2_VOICE = "services/v2-final.mp3";
const OUT = S(35.2);
export const SERV2_TOTAL = OUT + 90;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number, a: number, d: number, e = Easing.bezier(0.65, 0, 0.35, 1)) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: e });
const sp = (t: number, a: number, damping = 13) => (t < a ? 0 : spring({ frame: t - a, fps: FPS, config: { damping, stiffness: 170, mass: 0.7 } }));
const SH = "0 14px 40px rgba(26,26,26,0.12)";
// attaques de la voix (secondes) — détectées sur l'audio
const ON = [0.06, 0.26, 0.43, 1.16, 1.5, 1.67, 1.84, 2.08, 2.63, 2.89, 3.31, 3.47, 3.72, 4.33, 4.52, 4.81, 5.37, 5.52, 5.67, 6.02, 6.35, 6.71, 6.94, 7.27, 7.48, 8.0, 8.24, 8.46, 8.79, 8.94, 9.16, 9.82, 10.86, 11.06, 11.33, 11.75, 12.1, 12.61, 12.78, 12.94, 13.64, 13.8, 14.31, 14.61, 14.76, 15.12, 15.64, 15.82, 16.14, 16.35, 16.62, 17.17, 17.4, 17.55, 17.84, 18.17, 18.8, 18.95, 19.11, 19.41, 19.9, 20.32, 20.59, 21.3, 21.56, 21.75, 22.11, 22.29, 22.79, 22.99, 23.41, 23.63, 23.89, 24.04, 24.32, 24.7, 25.12, 25.52, 25.81, 25.96, 26.27, 26.61, 27.07, 28.13, 28.45, 28.61, 29.36, 29.69, 30.03, 30.3, 30.54, 31.08, 31.78, 32.58, 32.83, 33.17, 33.32, 33.48, 33.64, 34.06, 34.47];
const onIn = (a: number, b: number) => ON.filter((x) => x >= a && x < b);
const BOUNDS = [4.1, 7.9, 9.8, 14.3, 17.15, 21.3, 26.6, 31.75];

const Ar: React.FC<{ text: string; size: number; color?: string }> = ({ text, size, color = RED }) => <div dir="rtl"><MixedText text={text} size={size} color={color} style={{ whiteSpace: "nowrap" }} /></div>;
const Lbl: React.FC<{ n: string; text: string; t: number; a: number }> = ({ n, text, t, a }) => {
  const k = sp(t, S(a) + 4, 16);
  return <div style={{ position: "absolute", left: 60, top: 168, display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: GREY, opacity: k, transform: `translateX(${(1 - k) * -20}px)` }}><span style={{ color: RED }}>{n}</span><span style={{ width: 40, height: 2, backgroundColor: LG }} />{text}</div>;
};
const Sub: React.FC<{ parts: [string, boolean?][]; t: number; a: number; b: number }> = ({ parts, t, a, b }) => {
  if (t < S(a) - 1 || t >= S(b)) return null;
  const k = sp(t, S(a), 18) * (1 - ease(t, S(b) - 5, 5));
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1030, display: "flex", justifyContent: "center", transform: `translateY(${(1 - k) * 30}px)`, opacity: k, zIndex: 30 }}>
      <div style={{ backgroundColor: WHITE, borderRadius: 36, boxShadow: SH, padding: "18px 36px 24px", fontFamily: FONT, fontWeight: 600, fontSize: 44, lineHeight: 1.22, color: CHAR, textAlign: "center", maxWidth: 960 }}>
        {parts.map(([w, hl], i) => <span key={i} style={hl ? { color: RED, fontWeight: 800 } : undefined}>{w}</span>)}
      </div>
    </div>
  );
};
const Shutter: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const lf = t - (s - 9);
  if (lf < 0 || lf > 18) return null;
  return (<>{[RED, PINK, CHAR].map((c, i) => {
    const q = lf - i * 2;
    const x = q < 8 ? interpolate(q, [0, 8], [-1100, 0], { ...clamp, easing: Easing.out(Easing.cubic) }) : interpolate(q, [8, 16], [0, 1100], { ...clamp, easing: Easing.in(Easing.cubic) });
    return <div key={i} style={{ position: "absolute", left: x, top: i * 450, width: 1080, height: 450, backgroundColor: c, zIndex: 60 }} />;
  })}</>);
};
const Backdrop: React.FC = () => (
  <>
    <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(#ecd2d0 2.5px, transparent 2.5px)", backgroundSize: "54px 54px", opacity: 0.8 }} />
    {[[40, 40, 1, 1], [1040, 40, -1, 1], [40, 1310, 1, -1], [1040, 1310, -1, -1]].map(([x, y, a, b], i) => (
      <div key={i} style={{ position: "absolute", left: (x as number) - (a === -1 ? 30 : 0), top: (y as number) - (b === -1 ? 30 : 0), width: 30, height: 30, borderTop: b === 1 ? `3px solid ${LG}` : undefined, borderBottom: b === -1 ? `3px solid ${LG}` : undefined, borderLeft: a === 1 ? `3px solid ${LG}` : undefined, borderRight: a === -1 ? `3px solid ${LG}` : undefined }} />
    ))}
  </>
);
const Logo: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 56, display: "flex", justifyContent: "center", zIndex: 40 }}>
    <div style={{ width: 84, height: 84, borderRadius: 99, backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 62, height: 62, filter: "brightness(0) invert(1)" }} />
    </div>
  </div>
);

// ───────── 1–2 : grille de marques (0 → 4,1) ─────────
const GridScene: React.FC<{ t: number }> = ({ t }) => {
  const COLS = 7, ROWS = 5, TS = 112, G = 18;
  const w = COLS * TS + (COLS - 1) * G, x0 = (1080 - w) / 2, y0 = 400;
  const onsets = onIn(0, 2.2);
  const tl = (k: number) => S(onsets[Math.floor((k * onsets.length) / (COLS * ROWS))] + (k % 4) * 0.02);
  const mine = 17;
  const dim = ease(t, S(1.16), 8);
  const grey = ease(t, S(2.63), 10);
  const zoom = 1 + 0.1 * ease(t, S(2.6), S(1.4), Easing.inOut(Easing.cubic));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1350, transform: `scale(${zoom})`, transformOrigin: "540px 690px" }}>
        {Array.from({ length: COLS * ROWS }).map((_, k) => {
          const r = Math.floor(k / COLS), c = k % COLS;
          const q = sp(t, tl(k), 12);
          const isMine = k === mine;
          const bg = isMine ? `rgba(247,${50 + 160 * grey},${42 + 170 * grey},1)` : "#e2dede";
          return (
            <div key={k} style={{ position: "absolute", left: x0 + c * (TS + G), top: y0 + r * (TS + G), width: TS, height: TS, borderRadius: 30, backgroundColor: bg, transform: `scale(${q * (isMine ? 1 + 0.08 * Math.sin(t / 5) * (1 - grey) * dim : 1)})`, opacity: isMine ? 1 : 1 - 0.55 * dim, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 56, color: isMine ? WHITE : "#b4aeae" }}>
              {isMine ? (grey < 0.5 ? "?" : "★") : "★"}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 215, display: "flex", justifyContent: "center", transform: `scale(${0.85 + 0.15 * sp(t, 2, 11)})`, opacity: t < S(1.45) ? 1 : 0, }}><Ar text="عندك marque" size={120} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 215, display: "flex", justifyContent: "center", transform: `scale(${0.85 + 0.15 * sp(t, S(1.5), 11)})`, opacity: t >= S(1.45) && t < S(2.55) ? 1 : 0 }}><Ar text="ماكش معروف" size={120} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 215, display: "flex", justifyContent: "center", transform: `scale(${0.85 + 0.15 * sp(t, S(2.65), 11)})`, opacity: t >= S(2.55) ? 1 : 0 }}><Ar text="ما يتفكرو حد" size={120} color={CHAR} /></div>
    </div>
  );
};

// ───────── 3 : revue de design (4,1 → 7,9) ─────────
const PINS = [["Hiérarchie", 150, 420], ["Cohérence", 740, 470], ["Identité", 330, 640], ["Lisibilité", 780, 700], ["Style", 160, 820], ["Clarté", 700, 880]] as const;
const ReviewScene: React.FC<{ t: number }> = ({ t }) => {
  const on = onIn(4.2, 7.6);
  const k = sp(t, S(4.12), 14);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Lbl n="01" text="REVUE DE DESIGN" t={t} a={4.1} />
      <div style={{ position: "absolute", left: 90, top: 330, width: 900, height: 620, transform: `scale(${0.92 + 0.08 * k})`, opacity: k }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 560, height: 420, borderRadius: 24, backgroundColor: "#ece9d8", boxShadow: SH, overflow: "hidden" }}>
          <div style={{ height: 52, backgroundColor: "#1a4fa3", display: "flex", alignItems: "center", gap: 10, paddingLeft: 18 }}>{["#e0463b", "#e6b93a", "#58a845"].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: c }} />)}</div>
          <div style={{ padding: 26, fontFamily: "Times New Roman, serif" }}><div style={{ fontSize: 40, color: "#0000ee", textDecoration: "underline" }}>Bienvenue sur notre site</div><div style={{ marginTop: 16, height: 14, width: "90%", backgroundColor: "#c9c5b0" }} /><div style={{ marginTop: 10, height: 14, width: "60%", backgroundColor: "#c9c5b0" }} /><div style={{ marginTop: 22, display: "flex", gap: 12 }}>{["#ff00ff", "#00cc66", "#ffcc00"].map((c) => <div key={c} style={{ width: 120, height: 90, backgroundColor: c }} />)}</div><div style={{ marginTop: 18, fontSize: 26, color: "#cc0000" }}>Accueil · Contact · Livre d'or</div></div>
        </div>
        <div style={{ position: "absolute", left: 600, top: 120, width: 300, height: 300, borderRadius: 24, overflow: "hidden", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, padding: 6, backgroundColor: WHITE, boxShadow: SH }}>
          {["#e63946", "#3a86ff", "#ffbe0b", "#8338ec", "#06d6a0", "#fb5607", "#222", "#ff70a6", "#70d6ff"].map((c, i) => <div key={i} style={{ backgroundColor: c, borderRadius: i % 2 ? 22 : 4 }} />)}
        </div>
        <div style={{ position: "absolute", left: 70, top: 470, width: 300, height: 120, borderRadius: 20, backgroundColor: "#d9d9d9", boxShadow: SH, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 40, color: "#aaa" }}>LOGO ★</div>
      </div>
      {PINS.map(([n, x, y], i) => {
        const a = on[i] ?? 4.3 + i * 0.5;
        const q = sp(t, S(a), 9);
        return (
          <div key={n} style={{ position: "absolute", left: x, top: y, transform: `scale(${q})`, transformOrigin: "14px 14px", zIndex: 5 }}>
            <div style={{ width: 28, height: 28, borderRadius: 99, backgroundColor: RED, boxShadow: `0 0 0 ${8 + 6 * Math.sin(t / 4 + i)}px rgba(247,50,42,0.25)` }} />
            <div style={{ position: "absolute", left: 40, top: -8, backgroundColor: RED, color: WHITE, fontFamily: FONT, fontWeight: 700, fontSize: 30, borderRadius: 14, padding: "4px 18px 8px", whiteSpace: "nowrap" }}>{n} ?</div>
          </div>
        );
      })}
    </div>
  );
};

// ───────── 4 : PASS (7,9 → 9,8) ─────────
const PassScene: React.FC<{ t: number }> = ({ t }) => {
  const a = S(8.0);
  const k = sp(t, a, 8);
  const fly = ease(t, S(9.0), 14, Easing.in(Easing.cubic));
  const sh = Math.sin(t * 13) * 6 * Math.max(0, 1 - (t - a) / 14);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 190, top: 300, width: 700, height: 640, borderRadius: 48, backgroundColor: WHITE, boxShadow: SH, transform: `translateX(${-fly * 1300}px) rotate(${-fly * 24 - 4}deg)`, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundColor: "#f4f1f1" }} />
        <div style={{ position: "absolute", left: 40, top: 40, width: 120, height: 120, borderRadius: 30, backgroundColor: "#d9d9d9" }} />
        <div style={{ position: "absolute", left: 190, top: 60, width: 340, height: 26, borderRadius: 13, backgroundColor: "#d9d9d9" }} /><div style={{ position: "absolute", left: 190, top: 110, width: 220, height: 20, borderRadius: 10, backgroundColor: "#e6e6e6" }} />
        <div style={{ position: "absolute", left: 40, top: 200, width: 620, height: 260, borderRadius: 24, backgroundColor: "#e6e3e3" }} />
        <div style={{ position: "absolute", left: 40, top: 500, width: 400, height: 22, borderRadius: 11, backgroundColor: "#dcdcdc" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", justifyContent: "center", transform: `translateX(${sh - fly * 500}px) rotate(-10deg) scale(${1.9 - 0.9 * k})`, opacity: Math.min(1, k * 2) }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 230, letterSpacing: -6, color: RED, border: `16px solid ${RED}`, borderRadius: 36, padding: "0 40px 10px", backgroundColor: "rgba(255,245,245,0.9)" }}>PASS</div>
      </div>
    </div>
  );
};

// ───────── 5 : construction de l'identité (9,8 → 14,3) ─────────
const BuildScene: React.FC<{ t: number }> = ({ t }) => {
  const a = S(9.8);
  const draw = ease(t, a + 2, 28, Easing.out(Easing.cubic));
  const R = 190;
  const logoK = sp(t, S(11.0), 12);
  const sw = [RED, PINK, BEIGE, CHAR];
  const swT = [10.86, 11.33, 11.75, 12.1];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Lbl n="02" text="IDENTITÉ" t={t} a={9.8} />
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1350}>
        <g transform="translate(540 500)">
          {[-1, 1].map((d) => <line key={d} x1={-300 * draw} x2={300 * draw} y1={0} y2={0} transform={`rotate(${d * 45})`} stroke={LG} strokeWidth={2} />)}
          <line x1={-340 * draw} x2={340 * draw} y1={0} y2={0} stroke={LG} strokeWidth={2} />
          <line y1={-300 * draw} y2={300 * draw} x1={0} x2={0} stroke={LG} strokeWidth={2} />
          <circle r={R} fill="none" stroke={RED} strokeWidth={6} strokeDasharray={2 * Math.PI * R} strokeDashoffset={2 * Math.PI * R * (1 - draw)} transform="rotate(-90)" />
          <circle r={R * 1.45} fill="none" stroke={LG} strokeWidth={2} strokeDasharray="8 10" opacity={draw} />
          {[[R, 0], [0, -R], [-R, 0], [0, R]].map(([x, y], i) => <g key={i} opacity={draw > 0.9 ? 1 : 0}><rect x={x - 9} y={y - 9} width={18} height={18} fill={WHITE} stroke={RED} strokeWidth={3} /></g>)}
        </g>
      </svg>
      <div style={{ position: "absolute", left: 540 - 150, top: 500 - 150, width: 300, height: 300, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${logoK})`, opacity: logoK }}>
        <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 300, height: 300 }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, display: "flex", justifyContent: "center", gap: 26 }}>
        {sw.map((c, i) => { const q = sp(t, S(swT[i]), 11); return <div key={i} style={{ width: 130, height: 130, borderRadius: 36, backgroundColor: c, border: c === BEIGE ? `3px solid ${LG}` : "none", boxShadow: SH, transform: `scale(${q}) translateY(${(1 - q) * 40}px)` }} />; })}
        <div style={{ marginLeft: 20, display: "flex", alignItems: "center", gap: 14, opacity: ease(t, S(12.4), 8), transform: `translateX(${(1 - ease(t, S(12.4), 8)) * 30}px)` }}>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 110, color: CHAR, lineHeight: 1 }}>Aa</span>
          <span dir="rtl"><MixedText text="أب" size={100} color={RED} /></span>
        </div>
      </div>
    </div>
  );
};

// ───────── 6 : site web (14,3 → 17,15) ─────────
const WebScene: React.FC<{ t: number }> = ({ t }) => {
  const a = S(14.3);
  const k = sp(t, a + 2, 14);
  const scroll = ease(t, S(14.9), S(1.2), Easing.inOut(Easing.cubic)) * 330;
  const cx = interpolate(t, [S(15.2), S(16.2)], [880, 640], clamp), cy = interpolate(t, [S(15.2), S(16.2)], [470, 322 + 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const click = ease(t, S(16.3), 10);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Lbl n="03" text="SITE WEB" t={t} a={14.3} />
      <div style={{ position: "absolute", left: 90, top: 280, width: 900, height: 700, borderRadius: 36, backgroundColor: WHITE, boxShadow: SH, overflow: "hidden", transform: `translateY(${(1 - k) * 80}px)`, opacity: k }}>
        <div style={{ height: 64, backgroundColor: "#f6efef", display: "flex", alignItems: "center", gap: 10, paddingLeft: 24 }}>{["#e0463b", "#e6b93a", "#58a845"].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: c }} />)}<div style={{ marginLeft: 26, width: 460, height: 30, borderRadius: 15, backgroundColor: WHITE, fontFamily: FONT, fontSize: 20, color: GREY, display: "flex", alignItems: "center", paddingLeft: 16 }}>votremarque.com</div></div>
        <div style={{ transform: `translateY(${-scroll}px)` }}>
          <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px" }}><div style={{ width: 120, height: 34, borderRadius: 10, backgroundColor: RED }} /><div style={{ display: "flex", gap: 22 }}>{[70, 60, 80].map((w, i) => <div key={i} style={{ width: w, height: 14, borderRadius: 7, backgroundColor: LG }} />)}</div></div>
          <div style={{ margin: "10px 40px", height: 330, borderRadius: 30, backgroundColor: RED, padding: 44, position: "relative" }}>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 58, lineHeight: 1.05, color: WHITE, width: 520 }}>Votre marque, enfin visible.</div>
            <div style={{ marginTop: 26, width: 240, height: 70, borderRadius: 35, backgroundColor: WHITE, fontFamily: FONT, fontWeight: 700, fontSize: 28, color: RED, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.06 * Math.sin(click * Math.PI)})` }}>Démarrer →</div>
            <div style={{ position: "absolute", right: 44, top: 44, width: 200, height: 240, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.18)" }} />
          </div>
          <div style={{ display: "flex", gap: 20, padding: "20px 40px" }}>{[0, 1, 2].map((i) => <div key={i} style={{ flex: 1, height: 230, borderRadius: 26, backgroundColor: BEIGE, border: `3px solid ${LG}`, padding: 22 }}><div style={{ width: 70, height: 70, borderRadius: 22, backgroundColor: i === 1 ? RED : PINK }} /><div style={{ marginTop: 20, height: 16, width: "80%", borderRadius: 8, backgroundColor: LG }} /><div style={{ marginTop: 12, height: 16, width: "55%", borderRadius: 8, backgroundColor: LG }} /></div>)}</div>
        </div>
      </div>
      {/* curseur */}
      <div style={{ position: "absolute", left: cx + 90 - 300, top: cy + 280 + 30, zIndex: 9, opacity: ease(t, S(15.1), 6) }}>
        <svg width={60} height={60} viewBox="0 0 24 24"><path d="M4 2l16 9-7 2-3 7z" fill={CHAR} stroke={WHITE} strokeWidth={1.5} /></svg>
        <div style={{ position: "absolute", left: -20, top: -20, width: 80 * click, height: 80 * click, borderRadius: "50%", border: `5px solid ${RED}`, opacity: 1 - click }} />
      </div>
    </div>
  );
};

// ───────── 7 : kit de contenu + motion (17,15 → 21,3) ─────────
const KitScene: React.FC<{ t: number }> = ({ t }) => {
  const on = onIn(17.1, 19.4);
  const tiles = [
    (<div style={{ backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 110, filter: "brightness(0) invert(1)" }} /></div>),
    (<div style={{ backgroundColor: BEIGE, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 80, color: RED }}>Aa</div>),
    (<div style={{ backgroundColor: PINK }} />),
    (<div style={{ backgroundColor: CHAR, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 38, color: WHITE, padding: 14, textAlign: "center", lineHeight: 1.1 }}>Votre message ici</div>),
    (<div style={{ backgroundColor: WHITE, border: `4px solid ${RED}` }}><div style={{ margin: "30% auto 0", width: "60%", height: "30%", borderRadius: 999, backgroundColor: RED }} /></div>),
    (<div style={{ backgroundColor: RED }}><div style={{ margin: "18% 0 0 18%", width: "64%", aspectRatio: "1", borderRadius: "50%", backgroundColor: PINK }} /></div>),
    (<div style={{ backgroundColor: PINK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 90, color: WHITE }}>01</div>),
    (<div style={{ backgroundColor: BEIGE, border: `3px solid ${LG}` }}><div style={{ margin: "20% 14% 0", height: "14%", borderRadius: 8, backgroundColor: RED }} /><div style={{ margin: "8% 14% 0", height: "14%", width: "50%", borderRadius: 8, backgroundColor: LG }} /></div>),
    (<div style={{ backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width={90} height={90} viewBox="0 0 24 24" fill={WHITE}><path d="M7 4l13 8-13 8z" /></svg></div>),
  ];
  const T0 = S(19.3), head = ease(t, T0 + 6, S(1.8), Easing.inOut(Easing.quad));
  const tl = ease(t, T0, 10, Easing.out(Easing.cubic));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Lbl n="04" text="CONTENU & MOTION" t={t} a={17.15} />
      <div style={{ position: "absolute", left: 90, top: 250, width: 900, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, transform: `translateY(${-tl * 60}px) scale(${1 - tl * 0.12})`, transformOrigin: "50% 0" }}>
        {tiles.map((el, i) => { const a = on[i] ?? 17.2 + i * 0.2; const q = sp(t, S(a), 10); return <div key={i} style={{ aspectRatio: "1", borderRadius: 26, overflow: "hidden", transform: `scale(${q}) rotate(${(1 - q) * -12}deg)`, boxShadow: SH }}>{el}</div>; })}
      </div>
      <div style={{ position: "absolute", left: 90, top: 760, width: 900, height: 240, borderRadius: 30, backgroundColor: CHAR, transform: `translateY(${(1 - tl) * 300}px)`, opacity: tl, overflow: "hidden", zIndex: 6 }}>
        {[0, 1, 2].map((r) => (
          <div key={r} style={{ position: "absolute", left: 130, right: 24, top: 36 + r * 58, height: 40, borderRadius: 10, backgroundColor: "#2b2b2b" }}>
            <div style={{ position: "absolute", left: 20 + r * 90, width: 380 - r * 60, top: 6, height: 28, borderRadius: 8, backgroundColor: r === 1 ? RED : PINK }} />
            {[0, 1, 2].map((d) => <div key={d} style={{ position: "absolute", left: 30 + r * 90 + d * (150 - r * 20), top: 10, width: 20, height: 20, backgroundColor: WHITE, transform: "rotate(45deg)", borderRadius: 3 }} />)}
          </div>
        ))}
        {["V", "T", "F"].map((l, i) => <div key={l} style={{ position: "absolute", left: 28, top: 44 + i * 58, fontFamily: FONT, fontWeight: 700, fontSize: 26, color: "#888" }}>{l}</div>)}
        <div style={{ position: "absolute", left: 130 + head * 700, top: 12, width: 4, height: 210, backgroundColor: WHITE }}><div style={{ position: "absolute", left: -12, top: -6, width: 28, height: 22, backgroundColor: RED, borderRadius: 6 }} /></div>
      </div>
    </div>
  );
};

// ───────── 8 : vision / résultats / qualité (21,3 → 26,6) ─────────
const GrowthScene: React.FC<{ t: number }> = ({ t }) => {
  const a = S(21.3);
  const d = ease(t, a + 4, S(4.2), Easing.inOut(Easing.cubic));
  const path = "M 70 560 C 230 540 330 520 440 430 S 640 260 830 90";
  const MS = [{ x: 190, y: 546, n: "Semaine 1", at: 22.0 }, { x: 440, y: 430, n: "Mois 3", at: 23.4 }, { x: 830, y: 90, n: "Année 1", at: 24.7 }];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Lbl n="05" text="VISION LONG TERME" t={t} a={21.3} />
      <div style={{ position: "absolute", left: 90, top: 300, width: 900, height: 640, borderRadius: 36, backgroundColor: WHITE, boxShadow: SH, opacity: sp(t, a + 2) }}>
        <svg width={900} height={640} viewBox="0 0 900 640" style={{ position: "absolute", left: 0, top: 0 }}>
          {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={50} x2={860} y1={110 + i * 110} y2={110 + i * 110} stroke={LG} strokeWidth={2} strokeDasharray="6 10" />)}
          <path d={path} transform="translate(0 40)" fill="none" stroke={RED} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />
          {MS.map((m) => { const q = sp(t, S(m.at), 10); return (
            <g key={m.n} transform={`translate(${m.x} ${m.y + 40})`}><circle r={26 * q} fill={WHITE} stroke={RED} strokeWidth={8} /><circle r={10 * q} fill={RED} />
              <g transform={`translate(${m.x > 700 ? -190 : -70} ${m.y < 200 ? 50 : -90}) scale(${q})`}><rect width={170} height={54} rx={27} fill={CHAR} /><text x={85} y={37} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={26} fill={WHITE}>{m.n}</text></g></g>); })}
        </svg>
      </div>
    </div>
  );
};

// ───────── 9 : bla-bla supprimé → marque professionnelle (26,6 → 31,75) ─────────
const BlaScene: React.FC<{ t: number }> = ({ t }) => {
  const a = S(26.6);
  const sel = ease(t, S(27.3), 14), del = t >= S(28.1);
  const pro = sp(t, S(29.3), 11);
  const underline = ease(t, S(29.9), 12);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Lbl n="06" text="ZÉRO BLABLA" t={t} a={26.6} />
      <div style={{ position: "absolute", left: 90, top: 300, width: 900, height: 600, borderRadius: 36, backgroundColor: WHITE, boxShadow: SH, padding: 50, opacity: sp(t, a + 2) }}>
        {[100, 92, 96, 70, 98, 88, 60].map((w, i) => (
          <div key={i} style={{ position: "relative", height: 28, width: `${w}%`, marginBottom: 26, opacity: del ? 0 : 1, transform: del ? `translateX(${-60}px)` : "none", transition: "none" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 14, backgroundColor: LG }} />
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${sel * 100}%`, borderRadius: 14, backgroundColor: "rgba(247,50,42,0.35)" }} />
          </div>
        ))}
        {!del ? <div style={{ position: "absolute", left: 50, top: 410, fontFamily: FONT, fontWeight: 800, fontSize: 70, color: GREY, opacity: ease(t, S(26.7), 6) }}>Bla bla bla…</div> : null}
        {del ? (
          <div style={{ position: "absolute", left: 50, right: 50, top: 150, opacity: pro, transform: `scale(${0.9 + 0.1 * pro})` }}>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 92, lineHeight: 1.05, color: CHAR }}>Une marque <span style={{ position: "relative", color: RED }}>pro<div style={{ position: "absolute", left: 0, bottom: -4, height: 12, width: `${underline * 100}%`, backgroundColor: RED, borderRadius: 6 }} /></span>fessionnelle</div>
            <div dir="rtl" style={{ marginTop: 26 }}><MixedText text="ماركة محترفة" size={100} color={RED} /></div>
          </div>
        ) : null}
      </div>
      {/* curseur sélection */}
      {!del ? <div style={{ position: "absolute", left: 140 + sel * 700, top: 330, zIndex: 9 }}><svg width={54} height={54} viewBox="0 0 24 24"><path d="M4 2l16 9-7 2-3 7z" fill={CHAR} stroke={WHITE} strokeWidth={1.5} /></svg></div> : null}
      {!del ? <div style={{ position: "absolute", left: 90 + 300, top: 700, backgroundColor: CHAR, color: WHITE, fontFamily: FONT, fontWeight: 700, fontSize: 30, padding: "6px 24px 10px", borderRadius: 14, opacity: ease(t, S(27.6), 6) }}>⌫ Supprimer</div> : null}
    </div>
  );
};

// ───────── 10 : la question (31,75 → 35,2) ─────────
const QScene: React.FC<{ t: number }> = ({ t }) => {
  const txt = "Quelle est la première chose que vos clients voient de vous ?";
  const n = Math.floor(interpolate(t, [S(31.9), S(34.5)], [0, txt.length], clamp));
  const cur = Math.floor(t / 8) % 2 === 0;
  const shown = txt.slice(0, n);
  const hl = "première chose";
  const i = shown.indexOf(hl);
  const render = () => {
    const idx = txt.indexOf(hl);
    const pre = shown.slice(0, idx < 0 ? shown.length : Math.min(shown.length, idx));
    const mid = shown.slice(idx, Math.min(shown.length, idx + hl.length));
    const post = shown.slice(idx + hl.length);
    return <>{pre}<span style={{ color: RED }}>{mid}</span>{post}</>;
  };
  void i;
  const k = sp(t, S(34.0), 10);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 90, top: 330, width: 900, fontFamily: FONT, fontWeight: 800, fontSize: 84, lineHeight: 1.12, color: CHAR, minHeight: 330 }}>{render()}<span style={{ display: "inline-block", width: 8, height: 80, marginLeft: 8, backgroundColor: cur ? RED : "transparent", verticalAlign: "middle" }} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", justifyContent: "center", transform: `scale(${k})`, opacity: k }}><Ar text="و انتِ؟" size={130} /></div>
    </div>
  );
};

export const ServV2: React.FC = () => {
  const t = useCurrentFrame();
  const inOutro = t >= OUT;
  const vis = (a: number, b: number) => t >= S(a) && t < S(b);
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      {!inOutro ? (<>
        <Backdrop />
        <Logo />
        {vis(0, 4.1) ? <GridScene t={t} /> : null}
        {vis(4.1, 7.9) ? <ReviewScene t={t} /> : null}
        {vis(7.9, 9.8) ? <PassScene t={t} /> : null}
        {vis(9.8, 14.3) ? <BuildScene t={t} /> : null}
        {vis(14.3, 17.15) ? <WebScene t={t} /> : null}
        {vis(17.15, 21.3) ? <KitScene t={t} /> : null}
        {vis(21.3, 26.6) ? <GrowthScene t={t} /> : null}
        {vis(26.6, 31.75) ? <BlaScene t={t} /> : null}
        {vis(31.75, 35.2) ? <QScene t={t} /> : null}

        <Sub t={t} a={0.1} b={2.55} parts={[["Vous avez une marque… "], ["mais personne ne vous connaît.", true]]} />
        <Sub t={t} a={2.6} b={4.1} parts={[["Un logo que "], ["personne ne retient.", true]]} />
        <Sub t={t} a={4.2} b={7.85} parts={[["Un site dépassé. Des réseaux "], ["sans style unique ni clarté.", true]]} />
        <Sub t={t} a={7.95} b={9.7} parts={[["Chaque détail dit au client : "], ["« passez votre chemin ».", true]]} />
        <Sub t={t} a={9.9} b={14.3} parts={[["Chez Creofan, nous construisons l'inverse : "], ["une identité complète.", true]]} />
        <Sub t={t} a={14.35} b={17.1} parts={[["Identité visuelle. "], ["Site web", true], [" au service de vos objectifs."]]} />
        <Sub t={t} a={17.2} b={21.2} parts={[["Contenu prêt à publier. "], ["Motion design", true], [" qui fait passer votre message."]]} />
        <Sub t={t} a={21.35} b={26.5} parts={[["Une vision long terme, des résultats "], ["dès les premières semaines", true], [", jamais de compromis sur la qualité."]]} />
        <Sub t={t} a={26.7} b={29.2} parts={[["Le blabla ? "], ["Pas dans notre dictionnaire.", true]]} />
        <Sub t={t} a={29.3} b={31.6} parts={[["Une marque "], ["professionnelle", true], [", de bout en bout."]]} />

        {BOUNDS.map((b) => <Shutter key={b} t={t} s={S(b)} />)}
      </>) : (
        <AbsoluteFill style={{ backgroundColor: RED }}><OutroIcon f={t - OUT} fg={WHITE} bg="transparent" size={420} cy={640} /></AbsoluteFill>
      )}

      <Audio src={staticFile(SERV2_VOICE)} />
      <Audio src={staticFile("services/music-v2.mp3")} volume={(f) => interpolate(f, [0, 20, SERV2_TOTAL - 45, SERV2_TOTAL], [0, 0.15, 0.15, 0], clamp)} />
      {BOUNDS.map((b) => <Sequence key={"w" + b} from={S(b) - 9} durationInFrames={18}><Audio src={staticFile("habouba/sfx-whoosh.wav")} volume={0.3} /></Sequence>)}
      {[...onIn(0, 2.2).slice(0, 8), ...onIn(4.2, 7.6).slice(0, 6), 10.86, 11.33, 11.75, 12.1].map((s, i) => <Sequence key={"p" + i} from={S(s)} durationInFrames={10}><Audio src={staticFile("cc/pop.wav")} volume={0.16} /></Sequence>)}
      <Sequence from={S(8.0)} durationInFrames={20}><Audio src={staticFile("habouba/sfx-boom.wav")} volume={0.4} /></Sequence>
      <Sequence from={S(16.3)} durationInFrames={8}><Audio src={staticFile("habouba/sfx-click.wav")} volume={0.5} /></Sequence>
    </AbsoluteFill>
  );
};
void PINK; void CHAR;
