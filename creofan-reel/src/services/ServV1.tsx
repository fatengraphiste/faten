import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { MixedText } from "../components";
import { OutroIcon } from "../outro/OutroIcon";
import { Lot } from "./LottieUse";
import "../theme";

// CREOFAN — services (V1 réseaux sociaux, 9:16). Voix : Faty (derja), 18,83 s.
// Concept : un pendule simple accroché au logo en haut ; chaque idée est une carte suspendue qui se balance
// (effet « berceau de Newton » : la carte suivante entre par un côté, la précédente repart de l'autre).
const FPS = 30;
const RED = "#f7322a", PINK = "#fa8985", BEIGE = "#fff5f5", CHAR = "#1A1A1A", WHITE = "#ffffff";
const FONT = "Poppins, sans-serif";
const K = 1 / 0.9; // voix ralentie à 90 %
const S = (x: number) => Math.round(x * K * FPS);
export const SERV1_VOICE = "services/v1-slow.mp3";
const OUT = S(19.3);
export const SERV1_TOTAL = OUT + 90;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number, a: number, d: number, e = Easing.bezier(0.65, 0, 0.35, 1)) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: e });
const PIV = { x: 540, y: 158 };   // centre du logo = point d'accroche du pendule
type Card = { a: number; b: number; kind: "card" | "logo"; text?: string; lot?: string; lotSize?: number; x?: boolean; sub?: string };
const CARDS: Card[] = [
  { a: 0, b: 1.95, kind: "card", text: "مشروعك قوي", lot: "gr1" },
  { a: 1.95, b: 4.3, kind: "card", text: "ما تشوفوش؟", lot: "web1" },
  { a: 4.3, b: 5.55, kind: "card", text: "صورة générique", lot: "brand3", x: true },
  { a: 5.55, b: 6.8, kind: "card", text: "Site web قديم", lot: "web2", x: true },
  { a: 6.8, b: 8.2, kind: "card", text: "سوشيال بلا هوية", lot: "soc4", x: true },
  { a: 8.2, b: 9.5, kind: "logo", text: "Creofan معاكم" },
  { a: 9.5, b: 10.3, kind: "card", text: "Branding", lot: "brand3" },
  { a: 10.3, b: 11.1, kind: "card", text: "Site web", lot: "web2" },
  { a: 11.1, b: 12.05, kind: "card", text: "Social kit", lot: "soc4" },
  { a: 12.05, b: 13.2, kind: "card", text: "Motion design", lot: "mo1" },
  { a: 13.2, b: 14.5, kind: "card", text: "رؤية طويلة المدى", lot: "gr1" },
  { a: 14.5, b: 16.0, kind: "card", text: "سرعة الإنجاز", lot: "sp3" },
  { a: 16.0, b: 19.3, kind: "logo", text: "نعطيوكم روح لخدمتكم" },
];
// fond rouge : pivot + services (8,2 → 13,2) puis final (16,0 →)
const REDS: [number, number][] = [[8.2, 13.2], [16.0, 99]];


// Pendule d'arrière-plan : lent, ample mais doux (période 4,4 s, ±13°)
const BgPendulum: React.FC<{ t: number; red: boolean; front: number }> = ({ t, red, front }) => {
  const th = 13 * Math.sin((t / FPS) * ((Math.PI * 2) / 4.4)) * (1 - 0.35 * front);
  const L = 1000 - front * 560, size = 330 + front * 130;
  return (
    <div style={{ position: "absolute", left: PIV.x, top: PIV.y, width: 0, height: 0, transform: `rotate(${th}deg)`, transformOrigin: "0 0", opacity: 0.22 + 0.78 * front, zIndex: front > 0.5 ? 20 : 1 }}>
      <div style={{ position: "absolute", left: -3, top: 0, width: 6, height: L, backgroundColor: red ? WHITE : RED, opacity: 0.5 }} />
      <div style={{ position: "absolute", left: -size / 2, top: L, width: size, height: size, borderRadius: size * 0.28, backgroundColor: red ? WHITE : RED, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${-th * 0.6}deg)` }}>
        <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: size * 0.68, filter: red ? "none" : "brightness(0) invert(1)" }} />
      </div>
    </div>
  );
};

const Scene: React.FC<{ t: number; c: Card; red: boolean }> = ({ t, c, red }) => {
  const a = S(c.a), b = S(c.b);
  const lf = t - a;
  const inn = ease(t, a, 16, Easing.out(Easing.cubic));
  const out = ease(t, b - 8, 8);
  const o = inn * (1 - out);
  return (
    <Sequence from={a} layout="none">
      <div style={{ position: "absolute", inset: 0, opacity: o, transform: `translateY(${(1 - inn) * 40 - out * 20}px) scale(${0.96 + 0.04 * inn})` }}>
        {c.lot ? <div style={{ position: "absolute", left: 540 - 450, top: 250, ...(c.lot === "brand3" ? { clipPath: "inset(110px 110px 110px 110px round 70px)" } : {}) }}><Lot name={c.lot} size={900} /></div> : null}
        {c.x ? <div style={{ position: "absolute", left: 780, top: 360, width: 110, height: 110, borderRadius: 99, backgroundColor: RED, color: WHITE, fontFamily: FONT, fontWeight: 800, fontSize: 78, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${spring({ frame: lf - 12, fps: FPS, config: { damping: 14 } })})` }}>✕</div> : null}
        <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 1090, display: "flex", justifyContent: "center" }}>
          <div style={{ backgroundColor: red ? WHITE : RED, borderRadius: 999, padding: "4px 50px 18px" }}><MixedText text={c.text ?? ""} size={c.text && c.text.length > 12 ? 82 : 104} color={red ? RED : WHITE} style={{ whiteSpace: "nowrap" }} /></div>
        </div>
      </div>
    </Sequence>
  );
};

export const ServV1: React.FC = () => {
  const t = useCurrentFrame();
  const inOutro = t >= OUT;
  const redNow = REDS.some(([a, b]) => t >= S(a) && t < S(b));
  const wipe = (a: number) => ease(t, S(a), 9, Easing.out(Easing.cubic));
  // le pendule passe au premier plan sur le pivot « Creofan معاكم » et sur le final
  const front = Math.max(ease(t, S(8.2), 14) * (1 - ease(t, S(9.4), 12)), ease(t, S(16.0), 14));
  const logoScene = CARDS.find((c) => c.kind === "logo")!;
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      {!inOutro ? (<>
        {REDS.map(([a, b], i) => <div key={i} style={{ position: "absolute", inset: 0, backgroundColor: RED, transform: `translateY(${(1 - wipe(a)) * 100}%)`, opacity: t >= S(b) ? 0 : 1 }} />)}
        <BgPendulum t={t} red={redNow} front={front} />
        {CARDS.filter((c) => c.kind === "card" && t >= S(c.a) - 1 && t < S(c.b) + 1).map((c) => <Scene key={c.a} t={t} c={c} red={redNow} />)}
        {/* pivot : texte sous le pendule passé au premier plan */}
        {t >= S(logoScene.a) && t < S(logoScene.b) + 6 ? (() => { const k = ease(t, S(8.5), 14, Easing.out(Easing.cubic)) * (1 - ease(t, S(logoScene.b) - 6, 8)); return <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 1200, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * 30}px)`, zIndex: 30 }}><MixedText text="Creofan معاكم" size={118} color={WHITE} style={{ whiteSpace: "nowrap" }} /></div>; })() : null}
        {t >= S(16.0) ? (() => { const k = ease(t, S(16.6), 14, Easing.out(Easing.cubic)); return <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 1160, display: "flex", flexDirection: "column", alignItems: "center", opacity: k, transform: `translateY(${(1 - k) * 30}px)`, zIndex: 30 }}><MixedText text="نعطيوكم روح" size={120} color={WHITE} style={{ whiteSpace: "nowrap" }} /><MixedText text="لخدمتكم" size={120} color={WHITE} style={{ whiteSpace: "nowrap" }} /></div>; })() : null}
        <div style={{ position: "absolute", left: 0, right: 0, top: PIV.y - 46, display: "flex", justifyContent: "center", zIndex: 40 }}>
          <div style={{ width: 92, height: 92, borderRadius: 99, backgroundColor: redNow ? WHITE : RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 70, height: 70, filter: redNow ? "none" : "brightness(0) invert(1)" }} />
          </div>
        </div>
      </>) : (
        <AbsoluteFill style={{ backgroundColor: RED }}><OutroIcon f={t - OUT} fg={WHITE} bg="transparent" size={460} cy={860} /></AbsoluteFill>
      )}

      <Audio src={staticFile(SERV1_VOICE)} />
      <Audio src={staticFile("services/music-v1.mp3")} volume={(f) => interpolate(f, [0, S(8), S(8.3), SERV1_TOTAL - 30, SERV1_TOTAL], [0.2, 0.2, 0.26, 0.26, 0], clamp)} />
      {CARDS.map((c) => <Sequence key={c.a} from={S(c.a)} durationInFrames={14}><Audio src={staticFile("habouba/sfx-whoosh.wav")} volume={0.18} /></Sequence>)}
      {CARDS.slice(1).map((c) => <Sequence key={"k" + c.a} from={S(c.a) + 6} durationInFrames={15}><Audio src={staticFile("cc/pop.wav")} volume={0.22} /></Sequence>)}
    </AbsoluteFill>
  );
};
void PINK; void CHAR;
