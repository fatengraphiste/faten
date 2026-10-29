// Scène 3D de toute la page : une rampe descend du haut de la page jusqu'à la machine.
// Chaque pièce métal attend sur la rampe ; au clic, elle traverse un portail CCA
// et ressort en pièce de machine rangée dans le rack de stockage. En bas, la machine
// reçoit les 6 pièces puis transforme les demandes en devis.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Fog, Vector2, Vector3, Quaternion, Matrix4, Object3D,
  CatmullRomCurve3, BoxGeometry, CylinderGeometry, TorusGeometry, CircleGeometry, PlaneGeometry, SphereGeometry,
  ShapeGeometry, Shape, BufferGeometry, EdgesGeometry, LineSegments, Line, LineLoop, LineBasicMaterial,
  MeshStandardMaterial, MeshBasicMaterial, InstancedMesh, Mesh, Group, CanvasTexture, SRGBColorSpace,
  AdditiveBlending, DoubleSide, AmbientLight, DirectionalLight, PointLight, ACESFilmicToneMapping, Raycaster
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

const ORANGE = 0xef791f, BLUE_L = 0x3f8fe0;
const SEC = 9;                                  // hauteur monde d'une section
const Y_MACHINE = -7 * SEC - 1.5;               // la machine, au niveau du lancement
const PIECE_LEVEL = { marque: 2, site: 3, rfq: 4, crm: 5, visi: 6, prosp: 6 };
const ORDER = ["marque", "site", "rfq", "crm", "visi", "prosp"];
const UP = new Vector3(0, 1, 0);
const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const easeIn = (p) => p * p * p;
const easeOut = (p) => 1 - Math.pow(1 - p, 3);

export function initScene(canvas, { icons = {}, reduced = false, milsLogo = null } = {}) {
  const small = matchMedia("(max-width: 900px)").matches;
  let renderer;
  try { renderer = new WebGLRenderer({ canvas, antialias: !small, powerPreference: "high-performance" }); }
  catch (e) { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.toneMapping = ACESFilmicToneMapping;

  const scene = new Scene();
  scene.background = new Color(0x000000);
  scene.fog = new Fog(0x000000, 12, 30);
  const camera = new PerspectiveCamera(32, 1, 0.1, 120);
  scene.add(new AmbientLight(0xffffff, 0.3));
  const key = new DirectionalLight(0xffffff, 1.5); key.position.set(-4, 8, 6); scene.add(key, key.target);
  const rim = new DirectionalLight(0x9bbcff, 0.7); rim.position.set(6, 3, -6); scene.add(rim, rim.target);

  // ---------- Rampe : un serpentin du haut de la page jusqu'à la machine ----------
  const lane = (y) => new Vector3(1.7 * Math.sin(y * 0.33), y, 0.9 * Math.cos(y * 0.33) - 0.4);
  const pts = [new Vector3(-5, 10, -7), new Vector3(-2.6, 8, -3.6)];
  for (let y = 6.5; y >= Y_MACHINE + 3; y -= 1.5) pts.push(lane(y));
  const machinePos = lane(Y_MACHINE + 3).setY(Y_MACHINE - 1.4).setZ(0);
  pts.push(new Vector3(machinePos.x, Y_MACHINE + 1.0, 0));
  const curve = new CatmullRomCurve3(pts);
  const LEN = curve.getLength();
  const samples = Array.from({ length: 1200 }, (_, i) => curve.getPointAt(i / 1199).y);
  const tAtY = (y) => { let best = 0, d = Infinity; samples.forEach((v, i) => { const e = Math.abs(v - y); if (e < d) { d = e; best = i; } }); return best / 1199; };

  const frameAt = (t) => {
    const p = curve.getPointAt(t), tan = curve.getTangentAt(t);
    const side = new Vector3().crossVectors(tan, UP).normalize();
    const nrm = new Vector3().crossVectors(side, tan).normalize();
    return { p, tan, side, nrm };
  };
  (function buildTrack() {
    const count = Math.round(LEN / 0.27);
    const tiles = new InstancedMesh(new BoxGeometry(1.5, 0.08, 0.2), new MeshStandardMaterial({ color: 0x2a2c32, metalness: 0.6, roughness: 0.4 }), count);
    const rails = new InstancedMesh(new BoxGeometry(0.05, 0.14, 0.22), new MeshBasicMaterial({ color: 0x33363e }), count * 2);
    const d = new Object3D(); let r = 0;
    for (let i = 0; i < count; i++) {
      const { p, tan, side, nrm } = frameAt(i / (count - 1));
      d.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(side, nrm, tan.clone().negate()));
      d.position.copy(p).addScaledVector(nrm, -0.55); d.updateMatrix(); tiles.setMatrixAt(i, d.matrix);
      for (const s of [-1, 1]) { d.position.copy(p).addScaledVector(nrm, -0.48).addScaledVector(side, s * 0.75); d.updateMatrix(); rails.setMatrixAt(r++, d.matrix); }
    }
    scene.add(tiles, rails);
  })();

  // Pièce qui roule : axe de la pièce selon le côté de la rampe.
  const q = new Quaternion(), roll = new Quaternion(), zAxis = new Vector3(0, 0, 1);
  function placeOnCurve(obj, t) {
    const { p, tan, side, nrm } = frameAt(Math.min(1, Math.max(0, t)));
    obj.position.copy(p);
    q.setFromRotationMatrix(new Matrix4().makeBasis(tan, nrm, side));
    roll.setFromAxisAngle(zAxis, -(t * LEN) / 0.5);
    obj.quaternion.copy(q).multiply(roll);
  }

  // ---------- Matériaux et textures ----------
  const iconTex = (path, ring = true) => {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    g.fillStyle = "#000"; g.fillRect(0, 0, 256, 256);
    if (ring) { g.strokeStyle = "#ef791f"; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 112, 0, Math.PI * 2); g.stroke(); }
    if (path) { g.save(); g.translate(68, 68); g.scale(5, 5); g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = g.lineJoin = "round"; g.stroke(new Path2D(path)); g.restore(); }
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
  };
  const radialTex = () => {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    const r = g.createRadialGradient(128, 128, 4, 128, 128, 128);
    r.addColorStop(0, "rgba(255,240,225,1)"); r.addColorStop(0.35, "rgba(239,121,31,.85)"); r.addColorStop(0.75, "rgba(0,88,165,.35)"); r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r; g.fillRect(0, 0, 256, 256); const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
  };
  const VEIL = radialTex();
  const coinGeo = new CylinderGeometry(0.5, 0.5, 0.13, 48); coinGeo.rotateX(Math.PI / 2);
  const coinSide = new MeshStandardMaterial({ color: 0x2b2d33, metalness: 0.95, roughness: 0.28 });
  const faceMat = (path) => new MeshStandardMaterial({ color: 0x18191d, metalness: 0.85, roughness: 0.35, emissive: 0xffffff, emissiveIntensity: 1, emissiveMap: iconTex(path) });
  const makeCoin = (path) => { const f = faceMat(path); return new Mesh(coinGeo, [coinSide, f, f]); };
  const hexGeo = new CylinderGeometry(0.42, 0.42, 0.16, 6); hexGeo.rotateX(Math.PI / 2); hexGeo.rotateZ(Math.PI / 6);
  const hexSide = new MeshStandardMaterial({ color: ORANGE, emissive: ORANGE, emissiveIntensity: 0.9, metalness: 0.6, roughness: 0.3 });
  const makeTile = (path) => { const f = new MeshStandardMaterial({ color: 0x111215, emissive: 0xffffff, emissiveIntensity: 1.1, emissiveMap: iconTex(path, false), metalness: 0.5, roughness: 0.4 }); return new Mesh(hexGeo, [hexSide, f, f]); };
  const ringGeo = new TorusGeometry(0.42, 0.06, 16, 48);
  const ringMats = [new MeshBasicMaterial({ color: new Color(ORANGE).multiplyScalar(1.6) }), new MeshBasicMaterial({ color: new Color(BLUE_L).multiplyScalar(1.6) })];

  function makePortal(r) {
    const g = new Group();
    const ring = new Mesh(new TorusGeometry(r, 0.07, 16, 6), new MeshBasicMaterial({ color: new Color(ORANGE).multiplyScalar(1.8) }));
    const ring2 = new Mesh(new TorusGeometry(r * 1.13, 0.018, 8, 6), new MeshBasicMaterial({ color: new Color(BLUE_L).multiplyScalar(1.6) }));
    const veil = new Mesh(new CircleGeometry(r * 0.96, 6), new MeshBasicMaterial({ map: VEIL, transparent: true, opacity: 0.5, blending: AdditiveBlending, depthWrite: false, side: DoubleSide }));
    for (const m of [ring, ring2, veil]) m.rotation.z = Math.PI / 6;
    g.add(ring, ring2, veil); g.userData = { ring, ring2, veil, flash: 0 };
    return g;
  }
  function portalAt(t, r) {
    const p = makePortal(r), { p: pos, tan } = frameAt(t);
    // portail incliné vers la caméra pour qu'on voie l'anneau, pas sa tranche
    p.position.copy(pos); p.quaternion.setFromUnitVectors(zAxis, tan.clone().add(new Vector3(0, 0.2, 1.7)).normalize());
    scene.add(p); return p;
  }
  const portals = [];

  // ---------- Accroche : flux continu à travers le grand portail ----------
  const heroPortalT = tAtY(0.2), heroEndT = tAtY(-5.5), heroStartT = 0.0;
  const heroPortal = portalAt(heroPortalT, 1.25); portals.push(heroPortal);
  const heroLight = new PointLight(ORANGE, 12, 7, 1.8); heroLight.position.copy(heroPortal.position).add(new Vector3(0, 0.3, 1.2)); scene.add(heroLight);
  const HERO_N = small ? 5 : 6, GAP = 1.05, T_UP = 3.6, T_LOW = 2.6;
  const heroCoins = Array.from({ length: HERO_N }, (_, i) => { const m = makeCoin(icons[ORDER[i % 6]]); scene.add(m); return m; });
  const heroRings = Array.from({ length: HERO_N }, (_, i) => { const m = new Mesh(ringGeo, ringMats[i % 3 === 2 ? 1 : 0]); scene.add(m); return m; });

  // ---------- Carte du Burkina Faso (section défi) ----------
  const BF = [[-5.5,10.4],[-4.8,9.9],[-4.3,9.6],[-3.6,9.9],[-2.8,9.6],[-2.7,10.4],[-2.9,11.0],[-1.5,11.0],[-0.6,11.0],[0.0,11.1],[0.4,11.0],[0.9,11.0],[1.4,11.4],[2.1,11.6],[2.4,12.3],[2.1,12.7],[1.6,12.6],[1.0,13.0],[0.5,13.6],[0.2,14.5],[-0.5,15.1],[-1.1,15.0],[-2.0,14.2],[-2.9,13.6],[-3.4,13.3],[-4.1,13.2],[-4.4,12.6],[-5.0,11.9],[-5.4,11.4]];
  const mapG = new Group(); mapG.position.set(0.6, -SEC - 0.4, -3.4);
  const MS = 0.6, mp = BF.map(([lo, la]) => new Vector3((lo + 1.5) * MS, (la - 12.3) * MS, 0));
  const mapLine = new Line(new BufferGeometry().setFromPoints([...mp, mp[0]]), new LineBasicMaterial({ color: new Color(ORANGE).multiplyScalar(1.5) }));
  const shape = new Shape(mp.map((v) => new Vector2(v.x, v.y)));
  const mapFill = new Mesh(new ShapeGeometry(shape), new MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0.07, depthWrite: false }));
  const pinPos = new Vector3((-1.52 + 1.5) * MS, (12.37 - 12.3) * MS, 0.02);
  const pin = new Mesh(new SphereGeometry(0.09, 16, 16), new MeshBasicMaterial({ color: new Color(ORANGE).multiplyScalar(2) })); pin.position.copy(pinPos);
  const pinRing = new Mesh(new TorusGeometry(0.2, 0.012, 8, 48), new MeshBasicMaterial({ color: ORANGE, transparent: true })); pinRing.position.copy(pinPos);
  mapG.add(mapFill, mapLine, pin, pinRing); scene.add(mapG);
  let mapDraw = 0; mapLine.geometry.setDrawRange(0, 0);

  // ---------- Pièces de la machine, garées sur la rampe ----------
  const pieces = {};
  ORDER.forEach((k) => {
    const lvl = PIECE_LEVEL[k], yPortal = -lvl * SEC - 1.2;
    const extra = k === "prosp" ? 1.4 : 0;
    const tPortal = tAtY(yPortal), tPark = tAtY(yPortal + 2.2 + extra);
    if (k !== "prosp") portals.push(portalAt(tPortal, 0.85));
    const coin = makeCoin(icons[k]); coin.userData.key = k; scene.add(coin);
    placeOnCurve(coin, tPark);
    pieces[k] = { coin, tPark, tPortal, state: "parked", portal: k === "prosp" ? portals[portals.length - 1] : portals[portals.length - 1] };
  });

  // ---------- Rack de stockage (suit la caméra) ----------
  const rack = new Group();
  const plate = new Mesh(new BoxGeometry(2.9, 2.0, 0.1), new MeshStandardMaterial({ color: 0x15161a, metalness: 0.8, roughness: 0.35 }));
  const plateEdge = new LineSegments(new EdgesGeometry(plate.geometry), new LineBasicMaterial({ color: 0x3a3d46 }));
  rack.add(plate, plateEdge);
  const sockets = ORDER.map((k, i) => {
    const s = new Group(); s.position.set(-0.9 + (i % 3) * 0.9, 0.42 - Math.floor(i / 3) * 0.86, 0.08);
    const ring = new Mesh(new TorusGeometry(0.46, 0.022, 8, 6), new MeshBasicMaterial({ color: 0x4a4d57 })); ring.rotation.z = Math.PI / 6;
    s.add(ring); s.userData.ring = ring; rack.add(s); return s;
  });
  rack.scale.setScalar(0.85); rack.visible = false; scene.add(rack);

  // ---------- La machine ----------
  const machine = new Group(); machine.position.copy(machinePos);
  const bodyMat = new MeshStandardMaterial({ color: 0x1d1f24, metalness: 0.85, roughness: 0.32 });
  const body = new Mesh(new BoxGeometry(3.6, 2.8, 2.2), bodyMat);
  const edges = new LineSegments(new EdgesGeometry(body.geometry), new LineBasicMaterial({ color: 0x3a3d46 }));
  const stripMat = new MeshBasicMaterial({ color: new Color(ORANGE).multiplyScalar(0.6) });
  const strip = new Mesh(new BoxGeometry(3.62, 0.05, 0.05), stripMat); strip.position.set(0, 1.42, 1.11);
  const strip2 = strip.clone(); strip2.position.y = -1.42;
  const funnel = new Mesh(new CylinderGeometry(0.85, 0.5, 0.7, 6, 1, true), new MeshStandardMaterial({ color: 0x2a2c32, metalness: 0.8, roughness: 0.3, side: DoubleSide }));
  funnel.position.set(0, 1.75, 0);
  machine.add(body, edges, strip, strip2, funnel);
  const leds = Array.from({ length: 6 }, (_, i) => { const m = new Mesh(new SphereGeometry(0.06, 12, 12), new MeshBasicMaterial({ color: 0x3a3d46 })); m.position.set(-1.25 + i * 0.22, 1.18, 1.12); machine.add(m); return m; });
  const mSockets = ORDER.map((k, i) => {
    const s = new Group(); s.position.set(-0.95 + (i % 3) * 0.95, 0.05 - Math.floor(i / 3) * 0.9, 1.12);
    const ring = new Mesh(new TorusGeometry(0.46, 0.025, 8, 6), new MeshBasicMaterial({ color: 0x4a4d57 })); ring.rotation.z = Math.PI / 6;
    s.add(ring); s.userData.ring = ring; machine.add(s); return s;
  });
  if (milsLogo) {
    const img = new Image(); img.src = milsLogo;
    const tex = new CanvasTexture(img); tex.colorSpace = SRGBColorSpace;
    img.onload = () => { tex.needsUpdate = true; };
    const logoPlate = new Mesh(new PlaneGeometry(1.15, 0.4), new MeshBasicMaterial({ map: tex }));
    logoPlate.position.set(0.95, 1.13, 1.111); machine.add(logoPlate);
  }
  // goulotte de sortie + bac de devis en verre
  const chute = new Mesh(new BoxGeometry(1.4, 0.08, 0.9), bodyMat); chute.position.set(2.35, -0.9, 0.3); chute.rotation.z = -0.45; machine.add(chute);
  const bin = new Group(); bin.position.set(3.75, -1.55, 0.3);
  const binBox = new BoxGeometry(2.0, 1.4, 1.5);
  bin.add(new Mesh(binBox, new MeshStandardMaterial({ color: 0x9bbcff, transparent: true, opacity: 0.06, metalness: 0.2, roughness: 0.05, depthWrite: false })));
  bin.add(new LineSegments(new EdgesGeometry(binBox), new LineBasicMaterial({ color: 0x5a5f6b })));
  machine.add(bin);
  const machineLight = new PointLight(ORANGE, 0, 8, 1.6); machineLight.position.set(0, 0.5, 2.4); machine.add(machineLight);
  scene.add(machine);
  const pile = []; // devis empilés dans le bac
  const pileSpot = (i) => new Vector3(-0.6 + (i % 4) * 0.4 + ((i >> 2) % 2) * 0.2, -0.55 + Math.floor(i / 4) * 0.16, -0.35 + ((i * 7) % 5) * 0.17);

  // ---------- Halo ----------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new Vector2(1, 1), small ? 0.6 : 0.75, 0.45, 0.55);
  composer.addPass(bloom); composer.addPass(new OutputPass());

  // ---------- Caméra pilotée par le défilement ----------
  let portrait = false, idx = 0, idxSmooth = 0;
  const camYFor = (i) => Math.max(-i * SEC, Y_MACHINE - 0.6);
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h); bloom.setSize(w, h);
    camera.aspect = w / h; portrait = w / h < 1;
    camera.setViewOffset(w, h, portrait ? -w * 0.02 : -w * 0.22, portrait ? h * 0.2 : 0, w, h);
    camera.updateProjectionMatrix(); dirty = true;
  }
  const pointer = new Vector2(), smooth = new Vector2();
  addEventListener("pointermove", (e) => pointer.set(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1), { passive: true });
  const target = new Vector3();
  function placeCamera() {
    const y = camYFor(idxSmooth), endZoom = Math.max(0, idxSmooth - 6.6);
    const cx = 1.7 * Math.sin(y * 0.33) * 0.35 + (endZoom > 0 ? machinePos.x * 0.4 * Math.min(1, endZoom) : 0);
    target.set(cx + smooth.x * 0.5, y - 0.2 - smooth.y * 0.3, 0);
    camera.position.set(cx - 2.6 + smooth.x * 0.8, y + 4.2, (portrait ? 25 : 17) + endZoom * 2);
    camera.lookAt(target);
    key.position.set(camera.position.x - 4, y + 8, 6); key.target.position.set(0, y, 0);
    // le rack se tient en bas à droite du cadre
    rack.position.set(cx + (portrait ? 1.6 : 1.9), y - (portrait ? 4.2 : 2.2), 2.6);
    rack.lookAt(camera.position);
  }

  // ---------- Petites animations (tâches) ----------
  const tasks = [];
  const run = (dur, step) => new Promise((done) => { if (reduced) { step(1); dirty = true; done(); return; } tasks.push({ t: 0, dur, step, done }); });
  const wait = (s) => run(s, () => {});
  function flashPortal(p) { p.userData.flash = 1; }

  async function install(k) {
    const pc = pieces[k]; if (!pc || pc.state !== "parked") return;
    pc.state = "moving"; rack.visible = true;
    // la pièce roule jusqu'au portail
    await run(0.9, (p) => placeOnCurve(pc.coin, pc.tPark + (pc.tPortal - pc.tPark) * easeIn(p)));
    pc.coin.visible = false; flashPortal(pc.portal);
    // elle ressort en pièce de machine et file vers le rack
    const tile = makeTile(icons[k]); scene.add(tile);
    const from = pc.portal.position.clone(), to = new Vector3(), ctrl = new Vector3();
    const slot = sockets[ORDER.indexOf(k)];
    await run(1.0, (p) => {
      slot.getWorldPosition(to);
      ctrl.copy(from).lerp(to, 0.5).add(new Vector3(0, 2.2, 1.5));
      const e = ease(p), a = from.clone().lerp(ctrl, e), b = ctrl.clone().lerp(to, e);
      tile.position.copy(a.lerp(b, e));
      tile.quaternion.slerpQuaternions(new Quaternion(), rack.quaternion, e);
      tile.rotateY((1 - e) * Math.PI * 2);
      tile.scale.setScalar(0.6 + 0.4 * e);
    });
    slot.attach(tile); tile.position.set(0, 0, 0.06); tile.rotation.set(0, 0, 0); tile.scale.setScalar(1);
    slot.userData.ring.material.color.set(new Color(0xffb020).multiplyScalar(2));
    await run(0.5, (p) => slot.userData.ring.material.color.lerpColors(new Color(0xffb020).multiplyScalar(2), new Color(0x2fbf7a), p));
    pc.state = "done"; pc.tile = tile;
  }

  let filled = false;
  async function fill() {
    if (filled) return; filled = true;
    await Promise.all(ORDER.map(async (k, i) => {
      const tile = pieces[k].tile; if (!tile) return;
      await wait(i * 0.12);
      const from = new Vector3(), to = new Vector3(); tile.getWorldPosition(from); scene.attach(tile);
      const slot = mSockets[i];
      await run(0.9, (p) => { slot.getWorldPosition(to); const e = ease(p); tile.position.lerpVectors(from, to, e); tile.position.y += Math.sin(e * Math.PI) * 1.2; tile.rotation.set(0, (1 - e) * Math.PI, 0); });
      slot.attach(tile); tile.position.set(0, 0, 0.06); tile.rotation.set(0, 0, 0);
      slot.userData.ring.material.color.set(0x2fbf7a);
      leds[i].material.color.set(new Color(ORANGE).multiplyScalar(2));
    }));
    rack.visible = false;
    stripMat.color.set(new Color(ORANGE).multiplyScalar(1.6));
  }

  let launched = false;
  async function launch() {
    if (launched) return; launched = true;
    leds.forEach((l) => l.material.color.set(new Color(0x2fbf7a).multiplyScalar(2)));
    machineLight.intensity = 10;
    const tStart = tAtY(Y_MACHINE + 7), N = 6;
    const jobs = [];
    for (let i = 0; i < N; i++) {
      jobs.push((async () => {
        await wait(i * 0.32);
        const c = makeCoin(icons.rfq); scene.add(c);
        await run(0.9, (p) => placeOnCurve(c, tStart + (1 - tStart) * easeIn(p)));
        scene.remove(c);
        const r = new Mesh(ringGeo, ringMats[i % 3 === 2 ? 1 : 0]); machine.add(r);
        const from = new Vector3(1.7, -0.6, 0.3), to = bin.position.clone().add(pileSpot(pile.length)); pile.push(r);
        await run(0.7, (p) => { const e = easeOut(p); r.position.lerpVectors(from, to, e); r.position.y += Math.sin(p * Math.PI) * 0.6; r.rotation.set(Math.PI / 2 * e, 0, p * 4); });
      })());
    }
    await Promise.all(jobs);
    machineLight.intensity = 4;
  }

  // ---------- Boucle ----------
  let clock = 6.6, last = performance.now(), dirty = true, visible = true;
  function heroFlow(c) {
    const cycle = HERO_N * GAP;
    heroCoins.forEach((m, i) => {
      const u = (((c - i * GAP) % cycle) + cycle) % cycle / T_UP;
      m.visible = u <= 1;
      if (m.visible) { placeOnCurve(m, heroStartT + (heroPortalT - heroStartT) * u); m.scale.setScalar(Math.max(0.001, u > 0.93 ? 1 - (u - 0.93) / 0.07 : 1)); }
    });
    heroRings.forEach((m, i) => {
      const u = (((c - i * GAP - T_UP) % cycle) + cycle) % cycle / T_LOW;
      m.visible = u <= 1;
      if (m.visible) { placeOnCurve(m, heroPortalT + (heroEndT - heroPortalT) * u); m.scale.setScalar(Math.max(0.001, Math.min(u / 0.08, (1 - u) / 0.15, 1))); }
    });
  }
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) { last = now; return; }
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const t = now / 1000;
    if (!reduced) {
      clock += dt; smooth.lerp(pointer, 0.05);
      idxSmooth += (idx - idxSmooth) * Math.min(1, dt * 4);
    } else if (!dirty && Math.abs(idx - idxSmooth) < 1e-3) return;
    else idxSmooth = idx;
    placeCamera();
    if (idxSmooth < 1.6) heroFlow(reduced ? 6.6 : clock);
    // pièces garées : léger balancement + lueur
    for (const k of ORDER) { const pc = pieces[k]; if (pc.state === "parked" && !reduced) { placeOnCurve(pc.coin, pc.tPark + Math.sin(t * 2 + pc.tPark * 50) * 0.0012); pc.coin.material[1].emissiveIntensity = 0.9 + Math.sin(t * 3) * 0.25; } }
    for (const p of portals) {
      const u = p.userData; u.flash = Math.max(0, u.flash - dt * 1.5);
      const s = 1 + Math.sin(t * 3) * 0.03 + u.flash * 0.25;
      u.ring.scale.setScalar(s); u.veil.material.opacity = 0.5 + Math.sin(t * 2.2) * 0.1 + u.flash * 0.5; u.ring2.rotation.z = Math.PI / 6 + t * 0.15;
    }
    // carte : tracé progressif à l'approche de la section
    const near = Math.max(0, 1 - Math.abs(idxSmooth - 1) * 1.6);
    if (near > 0 && mapDraw < 1) { mapDraw = reduced ? 1 : Math.min(1, mapDraw + dt * 0.8); mapLine.geometry.setDrawRange(0, Math.ceil(mapDraw * (mp.length + 1))); }
    pinRing.scale.setScalar(1 + ((t * 0.6) % 1) * 2.2); pinRing.material.opacity = 1 - ((t * 0.6) % 1);
    for (let i = tasks.length - 1; i >= 0; i--) {
      const k = tasks[i]; k.t += dt; const p = Math.min(1, k.t / k.dur); k.step(p);
      if (p >= 1) { tasks.splice(i, 1); k.done(); }
    }
    composer.render(); dirty = false;
  }

  // ---------- Clic sur une pièce dans la scène ----------
  const ray = new Raycaster(), ndc = new Vector2(); let pickCb = null;
  const pickable = () => ORDER.map((k) => pieces[k]).filter((p) => p.state === "parked").map((p) => p.coin);
  function hit(e) { const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); const h = ray.intersectObjects(pickable(), false)[0]; return h && h.object.userData.key; }
  canvas.addEventListener("click", (e) => { const k = hit(e); if (k && pickCb) pickCb(k); });
  canvas.addEventListener("pointermove", (e) => { canvas.style.cursor = hit(e) ? "pointer" : ""; });

  resize(); addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => { last = performance.now(); });
  requestAnimationFrame(frame);

  return {
    setProgress(i) { idx = i; dirty = true; },
    install: (k) => install(k).then(() => { dirty = true; }),
    fill: () => fill().then(() => { dirty = true; }),
    launch: () => launch().then(() => { dirty = true; }),
    onPick(cb) { pickCb = cb; },
    get filled() { return filled; }
  };
}
