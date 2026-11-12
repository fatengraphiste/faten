import React from "react";
import { A } from "../lib";
import { Cam, DimIso, Line, Solid, ST, Tag, clamp, eio, eo, iso } from "./engine";
import { Callout, Crane, DA_T, beamPolys, entrevousPolys, hollowPolys } from "./Parts";
import { NAVY, YEL } from "./theme";
import { Legend, Leg } from "./Legend";

export const LEG3: Leg[] = [
  { t0: 10.95, t1: 13.25, title: "Quelle solution choisir ?", sub: ["Poutrelles + entrevous", "ou dalle alvéolée ?"] },
  { t0: 13.3, t1: 14.8, title: "Poutrelle + entrevous", sub: ["Poutrelle jusqu'à 9 m ·", "entrevous 50 × 20 cm."] },
  { t0: 14.85, t1: 16.15, title: "Dalle alvéolée", sub: ["Largeur 120 cm ·", "longueur jusqu'à 15 m."] },
];

/* break symbol "//" on a dimension line */
const Brk: React.FC<{ p: [number, number]; t: number; t0: number }> = ({ p, t, t0 }) => {
  const a = clamp((t - t0) / 0.3);
  if (a <= 0) return null;
  return <g opacity={a} stroke={NAVY} strokeWidth={3} strokeLinecap="round"><path d={`M${p[0] - 9} ${p[1] + 12} L${p[0] + 3} ${p[1] - 12}`} /><path d={`M${p[0] - 1} ${p[1] + 12} L${p[0] + 11} ${p[1] - 12}`} /></g>;
};

export const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const tP = A(29), tE = A(31), tX = A(32) + 0.05, tD = A(33);
  const ex = eo(clamp((t - tX) / 0.6));                 // exit of poutrelle + entrevous (to the left)
  const exit = t > tX ? -820 * ex : 0;
  // ---------- BIG poutrelle (centre, not assembled) : 9 m long, drawn with a break ----------
  const cP: Cam = { ox: 270, oy: 470, u: 330 };
  const cE: Cam = { ox: 600, oy: 1010, u: 470 };
  const entranceX = 2.4 * (1 - eio(clamp((t - tD) / 1.0)));   // slab slides along the crane jib
  const cD: Cam = { ox: 330, oy: 930, u: 135 };
  const zS = 1.0;
  const Lm = 3.2, br0 = 1.4, br1 = 1.8;
  const slabLeft = hollowPolys(cD, 0, 1.2, 0 + entranceX, br0 + entranceX, zS);
  const slabRight = hollowPolys(cD, 0, 1.2, br1 + entranceX, Lm + entranceX, zS);
  const xc = 1.6 + entranceX;
  const trolley = iso(cD, xc, 0.6, 5), hookP = iso(cD, xc, 0.6, zS + DA_T + 0.75);
  const sling = [iso(cD, 0.4 + entranceX, 0.6, zS + DA_T), iso(cD, Lm - 0.4 + entranceX, 0.6, zS + DA_T)];
  return (
    <g>
      {/* question mark waiting for the choice */}
      {t < tP + 0.2 && <Tag x={540} y={760} text="?" t={t} t0={A(27) - 0.1} size={84} w={170} />}
      <g transform={`translate(${exit} 0)`} opacity={t > tX ? 1 - ex : 1}>
        <Solid polys={beamPolys(cP, "x", 0, 0, 0.9, 0)} t={t} t0={tP} dur={0.9} style={ST.navy} />
        <Solid polys={beamPolys(cP, "x", 0, 1.15, 2.0, 0)} t={t} t0={tP + 0.15} dur={0.9} style={ST.navy} />
        <DimIso c={cP} a={[0, 0.2, 0]} b={[2.0, 0.2, 0]} off={[0, 0.5, 0]} label="9 m" t={t} t0={tP + 0.8} size={46} />
        {(() => { const a = iso(cP, 0, 0.7, 0), b = iso(cP, 2.0, 0.7, 0); return <Brk p={[(a[0] + b[0]) / 2 + 12, (a[1] + b[1]) / 2 + 2]} t={t} t0={tP + 1.1} />; })()}
        <Callout c={cP} at={[0.45, 0, 0.14]} dx={-60} dy={-120} text="POUTRELLE" t={t} t0={tP + 0.9} size={26} />
        <Solid polys={entrevousPolys(cE, "x", 0.25, 0, 0.25, 0)} t={t} t0={tE} dur={0.9} style={ST.hl} />
        <DimIso c={cE} a={[0.25, 0, 0]} b={[0.25, 0.5, 0]} off={[0.32, 0, 0]} label="50 cm" t={t} t0={tE + 0.8} size={40} />
        <DimIso c={cE} a={[0.25, 0.5, 0]} b={[0.25, 0.5, 0.2]} off={[0, 0.34, 0]} label="20 cm" t={t} t0={tE + 1.0} size={40} />
        <Callout c={cE} at={[0.12, 0.25, 0.2]} dx={-150} dy={-130} text="ENTREVOUS" t={t} t0={tE + 0.9} size={26} />
      </g>
      {/* dalle alvéolée arrives from the side, carried by the crane */}
      {t > tD - 0.85 && (
        <g>
          <Crane c={cD} x={5.4} y={0.6} h={5} jibEnd={[-0.6, 0.6]} counterEnd={[6.6, 0.6]} t={t} t0={tD - 0.85} />
          <path d={`M${trolley[0]} ${trolley[1]} L${hookP[0]} ${hookP[1]} M${hookP[0]} ${hookP[1]} L${sling[0][0]} ${sling[0][1]} M${hookP[0]} ${hookP[1]} L${sling[1][0]} ${sling[1][1]}`} stroke={NAVY} strokeWidth={1.6} fill="none" opacity={clamp((t - tD) / 0.3)} />
          <circle cx={hookP[0]} cy={hookP[1]} r={5} fill="#fff" stroke={NAVY} strokeWidth={2} opacity={clamp((t - tD) / 0.3)} />
          <Solid polys={slabLeft} t={t} t0={tD} dur={0.5} mode="fade" style={ST.navy} />
          <Solid polys={slabRight} t={t} t0={tD + 0.05} dur={0.5} mode="fade" style={ST.navy} />
          {t > tD + 0.9 && <>
            <DimIso c={cD} a={[br0, 0, zS]} b={[br0, 1.2, zS]} off={[0.45, 0, 0]} label="120 cm" t={t} t0={tD + 0.9} size={36} />
            <DimIso c={cD} a={[0, 1.2, zS]} b={[Lm, 1.2, zS]} off={[0, 0.55, 0]} label="≤ 15 m" t={t} t0={tD + 1.1} size={40} />
            {(() => { const a = iso(cD, 0, 1.75, zS), b = iso(cD, Lm, 1.75, zS); return <Brk p={[(a[0] + b[0]) / 2 + 14, (a[1] + b[1]) / 2]} t={t} t0={tD + 1.4} />; })()}
            <Tag x={540} y={1215} text="DALLE ALVÉOLÉE · 7 ALVÉOLES" t={t} t0={tD + 0.6} size={26} check />
          </>}
        </g>
      )}
      <Line pts={[[0, 0], [0, 0]]} t={t} t0={999} stroke={YEL} />
      <Legend t={t} items={LEG3} />
    </g>
  );
};
