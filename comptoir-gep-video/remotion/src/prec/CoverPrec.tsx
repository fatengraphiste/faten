import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill } from "remotion";
import { FontLoader } from "../fonts";
import { FONT } from "../lib";
import { LOGO_PATHS } from "../logo";
import { COL, Rig, Stage, Beam, Rod, Cone, Weight, Arrow3D, orbit } from "./kit";

const NAVY = "#19226d", RED = "#db4041";
// Couverture 9:16 — contenu dans la zone 4:5 (y 285–1635)
export const CoverPrec: React.FC = () => {
  const cam = orbit(0.5, 0.22, 15.5, [0, 1.35, 0], 34);
  const L = 4.2, H = 0.62, BY = 0.9 + H / 2, TOP = 0.9 + H;
  return (
    <FontLoader>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#ffffff 0%,#eef1f8 100%)", fontFamily: FONT }}>
        <div style={{ position: "absolute", left: 0, top: 230, width: 1080, height: 1400 }}>
          <ThreeCanvas width={1080} height={1400} shadows camera={{ fov: cam.fov, position: cam.pos, near: 0.1, far: 200 }}>
            <Rig cam={{ ...cam }} /><Stage shadow={[0, 4.6, 2.2]} />
            <Cone p={[-1.85, 0.45, 0]} rBot={0.8} rTop={0.36} h={0.9} />
            <Cone p={[1.85, 0.45, 0]} rBot={0.8} rTop={0.36} h={0.9} />
            <Beam L={L} h={H} d={0.62} y={BY} m={{ color: "#8aa3f5", opacity: 0.7, emissive: COL.navyL, ei: 0.3 }} />
            {[-0.18, 0, 0.18].map((z, i) => <Rod key={i} a={[-L / 2 + 0.05, BY - 0.12, z]} b={[L / 2 - 0.05, BY - 0.12, z]} r={0.035} m={{ color: COL.red, emissive: COL.red, ei: 0.5 }} />)}
            {[-1.2, 0, 1.2].map((x, i) => <React.Fragment key={i}><Weight p={[x, TOP + 0.04, 0]} s={0.6} /></React.Fragment>)}
            <Arrow3D p={[-L / 2 - 0.95, BY, 0]} dir={[1, 0, 0]} len={0.85} color={COL.navyL} r={0.09} />
            <Arrow3D p={[L / 2 + 0.95, BY, 0]} dir={[-1, 0, 0]} len={0.85} color={COL.navyL} r={0.09} />
          </ThreeCanvas>
        </div>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <g transform="translate(540 345) scale(0.26) translate(-485 -125)">{LOGO_PATHS.map((p, i) => (p.rect ? <rect key={i} x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} fill={NAVY} /> : <path key={i} d={p.d} fill={p.c === "r" ? RED : NAVY} />))}</g>
        </svg>
        <div style={{ position: "absolute", left: 60, right: 60, top: 410, textAlign: "center", color: NAVY, fontWeight: 800 }}>
          <div style={{ fontSize: 100, lineHeight: 1.12 }}>C'est quoi</div>
          <div style={{ fontSize: 100, lineHeight: 1.12 }}><span style={{ background: RED, color: "#fff", borderRadius: 24, padding: "0 28px" }}>la précontrainte</span> ?</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1380, textAlign: "center", direction: "rtl", fontSize: 56, fontWeight: 700, color: NAVY }}>شنوة يعني الـ béton précontraint ؟</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", fontSize: 38, fontWeight: 600, color: NAVY, opacity: 0.7 }}>Comptoir GEP · explication en 3D</div>
      </AbsoluteFill>
    </FontLoader>
  );
};
