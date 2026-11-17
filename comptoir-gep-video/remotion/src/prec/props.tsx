import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Mat } from "./kit";

const RB: React.FC<{ p: [number, number, number]; s: [number, number, number]; r: number; color: string; rough?: number; rot?: [number, number, number] }> = ({ p, s, r, color, rough = 0.6, rot }) => {
  const geo = useMemo(() => new RoundedBoxGeometry(s[0], s[1], s[2], 3, r), [s[0], s[1], s[2], r]); // eslint-disable-line
  return <mesh geometry={geo} position={p} rotation={rot} castShadow receiveShadow><Mat color={color} rough={rough} /></mesh>;
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
// main 3D simplifiée : paume arrondie, 4 doigts à 2 phalanges (qui se referment sur les livres), pouce, manchette (face = +z, doigts = +y)
export const Hand: React.FC<{ cuff?: string; scale?: number; curl?: number }> = ({ cuff = "#19226d", scale = 1, curl = 0.9 }) => {
  const fingers = [{ x: -0.225, l1: 0.3, l2: 0.22, a: 0.1 }, { x: -0.075, l1: 0.36, l2: 0.25, a: 0.03 }, { x: 0.075, l1: 0.34, l2: 0.24, a: -0.03 }, { x: 0.225, l1: 0.27, l2: 0.2, a: -0.1 }];
  const sk = { color: SKIN, rough: 0.5 };
  return (
    <group scale={scale}>
      <RB p={[0, 0, 0]} s={[0.66, 0.7, 0.2]} r={0.1} color={SKIN} rough={0.5} />
      {fingers.map((f, i) => (
        <group key={i} position={[f.x, 0.31, 0]} rotation={[curl * 0.3, 0, f.a]}>
          <mesh position={[0, f.l1 / 2, 0]} castShadow><capsuleGeometry args={[0.09, f.l1 - 0.02, 6, 14]} /><Mat {...sk} /></mesh>
          <group position={[0, f.l1, 0]} rotation={[curl, 0, 0]}>
            <mesh position={[0, f.l2 / 2, 0]} castShadow><capsuleGeometry args={[0.083, f.l2 - 0.02, 6, 14]} /><Mat {...sk} /></mesh>
          </group>
        </group>
      ))}
      <group position={[-0.36, -0.1, 0.03]} rotation={[curl * 0.5, 0, 0.95]}>
        <mesh position={[0, 0.17, 0]} castShadow><capsuleGeometry args={[0.1, 0.22, 6, 14]} /><Mat {...sk} /></mesh>
        <group position={[0, 0.33, 0]} rotation={[curl * 0.9, 0, 0]}><mesh position={[0, 0.1, 0]} castShadow><capsuleGeometry args={[0.092, 0.1, 6, 14]} /><Mat {...sk} /></mesh></group>
      </group>
      <mesh position={[0, -0.5, 0]} castShadow><cylinderGeometry args={[0.31, 0.34, 0.28, 28]} /><Mat color={cuff} rough={0.5} /></mesh>
      <mesh position={[0, -0.36, 0]}><cylinderGeometry args={[0.33, 0.33, 0.04, 28]} /><Mat color="#db4041" rough={0.5} /></mesh>
    </group>
  );
};
