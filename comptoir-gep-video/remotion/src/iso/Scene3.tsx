import React from "react";
import { A } from "../lib";
import { Cam, Solid, ST, Style, Tag, box } from "./engine";
import { Layer, beamPolys, entrevousPolys, hollowPolys, K, Layers } from "./Parts";
import { FONT, NAVY, YEL } from "./theme";
import { Legend, Leg } from "./Legend";

export const LEG3: Leg[] = [{ t0: 10.95, t1: 16.1, title: "Quelle solution choisir ?", sub: ["Poutrelles + entrevous", "ou dalle alvéolée ?"] }];

export const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const cA: Cam = { ox: 520, oy: 470, u: 78 };
  const cB: Cam = { ox: 520, oy: 870, u: 78 };
  const hlA = t > A(29) - 0.1 && t < A(33) - 0.1, hlB = t > A(33) - 0.1;
  const items: Layer[] = [];
  // A : 3 poutrelles + 2 rows of entrevous + compression slab
  const L = 3.6;
  [0.3, 1.5, 2.7].forEach((y, i) => items.push({ key: K(L, y + 0.3, 0) + 1, node: <Solid key={"b" + i} polys={beamPolys(cA, "x", y, 0, L, 0, 0.62)} t={t} t0={11.05 + i * 0.15} dur={0.7} style={ST.navy} /> }));
  [0, 1].forEach((i) => items.push({ key: K(L, 0.5 + i * 1.2 + 1.0, 0), node: <Solid key={"e" + i} polys={entrevousPolys(cA, "x", 0.45 + i * 1.2, 1.35 + i * 1.2, 0, L, 0, 0.5)} t={t} t0={11.5 + i * 0.2} dur={0.7} style={hlA ? ST.hl : ST.base} /> }));
  // B : 3 hollow-core slabs side by side
  [0, 1, 2].forEach((i) => items.push({ key: K(L, 1.2 * (i + 1), 0) + 100, node: <Solid key={"s" + i} polys={hollowPolys(cB, 1.2 * i, 1.2 * (i + 1), 0, L, 0, 0.5)} t={t} t0={11.6 + i * 0.2} dur={0.8} style={hlB ? ST.hl : ST.navy} /> }));
  // the two models are in different cameras : render separately
  const labs: [number, string, string][] = [[A(29), "A", "POUTRELLES + ENTREVOUS"], [A(33), "B", "DALLE ALVÉOLÉE"]];
  return (
    <g>
      <Layers items={items.filter((i) => i.key < 100 * 10)} />
      <Layers items={items.filter((i) => i.key >= 100 * 10)} />
      {labs.map(([t0, l, txt], i) => {
        const y = i === 0 ? 395 : 795;
        const p = Math.min(1, Math.max(0, (t - (t0 - 0.2)) / 0.4));
        return (
          <g key={l} opacity={p}>
            <circle cx={96} cy={y} r={24} fill={YEL} stroke={NAVY} strokeWidth={2} />
            <text x={96} y={y + 1} fontSize={26} fontWeight={800} fill={NAVY} textAnchor="middle" dominantBaseline="central" fontFamily={FONT}>{l}</text>
            <text x={136} y={y + 1} fontSize={28} fontWeight={800} fill={NAVY} dominantBaseline="central" fontFamily={FONT}>{txt}</text>
          </g>
        );
      })}
      <Tag x={930} y={760} text="?" t={t} t0={A(27) - 0.1} size={44} w={88} />
      <Legend t={t} items={LEG3} />
    </g>
  );
};
export type _S = Style;
