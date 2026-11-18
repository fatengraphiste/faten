import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { FontLoader } from "../fonts";
import { Outro } from "../Outro";
import { LOGO_PATHS } from "../logo";
import { FONT } from "../lib";
import { Beto, BetoState, useRig } from "./Beto";
import { VIS, SPEECH, BETO_DUR, CUE } from "./data";

export const FPS = 30;
const NAVY = "#19226d", RED = "#db4041", SKY = "#dfe6fb";
export const END = BETO_DUR + 0.1;
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

// ───────── Béto : position, échelle, déformation (étirement / écrasement) ─────────
type Pose = { x: number; fy: number; s: number; sx: number; sy: number; rot: number; show: number };
const MAIN = { x: 540, fy: 1400, s: 1.0 };
const POPS = [
  { t0: 0.0, t1: 1.2, x: 320, fy: 800, s: 0.62 },     // « عسلامة »  haut gauche   (pop élastique)
  { t0: 1.28, t1: 2.5, x: 770, fy: 1040, s: 0.62 },   // « أنا béto »  droite       (morph liquide)
  { t0: 2.55, t1: 3.95, x: 300, fy: 1300, s: 0.62 },  // « ابقى اسمعني » bas gauche (arrive en flèche, linéaire)
];
const JUMP0 = 3.95, JUMP1 = 4.55;

const betoPose = (t: number): Pose => {
  const [p0, p1, p2] = POPS;
  if (t < p0.t1) { const e = elastic(prog(t, p0.t0, 0.55), 1.2, 0.5); const out = prog(t, p0.t1 - 0.12, 0.12); return { x: p0.x, fy: p0.fy, s: p0.s, sx: (e * (1 - out)) * (1 + 0.15 * (1 - e)), sy: e * (1 - out) * (1 - 0.15 * (1 - e)) , rot: -8 * (1 - e), show: t < p0.t0 ? 0 : 1 - out }; }
  if (t < p1.t0) return { x: p1.x, fy: p1.fy, s: p1.s, sx: 0, sy: 0, rot: 0, show: 0 };
  if (t < p1.t1) { const e = elastic(prog(t, p1.t0 + 0.22, 0.5), 1.4, 0.45); const out = prog(t, p1.t1 - 0.12, 0.12); return { x: p1.x, fy: p1.fy, s: p1.s, sx: e * (1 - out) * (1 + 0.3 * (1 - e)), sy: e * (1 - out) * (1 - 0.25 * (1 - e)), rot: 0, show: prog(t, p1.t0 + 0.2, 0.05) * (1 - out) }; }
  if (t < p2.t0) return { x: p2.x, fy: p2.fy, s: p2.s, sx: 0, sy: 0, rot: 0, show: 0 };
  if (t < JUMP0) { const f = prog(t, p2.t0, 0.38); const x = p2.x + 900 * (1 - f); const stretch = 1 + 0.55 * (1 - f); return { x, fy: p2.fy, s: p2.s, sx: stretch, sy: 1 / Math.sqrt(stretch), rot: 0, show: 1 }; }
  // saut vers la position de présentation : étirement au décollage, arc, écrasement à l'atterrissage
  const j = prog(t, JUMP0, JUMP1 - JUMP0); const e = eio(j);
  const x = p2.x + (MAIN.x - p2.x) * e; const fy = p2.fy + (MAIN.fy - p2.fy) * e - 320 * Math.sin(Math.PI * j);
  const s = p2.s + (MAIN.s - p2.s) * e;
  const land = prog(t, JUMP1, 0.35); const sq = j >= 1 ? 1 - 0.18 * Math.sin(Math.PI * Math.min(1, land * 1.4)) * (1 - land) * 1.6 : 1 + 0.25 * Math.sin(Math.PI * j);
  return { x, fy, s, sx: j >= 1 ? 1 / Math.max(0.8, sq) : 1 / Math.sqrt(sq), sy: sq, rot: 0, show: 1 };
};

const state = (t: number, f: number, pose: Pose): BetoState => {
  const walking = false; const inHook = t < JUMP1 + 0.1;
  let l = "down", r = "down", wiggle = false;
  if (inHook) { if (t < 1.2) { l = "up"; r = "wave"; wiggle = true; } else if (t < 2.5) { l = "open"; r = "open"; } else if (t < 3.95) { l = "up"; r = "up"; } else { l = "down"; r = "down"; } }
  else {
    const si = SPEECH.findIndex(([a, b]) => t >= a - 0.05 && t <= b);
    if (t >= C("sigh") - 0.1 && t <= C("sigh", 0.9)) { l = "hips"; r = "hips"; }
    else if (si >= 0) { const k = Math.floor((t - SPEECH[si][0]) / 0.9) + si * 2; [l, r] = POSES[k % POSES.length]; }
  }
  const v = VIS_MAP[VIS[Math.min(f, VIS.length - 1)]] || "closed";
  return { t, l, r, v, raise: 0, walking, wiggle, talking: !inHook && t < BETO_DUR };
};

// ───────── briques graphiques ─────────
const Logo: React.FC<{ a: number }> = ({ a }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }} opacity={a}>
    <g transform="translate(430 268) scale(0.217)">{LOGO_PATHS.map((p, i) => (p.rect ? <rect key={i} x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} fill={NAVY} /> : <path key={i} d={p.d} fill={p.c === "r" ? RED : NAVY} />))}</g>
  </svg>
);
// éclats / confettis
const Burst: React.FC<{ t: number; t0: number; cx: number; cy: number; n?: number; d?: number; life?: number; seed?: number }> = ({ t, t0, cx, cy, n = 16, d = 260, life = 0.9, seed = 1 }) => {
  const p = (t - t0) / life; if (p <= 0 || p >= 1) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      {Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2 + rnd(i + seed) * 0.5, dist = d * (0.45 + 0.55 * rnd(i * 3 + seed)) * eo(p); const px = cx + Math.cos(a) * dist, py = cy + Math.sin(a) * dist + 60 * p * p; const sz = 7 + 9 * rnd(i + 9 + seed); const c = [RED, NAVY, "#7f93e8", "#ffffff"][i % 4];
        return i % 3 === 0 ? <path key={i} d={`M${px} ${py - sz} L${px + sz * 0.3} ${py - sz * 0.3} L${px + sz} ${py} L${px + sz * 0.3} ${py + sz * 0.3} L${px} ${py + sz} L${px - sz * 0.3} ${py + sz * 0.3} L${px - sz} ${py} L${px - sz * 0.3} ${py - sz * 0.3}Z`} fill={c === "#ffffff" ? "#ffd9d9" : c} opacity={1 - p} /> : <rect key={i} x={px - sz / 2} y={py - sz / 2} width={sz} height={sz} rx={i % 2 ? sz / 2 : 3} fill={c === "#ffffff" ? "#cfd8f7" : c} opacity={1 - p} transform={`rotate(${p * 280 + i * 25} ${px} ${py})`} />; })}
    </svg>
  );
};
const Ring: React.FC<{ t: number; t0: number; cx: number; cy: number; r?: number; color?: string }> = ({ t, t0, cx, cy, r = 260, color = RED }) => {
  const p = (t - t0) / 0.6; if (p <= 0 || p >= 1) return null;
  return <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><circle cx={cx} cy={cy} r={20 + r * eo(p)} fill="none" stroke={color} strokeWidth={14 * (1 - p)} opacity={0.8 * (1 - p)} /></svg>;
};
// bulle de dialogue façon app (blanche, bord gris, queue)
const Bubble: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; w?: number; text: string; size?: number; tail?: "l" | "r" | "b"; ease?: "elastic" | "linear" }> = ({ t, t0, t1, x, y, w = 420, text, size = 52, tail = "b", ease = "elastic" }) => {
  const p = ease === "elastic" ? elastic(prog(t, t0, 0.5), 1.3, 0.5) : eo(prog(t, t0, 0.2)); const out = prog(t, t1 - 0.15, 0.15);
  const sc = p * (1 - out); if (sc <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, transform: `scale(${sc})`, transformOrigin: tail === "b" ? "50% 100%" : tail === "l" ? "0% 50%" : "100% 50%", fontFamily: FONT, direction: "rtl" }}>
      <div style={{ background: "#fff", border: "5px solid #e3e6ee", borderRadius: 44, padding: "18px 26px", textAlign: "center", fontWeight: 800, fontSize: size, color: "#3c3c3c", lineHeight: 1.25, boxShadow: "0 10px 26px rgba(25,34,109,0.12)" }}>{text}</div>
      {tail === "b" && <div style={{ position: "absolute", left: w / 2 - 18, bottom: -22, width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: "24px solid #e3e6ee" }} />}
    </div>
  );
};
// bandes diagonales de fond (changent d'angle/couleur à chaque séquence)
const Stripes: React.FC<{ t: number; t0: number; k: number }> = ({ t, t0, k }) => {
  const p = eo(prog(t, t0, 0.5)); const ang = [-18, 14, -26, 20, -12, 24][k % 6]; const cols = [SKY, "#fde3e3", "#e7ebfb"];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: 0.9 }}>
      <g transform={`rotate(${ang} 540 760)`}>
        {[0, 1, 2].map((i) => <rect key={i} x={-300 + (1 - p) * -1500 * (i % 2 ? -1 : 1)} y={430 + i * 150 + (k % 2) * 20} width={1700} height={110 + 25 * i} fill={cols[(i + k) % 3]} opacity={0.75} />)}
      </g>
    </svg>
  );
};
// texte cinétique : 5 façons d'entrer (élastique, étirement linéaire, glissement, chute avec rebond, morph pastille)
const KT: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; text: string; size?: number; mode: "pop" | "stretch" | "slide" | "drop" | "morph"; color?: string; bg?: string; w?: number }> = ({ t, t0, t1, x, y, text, size = 96, mode, color = NAVY, bg, w = 900 }) => {
  const words = text.split(" "); const out = prog(t, t1 - 0.22, 0.22);
  if (t < t0 || t > t1) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, textAlign: "center", fontFamily: FONT, direction: "rtl", opacity: 1 - out, transform: `translateY(${-out * 30}px) scale(${1 - out * 0.1})`, filter: `blur(${out * 6}px)` }}>
      <div style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${size * 0.22}px`, background: bg, borderRadius: 40, padding: bg ? "10px 36px" : 0 }}>
        {words.map((wd, i) => {
          const d = t0 + i * 0.09; const p = prog(t, d, 0.6); let tr = ""; let op = 1; let fl = "none";
          if (mode === "pop") { const e = elastic(p, 1.3, 0.5); tr = `scale(${e}) rotate(${(1 - e) * -8}deg)`; op = cl(p * 6); }
          else if (mode === "stretch") { const e = eo(p); tr = `scaleX(${1 + (1 - e) * 3}) scaleY(${1 - (1 - e) * 0.4})`; op = cl(p * 4); fl = `blur(${(1 - e) * 14}px)`; }
          else if (mode === "slide") { const e = p; tr = `translateX(${(1 - e) * (i % 2 ? 420 : -420)}px)`; op = cl(p * 3); }
          else if (mode === "drop") { const q = prog(t, d, 0.7); const y0 = q < 0.55 ? -420 * (1 - ei(q / 0.55)) : -70 * Math.sin(Math.PI * (q - 0.55) / 0.45) * (1 - q) * 2.2; tr = `translateY(${y0}px) scale(${1 + (q > 0.5 && q < 0.65 ? 0.12 : 0)}, ${q > 0.5 && q < 0.65 ? 0.88 : 1})`; op = cl(q * 8); }
          else { const e = elastic(prog(t, d, 0.7), 1.1, 0.6); tr = `scale(${e})`; op = cl(p * 5); }
          return <span key={i} style={{ display: "inline-block", fontWeight: 800, fontSize: size, lineHeight: 1.2, color, transform: tr, opacity: op, filter: fl, textShadow: "0 3px 0 rgba(255,255,255,0.9)" }}>{wd}</span>;
        })}
      </div>
    </div>
  );
};
// pastille qui se transforme (morph) : cercle -> pilule avec texte
const MorphPill: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; text: string; color?: string; size?: number; w?: number }> = ({ t, t0, t1, x, y, text, color = RED, size = 64, w = 760 }) => {
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
const Coin: React.FC<{ x: number; y: number; s?: number; spin?: number }> = ({ x, y, s = 1, spin = 0 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><g transform={`translate(${x} ${y}) scale(${s * Math.abs(Math.cos(spin)) + 0.05}, ${s})`}><circle r={52} fill="#ffc83d" stroke="#e29a00" strokeWidth={8} /><circle r={36} fill="none" stroke="#e29a00" strokeWidth={5} /><text y={16} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight={800} fontSize={46} fill="#e29a00">DT</text></g></svg>
);

// ───────── séquences ─────────
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const [p0, p1, p2] = POPS;
  const goo = prog(t, p1.t0, 0.3);
  return (
    <>
      {/* pop 1 : onde de choc + éclats */}
      <Ring t={t} t0={p0.t0} cx={p0.x} cy={p0.fy - 180} /><Burst t={t} t0={p0.t0} cx={p0.x} cy={p0.fy - 180} n={18} d={300} />
      <Bubble t={t} t0={0.25} t1={p0.t1} x={p0.x + 330} y={p0.fy - 470} w={380} text="عسلامة !" tail="b" />
      {/* pop 2 : blob liquide qui se transforme en Béto */}
      {t >= p1.t0 && t < p1.t0 + 0.7 && (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs><filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="14" /><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12" /></filter></defs>
          <g filter="url(#goo)" opacity={1 - prog(t, p1.t0 + 0.2, 0.08)}>
            {[0, 1, 2, 3].map((i) => <circle key={i} cx={p1.x + Math.cos(t * 14 + i * 1.6) * 70 * (1 - goo)} cy={p1.fy - 170 + Math.sin(t * 12 + i * 2.1) * 60 * (1 - goo)} r={(70 - i * 8) * (0.4 + 0.5 * eo(goo))} fill={i % 2 ? RED : NAVY} />)}
          </g>
        </svg>
      )}
      <Burst t={t} t0={p1.t0 + 0.25} cx={p1.x} cy={p1.fy - 170} n={14} d={260} seed={4} />
      <Bubble t={t} t0={p1.t0 + 0.4} t1={p1.t1} x={p1.x - 260} y={p1.fy - 470} w={420} text="أنا Béto" tail="b" />
      {/* pop 3 : arrivée en flèche (traînée de lignes) */}
      {t >= p2.t0 && t < p2.t0 + 0.5 && (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          {[0, 1, 2, 3, 4].map((i) => { const f = prog(t, p2.t0, 0.38); const x = p2.x + 900 * (1 - f); return <rect key={i} x={x + 140} y={p2.fy - 330 + i * 70} width={260 * (1 - f)} height={10} rx={5} fill={i % 2 ? RED : NAVY} opacity={0.5 * (1 - f)} />; })}
        </svg>
      )}
      <Bubble t={t} t0={p2.t0 + 0.45} t1={JUMP0 + 0.1} x={p2.x + 340} y={p2.fy - 560} w={440} text="ابقى اسمعني باش تتعوّد عليا" size={44} tail="b" ease="linear" />
      {/* saut : poussière à l'atterrissage */}
      <Burst t={t} t0={JUMP1} cx={MAIN.x} cy={MAIN.fy - 10} n={14} d={200} life={0.7} seed={8} />
      <Ring t={t} t0={JUMP1} cx={MAIN.x} cy={MAIN.fy - 10} r={300} color={NAVY} />
    </>
  );
};

const Calc: React.FC<{ t: number; t0: number; t1: number; settle?: boolean }> = ({ t, t0, t1, settle }) => {
  if (t < t0 || t > t1) return null; const p = elastic(prog(t, t0, 0.5), 1.2, 0.5); const out = prog(t, t1 - 0.2, 0.2);
  const digits = (n: number) => Array.from({ length: 5 }, (_, i) => Math.floor(rnd(Math.floor(t * 14) * 7 + i * 13 + n) * 10)).join("");
  const val = digits(settle ? 3 : 1);
  return (
    <div style={{ position: "absolute", left: 540 - 300, top: 520, width: 600, transform: `scale(${p * (1 - out)})`, fontFamily: FONT }}>
      <div style={{ background: "#fff", border: "6px solid #e3e6ee", borderRadius: 40, padding: "24px 30px", boxShadow: "0 14px 30px rgba(25,34,109,0.15)" }}>
        <div style={{ background: "#eef1f8", borderRadius: 22, padding: "14px 22px", textAlign: "right", fontSize: 96, fontWeight: 800, color: NAVY, letterSpacing: 6, direction: "ltr" }}>{val.replace(/(\d{2})(\d{3})/, "$1 $2")}<span style={{ fontSize: 42, marginLeft: 12, color: RED }}>DT</span></div>
        <div style={{ display: "flex", gap: 14, marginTop: 16, justifyContent: "center" }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 90, height: 60, borderRadius: 18, background: i === 3 ? RED : "#e3e6ee" }} />)}</div>
      </div>
    </div>
  );
};

export const BetoV2: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS; const svg = useRig();
  const pose = betoPose(t); const s = state(t, f, pose);
  const W = 900 * pose.s; const H = (W * 740) / 1310; const feetOff = ((654 + 40) / 740) * H;
  const bob = t > JUMP1 + 0.4 && t < BETO_DUR ? 5 * Math.exp(-((t / BEAT) % 1) * 6) : 0;
  const logoA = interpolate(f, [0, 12, Math.round(END * FPS) - 8, Math.round(END * FPS)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sections = [4.5, C("secret", -0.1), C("light", -0.2), C("say", -0.1), C("chantier", -0.2), C("less0", -0.2), C("save", -0.2)];
  const sec = sections.filter((x) => t >= x).length - 1;
  return (
    <FontLoader>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#ffffff 0%,#f1f3f9 100%)", overflow: "hidden" }}>
        {sec >= 0 && <Stripes t={t} t0={sections[sec]} k={sec} />}
        {/* ombre au sol */}
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><ellipse cx={pose.x} cy={pose.fy + 12} rx={230 * pose.s * pose.sx} ry={24 * pose.s} fill={NAVY} opacity={0.12 * pose.show} /></svg>
        {svg && pose.show > 0.01 && (
          <div style={{ position: "absolute", left: pose.x - W / 2, top: pose.fy - feetOff - bob, transformOrigin: `${W / 2}px ${feetOff}px`, transform: `rotate(${pose.rot}deg) scale(${pose.sx * pose.show}, ${pose.sy * pose.show})` }}>
            <Beto svg={svg} s={s} width={W} />
          </div>
        )}
        <Hook t={t} />

        {/* part1 */}
        <KT t={t} t0={C("cost")} t1={E("cost", 0.4)} x={540} y={470} text="البني يتكلّف برشا" size={96} mode="drop" />
        {t > C("cost", 0.9) && t < E("cost", 0.4) && <Coin x={540 + 330} y={760} s={0.9 * elastic(prog(t, C("cost", 0.9), 0.5), 1.3, 0.5)} spin={t * 6} />}
        <Calc t={t} t0={C("calc", -0.1)} t1={E("calc", 0.2)} />
        <KT t={t} t0={C("calc", 0.2)} t1={E("calc", 0.2)} x={540} y={420} text="تبدا حاسب حسبة..." size={72} mode="slide" color={NAVY} />
        <Calc t={t} t0={C("other", -0.1)} t1={E("other", 0.3)} settle />
        <KT t={t} t0={C("other", 0.2)} t1={E("other", 0.3)} x={540} y={400} text="ديما حسبة أخرى !" size={80} mode="stretch" color={RED} />
        {t > E("other", 0.05) && t < C("secret") && <Burst t={t} t0={E("other", 0.05)} cx={540} cy={820} n={8} d={140} life={0.8} seed={11} />}

        {/* part2 */}
        <MorphPill t={t} t0={C("secret", -0.05)} t1={E("secret", 0.6)} x={540} y={560} text="نحكيلك على سرّ" size={64} color={NAVY} />
        <KT t={t} t0={C("dalle")} t1={E("dalle", 0.5)} x={540} y={430} text="الدالة الحاضرة" size={112} mode="pop" color={NAVY} bg="#fff" />
        {t > C("dalle") && t < E("dalle", 0.5) && <Burst t={t} t0={C("dalle", 0.1)} cx={540} cy={560} n={16} d={320} seed={21} />}
        <KT t={t} t0={C("light")} t1={E("light", 0.5)} x={540} y={430} text="الحسبة تخفّ برشا" size={92} mode="stretch" />
        {t > C("light") && t < E("light", 0.5) && (
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><g transform={`translate(540 ${760 - 120 * eo(prog(t, C("light"), 0.9))})`}>{[0, 1, 2].map((i) => <rect key={i} x={-160 + i * 120} y={0} width={80} height={90 + (2 - i) * 50 - 55 * eo(prog(t, C("light") + 0.2, 0.9)) * (i + 1) * 0.55} rx={14} fill={i === 2 ? "#2fb344" : "#9fb0ea"} transform={`translate(0 ${(2 - i) * 0})`} />)}</g></svg>
        )}
        <KT t={t} t0={C("say")} t1={E("same0", 0.6)} x={540} y={420} text="ماهو نفس سوم الدالة العادية؟" size={64} mode="slide" color="#3c3c3c" />
        {t > C("same0") && t < E("same0", 0.6) && <Bubble t={t} t0={C("same0")} t1={E("same0", 0.6)} x={540} y={640} w={440} text="نفس السوم ؟ 🤔" size={60} />}
        <KT t={t} t0={C("yes")} t1={E("yes", 0.5)} x={540} y={430} text="إي، نفس السوم" size={84} mode="pop" color={NAVY} />
        {t > C("yes", 0.3) && t < E("yes", 0.5) && (<>
          <div style={{ position: "absolute", left: 90, top: 640, width: 360, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 40, color: NAVY, background: "#fff", border: `5px solid ${NAVY}`, borderRadius: 28, padding: "14px 10px", transform: `scale(${elastic(prog(t, C("yes", 0.3), 0.5), 1.2, 0.5)})`, direction: "rtl" }}>الدالة الحاضرة</div>
          <div style={{ position: "absolute", left: 630, top: 640, width: 360, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 40, color: NAVY, background: "#fff", border: `5px solid ${NAVY}`, borderRadius: 28, padding: "14px 10px", transform: `scale(${elastic(prog(t, C("yes", 0.45), 0.5), 1.2, 0.5)})`, direction: "rtl" }}>الدالة العادية</div>
          <div style={{ position: "absolute", left: 470, top: 600, width: 140, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 130, color: RED, transform: `scale(${elastic(prog(t, C("yes", 0.7), 0.5), 1.4, 0.45)})` }}>=</div>
          <Check x={540} y={880} p={prog(t, C("yes", 1.0), 0.6)} />
        </>)}
        <KT t={t} t0={C("chantier")} t1={E("chantier", 0.5)} x={540} y={430} text="تكلفة الشانطي تنقص" size={72} mode="drop" w={980} color={NAVY} />
        {t > C("chantier", 0.2) && t < E("chantier", 0.5) && (
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
            {[0, 1, 2, 3].map((i) => { const h = 300 * (1 - 0.18 * i * eo(prog(t, C("chantier", 0.4 + i * 0.12), 0.5)) - (i > 0 ? 0.1 * i : 0)); return <rect key={i} x={250 + i * 150} y={820 - h * eo(prog(t, C("chantier", 0.2), 0.4))} width={96} height={h * eo(prog(t, C("chantier", 0.2), 0.4))} rx={16} fill={i === 3 ? "#2fb344" : "#9fb0ea"} />; })}
            <path d={`M240 ${600} L 760 ${790}`} stroke={RED} strokeWidth={12} strokeLinecap="round" strokeDasharray={1} pathLength={1} strokeDashoffset={1 - prog(t, C("chantier", 0.5), 0.6)} />
          </svg>
        )}
        {[["less0", "أقل كوفراج", "pop"], ["less1", "أقل أيّام عمل", "slide"], ["less2", "أقل يد عاملة", "stretch"]].map(([k, txt, m], i) => (
          <KT key={k} t={t} t0={C(k as string)} t1={i === 2 ? E("less2", 0.6) : E(k as string, 0.15)} x={540} y={430} text={txt as string} size={96} mode={m as "pop"} color={i === 1 ? RED : NAVY} bg="#fff" />
        ))}
        {t > C("less0") && t < E("less2", 0.6) && [0, 1, 2].map((i) => {
          const t0 = C(["less0", "less1", "less2"][i]); const pp = elastic(prog(t, t0 + 0.15, 0.6), 1.3, 0.5); if (t < t0) return null;
          return <svg key={i} width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><g transform={`translate(${250 + i * 290} 760) scale(${pp})`}><rect x={-100} y={-70} width={200} height={140} rx={30} fill="#fff" stroke="#e3e6ee" strokeWidth={6} />
            {i === 0 && <g><rect x={-60} y={-30} width={120} height={14} rx={7} fill="#c9a56b" /><rect x={-60} y={-6} width={120} height={14} rx={7} fill="#c9a56b" /><rect x={-60} y={18} width={120} height={14} rx={7} fill="#c9a56b" /><path d="M-70 -44 L70 52" stroke={RED} strokeWidth={9} strokeLinecap="round" /></g>}
            {i === 1 && <g><rect x={-56} y={-44} width={112} height={92} rx={14} fill="#eef1f8" stroke={NAVY} strokeWidth={6} /><rect x={-56} y={-44} width={112} height={26} rx={12} fill={NAVY} />{[0, 1, 2, 3].map((q) => <rect key={q} x={-40 + q * 26} y={-6} width={16} height={14} rx={4} fill="#9fb0ea" />)}<text y={44} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={44} fill={RED} transform="translate(0 -4)">- J</text></g>}
            {i === 2 && <g><path d="M-44 14 Q0 -64 44 14 Z" fill={RED} stroke={NAVY} strokeWidth={6} /><rect x={-56} y={12} width={112} height={14} rx={7} fill={RED} stroke={NAVY} strokeWidth={5} /><circle cx={0} cy={50} r={18} fill="#cccccc" stroke={NAVY} strokeWidth={5} /></g>}
          </g></svg>;
        })}
        <MorphPill t={t} t0={C("save", -0.05)} t1={END - 0.15} x={540} y={520} text="توفّر وقت + تكلفة" size={70} color={RED} w={880} />
        {t > C("save", 0.5) && t < END && <Check x={540} y={760} p={prog(t, C("save", 0.5), 0.6)} s={1.4} />}
        {t > C("save", 0.4) && t < C("save", 1.6) && <Burst t={t} t0={C("save", 0.3)} cx={540} cy={560} n={26} d={420} life={1.1} seed={31} />}

        <Logo a={logoA} />
        <Sequence from={Math.round(END * FPS)} durationInFrames={150}><OutroW /></Sequence>
      </AbsoluteFill>
    </FontLoader>
  );
};
const OutroW: React.FC = () => { const f = useCurrentFrame(); return <div style={{ position: "absolute", inset: 0, background: "#fff" }}><div style={{ position: "absolute", inset: 0, opacity: Math.min(1, f / 10) }}><Outro t={f / FPS} /></div></div>; };
