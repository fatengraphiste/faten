import React from "react";
import { A } from "../lib";
import { Cam, DimIso, Line, Solid, ST, Tag, box, iso, Fit } from "./engine";
import { FONT, NAVY, YEL } from "./theme";
import { Legend, Leg } from "./Legend";

export const LEG1: Leg[] = [
  { t0: -0.6, t1: 4.5, title: "Le poteau central", sub: ["Il encombre l'espace, gâche la décoration", "et rétrécit votre plan."] },
  { t0: 4.7, t1: 8.5, title: "Un espace ouvert", sub: ["Sans poteau, tout le plateau est libre :", "vous aménagez comme vous le voulez."] },
];

export const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const c: Cam = { ox: 500, oy: 600, u: 47 };
  const W = 12, D = 9, H = 3.4;
  const pillarT = -0.4; // the pillar is already being drawn on frame 0 (hook)
  const vanishP = A(16) - 0.1; // "بلاش"
  const furn = A(5) - 0.0;     // "تفسدلك"
  // hatch lines x+y = k inside [4.4,7.6]x[3.0,6.0]
  const hatch: [number, number, number, number][] = [];
  const x0 = 4.4, x1 = 7.6, y0 = 3.0, y1 = 6.0;
  for (let k = x0 + y0 + 0.4; k < x1 + y1; k += 0.5) {
    const xa = Math.max(x0, k - y1), xb = Math.min(x1, k - y0);
    if (xb > xa) hatch.push([xa, k - xa, xb, k - xb]);
  }
  const grid: React.ReactNode[] = [];
  for (let i = 1; i < W; i++) grid.push(<Line key={"gx" + i} pts={[iso(c, i, 0.3, 0), iso(c, i, D, 0)]} t={t} t0={-3} dur={0.5} stroke="#E4E4E4" sw={1} />);
  for (let j = 1; j < D; j++) grid.push(<Line key={"gy" + j} pts={[iso(c, 0.3, j, 0), iso(c, W, j, 0)]} t={t} t0={-3} dur={0.5} stroke="#E4E4E4" sw={1} />);
  const win = (pts: [number, number][], t0: number, k: string) => <Solid key={k} polys={[{ pts }]} t={t} t0={t0} dur={0.6} style={{ stroke: NAVY, sw: 1.6, fill: "#fff" }} />;
  return (
    <g>
      <Fit k="s1">
      {/* floor slab + architectural grid */}
      <Solid polys={box(c, 0, 0, -0.35, W, D, 0)} t={t} t0={-3} dur={1.0} style={ST.base} />
      {grid}
      {/* back walls */}
      <Solid polys={box(c, 0.3, 0, 0, W, 0.3, H)} t={t} t0={-3} dur={1.0} style={ST.base} />
      <Solid polys={box(c, 0, 0, 0, 0.3, D, H)} t={t} t0={-3} dur={1.0} style={ST.base} />
      {win([iso(c, 2, 0.3, 1), iso(c, 4.4, 0.3, 1), iso(c, 4.4, 0.3, 2.7), iso(c, 2, 0.3, 2.7)], -3, "w1")}
      {win([iso(c, 7.2, 0.3, 1), iso(c, 9.6, 0.3, 1), iso(c, 9.6, 0.3, 2.7), iso(c, 7.2, 0.3, 2.7)], -3, "w2")}
      {win([iso(c, 0.3, 2.2, 1), iso(c, 0.3, 4.4, 1), iso(c, 0.3, 4.4, 2.7), iso(c, 0.3, 2.2, 2.7)], -3, "w3")}
      {win([iso(c, 0.3, 5.6, 1), iso(c, 0.3, 7.8, 1), iso(c, 0.3, 7.8, 2.7), iso(c, 0.3, 5.6, 2.7)], -3, "w4")}
      {/* alert hatch on the floor around the pillar */}
      {hatch.map((h, i) => <Line key={"h" + i} pts={[iso(c, h[0], h[1], 0.01), iso(c, h[2], h[3], 0.01)]} t={t} t0={0.25 + i * 0.05} dur={0.35} stroke={YEL} sw={3.2} vanish={vanishP - 0.4} />)}
      {/* furniture : gets highlighted when the voice says it is ruined */}
      {[
        [box(c, 1.3, 6.9, 0, 4.5, 8.2, 0.55), -3], [box(c, 1.3, 7.7, 0.55, 4.5, 8.2, 1.3), -3],
        [box(c, 2.1, 4.5, 0, 3.7, 5.7, 0.5), -3], [box(c, 0.3, 3.0, 0, 1.0, 6.0, 0.55), -3], [box(c, 0.35, 3.3, 0.55, 0.5, 5.7, 1.5), -3],
        [box(c, 8.4, 5.5, 0, 10.6, 7.2, 0.8), -3],
      ].map(([p, t0], i) => <Solid key={"f" + i} polys={p as never} t={t} t0={t0 as number} dur={0.7} style={t > furn && t < vanishP - 0.4 ? ST.hl : ST.base} mode="drop" dz={50} vanish={A(11) + 0.1} vanishDur={0.7} />)}
      {/* the pillar */}
      <Solid polys={box(c, 5.6, 4.1, 0, 6.4, 4.9, H)} t={t} t0={pillarT} dur={0.9} style={ST.hl} vanish={vanishP} vanishDur={0.9} />
      <Solid polys={box(c, 5.6, 4.1, H - 0.01, 6.4, 4.9, H)} t={t} t0={0.3} dur={0.4} mode="fade" style={{ stroke: NAVY, sw: 2, fill: YEL }} vanish={vanishP} vanishDur={0.5} />
      {t > 0.8 && t < vanishP + 0.4 && (() => { const p = iso(c, 6, 4.5, H + 0.3); return <g opacity={Math.min(1, (t - 0.8) * 3) * (t > vanishP ? 0 : 1)}><text x={p[0]} y={p[1] - 12} fontSize={40} fontWeight={800} fill={NAVY} textAnchor="middle" fontFamily={FONT}>عرصة</text><Tag x={p[0]} y={p[1] - 95} text="POTEAU CENTRAL" t={t} t0={0.9} size={22} /></g>; })()}
      {/* open space : yellow floor outline, tag and cote */}
      <Line pts={[iso(c, 0.3, 0.3, 0.02), iso(c, W, 0.3, 0.02), iso(c, W, D, 0.02), iso(c, 0.3, D, 0.02), iso(c, 0.3, 0.3, 0.02)]} t={t} t0={A(17)} dur={0.9} stroke={YEL} sw={4} />
      <DimIso c={c} a={[0, D, 0]} b={[W, D, 0]} off={[0, 1.3, 0]} label="12 m" t={t} t0={A(17) + 0.3} />
      {(() => { const p = iso(c, 6, 4.5, 0); return <Tag x={p[0]} y={p[1]} text="0 POTEAU" t={t} t0={A(17) + 0.5} check size={34} />; })()}
      </Fit>
      <Legend t={t} items={LEG1} />
    </g>
  );
};
