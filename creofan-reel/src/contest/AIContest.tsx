import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Loop, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { MixedText } from "../components";
import { OutroIcon } from "../outro/OutroIcon";
import { BEIGE, CHAR, Folder, FONT, ink, PINK, RED } from "../masterclass/Storyboard";

// CREOFAN — « AI CONTEST » : Nano Banana vs ChatGPT vs Claude · 1080×1920, 30 i/s
// Voix ElevenLabs (eleven_v4, voix « Bady »), repères mot à mot issus de la transcription Scribe.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const WHITE = "#ffffff";
const CUT = [0, s(6.6), s(18.6), s(29.1), s(39.4), s(45.4)];
const OUT = CUT[5];
export const CONTEST_DURATION = OUT + 140;
const BGS = [CHAR, CHAR, CHAR, CHAR, CHAR, RED];
const L = 90;
const RG = 900;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number, a: number, d: number, e = Easing.bezier(0.65, 0, 0.35, 1)) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: e });
const outE = (t: number, a: number, d: number) => ease(t, a, d, Easing.bezier(0.16, 1, 0.3, 1));
const el = (t: number, a: number, damping = 12) => (t < a ? 0 : spring({ frame: t - a, fps: FPS, config: { damping, stiffness: 170, mass: 0.8 } }));

const Up: React.FC<{ t: number; at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, at, children, style }) => (
  <div style={{ overflow: "hidden", ...style }}>
    <div style={{ transform: `translateY(${(1 - outE(t, at, 14)) * 110}%)` }}>{children}</div>
  </div>
);
const Big: React.FC<{ size: number; color: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color, children, style }) => (
  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 0.95, letterSpacing: -size * 0.035, color, whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Chip: React.FC<{ text: string; c: string; style?: React.CSSProperties }> = ({ text, c, style }) => (
  <span style={{ display: "inline-block", backgroundColor: c, color: ink(c), fontFamily: FONT, fontWeight: 800, fontSize: 28, letterSpacing: 3, padding: "10px 28px", borderRadius: 999, whiteSpace: "nowrap", ...style }}>{text}</span>
);
// Étiquette « autocollant » qui claque en place
const Sticker: React.FC<{ t: number; at: number; x: number; y: number; r: number; text: string; c: string; stroke: string }> = ({ t, at, x, y, r, text, c, stroke }) =>
  t >= at ? (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 6, transform: `rotate(${r}deg) scale(${el(t, at, 8)})` }}>
      <Chip text={text} c={c} style={{ border: `5px solid ${stroke}`, fontSize: 30 }} />
    </div>
  ) : null;
const Box: React.FC<{ x: number; y: number; w: number; h: number; c: string; stroke: string; r?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, c, stroke, r = 26, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, backgroundColor: c, border: `6px solid ${stroke}`, borderRadius: r, overflow: "hidden", ...style }}>{children}</div>
);

/* ---------- Icônes plates ---------- */
const Ico: React.FC<{ size: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style}>{children}</svg>
);
const Mic: React.FC<{ c: string; size: number }> = ({ c, size }) => (
  <Ico size={size}>
    <rect x={8.5} y={2} width={7} height={12} rx={3.5} fill={c} />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8 21.5h8" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" />
  </Ico>
);
const Chip3: React.FC<{ size: number; t: number }> = ({ size, t }) => (
  <Ico size={size}>
    {[6, 9.3, 12.6, 15.9].map((p, i) => (
      <g key={i} stroke={BEIGE} strokeWidth={1.3} strokeLinecap="round">
        <path d={`M${p + 1} 2.5v2.5M${p + 1} 19v2.5M2.5 ${p + 1}h2.5M19 ${p + 1}h2.5`} />
      </g>
    ))}
    <rect x={5} y={5} width={14} height={14} rx={2.5} fill={RED} />
    <rect x={8} y={8} width={8} height={8} rx={1.2} fill={BEIGE} opacity={0.35 + 0.65 * Math.abs(Math.sin(t / 6))} />
  </Ico>
);
const Spark: React.FC<{ size: number; c: string; rot?: number }> = ({ size, c, rot = 0 }) => (
  <Ico size={size} style={{ transform: `rotate(${rot}deg)` }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <path key={i} d="M12 12V2.6" stroke={c} strokeWidth={2.6} strokeLinecap="round" transform={`rotate(${i * 45 + (i % 2) * 8} 12 12)`} />
    ))}
  </Ico>
);
const Bulb: React.FC<{ size: number; c: string }> = ({ size, c }) => (
  <Ico size={size}><circle cx={12} cy={9.5} r={6} fill={c} /><rect x={9} y={16} width={6} height={2.2} rx={1} fill={c} /><rect x={10} y={19.2} width={4} height={1.8} rx={0.9} fill={c} /></Ico>
);
const SHARE = "M4 13v6.5h16V13M12 3.5v11M7.5 8L12 3.5 16.5 8";
const FOLLOW = "M15 19c0-3.3-2.7-6-6-6s-6 2.7-6 6M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M19 8v6M16 11h6";
const HEART = "M12 20.5S3 15 3 8.8A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 9 2.4C21 15 12 20.5 12 20.5z";

/* ---------- Le plateau « The Voice of AI » (vidéo + images fixes) ---------- */
const VID = "contest/stage.mp4";
// Extrait de la vidéo (src en secondes) joué à partir de la frame `at`
const Clip: React.FC<{ at: number; src: number; rate: number; dur: number }> = ({ at, src, rate, dur }) => (
  <Sequence from={at} durationInFrames={dur}>
    <OffthreadVideo src={staticFile(VID)} startFrom={Math.round(src * FPS)} playbackRate={rate} muted style={{ position: "absolute", inset: 0, width: 1080, height: 1920, objectFit: "cover" }} />
  </Sequence>
);
// Image fixe avec lente poussée caméra vers le pupitre
const Still: React.FC<{ t: number; img: string; from: number; to: number; z0?: number; z1?: number; style?: React.CSSProperties }> = ({ t, img, from, to, z0 = 1, z1 = 1.12, style }) =>
  t >= from && t < to ? (
    <Img src={staticFile(`contest/${img}.jpg`)} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, objectFit: "cover", transform: `scale(${interpolate(t, [from, to], [z0, z1], clamp)})`, transformOrigin: "50% 45%", ...style }} />
  ) : null;
const Dim: React.FC<{ o?: number }> = ({ o = 0.18 }) => <AbsoluteFill style={{ backgroundColor: CHAR, opacity: o }} />;

// Carte nom du concurrent, posée sur le fauteuil
const NameCard: React.FC<{ t: number; at: number; nameAt: number; n: string; name: string; c: string }> = ({ t, at, nameAt, n, name, c }) => {
  const k = el(t, at, 13);
  return (
    <Folder x={L - (1 - k) * 1200} y={1110} w={RG - L} h={190} c={c} label={`CONTESTANT ${n}`} tabW={330} stroke={CHAR} rot={(1 - k) * -8}>
      <div style={{ position: "absolute", right: 34, top: 22, fontFamily: FONT, fontWeight: 800, fontSize: 28, letterSpacing: 4, color: ink(c), opacity: 0.6 }}>N°{n}</div>
      <Up t={t} at={nameAt} style={{ position: "absolute", left: 38, top: 50 }}>
        <Big size={name.length > 8 ? 92 : 118} color={ink(c)}>{name}</Big>
      </Up>
    </Folder>
  );
};

/* ---------- SCÈNE 0 — l'annonce ---------- */
const Intro: React.FC<{ t: number }> = ({ t }) => {
  const mic = el(t, s(2.3), 10);
  const cross = outE(t, s(3.0), 10);
  const flip = ease(t, s(3.86), 10);
  const chip = el(t, s(5.2), 9);
  const flash = interpolate(t, [s(5.25), s(5.25) + 3, s(5.25) + 12], [0, 0.7, 0], clamp);
  return (
    <>
      <Still t={t} img="vide" from={0} to={CUT[1] + 12} z0={1.25} z1={1.0} />
      <Dim o={0.25} />
      <div style={{ position: "absolute", top: 540, left: 0, right: 0, textAlign: "center", opacity: outE(t, 2, 10) }}>
        <Chip text={`${Math.floor(t / 15) % 2 ? "●" : "○"} LIVE · AI CONTEST`} c={RED} style={{ border: `5px solid ${CHAR}` }} />
      </div>
      {/* micro barré, qui se retourne en puce IA */}
      <div style={{ position: "absolute", left: 540 - 170, top: 680, width: 340, height: 340, borderRadius: 999, backgroundColor: flip < 1 ? BEIGE : CHAR, border: `8px solid ${CHAR}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${flip < 1 ? mic * (1 - flip) : chip}, ${flip < 1 ? mic : chip})` }}>
        {flip < 1 ? (
          <>
            <Mic c={CHAR} size={220} />
            <svg width={340} height={340} style={{ position: "absolute", left: -8, top: -8 }}>
              <path d="M70 270 L270 70" stroke={RED} strokeWidth={30} strokeLinecap="round" pathLength={1} strokeDasharray={`${cross} 1`} />
            </svg>
          </>
        ) : (
          <Chip3 size={250} t={t} />
        )}
      </div>
      <div style={{ position: "absolute", top: 1100, left: L, width: RG - L, textAlign: "center" }}>
        <Up t={t} at={s(3.86)}><Big size={124} color={BEIGE} style={{ display: "inline-block", backgroundColor: CHAR, padding: "6px 26px 12px", borderRadius: 20 }}>AI CONTEST</Big></Up>
      </div>
      <div style={{ position: "absolute", top: 1250, left: L, width: RG - L, textAlign: "center", transform: `scale(${el(t, s(5.32), 9)})` }}>
        <span style={{ display: "inline-block", backgroundColor: RED, border: `6px solid ${CHAR}`, borderRadius: 24, padding: "0 36px 8px" }}><MixedText text="أقوى ذكاء" size={84} color={BEIGE} /></span>
      </div>
      <AbsoluteFill style={{ backgroundColor: WHITE, opacity: flash }} />
    </>
  );
};

/* ---------- SCÈNE 1 — Nano Banana ---------- */
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[1];
  const vEnd = s(6.8) + 135;
  const decor = ease(t, s(12.0), 10);
  const back = ease(t, s(14.6), 10);
  const typed = Math.floor(interpolate(t, [s(17.3), s(18.2)], [0, 6], clamp));
  return (
    <>
      <Still t={t} img="vide" from={a - 12} to={s(6.8)} z0={1} z1={1.02} />
      <Clip at={s(6.8)} src={0.75} rate={0.5} dur={135} />
      <Still t={t} img="banana" from={vEnd} to={CUT[2] + 12} />
      {/* « تبدّل décor » : le plateau passe en affiche bicolore rouge/charbon */}
      {t >= s(12.0) && back < 1 ? (
        <AbsoluteFill style={{ clipPath: `inset(0 ${100 - decor * 100}% 0 ${back * 100}%)` }}>
          <Img src={staticFile("contest/banana.jpg")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, objectFit: "cover", filter: "grayscale(1) contrast(1.6) brightness(1.1)", transform: `scale(${interpolate(t, [vEnd, CUT[2]], [1, 1.12], clamp)})`, transformOrigin: "50% 45%" }} />
          <AbsoluteFill style={{ backgroundColor: RED, mixBlendMode: "multiply" }} />
        </AbsoluteFill>
      ) : null}
      <Dim o={0.12} />
      <Sticker t={t} at={s(10.3)} x={70} y={700} r={-8} text="VISUELS PRO" c={BEIGE} stroke={CHAR} />
      <Sticker t={t} at={s(12.08)} x={690} y={820} r={7} text="DÉCOR" c={RED} stroke={CHAR} />
      <Sticker t={t} at={s(13.32)} x={90} y={950} r={-5} text="IMAGES ✦" c={PINK} stroke={CHAR} />
      {t >= s(14.74) ? (
        <div style={{ position: "absolute", left: 660, top: 960, zIndex: 6, transform: `rotate(5deg) scale(${el(t, s(14.74), 9)})` }}>
          <span style={{ display: "inline-block", backgroundColor: CHAR, borderRadius: 18, padding: "0 24px 6px", border: `5px solid ${BEIGE}` }}><MixedText text="الإبداع" size={50} color={BEIGE} /></span>
        </div>
      ) : null}
      {t >= s(16.3) ? (
        <Box x={L} y={520} w={RG - L} h={110} c={WHITE} stroke={CHAR} r={999} style={{ transform: `scale(${el(t, s(16.3), 11)})`, display: "flex", alignItems: "center", padding: "0 36px", gap: 20, zIndex: 6 }}>
          <Spark size={54} c={RED} rot={t * 2} />
          <Big size={46} color={CHAR}>{"PROMPT".slice(0, typed)}<span style={{ color: RED, opacity: Math.floor(t / 8) % 2 }}>|</span></Big>
          <div style={{ marginLeft: "auto", width: 74, height: 74, borderRadius: 99, backgroundColor: typed >= 6 ? RED : PINK, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ico size={40}><path d="M5 12h13M13 6l6 6-6 6" stroke={BEIGE} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></Ico>
          </div>
        </Box>
      ) : null}
      <NameCard t={t} at={s(6.8)} nameAt={s(8.42)} n="01" name="NANO BANANA" c={RED} />
    </>
  );
};

/* ---------- SCÈNE 2 — ChatGPT ---------- */
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[2];
  const vEnd = s(18.86) + 98;
  const typing = t >= s(26.3) && t < s(28.2);
  const steps: [number, number, number, number, string, string][] = [
    [s(22.14), 640, 170, 120, "", BEIGE],
    [s(23.08), 780, 270, 110, "SCRIPT", PINK],
    [s(23.92), 910, 320, 110, "STRATÉGIE", RED],
  ];
  return (
    <>
      <Still t={t} img="vide" from={a - 12} to={s(18.86)} z0={1.05} z1={1} />
      <Clip at={s(18.86)} src={4.0} rate={0.4} dur={98} />
      <Still t={t} img="chatgpt" from={vEnd} to={CUT[3] + 12} />
      <Dim o={0.12} />
      {steps.map(([at, y, w, h, lb, c], i) => (
        <Box key={i} x={80} y={y} w={w} h={h} c={c} stroke={CHAR} style={{ transform: `translateX(${(1 - el(t, at, 11)) * -600}px)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {lb ? <Big size={46} color={ink(c)}>{lb}</Big> : <Bulb size={80} c={RED} />}
        </Box>
      ))}
      {t >= s(25.26) ? (
        <Folder x={L} y={480 + (1 - el(t, s(25.26), 11)) * -700} w={RG - L} h={110} c={BEIGE} label="PROJET" tabW={190}>
          <Big size={64} color={RED} style={{ position: "absolute", left: 36, top: 22 }}>PROJET COMPLET</Big>
        </Folder>
      ) : null}
      {t >= s(26.3) ? (
        <div style={{ position: "absolute", right: 80, top: 760, transform: `scale(${el(t, s(26.3), 10)})`, transformOrigin: "100% 50%" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, backgroundColor: BEIGE, border: `5px solid ${CHAR}`, borderRadius: 40, padding: "22px 30px" }}>
            {typing ? [0, 1, 2].map((i) => <div key={i} style={{ width: 22, height: 22, borderRadius: 99, backgroundColor: CHAR, transform: `translateY(${Math.sin((t - i * 4) / 3) * 6}px)` }} />) : <Big size={40} color={CHAR}>✓ SOLUTIONS</Big>}
          </div>
        </div>
      ) : null}
      {t >= s(26.76) ? <div style={{ position: "absolute", right: 90, top: 900, transform: `scale(${el(t, s(26.76), 8)}) rotate(6deg)` }}><span style={{ display: "inline-block", backgroundColor: RED, border: `5px solid ${CHAR}`, borderRadius: 999, padding: "0 26px 6px" }}><MixedText text="ديما حاضر" size={44} color={BEIGE} /></span></div> : null}
      <NameCard t={t} at={s(18.86)} nameAt={s(20.52)} n="02" name="CHATGPT" c={PINK} />
    </>
  );
};

/* ---------- SCÈNE 3 — Claude ---------- */
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[3];
  const vEnd = s(29.32) + 90;
  const stress = t >= s(33.3) && t < s(34.9) ? Math.sin(t * 2.3) * 7 : 0;
  const away = ease(t, s(34.88), 12);
  const code = Math.floor(interpolate(t, [s(35.8), s(37.2)], [0, 4], clamp));
  const flow = ease(t, s(36.4), 20);
  return (
    <>
      <Still t={t} img="vide" from={a - 12} to={s(29.32)} z0={1.05} z1={1} />
      <Clip at={s(29.32)} src={6.9} rate={0.5} dur={90} />
      <Still t={t} img="claude" from={vEnd} to={s(38.0)} />
      <Clip at={s(38.0)} src={8.4} rate={1} dur={CUT[4] + 12 - s(38.0)} />
      <Dim o={0.12} />
      {/* le temps perdu entre After Effects et Premiere */}
      {away < 1 ? (
        <>
          <Box x={80 - away * 600} y={650} w={210} h={210} c={CHAR} stroke={BEIGE} style={{ transform: `scale(${el(t, s(32.2), 10)})` }}>
            <svg width={198} height={198} style={{ position: "absolute", inset: 0 }}>
              <circle cx={99} cy={99} r={72} fill={BEIGE} />
              <path d="M99 99 L99 46" stroke={RED} strokeWidth={9} strokeLinecap="round" transform={`rotate(${t * 24} 99 99)`} />
              <path d="M99 99 L134 99" stroke={CHAR} strokeWidth={9} strokeLinecap="round" transform={`rotate(${t * 3} 99 99)`} />
            </svg>
          </Box>
          {[["Ae", PINK, 640, s(33.32)], ["Pr", RED, 870, s(33.98)]].map(([lb, c, y, at]) => (
            <Box key={lb as string} x={700 + away * 600} y={(y as number) - 10} w={210} h={200} c={c as string} stroke={CHAR} style={{ transform: `scale(${el(t, at as number, 9)}) rotate(${stress}deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Big size={110} color={CHAR}>{lb}</Big>
            </Box>
          ))}
        </>
      ) : null}
      {t >= s(35.6) ? (
        <>
          <Box x={70} y={650} w={320} h={250} c={CHAR} stroke={BEIGE} style={{ transform: `translateX(${(1 - el(t, s(35.6), 11)) * -600}px)` }}>
            <div style={{ position: "absolute", left: 24, top: 18, fontFamily: FONT, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: RED }}>SCRIPTS</div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ position: "absolute", left: 24 + (i % 2) * 26, top: 72 + i * 40, height: 16, borderRadius: 9, backgroundColor: i % 2 ? PINK : BEIGE, width: i < code ? [220, 160, 240, 130][i] : 0 }} />
            ))}
          </Box>
          <Box x={660} y={650} w={320} h={250} c={RED} stroke={CHAR} style={{ transform: `translateX(${(1 - el(t, s(36.3), 11)) * 600}px)` }}>
            <div style={{ position: "absolute", left: 24, top: 18, fontFamily: FONT, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: BEIGE }}>WORKFLOWS</div>
            <svg width={308} height={238} style={{ position: "absolute", inset: 0 }}>
              <path d="M56 160 C 110 160, 110 96, 156 96 S 210 176, 256 176" fill="none" stroke={BEIGE} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={`${flow} 1`} />
              {[[56, 160], [156, 96], [256, 176]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={22 * el(t, s(36.4) + i * 6, 9)} fill={i === 2 ? CHAR : BEIGE} />
              ))}
            </svg>
          </Box>
        </>
      ) : null}
      {t >= s(38.04) ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 500, display: "flex", justifyContent: "center", zIndex: 7, transform: `scale(${el(t, s(38.04), 8)}) rotate(-4deg)` }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 18, backgroundColor: RED, border: `6px solid ${CHAR}`, borderRadius: 26, padding: "4px 40px 10px" }}>
            <Spark size={60} c={BEIGE} rot={t * 4} />
            <MixedText text="ركّز على الإبداع" size={60} color={BEIGE} />
          </span>
        </div>
      ) : null}
      <NameCard t={t} at={s(29.32)} nameAt={s(31.04)} n="03" name="CLAUDE" c={BEIGE} />
    </>
  );
};

/* ---------- SCÈNE 4 — les trois concurrents ---------- */
// Recadrage du pupitre dans une image fixe (source 720×1280 : x 220→500, y 400→760)
const Podium: React.FC<{ img: string; w: number; h: number }> = ({ img, w, h }) => {
  const k = w / 280;
  return (
    <div style={{ width: w, height: h, overflow: "hidden", position: "relative", borderRadius: 16, border: `5px solid ${CHAR}` }}>
      <Img src={staticFile(`contest/${img}.jpg`)} style={{ position: "absolute", width: 720 * k, height: 1280 * k, left: -220 * k, top: -400 * k }} />
    </div>
  );
};
const Final: React.FC<{ t: number }> = ({ t }) => {
  const cards: [string[], string, string, string, string][] = [
    [["NANO", "BANANA"], RED, "01", "banana", "IMAGES"],
    [["CHAT", "GPT"], PINK, "02", "chatgpt", "IDÉES"],
    [["CLAUDE"], BEIGE, "03", "claude", "WORKFLOWS"],
  ];
  const ask = el(t, s(43.4), 10);
  return (
    <>
      <Still t={t} img="feu" from={CUT[4] - 12} to={CUT[5] + 12} z0={1.1} z1={1.0} />
      <Dim o={0.55} />
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, textAlign: "center" }}>
        <Up t={t} at={s(39.62)}><Big size={92} color={BEIGE}>3 COMPÉTITEURS</Big></Up>
      </div>
      {cards.map(([name, c, n, img, power], i) => {
        const k = el(t, s(39.62) + i * 8, 11);
        const bob = t >= s(43.4) ? Math.sin((t - i * 7) / 7) * 10 : 0;
        return (
          <Folder key={n} x={L + i * 280} y={470 + (1 - k) * 1300 + bob} w={250} h={540} c={c} label={n} tabW={110}>
            <div style={{ position: "absolute", left: 16, top: 16 }}><Podium img={img} w={218} h={250} /></div>
            {name.map((w, j) => (
              <Big key={w} size={name[0].length > 5 ? 44 : 52} color={ink(c)} style={{ position: "absolute", left: 20, top: 290 + j * 52 }}>{w}</Big>
            ))}
            <div style={{ position: "absolute", left: 18, right: 18, bottom: 22, transform: `scale(${el(t, s(41.32) + i * 9, 9)})` }}>
              <div style={{ backgroundColor: CHAR, color: BEIGE, fontFamily: FONT, fontWeight: 800, fontSize: 21, letterSpacing: 1, borderRadius: 999, padding: "10px 0", textAlign: "center" }}>{power}</div>
            </div>
          </Folder>
        );
      })}
      {t >= s(43.4) ? (
        <div style={{ position: "absolute", left: L, width: RG - L, top: 1100, textAlign: "center", transform: `scale(${ask})` }}>
          <span style={{ display: "inline-block", backgroundColor: RED, border: `6px solid ${BEIGE}`, borderRadius: 30, padding: "6px 44px 14px" }}>
            <MixedText text="وإنت، شكون تختار؟" size={74} color={BEIGE} />
          </span>
          <div style={{ marginTop: 22, opacity: outE(t, s(44.4), 10) }}><Chip text="COMMENTE 01 · 02 · 03" c={BEIGE} style={{ color: RED }} /></div>
        </div>
      ) : null}
    </>
  );
};

/* ---------- OUTRO — icône blanche sur rouge + Suivre / J'aime / Partager ---------- */
const ICONS = [
  { label: "Suivre", d: FOLLOW, fill: false },
  { label: "J'aime", d: HEART, fill: true },
  { label: "Partager", d: SHARE, fill: false },
];
const Outro: React.FC<{ t: number }> = ({ t }) => (
  <>
    <OutroIcon f={t - OUT} fg={WHITE} bg="transparent" size={460} cy={830} />
    <div style={{ position: "absolute", left: L, width: RG - L, top: 1150, display: "flex", justifyContent: "center", gap: 70 }}>
      {ICONS.map((ic, i) => {
        const at = OUT + 58 + i * 6;
        const k = el(t, at, 9);
        const tapAt = OUT + 88 + i * 14;
        const tap = interpolate(t, [tapAt - 4, tapAt, tapAt + 8], [1, 0.82, 1], clamp);
        const on = t >= tapAt;
        return (
          <div key={ic.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: t >= at ? 1 : 0, transform: `translateY(${(1 - k) * 120}px) scale(${k * tap})` }}>
            <div style={{ width: 150, height: 150, borderRadius: 999, border: `5px solid ${WHITE}`, backgroundColor: on ? WHITE : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={78} height={78} viewBox="0 0 24 24" fill={on && ic.fill ? RED : "none"} stroke={on ? RED : WHITE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={ic.d} /></svg>
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 34, color: WHITE }}>{ic.label}</div>
          </div>
        );
      })}
    </div>
  </>
);

/* ---------- Sous-titres synchronisés (mot à mot) ---------- */
const WORDS: [number, string][] = [
  [0.1, "اليوم..."], [1.18, "المنافسة"], [1.84, "موش"], [2.14, "على"], [2.46, "أحلى"], [2.96, "صوت..."],
  [3.86, "المنافسة"], [4.98, "على"], [5.32, "أقوى"], [5.74, "ذكاء!"],
  [6.8, "المتسابقة"], [7.56, "الأولى..."], [8.42, "Nano"], [8.85, "Banana!"],
  [9.72, "تحب"], [9.98, "تعمل"], [10.3, "visuels"], [10.72, "professionnels،"], [11.68, "تبدّل"], [12.08, "décor،"],
  [12.78, "وتخلق"], [13.32, "images"], [13.7, "من"], [13.86, "خيالك؟"],
  [14.74, "هو"], [14.98, "يتكفّل"], [15.48, "بالإبداع..."], [16.36, "وإنت"], [17.02, "عليك"], [17.34, "كان"], [17.52, "تعطيه"], [17.86, "الـ"], [17.98, "prompt!"],
  [18.86, "المتسابق"], [19.62, "الثاني..."], [20.52, "ChatGPT!"],
  [21.98, "من"], [22.14, "فكرة"], [22.46, "صغيرة،"], [23.08, "لسكريبت،"], [23.92, "stratégie"], [24.68, "ولا"], [24.94, "حتى"], [25.26, "مشروع"], [25.7, "كامل..."],
  [26.3, "تلقاه"], [26.76, "ديما"], [27.06, "حاضر"], [27.42, "باش"], [27.6, "يعاونك"], [28.06, "تلقى"], [28.28, "الحلول!"],
  [29.32, "والمتسابق"], [30.14, "الثالث..."], [31.04, "Claude!"],
  [31.94, "مازلت"], [32.32, "تضيع"], [32.64, "في"], [32.7, "الوقت"], [33.06, "بين"], [33.32, "After"], [33.6, "Effects"], [33.98, "و"], [34.1, "Premiere؟"],
  [34.88, "خلّيه"], [35.26, "يعاونك"], [35.66, "في"], [35.7, "الـ"], [35.84, "scripts"], [36.28, "والـ"], [36.44, "workflows..."],
  [37.3, "وإنت"], [38.04, "ركّز"], [38.46, "على"], [38.6, "الإبداع!"],
  [39.62, "ثلاثة"], [40.22, "منافسين..."], [41.32, "ثلاثة"], [42.0, "قوى"], [42.32, "مختلفة..."],
  [43.46, "وإنت،"], [44.28, "شكون"], [44.54, "تختار؟"],
];
const ARABIC = /[؀-ۿ]/;
type Tok = { at: number; text: string; latin: boolean };
// Regroupe les mots en phrases courtes ; les mots latins consécutifs forment un seul bloc (ordre de lecture correct en RTL)
const PHRASES: Tok[][] = (() => {
  const out: Tok[][] = [];
  let cur: Tok[] = [];
  WORDS.forEach(([at, text], i) => {
    const latin = !ARABIC.test(text);
    const last = cur[cur.length - 1];
    if (last && latin && last.latin) last.text += " " + text;
    else cur.push({ at: s(at), text, latin });
    const next = WORDS[i + 1];
    const gap = next ? next[0] - at : 9;
    if (/[.،؟!]$/.test(text) && !(latin && next && !ARABIC.test(next[1])) || cur.length >= 5 || gap > 1.2) {
      out.push(cur);
      cur = [];
    }
  });
  if (cur.length) out.push(cur);
  return out;
})();
const Captions: React.FC<{ t: number; dark: boolean }> = ({ t, dark }) => {
  let idx = -1;
  PHRASES.forEach((p, i) => { if (t >= p[0].at - 3) idx = i; });
  if (idx < 0) return null;
  const p = PHRASES[idx];
  const next = PHRASES[idx + 1];
  const endAt = next ? next[0].at - 3 : CUT[5];
  if (t > endAt) return null;
  const base = dark ? BEIGE : CHAR;
  return (
    <div dir="rtl" style={{ position: "absolute", left: L, width: RG - L, top: 1385, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 16px", zIndex: 15, backgroundColor: CHAR, borderRadius: 28, padding: "8px 20px 14px", boxSizing: "border-box" }}>
      {p.map((w, i) => {
        const nextAt = p[i + 1]?.at ?? endAt;
        const active = t >= w.at && t < nextAt;
        const shown = t >= w.at - 2;
        return (
          <div key={i} style={{ transform: `translateY(${shown ? 0 : 14}px) scale(${active ? 1.08 : 1})`, opacity: shown ? 1 : 0.18 }}>
            <MixedText text={w.text} size={52} color={active ? RED : base} latinColor={active ? RED : base} />
          </div>
        );
      })}
    </div>
  );
};

// Transition plate : trois bandes en biais (rouge, rose, puis la couleur du plan suivant) balaient l'écran
const Bars: React.FC<{ t: number; at: number; next: string }> = ({ t, at, next }) => {
  if (t < at - 14 || t > at + 16) return null;
  const cols = next === RED ? [CHAR, PINK, RED] : [RED, PINK, next];
  return (
    <>
      {cols.map((c, i) => {
        const inS = at - 12 + i * 2;
        const outS = at + i * 2;
        const x = t < at ? interpolate(t, [inS, inS + 8], [1200, -200], { ...clamp, easing: Easing.bezier(0.7, 0, 0.3, 1) }) : interpolate(t, [outS, outS + 10], [-200, -1700], { ...clamp, easing: Easing.bezier(0.7, 0, 0.3, 1) });
        return <div key={i} style={{ position: "absolute", top: -100, left: x, width: 1500, height: 2120, backgroundColor: c, transform: "skewX(-14deg)", zIndex: 30 + i }} />;
      })}
    </>
  );
};

type S = [string, number, number, number];
const SFX: S[] = [
  ["regard/drone.wav", 0, s(6.5), 0.5],
  ["regard/riser.wav", s(2.4), 40, 0.3],
  ["regard/glitch.wav", s(3.0), 8, 0.4],
  ["cc/whoosh.wav", s(3.8), 15, 0.5],
  ["ame/boom.wav", s(5.25), 60, 0.55],
  ["regard/sub.wav", s(5.25), 27, 0.5],
  ["cc/whoosh.wav", CUT[1] + 2, 15, 0.5],
  ["regard/snap.wav", s(8.42), 4, 0.6],
  ...[10.3, 12.08, 13.32].map((x) => ["cc/pop.wav", s(x), 6, 0.55] as S),
  ["cc/whoosh.wav", s(12.0), 15, 0.35],
  ["regard/glass.wav", s(13.3), 30, 0.3],
  ["cc/pop.wav", s(14.74), 6, 0.5],
  ["cc/typing.wav", s(17.3), 28, 0.4],
  ["cc/click.wav", s(18.0), 3, 0.7],
  ["cc/whoosh.wav", CUT[2] + 2, 15, 0.5],
  ["regard/snap.wav", s(20.52), 4, 0.6],
  ...[22.14, 23.08, 23.92].map((x) => ["cc/pop.wav", s(x), 6, 0.55] as S),
  ["ame/boom.wav", s(25.26), 50, 0.35],
  ["cc/typing.wav", s(26.3), 50, 0.3],
  ["cc/ding.wav", s(28.28), 30, 0.4],
  ["cc/whoosh.wav", CUT[3] + 2, 15, 0.5],
  ["regard/snap.wav", s(31.04), 4, 0.6],
  ["regard/ticktock.wav", s(32.2), 50, 0.45],
  ["cc/pop.wav", s(33.32), 6, 0.5],
  ["cc/pop.wav", s(33.98), 6, 0.5],
  ["cc/typing.wav", s(35.8), 40, 0.35],
  ...[0, 1, 2].map((i) => ["cc/click.wav", s(36.4) + i * 6, 3, 0.6] as S),
  ["ame/shimmer.wav", s(38.0), 50, 0.4],
  ["cc/whoosh.wav", CUT[4] + 2, 15, 0.5],
  ...[0, 1, 2].map((i) => ["ame/boom.wav", s(39.62) + i * 8, 30, 0.22] as S),
  ...[0, 1, 2].map((i) => ["cc/pop.wav", s(41.32) + i * 9, 6, 0.5] as S),
  ["regard/bell.wav", s(43.4), 50, 0.35],
  ["cc/whoosh.wav", OUT - 6, 15, 0.5],
  ["ame/shimmer.wav", OUT, 60, 0.35],
  ["ame/boom.wav", OUT + 62, 60, 0.4],
  ...[0, 1, 2].map((i) => ["cc/pop.wav", OUT + 58 + i * 6, 6, 0.45] as S),
  ...[0, 1, 2].map((i) => ["cc/click.wav", OUT + 88 + i * 14, 3, 0.6] as S),
];

const SCENES = [Intro, Scene1, Scene2, Scene3, Final, Outro];

export const AIContest: React.FC = () => {
  const t = useCurrentFrame();
  let i = 0;
  while (i < 5 && t >= CUT[i + 1]) i++;
  const bg = BGS[i];
  const dark = bg !== BEIGE;
  const Scene = SCENES[i];
  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
      <Scene t={t} />
      {i < 5 ? (
        <>
          <Captions t={t} dark={dark} />
          {/* icône Creofan pendant toute la vidéo */}
          <div style={{ position: "absolute", left: L, top: 236, display: "flex", alignItems: "center", gap: 16, zIndex: 20 }}>
            <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 62, height: 62 }} />
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 20, letterSpacing: 4, color: dark ? BEIGE : CHAR }}>AI CONTEST</div>
          </div>
        </>
      ) : null}
      {CUT.slice(1).map((c, k) => (
        <Bars key={c} t={t} at={c} next={BGS[k + 1]} />
      ))}
      <Audio src={staticFile("voice/voix-a.mp3")} />
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

// Couverture
export const CoverContest: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: CHAR, overflow: "hidden" }}>
    <Img src={staticFile("contest/vide.jpg")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, objectFit: "cover" }} />
    <AbsoluteFill style={{ backgroundColor: CHAR, opacity: 0.35 }} />
    <div style={{ position: "absolute", top: 520, left: 0, right: 0, textAlign: "center" }}><Chip text="● LIVE · AI CONTEST" c={RED} style={{ border: `5px solid ${CHAR}` }} /></div>
    {([["NANO", "BANANA"], ["CHAT", "GPT"], ["CLAUDE"]] as string[][]).map((name, i) => {
      const c = [RED, PINK, BEIGE][i];
      return (
        <Folder key={i} x={L + i * 280} y={650 + (i === 1 ? -30 : 0)} w={250} h={470} c={c} label={`0${i + 1}`} tabW={110} rot={(i - 1) * 4}>
          <div style={{ position: "absolute", left: 16, top: 16 }}><Podium img={["banana", "chatgpt", "claude"][i]} w={218} h={250} /></div>
          {name.map((w, j) => (
            <Big key={w} size={name[0].length > 5 ? 44 : 52} color={ink(c)} style={{ position: "absolute", left: 20, top: 290 + j * 52 }}>{w}</Big>
          ))}
        </Folder>
      );
    })}
    <div style={{ position: "absolute", top: 1230, left: L, width: RG - L, textAlign: "center" }}>
      <span style={{ display: "inline-block", backgroundColor: RED, border: `6px solid ${CHAR}`, borderRadius: 26, padding: "4px 40px 12px" }}><MixedText text="شكون أقوى ذكاء؟" size={80} color={BEIGE} /></span>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1420, display: "flex", justifyContent: "center" }}>
      <Img src={staticFile("logo-creofan-complet.png")} style={{ width: 240 }} />
    </div>
  </AbsoluteFill>
);
/* =====================================================================
   VERSION 2 — minimaliste « monde Creofan » : fond blanc, cartes bento
   arrondies sans contour, grands cercles rouges, plateau dans des fenêtres
   ===================================================================== */
const GAP = 18;
const W3 = (RG - L - 2 * GAP) / 3;
const R = 44;

// Tuile bento sans contour
const Tile: React.FC<{ x: number; y: number; w: number; h: number; c: string; k?: number; r?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, c, k = 1, r = R, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, backgroundColor: c, borderRadius: r, overflow: "hidden", transform: `translateY(${(1 - k) * 80}px) scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k * 1.4), ...style }}>{children}</div>
);
const Label: React.FC<{ c: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ c, children, style }) => (
  <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 22, letterSpacing: 3, color: c, opacity: 0.75, ...style }}>{children}</div>
);
// Icônes au trait fin
const Line: React.FC<{ d: string; c: string; size: number; w?: number }> = ({ d, c, size, w = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const I_IMAGE = "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15.5 9a1.5 1.5 0 1 0 0-.01";
const I_LAYERS = "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5";
const I_SPARK = "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18";
const I_BULB = "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z";
const I_DOC = "M6 3h9l3 3v15H6zM9 10h6M9 14h6M9 18h4";
const I_TARGET = "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01";
const I_CODE = "M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14";

// Fenêtre « cinéma » : la vidéo ou une image du plateau, cadrée sur le pupitre

// Bloc nom du concurrent (2/3) + grand numéro (1/3)
const NameRow: React.FC<{ t: number; at: number; nameAt: number; n: string; name: string; c: string; y?: number }> = ({ t, at, nameAt, n, name, c, y = 896 }) => (
  <>
    <Tile x={L} y={y} w={W3 * 2 + GAP} h={220} c={c} k={el(t, at, 14)}>
      <Label c={ink(c)} style={{ position: "absolute", left: 36, top: 30 }}>CONTESTANT {n}</Label>
      <Up t={t} at={nameAt} style={{ position: "absolute", left: 34, top: 82 }}>
        <Big size={name.length > 8 ? 60 : 92} color={ink(c)}>{name}</Big>
      </Up>
    </Tile>
    <Tile x={L + (W3 + GAP) * 2} y={y} w={W3} h={220} c={BEIGE} k={el(t, at + 4, 14)}>
      <Big size={150} color={RED} style={{ position: "absolute", right: 22, bottom: 10, letterSpacing: -10 }}>{n}</Big>
    </Tile>
  </>
);

/* ---------- SCÈNE 0 — l'annonce (vidéo plein écran, éléments minimalistes) ---------- */
// Petite tuile compétence posée à côté du pupitre
const Pad: React.FC<{ t: number; at: number; x: number; y: number; icon: string; text: string; c?: string; w?: number }> = ({ t, at, x, y, icon, text, c = WHITE, w = 270 }) => (
  <Tile x={x} y={y} w={w} h={150} c={c} k={el(t, at, 11)} r={34}>
    <div style={{ position: "absolute", left: 24, top: 20 }}><Line d={icon} c={c === RED || c === CHAR ? BEIGE : RED} size={48} w={1.8} /></div>
    <Big size={text.length > 9 ? 28 : 34} color={ink(c === WHITE ? BEIGE : c)} style={{ position: "absolute", left: 24, bottom: 22 }}>{text}</Big>
  </Tile>
);
const PADL = L;
const PADR = RG - 270;
const Pill: React.FC<{ t: number; at: number; text: string; c?: string; style?: React.CSSProperties }> = ({ t, at, text, c = RED, style }) =>
  t >= at ? (
    <div style={{ position: "absolute", transform: `scale(${el(t, at, 9)})`, ...style }}>
      <span style={{ display: "inline-block", backgroundColor: c, borderRadius: 999, padding: "0 30px 8px" }}><MixedText text={text} size={48} color={ink(c === WHITE ? BEIGE : c)} /></span>
    </div>
  ) : null;

const IntroV2: React.FC<{ t: number }> = ({ t }) => {
  const cross = outE(t, s(3.0), 10);
  const gone = ease(t, s(3.7), 10);
  const flash = interpolate(t, [s(5.25), s(5.25) + 3, s(5.25) + 12], [0, 0.6, 0], clamp);
  return (
    <>
      <Still t={t} img="vide" from={0} to={CUT[1] + 14} z0={1.25} z1={1.0} />
      <Dim o={0.25} />
      <div dir="rtl" style={{ position: "absolute", right: 1080 - RG, top: 560, textAlign: "right", opacity: 1 - gone, transform: `translateY(${-gone * 60}px)` }}>
        <Up t={t} at={2}><MixedText text="اليوم..." size={130} color={WHITE} /></Up>
        <Up t={t} at={s(1.18)}><MixedText text="المنافسة موش على" size={70} color={WHITE} /></Up>
        <div style={{ position: "relative", display: "inline-block" }}>
          <Up t={t} at={s(2.46)}><MixedText text="أحلى صوت" size={110} color={PINK} /></Up>
          <div style={{ position: "absolute", left: 0, right: 0, top: "52%", height: 12, borderRadius: 9, backgroundColor: RED, transformOrigin: "100% 50%", transform: `scaleX(${cross})` }} />
        </div>
      </div>
      <Tile x={L} y={620} w={RG - L} h={190} c={WHITE} k={el(t, s(3.86), 12)}>
        <Label c={CHAR} style={{ position: "absolute", left: 36, top: 28 }}>LIVE · CREOFAN</Label>
        <Big size={104} color={CHAR} style={{ position: "absolute", left: 34, bottom: 22 }}>AI CONTEST</Big>
        <div style={{ position: "absolute", right: 34, top: 30, width: 22, height: 22, borderRadius: 99, backgroundColor: RED, opacity: Math.floor(t / 15) % 2 ? 1 : 0.3 }} />
      </Tile>
      <NameRowFree t={t} at={s(5.25)} />
      <AbsoluteFill style={{ backgroundColor: WHITE, opacity: flash }} />
    </>
  );
};
const NameRowFree: React.FC<{ t: number; at: number }> = ({ t, at }) => (
  <>
    <Tile x={L} y={1100} w={W3 * 2 + GAP} h={220} c={RED} k={el(t, at, 12)}>
      <Label c={BEIGE} style={{ position: "absolute", left: 36, top: 30 }}>LA COMPÉTITION</Label>
      <div style={{ position: "absolute", right: 36, bottom: 22 }}><MixedText text="أقوى ذكاء" size={88} color={BEIGE} /></div>
    </Tile>
    <Tile x={L + (W3 + GAP) * 2} y={1100} w={W3} h={220} c={WHITE} k={el(t, at + 5, 12)}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 44, display: "flex", justifyContent: "center" }}><Line d={I_SPARK} c={RED} size={130} w={1.4} /></div>
    </Tile>
  </>
);

/* ---------- SCÈNE 1 — Nano Banana ---------- */
const Scene1V2: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[1];
  const v0 = s(6.8), vEnd = v0 + 135;
  const duo = t >= s(12.0) && t < s(14.6);
  const prompt = el(t, s(16.3), 13);
  const typed = Math.floor(interpolate(t, [s(17.3), s(18.2)], [0, 6], clamp));
  const fx = duo ? "grayscale(1) contrast(1.5) sepia(1) hue-rotate(-40deg) saturate(6)" : undefined;
  return (
    <>
      <Still t={t} img="vide" from={a - 14} to={v0} z0={1} z1={1.02} style={{ filter: fx }} />
      <Clip at={v0} src={0.75} rate={0.5} dur={135} />
      <Still t={t} img="banana" from={vEnd} to={CUT[2] + 14} style={{ filter: fx }} />
      <Dim o={0.1} />
      <Pad t={t} at={s(10.3)} x={PADL} y={620} icon={I_IMAGE} text="VISUELS PRO" />
      <Pad t={t} at={s(12.08)} x={PADR} y={720} icon={I_LAYERS} text="DÉCOR" c={RED} />
      <Pad t={t} at={s(13.32)} x={PADL} y={820} icon={I_SPARK} text="IMAGES" c={PINK} />
      <Pill t={t} at={s(14.74)} text="الإبداع ✦" style={{ left: PADR, top: 910 }} />
      {t >= s(16.3) ? (
        <Tile x={L} y={500} w={RG - L} h={120} c={WHITE} k={prompt} r={999}>
          <div style={{ position: "absolute", left: 34, top: 34 }}><Line d={I_SPARK} c={RED} size={52} w={2} /></div>
          <Big size={52} color={CHAR} style={{ position: "absolute", left: 110, top: 34 }}>{"PROMPT".slice(0, typed)}<span style={{ color: RED, opacity: Math.floor(t / 8) % 2 }}>|</span></Big>
          <div style={{ position: "absolute", right: 16, top: 16, width: 88, height: 88, borderRadius: 99, backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Line d="M5 12h13M13 6l6 6-6 6" c={BEIGE} size={46} w={2.4} />
          </div>
        </Tile>
      ) : null}
      <NameRow t={t} at={v0} nameAt={s(8.42)} n="01" name="NANO BANANA" c={RED} y={1100} />
    </>
  );
};

/* ---------- SCÈNE 2 — ChatGPT ---------- */
const Scene2V2: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[2];
  const v0 = s(18.86), vEnd = v0 + 98;
  const merge = ease(t, s(25.2), 14);
  const typing = t >= s(26.3) && t < s(28.2);
  return (
    <>
      <Still t={t} img="vide" from={a - 14} to={v0} z0={1.05} z1={1} />
      <Clip at={v0} src={4.0} rate={0.4} dur={98} />
      <Still t={t} img="chatgpt" from={vEnd} to={CUT[3] + 14} />
      <Dim o={0.1} />
      {merge < 1 ? (
        <div style={{ opacity: 1 - merge, transform: `translateY(${-merge * 200}px)` }}>
          <Pad t={t} at={s(22.14)} x={PADL} y={600} icon={I_BULB} text="IDÉE" />
          <Pad t={t} at={s(23.08)} x={PADL} y={768} icon={I_DOC} text="SCRIPT" c={PINK} />
          <Pad t={t} at={s(23.92)} x={PADL} y={936} icon={I_TARGET} text="STRATÉGIE" />
        </div>
      ) : null}
      {t >= s(25.2) ? (
        <Tile x={L} y={480} w={RG - L} h={150} c={RED} k={el(t, s(25.2), 12)}>
          <Label c={BEIGE} style={{ position: "absolute", left: 34, top: 24 }}>IDÉE → SCRIPT → STRATÉGIE</Label>
          <Big size={70} color={BEIGE} style={{ position: "absolute", left: 32, bottom: 22 }}>PROJET COMPLET</Big>
        </Tile>
      ) : null}
      {t >= s(26.3) ? (
        <Tile x={PADR} y={720} w={270} h={110} c={WHITE} k={el(t, s(26.3), 10)} r={999}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            {typing ? [0, 1, 2].map((i) => <div key={i} style={{ width: 20, height: 20, borderRadius: 99, backgroundColor: RED, transform: `translateY(${Math.sin((t - i * 4) / 3) * 6}px)` }} />) : <Big size={32} color={CHAR}>✓ SOLUTIONS</Big>}
          </div>
        </Tile>
      ) : null}
      <Pill t={t} at={s(26.76)} text="ديما حاضر" c={CHAR} style={{ left: PADR, top: 860 }} />
      <NameRow t={t} at={v0} nameAt={s(20.52)} n="02" name="CHATGPT" c={CHAR} y={1100} />
    </>
  );
};

/* ---------- SCÈNE 3 — Claude ---------- */
const Scene3V2: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[3];
  const v0 = s(29.32), vEnd = v0 + 90;
  const stress = t >= s(33.3) && t < s(34.9) ? Math.sin(t * 2.3) * 5 : 0;
  const swap = ease(t, s(34.88), 12);
  const code = Math.floor(interpolate(t, [s(35.8), s(37.2)], [0, 3], clamp));
  const flow = ease(t, s(36.4), 20);
  return (
    <>
      <Still t={t} img="vide" from={a - 14} to={v0} z0={1.05} z1={1} />
      <Clip at={v0} src={6.9} rate={0.5} dur={90} />
      <Still t={t} img="claude" from={vEnd} to={s(38.0)} />
      <Clip at={s(38.0)} src={8.4} rate={1} dur={CUT[4] + 14 - s(38.0)} />
      <Dim o={0.1} />
      {swap < 1 ? (
        <div style={{ opacity: 1 - swap }}>
          <Tile x={PADL} y={640} w={270} h={270} c={WHITE} k={el(t, s(32.2), 11)} r={34}>
            <svg width={270} height={270} style={{ position: "absolute", inset: 0 }}>
              <circle cx={135} cy={135} r={84} fill="none" stroke={RED} strokeWidth={4} />
              <path d="M135 135 L135 70" stroke={RED} strokeWidth={5} strokeLinecap="round" transform={`rotate(${t * 24} 135 135)`} />
              <path d="M135 135 L178 135" stroke={CHAR} strokeWidth={5} strokeLinecap="round" transform={`rotate(${t * 3} 135 135)`} />
            </svg>
          </Tile>
          {[["Ae", PINK, 620, s(33.32)], ["Pr", RED, 790, s(33.98)]].map(([lb, c, y, at]) => (
            <Tile key={lb as string} x={PADR} y={y as number} w={270} h={150} c={c as string} k={el(t, at as number, 9)} r={34} style={{ rotate: `${stress}deg` }}>
              <Big size={90} color={ink(c as string)} style={{ position: "absolute", left: 26, bottom: 18 }}>{lb}</Big>
            </Tile>
          ))}
        </div>
      ) : null}
      {t >= s(35.6) ? (
        <>
          <Tile x={PADL} y={640} w={300} h={250} c={CHAR} k={el(t, s(35.6), 11)} r={34}>
            <Label c={BEIGE} style={{ position: "absolute", left: 26, top: 24 }}>SCRIPTS</Label>
            <div style={{ position: "absolute", right: 22, top: 18 }}><Line d={I_CODE} c={RED} size={44} w={2} /></div>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ position: "absolute", left: 26 + (i % 2) * 24, top: 96 + i * 42, height: 14, borderRadius: 9, backgroundColor: i % 2 ? RED : BEIGE, width: i < code ? [220, 150, 190][i] : 0 }} />
            ))}
          </Tile>
          <Tile x={RG - 300} y={640} w={300} h={250} c={RED} k={el(t, s(36.3), 11)} r={34}>
            <Label c={BEIGE} style={{ position: "absolute", left: 26, top: 24 }}>WORKFLOWS</Label>
            <svg width={300} height={250} style={{ position: "absolute", inset: 0 }}>
              <path d="M50 190 C 100 190, 100 120, 150 120 S 200 200, 250 200" fill="none" stroke={BEIGE} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={`${flow} 1`} />
              {[[50, 190], [150, 120], [250, 200]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={17 * el(t, s(36.4) + i * 6, 9)} fill={i === 2 ? CHAR : BEIGE} />
              ))}
            </svg>
          </Tile>
        </>
      ) : null}
      {t >= s(38.04) ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 500, display: "flex", justifyContent: "center", transform: `scale(${el(t, s(38.04), 9)})` }}>
          <span style={{ display: "inline-block", backgroundColor: RED, borderRadius: 999, padding: "0 36px 10px" }}><MixedText text="ركّز على الإبداع ✦" size={58} color={BEIGE} /></span>
        </div>
      ) : null}
      <NameRow t={t} at={v0} nameAt={s(31.04)} n="03" name="CLAUDE" c={PINK} y={1100} />
    </>
  );
};

/* ---------- SCÈNE 4 — les trois concurrents ---------- */
const Crop: React.FC<{ img: string; w: number; h: number }> = ({ img, w, h }) => {
  const k = w / 260;
  return (
    <div style={{ width: w, height: h, overflow: "hidden", position: "relative" }}>
      <Img src={staticFile(`contest/${img}.jpg`)} style={{ position: "absolute", width: 720 * k, height: 1280 * k, left: -230 * k, top: -380 * k }} />
    </div>
  );
};
const FinalV2: React.FC<{ t: number }> = ({ t }) => {
  const cards: [string, string, string, string][] = [
    ["NANO BANANA", "01", "banana", "IMAGES"],
    ["CHATGPT", "02", "chatgpt", "IDÉES"],
    ["CLAUDE", "03", "claude", "WORKFLOWS"],
  ];
  const ask = el(t, s(43.4), 12);
  return (
    <>
      <Still t={t} img="feu" from={CUT[4] - 14} to={CUT[5] + 14} z0={1.1} z1={1.0} />
      <Dim o={0.5} />
      <div style={{ position: "absolute", left: L, top: 310 }}>
        <Up t={t} at={s(39.62)}><Label c={BEIGE}>AI CONTEST · LA FINALE</Label></Up>
        <Up t={t} at={s(39.7)} style={{ marginTop: 10 }}><Big size={96} color={WHITE}>3 COMPÉTITEURS</Big></Up>
      </div>
      {cards.map(([name, n, img, power], i) => {
        const k = el(t, s(39.62) + i * 7, 13);
        return (
          <Tile key={n} x={L + i * (W3 + GAP)} y={500} w={W3} h={600} c={i === 1 ? RED : WHITE} k={k}>
            <Crop img={img} w={W3} h={380} />
            <Label c={i === 1 ? BEIGE : CHAR} style={{ position: "absolute", left: 22, top: 400 }}>N°{n}</Label>
            <Big size={name.length > 8 ? 29 : 42} color={i === 1 ? WHITE : CHAR} style={{ position: "absolute", left: 22, top: 440 }}>{name}</Big>
            <div style={{ position: "absolute", left: 22, bottom: 24, transform: `scale(${el(t, s(41.32) + i * 9, 9)})`, transformOrigin: "0 50%" }}>
              <span style={{ display: "inline-block", backgroundColor: i === 1 ? WHITE : RED, color: i === 1 ? RED : BEIGE, fontFamily: FONT, fontWeight: 800, fontSize: 20, letterSpacing: 1, borderRadius: 999, padding: "8px 16px" }}>{power}</span>
            </div>
          </Tile>
        );
      })}
      {t >= s(43.4) ? (
        <div style={{ position: "absolute", left: L, width: RG - L, top: 1140, textAlign: "center", transform: `translateY(${(1 - ask) * 60}px)`, opacity: ask }}>
          <span style={{ display: "inline-block", backgroundColor: WHITE, borderRadius: 999, padding: "0 40px 12px" }}><MixedText text="وإنت، شكون تختار؟" size={74} color={CHAR} /></span>
          <div style={{ marginTop: 14, opacity: outE(t, s(44.4), 10) }}><Chip text="COMMENTE 01 · 02 · 03" c={RED} /></div>
        </div>
      ) : null}
    </>
  );
};

// Transition : un grand cercle rouge couvre l'écran, puis s'ouvre sur la scène suivante
const CircleWipe: React.FC<{ t: number; at: number; x: number; y: number }> = ({ t, at, x, y }) => {
  if (t < at - 12 || t > at + 12) return null;
  const e = Easing.bezier(0.7, 0, 0.3, 1);
  if (t < at) {
    const r = interpolate(t, [at - 12, at], [0, 2300], { ...clamp, easing: e });
    return <AbsoluteFill style={{ backgroundColor: RED, clipPath: `circle(${r}px at ${x}px ${y}px)`, zIndex: 40 }} />;
  }
  const r = interpolate(t, [at, at + 12], [0, 2300], { ...clamp, easing: e });
  return <AbsoluteFill style={{ backgroundColor: RED, zIndex: 40, WebkitMaskImage: `radial-gradient(circle at ${1080 - x}px ${1920 - y}px, transparent ${r}px, black ${r + 1}px)`, maskImage: `radial-gradient(circle at ${1080 - x}px ${1920 - y}px, transparent ${r}px, black ${r + 1}px)` }} />;
};

const CaptionsV2: React.FC<{ t: number }> = ({ t }) => {
  let idx = -1;
  PHRASES.forEach((p, i) => { if (t >= p[0].at - 3) idx = i; });
  if (idx < 0) return null;
  const p = PHRASES[idx];
  const next = PHRASES[idx + 1];
  const endAt = next ? next[0].at - 3 : CUT[5];
  if (t > endAt) return null;
  return (
    <div dir="rtl" style={{ position: "absolute", left: L, width: RG - L, top: 1385, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2px 14px", zIndex: 15, backgroundColor: WHITE, borderRadius: 36, padding: "10px 24px 16px", boxSizing: "border-box" }}>
      {p.map((w, i) => {
        const nextAt = p[i + 1]?.at ?? endAt;
        const active = t >= w.at && t < nextAt;
        const shown = t >= w.at - 2;
        return (
          <div key={i} style={{ opacity: shown ? 1 : 0.2, transform: `translateY(${shown ? 0 : 10}px)` }}>
            <MixedText text={w.text} size={48} color={active ? RED : CHAR} latinColor={active ? RED : CHAR} />
          </div>
        );
      })}
    </div>
  );
};

const SCENES2 = [IntroV2, Scene1V2, Scene2V2, Scene3V2, FinalV2, Outro];
const WIPE_AT: [number, number][] = [[900, 1500], [180, 400], [900, 1200], [540, 900], [540, 1700]];

export const AIContestV2: React.FC = () => {
  const t = useCurrentFrame();
  let i = 0;
  while (i < 5 && t >= CUT[i + 1]) i++;
  const Scene = SCENES2[i];
  return (
    <AbsoluteFill style={{ backgroundColor: i === 5 ? RED : CHAR, overflow: "hidden" }}>
      <Scene t={t} />
      {i < 5 ? (
        <>
          <CaptionsV2 t={t} />
          <div style={{ position: "absolute", left: L, top: 236, display: "flex", alignItems: "center", gap: 14, zIndex: 20, backgroundColor: WHITE, borderRadius: 999, padding: "8px 22px 8px 10px" }}>
            <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 50, height: 50 }} />
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 20, letterSpacing: 4, color: CHAR }}>AI CONTEST</div>
          </div>
        </>
      ) : null}
      {CUT.slice(1).map((c, k) => (
        <CircleWipe key={c} t={t} at={c} x={WIPE_AT[k][0]} y={WIPE_AT[k][1]} />
      ))}
      <Audio src={staticFile("voice/voix-a.mp3")} />
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

export const CoverContestV2: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: CHAR, overflow: "hidden" }}>
    <Img src={staticFile("contest/vide.jpg")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, objectFit: "cover" }} />
    <AbsoluteFill style={{ backgroundColor: CHAR, opacity: 0.35 }} />
    <div style={{ position: "absolute", left: L, top: 250, display: "flex", alignItems: "center", gap: 14, backgroundColor: WHITE, borderRadius: 999, padding: "8px 22px 8px 10px" }}>
      <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 50, height: 50 }} />
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 20, letterSpacing: 4, color: CHAR }}>AI CONTEST</div>
    </div>
    {(["banana", "chatgpt", "claude"] as const).map((img, i) => (
      <div key={img} style={{ position: "absolute", left: L + i * (W3 + GAP), top: 560, width: W3, height: 600, borderRadius: R, overflow: "hidden", backgroundColor: i === 1 ? RED : WHITE }}>
        <Crop img={img} w={W3} h={380} />
        <Label c={i === 1 ? BEIGE : CHAR} style={{ position: "absolute", left: 22, top: 400 }}>N°0{i + 1}</Label>
        <Big size={i === 0 ? 29 : 42} color={i === 1 ? WHITE : CHAR} style={{ position: "absolute", left: 22, top: 440 }}>{["NANO BANANA", "CHATGPT", "CLAUDE"][i]}</Big>
      </div>
    ))}
    <div style={{ position: "absolute", left: L, width: RG - L, top: 1200, textAlign: "center" }}>
      <span style={{ display: "inline-block", backgroundColor: RED, borderRadius: 999, padding: "0 44px 14px" }}><MixedText text="شكون أقوى ذكاء؟" size={84} color={WHITE} /></span>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1400, display: "flex", justifyContent: "center" }}>
      <div style={{ backgroundColor: WHITE, borderRadius: 999, padding: "16px 44px" }}><Img src={staticFile("ame/logo-creofan-rouge.png")} style={{ width: 200, display: "block" }} /></div>
    </div>
  </AbsoluteFill>
);
