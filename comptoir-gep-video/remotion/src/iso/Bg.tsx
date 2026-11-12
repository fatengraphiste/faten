import React from "react";
import { Cam, box, iso } from "./engine";
import { FONT, GRY } from "./theme";

/* panoramic background : faint isometric grid + wireframe buildings, drifting slowly (parallax) */
const rnd = (() => { let a = 90210; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
const c: Cam = { ox: 760, oy: 150, u: 44 };
type B = { x: number; y: number; w: number; d: number; h: number };
const BOXES: B[] = [];
for (let gx = 0; gx < 7; gx++) for (let gy = 0; gy < 7; gy++) {
  if (rnd() < 0.28) continue;
  BOXES.push({ x: gx * 6 + rnd() * 1.5, y: gy * 6 + rnd() * 1.5, w: 2.2 + rnd() * 2.6, d: 2.2 + rnd() * 2.6, h: 0.6 + rnd() * 5 });
}
const pathOf = (pts: [number, number][]) => "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L") + " Z";
const LAB = ["12 m", "9 m", "15 m", "120 cm", "14 m", "11 m", "50 cm"];

export const BgPan: React.FC<{ t: number }> = ({ t }) => {
  const dx = -t * 6.2, dy = -t * 3.4;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <pattern id="isogrid" width="104" height="60" patternUnits="userSpaceOnUse"><path d="M0 0 L104 60 M0 60 L104 0" stroke={GRY} strokeWidth="1.6" fill="none" /></pattern>
      </defs>
      <g transform={`translate(${dx * 0.45} ${dy * 0.45})`}><rect x={-300} y={-300} width={2600} height={2900} fill="url(#isogrid)" opacity={0.12} /></g>
      <g transform={`translate(${dx} ${dy})`} opacity={0.22} fill="none" stroke={GRY} strokeWidth={2} strokeLinejoin="round">
        {BOXES.map((b, i) => <g key={i}>{box(c, b.x, b.y, 0, b.x + b.w, b.y + b.d, b.h).map((p, k) => <path key={k} d={pathOf(p.pts)} />)}</g>)}
        {[[2, 3], [14, 20], [27, 9], [35, 31]].map(([x, y], i) => { const a = iso(c, x, y, 0), b = iso(c, x + 8, y, 0); return (
          <g key={"d" + i}><path d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]} M${a[0] - 8} ${a[1] - 14} L${a[0] + 8} ${a[1] + 14} M${b[0] - 8} ${b[1] - 14} L${b[0] + 8} ${b[1] + 14}`} /><text x={(a[0] + b[0]) / 2} y={(a[1] + b[1]) / 2 - 12} fontSize={26} fontWeight={700} fill={GRY} stroke="none" textAnchor="middle" fontFamily={FONT}>{LAB[i % LAB.length]}</text></g>); })}
      </g>
    </svg>
  );
};
