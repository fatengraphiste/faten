import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { FontLoader } from "../fonts";
import { Outro } from "../Outro";
import { LOGO_PATHS } from "../logo";
import { FONT } from "../lib";
import { Beto, BetoState, useRig } from "./Beto";
import { VIS, SPEECH, BETO_DUR, CUE } from "./data";

export const FPS = 30;
const NAVY = "#19226d", RED = "#db4041", BLUE = "#3d55d6", SKY = "#dfe6fb";
export const END = BETO_DUR + 0.1;          // fin de la voix
export const CLOSE_END = END + 1.7;         // clôture (comme la référence « Perfect lesson ») avant l'outro
const BEAT = 60 / 112;
const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = (x: number) => 1 - Math.pow(1 - x, 3);
const ei = (x: number) => x * x * x;
const elastic = (x: number, amp = 1, per = 0.5) => { if (x <= 0) return 0; if (x >= 1) return 1; const a = Math.max(1, amp); const s = (per / (2 * Math.PI)) * Math.asin(1 / a); return 1 - a * Math.pow(2, -10 * x) * Math.sin(((x + s) * 2 * Math.PI) / per); };
const prog = (t: number, t0: number, d: number) => cl((t - t0) / d);
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const VIS_MAP: Record<string, string> = { c: "closed", m: "mid", o: "open", O: "o" };
const POSES: [string, string][] = [["open", "open"], ["up", "down"], ["down", "open"], ["open", "down"], ["up", "up"], ["down", "up"]];
const C = (k: string, o = 0) => CUE[k][0] + o;
const E = (k: string, o = 0) => CUE[k][1] + o;

// ───────── Béto ─────────
type Pose = { x: number; fy: number; s: number; sx: number; sy: number; rot: number; show: number };
const MAIN = { x: 540, fy: 905, s: 0.95 };
// Hook façon Duolingo : Béto se cache et passe la tête d'un bord/coin à chaque fois, avec une bulle à côté
const PEEKS = [
  { t0: 0.0, t1: 1.22, rx: 70, ry: 1030, fx: -430, fy0: 1030, rot: -23, s: 0.85, ease: "elastic" },    // bord gauche
  { t0: 1.3, t1: 2.5, rx: 1010, ry: 820, fx: 1500, fy0: 820, rot: 23, s: 0.85, ease: "linear" },       // bord droit (haut)
  { t0: 2.58, t1: 3.9, rx: 200, ry: 1540, fx: 200, fy0: 2100, rot: -12, s: 0.85, ease: "elastic" },    // coin bas gauche
] as const;
const JUMP0 = 3.9, JUMP1 = 4.5;
const betoPose = (t: number): Pose => {
  for (const p of PEEKS) {
    if (t >= p.t0 && t < p.t1) {
      const inn = p.ease === "elastic" ? elastic(prog(t, p.t0, 0.55), 1.15, 0.55) : eo(prog(t, p.t0, 0.28));
      const out = ei(prog(t, p.t1 - 0.18, 0.18)); const k = Math.max(0, inn) * (1 - out);
      const sway = Math.sin((t - p.t0) * 7) * 2.5 * (inn > 0.9 ? 1 : 0);
      const stretch = 1 + 0.12 * (1 - Math.min(1, inn)) * (p.ease === "linear" ? 3 : 1);
      return { x: p.fx + (p.rx - p.fx) * k, fy: p.fy0 + (p.ry - p.fy0) * k, s: p.s, sx: stretch, sy: 1 / Math.sqrt(stretch), rot: p.rot + sway, show: 1 };
    }
  }
  if (t < PEEKS[2].t0) return { x: -999, fy: 0, s: 0.8, sx: 1, sy: 1, rot: 0, show: 0 };
  if (t < JUMP0) return { x: -999, fy: 0, s: 0.8, sx: 1, sy: 1, rot: 0, show: 0 };
  const P = PEEKS[2]; const j = prog(t, JUMP0, JUMP1 - JUMP0); const e = eio(j);
  const x = P.rx + (MAIN.x - P.rx) * e; const fy = P.ry + (MAIN.fy - P.ry) * e - 190 * Math.sin(Math.PI * j) * (j < 1 ? 1 : 0);
  const s = P.s + (MAIN.s - P.s) * e; const land = prog(t, JUMP1, 0.35);
  const sq = j >= 1 ? 1 - 0.16 * Math.sin(Math.PI * Math.min(1, land * 1.5)) * (1 - land) * 1.6 : 1 + 0.25 * Math.sin(Math.PI * j);
  return { x, fy, s, sx: j >= 1 ? 1 / Math.max(0.8, sq) : 1 / Math.sqrt(sq), sy: sq, rot: P.rot * (1 - e), show: 1 };
};
const state = (t: number, f: number): BetoState => {
  let l = "down", r = "down", wiggle = false;
  const hook = t < JUMP1 + 0.1;
  if (hook) { if (t < 1.25) { l = "up"; r = "wave"; wiggle = true; } else if (t < 2.55) { l = "open"; r = "open"; } else if (t < 3.9) { l = "up"; r = "up"; } }
  else if (t >= C("save", -0.1)) { l = "up"; r = "up"; }                                         // clôture : bras levés
  else if (t >= C("sigh") - 0.1 && t <= C("sigh", 0.9)) { l = "hips"; r = "hips"; }
  else { const si = SPEECH.findIndex(([a, b]) => t >= a - 0.05 && t <= b); if (si >= 0) { const k = Math.floor((t - SPEECH[si][0]) / 0.9) + si * 2; [l, r] = POSES[k % POSES.length]; } }
  const v = VIS_MAP[VIS[Math.min(f, VIS.length - 1)]] || "closed";
  return { t, l, r, v, raise: 0, walking: false, wiggle, talking: !hook && t < BETO_DUR };
};

// ───────── briques graphiques ─────────
const Logo: React.FC<{ a: number }> = ({ a }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }} opacity={a}>
    <g transform="translate(430 268) scale(0.217)">{LOGO_PATHS.map((p, i) => (p.rect ? <rect key={i} x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} fill={NAVY} /> : <path key={i} d={p.d} fill={p.c === "r" ? RED : NAVY} />))}</g>
  </svg>
);
const Spark: React.FC<{ x: number; y: number; r: number; c?: string; o?: number }> = ({ x, y, r, c = "#fff", o = 1 }) => <path d={`M${x} ${y - r} Q${x + r * 0.15} ${y - r * 0.15} ${x + r} ${y} Q${x + r * 0.15} ${y + r * 0.15} ${x} ${y + r} Q${x - r * 0.15} ${y + r * 0.15} ${x - r} ${y} Q${x - r * 0.15} ${y - r * 0.15} ${x} ${y - r}Z`} fill={c} opacity={o} />;
const Burst: React.FC<{ t: number; t0: number; cx: number; cy: number; n?: number; d?: number; life?: number; seed?: number }> = ({ t, t0, cx, cy, n = 16, d = 260, life = 0.9, seed = 1 }) => {
  const p = (t - t0) / life; if (p <= 0 || p >= 1) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      {Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2 + rnd(i + seed) * 0.5, dist = d * (0.45 + 0.55 * rnd(i * 3 + seed)) * eo(p); const px = cx + Math.cos(a) * dist, py = cy + Math.sin(a) * dist + 60 * p * p; const sz = 7 + 9 * rnd(i + 9 + seed); const c = [RED, NAVY, "#7f93e8", BLUE][i % 4];
        return i % 3 === 0 ? <Spark key={i} x={px} y={py} r={sz * 1.3} c={c} o={1 - p} /> : <rect key={i} x={px - sz / 2} y={py - sz / 2} width={sz} height={sz} rx={i % 2 ? sz / 2 : 3} fill={c} opacity={1 - p} transform={`rotate(${p * 280 + i * 25} ${px} ${py})`} />; })}
    </svg>
  );
};
const Ring: React.FC<{ t: number; t0: number; cx: number; cy: number; r?: number; color?: string }> = ({ t, t0, cx, cy, r = 260, color = RED }) => {
  const p = (t - t0) / 0.6; if (p <= 0 || p >= 1) return null;
  return <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><circle cx={cx} cy={cy} r={20 + r * eo(p)} fill="none" stroke={color} strokeWidth={14 * (1 - p)} opacity={0.8 * (1 - p)} /></svg>;
};
// bulle façon app : bord gris clair, texte bleu marine, queue vers le personnage
const Bubble: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; w?: number; text: string; size?: number; tail?: "l" | "r" | "b"; ease?: "elastic" | "linear"; color?: string }> = ({ t, t0, t1, x, y, w = 420, text, size = 52, tail = "l", ease = "elastic", color = NAVY }) => {
  const p = ease === "elastic" ? elastic(prog(t, t0, 0.5), 1.3, 0.5) : eo(prog(t, t0, 0.2)); const out = prog(t, t1 - 0.15, 0.15);
  const sc = p * (1 - out); if (sc <= 0.01) return null;
  const origin = tail === "l" ? "0% 60%" : tail === "r" ? "100% 60%" : "50% 100%";
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `scale(${sc})`, transformOrigin: origin, fontFamily: FONT, direction: "rtl" }}>
      <div style={{ background: "#fff", border: "5px solid #e3e6ee", borderRadius: 44, padding: "18px 26px", textAlign: "center", fontWeight: 800, fontSize: size, color, lineHeight: 1.25, boxShadow: "0 10px 26px rgba(25,34,109,0.12)" }}>{text}</div>
      {tail === "l" && <div style={{ position: "absolute", left: -26, top: "50%", marginTop: -4, width: 0, height: 0, borderTop: "16px solid transparent", borderBottom: "16px solid transparent", borderRight: "28px solid #e3e6ee" }} />}
      {tail === "r" && <div style={{ position: "absolute", right: -26, top: "50%", marginTop: -4, width: 0, height: 0, borderTop: "16px solid transparent", borderBottom: "16px solid transparent", borderLeft: "28px solid #e3e6ee" }} />}
      {tail === "b" && <div style={{ position: "absolute", left: w / 2 - 18, bottom: -22, width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: "24px solid #e3e6ee" }} />}
    </div>
  );
};
const Stripes: React.FC<{ t: number; t0: number; k: number }> = ({ t, t0, k }) => {
  const p = eo(prog(t, t0, 0.5)); const ang = [-18, 14, -26, 20, -12, 24][k % 6]; const cols = [SKY, "#fde3e3", "#e7ebfb"];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: 0.9 }}>
      <g transform={`rotate(${ang} 540 700)`}>{[0, 1, 2].map((i) => <rect key={i} x={-300 + (1 - p) * -1500 * (i % 2 ? -1 : 1)} y={380 + i * 160 + (k % 2) * 20} width={1700} height={110 + 25 * i} fill={cols[(i + k) % 3]} opacity={0.7} />)}</g>
    </svg>
  );
};
// clôture : grandes bandes diagonales bleues + éclats (référence « Perfect lesson »)
const CloseBg: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const p = eo(prog(t, t0, 0.5)); if (p <= 0) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <g transform="rotate(-20 540 760)" opacity={p}>
        <rect x={-300 + (1 - p) * -1400} y={470} width={1800} height={330} fill="#6f86ee" />
        <rect x={-300 + (1 - p) * 1400} y={640} width={1800} height={120} fill="#aab9f6" />
        <rect x={-300 + (1 - p) * -1400} y={830} width={1800} height={70} fill="#e9edfd" />
      </g>
      {[[170, 460], [900, 540], [120, 860], [960, 880], [800, 420]].map(([x, y], i) => <Spark key={i} x={x} y={y + 14 * Math.sin(t * 4 + i)} r={22 + 8 * Math.sin(t * 5 + i * 2)} c="#fff" o={0.9 * p} />)}
    </svg>
  );
};
// texte cinétique : entrées variées (bleu marine / rouge / bleu)
const KT: React.FC<{ t: number; t0: number; t1: number; x?: number; y: number; text: string; size?: number; mode: "pop" | "stretch" | "slide" | "drop"; color?: string; w?: number }> = ({ t, t0, t1, x = 540, y, text, size = 84, mode, color = NAVY, w = 960 }) => {
  const words = text.split(" "); const out = prog(t, t1 - 0.2, 0.2);
  if (t < t0 || t > t1) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, textAlign: "center", fontFamily: FONT, direction: "rtl", opacity: 1 - out, transform: `translateY(${-out * 24}px) scale(${1 - out * 0.08})`, filter: `blur(${out * 6}px)` }}>
      <div style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${size * 0.22}px` }}>
        {words.map((wd, i) => {
          const d = t0 + i * 0.09; const p = prog(t, d, 0.6); let tr = ""; let op = 1; let fl = "none";
          if (mode === "pop") { const e = elastic(p, 1.3, 0.5); tr = `scale(${e}) rotate(${(1 - e) * -8}deg)`; op = cl(p * 6); }
          else if (mode === "stretch") { const e = eo(p); tr = `scaleX(${1 + (1 - e) * 3}) scaleY(${1 - (1 - e) * 0.4})`; op = cl(p * 4); fl = `blur(${(1 - e) * 14}px)`; }
          else if (mode === "slide") { tr = `translateX(${(1 - p) * (i % 2 ? 420 : -420)}px)`; op = cl(p * 3); }
          else { const q = prog(t, d, 0.7); const y0 = q < 0.55 ? -420 * (1 - ei(q / 0.55)) : -70 * Math.sin(Math.PI * (q - 0.55) / 0.45) * (1 - q) * 2.2; tr = `translateY(${y0}px) scale(${q > 0.5 && q < 0.65 ? 1.12 : 1}, ${q > 0.5 && q < 0.65 ? 0.88 : 1})`; op = cl(q * 8); }
          return <span key={i} style={{ display: "inline-block", fontWeight: 800, fontSize: size, lineHeight: 1.2, color, transform: tr, opacity: op, filter: fl, textShadow: "0 3px 0 rgba(255,255,255,0.9)" }}>{wd}</span>;
        })}
      </div>
    </div>
  );
};
const MorphPill: React.FC<{ t: number; t0: number; t1: number; x?: number; y: number; text: string; color?: string; size?: number; w?: number }> = ({ t, t0, t1, x = 540, y, text, color = RED, size = 64, w = 760 }) => {
  if (t < t0 || t > t1) return null; const out = prog(t, t1 - 0.2, 0.2); const a = prog(t, t0, 0.18); const b = elastic(prog(t, t0 + 0.14, 0.7), 1.1, 0.55);
  const wd = 120 + (w - 120) * b, h = 120 - 10 * b;
  return (
    <div style={{ position: "absolute", left: x - wd / 2, top: y - h / 2, width: wd, height: h, borderRadius: 60, background: color, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${a * (1 - out)}, ${(0.6 + 0.4 * a) * (1 - out)})`, boxShadow: "0 12px 30px rgba(25,34,109,0.25)", overflow: "hidden", fontFamily: FONT, direction: "rtl" }}>
      <span style={{ fontWeight: 800, fontSize: size, color: "#fff", opacity: cl((b - 0.6) * 3), whiteSpace: "nowrap" }}>{text}</span>
    </div>
  );
};
const Check: React.FC<{ x: number; y: number; p: number; s?: number; color?: string }> = ({ x, y, p, s = 1, color = "#2fb344" }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><g transform={`translate(${x} ${y}) scale(${s})`}><circle r={46} fill={color} opacity={cl(p * 3)} transform={`scale(${elastic(p, 1.2, 0.5)})`} /><path d="M-20 2 L-6 16 L22 -14" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cl((p - 0.3) * 2.2)} /></g></svg>
);
// pièces de monnaie : on en ajoute peu à peu (aucun chiffre exact)
const CoinSvg: React.FC<{ cx: number; cy: number; rx?: number; thick?: number; o?: number; spin?: number }> = ({ cx, cy, rx = 66, thick = 16, o = 1, spin = 0 }) => {
  const ry = rx * 0.3 * (spin ? 1 : 1);
  return (
    <g opacity={o}>
      <rect x={cx - rx} y={cy} width={rx * 2} height={thick} fill="#e29a00" />
      <ellipse cx={cx} cy={cy + thick} rx={rx} ry={ry} fill="#e29a00" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#ffc83d" stroke="#e29a00" strokeWidth={4} />
      <ellipse cx={cx} cy={cy} rx={rx * 0.66} ry={ry * 0.66} fill="none" stroke="#e29a00" strokeWidth={3.5} />
    </g>
  );
};
const Pile: React.FC<{ t: number; times: number[]; rem?: number[]; y?: number }> = ({ t, times, rem, y = 1385 }) => {
  const cols = [380, 540, 700, 460, 620];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      {times.map((ta, i) => {
        if (t < ta) return null; const lvl = Math.floor(i / 3), col = cols[i % 3];
        const tr = rem ? rem[i] : 1e9; const out = prog(t, tr, 0.25); if (out >= 1) return null;
        const fall = prog(t, ta, 0.45); const drop = (1 - eo(fall)) * -360 + (fall > 0.6 ? Math.sin(Math.PI * (fall - 0.6) / 0.4) * -18 : 0);
        return <CoinSvg key={i} cx={col} cy={y - lvl * 22 + drop - out * 140} o={cl(fall * 4) * (1 - out)} />;
      })}
    </svg>
  );
};
// carte de statistique façon app (en-tête coloré, corps blanc)
const StatCard: React.FC<{ t: number; t0: number; x: number; y: number; w?: number; h?: number; color: string; head: string; value: string; icon: "form" | "cal" | "man" | "time" | "coin"; mode?: "pop" | "slide" | "drop" }> = ({ t, t0, x, y, w = 300, h = 190, color, head, value, icon, mode = "pop" }) => {
  if (t < t0) return null; const p = prog(t, t0, 0.6);
  const sc = mode === "pop" ? elastic(p, 1.3, 0.5) : 1; const dy = mode === "slide" ? (1 - eo(p)) * 260 : mode === "drop" ? (p < 0.6 ? -300 * (1 - ei(p / 0.6)) : -26 * Math.sin(Math.PI * (p - 0.6) / 0.4)) : 0;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y + dy, width: w, height: h, transform: `scale(${sc})`, opacity: cl(p * 5), fontFamily: FONT, direction: "rtl" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 34, background: color, boxShadow: `0 8px 0 rgba(25,34,109,0.18)` }}>
        <div style={{ height: 52, textAlign: "center", color: "#fff", fontWeight: 800, fontSize: 32, lineHeight: "56px" }}>{head}</div>
        <div style={{ position: "absolute", left: 7, right: 7, top: 52, bottom: 7, background: "#fff", borderRadius: "0 0 28px 28px", display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <svg width="70" height="70" viewBox="-35 -35 70 70">
            {icon === "form" && <g><rect x={-26} y={-22} width={52} height={11} rx={5} fill={color} /><rect x={-26} y={-5} width={52} height={11} rx={5} fill={color} /><rect x={-26} y={12} width={52} height={11} rx={5} fill={color} /></g>}
            {icon === "cal" && <g><rect x={-26} y={-24} width={52} height={50} rx={8} fill="none" stroke={color} strokeWidth={6} /><rect x={-26} y={-24} width={52} height={14} rx={6} fill={color} /><rect x={-14} y={0} width={10} height={9} rx={2} fill={color} /><rect x={4} y={0} width={10} height={9} rx={2} fill={color} /></g>}
            {icon === "man" && <g><path d="M-22 6 Q0 -30 22 6 Z" fill={color} /><rect x={-28} y={5} width={56} height={9} rx={4} fill={color} /><circle cx={0} cy={26} r={10} fill={color} /></g>}
            {icon === "time" && <g><circle r={24} fill="none" stroke={color} strokeWidth={6} /><path d="M0 -14 V0 L12 8" stroke={color} strokeWidth={6} strokeLinecap="round" fill="none" /></g>}
            {icon === "coin" && <g><circle r={24} fill="#ffc83d" stroke="#e29a00" strokeWidth={5} /><circle r={14} fill="none" stroke="#e29a00" strokeWidth={4} /></g>}
          </svg>
          <span style={{ fontWeight: 800, fontSize: 44, color }}>{value}</span>
        </div>
      </div>
    </div>
  );
};
const Tag: React.FC<{ t: number; t0: number; x: number; y: number; text: string }> = ({ t, t0, x, y, text }) => {
  if (t < t0) return null; const e = elastic(prog(t, t0, 0.5), 1.2, 0.5);
  return <div style={{ position: "absolute", left: x - 200, top: y, width: 400, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 42, color: NAVY, background: "#fff", border: `6px solid ${NAVY}`, borderRadius: 34, padding: "16px 10px", transform: `scale(${e})`, direction: "rtl", boxShadow: "0 8px 0 rgba(25,34,109,0.15)" }}>{text}</div>;
};
const Medal: React.FC<{ x: number; fy: number; s: number; p: number }> = ({ x, fy, s, p }) => {
  const W = 900 * s, H = (W * 740) / 1310; if (p <= 0) return null; const k = elastic(p, 1.2, 0.5);
  const mx = x, my = fy - 0.31 * H, sy = fy - 0.62 * H, sw = 0.13 * W;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }} opacity={cl(p * 3)}>
      <path d={`M${mx - sw} ${sy} L${mx - 6} ${my - 30} M${mx + sw} ${sy} L${mx + 6} ${my - 30}`} stroke="#9fb4f5" strokeWidth={26} strokeLinecap="round" />
      <g transform={`translate(${mx} ${my}) scale(${k})`}><circle r={54} fill="#ffc83d" stroke="#e29a00" strokeWidth={8} /><circle r={40} fill="none" stroke="#e29a00" strokeWidth={4} /><text y={19} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight={800} fontSize={58} fill="#e29a00">1</text><Spark x={-30} y={-32} r={14} /><Spark x={36} y={30} r={11} /></g>
    </svg>
  );
};

// ───────── hook ─────────
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const [a, b, c] = PEEKS;
  return (
    <>
      <Ring t={t} t0={a.t0 + 0.05} cx={a.rx + 40} cy={a.ry - 200} r={240} /><Burst t={t} t0={a.t0 + 0.05} cx={a.rx + 70} cy={a.ry - 200} n={16} d={260} />
      <Bubble t={t} t0={0.1} t1={a.t1} x={330} y={a.ry - 330} w={390} text="عسلامة !" tail="l" />
      <Burst t={t} t0={b.t0 + 0.1} cx={b.rx - 60} cy={b.ry - 200} n={14} d={240} seed={4} />
      <Bubble t={t} t0={b.t0 + 0.2} t1={b.t1} x={170} y={b.ry - 330} w={400} text="أنا Béto" tail="r" ease="linear" />
      {t >= b.t0 && t < b.t0 + 0.45 && (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          {[0, 1, 2, 3, 4].map((i) => { const f = prog(t, b.t0, 0.3); return <rect key={i} x={b.rx - 360 - 200 * (1 - f)} y={b.ry - 330 + i * 70} width={280 * (1 - f)} height={10} rx={5} fill={i % 2 ? RED : NAVY} opacity={0.5 * (1 - f)} />; })}
        </svg>
      )}
      <Burst t={t} t0={c.t0 + 0.15} cx={c.rx + 40} cy={c.ry - 240} n={14} d={240} seed={7} />
      <Bubble t={t} t0={c.t0 + 0.3} t1={JUMP0 + 0.1} x={360} y={c.ry - 420} w={540} text="ابقى اسمعني باش تتعوّد عليا" size={46} tail="l" />
      <Burst t={t} t0={JUMP1} cx={MAIN.x} cy={MAIN.fy - 10} n={14} d={210} life={0.7} seed={8} />
      <Ring t={t} t0={JUMP1} cx={MAIN.x} cy={MAIN.fy - 10} r={300} color={NAVY} />
    </>
  );
};

export const BetoV3: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS; const svg = useRig();
  const pose = betoPose(t); const s = state(t, f);
  const W = 900 * pose.s; const H = (W * 740) / 1310; const feetOff = ((654 + 40) / 740) * H;
  const bob = t > JUMP1 + 0.4 && t < CLOSE_END ? 5 * Math.exp(-((t / BEAT) % 1) * 6) : 0;
  const logoA = interpolate(f, [0, 12, Math.round(CLOSE_END * FPS) - 8, Math.round(CLOSE_END * FPS)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const secs = [JUMP1, C("secret", -0.1), C("light", -0.2), C("say", -0.1), C("chantier", -0.2), C("less0", -0.2)];
  const sec = secs.filter((x) => t >= x).length - 1;
  const closing = t >= C("save", -0.15);
  // pièces : 1 d'abord, puis de plus en plus (sans chiffre exact)
  const tc: number[] = [C("cost", 0.35)];
  for (let i = 1; i <= 5; i++) tc.push(C("calc", 0.1 + ((E("calc") - C("calc") - 0.3) * i) / 5));
  for (let i = 1; i <= 8; i++) tc.push(C("other", 0.05 + ((E("other") - C("other") - 0.2) * i) / 8));
  const rc = tc.map((_, i) => C("secret", -0.1 + i * 0.03));
  const tl = Array.from({ length: 12 }, () => C("light", -0.15)); const rl = tl.map((_, i) => (i < 4 ? 1e9 : C("light", 0.1 + ((E("light") - C("light") - 0.3) * (i - 3)) / 8)));
  return (
    <FontLoader>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#ffffff 0%,#f1f3f9 100%)", overflow: "hidden" }}>
        {sec >= 0 && !closing && <Stripes t={t} t0={secs[sec]} k={sec} />}
        <CloseBg t={t} t0={C("save", -0.15)} />
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><ellipse cx={pose.x} cy={pose.fy + 12} rx={230 * pose.s * pose.sx} ry={24 * pose.s} fill={NAVY} opacity={0.12 * pose.show} /></svg>
        {svg && pose.show > 0.01 && (
          <div style={{ position: "absolute", left: pose.x - W / 2, top: pose.fy - feetOff - bob - (closing ? 10 * Math.sin(t * 5) : 0), transformOrigin: `${W / 2}px ${feetOff}px`, transform: `rotate(${pose.rot}deg) scale(${pose.sx * pose.show}, ${pose.sy * pose.show})` }}>
            <Beto svg={svg} s={s} width={W} />
          </div>
        )}
        {closing && <Medal x={pose.x} fy={pose.fy - 10 * Math.sin(t * 5) - bob} s={pose.s} p={prog(t, C("save", 0.15), 0.5)} />}
        <Hook t={t} />

        {/* ── part1 : le coût, les pièces s'ajoutent peu à peu ── */}
        <KT t={t} t0={C("cost")} t1={E("cost", 0.5)} y={960} text="البني يتكلّف برشا" size={86} mode="drop" color={RED} />
        <KT t={t} t0={C("calc")} t1={E("calc", 0.25)} y={960} text="وتبدا حاسب حسبة..." size={80} mode="slide" color={NAVY} />
        <KT t={t} t0={C("other")} t1={E("other", 0.6)} y={960} text="ديما حسبة أخرى !" size={86} mode="stretch" color={RED} />
        {t < C("secret") && <Pile t={t} times={tc} rem={rc} />}
        {t > C("other", 0.5) && t < C("secret", -0.1) && (<div style={{ position: "absolute", left: 790, top: 1180, fontFamily: FONT, fontWeight: 800, fontSize: 130, color: RED, transform: `scale(${elastic(prog(t, C("other", 0.5), 0.5), 1.4, 0.45)}) rotate(10deg)` }}>؟</div>)}
        {t > E("other", 0.05) && t < C("secret") && <Burst t={t} t0={E("other", 0.05)} cx={540} cy={1250} n={8} d={160} life={0.8} seed={11} />}

        {/* ── part2 ── */}
        <MorphPill t={t} t0={C("secret", -0.05)} t1={E("secret", 0.4)} y={1030} text="نحكيلك على سرّ" size={64} color={NAVY} />
        <KT t={t} t0={C("dalle")} t1={E("dalle", 0.3)} y={960} text="الدالة الحاضرة" size={104} mode="pop" color={NAVY} />
        {t > C("dalle") && t < E("dalle", 0.3) && (<>
          <Burst t={t} t0={C("dalle", 0.1)} cx={540} cy={1010} n={16} d={330} seed={21} />
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><g transform={`translate(540 1290) scale(${elastic(prog(t, C("dalle", 0.3), 0.6), 1.2, 0.5)})`}><rect x={-280} y={-60} width={560} height={120} rx={26} fill="#e4e9fb" stroke={NAVY} strokeWidth={7} />{Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-210 + i * 70} cy={0} r={22} fill="#fff" stroke={NAVY} strokeWidth={5} />)}</g></svg>
        </>)}
        <KT t={t} t0={C("light")} t1={E("light", 0.3)} y={960} text="الحسبة تخفّ برشا" size={88} mode="stretch" color={BLUE} />
        {t >= C("light", -0.15) && t < E("light", 0.35) && <Pile t={t} times={tl} rem={rl} />}
        <KT t={t} t0={C("say")} t1={E("same0", 0.5)} y={960} text="ماهو نفس السوم ؟" size={88} mode="slide" color={RED} />
        {t > C("same0", 0.1) && t < E("same0", 0.5) && (<>
          <Tag t={t} t0={C("same0", 0.1)} x={290} y={1230} text="الدالة الحاضرة" /><Tag t={t} t0={C("same0", 0.3)} x={790} y={1230} text="الدالة العادية" />
          <div style={{ position: "absolute", left: 470, top: 1190, width: 140, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 130, color: RED, transform: `scale(${elastic(prog(t, C("same0", 0.5), 0.5), 1.4, 0.45)})` }}>؟</div>
        </>)}
        <KT t={t} t0={C("yes")} t1={E("yes", 0.5)} y={960} text="إي، نفس السوم" size={92} mode="pop" color={NAVY} />
        {t > C("yes") && t < E("yes", 0.5) && (<>
          <Tag t={t} t0={C("yes", 0.1)} x={290} y={1230} text="الدالة الحاضرة" /><Tag t={t} t0={C("yes", 0.25)} x={790} y={1230} text="الدالة العادية" />
          <div style={{ position: "absolute", left: 470, top: 1190, width: 140, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 130, color: RED, transform: `scale(${elastic(prog(t, C("yes", 0.4), 0.5), 1.4, 0.45)})` }}>=</div>
          <Check x={540} y={1380} p={prog(t, C("yes", 0.7), 0.6)} s={0.8} />
        </>)}
        <KT t={t} t0={C("chantier")} t1={E("chantier", 0.5)} y={960} text="تكلفة الشانطي تنقص" size={80} mode="drop" color={NAVY} w={980} />
        {t > C("chantier", 0.2) && t < E("chantier", 0.5) && (
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
            {[0, 1, 2, 3].map((i) => { const full = 220 * (1 - 0.2 * i - (i === 3 ? 0.1 : 0)); const h = full * eo(prog(t, C("chantier", 0.25 + i * 0.12), 0.5)); return <rect key={i} x={320 + i * 120} y={1400 - h} width={84} height={h} rx={16} fill={i === 3 ? "#2fb344" : "#9fb0ea"} />; })}
            <path d="M300 1200 L 760 1330" stroke={RED} strokeWidth={12} strokeLinecap="round" strokeDasharray={1} pathLength={1} strokeDashoffset={1 - prog(t, C("chantier", 0.5), 0.6)} />
          </svg>
        )}
        {/* ── les trois cartes (comme l'écran de résultats) ── */}
        <KT t={t} t0={C("less0")} t1={E("less0", 0.15)} y={960} text="أقل كوفراج" size={92} mode="pop" color={NAVY} />
        <KT t={t} t0={C("less1")} t1={E("less1", 0.15)} y={960} text="أقل أيّام عمل" size={92} mode="slide" color={RED} />
        <KT t={t} t0={C("less2")} t1={E("less2", 0.3)} y={960} text="وأقل يد عاملة زادة" size={80} mode="stretch" color={BLUE} />
        {t > C("less0") && !closing && (<>
          <StatCard t={t} t0={C("less0", 0.15)} x={200} y={1230} color={NAVY} head="كوفراج" value="أقل" icon="form" mode="pop" />
          <StatCard t={t} t0={C("less1", 0.15)} x={540} y={1230} color={RED} head="أيّام عمل" value="أقل" icon="cal" mode="slide" />
          <StatCard t={t} t0={C("less2", 0.15)} x={880} y={1230} color={BLUE} head="يد عاملة" value="أقل" icon="man" mode="drop" />
        </>)}

        {/* ── clôture (référence « Perfect lesson ») ── */}
        {closing && (<>
          <MorphPill t={t} t0={C("save", 0.0)} t1={CLOSE_END - 0.1} y={1030} text="توفّر وقت.. وتكلفة !" size={68} color={RED} w={860} />
          <StatCard t={t} t0={C("save", 0.5)} x={300} y={1180} w={330} h={200} color={BLUE} head="وقت" value="أقل" icon="time" mode="pop" />
          <StatCard t={t} t0={C("cost2", 0.0)} x={780} y={1180} w={330} h={200} color={RED} head="تكلفة" value="أقل" icon="coin" mode="drop" />
          <Burst t={t} t0={C("save", 0.3)} cx={540} cy={640} n={22} d={420} life={1.1} seed={31} />
          <Burst t={t} t0={C("cost2", 0.1)} cx={540} cy={640} n={18} d={380} life={1.0} seed={41} />
        </>)}
        <Logo a={logoA} />
        <Sequence from={Math.round(CLOSE_END * FPS)} durationInFrames={150}><OutroW /></Sequence>
      </AbsoluteFill>
    </FontLoader>
  );
};
const OutroW: React.FC = () => { const f = useCurrentFrame(); return <div style={{ position: "absolute", inset: 0, background: "#fff" }}><div style={{ position: "absolute", inset: 0, opacity: Math.min(1, f / 10) }}><Outro t={f / FPS} /></div></div>; };
