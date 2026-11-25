import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { MixedText } from "../components";
import { OutroIcon } from "../outro/OutroIcon";
import "../theme";

// CREOFAN — services (V1 réseaux sociaux, 9:16). Voix : Faty (derja), 18,83 s. Réf. : logo-pendule « WE GOT YOU ».
const FPS = 30;
const RED = "#f7322a", PINK = "#fa8985", BEIGE = "#fff5f5", CHAR = "#1A1A1A", WHITE = "#ffffff";
const FONT = "Poppins, sans-serif";
const S = (x: number) => Math.round(x * FPS);
export const SERV1_VOICE = "services/v1-final.mp3";
const OUT = S(19.3);
export const SERV1_TOTAL = OUT + 90;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number, a: number, d: number, e = Easing.bezier(0.65, 0, 0.35, 1)) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: e });

const BZ = Easing.bezier(0.22, 1.4, 0.36, 1);
const SH = "0 18px 50px rgba(26,26,26,0.16)";

const Logo: React.FC<{ onRed?: boolean }> = ({ onRed }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 112, display: "flex", justifyContent: "center", zIndex: 40 }}>
    <div style={{ width: 92, height: 92, borderRadius: 99, backgroundColor: onRed ? WHITE : RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 70, height: 70, filter: onRed ? "none" : "brightness(0) invert(1)" }} />
    </div>
  </div>
);
const Big: React.FC<{ size: number; color: string; children: React.ReactNode; w?: number }> = ({ size, color, children, w = 800 }) => (
  <div style={{ fontFamily: FONT, fontWeight: w, fontSize: size, lineHeight: 1, letterSpacing: -size * 0.03, color, whiteSpace: "nowrap" }}>{children}</div>
);
// pop avec rebond, entrée à la frame a
const pop = (t: number, a: number) => (t < a ? 0 : spring({ frame: t - a, fps: FPS, config: { damping: 9, stiffness: 190, mass: 0.7 } }));
const shake = (t: number, a: number) => { const q = Math.max(0, 1 - (t - a) / 10); return { x: Math.sin(t * 13) * 5 * q, y: Math.cos(t * 11) * 4 * q }; };

// balayage rouge/rose entre deux scènes
const Swipe: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const lf = t - s;
  if (lf < 0 || lf > 22) return null;
  const e = (d: number) => interpolate(lf - d, [0, 16], [-1100, 2400], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (<>
    <div style={{ position: "absolute", left: e(0), top: -400, width: 1500, height: 2800, backgroundColor: RED, transform: "rotate(18deg)", zIndex: 30 }} />
    <div style={{ position: "absolute", left: e(3) - 160, top: -400, width: 1500, height: 2800, backgroundColor: PINK, transform: "rotate(18deg)", zIndex: 29 }} />
  </>);
};

// ---------- illustrations simples (flat) ----------
const Card: React.FC<{ children: React.ReactNode; k: number; rot: number }> = ({ children, k, rot }) => (
  <div style={{ position: "absolute", left: 140, top: 520, width: 800, height: 560, borderRadius: 56, backgroundColor: WHITE, boxShadow: SH, overflow: "hidden", transform: `scale(${k}) rotate(${rot * (1 - k) + rot * 0.25}deg)` }}>{children}</div>
);
const Tag: React.FC<{ text: string; k: number }> = ({ text, k }) => (
  <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 1130, display: "flex", justifyContent: "center", transform: `scale(${k})` }}>
    <div style={{ backgroundColor: RED, borderRadius: 999, padding: "6px 50px 20px" }}><MixedText text={text} size={92} color={WHITE} style={{ whiteSpace: "nowrap" }} /></div>
  </div>
);
const GenericLogo = () => (
  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 36, backgroundColor: "#f2f2f2" }}>
    <div style={{ width: 200, height: 200, borderRadius: "50%", backgroundColor: "#cfcfcf", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, color: "#9a9a9a", fontFamily: FONT, fontWeight: 800 }}>★</div>
    <div><div style={{ width: 260, height: 34, backgroundColor: "#cfcfcf", borderRadius: 8 }} /><div style={{ width: 180, height: 22, backgroundColor: "#dcdcdc", borderRadius: 8, marginTop: 18 }} /></div>
  </div>
);
const OldSite = () => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: "#ece9d8" }}>
    <div style={{ height: 64, backgroundColor: "#1a4fa3", display: "flex", alignItems: "center", gap: 12, paddingLeft: 24 }}>{["#e0463b", "#e6b93a", "#58a845"].map((c) => <div key={c} style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: c }} />)}</div>
    <div style={{ padding: 30, fontFamily: "Times New Roman, serif" }}>
      <div style={{ fontSize: 46, color: "#0000ee", textDecoration: "underline" }}>Bienvenue sur notre site</div>
      <div style={{ marginTop: 18, height: 18, width: "92%", backgroundColor: "#c9c5b0" }} /><div style={{ marginTop: 12, height: 18, width: "70%", backgroundColor: "#c9c5b0" }} />
      <div style={{ marginTop: 26, display: "flex", gap: 14 }}>{["#ff00ff", "#00cc66", "#ffcc00"].map((c) => <div key={c} style={{ width: 120, height: 90, backgroundColor: c }} />)}</div>
      <div style={{ marginTop: 22, fontSize: 32, color: "#cc0000" }}>Visitez-nous · Contact · Accueil</div>
    </div>
  </div>
);
const MessyFeed = () => (
  <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, padding: 8, backgroundColor: "#fff" }}>
    {["#e63946", "#3a86ff", "#ffbe0b", "#8338ec", "#06d6a0", "#fb5607", "#222", "#ff70a6", "#70d6ff"].map((c, i) => (
      <div key={i} style={{ backgroundColor: c, borderRadius: i % 2 ? 40 : 6, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: i % 3 ? "Georgia, serif" : "Impact, sans-serif", fontSize: 44 + (i % 4) * 14, color: i % 2 ? "#fff" : "#111" }}>{["SALE", "new!", "Hi", "★", "promo", "..", "OK", "Aa", "!!"][i]}</div>
    ))}
  </div>
);
const Chip: React.FC<{ k: number; children: React.ReactNode }> = ({ k, children }) => (
  <div style={{ width: 300, height: 300, borderRadius: 80, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k})` }}>{children}</div>
);
const ic = (d: string) => <svg width={170} height={170} viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;

const SERV = [
  { a: 9.55, label: "Branding", icon: ic("M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z") },
  { a: 10.38, label: "Site web", icon: ic("M3 5h18v14H3zM3 9h18M7 7h.01M10 7h.01") },
  { a: 11.1, label: "Social kit", icon: ic("M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z") },
  { a: 12.05, label: "Motion design", icon: ic("M5 3l14 9-14 9zM12 12") },
];
const NAV = ["BRANDING", "SITE WEB", "SOCIAL KIT", "MOTION DESIGN"];

export const ServV1: React.FC = () => {
  const t = useCurrentFrame();
  const inOutro = t >= OUT;
  // fonds : beige (0–8,2 s), rouge (8,2–13,2), beige (13,2–16,0), rouge (16,0 →)
  const red1 = ease(t, S(8.2), 7, Easing.out(Easing.cubic));
  const red2 = ease(t, S(16.0) - 1, 6, Easing.out(Easing.cubic));
  const swipeOut = ease(t, S(13.2), 8, Easing.in(Easing.cubic));
  const onRed = (t >= S(8.2) + 6 && t < S(13.2)) || t >= S(16.0) + 5;
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      {!inOutro ? (<>
        <Logo onRed={onRed} />

        {/* 1 — HOOK 0 → 3,3 s */}
        {t < S(3.4) ? (() => {
          const k1 = pop(t, 2), k2 = pop(t, S(2.1)), out = ease(t, S(3.2), 5);
          const sh = shake(t, 2);
          return (
            <div dir="rtl" style={{ position: "absolute", inset: 0, transform: `scale(${1 - out * 0.2})`, opacity: 1 - out }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", transform: `scale(${k1 * (1 - k2 * 0.25)}) translate(${sh.x}px,${sh.y - k2 * 140}px)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}><MixedText text="مشروعك قوي" size={190} color={RED} style={{ whiteSpace: "nowrap" }} /><span style={{ fontSize: 150 }}>💪</span></div>
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 930, display: "flex", justifyContent: "center", transform: `scale(${k2})` }}>
                <div style={{ backgroundColor: RED, borderRadius: 80, padding: "6px 56px 22px", display: "flex", alignItems: "center", gap: 20 }}><MixedText text="ما تشوفوش؟" size={150} color={WHITE} style={{ whiteSpace: "nowrap" }} /><span style={{ fontSize: 110 }}>👀</span></div>
              </div>
            </div>
          );
        })() : null}

        {/* 2 — PROBLÈME 3,4 → 8,2 s */}
        {t >= S(3.4) && t < S(8.4) ? (() => {
          const items = [{ a: S(4.3), n: "صورة générique", el: <GenericLogo />, r: -6 }, { a: S(5.55), n: "Site web قديم", el: <OldSite />, r: 5 }, { a: S(6.8), n: "سوشيال بلا هوية", el: <MessyFeed />, r: -4 }];
          return (<>
            {items.map((it, i) => {
              const next = i < 2 ? items[i + 1].a : S(8.2);
              if (t < it.a || t >= next + 4) return null;
              const k = pop(t, it.a) * (1 - ease(t, next - 2, 6));
              return <React.Fragment key={i}><Card k={k} rot={it.r}>{it.el}</Card><Tag text={it.n} k={k} />
                <div style={{ position: "absolute", left: 800 - 20, top: 470, width: 130, height: 130, borderRadius: 99, backgroundColor: RED, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 90, transform: `scale(${k})` }}>✕</div></React.Fragment>;
            })}
          </>);
        })() : null}

        {/* 3 — plan rouge (pivot + services + final) */}
        {t >= S(8.2) && t < S(13.9) ? <div style={{ position: "absolute", inset: 0, backgroundColor: RED, transform: `translateY(${(1 - red1) * 100}%)`, zIndex: 5 }} /> : null}
        {t >= S(8.2) && t < S(9.6) ? (() => {
          const T0 = S(8.3);
          const lf = Math.max(0, t - T0);
          const ang = 52 * Math.exp(-lf / 22) * Math.cos(lf / 5.2);
          const out = ease(t, S(9.45), 6, Easing.in(Easing.cubic));
          const k = pop(t, S(8.45));
          return (
            <div style={{ position: "absolute", inset: 0, zIndex: 6, opacity: 1 - out }}>
              <div style={{ position: "absolute", left: 540, top: 0, width: 0, height: 0, transform: `rotate(${ang}deg)`, transformOrigin: "0 0" }}>
                <div style={{ position: "absolute", left: -3, top: 0, width: 6, height: 640, backgroundColor: "rgba(255,255,255,0.55)" }} />
                <div style={{ position: "absolute", left: -110, top: 600, width: 220, height: 220, borderRadius: 56, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
                  <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 150, height: 150, transform: `rotate(${-ang}deg)` }} />
                </div>
              </div>
              <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 1000, display: "flex", justifyContent: "center", transform: `scale(${k})` }}>
                <MixedText text="Creofan معاكم!" size={112} color={WHITE} style={{ whiteSpace: "nowrap" }} />
              </div>
            </div>
          );
        })() : null}
        {/* services */}
        {t >= S(9.5) && t < S(13.3) ? (() => {
          const idx = SERV.reduce((m, s, i) => (t >= S(s.a) ? i : m), 0);
          const s = SERV[idx];
          const k = pop(t, S(s.a));
          const sc = 1.7 - 0.7 * ease(t, S(s.a), 7, BZ);
          const sh = shake(t, S(s.a));
          const lf = t - S(s.a);
          return (
            <div style={{ position: "absolute", inset: 0, zIndex: 7 }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 620, display: "flex", justifyContent: "center", transform: `scale(${Math.min(1, k)}) translate(${sh.x}px,${sh.y}px)` }}><Chip k={1}>{s.icon}</Chip></div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 990, display: "flex", justifyContent: "center", transform: `scale(${sc}) translate(${sh.x}px,${sh.y}px)`, opacity: Math.min(1, lf / 2 + 0.3) }}><Big size={150} color={WHITE} w={900}>{s.label}</Big></div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 1360, display: "flex", justifyContent: "center", gap: 18, fontFamily: FONT, fontWeight: 700, fontSize: 30, letterSpacing: 4 }}>
                {NAV.map((n, i) => <span key={n} style={{ color: i === idx ? WHITE : "rgba(255,255,255,0.45)" }}>{n}{i < 3 ? "  ·" : ""}</span>)}
              </div>
            </div>
          );
        })() : null}

        {/* 4 — BÉNÉFICES 13,3 → 16,0 s (beige) */}
        {t >= S(13.3) && t < S(16.3) ? (() => {
          const A = S(13.35), B = S(14.65);
          const first = t < B;
          const a = first ? A : B;
          const k = pop(t, a) * (first ? 1 - ease(t, B - 3, 5) : 1 - ease(t, S(16.0), 5));
          const lf = t - a;
          return (
            <div dir="rtl" style={{ position: "absolute", inset: 0, zIndex: 8, transform: `scale(${k})` }}>
              {first ? (<>
                <svg style={{ position: "absolute", left: 140, top: 480, }} width={800} height={500} viewBox="0 0 800 500" fill="none">
                  <path d="M40 440 C200 420 300 380 420 300 S650 100 760 40" stroke={RED} strokeWidth={22} strokeLinecap="round" strokeDasharray={1000} strokeDashoffset={1000 * (1 - ease(lf, 2, 22, Easing.out(Easing.cubic)))} />
                  <circle cx={760} cy={40} r={30} fill={RED} opacity={ease(lf, 22, 6)} />
                </svg>
                <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", justifyContent: "center" }}><div style={{ backgroundColor: RED, borderRadius: 80, padding: "6px 56px 22px" }}><MixedText text="رؤية طويلة المدى" size={110} color={WHITE} style={{ whiteSpace: "nowrap" }} /></div></div>
              </>) : (<>
                <div style={{ position: "absolute", left: 0, right: 0, top: 540, display: "flex", justifyContent: "center", fontSize: 330, transform: `rotate(${Math.sin(lf / 3) * 6}deg)` }}>⚡</div>
                <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", justifyContent: "center" }}><div style={{ backgroundColor: RED, borderRadius: 80, padding: "6px 56px 22px" }}><MixedText text="سرعة الإنجاز" size={120} color={WHITE} style={{ whiteSpace: "nowrap" }} /></div></div>
              </>)}
            </div>
          );
        })() : null}

        {/* 5 — FINAL 16,0 → 19,3 s (rouge) */}
        {t >= S(16.0) - 1 ? <div style={{ position: "absolute", inset: 0, backgroundColor: RED, transform: `translateY(${(1 - red2) * 100}%)`, zIndex: 9 }} /> : null}
        {t >= S(16.0) + 3 ? (() => {
          const k = pop(t, S(16.1)), k2 = pop(t, S(16.9));
          const sh = shake(t, S(16.9));
          const ring = ease(t, S(16.1), 20, Easing.out(Easing.cubic));
          return (
            <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
              <div style={{ position: "absolute", left: 540 - 240 * (0.6 + ring), top: 700 - 240 * (0.6 + ring), width: 480 * (0.6 + ring), height: 480 * (0.6 + ring), borderRadius: "50%", border: `5px solid rgba(255,255,255,${0.6 * (1 - ring)})` }} />
              <div style={{ position: "absolute", left: 540 - 130, top: 570, width: 260, height: 260, borderRadius: 72, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k})` }}>
                <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 180, height: 180 }} />
              </div>
              <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 940, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transform: `scale(${k2}) translate(${sh.x}px,${sh.y}px)` }}>
                <MixedText text="نعطيوكم روح" size={150} color={WHITE} style={{ whiteSpace: "nowrap" }} />
                <MixedText text="لخدمتكم ❤️" size={150} color={WHITE} style={{ whiteSpace: "nowrap" }} />
              </div>
            </div>
          );
        })() : null}

        {[S(3.3), S(13.2)].map((s) => <Swipe key={s} t={t} s={s - 8} />)}
        {void swipeOut}
      </>) : (
        <AbsoluteFill style={{ backgroundColor: RED }}><OutroIcon f={t - OUT} fg={WHITE} bg="transparent" size={460} cy={860} /></AbsoluteFill>
      )}

      <Audio src={staticFile(SERV1_VOICE)} />
      <Audio src={staticFile("services/music-v1.mp3")} volume={(f) => interpolate(f, [0, S(8), S(8.3), SERV1_TOTAL - 30, SERV1_TOTAL], [0.2, 0.2, 0.26, 0.26, 0], clamp)} />
      <Sequence from={2} durationInFrames={20}><Audio src={staticFile("habouba/sfx-boom.wav")} volume={0.5} /></Sequence>
      {[2, S(2.1), S(8.45), S(9.55), S(10.38), S(11.1), S(12.05), S(16.1), S(16.9)].map((f) => <Sequence key={f} from={f} durationInFrames={15}><Audio src={staticFile("cc/pop.wav")} volume={0.35} /></Sequence>)}
      {[S(3.3) - 8, S(8.2), S(13.2) - 8, S(16.0) - 1].map((f) => <Sequence key={"w" + f} from={f} durationInFrames={14}><Audio src={staticFile("habouba/sfx-whoosh.wav")} volume={0.4} /></Sequence>)}
    </AbsoluteFill>
  );
};
void CHAR;
