import React from "react";
import { AbsoluteFill } from "remotion";
import { FontLoader } from "../fonts";
import { FONT } from "../lib";
import { LOGO_PATHS } from "../logo";
import { Beto, useRig } from "./Beto";
import { Hourglass, Money, Particles } from "./BetoV5";

const NAVY = "#19226d", RED = "#db4041";
// Couverture 9:16 — contenu dans la zone 4:5 (y 285–1635) ; couleurs de la charte uniquement
export const CoverBeto: React.FC = () => {
  const svg = useRig(); const W = 960; const H = (W * 740) / 1310; const feetOff = ((654 + 40) / 740) * H; const fy = 1240;
  return (
    <FontLoader>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#ffffff 0%,#eef1f8 100%)", fontFamily: FONT }}>
        <Particles t={3} />
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <g transform="rotate(-18 540 900)"><rect x={-300} y={790} width={1700} height={150} fill="#e4e9fb" /><rect x={-300} y={980} width={1700} height={60} fill="#fde3e3" /></g>
          <g transform="translate(540 345) scale(0.26) translate(-485 -125)">{LOGO_PATHS.map((p, i) => (p.rect ? <rect key={i} x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} fill={NAVY} /> : <path key={i} d={p.d} fill={p.c === "r" ? RED : NAVY} />))}</g>
          <ellipse cx={540} cy={fy + 12} rx={250} ry={26} fill={NAVY} opacity={0.12} />
        </svg>
        <div style={{ position: "absolute", left: 60, right: 60, top: 420, textAlign: "center", direction: "rtl", fontWeight: 800 }}>
          <div style={{ fontSize: 118, lineHeight: 1.15, color: NAVY }}>نفس السوم</div>
          <div style={{ fontSize: 118, lineHeight: 1.15 }}><span style={{ background: RED, color: "#fff", borderRadius: 28, padding: "0 32px" }}>تكلفة أقل !</span></div>
        </div>
        {svg && <div style={{ position: "absolute", left: 540 - W / 2, top: fy - feetOff }}><Beto svg={svg} s={{ t: 0, l: "up", r: "up", v: "mid", raise: 0, walking: false, wiggle: false, talking: false }} width={W} /></div>}
        <Hourglass t={1.9} t0={0} x={160} y={1040} s={0.8} />
        <Money t={3} t0={0} x={920} y={1040} s={0.8} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1380, textAlign: "center", direction: "rtl" }}>
          <span style={{ display: "inline-block", background: NAVY, color: "#fff", fontWeight: 800, fontSize: 58, borderRadius: 60, padding: "14px 46px" }}>الدالة الحاضرة</span>
        </div>
      </AbsoluteFill>
    </FontLoader>
  );
};
