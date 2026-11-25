import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
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



const isRed = (c: Card) => REDS.some(([a, b]) => c.a >= a && c.a < b);

// ── pendule-essuie-glace : à chaque changement de plan il balaie l'écran d'un bord à l'autre ; ──
// ── ce qu'il a déjà dépassé montre le plan suivant (illustration + texte), calé sur la voix.  ──
const LP = 1000, REST = 36, SW = 26, PRE = 9;           // longueur du fil, angle de repos (°), durée du balayage (images), avance
const sweepStart = (i: number) => S(CARDS[i].a) - PRE;
const dirOf = (i: number) => (i % 2 === 1 ? -1 : 1);   // balayage vers la gauche (−1) pour les plans impairs
const theta = (t: number) => {
  let j = -1;
  for (let i = 1; i < CARDS.length; i++) if (t >= sweepStart(i)) j = i;
  if (j < 0) return REST + Math.sin(t / 24) * 1.4;
  const d = dirOf(j);                                   // d = −1 : de +REST vers −REST
  const q = Math.min(1, Math.max(0, (t - sweepStart(j)) / SW));
  const e = 0.5 - 0.5 * Math.cos(Math.PI * q);
  const from = -d * REST, to = d * REST;
  return from + (to - from) * e + (q >= 1 ? Math.sin(t / 26 + j) * 1.4 : 0);
};
const edgeX = (th: number) => PIV.x + LP * Math.sin((th * Math.PI) / 180);

const Content: React.FC<{ c: Card }> = ({ c }) => {
  const red = isRed(c);
  const a = S(c.a);
  return (
    <Sequence from={a} layout="none">
      <AbsoluteFill style={{ backgroundColor: red ? RED : BEIGE }}>
        {c.kind === "card" && c.lot ? <div style={{ position: "absolute", left: 540 - 450, top: 250, ...(c.lot === "brand3" ? { clipPath: "inset(110px 110px 110px 110px round 70px)" } : {}) }}><Lot name={c.lot} size={900} /></div> : null}
        {c.kind === "logo" ? <div style={{ position: "absolute", left: 540 - 150, top: 420, width: 300, height: 300, borderRadius: 84, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 210, height: 210 }} /></div> : null}
        {c.x ? <div style={{ position: "absolute", left: 780, top: 360, width: 110, height: 110, borderRadius: 99, backgroundColor: RED, color: WHITE, fontFamily: FONT, fontWeight: 800, fontSize: 78, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</div> : null}
        <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: c.kind === "logo" ? 800 : 1090, display: "flex", justifyContent: "center" }}>
          {c.kind === "logo" ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              {(c.text ?? "").split(c.a === 16.0 ? " " : "\n").length && c.a === 16.0 ? (<><MixedText text="نعطيوكم روح" size={120} color={WHITE} style={{ whiteSpace: "nowrap" }} /><MixedText text="لخدمتكم" size={120} color={WHITE} style={{ whiteSpace: "nowrap" }} /></>) : <MixedText text={c.text ?? ""} size={118} color={WHITE} style={{ whiteSpace: "nowrap" }} />}
            </div>
          ) : (
            <div style={{ backgroundColor: red ? WHITE : RED, borderRadius: 999, padding: "4px 50px 18px" }}><MixedText text={c.text ?? ""} size={c.text && c.text.length > 12 ? 82 : 104} color={red ? RED : WHITE} style={{ whiteSpace: "nowrap" }} /></div>
          )}
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};

export const ServV1: React.FC = () => {
  const t = useCurrentFrame();
  const inOutro = t >= OUT;
  const th = theta(t);
  const ex = edgeX(th);
  const tr = (th * Math.PI) / 180;
  const bx = PIV.x + LP * Math.sin(tr), by = PIV.y + LP * Math.cos(tr);
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      {!inOutro ? (<>
        {CARDS.map((c, i) => {
          const start = i === 0 ? 0 : sweepStart(i);
          const nextDone = i + 1 < CARDS.length ? sweepStart(i + 1) + SW : 1e9;
          if (t < start || t >= nextDone) return null;
          let clip: string | undefined;
          if (i > 0 && t < sweepStart(i) + SW) {
            const e = Math.max(0, Math.min(1080, ex));
            clip = dirOf(i) < 0 ? `inset(0px 0px 0px ${e}px)` : `inset(0px ${1080 - e}px 0px 0px)`;
          }
          return <div key={i} style={{ position: "absolute", inset: 0, clipPath: clip }}><Content c={c} /></div>;
        })}
        {/* fil + masse du pendule */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", zIndex: 25 }}>
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
            <line x1={PIV.x} y1={PIV.y} x2={bx} y2={by} stroke={CHAR} strokeWidth={6} strokeOpacity={0.55} />
          </svg>
          <div style={{ position: "absolute", left: bx - 125, top: by - 125, width: 250, height: 250, borderRadius: 70, backgroundColor: WHITE, border: `8px solid ${RED}`, boxShadow: "0 20px 50px rgba(26,26,26,0.25)", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${th * 0.7}deg)` }}>
            <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 170, height: 170 }} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: PIV.y - 46, display: "flex", justifyContent: "center", zIndex: 40 }}>
          <div style={{ width: 92, height: 92, borderRadius: 99, backgroundColor: WHITE, border: `6px solid ${RED}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 62, height: 62 }} />
          </div>
        </div>
      </>) : (
        <AbsoluteFill style={{ backgroundColor: RED }}><OutroIcon f={t - OUT} fg={WHITE} bg="transparent" size={460} cy={860} /></AbsoluteFill>
      )}

      <Audio src={staticFile(SERV1_VOICE)} />
      <Audio src={staticFile("services/music-v1.mp3")} volume={(f) => interpolate(f, [0, S(8), S(8.3), SERV1_TOTAL - 30, SERV1_TOTAL], [0.2, 0.2, 0.26, 0.26, 0], clamp)} />
      {CARDS.slice(1).map((c) => <Sequence key={c.a} from={sweepStart(CARDS.indexOf(c))} durationInFrames={18}><Audio src={staticFile("habouba/sfx-whoosh.wav")} volume={0.3} /></Sequence>)}
      {CARDS.slice(1).map((c) => <Sequence key={"k" + c.a} from={S(c.a) + 2} durationInFrames={15}><Audio src={staticFile("cc/pop.wav")} volume={0.25} /></Sequence>)}
    </AbsoluteFill>
  );
};
void PINK; void CHAR; void ease;
