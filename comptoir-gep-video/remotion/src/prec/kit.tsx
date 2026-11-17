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
    <ambientLight intensity={1.15} />
    <hemisphereLight args={["#ffffff", "#cfd6ea", 0.85]} />
    <directionalLight position={[6, 10, 7]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-camera-near={1} shadow-camera-far={40} shadow-bias={-0.0004} shadow-radius={6} />
    <directionalLight position={[-7, 4, -4]} intensity={0.6} color="#cfd9ff" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow><planeGeometry args={[60, 60]} /><shadowMaterial transparent opacity={0.16} /></mesh>
    {shadowTex && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[shadow[0], 0.004, 0]}><planeGeometry args={[shadow[1] * 2, shadow[2] * 2]} /><meshBasicMaterial map={shadowTex} transparent depthWrite={false} /></mesh>}
  </>
);

type MP = { color: string; opacity?: number; emissive?: string; ei?: number; rough?: number; metal?: number };
export const Mat: React.FC<MP> = ({ color, opacity = 1, emissive, ei = 0, rough = 0.85, metal = 0.05 }) => (
  <meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} emissive={emissive || "#000000"} emissiveIntensity={ei} roughness={rough} metalness={metal} depthWrite={opacity >= 1} />
);

import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
const RoundedBox: React.FC<{ s: [number, number, number] }> = ({ s }) => {
  const g = useMemo(() => new RoundedBoxGeometry(s[0], s[1], s[2], 3, Math.min(0.045, Math.min(...s) * 0.3)), [s[0], s[1], s[2]]); // eslint-disable-line
  return <primitive object={g} attach="geometry" />;
};
export const Block: React.FC<{ p: [number, number, number]; s: [number, number, number]; m: MP; rot?: [number, number, number] }> = ({ p, s, m, rot }) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow><RoundedBox s={s} /><Mat {...m} /></mesh>
);

// cylindre entre deux points
export const Rod: React.FC<{ a: [number, number, number]; b: [number, number, number]; r: number; m: MP }> = ({ a, b, r, m }) => {
  const { pos, q, len } = useMemo(() => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const d = B.clone().sub(A); const len = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    return { pos: A.clone().add(B).multiplyScalar(0.5), q, len };
  }, [a[0], a[1], a[2], b[0], b[1], b[2]]); // eslint-disable-line
  if (len < 0.001) return null;
  return <mesh position={pos} quaternion={q} castShadow receiveShadow><cylinderGeometry args={[r, r, len, 16]} /><Mat {...m} /></mesh>;
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
  return <mesh geometry={geo} position={[0, y, 0]} castShadow receiveShadow><Mat {...m} /></mesh>;
};
export const sagAt = (x: number, L: number, sag: number) => { const u = x / (L / 2); return -sag * (1 - u * u); };

// ───────── pyramide tronquée (support) : p = centre, s = [largeur base, hauteur, profondeur base] ─────────
export const Pyr: React.FC<{ p: [number, number, number]; s: [number, number, number]; top?: number; m: MP }> = ({ p, s, top = 0.5, m }) => {
  const geo = useMemo(() => { const g = new THREE.CylinderGeometry(0.7071 * top, 0.7071, 1, 4, 1); g.rotateY(Math.PI / 4); return g; }, [top]);
  return <mesh geometry={geo} position={p} scale={s} castShadow receiveShadow><Mat {...m} /></mesh>;
};
// entonnoir (pyramide inversée) pour le coulage
export const Funnel: React.FC<{ p: [number, number, number]; size: number; h: number; rot?: [number, number, number]; color: string }> = ({ p, size, h, rot, color }) => {
  const geo = useMemo(() => { const g = new THREE.CylinderGeometry(0.7071, 0.7071 * 0.28, 1, 4, 1, true); g.rotateY(Math.PI / 4); return g; }, []);
  return <mesh geometry={geo} position={p} rotation={rot} scale={[size, h, size]}><meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.5} /></mesh>;
};
// béton liquide : surface ondulée
export const Liquid: React.FC<{ w: number; d: number; y0: number; level: number; t: number; color: string; wave?: number; x?: number }> = ({ w, d, y0, level, t, color, wave = 1, x = 0 }) => {
  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(w, Math.max(level, 0.001), d, 36, 1, 8); const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) if (pos.getY(i) > 0) pos.setY(i, pos.getY(i) + wave * (0.022 * Math.sin(pos.getX(i) * 4 + t * 5) + 0.016 * Math.cos(pos.getZ(i) * 7 + t * 4)));
    pos.needsUpdate = true; g.computeVertexNormals(); return g;
  }, [w, d, level, t, wave]);
  if (level < 0.005) return null;
  return <mesh geometry={geo} position={[x, y0 + level / 2, 0]}><meshStandardMaterial color={color} roughness={0.35} metalness={0.05} /></mesh>;
};

// cône tronqué (support « argile blanche »)
export const Cone: React.FC<{ p: [number, number, number]; rBot: number; rTop: number; h: number; color?: string; opacity?: number }> = ({ p, rBot, rTop, h, color = "#f2f3f8", opacity = 1 }) => (
  <mesh position={p} castShadow receiveShadow><cylinderGeometry args={[rTop, rBot, h, 64, 1]} /><Mat color={color} opacity={opacity} rough={0.92} /></mesh>
);

// masse « KG » (symbole de poids) : trapèze arrondi, anneau, étiquette KG
const kgTex = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas"); c.width = 256; c.height = 160; const g = c.getContext("2d")!;
  g.clearRect(0, 0, 256, 160); g.fillStyle = "#ffffff"; g.font = "900 120px Montserrat, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("KG", 128, 86);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
})();
export const Weight: React.FC<{ p: [number, number, number]; s?: number; color?: string; rot?: [number, number, number] }> = ({ p, s = 1, color = "#1d2146", rot }) => {
  const geo = useMemo(() => {
    const sh = new THREE.Shape(); sh.moveTo(-0.5, 0); sh.lineTo(0.5, 0); sh.lineTo(0.32, 0.78); sh.lineTo(-0.32, 0.78); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.42, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 4, steps: 1 });
    g.translate(0, 0, -0.21); g.computeVertexNormals(); return g;
  }, []);
  return (
    <group position={p} scale={s} rotation={rot}>
      <mesh geometry={geo} castShadow receiveShadow><Mat color={color} rough={0.45} metal={0.15} /></mesh>
      <mesh position={[0, 0.9, 0]} castShadow><torusGeometry args={[0.2, 0.06, 18, 40]} /><Mat color={color} rough={0.4} metal={0.2} /></mesh>
      <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.13, 0.17, 0.06, 20]} /><Mat color={color} rough={0.4} /></mesh>
      {kgTex && <mesh position={[0, 0.4, 0.274]}><planeGeometry args={[0.6, 0.375]} /><meshBasicMaterial map={kgTex} transparent /></mesh>}
    </group>
  );
};
