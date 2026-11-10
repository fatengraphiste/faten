import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Loop, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { MixedText } from "../components";
import { OutroIcon } from "../outro/OutroIcon";
import "../theme";

// CREOFAN — « Claude Fable 5.2 » · 1080×1920, 30 i/s
// Fond blanc, pastilles aux couleurs Creofan, 3D en CSS (cubes, plateau isométrique, texte extrudé).
// Voix fournie (38,6 s) ; les repères suivent les pauses de la voix.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const RED = "#f7322a";
const RED_D = "#c9241d";
const PINK = "#fa8985";
const BEIGE = "#fff5f5";
const CHAR = "#1A1A1A";
const WHITE = "#ffffff";
const FONT = "Poppins, sans-serif";
// Zone sûre : rien d'important sous 1560 px ni dans les 120 px de droite
const L = 90;
const RG = 930;
const CX = (L + RG) / 2;

const CUT = [0, s(3.4), s(7.95), s(16.62), s(23.5), s(27.9), s(31.55), s(36.15), s(38.75)];
const OUT = CUT[8];
export const FABLE_DURATION = OUT + 140;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number, a: number, d: number, e = Easing.bezier(0.65, 0, 0.35, 1)) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: e });
const outE = (t: number, a: number, d: number) => ease(t, a, d, Easing.bezier(0.16, 1, 0.3, 1));
const el = (t: number, a: number, damping = 12) => (t < a ? 0 : spring({ frame: t - a, fps: FPS, config: { damping, stiffness: 170, mass: 0.8 } }));
const ink = (c: string) => (c === RED || c === CHAR ? WHITE : CHAR);

const Big: React.FC<{ size: number; color: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color, children, style }) => (
  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 0.95, letterSpacing: -size * 0.035, color, whiteSpace: "nowrap", ...style }}>{children}</div>
);
// Pastille : latin en Poppins, arabe en Salma
const Pill: React.FC<{ text: string; c: string; size?: number; style?: React.CSSProperties; color?: string }> = ({ text, c, size = 44, style, color }) => (
  <span style={{ display: "inline-block", backgroundColor: c, borderRadius: 999, padding: `${size * 0.12}px ${size * 0.62}px ${size * 0.22}px`, whiteSpace: "nowrap", ...style }}>
    <MixedText text={text} size={size} color={color ?? ink(c)} latinColor={color ?? ink(c)} style={{ lineHeight: 1.15 }} />
  </span>
);
const At: React.FC<{ x: number; y: number; k?: number; r?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, k = 1, r = 0, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${r}deg) scale(${k})`, ...style }}>{children}</div>
);
const Row: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <div style={{ position: "absolute", left: L, width: RG - L, top: y, textAlign: "center", ...style }}>{children}</div>
);
const Card: React.FC<{ x: number; y: number; w: number; h: number; c: string; k?: number; r?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, c, k = 1, r = 44, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, backgroundColor: c, borderRadius: r, overflow: "hidden", transform: `translateY(${(1 - k) * 80}px) scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k * 1.4), ...style }}>{children}</div>
);
const ClaudeLogo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img src={staticFile("cc/claude-icon.png")} style={{ width: size, height: size, borderRadius: size * 0.22, display: "block", ...style }} />
);

/* ---------- 3D en CSS ---------- */
const Cube: React.FC<{ a: number; rx: number; ry: number; cols?: string[]; style?: React.CSSProperties; label?: string }> = ({ a, rx, ry, cols = [RED, PINK, RED_D, PINK, BEIGE, RED_D], style, label }) => {
  const faces = [`translateZ(${a / 2}px)`, `rotateY(90deg) translateZ(${a / 2}px)`, `rotateY(180deg) translateZ(${a / 2}px)`, `rotateY(-90deg) translateZ(${a / 2}px)`, `rotateX(90deg) translateZ(${a / 2}px)`, `rotateX(-90deg) translateZ(${a / 2}px)`];
  return (
    <div style={{ width: a, height: a, position: "relative", transformStyle: "preserve-3d", transform: `rotateX(${rx}deg) rotateY(${ry}deg)`, ...style }}>
      {faces.map((f, i) => (
        <div key={i} style={{ position: "absolute", inset: 0, backgroundColor: cols[i], transform: f, borderRadius: a * 0.08, display: "flex", alignItems: "center", justifyContent: "center", backfaceVisibility: "hidden" }}>
          {label && i === 0 ? <Big size={a * 0.42} color={WHITE}>{label}</Big> : null}
        </div>
      ))}
    </div>
  );
};
// Texte extrudé (couches empilées en profondeur)
const Extrude: React.FC<{ text: string; size: number; ry: number; rx?: number; front?: string; side?: string; depth?: number }> = ({ text, size, ry, rx = 8, front = RED, side = PINK, depth = 14 }) => (
  <div style={{ perspective: 1600 }}>
    <div style={{ position: "relative", transformStyle: "preserve-3d", transform: `rotateX(${rx}deg) rotateY(${ry}deg)` }}>
      {Array.from({ length: depth }).map((_, i) => {
        const z = depth - 1 - i;
        return (
          <Big key={i} size={size} color={z === 0 ? front : side} style={{ position: z === 0 ? "relative" : "absolute", left: 0, top: 0, transform: `translateZ(${-z * 5}px)` }}>{text}</Big>
        );
      })}
    </div>
  </div>
);
// Tuile épaisse posée sur un plateau isométrique
const IsoTile: React.FC<{ x: number; y: number; a: number; h: number; top: string; side: string; children?: React.ReactNode }> = ({ x, y, a, h, top, side, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: a, height: a, transformStyle: "preserve-3d" }}>
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} style={{ position: "absolute", inset: 0, borderRadius: 30, backgroundColor: side, transform: `translateZ(${(h * i) / 7}px)` }} />
    ))}
    <div style={{ position: "absolute", inset: 0, borderRadius: 30, backgroundColor: top, transform: `translateZ(${h}px)`, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
  </div>
);
const Check: React.FC<{ c: string; size: number; k: number }> = ({ c, size, k }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={c} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${k} 1`} /></svg>
);

/* ---------- SCÈNE 0 — l'accroche ---------- */
const S0: React.FC<{ t: number }> = ({ t }) => {
  const logo = el(t, s(0.98), 11);
  const spin = ease(t, s(2.2), 20) * 360;
  const lift = ease(t, s(0.8), 12);
  return (
    <>
      <Row y={interpolate(lift, [0, 1], [760, 310])} style={{ transform: `scale(${el(t, 1, 10) * (1 - lift * 0.5)})` }}>
        <MixedText text="يا جماعة..." size={170} color={CHAR} />
      </Row>
      {/* il ne respire pas : les anneaux n'arrêtent jamais */}
      {t >= s(0.98) ? [0, 1, 2].map((i) => {
        const p = ((t - s(0.98)) / 34 + i / 3) % 1;
        return <At key={i} x={CX} y={840}><div style={{ width: 300 + p * 560, height: 300 + p * 620, borderRadius: 9999, backgroundColor: i % 2 ? BEIGE : PINK, opacity: (1 - p) * 0.55 }} /></At>;
      }) : null}
      <At x={CX} y={840} style={{ perspective: 1400 }}>
        <div style={{ transform: `rotateY(${(1 - logo) * 90 + spin}deg) scale(${logo})` }}><ClaudeLogo size={330} /></div>
      </At>
      <At x={CX + 230} y={680} k={el(t, s(2.2), 8)} r={10}><Pill text="جديد ✦" c={RED} size={54} /></At>
      <At x={CX - 230} y={1030} k={el(t, s(1.5), 8)} r={-8}><Pill text="NON-STOP" c={CHAR} size={38} /></At>
      <Row y={1110} style={{ transform: `scale(${el(t, s(1.1), 9)})` }}>
        <MixedText text="كلود ميتنفّسش!" size={118} color={CHAR} />
      </Row>
    </>
  );
};

/* ---------- SCÈNE 1 — Fable 5.2 ---------- */
const S1: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[1];
  const strike = outE(t, s(6.5), 10);
  return (
    <>
      <At x={CX} y={440} k={el(t, a + 4, 10)}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 18, backgroundColor: BEIGE, borderRadius: 999, padding: "14px 40px 14px 16px" }}>
          <ClaudeLogo size={74} />
          <Big size={52} color={CHAR}>Claude</Big>
        </span>
      </At>
      <At x={CX} y={610} k={el(t, s(3.54), 9)}><Big size={190} color={CHAR}>Fable</Big></At>
      <At x={CX} y={900} k={el(t, s(4.0), 8)}>
        <Extrude text="5.2" size={440} ry={Math.sin(t / 16) * 26} depth={18} />
      </At>
      {/* pas une simple mise à jour */}
      <At x={CX - 190} y={1200} k={el(t, s(6.23), 9)} r={-4}>
        <div style={{ position: "relative" }}>
          <Pill text="UPDATE" c={BEIGE} size={50} color={PINK} />
          <div style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 10, borderRadius: 9, backgroundColor: CHAR, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} />
        </div>
      </At>
      <At x={CX + 170} y={1200} k={el(t, s(7.0), 8)} r={5}><Pill text="NEXT LEVEL ↑" c={RED} size={50} /></At>
    </>
  );
};

/* ---------- SCÈNE 2 — le projet, le plan, l'équipe d'agents ---------- */
const STEPS: [string, number][] = [["يخطّط", 9.99], ["يقسّم", 11.0], ["ينفّذ", 13.36], ["يراجع", 14.08], ["يصلّح", 15.2]];
const S2: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[2];
  const proj = el(t, s(8.06), 12);
  const toBoard = ease(t, s(9.9), 16);
  const rise = (i: number) => el(t, s(11.0) + i * 3, 10);
  const A = 170, G = 26;
  return (
    <>
      <Row y={380} style={{ transform: `scale(${el(t, a + 4, 10)})` }}><Pill text="تعطيه Projet كامل" c={BEIGE} size={56} color={CHAR} /></Row>
      {/* la carte PROJET se couche et devient un plateau */}
      <div style={{ position: "absolute", left: CX - 280, top: 560, width: 560, height: 560, perspective: 2200 }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(${toBoard * 56}deg) rotateZ(${toBoard * -40}deg) scale(${proj * (1 - toBoard * 0.06)})` }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 50, backgroundColor: toBoard > 0.5 ? BEIGE : RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {toBoard < 0.5 ? <Big size={110} color={WHITE} style={{ opacity: 1 - toBoard * 2 }}>PROJET</Big> : null}
          </div>
          {toBoard > 0.5 ? Array.from({ length: 9 }).map((_, i) => {
            const c = i % 3, r = Math.floor(i / 3);
            const k = rise(i);
            const work = ease(t, s(13.36) + i * 2, 14);
            const done = outE(t, s(14.08) + i * 3, 10);
            const bug = i === 5;
            const fixed = ease(t, s(15.2), 14);
            const top = bug && done > 0.5 && fixed < 0.5 ? CHAR : i === 4 ? RED : i % 2 ? WHITE : PINK;
            return (
              <IsoTile key={i} x={12 + c * (A + G)} y={12 + r * (A + G)} a={A} h={k * (40 + (i === 4 ? 50 : (i * 37) % 30)) + (bug ? Math.sin(fixed * Math.PI) * 60 : 0)} top={top} side={i === 4 ? RED_D : PINK}>
                {i === 4 ? <ClaudeLogo size={96} /> : done > 0 ? <Check c={top === WHITE || top === PINK ? RED : WHITE} size={90} k={bug ? fixed : done} /> : (
                  <div style={{ width: 110, height: 16, borderRadius: 9, backgroundColor: BEIGE, overflow: "hidden", opacity: k }}>
                    <div style={{ width: `${work * 100}%`, height: "100%", backgroundColor: RED }} />
                  </div>
                )}
              </IsoTile>
            );
          }) : null}
        </div>
      </div>
      <At x={CX + 250} y={600} k={el(t, s(12.3), 8)} r={8}><Pill text="Agents" c={CHAR} size={48} /></At>
      {/* les étapes s'allument quand la voix les dit */}
      <div dir="rtl" style={{ position: "absolute", left: L, width: RG - L, top: 1170, display: "flex", justifyContent: "center", gap: 12 }}>
        {STEPS.map(([w, at]) => {
          const on = t >= s(at);
          return (
            <div key={w} style={{ transform: `scale(${el(t, s(9.99) - 6, 10) * (on ? 1 + 0.12 * Math.sin(Math.min(1, (t - s(at)) / 10) * Math.PI) : 1)})` }}>
              <Pill text={w} c={on ? RED : BEIGE} size={40} color={on ? WHITE : PINK} />
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ---------- SCÈNE 3 — la 3D ---------- */
const S3: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[3];
  const away = ease(t, s(19.7), 12);
  const ref = el(t, s(19.98), 12);
  const build = ease(t, s(21.2), 30);
  return (
    <>
      {away < 1 ? (
        <div style={{ opacity: 1 - away, transform: `translateY(${-away * 200}px)` }}>
          <At x={CX} y={470} k={el(t, s(16.9), 9)}><Extrude text="3D" size={300} ry={Math.sin(t / 14) * 30} front={CHAR} side={PINK} depth={16} /></At>
          <At x={CX} y={860} style={{ perspective: 1600 }}>
            <div style={{ transform: `scale(${el(t, a + 6, 10)})`, transformStyle: "preserve-3d" }}><Cube a={300} rx={-24 + Math.sin(t / 20) * 8} ry={t * 2.4} /></div>
          </At>
          {/* il construit des scènes : d'autres volumes s'assemblent */}
          {[[-270, 1010, 150, 0], [270, 990, 180, 5], [-200, 700, 100, 10], [250, 720, 90, 14]].map(([dx, y, sz, d], i) => (
            <At key={i} x={CX + dx} y={y} style={{ perspective: 1200 }}>
              <div style={{ transform: `scale(${el(t, s(18.55) + d, 9)})`, transformStyle: "preserve-3d" }}>
                <Cube a={sz} rx={-24} ry={-t * (1.5 + i * 0.4) + i * 40} cols={i % 2 ? [PINK, BEIGE, PINK, BEIGE, WHITE, PINK] : [CHAR, RED, CHAR, RED, PINK, CHAR]} />
              </div>
            </At>
          ))}
          <At x={CX} y={1180} k={el(t, s(18.7), 9)}><Pill text="يبني مشاهد" c={RED} size={52} /></At>
        </div>
      ) : null}
      {/* une image de référence → la même, reconstruite en volume */}
      {t >= s(19.98) ? (
        <>
          <Row y={390} style={{ transform: `scale(${ref})` }}><Pill text="تصويرة Reference" c={BEIGE} size={54} color={CHAR} /></Row>
          <Card x={L} y={560} w={370} h={470} c={BEIGE} k={ref}>
            <div style={{ position: "absolute", left: 220, top: 60, width: 100, height: 100, borderRadius: 99, backgroundColor: PINK }} />
            <svg width={370} height={470} style={{ position: "absolute", inset: 0 }}><polygon points="0,470 150,230 260,380 320,300 370,380 370,470" fill={RED} /></svg>
            <div style={{ position: "absolute", left: 24, top: 24, fontFamily: FONT, fontWeight: 600, fontSize: 20, letterSpacing: 3, color: CHAR, opacity: 0.6 }}>2D</div>
          </Card>
          <At x={CX} y={795} k={el(t, s(20.8), 9)}>
            <div style={{ width: 84, height: 84, borderRadius: 99, backgroundColor: CHAR, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={44} height={44} viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" stroke={WHITE} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </At>
          <div style={{ position: "absolute", left: RG - 370, top: 560, width: 370, height: 470, perspective: 1300, opacity: Math.min(1, el(t, s(21.0), 12) * 1.4) }}>
            <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${-24 + Math.sin(t / 15) * 16}deg) rotateX(${8 + Math.cos(t / 19) * 5}deg)` }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 44, backgroundColor: CHAR }} />
              <div style={{ position: "absolute", left: 220, top: 60, width: 100, height: 100, borderRadius: 99, backgroundColor: PINK, transform: `translateZ(${build * 130}px)` }} />
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} width={370} height={470} style={{ position: "absolute", inset: 0, transform: `translateZ(${build * (20 + i * 14)}px)` }}><polygon points="0,470 150,230 260,380 320,300 370,380 370,470" fill={i === 4 ? RED : RED_D} /></svg>
              ))}
              <div style={{ position: "absolute", left: 24, top: 24, fontFamily: FONT, fontWeight: 600, fontSize: 20, letterSpacing: 3, color: WHITE, opacity: 0.7, transform: "translateZ(30px)" }}>3D</div>
            </div>
          </div>
          <At x={CX} y={1160} k={el(t, s(21.6), 9)}><Pill text="يعاود يبنيها" c={RED} size={52} /></At>
        </>
      ) : null}
    </>
  );
};

/* ---------- SCÈNE 4 — plus rapide, moins cher ---------- */
const S4: React.FC<{ t: number }> = ({ t }) => {
  const up = ease(t, s(24.4), 12);
  const n = Math.round(interpolate(t, [s(24.6), s(25.7)], [0, 30], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const cost = el(t, s(26.44), 12);
  return (
    <>
      <Row y={interpolate(up, [0, 1], [700, 290])} style={{ transform: `scale(${el(t, s(23.61), 8) * (1 - up * 0.5)})` }}>
        <MixedText text="والأقوى؟" size={190} color={CHAR} />
      </Row>
      {/* traînées de vitesse */}
      {t >= s(24.55) ? [0, 1, 2, 3, 4].map((i) => {
        const p = ((t - s(24.55)) * (26 + i * 9) + i * 400) % 1900;
        return <div key={i} style={{ position: "absolute", left: 1300 - p, top: 560 + i * 80, width: 260 + i * 40, height: 34, borderRadius: 99, backgroundColor: i % 2 ? BEIGE : PINK, opacity: 0.8 }} />;
      }) : null}
      <At x={CX} y={730} k={el(t, s(24.55), 8)}><Big size={330} color={RED} style={{ letterSpacing: -18, fontStyle: "italic" }}>+{n}%</Big></At>
      <At x={CX + 230} y={905} k={el(t, s(25.2), 8)} r={-6}><Pill text="أسرع" c={CHAR} size={60} /></At>
      {/* le coût descend */}
      <Card x={L} y={990} w={RG - L} h={260} c={BEIGE} k={cost}>
        <div style={{ position: "absolute", right: 44, top: 34 }}><MixedText text="التكلفة" size={80} color={CHAR} /></div>
        <div style={{ position: "absolute", right: 44, bottom: 30 }}><Pill text="نقصت ↓" c={RED} size={44} /></div>
        {[0, 1, 2, 3].map((i) => {
          const h = interpolate(ease(t, s(26.7) + i * 4, 16), [0, 1], [190, 190 - i * 46]);
          return <div key={i} style={{ position: "absolute", left: 50 + i * 86, bottom: 36, width: 62, height: h, borderRadius: 18, backgroundColor: i === 3 ? RED : PINK }} />;
        })}
      </Card>
    </>
  );
};

/* ---------- SCÈNE 5 — 1000 agents ---------- */
const COLS = 25, ROWS = 40;
const S5: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[5];
  const prog = interpolate(t, [s(28.3), s(30.2)], [0, 1], clamp);
  const n = Math.round(interpolate(prog, [0, 1], [1, 1000], { easing: Easing.in(Easing.quad) }));
  return (
    <>
      <At x={CX} y={440} k={el(t, a + 4, 9)}><Big size={230} color={CHAR} style={{ letterSpacing: -12 }}>{n}</Big></At>
      <At x={CX + 250} y={330} k={el(t, s(29.9), 8)} r={8}><Pill text="Agents" c={RED} size={50} /></At>
      <div style={{ position: "absolute", left: CX - 400, top: 560, width: 800, height: 760, perspective: 1500 }}>
        <div style={{ position: "absolute", left: 100, top: -120, width: 600, height: 960, transformStyle: "preserve-3d", transform: `rotateX(52deg) rotateZ(${-6 + Math.sin(t / 30) * 3}deg)` }}>
          {Array.from({ length: COLS * ROWS }).map((_, i) => {
            const c = i % COLS, r = Math.floor(i / COLS);
            const d = Math.hypot(c - 12, r - 19.5) / 23;
            if (d > prog * 1.15) return null;
            const wave = Math.sin(d * 14 - t / 3.5);
            return <div key={i} style={{ position: "absolute", left: c * 24, top: r * 24, width: 14, height: 14, borderRadius: 9, backgroundColor: wave > 0.72 ? RED : wave > 0 ? PINK : "#f6d5d3", transform: `translateZ(${Math.max(0, wave) * 26}px)` }} />;
          })}
        </div>
      </div>
      <At x={CX} y={900} k={el(t, s(28.2), 10)}><ClaudeLogo size={170} /></At>
      <At x={CX} y={1210} k={el(t, s(30.4), 9)}><Pill text="في نفس المشروع" c={CHAR} size={50} /></At>
    </>
  );
};

/* ---------- SCÈNE 6 — designers et freelances ---------- */
const S6: React.FC<{ t: number }> = ({ t }) => {
  const W2 = (RG - L - 20) / 2;
  const flip = (at: number) => (1 - el(t, at, 11)) * 90;
  return (
    <>
      <div style={{ position: "absolute", left: L, width: RG - L, top: 400, perspective: 1400, textAlign: "center" }}>
        <div style={{ transform: `rotateX(${flip(s(31.9))}deg) rotate(-3deg)`, transformOrigin: "50% 100%" }}><Pill text="DESIGNERS" c={RED} size={92} style={{ fontFamily: FONT }} /></div>
        <div style={{ transform: `rotateX(${flip(s(32.8))}deg) rotate(2deg)`, transformOrigin: "50% 0", marginTop: 26 }}><Pill text="FREELANCERS" c={CHAR} size={78} /></div>
      </div>
      {/* le temps et l'effort gagnés */}
      <Card x={L} y={800} w={W2} h={400} c={BEIGE} k={el(t, s(34.1), 11)}>
        <svg width={W2} height={400} style={{ position: "absolute", inset: 0 }}>
          <circle cx={W2 / 2} cy={150} r={96} fill={WHITE} />
          <path d={`M${W2 / 2} 150 L${W2 / 2} 78`} stroke={RED} strokeWidth={10} strokeLinecap="round" transform={`rotate(${t * 22} ${W2 / 2} 150)`} />
          <path d={`M${W2 / 2} 150 L${W2 / 2 + 50} 150`} stroke={CHAR} strokeWidth={10} strokeLinecap="round" transform={`rotate(${t * 2.5} ${W2 / 2} 150)`} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, textAlign: "center", transform: `scale(${el(t, s(34.9), 8)})` }}><MixedText text="وقت" size={92} color={CHAR} /></div>
      </Card>
      <Card x={L + W2 + 20} y={800} w={W2} h={400} c={RED} k={el(t, s(34.4), 11)}>
        <div style={{ position: "absolute", left: 60, right: 60, top: 70, height: 150, display: "flex", alignItems: "flex-end", gap: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ flex: 1, borderRadius: 16, backgroundColor: WHITE, opacity: 0.35 + 0.65 * ease(t, s(35.5) + i * 3, 8), height: `${interpolate(ease(t, s(35.5) + i * 3, 10), [0, 1], [30, 40 + i * 20])}%` }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, textAlign: "center", transform: `scale(${el(t, s(35.45), 8)})` }}><MixedText text="جهد" size={92} color={WHITE} /></div>
      </Card>
      <At x={CX} y={800} k={el(t, s(34.6), 8)} r={-4}><Pill text="يربحك" c={CHAR} size={60} /></At>
    </>
  );
};

/* ---------- SCÈNE 7 — le plus beau collègue ---------- */
const HEART = "M12 20.5S3 15 3 8.8A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 9 2.4C21 15 12 20.5 12 20.5z";
const S7: React.FC<{ t: number }> = ({ t }) => {
  const a = CUT[7];
  return (
    <>
      <At x={CX - 170} y={640} k={el(t, a + 4, 10)} r={-6}><ClaudeLogo size={270} /></At>
      <At x={CX + 170} y={640} k={el(t, s(37.4), 10)} r={6}>
        <div style={{ width: 270, height: 270, borderRadius: 60, backgroundColor: BEIGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 190, height: 190 }} />
        </div>
      </At>
      <At x={CX} y={640} k={el(t, s(37.5), 7) * (1 + Math.sin(t / 3) * 0.06)}>
        <div style={{ width: 120, height: 120, borderRadius: 99, backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={66} height={66} viewBox="0 0 24 24"><path d={HEART} fill={WHITE} /></svg>
        </div>
      </At>
      <Row y={880} style={{ transform: `scale(${el(t, s(36.41), 9)})` }}><MixedText text="أحلى كلود" size={150} color={CHAR} /></Row>
      <Row y={1070} style={{ transform: `scale(${el(t, s(37.4), 9)})` }}><Pill text="وأحلى زميل" c={RED} size={96} /></Row>
    </>
  );
};

/* ---------- OUTRO ---------- */
const FOLLOW = "M15 19c0-3.3-2.7-6-6-6s-6 2.7-6 6M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M19 8v6M16 11h6";
const REPOST = "M17 2.5l3.5 3.5-3.5 3.5M3.5 11.5v-1A4.5 4.5 0 0 1 8 6h12.5M7 21.5L3.5 18 7 14.5M20.5 12.5v1A4.5 4.5 0 0 1 16 18H3.5";
const ICONS = [{ label: "Suivre", d: FOLLOW, fill: false }, { label: "J'aime", d: HEART, fill: true }, { label: "Partager", d: REPOST, fill: false }];
const Outro: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ backgroundColor: RED }}>
    <OutroIcon f={t - OUT} fg={WHITE} bg="transparent" size={460} cy={830} />
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1150, display: "flex", justifyContent: "center", gap: 70 }}>
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
  </AbsoluteFill>
);

/* ---------- Sous-titres synchronisés : mots latins en pastille ---------- */
const SEG: [number, number, string][] = [
  [0.0, 0.65, "يا جماعة..."],
  [0.98, 2.1, "كلود ميتنفّسش!"],
  [2.2, 3.18, "هاو جاب جديد..."],
  [3.54, 4.88, "Fable 5.2"],
  [5.14, 5.98, "والمرّة هاذي،"],
  [6.23, 7.8, "موش مجرّد Update عادي!"],
  [8.06, 9.71, "تخيّل تعطيه Projet كامل،"],
  [9.99, 10.76, "وهو يخطّط،"],
  [11.0, 13.05, "ويقسّم الخدمة على فريق متاع Agents،"],
  [13.36, 13.85, "ينفّذ،"],
  [14.08, 16.48, "يراجع خدمتو، وحتى يصلّح أغلاطو!"],
  [16.77, 18.17, "وزيد طوّر في 3D..."],
  [18.55, 19.72, "ينجم يبني مشاهد،"],
  [19.98, 23.37, "وحتى يعاود يبني تجربة انطلاقاً من تصويرة Reference!"],
  [23.61, 24.23, "والأقوى؟"],
  [24.55, 26.18, "ولّى أسرع بثلاثين بالمية،"],
  [26.44, 27.74, "والتكلفة نقصت زادة!"],
  [28.08, 31.34, "وزيد ينجم ينسّق بين 1000 Agent في نفس المشروع!"],
  [31.77, 33.69, "بالنسبة للـ Designers والـ Freelancers..."],
  [34.08, 35.9, "تخيّل قدّاش يربحك وقت و جهد!"],
  [36.41, 37.17, "أحلى كلود"],
  [37.4, 38.27, "وأحلى زميل"],
];
const ARABIC = /[؀-ۿ]/;
type Tok = { at: number; text: string; latin: boolean };
const LINES: { from: number; to: number; toks: Tok[] }[] = SEG.map(([a, b, text], i) => {
  const raw = text.split(" ");
  const total = raw.reduce((n, w) => n + w.length + 1, 0);
  let acc = 0;
  const toks: Tok[] = [];
  raw.forEach((w) => {
    const at = s(a + ((b - a) * acc) / total);
    acc += w.length + 1;
    const latin = !ARABIC.test(w);
    const last = toks[toks.length - 1];
    if (last && latin && last.latin) last.text += " " + w;
    else toks.push({ at, text: w, latin });
  });
  const next = SEG[i + 1];
  return { from: s(a) - 2, to: next ? s(next[0]) - 2 : OUT, toks };
});
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const line = LINES.find((l) => t >= l.from && t < l.to);
  if (!line) return null;
  return (
    <div dir="rtl" style={{ position: "absolute", left: L, width: RG - L, top: 1300, minHeight: 150, display: "flex", flexWrap: "wrap", alignItems: "center", alignContent: "center", justifyContent: "center", gap: "6px 14px" }}>
      {line.toks.map((w, i) => {
        const nextAt = line.toks[i + 1]?.at ?? line.to;
        const active = t >= w.at && t < nextAt;
        const shown = t >= w.at - 1;
        const pop = shown ? 0.9 + 0.1 * el(t, w.at - 1, 9) : 0.9;
        return (
          <div key={i} style={{ opacity: shown ? 1 : 0.18, transform: `scale(${pop})` }}>
            {w.latin ? <Pill text={w.text} c={shown ? RED : BEIGE} size={42} color={shown ? WHITE : PINK} /> : <MixedText text={w.text} size={52} color={active ? RED : CHAR} />}
          </div>
        );
      })}
    </div>
  );
};

// Transition : des pastilles traversent l'écran et le couvrent un instant
const PillWipe: React.FC<{ t: number; at: number; k: number }> = ({ t, at, k }) => {
  if (t < at - 12 || t > at + 14) return null;
  const dir = k % 2 ? -1 : 1;
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => {
        const d = (i % 3) * 1.5;
        const x = interpolate(t, [at - 11 + d, at - 1, at + 1, at + 11 + d], [-2400, -300, -300, 1900], { ...clamp, easing: Easing.bezier(0.6, 0, 0.4, 1) });
        return <div key={i} style={{ position: "absolute", top: -40 + i * 290, left: dir * x + (dir < 0 ? -600 : 0), width: 1700, height: 300, borderRadius: 999, backgroundColor: [RED, PINK, CHAR][(i + k) % 3], zIndex: 40 }} />;
      })}
    </>
  );
};

type S = [string, number, number, number];
const SFX: S[] = [
  ["cc/pop.wav", 1, 6, 0.6],
  ["cc/whoosh.wav", s(0.9), 15, 0.5],
  ["ame/boom.wav", s(1.0), 40, 0.4],
  ["cc/pop.wav", s(1.5), 6, 0.5],
  ["cc/ding.wav", s(2.2), 30, 0.35],
  ["regard/riser.wav", s(3.0), 30, 0.3],
  ["ame/boom.wav", s(4.0), 60, 0.5],
  ["regard/sub.wav", s(4.0), 27, 0.5],
  ["cc/pop.wav", s(6.23), 6, 0.5],
  ["regard/snap.wav", s(6.5), 4, 0.6],
  ["cc/ding.wav", s(7.0), 30, 0.35],
  ["cc/pop.wav", s(8.06), 6, 0.55],
  ["ame/unfold.wav", s(9.9), 30, 0.45],
  ...Array.from({ length: 9 }).map((_, i) => ["cc/pop.wav", s(11.0) + i * 3, 6, 0.35] as S),
  ["cc/typing.wav", s(13.36), 30, 0.35],
  ...[0, 2, 4, 6, 8].map((i) => ["cc/click.wav", s(14.08) + i * 3, 3, 0.5] as S),
  ["regard/glitch.wav", s(15.2), 8, 0.35],
  ["cc/ding.wav", s(15.6), 30, 0.35],
  ["ame/zoom.wav", s(16.8), 9, 0.5],
  ...[0, 5, 10, 14].map((d) => ["cc/pop.wav", s(18.55) + d, 6, 0.45] as S),
  ["cc/whoosh.wav", s(19.7), 15, 0.45],
  ["regard/shutter.wav", s(19.98), 8, 0.5],
  ["cc/pop.wav", s(20.8), 6, 0.5],
  ["ame/shimmer.wav", s(21.2), 50, 0.4],
  ["ame/boom.wav", s(23.61), 40, 0.4],
  ["regard/swish.wav", s(24.5), 12, 0.6],
  ["regard/riser.wav", s(24.6), 32, 0.3],
  ["cc/ding.wav", s(25.7), 30, 0.4],
  ["cc/pop.wav", s(26.44), 6, 0.5],
  ...[0, 1, 2, 3].map((i) => ["regard/tick.wav", s(26.7) + i * 4, 4, 0.5] as S),
  ["regard/riser.wav", s(28.3), 55, 0.35],
  ["ame/boom.wav", s(30.2), 50, 0.45],
  ["cc/pop.wav", s(30.4), 6, 0.5],
  ["cc/whoosh.wav", s(31.9), 15, 0.45],
  ["cc/whoosh.wav", s(32.8), 15, 0.45],
  ["cc/pop.wav", s(34.3), 6, 0.5],
  ["regard/ticktock.wav", s(34.9), 28, 0.4],
  ["cc/pop.wav", s(35.45), 6, 0.5],
  ["cc/pop.wav", s(36.41), 6, 0.55],
  ["regard/bell.wav", s(37.4), 40, 0.35],
  ["regard/heart.wav", s(37.5), 30, 0.5],
  ...CUT.slice(1).map((c) => ["cc/whoosh.wav", c - 9, 15, 0.45] as S),
  ["ame/shimmer.wav", OUT, 60, 0.35],
  ["ame/boom.wav", OUT + 62, 60, 0.4],
  ...[0, 1, 2].map((i) => ["cc/pop.wav", OUT + 58 + i * 6, 6, 0.45] as S),
  ...[0, 1, 2].map((i) => ["cc/click.wav", OUT + 88 + i * 14, 3, 0.6] as S),
];

const SCENES = [S0, S1, S2, S3, S4, S5, S6, S7];

export const Fable52: React.FC = () => {
  const t = useCurrentFrame();
  let i = 0;
  while (i < 7 && t >= CUT[i + 1]) i++;
  const Scene = SCENES[i];
  return (
    <AbsoluteFill style={{ backgroundColor: WHITE, overflow: "hidden" }}>
      {t < OUT ? (
        <>
          {/* trame fine, plus visible en haut à droite */}
          <AbsoluteFill style={{ backgroundImage: `linear-gradient(${BEIGE} 2px, transparent 2px), linear-gradient(90deg, ${BEIGE} 2px, transparent 2px)`, backgroundSize: "60px 60px", WebkitMaskImage: "radial-gradient(circle at 100% 0%, black 0%, transparent 60%)", maskImage: "radial-gradient(circle at 100% 0%, black 0%, transparent 60%)" }} />
          <Scene t={t} />
          <Captions t={t} />
          {/* logo Creofan en haut au centre */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 236, display: "flex", justifyContent: "center", zIndex: 20 }}>
            <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 76, height: 76 }} />
          </div>
          {/* pied : WhatsApp */}
          <div style={{ position: "absolute", left: L, width: RG - L, top: 1480, display: "flex", justifyContent: "center", zIndex: 20 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 12, backgroundColor: BEIGE, borderRadius: 999, padding: "10px 26px", fontFamily: FONT, fontWeight: 600, fontSize: 26, color: CHAR }}>
              <svg width={28} height={28} viewBox="0 0 24 24"><path d="M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2C11 19.5 4.5 13 4.5 5a2 2 0 0 1 2-2z" fill={RED} /></svg>
              +216 51 097 272
            </span>
          </div>
        </>
      ) : (
        <Outro t={t} />
      )}
      {CUT.slice(1).map((c, k) => (
        <PillWipe key={c} t={t} at={c} k={k} />
      ))}
      <Audio src={staticFile("fable/voix.mp3")} />
      <Loop durationInFrames={1020}>
        <Audio src={staticFile("cc/music.mp3")} volume={0.13} />
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
export const CoverFable: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: WHITE, overflow: "hidden" }}>
    <AbsoluteFill style={{ backgroundImage: `linear-gradient(${BEIGE} 2px, transparent 2px), linear-gradient(90deg, ${BEIGE} 2px, transparent 2px)`, backgroundSize: "60px 60px", WebkitMaskImage: "radial-gradient(circle at 100% 0%, black 0%, transparent 60%)", maskImage: "radial-gradient(circle at 100% 0%, black 0%, transparent 60%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
      <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 76, height: 76 }} />
    </div>
    <Row y={430}><MixedText text="كلود ميتنفّسش!" size={120} color={CHAR} /></Row>
    <At x={CX} y={690}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 18, backgroundColor: BEIGE, borderRadius: 999, padding: "14px 44px 14px 16px" }}>
        <ClaudeLogo size={84} />
        <Big size={70} color={CHAR}>Claude Fable</Big>
      </span>
    </At>
    <At x={CX} y={980}><Extrude text="5.2" size={460} ry={-22} depth={18} /></At>
    <At x={CX + 250} y={800} r={8}><Pill text="جديد ✦" c={RED} size={56} /></At>
    <Row y={1290}><Pill text="1000 Agents · 3D · +30%" c={CHAR} size={46} /></Row>
  </AbsoluteFill>
);
