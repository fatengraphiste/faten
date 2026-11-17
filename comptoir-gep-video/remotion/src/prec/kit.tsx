import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export const COL = { concrete: "#d8dce3", concreteD: "#b3b9c5", steel: "#aab4c6", navy: "#19226d", navyL: "#5a6ad8", blue: "#8aa6ff", red: "#db4041", bg: "#f3f5f9", white: "#ffffff", wood: "#d9dde6" };
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eo = (x: number) => 1 - Math.pow(1 - x, 3);
export const eb = (x: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const k = (t: number, a: number, b: number) => eio(clamp((t - a) / (b - a)));
export const ko = (t: number, a: number, b: number) => eo(clamp((t - a) / (b - a)));
export const kb = (t: number, a: number, b: number) => eb(clamp((t - a) / (b - a)));

// ───────── caméra déterministe (partagée entre le rendu 3D et la projection des étiquettes) ─────────
export type Cam = { pos: [number, number, number]; target: [number, number, number]; fov: number };
export const orbit = (az: number, el: number, r: number, target: [number, number, number], fov = 34): Cam => ({
  pos: [target[0] + r * Math.cos(el) * Math.sin(az), target[1] + r * Math.sin(el), target[2] + r * Math.cos(el) * Math.cos(az)], target, fov,
});
export const Rig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...cam.pos); camera.fov = cam.fov; camera.lookAt(new THREE.Vector3(...cam.target)); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  });
  return null;
};
export const project = (cam: Cam, p: [number, number, number], W = 1080, H = 1920): [number, number] => {
  const c = new THREE.PerspectiveCamera(cam.fov, W / H, 0.1, 200);
  c.position.set(...cam.pos); c.lookAt(new THREE.Vector3(...cam.target)); c.updateMatrixWorld(); c.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(c);
  return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H];
};

// ───────── décor ─────────
const shadowTex = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d")!; const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  gr.addColorStop(0, "rgba(25,34,109,0.22)"); gr.addColorStop(1, "rgba(25,34,109,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); return t;
})();
export const Stage: React.FC<{ shadow?: [number, number, number] }> = ({ shadow = [0, 3.4, 1.6] }) => (
  <>
    <ambientLight intensity={1.35} />
    <hemisphereLight args={["#ffffff", "#c8d0e6", 0.9]} />
    <directionalLight position={[5, 9, 6]} intensity={2.1} />
    <directionalLight position={[-6, 4, -3]} intensity={0.7} color="#cfd9ff" />
    {shadowTex && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[shadow[0], 0.005, 0]}><planeGeometry args={[shadow[1] * 2, shadow[2] * 2]} /><meshBasicMaterial map={shadowTex} transparent depthWrite={false} /></mesh>}
  </>
);

type MP = { color: string; opacity?: number; emissive?: string; ei?: number; rough?: number; metal?: number };
export const Mat: React.FC<MP> = ({ color, opacity = 1, emissive, ei = 0, rough = 0.85, metal = 0.05 }) => (
  <meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} emissive={emissive || "#000000"} emissiveIntensity={ei} roughness={rough} metalness={metal} depthWrite={opacity >= 1} />
);

export const Block: React.FC<{ p: [number, number, number]; s: [number, number, number]; m: MP; rot?: [number, number, number] }> = ({ p, s, m, rot }) => (
  <mesh position={p} rotation={rot}><boxGeometry args={s} /><Mat {...m} /></mesh>
);

// cylindre entre deux points
export const Rod: React.FC<{ a: [number, number, number]; b: [number, number, number]; r: number; m: MP }> = ({ a, b, r, m }) => {
  const { pos, q, len } = useMemo(() => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const d = B.clone().sub(A); const len = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    return { pos: A.clone().add(B).multiplyScalar(0.5), q, len };
  }, [a[0], a[1], a[2], b[0], b[1], b[2]]); // eslint-disable-line
  if (len < 0.001) return null;
  return <mesh position={pos} quaternion={q}><cylinderGeometry args={[r, r, len, 14]} /><Mat {...m} /></mesh>;
};

// flèche 3D : base en p, direction dir, longueur len
export const Arrow3D: React.FC<{ p: [number, number, number]; dir: [number, number, number]; len: number; color: string; r?: number }> = ({ p, dir, len, color, r = 0.07 }) => {
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...dir).normalize()), [dir[0], dir[1], dir[2]]); // eslint-disable-line
  if (len < 0.05) return null;
  const head = Math.min(0.42, len * 0.45); const shaft = Math.max(0.01, len - head);
  return (
    <group position={p} quaternion={q}>
      <mesh position={[0, shaft / 2, 0]}><cylinderGeometry args={[r, r, shaft, 14]} /><Mat color={color} rough={0.5} emissive={color} ei={0.25} /></mesh>
      <mesh position={[0, shaft + head / 2, 0]}><coneGeometry args={[r * 2.5, head, 16]} /><Mat color={color} rough={0.5} emissive={color} ei={0.25} /></mesh>
    </group>
  );
};

// poutre qui fléchit (sag > 0 => vers le bas) ; camber > 0 => cambrure vers le haut
export const Beam: React.FC<{ L: number; h: number; d: number; sag?: number; m: MP; y?: number }> = ({ L, h, d, sag = 0, m, y = 0 }) => {
  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(L, h, d, 56, 3, 3); const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i); const u = x / (L / 2); pos.setY(i, pos.getY(i) - sag * (1 - u * u)); }
    pos.needsUpdate = true; g.computeVertexNormals(); return g;
  }, [L, h, d, sag]);
  return <mesh geometry={geo} position={[0, y, 0]}><Mat {...m} /></mesh>;
};
export const sagAt = (x: number, L: number, sag: number) => { const u = x / (L / 2); return -sag * (1 - u * u); };
