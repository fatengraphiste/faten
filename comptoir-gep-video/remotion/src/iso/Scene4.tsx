import React from "react";
import { A } from "../lib";
import { Cam, DimIso, Line, Solid, ST, Tag, box, iso, Fit } from "./engine";
import { Callout, ENT_H, Layer, Layers, K, PITCH, Prop, SLAB_T, Worker, beamCenters, beamPolys, entrevousPolys } from "./Parts";
import { FONT, NAVY, YEL } from "./theme";
import { Legend, Leg } from "./Legend";

export const LEG4A: Leg[] = [{ t0: 16.3, t1: 20.9, title: "Poutrelles + entrevous", sub: ["La solution des maisons et des plans", "complexes, pièce par pièce."] }];
export const LEG4B: Leg[] = [
  { t0: 21.05, t1: 22.9, title: "Montage manuel", sub: ["Sans grue : poutrelles et entrevous", "se posent à la main."] },
  { t0: 22.98, t1: 25.5, title: "Jusqu'à 9 m de portée", sub: ["Poutrelles précontraintes, entrevous", "et dalle de compression."] },
  { t0: 25.6, t1: 27.4, title: "Plus de 9 m ?", sub: ["Il faut passer à la dalle alvéolée."] },
];

/* ------------------------------------------------------------------ */
/*  4A : house with partitioned rooms (plan complexe)                  */
/* ------------------------------------------------------------------ */
export const Scene4A: React.FC<{ t: number }> = ({ t }) => {
  const c: Cam = { ox: 480, oy: 700, u: 50 };
  const W = 9.5, D = 6.4, Hh = 3;
  const out = 20.85;
  const L: Layer[] = [];
  const add = (key: number, node: React.ReactNode) => L.push({ key, node });
  const wall = (x0: number, y0: number, x1: number, y1: number, t0: number, st = ST.base) => add(K(x1, y1, Hh), <Solid polys={box(c, x0, y0, 0, x1, y1, Hh)} t={t} t0={t0} dur={0.8} style={st} vanish={out} />);
  add(-1000, <Solid polys={box(c, -0.7, -0.7, -0.3, W + 0.7, D + 0.7, 0)} t={t} t0={16.2} dur={0.9} style={ST.thin} vanish={out} />);
  wall(0, 0, 0.25, D, 16.3); wall(0.25, 0, W, 0.25, 16.4);
  wall(0.25, 3.4, W - 0.25, 3.65, 17.0); wall(5, 3.65, 5.25, D - 0.25, 17.1);
  // front edges : edge beams on slender columns (keeps the interior visible)
  add(K(W, D, 3), <Solid polys={box(c, 0, D - 0.25, 2.65, W, D, Hh)} t={t} t0={16.8} dur={0.7} style={ST.base} vanish={out} />);
  add(K(W, D, 3) + 1, <Solid polys={box(c, W - 0.25, 0.25, 2.65, W, D - 0.25, Hh)} t={t} t0={16.85} dur={0.7} style={ST.base} vanish={out} />);
  ([[W - 0.3, D - 0.3], [4.9, D - 0.3], [W - 0.3, 3.4]] as [number, number][]).forEach(([x, y], i) => add(K(x + 0.3, y + 0.3, 3) + 2, <Solid polys={box(c, x, y, 0, x + 0.3, y + 0.3, 2.65)} t={t} t0={16.6 + i * 0.1} dur={0.6} style={ST.base} vanish={out} />));
  // band 1 : poutrelles along x (long span), then entrevous
  const yc = beamCenters(0.25, 3.4);
  yc.forEach((y, k) => add(K(W - 0.25, y + 0.1, Hh + ENT_H), <Solid polys={beamPolys(c, "x", y, 0.25, W - 0.25, Hh)} t={t} t0={A(36) + k * 0.14} dur={0.6} mode="drop" dz={90} style={ST.navy} vanish={out} />));
  yc.slice(0, -1).forEach((y, k) => add(K(W - 0.25, y + PITCH / 2 + 0.25, Hh + ENT_H) + 0.2, <Solid polys={entrevousPolys(c, "x", y + PITCH / 2, 0.25, W - 0.25, Hh)} t={t} t0={A(39) + k * 0.13} dur={0.6} mode="drop" dz={90} style={ST.hl} vanish={out} />));
  // band 2 : two small rooms, beams along y
  [[0.25, 5.0, 0], [5.25, 9.25, 0.15]].forEach(([u0, u1, dl], r) => {
    const xs = beamCenters(u0, u1);
    xs.forEach((x, k) => add(K(x + 0.1, D - 0.25, Hh + ENT_H) + r * 5, <Solid polys={beamPolys(c, "y", x, 3.65, D - 0.25, Hh)} t={t} t0={A(46) - 0.1 + dl + k * 0.07} dur={0.55} mode="drop" dz={80} style={ST.navy} vanish={out} />));
    xs.slice(0, -1).forEach((x, k) => add(K(x + PITCH / 2 + 0.25, D - 0.25, Hh + ENT_H) + r * 5 + 0.2, <Solid polys={entrevousPolys(c, "y", x + PITCH / 2, 3.65, D - 0.25, Hh)} t={t} t0={A(47) + dl + k * 0.06} dur={0.5} mode="drop" dz={80} style={ST.hl} vanish={out} />));
  });
  return (
    <g>
      <Fit k="s4a">
      <Layers items={L} />
      <Callout c={c} at={[2, 1.3, Hh + 0.12]} dx={-120} dy={-120} text="POUTRELLES" t={t} t0={A(36) + 0.5} />
      <Callout c={c} at={[6.2, 2.2, Hh + 0.2]} dx={170} dy={-135} text="ENTREVOUS 50 × 20 cm" t={t} t0={A(39) + 0.5} />
      <Line pts={[iso(c, 0, 0, Hh + 0.3), iso(c, W, 0, Hh + 0.3), iso(c, W, D, Hh + 0.3), iso(c, 0, D, Hh + 0.3), iso(c, 0, 0, Hh + 0.3)]} t={t} t0={A(43)} dur={0.9} stroke={YEL} sw={3.5} vanish={out} />
      {(() => { const p = iso(c, W / 2, D / 2, Hh + 0.4); return <Tag x={p[0]} y={p[1] + 40} text="PLANS COMPLEXES" t={t} t0={A(46)} size={24} check />; })()}
      </Fit>
      <Legend t={t} items={LEG4A} />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/*  4B : 9 m span, props, hand assembly, no crane                      */
/* ------------------------------------------------------------------ */
export const Scene4B: React.FC<{ t: number }> = ({ t }) => {
  const c: Cam = { ox: 400, oy: 650, u: 56 };
  const W = 9.6, D = 3.6, Hh = 3;
  const out = 27.3;
  const L: Layer[] = [];
  const add = (key: number, node: React.ReactNode) => L.push({ key, node });
  add(-1000, <Solid polys={box(c, -0.6, -0.6, -0.3, W + 0.6, D + 1.4, 0)} t={t} t0={21.0} dur={0.7} style={ST.thin} vanish={out} />);
  add(K(0.3, D, 3), <Solid polys={box(c, 0, 0, 0, 0.3, D, Hh)} t={t} t0={21.05} dur={0.6} style={ST.base} vanish={out} />);
  add(K(W, 0.3, 3), <Solid polys={box(c, 0.3, 0, 0, W, 0.3, Hh)} t={t} t0={21.1} dur={0.6} style={ST.base} vanish={out} />);
  const yb = beamCenters(0.3, D);
  // props first (étais) – two rows
  [3.2, 6.4].forEach((px, r) => yb.forEach((y, k) => add(K(px, y, 0) + 1, <Prop c={c} x={px} y={y} z1={Hh} t={t} t0={21.4 + r * 0.25 + k * 0.05} vanish={out} />)));
  yb.forEach((y, k) => add(K(W - 0.3, y + 0.1, Hh + ENT_H) + 5, <Solid polys={beamPolys(c, "x", y, 0.3, W - 0.3, Hh)} t={t} t0={21.15 + k * 0.1} dur={0.55} mode="drop" dz={80} style={ST.navy} vanish={out} />));
  yb.slice(0, -1).forEach((y, k) => add(K(W - 0.3, y + PITCH / 2 + 0.25, Hh + ENT_H) + 6, <Solid polys={entrevousPolys(c, "x", y + PITCH / 2, 0.3, W - 0.3, Hh)} t={t} t0={21.6 + k * 0.18} dur={0.55} mode="drop" dz={70} style={ST.hl} vanish={out} />));
  add(K(W, D, 3.7) + 7, <Solid polys={box(c, 0.3, 0.3, Hh + ENT_H, W - 0.3, D - 0.3, Hh + ENT_H + SLAB_T)} t={t} t0={22.45} dur={0.8} style={{ stroke: NAVY, sw: 2, fill: "#fdeeee" }} mode="fade" vanish={out} />);
  add(K(W, D, 0) + 8, <Worker c={c} p={[2.2, D + 0.9, 0]} t={t} t0={21.2} carry vanish={22.9} />);
  // crossed crane icon (the voice says "no crane")
  const cx = 880, cy = 520, p = Math.min(1, Math.max(0, (t - A(51) + 0.05) / 0.5));
  return (
    <g>
      <Fit k="s4b">
      <Layers items={L} />
      {t > 21.9 && t < 22.95 && (
        <g opacity={Math.min(1, (t - 21.9) * 4) * Math.min(1, (22.95 - t) * 6)}>
          <g transform={`translate(${cx} ${cy}) scale(0.9)`} fill="none" stroke={NAVY} strokeWidth={4} strokeLinecap="round"><path d="M-30 50 V-50 M-50 -50 H55 M30 -50 V-14 M-30 -50 L-50 -30 M-48 50 H-12" /></g>
          <circle cx={cx} cy={cy} r={62} fill="none" stroke={YEL} strokeWidth={9} pathLength={1} strokeDasharray="1 1.02" strokeDashoffset={1 - p} />
          <path d={`M${cx - 44} ${cy + 44} L${cx + 44} ${cy - 44}`} stroke={YEL} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray="1 1.02" strokeDashoffset={1 - Math.max(0, p * 2 - 1)} />
        </g>
      )}
      <Callout c={c} at={[2.2, 0.7, Hh + 0.3]} dx={-90} dy={-150} text="POUTRELLE · 9 m" t={t} t0={21.3} />
      <Callout c={c} at={[3.2, 2.0, 1.5]} dx={-70} dy={160} text="ÉTAI" t={t} t0={21.8} />
      <DimIso c={c} a={[0.3, 0, Hh + 0.3]} b={[W - 0.3, 0, Hh + 0.3]} off={[0, -1.2, 1.1]} label="9 m" t={t} t0={A(57) - 0.5} size={44} />
      {/* beyond 9 m : dashed yellow extension and question */}
      <Line pts={[iso(c, W - 0.3, -1.2, Hh + 1.4), iso(c, W + 1.6, -1.2, Hh + 1.4)]} t={t} t0={A(63)} dur={0.6} stroke={YEL} sw={4} dash="14 10" />
      {(() => { const q = iso(c, W + 1.6, -1.2, Hh + 1.4); return <Tag x={q[0] - 30} y={q[1] - 72} text="> 9 m ?" t={t} t0={A(61)} size={36} />; })()}
      </Fit>
      <Legend t={t} items={LEG4B} />
      <text x={-100} y={-100} fontSize={1} fontFamily={FONT}>{""}</text>
    </g>
  );
};
