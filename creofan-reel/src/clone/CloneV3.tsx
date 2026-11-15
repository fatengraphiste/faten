import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Loop, Sequence, staticFile, useCurrentFrame, Easing } from "remotion";
import { MixedText } from "../components";
import {
  ARABIC, BEIGE, Big, CHAR, CX, ENV, FONT, I_BULB, I_DOC, I_MIC, I_PLAY, I_STAR, Ico, Line, Outro, Pack, PINK, Pill, Profile, RED, Rings, Ripple, TH_BEIGE, TH_RED, W, WA, WHITE, el, ease, outE, wt, L, RG,
} from "./CloneV2";
import type { Th } from "./CloneV2";
import "../theme";

// CREOFAN — motion v3 : vidéo d'envoi (messagerie) → plein cadre, aucune zone de protection réseaux sociaux.
// Règle : UN objet par plan, UNE ligne de texte à la fois, chaque plan reste assez longtemps pour être lu.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const OUT = s(34.3);
export const CLONE3_DURATION = OUT + 140;
const THEME = (g: number): Th => (g % 2 === 0 ? TH_RED : TH_BEIGE);

// Mise en page plein cadre 1080×1920
const TEXT_Y = 360;
const OBJ_CY = 1010;

type TextStep = { seg: number; from: number; to: number; size: number; hot?: number[]; until?: number };
type Scene = { t0: number; t1: number; g: number; text: TextStep[]; obj?: (p: { t: number; t0: number; t1: number; th: Th }) => React.ReactNode };

// Visible entre a et b, avec une sortie douce (6 images) avant b : jamais deux éléments en même temps
const Show: React.FC<{ t: number; a: number; b: number; scale?: boolean; children: React.ReactNode }> = ({ t, a, b, scale, children }) => {
  if (t < a - 1 || t >= b) return null;
  const out = ease(t, b - 6, 6);
  return <AbsoluteFill style={{ opacity: 1 - out, transform: scale ? `scale(${1 - out * 0.08})` : `translateY(${-out * 30}px)`, transformOrigin: "50% 50%" }}>{children}</AbsoluteFill>;
};
const Center: React.FC<{ y: number; w?: number; h?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, w = W, h, children, style }) => (
  <div style={{ position: "absolute", left: CX - w / 2, top: y, width: w, height: h, ...style }}>{children}</div>
);

/* ---------- Objets (un par plan) ---------- */
type OP = { t: number; t0: number; t1: number; th: Th };
const kk = (t: number, t0: number, d = 11) => el(t, t0 + 2, d);

const ObjPack: React.FC<OP & { mode: "brand" | "plain" | "morph"; shineAt?: number }> = ({ t, t0, mode, shineAt }) => {
  const k = kk(t, t0);
  const reveal = ease(t, t0 + 8, 40);
  const shine = shineAt ? ease(t, shineAt, 26) : 0;
  const morph = ease(t, t0 + 4, 30);
  const bw = 400, bh = 620;
  const Box1 = <Pack w={bw} h={bh} reveal={reveal} shine={shine} t={t} plain={mode === "plain"} />;
  return (
    <div style={{ position: "absolute", left: CX - (bw * 1.2) / 2, top: 640 + (1 - k) * 120, opacity: Math.min(1, k * 2), width: bw * 1.2 }}>
      {mode === "morph" ? (
        <div style={{ position: "relative" }}>
          <Pack w={bw} h={bh} reveal={1} plain t={t} />
          <div style={{ position: "absolute", left: 0, top: 0, clipPath: `inset(0 ${100 - morph * 100}% 0 0)` }}><Pack w={bw} h={bh} reveal={ease(t, t0 + 8, 40)} shine={ease(t, t0 + 40, 24)} t={t} /></div>
        </div>
      ) : Box1}
    </div>
  );
};
const ObjProfile: React.FC<OP> = ({ t, t0, th }) => {
  const k = kk(t, t0, 13);
  const follow = ease(t, wt(2, 3) + 4, 10);
  return (
    <div style={{ opacity: Math.min(1, k * 2), transform: `translateY(${(1 - k) * 100}px)` }}>
      <Profile t={t} th={th} open={1} follow={follow} fixedTop={560} />
    </div>
  );
};
const ObjStars: React.FC<OP> = ({ t, th }) => (
  <div style={{ position: "absolute", left: L, width: W, top: OBJ_CY - 80, display: "flex", justifyContent: "center", gap: 20 }}>
    {[0, 1, 2, 3, 4].map((i) => {
      const k = el(t, wt(4, 3) + i * 5, 8);
      return <div key={i} style={{ transform: `scale(${k}) rotate(${(1 - k) * 60}deg)` }}><Ico d={I_STAR} c={th.accent} size={140} fill={th.accent} /></div>;
    })}
  </div>
);
const ObjImage: React.FC<OP> = ({ t, t0 }) => {
  const k = kk(t, t0);
  return (
    <Center y={OBJ_CY - 330} w={700} h={660} style={{ transform: `scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k * 2) }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 56, backgroundColor: WHITE, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 56, top: 56, right: 56, bottom: 150, borderRadius: 36, backgroundColor: BEIGE, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 70, top: 60, width: 110, height: 110, borderRadius: 99, backgroundColor: RED }} />
          <svg width={588} height={450} style={{ position: "absolute", inset: 0 }}><polygon points="0,450 190,170 320,320 410,230 588,400 588,450" fill={CHAR} /></svg>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 46, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 36, letterSpacing: 6, color: CHAR, opacity: 0.6 }}>IMAGES</div>
      </div>
    </Center>
  );
};
const ObjPalette: React.FC<OP> = ({ t, t0 }) => {
  const k = kk(t, t0);
  const sw = [RED, PINK, BEIGE, WHITE];
  return (
    <Center y={OBJ_CY - 330} w={700} h={660} style={{ transform: `scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k * 2) }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 56, backgroundColor: CHAR, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 56, right: 56, top: 56, height: 400, display: "flex", gap: 18 }}>
          {sw.map((c, i) => <div key={i} style={{ flex: 1, borderRadius: 30, backgroundColor: c, transform: `scaleY(${el(t, t0 + 6 + i * 4, 9)})`, transformOrigin: "50% 100%" }} />)}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, textAlign: "center" }}><Pill text="charte" c={RED} fg={WHITE} size={64} /></div>
      </div>
    </Center>
  );
};
const ObjCheck: React.FC<OP> = ({ t, t0 }) => {
  const k = kk(t, t0, 9);
  const draw = ease(t, t0 + 10, 18);
  return (
    <div style={{ position: "absolute", left: CX - 270, top: OBJ_CY - 270, width: 540, height: 540, borderRadius: 9999, backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k})` }}>
      <svg width={320} height={320} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={WHITE} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} /></svg>
    </div>
  );
};
const ObjIcon: React.FC<OP & { d: string; wave?: boolean; bg: string; fg: string }> = ({ t, t0, d, wave, bg, fg }) => {
  const k = kk(t, t0, 9);
  return (
    <div style={{ position: "absolute", left: CX - 270, top: OBJ_CY - 330, width: 540, transform: `scale(${k})`, opacity: Math.min(1, k * 2) }}>
      <div style={{ width: 540, height: 540, borderRadius: 9999, backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico d={d} c={fg} size={300} w={1.4} /></div>
      {wave ? (
        <div style={{ marginTop: 40, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, height: 110 }}>
          {Array.from({ length: 22 }).map((_, j) => <div key={j} style={{ width: 14, borderRadius: 8, backgroundColor: CHAR, height: 14 + (ENV[Math.max(0, t - j * 2)] ?? 0) * 96 }} />)}
        </div>
      ) : null}
    </div>
  );
};
const ObjDeck: React.FC<OP> = ({ t, t0 }) => (
  <div style={{ position: "absolute", left: CX - 260, top: OBJ_CY - 330, width: 520, height: 640 }}>
    {[0, 1, 2].map((i) => {
      const k = el(t, t0 + 4 + i * 5, 10);
      return (
        <div key={i} style={{ position: "absolute", left: i * 40, top: 300 - i * 120, width: 440, height: 300, borderRadius: 44, backgroundColor: [PINK, CHAR, RED][i], transform: `translateY(${(1 - k) * 160}px) rotate(${(i - 1) * 5}deg)`, opacity: Math.min(1, k * 2), display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ico d={I_PLAY} c={i === 0 ? CHAR : WHITE} size={110} fill={i === 0 ? CHAR : WHITE} />
        </div>
      );
    })}
  </div>
);
const ObjPacks: React.FC<OP> = ({ t }) => {
  const cw = (W - 56) / 3;
  const packs: [string, string, string, number][] = [["4", RED, WHITE, 5], ["6", CHAR, WHITE, 6], ["8", PINK, CHAR, 8]];
  return (
    <>
      {packs.map(([n, c, fg, wi], i) => {
        const k = el(t, wt(8, wi), 10);
        return (
          <div key={n} style={{ position: "absolute", left: L + i * (cw + 28), top: OBJ_CY - 330, width: cw, height: 640, borderRadius: 64, backgroundColor: c, transform: `translateY(${(1 - k) * 90}px) scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k * 2) }}>
            <Big size={300} color={fg} style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", letterSpacing: -14 }}>{n}</Big>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, display: "flex", justifyContent: "center", gap: 10 }}>
              {Array.from({ length: Number(n) > 4 ? 3 : 2 }).map((_, j) => <Ico key={j} d={I_PLAY} c={fg} size={54} fill={fg} />)}
            </div>
          </div>
        );
      })}
    </>
  );
};
const ObjCredits: React.FC<OP> = ({ t, t0 }) => {
  const k = kk(t, t0);
  return (
    <Center y={OBJ_CY - 230} w={760} h={460} style={{ transform: `translateY(${(1 - k) * 120}px) scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k * 2) }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 56, backgroundColor: WHITE }}>
        <div style={{ position: "absolute", left: 56, top: 60, width: 120, height: 90, borderRadius: 18, backgroundColor: PINK }} />
        <div style={{ position: "absolute", right: 56, top: 60, width: 100, height: 100, borderRadius: 99, backgroundColor: RED }} />
        <div style={{ position: "absolute", right: 116, top: 60, width: 100, height: 100, borderRadius: 99, backgroundColor: CHAR, opacity: 0.9 }} />
        <Big size={62} color={CHAR} style={{ position: "absolute", left: 56, bottom: 60, letterSpacing: 6 }}>CRÉDITS</Big>
      </div>
    </Center>
  );
};
const ObjTiles: React.FC<OP> = ({ t, t0 }) => (
  <div style={{ position: "absolute", left: L, width: W, top: OBJ_CY - 270, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 22 }}>
    {Array.from({ length: 8 }).map((_, i) => {
      const k = el(t, t0 + 4 + i * 3, 9);
      return <div key={i} style={{ width: 180, height: 180, borderRadius: 44, backgroundColor: i % 3 === 0 ? CHAR : RED, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k})` }}><Ico d={I_PLAY} c={WHITE} size={76} fill={WHITE} /></div>;
    })}
  </div>
);
const ObjRing: React.FC<OP> = ({ t, t0, t1 }) => {
  const k = kk(t, t0);
  const prog = ease(t, t0 + 14, t1 - t0 - 24);
  return (
    <div style={{ position: "absolute", left: CX - 300, top: OBJ_CY - 330, width: 600, height: 600, transform: `scale(${k})` }}>
      <svg width={600} height={600} viewBox="0 0 600 600" style={{ position: "absolute", inset: 0 }}>
        <circle cx={300} cy={300} r={250} fill="none" stroke={PINK} strokeWidth={44} opacity={0.45} />
        <circle cx={300} cy={300} r={250} fill="none" stroke={RED} strokeWidth={44} strokeLinecap="round" strokeDasharray={`${prog * 1571} 1571`} transform="rotate(-90 300 300)" />
      </svg>
      <Big size={280} color={CHAR} style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", letterSpacing: -14 }}>3</Big>
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center" }}><MixedText text="شهور" size={86} color={CHAR} /></div>
    </div>
  );
};
const ObjWhatsApp: React.FC<OP> = ({ t, t0 }) => {
  const k = kk(t, t0, 9);
  return (
    <Center y={OBJ_CY - 170} w={W} style={{ transform: `scale(${k * (1 + Math.sin(t / 8) * 0.012)})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 30, backgroundColor: RED, borderRadius: 999, padding: "34px 60px 34px 38px", justifyContent: "center" }}>
        <div style={{ width: 150, height: 150, borderRadius: 99, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico d={WA} c={RED} size={90} w={2} fill={RED} /></div>
        <Big size={118} color={WHITE}>51 097 272</Big>
      </div>
    </Center>
  );
};

// Les plans : un objet, une ligne de texte à la fois
const SCENES: Scene[] = [
  { t0: s(0), t1: s(1.31), g: 0, text: [{ seg: 0, from: 0, to: 2, size: 330 }] },
  { t0: s(1.31), t1: s(4.47), g: 1, text: [{ seg: 1, from: 1, to: 4, size: 120, until: s(2.56) }, { seg: 1, from: 4, to: 6, size: 190, hot: [5] }], obj: (p) => <ObjPack {...p} mode="brand" shineAt={wt(1, 5)} /> },
  { t0: s(4.47), t1: s(6.24), g: 2, text: [], obj: (p) => <ObjProfile {...p} /> },
  { t0: s(6.24), t1: s(7.76), g: 3, text: [{ seg: 3, from: 0, to: 5, size: 130 }] },
  { t0: s(7.76), t1: s(10.29), g: 3, text: [{ seg: 4, from: 0, to: 5, size: 130 }], obj: (p) => <ObjStars {...p} /> },
  { t0: s(10.29), t1: s(11.88), g: 4, text: [{ seg: 5, from: 4, to: 6, size: 160 }], obj: (p) => <ObjImage {...p} /> },
  { t0: s(11.88), t1: s(13.2), g: 4, text: [{ seg: 5, from: 6, to: 9, size: 150 }], obj: (p) => <ObjPalette {...p} /> },
  { t0: s(13.2), t1: s(14.87), g: 5, text: [{ seg: 6, from: 1, to: 3, size: 150 }], obj: (p) => <ObjCheck {...p} /> },
  { t0: s(14.87), t1: s(15.6), g: 6, text: [{ seg: 7, from: 0, to: 1, size: 200 }], obj: (p) => <ObjIcon {...p} d={I_BULB} bg={WHITE} fg={RED} /> },
  { t0: s(15.6), t1: s(16.5), g: 6, text: [{ seg: 7, from: 1, to: 2, size: 200 }], obj: (p) => <ObjIcon {...p} d={I_DOC} bg={CHAR} fg={WHITE} /> },
  { t0: s(16.5), t1: s(18.87), g: 6, text: [{ seg: 7, from: 2, to: 5, size: 150 }], obj: (p) => <ObjIcon {...p} d={I_MIC} bg={BEIGE} fg={RED} wave /> },
  { t0: s(18.87), t1: s(20.3), g: 7, text: [{ seg: 8, from: 2, to: 4, size: 190 }], obj: (p) => <ObjDeck {...p} /> },
  { t0: s(20.3), t1: s(22.98), g: 7, text: [{ seg: 8, from: 9, to: 10, size: 150 }], obj: (p) => <ObjPacks {...p} /> },
  { t0: s(22.98), t1: s(24.47), g: 8, text: [{ seg: 9, from: 1, to: 4, size: 150 }], obj: (p) => <ObjCredits {...p} /> },
  { t0: s(24.47), t1: s(26.11), g: 9, text: [{ seg: 10, from: 1, to: 4, size: 140 }], obj: (p) => <ObjTiles {...p} /> },
  { t0: s(26.11), t1: s(28.79), g: 9, text: [{ seg: 11, from: 2, to: 4, size: 190, until: s(27.4) }, { seg: 11, from: 4, to: 7, size: 150 }], obj: (p) => <ObjRing {...p} /> },
  { t0: s(28.79), t1: s(30.5), g: 10, text: [{ seg: 12, from: 1, to: 4, size: 140 }], obj: (p) => <ObjPack {...p} mode="plain" /> },
  { t0: s(30.5), t1: s(32.25), g: 10, text: [{ seg: 12, from: 6, to: 10, size: 120 }], obj: (p) => <ObjPack {...p} mode="morph" /> },
  { t0: s(32.25), t1: OUT, g: 11, text: [{ seg: 13, from: 0, to: 2, size: 200 }], obj: (p) => <ObjWhatsApp {...p} /> },
];
// Début de chaque groupe (fond + cercles + transition)
const GROUP_START: number[] = [];
SCENES.forEach((sc) => { if (GROUP_START[sc.g] === undefined) GROUP_START[sc.g] = sc.t0; });

// Bande de voix fine (amplitude réelle), en bas de l'écran
const VoiceStrip: React.FC<{ t: number; th: Th }> = ({ t, th }) => {
  const e = (f: number) => ENV[Math.max(0, Math.min(ENV.length - 1, f))] ?? 0;
  return (
    <div style={{ position: "absolute", left: L, width: W, top: 1770, height: 80, display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ width: 70, height: 70, borderRadius: 99, backgroundColor: th.bg === RED ? WHITE : CHAR, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico d={I_MIC} c={th.bg === RED ? RED : WHITE} size={38} w={2} /></div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, height: 80, overflow: "hidden" }}>
        {Array.from({ length: 44 }).map((_, j) => <div key={j} style={{ width: 11, flexShrink: 0, borderRadius: 6, backgroundColor: th.bg === RED ? WHITE : CHAR, opacity: j > 38 ? 1 : 0.5, height: 8 + e(t - (43 - j)) * 66 }} />)}
      </div>
    </div>
  );
};

type S = [string, number, number, number];
const SFX: S[] = [
  ["cc/pop.wav", s(0.05), 6, 0.6],
  ["regard/snap.wav", s(0.4), 4, 0.5],
  ["cc/pop.wav", s(1.6), 6, 0.5],
  ["ame/shimmer.wav", s(2.78), 50, 0.4],
  ["cc/ding.wav", s(5.4), 30, 0.4],
  ["ame/boom.wav", s(4.5), 40, 0.35],
  ["cc/click.wav", s(5.5), 3, 0.7],
  ...[0, 1, 2, 3, 4].map((i) => ["cc/pop.wav", wt(4, 3) + i * 5, 6, 0.35] as S),
  ["cc/pop.wav", s(10.8), 6, 0.5],
  ["cc/pop.wav", s(12.0), 6, 0.5],
  ["cc/click.wav", s(13.9), 3, 0.7],
  ["cc/pop.wav", s(14.9), 6, 0.5],
  ["cc/pop.wav", s(15.65), 6, 0.5],
  ["cc/pop.wav", s(16.55), 6, 0.5],
  ["cc/pop.wav", s(18.95), 6, 0.5],
  ...[5, 6, 8].map((i) => ["cc/pop.wav", wt(8, i), 6, 0.55] as S),
  ["cc/click.wav", s(23.5), 3, 0.5],
  ["cc/ding.wav", s(24.8), 30, 0.35],
  ["regard/riser.wav", s(26.5), 50, 0.3],
  ["cc/pop.wav", s(27.46), 6, 0.5],
  ["cc/pop.wav", s(28.85), 6, 0.5],
  ["cc/whoosh.wav", s(30.5), 15, 0.45],
  ["cc/pop.wav", s(32.3), 6, 0.55],
  ["cc/ding.wav", s(32.8), 30, 0.4],
  ...GROUP_START.slice(1).map((c) => ["cc/whoosh.wav", c - 10, 15, 0.45] as S),
  ["cc/whoosh.wav", OUT - 10, 15, 0.45],
  ["ame/shimmer.wav", OUT, 60, 0.35],
  ["ame/boom.wav", OUT + 62, 60, 0.4],
  ...[0, 1, 2].map((i) => ["cc/pop.wav", OUT + 58 + i * 6, 6, 0.45] as S),
  ...[0, 1, 2].map((i) => ["cc/click.wav", OUT + 88 + i * 14, 3, 0.6] as S),
  ["cc/pop.wav", OUT + 104, 6, 0.5],
];

export const CloneV3: React.FC = () => {
  const t = useCurrentFrame();
  const inOutro = t >= OUT;
  const sc = SCENES.find((x) => t >= x.t0 && t < x.t1) ?? SCENES[SCENES.length - 1];
  const th = THEME(sc.g);
  return (
    <AbsoluteFill style={{ backgroundColor: inOutro ? RED : th.bg, overflow: "hidden" }}>
      {!inOutro ? (
        <>
          <Rings t={t} at={GROUP_START[sc.g]} th={th} cy={960} />
          {/* texte : une seule ligne à la fois */}
          {sc.text.map((tx, i) => {
            const a = i === 0 ? sc.t0 : (sc.text[i - 1].until ?? wt(tx.seg, tx.from));
            const b = tx.until ?? sc.t1;
            return (
              <Show key={`${sc.t0}-${i}`} t={t} a={a} b={b}>
                <Line t={t} th={th} seg={tx.seg} from={tx.from} to={tx.to} y={TEXT_Y} size={tx.size} hot={tx.hot} />
              </Show>
            );
          })}
          {sc.obj ? <Show t={t} a={sc.t0} b={sc.t1} scale>{sc.obj({ t, t0: sc.t0, t1: sc.t1, th })}</Show> : null}
          <VoiceStrip t={t} th={th} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", justifyContent: "center", zIndex: 20 }}>
            <div style={{ width: 96, height: 96, borderRadius: 99, backgroundColor: th.bg === RED ? WHITE : CHAR, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 72, height: 72, filter: th.bg === RED ? "none" : "brightness(0) invert(1)" }} />
            </div>
          </div>
        </>
      ) : (
        <Outro t={t} />
      )}
      {GROUP_START.slice(1).map((c, k) => (
        <Ripple key={c} t={t} at={c} c={THEME(k + 1).bg} />
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
void ARABIC; void interpolate; void outE; void RG; void Easing;
