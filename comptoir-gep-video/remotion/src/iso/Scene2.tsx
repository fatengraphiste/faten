import React from "react";
import { A } from "../lib";
import { Cam, Solid, ST, Tag, Underline, box } from "./engine";
import { DK, FONT, NAVY } from "./theme";

export const LEG2 = [];
export const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const c: Cam = { ox: 540, oy: 700, u: 52 };
  const pop = (t0: number) => Math.min(1, Math.max(0, (t - t0) / 0.4));
  return (
    <g>
      <Solid polys={box(c, 0, 0, 0, 6, 4, 0.55)} t={t} t0={8.75} dur={0.8} style={ST.base} mode="drop" dz={150} />
      <Solid polys={box(c, 0, 0, 0.8, 6, 4, 1.35)} t={t} t0={9.0} dur={0.8} style={ST.hl} mode="drop" dz={150} />
      <Solid polys={box(c, 1.2, 0.8, 1.55, 7.2, 4.8, 2.1)} t={t} t0={9.25} dur={0.8} style={ST.navy} mode="drop" dz={150} />
      <text x={540} y={1040} fontSize={104} fontWeight={800} fill={NAVY} textAnchor="middle" fontFamily={FONT} opacity={pop(A(22))} letterSpacing={1}>PLANCHER</text>
      <text x={540} y={1128} fontSize={86} fontWeight={800} fill={NAVY} textAnchor="middle" fontFamily={FONT} opacity={pop(A(23))}>PRÉFABRIQUÉ</text>
      <Underline x1={210} x2={870} y={1160} t={t} t0={A(23) + 0.2} />
      <text x={540} y={1220} fontSize={25} fontWeight={600} fill={DK} textAnchor="middle" fontFamily={FONT} letterSpacing={3} opacity={pop(A(23) + 0.5)}>POUTRELLES · ENTREVOUS · DALLES ALVÉOLÉES</text>
      <Tag x={540} y={1300} text="" t={t} t0={999} />
    </g>
  );
};
