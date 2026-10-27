import { loadFont } from "@remotion/fonts";
import { useLayoutEffect, useRef } from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";

// « الروح » — mind-game typographique, 18 s à 60 i/s
export const AME_FPS = 60;
export const AME_DURATION = 1080;

for (const w of ["700", "900"]) {
  loadFont({ family: "Kufi", url: staticFile(`fonts/noto-kufi-arabic-arabic-${w}-normal.woff2`), weight: w });
}
const KUFI = "Kufi, sans-serif";

// Charte Creofan (version crème chaude demandée pour cette pièce)
const CREAM = "#f6eee4";
const RED = "#f7322a";
const INK = "#1c1412";
const GOLD = "#d4a857";
const GREY = "#b9ada3";

// Zone de sécurité : haut 250, bas 250, droite 120, gauche 70 → 890 × 1420
const Z = { top: 250, bottom: 250, left: 70, right: 120 };
const ZW = 1080 - Z.left - Z.right;
const CX = Z.left + ZW / 2; // 515
const CY = Z.top + (1920 - Z.top - Z.bottom) / 2; // 960

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const snap = (t: number, at: number, dur: number) =>
  interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing: Easing.bezier(0.8, 0, 0.15, 1) });
const outBack = (t: number, at: number, dur: number) =>
  interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.7)) });
const pop = (t: number, at: number, damping = 12) =>
  spring({ frame: t - at, fps: AME_FPS, config: { damping, stiffness: 220, mass: 0.7 } });

// Texte arabe Kufi Black
const K: React.FC<{ text: string; size: number; color?: string; weight?: number; style?: React.CSSProperties }> = ({
  text,
  size,
  color = INK,
  weight = 900,
  style,
}) => (
  <span dir="rtl" style={{ fontFamily: KUFI, fontWeight: weight, fontSize: size, color, lineHeight: 1.35, whiteSpace: "nowrap", ...style }}>
    {text}
  </span>
);

// Élément centré sur un point (x, y)
const At: React.FC<{ x: number; y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", ...style }}>
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>{children}</div>
  </div>
);

// Poussière d'or : explosion de particules depuis une zone (cx, cy, w, h)
const Burst: React.FC<{ t: number; at: number; cx: number; cy: number; w: number; h: number; n?: number; seed: string; life?: number }> = ({
  t,
  at,
  cx,
  cy,
  w,
  h,
  n = 140,
  seed,
  life = 80,
}) => {
  const age = t - at;
  if (age < 0 || age > life) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const ang = r("a") * Math.PI * 2;
        const sx = cx + Math.cos(ang) * (w / 2) * Math.sqrt(r("r"));
        const sy = cy + Math.sin(ang) * (h / 2) * Math.sqrt(r("r"));
        const sp = 3 + r("s") * 12;
        const dx = Math.cos(ang) * sp;
        const dy = Math.sin(ang) * sp - 2;
        // mouvement avec frottement et légère gravité (forme fermée)
        const drag = 0.94;
        const k = (1 - Math.pow(drag, age)) / (1 - drag);
        const x = sx + dx * k;
        const y = sy + dy * k + 0.05 * age * age * 0.5;
        const size = 2 + r("z") * 5;
        const o = interpolate(age, [0, 6, life * (0.4 + r("l") * 0.5), life], [0, 1, 0.8, 0], clamp);
        const tw = 0.6 + 0.4 * Math.sin(age * 0.6 + i);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: 99,
              backgroundColor: GOLD,
              opacity: o * tw,
              boxShadow: `0 0 ${size * 3}px ${GOLD}`,
            }}
          />
        );
      })}
    </>
  );
};

// Poussière d'or ambiante, très discrète
const Dust: React.FC<{ t: number; n?: number; seed: string; opacity?: number }> = ({ t, n = 40, seed, opacity = 0.5 }) => (
  <>
    {Array.from({ length: n }).map((_, i) => {
      const r = (k: string) => random(`${seed}-${i}-${k}`);
      const x = Z.left + r("x") * ZW + Math.sin(t / 50 + i) * 12;
      const y = 1920 - ((r("y") * 1920 + t * (0.4 + r("v") * 0.8)) % 1920);
      const s = 1.5 + r("s") * 3;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: s,
            height: s,
            borderRadius: 99,
            backgroundColor: GOLD,
            opacity: opacity * (0.3 + 0.7 * Math.abs(Math.sin(t / 30 + i))),
            boxShadow: `0 0 ${s * 3}px ${GOLD}`,
          }}
        />
      );
    })}
  </>
);

/* ============ SCÈNE 1 — « هذا أحمر » : le piège (0 → 240) ============ */
const BOX = 440;
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const boxIn = pop(t, 8, 11);
  const txtIn = pop(t, 26, 12);
  const glitch = (t >= 100 && t < 106) || (t >= 140 && t < 146);
  const truth = t >= 176;
  const truthPop = truth ? 1 + 0.18 * Math.exp(-(t - 176) / 8) : 1;
  const grow = interpolate(t, [214, 240], [1, 7], { ...clamp, easing: Easing.in(Easing.cubic) });
  const fadeTxt = interpolate(t, [214, 226], [1, 0], clamp);
  // 4 rabats triangulaires qui se déplient vers le spectateur
  const flaps = [
    { clip: "polygon(0 0, 100% 0, 50% 50%)", origin: "50% 0", rot: (p: number) => `rotateX(${-172 * p}deg)`, at: 165 },
    { clip: "polygon(100% 0, 100% 100%, 50% 50%)", origin: "100% 50%", rot: (p: number) => `rotateY(${-172 * p}deg)`, at: 168 },
    { clip: "polygon(0 100%, 100% 100%, 50% 50%)", origin: "50% 100%", rot: (p: number) => `rotateX(${172 * p}deg)`, at: 171 },
    { clip: "polygon(0 0, 0 100%, 50% 50%)", origin: "0 50%", rot: (p: number) => `rotateY(${172 * p}deg)`, at: 174 },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: CREAM }}>
      <At x={CX} y={CY - BOX / 2 - 300} style={{ opacity: txtIn * fadeTxt }}>
        <div
          style={{
            transform: `scale(${txtIn * truthPop}) translateX(${glitch ? (t % 2 ? 9 : -9) : 0}px)`,
            textShadow: glitch ? `7px 0 ${RED}, -7px 0 #00d8ff` : "none",
          }}
        >
          <K text="هذا أحمر" size={124} color={truth ? RED : INK} />
        </div>
      </At>
      <div
        style={{
          position: "absolute",
          left: CX - BOX / 2,
          top: CY - BOX / 2,
          width: BOX,
          height: BOX,
          perspective: 1400,
          transform: `scale(${boxIn * grow}) rotate(${(1 - boxIn) * -10}deg)`,
        }}
      >
        {/* L'intérieur rouge */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 50% 45%, #ff5a4f 0%, ${RED} 45%, #b3140f 100%)`,
            boxShadow: truth ? `0 0 ${80 * Math.exp(-(t - 176) / 30) + 10}px ${RED}` : "none",
          }}
        />
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
          {flaps.map((f, i) => {
            const p = outBack(t, f.at, 18);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: INK,
                  clipPath: f.clip,
                  transformOrigin: f.origin,
                  transform: f.rot(p),
                  filter: `brightness(${1 + 0.6 * p})`,
                  opacity: p > 0.98 && t > 200 ? 0 : 1,
                }}
              />
            );
          })}
        </div>
      </div>
      <Burst t={t} at={170} cx={CX} cy={CY} w={BOX} h={BOX} seed="s1" />
    </AbsoluteFill>
  );
};

/* ============ SCÈNE 2 — hiérarchie décroissante + climax (240 → 600) ============ */
const WORDS = [
  { text: "ماتحاولش", at: 240, size: 170, move: 282, slotY: Z.top + 125, slotSize: 120 },
  { text: "تقنعهم", at: 300, size: 140, move: 340, slotY: Z.top + 255, slotSize: 100 },
  { text: "بأفكارك", at: 345, size: 112, move: 385, slotY: Z.top + 362, slotSize: 84 },
  { text: "العقول", at: 390, size: 80, move: 430, slotY: Z.top + 458, slotSize: 66 },
];
const TINY = { text: "تختلف", at: 435, size: 26 };
const HEARTS = [455, 495, 525, 545];
const CLIMAX = 560;

const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const pushIn = interpolate(t, [435, CLIMAX - 4], [1, 1.07], clamp);
  const zoom = interpolate(t, [CLIMAX - 4, CLIMAX], [1, 16], { ...clamp, easing: Easing.in(Easing.exp) });
  const beat = HEARTS.reduce((acc, h) => acc + (t >= h ? 0.3 * Math.exp(-(t - h) / 6) : 0), 0);

  if (t >= CLIMAX) {
    // Inversion : fond rouge, « تختلف » géant en crème lumineuse
    const s = 1 + 0.35 * Math.exp(-(t - CLIMAX) / 5) * Math.cos((t - CLIMAX) / 2.2);
    const shake = 16 * Math.exp(-(t - CLIMAX) / 10);
    const sx = (random(`sx${t}`) - 0.5) * shake;
    const sy = (random(`sy${t}`) - 0.5) * shake;
    const flash = interpolate(t, [CLIMAX, CLIMAX + 5], [0.9, 0], clamp);
    return (
      <AbsoluteFill style={{ backgroundColor: RED }}>
        <At x={CX + sx} y={CY + sy} style={{ transform: `translate(-50%, -50%) scale(${s})` }}>
          <K text="تختلف" size={225} color={CREAM} style={{ textShadow: `0 0 40px rgba(255,240,220,0.55)` }} />
        </At>
        <Burst t={t} at={CLIMAX} cx={CX} cy={CY} w={820} h={300} n={220} seed="climax" life={90} />
        <AbsoluteFill style={{ backgroundColor: CREAM, opacity: flash }} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: CREAM }}>
      <AbsoluteFill style={{ transform: `scale(${pushIn * zoom})`, transformOrigin: `${CX}px ${CY}px` }}>
        {WORDS.map((w, i) => {
          if (t < w.at) return null;
          // Entrée : le premier mot explose, les suivants surgissent du centre
          const enter = i === 0 ? snap(t, w.at, 10) : pop(t, w.at, 13);
          const scaleIn = i === 0 ? interpolate(enter, [0, 1], [2.6, 1]) : enter;
          const blur = i === 0 ? (1 - enter) * 24 : 0;
          const mv = snap(t, w.move, 10);
          const y = interpolate(mv, [0, 1], [CY, w.slotY]);
          const sc = interpolate(mv, [0, 1], [1, w.slotSize / w.size]);
          return (
            <At key={i} x={CX} y={y} style={{ transform: `translate(-50%, -50%) scale(${scaleIn * sc})`, filter: `blur(${blur}px)` }}>
              <K text={w.text} size={w.size} />
            </At>
          );
        })}
        {t >= TINY.at ? (
          <At x={CX} y={CY} style={{ transform: `translate(-50%, -50%) scale(${pop(t, TINY.at, 14) * (1 + beat)})` }}>
            <K text={TINY.text} size={TINY.size} color={INK} style={{ opacity: 0.75 }} />
          </At>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ============ SCÈNE 3 — cercles qui gravitent et fusionnent (600 → 840) ============ */
const CIRCLES = [
  { r: 95, c: RED, a: 0.0, R: 300, w: 0.018 },
  { r: 60, c: CREAM, a: 1.2, R: 360, w: -0.022 },
  { r: 42, c: GOLD, a: 2.1, R: 250, w: 0.027 },
  { r: 120, c: "transparent", ring: CREAM, a: 3.0, R: 330, w: -0.014 },
  { r: 34, c: RED, a: 4.0, R: 380, w: 0.03 },
  { r: 70, c: GOLD, a: 4.9, R: 280, w: -0.02 },
  { r: 50, c: CREAM, a: 5.6, R: 340, w: 0.024 },
];
const C3Y = 1150;
const MERGE = 780;
const LINE3 = [
  { w: "مش", at: 612 },
  { w: "الـ إي آي", at: 627, hollow: true },
  { w: "اللي", at: 642 },
  { w: "خلّاك", at: 657 },
  { w: "تحسّ", at: 672, red: true },
  { w: "بالكلام.", at: 687 },
];
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const conv = interpolate(t, [600, MERGE], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const merged = t >= MERGE;
  const ring = interpolate(t, [MERGE, MERGE + 30], [0, 1], clamp);
  const pulse = merged ? 1 + 0.2 * Math.exp(-((t - MERGE) % 60) / 10) : 1;
  const exit = interpolate(t, [826, 840], [1, 0], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Dust t={t} seed="d3" opacity={0.35} />
      {/* Texte cinétique : deux lignes, mot par mot sur le rythme */}
      {[LINE3.slice(0, 3), LINE3.slice(3)].map((line, li) => (
        <div key={li} dir="rtl" style={{ position: "absolute", top: Z.top + 70 + li * 140, left: Z.left, width: ZW, textAlign: "center", opacity: exit }}>
          {line.map((it) => {
            const s = pop(t, it.at, 11);
            return (
              <span key={it.w} style={{ display: "inline-block", margin: "0 14px", opacity: s, transform: `translateY(${(1 - s) * 50}px) rotate(${(1 - s) * 8}deg) scale(${it.red ? 1.15 : 1})` }}>
                <K
                  text={it.w}
                  size={86}
                  color={it.red ? RED : it.hollow ? "transparent" : CREAM}
                  style={it.hollow ? { WebkitTextStroke: `3px ${CREAM}` } : undefined}
                />
              </span>
            );
          })}
        </div>
      ))}
      {/* Les cercles */}
      {!merged
        ? CIRCLES.map((c, i) => {
            const ang = c.a + c.w * (t - 600) * (1 + conv * 2);
            const R = c.R * (1 - conv) * (1 + 0.08 * Math.sin(t / 9 + i));
            const x = CX + Math.cos(ang) * R * 1.05;
            const y = C3Y + Math.sin(ang) * R * 0.75;
            const r = c.r * (1 - conv * 0.6);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x - r,
                  top: y - r,
                  width: r * 2,
                  height: r * 2,
                  borderRadius: 999,
                  backgroundColor: c.c,
                  border: c.ring ? `5px solid ${c.ring}` : "none",
                  mixBlendMode: "screen",
                  opacity: 0.92,
                }}
              />
            );
          })
        : null}
      {merged ? (
        <>
          <div style={{ position: "absolute", left: CX - 70 * pulse * exit, top: C3Y - 70 * pulse * exit, width: 140 * pulse * exit, height: 140 * pulse * exit, borderRadius: 999, backgroundColor: RED, boxShadow: `0 0 60px ${RED}` }} />
          <div style={{ position: "absolute", left: CX - 70 - 300 * ring, top: C3Y - 70 - 300 * ring, width: 140 + 600 * ring, height: 140 + 600 * ring, borderRadius: 999, border: `4px solid ${GOLD}`, opacity: 1 - ring }} />
        </>
      ) : null}
      <Burst t={t} at={MERGE} cx={CX} cy={C3Y} w={140} h={140} n={90} seed="merge" life={70} />
    </AbsoluteFill>
  );
};

/* ============ SCÈNE 4 — la punchline et l'âme (840 → 1080) ============ */
// Mot rendu en vrais pixels : texte dessiné en basse résolution puis agrandi
const PixelWord: React.FC<{ text: string; size: number; pix: number; color: string }> = ({ text, size, pix, color }) => {
  const w = size * 4.7;
  const h = size * 1.5;
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const cw = Math.max(1, Math.round(w / pix));
    const ch = Math.max(1, Math.round(h / pix));
    c.width = cw;
    c.height = ch;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = color;
    ctx.font = `900 ${size / pix}px Kufi`;
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, cw / 2, ch / 2);
  }, [text, size, pix, color, w, h]);
  return <canvas ref={ref} style={{ width: w, height: h, imageRendering: "pixelated" }} />;
};

const L1 = ["الـ إي آي", "يعطيك", "بيكسلات", "من غير", "روح."];
const L2 = ["الديزاينر", "هو", "الروح", "اللي", "تخلّيك", "تحسّ", "بكل", "لون", "وكل", "كلمة."];
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const dim1 = interpolate(t, [930, 945], [1, 0.32], clamp);
  const pix = Math.round(interpolate(t, [868, 920], [16, 6], clamp));
  const cta = pop(t, 1000, 9);
  const ctaShake = t >= 1000 && t < 1012 ? (t % 2 ? 6 : -6) : 0;
  const logo = interpolate(t, [1022, 1045], [0, 1], clamp);
  const fadeEnd = interpolate(t, [1066, 1080], [1, 0], clamp);
  const word = (w: string, i: number, at: number, base: number) => {
    const s = pop(t, at + i * 8, 12);
    let color = INK;
    let size = base;
    let style: React.CSSProperties = {};
    if (w === "بيكسلات") {
      return (
        <span key={w + i} style={{ display: "inline-block", margin: "0 12px", opacity: s, transform: `translateY(${(1 - s) * 36}px)`, verticalAlign: "middle" }}>
          <PixelWord text={w} size={base} pix={pix} color={INK} />
        </span>
      );
    }
    if (w === "روح.") {
      color = "transparent";
      style = { WebkitTextStroke: `2.5px ${GREY}` };
    }
    if (w === "الديزاينر") size = base * 1.3;
    if (w === "الروح") {
      color = RED;
      size = base * 1.25;
      style = { textShadow: `0 0 26px ${GOLD}aa` };
    }
    if (w === "لون") color = RED;
    if (w === "كلمة.") style = { textDecoration: "underline", textDecorationColor: GOLD, textDecorationThickness: 6, textUnderlineOffset: 14 };
    return (
      <span key={w + i} style={{ display: "inline-block", margin: "0 12px", opacity: s, transform: `translateY(${(1 - s) * 36}px)` }}>
        <K text={w} size={size} color={color} style={style} />
      </span>
    );
  };
  return (
    <AbsoluteFill style={{ backgroundColor: CREAM, opacity: fadeEnd }}>
      <Dust t={t} seed="d4" opacity={0.45} />
      <div dir="rtl" style={{ position: "absolute", top: Z.top + 70, left: Z.left, width: ZW, textAlign: "center", opacity: dim1, lineHeight: 1.2 }}>
        {L1.map((w, i) => word(w, i, 850, 62))}
      </div>
      <div dir="rtl" style={{ position: "absolute", top: Z.top + 400, left: Z.left, width: ZW, textAlign: "center", lineHeight: 1.25 }}>
        {t >= 930 ? L2.map((w, i) => word(w, i, 930, 64)) : null}
      </div>
      <Burst t={t} at={946} cx={CX} cy={Z.top + 470} w={200} h={80} n={60} seed="roh" life={70} />
      {t >= 1000 ? (
        <At x={CX} y={1330} style={{ transform: `translate(-50%, -50%) scale(${cta}) translateX(${ctaShake}px) rotate(-2deg)` }}>
          <div style={{ backgroundColor: RED, borderRadius: 34, padding: "4px 54px", boxShadow: `0 20px 50px ${RED}55` }}>
            <K text="شنوّة حسّيت؟" size={88} color={CREAM} />
          </div>
        </At>
      ) : null}
      <Img src={staticFile("ame/logo-creofan-rouge.png")} style={{ position: "absolute", left: CX - 120, top: 1480, width: 240, opacity: logo }} />
    </AbsoluteFill>
  );
};

/* ============ Son ============ */
// Niveau global des effets (évite la saturation quand ils se superposent)
const SFX_GAIN = 0.6;
type S = [string, number, number, number]; // fichier, frame (60 i/s), durée, volume
const SFX: S[] = [
  ...[60, 90, 120, 150].map((f) => ["regard/tick.wav", f, 6, 0.6] as S),
  ["regard/glitch.wav", 100, 10, 0.4],
  ["regard/glitch.wav", 140, 10, 0.4],
  ["ame/unfold.wav", 163, 36, 0.8],
  ["ame/boom.wav", 172, 90, 0.55],
  ["ame/shimmer.wav", 172, 96, 0.7],
  ["ame/zoom.wav", 220, 16, 0.6],
  ["regard/sub.wav", 240, 50, 0.6],
  ["regard/glitch.wav", 241, 8, 0.35],
  ["cc/whoosh.wav", 280, 30, 0.45],
  ["cc/pop.wav", 300, 12, 0.6],
  ["cc/pop.wav", 345, 12, 0.45],
  ["cc/pop.wav", 390, 12, 0.32],
  ["regard/tick.wav", 435, 6, 0.4],
  ...HEARTS.map((h, i) => ["regard/heart.wav", h, 40, 0.5 + i * 0.1] as S),
  ["ame/zoom.wav", CLIMAX - 15, 16, 0.8],
  ["ame/boom.wav", CLIMAX, 96, 0.75],
  ["ame/shimmer.wav", CLIMAX + 2, 96, 0.8],
  ["cc/whoosh.wav", 598, 30, 0.45],
  ...LINE3.map((l) => ["cc/pop.wav", l.at, 12, 0.35] as S),
  ...[650, 690, 725, 758].map((f) => ["regard/glass.wav", f, 60, 0.35] as S),
  ["regard/riser.wav", 720, 60, 0.45],
  ["regard/sub.wav", MERGE, 50, 0.55],
  ["ame/shimmer.wav", MERGE + 2, 80, 0.55],
  ["regard/revriser.wav", 820, 20, 0.5],
  ...L1.map((_, i) => ["cc/click.wav", 850 + i * 8, 4, 0.6] as S),
  ["regard/glitch.wav", 866, 10, 0.35],
  ["regard/swish.wav", 930, 22, 0.6],
  ...L2.map((_, i) => ["cc/click.wav", 930 + i * 8, 4, 0.45] as S),
  ["ame/shimmer.wav", 946, 80, 0.45],
  ["regard/heart.wav", 1000, 40, 0.7],
  ["regard/bell.wav", 1000, 80, 0.4],
  ["cc/ding.wav", 1024, 40, 0.4],
];

export const Ame: React.FC = () => {
  const t = useCurrentFrame();
  const Scene = t < 240 ? Scene1 : t < 600 ? Scene2 : t < 840 ? Scene3 : Scene4;
  // Musique : entre quand la boîte s'ouvre, coupée pendant la tension et le climax
  const musicVol = (f: number) =>
    interpolate(f, [0, 170, 180, 420, 440, 600, 612, 1050, 1080], [0, 0, 0.3, 0.3, 0, 0, 0.3, 0.3, 0], clamp);
  return (
    <>
      <Scene t={t} />
      <Audio src={staticFile("cc/music.mp3")} volume={musicVol} />
      {SFX.map(([file, at, len, vol], i) => (
        <Sequence key={i} from={at} durationInFrames={len}>
          <Audio src={staticFile(file)} volume={vol * SFX_GAIN} />
        </Sequence>
      ))}
    </>
  );
};
