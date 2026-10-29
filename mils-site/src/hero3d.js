// Scène 3D de l'accroche : des pièces « demande de devis » descendent une rampe,
// traversent le portail CCA et ressortent en anneaux lumineux « devis ».
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Fog, Vector2, Vector3, Quaternion, Matrix4, Object3D,
  CatmullRomCurve3, BoxGeometry, CylinderGeometry, TorusGeometry, CircleGeometry, PlaneGeometry,
  MeshStandardMaterial, MeshBasicMaterial, InstancedMesh, Mesh, Group, CanvasTexture, SRGBColorSpace,
  AdditiveBlending, DoubleSide, AmbientLight, DirectionalLight, PointLight, ACESFilmicToneMapping, MathUtils
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

const ORANGE = 0xef791f, BLUE = 0x0058a5;

export function initHero3D(canvas, { icons = [], reduced = false } = {}) {
  const small = matchMedia("(max-width: 900px)").matches;
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: !small, alpha: false, powerPreference: "high-performance" });
  } catch (e) { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new Scene();
  scene.background = new Color(0x000000);
  scene.fog = new Fog(0x000000, 14, 30);
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);

  scene.add(new AmbientLight(0xffffff, 0.25));
  const key = new DirectionalLight(0xffffff, 1.6); key.position.set(-4, 8, 6); scene.add(key);
  const rim = new DirectionalLight(0x9bbcff, 0.8); rim.position.set(6, 3, -6); scene.add(rim);
  const glow = new PointLight(ORANGE, 14, 7, 1.8); scene.add(glow);

  // ---------- Trajets ----------
  const portalPos = new Vector3(0, 0, 0);
  const upper = new CatmullRomCurve3([
    new Vector3(-3.6, 7.5, -7), new Vector3(-0.8, 6.4, -4.2), new Vector3(1.6, 4.6, -2.4),
    new Vector3(1.4, 2.6, -0.8), new Vector3(0.2, 1.3, -0.1), portalPos.clone().add(new Vector3(0, 0.25, 0))
  ]);
  const lower = new CatmullRomCurve3([
    portalPos.clone().add(new Vector3(0, -0.25, 0)), new Vector3(0.5, -1.5, 0.5), new Vector3(1.9, -3.0, 0.4),
    new Vector3(2.6, -4.6, -0.6), new Vector3(1.6, -6.4, -2.4), new Vector3(-0.5, -7.8, -4.5)
  ]);
  glow.position.copy(portalPos).add(new Vector3(0, 0.4, 1.2));

  // ---------- Rampes en dalles ----------
  const tileGeo = new BoxGeometry(1.5, 0.08, 0.2);
  const tileMat = new MeshStandardMaterial({ color: 0x2a2c32, metalness: 0.6, roughness: 0.4 });
  const edgeMat = new MeshBasicMaterial({ color: 0x2a2c33 });
  const dummy = new Object3D(), up = new Vector3(0, 1, 0);
  function buildTrack(curve, skipStart = 0, skipEnd = 0) {
    const count = Math.round(curve.getLength() * (1 - skipStart - skipEnd) / 0.27);
    const tiles = new InstancedMesh(tileGeo, tileMat, count);
    const rails = new InstancedMesh(new BoxGeometry(0.05, 0.14, 0.22), edgeMat, count * 2);
    let n = 0, r = 0;
    for (let i = 0; i < count; i++) {
      const t = skipStart + (1 - skipStart - skipEnd) * (i / (count - 1));
      const p = curve.getPointAt(t), tan = curve.getTangentAt(t);
      const side = new Vector3().crossVectors(tan, up).normalize();
      const nrm = new Vector3().crossVectors(side, tan).normalize();
      const m = new Matrix4().makeBasis(side, nrm, tan.clone().negate());
      dummy.position.copy(p).addScaledVector(nrm, -0.55);
      dummy.quaternion.setFromRotationMatrix(m);
      dummy.updateMatrix(); tiles.setMatrixAt(n++, dummy.matrix);
      for (const s of [-1, 1]) {
        dummy.position.copy(p).addScaledVector(nrm, -0.48).addScaledVector(side, s * 0.75);
        dummy.updateMatrix(); rails.setMatrixAt(r++, dummy.matrix);
      }
    }
    scene.add(tiles, rails);
  }
  buildTrack(upper, 0, 0.06);
  buildTrack(lower, 0.06, 0);

  // ---------- Portail CCA (anneau hexagonal + voile lumineux) ----------
  const portal = new Group();
  portal.position.copy(portalPos);
  portal.rotation.x = -1.18; portal.rotation.z = 0.08;
  const ring = new Mesh(new TorusGeometry(1.25, 0.075, 16, 6), new MeshBasicMaterial({ color: ORANGE }));
  ring.material.color.multiplyScalar(1.8);
  ring.rotation.z = Math.PI / 6;
  const ring2 = new Mesh(new TorusGeometry(1.42, 0.02, 8, 6), new MeshBasicMaterial({ color: BLUE }));
  ring2.material.color.multiplyScalar(2.2);
  ring2.rotation.z = Math.PI / 6;
  const veilTex = radialTexture();
  const veil = new Mesh(new CircleGeometry(1.2, 6), new MeshBasicMaterial({ map: veilTex, transparent: true, blending: AdditiveBlending, depthWrite: false, side: DoubleSide }));
  veil.rotation.z = Math.PI / 6;
  portal.add(ring, ring2, veil);
  scene.add(portal);

  // ---------- Pièces « demande » ----------
  const coinGeo = new CylinderGeometry(0.5, 0.5, 0.13, 48, 1);
  coinGeo.rotateX(Math.PI / 2); // face vers +Z
  const sideMat = new MeshStandardMaterial({ color: 0x2b2d33, metalness: 0.95, roughness: 0.28 });
  const faceMats = (icons.length ? icons : [null]).map(path => new MeshStandardMaterial({
    color: 0x18191d, metalness: 0.85, roughness: 0.35,
    emissive: 0xffffff, emissiveIntensity: 1.0, emissiveMap: iconTexture(path)
  }));
  const COINS = small ? 5 : 7, RINGS = small ? 5 : 7;
  const coins = Array.from({ length: COINS }, (_, i) => {
    const fm = faceMats[i % faceMats.length];
    const m = new Mesh(coinGeo, [sideMat, fm, fm]);
    scene.add(m); return m;
  });

  // ---------- Anneaux « devis » ----------
  const ringGeo = new TorusGeometry(0.42, 0.06, 16, 64);
  const ringMats = [new MeshBasicMaterial({ color: new Color(ORANGE).multiplyScalar(1.6) }), new MeshBasicMaterial({ color: new Color(0x3f8fe0).multiplyScalar(1.8) })];
  const rings = Array.from({ length: RINGS }, (_, i) => { const m = new Mesh(ringGeo, ringMats[i % 3 === 2 ? 1 : 0]); scene.add(m); return m; });

  // ---------- Post-traitement : halo ----------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new Vector2(1, 1), small ? 0.6 : 0.75, 0.45, 0.55);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---------- Cadrage ----------
  const target = new Vector3(0.3, -0.3, 0);
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h); bloom.setSize(w, h);
    camera.aspect = w / h;
    const portrait = w / h < 1;
    camera.position.set(portrait ? 1.0 : -2.6, portrait ? 5 : 4.2, portrait ? 25 : 17);
    // en paysage, la scène se place à droite du texte
    camera.setViewOffset(w, h, portrait ? -w * 0.04 : -w * 0.22, portrait ? h * 0.2 : 0, w, h);
    camera.updateProjectionMatrix();
    camera.lookAt(target);
  }
  resize(); addEventListener("resize", resize);

  // ---------- Animation ----------
  const pointer = new Vector2(), smooth = new Vector2();
  addEventListener("pointermove", e => pointer.set(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1), { passive: true });
  const T_UP = 4.2, T_LOW = 3.4, GAP = 1.05, upLen = upper.getLength(), lowLen = lower.getLength();
  const q = new Quaternion(), roll = new Quaternion(), tmp = new Vector3();
  let speed = 1, boost = 0, clock = 6.6, last = performance.now(), visible = true, raf = 0;

  function placeOnCurve(obj, curve, t, len) {
    const p = curve.getPointAt(t), tan = curve.getTangentAt(t);
    const side = new Vector3().crossVectors(tan, up).normalize();
    const nrm = new Vector3().crossVectors(side, tan).normalize();
    obj.position.copy(p);
    // la pièce roule : son axe (Z local) suit le côté de la rampe
    const m = new Matrix4().makeBasis(tan, nrm, side);
    q.setFromRotationMatrix(m);
    roll.setFromAxisAngle(tmp.set(0, 0, 1), -(t * len) / 0.5);
    obj.quaternion.copy(q).multiply(roll);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!visible) { last = now; return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    boost = Math.max(0, boost - dt * 0.6);
    clock += dt * (speed + boost * 2);
    smooth.lerp(pointer, 0.05);
    camera.lookAt(target.x + smooth.x * 0.6, target.y - smooth.y * 0.4, target.z);
    animate(clock, now / 1000);
    composer.render();
  }
  function animate(c, t) {
    const cycle = COINS * GAP;
    coins.forEach((coin, i) => {
      const local = ((c - i * GAP) % cycle + cycle) % cycle;
      const u = local / T_UP;
      if (u <= 1) {
        coin.visible = true;
        placeOnCurve(coin, upper, MathUtils.smoothstep(u, 0, 1) * 0.15 + u * 0.85, upLen);
        // en entrant dans le portail, la pièce se dissout
        const s = u > 0.93 ? 1 - (u - 0.93) / 0.07 : 1;
        coin.scale.setScalar(Math.max(0.001, s));
      } else coin.visible = false;
    });
    rings.forEach((r, i) => {
      const local = ((c - i * GAP - T_UP) % cycle + cycle) % cycle;
      const u = local / T_LOW;
      if (u <= 1 && c > T_UP + i * GAP - 0.001) {
        r.visible = true;
        placeOnCurve(r, lower, u, lowLen);
        const s = u < 0.08 ? u / 0.08 : 1; r.scale.setScalar(Math.max(0.001, s));
      } else r.visible = false;
    });
    const pulse = 1 + Math.sin(t * 3) * 0.04;
    ring.scale.setScalar(pulse); veil.material.opacity = 0.55 + Math.sin(t * 2.2) * 0.12;
    ring2.rotation.z = Math.PI / 6 + t * 0.15;
    glow.intensity = 12 + Math.sin(t * 3) * 3;
  }

  new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(canvas);
  if (reduced) { animate(clock, 0); composer.render(); }
  else raf = requestAnimationFrame(frame);

  return {
    boost() { boost = 1.2; },
    dispose() { cancelAnimationFrame(raf); renderer.dispose(); }
  };
}

function radialTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d"), r = g.createRadialGradient(128, 128, 4, 128, 128, 128);
  r.addColorStop(0, "rgba(255,240,225,1)"); r.addColorStop(0.35, "rgba(239,121,31,.85)");
  r.addColorStop(0.75, "rgba(0,88,165,.35)"); r.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
}

// Picto au trait sur la face de la pièce (chemin SVG 24×24).
function iconTexture(path) {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#000"; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "#ef791f"; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 112, 0, Math.PI * 2); g.stroke();
  if (path) {
    g.save(); g.translate(68, 68); g.scale(5, 5);
    g.strokeStyle = "#ffffff"; g.lineWidth = 1.6; g.lineCap = "round"; g.lineJoin = "round";
    g.stroke(new Path2D(path)); g.restore();
  }
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
}
