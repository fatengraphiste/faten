import React from "react";
import { DK, FONT, GRY, NAVY, YEL, YEL_L } from "./theme";
import { FITS } from "./fit";

/* ------------------------------------------------------------------ */
/*  Strict isometric projection : X -> (cos30, sin30), Y -> (-cos30, sin30), Z -> up */
/* ------------------------------------------------------------------ */
export const COS30 = Math.cos(Math.PI / 6);
export type V3 = [number, number, number];
export type Cam = { ox: number; oy: number; u: number };
export type XY = [number, number];
export const iso = (c: Cam, x: number, y: number, z: number): XY => [c.ox + (x - y) * COS30 * c.u, c.oy + (x + y) * 0.5 * c.u - z * c.u];

export const LW = 1.6; // global line-weight factor
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const eo = (x: number) => 1 - Math.pow(1 - x, 3);
export const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const sm = (x: number, a: number, b: number) => eo(clamp((x - a) / (b - a)));
export const ebo = (x: number) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

/* ---------- geometry builders ---------- */
export type Poly = { pts: XY[]; holes?: XY[][] };
export const box = (c: Cam, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): Poly[] => [
  { pts: [iso(c, x0, y1, z0), iso(c, x1, y1, z0), iso(c, x1, y1, z1), iso(c, x0, y1, z1)] }, // +y face (left)
  { pts: [iso(c, x1, y0, z0), iso(c, x1, y1, z0), iso(c, x1, y1, z1), iso(c, x1, y0, z1)] }, // +x face (right)
  { pts: [iso(c, x0, y0, z1), iso(c, x1, y0, z1), iso(c, x1, y1, z1), iso(c, x0, y1, z1)] }, // top
];
/* extrusion of a 2D profile (u,v) along axis 'x' (profile in y,z) or 'y' (profile in x,z) */
export const prism = (c: Cam, axis: "x" | "y", prof: XY[], a0: number, a1: number, holes: XY[][] = []): Poly[] => {
  const P = (a: number, u: number, v: number): XY => (axis === "x" ? iso(c, a, u, v) : iso(c, u, a, v));
  let pr = prof;
  const area = pr.reduce((s, p, i) => { const q = pr[(i + 1) % pr.length]; return s + (p[0] * q[1] - q[0] * p[1]); }, 0);
  if (area < 0) pr = [...pr].reverse();
  const out: { k: number; p: Poly }[] = [];
  for (let i = 0; i < pr.length; i++) {
    const p = pr[i], q = pr[(i + 1) % pr.length];
    const dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy) || 1;
    const nu = dy / len, nv = -dx / len;
    if (nu + nv > 0.01) out.push({ k: nu + nv, p: { pts: [P(a0, p[0], p[1]), P(a0, q[0], q[1]), P(a1, q[0], q[1]), P(a1, p[0], p[1])] } });
  }
  out.sort((a, b) => a.k - b.k);
  const end: Poly = { pts: pr.map((p) => P(a1, p[0], p[1])), holes: holes.map((h) => h.map((p) => P(a1, p[0], p[1]))) };
  return [...out.map((o) => o.p), end];
};
export const oct = (cu: number, cv: number, w: number, h: number): XY[] => [
  [cu - 0.26 * w, cv - h / 2], [cu + 0.26 * w, cv - h / 2], [cu + 0.5 * w, cv - h / 2 + 0.24 * h], [cu + 0.5 * w, cv + h / 2 - 0.24 * h],
  [cu + 0.26 * w, cv + h / 2], [cu - 0.26 * w, cv + h / 2], [cu - 0.5 * w, cv + h / 2 - 0.24 * h], [cu - 0.5 * w, cv - h / 2 + 0.24 * h],
];
export const rectUV = (u0: number, v0: number, u1: number, v1: number): XY[] => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];

/* ---------- styles ---------- */
export type Style = { stroke: string; sw: number; fill: string };
export const ST = {
  base: { stroke: GRY, sw: 1.3, fill: "#ffffff" } as Style,
  thin: { stroke: GRY, sw: 1, fill: "#ffffff" } as Style,
  navy: { stroke: NAVY, sw: 2, fill: "#ffffff" } as Style,
  hl: { stroke: NAVY, sw: 2, fill: YEL_L } as Style,
  gold: { stroke: YEL, sw: 2.2, fill: "#ffffff" } as Style,
  gray2: { stroke: GRY, sw: 1.3, fill: "#f6f6f6" } as Style,
};
const dOf = (p: Poly) => {
  const m = (pts: XY[]) => "M" + pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L") + " Z";
  return m(p.pts) + (p.holes ?? []).map(m).join(" ");
};

/* ---------- Solid ---------- */
export const Solid: React.FC<{
  polys: Poly[]; t: number; t0: number; dur?: number; style?: Style; mode?: "draw" | "drop" | "fade" | "static";
  dz?: number; vanish?: number; vanishDur?: number; op?: number; skipFillAnim?: boolean; styles?: Style[];
}> = ({ polys, t, t0, dur = 0.8, style = ST.base, mode = "draw", dz = 120, vanish, vanishDur = 0.6, op = 1, styles }) => {
  if (t < t0) return null;
  let fade = 1;
  if (vanish !== undefined && t > vanish) { const q = clamp((t - vanish) / vanishDur); if (q >= 1) return null; fade = 1 - q; }
  const p = clamp((t - t0) / dur);
  const n = polys.length;
  const ty = mode === "drop" ? -dz * (1 - eo(p)) : 0;
  const gop = mode === "drop" ? Math.min(1, p * 5) : mode === "fade" ? eo(p) : 1;
  return (
    <g transform={`translate(0 ${ty})`} opacity={gop * fade * op}>
      {polys.map((poly, i) => {
        const s = styles ? styles[i] ?? style : style;
        const d = dOf(poly);
        if (mode !== "draw") return <path key={i} d={d} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw * LW} strokeLinejoin="round" fillRule="evenodd" />;
        const stag = n > 1 ? Math.min(0.16, 0.55 / (n - 1)) : 0;
        const pi = eio(clamp((p - i * stag) / (1 - (n - 1) * stag)));
        return (
          <g key={i}>
            <path d={d} fill={s.fill} fillOpacity={sm(pi, 0.35, 0.9)} stroke="none" fillRule="evenodd" />
            <path d={d} fill="none" stroke={s.stroke} strokeWidth={s.sw * LW} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1.02" strokeDashoffset={1 - pi} />
          </g>
        );
      })}
    </g>
  );
};

/* ---------- polyline in iso ---------- */
export const Line: React.FC<{ pts: XY[]; t: number; t0: number; dur?: number; stroke?: string; sw?: number; dash?: string; vanish?: number; vanishDur?: number; op?: number; cap?: "round" | "butt" }> = ({ pts, t, t0, dur = 0.5, stroke = GRY, sw = 1.2, dash, vanish, vanishDur = 0.5, op = 1, cap = "round" }) => {
  if (t < t0) return null;
  let fade = 1;
  if (vanish !== undefined && t > vanish) { const q = clamp((t - vanish) / vanishDur); if (q >= 1) return null; fade = 1 - q; }
  const p = eio(clamp((t - t0) / dur));
  const d = "M" + pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L");
  if (dash) return <path d={d} fill="none" stroke={stroke} strokeWidth={sw * LW} strokeDasharray={dash} strokeLinecap={cap} opacity={p * fade * op} />;
  return <path d={d} fill="none" stroke={stroke} strokeWidth={sw * LW} strokeLinecap={cap} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1.02" strokeDashoffset={1 - p} opacity={fade * op} />;
};

/* ---------- isometric dimension line ---------- */
export const DimIso: React.FC<{ c: Cam; a: V3; b: V3; off: V3; label: string; t: number; t0: number; col?: string; size?: number; lab?: V3 }> = ({ c, a, b, off, label, t, t0, col = NAVY, size = 34, lab }) => {
  const p = eio(seg(t, t0, t0 + 0.7));
  if (p <= 0) return null;
  const A = iso(c, a[0] + off[0], a[1] + off[1], a[2] + off[2]);
  const B = iso(c, b[0] + off[0], b[1] + off[1], b[2] + off[2]);
  const a0 = iso(c, ...a), b0 = iso(c, ...b);
  const ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
  const head = (x: number, y: number, an: number) => {
    const L = 16, W = 6, bx = x - Math.cos(an) * L, by = y - Math.sin(an) * L;
    return `${x},${y} ${bx + Math.sin(an) * W},${by - Math.cos(an) * W} ${bx - Math.sin(an) * W},${by + Math.cos(an) * W}`;
  };
  const m = lab ? iso(c, ...lab) : [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  return (
    <g>
      <path d={`M${a0[0]} ${a0[1]} L${A[0]} ${A[1]} M${b0[0]} ${b0[1]} L${B[0]} ${B[1]}`} stroke={col} strokeWidth={2} opacity={p} fill="none" />
      <path d={`M${A[0]} ${A[1]} L${B[0]} ${B[1]}`} stroke={col} strokeWidth={3.4} fill="none" pathLength={1} strokeDasharray="1 1.02" strokeDashoffset={1 - p} />
      {p > 0.85 && <polygon points={head(A[0], A[1], ang + Math.PI)} fill={col} />}
      {p > 0.85 && <polygon points={head(B[0], B[1], ang)} fill={col} />}
      <g opacity={sm(p, 0.4, 1)}>
        <text x={m[0]} y={m[1] - 14} fontSize={size} fontWeight={800} fill={col} textAnchor="middle" fontFamily={FONT} stroke="#fff" strokeWidth={9} paintOrder="stroke">{label}</text>
        <rect x={m[0] - label.length * size * 0.28} y={m[1] - 6} width={label.length * size * 0.56} height={4} fill={YEL} />
      </g>
    </g>
  );
};

/* ---------- small icon tags ---------- */
export const Tag: React.FC<{ x: number; y: number; text: string; t: number; t0: number; check?: boolean; size?: number; w?: number }> = ({ x, y, text, t, t0, check, size = 30, w }) => {
  const p = seg(t, t0, t0 + 0.4);
  if (p <= 0) return null;
  const tw = w ?? text.length * size * 0.62 + 40 + (check ? 40 : 0);
  const s = 0.6 + 0.4 * ebo(p);
  return (
    <g opacity={Math.min(1, p * 3)} transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-tw / 2} y={-size * 0.95} width={tw} height={size * 1.9} rx={size * 0.95} fill="#fff" stroke={NAVY} strokeWidth={3} />
      {check && <g transform={`translate(${-tw / 2 + size * 0.95} 0)`}><circle r={size * 0.55} fill={YEL} /><path d={`M${-size * 0.25} 0 L${-size * 0.05} ${size * 0.22} L${size * 0.28} ${-size * 0.2}`} fill="none" stroke={NAVY} strokeWidth={3.8} strokeLinecap="round" strokeLinejoin="round" /></g>}
      <text x={check ? size * 0.5 : 0} y={size * 0.05} fontSize={size} fontWeight={800} fill={NAVY} textAnchor="middle" dominantBaseline="central" fontFamily={FONT}>{text}</text>
    </g>
  );
};
export const Underline: React.FC<{ x1: number; x2: number; y: number; t: number; t0: number; col?: string }> = ({ x1, x2, y, t, t0, col = YEL }) => {
  const p = eio(seg(t, t0, t0 + 0.5));
  if (p <= 0) return null;
  return <path d={`M${x1} ${y} L${x2} ${y}`} stroke={col} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1.02" strokeDashoffset={1 - p} />;
};
void DK;

/* keeps the scene drawing inside the safe zone (transform measured per scene) */
export const Fit: React.FC<{ k: string; children: React.ReactNode }> = ({ k, children }) => <g transform={FITS[k] ?? ""}>{children}</g>;
