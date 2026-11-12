import React from "react";
import { A } from "../lib";
import { Cam, DimIso, Line, Solid, ST, Tag, Underline, box, clamp, eio, iso, seg, Fit } from "./engine";
import { Layer, Layers, K, PITCH, beamPolys, entrevousPolys, hollowPolys } from "./Parts";
import { FONT, NAVY, YEL } from "./theme";
import { Legend, Leg } from "./Legend";

export const LEG9: Leg[] = [{ t0: 59.5, t1: 63.25, title: "La règle d'or", sub: ["≤ 9 m : poutrelles-entrevous.", "9 à 15 m : dalle alvéolée."] }];

export const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const out = 63.3;
  const cL: Cam = { ox: 215, oy: 660, u: 30 }, cR: Cam = { ox: 600, oy: 660, u: 30 };
  const LL: Layer[] = [], LR: Layer[] = [];
  // left model : poutrelles + entrevous over 9 m (real sizes)
  const ys = [0.35, 0.35 + PITCH, 0.35 + 2 * PITCH, 0.35 + 3 * PITCH];
  ys.forEach((y, i) => LL.push({ key: K(9, y + 0.3, 0.3), node: <Solid key={"b" + i} polys={beamPolys(cL, "x", y, 0, 9, 0)} t={t} t0={59.7 + i * 0.1} dur={0.6} style={ST.navy} vanish={out} /> }));
  ys.slice(0, -1).forEach((y, i) => LL.push({ key: K(9, y + PITCH / 2 + 0.3, 0.3) + 1, node: <Solid key={"e" + i} polys={entrevousPolys(cL, "x", y + PITCH / 2, 0, 9, 0)} t={t} t0={59.95 + i * 0.12} dur={0.6} style={ST.hl} vanish={out} /> }));
  // right model : hollow-core slabs 120 cm x 15 m
  [0, 1, 2].forEach((i) => LR.push({ key: K(15, 1.2 * (i + 1), 0.2), node: <Solid key={"s" + i} polys={hollowPolys(cR, 1.2 * i, 1.2 * (i + 1), 0, 15, 0)} t={t} t0={60.1 + i * 0.15} dur={0.7} style={ST.navy} vanish={out} /> }));
  const x0 = 140, x1 = 940, ppm = (x1 - x0) / 15, yb = 1150, hb = 36;
  const mk = clamp(eio(seg(t, A(143), A(148))));
  const m = 4 + mk * 8.5;
  return (
    <g>
      <Fit k="s9">
      <Layers items={LL} /><Layers items={LR} />
      <DimIso c={cL} a={[0, 2.2, 0]} b={[9, 2.2, 0]} off={[0, 1.3, 0]} label="≤ 9 m" t={t} t0={A(141)} size={36} />
      <DimIso c={cR} a={[0, 3.6, 0]} b={[15, 3.6, 0]} off={[0, 1.3, 0]} label="9 → 15 m" t={t} t0={A(141) + 0.4} size={36} />
      <Tag x={290} y={900} text="POUTRELLES + ENTREVOUS" t={t} t0={A(142)} size={20} />
      <Tag x={820} y={960} text="DALLE ALVÉOLÉE" t={t} t0={A(142) + 0.2} size={20} />
      {/* range bar */}
      <g opacity={eio(seg(t, A(142), A(142) + 0.5)) * (t > out ? 0 : 1)}>
        <rect x={x0} y={yb} width={9 * ppm} height={hb} fill="#fff" stroke={NAVY} strokeWidth={2.4} />
        <rect x={x0 + 9 * ppm} y={yb} width={6 * ppm} height={hb} fill={YEL} stroke={NAVY} strokeWidth={2.4} />
        {[[0, "0 m"], [9, "9 m"], [15, "15 m"]].map(([mm, l]) => <text key={String(l)} x={x0 + (mm as number) * ppm} y={yb + hb + 34} fontSize={26} fontWeight={800} fill={NAVY} textAnchor="middle" fontFamily={FONT}>{l as string}</text>)}
        {t > A(143) && (
          <g transform={`translate(${x0 + m * ppm} ${yb - 12})`}>
            <path d="M-16 -22 H16 L0 0 Z" fill={NAVY} />
            <text y={-36} fontSize={24} fontWeight={800} fill={NAVY} textAnchor="middle" fontFamily={FONT}>VOTRE PORTÉE</text>
          </g>
        )}
      </g>
      </Fit>
      <Legend t={t} items={LEG9} />
    </g>
  );
};

/* ---------------- CTA + final slate ---------------- */
export const LEG10: Leg[] = [{ t0: 63.4, t1: 67.45, title: "Envoyez votre plan", sub: ["L'équipe Comptoir GEP vous accompagne."] }];
const ICONS: Record<string, string[]> = {
  wa: ["M7.9 20A9 9 0 1 0 4 16.1L2 22Z", "M8.6 9c0 3.6 2.8 6.4 6.4 6.4l1.4-1.5-2.1-1.1-1 .9c-1-.4-1.9-1.3-2.3-2.3l.9-1-1.1-2.1Z"],
  mail: ["M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z", "M3.5 7.5l8.5 6 8.5-6"],
  web: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M3 12h18", "M12 3c2.6 2.5 3.9 5.5 3.9 9s-1.3 6.5-3.9 9c-2.6-2.5-3.9-5.5-3.9-9S9.4 5.5 12 3Z"],
};
const STAG = [[0.18, 0.55], [0.3, 0.55], [0.0, 0.7], [0.45, 0.4], [0.28, 0.62], [0.5, 0.45], [0.1, 0.6], [0.12, 0.55], [0.6, 0.3], [0.62, 0.3]];
export const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const c: Cam = { ox: 470, oy: 560, u: 66 };
  // iso sheet carrying a floor plan, slides away when the voice says "send"
  const send = eio(seg(t, A(157) - 0.2, A(157) + 1.0));
  const dx = send * 520, op = 1 - clamp((send - 0.6) / 0.4);
  const plan: [number, number][][] = [
    [[0.3, 0.3], [5.7, 0.3], [5.7, 3.7], [0.3, 3.7], [0.3, 0.3]], [[2.2, 0.3], [2.2, 2.0]], [[2.2, 2.0], [0.3, 2.0]], [[3.8, 3.7], [3.8, 1.6]], [[3.8, 1.6], [5.7, 1.6]],
  ];
  const fin = false;
  return (
    <g>
      <Fit k="s10">
      {!fin && (
        <g transform={`translate(${dx} ${-dx * 0.3})`} opacity={op}>
          <Solid polys={box(c, 0, 0, 0, 6, 4, 0.08)} t={t} t0={63.4} dur={0.9} style={ST.base} />
          {plan.map((pl, i) => <Line key={i} pts={pl.map(([x, y]) => iso(c, x, y, 0.09))} t={t} t0={64.1 + i * 0.15} dur={0.5} stroke={NAVY} sw={2.4} />)}
          <Tag x={iso(c, 3, 2, 0.1)[0]} y={iso(c, 3, 2, 0.1)[1]} text="VOTRE PLAN" t={t} t0={64.8} size={30} check />
        </g>
      )}
      {!fin && send > 0 && [0, 1, 2].map((i) => <Line key={i} pts={[iso(c, -0.2 - i * 0.5, 0.5 + i * 0.9, 0.2), iso(c, -2.2 - i * 0.5, 0.5 + i * 0.9, 0.2)]} t={t} t0={A(157)} dur={0.5} stroke={YEL} sw={4} vanish={A(157) + 1.1} />)}
      </Fit>
      {!fin && <Legend t={t} items={LEG10} />}
    </g>
  );
};
