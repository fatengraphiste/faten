// Scène 3D : un tapis arrive en haut à gauche, les pièces tombent dans le portail CCA
// au centre et ressortent incandescentes sur le tapis de sortie, qui descend jusqu'à
// la machine. Chaque pièce installée prend sa place dans la façade de la machine.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Fog, Vector2, Vector3, Matrix4, Quaternion,
  CatmullRomCurve3, BufferGeometry, Float32BufferAttribute, TubeGeometry, BoxGeometry, CylinderGeometry,
  TorusGeometry, CircleGeometry, PlaneGeometry, SphereGeometry, EdgesGeometry, LineSegments, LineBasicMaterial,
  MeshStandardMaterial, MeshBasicMaterial, ShaderMaterial, Mesh, Group, CanvasTexture, SRGBColorSpace,
  DoubleSide, AmbientLight, DirectionalLight, PointLight, ACESFilmicToneMapping, Raycaster
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

const ORANGE = 0xef791f, BLUE_L = 0x3f8fe0, GREEN = 0x2fbf7a;
const ORDER = ["marque", "site", "rfq", "crm", "visi", "prosp"];
const UP = new Vector3(0, 1, 0), Z = new Vector3(0, 0, 1);
const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const easeIn = (p) => p * p;
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const glow = (c, k) => new Color(c).multiplyScalar(k);

export function initScene(canvas, { icons = {}, reduced = false, milsLogo = null } = {}) {
  const small = matchMedia("(max-width: 900px)").matches;
  let renderer;
  try { renderer = new WebGLRenderer({ canvas, antialias: !small, powerPreference: "high-performance" }); }
  catch (e) { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.toneMapping = ACESFilmicToneMapping;

  const scene = new Scene();
  scene.background = new Color(0x000000);
  scene.fog = new Fog(0x000000, 20, 44);
  const camera = new PerspectiveCamera(30, 1, 0.1, 120);
  scene.add(new AmbientLight(0xffffff, 0.38));
  const key = new DirectionalLight(0xffffff, 1.6); key.position.set(-6, 9, 8); scene.add(key);
  const fill = new PointLight(0xffd2a8, 10, 14, 1.4); fill.position.set(-3.5, 4.5, 3); scene.add(fill);
  const fill2 = new PointLight(0xffb37a, 8, 12, 1.4); fill2.position.set(3.8, -3.2, 3); scene.add(fill2);
  const rim = new DirectionalLight(0x9bbcff, 0.5); rim.position.set(7, 2, -6); scene.add(rim);

  // ---------- Tapis : entrée en haut à gauche, sortie vers la machine ----------
  const IN = new CatmullRomCurve3([
    new Vector3(-8, 6.6, -4.5), new Vector3(-5.2, 5.0, -2.4), new Vector3(-2.6, 3.4, -0.9),
    new Vector3(-0.9, 2.55, -0.15), new Vector3(0.25, 2.25, 0)
  ]);
  const OUT = new CatmullRomCurve3([
    new Vector3(0.3, -0.85, 0.1), new Vector3(1.8, -1.55, 0.5), new Vector3(3.2, -2.8, 0.6),
    new Vector3(3.5, -4.3, 0.2), new Vector3(2.6, -5.5, -0.1), new Vector3(1.2, -6.05, 0)
  ]);
  const PORTAL = new Vector3(0.25, 0.75, 0);
  const MACHINE = new Vector3(0.6, -7.7, 0);

  const frameOn = (curve, t) => {
    t = Math.min(1, Math.max(0, t));
    const p = curve.getPointAt(t), tan = curve.getTangentAt(t);
    const side = new Vector3().crossVectors(tan, UP).normalize();
    const nrm = new Vector3().crossVectors(side, tan).normalize();
    return { p, tan, side, nrm };
  };
  const beltMat = new MeshStandardMaterial({ color: 0x3a3c43, metalness: 0.55, roughness: 0.38, emissive: 0x0d0e11, side: DoubleSide });
  const lipMat = new MeshStandardMaterial({ color: 0x55585f, metalness: 0.85, roughness: 0.25, emissive: 0x16171a });
  function belt(curve, w = 1.35) {
    const n = Math.ceil(curve.getLength() / 0.1), pos = [], idx = [], L = [], R = [];
    for (let i = 0; i <= n; i++) {
      const { p, side, nrm } = frameOn(curve, i / n);
      const a = p.clone().addScaledVector(side, -w / 2), b = p.clone().addScaledVector(side, w / 2);
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
      L.push(a.clone().addScaledVector(nrm, 0.08)); R.push(b.clone().addScaledVector(nrm, 0.08));
      if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const g = new BufferGeometry(); g.setAttribute("position", new Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    scene.add(new Mesh(g, beltMat));
    for (const s of [L, R]) scene.add(new Mesh(new TubeGeometry(new CatmullRomCurve3(s), n, 0.07, 8, false), lipMat));
  }
  belt(IN); belt(OUT);

  // Pièce qui roule debout sur un tapis.
  const roll = new Quaternion();
  function onBelt(obj, curve, t, r = 0.5) {
    const { p, tan, side, nrm } = frameOn(curve, t);
    obj.position.copy(p).addScaledVector(nrm, r);
    obj.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(tan, nrm, side));
    roll.setFromAxisAngle(Z, -(t * curve.getLength()) / r);
    obj.quaternion.multiply(roll);
  }

  // ---------- Textures et matériaux ----------
  const iconTex = (path, ring) => {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    g.fillStyle = "#000"; g.fillRect(0, 0, 256, 256);
    if (ring) { g.strokeStyle = ring; g.lineWidth = 7; g.beginPath(); g.arc(128, 128, 110, 0, Math.PI * 2); g.stroke(); }
    if (path) { g.save(); g.translate(68, 68); g.scale(5, 5); g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = g.lineJoin = "round"; g.stroke(new Path2D(path)); g.restore(); }
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
  };
  const coinGeo = new CylinderGeometry(0.5, 0.5, 0.14, 64); coinGeo.rotateX(Math.PI / 2);
  const darkSide = new MeshStandardMaterial({ color: 0x2b2d33, metalness: 0.95, roughness: 0.28 });
  const hotSide = new MeshStandardMaterial({ color: ORANGE, emissive: ORANGE, emissiveIntensity: 1.4, metalness: 0.5, roughness: 0.3 });
  // pièce « demande » : métal sombre, picto blanc
  function makeCoin(path) {
    const f = new MeshStandardMaterial({ color: 0x18191d, metalness: 0.85, roughness: 0.35, emissive: 0xffffff, emissiveIntensity: 0.9, emissiveMap: iconTex(path, "#ef791f") });
    return new Mesh(coinGeo, [darkSide, f, f]);
  }
  // pièce de machine : tranche incandescente, comme à la sortie du portail
  function makePiece(path) {
    const f = new MeshStandardMaterial({ color: 0x111215, metalness: 0.6, roughness: 0.4, emissive: 0xffffff, emissiveIntensity: 1.1, emissiveMap: iconTex(path, "#ffb067") });
    return new Mesh(coinGeo, [hotSide, f, f]);
  }
  const devisGeo = new TorusGeometry(0.42, 0.07, 16, 64);
  const devisMats = [new MeshBasicMaterial({ color: glow(ORANGE, 1.8) }), new MeshBasicMaterial({ color: glow(BLUE_L, 1.6) })];

  // ---------- Portail CCA : disque de feu cerclé de métal ----------
  const fire = new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uBoost: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: `uniform float uTime; uniform float uBoost; varying vec2 vUv;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
      void main(){ vec2 c=vUv-.5; float r=length(c)*2.;
        float t=uTime; float f=fbm(c*3.2+vec2(t*.12,-t*.09))*.7+fbm(c*7.-vec2(t*.2,t*.15))*.45;
        vec3 col=mix(vec3(.38,.08,.01),vec3(.95,.42,.07),f);
        col=mix(col,vec3(1.,.8,.5),smoothstep(.85,1.2,f+uBoost*.4));
        col*=(.78+uBoost*1.4)*(1.-smoothstep(.86,1.,r))*(.75+.35*(1.-r));
        gl_FragColor=vec4(col,1.); }`
  });
  const portal = new Group(); portal.position.copy(PORTAL); portal.rotation.x = -Math.PI / 2 + 0.42;
  const disc = new Mesh(new CircleGeometry(1.15, 72), fire);
  const rimMetal = new Mesh(new TorusGeometry(1.3, 0.16, 20, 96), new MeshStandardMaterial({ color: 0x1e1f23, metalness: 0.9, roughness: 0.3 }));
  const rimGlow = new Mesh(new TorusGeometry(1.48, 0.016, 8, 128), new MeshBasicMaterial({ color: glow(ORANGE, 2) }));
  const rimBlue = new Mesh(new TorusGeometry(1.56, 0.008, 8, 128), new MeshBasicMaterial({ color: glow(BLUE_L, 1.6) }));
  portal.add(disc, rimMetal, rimGlow, rimBlue); scene.add(portal);
  const portalLight = new PointLight(ORANGE, 18, 9, 1.7); portalLight.position.copy(PORTAL).add(new Vector3(0, -0.6, 0.8)); scene.add(portalLight);
  let portalFlash = 0;

  // ---------- La machine ----------
  const machine = new Group(); machine.position.copy(MACHINE);
  const bodyMat = new MeshStandardMaterial({ color: 0x1d1f24, metalness: 0.85, roughness: 0.32 });
  const bodyGeo = new BoxGeometry(3.6, 2.5, 2.0);
  machine.add(new Mesh(bodyGeo, bodyMat), new LineSegments(new EdgesGeometry(bodyGeo), new LineBasicMaterial({ color: 0x3a3d46 })));
  const stripMat = new MeshBasicMaterial({ color: glow(ORANGE, 0.5) });
  for (const y of [1.27, -1.27]) { const s = new Mesh(new BoxGeometry(3.62, 0.04, 0.04), stripMat); s.position.set(0, y, 1.01); machine.add(s); }
  const intake = new Mesh(new CylinderGeometry(0.85, 0.55, 0.6, 48, 1, true), new MeshStandardMaterial({ color: 0x2a2c31, metalness: 0.85, roughness: 0.3, side: DoubleSide }));
  intake.position.set(0.6, 1.5, 0); machine.add(intake);
  const leds = Array.from({ length: 6 }, (_, i) => { const m = new Mesh(new SphereGeometry(0.055, 12, 12), new MeshBasicMaterial({ color: 0x3a3d46 })); m.position.set(0.35 + i * 0.2, 0.98, 1.02); machine.add(m); return m; });
  const sockets = ORDER.map((k, i) => {
    const s = new Group(); s.position.set(-1.05 + (i % 3) * 1.05, 0.32 - Math.floor(i / 3) * 0.92, 1.02);
    const ring = new Mesh(new TorusGeometry(0.43, 0.025, 10, 64), new MeshBasicMaterial({ color: 0x4a4d57 }));
    s.add(ring); s.userData.ring = ring; machine.add(s); return s;
  });
  if (milsLogo) {
    const img = new Image(); const tex = new CanvasTexture(img); tex.colorSpace = SRGBColorSpace;
    img.onload = () => { tex.needsUpdate = true; }; img.src = milsLogo;
    const plate = new Mesh(new PlaneGeometry(1.05, 0.36), new MeshBasicMaterial({ map: tex })); plate.position.set(-0.95, 0.98, 1.011); machine.add(plate);
  }
  const chute = new Mesh(new BoxGeometry(1.2, 0.07, 0.9), bodyMat); chute.position.set(2.25, -0.75, 0.25); chute.rotation.z = -0.4; machine.add(chute);
  const bin = new Group(); bin.position.set(3.55, -1.35, 0.3);
  const binGeo = new BoxGeometry(1.8, 1.3, 1.4);
  bin.add(new Mesh(binGeo, new MeshStandardMaterial({ color: 0x9bbcff, transparent: true, opacity: 0.06, depthWrite: false })), new LineSegments(new EdgesGeometry(binGeo), new LineBasicMaterial({ color: 0x5a5f6b })));
  machine.add(bin);
  const machineLight = new PointLight(ORANGE, 0, 8, 1.6); machineLight.position.set(0, 0.3, 2.4); machine.add(machineLight);
  scene.add(machine);
  const pileSpot = (i) => new Vector3(-0.55 + (i % 4) * 0.36 + ((i >> 2) % 2) * 0.18, -0.5 + Math.floor(i / 4) * 0.15, -0.3 + ((i * 7) % 5) * 0.15);

  // ---------- Pièces à installer ----------
  const pieces = {};
  ORDER.forEach((k) => { const c = makeCoin(icons[k]); c.visible = false; c.userData.key = k; scene.add(c); pieces[k] = { coin: c, state: "idle", t: 0 }; });
  let active = [];                       // pièces de la section affichée
  const WAIT_T = [0.86, 0.66];           // positions d'attente sur le tapis d'entrée
  const pulse = new Mesh(new TorusGeometry(0.62, 0.02, 8, 64), new MeshBasicMaterial({ color: glow(ORANGE, 2), transparent: true }));
  pulse.visible = false; scene.add(pulse);

  // ---------- Halo ----------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new Vector2(1, 1), small ? 0.65 : 0.8, 0.5, 0.5);
  composer.addPass(bloom); composer.addPass(new OutputPass());

  // ---------- Caméra ----------
  let portrait = false, idx = 0, idxS = 0;
  const pointer = new Vector2(), sm = new Vector2();
  addEventListener("pointermove", (e) => pointer.set(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1), { passive: true });
  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h); bloom.setSize(w, h);
    camera.aspect = w / h; portrait = w / h < 1;
    camera.setViewOffset(w, h, portrait ? 0 : -w * 0.2, portrait ? h * 0.17 : 0, w, h);
    camera.updateProjectionMatrix();
  }
  const target = new Vector3();
  function placeCamera() {
    const intro = Math.min(1, Math.max(0, (idxS - 1) / 1));          // arrivée depuis l'écran du défi
    const down = Math.min(1, Math.max(0, idxS - 6));                  // descente vers la machine
    const back = Math.min(1, Math.max(0, idxS - 7));                  // recul au planning
    target.set(0.7 + sm.x * 0.4, -2.5 - down * 1.2 - sm.y * 0.3, 0);
    const dist = (portrait ? 37 : 27) + (1 - ease(intro)) * 16 + back * 4;
    camera.position.set(-1.6 + sm.x * 0.9, 2.2 + (1 - intro) * 4 - down * 1.2 + back * 1.5, dist);
    camera.lookAt(target);
  }

  // ---------- Tâches d'animation ----------
  const tasks = [];
  const run = (dur, step) => new Promise((done) => { if (reduced) { step(1); done(); return; } tasks.push({ t: 0, dur, step, done }); });
  const wait = (s) => run(s, () => {});

  // chute dans le portail puis sortie sur le tapis du bas
  async function throughPortal(obj) {
    const from = obj.position.clone(), q0 = obj.quaternion.clone();
    await run(0.35, (p) => { obj.position.lerpVectors(from, PORTAL, easeIn(p)); obj.quaternion.copy(q0); });
    obj.visible = false; portalFlash = 1;
  }

  async function install(k) {
    const pc = pieces[k]; if (!pc || pc.state === "moving" || pc.state === "done") return;
    pc.state = "moving"; pc.coin.visible = true;
    const t0 = pc.t;
    await run(0.7 * (1 - t0) + 0.2, (p) => { pc.t = t0 + (1 - t0) * easeIn(p); onBelt(pc.coin, IN, pc.t); });
    await throughPortal(pc.coin);
    const piece = makePiece(icons[k]); scene.add(piece); pc.piece = piece;
    await run(1.6, (p) => onBelt(piece, OUT, ease(p)));
    const slot = sockets[ORDER.indexOf(k)], from = piece.position.clone(), to = new Vector3(), q0 = piece.quaternion.clone();
    await run(0.7, (p) => {
      slot.getWorldPosition(to); const e = ease(p);
      piece.position.lerpVectors(from, to, e); piece.position.y += Math.sin(e * Math.PI) * 0.8;
      piece.quaternion.slerpQuaternions(q0, new Quaternion(), e);
    });
    slot.attach(piece); piece.position.set(0, 0, 0.08); piece.quaternion.identity();
    slot.userData.ring.material.color.set(glow(0xffb020, 2));
    leds[ORDER.indexOf(k)].material.color.set(glow(ORANGE, 2));
    await run(0.5, (p) => slot.userData.ring.material.color.lerpColors(glow(0xffb020, 2), new Color(GREEN), p));
    pc.state = "done";
    if (ORDER.every((x) => pieces[x].state === "done")) stripMat.color.set(glow(ORANGE, 1.6));
  }

  let launched = false;
  const flying = [];
  async function launch() {
    if (launched) return; launched = true;
    leds.forEach((l) => l.material.color.set(glow(GREEN, 2)));
    machineLight.intensity = 8;
    const N = 6;
    await Promise.all(Array.from({ length: N }, async (_, i) => {
      await wait(i * 0.45);
      const c = makeCoin(icons.rfq); scene.add(c); flying.push(c);
      await run(1.2, (p) => onBelt(c, IN, easeIn(p)));
      await throughPortal(c);
      const r = new Mesh(devisGeo, devisMats[i % 3 === 2 ? 1 : 0]); scene.add(r); flying.push(r);
      await run(1.1, (p) => onBelt(r, OUT, ease(p), 0.49));
      r.visible = false; machineLight.intensity = 14;
      const d = new Mesh(devisGeo, r.material); machine.add(d); flying.push(d);
      const from = new Vector3(1.7, -0.5, 0.3), to = bin.position.clone().add(pileSpot(i));
      await run(0.7, (p) => { const e = easeOut(p); d.position.lerpVectors(from, to, e); d.position.y += Math.sin(p * Math.PI) * 0.5; d.rotation.set((Math.PI / 2) * e, 0, p * 4); });
      machineLight.intensity = 8;
    }));
  }

  function reset() {
    tasks.length = 0; launched = false; machineLight.intensity = 0;
    flying.forEach((o) => o.parent && o.parent.remove(o)); flying.length = 0;
    ORDER.forEach((k, i) => {
      const pc = pieces[k]; if (pc.piece && pc.piece.parent) pc.piece.parent.remove(pc.piece);
      pc.piece = null; pc.state = "idle"; pc.t = 0; pc.coin.visible = false;
      sockets[i].userData.ring.material.color.set(0x4a4d57); leds[i].material.color.set(0x3a3d46);
    });
    stripMat.color.set(glow(ORANGE, 0.5)); setActive(active);
  }

  // Une pièce entre par le haut du tapis quand sa section s'affiche.
  function setActive(keys) {
    active = keys;
    ORDER.forEach((k) => { const pc = pieces[k]; if (pc.state === "idle" || pc.state === "waiting") { if (!keys.includes(k)) { pc.coin.visible = false; pc.state = "idle"; pc.t = 0; } } });
    keys.forEach((k, j) => {
      const pc = pieces[k]; if (pc.state !== "idle") return;
      pc.state = "arriving"; pc.coin.visible = true; const goal = WAIT_T[j] || 0.6;
      run(1.4, (p) => { if (pc.state !== "arriving") return; pc.t = goal * easeOut(p); onBelt(pc.coin, IN, pc.t); })
        .then(() => { if (pc.state === "arriving") pc.state = "waiting"; });
    });
  }

  // ---------- Boucle ----------
  let last = performance.now(), hintCb = null;
  const proj = new Vector3();
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    const dt = Math.min(0.1, (now - last) / 1000); last = now; const t = now / 1000;
    if (!reduced) { sm.lerp(pointer, 0.05); idxS += (idx - idxS) * Math.min(1, dt * 3.5); } else idxS = idx;
    if (idxS < 0.9) { if (hintCb) hintCb(null); return; }               // scène pas encore visible
    placeCamera();
    fire.uniforms.uTime.value = t; portalFlash = Math.max(0, portalFlash - dt * 1.8);
    fire.uniforms.uBoost.value = portalFlash; portalLight.intensity = 16 + Math.sin(t * 3) * 3 + portalFlash * 30;
    rimGlow.scale.setScalar(1 + portalFlash * 0.06);
    // pièce en attente : légère oscillation + anneau qui pulse
    let hint = null;
    for (const k of active) {
      const pc = pieces[k];
      if (pc.state === "waiting") {
        if (!reduced) onBelt(pc.coin, IN, pc.t + Math.sin(t * 2.4) * 0.004);
        pc.coin.material[1].emissiveIntensity = 0.8 + Math.sin(t * 4) * 0.35;
        if (!hint) {
          hint = pc.coin;
          pulse.visible = true; pulse.position.copy(pc.coin.position); pulse.quaternion.copy(camera.quaternion);
          const ph = (t * 0.9) % 1; pulse.scale.setScalar(1 + ph * 0.7); pulse.material.opacity = 1 - ph;
        }
      }
    }
    if (!hint) pulse.visible = false;
    for (let i = tasks.length - 1; i >= 0; i--) {
      const k = tasks[i]; k.t += dt; const p = Math.min(1, k.t / k.dur); k.step(p);
      if (p >= 1) { tasks.splice(i, 1); k.done(); }
    }
    composer.render();
    if (hintCb) {
      if (hint) { proj.copy(hint.position).project(camera); hintCb({ x: (proj.x + 1) / 2 * canvas.clientWidth, y: (1 - proj.y) / 2 * canvas.clientHeight }); }
      else hintCb(null);
    }
  }

  // ---------- Clic sur une pièce ----------
  const ray = new Raycaster(), ndc = new Vector2(); let pickCb = null;
  function hit(e) {
    const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const list = active.map((k) => pieces[k]).filter((p) => p.state === "waiting" || p.state === "arriving").map((p) => p.coin);
    const h = ray.intersectObjects(list, false)[0]; return h && h.object.userData.key;
  }
  canvas.addEventListener("click", (e) => { const k = hit(e); if (k && pickCb) pickCb(k); });
  canvas.addEventListener("pointermove", (e) => { canvas.style.cursor = hit(e) ? "pointer" : ""; });

  resize(); addEventListener("resize", resize);
  requestAnimationFrame(frame);

  return {
    setProgress(i) { idx = i; },
    setActive,
    install,
    launch,
    reset,
    onPick(cb) { pickCb = cb; },
    onHint(cb) { hintCb = cb; }
  };
}
