import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { MixedText } from "../components";
import {
  ARABIC, BEIGE, Big, CHAR, ENV, FONT, I_BULB, I_DOC, I_MIC, I_PLAY, I_STAR, Ico, Outro, Pack, PINK, Pill, RED, TXT, WA, WHITE, WT, el, ease, outE, wt,
} from "./CloneV2";
import "../theme";

// CREOFAN — motion v4 : ton interface (carte profil + lecteur de voix), rouge de la charte #f7322a.
// Ouverture : notification « message vocal » → l'interface s'ouvre → play → la voix démarre.
// Chaque objet est « lancé » depuis l'avatar (animation volante), un seul à la fois.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const INTRO = 84;
const VOICE = s(34.3);
const OUT = INTRO + VOICE;
export const CLONE4_DURATION = OUT + 140;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Géométrie (d'après l'interface de référence, 1080×1920)
const CARD = { x: 121, y: 176, w: 838, h: 1594, r: 56 };
const BAND = { x: 155, y: 210, w: 770, h: 277, r: 44 };
const AV = { cx: 540, cy: 476, d: 280 };
const AREA = { x: 160, y: 880, w: 760, h: 640 };
const PLAYER = { x: 160, y: 1560, w: 760, h: 174 };
const TEXT_Y = 896;
const OBJ_CX = 540;
const OBJ_CY = 1290;
const LINE_L = 170;
const LINE_W = 740;
const LINE_R = LINE_L + LINE_W;

// Mise à jour du temps : tt = temps de la voix (la voix démarre à INTRO)
const mmss = (f: number) => {
  const sec = Math.max(0, Math.floor(f / FPS));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
};

/* ---------- Texte : ligne + point qui part de l'avatar et trace la ligne ---------- */
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
const SEGEND = (k: number) => WT[k] ? s([0.83, 3.93, 5.89, 7.43, 9.88, 12.88, 14.49, 18.44, 22.65, 24.1, 25.9, 28.41, 31.88, 34.27][k]) : 0;
const Line4: React.FC<{ t: number; seg: number; from: number; to: number; size: number; hot?: number[] }> = ({ t, seg, from, to, size: sizeIn, hot = [] }) => {
  const units = unitsOf(seg, from, to);
  const est = (sz: number) => {
    let w = 0;
    for (const u of units) for (const i of u.ids) { const x = TXT[seg][i]; w += ARABIC.test(x) ? x.length * 0.5 * sz * (x.includes("ـ") ? 0.8 : 1) : x.length * 0.62 * 0.78 * sz + 1.3 * 0.78 * sz; }
    return w + units.length * 0.3 * sz;
  };
  const size = Math.min(sizeIn, 104) * Math.min(1, (LINE_W * 0.97) / est(Math.min(sizeIn, 104)));
  const tStart = wt(seg, from);
  const tEnd = to < TXT[seg].length ? wt(seg, to) : SEGEND(seg);
  const n = units.length;
  const keys = units.map((u, j) => ({ at: wt(seg, u.ids[0]), p: j / n }));
  keys.push({ at: tEnd, p: 1 });
  let p = 0;
  if (t >= keys[0].at) {
    p = 1;
    for (let j = 0; j < keys.length - 1; j++) if (t < keys[j + 1].at) { p = interpolate(t, [keys[j].at, keys[j + 1].at], [keys[j].p, keys[j + 1].p], clamp); break; }
  }
  const ly = TEXT_Y + size * 1.42;
  const dx = LINE_R - p * LINE_W;
  // le point est « lancé » depuis l'avatar jusqu'au début de la ligne
  const fl = ease(t, tStart - 18, 16, Easing.out(Easing.cubic));
  const px = interpolate(fl, [0, 1], [AV.cx, p > 0 ? dx : LINE_R]);
  const py = interpolate(fl, [0, 1], [AV.cy + 60, ly]) - Math.sin(fl * Math.PI) * 110;
  const done = t >= tEnd;
  const bounce = done ? Math.abs(Math.sin(Math.min(1, (t - tEnd) / 14) * Math.PI)) * 16 : 0;
  return (
    <>
      <div dir="rtl" style={{ position: "absolute", left: LINE_L, width: LINE_W, top: TEXT_Y, display: "flex", justifyContent: "center", alignItems: "center", gap: `0 ${size * 0.3}px`, flexWrap: "nowrap" }}>
        {units.map((u, j) => {
          const k = el(t, wt(seg, u.ids[0]), 10);
          return (
            <div key={j} dir="rtl" style={{ display: "flex", alignItems: "center", gap: size * 0.1, opacity: Math.min(1, k * 2), transform: `translateY(${(1 - k) * size * 0.45}px) scale(${0.72 + 0.28 * k})` }}>
              {u.ids.map((i) => {
                const w = TXT[seg][i];
                return ARABIC.test(w) ? <MixedText key={i} text={w} size={size} color={hot.includes(i) ? RED : CHAR} /> : <Pill key={i} text={w} c={RED} fg={WHITE} size={size * 0.78} />;
              })}
            </div>
          );
        })}
      </div>
      {fl > 0 ? <div style={{ position: "absolute", left: dx, top: ly - 3, width: LINE_R - dx, height: 6, borderRadius: 6, backgroundColor: CHAR, opacity: fl > 0.99 ? 0.4 : 0 }} /> : null}
      <div style={{ position: "absolute", left: px - 19, top: py - 19 - bounce, width: 38, height: 38, borderRadius: 99, backgroundColor: RED, opacity: fl > 0 ? 1 : 0 }} />
    </>
  );
};

/* ---------- Objets (créés dans la zone blanche) ---------- */
type OP = { t: number; t0: number; t1: number };
// L'objet est lancé depuis l'avatar : arc + rotation + échelle, puis se pose
const Fly: React.FC<{ t: number; t0: number; children: React.ReactNode }> = ({ t, t0, children }) => {
  const e = outE(t, t0, 22);
  const sc = el(t, t0, 9);
  const dx = (1 - e) * (AV.cx - OBJ_CX) * 0.4;
  const dy = (1 - e) * (AV.cy + 80 - OBJ_CY) - Math.sin(e * Math.PI) * 140;
  return (
    <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) rotate(${(1 - e) * 220}deg) scale(${0.18 + 0.82 * sc})`, transformOrigin: `${OBJ_CX}px ${OBJ_CY}px`, opacity: Math.min(1, e * 3) }}>{children}</AbsoluteFill>
  );
};
const At: React.FC<{ w: number; h: number; dy?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ w, h, dy = 0, children, style }) => (
  <div style={{ position: "absolute", left: OBJ_CX - w / 2, top: OBJ_CY - h / 2 + dy, width: w, height: h, ...style }}>{children}</div>
);

const ObjPack: React.FC<OP & { mode: "brand" | "plain" | "morph"; shineAt?: number }> = ({ t, t0, mode, shineAt }) => {
  const reveal = ease(t, t0 + 10, 40);
  const shine = shineAt ? ease(t, shineAt, 26) : 0;
  const morph = ease(t, t0 + 14, 30);
  const w = 250, h = 380;
  return (
    <At w={w * 1.2} h={h + 60} dy={-6}>
      {mode === "morph" ? (
        <div style={{ position: "relative" }}>
          <Pack w={w} h={h} reveal={1} plain t={t} />
          <div style={{ position: "absolute", left: 0, top: 0, clipPath: `inset(0 ${100 - morph * 100}% 0 0)` }}><Pack w={w} h={h} reveal={ease(t, t0 + 14, 40)} shine={ease(t, t0 + 50, 24)} t={t} /></div>
        </div>
      ) : <Pack w={w} h={h} reveal={reveal} shine={shine} t={t} plain={mode === "plain"} />}
    </At>
  );
};
const ObjBio: React.FC<OP> = ({ t, t0 }) => {
  const follow = ease(t, wt(2, 3) + 4, 10);
  return (
    <At w={720} h={440}>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {["UX/UI", "Motion design", "Voix-off IA"].map((tg, i) => (
          <span key={tg} style={{ backgroundColor: BEIGE, color: CHAR, fontFamily: FONT, fontWeight: 600, fontSize: 30, borderRadius: 999, padding: "10px 26px 12px", transform: `scale(${el(t, t0 + 6 + i * 4, 9)})` }}>{tg}</span>
        ))}
      </div>
      <div style={{ marginTop: 34, fontFamily: FONT, fontWeight: 400, fontSize: 34, lineHeight: 1.4, color: CHAR, opacity: 0.8 * ease(t, t0 + 14, 14), textAlign: "center" }}>
        Je crée visuels, vidéos motion et voix-off avec l'IA pour les marques.
      </div>
      <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 420, height: 104, borderRadius: 999, backgroundColor: follow > 0.5 ? RED : CHAR, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, transform: `scale(${1 - 0.06 * Math.sin(Math.min(1, follow) * Math.PI)})` }}>
          <Ico d={follow > 0.5 ? "M5 12.5l4.5 4.5L19 7.5" : "M12 5v14M5 12h14"} c={WHITE} size={44} w={2.6} />
          <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 38, color: WHITE }}>{follow > 0.5 ? "Suivie" : "Suivre"}</span>
        </div>
      </div>
    </At>
  );
};
const ObjStars: React.FC<OP> = ({ t }) => (
  <At w={740} h={140}>
    <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const k = el(t, wt(4, 3) + i * 5, 8);
        return <div key={i} style={{ transform: `scale(${k}) rotate(${(1 - k) * 60}deg)` }}><Ico d={I_STAR} c={RED} size={128} fill={RED} /></div>;
      })}
    </div>
  </At>
);
const ObjImage: React.FC<OP> = ({ t, t0 }) => (
  <At w={500} h={400}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 48, backgroundColor: CHAR, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 36, top: 36, right: 36, bottom: 36, borderRadius: 28, backgroundColor: BEIGE, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 60, top: 46, width: 90, height: 90, borderRadius: 99, backgroundColor: RED, transform: `scale(${el(t, t0 + 8, 9)})` }} />
        <svg width={428} height={328} style={{ position: "absolute", inset: 0 }}><polygon points="0,328 150,130 250,240 320,170 428,290 428,328" fill={CHAR} /></svg>
      </div>
    </div>
  </At>
);
const ObjPalette: React.FC<OP> = ({ t, t0 }) => {
  const sw = [RED, PINK, BEIGE, WHITE];
  return (
    <At w={500} h={400}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 48, backgroundColor: CHAR, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 40, right: 40, top: 40, height: 230, display: "flex", gap: 14 }}>
          {sw.map((c, i) => <div key={i} style={{ flex: 1, borderRadius: 24, backgroundColor: c, transform: `scaleY(${el(t, t0 + 6 + i * 4, 9)})`, transformOrigin: "50% 100%" }} />)}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 38, textAlign: "center" }}><Pill text="charte" c={RED} fg={WHITE} size={54} /></div>
      </div>
    </At>
  );
};
const ObjCheck: React.FC<OP> = ({ t, t0 }) => {
  const draw = ease(t, t0 + 12, 18);
  return (
    <At w={380} h={380}>
      <div style={{ width: 380, height: 380, borderRadius: 9999, backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={220} height={220} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={WHITE} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} /></svg>
      </div>
    </At>
  );
};
const ObjIcon: React.FC<OP & { d: string; bg: string; fg: string; wave?: boolean }> = ({ t, d, bg, fg, wave }) => (
  <At w={380} h={wave ? 470 : 380}>
    <div style={{ width: 380, height: 380, borderRadius: 9999, backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico d={d} c={fg} size={210} w={1.4} /></div>
    {wave ? (
      <div style={{ marginTop: 24, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, height: 70 }}>
        {Array.from({ length: 22 }).map((_, j) => <div key={j} style={{ width: 12, borderRadius: 8, backgroundColor: CHAR, height: 10 + (ENV[Math.max(0, t - j * 2)] ?? 0) * 60 }} />)}
      </div>
    ) : null}
  </At>
);
const ObjDeck: React.FC<OP> = ({ t, t0 }) => (
  <At w={520} h={420}>
    {[0, 1, 2].map((i) => {
      const k = el(t, t0 + 4 + i * 5, 10);
      return (
        <div key={i} style={{ position: "absolute", left: i * 36, top: 200 - i * 80, width: 440, height: 190, borderRadius: 40, backgroundColor: [PINK, CHAR, RED][i], transform: `translateY(${(1 - k) * 120}px) rotate(${(i - 1) * 5}deg)`, opacity: Math.min(1, k * 2), display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ico d={I_PLAY} c={i === 0 ? CHAR : WHITE} size={80} fill={i === 0 ? CHAR : WHITE} />
        </div>
      );
    })}
  </At>
);
const ObjPacks: React.FC<OP> = ({ t }) => {
  const cw = (740 - 40) / 3;
  const packs: [string, string, string, number][] = [["4", RED, WHITE, 5], ["6", CHAR, WHITE, 6], ["8", PINK, CHAR, 8]];
  return (
    <At w={740} h={440}>
      {packs.map(([n, c, fg, wi], i) => {
        const k = el(t, wt(8, wi), 10);
        return (
          <div key={n} style={{ position: "absolute", left: i * (cw + 20), top: 0, width: cw, height: 440, borderRadius: 56, backgroundColor: c, transform: `translateY(${(1 - k) * 90}px) scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k * 2) }}>
            <Big size={230} color={fg} style={{ position: "absolute", left: 0, right: 0, top: 50, textAlign: "center", letterSpacing: -12 }}>{n}</Big>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center", gap: 8 }}>
              {Array.from({ length: Number(n) > 4 ? 3 : 2 }).map((_, j) => <Ico key={j} d={I_PLAY} c={fg} size={44} fill={fg} />)}
            </div>
          </div>
        );
      })}
    </At>
  );
};
const ObjCredits: React.FC<OP> = ({ t, t0 }) => (
  <At w={600} h={360}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 52, backgroundColor: CHAR }}>
      <div style={{ position: "absolute", left: 50, top: 50, width: 110, height: 82, borderRadius: 16, backgroundColor: PINK }} />
      <div style={{ position: "absolute", right: 50, top: 48, width: 90, height: 90, borderRadius: 99, backgroundColor: RED }} />
      <div style={{ position: "absolute", right: 104, top: 48, width: 90, height: 90, borderRadius: 99, backgroundColor: WHITE, opacity: 0.95 }} />
      <Big size={58} color={WHITE} style={{ position: "absolute", left: 50, bottom: 52, letterSpacing: 6, opacity: el(t, t0 + 10, 10) }}>CRÉDITS</Big>
    </div>
  </At>
);
const ObjTiles: React.FC<OP> = ({ t, t0 }) => (
  <At w={740} h={350}>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20 }}>
      {Array.from({ length: 8 }).map((_, i) => {
        const k = el(t, t0 + 4 + i * 3, 9);
        return <div key={i} style={{ width: 160, height: 160, borderRadius: 40, backgroundColor: i % 3 === 0 ? CHAR : RED, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k})` }}><Ico d={I_PLAY} c={WHITE} size={68} fill={WHITE} /></div>;
      })}
    </div>
  </At>
);
const ObjRing: React.FC<OP> = ({ t, t0, t1 }) => {
  const prog = ease(t, t0 + 14, t1 - t0 - 24);
  return (
    <At w={440} h={440}>
      <svg width={440} height={440} viewBox="0 0 440 440" style={{ position: "absolute", inset: 0 }}>
        <circle cx={220} cy={220} r={185} fill="none" stroke={PINK} strokeWidth={34} opacity={0.45} />
        <circle cx={220} cy={220} r={185} fill="none" stroke={RED} strokeWidth={34} strokeLinecap="round" strokeDasharray={`${prog * 1162} 1162`} transform="rotate(-90 220 220)" />
      </svg>
      <Big size={200} color={CHAR} style={{ position: "absolute", left: 0, right: 0, top: 80, textAlign: "center", letterSpacing: -10 }}>3</Big>
      <div style={{ position: "absolute", left: 0, right: 0, top: 285, textAlign: "center" }}><MixedText text="شهور" size={64} color={CHAR} /></div>
    </At>
  );
};
// Fin : le téléphone sonne → on invite à appeler
const ObjCall: React.FC<OP> = ({ t, t0 }) => {
  const ring = Math.sin((t - t0) / 2.2) * (t > t0 + 14 ? 14 : 0);
  return (
    <At w={600} h={470}>
      {[0, 1, 2].map((i) => {
        const p = (((t - t0) / 40 + i / 3) % 1 + 1) % 1;
        return <div key={i} style={{ position: "absolute", left: 300 - (140 + p * 130), top: 130 - (140 + p * 130), width: 2 * (140 + p * 130), height: 2 * (140 + p * 130), borderRadius: 9999, border: `6px solid ${PINK}`, opacity: (1 - p) * 0.8 }} />;
      })}
      <div style={{ position: "absolute", left: 160, top: 0, width: 280, height: 280, borderRadius: 9999, backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${ring}deg)` }}><Ico d={WA} c={WHITE} size={150} w={1.8} fill={WHITE} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 320, textAlign: "center" }}><Big size={92} color={CHAR}>51 097 272</Big></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 428, textAlign: "center", opacity: ease(t, t0 + 16, 12) }}><MixedText text="اتصل بيا توا" size={54} color={RED} /></div>
    </At>
  );
};

/* ---------- Plans : un objet + une ligne de texte à la fois (temps = voix) ---------- */
type TextStep = { seg: number; from: number; to: number; size: number; hot?: number[]; until?: number };
type Scene = { t0: number; t1: number; g: number; text: TextStep[]; obj?: (p: OP) => React.ReactNode };
const SCENES: Scene[] = [
  { t0: s(0), t1: s(1.31), g: 0, text: [{ seg: 0, from: 0, to: 2, size: 220 }] },
  { t0: s(1.31), t1: s(4.47), g: 1, text: [{ seg: 1, from: 1, to: 4, size: 100, until: s(2.56) }, { seg: 1, from: 4, to: 6, size: 150, hot: [5] }], obj: (p) => <ObjPack {...p} mode="brand" shineAt={wt(1, 5)} /> },
  { t0: s(4.47), t1: s(6.24), g: 2, text: [{ seg: 2, from: 0, to: 2, size: 120 }], obj: (p) => <ObjBio {...p} /> },
  { t0: s(6.24), t1: s(7.76), g: 3, text: [{ seg: 3, from: 0, to: 5, size: 100 }] },
  { t0: s(7.76), t1: s(10.29), g: 3, text: [{ seg: 4, from: 0, to: 5, size: 100 }], obj: (p) => <ObjStars {...p} /> },
  { t0: s(10.29), t1: s(11.88), g: 4, text: [{ seg: 5, from: 4, to: 6, size: 130 }], obj: (p) => <ObjImage {...p} /> },
  { t0: s(11.88), t1: s(13.2), g: 4, text: [{ seg: 5, from: 6, to: 9, size: 120 }], obj: (p) => <ObjPalette {...p} /> },
  { t0: s(13.2), t1: s(14.87), g: 5, text: [{ seg: 6, from: 1, to: 3, size: 120 }], obj: (p) => <ObjCheck {...p} /> },
  { t0: s(14.87), t1: s(15.6), g: 6, text: [{ seg: 7, from: 0, to: 1, size: 170 }], obj: (p) => <ObjIcon {...p} d={I_BULB} bg={RED} fg={WHITE} /> },
  { t0: s(15.6), t1: s(16.5), g: 6, text: [{ seg: 7, from: 1, to: 2, size: 170 }], obj: (p) => <ObjIcon {...p} d={I_DOC} bg={CHAR} fg={WHITE} /> },
  { t0: s(16.5), t1: s(18.87), g: 6, text: [{ seg: 7, from: 2, to: 5, size: 120 }], obj: (p) => <ObjIcon {...p} d={I_MIC} bg={PINK} fg={CHAR} wave /> },
  { t0: s(18.87), t1: s(20.3), g: 7, text: [{ seg: 8, from: 3, to: 4, size: 150 }], obj: (p) => <ObjDeck {...p} /> },
  { t0: s(20.3), t1: s(22.98), g: 7, text: [{ seg: 8, from: 9, to: 10, size: 120 }], obj: (p) => <ObjPacks {...p} /> },
  { t0: s(22.98), t1: s(24.47), g: 8, text: [{ seg: 9, from: 1, to: 4, size: 120 }], obj: (p) => <ObjCredits {...p} /> },
  { t0: s(24.47), t1: s(26.11), g: 9, text: [{ seg: 10, from: 1, to: 4, size: 110 }], obj: (p) => <ObjTiles {...p} /> },
  { t0: s(26.11), t1: s(28.79), g: 9, text: [{ seg: 11, from: 2, to: 4, size: 150, until: s(27.4) }, { seg: 11, from: 4, to: 7, size: 120 }], obj: (p) => <ObjRing {...p} /> },
  { t0: s(28.79), t1: s(30.5), g: 10, text: [{ seg: 12, from: 1, to: 4, size: 110 }], obj: (p) => <ObjPack {...p} mode="plain" /> },
  { t0: s(30.5), t1: s(32.25), g: 10, text: [{ seg: 12, from: 6, to: 10, size: 100 }], obj: (p) => <ObjPack {...p} mode="morph" /> },
  { t0: s(32.25), t1: VOICE, g: 11, text: [{ seg: 13, from: 0, to: 2, size: 150 }], obj: (p) => <ObjCall {...p} /> },
];
const GROUP_START: number[] = [];
SCENES.forEach((sc) => { if (GROUP_START[sc.g] === undefined) GROUP_START[sc.g] = sc.t0; });

const Show: React.FC<{ t: number; a: number; b: number; scale?: boolean; children: React.ReactNode }> = ({ t, a, b, scale, children }) => {
  if (t < a - 1 || t >= b) return null;
  const out = ease(t, b - 6, 6);
  return <AbsoluteFill style={{ opacity: 1 - out, transform: scale ? `scale(${1 - out * 0.08})` : `translateY(${-out * 30}px)`, transformOrigin: `${OBJ_CX}px ${OBJ_CY}px` }}>{children}</AbsoluteFill>;
};

/* ---------- Interface : fond rouge Creofan, carte, bandeau, avatar, lecteur ---------- */
const Watermark: React.FC<{ size: number; x: number; y: number; o: number; rot?: number }> = ({ size, x, y, o, rot = 0 }) => (
  <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ position: "absolute", left: x, top: y, width: size, height: size, opacity: o, filter: "brightness(0) invert(1)", transform: `rotate(${rot}deg)` }} />
);
const Grid: React.FC<{ x: number; y: number; w: number; h: number; o: number }> = ({ x, y, w, h, o }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, backgroundImage: `linear-gradient(rgba(255,255,255,${o}) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,${o}) 2px, transparent 2px)`, backgroundSize: "56px 56px", WebkitMaskImage: "linear-gradient(to bottom left, black 0%, transparent 85%)", maskImage: "linear-gradient(to bottom left, black 0%, transparent 85%)" }} />
);
const FACE_BARS = (() => {
  const n = 40;
  const per = Math.floor(ENV.length / n);
  return Array.from({ length: n }).map((_, i) => {
    let m = 0;
    for (let k = 0; k < per; k++) m += ENV[i * per + k] ?? 0;
    return m / per;
  });
})();

const Avatar: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const D = AV.d;
  const speaking = t >= INTRO;
  const e = ENV[Math.max(0, Math.min(ENV.length - 1, t - INTRO))] ?? 0;
  const pulse = speaking ? 1 + e * 0.05 : 1;
  const vid: React.CSSProperties = { position: "absolute", objectFit: "cover" };
  return (
    <div style={{ position: "absolute", left: AV.cx - D / 2, top: AV.cy - D / 2, width: D, height: D, transform: `scale(${k * pulse})` }}>
      <div style={{ position: "absolute", left: -10, top: -10, width: D + 20, height: D + 20, borderRadius: 9999, backgroundColor: WHITE }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 9999, overflow: "hidden", backgroundColor: CHAR }}>
        {/* fond flou issu de la même vidéo + vidéo nette recadrée sur le visage : tête réduite, épaules visibles */}
        <OffthreadVideo src={staticFile("clone/clone.mp4")} muted style={{ ...vid, left: -D * 0.5, top: -D * 0.4, width: D * 2.4, height: D * 4.2, filter: "blur(22px) brightness(0.8)" }} />
        <OffthreadVideo src={staticFile("clone/clone.mp4")} muted style={{ ...vid, left: -6, top: D / 2 - 700 * 0.27, width: 1080 * 0.27, height: 1920 * 0.27 }} />
      </div>
    </div>
  );
};

const Player: React.FC<{ t: number; rise: number; press: number }> = ({ t, rise, press }) => {
  const tt = t - INTRO;
  const prog = interpolate(tt, [0, VOICE], [0, 1], clamp);
  const e = ENV[Math.max(0, Math.min(ENV.length - 1, tt))] ?? 0;
  const playing = tt >= 0 && tt < VOICE;
  return (
    <div style={{ position: "absolute", left: PLAYER.x, top: PLAYER.y + (1 - rise) * 330, width: PLAYER.w, height: PLAYER.h, borderRadius: 999, backgroundColor: RED, opacity: Math.min(1, rise * 2) }}>
      <div style={{ position: "absolute", left: 22, top: 22, width: 130, height: 130, borderRadius: 99, overflow: "hidden", backgroundColor: CHAR }}>
        <Img src={staticFile("clone/face.jpg")} style={{ position: "absolute", left: -6, top: 65 - 700 * 0.15, width: 1080 * 0.15, height: 1920 * 0.15, objectFit: "cover" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 130, height: 130, backgroundColor: CHAR, opacity: 0 }} />
      </div>
      <div style={{ position: "absolute", left: 174, top: 50, width: 74, height: 74, borderRadius: 99, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.14 * press})` }}>
        {playing ? (
          <svg width={30} height={30} viewBox="0 0 24 24"><rect x={5} y={4} width={5} height={16} rx={1.5} fill={RED} /><rect x={14} y={4} width={5} height={16} rx={1.5} fill={RED} /></svg>
        ) : (
          <svg width={32} height={32} viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill={RED} /></svg>
        )}
      </div>
      {/* onde : l'enveloppe réelle de la voix ; la partie déjà lue en blanc */}
      <div style={{ position: "absolute", left: 270, top: 36, width: 330, height: 78, display: "flex", alignItems: "center", gap: 2.4 }}>
        {FACE_BARS.map((v, i) => {
          const played = i / FACE_BARS.length < prog;
          const live = playing && Math.abs(i / FACE_BARS.length - prog) < 0.03 ? e * 20 : 0;
          return <div key={i} style={{ width: 6, borderRadius: 4, backgroundColor: WHITE, opacity: played ? 1 : 0.42, height: 12 + v * 62 + live }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 270, top: 118, fontFamily: FONT, fontWeight: 400, fontSize: 24, color: WHITE, opacity: 0.9 }}>{mmss(Math.max(0, tt))}</div>
      <div style={{ position: "absolute", left: 600 - 70, top: 118, width: 70, textAlign: "right", fontFamily: FONT, fontWeight: 400, fontSize: 24, color: WHITE, opacity: 0.9 }}>{mmss(VOICE)}</div>
      <div style={{ position: "absolute", left: 636, top: 62, display: "flex", gap: 22 }}>
        <Ico d="M4 10v4h4l5 4V6l-5 4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" c={WHITE} size={42} w={1.8} />
        <Ico d="M3 17h3.5a4 4 0 0 0 3.2-1.6L14 9.6A4 4 0 0 1 17.2 8H21M3 7h3.5a4 4 0 0 1 3.2 1.6M14.4 15.4A4 4 0 0 0 17.2 17H21M18.5 5.5L21 8l-2.5 2.5M18.5 14.5L21 17l-2.5 2.5" c={WHITE} size={42} w={1.8} />
      </div>
    </div>
  );
};

type SFXT = [string, number, number, number];
const A = (sec: number) => INTRO + s(sec);
const SFX: SFXT[] = [
  ["cc/ding.wav", 6, 30, 0.5],
  ["cc/click.wav", 26, 3, 0.7],
  ["cc/whoosh.wav", 32, 15, 0.55],
  ["cc/pop.wav", 52, 6, 0.6],
  ["cc/pop.wav", 66, 6, 0.45],
  ["cc/whoosh.wav", 66, 15, 0.35],
  ["cc/click.wav", 78, 3, 0.7],
  ["cc/pop.wav", A(0.05), 6, 0.6],
  ["regard/snap.wav", A(0.4), 4, 0.5],
  ["cc/whoosh.wav", A(1.31), 15, 0.4],
  ["cc/pop.wav", A(1.8), 6, 0.5],
  ["ame/shimmer.wav", A(2.78), 50, 0.4],
  ["cc/whoosh.wav", A(4.47), 15, 0.4],
  ["cc/ding.wav", A(5.4), 30, 0.4],
  ["cc/click.wav", A(5.5), 3, 0.7],
  ["cc/whoosh.wav", A(7.76), 15, 0.4],
  ...[0, 1, 2, 3, 4].map((i) => ["cc/pop.wav", INTRO + wt(4, 3) + i * 5, 6, 0.35] as SFXT),
  ["cc/whoosh.wav", A(10.29), 15, 0.4],
  ["cc/whoosh.wav", A(11.88), 15, 0.4],
  ["cc/click.wav", A(13.9), 3, 0.7],
  ["cc/whoosh.wav", A(14.87), 15, 0.4],
  ["cc/whoosh.wav", A(15.6), 15, 0.4],
  ["cc/whoosh.wav", A(16.5), 15, 0.4],
  ["cc/whoosh.wav", A(18.87), 15, 0.4],
  ...[5, 6, 8].map((i) => ["cc/pop.wav", INTRO + wt(8, i), 6, 0.55] as SFXT),
  ["cc/whoosh.wav", A(22.98), 15, 0.4],
  ["cc/click.wav", A(23.5), 3, 0.5],
  ["cc/whoosh.wav", A(24.47), 15, 0.4],
  ["regard/riser.wav", A(26.5), 50, 0.3],
  ["cc/whoosh.wav", A(26.11), 15, 0.4],
  ["cc/whoosh.wav", A(28.79), 15, 0.4],
  ["cc/whoosh.wav", A(30.5), 15, 0.45],
  ["cc/whoosh.wav", A(32.25), 15, 0.4],
  ...[0, 1, 2].map((i) => ["cc/ding.wav", A(33.0) + i * 14, 30, 0.35] as SFXT),
  ["cc/whoosh.wav", OUT - 10, 15, 0.45],
  ["ame/shimmer.wav", OUT, 60, 0.35],
  ["ame/boom.wav", OUT + 62, 60, 0.4],
  ...[0, 1, 2].map((i) => ["cc/pop.wav", OUT + 58 + i * 6, 6, 0.45] as SFXT),
  ...[0, 1, 2].map((i) => ["cc/click.wav", OUT + 88 + i * 14, 3, 0.6] as SFXT),
  ["cc/pop.wav", OUT + 104, 6, 0.5],
];

export const CloneV4: React.FC = () => {
  const t = useCurrentFrame();
  const tt = t - INTRO;
  const inOutro = tt >= VOICE;
  // Ouverture : notification → carte
  const notif = outE(t, 4, 18);
  const tap = ease(t, 26, 8);
  const open = ease(t, 32, 26, Easing.bezier(0.7, 0, 0.2, 1));
  const NOT = { x: 120, y: 360, w: 840, h: 150, r: 75 };
  const rx = interpolate(open, [0, 1], [NOT.x, CARD.x]);
  const ry = interpolate(open, [0, 1], [NOT.y, CARD.y]);
  const rw = interpolate(open, [0, 1], [NOT.w, CARD.w]);
  const rh = interpolate(open, [0, 1], [NOT.h, CARD.h]);
  const rr = interpolate(open, [0, 1], [NOT.r, CARD.r]);
  const notifOpacity = 1 - ease(t, 32, 8);
  const band = ease(t, 46, 12);
  const avK = el(t, 52, 9);
  const nameK = ease(t, 58, 10);
  const titleK = ease(t, 64, 10);
  const chipK = el(t, 68, 9);
  const rise = el(t, 62, 11);
  const press = interpolate(t, [76, 80, 86], [0, 1, 0], clamp);
  const sc = SCENES.find((x) => tt >= x.t0 && tt < x.t1) ?? SCENES[SCENES.length - 1];
  const areaVisible = t >= 56;
  return (
    <AbsoluteFill style={{ backgroundColor: RED, overflow: "hidden" }}>
      {!inOutro ? (
        <>
          {/* fond : filigrane du logo + trame */}
          <Watermark size={1000} x={-420} y={420} o={0.12} rot={-14} />
          <Grid x={560} y={0} w={560} h={900} o={0.1} />
          {/* notification message vocal */}
          {t < 40 ? (
            <div style={{ position: "absolute", left: NOT.x, top: NOT.y - (1 - notif) * 420, width: NOT.w, height: NOT.h, borderRadius: NOT.r, backgroundColor: WHITE, opacity: notifOpacity, display: "flex", alignItems: "center", gap: 24, padding: "0 30px", boxSizing: "border-box", transform: `scale(${1 - 0.04 * Math.sin(tap * Math.PI)})` }}>
              <div style={{ width: 100, height: 100, borderRadius: 99, overflow: "hidden", backgroundColor: CHAR, flexShrink: 0, position: "relative" }}>
                <Img src={staticFile("clone/face.jpg")} style={{ position: "absolute", left: -8, top: 50 - 700 * 0.12, width: 1080 * 0.12, height: 1920 * 0.12, objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1 }}>
                <Big size={44} color={CHAR}>Faten Torki</Big>
                <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 30, color: RED, marginTop: 10 }}>Message vocal · {mmss(VOICE)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, height: 60 }}>
                {Array.from({ length: 10 }).map((_, j) => <div key={j} style={{ width: 8, borderRadius: 5, backgroundColor: RED, height: 14 + Math.abs(Math.sin(t / 3 + j)) * 36 }} />)}
              </div>
            </div>
          ) : null}
          {tap > 0 && tap < 1 ? <div style={{ position: "absolute", left: 800 - 60 * tap, top: NOT.y + 75 - 60 * tap, width: 120 * tap, height: 120 * tap, borderRadius: 9999, border: `8px solid ${RED}`, opacity: 1 - tap, zIndex: 30 }} /> : null}
          {/* la carte : née de la notification */}
          {t >= 32 ? (
            <div style={{ position: "absolute", left: rx, top: ry, width: rw, height: rh, borderRadius: rr, backgroundColor: WHITE, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: BAND.x - CARD.x, top: BAND.y - CARD.y, width: BAND.w, height: BAND.h, borderRadius: BAND.r, backgroundColor: RED, overflow: "hidden", clipPath: `inset(0 0 ${100 - band * 100}% 0 round ${BAND.r}px)` }}>
                <Watermark size={420} x={-90} y={-70} o={0.2} rot={-10} />
                <Grid x={BAND.w - 330} y={0} w={330} h={BAND.h} o={0.14} />
                <div style={{ position: "absolute", right: 36, top: 30, width: 70, height: 70, borderRadius: 99, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 52, height: 52 }} /></div>
              </div>
            </div>
          ) : null}
          {t >= 50 ? <Avatar t={t} k={avK} /> : null}
          {t >= 58 ? (
            <>
              <div style={{ position: "absolute", left: CARD.x, width: CARD.w, top: 628, textAlign: "center", clipPath: `inset(0 ${100 - nameK * 100}% 0 0)` }}>
                <Big size={74} color={CHAR} style={{ display: "inline-block" }}>Faten Torki</Big>
              </div>
              <div style={{ position: "absolute", left: CARD.x, width: CARD.w, top: 724, textAlign: "center", fontFamily: FONT, fontWeight: 400, fontSize: 34, color: CHAR, opacity: titleK, transform: `translateY(${(1 - titleK) * 16}px)` }}>Graphiste & Lead UX/UI Designer</div>
              <div style={{ position: "absolute", left: CARD.x, width: CARD.w, top: 790, display: "flex", justifyContent: "center", transform: `scale(${chipK})` }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 12, backgroundColor: RED, borderRadius: 999, padding: "8px 26px 10px" }}>
                  <span style={{ width: 14, height: 14, borderRadius: 99, backgroundColor: WHITE, opacity: 0.55 + 0.45 * Math.abs(Math.sin(t / 9)) }} />
                  <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 25, letterSpacing: 2, color: WHITE }}>MESSAGE VOCAL · ÉCOUTE JUSQU'AU BOUT</span>
                </span>
              </div>
            </>
          ) : null}
          {/* zone blanche : textes + objets lancés depuis l'avatar */}
          {areaVisible && tt >= 0 ? (
            <>
              <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, clipPath: `inset(${AREA.y}px ${1080 - AREA.x - AREA.w}px ${1920 - AREA.y - AREA.h}px ${AREA.x}px round 40px)` }}>
                {[520, 340].map((r, i) => {
                  const ringK = outE(tt, GROUP_START[sc.g], 24);
                  return <div key={i} style={{ position: "absolute", left: OBJ_CX - r * ringK, top: OBJ_CY - r * ringK, width: 2 * r * ringK, height: 2 * r * ringK, borderRadius: 9999, backgroundColor: i ? "rgba(250,137,133,0.20)" : "rgba(250,137,133,0.10)" }} />;
                })}
              </div>
              {sc.text.map((tx, i) => {
                const a = i === 0 ? sc.t0 : (sc.text[i - 1].until ?? wt(tx.seg, tx.from));
                const b = tx.until ?? sc.t1;
                return (
                  <Show key={`${sc.t0}-${i}`} t={tt} a={a} b={b}>
                    <Line4 t={tt} seg={tx.seg} from={tx.from} to={tx.to} size={tx.size} hot={tx.hot} />
                  </Show>
                );
              })}
              {sc.obj ? <Show t={tt} a={sc.t0} b={sc.t1} scale><Fly t={tt} t0={sc.t0}>{sc.obj({ t: tt, t0: sc.t0, t1: sc.t1 })}</Fly></Show> : null}
            </>
          ) : null}
          <Player t={t} rise={rise} press={press} />
        </>
      ) : (
        <Outro t={tt} />
      )}
      <Sequence from={INTRO}><Audio src={staticFile("clone/voix.mp3")} /></Sequence>
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
void FPS; void WA;

export const CoverClone4: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: RED, overflow: "hidden" }}>
    <Watermark size={1000} x={-420} y={420} o={0.12} rot={-14} />
    <Grid x={560} y={0} w={560} h={900} o={0.1} />
    <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: CARD.r, backgroundColor: WHITE, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: BAND.x - CARD.x, top: BAND.y - CARD.y, width: BAND.w, height: BAND.h, borderRadius: BAND.r, backgroundColor: RED, overflow: "hidden" }}>
        <Watermark size={420} x={-90} y={-70} o={0.2} rot={-10} />
        <Grid x={BAND.w - 330} y={0} w={330} h={BAND.h} o={0.14} />
      </div>
    </div>
    <Avatar t={0} k={1} />
    <div style={{ position: "absolute", left: CARD.x, width: CARD.w, top: 628, textAlign: "center" }}><Big size={74} color={CHAR} style={{ display: "inline-block" }}>Faten Torki</Big></div>
    <div style={{ position: "absolute", left: CARD.x, width: CARD.w, top: 724, textAlign: "center", fontFamily: FONT, fontWeight: 400, fontSize: 34, color: CHAR }}>Graphiste & Lead UX/UI Designer</div>
    <div dir="rtl" style={{ position: "absolute", left: AREA.x, width: AREA.w, top: 890, textAlign: "center" }}><MixedText text="شنوة رايك؟" size={130} color={CHAR} /></div>
    <div style={{ position: "absolute", left: OBJ_CX - 150, top: 1085, transform: "scale(0.9)", transformOrigin: "50% 0" }}><Pack w={250} h={380} reveal={1} shine={0.6} t={100} /></div>
    <Player t={0} rise={1} press={0} />
  </AbsoluteFill>
);
