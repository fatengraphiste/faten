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
import { MixedText } from "../components";
import { BEIGE, FONT, INK, RED, SAFE, WHITE } from "../theme";

// « عينيك ليك ولا للـ IA ؟ » — typographie cinétique, 30 s, 120 BPM (1 temps = 15 frames)
export const REGARD_DURATION = 900;
const GREY = "#8a7f7e";
const ZONE_W = 1080 - SAFE.left - SAFE.right; // 860
const CX = SAFE.left + ZONE_W / 2; // 500 : centre optique horizontal
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const snap = (t: number, at: number, dur = 10) =>
  interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing: Easing.bezier(0.7, 0, 0.2, 1) });
const pop = (t: number, at: number, damping = 11) =>
  spring({ frame: t - at, fps: 30, config: { damping, stiffness: 160 } });

// Boîte qui couvre exactement la zone de sécurité (contenu centré)
const SafeBox: React.FC<{ top?: number; gap?: number; children: React.ReactNode }> = ({ top = SAFE.top, gap = 0, children }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: SAFE.left,
      width: ZONE_W,
      height: 1920 - SAFE.bottom - top,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap,
    }}
  >
    {children}
  </div>
);

// Bloc de texte centré horizontalement dans la zone de sécurité
const Line: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ top, children, style }) => (
  <div style={{ position: "absolute", top, left: SAFE.left, width: ZONE_W, textAlign: "center", ...style }}>{children}</div>
);

const Bg: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <AbsoluteFill style={{ backgroundColor: color, fontFamily: FONT, overflow: "hidden" }}>{children}</AbsoluteFill>
);

// ---------- Plans 1-3 : le hack cognitif (0 → 90) ----------
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const zoom = interpolate(t, [2, 6], [1.08, 1], { ...clamp, easing: Easing.bezier(0.7, 0, 0.2, 1) });
  const o1 = t >= 68 ? 0.3 : t >= 30 ? 0.6 : 1;
  const s2 = snap(t, 30, 8);
  const s3 = pop(t, 60, 9);
  const shake = t >= 75 && t < 81 ? (t % 2 ? 6 : -6) : 0;
  return (
    <Bg color={INK}>
      <SafeBox top={SAFE.top}>
        <div style={{ opacity: o1 }}>
        <div style={{ transform: `scale(${zoom})`, maxWidth: 820, textAlign: "center" }}>
          <MixedText text="عينيك توّة هابطة على هذي." size={130} color={t === 8 ? RED : WHITE} />
        </div>
      </div>
      </SafeBox>
      {t >= 30 ? (
        <Line top={SAFE.top + 50} style={{ opacity: (t >= 68 ? 0.3 : 1) * s2, transform: `translateY(${(1 - s2) * -40}px)` }}>
          <MixedText text="ومن بعد طلعت تقرا في هذي." size={61} color={GREY} />
        </Line>
      ) : null}
      {t >= 60 ? (
        <Line top={1330} style={{ transform: `scale(${s3}) translateX(${shake}px)` }}>
          <MixedText text="بديت تشكّ في مخّك؟" size={78} color={RED} />
        </Line>
      ) : null}
    </Bg>
  );
};

// ---------- Plan 4 : « صدّقني، الـ IA… » (90 → 150) ----------
const Trust: React.FC<{ t: number }> = ({ t }) => {
  const l = t - 90;
  const collapse = snap(l, 0, 10);
  const words = ["صدّقني،", "الـ", "IA", "وحدو", "ما", "ينجّمش", "يپيراتي", "عينيك", "هكّا."];
  const glitch = t >= 140 && t < 143;
  return (
    <Bg color={RED}>
      {/* Les trois textes de l'accroche se resserrent puis disparaissent */}
      {collapse < 1 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - collapse }}>
          {[-420, 0, 470].map((y, i) => (
            <div key={i} style={{ position: "absolute", left: CX - 200, top: 860 + y * (1 - collapse), width: 400, height: 30, borderRadius: 15, backgroundColor: BEIGE, transform: `scale(${1 - collapse})` }} />
          ))}
        </AbsoluteFill>
      ) : null}
      <SafeBox top={SAFE.top}>
        <div dir="rtl" style={{ textAlign: "center", maxWidth: 840, lineHeight: 1.5 }}>
          {words.map((w, i) => {
            const s = pop(l, 12 + i * 4, 12);
            const isIA = w === "IA";
            const isGlitch = w === "يپيراتي" && glitch;
            return (
              <span key={i} style={{ display: "inline-block", margin: "0 12px", opacity: s, transform: `scale(${s})` }}>
                <MixedText
                  text={w}
                  size={isIA ? 90 : 84}
                  color={isIA ? WHITE : BEIGE}
                  style={{
                    ...(isIA ? { backgroundColor: INK, borderRadius: 20, padding: "0 24px" } : {}),
                    ...(isGlitch ? { textShadow: `8px 0 #00e5ff, -8px 0 ${INK}`, transform: "translateX(6px)" } : {}),
                  }}
                />
              </span>
            );
          })}
        </div>
      </SafeBox>
    </Bg>
  );
};

// ---------- Plans 5-6 : la grille « ذكاء » et le mot caché (150 → 270) ----------
const COLS = 7;
const ROWS = 10;
const HIDDEN = { c: 4, r: 6 }; // colonne 5, ligne 7
const Grid: React.FC<{ t: number }> = ({ t }) => {
  const l = t - 150;
  const frozen = t >= 240;
  const fade = snap(t, 240, 6);
  const grow = snap(t, 240, 10);
  const cellW = ZONE_W / COLS;
  const top0 = 380;
  const cellH = 92;
  const chrono = interpolate(t, [180, 240], [1, 0], clamp);
  const count = t < 210 ? "2" : "1";
  const found = t >= 255;
  const no = snap(t, 265, 8);
  return (
    <Bg color={INK}>
      {/* Titre puis question */}
      <Line top={SAFE.top + 10}>
        {!found ? (
          <MixedText text="شوف الـ IA كيفاش يشوف الديزاين" size={46} color={WHITE} />
        ) : t < 265 ? (
          <MixedText text="لقيتها؟" size={62} color={WHITE} />
        ) : (
          <div style={{ clipPath: `inset(0 0 0 ${(1 - no) * 100}%)` }}>
            <MixedText text="بطبيعة لا." size={62} color={WHITE} />
          </div>
        )}
      </Line>
      {Array.from({ length: ROWS }).map((_, r) =>
        l >= r * 2
          ? Array.from({ length: COLS }).map((__, c) => {
              const hidden = r === HIDDEN.r && c === HIDDEN.c;
              const jx = frozen ? 0 : (random(`x${r}-${c}-${t}`) - 0.5) * 2;
              const jy = frozen ? 0 : (random(`y${r}-${c}-${t}`) - 0.5) * 2;
              const baseOp = 0.5 + random(`o${r}-${c}`) * 0.4;
              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    position: "absolute",
                    left: SAFE.left + c * cellW,
                    top: top0 + r * cellH,
                    width: cellW,
                    textAlign: "center",
                    transform: `translate(${jx}px, ${jy}px) scale(${hidden ? 1 + 1.4 * grow : 1})`,
                    opacity: hidden ? (frozen ? 1 : baseOp) : baseOp * (1 - 0.9 * fade),
                    zIndex: hidden ? 2 : 1,
                  }}
                >
                  <MixedText text={hidden ? "ديزاين" : "ذكاء"} size={hidden ? 36 : 42} color={hidden && frozen ? RED : GREY} />
                </div>
              );
            })
          : null,
      )}
      {/* Chronomètre 2 s */}
      {t >= 180 && t < 240 ? (
        <div style={{ position: "absolute", top: 1345, left: CX - 45, width: 90, height: 90 }}>
          <svg width={90} height={90} viewBox="0 0 90 90">
            <circle cx={45} cy={45} r={38} stroke={`${RED}44`} strokeWidth={8} fill="none" />
            <circle cx={45} cy={45} r={38} stroke={RED} strokeWidth={8} fill="none" strokeDasharray={239} strokeDashoffset={239 * (1 - chrono)} transform="rotate(-90 45 45)" strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontSize: 40, fontWeight: 800 }}>{count}</div>
        </div>
      ) : null}
    </Bg>
  );
};

// ---------- Plan 7 : « خاطر الـ Hierarchy… » (270 → 330) ----------
const Because: React.FC<{ t: number }> = ({ t }) => {
  const m1 = snap(t, 272, 8);
  const s2 = pop(t, 300, 12);
  const under = snap(t, 306, 12);
  return (
    <Bg color={BEIGE}>
      <SafeBox top={SAFE.top} gap={50}>
        <div style={{ clipPath: `inset(0 0 0 ${(1 - m1) * 100}%)`, textAlign: "center" }}>
          <MixedText text="خاطر الـ Hierarchy والـ Contrast" size={74} color={INK} latinColor={RED} />
        </div>
        {t >= 300 ? (
          <div style={{ position: "relative", transform: `scale(${s2})` }}>
            <MixedText text="نتحكّمو فيهم إحنا." size={104} color={INK} />
            <div style={{ position: "absolute", right: 0, bottom: -6, height: 10, width: `${under * 100}%`, backgroundColor: RED, borderRadius: 5 }} />
          </div>
        ) : null}
      </SafeBox>
    </Bg>
  );
};

// Titre de section fixe (plans 8 → 11)
const Section: React.FC<{ t: number; at: number; n: string; term: string; sub?: string; subAt?: number; dark?: boolean }> = ({ t, at, n, term, sub, subAt, dark }) => {
  const s = pop(t, at, 12);
  const ss = sub ? snap(t, subAt ?? at + 8, 10) : 0;
  return (
    <Line top={270} style={{ opacity: s, transform: `translateY(${(1 - s) * -30}px)` }}>
      <MixedText text={`${n}. الـ ${term}`} size={70} color={dark ? WHITE : INK} latinColor={RED} />
      {sub ? (
        <div style={{ marginTop: 10, opacity: ss }}>
          <MixedText text={sub} size={44} color={dark ? BEIGE : INK} latinWeight={600} />
        </div>
      ) : null}
    </Line>
  );
};

// ---------- Plan 8 : Hierarchy (330 → 420) ----------
const Hierarchy: React.FC<{ t: number }> = ({ t }) => {
  const k = snap(t, 360, 10);
  const lerp = (a: number, b: number) => a + (b - a) * k;
  const items = [
    { txt: "عنوان", size: lerp(61, 130), color: INK, pill: false },
    { txt: "تفاصيل", size: lerp(61, 42), color: k > 0.5 ? GREY : INK, pill: false },
    { txt: "زرّ", size: lerp(61, 56), color: k > 0.5 ? WHITE : INK, pill: true },
  ];
  return (
    <Bg color={BEIGE}>
      <Section t={t} at={330} n="1" term="Hierarchy" sub="إنتَ تقرّر شنوّة يتقرا الأوّل" subAt={340} />
      <SafeBox top={520} gap={lerp(60, 40)}>
        {items.map((it, i) => {
          const num = pop(t, 372 + i * 8, 9);
          return (
            <div key={i} dir="rtl" style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div
                style={{
                  padding: it.pill ? `${lerp(0, 14)}px ${lerp(0, 60)}px` : 0,
                  borderRadius: 999,
                  backgroundColor: it.pill ? `rgba(247,50,42,${k})` : "transparent",
                }}
              >
                <MixedText text={it.txt} size={it.size} color={it.color} />
              </div>
              <div style={{ width: 52, height: 52, borderRadius: 99, backgroundColor: RED, color: WHITE, fontSize: 30, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${num})` }}>
                {i + 1}
              </div>
            </div>
          );
        })}
      </SafeBox>
    </Bg>
  );
};

// ---------- Plan 9 : Contrast — le projecteur (420 → 510) ----------
const Contrast: React.FC<{ t: number }> = ({ t }) => {
  const x = interpolate(t, [450, 480], [1080 + 300, -300], clamp);
  const y = 860;
  const final = pop(t, 480, 11);
  const phrase = (color: string) => (
    <SafeBox top={SAFE.top}>
      <MixedText text="هذا ما يتقراش" size={110} color={color} />
    </SafeBox>
  );
  return (
    <Bg color={BEIGE}>
      <Section t={t} at={420} n="2" term="Contrast" />
      {phrase("#f7e9e8")}
      {t >= 450 && t < 482 ? (
        <>
          <div style={{ position: "absolute", left: x - 280, top: y - 280, width: 560, height: 560, borderRadius: 999, background: "radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0) 70%)" }} />
          <AbsoluteFill style={{ clipPath: `circle(280px at ${x}px ${y}px)` }}>{phrase(INK)}</AbsoluteFill>
        </>
      ) : null}
      {t >= 480 ? (
        <Line top={1140} style={{ transform: `scale(${final})` }}>
          <MixedText text="اللي يبان، يتقرا" size={84} color={RED} />
        </Line>
      ) : null}
    </Bg>
  );
};

// ---------- Plan 10 : Focus — mise au point (510 → 600) ----------
const FLOATERS = ["لون", "خط", "صورة", "شعار", "نص", "زرّ", "أيقونة", "فلتر", "ظل", "إطار", "كادر"];
const Focus: React.FC<{ t: number }> = ({ t }) => {
  const k = snap(t, 540, 10);
  return (
    <Bg color={INK}>
      {FLOATERS.map((w, i) => {
        const depth = 0.5 + random(`d${i}`) * 1.2;
        const x = SAFE.left + random(`fx${i}`) * (ZONE_W - 160);
        const y = 480 + random(`fy${i}`) * 820;
        const drift = Math.sin((t + i * 13) / (20 * depth)) * 14 * depth;
        const shape = i % 3;
        return (
          <div key={i} style={{ position: "absolute", left: x + drift, top: y, filter: `blur(${18 + 10 * k}px)`, opacity: 1 - 0.6 * k }}>
            {shape === 0 ? (
              <MixedText text={w} size={50 * depth} color={i % 2 ? BEIGE : GREY} />
            ) : shape === 1 ? (
              <div style={{ width: 90 * depth, height: 90 * depth, borderRadius: 99, backgroundColor: i % 2 ? BEIGE : GREY }} />
            ) : (
              <div style={{ width: 160 * depth, height: 50 * depth, borderRadius: 99, backgroundColor: GREY }} />
            )}
          </div>
        );
      })}
      <SafeBox top={SAFE.top}>
        <div style={{ filter: `blur(${18 * (1 - k)}px)`, transform: `scale(${0.9 + 0.1 * k})` }}>
          <MixedText text="هدف" size={113} color={RED} />
        </div>
      </SafeBox>
      <Section t={t} at={520} n="3" term="Focus" sub="عين وحدة، هدف واحد" subAt={548} dark />
    </Bg>
  );
};

// ---------- Plan 11 : Negative Space — la flèche dans le vide (600 → 720) ----------
const NegSpace: React.FC<{ t: number }> = ({ t }) => {
  const out = snap(t, 615, 12);
  const trace = snap(t, 660, 18);
  const text = pop(t, 650, 12);
  // Deux grands blocs : l'espace entre eux dessine une flèche vers le bas
  const L = "70,470 455,470 455,895 320,895 500,1075 500,1110 70,1110";
  const R = "930,470 545,470 545,895 680,895 500,1075 500,1110 930,1110";
  const arrow = "M455 470 V895 H320 L500 1075 L680 895 H545 V470";
  return (
    <Bg color={BEIGE}>
      <Section t={t} at={600} n="4" term="Negative Space" />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* État saturé : 12 blocs qui se touchent */}
        {Array.from({ length: 12 }).map((_, i) => {
          const c = i % 3;
          const r = Math.floor(i / 3);
          const w = ZONE_W / 3;
          const h = 640 / 4;
          const dx = (c - 1) * 400 * out;
          const dy = (r - 1.5) * 250 * out;
          return (
            <rect key={i} x={SAFE.left + c * w + dx} y={470 + r * h + dy} width={w} height={h} fill={i % 2 ? RED : INK} opacity={1 - out} />
          );
        })}
        <polygon points={L} fill={RED} opacity={out} />
        <polygon points={R} fill={RED} opacity={out} />
        <path d={arrow} stroke={INK} strokeWidth={5} fill="none" strokeDasharray={1800} strokeDashoffset={1800 * (1 - trace)} />
      </svg>
      <Line top={1170} style={{ opacity: text, transform: `translateY(${(1 - text) * 30}px)` }}>
        <MixedText text="الفراغ زادا يحكي" size={78} color={INK} />
      </Line>
    </Bg>
  );
};

// ---------- Plan 12 : écran partagé + image cachée (720 → 780) ----------
const Split: React.FC<{ t: number }> = ({ t }) => {
  const top = pop(t, 720, 14);
  const bottom = pop(t, 724, 12);
  const panelH = 590;
  const g = (random(`g${t}`) - 0.5) * 16;
  if (t >= 735 && t <= 737) {
    return (
      <Bg color={RED}>
        <SafeBox top={SAFE.top}>
          <MixedText text="عملت pause؟ برافو، عينك ولات ديزاينر" size={66} color={BEIGE} />
        </SafeBox>
      </Bg>
    );
  }
  return (
    <Bg color={BEIGE}>
      {/* Haut : l'IA seule = bruit */}
      <div style={{ position: "absolute", top: SAFE.top, left: SAFE.left, width: ZONE_W, height: panelH, borderRadius: 30, overflow: "hidden", backgroundColor: INK, opacity: top, transform: `translateX(${(1 - top) * 40 + (t < 730 ? g : 0)}px)` }}>
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: (i % 6) * 143 + (random(`n${i}${t}`) - 0.5) * 20, top: Math.floor(i / 6) * 98 + (random(`m${i}${t}`) - 0.5) * 20, opacity: 0.6 }}>
            <MixedText text="ذكاء" size={38} color={[RED, GREY, BEIGE][Math.floor(random(`c${i}${Math.floor(t / 3)}`) * 3)]} />
          </div>
        ))}
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", backgroundColor: "rgba(42,15,14,0.55)" }}>
          <div style={{ textShadow: `${4 + g / 2}px 0 #00e5ff, ${-4 - g / 2}px 0 ${RED}` }}>
            <MixedText text="الـ IA وحدو" size={70} color={WHITE} />
            <MixedText text="= تشويش" size={84} color={WHITE} />
          </div>
        </AbsoluteFill>
      </div>
      {/* Bas : l'IA + l'œil du designer = message */}
      <div style={{ position: "absolute", top: SAFE.top + panelH + 40, left: SAFE.left, width: ZONE_W, height: panelH, borderRadius: 30, backgroundColor: WHITE, boxShadow: "0 20px 50px rgba(42,15,14,0.12)", transform: `scale(${bottom})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36 }}>
        <MixedText text="الـ IA + عين ديزاينر" size={64} color={INK} latinColor={RED} />
        <div style={{ backgroundColor: RED, borderRadius: 999, padding: "8px 56px" }}>
          <MixedText text="= رسالة" size={76} color={WHITE} />
        </div>
      </div>
    </Bg>
  );
};

// ---------- Plan 13 : « الـ IA يولّد. إنتَ تتحكّم. » (780 → 840) ----------
const Control: React.FC<{ t: number }> = ({ t }) => {
  const s1 = snap(t, 780, 10);
  const shrink = snap(t, 795, 10);
  const s2 = pop(t, 795, 10);
  const under = snap(t, 805, 12);
  return (
    <Bg color={RED}>
      <SafeBox top={SAFE.top} gap={40}>
        <div style={{ transform: `translateX(${(1 - s1) * 400}px) scale(${1 - 0.3 * shrink})`, opacity: 1 - 0.5 * shrink }}>
          <MixedText text="الـ IA يولّد." size={96} color={BEIGE} />
        </div>
        {t >= 795 ? (
          <div style={{ position: "relative", transform: `scale(${s2})` }}>
            <MixedText text="إنتَ تتحكّم." size={139} color={BEIGE} />
            <div style={{ position: "absolute", right: 0, bottom: 0, height: 14, width: `${under * 100}%`, backgroundColor: INK, borderRadius: 7 }} />
          </div>
        ) : null}
      </SafeBox>
    </Bg>
  );
};

// ---------- Plan 14 : appel à l'action + boucle (840 → 900) ----------
const Cta: React.FC<{ t: number }> = ({ t }) => {
  const s1 = pop(t, 842, 11);
  const s2 = pop(t, 860, 11);
  const logo = snap(t, 870, 12);
  const toInk = interpolate(t, [885, 899], [0, 1], clamp);
  return (
    <Bg color={RED}>
      <div style={{ opacity: 1 - toInk }}>
        <Line top={400} style={{ transform: `scale(${s1})` }}>
          <MixedText text="عاود من الأوّل وشوف عينيك وين مشات" size={56} color={BEIGE} />
        </Line>
        <Line top={620} style={{ transform: `scale(${s2})` }}>
          <div style={{ display: "inline-block", backgroundColor: BEIGE, borderRadius: 30, padding: "20px 34px", maxWidth: 820 }}>
            <MixedText text="اكتب «Hierarchy» في الكومنتار ونبعثلك الـ checklist" size={44} color={INK} latinColor={RED} />
          </div>
        </Line>
        <Img src={staticFile("logo-creofan-complet.png")} style={{ position: "absolute", top: 1100 - (1 - logo) * 40, left: CX - 210, width: 420, opacity: logo }} />
      </div>
      <AbsoluteFill style={{ backgroundColor: INK, opacity: toInk }} />
    </Bg>
  );
};

const SCENES: [number, number, React.FC<{ t: number }>][] = [
  [0, 90, Hook],
  [90, 150, Trust],
  [150, 270, Grid],
  [270, 330, Because],
  [330, 420, Hierarchy],
  [420, 510, Contrast],
  [510, 600, Focus],
  [600, 720, NegSpace],
  [720, 780, Split],
  [780, 840, Control],
  [840, 900, Cta],
];

// Effets sonores : [fichier, frame, durée max en frames, volume]
const SFX: [string, number, number, number][] = [
  ["regard/sub.wav", 0, 27, 0.7],
  ["regard/tick.wav", 8, 3, 0.8],
  ["cc/whoosh.wav", 28, 15, 0.6],
  ["cc/pop.wav", 60, 10, 0.8],
  ["regard/glitch.wav", 75, 6, 0.6],
  ["cc/whoosh.wav", 88, 15, 0.5],
  ...[0, 1, 2, 3, 4].map((i) => ["cc/click.wav", 102 + i * 8, 3, 0.9] as [string, number, number, number]),
  ["regard/glitch.wav", 140, 6, 0.7],
  ["regard/revriser.wav", 135, 15, 0.6],
  ["regard/drone.wav", 150, 86, 0.8],
  ["regard/ticktock.wav", 180, 60, 0.8],
  ["regard/snap.wav", 240, 3, 0.8],
  ["regard/bell.wav", 240, 60, 0.9],
  ["cc/whoosh.wav", 268, 15, 0.6],
  ["regard/sub.wav", 274, 15, 0.6],
  ["regard/sub.wav", 284, 15, 0.6],
  ["regard/swish.wav", 306, 12, 0.8],
  ["regard/riser.wav", 345, 15, 0.6],
  ["regard/snap.wav", 360, 3, 0.8],
  ["cc/pop.wav", 372, 6, 0.7],
  ["cc/pop.wav", 380, 6, 0.8],
  ["cc/pop.wav", 388, 6, 0.9],
  ["cc/whoosh.wav", 418, 15, 0.5],
  ["regard/drone.wav", 425, 25, 0.25],
  ["cc/whoosh.wav", 450, 30, 0.6],
  ["regard/snap.wav", 480, 3, 0.8],
  ["regard/sub.wav", 480, 15, 0.5],
  ["cc/whoosh.wav", 508, 15, 0.5],
  ["regard/heart.wav", 540, 36, 0.75],
  ["regard/crunch.wav", 600, 10, 0.8],
  ["cc/whoosh.wav", 615, 15, 0.7],
  ["regard/glass.wav", 645, 60, 0.8],
  ["regard/glitch.wav", 720, 6, 0.6],
  ["regard/noise.wav", 720, 15, 0.6],
  ["regard/chord.wav", 724, 40, 0.8],
  ["regard/shutter.wav", 735, 5, 0.9],
  ["regard/riser.wav", 765, 30, 0.7],
  ["regard/sub.wav", 795, 27, 0.7],
  ["cc/pop.wav", 842, 6, 0.8],
  ["cc/pop.wav", 860, 6, 0.8],
  ["cc/ding.wav", 870, 20, 0.7],
  ["regard/revriser.wav", 885, 15, 0.7],
];

export const Regard: React.FC = () => {
  const t = useCurrentFrame();
  const scene = SCENES.find(([a, b]) => t >= a && t < b) ?? SCENES[SCENES.length - 1];
  const Scene = scene[2];
  // Musique : coupée pendant la grille (tension), reprise au plan 7
  const musicVol = (f: number) =>
    interpolate(f, [0, 6, 140, 150, 266, 272, 880, 899], [0, 0.32, 0.32, 0, 0, 0.32, 0.32, 0], clamp);
  return (
    <>
      <Scene t={t} />
      <Audio src={staticFile("cc/music.mp3")} volume={musicVol} />
      {SFX.map(([file, at, len, vol], i) => (
        <Sequence key={i} from={at} durationInFrames={len}>
          <Audio src={staticFile(file)} volume={vol} />
        </Sequence>
      ))}
    </>
  );
};
