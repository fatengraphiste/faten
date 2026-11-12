import React from "react";
import { A } from "../lib";
import { Cam, DimIso, Line, Solid, ST, Tag, box, clamp, eo, iso, Fit } from "./engine";
import { Crane, DA_T, ENT_H, Layer, Layers, K, PITCH, Prop, Worker, beamCenters, beamPolys, entrevousPolys, hollowPolys } from "./Parts";
import { NAVY, YEL } from "./theme";
import { Legend, Leg } from "./Legend";

/* hollow-core roof : n slabs side by side spanning x, dropping from above (optionally with a crane) */
const HollowRoof = (c: Cam, W: number, D: number, z0: number, n: number, ts: number[], out: number, hl: boolean, t: number): Layer[] =>
  Array.from({ length: n }, (_, i) => ({ key: K(W, 1.2 * (i + 1), z0 + DA_T) + 100, node: <Solid key={i} polys={hollowPolys(c, 1.2 * i, 1.2 * (i + 1), 0, W, z0)} t={t} t0={ts[i]} dur={0.8} mode="drop" dz={4.5 * c.u} style={hl ? ST.hl : ST.navy} vanish={out} /> }));

/* ---------------- CASE 1 : showroom 14 m ---------------- */
export const LEG6: Leg[] = [
  { t0: 36.95, t1: 41.15, title: "Cas 1 · Showroom de 14 m", sub: ["Une grande salle, entièrement ouverte."] },
  { t0: 41.2, t1: 45.4, title: "Dalle alvéolée", sub: ["14 m > 9 m : zéro poteau,", "espace 100 % libre."] },
];
export const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const c: Cam = { ox: 420, oy: 640, u: 40 };
  const W = 14, D = 7.2, Hh = 3.2, th = DA_T, out = 45.4;
  const L: Layer[] = [];
  const add = (key: number, node: React.ReactNode) => L.push({ key, node });
  add(-1000, <Solid polys={box(c, -0.8, -0.8, -0.3, W + 0.8, D + 0.8, 0)} t={t} t0={37.0} dur={0.8} style={ST.thin} vanish={out} />);
  add(K(0.4, D, 3), <Solid polys={box(c, 0, 0, 0, 0.4, D, Hh)} t={t} t0={37.1} dur={0.7} style={ST.base} vanish={out} />);
  add(K(W - 0.4, 0.3, 3), <Solid polys={box(c, 0.4, 0, 0, W - 0.4, 0.3, Hh)} t={t} t0={37.3} dur={0.7} style={ST.base} vanish={out} />);
  add(K(W, D, 3) + 500, <Solid polys={box(c, W - 0.4, 0, 0, W, D, Hh)} t={t} t0={37.5} dur={0.7} style={ST.base} vanish={out} />);
  const ts = [0, 1, 2, 3, 4, 5].map((i) => 41.2 + i * 0.16);
  const roof = HollowRoof(c, W, D, Hh, 6, ts, out, t > A(100), t);
  const verdict = t > A(100);
  return (
    <g>
      <Fit k="s6">
      <Layers items={[...L, ...roof]} />
      <DimIso c={c} a={[0, D, 0]} b={[W, D, 0]} off={[0, 1.5, 0]} label="14 m" t={t} t0={A(95)} size={44} />
      {t > A(98) - 0.2 && t < 41.2 && <Line pts={[iso(c, 0.5, 0.4, 0.02), iso(c, W - 0.5, 0.4, 0.02), iso(c, W - 0.5, D, 0.02), iso(c, 0.5, D, 0.02), iso(c, 0.5, 0.4, 0.02)]} t={t} t0={A(98) - 0.2} dur={0.8} stroke={YEL} sw={4} />}
      {t > A(98) && t < 41.2 && (() => { const p = iso(c, W / 2, D / 2, 0); return <Tag x={p[0]} y={p[1]} text="ESPACE OUVERT ?" t={t} t0={A(98)} size={30} />; })()}
      {verdict && (() => { const p = iso(c, W / 2, D / 2, Hh + th + 1.2); return <Tag x={p[0]} y={p[1] - 40} text="DALLE ALVÉOLÉE" t={t} t0={A(100)} size={36} check />; })()}
      {t > A(104) - 0.2 && <Line pts={[iso(c, 0, -1.3, Hh + th + 1.4), iso(c, 9, -1.3, Hh + th + 1.4)]} t={t} t0={A(104) - 0.2} dur={0.5} stroke={YEL} sw={5} />}
      {t > A(104) && (() => { const p = iso(c, 4.5, -1.3, Hh + th + 1.4); return <Tag x={p[0] - 30} y={p[1] - 36} text="9 m max. poutrelles" t={t} t0={A(104)} size={24} />; })()}
      {t > A(105) && (() => { const p = iso(c, W - 1, -1.3, Hh + th + 1.4); return <Tag x={p[0] - 20} y={p[1] - 10} text="14 m > 9 m" t={t} t0={A(105)} size={32} check />; })()}
      </Fit>
      <Legend t={t} items={LEG6} />
    </g>
  );
};

/* ---------------- CASE 2 : L-shaped house with small rooms ---------------- */
export const LEG7: Leg[] = [
  { t0: 45.5, t1: 48.1, title: "Cas 2 · Maison à petites pièces", sub: ["Plan cloisonné, angles variés."] },
  { t0: 48.15, t1: 51.25, title: "Poutrelles-entrevous", sub: ["S'adaptent au plan :", "économique et modulable."] },
];
export const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const c: Cam = { ox: 540, oy: 660, u: 50 };
  const Hh = 3, out = 51.3;
  const L: Layer[] = [];
  const add = (key: number, node: React.ReactNode) => L.push({ key, node });
  const wall = (x0: number, y0: number, x1: number, y1: number, t0: number) => add(K(x1, y1, Hh), <Solid polys={box(c, x0, y0, 0, x1, y1, Hh)} t={t} t0={t0} dur={0.7} style={ST.base} vanish={out} />);
  add(-1000, <Solid polys={box(c, -0.8, -0.8, -0.3, 8.8, 8.8, 0)} t={t} t0={45.5} dur={0.8} style={ST.thin} vanish={out} />);
  wall(0, 0, 0.25, 8, 45.6); wall(0.25, 0, 8, 0.25, 45.7);
  wall(4, 0.25, 4.25, 4, 46.0); wall(0.25, 4, 4, 4.25, 46.1);
  // L outline walls (low) on the front
  wall(0.25, 7.75, 4.25, 8, 46.3); wall(7.75, 0.25, 8, 4.25, 46.4); wall(4.25, 4, 8, 4.25, 46.5); wall(4, 4.25, 4.25, 7.75, 46.6);
  const room = (axis: "x" | "y", u0: number, u1: number, a0: number, a1: number, tB: number, tE: number, key: number) => {
    const cs = beamCenters(u0, u1);
    cs.forEach((uc, k) => add(key + uc * 10 + 0.3 * k, <Solid polys={beamPolys(c, axis, uc, a0, a1, Hh)} t={t} t0={tB + k * 0.06} dur={0.5} mode="drop" dz={80} style={ST.navy} vanish={out} />));
    cs.slice(0, -1).forEach((uc, k) => add(key + (uc + PITCH / 2) * 10 + 3, <Solid polys={entrevousPolys(c, axis, uc + PITCH / 2, a0, a1, Hh)} t={t} t0={tE + k * 0.06} dur={0.5} mode="drop" dz={70} style={ST.hl} vanish={out} />));
  };
  room("x", 0.25, 4, 0.25, 4, A(114), A(115), K(4, 4, 3.6));
  room("y", 4.25, 8, 0.25, 4, A(114) + 0.15, A(115) + 0.15, K(8, 4, 3.6) + 20);
  room("x", 4.25, 8, 4.25, 8, A(114) + 0.3, A(115) + 0.3, K(4, 8, 3.6) + 10);
  const hlOn = t > A(112) - 0.1;
  return (
    <g>
      <Fit k="s7">
      <Layers items={L} />
      {hlOn && t < out && <Line pts={[iso(c, 0, 0, Hh + 0.4), iso(c, 8, 0, Hh + 0.4), iso(c, 8, 4.25, Hh + 0.4), iso(c, 4.25, 4.25, Hh + 0.4), iso(c, 4.25, 8, Hh + 0.4), iso(c, 0, 8, Hh + 0.4), iso(c, 0, 0, Hh + 0.4)]} t={t} t0={A(112) - 0.1} dur={1.0} stroke={YEL} sw={4} vanish={out} />}
      {(() => { const p = iso(c, 4, 4, Hh + 1.2); return <Tag x={p[0] - 150} y={p[1] - 110} text="ANGLES COMPLEXES" t={t} t0={A(112)} size={26} />; })()}
      {t > A(114) && (() => { const p = iso(c, 4, 4, Hh + 1.2); return <Tag x={p[0]} y={p[1] - 230} text="POUTRELLES-ENTREVOUS" t={t} t0={A(114)} size={30} check />; })()}
      {t > A(119) && (() => { const p = iso(c, 4, 4, Hh + 1.2); return <Tag x={p[0]} y={p[1] + 130} text="ÉCONOMIQUE · MODULABLE" t={t} t0={A(119)} size={28} check />; })()}
      </Fit>
      <Legend t={t} items={LEG7} />
    </g>
  );
};

/* ---------------- CASE 3 : depot 11 m, crane, free lower zone ---------------- */
export const LEG8: Leg[] = [
  { t0: 51.4, t1: 54.55, title: "Cas 3 · Dépôt de 11 m", sub: ["Opérationnel dès le premier jour."] },
  { t0: 54.6, t1: 55.6, title: "Dalle alvéolée", sub: ["Une seule portée de 11 m."] },
  { t0: 55.65, t1: 56.6, title: "Sans étais", sub: ["Rien ne vient encombrer le sol."] },
  { t0: 56.65, t1: 59.3, title: "Pose rapide par le haut", sub: ["Zone inférieure libre :", "prête à l'emploi dès le jour 1."] },
];
export const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const c: Cam = { ox: 430, oy: 650, u: 42 };
  const W = 11, D = 8.4, Hh = 3.4, th = DA_T, out = 59.4;
  const L: Layer[] = [];
  const add = (key: number, node: React.ReactNode) => L.push({ key, node });
  add(-1000, <Solid polys={box(c, -1, -1, -0.3, W + 1, D + 1, 0)} t={t} t0={51.4} dur={0.8} style={ST.thin} vanish={out} />);
  add(-500, <Crane c={c} x={5.5} y={-2.4} h={9.6} jibEnd={[5.5, 9.6]} counterEnd={[5.5, -4.6]} t={t} t0={55.2} vanish={out} />);
  add(K(0.4, D, 3), <Solid polys={box(c, 0, 0, 0, 0.4, D, Hh)} t={t} t0={51.5} dur={0.7} style={ST.base} vanish={out} />);
  add(K(W, D, 3) + 500, <Solid polys={box(c, W - 0.4, 0, 0, W, D, Hh)} t={t} t0={51.6} dur={0.7} style={ST.base} vanish={out} />);
  const ts = [0, 1, 2, 3, 4, 5, 6].map((i) => 56.55 + i * 0.35);
  const n = 7, wd = 1.2;
  const slabs: Layer[] = ts.map((t0, i) => ({ key: K(W, wd * (i + 1), Hh + th) + 100, node: <Solid key={i} polys={hollowPolys(c, wd * i, wd * (i + 1), 0, W, Hh)} t={t} t0={t0} dur={0.85} mode="drop" dz={5 * c.u} style={t > 57.6 ? ST.hl : ST.navy} vanish={out} /> }));
  const hooks = ts.map((t0, i) => {
    if (t < t0 || t > t0 + 1.05) return null;
    const p = clamp((t - t0) / 0.85), yc = wd * i + wd / 2, z = Hh + th + 5 * (1 - eo(p));
    const hp = iso(c, 5.5, yc, z), tr = iso(c, 5.5, yc, 9.6), a = iso(c, 2, yc, z), b = iso(c, 9, yc, z);
    return <g key={"h" + i}><path d={`M${tr[0]} ${tr[1]} L${hp[0]} ${hp[1]} M${hp[0]} ${hp[1]} L${a[0]} ${a[1]} M${hp[0]} ${hp[1]} L${b[0]} ${b[1]}`} stroke={NAVY} strokeWidth={1.4} fill="none" /><circle cx={hp[0]} cy={hp[1]} r={4.5} fill="#fff" stroke={NAVY} strokeWidth={2} /></g>;
  });
  const props: Layer[] = [];
  [3, 5.5, 8].forEach((x, a) => [1.2, 2.8, 4.4, 6.0, 7.6].forEach((y, b) => props.push({ key: K(x, y, 0) + 50, node: <Prop c={c} x={x} y={y} z1={Hh} t={t} t0={A(132) - 0.1 + (a * 5 + b) * 0.02} vanish={A(133) + 0.5} /> })));
  const xo = clamp((t - A(133)) / 0.5);
  return (
    <g>
      <Fit k="s8">
      <Layers items={[...L, ...slabs, ...props]} />
      {hooks}
      <DimIso c={c} a={[0, D, Hh + th]} b={[W, D, Hh + th]} off={[0, 1.5, 0]} label="11 m" t={t} t0={A(124) - 0.2} size={44} />
      {t > A(126) && t < 56.5 && <Line pts={[iso(c, 0.6, 0.5, 0.02), iso(c, W - 0.6, 0.5, 0.02), iso(c, W - 0.6, D, 0.02), iso(c, 0.6, D, 0.02), iso(c, 0.6, 0.5, 0.02)]} t={t} t0={A(126)} dur={0.9} stroke={YEL} sw={4} dash="14 10" />}
      <Worker c={c} p={[8.5, D - 0.7, 0]} t={t} t0={A(127)} vanish={out} />
      {t > A(130) && t < 56.6 && (() => { const p = iso(c, W / 2, D / 2, Hh + 1.4); return <Tag x={p[0]} y={p[1] - 20} text="DALLE ALVÉOLÉE" t={t} t0={A(130)} size={36} check />; })()}
      {t > A(133) && t < A(133) + 1.7 && (() => { const q = iso(c, 5.5, 5.2, 1.6); return (
        <g opacity={Math.min(1, (A(133) + 1.7 - t) * 3)}>
          <circle cx={q[0]} cy={q[1]} r={60} fill="none" stroke={YEL} strokeWidth={10} pathLength={1} strokeDasharray="1 1.02" strokeDashoffset={1 - Math.min(1, xo * 2)} />
          <path d={`M${q[0] - 42} ${q[1] + 42} L${q[0] + 42} ${q[1] - 42}`} stroke={YEL} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray="1 1.02" strokeDashoffset={1 - Math.max(0, xo * 2 - 1)} />
        </g>); })()}
      {t > 57.9 && <Line pts={[iso(c, 0.6, 0.5, 0.02), iso(c, W - 0.6, 0.5, 0.02), iso(c, W - 0.6, D, 0.02), iso(c, 0.6, D, 0.02), iso(c, 0.6, 0.5, 0.02)]} t={t} t0={57.9} dur={0.8} stroke={YEL} sw={4} vanish={out} />}
      {t > 58.2 && <Tag x={540} y={1215} text="PRÊT DÈS LE JOUR 1" t={t} t0={58.2} size={30} check />}
      </Fit>
      <Legend t={t} items={LEG8} />
    </g>
  );
};
