import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill } from "remotion";
import { COL, Cam, Rig, Stage, Block, Rod, Arrow3D, Beam, Mat, orbit, k, ko, kb, clamp, sagAt, Cone, Weight, Funnel, Liquid } from "./kit";
import { Book, Hand, BK } from "./props";
import { Label, StepChip, BigTitle, Badge } from "./ui";
import { CUE } from "./cues";

export type SP = { t: number; dur: number; s0: number };
const TOT = 12;
const cue = (s0: number) => (key: string, o = 0) => CUE[key][0] - s0 + o;
const end = (s0: number) => (key: string, o = 0) => CUE[key][1] - s0 + o;
const lerpC = (a: string, b: string, x: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), clamp(x)).getHexString();

const Shell: React.FC<{ cam: Cam; children: React.ReactNode; shadow?: [number, number, number] }> = ({ cam, children, shadow }) => (
  <ThreeCanvas width={1080} height={1920} shadows camera={{ fov: cam.fov, position: cam.pos, near: 0.1, far: 200 }}>
    <Rig cam={cam} /><Stage shadow={shadow} />{children}
  </ThreeCanvas>
);
const CLAY = "#f2f3f8", BEAMC = "#e3e6ec";
const Supports: React.FC<{ x: number; hgt?: number; r?: number; ghost?: number }> = ({ x, hgt = 0.9, r = 0.8, ghost = 1 }) => (
  <>
    <Cone p={[-x, hgt / 2, 0]} rBot={r} rTop={r * 0.45} h={hgt} color={CLAY} opacity={ghost} />
    <Cone p={[x, hgt / 2, 0]} rBot={r} rTop={r * 0.45} h={hgt} color={CLAY} opacity={ghost} />
  </>
);
const L0 = 4.2, H0 = 0.62, D0 = 0.62, BY = 0.9 + H0 / 2, TOP = 0.9 + H0;

// ───────── 1. Le problème : béton armé (une seule charge) ─────────
export const S1: React.FC<SP> = ({ t, s0 }) => {
  const c = cue(s0);
  const cam = orbit(0.62, 0.24, 16.2 - 0.6 * clamp(t / 9), [0, 1.05, 0], 34);
  const app = kb(t, 0.1, 0.9);
  const f = c("fiss");
  const drop = ko(t, f + 0.3, f + 0.95);
  const sag = 0.3 * k(t, f + 0.95, f + 2.7);
  const wy = TOP - sag + 0.06 + (1 - drop) * 2.6;
  const T = c("trac");
  return (
    <AbsoluteFill>
      <Shell cam={cam}>
        <group scale={0.9 + 0.1 * app}>
          <Supports x={1.85} />
          <Beam L={L0} h={H0} d={D0} sag={sag} y={BY} m={{ color: BEAMC }} />
          {Array.from({ length: 6 }, (_, i) => {
            const x = -0.95 + 0.38 * i; const g = ko(t, f + 2.0 + 0.1 * i, f + 2.8 + 0.1 * i); const hh = 0.36 * g;
            const yb = BY - H0 / 2 + sagAt(x, L0, sag);
            return hh > 0.01 ? <Block key={i} p={[x, yb + hh / 2, D0 / 2 + 0.004]} s={[0.04, hh, 0.02]} rot={[0, 0, (i % 2 ? 1 : -1) * 0.14]} m={{ color: COL.red, emissive: COL.red, ei: 0.4 }} /> : null;
          })}
        </group>
        {drop > 0.001 && <Weight p={[0, wy, 0]} s={0.85} />}
        {t > T + 0.1 && <>
          <Arrow3D p={[-0.2, BY - H0 / 2 - sag + 0.02, D0 / 2 + 0.12]} dir={[-1, 0, 0]} len={1.0 * ko(t, T + 0.1, T + 0.8)} color={COL.red} r={0.06} />
          <Arrow3D p={[0.2, BY - H0 / 2 - sag + 0.02, D0 / 2 + 0.12]} dir={[1, 0, 0]} len={1.0 * ko(t, T + 0.1, T + 0.8)} color={COL.red} r={0.06} />
        </>}
      </Shell>
      <Label cam={cam} at={[-1.95, TOP, 0]} text="Compression (forte)" t={t} t0={c("arme", 0.1)} t1={f + 0.2} side="l" dx={60} dy={-130} tone="navy" />
      <Label cam={cam} at={[0.1, BY - H0 / 2 - sag, 0.31]} text="Fissures ✗" sub="la traction est faible" t={t} t0={f + 2.0} t1={T} side="r" dx={110} dy={160} tone="red" />
      <Label cam={cam} at={[0, BY - H0 / 2 - sag, 0.5]} text="Résistance à la traction" t={t} t0={T + 0.3} side="r" dx={90} dy={170} tone="red" />
      <BigTitle ltr t={t} t0={0.1} t1={1.75} top={520} lines={[{ text: "C'est quoi", size: 92 }, { text: "la précontrainte ?", red: true, size: 104 }]} />
      <StepChip n={1} total={TOT} ar="المشكل: الـ béton armé" t={t} t0={1.9} />
    </AbsoluteFill>
  );
};

// ───────── 2. La solution : béton précontraint ─────────
export const S2: React.FC<SP> = ({ t, s0 }) => {
  const c = cue(s0);
  const cam = orbit(0.15 + 1.1 * k(t, 0, 3.8), 0.26, 15.6, [0, 1.05, 0], 34);
  const m = k(t, c("sol1"), c("sol1", 0.9));
  const pulse = 0.3 + 0.15 * Math.sin(t * 4);
  const hc = c("how");
  return (
    <AbsoluteFill>
      <Shell cam={cam}>
        <Supports x={1.85} />
        <Beam L={L0} h={H0} d={D0} y={BY} m={{ color: BEAMC, opacity: 1 - m * 0.4 }} />
        <Beam L={L0 - 0.02} h={H0 - 0.02} d={D0 - 0.02} y={BY} m={{ color: "#7f9af2", opacity: 0.6 * m, emissive: COL.navyL, ei: pulse * m }} />
        {[-0.18, 0, 0.18].map((z, i) => <Rod key={i} a={[-L0 / 2 + 0.05, BY - 0.12, z]} b={[-L0 / 2 + 0.05 + (L0 - 0.1) * ko(t, c("sol1", 0.5 + 0.2 * i), c("sol1", 1.8 + 0.2 * i)), BY - 0.12, z]} r={0.035} m={{ color: COL.red, emissive: COL.red, ei: 0.5 }} />)}
      </Shell>
      <Label cam={cam} at={[0.3, BY - 0.12, 0.18]} text="Câbles en acier tendus" t={t} t0={c("sol2", 0.5)} t1={hc - 0.2} side="r" dx={80} dy={170} tone="red" />
      <BigTitle t={t} t0={c("sol2", -0.1)} t1={hc - 0.1} top={1210} kicker="الحل" lines={[{ text: "Béton", size: 96 }, { text: "précontraint", red: true, size: 104 }]} />
      <BigTitle t={t} t0={hc} top={1250} lines={[{ text: "كيفاش تصير ؟", red: true, size: 110 }]} />
      <StepChip n={2} total={TOT} ar="الحل: الـ béton précontraint" t={t} t0={0.2} />
    </AbsoluteFill>
  );
};

// ───────── banc de précontrainte (scènes 3 et 4) ─────────
const ZS = [-0.26, 0, 0.26], CY = 0.42, XL = -2.55, XM = 1.5;
const Bench: React.FC<{ t: number; ins?: [number, number, number]; grips?: number; pull?: number; level?: number; hard?: number; cutP?: number; rig?: number; wallA?: number }> = ({ t, ins = [1, 1, 1], grips = 1, pull = 0, level = 0, hard = 0, cutP = 0, rig = 1, wallA = 0.3 }) => {
  const xp = 4.55 + pull * 0.5; const xr = xp - 0.08;
  const col = lerpC(COL.steel, COL.red, pull);
  const cm = { color: col, emissive: COL.red, ei: pull * 0.7, rough: 0.35, metal: 0.4 };
  return (
    <group>
      <Block p={[1.0, 0.06, 0]} s={[9.2, 0.12, 2.2]} m={{ color: "#e8ebf3" }} />
      {/* moule */}
      <Block p={[0, 0.18, 0]} s={[3.0, 0.12, 1.1]} m={{ color: "#c9cfdc" }} />
      {[-0.52, 0.52].map((z, i) => <Block key={i} p={[0, 0.48, z]} s={[3.0, 0.6, 0.06]} m={{ color: "#aeb7ca", opacity: wallA }} />)}
      {[-XM, XM].map((x, i) => (
        <group key={i}>
          <Block p={[x, 0.48, 0]} s={[0.12, 0.6, 1.1]} m={{ color: "#c9cfdc" }} />
          {ZS.map((z, j) => <mesh key={j} position={[x, CY, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.075, 0.075, 0.15, 18]} /><Mat color="#4b5367" rough={0.6} /></mesh>)}
        </group>
      ))}
      {/* ancrage fixe à gauche, butée + vérin + plaque de traction à droite */}
      {rig > 0.01 && (
        <group>
          <Block p={[-3.0, 0.65, 0]} s={[0.7, 1.3, 1.8]} m={{ color: "#cdd3e1", opacity: rig }} />
          <Block p={[-2.58, 0.5, 0]} s={[0.1, 0.8, 0.95]} m={{ color: COL.navy, opacity: rig }} />
          <Block p={[2.7, 0.65, 0]} s={[0.7, 1.3, 1.8]} m={{ color: "#cdd3e1", opacity: rig }} />
          <mesh position={[3.4, CY, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.52, 0.52, 0.75, 32]} /><Mat color={COL.navy} opacity={rig} rough={0.4} metal={0.3} /></mesh>
          <Rod a={[3.75, CY + 0.38, 0.45]} b={[xp, CY + 0.38, 0.45]} r={0.08} m={{ color: COL.steel, opacity: rig, rough: 0.3, metal: 0.5 }} />
          <Rod a={[3.75, CY - 0.38, -0.45]} b={[xp, CY - 0.38, -0.45]} r={0.08} m={{ color: COL.steel, opacity: rig, rough: 0.3, metal: 0.5 }} />
          <Block p={[xp, CY, 0]} s={[0.14, 1.0, 1.3]} m={{ color: "#7c869c", opacity: rig }} />
        </group>
      )}
      {/* câbles */}
      {ZS.map((z, i) => {
        const full = xr - XL; const tip = XL + full * ins[i];
        const leftEnd = Math.min(-XM, tip), rx1 = Math.min(xr, tip);
        const lx1 = XL + (leftEnd - XL) * (1 - cutP); const rx0 = xr - (xr - XM) * (1 - cutP);
        return (
          <group key={i}>
            {rig > 0.01 && leftEnd > XL + 0.001 && <Rod a={[XL, CY, z]} b={[lx1, CY, z]} r={0.045} m={{ ...cm, opacity: rig }} />}
            {tip > -XM && <Rod a={[-XM, CY, z]} b={[Math.min(XM, tip), CY, z]} r={0.045} m={cm} />}
            {rig > 0.01 && tip > XM + 0.001 && rx1 > rx0 && <Rod a={[Math.max(rx0, XM), CY, z]} b={[rx1, CY, z]} r={0.045} m={{ ...cm, opacity: rig }} />}
            {ins[i] > 0.01 && ins[i] < 0.999 && <mesh position={[tip, CY, z]}><sphereGeometry args={[0.1, 14, 14]} /><meshBasicMaterial color={COL.navyL} /></mesh>}
            {grips > 0.01 && rig > 0.01 && <mesh position={[XL + 0.1, CY, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.085 * grips, 0.07 * grips, 0.2, 14]} /><Mat color="#333b52" rough={0.4} metal={0.5} /></mesh>}
            {grips > 0.01 && rig > 0.01 && <mesh position={[xp - 0.17, CY, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.07 * grips, 0.085 * grips, 0.2, 14]} /><Mat color="#333b52" rough={0.4} metal={0.5} /></mesh>}
          </group>
        );
      })}
      {/* béton : liquide puis durci */}
      {level > 0.005 && hard < 0.999 && <Liquid w={2.8} d={1.0} y0={0.24} level={0.34 * level} t={t} color={lerpC("#aab3c6", "#c6cbd5", hard)} wave={1 - hard} />}
      {level > 0.005 && hard >= 0.999 && <Block p={[0, 0.24 + 0.17, 0]} s={[2.8, 0.34, 1.0]} m={{ color: "#c6cbd5" }} />}
    </group>
  );
};

// ───────── 3. Câbles + mise en tension (tour caméra 360°) ─────────
export const S3: React.FC<SP> = ({ t, dur, s0 }) => {
  const c = cue(s0);
  const cam = orbit(0.55 + Math.PI * 2 * k(t, 0, dur - 0.3), 0.37, 20.5, [0.9, 0.5, 0], 34);
  const a = c("ins1");
  const ins: [number, number, number] = [ko(t, a, a + 1.5), ko(t, a + 0.5, a + 2.0), ko(t, a + 1.0, a + 2.5)];
  const grips = ko(t, a + 2.5, a + 3.0);
  const pull = k(t, c("pull"), c("tens", 1.5));
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0.9, 6.4, 2.2]}>
        <Bench t={t} ins={ins} grips={grips} pull={pull} />
        <Arrow3D p={[xpOf(pull) + 0.3, CY, 0]} dir={[1, 0, 0]} len={1.1 * pull + 0.001} color={COL.red} r={0.09} />
      </Shell>
      <Label cam={cam} at={[-0.4, CY, 0.26]} text="Câbles en acier" t={t} t0={c("ins2", -0.4)} t1={c("ins2", 2.0)} side="l" dx={60} dy={-170} tone="red" />
      <Label cam={cam} at={[-2.58, 0.9, 0]} text="Ancrage fixe" t={t} t0={c("ins2", 0.4)} t1={c("pull", -0.1)} side="l" dx={60} dy={170} tone="navy" />
      <Label cam={cam} at={[3.4, 0.95, 0]} text="Vérin hydraulique" t={t} t0={c("pull")} t1={c("tens")} side="r" dx={60} dy={-190} tone="navy" />
      <Label cam={cam} at={[xpOf(pull), CY + 0.3, 0]} text="Mise en tension" t={t} t0={c("tens")} side="r" dx={70} dy={170} tone="red" />
      <StepChip n={3} total={TOT} ar="ندخلو الـ câbles و نجبدوهم" t={t} t0={0.3} />
    </AbsoluteFill>
  );
};
const xpOf = (pull: number) => 4.55 + pull * 0.5;

// ───────── 4. Coulage du béton liquide, durcissement, coupe des câbles ─────────
export const S4: React.FC<SP> = ({ t, s0 }) => {
  const c = cue(s0);
  const cam = orbit(1.0 - 0.3 * k(t, 0, 4.1), 0.36, 18.5, [0.9, 0.7, 0], 34);
  const p0 = c("pour");
  const level = k(t, p0 + 0.1, p0 + 1.45);
  const hopIn = ko(t, p0 - 0.55, p0 + 0.05) * (1 - ko(t, p0 + 1.45, p0 + 1.95));
  const pouring = t > p0 + 0.05 && t < p0 + 1.6;
  const hard = k(t, c("cut1"), c("cut1", 0.9));
  const cutP = k(t, c("cut2"), c("cut2", 0.8));
  const rig = 1 - k(t, c("cut2", 1.1), c("cut2", 1.7));
  const hx = -0.3, hy = 2.5 + (1 - hopIn) * 1.6, top = 0.24 + 0.34 * level + 0.03;
  const cutting = t > c("cut2") && t < c("cut2", 0.6);
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0.9, 6.4, 2.2]}>
        <Bench t={t} pull={1} level={level} hard={hard} cutP={cutP} rig={rig} />
        {hopIn > 0.01 && <Funnel p={[hx, hy, 0]} size={1.15} h={0.8} color={COL.navy} />}
        {pouring && (
          <>
            <Rod a={[hx, hy - 0.4, 0]} b={[hx, top, 0]} r={0.1} m={{ color: "#aab3c6", rough: 0.3 }} />
            {Array.from({ length: 6 }, (_, i) => { const f = (t * 2.6 + i / 6) % 1; return <mesh key={i} position={[hx + 0.02 * Math.sin(i * 3 + t * 8), hy - 0.4 - (hy - 0.4 - top) * f, 0.02 * Math.cos(i * 5)]}><sphereGeometry args={[0.15 - 0.05 * f, 12, 12]} /><meshStandardMaterial color="#b6bfd1" roughness={0.3} /></mesh>; })}
            {Array.from({ length: 8 }, (_, i) => { const ph = (t * 2.2 + i / 8) % 1; const a = (i / 8) * Math.PI * 2; return <mesh key={i} position={[hx + Math.cos(a) * (0.12 + 0.35 * ph), top + 0.32 * Math.sin(Math.PI * ph), Math.sin(a) * (0.12 + 0.3 * ph)]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#c3cad9" /></mesh>; })}
          </>
        )}
        {cutting && [-XM - 0.15, XM + 0.15].map((x, i) => <mesh key={i} position={[x, CY, 0]}><sphereGeometry args={[0.16 + (t - c("cut2")) * 0.9, 16, 16]} /><meshBasicMaterial color="#ffe9a0" transparent opacity={1 - (t - c("cut2")) / 0.6} /></mesh>)}
      </Shell>
      <Label cam={cam} at={[hx, hy, 0]} text="Coulage du béton" t={t} t0={p0 + 0.2} t1={c("cut1", -0.1)} side="r" dx={100} dy={100} tone="navy" />
      <Label cam={cam} at={[0, 0.6, 0.5]} text="Béton durci ✓" t={t} t0={c("cut1", 0.5)} t1={c("cut2", 0.1)} side="r" dx={90} dy={-150} tone="navy" />
      <Label cam={cam} at={[XM + 0.3, CY, 0.26]} text="Câbles coupés ✂" t={t} t0={c("cut2", 0.3)} side="r" dx={80} dy={170} tone="red" />
      <StepChip n={4} total={TOT} ar="نصبّو الـ béton و نقصو الـ câbles" t={t} t0={0.3} />
    </AbsoluteFill>
  );
};

// ───────── élément béton (scènes 5, 6) ─────────
const Member: React.FC<{ t: number; op?: number; tint?: number; squeeze?: number; cableCol?: string; cableEi?: number; camber?: number }> = ({ op = 1, tint = 0, squeeze = 0, cableCol = COL.red, cableEi = 0.6, camber = 0 }) => {
  const sx = 1 - squeeze * 0.04; const NS = 16;
  return (
    <group scale={[sx, 1, 1]} position={[0, 0.12, 0]}>
      <Beam L={3.4} h={0.4} d={1.0} y={0.33} sag={-camber} m={{ color: lerpC("#c6cbd5", "#8aa3f5", tint), opacity: op }} />
      {ZS.map((z, i) => Array.from({ length: NS }, (_, j) => {
        const x0 = -1.7 + (3.4 * j) / NS, x1 = -1.7 + (3.4 * (j + 1)) / NS; const yy = (x: number) => CY - 0.12 + camber * (1 - (x / 1.7) ** 2);
        return <Rod key={i + "_" + j} a={[x0, yy(x0), z]} b={[x1, yy(x1), z]} r={0.045} m={{ color: cableCol, emissive: COL.red, ei: cableEi, rough: 0.35, metal: 0.4 }} />;
      }))}
    </group>
  );
};
// va-et-vient « cambrure puis retour à la ligne droite » (comme sur le schéma technique)
const arch = (t: number, t0: number, up: number, down: number, amp: number) => amp * k(t, t0, t0 + up) * (1 - k(t, t0 + up + 0.1, t0 + up + 0.1 + down));

// ───────── 5. L'effet : les câbles veulent retrouver leur longueur ─────────
export const S5: React.FC<SP> = ({ t, s0 }) => {
  const c = cue(s0);
  const cam = orbit(0.55 + 0.4 * k(t, 0, 3), 0.3, 15, [0, 0.55, 0], 34);
  const back = c("back"); const pul = 0.5 + 0.5 * Math.sin(t * 7);
  const camber = arch(t, back + 0.05, 0.6, 0.55, 0.2);
  const ya = CY + 0.12 - 0.12;  // hauteur des câbles
  const ax = ko(t, back, back + 0.5);
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0, 3.6, 1.8]}>
        <Block p={[0, 0.06, 0]} s={[4.6, 0.12, 1.7]} m={{ color: "#e8ebf3" }} />
        <Member t={t} op={0.4} camber={camber} cableEi={0.6 + 0.3 * pul} squeeze={0.3 * k(t, back, back + 0.6)} />
        {/* flèches rouges à hauteur des câbles, vers l'intérieur : les câbles veulent se raccourcir */}
        <Arrow3D p={[-2.55 + 0.12 * pul, ya + 0.12, 0]} dir={[1, 0, 0]} len={0.75 * ax} color={COL.red} r={0.07} />
        <Arrow3D p={[2.55 - 0.12 * pul, ya + 0.12, 0]} dir={[-1, 0, 0]} len={0.75 * ax} color={COL.red} r={0.07} />
      </Shell>
      <Label cam={cam} at={[0, CY + 0.1, 0.26]} text="Câbles tendus" t={t} t0={0.4} t1={back - 0.1} side="r" dx={80} dy={-170} tone="red" />
      <Label cam={cam} at={[-1.3, CY + 0.12, 0.2]} text="Ils veulent retrouver leur longueur" t={t} t0={back + 0.1} side="r" dx={70} dy={-190} tone="red" />
      <BigTitle ltr t={t} t0={c("eff", -0.05)} t1={c("eff", 1.0)} top={1230} lines={[{ text: "L'effet !", red: true, size: 120 }]} />
      <StepChip n={5} total={TOT} ar="هنا يصير الـ effet" t={t} t0={0.2} />
    </AbsoluteFill>
  );
};

// ───────── 6. La compression venue de l'intérieur ─────────
export const S6: React.FC<SP> = ({ t, s0 }) => {
  const c = cue(s0);
  const cam = orbit(1.05 - 0.4 * k(t, 0, 4.5), 0.3, 15, [0, 0.55, 0], 34);
  const tint = k(t, c("comp1"), c("comp1", 1.6));
  const pul = 0.5 + 0.5 * Math.sin(t * 6);
  const sq = k(t, c("comp1"), c("comp1", 1.0));
  const a = ko(t, c("comp1", 0.2), c("comp1", 0.9));
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0, 3.6, 1.8]}>
        <Block p={[0, 0.06, 0]} s={[4.4, 0.12, 1.7]} m={{ color: "#e8ebf3" }} />
        <Member t={t} op={0.7} tint={tint} squeeze={sq} cableEi={0.4} camber={arch(t, c("comp2", -0.1), 0.4, 0.35, 0.13)} />
        {/* plaques d'ancrage rouges qui tirent vers l'intérieur + flèches de compression */}
        {[-1, 1].map((sd, i) => (
          <group key={i}>
            <Block p={[sd * (1.7 - sq * 0.07 + 0.08), CY + 0.0, 0]} s={[0.1, 0.5, 0.9]} m={{ color: COL.red, emissive: COL.red, ei: 0.4 }} />
            <Arrow3D p={[sd * (2.45 - 0.15 * pul), CY + 0.0, 0]} dir={[-sd, 0, 0]} len={0.85 * a} color={COL.navyL} r={0.1} />
          </group>
        ))}
      </Shell>
      <Label cam={cam} at={[0, CY + 0.12, 0.26]} text="Les câbles compriment le béton" t={t} t0={c("comp1", 0.3)} t1={c("comp2", -0.1)} side="r" dx={90} dy={-190} tone="red" />
      <Label cam={cam} at={[1.75, CY, 0]} text="Compression" t={t} t0={c("comp2")} side="l" dx={50} dy={-180} tone="navy" />
      <StepChip n={6} total={TOT} ar="يكبسوا الـ béton منداخل" t={t} t0={0.2} />
    </AbsoluteFill>
  );
};

// ───────── 7. Zéro fissuration ─────────
export const S7: React.FC<SP> = ({ t, s0 }) => {
  const c = cue(s0);
  const cam = orbit(0.5 - 0.5 * k(t, 0, 3.9), 0.24, 15.8, [0, 1.05, 0], 34);
  const pul = 0.5 + 0.5 * Math.sin(t * 5);
  const ca = ko(t, 0.2, 0.9);
  const lift = ko(t, 0, 0.8);
  return (
    <AbsoluteFill>
      <Shell cam={cam}>
        <Supports x={1.85} />
        <Beam L={L0} h={H0} d={D0} y={BY} m={{ color: "#8aa3f5", opacity: 0.68, emissive: COL.navyL, ei: 0.3 }} />
        {[-0.18, 0, 0.18].map((z, i) => <Rod key={i} a={[-L0 / 2 + 0.05, BY - 0.12, z]} b={[L0 / 2 - 0.05, BY - 0.12, z]} r={0.035} m={{ color: COL.red, emissive: COL.red, ei: 0.5 }} />)}
        <Arrow3D p={[-L0 / 2 - 0.95 + 0.2 * pul, BY, 0]} dir={[1, 0, 0]} len={0.85 * ca} color={COL.navyL} r={0.09} />
        <Arrow3D p={[L0 / 2 + 0.95 - 0.2 * pul, BY, 0]} dir={[-1, 0, 0]} len={0.85 * ca} color={COL.navyL} r={0.09} />
      </Shell>
      <Label cam={cam} at={[L0 / 2 + 0.3, BY, 0]} text="Toujours comprimé" t={t} t0={c("zero0", 0.1)} t1={c("zero", 0.3)} side="l" dx={50} dy={-170} tone="navy" />
      <Badge text="Zéro fissuration" t={t} t0={c("zero", 0.38)} y={1290} />
      <StepChip n={7} total={TOT} ar="الـ béton ديما مكبوس" t={t} t0={0.2} />
    </AbsoluteFill>
  );
};

// ───────── 8. Plus de charge, grandes portées, sans poteau ─────────
export const S8: React.FC<SP> = ({ t, dur, s0 }) => {
  const c = cue(s0);
  const grow = k(t, c("load2"), c("load2", 1.5));
  const L = L0 + 2.0 * grow; const sx = L / 2 - 0.25;
  const cam = orbit(0.4 - 0.3 * k(t, 0, dur), 0.22, 15.8 + 4.6 * grow, [0, 1.1, 0], 34);
  const drops = [0, 1, 2].map((i) => ko(t, c("load1", 0.15 + 0.3 * i), c("load1", 0.75 + 0.3 * i)));
  const ghost = ko(t, c("load4"), c("load4", 0.6));
  return (
    <AbsoluteFill>
      <Shell cam={cam}>
        <Supports x={sx} ghost={1} />
        <Beam L={L} h={H0} d={D0} y={BY} sag={0.015 * (drops[0] + drops[1] + drops[2])} m={{ color: "#8aa3f5", opacity: 0.7, emissive: COL.navyL, ei: 0.25 }} />
        {[-1.2, 0, 1.2].map((x, i) => (
          <React.Fragment key={i}>
            {drops[i] > 0.001 && <Weight p={[x * (L / L0), TOP + 0.04 + (1 - drops[i]) * 2.0, 0]} s={0.6} />}
            {drops[i] > 0.999 && <Arrow3D p={[x * (L / L0), TOP + 1.9, 0]} dir={[0, -1, 0]} len={0.8} color={COL.red} r={0.07} />}
          </React.Fragment>
        ))}
        {ghost > 0.01 && <Cone p={[0, 0.45, 0]} rBot={0.55} rTop={0.3} h={0.9} color="#ff9a9b" opacity={0.45 * ghost} />}
      </Shell>
      <Label cam={cam} at={[0, TOP + 1.2, 0]} text="Plus de charge" sub="la poutre reste droite" t={t} t0={c("load1", 1.2)} t1={c("load2", 0.4)} side="r" dx={110} dy={-90} tone="red" />
      <Label cam={cam} at={[0, 0.2, 0.9]} text="Grandes portées" t={t} t0={c("load3")} t1={c("load4", -0.1)} side="r" dx={80} dy={170} tone="navy" />
      <Label cam={cam} at={[0, 0.45, 0]} text="Sans poteau au milieu ✗" t={t} t0={c("load4", 0.2)} side="r" dx={90} dy={150} tone="red" />
      <StepChip n={8} total={TOT} ar="charge كبيرة و grandes portées" t={t} t0={0.2} />
    </AbsoluteFill>
  );
};

// ───────── livres (9, 10, 11) ─────────
const BOOK = [COL.navy, COL.red, "#6c7fd8", "#2f3d9c", "#e04f50", "#8a97c9", COL.navy, "#c53a3b", "#4c5cc0"];
const rowHalf = (n: number, gap = 0) => ((n - 1) * (BK.T + 0.012 + gap)) / 2 + BK.T / 2;
const Row: React.FC<{ n: number; lean?: number; gap?: number; appear?: number; glow?: number }> = ({ n, lean = 0, gap = 0, appear = 1, glow = 0 }) => {
  const sp = BK.T + 0.012 + gap;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const x = (i - (n - 1) / 2) * sp; const a = clamp(appear * (n + 2) - i, 0, 1);
        return <group key={i} position={[x, (1 - a) * 1.4, 0]} rotation={[0, 0, lean]}><Book color={BOOK[i % BOOK.length]} /></group>;
      })}
      {glow > 0.01 && <mesh position={[0, BK.H / 2, 0]}><boxGeometry args={[rowHalf(n, gap) * 2 + 0.06, BK.H + 0.06, BK.D + 0.06]} /><meshBasicMaterial color={COL.navyL} transparent opacity={0.22 * glow} /></mesh>}
    </group>
  );
};
const Hands: React.FC<{ hx: number; y: number; curl: number }> = ({ hx, y, curl }) => (
  <>
    <group position={[-hx, y, 0]} rotation={[0, Math.PI / 2, 0]}><Hand scale={1.5} curl={curl} /></group>
    <group position={[hx, y, 0]} rotation={[0, -Math.PI / 2, 0]}><Hand scale={1.5} curl={curl} /></group>
  </>
);
const N = 8;

// ───────── 9. Soulever une rangée de livres avec les deux mains, sans appui dessous ─────────
export const S9: React.FC<SP> = ({ t, s0 }) => {
  const c = cue(s0);
  const cam = orbit(0.5 + 0.35 * k(t, 0, 6.2), 0.25, 17.2, [0, 1.1, 0], 34);
  const rh = rowHalf(N);
  const enter = ko(t, c("hands1"), c("hands1", 1.3)); const press = k(t, c("hands1", 1.0), c("hands1", 1.9));
  const lift = 0.9 * k(t, c("hands1", 2.0), c("hands1", 3.0));
  const hx = rh + 0.07 + 2.6 * (1 - enter);
  const tbl = k(t, c("hands2", 0.1), c("hands2", 0.9));
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0, 4.2, 1.9]}>
        {tbl < 0.99 && <group position={[tbl * 7, 0, 0]}><Block p={[0, -0.1, 0]} s={[6.4, 0.2, 1.9]} m={{ color: "#e6e9f0" }} /></group>}
        <group position={[0, lift - 0.0, 0]}>
          <Row n={N} lean={0.17 * (1 - press)} appear={ko(t, c("more"), c("more", 0.8))} />
          {enter > 0.01 && <Hands hx={hx} y={0.65} curl={0.2 + 0.8 * press} />}
        </group>
        <Arrow3D p={[-hx - 1.7, 1.2 + lift, 0]} dir={[1, 0, 0]} len={0.9 * ko(t, c("hands1", 1.0), c("hands1", 1.8))} color={COL.red} r={0.08} />
        <Arrow3D p={[hx + 1.7, 1.2 + lift, 0]} dir={[-1, 0, 0]} len={0.9 * ko(t, c("hands1", 1.0), c("hands1", 1.8))} color={COL.red} r={0.08} />
      </Shell>
      <Label cam={cam} at={[0, 1.4 + lift, 0.4]} text="Soulève avec tes deux mains" t={t} t0={c("hands1", 1.9)} t1={c("hands2", -0.1)} side="r" dx={80} dy={-190} tone="navy" />
      <Label cam={cam} at={[0, 0.2 + lift, 0.5]} text="Sans support dessous" t={t} t0={c("hands2", 0.5)} side="l" dx={70} dy={200} tone="red" />
      <BigTitle t={t} t0={c("more")} t1={c("hands1", 0.6)} top={1250} lines={[{ text: "تفهمها أكثر", red: true, size: 100 }]} />
      <StepChip n={9} total={TOT} ar="مثال الكتب" t={t} t0={0.3} />
    </AbsoluteFill>
  );
};

// ───────── 10. On les presse : les livres collent, un seul bloc ─────────
export const S10: React.FC<SP> = ({ t, s0 }) => {
  const c = cue(s0);
  const cam = orbit(0.45 - 0.35 * k(t, 0, 6.2), 0.22, 16.6, [0, 1.3, 0], 34);
  const press = k(t, c("press1"), c("press1", 0.9));
  const gap = 0.07 * (1 - press);
  const rh = rowHalf(N, gap);
  const glow = k(t, c("press2", 0.6), c("press2", 1.6));
  const lift = 1.0 * k(t, c("press3"), c("press3", 1.0));
  const tilt = 0.12 * Math.sin(Math.PI * k(t, c("press3", 1.2), c("press3", 2.0)));
  const hx = rh + 0.07 - 0.05 * press;
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0, 4.2, 1.9]}>
        <group position={[0, 0.9 + lift, 0]} rotation={[0, 0, tilt]}>
          <Row n={N} gap={gap} glow={glow} />
          <Hands hx={hx} y={0.65} curl={1.0} />
        </group>
        <Arrow3D p={[-hx - 1.7, 2.1 + lift, 0]} dir={[1, 0, 0]} len={0.9 * (0.6 + 0.4 * press)} color={COL.red} r={0.08} />
        <Arrow3D p={[hx + 1.7, 2.1 + lift, 0]} dir={[-1, 0, 0]} len={0.9 * (0.6 + 0.4 * press)} color={COL.red} r={0.08} />
      </Shell>
      <Label cam={cam} at={[0, 0.9 + 1.4 + lift, 0.4]} text="On les presse" t={t} t0={c("press1", 0.1)} t1={c("press2", 0.3)} side="r" dx={90} dy={-190} tone="red" />
      <Label cam={cam} at={[0, 0.9 + 0.7 + lift, 0.6]} text="Les livres collent" t={t} t0={c("press2", 0.8)} t1={c("press3")} side="l" dx={70} dy={200} tone="navy" />
      <Label cam={cam} at={[0, 0.9 + 1.2 + lift, 0.4]} text="Un seul bloc ✓" t={t} t0={c("press3", 0.7)} side="r" dx={90} dy={-200} tone="navy" />
      <StepChip n={10} total={TOT} ar="الكتب يلصقوا كيف قطعة وحدة" t={t} t0={0.3} />
    </AbsoluteFill>
  );
};

// ───────── 11. L'analogie : câbles/béton = mains/livres ─────────
export const S11: React.FC<SP> = ({ t, s0 }) => {
  const c = cue(s0);
  const cam = orbit(0.45, 0.2, 18.5, [0, 0.9, 0], 34);
  const pul = 0.5 + 0.5 * Math.sin(t * 6);
  const aBeam = ko(t, c("rec1"), c("rec1", 0.8)); const aBook = ko(t, c("rec2"), c("rec2", 0.9));
  const press = k(t, c("rec3", -0.3), c("rec3", 0.6));
  const rh = rowHalf(6, 0.0);
  const bk = ko(t, c("rec2"), c("rec2", 0.6));
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0, 4.2, 4.2]}>
        <group position={[0, 2.6, 0]} scale={0.8}>
          <Block p={[0, 0.06, 0]} s={[4.4, 0.12, 1.7]} m={{ color: "#e8ebf3" }} />
          <Member t={t} op={0.7} tint={0.8} cableEi={0.4} />
          {[-1, 1].map((sd, i) => <Arrow3D key={i} p={[sd * (2.45 - 0.15 * pul), CY, 0]} dir={[-sd, 0, 0]} len={0.85 * aBeam} color={COL.navyL} r={0.1} />)}
        </group>
        {bk > 0.01 && (
          <group position={[0, -0.8, 0]} scale={0.8 * (0.7 + 0.3 * bk)}>
            <Block p={[0, -0.1, 0]} s={[5.2, 0.2, 1.9]} m={{ color: "#e6e9f0" }} />
            <Row n={6} lean={0.14 * (1 - press)} appear={ko(t, c("rec2"), c("rec2", 0.8))} />
            <Hands hx={rh + 0.07 + 0.7 * (1 - aBook)} y={0.65} curl={0.2 + 0.8 * press} />
          </group>
        )}
      </Shell>
      <BigTitle t={t} t0={c("exact")} t1={c("rec1", -0.05)} top={1230} lines={[{ text: "La précontrainte", size: 92 }]} />
      <Label cam={cam} at={[0, 2.9, 0.4]} text="Les câbles compriment le béton" t={t} t0={c("rec1", 0.2)} t1={c("rec3", 0.2)} side="r" dx={90} dy={-170} tone="red" />
      <Label cam={cam} at={[0, -0.1, 0.5]} text="Tes mains compriment les livres" t={t} t0={c("rec3", 0.2)} side="r" dx={90} dy={170} tone="navy" />
      <StepChip n={11} total={TOT} ar="كيما الكتب بالضبط" t={t} t0={0.2} />
    </AbsoluteFill>
  );
};

// ───────── 12. Portée longue et espaces ouverts ─────────
export const S12: React.FC<SP> = ({ t, dur, s0 }) => {
  const c = cue(s0);
  const cam = orbit(-0.3 + 1.0 * k(t, 0, dur - 0.2), 0.27, 23, [0, 1.2, 0], 34);
  const L = 5.6, h = 0.4, y = 1.7 + h / 2;
  const app = kb(t, 0.05, 0.8);
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0, 4.6, 2.2]}>
        <group scale={0.92 + 0.08 * app}>
          <Cone p={[-3.1, 0.85, 0]} rBot={1.0} rTop={0.5} h={1.7} color={CLAY} />
          <Cone p={[3.1, 0.85, 0]} rBot={1.0} rTop={0.5} h={1.7} color={CLAY} />
          <Beam L={L} h={h} d={1.1} y={y} m={{ color: "#dde1e9" }} />
          {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[L / 2 + 0.002, y, (i - 3) * 0.14]} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[0.055, 16]} /><meshBasicMaterial color="#8d96aa" /></mesh>)}
        </group>
        <Arrow3D p={[-L / 2, 0.2, 1.0]} dir={[1, 0, 0]} len={(L / 2) * ko(t, 0.8, 2.0)} color={COL.navyL} r={0.06} />
        <Arrow3D p={[L / 2, 0.2, 1.0]} dir={[-1, 0, 0]} len={(L / 2) * ko(t, 0.8, 2.0)} color={COL.navyL} r={0.06} />
      </Shell>
      <Label cam={cam} at={[0, 0.2, 1.0]} text="Portée longue" t={t} t0={c("end", 0.1)} side="r" dx={80} dy={130} tone="navy" />
      <Label cam={cam} at={[0, 1.0, 0]} text="Espaces ouverts ✓" t={t} t0={c("end", 1.1)} side="l" dx={80} dy={-60} tone="red" />
      <BigTitle t={t} t0={c("end", 0.4)} top={1330} lines={[{ text: "وهكّة نربحو مساحات مفتوحة", size: 46 }]} />
      <StepChip n={12} total={TOT} ar="portée طويلة" t={t} t0={0.2} />
    </AbsoluteFill>
  );
};
