import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill } from "remotion";
import { COL, Cam, Rig, Stage, Block, Rod, Arrow3D, Beam, Mat, orbit, k, ko, kb, clamp, sagAt, Pyr, Funnel, Liquid } from "./kit";
import { Book, Hand, BK } from "./props";
import { Label, StepChip, BigTitle, Badge } from "./ui";

export type SP = { t: number; dur: number };
const TOT = 9;

const Shell: React.FC<{ cam: Cam; children: React.ReactNode; shadow?: [number, number, number] }> = ({ cam, children, shadow }) => (
  <ThreeCanvas width={1080} height={1920} camera={{ fov: cam.fov, position: cam.pos, near: 0.1, far: 200 }}>
    <Rig cam={cam} /><Stage shadow={shadow} />{children}
  </ThreeCanvas>
);
const SC = { concrete: { color: COL.concrete }, concreteD: { color: COL.concreteD } };
const Supports: React.FC<{ x: number; w?: number; hgt?: number; d?: number }> = ({ x, w = 1.3, hgt = 0.9, d = 1.5 }) => (
  <>
    <Pyr p={[-x, hgt / 2, 0]} s={[w, hgt, d]} top={0.5} m={SC.concreteD} />
    <Pyr p={[x, hgt / 2, 0]} s={[w, hgt, d]} top={0.5} m={SC.concreteD} />
  </>
);

// ───────────────────────── 1. Le problème : béton armé ─────────────────────────
export const S1: React.FC<SP> = ({ t }) => {
  const cam = orbit(0.62, 0.24, 16.4 - 0.8 * clamp(t / 7), [0, 1.0, 0], 34);
  const L = 4.2, h = 0.62, d = 0.62, by = 0.9 + h / 2;
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
  const L = 4.2, h = 0.62, d = 0.62, by = 0.9 + h / 2;
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

// ───────────────────────── banc de précontrainte (scènes 3, 4, 5) ─────────────────────────
const ZS = [-0.26, 0, 0.26], CY = 0.4;
const Bench: React.FC<{ t: number; ins?: [number, number, number]; grips?: number; pull?: number; red?: number; level?: number; hard?: boolean; cut?: number; wallA?: number; fade?: number }> = ({ t, ins = [1, 1, 1], grips = 1, pull = 0, red = 0, level = 0, hard = false, cut = 0, wallA = 0.3, fade = 1 }) => {
  const xl = -2.3, xr = 2.9 + pull * 0.45 - cut * 0.9;
  return (
    <group>
      {/* moule ouvert */}
      <Block p={[0, 0.075, 0]} s={[3.4, 0.15, 1.1]} m={SC.concreteD} />
      {[-0.52, 0.52].map((z, i) => <Block key={i} p={[0, 0.45, z]} s={[3.4, 0.6, 0.06]} m={{ color: "#aeb7ca", opacity: wallA }} />)}
      {[-1.7, 1.7].map((x, i) => (
        <group key={i}>
          <Block p={[x, 0.45, 0]} s={[0.12, 0.6, 1.1]} m={SC.concreteD} />
          {ZS.map((z, j) => <mesh key={j} position={[x, CY, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.075, 0.075, 0.15, 16]} /><Mat color="#4b5367" rough={0.6} /></mesh>)}
        </group>
      ))}
      {/* ancrage fixe (pyramide) + vérin à droite */}
      <Pyr p={[-2.75, 0.55, 0]} s={[1.0, 1.1, 1.6]} top={0.55} m={{ color: COL.concreteD, opacity: fade }} />
      <Pyr p={[3.75, 0.55, 0]} s={[1.0, 1.1, 1.6]} top={0.55} m={{ color: COL.concreteD, opacity: fade }} />
      <mesh position={[3.15 + pull * 0.45, CY, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.3, 0.3, 0.8, 22]} /><Mat color={COL.navy} opacity={fade} rough={0.45} metal={0.3} /></mesh>
      <mesh position={[2.65 + pull * 0.45, CY, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.12, 0.12, 0.5, 14]} /><Mat color={COL.steel} opacity={fade} rough={0.3} metal={0.5} /></mesh>
      {/* câbles (insertion un par un) */}
      {ZS.map((z, i) => {
        const tip = xl + (xr - xl) * ins[i]; const col = red > 0.5 ? COL.red : COL.steel;
        return (
          <group key={i}>
            <Rod a={[xl, CY, z]} b={[Math.max(tip, xl + 0.001), CY, z]} r={0.045} m={{ color: col, emissive: red > 0.5 ? COL.red : "#000000", ei: red * 0.7, rough: 0.35, metal: 0.4 }} />
            {ins[i] > 0 && ins[i] < 0.999 && <mesh position={[tip, CY, z]}><sphereGeometry args={[0.1, 14, 14]} /><meshBasicMaterial color={COL.navyL} /></mesh>}
            {grips > 0.01 && <mesh position={[xl + 0.12, CY, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.085 * grips, 0.07 * grips, 0.22, 14]} /><Mat color="#333b52" rough={0.4} metal={0.5} /></mesh>}
          </group>
        );
      })}
      {/* béton */}
      {level > 0.005 && (hard
        ? <Block p={[0, 0.15 + 0.2, 0]} s={[3.2, 0.4, 1.0]} m={{ color: "#c6cbd5" }} />
        : <Liquid w={3.2} d={1.0} y0={0.15} level={0.4 * level} t={t} color="#aab3c6" />)}
    </group>
  );
};

// 3. Insertion des câbles (tour 360°)
export const S3: React.FC<SP> = ({ t, dur }) => {
  const cam = orbit(0.55 + Math.PI * 2 * k(t, 0, dur - 0.3), 0.36, 15.2, [0.5, 0.5, 0], 34);
  const ins: [number, number, number] = [ko(t, 0.4, 1.9), ko(t, 1.0, 2.5), ko(t, 1.6, 3.1)];
  const grips = ko(t, 3.1, 3.7);
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0.5, 5.2, 1.9]}>
        <Bench t={t} ins={ins} grips={grips} />
      </Shell>
      <Label cam={cam} at={[-2.75, 1.1, 0]} text="Ancrage fixe" t={t} t0={3.4} t1={5.2} side="l" dx={70} dy={-110} tone="navy" />
      <Label cam={cam} at={[0.2, CY, 0.26]} text="Câbles en acier" sub="passent dans le moule" t={t} t0={2.4} t1={4.6} side="r" dx={90} dy={-150} tone="red" />
      <Label cam={cam} at={[3.15, CY, 0]} text="Vérin hydraulique" t={t} t0={4.4} side="r" dx={70} dy={120} tone="navy" />
      <StepChip n={3} total={TOT} ar="نحطو الـ câbles" t={t} t0={0.3} />
    </AbsoluteFill>
  );
};

// 4. Mise en tension + coulage du béton liquide
export const S4: React.FC<SP> = ({ t }) => {
  const cam = orbit(0.85 - 0.3 * k(t, 0, 7), 0.36, 14.6, [0.5, 0.7, 0], 34);
  const pull = k(t, 0.5, 2.0);
  const level = k(t, 3.4, 6.3);
  const hopIn = ko(t, 2.4, 3.2) * (1 - ko(t, 6.3, 6.9));
  const pouring = t > 3.2 && t < 6.4;
  const hx = -0.3, hy = 2.25 + (1 - hopIn) * 1.4;
  const top = 0.15 + 0.4 * level + 0.03;
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0.5, 5.2, 1.9]}>
        <Bench t={t} pull={pull} red={pull} level={level} />
        <Arrow3D p={[4.5, CY, 0.9]} dir={[1, 0, 0]} len={1.0 * pull + 0.001} color={COL.red} r={0.08} />
        <Arrow3D p={[4.5, CY, -0.9]} dir={[1, 0, 0]} len={1.0 * pull + 0.001} color={COL.red} r={0.08} />
        {hopIn > 0.01 && <Funnel p={[hx, hy, 0]} size={1.15} h={0.8} color={COL.navy} />}
        {pouring && (
          <>
            <Rod a={[hx, hy - 0.4, 0]} b={[hx, top, 0]} r={0.1} m={{ color: "#aab3c6", rough: 0.3 }} />
            {Array.from({ length: 6 }, (_, i) => { const f = (t * 2.6 + i / 6) % 1; return <mesh key={i} position={[hx + 0.02 * Math.sin(i * 3 + t * 8), hy - 0.4 - (hy - 0.4 - top) * f, 0.02 * Math.cos(i * 5)]}><sphereGeometry args={[0.15 - 0.05 * f, 12, 12]} /><meshStandardMaterial color="#b6bfd1" roughness={0.3} /></mesh>; })}
            {Array.from({ length: 8 }, (_, i) => { const ph = (t * 2.2 + i / 8) % 1; const a = (i / 8) * Math.PI * 2; return <mesh key={i} position={[hx + Math.cos(a) * (0.12 + 0.35 * ph), top + 0.32 * Math.sin(Math.PI * ph), Math.sin(a) * (0.12 + 0.3 * ph)]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#c3cad9" /></mesh>; })}
          </>
        )}
      </Shell>
      <Label cam={cam} at={[3.6, CY, 0]} text="Mise en tension" t={t} t0={1.0} t1={3.2} side="l" dx={70} dy={-160} tone="red" />
      <Label cam={cam} at={[hx, hy, 0]} text="Coulage du béton liquide" t={t} t0={3.4} side="r" dx={110} dy={90} tone="navy" />
      <StepChip n={4} total={TOT} ar="نشدّو الـ câbles و نصبّو الـ béton" t={t} t0={0.3} />
    </AbsoluteFill>
  );
};

// 5. La libération
export const S5: React.FC<SP> = ({ t }) => {
  const cam = orbit(0.6 + 0.9 * k(t, 0, 7), 0.3, 15.2, [0.5, 0.6, 0], 34);
  const cut = k(t, 1.5, 2.4);
  const wallA = 0.3 * (1 - k(t, 4.6, 5.8));
  const fade = 1 - k(t, 1.8, 2.8);
  const pul = 0.5 + 0.5 * Math.sin(t * 6);
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0.5, 5.2, 1.9]}>
        <Bench t={t} level={1} hard red={1 - cut} cut={cut} wallA={wallA} fade={fade} />
        {t > 1.4 && t < 2.1 && <mesh position={[2.3, 0.45, 0]}><sphereGeometry args={[0.18 + (t - 1.4) * 0.8, 16, 16]} /><meshBasicMaterial color="#fff2a8" transparent opacity={1 - (t - 1.4) / 0.7} /></mesh>}
        {t > 2.9 && (
          <>
            <Arrow3D p={[-1.9 + 0.25 * pul, 0.45, 0]} dir={[1, 0, 0]} len={0.8 * ko(t, 2.9, 3.5)} color={COL.navyL} r={0.09} />
            <Arrow3D p={[1.9 - 0.25 * pul, 0.45, 0]} dir={[-1, 0, 0]} len={0.8 * ko(t, 2.9, 3.5)} color={COL.navyL} r={0.09} />
          </>
        )}
      </Shell>
      <Label cam={cam} at={[0, 0.6, 0.5]} text="Béton durci ✓" t={t} t0={0.7} t1={2.7} side="r" dx={90} dy={-150} tone="navy" />
      <Label cam={cam} at={[2.3, 0.45, 0.26]} text="Câbles coupés" t={t} t0={2.0} t1={4.0} side="r" dx={80} dy={130} tone="red" />
      <Label cam={cam} at={[-1.7, 0.45, 0]} text="Le câble veut se rétracter" t={t} t0={3.5} side="l" dx={60} dy={-140} tone="navy" />
      <StepChip n={5} total={TOT} ar="نقطعو الـ câbles" t={t} t0={0.3} />
    </AbsoluteFill>
  );
};

// ───────────────────────── 6. L'effet : compression ─────────────────────────
export const S6: React.FC<SP> = ({ t }) => {
  const cam = orbit(0.55 - 0.9 * k(t, 0, 7.4), 0.24, 15.8, [0, 1.0, 0], 34);
  const L = 4.2, h = 0.62, d = 0.62, by = 0.9 + h / 2, top = by + h / 2;
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
const BOOK = [COL.navy, COL.red, "#6c7fd8", "#2f3d9c", "#e04f50", "#8a97c9", COL.navy, "#c53a3b", "#4c5cc0"];
const Row: React.FC<{ n: number; lean?: number; drop?: number; gap?: number; lift?: number; appear?: number; y0?: number }> = ({ n, lean = 0, drop = 0, gap = 0, lift = 0, appear = 1, y0 = 0 }) => {
  const sp = BK.T + 0.012 + gap; const half = ((n - 1) * sp) / 2 + BK.T / 2;
  return (
    <group position={[0, y0 + lift, 0]}>
      {Array.from({ length: n }, (_, i) => {
        const x = (i - (n - 1) / 2) * sp; const u = x / half; const a = clamp(appear * (n + 2) - i, 0, 1);
        const rz = lean + Math.atan((2 * drop * u) / half);
        return <group key={i} position={[x, -drop * (1 - u * u) + (1 - a) * 1.4, 0]} rotation={[0, 0, rz]}><Book color={BOOK[i % BOOK.length]} /></group>;
      })}
    </group>
  );
};
const rowHalf = (n: number) => ((n - 1) * (BK.T + 0.012)) / 2 + BK.T / 2;

// 7. L'analogie des livres 1/2 : deux mains pressent la rangée, qui se soulève d'un bloc
export const S7: React.FC<SP> = ({ t }) => {
  const cam = orbit(0.5 + 0.3 * k(t, 0, 6.2), 0.24, 16.2, [0, 1.0, 0], 34);
  const n = 8, rh = rowHalf(n);
  const enter = ko(t, 0.9, 2.3); const press = k(t, 2.0, 2.9);
  const lift = 0.9 * k(t, 3.1, 4.3);
  const hx = rh + 0.1 + 2.4 * (1 - enter) + 0.0;
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0, 4.2, 1.9]}>
        <Block p={[0, -0.1, 0]} s={[6.4, 0.2, 1.9]} m={{ color: "#e6e9f0" }} />
        <Row n={n} lean={0.17 * (1 - press)} appear={ko(t, 0.1, 1.2)} lift={lift} />
        <group position={[-hx, 0.75 + lift, 0]} rotation={[0, Math.PI / 2, 0]}><Hand scale={1.45} /></group>
        <group position={[hx, 0.75 + lift, 0]} rotation={[0, -Math.PI / 2, 0]}><Hand scale={1.45} /></group>
        <Arrow3D p={[-hx - 1.6, 1.0 + lift, 0]} dir={[1, 0, 0]} len={0.9 * ko(t, 2.0, 2.8)} color={COL.red} r={0.08} />
        <Arrow3D p={[hx + 1.6, 1.0 + lift, 0]} dir={[-1, 0, 0]} len={0.9 * ko(t, 2.0, 2.8)} color={COL.red} r={0.08} />
      </Shell>
      <Label cam={cam} at={[0, 1.5 + lift, 0.2]} text="Compression" t={t} t0={2.4} side="r" dx={110} dy={-130} tone="red" />
      <Label cam={cam} at={[0, 0.2 + lift, 0.45]} text="Les livres tiennent ensemble ✓" t={t} t0={4.3} side="l" dx={80} dy={170} tone="navy" />
      <StepChip n={7} total={TOT} ar="مثال الكتب (1/2)" t={t} t0={0.3} />
    </AbsoluteFill>
  );
};

// 8. L'analogie des livres 2/2 : plus de compression = un bloc unique (pont de livres qui porte une charge)
export const S8: React.FC<SP> = ({ t }) => {
  const cam = orbit(0.4 - 0.45 * k(t, 0, 6.6), 0.24, 17.4, [0, 1.1, 0], 34);
  const n = 9, rh = rowHalf(n);
  const enter = ko(t, 1.7, 2.9); const press = k(t, 2.3, 3.3);
  const drop = 0.5 * (1 - press);
  const hx = rh + 0.1 + 2.4 * (1 - enter);
  const wy = 2.45 + 1.0 * (1 - ko(t, 3.8, 4.6));
  return (
    <AbsoluteFill>
      <Shell cam={cam} shadow={[0, 5, 1.9]}>
        <Pyr p={[-2.0, 0.4, 0]} s={[1.5, 0.8, 1.7]} top={0.55} m={SC.concreteD} />
        <Pyr p={[2.0, 0.4, 0]} s={[1.5, 0.8, 1.7]} top={0.55} m={SC.concreteD} />
        <Row n={n} y0={0.82} drop={drop} gap={0.05 * (1 - press)} appear={1} />
        {enter > 0.01 && <>
          <group position={[-hx, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}><Hand scale={1.45} /></group>
          <group position={[hx, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}><Hand scale={1.45} /></group>
        </>}
        {t > 3.7 && <Block p={[0, wy, 0]} s={[0.9, 0.7, 0.9]} m={{ color: COL.red, rough: 0.5 }} />}
      </Shell>
      <Label cam={cam} at={[0, 0.6, 0.45]} text="Sans compression: ça s'effondre" t={t} t0={0.3} t1={1.8} side="r" dx={70} dy={200} tone="red" />
      <Label cam={cam} at={[0, 1.8, 0.45]} text="Plus de compression = un bloc unique" t={t} t0={4.3} side="l" dx={60} dy={-230} tone="navy" />
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
          <Pyr p={[-3.1, 0.85, 0]} s={[1.2, 1.7, 1.6]} top={0.5} m={SC.concreteD} />
          <Pyr p={[3.1, 0.85, 0]} s={[1.2, 1.7, 1.6]} top={0.5} m={SC.concreteD} />
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
