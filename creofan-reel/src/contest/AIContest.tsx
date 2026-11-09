import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Loop, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
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
const BGS = [CHAR, BEIGE, CHAR, BEIGE, CHAR, RED];
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
const Banana: React.FC<{ size: number; c: string }> = ({ size, c }) => (
  <Ico size={size}><path d="M3.5 13.5c3 5.5 13 6 17-5.5.3-1 .1-2.2-.6-2.5-.6 3-3.5 6.4-8 6.6-3.6.2-6.4-1.2-8.4.4-.4.3-.3.7 0 1z" fill={c} /><path d="M19.6 5.6l.9-2" stroke={c} strokeWidth={1.6} strokeLinecap="round" /></Ico>
);
const Bubble: React.FC<{ size: number; c: string; dot?: string }> = ({ size, c, dot }) => (
  <Ico size={size}><path d="M3 4.5h18v11.5H9.5L4.5 20v-4H3z" fill={c} strokeLinejoin="round" />{dot ? [8, 12, 16].map((x) => <circle key={x} cx={x} cy={10.2} r={1.4} fill={dot} />) : null}</Ico>
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

/* ---------- SCÈNE 0 — l'annonce (sombre) ---------- */
const Intro: React.FC<{ t: number }> = ({ t }) => {
  const mic = el(t, s(2.3), 10);
  const cross = outE(t, s(3.0), 10);
  const flip = ease(t, s(3.86), 10);
  const chip = el(t, s(5.2), 9);
  const sway = Math.sin(t / 22) * 6;
  return (
    <>
      {/* projecteurs plats */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polygon points={`${180 + sway * 4},0 ${260 + sway * 4},0 ${680},1500 ${380},1500`} fill={PINK} opacity={0.14 * outE(t, 0, 20)} />
        <polygon points={`${820 - sway * 4},0 ${900 - sway * 4},0 ${700},1500 ${400},1500`} fill={RED} opacity={0.18 * outE(t, 6, 20)} />
        <ellipse cx={540} cy={1210} rx={360} ry={56} fill={RED} opacity={0.25} />
      </svg>
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, textAlign: "center", opacity: outE(t, 2, 10) }}>
        <Chip text={`${Math.floor(t / 15) % 2 ? "●" : "○"} LIVE · AI CONTEST`} c={RED} />
      </div>
      <div style={{ position: "absolute", top: 440, left: L, width: RG - L, textAlign: "center" }}>
        <Up t={t} at={s(3.86)}><Big size={124} color={BEIGE}>AI CONTEST</Big></Up>
      </div>
      {/* micro barré, puis il se retourne en puce IA */}
      <div style={{ position: "absolute", left: 540 - 200, top: 680, width: 400, height: 400, transform: `scale(${flip < 1 ? mic * (1 - flip) : chip}, ${flip < 1 ? mic : chip})` }}>
        {flip < 1 ? (
          <>
            <Mic c={BEIGE} size={400} />
            <svg width={400} height={400} style={{ position: "absolute", inset: 0 }}>
              <path d="M60 340 L340 60" stroke={RED} strokeWidth={30} strokeLinecap="round" pathLength={1} strokeDasharray={`${cross} 1`} />
            </svg>
          </>
        ) : (
          <Chip3 size={400} t={t} />
        )}
      </div>
      <div style={{ position: "absolute", top: 1130, left: L, width: RG - L, textAlign: "center", transform: `scale(${el(t, s(5.32), 9)})` }}>
        <MixedText text="أقوى ذكاء" size={96} color={RED} />
      </div>
    </>
  );
};

/* ---------- Carte « concurrent » commune ---------- */
const Contestant: React.FC<{ t: number; at: number; nameAt: number; n: string; name: string[]; c: string; stroke: string; icon: React.ReactNode }> = ({ t, at, nameAt, n, name, c, stroke, icon }) => {
  const k = el(t, at, 13);
  return (
    <Folder x={L - (1 - k) * 1200} y={320} w={RG - L} h={320} c={c} label={`CONTESTANT ${n}`} tabW={330} stroke={stroke} rot={(1 - k) * -8}>
      <div style={{ position: "absolute", left: 40, top: 30, fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: ink(c), opacity: 0.6 }}>N°{n}</div>
      {name.map((w, i) => (
        <Up key={w} t={t} at={nameAt + i * 4} style={{ position: "absolute", left: 40, top: 80 + i * 108 }}>
          <Big size={name.length > 1 ? 112 : name[0].length > 6 ? 108 : 140} color={i === 1 ? (c === RED ? CHAR : RED) : ink(c)}>{w}</Big>
        </Up>
      ))}
      <div style={{ position: "absolute", right: 34, top: 50, transform: `scale(${el(t, nameAt + 6, 8)}) rotate(${Math.sin(t / 10) * 6}deg)` }}>{icon}</div>
    </Folder>
  );
};

/* ---------- SCÈNE 1 — Nano Banana (clair) ---------- */
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[1];
  const panel = el(t, s(9.6), 12);
  const decor = ease(t, s(12.0), 12);
  const typed = Math.floor(interpolate(t, [s(17.3), s(18.2)], [0, 6], clamp));
  return (
    <>
      <Contestant t={t} at={a + 4} nameAt={s(8.42)} n="01" name={["NANO", "BANANA"]} c={RED} stroke={BEIGE} icon={<Banana size={190} c={BEIGE} />} />
      {/* le visuel qui change de décor */}
      <div style={{ position: "absolute", left: L, top: 730, width: RG - L, height: 430, transform: `translateY(${(1 - panel) * 1200}px)` }}>
        <Box x={0} y={0} w={RG - L} h={430} c={PINK} stroke={CHAR}>
          {/* décor 1 : montagnes et soleil */}
          <svg width={810} height={430} style={{ position: "absolute", inset: 0 }}>
            <circle cx={600} cy={130} r={70} fill={BEIGE} />
            <polygon points="0,430 230,170 420,430" fill={RED} />
            <polygon points="260,430 520,210 800,430" fill={CHAR} />
          </svg>
          {/* décor 2 : la ville rouge, qui balaie le premier */}
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - decor * 100}% 0 0)`, backgroundColor: RED }}>
            <svg width={810} height={430} style={{ position: "absolute", inset: 0 }}>
              <circle cx={200} cy={120} r={60} fill={PINK} />
              {[[40, 200], [170, 140], [300, 240], [430, 170], [560, 220], [680, 120]].map(([x, h], i) => (
                <rect key={i} x={x} y={430 - h - 40} width={110} height={h + 40} fill={i % 2 ? CHAR : BEIGE} />
              ))}
            </svg>
          </div>
          {/* étincelles « images de ton imagination » */}
          {t >= s(13.3) ? [[120, 60], [700, 320], [420, 40], [80, 330]].map(([x, y], i) => (
            <div key={i} style={{ position: "absolute", left: x, top: y, transform: `scale(${el(t, s(13.3) + i * 3, 8)})` }}><Spark size={70} c={i % 2 ? BEIGE : CHAR} rot={t * 3} /></div>
          )) : null}
        </Box>
      </div>
      <Sticker t={t} at={s(10.3)} x={60} y={700} r={-8} text="VISUELS PRO" c={CHAR} stroke={BEIGE} />
      <Sticker t={t} at={s(12.08)} x={660} y={760} r={7} text="DÉCOR" c={BEIGE} stroke={CHAR} />
      <Sticker t={t} at={s(13.32)} x={560} y={1100} r={-5} text="IMAGES ✦" c={CHAR} stroke={BEIGE} />
      {t >= s(14.74) ? (
        <div style={{ position: "absolute", left: 120, top: 1080, zIndex: 6, transform: `rotate(-4deg) scale(${el(t, s(14.74), 9)})` }}>
          <span style={{ display: "inline-block", backgroundColor: RED, borderRadius: 18, padding: "2px 26px", border: `5px solid ${BEIGE}` }}><MixedText text="الإبداع" size={50} color={BEIGE} /></span>
        </div>
      ) : null}
      {/* la barre de prompt */}
      {t >= s(16.3) ? (
        <Box x={L} y={1205} w={RG - L} h={110} c={WHITE} stroke={CHAR} r={999} style={{ transform: `scale(${el(t, s(16.3), 11)})`, display: "flex", alignItems: "center", padding: "0 36px", gap: 20 }}>
          <Spark size={54} c={RED} rot={t * 2} />
          <Big size={46} color={CHAR}>{"PROMPT".slice(0, typed)}<span style={{ color: RED, opacity: Math.floor(t / 8) % 2 }}>|</span></Big>
          <div style={{ marginLeft: "auto", width: 74, height: 74, borderRadius: 99, backgroundColor: typed >= 6 ? RED : PINK, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${t >= s(18.0) ? 1 + 0.15 * Math.sin(Math.min(1, (t - s(18.0)) / 8) * Math.PI) : 1})` }}>
            <Ico size={40}><path d="M5 12h13M13 6l6 6-6 6" stroke={BEIGE} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></Ico>
          </div>
        </Box>
      ) : null}
    </>
  );
};

/* ---------- SCÈNE 2 — ChatGPT (sombre) ---------- */
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[2];
  const steps: [number, number, number, number, number, string, string][] = [
    [s(22.14), 90, 740, 190, 150, "", PINK],
    [s(23.08), 310, 730, 270, 160, "SCRIPT", BEIGE],
    [s(23.92), 600, 720, 300, 170, "STRATÉGIE", PINK],
  ];
  const big = el(t, s(25.26), 11);
  const typing = t >= s(26.3) && t < s(28.2);
  return (
    <>
      <Contestant t={t} at={a + 4} nameAt={s(20.52)} n="02" name={["CHATGPT"]} c={PINK} stroke={CHAR} icon={<Bubble size={170} c={CHAR} dot={PINK} />} />
      {steps.map(([at, x, y, w, h, lb, c], i) => (
        <Box key={i} x={x} y={y} w={w} h={h} c={c} stroke={CHAR} style={{ transform: `scale(${el(t, at, 9)})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {lb ? <Big size={i === 2 ? 46 : 50} color={CHAR}>{lb}</Big> : <Bulb size={90} c={CHAR} />}
        </Box>
      ))}
      {[[283, 815], [583, 805]].map(([x, y], i) => (
        <div key={i} style={{ position: "absolute", left: x, top: y - 30, fontFamily: FONT, fontWeight: 800, fontSize: 50, color: BEIGE, opacity: outE(t, steps[i + 1][0] - 2, 8) }}>→</div>
      ))}
      {t >= s(25.26) ? (
        <Folder x={L} y={920 + (1 - big) * 900} w={RG - L} h={160} c={RED} label="PROJET" tabW={190}>
          <Big size={76} color={BEIGE} style={{ position: "absolute", left: 40, top: 38 }}>PROJET COMPLET</Big>
        </Folder>
      ) : null}
      {/* « toujours là pour t'aider » : bulle qui tape, puis la solution */}
      {t >= s(26.3) ? (
        <div style={{ position: "absolute", left: L, top: 1190, transform: `scale(${el(t, s(26.3), 10)})`, transformOrigin: "0 50%" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, backgroundColor: BEIGE, borderRadius: 40, padding: "22px 34px" }}>
            {typing ? [0, 1, 2].map((i) => <div key={i} style={{ width: 22, height: 22, borderRadius: 99, backgroundColor: CHAR, transform: `translateY(${Math.sin((t - i * 4) / 3) * 6}px)` }} />) : <Big size={44} color={CHAR}>✓ SOLUTIONS</Big>}
          </div>
        </div>
      ) : null}
      {t >= s(28.28) ? <div style={{ position: "absolute", left: 640, top: 1170, transform: `scale(${el(t, s(28.28), 8)}) rotate(8deg)` }}><Chip text="ديما حاضر" c={RED} style={{ fontFamily: "Salma, Poppins", fontSize: 40, padding: "4px 26px" }} /></div> : null}
    </>
  );
};

/* ---------- SCÈNE 3 — Claude (clair) ---------- */
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[3];
  const stress = t >= s(33.3) && t < s(34.9) ? Math.sin(t * 2.3) * 7 : 0;
  const calm = ease(t, s(34.88), 14);
  const code = Math.floor(interpolate(t, [s(35.8), s(37.2)], [0, 4], clamp));
  const flow = ease(t, s(36.4), 20);
  return (
    <>
      <Contestant t={t} at={a + 4} nameAt={s(31.04)} n="03" name={["CLAUDE"]} c={CHAR} stroke={BEIGE} icon={<Spark size={180} c={RED} rot={t * 1.5} />} />
      {/* le temps perdu entre les logiciels */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translateY(${-calm * 40}px) scale(${1 - calm * 0.12})`, transformOrigin: "50% 40%" }}>
        <Box x={L} y={720} w={240} h={240} c={CHAR} stroke={BEIGE} style={{ transform: `scale(${el(t, s(32.2), 10)})` }}>
          <svg width={228} height={228} style={{ position: "absolute", inset: 0 }}>
            <circle cx={114} cy={114} r={80} fill={BEIGE} />
            <path d={`M114 114 L114 ${114 - 58}`} stroke={RED} strokeWidth={9} strokeLinecap="round" transform={`rotate(${t * 24} 114 114)`} />
            <path d={`M114 114 L${114 + 40} 114`} stroke={CHAR} strokeWidth={9} strokeLinecap="round" transform={`rotate(${t * 3} 114 114)`} />
          </svg>
        </Box>
        {[["Ae", PINK, 370, s(33.32)], ["Pr", RED, 650, s(33.98)]].map(([lb, c, x, at]) => (
          <Box key={lb as string} x={x as number} y={720} w={250} h={240} c={c as string} stroke={CHAR} style={{ transform: `scale(${el(t, at as number, 9)}) rotate(${stress}deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Big size={120} color={CHAR}>{lb}</Big>
          </Box>
        ))}
      </div>
      {/* Claude prend les scripts et les workflows */}
      {t >= s(35.6) ? (
        <>
          <Box x={L} y={1010} w={390} h={290} c={CHAR} stroke={BEIGE} style={{ transform: `scale(${el(t, s(35.6), 11)})` }}>
            <div style={{ position: "absolute", left: 26, top: 20, fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: RED }}>SCRIPTS</div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ position: "absolute", left: 26 + (i % 2) * 30, top: 82 + i * 46, height: 18, borderRadius: 9, backgroundColor: i % 2 ? PINK : BEIGE, width: i < code ? [240, 180, 260, 140][i] : 0 }} />
            ))}
          </Box>
          <Box x={510} y={1010} w={390} h={290} c={RED} stroke={BEIGE} style={{ transform: `scale(${el(t, s(36.3), 11)})` }}>
            <div style={{ position: "absolute", left: 26, top: 20, fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: BEIGE }}>WORKFLOWS</div>
            <svg width={378} height={278} style={{ position: "absolute", inset: 0 }}>
              <path d="M70 180 C 130 180, 130 110, 190 110 S 250 200, 310 200" fill="none" stroke={BEIGE} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={`${flow} 1`} />
              {[[70, 180], [190, 110], [310, 200]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={26 * el(t, s(36.4) + i * 6, 9)} fill={i === 2 ? CHAR : BEIGE} />
              ))}
            </svg>
          </Box>
        </>
      ) : null}
      {t >= s(38.04) ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", zIndex: 7, transform: `scale(${el(t, s(38.04), 8)}) rotate(-4deg)` }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 18, backgroundColor: RED, border: `6px solid ${CHAR}`, borderRadius: 26, padding: "8px 40px" }}>
            <Spark size={60} c={BEIGE} rot={t * 4} />
            <MixedText text="ركّز على الإبداع" size={60} color={BEIGE} />
          </span>
        </div>
      ) : null}
    </>
  );
};

/* ---------- SCÈNE 4 — le podium final (sombre) ---------- */
const Final: React.FC<{ t: number }> = ({ t }) => {
  const cards: [string[], string, string, React.ReactNode, string][] = [
    [["NANO", "BANANA"], RED, "01", <Banana key="b" size={110} c={BEIGE} />, "IMAGES"],
    [["CHAT", "GPT"], PINK, "02", <Bubble key="c" size={110} c={CHAR} dot={PINK} />, "IDÉES"],
    [["CLAUDE"], BEIGE, "03", <Spark key="s" size={110} c={RED} />, "WORKFLOWS"],
  ];
  const ask = el(t, s(43.4), 10);
  return (
    <>
      <div style={{ position: "absolute", top: 320, left: 0, right: 0, textAlign: "center" }}>
        <Up t={t} at={s(39.62)}><Big size={92} color={BEIGE}>3 COMPÉTITEURS</Big></Up>
      </div>
      {cards.map(([name, c, n, icon, power], i) => {
        const k = el(t, s(39.62) + i * 8, 11);
        const bob = t >= s(43.4) ? Math.sin((t - i * 7) / 7) * 10 : 0;
        return (
          <Folder key={n} x={L + i * 280} y={480 + (1 - k) * 1300 + bob} w={250} h={520} c={c} label={n} tabW={110}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 40, display: "flex", justifyContent: "center" }}>{icon}</div>
            {name.map((w, j) => (
              <Big key={w} size={name[0].length > 5 ? 44 : 52} color={ink(c)} style={{ position: "absolute", left: 22, top: 190 + j * 54 }}>{w}</Big>
            ))}
            <div style={{ position: "absolute", left: 18, right: 18, bottom: 26, transform: `scale(${el(t, s(41.32) + i * 9, 9)})` }}>
              <div style={{ backgroundColor: CHAR, color: BEIGE, fontFamily: FONT, fontWeight: 800, fontSize: 21, letterSpacing: 1, borderRadius: 999, padding: "10px 0", textAlign: "center" }}>{power}</div>
            </div>
          </Folder>
        );
      })}
      {t >= s(43.4) ? (
        <div style={{ position: "absolute", left: L, width: RG - L, top: 1090, textAlign: "center", transform: `scale(${ask})` }}>
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
    <div dir="rtl" style={{ position: "absolute", left: L, width: RG - L, top: 1385, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 16px", zIndex: 15 }}>
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
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <polygon points="200,0 280,0 700,1500 380,1500" fill={PINK} opacity={0.14} />
      <polygon points="800,0 880,0 700,1500 400,1500" fill={RED} opacity={0.18} />
    </svg>
    <div style={{ position: "absolute", top: 330, left: 0, right: 0, textAlign: "center" }}><Chip text="● LIVE · AI CONTEST" c={RED} /></div>
    <div style={{ position: "absolute", top: 430, left: L, width: RG - L, textAlign: "center" }}><MixedText text="شكون أقوى ذكاء؟" size={100} color={BEIGE} /></div>
    {([[["NANO", "BANANA"], RED, "01", <Banana key="b" size={110} c={BEIGE} />], [["CHAT", "GPT"], PINK, "02", <Bubble key="c" size={110} c={CHAR} dot={PINK} />], [["CLAUDE"], BEIGE, "03", <Spark key="s" size={110} c={RED} />]] as [string[], string, string, React.ReactNode][]).map(([name, c, n, icon], i) => (
      <Folder key={n} x={L + i * 280} y={640 + (i === 1 ? -30 : 0)} w={250} h={460} c={c} label={n} tabW={110} rot={(i - 1) * 4}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 40, display: "flex", justifyContent: "center" }}>{icon}</div>
        {name.map((w, j) => (
          <Big key={w} size={name[0].length > 5 ? 44 : 52} color={ink(c)} style={{ position: "absolute", left: 22, top: 190 + j * 54 }}>{w}</Big>
        ))}
      </Folder>
    ))}
    <div style={{ position: "absolute", top: 1240, left: 0, right: 0, textAlign: "center" }}><Big size={120} color={RED}>VS</Big></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1420, display: "flex", justifyContent: "center" }}>
      <Img src={staticFile("logo-creofan-complet.png")} style={{ width: 240 }} />
    </div>
  </AbsoluteFill>
);
