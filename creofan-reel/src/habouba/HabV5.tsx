import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Loop, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { MixedText } from "../components";
import { OutroIcon } from "../outro/OutroIcon";
import { HAB_SVG } from "./habSvg";
import { HAB2_ENV as HAB_ENV } from "./habEnv2";
import { HAB2_VOICE as HAB_VOICE } from "./habData2";
import "../theme";

// CREOFAN × HABOUBA — la mascotte présente, sur fond rouge Creofan à cercles concentriques (réf. « wait!!! »).
// Le rig SVG est utilisé tel quel : seuls data-l / data-r / data-v et les classes sont pilotés.
const FPS = 30;
const RED = "#f7322a";
const PINK = "#fa8985";
const BEIGE = "#fff5f5";
const CHAR = "#1A1A1A";
const WHITE = "#ffffff";
const FONT = "Poppins, sans-serif";
const OUT = 690;
export const HAB5_TOTAL = 810;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number, a: number, d: number, e = Easing.bezier(0.65, 0, 0.35, 1)) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: e });
const el = (t: number, a: number, damping = 11) => (t < a ? 0 : spring({ frame: t - a, fps: FPS, config: { damping, stiffness: 170, mass: 0.8 } }));

// Visèmes (méthode du skill) : r = amplitude ; closed < 0.1 ≤ mid < 0.3 ≤ open < 0.65 ≤ o
const visemeAt = (t: number) => {
  const e = (f: number) => HAB_ENV[Math.max(0, Math.min(HAB_ENV.length - 1, f))] ?? 0;
  const r = Math.max(e(t), e(t - 1) * 0.9);
  return r < 0.1 ? "closed" : r < 0.3 ? "mid" : r < 0.65 ? "open" : "o";
};

const Habouba: React.FC<{ t: number; l: string; r: string; wiggle?: boolean; talking: boolean; width: number }> = ({ t, l, r, wiggle, talking, width }) => {
  const v = talking ? visemeAt(t) : "closed";
  let svg = HAB_SVG
    .replace('data-l="hips"', `data-l="${l}"`)
    .replace('data-r="hips"', `data-r="${r}"`)
    .replace('<g id="mouth" data-v="mid">', `<g id="mouth" data-v="${v}">`)
    .replace('<svg id="habouba-svg"', `<svg id="habouba-svg" class="${wiggle ? "wiggle" : ""}" style="--t:${(t / FPS).toFixed(3)}"`)
    .replace(/width="[^"]*"\s/, "");
  svg = svg.replace('<style>', `<style>
#habouba-svg .eo,#habouba-svg .ec,#habouba-svg.wiggle .rot{animation-play-state:paused !important;animation-delay:calc(var(--t) * -1s) !important}`);
  return <div style={{ width, height: width * 0.93 }} dangerouslySetInnerHTML={{ __html: svg.replace('<svg id="habouba-svg"', `<svg width="${width}" height="${width * 0.93}" id="habouba-svg"`) }} />;
};


const Big: React.FC<{ size: number; color: string; children: React.ReactNode }> = ({ size, color, children }) => (
  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 0.95, letterSpacing: -size * 0.035, color, whiteSpace: "nowrap" }}>{children}</div>
);
const SH = "0 14px 40px rgba(26,26,26,0.14)";
const BZ = Easing.bezier(0.22, 1.4, 0.36, 1);
const POPB = Easing.bezier(0.34, 1.56, 0.64, 1);
const rig = (t: number, hw: number, l: string, r: string, wiggle = false) => <Habouba t={t} l={l} r={r} wiggle={wiggle} talking width={hw} />;


const SOFT = "rgba(247,50,42,0.10)";
const LogoTop: React.FC<{ onRed?: boolean }> = ({ onRed }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 112, display: "flex", justifyContent: "center", zIndex: 40 }}>
    <div style={{ width: 92, height: 92, borderRadius: 99, backgroundColor: onRed ? WHITE : RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 70, height: 70, filter: onRed ? "none" : "brightness(0) invert(1)" }} />
    </div>
  </div>
);

// ---------- décors ----------
const Decor: React.FC<{ kind: string; lf: number }> = ({ kind, lf }) => {
  const k = ease(lf, 0, 18, Easing.out(Easing.cubic));
  if (kind === "bands" || kind === "bands2") {
    const f = kind === "bands" ? 1 : -1;
    return (
      <>
        {[{ y: 560, h: 230, c: SOFT }, { y: 860, h: 170, c: "rgba(250,137,133,0.22)" }, { y: 1100, h: 230, c: SOFT }].map((b, i) => (
          <div key={i} style={{ position: "absolute", left: -300 + f * (1 - k) * 900, top: b.y, width: 1700, height: b.h, backgroundColor: b.c, transform: `rotate(${f * -16}deg)` }} />
        ))}
      </>
    );
  }
  if (kind === "corners") {
    return (
      <>
        <div style={{ position: "absolute", left: 1080 - 420 * k, top: 280 - 420 * k, width: 840, height: 840, borderRadius: "50%", backgroundColor: "rgba(250,137,133,0.22)" }} />
        <div style={{ position: "absolute", left: -420 + 420 * (1 - (1 - k)) * 0 - (1 - k) * 420, top: 1260, width: 900, height: 900, borderRadius: "50%", backgroundColor: SOFT }} />
      </>
    );
  }
  if (kind === "rays") {
    return <div style={{ position: "absolute", left: 540 - 1300, top: 880 - 1300, width: 2600, height: 2600, borderRadius: "50%", background: `repeating-conic-gradient(from ${lf * 0.4}deg, rgba(247,50,42,0.09) 0deg 10deg, rgba(247,50,42,0) 10deg 20deg)`, opacity: k }} />;
  }
  return null;
};

// ---------- apparitions façon Béto : onde fine + étincelles ----------
const Burst: React.FC<{ lf: number; x: number; y: number }> = ({ lf, x, y }) => {
  if (lf < 0 || lf > 30) return null;
  const rings = [0, 6].map((d, i) => {
    const q = (lf - d) / 22;
    if (q < 0 || q > 1) return null;
    const r = 40 + q * 330;
    return <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", border: `4px solid rgba(247,50,42,${0.7 * (1 - q)})` }} />;
  });
  const dots = Array.from({ length: 12 }, (_, i) => {
    const q = lf / 26;
    if (q > 1) return null;
    const ang = (i / 12) * Math.PI * 2 + 0.3;
    const d = 120 + q * (200 + (i % 3) * 60);
    const sz = (10 + (i % 3) * 5) * (1 - q);
    return <div key={i} style={{ position: "absolute", left: x + Math.cos(ang) * d - sz / 2, top: y + Math.sin(ang) * d - sz / 2, width: sz, height: sz, borderRadius: i % 2 ? "50%" : 3, backgroundColor: i % 3 === 0 ? CHAR : RED, transform: `rotate(${i * 30}deg)` }} />;
  });
  return <>{rings}{dots}</>;
};

type Ent = "pop" | "slideL" | "slideR" | "drop" | "zoom";
type Sc = { vs: number; ve: number; x: number; hw: number; foot: number; ent: Ent; decor: string; g: [number, string, string, boolean][]; bub: { text: string; emo: string; x: number; y: number } };
const SCS: Sc[] = [
  { vs: 36, ve: 117, x: 540, hw: 660, foot: 1260, ent: "pop", decor: "plain", g: [[0, "hips", "wave", true], [40, "hips", "open", false]], bub: { text: "اي اجا", emo: "👋", x: 540, y: 560 } },
  { vs: 117, ve: 156, x: 400, hw: 780, foot: 1330, ent: "slideL", decor: "bands", g: [[0, "hips", "up", false], [20, "hips", "wave", true]], bub: { text: "أنا حبوبة", emo: "", x: 770, y: 560 } },
  { vs: 156, ve: 212, x: 690, hw: 780, foot: 1330, ent: "drop", decor: "bands2", g: [[0, "open", "hips", false], [30, "open", "open", false]], bub: { text: "Claude", emo: "✳", x: 290, y: 560 } },
  { vs: 257, ve: 348, x: 610, hw: 720, foot: 1280, ent: "pop", decor: "corners", g: [[0, "hips", "hips", false], [45, "hips", "up", false]], bub: { text: "سر بيناتنا", emo: "🤫🔒", x: 380, y: 520 } },
  { vs: 348, ve: 427, x: 540, hw: 1000, foot: 1420, ent: "zoom", decor: "rays", g: [[0, "open", "open", false], [36, "open", "up", false], [60, "up", "open", false]], bub: { text: "أكثر من هكا", emo: "🚀", x: 540, y: 400 } },
  { vs: 427, ve: 484, x: 350, hw: 740, foot: 1300, ent: "slideR", decor: "bands", g: [[0, "hips", "up", false], [30, "open", "up", false]], bub: { text: "حاجة جديدة", emo: "✨", x: 760, y: 540 } },
  { vs: 484, ve: 539, x: 730, hw: 740, foot: 1300, ent: "pop", decor: "corners", g: [[0, "open", "open", false], [30, "open", "wave", true]], bub: { text: "المرة الجاية", emo: "🗓️", x: 320, y: 540 } },
];
const HabScene: React.FC<{ t: number; sc: Sc }> = ({ t, sc }) => {
  const lf = t - sc.vs;
  const g = [...sc.g].reverse().find((x) => lf >= x[0]) ?? sc.g[0];
  const HH = sc.hw * 0.93;
  const k = lf < 0 ? 0 : spring({ frame: lf, fps: FPS, config: { damping: sc.ent === "drop" ? 8 : 11, stiffness: 150, mass: 0.9 } });
  let dx = 0, dy = 0, scl = 1, op = Math.min(1, Math.max(0, lf / 4 + 0.2));
  if (sc.ent === "pop") scl = 0.35 + 0.65 * k;
  if (sc.ent === "zoom") scl = 0.15 + 0.85 * k;
  if (sc.ent === "slideL") dx = -(1 - k) * 900;
  if (sc.ent === "slideR") dx = (1 - k) * 900;
  if (sc.ent === "drop") dy = -(1 - k) * 1300;
  const bob = Math.sin(t / 9) * 5;
  const top = sc.foot - HH;
  const cx = sc.x, cy = top + HH * 0.5;
  const bk = lf < 12 ? 0 : interpolate(lf - 12, [0, 14], [0, 1], { ...clamp, easing: POPB });
  const fl = Math.sin(lf / 8) * 6;
  // dramatique : léger zoom lent sur la durée
  const push = 1 + 0.06 * Math.min(1, lf / (sc.ve - sc.vs));
  return (
    <AbsoluteFill>
      <Decor kind={sc.decor} lf={lf} />
      <div style={{ position: "absolute", left: cx - sc.hw * 0.3 + dx, top: sc.foot - 14, width: sc.hw * 0.6, height: sc.hw * 0.05, borderRadius: "50%", backgroundColor: "rgba(26,26,26,0.10)", opacity: op }} />
      <div style={{ position: "absolute", left: cx - sc.hw / 2 + dx, top: top + dy + bob, opacity: op, transform: `scale(${scl * push})`, transformOrigin: "50% 100%" }}>{rig(t, sc.hw, g[1], g[2], g[3])}</div>
      <Burst lf={lf} x={cx} y={cy} />
      <div dir="rtl" style={{ position: "absolute", left: sc.bub.x - 300, width: 600, top: sc.bub.y + fl, display: "flex", justifyContent: "center", transform: `scale(${bk})` }}>
        <div style={{ backgroundColor: WHITE, border: `6px solid ${RED}`, borderRadius: 60, boxShadow: SH, padding: "8px 36px 16px", display: "flex", alignItems: "center", gap: 14, whiteSpace: "nowrap" }}>
          <MixedText text={sc.bub.text} size={78} color={RED} />{sc.bub.emo ? <span style={{ fontSize: 66 }}>{sc.bub.emo}</span> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- transition : bandes diagonales qui balaient l'écran ----------
const Swipe: React.FC<{ t: number; s: number }> = ({ t, s }) => {
  const lf = t - s;
  if (lf < 0 || lf > 22) return null;
  const e = (d: number) => interpolate(lf - d, [0, 16], [-1100, 2400], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <>
      <div style={{ position: "absolute", left: e(0), top: -400, width: 1500, height: 2800, backgroundColor: RED, transform: "rotate(18deg)", zIndex: 30 }} />
      <div style={{ position: "absolute", left: e(3) - 160, top: -400, width: 1500, height: 2800, backgroundColor: PINK, transform: "rotate(18deg)", zIndex: 29 }} />
    </>
  );
};

// ---------- plans rouges façon WAIT ----------
const Stack: React.FC<{ text: string; size: number; t: number; a: number; emo?: string }> = ({ text, size, t, a, emo }) => {
  const lf = t - a;
  const k = interpolate(lf, [0, 8], [0, 1], { ...clamp, easing: BZ });
  const sc = 2.4 - 1.4 * k;
  const sx = Math.sin(lf * 12.9) * 4 * (1 - Math.min(1, lf / 24)), sy = Math.cos(lf * 9.7) * 4 * (1 - Math.min(1, lf / 24));
  const o: React.CSSProperties = { color: "transparent", WebkitTextStroke: `5px ${WHITE}` };
  const row = (style: React.CSSProperties, key: number) => <div key={key} style={{ lineHeight: 1.05 }}><MixedText text={text} size={size} color={WHITE} style={style} /></div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `translate(${sx}px,${sy}px) scale(${sc})`, opacity: Math.min(1, lf / 3 + 0.2) }}>
      {row(o, 0)}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>{row({}, 1)}{emo ? <span style={{ fontSize: size * 0.6 }}>{emo}</span> : null}</div>
      {row(o, 2)}
    </div>
  );
};
const RedPlan: React.FC<{ t: number; a: number; b: number | null; kind: "q" | "rd2" }> = ({ t, a, b, kind }) => {
  const inn = ease(t, a, 6, Easing.out(Easing.cubic));
  const out = b === null ? 0 : ease(t, b, 6, Easing.in(Easing.cubic));
  const y = (1 - inn) * 100 - out * 100;
  const cta = t >= 579;
  const heart = 1 + Math.sin(t / 4) * 0.12;
  const cur = Math.floor(t / 12) % 2 === 0;
  return (
    <AbsoluteFill style={{ backgroundColor: RED, transform: `translateY(${y}%)`, zIndex: 20 }}>
      <LogoTop onRed />
      {kind === "q" ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 960 - 330, display: "flex", justifyContent: "center" }}><Stack text="كيفاه؟" size={300} t={t} a={a + 4} /></div>
      ) : !cta ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 960 - 330, display: "flex", justifyContent: "center" }}><Stack text="استنوني" size={260} t={t} a={a + 4} emo="⏳" /></div>
      ) : (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center" }}><Stack text="شجعني" size={135} t={t} a={579} emo="❤️" /></div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center", transform: `scale(${el(t, 592, 10)})` }}>
            <div dir="rtl" style={{ backgroundColor: WHITE, borderRadius: 999, padding: "10px 46px 20px", display: "flex", alignItems: "center", gap: 18, whiteSpace: "nowrap" }}>
              <MixedText text="كومنتي بـ : حبوبة" size={84} color={RED} /><span style={{ fontSize: 70, transform: `scale(${heart})`, display: "inline-block" }}>💬</span><div style={{ width: 6, height: 72, backgroundColor: cur ? RED : "transparent" }} />
            </div>
          </div>
          <div style={{ position: "absolute", left: 540 - 300, top: 1060, width: 600, height: 380, borderRadius: 60, backgroundColor: BEIGE, overflow: "hidden", transform: `scale(${el(t, 604, 9)})` }}>
            <div style={{ position: "absolute", left: 300 - 360, top: -10 + Math.sin(t / 9) * 4 }}>{rig(t, 720, "hips", "wave", true)}</div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

// ---------- WAIT (hook) ----------
const WaitHook: React.FC<{ t: number }> = ({ t }) => {
  const st = Math.floor(t / 4) % 3;
  const k = interpolate(t, [0, 8], [0, 1], { ...clamp, easing: BZ });
  const sc = 2.4 - 1.4 * k;
  const sx = Math.sin(t * 12.9) * 4 * (1 - Math.min(1, t / 30)), sy = Math.cos(t * 9.7) * 4 * (1 - Math.min(1, t / 30));
  const wipe = ease(t, 30, 6, Easing.in(Easing.cubic));
  const base: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, fontSize: 300, letterSpacing: -10, lineHeight: 1, whiteSpace: "nowrap" };
  const glitch = t % 4 < 2 ? 22 : -18;
  return (
    <AbsoluteFill style={{ backgroundColor: RED, transform: `translateY(${-wipe * 100}%)`, zIndex: 20 }}>
      <LogoTop onRed />
      <div style={{ position: "absolute", left: 0, right: 0, top: 960 - 180, display: "flex", justifyContent: "center", transform: `translate(${sx}px,${sy}px) scale(${sc})` }}>
        {st === 0 ? <div style={{ ...base, color: WHITE }}>WAIT</div> : null}
        {st === 1 ? (<div style={{ position: "relative" }}><div style={{ ...base, color: RED, WebkitTextStroke: `3px ${WHITE}` }}>WAIT</div><div style={{ position: "absolute", left: glitch, top: 0, ...base, color: RED, WebkitTextStroke: `3px ${WHITE}`, clipPath: "inset(40% 0 38% 0)" }}>WAIT</div></div>) : null}
        {st === 2 ? <div style={{ backgroundColor: BEIGE, borderRadius: 40, padding: "10px 60px 24px" }}><div style={{ ...base, color: RED }}>WAIT</div></div> : null}
      </div>
    </AbsoluteFill>
  );
};

const SWIPES = [109, 148, 340, 419, 476];
export const HabV5: React.FC = () => {
  const t = useCurrentFrame();
  const inOutro = t >= OUT;
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      {!inOutro ? (
        <>
          <LogoTop />
          {SCS.map((sc, i) => (t >= sc.vs && t < sc.ve ? <HabScene key={i} t={t} sc={sc} /> : null))}
          {SWIPES.map((s) => <Swipe key={s} t={t} s={s} />)}
          {t >= 206 && t < 264 ? <RedPlan t={t} a={206} b={257} kind="q" /> : null}
          {t >= 533 ? <RedPlan t={t} a={533} b={null} kind="rd2" /> : null}
          {t < 36 ? <WaitHook t={t} /> : null}
        </>
      ) : (
        <AbsoluteFill style={{ backgroundColor: RED }}><OutroIcon f={t - OUT} fg={WHITE} bg="transparent" size={460} cy={860} /></AbsoluteFill>
      )}
      <Audio src={staticFile(HAB_VOICE)} />
      <Loop durationInFrames={1020}><Audio src={staticFile("cc/music.mp3")} volume={0.07} /></Loop>
      <Sequence from={0} durationInFrames={21}><Audio src={staticFile("habouba/sfx-boom.wav")} volume={0.7} /></Sequence>
      {[2, 6, 10, 14, 19, 24, 28].map((f) => <Sequence key={f} from={f} durationInFrames={4}><Audio src={staticFile("habouba/sfx-click.wav")} volume={0.35} /></Sequence>)}
      {SCS.map((sc) => <Sequence key={sc.vs} from={sc.vs + 3} durationInFrames={20}><Audio src={staticFile("habouba/sfx-boing.wav")} volume={0.3} /></Sequence>)}
      {SCS.map((sc) => <Sequence key={"p" + sc.vs} from={sc.vs + 12} durationInFrames={15}><Audio src={staticFile("cc/pop.wav")} volume={0.3} /></Sequence>)}
      {[...SWIPES, 206, 257, 533].map((f) => <Sequence key={"w" + f} from={f} durationInFrames={14}><Audio src={staticFile("habouba/sfx-whoosh.wav")} volume={0.4} /></Sequence>)}
      <Sequence from={579} durationInFrames={20}><Audio src={staticFile("habouba/sfx-boom.wav")} volume={0.45} /></Sequence>
    </AbsoluteFill>
  );
};
void CHAR; void PINK; void RED; void BEIGE; void Big; void HAB_ENV;

// Couverture Reel (1080×1920, zone centrale 4:5 pour la grille)
export const CoverHab5: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
    <Decor kind="bands" lf={99} />
    <LogoTop />
    <div style={{ position: "absolute", left: 540 - 500, top: 270, width: 1000, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }} dir="rtl">
      <div style={{ backgroundColor: RED, borderRadius: 70, padding: "6px 56px 22px" }}><MixedText text="شكون حبوبة؟" size={150} color={WHITE} /></div>
      <div style={{ backgroundColor: WHITE, border: `6px solid ${RED}`, borderRadius: 60, padding: "4px 40px 14px", boxShadow: SH }}><MixedText text="سر بيناتنا 🤫" size={78} color={RED} /></div>
    </div>
    <div style={{ position: "absolute", left: 540 - 400, top: 675, width: 800 }}>{rig(0, 800, "hips", "wave", false)}</div>
    <div style={{ position: "absolute", left: 540 - 230, top: 1385, width: 460, height: 42, borderRadius: "50%", backgroundColor: "rgba(26,26,26,0.10)" }} />
  </AbsoluteFill>
);
