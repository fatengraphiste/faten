import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Loop, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { MixedText } from "../components";
import { OutroIcon, OUTRO_ICON_DURATION } from "../outro/OutroIcon";
import { Arrow, BEIGE, CHAR, Folder, FONT, ink, Lines, PINK, RED, T } from "./Storyboard";

// CREOFAN — CREATIVE AI MASTERCLASS · Reel 1080×1920, 30 i/s
// Voix : partie 1 (0 → 23,2 s) puis partie 2 à 23,5 s. Repères posés sur les silences de la voix.
const FPS = 30;
const P2 = Math.round(23.5 * FPS);
const s = (sec: number) => Math.round(sec * FPS);
// Débuts des plans (fond clair / sombre en alternance), puis l'outro
const CUT = [0, 120, 198, 438, 552, 702, 852, 987, 1155];
const OUT = CUT[8];
export const MC_DURATION = OUT + OUTRO_ICON_DURATION;
const LIGHT = (i: number) => i % 2 === 0;
const L = 90;
const RG = 900;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number, a: number, d: number, e = Easing.bezier(0.65, 0, 0.35, 1)) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: e });
const outE = (t: number, a: number, d: number) => ease(t, a, d, Easing.bezier(0.16, 1, 0.3, 1));
const el = (t: number, a: number, damping = 12) => (t < a ? 0 : spring({ frame: t - a, fps: FPS, config: { damping, stiffness: 170, mass: 0.8 } }));

// Texte qui monte derrière un masque
const Up: React.FC<{ t: number; at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, at, children, style }) => (
  <div style={{ overflow: "hidden", ...style }}>
    <div style={{ transform: `translateY(${(1 - outE(t, at, 14)) * 110}%)` }}>{children}</div>
  </div>
);
const Center: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ top, children, style }) => (
  <div style={{ position: "absolute", top, left: L, width: RG - L, textAlign: "center", ...style }}>{children}</div>
);
const Chip: React.FC<{ text: string; c: string; style?: React.CSSProperties }> = ({ text, c, style }) => (
  <span style={{ display: "inline-block", backgroundColor: c, color: ink(c), fontFamily: FONT, fontWeight: 800, fontSize: 28, letterSpacing: 3, padding: "10px 30px", borderRadius: 999, ...style }}>{text}</span>
);
const Big: React.FC<{ size: number; color: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color, children, style }) => (
  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 0.95, letterSpacing: -size * 0.035, color, whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Card: React.FC<{ x: number; y: number; w: number; h: number; c: string; stroke: string; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, c, stroke, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, backgroundColor: c, border: `6px solid ${stroke}`, borderRadius: 26, overflow: "hidden", ...style }}>{children}</div>
);

/* ---------- PLAN 01 — trop d'informations (clair) ---------- */
type F = [string, string, number, number, number, number, "l" | "r" | "b"];
const P1F: F[] = [
  ["SKILLS", RED, 50, 590, -8, 12, "l"],
  ["PROMPTS", CHAR, 430, 560, 6, 36, "r"],
  ["COMMANDS", PINK, 140, 730, 3, 54, "b"],
  ["AI TOOLS", RED, 450, 830, -5, 70, "r"],
  ["TUTORIALS", CHAR, 40, 960, -3, 80, "l"],
  ["WORKFLOWS", PINK, 440, 1070, 5, 88, "r"],
  ["TECHNIQUES", RED, 60, 1180, 4, 94, "l"],
  ["REELS", CHAR, 300, 1250, -2, 99, "b"],
];
const Plan1: React.FC<{ t: number }> = ({ t }) => {
  const zoom = 1 + ease(t, 0, 120) * 0.05;
  return (
    <>
      <Center top={318}>
        <Up t={t} at={2}><MixedText text="لمّيت Skills، Prompts، Commandes" size={42} color={CHAR} latinColor={RED} /></Up>
      </Center>
      <Center top={398}>
        <Up t={t} at={78}><MixedText text="وتفرّجت في Reels..." size={66} color={RED} latinColor={RED} /></Up>
      </Center>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        {P1F.map(([lb, c, x, y, r, at, from], i) => {
          const k = el(t, at, 13);
          const dx = from === "l" ? -1200 : from === "r" ? 1200 : 0;
          const dy = from === "b" ? 1400 : 0;
          return t >= at ? (
            <Folder key={lb} x={x + (1 - k) * dx} y={y + (1 - k) * dy} w={500} h={230} c={c} label={lb} rot={r + (1 - k) * (from === "l" ? -25 : 25)} stroke={BEIGE} num={`${String(i + 1).padStart(2, "0")} / 08`}>
              <Lines c={c} n={3} seed={i + 2} />
            </Folder>
          ) : null;
        })}
      </AbsoluteFill>
    </>
  );
};

/* ---------- PLAN 02 — le problème (sombre) ---------- */
const Plan2: React.FC<{ t: number }> = ({ t }) => {
  const shake = t < CUT[1] + 10 ? Math.sin(t * 2.7) * (CUT[1] + 10 - t) * 2.2 : 0;
  const drift = ease(t, CUT[1] + 8, 60);
  const big = el(t, 165, 11);
  const q = outE(t, 173, 16);
  return (
    <>
      <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
        {P1F.slice(0, 7).map(([lb, c, x, y, r], i) => {
          const cx = x + 250 - 540, cy = y + 140 - 1000;
          const n = Math.hypot(cx, cy) || 1;
          const fl = Math.sin(t / 16 + i * 1.7) * 12;
          return (
            <Folder key={lb} x={x + (cx / n) * drift * 260} y={Math.max(470, y + (cy / n) * drift * 260) + fl} w={500} h={230} c={c === CHAR ? BEIGE : c} label={lb} rot={r + drift * (i % 2 ? 14 : -14)} style={{ opacity: 1 - drift * 0.35, scale: `${1 - drift * 0.25}` }}>
              <Lines c={c === CHAR ? BEIGE : c} n={3} seed={i + 2} />
            </Folder>
          );
        })}
      </AbsoluteFill>
      <Center top={318}>
        <Up t={t} at={126}><MixedText text="أما كي تجي تخدم وحدك..." size={62} color={BEIGE} /></Up>
      </Center>
      {t >= 165 ? (
        <Folder x={L + 20} y={720 + (1 - big) * 1100} w={770} h={430} c={BEIGE} label="?" tabW={160} rot={-2} num="ERROR 404">
          <div style={{ position: "absolute", left: 44, top: 46, transform: `scale(${1.5 - q * 0.5})`, transformOrigin: "0 0", opacity: q }}>
            <Big size={112} color={RED}>WHERE DO</Big>
            <Big size={112} color={CHAR}>I START?</Big>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, textAlign: "center", opacity: q }}>
            <MixedText text="منين تبدأ؟" size={66} color={RED} />
          </div>
        </Folder>
      ) : null}
      {[[800, 640, 14, 176, 150], [110, 1300, -16, 180, 120], [760, 1290, 8, 184, 100]].map(([x, y, r, at, sz], i) => (
        <div key={i} style={{ position: "absolute", left: x, top: y, fontFamily: FONT, fontWeight: 800, fontSize: sz, lineHeight: 1, color: i === 1 ? BEIGE : PINK, transform: `rotate(${r}deg) scale(${el(t, at, 8)})` }}>?</div>
      ))}
    </>
  );
};

/* ---------- PLAN 03 — la solution (clair) ---------- */
const Plan3: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[2];
  const title = el(t, a + 5, 11);
  const lift = ease(t, 250, 18);
  const align = ease(t, a + 14, 30);
  const out = ease(t, 282, 16);
  const main = el(t, 258, 13);
  const deploy = outE(t, 358, 22);
  const line = ease(t, 388, 30);
  const mess: [string, string, number, number, number][] = [
    ["PROMPT", RED, 60, 700, -16],
    ["TOOL", CHAR, 640, 760, 14],
    ["IDEA", PINK, 120, 1180, 10],
    ["REEL", RED, 620, 1230, -12],
    ["SKILL", CHAR, 380, 980, 6],
  ];
  return (
    <>
      <Center top={interpolate(lift, [0, 1], [820, 318])} style={{ transform: `scale(${(0.4 + title * 0.6) * (1 - lift * 0.25)})` }}>
        <MixedText text="الحل في الـ pratique!" size={84} color={CHAR} latinColor={RED} style={{ whiteSpace: "nowrap" }} />
      </Center>
      {/* le désordre se range en une ligne, puis sort */}
      {lift < 1 || out < 1
        ? mess.map(([lb, c, x, y, r], i) => {
            const tx = L + i * 166, ty = 1300;
            return (
              <Folder key={lb} x={interpolate(align, [0, 1], [x, tx])} y={interpolate(align, [0, 1], [y, ty]) + out * 600} w={180} h={90} c={c} label={lb} tabW={130} rot={r * (1 - align)} stroke={BEIGE} />
            );
          })
        : null}
      {/* les deux ateliers se déploient derrière */}
      {t >= 358
        ? [
            ["ATELIER 01", PINK, L, "CANVA + CLAUDE"],
            ["ATELIER 02", CHAR, 510, "AI MOTION DESIGN"],
          ].map(([lb, c, x, sub], i) => (
            <Folder key={lb as string} x={x as number} y={interpolate(deploy, [0, 1], [640, 990])} w={390} h={250} c={c as string} label={lb as string} tabW={200} stroke={BEIGE} rot={(i ? 1 : -1) * 2 * deploy}>
              <div style={{ position: "absolute", left: 30, top: 34, fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1, color: ink(c as string) }}>0{i + 1}</div>
              <div style={{ position: "absolute", left: 30, top: 120, fontFamily: FONT, fontWeight: 800, fontSize: 32, lineHeight: 1.1, color: i ? RED : CHAR, width: 330 }}>{sub}</div>
            </Folder>
          ))
        : null}
      {t >= 258 ? (
        <Folder x={L} y={520 + (1 - main) * 1300} w={RG - L} h={400} c={RED} label="CREOFAN" tabW={240} stroke={BEIGE}>
          <Up t={t} at={300} style={{ position: "absolute", left: 44, top: 50 }}><Big size={124} color={BEIGE}>CREATIVE AI</Big></Up>
          <Up t={t} at={314} style={{ position: "absolute", left: 44, top: 172 }}><Big size={112} color={CHAR}>MASTERCLASS</Big></Up>
          <div style={{ position: "absolute", left: 44, top: 310, opacity: outE(t, 360, 12) }}>
            <MixedText text="فيها Deux Ateliers" size={44} color={BEIGE} latinColor={BEIGE} />
          </div>
        </Folder>
      ) : null}
      {/* la ligne de suivi qui relie les deux ateliers */}
      {t >= 388 ? (
        <>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <path d="M285 1310 C 285 1420, 705 1420, 705 1310" fill="none" stroke={RED} strokeWidth={8} strokeLinecap="round" strokeDasharray="1 22" pathLength={1000} strokeDashoffset={0} style={{ clipPath: `inset(0 ${100 - line * 100}% 0 0)` }} />
            {[0.1, 0.5, 0.9].map((p, i) => (
              <circle key={i} cx={285 + 420 * p} cy={1310 + Math.sin(Math.PI * p) * 82} r={16 * el(t, 392 + i * 8, 9)} fill={RED} />
            ))}
          </svg>
          <Center top={1430} style={{ transform: `scale(${el(t, 396, 10)})` }}>
            <span style={{ display: "inline-block", backgroundColor: CHAR, borderRadius: 999, padding: "4px 34px" }}>
              <MixedText text="suivi خطوة بخطوة" size={44} color={BEIGE} latinColor={PINK} />
            </span>
          </Center>
        </>
      ) : null}
    </>
  );
};

/* ---------- PLAN 04 — atelier 01 (sombre) ---------- */
const Plan4: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[3];
  const fold = el(t, a + 2, 12);
  const open = ease(t, a + 14, 14);
  const idea = outE(t, a + 18, 18);
  const arr = ease(t, 466, 16);
  const canvas = el(t, 505, 14);
  return (
    <>
      <Center top={318} style={{ transform: `scale(${el(t, a + 2, 10)})` }}><Chip text="ATELIER 01 — CANVA + CLAUDE" c={PINK} /></Center>
      {/* les deux cartes outils */}
      {[["CLAUDE", BEIGE, 120, 466], ["CANVA", RED, 600, 474]].map(([lb, c, x, at]) => (
        <Card key={lb as string} x={x as number} y={540} w={300} h={170} c={c as string} stroke={CHAR} style={{ transform: `scale(${el(t, at as number, 10)})` }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Big size={58} color={ink(c as string)}>{lb}</Big></div>
        </Card>
      ))}
      {t >= 466 ? <div style={{ position: "absolute", left: 470, top: 580, fontFamily: FONT, fontWeight: 800, fontSize: 80, color: PINK, transform: `scale(${el(t, 470, 9)})` }}>+</div> : null}
      {t >= 466 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, clipPath: `inset(${(1 - arr) * 100}% 0 0 0)` }}>
          {[[270, 720], [750, 720]].map(([x, y], i) => (
            <g key={i}>
              <path d={`M540 830 C 540 780, ${x} 800, ${x} ${y + 14}`} fill="none" stroke={BEIGE} strokeWidth={7} strokeLinecap="round" />
              <path d="M-18 -14 L4 0 L-18 14" fill="none" stroke={BEIGE} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${x} ${y + 10}) rotate(-90)`} />
            </g>
          ))}
        </svg>
      ) : null}
      {/* le dossier qui s'ouvre, l'idée qui en sort */}
      <AbsoluteFill style={{ transform: `translateY(${(1 - fold) * 1300}px)` }}>
        <Folder x={220} y={1010} w={640} h={330} c={PINK} label="ATELIER 01" tabW={240} />
        <Card x={400} y={interpolate(idea, [0, 1], [1220, 840])} w={280} h={170} c={RED} stroke={CHAR}>
          <div style={{ position: "absolute", left: 26, top: 30, width: 62, height: 62, borderRadius: 99, border: `8px solid ${BEIGE}` }} />
          <div style={{ position: "absolute", left: 44, top: 98, width: 26, height: 20, borderRadius: 6, backgroundColor: BEIGE }} />
          <div style={{ position: "absolute", left: 110, top: 46 }}><Big size={60} color={BEIGE}>IDEA</Big></div>
        </Card>
        <div style={{ position: "absolute", left: 220, top: 1010 + T + 110, width: 640, height: 220, perspective: 900 }}>
          <div style={{ width: "100%", height: "100%", backgroundColor: BEIGE, border: `6px solid ${CHAR}`, borderRadius: 26, transformOrigin: "50% 100%", transform: `rotateX(${open * 58}deg)` }}>
            <Lines c={BEIGE} n={3} w={400} y={40} />
          </div>
        </div>
      </AbsoluteFill>
      <Center top={1440}>
        <Up t={t} at={501}><MixedText text="من الفكرة حتى للتصميم" size={62} color={BEIGE} /></Up>
      </Center>
      {/* le design final prend toute la place */}
      {t >= 505 ? (
        <div style={{ position: "absolute", left: 170, top: 470, width: 740, height: 930, transform: `scale(${0.25 + canvas * 0.75}) rotate(${(1 - canvas) * -12}deg)`, transformOrigin: "50% 60%", backgroundColor: PINK, border: `8px solid ${CHAR}`, borderRadius: 30, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 330, top: -110, width: 560, height: 560, borderRadius: 999, backgroundColor: RED, transform: `scale(${el(t, 512, 10)})` }} />
          <div style={{ position: "absolute", left: -90, top: 560, width: 360, height: 360, backgroundColor: BEIGE, transform: `rotate(45deg) scale(${el(t, 518, 10)})` }} />
          <div style={{ position: "absolute", left: 50, top: 120 }}>
            <Up t={t} at={522}><Big size={130} color={CHAR}>BIG</Big></Up>
            <Up t={t} at={526}><Big size={130} color={CHAR}>IDEAS</Big></Up>
            <Up t={t} at={530}><Big size={130} color={BEIGE}>ONLY.</Big></Up>
          </div>
          <div style={{ position: "absolute", left: 50, right: 50, bottom: 60, height: 110, borderRadius: 999, backgroundColor: CHAR, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${el(t, 536, 10)})` }}>
            <Big size={42} color={BEIGE}>FINAL DESIGN ✦</Big>
          </div>
        </div>
      ) : null}
    </>
  );
};

/* ---------- PLAN 05 — atelier 02 (clair) ---------- */
const Plan5: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[4];
  const card = el(t, a + 8, 11);
  const split = outE(t, 585, 26);
  const head = interpolate(t, [600, 695], [0, 1], clamp);
  const fin = el(t, 652, 12);
  const arr = ease(t, 640, 12);
  return (
    <>
      <Center top={318} style={{ transform: `scale(${el(t, a + 2, 10)})` }}><Chip text="ATELIER 02 — AI MOTION DESIGN" c={RED} /></Center>
      <Center top={400}>
        <Up t={t} at={620}><MixedText text="كيفاش تحوّل تصاميمك فيديو موشن" size={54} color={CHAR} latinColor={RED} /></Up>
      </Center>
      {/* la carte statique se duplique en images successives */}
      {[0, 1, 2, 3].map((i) => {
        const x = interpolate(split, [0, 1], [400, 110 + i * 200]);
        const w = interpolate(split, [0, 1], [280, 180]);
        const h = interpolate(split, [0, 1], [340, 240]);
        const phase = split * i;
        return (
          <Card key={i} x={x} y={560} w={w} h={h} c={CHAR} stroke={BEIGE} style={{ transform: `scale(${card})`, zIndex: 4 - i }}>
            <div style={{ position: "absolute", left: `${12 + phase * 18}%`, top: `${45 - phase * 10}%`, width: "34%", aspectRatio: "1", borderRadius: 999, backgroundColor: RED }} />
            <div style={{ position: "absolute", left: "12%", bottom: "14%", height: "7%", borderRadius: 99, width: `${30 + phase * 14}%`, backgroundColor: PINK }} />
            <div style={{ position: "absolute", right: "8%", top: "7%", fontFamily: FONT, fontWeight: 800, fontSize: 18, color: BEIGE, opacity: split }}>F0{i + 1}</div>
          </Card>
        );
      })}
      {/* timeline */}
      <div style={{ position: "absolute", left: 110, top: 840, width: 780, height: 10, borderRadius: 9, backgroundColor: CHAR, opacity: split }} />
      {split > 0.5 ? <div style={{ position: "absolute", left: 104 + head * 770, top: 820, width: 22, height: 50, borderRadius: 9, backgroundColor: RED }} /> : null}
      {t >= 640 ? <Arrow d={`M540 880 L540 ${880 + arr * 80}`} c={CHAR} w={9} head={[540, 880 + arr * 84, 90]} /> : null}
      {/* la carte finale, qui bouge vraiment */}
      {t >= 652 ? (
        <Folder x={160} y={990 + (1 - fin) * 900} w={760} h={440} c={RED} label="MOTION DESIGN" tabW={300} stroke={BEIGE}>
          {[0, 1, 2, 3].map((k) => {
            const x = 300 + Math.sin((t - k * 4) / 7) * 220;
            return <div key={k} style={{ position: "absolute", left: x, top: 120 + Math.abs(Math.cos((t - k * 4) / 7)) * -60, width: 120, height: 120, borderRadius: 999, backgroundColor: k === 0 ? BEIGE : k === 1 ? PINK : CHAR, opacity: 1 - k * 0.22, zIndex: 4 - k }} />;
          })}
          <div style={{ position: "absolute", left: 50, bottom: 50, display: "flex" }}>
            {"MOTION".split("").map((ch, i) => (
              <Big key={i} size={92} color={BEIGE} style={{ transform: `translateY(${Math.sin((t - i * 3) / 5) * 12}px)` }}>{ch}</Big>
            ))}
          </div>
          <div style={{ position: "absolute", right: 40, top: 34, width: 110, height: 110, borderRadius: 999, backgroundColor: BEIGE, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${el(t, 662, 8)})` }}>
            <svg width={48} height={48} viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill={RED} /></svg>
          </div>
        </Folder>
      ) : null}
    </>
  );
};

/* ---------- PLAN 06 — date et lieu (sombre) ---------- */
const Plan6: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[5];
  const card = el(t, a + 4, 13);
  const back = ease(t, a, 30);
  return (
    <>
      {[[PINK, -120, 540, -14], [BEIGE, 760, 620, 12], [PINK, 780, 1320, -8], [BEIGE, -140, 1300, 10]].map(([c, x, y, r], i) => (
        <Folder key={i} x={x as number} y={y as number} w={420} h={220} c={c as string} rot={r as number} style={{ opacity: 1 - back * 0.7, scale: `${1 - back * 0.3}` }} />
      ))}
      <Folder x={L} y={500 + (1 - card) * 1400} w={RG - L} h={900} c={RED} label="EVENT" tabW={200}>
        <Up t={t} at={a + 10} style={{ position: "absolute", left: 44, top: 20 }}><Big size={340} color={BEIGE} style={{ letterSpacing: -18 }}>28</Big></Up>
        <Up t={t} at={a + 26} style={{ position: "absolute", left: 50, top: 350 }}><Big size={84} color={CHAR}>NOVEMBRE 2026</Big></Up>
        <div style={{ position: "absolute", left: 50, right: 50, top: 480, height: 8, borderRadius: 9, backgroundColor: CHAR, transformOrigin: "0 0", transform: `scaleX(${ease(t, a + 40, 20)})` }} />
        <Up t={t} at={s(26.28) - 4} style={{ position: "absolute", left: 50, top: 530 }}><Big size={100} color={BEIGE}>PRÉSENTIEL</Big></Up>
        <Up t={t} at={s(27.3)} style={{ position: "absolute", left: 50, top: 660 }}><Big size={48} color={CHAR}>ARIANA VILLE — TUNISIE</Big></Up>
        <div style={{ position: "absolute", left: 50, top: 740, transform: `scale(${el(t, s(27.3) + 8, 9)})`, transformOrigin: "0 50%" }}>
          <svg width={60} height={60} viewBox="0 0 24 24"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill={BEIGE} /><circle cx={12} cy={10} r={2.6} fill={RED} /></svg>
        </div>
      </Folder>
    </>
  );
};

/* ---------- PLAN 07 — tarifs (clair) ---------- */
const Plan7: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[6];
  const c1 = el(t, s(28.61) - 2, 11);
  const c2 = el(t, s(30.33) - 2, 11);
  const duo = el(t, s(30.33) + 16, 7);
  return (
    <>
      <Center top={318} style={{ transform: `scale(${el(t, a + 2, 10)})` }}><Chip text="TARIFS" c={CHAR} /></Center>
      <Folder x={L} y={560 + (1 - c1) * 1300} w={390} h={540} c={PINK} label="SOLO" tabW={160} stroke={BEIGE} rot={-3 * duo} style={{ scale: `${1 - duo * 0.06}` }}>
        <Big size={200} color={CHAR} style={{ position: "absolute", left: 30, top: 60, letterSpacing: -10 }}>85</Big>
        <Big size={80} color={RED} style={{ position: "absolute", left: 36, top: 260 }}>DT</Big>
        <div style={{ position: "absolute", left: 36, top: 380, fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: 2, color: CHAR }}>PAR PERSONNE</div>
      </Folder>
      <Folder x={510 - duo * 40} y={560 - duo * 40 + (1 - c2) * 1300} w={390} h={540} c={RED} label="DUO" tabW={160} stroke={BEIGE} rot={3 * duo} style={{ scale: `${1 + duo * 0.1}`, zIndex: 3 }}>
        <Big size={200} color={BEIGE} style={{ position: "absolute", left: 30, top: 60, letterSpacing: -10 }}>70</Big>
        <Big size={80} color={CHAR} style={{ position: "absolute", left: 36, top: 260 }}>DT</Big>
        <div style={{ position: "absolute", left: 36, top: 380, fontFamily: FONT, fontWeight: 800, fontSize: 30, lineHeight: 1.25, letterSpacing: 2, color: BEIGE }}>
          PAR PERSONNE
          <br />
          EN DUO
        </div>
      </Folder>
      {t >= s(30.33) + 20 ? (
        <div style={{ position: "absolute", left: 600, top: 500, zIndex: 4, transform: `rotate(-8deg) scale(${el(t, s(30.33) + 20, 8)})` }}><Chip text="OFFRE DUO ✦" c={CHAR} style={{ fontSize: 30, border: `5px solid ${BEIGE}` }} /></div>
      ) : null}
      <Center top={1300}>
        <Up t={t} at={s(31.1)}><MixedText text="جيب صاحبك معاك" size={70} color={CHAR} /></Up>
      </Center>
    </>
  );
};

/* ---------- PLAN 08 — appel final (sombre) ---------- */
const WhatsIcon: React.FC<{ size: number; fg: string; bg: string }> = ({ size, fg, bg }) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <path d="M24 4a20 20 0 0 0-17.3 30L4 44l10.3-2.7A20 20 0 1 0 24 4z" fill={fg} />
    <path d="M17.5 14.5c-.6 0-1.6.3-2.3 1.4-.8 1.2-1.3 3 .2 5.8 2.3 4.2 5.7 7.6 10 9.7 2.6 1.3 4.3.9 5.4.1 1-.7 1.4-1.8 1.2-2.4-.2-.5-3.3-2.2-4-2.3-.6-.1-1.4 1.6-1.9 1.8-.5.2-2.7-.9-4.3-2.4-1.5-1.4-2.6-3.3-2.4-3.8.3-.6 1.8-1.3 1.7-2-.1-.6-1.6-4.1-2.1-4.6-.4-.4-1-.3-1.5-.3z" fill={bg} />
  </svg>
);
const Plan8: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[7];
  const g = outE(t, a, 22);
  const main = el(t, a + 8, 12);
  const pulse = 1 + Math.max(0, Math.sin((t - 1030) / 6)) * 0.06 * (t > 1030 ? 1 : 0);
  return (
    <>
      <Img src={staticFile("logo-creofan-complet.png")} style={{ position: "absolute", left: 540 - 160, top: 300, width: 320, transform: `scale(${el(t, a + 4, 10)})` }} />
      {[[PINK, -6, -900, 0], [BEIGE, 5, 900, 0], [PINK, -2, 0, 1400]].map(([c, r, dx, dy], i) => (
        <Folder key={i} x={L + (1 - g) * (dx as number) + (i - 1) * 14} y={560 - 18 * (2 - i) + (1 - g) * (dy as number)} w={RG - L} h={640} c={c as string} rot={(r as number) * g} />
      ))}
      <Folder x={L} y={560 + (1 - main) * 1300} w={RG - L} h={640} c={RED} label="RÉSERVATION" tabW={290}>
        <Up t={t} at={a + 12} style={{ position: "absolute", left: 44, top: 44 }}><Big size={108} color={BEIGE}>RÉSERVE</Big></Up>
        <Up t={t} at={a + 18} style={{ position: "absolute", left: 44, top: 150 }}><Big size={108} color={CHAR}>TA PLACE !</Big></Up>
        <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 170, borderRadius: 999, backgroundColor: BEIGE, display: "flex", alignItems: "center", gap: 22, padding: "0 30px", transform: `scale(${el(t, s(33.11), 9)})` }}>
          <WhatsIcon size={110} fg={RED} bg={BEIGE} />
          <Big size={88} color={CHAR}>51 097 272</Big>
        </div>
        <div style={{ position: "absolute", left: 44, top: 510, transform: `scale(${el(t, 1026, 9) * pulse})`, transformOrigin: "0 50%" }}><Chip text="PLACES LIMITÉES" c={CHAR} style={{ fontSize: 34 }} /></div>
      </Folder>
      <Center top={1310}>
        <Up t={t} at={s(33.11)}><MixedText text="كلّمنا على WhatsApp!" size={66} color={BEIGE} latinColor={PINK} /></Up>
      </Center>
    </>
  );
};

const PLANS_R = [Plan1, Plan2, Plan3, Plan4, Plan5, Plan6, Plan7, Plan8];

// Transition : un grand dossier de la couleur du plan suivant monte et balaie l'écran
const Wipe: React.FC<{ t: number; at: number; c: string }> = ({ t, at, c }) => {
  if (t < at - 10 || t > at + 10) return null;
  const k = interpolate(t, [at - 10, at + 10], [0, 1], { ...clamp, easing: Easing.bezier(0.7, 0, 0.3, 1) });
  const y = interpolate(k, [0, 0.5, 1], [1920, -T - 20, -2400]);
  return <Folder x={-60} y={y} w={1200} h={2200} c={c} tabW={420} stroke={c} />;
};

type S = [string, number, number, number];
const SFX: S[] = [
  ["cc/whoosh.wav", 0, 15, 0.5],
  ...P1F.map(([, , , , , at]) => ["cc/pop.wav", at, 6, 0.55] as S),
  ["regard/snap.wav", CUT[1], 4, 0.7],
  ["regard/sub.wav", 170, 27, 0.6],
  ...[176, 180, 184].map((f) => ["cc/pop.wav", f, 6, 0.45] as S),
  ["regard/chord.wav", 203, 60, 0.35],
  ["ame/boom.wav", 258, 60, 0.45],
  ["cc/pop.wav", 358, 6, 0.5],
  ["cc/pop.wav", 364, 6, 0.5],
  ...[392, 400, 408].map((f) => ["regard/tick.wav", f, 4, 0.5] as S),
  ["cc/click.wav", 452, 3, 0.7],
  ["cc/click.wav", 466, 3, 0.7],
  ["cc/click.wav", 474, 3, 0.7],
  ["cc/whoosh.wav", 503, 15, 0.55],
  ...[512, 518, 536].map((f) => ["cc/pop.wav", f, 6, 0.45] as S),
  ...[585, 592, 599, 606].map((f) => ["regard/tick.wav", f, 4, 0.6] as S),
  ["regard/riser.wav", 625, 30, 0.35],
  ["cc/pop.wav", 652, 6, 0.6],
  ["ame/boom.wav", CUT[5] + 4, 60, 0.45],
  ...[CUT[5] + 10, CUT[5] + 26, s(26.28) - 4, s(27.3)].map((f) => ["cc/pop.wav", f, 6, 0.45] as S),
  ["cc/pop.wav", s(28.61) - 2, 6, 0.6],
  ["cc/pop.wav", s(30.33) - 2, 6, 0.6],
  ["cc/ding.wav", s(30.33) + 20, 30, 0.35],
  ["ame/boom.wav", CUT[7] + 8, 60, 0.45],
  ["cc/pop.wav", s(33.11), 6, 0.6],
  ["cc/ding.wav", 1026, 30, 0.35],
  ["ame/shimmer.wav", OUT, 60, 0.35],
  ["ame/boom.wav", OUT + 62, 60, 0.4],
  ...CUT.slice(1).map((c) => ["cc/whoosh.wav", c - 8, 15, 0.4] as S),
];

export const MasterclassReel: React.FC = () => {
  const t = useCurrentFrame();
  let i = 0;
  while (i < 7 && t >= CUT[i + 1]) i++;
  const light = LIGHT(i);
  const bg = light ? BEIGE : CHAR;
  const Plan = PLANS_R[i];
  const iconC = light ? CHAR : BEIGE;
  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
      {t < OUT ? (
        <>
          <Plan t={t} />
          {/* icône Creofan présente pendant toute la vidéo */}
          <div style={{ position: "absolute", left: L, top: 236, display: "flex", alignItems: "center", gap: 16, zIndex: 20 }}>
            <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 62, height: 62 }} />
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 20, letterSpacing: 4, color: iconC }}>CREATIVE AI MASTERCLASS</div>
          </div>
        </>
      ) : (
        <OutroIcon f={t - OUT} />
      )}
      {CUT.slice(1).map((c, k) => (
        <Wipe key={c} t={t} at={c} c={LIGHT(k + 1) ? BEIGE : CHAR} />
      ))}
      <Audio src={staticFile("masterclass/voix-1.mp3")} />
      <Sequence from={P2}>
        <Audio src={staticFile("masterclass/voix-2.mp3")} />
      </Sequence>
      <Loop durationInFrames={1020}>
        <Audio src={staticFile("cc/music.mp3")} volume={0.12} />
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
export const CoverMasterclass: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
    <Folder x={30} y={470} w={520} h={300} c={PINK} label="CANVA + CLAUDE" tabW={290} rot={-9} stroke={BEIGE} />
    <Folder x={560} y={500} w={560} h={300} c={CHAR} label="AI MOTION" rot={8} stroke={BEIGE} />
    <Folder x={L} y={640} w={RG - L} h={620} c={RED} label="28.11.2026" tabW={280} stroke={BEIGE}>
      <Big size={150} color={BEIGE} style={{ position: "absolute", left: 44, top: 50 }}>CREATIVE</Big>
      <Big size={150} color={BEIGE} style={{ position: "absolute", left: 44, top: 190 }}>AI</Big>
      <Big size={104} color={CHAR} style={{ position: "absolute", left: 44, top: 340 }}>MASTERCLASS</Big>
      <div style={{ position: "absolute", left: 44, top: 490 }}><Chip text="2 ATELIERS PRATIQUES" c={BEIGE} style={{ color: RED }} /></div>
    </Folder>
    <Center top={320}><MixedText text="الحل في الـ pratique!" size={84} color={CHAR} latinColor={RED} /></Center>
    <Center top={1400}><MixedText text="Présentiel · Ariana" size={50} color={CHAR} latinColor={CHAR} /></Center>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1490, display: "flex", justifyContent: "center" }}>
      <Img src={staticFile("ame/logo-creofan-rouge.png")} style={{ width: 210 }} />
    </div>
  </AbsoluteFill>
);
