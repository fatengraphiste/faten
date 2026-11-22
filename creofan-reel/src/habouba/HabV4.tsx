import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Loop, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
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
const OUT = 702;
export const HAB4_TOTAL = 810;
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

// ---------- BEAT 1 : WAIT stop-scroll (0 → 1,2 s) ----------
const WaitHook: React.FC<{ t: number }> = ({ t }) => {
  const st = Math.floor(t / 4) % 3;
  const k = interpolate(t, [0, 8], [0, 1], { ...clamp, easing: BZ });
  const sc = 2.4 - 1.4 * k;
  const sx = Math.sin(t * 12.9) * 4 * (1 - Math.min(1, t / 30)), sy = Math.cos(t * 9.7) * 4 * (1 - Math.min(1, t / 30));
  const wipe = ease(t, 30, 6, Easing.in(Easing.cubic));
  const base: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, fontSize: 300, letterSpacing: -10, lineHeight: 1, whiteSpace: "nowrap" };
  const glitch = t % 4 < 2 ? 22 : -18;
  return (
    <AbsoluteFill style={{ backgroundColor: RED, transform: `translateY(${-wipe * 100}%)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 960 - 180, display: "flex", justifyContent: "center", transform: `translate(${sx}px,${sy}px) scale(${sc})` }}>
        {st === 0 ? <div style={{ ...base, color: WHITE }}>WAIT</div> : null}
        {st === 1 ? (
          <div style={{ position: "relative" }}>
            <div style={{ ...base, color: RED, WebkitTextStroke: `3px ${WHITE}` }}>WAIT</div>
            <div style={{ position: "absolute", left: glitch, top: 0, ...base, color: RED, WebkitTextStroke: `3px ${WHITE}`, clipPath: "inset(40% 0 38% 0)" }}>WAIT</div>
          </div>
        ) : null}
        {st === 2 ? <div style={{ backgroundColor: BEIGE, borderRadius: 40, padding: "10px 60px 24px" }}><div style={{ ...base, color: RED }}>WAIT</div></div> : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------- BEAT 2 : bulle « عسلامة » (1,2 → 3,2 s) ----------
const ChatBubble: React.FC<{ t: number }> = ({ t }) => {
  const a = 39;
  const k = t < a ? 0 : spring({ frame: t - a, fps: FPS, config: { mass: 0.8, stiffness: 280, damping: 16 } });
  const out = ease(t, 90, 6);
  const morph = ease(t, a + 9, 8);
  const w = 200 + 380 * morph, h = 170;
  return (
    <div style={{ position: "absolute", left: 540 - w / 2, top: 760 - h / 2, width: w, height: h, borderRadius: 90, backgroundColor: WHITE, border: `7px solid ${RED}`, boxShadow: SH, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k * (1 - out)})`, transformOrigin: "20% 100%" }}>
      <div style={{ position: "absolute", left: 40, bottom: -26, width: 40, height: 40, backgroundColor: WHITE, borderRight: `7px solid ${RED}`, borderBottom: `7px solid ${RED}`, transform: "rotate(45deg) skew(10deg,10deg)" }} />
      {morph < 0.5 ? (
        <div style={{ display: "flex", gap: 16, opacity: 1 - morph * 2 }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 24, height: 24, borderRadius: 99, backgroundColor: RED, transform: `translateY(${Math.sin((t - i * 3) / 3) * -8}px)` }} />)}</div>
      ) : (
        <div dir="rtl" style={{ opacity: (morph - 0.5) * 2, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 18 }}><MixedText text="عسلامة" size={118} color={RED} /><span style={{ fontSize: 96 }}>👋</span></div>
      )}
    </div>
  );
};

// ---------- BEAT 3 : peek-a-boo haut → droite → gauche ----------
const PEEKS = [
  { a: 96, b: 117, hw: 600, side: "top", tilt: 12, l: "hips", r: "wave" },
  { a: 117, b: 138, hw: 720, side: "right", tilt: -10, l: "hips", r: "up" },
  { a: 138, b: 165, hw: 720, side: "left", tilt: 12, l: "open", r: "hips" },
] as const;
const Peek: React.FC<{ t: number; p: (typeof PEEKS)[number] }> = ({ t, p }) => {
  const lf = t - p.a;
  const k = lf < 0 ? 0 : spring({ frame: lf, fps: FPS, config: { damping: 9, stiffness: 260, mass: 0.7 } });
  const out = ease(t, p.b - 3, 3);
  const HH = p.hw * 0.93;
  const show = 340 * k * (1 - out); // dépassement visible depuis le bord (px)
  const tilt = Math.sin(lf / 2.2) * p.tilt * (1 - out);
  let cx = 540, cy = 0, rot = 0;
  if (p.side === "top") { rot = 180 + tilt; cx = 540; cy = show - 10 - HH / 2 + 30; }       // turban vers le bas
  if (p.side === "right") { rot = -90 + tilt; cx = 1080 + HH / 2 - show; cy = 800; }       // turban vers la gauche
  if (p.side === "left") { rot = 90 + tilt; cx = -HH / 2 + show; cy = 930; }              // turban vers la droite
  return <div style={{ position: "absolute", left: cx - p.hw / 2, top: cy - HH / 2, transform: `rotate(${rot}deg)`, transformOrigin: "50% 50%" }}>{rig(t, p.hw, p.l, p.r, p.side === "top")}</div>;
};
const ClaudeBadge: React.FC<{ t: number }> = ({ t }) => {
  const k = el(t, 138, 9) * (1 - ease(t, 160, 6));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", transform: `scale(${k})` }}>
      <div style={{ backgroundColor: RED, borderRadius: 999, padding: "8px 52px 16px", display: "flex", alignItems: "center", gap: 18 }}><Big size={96} color={WHITE}>Claude</Big><span style={{ color: WHITE, fontSize: 90, fontFamily: FONT, fontWeight: 800 }}>✳</span></div>
    </div>
  );
};

// ---------- BEAT 4 : scène centrale + bulles ----------
const CY = 1130, HW = 860, R0 = HW * 0.4;
const KEY: { a: number; side: "r" | "l"; text: string; emo: string }[] = [
  { a: 210, side: "r", text: "كيفاه؟", emo: "🤔" },
  { a: 270, side: "l", text: "سر بيناتنا", emo: "🤫🔒" },
  { a: 345, side: "r", text: "أكثر من هكا", emo: "🚀" },
  { a: 435, side: "l", text: "حاجة جديدة", emo: "✨" },
  { a: 525, side: "r", text: "استنوني", emo: "⏳" },
];
const GEST: [number, string, string, boolean][] = [
  [165, "hips", "wave", true],
  [206, "hips", "up", false],
  [256, "hips", "hips", false],
  [340, "open", "up", false],
  [380, "up", "open", false],
  [420, "open", "wave", true],
  [530, "open", "open", false],
];
const Stage: React.FC<{ t: number }> = ({ t }) => {
  const g = [...GEST].reverse().find((x) => t >= x[0]) ?? GEST[0];
  const s0 = t < 165 ? 0.1 : 0.1 + 0.9 * spring({ frame: t - 165, fps: FPS, config: { damping: 7, stiffness: 120, mass: 0.9 } });
  const push = ease(t, 555, 14, Easing.inOut(Easing.cubic));
  const bob = Math.sin(t / 9) * 5;
  const HH = HW * 0.93;
  const lean = (t >= 568 ? Math.min(1, (t - 568) / 8) : 0) * 3;
  const rg = <div style={{ position: "absolute", left: 540 - HW / 2, top: CY - HH + 0.11 * HW + bob, transform: `rotate(${lean}deg)`, transformOrigin: `50% 90%` }}>{rig(t, HW, g[1], g[2], g[3] || t >= 555)}</div>;
  const tx = -push * 280, sc = s0 * (1 - 0.12 * push);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateX(${tx}px) scale(${sc})`, transformOrigin: `540px ${CY}px` }}>
      <div style={{ position: "absolute", left: 540 - R0 * 0.9, top: CY + R0 + 8, width: R0 * 1.8, height: R0 * 0.16, borderRadius: "50%", backgroundColor: "rgba(26,26,26,0.10)" }} />
      <div style={{ position: "absolute", left: 540 - R0, top: CY - R0, width: 2 * R0, height: 2 * R0, borderRadius: "50%", backgroundColor: RED }} />
      <div style={{ position: "absolute", left: 540 - R0 * 0.86, top: CY - R0 * 0.86, width: 1.72 * R0, height: 1.72 * R0, borderRadius: "50%", border: `9px solid rgba(255,255,255,0.55)` }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: CY, overflow: "hidden" }}>{rg}</div>
      <div style={{ position: "absolute", left: 0, top: CY, width: 1080, height: 1920 - CY, overflow: "hidden", clipPath: `circle(${R0}px at 540px 0px)` }}><div style={{ position: "absolute", left: 0, top: -CY }}>{rg}</div></div>
    </div>
  );
};
const KeyBubble: React.FC<{ t: number; i: number }> = ({ t, i }) => {
  const b = KEY[i];
  const end = i < KEY.length - 1 ? KEY[i + 1].a : 555;
  if (t < b.a || t > end + 8) return null;
  const k = interpolate(t - b.a, [0, 14], [0, 1], { ...clamp, easing: POPB });
  const out = ease(t, end, 8);
  const fl = Math.sin((t - b.a) / 8) * 6;
  const x = b.side === "r" ? 850 : 230;
  const ph = (1 - ease(t, 555, 14)) ;
  return (
    <div dir="rtl" style={{ position: "absolute", left: x - 200, top: 430 + fl, width: 400, display: "flex", justifyContent: "center", transform: `scale(${k * (1 - out) * ph})` }}>
      <div style={{ backgroundColor: WHITE, border: `6px solid ${RED}`, borderRadius: 56, boxShadow: SH, padding: "8px 30px 16px", display: "flex", alignItems: "center", gap: 14, whiteSpace: "nowrap" }}>
        <MixedText text={b.text} size={70} color={RED} /><span style={{ fontSize: 60 }}>{b.emo}</span>
      </div>
    </div>
  );
};

// ---------- BEAT 5 : carte CTA poussée par Habouba ----------
const CTA = { w: 680, h: 420, cy: 1010 };
const Cta: React.FC<{ t: number }> = ({ t }) => {
  if (t < 555) return null;
  const slide = ease(t, 568, 20, Easing.out(Easing.cubic));
  const cx = 1500 - (1500 - 700) * slide;
  const grow = ease(t, 690, 12, Easing.inOut(Easing.cubic));
  const left = (cx - CTA.w / 2) * (1 - grow), top = (CTA.cy - CTA.h / 2) * (1 - grow);
  const w = CTA.w + (1080 - CTA.w) * grow, h = CTA.h + (1920 - CTA.h) * grow;
  const heart = 1 + Math.sin(t / 4) * 0.12;
  const cur = Math.floor(t / 12) % 2 === 0;
  return (
    <div style={{ position: "absolute", left, top, width: w, height: h, borderRadius: 56 * (1 - grow), backgroundColor: RED, border: `${10 * (1 - grow)}px solid ${WHITE}`, boxSizing: "border-box", boxShadow: grow < 1 ? SH : "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: 40, width: 560, top: grow > 0 ? 40 : 40, opacity: 1 - grow, display: "flex", flexDirection: "column", alignItems: "center", gap: 30, paddingTop: 36 }} dir="rtl">
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}><MixedText text="شجعني" size={104} color={WHITE} /><span style={{ fontSize: 90, transform: `scale(${heart})`, display: "inline-block" }}>❤️</span></div>
        <div style={{ backgroundColor: WHITE, borderRadius: 999, padding: "10px 34px 18px", display: "flex", alignItems: "center", gap: 14, whiteSpace: "nowrap" }}>
          <MixedText text="كومونتي بـ : حبوبة" size={56} color={RED} /><span style={{ fontSize: 50 }}>💬</span><div style={{ width: 5, height: 56, backgroundColor: cur ? RED : "transparent" }} />
        </div>
      </div>
    </div>
  );
};

export const HabV4: React.FC = () => {
  const t = useCurrentFrame();
  const inOutro = t >= OUT;
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      {!inOutro ? (
        <>
          {t >= 36 && t < 100 ? <ChatBubble t={t} /> : null}
          {PEEKS.map((p, i) => (t >= p.a && t < p.b + 2 ? <Peek key={i} t={t} p={p} /> : null))}
          {t >= 138 && t < 168 ? <ClaudeBadge t={t} /> : null}
          {t >= 165 ? <Stage t={t} /> : null}
          {KEY.map((_, i) => <KeyBubble key={i} t={t} i={i} />)}
          <Cta t={t} />
          {t < 36 ? <WaitHook t={t} /> : null}
          {t >= 36 && t < 42 ? <WaitHook t={t} /> : null}
        </>
      ) : (
        <AbsoluteFill style={{ backgroundColor: RED }}><OutroIcon f={t - OUT} fg={WHITE} bg="transparent" size={460} cy={860} /></AbsoluteFill>
      )}
      <Audio src={staticFile(HAB_VOICE)} />
      <Loop durationInFrames={1020}><Audio src={staticFile("cc/music.mp3")} volume={0.07} /></Loop>
      <Sequence from={0} durationInFrames={21}><Audio src={staticFile("habouba/sfx-boom.wav")} volume={0.7} /></Sequence>
      {[2, 6, 10, 14, 19, 24, 28].map((f) => <Sequence key={f} from={f} durationInFrames={4}><Audio src={staticFile("habouba/sfx-click.wav")} volume={0.35} /></Sequence>)}
      <Sequence from={39} durationInFrames={15}><Audio src={staticFile("cc/pop.wav")} volume={0.4} /></Sequence>
      {[96, 117, 138].map((f) => <Sequence key={f} from={f} durationInFrames={14}><Audio src={staticFile("habouba/sfx-whoosh.wav")} volume={0.4} /></Sequence>)}
      <Sequence from={165} durationInFrames={20}><Audio src={staticFile("habouba/sfx-boing.wav")} volume={0.45} /></Sequence>
      {KEY.map((k) => <Sequence key={k.a} from={k.a} durationInFrames={15}><Audio src={staticFile("cc/pop.wav")} volume={0.22} /></Sequence>)}
      <Sequence from={570} durationInFrames={14}><Audio src={staticFile("habouba/sfx-whoosh.wav")} volume={0.45} /></Sequence>
      <Sequence from={690} durationInFrames={14}><Audio src={staticFile("habouba/sfx-whoosh.wav")} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};
void CHAR; void PINK; void RED;
