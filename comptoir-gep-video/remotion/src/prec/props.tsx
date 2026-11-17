import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Mat } from "./kit";

const RB: React.FC<{ p: [number, number, number]; s: [number, number, number]; r: number; color: string; rough?: number; rot?: [number, number, number] }> = ({ p, s, r, color, rough = 0.6, rot }) => {
  const geo = useMemo(() => new RoundedBoxGeometry(s[0], s[1], s[2], 3, r), [s[0], s[1], s[2], r]); // eslint-disable-line
  return <mesh geometry={geo} position={p} rotation={rot}><Mat color={color} rough={rough} /></mesh>;
};
export const BK = { T: 0.36, H: 1.25, D: 0.9 };
// livre cartonné : plats, dos arrondi, bloc de pages crème, bandeaux dorés (pivot = base du livre)
export const Book: React.FC<{ color: string; band?: string }> = ({ color, band = "#f4ecd0" }) => {
  const { T, H, D } = BK;
  return (
    <group position={[0, H / 2, 0]}>
      <RB p={[-(T / 2 - 0.025), 0, 0]} s={[0.05, H, D]} r={0.018} color={color} />
      <RB p={[T / 2 - 0.025, 0, 0]} s={[0.05, H, D]} r={0.018} color={color} />
      <RB p={[0, 0, D / 2 - 0.03]} s={[T, H, 0.06]} r={0.022} color={color} rough={0.5} />
      <RB p={[0, 0, -0.03]} s={[T - 0.09, H - 0.07, D - 0.07]} r={0.008} color="#f6f1e6" rough={0.9} />
      <mesh position={[0, H * 0.32, D / 2 + 0.034]}><boxGeometry args={[T * 0.86, 0.045, 0.006]} /><meshStandardMaterial color={band} roughness={0.5} /></mesh>
      <mesh position={[0, -H * 0.32, D / 2 + 0.034]}><boxGeometry args={[T * 0.86, 0.045, 0.006]} /><meshStandardMaterial color={band} roughness={0.5} /></mesh>
      <mesh position={[0, 0.02, D / 2 + 0.034]}><boxGeometry args={[T * 0.56, 0.3, 0.006]} /><meshStandardMaterial color="#fbf7ec" roughness={0.6} /></mesh>
    </group>
  );
};

const SKIN = "#f2b98f";
// main 3D simplifiée : paume arrondie, 4 doigts + pouce capsules, manchette (face = +z, doigts = +y)
export const Hand: React.FC<{ cuff?: string; scale?: number }> = ({ cuff = "#19226d", scale = 1 }) => {
  const fingers = [{ x: -0.225, l: 0.46, a: 0.1 }, { x: -0.075, l: 0.56, a: 0.03 }, { x: 0.075, l: 0.52, a: -0.03 }, { x: 0.225, l: 0.4, a: -0.1 }];
  return (
    <group scale={scale}>
      <RB p={[0, 0, 0]} s={[0.66, 0.7, 0.2]} r={0.1} color={SKIN} rough={0.55} />
      {fingers.map((f, i) => (
        <mesh key={i} position={[f.x, 0.3 + f.l / 2, 0]} rotation={[0, 0, f.a]}><capsuleGeometry args={[0.09, f.l - 0.12, 6, 14]} /><Mat color={SKIN} rough={0.55} /></mesh>
      ))}
      <mesh position={[-0.42, -0.02, 0.02]} rotation={[0, 0, 0.95]}><capsuleGeometry args={[0.1, 0.3, 6, 14]} /><Mat color={SKIN} rough={0.55} /></mesh>
      <mesh position={[0, -0.5, 0]}><cylinderGeometry args={[0.31, 0.34, 0.28, 24]} /><Mat color={cuff} rough={0.5} /></mesh>
      <mesh position={[0, -0.36, 0]}><cylinderGeometry args={[0.33, 0.33, 0.04, 24]} /><Mat color="#db4041" rough={0.5} /></mesh>
    </group>
  );
};
