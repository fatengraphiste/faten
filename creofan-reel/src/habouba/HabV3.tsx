import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Loop, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { MixedText } from "../components";
import { OutroIcon } from "../outro/OutroIcon";
import { HAB_SVG } from "./habSvg";
import { HAB2_ENV as HAB_ENV, HAB2_DUR as HAB_DURATION_S } from "./habEnv2";
import { HAB2_BEATS as HAB_BEATS, HAB2_VOICE as HAB_VOICE } from "./habData2";
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
const OUT = Math.round((HAB_DURATION_S + 0.9) * FPS);
export const HAB3_TOTAL = OUT + 120;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number, a: number, d: number, e = Easing.bezier(0.65, 0, 0.35, 1)) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: e });
const el = (t: number, a: number, damping = 11) => (t < a ? 0 : spring({ frame: t - a, fps: FPS, config: { damping, stiffness: 170, mass: 0.8 } }));
const ARABIC = /[؀-ۿ]/;

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

const FLOOR_Y = 1240;
const Rings: React.FC<{ t: number }> = () => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, bottom: 0, background: "linear-gradient(180deg, #fbd9d7 0%, #fff0ef 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y - 6, height: 6, backgroundColor: "rgba(247,50,42,0.12)" }} />
  </>
);
const Big: React.FC<{ size: number; color: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color, children, style }) => (
  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 0.95, letterSpacing: -size * 0.035, color, whiteSpace: "nowrap", ...style }}>{children}</div>
);

// Petites illustrations à côté du texte (une seule par plan)
const Icon: React.FC<{ kind: string; t: number }> = ({ kind, t }) => {
  const base: React.CSSProperties = { width: 150, height: 150, borderRadius: 99, backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center" };
  if (kind === "claude") return <div style={base}><Img src={staticFile("cc/claude-icon.png")} style={{ width: 110, height: 110, borderRadius: 26 }} /></div>;
  const sv = (d: string, fill = "none") => <svg width={86} height={86} viewBox="0 0 24 24" fill={fill} stroke={WHITE} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
  if (kind === "lock") return <div style={base}>{sv("M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5zM12 15v3")}</div>;
  if (kind === "spark") return <div style={{ ...base, transform: `rotate(${t * 3}deg)` }}>{sv("M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18")}</div>;
  if (kind === "hourglass") return <div style={{ ...base, transform: `rotate(${Math.sin(t / 6) * 12}deg)` }}>{sv("M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9")}</div>;
  if (kind === "bubble") return <div style={{ ...base, borderRadius: 40 }}>{sv("M4 5h16v11H9l-5 4zM8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01")}</div>;
  return null;
};

// Texte du plan : un seul à la fois, qui « pop » au moment où la phrase commence
const BeatText: React.FC<{ t: number; a: number; b: number; text: string; kind: string; icon?: string }> = ({ t, a, b, text, kind, icon }) => {
  const k = el(t, a + 2, 9);
  const out = ease(t, b - 5, 5);
  const words = text.split(" ");
  return (
    <div style={{ position: "absolute", left: 90, width: 900, top: 270, display: "flex", justifyContent: "center", alignItems: "center", gap: 28, flexWrap: "nowrap", opacity: (1 - out) * Math.min(1, k * 2), transform: `scale(${0.6 + 0.4 * k}) translateY(${-out * 30}px)` }} dir={kind === "wait" ? "ltr" : "rtl"}>
      {icon ? <Icon kind={icon} t={t} /> : null}
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        {kind === "wait" ? <Big size={230} color={RED}>wait!!!</Big> : words.map((w, i) => (ARABIC.test(w) ? <MixedText key={i} text={w} size={icon ? 112 : 132} color={RED} /> : <span key={i} style={{ backgroundColor: RED, borderRadius: 999, padding: "6px 40px 14px" }}><Big size={icon ? 80 : 96} color={WHITE}>{w}</Big></span>))}
      </div>
    </div>
  );
};

type G = [number, string, string];
type Scene = { x: number; hw: number; cy: number; g: G[]; cap?: number };
const SCENES: Record<string, Scene> = {
  come: { x: 540, hw: 1150, cy: 1620, g: [[0, "hips", "wave"], [0.6, "hips", "open"]] },
  name: { x: 730, hw: 900, cy: 1500, g: [[0, "hips", "up"], [0.55, "hips", "wave"]] },
  claude: { x: 340, hw: 1200, cy: 1650, g: [[0, "open", "hips"], [0.5, "open", "open"]] },
  curious: { x: 760, hw: 700, cy: 1330, g: [[0, "hips", "open"], [0.5, "hips", "up"]] },
  secret: { x: 540, hw: 1000, cy: 1600, g: [[0, "hips", "hips"], [0.5, "hips", "up"]], cap: 0.8 },
  more: { x: 700, hw: 1200, cy: 1650, g: [[0, "open", "open"], [0.5, "up", "open"]] },
  new: { x: 380, hw: 900, cy: 1500, g: [[0, "hips", "up"], [0.5, "up", "up"]] },
  wait2: { x: 540, hw: 1150, cy: 1620, g: [[0, "hips", "wave"]] },
  cta: { x: 730, hw: 1000, cy: 1580, g: [[0, "hips", "wave"]] },
};
const BackIn = Easing.out(Easing.back(1.8));
const SceneView: React.FC<{ t: number; kind: string; a: number; b: number; last: boolean }> = ({ t, kind, a, b, last }) => {
  const sc = SCENES[kind];
  if (!sc) return null;
  const lf = t - a, dur = b - a;
  const cap = sc.cap ?? 1;
  const exitAt = last ? dur - 20 : dur - 10;
  const open = ease(lf, 0, 10, BackIn) * (1 - ease(lf, exitAt + 4, 8));
  const k = Math.max(0, Math.min(cap, el(lf, 5, 12)) - ease(lf, exitAt, 10, Easing.in(Easing.cubic)) * cap);
  const HH = sc.hw * 0.93;
  const R = sc.hw * 0.40 * open;
  const frac = lf / dur;
  const gs = [...sc.g].reverse().find((x) => frac >= x[0]) ?? sc.g[0];
  const hide = (1 - k) * HH * 0.8;
  const bob = Math.sin(t / 9) * 5 * k;
  const top = sc.cy - HH + 0.11 * sc.hw + hide + bob;
  const rig = <div style={{ position: "absolute", left: sc.x - sc.hw / 2, top }}><Habouba t={t} l={gs[1]} r={gs[2]} wiggle={kind === "wait2" || kind === "cta"} talking width={sc.hw} /></div>;
  return (
    <>
      <div style={{ position: "absolute", left: sc.x - R * 0.9, top: sc.cy + R + 10, width: R * 1.8, height: R * 0.16, borderRadius: "50%", backgroundColor: "rgba(26,26,26,0.10)" }} />
      <div style={{ position: "absolute", left: sc.x - R, top: sc.cy - R, width: 2 * R, height: 2 * R, borderRadius: "50%", backgroundColor: RED }} />
      <div style={{ position: "absolute", left: sc.x - R * 0.86, top: sc.cy - R * 0.86, width: 1.72 * R, height: 1.72 * R, borderRadius: "50%", border: `${Math.max(2, R * 0.025)}px solid rgba(255,255,255,0.55)` }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: sc.cy, overflow: "hidden" }}>{rig}</div>
      <div style={{ position: "absolute", left: 0, top: sc.cy, width: 1080, height: 1920 - sc.cy, overflow: "hidden", clipPath: `circle(${R}px at ${sc.x}px 0px)` }}>
        <div style={{ position: "absolute", left: 0, top: -sc.cy }}>{rig}</div>
      </div>
    </>
  );
};

// Intro « stop scroll » : le mot seul, typo cinétique empilée, avant que Habouba n'apparaisse
const WaitIntro: React.FC<{ t: number; end: number }> = ({ t, end }) => {
  const k = el(t, 1, 9);
  const out = ease(t, end - 8, 8);
  const outline: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, fontSize: 340, letterSpacing: -12, lineHeight: 0.92, color: "transparent", WebkitTextStroke: `7px ${BEIGE}`, whiteSpace: "nowrap" };
  return (
    <AbsoluteFill style={{ backgroundColor: RED, clipPath: `circle(${(1 - out) * 1300}px at 540px 960px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 960 - 250, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${0.5 + 0.5 * k})`, opacity: Math.min(1, k * 2) }}>
        <div style={{ ...outline, transform: `translateY(${(1 - k) * 80}px)` }}>WAIT</div>
        <div style={{ ...outline, color: BEIGE, WebkitTextStroke: "0", marginTop: -14, position: "relative", zIndex: 2 }}>WAIT</div>
        <div style={{ ...outline, marginTop: -14, transform: `translateY(${-(1 - k) * 80}px)` }}>WAIT</div>
      </div>
      <div style={{ position: "absolute", left: 0, top: 960 - 4, height: 10, width: 1080 * ease(t, 4, 12), backgroundColor: CHAR, zIndex: 3 }} />
    </AbsoluteFill>
  );
};

export const HabV3: React.FC = () => {
  const t = useCurrentFrame();
  const inOutro = t >= OUT;
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      {!inOutro ? (
        <>
          <Rings t={t} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 96, height: 96, borderRadius: 99, backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 72, height: 72, filter: "brightness(0) invert(1)" }} /></div>
          </div>
          {HAB_BEATS.map((b, i) => (i > 0 && t >= b.a * FPS - 1 && t < b.b * FPS ? <BeatText key={i} t={t} a={b.a * FPS} b={b.b * FPS} text={b.text} kind={b.kind} icon={b.icon} /> : null))}
          {HAB_BEATS.map((b, i) => (i > 0 && t >= b.a * FPS && t < b.b * FPS ? <SceneView key={i} t={t} kind={b.kind} a={b.a * FPS} b={b.b * FPS} last={i === HAB_BEATS.length - 1} /> : null))}
        </>
      ) : (
        <AbsoluteFill style={{ backgroundColor: RED }}><OutroIcon f={t - OUT} fg={WHITE} bg="transparent" size={460} cy={860} /></AbsoluteFill>
      )}
      {!inOutro && t < HAB_BEATS[0].b * FPS ? <WaitIntro t={t} end={HAB_BEATS[0].b * FPS} /> : null}
      {HAB_VOICE ? <Audio src={staticFile(HAB_VOICE)} /> : null}
      <Loop durationInFrames={1020}><Audio src={staticFile("cc/music.mp3")} volume={0.08} /></Loop>
      <Sequence from={4} durationInFrames={15}><Audio src={staticFile("cc/pop.wav")} volume={0.3} /></Sequence>
    </AbsoluteFill>
  );
};
void CHAR; void PINK; void BEIGE;
