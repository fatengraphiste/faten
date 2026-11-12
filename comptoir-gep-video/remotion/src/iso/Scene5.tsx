import React from "react";
import { A } from "../lib";
import { Cam, DimIso, Line, Solid, ST, Tag, box, clamp, eo, iso } from "./engine";
import { Crane, Layer, Layers, K, Prop, Worker, hollowPolys } from "./Parts";
import { FONT, NAVY, YEL } from "./theme";
import { Legend, Leg } from "./Legend";

export const LEG5: Leg[] = [
  { t0: 27.45, t1: 29.15, title: "Dalle alvéolée", sub: ["7 alvéoles · béton précontraint."] },
  { t0: 29.2, t1: 32.2, title: "Jusqu'à 15 m de portée", sub: ["Aucun poteau intermédiaire :", "le volume reste entièrement ouvert."] },
  { t0: 32.25, t1: 33.3, title: "Pose à la grue", sub: ["Les dalles descendent par le haut", "et s'emboîtent côte à côte."] },
  { t0: 33.35, t1: 36.8, title: "Sans étais", sub: ["Sous-face libre : les travaux", "démarrent dès le premier jour."] },
];

export const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const c: Cam = { ox: 415, oy: 650, u: 40 };
  const W = 15, D = 7.8, Hh = 3, TH = 0.45;
  const L: Layer[] = [];
  const add = (key: number, node: React.ReactNode) => L.push({ key, node });
  const out = 36.85;
  add(-1000, <Solid polys={box(c, -1, -1, -0.3, W + 1, D + 1, 0)} t={t} t0={27.45} dur={0.8} style={ST.thin} vanish={out} />);
  add(K(0.4, D, 3), <Solid polys={box(c, 0, 0, 0, 0.4, D, Hh)} t={t} t0={27.5} dur={0.7} style={ST.base} vanish={out} />);
  add(K(W, D, 3) + 500, <Solid polys={box(c, W - 0.4, 0, 0, W, D, Hh)} t={t} t0={27.55} dur={0.7} style={ST.base} vanish={out} />);
  // tower crane behind the slabs, jib along Y
  add(-500, <Crane c={c} x={7.5} y={-2.4} h={9} jibEnd={[7.5, 9.6]} counterEnd={[7.5, -4.6]} t={t} t0={27.8} vanish={out} />);
  const t0s = [28.4, 28.9, 29.4, 29.9, 30.4, 32.25];
  const slabs: Layer[] = [];
  t0s.forEach((t0, i) => {
    const y0 = 0.3 + 1.2 * i;
    const first = i === 0;
    slabs.push({ key: K(W, y0 + 1.2, Hh + TH) + 100, node: <Solid polys={hollowPolys(c, y0, y0 + 1.2, 0, W, Hh, TH)} t={t} t0={t0} dur={0.85} mode="drop" dz={5 * c.u} style={first || (t > 33.3 && t < 36) ? ST.hl : ST.navy} vanish={out} /> });
  });
  // hook + cable for the slab currently descending
  const hooks = t0s.map((t0, i) => {
    const p = clamp((t - t0) / 0.85);
    if (t < t0 || t > t0 + 1.05) return null;
    const yc = 0.3 + 1.2 * i + 0.6;
    const z = Hh + TH + 5 * (1 - eo(p));
    const hp = iso(c, 7.5, yc, z), tr = iso(c, 7.5, yc, 9);
    const a = iso(c, 3, yc, Hh + TH + 5 * (1 - eo(p))), b = iso(c, 12, yc, Hh + TH + 5 * (1 - eo(p)));
    return <g key={"hk" + i}><path d={`M${tr[0]} ${tr[1]} L${hp[0]} ${hp[1]} M${hp[0]} ${hp[1]} L${a[0]} ${a[1]} M${hp[0]} ${hp[1]} L${b[0]} ${b[1]}`} stroke={NAVY} strokeWidth={1.4} fill="none" /><circle cx={hp[0]} cy={hp[1]} r={4.5} fill="#fff" stroke={NAVY} strokeWidth={2} /></g>;
  });
  // props that are NOT needed : appear, then crossed out and removed
  const props: Layer[] = [];
  [3.8, 7.5, 11.2].forEach((x, a) => [1.2, 2.6, 4.0, 5.4, 6.8].forEach((y, b) => props.push({ key: K(x, y, 0) + 50, node: <Prop c={c} x={x} y={y} z1={Hh} t={t} t0={33.5 + (a * 5 + b) * 0.025} vanish={A(85) + 0.5} /> })));
  // detail lens : zoom on the 7 alveoles
  const LX = 300, LY = 600; const cl: Cam = { ox: LX + 112, oy: LY - 70, u: 215 };
  const lt = 28.95, lv = 30.9;
  const lens = t > lt && t < lv + 0.5 && (() => {
    const g = Math.min(eo(clamp((t - lt) / 0.5)), eo(clamp((lv + 0.5 - t) / 0.5)));
    const w = 1.2, th = TH * 1.0;
    const polys = hollowPolys(cl, 0, w, 0, 0.5, 0, th);
    const nums = [0, 1, 2, 3, 4, 5, 6].map((k) => { const pitch = w / 7.6; const p = iso(cl, 0.5, w / 2 + (k - 3) * pitch, th * 0.52); return { p, k }; });
    const e = iso(c, W, 0.9, Hh + TH / 2);
    return (
      <g opacity={g}>
        <path d={`M${e[0]} ${e[1]} L${LX} ${LY}`} stroke={NAVY} strokeWidth={1.4} />
        <circle cx={LX} cy={LY} r={168} fill="#fff" stroke={NAVY} strokeWidth={2.5} />
        <circle cx={LX} cy={LY} r={176} fill="none" stroke={YEL} strokeWidth={4} />
        <clipPath id="lensclip"><circle cx={LX} cy={LY} r={164} /></clipPath>
        <g clipPath="url(#lensclip)">
          <Solid polys={polys} t={t} t0={lt + 0.15} dur={0.7} style={{ stroke: NAVY, sw: 2.4, fill: "#fff" }} styles={[{ stroke: GRY2, sw: 1.5, fill: "#fff" }, { stroke: GRY2, sw: 1.5, fill: "#fff" }, { stroke: NAVY, sw: 2.4, fill: "#fff" }]} />
          {nums.map(({ p, k }) => { const q = clamp((t - (lt + 0.7 + k * 0.1)) / 0.3); return q <= 0 ? null : <g key={k} opacity={q} transform={`translate(${p[0]} ${p[1]}) scale(${0.6 + 0.4 * q})`}><circle r={11} fill={YEL} stroke={NAVY} strokeWidth={1.5} /><text y={1} fontSize={14} fontWeight={800} fill={NAVY} textAnchor="middle" dominantBaseline="central" fontFamily={FONT}>{k + 1}</text></g>; })}
        </g>
        <text x={LX} y={LY + 215} fontSize={26} fontWeight={800} fill={NAVY} textAnchor="middle" fontFamily={FONT} opacity={clamp((t - lt - 1) * 3)}>7 ALVÉOLES</text>
      </g>
    );
  })();
  const xo = Math.min(1, Math.max(0, (t - A(84)) / 0.5));
  return (
    <g>
      <Layers items={[...L, ...slabs, ...props]} />
      {hooks}
      {lens}
      <DimIso c={c} a={[0, D, Hh + TH]} b={[W, D, Hh + TH]} off={[0, 1.6, 0]} label="15 m" t={t} t0={A(73) - 0.2} size={42} />
      <Tag x={540} y={1215} text="0 POTEAU INTERMÉDIAIRE" t={t} t0={A(75)} size={26} check />
      {/* "no props" sign */}
      {t > A(84) && t < A(84) + 1.9 && (() => { const q = iso(c, 7.5, 6.3, 1.6); return (
        <g opacity={Math.min(1, (A(84) + 1.9 - t) * 3)}>
          <circle cx={q[0]} cy={q[1]} r={64} fill="none" stroke={YEL} strokeWidth={10} pathLength={1} strokeDasharray="1 1.02" strokeDashoffset={1 - Math.min(1, xo * 2)} />
          <path d={`M${q[0] - 45} ${q[1] + 45} L${q[0] + 45} ${q[1] - 45}`} stroke={YEL} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray="1 1.02" strokeDashoffset={1 - Math.max(0, xo * 2 - 1)} />
          <Tag x={q[0]} y={q[1] + 120} text="SANS ÉTAIS" t={t} t0={A(84) + 0.2} size={32} check />
        </g>); })()}
      <Line pts={[iso(c, 0.6, 0.5, 0.02), iso(c, W - 0.6, 0.5, 0.02), iso(c, W - 0.6, D, 0.02), iso(c, 0.6, D, 0.02), iso(c, 0.6, 0.5, 0.02)]} t={t} t0={A(86) - 0.1} dur={0.9} stroke={YEL} sw={4} vanish={out} />
      <Worker c={c} p={[10.5, D - 0.6, 0]} t={t} t0={A(86)} vanish={out} />
      <Legend t={t} items={LEG5} />
    </g>
  );
};
const GRY2 = "#9E9E9E";
