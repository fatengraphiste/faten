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
export const HAB2_TOTAL = OUT + 120;
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

const PORTAL_Y = 1560;
const Rings: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, 0, 26, Easing.out(Easing.cubic));
  const pulse = 1 + Math.sin(t / 22) * 0.02;
  return (
    <>
      {[{ r: 1100, c: "rgba(247,50,42,0.06)" }, { r: 760, c: "rgba(247,50,42,0.08)" }, { r: 440, c: "rgba(247,50,42,0.10)" }].map((x, i) => {
        const r = x.r * k * pulse;
        return <div key={i} style={{ position: "absolute", left: 540 - r, top: PORTAL_Y - r, width: 2 * r, height: 2 * r, borderRadius: 9999, backgroundColor: x.c }} />;
      })}
    </>
  );
};
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

const HW = 1150; // largeur du rig
const HH = HW * 0.93;
// 0 = cachée dans le disque, 1 = sortie. Sort au début, se baisse à « سر » (cache-cache), rentre à la fin.
const rise = (t: number) => {
  const inn = el(t, 8, 12);
  const peek = ease(t, 8.7 * FPS, 10) - ease(t, 10.9 * FPS, 10);
  const out = ease(t, (HAB_DURATION_S + 0.1) * FPS, 18, Easing.in(Easing.cubic));
  return Math.max(0, inn - 0.55 * peek - out);
};
const Portal: React.FC<{ t: number; beat: (typeof HAB_BEATS)[number] }> = ({ t, beat }) => {
  const k = rise(t);
  const open = ease(t, 0, 14, Easing.out(Easing.back(1.8))) * (1 - ease(t, (HAB_DURATION_S + 0.45) * FPS, 12));
  const RX = 470 * open, RY = 120 * open;
  const hide = (1 - k) * (HH * 0.86);
  const bob = Math.sin(t / 9) * 5 * k;
  const ringT = (t - 8) / 22;
  return (
    <>
      {/* trou : ellipse sombre + lèvre claire (disque) */}
      <div style={{ position: "absolute", left: 540 - RX - 26 * open, top: PORTAL_Y - RY - 18 * open, width: 2 * RX + 52 * open, height: 2 * RY + 36 * open, borderRadius: "50%", backgroundColor: RED }} />
      <div style={{ position: "absolute", left: 540 - RX, top: PORTAL_Y - RY, width: 2 * RX, height: 2 * RY, borderRadius: "50%", backgroundColor: CHAR }} />
      {/* onde à la sortie */}
      {ringT > 0 && ringT < 1 ? <div style={{ position: "absolute", left: 540 - 470 - ringT * 360, top: PORTAL_Y - 120 - ringT * 120, width: 940 + ringT * 720, height: 240 + ringT * 240, borderRadius: "50%", border: `8px solid rgba(247,50,42,${0.5 * (1 - ringT)})` }} /> : null}
      {/* Habouba, coupée à la ligne centrale du disque */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: PORTAL_Y, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 540 - HW / 2, top: PORTAL_Y - HH + 125 + hide + bob }}>
          <Habouba t={t} l={beat.l} r={beat.r} wiggle={beat.wiggle} talking width={HW} />
        </div>
      </div>
    </>
  );
};

export const HabV2: React.FC = () => {
  const t = useCurrentFrame();
  const beat = HAB_BEATS.find((x) => t >= x.a * FPS && t < x.b * FPS) ?? HAB_BEATS[HAB_BEATS.length - 1];
  const inOutro = t >= OUT;
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      {!inOutro ? (
        <>
          <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ position: "absolute", left: -380, top: 520, width: 980, opacity: 0.06, transform: "rotate(-14deg)" }} />
          <Rings t={t} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 96, height: 96, borderRadius: 99, backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 72, height: 72, filter: "brightness(0) invert(1)" }} /></div>
          </div>
          {HAB_BEATS.map((b, i) => (t >= b.a * FPS - 1 && t < b.b * FPS ? <BeatText key={i} t={t} a={b.a * FPS} b={b.b * FPS} text={b.text} kind={b.kind} icon={b.icon} /> : null))}
          <Portal t={t} beat={beat} />
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
