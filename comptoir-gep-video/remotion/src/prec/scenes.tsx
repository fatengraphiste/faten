import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill } from "remotion";
import { COL, Cam, Rig, Stage, Block, Rod, Arrow3D, Beam, Mat, orbit, k, ko, kb, clamp, sagAt } from "./kit";
import { Label, StepChip, BigTitle, Badge } from "./ui";

export type SP = { t: number; dur: number };
const TOT = 9;

const Shell: React.FC<{ cam: Cam; children: React.ReactNode; shadow?: [number, number, number] }> = ({ cam, children, shadow }) => (
  <ThreeCanvas width={1080} height={1920} camera={{ fov: cam.fov, position: cam.pos, near: 0.1, far: 200 }}>
    <Rig cam={cam} /><Stage shadow={shadow} />{children}
  </ThreeCanvas>
);
const SC = { concrete: { color: COL.concrete }, concreteD: { color: COL.concreteD } };
const Supports: React.FC<{ x: number; w?: number; hgt?: number; d?: number }> = ({ x, w = 0.8, hgt = 0.8, d = 1.1 }) => (
  <>
    <Block p={[-x, hgt / 2, 0]} s={[w, hgt, d]} m={SC.concreteD} />
    <Block p={[x, hgt / 2, 0]} s={[w, hgt, d]} m={SC.concreteD} />
  </>
);

// ───────────────────────── 1. Le problème : béton armé ─────────────────────────
export const S1: React.FC<SP> = ({ t }) => {
  const cam = orbit(0.62, 0.24, 16.4 - 0.8 * clamp(t / 7), [0, 1.0, 0], 34);
  const L = 4.2, h = 0.62, d = 0.62, by = 0.8 + h / 2;
  const sag = 0.3 * k(t, 2.2, 4.4);
  const app = kb(t, 0.1, 0.9);
  const top = by + h / 2;
  const ar = [-1.2, 0, 1.2].map((x, i) => ({ x, hover: 1.4 * (1 - ko(t, 1.3 + 0.12 * i, 2.5 + 0.12 * i)) + 0.04 - sag * (1 - (x / (L / 2)) ** 2) * 0 }));
  return (
    <AbsoluteFill>
      <Shell cam={cam}>
        <group scale={0.9 + 0.1 * app} position={[0, (1 - app) * -0.3, 0]}>
          <Supports x={1.9} />
          <Beam L={L} h={h} d={d} sag={sag} y={by} m={{ color: COL.concrete }} />
          {Array.from({ length: 6 }, (_, i) => {
            const x = -0.95 + 0.38 * i; const g = ko(t, 3.4 + 0.1 * i, 4.1 + 0.1 * i); const hh = 0.36 * g;
            const yb = by - h / 2 + sagAt(x, L, sag);
            return hh > 0.01 ? <Block key={i} p={[x, yb + hh / 2, d / 2 + 0.004]} s={[0.04, hh, 0.02]} rot={[0, 0, (i % 2 ? 1 : -1) * 0.14]} m={{ color: COL.red, emissive: COL.red, ei: 0.4 }} /> : null;
          })}
        </group>
        {ar.map((a, i) => <Arrow3D key={i} p={[a.x, top + 0.9 + a.hover - sag * (1 - (a.x / (L / 2)) ** 2) * 0.6, 0]} dir={[0, -1, 0]} len={0.9 * ko(t, 1.9, 2.4)} color={COL.red} r={0.075} />)}
      </Shell>
      <Label cam={cam} at={[-1.9, top, 0]} text="Compression (forte)" t={t} t0={2.7} side="l" dx={60} dy={-120} tone="navy" />
      <Label cam={cam} at={[0.2, by - h / 2 - sag, 0.31]} text="Traction (faible) ✗" sub="fissures" t={t} t0={3.5} side="r" dx={110} dy={150} tone="red" />
      <BigTitle ltr t={t} t0={0.1} t1={1.9} top={520} lines={[{ text: "C'est quoi", size: 92 }, { text: "la précontrainte ?", red: true, size: 104 }]} />
      <StepChip n={1} total={TOT} ar="المشكل: الـ béton armé" t={t} t0={2.0} />
    </AbsoluteFill>
  );
};

// ───────────────────────── 2. La solution : béton précontraint ─────────────────────────
export const S2: React.FC<SP> = ({ t }) => {
  const cam = orbit(0.15 + 1.1 * k(t, 0, 6.2), 0.26, 15.8, [0, 1.0, 0], 34);
  const L = 4.2, h = 0.62, d = 0.62, by = 0.8 + h / 2;
  const pulse = 0.35 + 0.15 * Math.sin(t * 4);
  const app = kb(t, 0.1, 0.9);
  return (
    <AbsoluteFill>
      <Shell cam={cam}>
        <group scale={0.92 + 0.08 * app}>
          <Supports x={1.9} />
          <Beam L={L} h={h} d={d} y={by} m={{ color: "#7f9af2", opacity: 0.6, emissive: COL.navyL, ei: pulse }} />
          {[-0.18, 0, 0.18].map((z, i) => <Rod key={i} a={[-L / 2 + 0.05, by - 0.12, z]} b={[-L / 2 + 0.05 + (L - 0.1) * ko(t, 1.2 + 0.2 * i, 2.8 + 0.2 * i), by - 0.12, z]} r={0.035} m={{ color: COL.red, emissive: COL.red, ei: 0.5 }} />)}
        </group>
      </Shell>
      <Label cam={cam} at={[0.3, by - 0.12, 0.18]} text="Câbles en acier tendus" t={t} t0={3.3} side="r" dx={80} dy={170} tone="red" />
      <BigTitle t={t} t0={0.5} top={1210} kicker="الحل" lines={[{ text: "Béton", size: 96 }, { text: "précontraint", red: true, size: 104 }]} />
      <StepChip n={2} total={TOT} ar="الحل: الـ béton précontraint" t={t} t0={0.2} />
    </AbsoluteFill>
  );
};

// ───────────────────────── Moule + câbles + vérin (scènes 3, 4, 5) ─────────────────────────
const Mould: React.FC<{ cableIn?: number; pull?: number; fill?: number; red?: number; cut?: number; wallA?: number; jackX?: number; jackA?: number }> = ({ cableIn = 1, pull = 0, fill = 0, red = 0, cut = 0, wallA = 0.32, jackX = 0, jackA = 1 }) => {
  const zs = [-0.28, 0, 0.28], y0 = 0.42;
  const cableC = red > 0.5 ? COL.red : COL.steel;
  const xr = 3.1 + pull * 0.5 - cut * 0.95; // extrémité droite du câble
  return (
    <group>
      <Block p={[0, 0.1, 0]} s={[4.2, 0.2, 1.1]} m={SC.concreteD} />
      {[-0.55, 0.55].map((z, i) => <Block key={i} p={[0, 0.55, z]} s={[4.2, 0.7, 0.06]} m={{ color: "#aeb7ca", opacity: wallA }} />)}
      <Block p={[-2.1, 0.55, 0]} s={[0.12, 0.7, 1.16]} m={SC.concreteD} />
      <Block p={[2.1, 0.55, 0]} s={[0.12, 0.7, 1.16]} m={SC.concreteD} />
      {zs.map((z, i) => <Rod key={i} a={[-3.0 - (1 - cableIn) * 4, y0, z]} b={[xr - (1 - cableIn) * 4, y0, z]} r={0.045} m={{ color: cableC, emissive: red > 0.5 ? COL.red : "#000000", ei: red * 0.6, rough: 0.35, metal: 0.4 }} />)}
      {fill > 0.01 && <Block p={[0, 0.2 + (0.5 * fill) / 2, 0]} s={[4.0, 0.5 * fill + 0.001, 1.0]} m={{ color: fill >= 1 ? "#c7ccd6" : "#b9c0cf" }} />}
      <Block p={[-3.2, 0.6, 0]} s={[0.35, 1.1, 1.5]} m={SC.concreteD} />
      <group position={[jackX, 0, 0]}>
        <Block p={[4.7, 0.6, 0]} s={[0.4, 1.1, 1.5]} m={{ color: COL.concreteD, opacity: jackA }} />
        <mesh position={[4.0 + pull * 0.5, y0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.32, 0.32, 0.9, 20]} /><Mat color={COL.navy} opacity={jackA} rough={0.5} metal={0.3} /></mesh>
        <mesh position={[3.45 + pull * 0.5, y0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.14, 0.14, 0.7, 14]} /><Mat color={COL.steel} opacity={jackA} rough={0.3} metal={0.5} /></mesh>
      </group>
    </group>
  );
};

// ───────────────────────── 3. Insertion des câbles (tour 360°) ─────────────────────────
export const S3: React.FC<SP> = ({ t, dur }) => {
  const cam = orbit(0.55 + Math.PI * 2 * k(t, 0, dur - 0.3), 0.36, 19.5, [0.8, 0.5, 0], 34);
  const cin = ko(t, 0.4, 2.4);
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0.8, 4.8, 1.8]}>
        <Mould cableIn={cin} />
      </Shell>
      <Label cam={cam} at={[-0.6, 0.42, 0.28]} text="Câbles en acier" t={t} t0={2.4} t1={4.6} side="l" dx={70} dy={-110} tone="navy" />
      <Label cam={cam} at={[4.0, 0.42, 0]} text="Vérin hydraulique" t={t} t0={4.0} t1={6.5} side="r" dx={60} dy={120} tone="navy" />
      <StepChip n={3} total={TOT} ar="نحطو الـ câbles" t={t} t0={0.3} />
    </AbsoluteFill>
  );
};

// ───────────────────────── 4. Mise en tension + coulage ─────────────────────────
export const S4: React.FC<SP> = ({ t }) => {
  const cam = orbit(0.95 - 0.35 * k(t, 0, 7), 0.34, 19.8, [0.8, 0.7, 0], 34);
  const pull = k(t, 1.0, 2.6);
  const red = pull;
  const fill = k(t, 3.6, 6.4);
  const poured = t > 3.3 && t < 6.6;
  const bx = -0.4, byy = 2.5;
  const tilt = -0.9 * k(t, 3.0, 3.6) * (1 - k(t, 6.4, 6.9));
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0.8, 4.8, 1.8]}>
        <Mould pull={pull} red={red} fill={fill} />
        <Arrow3D p={[4.5, 0.42, 1.0]} dir={[1, 0, 0]} len={0.9 * pull + 0.001} color={COL.red} r={0.08} />
        <Arrow3D p={[4.5, 0.42, -1.0]} dir={[1, 0, 0]} len={0.9 * pull + 0.001} color={COL.red} r={0.08} />
        {t > 2.9 && t < 6.9 && (
          <group position={[bx, byy, 0]} rotation={[0, 0, tilt]}>
            <mesh><cylinderGeometry args={[0.42, 0.3, 0.6, 20, 1, true]} /><meshStandardMaterial color={COL.navy} side={2} roughness={0.5} /></mesh>
            <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.38, 0.38, 0.05, 20]} /><Mat color="#9aa3b8" /></mesh>
          </group>
        )}
        {poured && <Rod a={[bx + 0.55, byy - 0.35, 0]} b={[bx + 0.55, 0.22 + 0.5 * fill, 0]} r={0.07} m={{ color: "#aab2c4" }} />}
      </Shell>
      <Label cam={cam} at={[4.5, 0.42, 0]} text="Mise en tension" t={t} t0={1.5} t1={3.4} side="l" dx={70} dy={-150} tone="red" />
      <Label cam={cam} at={[bx, byy, 0]} text="Coulage du béton" t={t} t0={3.6} side="r" dx={90} dy={-70} tone="navy" />
      <StepChip n={4} total={TOT} ar="نشدّو الـ câbles و نصبّو الـ béton" t={t} t0={0.3} />
    </AbsoluteFill>
  );
};

// ───────────────────────── 5. La libération ─────────────────────────
export const S5: React.FC<SP> = ({ t }) => {
  const cam = orbit(0.6 + 0.9 * k(t, 0, 7), 0.3, 19.5, [0.5, 0.6, 0], 34);
  const cut = k(t, 1.5, 2.4);
  const wallA = 0.32 * (1 - k(t, 4.6, 5.8));
  const jackA = 1 - k(t, 1.8, 2.6);
  const jackX = 0.7 * k(t, 1.8, 2.8);
  const pul = 0.5 + 0.5 * Math.sin(t * 6);
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0.8, 4.8, 1.8]}>
        <Mould fill={1} red={1 - cut} pull={0.9 * (1 - cut)} cut={cut} wallA={wallA} jackX={jackX} jackA={jackA} cableIn={1} />
        {t > 1.4 && t < 2.1 && <mesh position={[2.3, 0.45, 0]}><sphereGeometry args={[0.18 + (t - 1.4) * 0.8, 16, 16]} /><meshBasicMaterial color="#fff2a8" transparent opacity={1 - (t - 1.4) / 0.7} /></mesh>}
        {t > 2.9 && (
          <>
            <Arrow3D p={[-3.0 + 0.3 * pul, 0.45, 0]} dir={[1, 0, 0]} len={0.8 * ko(t, 2.9, 3.5)} color={COL.navyL} r={0.09} />
            <Arrow3D p={[3.0 - 0.3 * pul, 0.45, 0]} dir={[-1, 0, 0]} len={0.8 * ko(t, 2.9, 3.5)} color={COL.navyL} r={0.09} />
          </>
        )}
      </Shell>
      <Label cam={cam} at={[0, 0.8, 0.5]} text="Béton durci ✓" t={t} t0={0.7} t1={2.7} side="r" dx={90} dy={-150} tone="navy" />
      <Label cam={cam} at={[2.4, 0.45, 0.28]} text="Câbles coupés" t={t} t0={2.0} t1={4.0} side="r" dx={80} dy={130} tone="red" />
      <Label cam={cam} at={[-2.3, 0.45, 0]} text="Le câble veut se rétracter" t={t} t0={3.5} side="l" dx={60} dy={-140} tone="navy" />
      <StepChip n={5} total={TOT} ar="نقطعو الـ câbles" t={t} t0={0.3} />
    </AbsoluteFill>
  );
};

// ───────────────────────── 6. L'effet : compression ─────────────────────────
export const S6: React.FC<SP> = ({ t }) => {
  const cam = orbit(0.55 - 0.9 * k(t, 0, 7.4), 0.24, 15.8, [0, 1.0, 0], 34);
  const L = 4.2, h = 0.62, d = 0.62, by = 0.8 + h / 2, top = by + h / 2;
  const camber = 0.1 * (1 - k(t, 2.6, 3.8));
  const press = 0.5 + 0.5 * Math.sin(t * 5);
  const ca = ko(t, 0.8, 1.6);
  const ld = 1.1 * (1 - ko(t, 2.4, 3.4));
  return (
    <AbsoluteFill>
      <Shell cam={cam}>
        <Supports x={1.9} />
        <Beam L={L} h={h} d={d} y={by} sag={-camber} m={{ color: "#8aa3f5", opacity: 0.68, emissive: COL.navyL, ei: 0.3 }} />
        <Arrow3D p={[-L / 2 - 0.9 + 0.2 * press, by, 0]} dir={[1, 0, 0]} len={0.85 * ca} color={COL.navyL} r={0.09} />
        <Arrow3D p={[L / 2 + 0.9 - 0.2 * press, by, 0]} dir={[-1, 0, 0]} len={0.85 * ca} color={COL.navyL} r={0.09} />
        {[-1.2, 0, 1.2].map((x, i) => <Arrow3D key={i} p={[x, top + 0.9 + ld, 0]} dir={[0, -1, 0]} len={0.9 * ko(t, 2.4 + 0.1 * i, 3.2)} color={COL.red} r={0.075} />)}
      </Shell>
      <Label cam={cam} at={[L / 2 + 0.4, by, 0]} text="Compression" t={t} t0={1.2} side="l" dx={50} dy={-160} tone="navy" />
      <Badge text="Zéro fissuration" t={t} t0={4.2} y={1290} />
      <StepChip n={6} total={TOT} ar="النتيجة: الـ compression" t={t} t0={0.3} />
    </AbsoluteFill>
  );
};

// ───────────────────────── livres (7 & 8) ─────────────────────────
const BOOK = [COL.navy, COL.red, "#7f93d6", "#e9ecf3", "#5a6ad8", COL.concreteD, "#c8cfe8", COL.navyL, COL.red];
const Books: React.FC<{ n?: number; x0?: number; lift?: number; drop?: number; wob?: number; appear?: number; y0?: number }> = ({ n = 9, lift = 0, drop = 0, wob = 0, appear = 1, y0 = 0 }) => (
  <group position={[0, lift, 0]}>
    {Array.from({ length: n }, (_, i) => {
      const x = (i - (n - 1) / 2) * 0.42; const u = x / ((n - 1) * 0.21);
      const a = clamp(appear * (n + 2) - i, 0, 1);
      const sag = drop * (1 - u * u);
      return <group key={i} position={[x, y0 + 0.55 + (1 - a) * 1.2 - sag, 0]} rotation={[0, 0, (i % 2 ? 1 : -1) * wob * (0.6 + (i % 3) * 0.2) + u * drop * 0.6]}>
        <mesh><boxGeometry args={[0.38, 1.1, 0.85]} /><Mat color={BOOK[i % BOOK.length]} rough={0.6} /></mesh>
        <mesh position={[0.191, 0, 0]}><boxGeometry args={[0.004, 1.0, 0.8]} /><meshBasicMaterial color="#ffffff" /></mesh>
      </group>;
    })}
  </group>
);
const Pad: React.FC<{ x: number; y: number }> = ({ x, y }) => <Block p={[x, y, 0]} s={[0.34, 1.3, 1.2]} m={{ color: "#7c869c", rough: 0.5 }} />;

// 7. L'analogie des livres 1/2
export const S7: React.FC<SP> = ({ t }) => {
  const cam = orbit(0.55 + 0.35 * k(t, 0, 6.2), 0.26, 15.5, [0, 0.9, 0], 34);
  const press = k(t, 1.3, 2.7);
  const lift = 0.85 * k(t, 3.0, 4.2);
  const px = 2.9 - 0.95 * press;
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0, 3.6, 1.8]}>
        <Block p={[0, -0.1, 0]} s={[5.8, 0.2, 1.8]} m={{ color: "#e6e9f0" }} />
        <Books lift={lift} wob={0.1 * (1 - press)} appear={ko(t, 0.2, 1.4)} />
        <Pad x={-px} y={0.55 + lift} /><Pad x={px} y={0.55 + lift} />
        <Arrow3D p={[-px - 0.9 + 0.12 * Math.sin(t * 6), 0.55 + lift, 0]} dir={[1, 0, 0]} len={0.75 * ko(t, 1.3, 2.1)} color={COL.red} r={0.08} />
        <Arrow3D p={[px + 0.9 - 0.12 * Math.sin(t * 6), 0.55 + lift, 0]} dir={[-1, 0, 0]} len={0.75 * ko(t, 1.3, 2.1)} color={COL.red} r={0.08} />
      </Shell>
      <Label cam={cam} at={[0, 1.2 + lift, 0.4]} text="Compression" t={t} t0={2.0} side="r" dx={110} dy={-110} tone="red" />
      <Label cam={cam} at={[0, 1.2 + lift, 0.4]} text="Les livres tiennent ensemble ✓" t={t} t0={4.2} side="l" dx={80} dy={-190} tone="navy" />
      <StepChip n={7} total={TOT} ar="مثال الكتب (1/2)" t={t} t0={0.3} />
    </AbsoluteFill>
  );
};

// 8. L'analogie des livres 2/2 : plus de force = un bloc unique
export const S8: React.FC<SP> = ({ t }) => {
  const cam = orbit(0.45 - 0.5 * k(t, 0, 6.6), 0.24, 16.8,[0, 1.0, 0], 34);
  const press = k(t, 1.8, 3.2);
  const drop = 0.55 * (1 - press);
  const px = 2.95 - 0.95 * press;
  const wy = 3.1 - 2.1 * ko(t, 3.6, 4.4); // charge qui descend
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0, 4, 1.8]}>
        <Block p={[-2.7, 0.35, 0]} s={[1.2, 0.7, 1.4]} m={SC.concreteD} />
        <Block p={[2.7, 0.35, 0]} s={[1.2, 0.7, 1.4]} m={SC.concreteD} />
        <Books lift={0.45} y0={0.2} drop={drop} wob={0.12 * (1 - press)} appear={1} />
        <Pad x={-px} y={1.0} /><Pad x={px} y={1.0} />
        <Block p={[0, wy, 0]} s={[0.9, 0.7, 0.9]} m={{ color: COL.red, rough: 0.5 }} />
      </Shell>
      <Label cam={cam} at={[0, 1.2, 0.5]} text="Sans compression: ça s'effondre" t={t} t0={0.3} t1={1.9} side="r" dx={70} dy={-180} tone="red" />
      <Label cam={cam} at={[0, 1.8, 0.5]} text="Plus de compression = un bloc unique" t={t} t0={3.3} side="l" dx={60} dy={-200} tone="navy" />
      <StepChip n={8} total={TOT} ar="مثال الكتب (2/2)" t={t} t0={0.3} />
    </AbsoluteFill>
  );
};

// 9. Grandes portées
export const S9: React.FC<SP> = ({ t, dur }) => {
  const cam = orbit(-0.35 + 1.25 * k(t, 0, dur - 0.3), 0.27, 18, [0, 1.2, 0], 34);
  const L = 5.6, h = 0.4, d = 1.1, y = 1.7 + h / 2;
  const app = kb(t, 0.1, 1.0);
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0, 4.6, 2.2]}>
        <group scale={0.92 + 0.08 * app}>
          <Block p={[-3.1, 0.85, 0]} s={[0.6, 1.7, 1.5]} m={SC.concreteD} />
          <Block p={[3.1, 0.85, 0]} s={[0.6, 1.7, 1.5]} m={SC.concreteD} />
          <Beam L={L} h={h} d={d} y={y} m={{ color: "#dde1e9" }} />
          {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[L / 2 + 0.002, y, (i - 3) * 0.14]} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[0.055, 16]} /><meshBasicMaterial color="#8d96aa" /></mesh>)}
        </group>
        <Arrow3D p={[-L / 2, 0.2, 1.0]} dir={[1, 0, 0]} len={(L / 2) * ko(t, 1.6, 3.0)} color={COL.navyL} r={0.06} />
        <Arrow3D p={[L / 2, 0.2, 1.0]} dir={[-1, 0, 0]} len={(L / 2) * ko(t, 1.6, 3.0)} color={COL.navyL} r={0.06} />
      </Shell>
      <Label cam={cam} at={[0, 0.2, 1.0]} text="15 m" sub="grande portée" t={t} t0={2.2} side="r" dx={80} dy={130} tone="navy" />
      <Label cam={cam} at={[0, 1.0, 0]} text="Sans poteaux ✓" t={t} t0={3.6} side="l" dx={80} dy={-60} tone="red" />
      <BigTitle t={t} t0={4.6} top={1330} lines={[{ text: "Poutrelles & dalles précontraintes", size: 46 }]} />
      <StepChip n={9} total={TOT} ar="الـ grandes portées" t={t} t0={0.3} />
    </AbsoluteFill>
  );
};
