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
const INTRO = 50; // alarme d'ouverture (≈ 1,7 s) avant le début de la voix
const S = (x: number) => Math.round(x * K * FPS) + INTRO;
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
  { a: 4.3, b: 5.55, kind: "card", text: "صورة\ngénérique", lot: "brand3", x: true },
  { a: 5.55, b: 6.8, kind: "card", text: "Site web\nقديم", lot: "web2", x: true },
  { a: 6.8, b: 8.2, kind: "card", text: "سوشيال\nبلا هوية", lot: "soc4", x: true },
  { a: 8.2, b: 9.5, kind: "logo", text: "Creofan معاكم" },
  { a: 9.5, b: 10.3, kind: "card", text: "Branding", lot: "brand3" },
  { a: 10.3, b: 11.1, kind: "card", text: "Site web", lot: "web2" },
  { a: 11.1, b: 12.05, kind: "card", text: "Social kit", lot: "soc4" },
  { a: 12.05, b: 13.2, kind: "card", text: "Motion\ndesign", lot: "mo1" },
  { a: 13.2, b: 14.5, kind: "card", text: "رؤية\nطويلة المدى", lot: "gr1" },
  { a: 14.5, b: 16.0, kind: "card", text: "سرعة\nالإنجاز", lot: "sp3" },
  { a: 16.0, b: 19.3, kind: "logo", text: "نعطيوكم روح لخدمتكم" },
];
// fond rouge : pivot + services (8,2 → 13,2) puis final (16,0 →)
const REDS: [number, number][] = [[8.2, 13.2], [16.0, 99]];




const isRed = (c: Card) => REDS.some(([a, b]) => c.a >= a && c.a < b);
const PEND = [5, 6, 7, 8, 9];   // le pendule n'intervient que sur l'annonce « Creofan معاكم » + les 4 services
const isPend = (i: number) => PEND.includes(i);
const LP = 1000, REST = 36, SW = 26, PRE = 9;
const sweepStart = (i: number) => S(CARDS[i].a) - PRE;
const dirOf = (i: number) => (i % 2 === 1 ? -1 : 1);
const theta = (t: number) => {
  let j = -1;
  for (const i of PEND) if (t >= sweepStart(i)) j = i;
  if (j < 0) return REST;
  const d = dirOf(j);
  const q = Math.min(1, Math.max(0, (t - sweepStart(j)) / SW));
  const e = 0.5 - 0.5 * Math.cos(Math.PI * q);
  const from = -d * REST, to = d * REST;
  return from + (to - from) * e + (q >= 1 ? Math.sin(t / 26 + j) * 1.4 : 0);
};
const edgeX = (th: number) => PIV.x + LP * Math.sin((th * Math.PI) / 180);
// transition « point » (réf. 2) : un point rouge rebondit puis s'ouvre en cercle et révèle le plan suivant
const DOT = { x: 540, y: 800 }, DPRE = 11, DDUR = 20;
const dotStart = (i: number) => S(CARDS[i].a) - DPRE;
const dotR = (t: number, i: number) => {
  const lf = t - dotStart(i);
  if (lf < 0) return -1;
  if (lf < 6) return 26 * (1 - Math.pow(1 - lf / 6, 3)) + 6 * Math.sin((lf / 6) * Math.PI);
  const q = Math.min(1, (lf - 6) / DDUR);
  return 30 + 1700 * (q * q * (3 - 2 * q));
};

const lines = (txt: string) => txt.split("\n");
const Content: React.FC<{ c: Card }> = ({ c }) => {
  const red = isRed(c);
  const a = S(c.a);
  const ls = lines(c.text ?? "");
  const big = ls.some((l) => l.length > 11) ? 84 : 98;
  return (
    <Sequence from={a} layout="none">
      <AbsoluteFill style={{ backgroundColor: red ? RED : BEIGE }}>
        {!red ? <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(#ecd2d0 2.5px, transparent 2.5px)", backgroundSize: "54px 54px", opacity: 0.8 }} /> : null}
        {c.kind === "card" && c.lot ? <div style={{ position: "absolute", left: 540 - 410, top: 300, ...(c.lot === "brand3" ? { clipPath: "inset(100px 100px 100px 100px round 64px)" } : {}) }}><Lot name={c.lot} size={820} /></div> : null}
        {c.kind === "logo" ? <div style={{ position: "absolute", left: 540 - 150, top: 400, width: 300, height: 300, borderRadius: 84, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 210, height: 210 }} /></div> : null}
        {c.x ? <div style={{ position: "absolute", left: 770, top: 330, width: 110, height: 110, borderRadius: 99, backgroundColor: RED, color: WHITE, fontFamily: FONT, fontWeight: 800, fontSize: 78, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</div> : null}
        <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: c.kind === "logo" ? 780 : 1090, display: "flex", justifyContent: "center" }}>
          {c.kind === "logo" ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              {(c.a === 16.0 ? ["نعطيوكم روح", "لخدمتكم"] : ["Creofan", "معاكم"]).map((l) => <MixedText key={l} text={l} size={124} color={WHITE} style={{ whiteSpace: "nowrap" }} />)}
            </div>
          ) : (
            <div style={{ backgroundColor: red ? WHITE : RED, borderRadius: 64, padding: "6px 56px 22px", transform: "rotate(-2.5deg)", boxShadow: "0 14px 34px rgba(26,26,26,0.16)", display: "flex", flexDirection: "column", alignItems: "center" }}>
              {ls.map((l) => <MixedText key={l} text={l} size={big} color={red ? RED : WHITE} style={{ whiteSpace: "nowrap" }} />)}
            </div>
          )}
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};

// ─── alarme d'ouverture (réf. 3) ───
const AlarmIntro: React.FC<{ t: number }> = ({ t }) => {
  const k = interpolate(t, [0, 10], [0, 1], { ...clamp, easing: Easing.bezier(0.22, 1.5, 0.36, 1) });
  const ring = t >= 8 ? Math.sin(t * 1.9) * 9 * Math.min(1, (t - 8) / 4) : 0;
  const rays = t >= 8 && Math.floor(t / 3) % 2 === 0;
  const exit = ease(t, INTRO - 12, 6);
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(#ecd2d0 2.5px, transparent 2.5px)", backgroundSize: "54px 54px", opacity: 0.8 }} />
      <div style={{ position: "absolute", left: 540 - 330, top: 760 - 330 - 20, width: 660, height: 660, transform: `scale(${k * (1 - exit * 0.25)}) rotate(${ring}deg)`, opacity: 1 - exit }}>
        <div style={{ position: "absolute", left: 90, top: 150, width: 480, height: 400, borderRadius: "50%", backgroundColor: RED, opacity: 0.95 }} />
        <div style={{ position: "absolute", left: 0, top: 0 }}><Lot name="al4" size={660} /></div>
        {rays ? [[-1, -1], [1, -1]].map(([x, y], i) => <div key={i} style={{ position: "absolute", left: x < 0 ? -70 : 640, top: 40, width: 8, height: 80, borderRadius: 4, backgroundColor: CHAR, transform: `rotate(${x * 35}deg)` }} />) : null}
        {rays ? [[-1], [1]].map(([x], i) => <div key={i} style={{ position: "absolute", left: x < 0 ? -110 : 680, top: 150, width: 8, height: 70, borderRadius: 4, backgroundColor: CHAR, transform: `rotate(${x * 75}deg)` }} />) : null}
      </div>
    </AbsoluteFill>
  );
};

export const ServV1: React.FC = () => {
  const t = useCurrentFrame();
  const inOutro = t >= OUT;
  const th = theta(t);
  const tr = (th * Math.PI) / 180;
  const bx = PIV.x + LP * Math.sin(tr), by = PIV.y + LP * Math.cos(tr);
  const pendOn = t >= sweepStart(PEND[0]) - 4 && t < S(CARDS[PEND[PEND.length - 1]].b) + 6;
  const pendOp = Math.min(ease(t, sweepStart(PEND[0]) - 4, 4), 1 - ease(t, S(CARDS[PEND[PEND.length - 1]].b) - 2, 6));
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      {!inOutro ? (<>
        <AlarmIntro t={t} />
        {CARDS.map((c, i) => {
          const pend = isPend(i);
          const start = pend ? sweepStart(i) : dotStart(i);
          const nextDone = i + 1 < CARDS.length ? (isPend(i + 1) ? sweepStart(i + 1) + SW : dotStart(i + 1) + 6 + DDUR) : 1e9;
          if (t < start || t >= nextDone) return null;
          let clip: string | undefined;
          let ring: React.ReactNode = null;
          if (pend && t < sweepStart(i) + SW) {
            const e = Math.max(0, Math.min(1080, edgeX(th)));
            clip = dirOf(i) < 0 ? `inset(0px 0px 0px ${e}px)` : `inset(0px ${1080 - e}px 0px 0px)`;
          } else if (!pend) {
            const r = dotR(t, i);
            if (r < 0) return null;
            if (t - dotStart(i) < 6) {
              return <div key={i} style={{ position: "absolute", left: DOT.x - r, top: DOT.y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", backgroundColor: RED, zIndex: 20 }} />;
            }
            if (t < dotStart(i) + 6 + DDUR) { clip = `circle(${r}px at ${DOT.x}px ${DOT.y}px)`; ring = <div style={{ position: "absolute", left: DOT.x - r, top: DOT.y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", border: `10px solid ${RED}`, boxSizing: "border-box", zIndex: 21 }} />; }
          }
          return <React.Fragment key={i}><div style={{ position: "absolute", inset: 0, clipPath: clip }}><Content c={c} /></div>{ring}</React.Fragment>;
        })}
        {pendOn ? (
          <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", zIndex: 25, opacity: pendOp }}>
            <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
              <line x1={PIV.x} y1={PIV.y} x2={bx} y2={by} stroke={CHAR} strokeWidth={6} strokeOpacity={0.55} />
            </svg>
            <div style={{ position: "absolute", left: bx - 125, top: by - 125, width: 250, height: 250, borderRadius: 70, backgroundColor: WHITE, border: `8px solid ${RED}`, boxShadow: "0 20px 50px rgba(26,26,26,0.25)", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${th * 0.7}deg)` }}>
              <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 170, height: 170 }} />
            </div>
          </div>
        ) : null}
        <div style={{ position: "absolute", left: 0, right: 0, top: PIV.y - 46, display: "flex", justifyContent: "center", zIndex: 40 }}>
          <div style={{ width: 92, height: 92, borderRadius: 99, backgroundColor: WHITE, border: `6px solid ${RED}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: ease(t, INTRO - 6, 8) }}>
            <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 62, height: 62 }} />
          </div>
        </div>
      </>) : (
        <AbsoluteFill style={{ backgroundColor: RED }}><OutroIcon f={t - OUT} fg={WHITE} bg="transparent" size={460} cy={860} /></AbsoluteFill>
      )}

      <Sequence from={INTRO}><Audio src={staticFile(SERV1_VOICE)} /></Sequence>
      <Audio src={staticFile("services/music-v1.mp3")} volume={(f) => interpolate(f, [0, INTRO - 8, INTRO + 4, S(8), S(8.3), SERV1_TOTAL - 30, SERV1_TOTAL], [0, 0, 0.2, 0.2, 0.26, 0.26, 0], clamp)} />
      <Sequence from={0} durationInFrames={44}><Audio src={staticFile("habouba/sfx-alarm.wav")} volume={0.55} /></Sequence>
      {CARDS.map((c, i) => <Sequence key={c.a} from={isPend(i) ? sweepStart(i) : dotStart(i) + 6} durationInFrames={18}><Audio src={staticFile(isPend(i) ? "habouba/sfx-whoosh.wav" : "cc/pop.wav")} volume={isPend(i) ? 0.3 : 0.3} /></Sequence>)}
    </AbsoluteFill>
  );
};
void PINK; void CHAR; void ease;
