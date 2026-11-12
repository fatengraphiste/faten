import React from "react";
import { Cam, Line, Poly, Solid, ST, Style, V3, XY, box, clamp, eio, eo, iso, oct, prism, rectUV, seg } from "./engine";
import { GRY, NAVY, YEL } from "./theme";

/* ---------- precast elements : REAL sizes (see Real.ts) ---------- */
import { DA_T, DA_W, ENT_H, PITCH, SLAB_T, entCells, entProfile, poutProfile } from "./Real";
export { PITCH, ENT_H, SLAB_T, DA_T, DA_W };
/* poutrelle : axis 'x'|'y', centred across on uc, bottom at z0 */
export const beamPolys = (c: Cam, axis: "x" | "y", uc: number, a0: number, a1: number, z0: number): Poly[] => prism(c, axis, poutProfile(uc, z0), a0, a1);
/* entrevous : 50 x 20 cm, centred across on uc */
export const entrevousPolys = (c: Cam, axis: "x" | "y", uc: number, a0: number, a1: number, z0: number): Poly[] => prism(c, axis, entProfile(uc, z0), a0, a1, entCells(uc, z0));
/* hollow-core slab : y0..y1 (1.2 m), spans x0..x1, 7 alveoles on the +x end face */
export const hollowPolys = (c: Cam, y0: number, y1: number, x0: number, x1: number, z0: number): Poly[] => {
  const w = y1 - y0, pitch = 0.157, holes: XY[][] = [];
  for (let k = 0; k < 7; k++) holes.push(oct(y0 + w / 2 + (k - 3) * pitch, z0 + DA_T * 0.52, 0.103, 0.125));
  return prism(c, "x", rectUV(y0, z0, y1, z0 + DA_T), x0, x1, holes);
};
/* centres of the beams across a room [u0,u1] */
export const beamCenters = (u0: number, u1: number): number[] => {
  const out: number[] = [];
  for (let u = u0 + 0.32; u <= u1 - 0.32; u += PITCH) out.push(u);
  return out;
};

/* ---------- prop (étai) ---------- */
export const Prop: React.FC<{ c: Cam; x: number; y: number; z0?: number; z1: number; t: number; t0: number; vanish?: number; col?: string }> = ({ c, x, y, z0 = 0, z1, t, t0, vanish, col = GRY }) => {
  const a = iso(c, x, y, z0), b = iso(c, x, y, z1);
  const pl = (z: number, s: number): XY[] => [iso(c, x - s, y - s, z), iso(c, x + s, y - s, z), iso(c, x + s, y + s, z), iso(c, x - s, y + s, z), iso(c, x - s, y - s, z)];
  return (
    <g>
      <Line pts={[a, b]} t={t} t0={t0} dur={0.45} stroke={col} sw={2.4} vanish={vanish} />
      <Line pts={pl(z0 + 0.02, 0.16)} t={t} t0={t0 + 0.1} dur={0.3} stroke={col} sw={1.3} vanish={vanish} />
      <Line pts={pl(z1 - 0.02, 0.16)} t={t} t0={t0 + 0.15} dur={0.3} stroke={col} sw={1.3} vanish={vanish} />
      <Line pts={[iso(c, x, y, z0 + (z1 - z0) * 0.45), iso(c, x, y, z0 + (z1 - z0) * 0.55)]} t={t} t0={t0 + 0.2} dur={0.2} stroke={NAVY} sw={4} vanish={vanish} />
    </g>
  );
};

/* ---------- worker (2D line figure standing at an iso point, ~1.7 m) ---------- */
export const Worker: React.FC<{ c: Cam; p: V3; t: number; t0: number; vanish?: number; carry?: boolean }> = ({ c, p, t, t0, vanish, carry }) => {
  if (t < t0) return null;
  let fade = eo(clamp((t - t0) / 0.4));
  if (vanish !== undefined && t > vanish) fade *= 1 - clamp((t - vanish) / 0.4);
  if (fade <= 0) return null;
  const [x, y] = iso(c, p[0], p[1], p[2]);
  const s = c.u * 0.036;
  const bob = Math.sin((t - t0) * 4) * 1.6;
  return (
    <g transform={`translate(${x} ${y + bob * 0.4}) scale(${s})`} opacity={fade} fill="none" stroke={NAVY} strokeWidth={2.4 / s} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={0} cy={-46} r={4.4} fill="#fff" />
      <path d="M-5.5 -50 Q0 -57 5.5 -50 Z" fill={YEL} stroke={NAVY} />
      <path d="M0 -41.5 V-24 M0 -24 L-5 -3 M0 -24 L5 -3" />
      <path d={carry ? "M0 -38 L-9 -33 L-7 -26 M0 -38 L9 -33 L7 -26" : "M0 -38 L-8 -28 M0 -38 L8 -28"} />
      {carry && <rect x={-9} y={-32} width={18} height={7} fill="#fff" stroke={GRY} />}
    </g>
  );
};

/* ---------- tower crane (line art) : jib runs from counterEnd to jibEnd at height h ---------- */
export const Crane: React.FC<{ c: Cam; x: number; y: number; h: number; jibEnd: [number, number]; counterEnd: [number, number]; t: number; t0: number; vanish?: number }> = ({ c, x, y, h, jibEnd, counterEnd, t, t0, vanish }) => {
  const m = 0.32;
  const mast: XY[][] = [
    [iso(c, x - m, y - m, 0), iso(c, x - m, y - m, h)], [iso(c, x + m, y - m, 0), iso(c, x + m, y - m, h)],
    [iso(c, x + m, y + m, 0), iso(c, x + m, y + m, h)], [iso(c, x - m, y + m, 0), iso(c, x - m, y + m, h)],
  ];
  const braces: XY[][] = [];
  for (let z = 0; z < h - 0.6; z += 1.2) {
    braces.push([iso(c, x + m, y - m, z), iso(c, x + m, y + m, z + 1.2)]);
    braces.push([iso(c, x + m, y + m, z), iso(c, x - m, y + m, z + 1.2)]);
  }
  const jt = iso(c, jibEnd[0], jibEnd[1], h), jb = iso(c, counterEnd[0], counterEnd[1], h);
  const top = iso(c, x, y, h + 1.5);
  const cw = iso(c, counterEnd[0], counterEnd[1], h - 0.4);
  return (
    <g>
      {mast.map((l, i) => <Line key={"m" + i} pts={l} t={t} t0={t0 + i * 0.05} dur={0.7} stroke={NAVY} sw={1.6} vanish={vanish} />)}
      {braces.map((l, i) => <Line key={"b" + i} pts={l} t={t} t0={t0 + 0.3 + i * 0.03} dur={0.3} stroke={GRY} sw={1} vanish={vanish} />)}
      <Line pts={[jt, jb]} t={t} t0={t0 + 0.7} dur={0.8} stroke={NAVY} sw={2.6} vanish={vanish} />
      <Line pts={[iso(c, x, y, h), top]} t={t} t0={t0 + 0.9} dur={0.3} stroke={NAVY} sw={1.8} vanish={vanish} />
      <Line pts={[top, jt]} t={t} t0={t0 + 1.0} dur={0.5} stroke={GRY} sw={1.1} vanish={vanish} />
      <Line pts={[top, jb]} t={t} t0={t0 + 1.0} dur={0.5} stroke={GRY} sw={1.1} vanish={vanish} />
      <Line pts={[jb, cw]} t={t} t0={t0 + 1.1} dur={0.3} stroke={NAVY} sw={6} vanish={vanish} />
    </g>
  );
};

/* ---------- layering helper ---------- */
export type Layer = { key: number; node: React.ReactNode };
export const Layers: React.FC<{ items: Layer[] }> = ({ items }) => <g>{[...items].sort((a, b) => a.key - b.key).map((l, i) => <React.Fragment key={i}>{l.node}</React.Fragment>)}</g>;
export const K = (x1: number, y1: number, z1 = 0) => (x1 + y1) * 10 + z1;

/* ---------- sets of elements shared by several scenes ---------- */
export const sty = (hl: boolean): Style => (hl ? ST.hl : ST.base);
export { eio, seg, box };

/* ---------- callout : leader line + tag ---------- */
import { Tag } from "./engine";
export const Callout: React.FC<{ c: Cam; at: V3; dx: number; dy: number; text: string; t: number; t0: number; size?: number; check?: boolean }> = ({ c, at, dx, dy, text, t, t0, size = 22, check }) => {
  const p = iso(c, ...at);
  return (
    <g>
      <Line pts={[p, [p[0] + dx, p[1] + dy]]} t={t} t0={t0} dur={0.35} stroke={NAVY} sw={1.4} />
      <circle cx={p[0]} cy={p[1]} r={3.5} fill={NAVY} opacity={Math.min(1, Math.max(0, (t - t0) * 6))} />
      <Tag x={p[0] + dx} y={p[1] + dy - size * 0.6} text={text} t={t} t0={t0 + 0.25} size={size} check={check} />
    </g>
  );
};
