import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { MixedText } from "../components";
import { OutroIcon } from "../outro/OutroIcon";
import { BEIGE, Big, CHAR, ENV, FONT, I_BULB, I_DOC, I_MIC, I_PLAY, I_STAR, Ico, Pack, PINK, Pill, RED, WA, WHITE, el, ease, outE, wt } from "./CloneV2";
import "../theme";

// CREOFAN — motion v5 : on part de la petite carte, « Card Expand » vers l'interface complète.
// Le visage animé est dans le petit cercle du lecteur, calé sur la voix. Texte = mots clés seulement.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const INTRO = 90;
const VOICE = s(34.3);
const OUT = INTRO + VOICE;
export const CLONE5_DURATION = OUT + 120;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CARD = { x: 121, y: 176, w: 838, h: 1594, r: 56 };
const COMPACT = { y: 640, h: 640 };
const BAND = { x: 155, y: 210, w: 770, h: 277, r: 44 };
const AV = { cx: 540, cy: 476, d: 280 };
const AREA = { x: 160, y: 880, w: 760, h: 640 };
const PLAYER = { x: 160, y: 1560, w: 760, h: 174 };
const KEY_Y = 950;
const OBJ_CX = 540;
const OBJ_CY = 1300;

const mmss = (f: number) => {
  const sec = Math.max(0, Math.floor(f / FPS));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
};

/* ---------- Mot clé : un point part de l'avatar et devient une pastille ---------- */
const Key: React.FC<{ t: number; at: number; label: string; latin?: boolean }> = ({ t, at, label }) => {
  const fl = ease(t, at - 16, 16, Easing.out(Easing.cubic));
  const px = interpolate(fl, [0, 1], [AV.cx, 540]);
  const py = interpolate(fl, [0, 1], [AV.cy + 60, KEY_Y]) - Math.sin(fl * Math.PI) * 120;
  const k = el(t, at, 9);
  return (
    <>
      {t < at ? <div style={{ position: "absolute", left: px - 19, top: py - 19, width: 38, height: 38, borderRadius: 99, backgroundColor: RED, opacity: fl > 0 ? 1 : 0 }} /> : null}
      {t >= at ? (
        <div style={{ position: "absolute", left: 160, width: 760, top: KEY_Y - 50, display: "flex", justifyContent: "center", transform: `scale(${0.3 + 0.7 * k})`, opacity: Math.min(1, k * 2) }}>
          <Pill text={label} c={RED} fg={WHITE} size={62} />
        </div>
      ) : null}
    </>
  );
};

/* ---------- Objets ---------- */
type OP = { t: number; t0: number; t1: number };
const Fly: React.FC<{ t: number; t0: number; children: React.ReactNode }> = ({ t, t0, children }) => {
  const e = outE(t, t0, 22);
  const sc = el(t, t0, 9);
  const dx = (1 - e) * (AV.cx - OBJ_CX) * 0.4;
  const dy = (1 - e) * (AV.cy + 80 - OBJ_CY) - Math.sin(e * Math.PI) * 140;
  return <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) rotate(${(1 - e) * 220}deg) scale(${0.18 + 0.82 * sc})`, transformOrigin: `${OBJ_CX}px ${OBJ_CY}px`, opacity: Math.min(1, e * 3) }}>{children}</AbsoluteFill>;
};
const At: React.FC<{ w: number; h: number; dy?: number; children: React.ReactNode }> = ({ w, h, dy = 0, children }) => (
  <div style={{ position: "absolute", left: OBJ_CX - w / 2, top: OBJ_CY - h / 2 + dy, width: w, height: h }}>{children}</div>
);
const ObjQuestion: React.FC<OP> = ({ t }) => (
  <At w={460} h={460}>
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${Math.sin(t / 5) * 4}deg)` }}><MixedText text="؟" size={520} color={RED} /></div>
  </At>
);
const ObjBolt: React.FC<OP> = ({ t0, t }) => (
  <At w={380} h={380}>
    <div style={{ width: 380, height: 380, borderRadius: 9999, backgroundColor: CHAR, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${el(t, t0 + 4, 9)})` }}><Ico d="M13 2L4 14h7l-1 8 9-12h-7z" c={WHITE} size={210} w={1.4} fill={WHITE} /></div>
  </At>
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
    <At w={720} h={300}>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {["UX/UI", "Motion design", "Voix-off IA"].map((tg, i) => (
          <span key={tg} style={{ backgroundColor: BEIGE, color: CHAR, fontFamily: FONT, fontWeight: 600, fontSize: 32, borderRadius: 999, padding: "10px 28px 12px", transform: `scale(${el(t, t0 + 6 + i * 4, 9)})` }}>{tg}</span>
        ))}
      </div>
      <div style={{ marginTop: 60, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 440, height: 110, borderRadius: 999, backgroundColor: follow > 0.5 ? RED : CHAR, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, transform: `scale(${1 - 0.06 * Math.sin(Math.min(1, follow) * Math.PI)})` }}>
          <Ico d={follow > 0.5 ? "M5 12.5l4.5 4.5L19 7.5" : "M12 5v14M5 12h14"} c={WHITE} size={46} w={2.6} />
          <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: WHITE }}>{follow > 0.5 ? "Suivie" : "Suivre"}</span>
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
    <At w={500} h={380}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 48, backgroundColor: CHAR, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 40, right: 40, top: 40, bottom: 40, display: "flex", gap: 14 }}>
          {sw.map((c, i) => <div key={i} style={{ flex: 1, borderRadius: 24, backgroundColor: c, transform: `scaleY(${el(t, t0 + 6 + i * 4, 9)})`, transformOrigin: "50% 100%" }} />)}
        </div>
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
      <div style={{ position: "absolute", left: 50, bottom: 56, width: 260 * ease(t, t0 + 10, 14), height: 18, borderRadius: 9, backgroundColor: WHITE, opacity: 0.85 }} />
      <div style={{ position: "absolute", left: 50, bottom: 92, width: 170 * ease(t, t0 + 14, 14), height: 18, borderRadius: 9, backgroundColor: PINK }} />
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
const ObjCall: React.FC<OP> = ({ t, t0 }) => {
  const ring = Math.sin((t - t0) / 2.2) * (t > t0 + 14 ? 14 : 0);
  return (
    <At w={600} h={440}>
      {[0, 1, 2].map((i) => {
        const p = (((t - t0) / 40 + i / 3) % 1 + 1) % 1;
        const r = 140 + p * 130;
        return <div key={i} style={{ position: "absolute", left: 300 - r, top: 140 - r, width: 2 * r, height: 2 * r, borderRadius: 9999, border: `6px solid ${PINK}`, opacity: (1 - p) * 0.8 }} />;
      })}
      <div style={{ position: "absolute", left: 160, top: 0, width: 280, height: 280, borderRadius: 9999, backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${ring}deg)` }}><Ico d={WA} c={WHITE} size={150} w={1.8} fill={WHITE} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center" }}><Big size={96} color={CHAR}>51 097 272</Big></div>
    </At>
  );
};

/* ---------- Plans : un objet, au plus un mot clé ---------- */
type Scene = { t0: number; t1: number; g: number; key?: { seg: number; idx: number; label: string }; obj: (p: OP) => React.ReactNode };
const SCENES: Scene[] = [
  { t0: s(0), t1: s(1.31), g: 0, obj: (p) => <ObjQuestion {...p} /> },
  { t0: s(1.31), t1: s(4.47), g: 1, key: { seg: 1, idx: 2, label: "produit" }, obj: (p) => <ObjPack {...p} mode="brand" shineAt={wt(1, 5)} /> },
  { t0: s(4.47), t1: s(6.24), g: 2, obj: (p) => <ObjBio {...p} /> },
  { t0: s(6.24), t1: s(7.76), g: 3, obj: (p) => <ObjBolt {...p} /> },
  { t0: s(7.76), t1: s(10.29), g: 3, key: { seg: 4, idx: 3, label: "qualité" }, obj: (p) => <ObjStars {...p} /> },
  { t0: s(10.29), t1: s(11.88), g: 4, obj: (p) => <ObjImage {...p} /> },
  { t0: s(11.88), t1: s(13.2), g: 4, key: { seg: 5, idx: 7, label: "charte" }, obj: (p) => <ObjPalette {...p} /> },
  { t0: s(13.2), t1: s(14.87), g: 5, obj: (p) => <ObjCheck {...p} /> },
  { t0: s(14.87), t1: s(15.6), g: 6, obj: (p) => <ObjIcon {...p} d={I_BULB} bg={RED} fg={WHITE} /> },
  { t0: s(15.6), t1: s(16.5), g: 6, obj: (p) => <ObjIcon {...p} d={I_DOC} bg={CHAR} fg={WHITE} /> },
  { t0: s(16.5), t1: s(18.87), g: 6, key: { seg: 7, idx: 3, label: "voix-off" }, obj: (p) => <ObjIcon {...p} d={I_MIC} bg={PINK} fg={CHAR} wave /> },
  { t0: s(18.87), t1: s(20.0), g: 7, obj: (p) => <ObjDeck {...p} /> },
  { t0: s(20.0), t1: s(22.98), g: 7, key: { seg: 8, idx: 3, label: "Packs" }, obj: (p) => <ObjPacks {...p} /> },
  { t0: s(22.98), t1: s(24.47), g: 8, key: { seg: 9, idx: 3, label: "Crédits" }, obj: (p) => <ObjCredits {...p} /> },
  { t0: s(24.47), t1: s(26.11), g: 9, obj: (p) => <ObjTiles {...p} /> },
  { t0: s(26.11), t1: s(28.79), g: 9, obj: (p) => <ObjRing {...p} /> },
  { t0: s(28.79), t1: s(30.5), g: 10, key: { seg: 12, idx: 3, label: "style" }, obj: (p) => <ObjPack {...p} mode="plain" /> },
  { t0: s(30.5), t1: s(32.25), g: 10, obj: (p) => <ObjPack {...p} mode="morph" /> },
  { t0: s(32.25), t1: VOICE, g: 11, obj: (p) => <ObjCall {...p} /> },
];
const GROUP_START: number[] = [];
SCENES.forEach((sc) => { if (GROUP_START[sc.g] === undefined) GROUP_START[sc.g] = sc.t0; });

const Show: React.FC<{ t: number; a: number; b: number; scale?: boolean; children: React.ReactNode }> = ({ t, a, b, scale, children }) => {
  if (t < a - 1 || t >= b) return null;
  const out = ease(t, b - 6, 6);
  return <AbsoluteFill style={{ opacity: 1 - out, transform: scale ? `scale(${1 - out * 0.08})` : `translateY(${-out * 30}px)`, transformOrigin: `${OBJ_CX}px ${OBJ_CY}px` }}>{children}</AbsoluteFill>;
};

/* ---------- Interface ---------- */
const Watermark: React.FC<{ size: number; x: number; y: number; o: number; rot?: number }> = ({ size, x, y, o, rot = 0 }) => (
  <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ position: "absolute", left: x, top: y, width: size, height: size, opacity: o, filter: "brightness(0) invert(1)", transform: `rotate(${rot}deg)` }} />
);
const Grid: React.FC<{ x: number; y: number; w: number; h: number; o: number }> = ({ x, y, w, h, o }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, backgroundImage: `linear-gradient(rgba(255,255,255,${o}) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,${o}) 2px, transparent 2px)`, backgroundSize: "56px 56px", WebkitMaskImage: "linear-gradient(to bottom left, black 0%, transparent 85%)", maskImage: "linear-gradient(to bottom left, black 0%, transparent 85%)" }} />
);
const BARS = (() => {
  const n = 40;
  const per = Math.floor(ENV.length / n);
  return Array.from({ length: n }).map((_, i) => {
    let m = 0;
    for (let k = 0; k < per; k++) m += ENV[i * per + k] ?? 0;
    return m / per;
  });
})();

// Avatar du haut : ta photo de profil (le visage animé est dans le lecteur)
const Avatar: React.FC<{ cy: number; k: number }> = ({ cy, k }) => {
  const D = AV.d;
  const z = D / 900; // on garde la tête + les épaules
  return (
    <div style={{ position: "absolute", left: AV.cx - D / 2, top: cy - D / 2, width: D, height: D, transform: `scale(${k})` }}>
      <div style={{ position: "absolute", left: -10, top: -10, width: D + 20, height: D + 20, borderRadius: 9999, backgroundColor: WHITE }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 9999, overflow: "hidden", backgroundColor: CHAR }}>
        <Img src={staticFile("clone/profile.jpg")} style={{ position: "absolute", left: 0, top: -170 * z, width: 1123 * z, height: 2000 * z }} />
      </div>
    </div>
  );
};

// Lecteur : le visage animé est ici, calé sur la voix (la vidéo démarre en même temps que la voix)
const Player: React.FC<{ t: number; rise: number; press: number; still?: boolean }> = ({ t, rise, press, still }) => {
  const tt = t - INTRO;
  const prog = interpolate(tt, [0, VOICE], [0, 1], clamp);
  const e = ENV[Math.max(0, Math.min(ENV.length - 1, tt))] ?? 0;
  const playing = tt >= 0 && tt < VOICE;
  const D = 130;
  const vid: React.CSSProperties = { position: "absolute", objectFit: "cover" };
  return (
    <div style={{ position: "absolute", left: PLAYER.x, top: PLAYER.y + (1 - rise) * 330, width: PLAYER.w, height: PLAYER.h, borderRadius: 999, backgroundColor: RED, opacity: Math.min(1, rise * 2) }}>
      <div style={{ position: "absolute", left: 22, top: 22, width: D, height: D, borderRadius: 99, overflow: "hidden", backgroundColor: CHAR, transform: `scale(${1 + (playing ? e * 0.06 : 0)})` }}>
        {playing && !still ? (
          <Sequence from={INTRO} layout="none">
            <OffthreadVideo src={staticFile("clone/clone.mp4")} muted style={{ ...vid, left: -D * 0.5, top: -D * 0.4, width: D * 2.4, height: D * 4.2, filter: "blur(14px) brightness(0.8)" }} />
            <OffthreadVideo src={staticFile("clone/clone.mp4")} muted style={{ ...vid, left: -4, top: D / 2 - 700 * 0.15, width: 1080 * 0.15, height: 1920 * 0.15 }} />
          </Sequence>
        ) : (
          <>
            <Img src={staticFile("clone/face.jpg")} style={{ ...vid, left: -D * 0.5, top: -D * 0.4, width: D * 2.4, height: D * 4.2, filter: "blur(14px) brightness(0.8)" }} />
            <Img src={staticFile("clone/face.jpg")} style={{ ...vid, left: -4, top: D / 2 - 700 * 0.15, width: 1080 * 0.15, height: 1920 * 0.15 }} />
          </>
        )}
      </div>
      <div style={{ position: "absolute", left: 174, top: 50, width: 74, height: 74, borderRadius: 99, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.14 * press})` }}>
        {playing ? (
          <svg width={30} height={30} viewBox="0 0 24 24"><rect x={5} y={4} width={5} height={16} rx={1.5} fill={RED} /><rect x={14} y={4} width={5} height={16} rx={1.5} fill={RED} /></svg>
        ) : (
          <svg width={32} height={32} viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill={RED} /></svg>
        )}
      </div>
      <div style={{ position: "absolute", left: 270, top: 36, width: 330, height: 78, display: "flex", alignItems: "center", gap: 2.4 }}>
        {BARS.map((v, i) => {
          const played = i / BARS.length < prog;
          const live = playing && Math.abs(i / BARS.length - prog) < 0.03 ? e * 20 : 0;
          return <div key={i} style={{ width: 6, borderRadius: 4, backgroundColor: WHITE, opacity: played ? 1 : 0.42, height: 12 + v * 62 + live }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 270, top: 118, fontFamily: FONT, fontWeight: 400, fontSize: 24, color: WHITE, opacity: 0.9 }}>{mmss(Math.max(0, tt))}</div>
      <div style={{ position: "absolute", left: 530, top: 118, width: 70, textAlign: "right", fontFamily: FONT, fontWeight: 400, fontSize: 24, color: WHITE, opacity: 0.9 }}>{mmss(VOICE)}</div>
      <div style={{ position: "absolute", left: 636, top: 62, display: "flex", gap: 22 }}>
        <Ico d="M4 10v4h4l5 4V6l-5 4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" c={WHITE} size={42} w={1.8} />
        <Ico d="M3 17h3.5a4 4 0 0 0 3.2-1.6L14 9.6A4 4 0 0 1 17.2 8H21M3 7h3.5a4 4 0 0 1 3.2 1.6M14.4 15.4A4 4 0 0 0 17.2 17H21M18.5 5.5L21 8l-2.5 2.5M18.5 14.5L21 17l-2.5 2.5" c={WHITE} size={42} w={1.8} />
      </div>
    </div>
  );
};

// Outro : l'icône Creofan, puis uniquement le numéro WhatsApp
const OutroV5: React.FC<{ f: number }> = ({ f }) => {
  const k = el(f, 62, 9);
  return (
    <AbsoluteFill style={{ backgroundColor: RED }}>
      <OutroIcon f={f} fg={WHITE} bg="transparent" size={460} cy={760} />
      <div style={{ position: "absolute", left: 0, width: 1080, top: 1110, display: "flex", justifyContent: "center", transform: `scale(${k})`, opacity: Math.min(1, k * 2) }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 22, backgroundColor: WHITE, borderRadius: 999, padding: "20px 50px 20px 26px" }}>
          <span style={{ width: 96, height: 96, borderRadius: 99, backgroundColor: RED, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Ico d={WA} c={WHITE} size={56} w={2} fill={WHITE} /></span>
          <Big size={80} color={RED}>51 097 272</Big>
        </span>
      </div>
    </AbsoluteFill>
  );
};

type SFXT = [string, number, number, number];
const A = (sec: number) => INTRO + s(sec);
const SFX: SFXT[] = [
  ["cc/pop.wav", 8, 6, 0.6],
  ["cc/pop.wav", 22, 6, 0.5],
  ["cc/whoosh.wav", 38, 15, 0.55],
  ["ame/shimmer.wav", 40, 40, 0.3],
  ["cc/pop.wav", 66, 6, 0.45],
  ["cc/whoosh.wav", 64, 15, 0.35],
  ["cc/click.wav", 82, 3, 0.7],
  ["cc/pop.wav", A(0.05), 6, 0.6],
  ["regard/snap.wav", A(0.4), 4, 0.5],
  ["cc/whoosh.wav", A(1.31), 15, 0.4],
  ["cc/pop.wav", A(1.8), 6, 0.5],
  ["ame/shimmer.wav", A(2.78), 50, 0.4],
  ["cc/whoosh.wav", A(4.47), 15, 0.4],
  ["cc/click.wav", A(5.5), 3, 0.7],
  ["cc/whoosh.wav", A(6.24), 15, 0.4],
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
  ["cc/pop.wav", OUT + 62, 6, 0.5],
];

export const CloneV5: React.FC = () => {
  const t = useCurrentFrame();
  const tt = t - INTRO;
  const inOutro = tt >= VOICE;
  // Card Expand : petite carte → interface complète
  const pop = el(t, 6, 11);
  const expand = ease(t, 40, 28, Easing.bezier(0.7, 0, 0.2, 1));
  const ct = interpolate(expand, [0, 1], [COMPACT.y, CARD.y]);
  const ch = interpolate(expand, [0, 1], [COMPACT.h, CARD.h]);
  const rel = (y: number) => ct + (y - CARD.y);
  const avK = el(t, 16, 9);
  const nameK = ease(t, 20, 10);
  const titleK = ease(t, 26, 10);
  const chipK = el(t, 66, 9);
  const rise = el(t, 62, 11);
  const press = interpolate(t, [80, 84, 90], [0, 1, 0], clamp);
  const sc = SCENES.find((x) => tt >= x.t0 && tt < x.t1) ?? SCENES[SCENES.length - 1];
  const areaIn = ease(t, 58, 14);
  return (
    <AbsoluteFill style={{ backgroundColor: RED, overflow: "hidden" }}>
      {!inOutro ? (
        <>
          <Watermark size={1000} x={-420} y={420} o={0.12} rot={-14} />
          <Grid x={560} y={0} w={560} h={900} o={0.1} />
          {/* la carte : démarre compacte, puis s'étend */}
          <div style={{ position: "absolute", left: CARD.x, top: ct, width: CARD.w, height: ch, borderRadius: CARD.r, backgroundColor: WHITE, overflow: "hidden", transform: t < 40 ? `scale(${0.86 + 0.14 * pop})` : undefined, opacity: Math.min(1, pop * 2) }}>
            <div style={{ position: "absolute", left: BAND.x - CARD.x, top: BAND.y - CARD.y, width: BAND.w, height: BAND.h, borderRadius: BAND.r, backgroundColor: RED, overflow: "hidden" }}>
              <Watermark size={420} x={-90} y={-70} o={0.2} rot={-10} />
              <Grid x={BAND.w - 330} y={0} w={330} h={BAND.h} o={0.14} />
              <div style={{ position: "absolute", right: 36, top: 30, width: 70, height: 70, borderRadius: 99, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 52, height: 52 }} /></div>
            </div>
          </div>
          <Avatar cy={rel(AV.cy)} k={avK} />
          <div style={{ position: "absolute", left: CARD.x, width: CARD.w, top: rel(628), textAlign: "center", clipPath: `inset(0 ${100 - nameK * 100}% 0 0)` }}>
            <Big size={74} color={CHAR} style={{ display: "inline-block" }}>Faten Torki</Big>
          </div>
          <div style={{ position: "absolute", left: CARD.x, width: CARD.w, top: rel(724), textAlign: "center", fontFamily: FONT, fontWeight: 400, fontSize: 34, color: CHAR, opacity: titleK, transform: `translateY(${(1 - titleK) * 16}px)` }}>Graphiste & Lead UX/UI Designer</div>
          {t >= 62 ? (
            <div style={{ position: "absolute", left: CARD.x, width: CARD.w, top: 790, display: "flex", justifyContent: "center", transform: `scale(${chipK})` }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 12, backgroundColor: RED, borderRadius: 999, padding: "8px 26px 10px" }}>
                <span style={{ width: 14, height: 14, borderRadius: 99, backgroundColor: WHITE, opacity: 0.55 + 0.45 * Math.abs(Math.sin(t / 9)) }} />
                <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 25, letterSpacing: 2, color: WHITE }}>MESSAGE VOCAL · ÉCOUTE JUSQU'AU BOUT</span>
              </span>
            </div>
          ) : null}
          {/* zone blanche : un objet, au plus un mot clé */}
          {tt >= 0 ? (
            <>
              <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, clipPath: `inset(${AREA.y}px ${1080 - AREA.x - AREA.w}px ${1920 - AREA.y - AREA.h}px ${AREA.x}px round 40px)`, opacity: areaIn }}>
                {[520, 340].map((r, i) => {
                  const ringK = outE(tt, GROUP_START[sc.g], 24);
                  return <div key={i} style={{ position: "absolute", left: OBJ_CX - r * ringK, top: OBJ_CY - r * ringK, width: 2 * r * ringK, height: 2 * r * ringK, borderRadius: 9999, backgroundColor: i ? "rgba(250,137,133,0.20)" : "rgba(250,137,133,0.10)" }} />;
                })}
              </div>
              {sc.key ? (() => {
                const at = Math.max(sc.t0 + 8, Math.min(wt(sc.key.seg, sc.key.idx), sc.t1 - 30));
                return <Show key={`k${sc.t0}`} t={tt} a={sc.t0} b={sc.t1}><Key t={tt} at={at} label={sc.key.label} /></Show>;
              })() : null}
              <Show t={tt} a={sc.t0} b={sc.t1} scale><Fly t={tt} t0={sc.t0}>{sc.obj({ t: tt, t0: sc.t0, t1: sc.t1 })}</Fly></Show>
            </>
          ) : null}
          <Player t={t} rise={rise} press={press} />
        </>
      ) : (
        <OutroV5 f={tt - VOICE} />
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
void FPS;

// Couverture : la petite carte, puis le lecteur
export const CoverClone5: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: RED, overflow: "hidden" }}>
    <Watermark size={1000} x={-420} y={420} o={0.12} rot={-14} />
    <Grid x={560} y={0} w={560} h={900} o={0.1} />
    <div style={{ position: "absolute", left: CARD.x, top: COMPACT.y, width: CARD.w, height: COMPACT.h, borderRadius: CARD.r, backgroundColor: WHITE, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: BAND.x - CARD.x, top: BAND.y - CARD.y, width: BAND.w, height: BAND.h, borderRadius: BAND.r, backgroundColor: RED, overflow: "hidden" }}>
        <Watermark size={420} x={-90} y={-70} o={0.2} rot={-10} />
        <Grid x={BAND.w - 330} y={0} w={330} h={BAND.h} o={0.14} />
      </div>
    </div>
    <Avatar cy={COMPACT.y + 300} k={1} />
    <div style={{ position: "absolute", left: CARD.x, width: CARD.w, top: COMPACT.y + 452, textAlign: "center" }}><Big size={74} color={CHAR} style={{ display: "inline-block" }}>Faten Torki</Big></div>
    <div style={{ position: "absolute", left: CARD.x, width: CARD.w, top: COMPACT.y + 548, textAlign: "center", fontFamily: FONT, fontWeight: 400, fontSize: 34, color: CHAR }}>Graphiste & Lead UX/UI Designer</div>
    <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center" }}><MixedText text="شنوة رايك؟" size={150} color={WHITE} /></div>
    <Player t={0} rise={1} press={0} still />
  </AbsoluteFill>
);
