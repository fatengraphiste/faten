import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { FontLoader } from "../fonts";
import { Outro } from "../Outro";
import { LOGO_PATHS } from "../logo";
import { Beto, BetoState, useRig } from "./Beto";
import { VIS, SPEECH, BETO_DUR } from "./data";

export const FPS = 30;
const NAVY = "#19226d", RED = "#db4041";
export const END = BETO_DUR + 0.3;
const BEAT = 60 / 112;
const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = (x: number) => 1 - Math.pow(1 - x, 3);
const VIS_MAP: Record<string, string> = { c: "closed", m: "mid", o: "open", O: "o" };

const WALK_T = 1.7;                       // arrivée au centre
const X0 = -140, X1 = 540;                // entrée par la gauche -> centre
const POSES: [string, string][] = [["open", "open"], ["up", "down"], ["down", "open"], ["open", "down"], ["up", "up"], ["down", "up"]];

const state = (t: number, f: number): { x: number; s: BetoState } => {
  const walkP = eio(cl(t / WALK_T));
  const x = X0 + (X1 - X0) * walkP;
  const walking = t < WALK_T;
  const raise = walking ? cl(t / 0.35) : 1 - cl((t - WALK_T) / 0.35);
  let l = "down", r = "down", wiggle = false;
  if (!walking && t < WALK_T + 0.8) { r = "wave"; wiggle = true; }            // il salue en arrivant
  else if (!walking) {
    const si = SPEECH.findIndex(([a, b]) => t >= a - 0.05 && t <= b);
    if (si >= 0) { const k = Math.floor((t - SPEECH[si][0]) / 0.95) + si * 2; [l, r] = POSES[k % POSES.length]; }
  }
  const v = VIS_MAP[VIS[Math.min(f, VIS.length - 1)]] || "closed";
  return { x, s: { t, l, r, v, raise: Math.max(0, raise), walking, wiggle, talking: !walking && t < BETO_DUR } };
};

const Logo: React.FC<{ a: number }> = ({ a }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }} opacity={a}>
    <g transform="translate(430 268) scale(0.217)">{LOGO_PATHS.map((p, i) => (p.rect ? <rect key={i} x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} fill={NAVY} /> : <path key={i} d={p.d} fill={p.c === "r" ? RED : NAVY} />))}</g>
  </svg>
);

// décor rythmé (pulsations sur le tempo de la musique, 112 BPM)
const Bg: React.FC<{ t: number }> = ({ t }) => {
  const ph = (t / BEAT) % 1; const pulse = Math.exp(-ph * 5);
  const bars = Array.from({ length: 9 }, (_, i) => i);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 540 - 380, top: 960 - 380, width: 760, height: 760, borderRadius: 380, background: NAVY, opacity: 0.05 + 0.03 * pulse, transform: `scale(${1 + 0.05 * pulse})` }} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={540} cy={960} r={430} fill="none" stroke={RED} strokeWidth={4} strokeDasharray="14 22" transform={`rotate(${t * 12} 540 960)`} opacity={0.55} />
        <circle cx={540} cy={960} r={500 + 18 * pulse} fill="none" stroke={NAVY} strokeWidth={3} opacity={0.18} />
        {bars.map((i) => { const x = 90 + i * 112; const hgt = 30 + 60 * Math.abs(Math.sin(t * 3 + i * 1.3)) * (0.5 + pulse); return <rect key={i} x={x} y={1500 - hgt} width={22} height={hgt} rx={11} fill={i % 3 === 0 ? RED : NAVY} opacity={0.16} />; })}
        {Array.from({ length: 12 }, (_, i) => { const a = (i * 137.5) % 360, rr = 520 + (i % 4) * 60; const px = 540 + Math.cos((a * Math.PI) / 180 + t * 0.15) * rr * 0.62, py = 960 + Math.sin((a * Math.PI) / 180 + t * 0.15) * rr * 0.55; return <g key={i} transform={`translate(${px} ${py}) rotate(${t * 20 + i * 30})`} opacity={0.35}><rect x={-9} y={-3} width={18} height={6} rx={3} fill={i % 2 ? RED : NAVY} /><rect x={-3} y={-9} width={6} height={18} rx={3} fill={i % 2 ? RED : NAVY} /></g>; })}
        <ellipse cx={540} cy={1296} rx={250} ry={26} fill={NAVY} opacity={0.12} />
      </svg>
    </AbsoluteFill>
  );
};

const Burst: React.FC<{ t: number }> = ({ t }) => {
  const p = cl((t - WALK_T) / 1.0); if (p <= 0 || p >= 1) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      {Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * Math.PI * 2, d = 120 + 420 * eo(p); const px = 540 + Math.cos(a) * d, py = 1000 + Math.sin(a) * d * 0.8; return <rect key={i} x={px - 8} y={py - 8} width={16} height={16} rx={i % 2 ? 8 : 3} fill={i % 3 ? RED : NAVY} opacity={1 - p} transform={`rotate(${p * 300 + i * 20} ${px} ${py})`} />; })}
    </svg>
  );
};

export const BetoVideo: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS; const svg = useRig();
  const { x, s } = state(t, f);
  const bob = !s.walking ? 5 * Math.exp(-(((t / BEAT) % 1)) * 6) * (s.talking ? 1 : 0) : 0;   // petit rebond sur le tempo
  const logoA = interpolate(f, [0, 12, Math.round(END * FPS) - 8, Math.round(END * FPS)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const W = 1180; // largeur du rig (Béto ≈ 40 % de la largeur du viewBox)
  return (
    <FontLoader>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#ffffff 0%,#eef1f8 100%)", overflow: "hidden" }}>
        <Bg t={t} />
        {svg && <div style={{ position: "absolute", left: x - W / 2, top: 1296 - ((654 + 40) * W) / 1310 - bob }}><Beto svg={svg} s={s} width={W} /></div>}
        <Burst t={t} />
        <Logo a={logoA} />
        <Sequence from={Math.round(END * FPS)} durationInFrames={150}><div style={{ position: "absolute", inset: 0, background: "#fff" }}><OutroWrap /></div></Sequence>
      </AbsoluteFill>
    </FontLoader>
  );
};
const OutroWrap: React.FC = () => { const f = useCurrentFrame(); return <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, f / 10) }}><Outro t={f / FPS} /></div>; };
