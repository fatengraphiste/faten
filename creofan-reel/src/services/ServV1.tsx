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
const SH = "0 24px 60px rgba(26,26,26,0.20)";
const PIV = { x: 540, y: 158 };   // centre du logo = point d'accroche
const L = 420;                    // longueur du fil

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
  { a: 16.0, b: 19.3, kind: "card", text: "نعطيوكم روح لخدمتكم", lot: "hr2" },
];
// fond rouge : pivot + services (8,2 → 13,2) puis final (16,0 →)
const REDS: [number, number][] = [[8.2, 13.2], [16.0, 99]];

// angle du pendule pour la carte i (degrés)
const angle = (t: number, i: number) => {
  const c = CARDS[i], a = S(c.a), b = S(c.b);
  const e = i % 2 === 0 ? 1 : -1;               // côté d'entrée
  const lf = t - a;
  if (lf < 0) return e * 62;
  const swing = e * 52 * Math.exp(-lf / 15) * Math.cos(lf * 0.27) + Math.sin(t / 11 + i) * 1.2 * ease(lf, 12, 10);
  const last = i === CARDS.length - 1;
  const outStart = b - 8;
  if (!last && t >= outStart) {
    const q = ease(t, outStart, 8, Easing.in(Easing.quad));
    const cur = e * 52 * Math.exp(-(outStart - a) / 15) * Math.cos((outStart - a) * 0.27);
    return cur + (e * 62 - cur) * q * 1 + 0 * q;      // repart du côté d'où il est entré
  }
  return swing;
};

const IllusLabel: React.FC<{ c: Card; red: boolean; lf: number }> = ({ c, red, lf }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 820, height: 800, borderRadius: 64, backgroundColor: WHITE, boxShadow: SH, overflow: "hidden" }}>
    {c.lot ? <div style={{ position: "absolute", left: 70, top: -20 }}><Lot name={c.lot} size={680} /></div> : null}
    {c.x ? <div style={{ position: "absolute", right: 36, top: 36, width: 120, height: 120, borderRadius: 99, backgroundColor: RED, color: WHITE, fontFamily: FONT, fontWeight: 800, fontSize: 86, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${spring({ frame: lf - 10, fps: FPS, config: { damping: 9 } })})` }}>✕</div> : null}
    <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, bottom: 36, display: "flex", justifyContent: "center" }}>
      <div style={{ backgroundColor: red ? RED : RED, borderRadius: 999, padding: "4px 44px 18px" }}><MixedText text={c.text ?? ""} size={c.text && c.text.length > 12 ? 82 : 104} color={WHITE} style={{ whiteSpace: "nowrap" }} /></div>
    </div>
  </div>
);

export const ServV1: React.FC = () => {
  const t = useCurrentFrame();
  const inOutro = t >= OUT;
  const redNow = REDS.some(([a, b]) => t >= S(a) && t < S(b));
  const wipe = (a: number) => ease(t, S(a), 7, Easing.out(Easing.cubic));
  const ci = CARDS.findIndex((c) => t >= S(c.a) && t < S(c.b) + 8);
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      {!inOutro ? (<>
        {/* fonds */}
        {REDS.map(([a], i) => <div key={i} style={{ position: "absolute", inset: 0, backgroundColor: RED, transform: `translateY(${(1 - wipe(a)) * 100}%)`, opacity: t >= S(REDS[i][1]) ? 0 : 1 }} />)}
        {/* cartes suspendues (la précédente reste visible 8 images pendant l'entrée suivante) */}
        {CARDS.map((c, i) => {
          if (t < S(c.a) - 1 || t >= S(c.b) + 8) return null;
          const th = angle(t, i);
          const lf = t - S(c.a);
          return (
            <Sequence key={i} from={S(c.a)} layout="none"><div style={{ position: "absolute", left: PIV.x, top: PIV.y, width: 0, height: 0, transform: `rotate(${th}deg)`, transformOrigin: "0 0", opacity: Math.min(1, lf / 3 + 0.4) }}>
              <div style={{ position: "absolute", left: -3, top: 0, width: 6, height: L, backgroundColor: redNow ? WHITE : CHAR, opacity: 0.85 }} />
              <div style={{ position: "absolute", left: -410, top: L, width: 820, height: 800 }}>
                {c.kind === "card" ? <IllusLabel c={c} red={redNow} lf={lf} /> : (
                  <div style={{ position: "absolute", left: 0, top: 0, width: 820, height: 800 }}>
                    <div style={{ position: "absolute", left: 270, top: 20, width: 280, height: 280, borderRadius: 80, backgroundColor: WHITE, boxShadow: SH, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 190, height: 190 }} />
                    </div>
                    <div dir="rtl" style={{ position: "absolute", left: -90, width: 1000, top: 360, display: "flex", justifyContent: "center", transform: `rotate(${-th}deg)` }}>
                      <MixedText text={c.text ?? ""} size={130} color={WHITE} style={{ whiteSpace: "nowrap" }} />
                    </div>
                  </div>
                )}
              </div>
            </div></Sequence>
          );
        })}
        {void ci}
        {/* logo = point d'accroche, toujours en haut au centre */}
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
      {CARDS.map((c) => <Sequence key={c.a} from={S(c.a)} durationInFrames={14}><Audio src={staticFile("habouba/sfx-whoosh.wav")} volume={0.28} /></Sequence>)}
      {CARDS.slice(1).map((c) => <Sequence key={"k" + c.a} from={S(c.a) + 2} durationInFrames={15}><Audio src={staticFile("cc/pop.wav")} volume={0.3} /></Sequence>)}
      <Sequence from={0} durationInFrames={20}><Audio src={staticFile("habouba/sfx-boom.wav")} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};
void PINK;
