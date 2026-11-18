import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Loop, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { MixedText } from "../components";
import { OutroIcon } from "../outro/OutroIcon";
import { HAB_SVG } from "./habSvg";
import { HAB_BEATS, HAB_DURATION_S, HAB_ENV, HAB_VOICE } from "./habData";
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
const VOICE_F = Math.round(HAB_DURATION_S * FPS);
const OUT = VOICE_F;
export const HAB_TOTAL = OUT + 120;
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

const Rings: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, 0, 26, Easing.out(Easing.cubic));
  const pulse = 1 + Math.sin(t / 22) * 0.02;
  return (
    <>
      {[{ r: 980, c: "rgba(255,255,255,0.06)" }, { r: 640, c: "rgba(0,0,0,0.07)" }, { r: 320, c: "rgba(255,255,255,0.07)" }].map((x, i) => {
        const r = x.r * k * pulse;
        return <div key={i} style={{ position: "absolute", left: 540 - r, top: 1010 - r, width: 2 * r, height: 2 * r, borderRadius: 9999, backgroundColor: x.c }} />;
      })}
    </>
  );
};
const Big: React.FC<{ size: number; color: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color, children, style }) => (
  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 0.95, letterSpacing: -size * 0.035, color, whiteSpace: "nowrap", ...style }}>{children}</div>
);

// Texte du plan : un seul à la fois, bien lisible, qui « pop » au moment où la phrase commence
const BeatText: React.FC<{ t: number; a: number; b: number; text: string; kind: string }> = ({ t, a, b, text, kind }) => {
  const k = el(t, a + 2, 9);
  const out = ease(t, b - 5, 5);
  const words = text.split(" ");
  return (
    <div style={{ position: "absolute", left: 90, width: 900, top: 300, display: "flex", justifyContent: "center", alignItems: "center", gap: 22, flexWrap: "wrap", opacity: (1 - out) * Math.min(1, k * 2), transform: `scale(${0.6 + 0.4 * k}) translateY(${-out * 30}px)` }} dir={kind === "wait" ? "ltr" : "rtl"}>
      {kind === "wait" ? <Big size={230} color={WHITE}>wait!!!</Big> : words.map((w, i) => (ARABIC.test(w) ? <MixedText key={i} text={w} size={132} color={WHITE} /> : <span key={i} style={{ backgroundColor: WHITE, borderRadius: 999, padding: "6px 40px 14px" }}><Big size={96} color={RED}>{w}</Big></span>))}
    </div>
  );
};

export const HabV1: React.FC = () => {
  const t = useCurrentFrame();
  const beat = HAB_BEATS.find((x) => t >= x.a * FPS && t < x.b * FPS) ?? HAB_BEATS[HAB_BEATS.length - 1];
  const inOutro = t >= OUT;
  const enter = el(t, 6, 10);
  const bob = Math.sin(t / 9) * 6;
  return (
    <AbsoluteFill style={{ backgroundColor: RED, overflow: "hidden" }}>
      {!inOutro ? (
        <>
          <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ position: "absolute", left: -380, top: 520, width: 980, opacity: 0.1, filter: "brightness(0) invert(1)", transform: "rotate(-14deg)" }} />
          <Rings t={t} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 96, height: 96, borderRadius: 99, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 72, height: 72 }} /></div>
          </div>
          {HAB_BEATS.map((b, i) => (t >= b.a * FPS - 1 && t < b.b * FPS ? <BeatText key={i} t={t} a={b.a * FPS} b={b.b * FPS} text={b.text} kind={b.kind} /> : null))}
          <div style={{ position: "absolute", left: 540 - 670, top: 540 + bob + (1 - enter) * 600, opacity: Math.min(1, enter * 2) }}>
            <Habouba t={t} l={beat.l} r={beat.r} wiggle={beat.wiggle} talking width={1340} />
          </div>
        </>
      ) : (
        <AbsoluteFill style={{ backgroundColor: RED }}><OutroIcon f={t - OUT} fg={WHITE} bg="transparent" size={460} cy={860} /></AbsoluteFill>
      )}
      {HAB_VOICE ? <Audio src={staticFile(HAB_VOICE)} /> : null}
      <Loop durationInFrames={1020}><Audio src={staticFile("cc/music.mp3")} volume={0.08} /></Loop>
      <Sequence from={4} durationInFrames={15}><Audio src={staticFile("cc/pop.wav")} volume={0.3} /></Sequence>
    </AbsoluteFill>
  );
};
void CHAR; void PINK; void BEIGE;
