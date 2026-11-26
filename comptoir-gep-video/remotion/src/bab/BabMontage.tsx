import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import TL from "./timeline.json";
import { FontLoader } from "../fonts";
import { IsoFonts } from "../iso/fonts";
import { Outro } from "../Outro";
import { BgPan } from "../iso/Bg";
import { LOGO_PATHS } from "../logo";
import { Cam, Tag, clamp, eio, eo, ebo, iso, XY } from "../iso/engine";
import { DK, FONT, FPS, NAVY, YEL } from "../iso/theme";

/* ───────────────────────── chronologie (tools/bab_timeline.py, calée sur la voix off) ───────────────────────── */
const S = TL.starts as number[];
const LEN = TL.lens as number[];
const LAND = TL.land as number[][];
const END_T = TL.outro;
const TRAVEL = TL.travel;
export const BAB_FRAMES = Math.round(TL.total * FPS);
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const rad = (d: number) => (d * Math.PI) / 180;
const planAt = (t: number) => { let i = 0; for (let k = 0; k < S.length; k++) if (t >= S[k]) i = k; return i; };

/* ───────────────────────── monde isométrique : mur en vrais blocs BAB (profil en H) ───────────────────────── */
const C: Cam = { ox: 464, oy: 746, u: 185 };
const P = (x: number, y: number, z: number): XY => iso(C, x, y, z);
const d = (pts: XY[]) => "M" + pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L") + " Z";
const L = 2.0;                       // longueur du mur (m)
const Z0 = 0.22, BH = 0.2;           // dessus de la semelle, hauteur d'un bloc
const TP = 0.033;                    // épaisseur des faces du bloc
const LANE = 0.75;                   // couloir du bonhomme (devant le mur)
const laneAt = (t: number) => { const p = planAt(t); return p === 7 || p === 8 ? 0.4 : LANE; };
const SC = 0.9;                      // échelle du bonhomme
type BType = "about" | "courant" | "half";
type BDef = { x0: number; x1: number; t: BType };
const rowBlocks = (r: number): BDef[] => r % 2 === 0
  ? [{ x0: 0, x1: 0.5, t: "about" }, { x0: 0.5, x1: 1, t: "courant" }, { x0: 1, x1: 1.5, t: "courant" }, { x0: 1.5, x1: 2, t: "about" }]
  : [{ x0: 0, x1: 0.25, t: "half" }, { x0: 0.25, x1: 0.75, t: "courant" }, { x0: 0.75, x1: 1.25, t: "courant" }, { x0: 1.25, x1: 1.75, t: "courant" }, { x0: 1.75, x1: 2, t: "half" }];
// âmes (cloisons) du bloc réel : bloc courant = 1 alvéole centrale ; bloc d'about = 2 alvéoles
const WEBS: Record<BType, [number, number][]> = {
  courant: [[0.113, 0.153], [0.353, 0.393]],
  about: [[0.137, 0.169], [0.27, 0.30], [0.419, 0.446]],
  half: [[0.05, 0.09], [0.16, 0.2]],
};
const mix = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(lerp(v, pb[i], k)).toString(16).padStart(2, "0")).join("");
};
const SW = 2.4;
const bx = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => ({
  front: d([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)]),
  right: d([P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1)]),
  top: d([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)]),
});
const Piece: React.FC<{ x0: number; x1: number; y0: number; y1: number; z0: number; z1: number; fl?: string; fr?: string; ft?: string; op?: number; sw?: number }> = ({ x0, x1, y0, y1, z0, z1, fl = "#fff", fr = "#eef0fa", ft = "#fff", op = 1, sw = SW }) => {
  const f = bx(x0, x1, y0, y1, z0, z1);
  return (
    <g opacity={op}>
      <path d={f.front} fill={fl} stroke={NAVY} strokeWidth={sw} strokeLinejoin="round" />
      <path d={f.right} fill={fr} stroke={NAVY} strokeWidth={sw} strokeLinejoin="round" />
      <path d={f.top} fill={ft} stroke={NAVY} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  );
};
// dessus de la maçonnerie en x (pour n'afficher que les aciers qui dépassent)
const topAt = (x: number, t: number) => { let z = Z0; for (let r = 0; r < 5; r++) { const bl = rowBlocks(r).findIndex((b) => x >= b.x0 && x <= b.x1); if (bl >= 0 && t > LAND[r][bl]) z = Z0 + BH * (r + 1); } return z; };
// parcours d'un bloc : de la palette au mur, en arc
const PALLET: XY = P(-0.55, 1.0, 0.5);
const blockXf = (r: number, i: number, t: number) => {
  const b = rowBlocks(r)[i]; const tl = LAND[r][i]; const ts = tl - TRAVEL;
  if (t < ts) return null;
  const p = clamp((t - ts) / TRAVEL); const e = eo(p);
  const dst = P(b.x0, 0.2, Z0 + BH * r);
  const dx = (PALLET[0] - dst[0]) * (1 - e), dy = (PALLET[1] - dst[1]) * (1 - e) - 110 * Math.sin(Math.PI * p);
  const land = clamp((t - tl) / 0.16); const sq = land > 0 && land < 1 ? 1 - 0.07 * Math.sin(Math.PI * land) : 1;
  return { dx, dy, sq, op: Math.min(1, p * 5), base: dst };
};

const WorldBlocks: React.FC<{ t: number; layer: "back" | "web" | "front"; xray: number; fillTop: number; hl: number[] }> = ({ t, layer, xray, fillTop, hl }) => (
  <g>
    {[0, 1, 2, 3, 4].map((r) => rowBlocks(r).map((b, i) => {
      const xf = blockXf(r, i, t); if (!xf) return null;
      const z0 = Z0 + BH * r, z1 = z0 + BH;
      const hlOn = r === 0 && (i === 0 || i === 3) ? hl[i === 0 ? 0 : 1] : 0;
      const col = hlOn > 0 ? mix("#ffffff", "#f6d3d3", hlOn) : "#ffffff";
      const wallOp = 1 - 0.0 * xray;
      return (
        <g key={r + "_" + i} transform={`translate(${xf.dx} ${xf.dy}) translate(${xf.base[0]} ${xf.base[1]}) scale(1 ${xf.sq}) translate(${-xf.base[0]} ${-xf.base[1]})`} opacity={xf.op * wallOp}>
          {layer === "back" && <Piece x0={b.x0} x1={b.x1} y0={0} y1={TP} z0={z0} z1={z1} fl="#e6e9f6" fr="#eef0fa" ft={col} />}
          {layer === "web" && WEBS[b.t].map(([a, c2], k) => <Piece key={k} x0={b.x0 + a * (b.t === "half" ? 1 : 1)} x1={b.x0 + c2} y0={TP} y1={0.2 - TP} z0={z0} z1={z1} fl="#dde1f3" fr="#eef0fa" ft={col} op={1 - 0.45 * xray} sw={2} />)}
          {layer === "front" && <Piece x0={b.x0} x1={b.x1} y0={0.2 - TP} y1={0.2} z0={z0} z1={z1} fl={col} fr="#eef0fa" ft={mix(col, "#f6d3d3", fillTop)} op={1 - 0.8 * xray} />}
        </g>
      );
    }))}
  </g>
);

// béton liquide dans le mur : niveau, surface ondulée
const pourLevel = (t: number) => { const ph = seg(t, TL.pour[0], TL.pour[1]); const q = ph < 0.5 ? ph * 1.08 : ph < 0.62 ? 0.54 : 0.54 + ((ph - 0.62) / 0.38) * 0.46; return 5 * eio(clamp(q)); };
const xPour = (t: number) => { const ph = ((t - TL.pour[0]) / 1.5) % 2; return 0.3 + 1.4 * (ph < 1 ? ph : 2 - ph); };
const Concrete: React.FC<{ t: number; lvl: number }> = ({ t, lvl }) => {
  if (lvl <= 0) return null;
  const z = Z0 + BH * lvl; const y0 = TP, y1 = 0.2 - TP; const n = 28;
  const pts: XY[] = [];
  const xs = Array.from({ length: n + 1 }, (_, k) => (k / n) * L);
  const wv = (x: number) => 0.012 * Math.sin(x * 13 - t * 9) + (t < TL.pour[1] ? 0.016 * Math.exp(-Math.pow((x - xPour(t)) * 4, 2)) * Math.sin(t * 22) : 0);
  xs.forEach((x) => pts.push(P(x, y0, z + wv(x)))); [...xs].reverse().forEach((x) => pts.push(P(x, y1, z + wv(x))));
  const front = d([P(0, y1, Z0), P(L, y1, Z0), ...[...xs].reverse().map((x) => P(x, y1, z + wv(x)))]);
  const right = d([P(L, y0, Z0), P(L, y1, Z0), P(L, y1, z + wv(L)), P(L, y0, z + wv(L))]);
  return (
    <g>
      <path d={front} fill="#f4c3c3" stroke={YEL} strokeWidth={2} strokeLinejoin="round" />
      <path d={right} fill="#ecb0b0" stroke={YEL} strokeWidth={2} strokeLinejoin="round" />
      <path d={"M" + pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L") + " Z"} fill="#f9d9d9" stroke={YEL} strokeWidth={2.4} strokeLinejoin="round" />
    </g>
  );
};

const Rebar: React.FC<{ a: XY; b: XY; w?: number; op?: number }> = ({ a, b, w = 6, op = 1 }) => <path d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} stroke={YEL} strokeWidth={w} strokeLinecap="round" opacity={op} />;
const BAR_X = [0.25, 0.75, 1.25, 1.75];

const World: React.FC<{ t: number; pi: number }> = ({ t, pi }) => {
  const sem = seg(t, TL.semelle[0], TL.semelle[1]);
  const sb = bx(-0.25, L + 0.25, -0.3, 0.5, 0, Z0);
  const xray5 = pi === 5 ? eo(seg(t, S[5] + 0.05, S[5] + 0.4)) * (1 - eo(seg(t, S[6] - 0.25, S[6]))) : 0;
  const xrayP = pi === 7 ? eo(seg(t, TL.pour[0] - 0.5, TL.pour[0] - 0.1)) : pi === 8 ? 1 - eo(seg(t, TL.cure[0] - 0.2, TL.cure[0] + 0.3)) * 0 : 0;
  const xray = Math.max(xray5, xrayP);
  const lvl = t > TL.pour[0] ? pourLevel(t) : 0;
  const ghost = t < S[2] + 1.5 ? 1 - eo(seg(t, S[2] + 1.0, S[2] + 1.5)) : 0;
  const gh = [P(0, 0, Z0 + 1), P(L, 0, Z0 + 1), P(L, 0.2, Z0 + 1), P(0, 0.2, Z0 + 1)];
  const ghB = [P(0, 0.2, Z0), P(L, 0.2, Z0), P(L, 0.2, Z0 + 1), P(0, 0.2, Z0 + 1)];
  const hl = [0, 1].map((k) => (pi === 3 ? Math.sin(Math.PI * clamp((t - TL.about[k]) / 0.9)) : 0));
  const fillTop = clamp(lvl / 5);
  const topZ = Z0 + 1.0;
  return (
    <g>
      {ghost > 0 && <g opacity={ghost * eo(seg(t, 0.3, 1.0)) * 0.9} fill="none" stroke={NAVY} strokeWidth={2.4} strokeDasharray="12 10" strokeLinejoin="round"><path d={d(ghB)} /><path d={d(gh)} /></g>}
      {/* palette de blocs et tas de fers (accessoires) */}
      <g>
        {[0, 1, 2].map((k) => <Piece key={"pb" + k} x0={-0.8} x1={-0.3} y0={0.9} y1={1.1} z0={BH * k} z1={BH * (k + 1)} fl="#e8e8ee" fr="#dcdce6" ft="#f4f4f8" op={0.95} sw={2} />)}
        <path d={`M${P(2.4, 0.4, 0)[0]} ${P(2.4, 0.4, 0)[1]} L${P(3.0, 0.4, 0)[0]} ${P(3.0, 0.4, 0)[1]} L${P(3.0, 0.7, 0)[0]} ${P(3.0, 0.7, 0)[1]} L${P(2.4, 0.7, 0)[0]} ${P(2.4, 0.7, 0)[1]} Z`} fill="none" stroke={NAVY} strokeWidth={2} opacity={0.4} />
        {pi <= 1 && t < (TL.rebarV[3] + 0.2) && [0, 1, 2, 3, 4].map((k) => { const done = TL.rebarV.filter((tg) => t > tg - 0.4).length; if (k >= 5 - done) return null; return <path key={k} d={`M${P(2.45, 0.45 + 0.06 * k, 0.03)[0]} ${P(2.45, 0.45 + 0.06 * k, 0.03)[1]} L${P(3.2, 0.45 + 0.06 * k, 0.03)[0]} ${P(3.2, 0.45 + 0.06 * k, 0.03)[1]}`} stroke={YEL} strokeWidth={5} strokeLinecap="round" />; })}
        {pi === 5 && TL.rebarH.map((tg, k) => (t < tg - 0.4 ? <path key={k} d={`M${P(2.45, 0.45 + 0.06 * k, 0.03)[0]} ${P(2.45, 0.45 + 0.06 * k, 0.03)[1]} L${P(3.2, 0.45 + 0.06 * k, 0.03)[0]} ${P(3.2, 0.45 + 0.06 * k, 0.03)[1]}`} stroke={YEL} strokeWidth={5} strokeLinecap="round" /> : null))}
        {pi === 5 && t < S[5] + 0.4 && <path d={`M${P(2.45, 0.7, 0.03)[0]} ${P(2.45, 0.7, 0.03)[1]} L${P(3.2, 0.7, 0.03)[0]} ${P(3.2, 0.7, 0.03)[1]}`} stroke={YEL} strokeWidth={5} strokeLinecap="round" />}
      </g>
      {/* semelle */}
      {sem > 0 && (
        <g opacity={eo(clamp(sem * 3))} transform={`translate(0 ${-26 * (1 - eo(sem))})`}>
          <path d={sb.front} fill="#f1f1f1" stroke={NAVY} strokeWidth={2.6} strokeLinejoin="round" />
          <path d={sb.right} fill="#e4e4ea" stroke={NAVY} strokeWidth={2.6} strokeLinejoin="round" />
          <path d={sb.top} fill="#f8f8f8" stroke={NAVY} strokeWidth={2.6} strokeLinejoin="round" />
        </g>
      )}
      {/* lit de mortier */}
      {t > TL.mortier[0] && (() => { const q = eo(seg(t, TL.mortier[0], TL.mortier[1])); const x1 = L * q; return <path d={d([P(0, -0.02, Z0 + 0.005), P(x1, -0.02, Z0 + 0.005), P(x1, 0.22, Z0 + 0.005), P(0, 0.22, Z0 + 0.005)])} fill="#f6d3d3" stroke={YEL} strokeWidth={2} />; })()}
      {/* blocs : faces arrière, béton liquide, âmes, faces avant */}
      <WorldBlocks t={t} layer="back" xray={xray} fillTop={0} hl={hl} />
      <Concrete t={t} lvl={lvl} />
      <WorldBlocks t={t} layer="web" xray={xray} fillTop={0} hl={hl} />
      <WorldBlocks t={t} layer="front" xray={xray} fillTop={fillTop} hl={hl} />
      {/* aciers verticaux en attente (partie qui dépasse du mur) */}
      {BAR_X.map((x, k) => { const tg = TL.rebarV[k]; if (t < tg) return null; const g = eo(seg(t, tg, tg + 0.25)); const zEnd = Z0 + 0.62 + (t > S[5] ? 0.4 : 0); const zTop = Z0 + (zEnd - Z0) * g; const zb = Math.max(Z0, topAt(x, t)); if (zb >= zTop) return null; return <Rebar key={k} a={P(x, 0.1, zb)} b={P(x, 0.1, zTop)} />; })}
      {/* aciers horizontaux (radiographie du mur) */}
      {pi === 5 && TL.rebarH.map((tg, k) => { const g = eo(seg(t, tg, tg + 0.3)); const z = Z0 + BH * (k + 1) - 0.04; return g > 0 ? <Rebar key={k} a={P(0, 0.1, z)} b={P(L * g, 0.1, z)} /> : null; })}
      {pi === 5 && BAR_X.map((x, k) => <Rebar key={"v" + k} a={P(x, 0.1, Z0)} b={P(x, 0.1, Z0 + 1.0 * eo(seg(t, S[5] + 0.1, S[5] + 0.5)))} w={5} op={0.9} />)}
      {/* cordeau + niveau */}
      {pi === 6 && (() => { const a = eo(seg(t, TL.cordeau[0], TL.cordeau[1])); const zt = topZ + 0.16;
        const p0 = P(-0.3, 0.1, zt), p1 = P(L + 0.3, 0.1, zt); const e = [p0[0] + (p1[0] - p0[0]) * a, p0[1] + (p1[1] - p0[1]) * a];
        const lv = eo(seg(t, TL.level[0] - 0.4, TL.level[0])); const k2 = seg(t, TL.level[0], TL.level[1]); const tilt = (1 - eo(k2)) * 6 * Math.sin(k2 * 14);
        const lc = P(1.0, 0.1, topZ), ang = Math.atan2(P(1, 0, 0)[1] - P(0, 0, 0)[1], P(1, 0, 0)[0] - P(0, 0, 0)[0]) * 180 / Math.PI; const bub = 22 * (1 - eo(k2)) * Math.sin(k2 * 16);
        return <g>
          <path d={`M${p0[0]} ${p0[1]} L${e[0]} ${e[1]}`} stroke={YEL} strokeWidth={4} strokeDasharray="14 9" strokeLinecap="round" />
          {[p0, p1].map((q, k) => <g key={k} opacity={a}><path d={`M${q[0]} ${q[1] + 70} L${q[0]} ${q[1]}`} stroke={NAVY} strokeWidth={5} strokeLinecap="round" /><circle cx={q[0]} cy={q[1]} r={9} fill="#fff" stroke={NAVY} strokeWidth={4} /></g>)}
          <g transform={`translate(${lc[0]} ${lc[1] - 16 - (1 - lv) * 120}) rotate(${ang + tilt})`} opacity={lv}>
            <rect x={-100} y={-15} width={200} height={30} rx={8} fill="#fff" stroke={NAVY} strokeWidth={4} />
            <rect x={-28} y={-9} width={56} height={18} rx={9} fill="#eef0fa" stroke={NAVY} strokeWidth={2.4} />
            <circle cx={bub} cy={0} r={6.5} fill={YEL} />
          </g>
        </g>; })()}
      {/* humidification */}
      {pi === 7 && t > TL.wet && t < TL.pour[0] + 0.1 && Array.from({ length: 9 }, (_, k) => { const ph = (((t - TL.wet) * 1.8 + k * 0.37) % 1); const x = lerp(0.4, 1.7, (k % 5) / 4); const a = P(x, 0.1, topZ + 0.7 - ph * 0.55); return <path key={k} d={`M${a[0]} ${a[1] - 14} q10 16 0 22 q-10 -6 0 -22z`} fill={NAVY} opacity={0.75 * (1 - ph) * seg(t, TL.wet, TL.wet + 0.2)} />; })}
      {/* piquage : aiguille vibrante */}
      {pi === 8 && t > TL.vib[0] - 0.2 && t < TL.vib[1] + 0.2 && (() => { const a = eo(seg(t, TL.vib[0] - 0.2, TL.vib[0])) * (1 - eo(seg(t, TL.vib[1], TL.vib[1] + 0.2)));
        const x = lerp(0.4, 1.7, seg(t, TL.vib[0], TL.vib[1])); const sh = Math.sin(t * 90) * 3; const dip = 0.3 * Math.abs(Math.sin((t - TL.vib[0]) * 6)); const a1 = P(x, 0.1, topZ + 0.1 - dip), a0 = [a1[0], a1[1] - 150];
        return <g opacity={a} transform={`translate(${sh} 0)`}><path d={`M${a0[0]} ${a0[1]} L${a1[0]} ${a1[1]}`} stroke={NAVY} strokeWidth={9} strokeLinecap="round" /><path d={`M${a1[0]} ${a1[1] - 26} L${a1[0]} ${a1[1]}`} stroke={YEL} strokeWidth={11} strokeLinecap="round" />
          {[-1, 1].map((s2) => <path key={s2} d={`M${a1[0] + s2 * 18} ${a1[1] - 40} q${s2 * 10} 12 0 24`} fill="none" stroke={YEL} strokeWidth={3.5} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 40)} />)}</g>; })()}
      {/* cure : gouttes */}
      {pi === 8 && TL.cure.map((tg, k) => { const ph = (t - tg) / 0.7; if (ph < 0 || ph > 1) return null; const x = lerp(0.3, 1.7, k / 4); const a = P(x, 0.1, topZ + 0.9 * (1 - ph * ph)); return <path key={k} d={`M${a[0]} ${a[1] - 16} q11 18 0 24 q-11 -6 0 -24z`} fill={NAVY} opacity={0.85 * (1 - 0.3 * ph)} />; })}
    </g>
  );
};

/* ───────────────────────── bonhomme (stickman) casqué : marche, porte, ramasse, pose ───────────────────────── */
type Arm = [number, number];
type Pose = { aL: Arm; aR: Arm; lL: Arm; lR: Arm; lean: number; bob: number };
const dir = (a: number): XY => [Math.sin(rad(a)), Math.cos(rad(a))];
const add = (p: XY, v: XY, k: number): XY => [p[0] + v[0] * k, p[1] + v[1] * k];
const fk = (pose: Pose) => {
  const hip0: XY = [0, -140 + pose.bob]; const a = rad(pose.lean);
  const rot = (p: XY): XY => { const dx = p[0] - hip0[0], dy = p[1] - hip0[1]; return [hip0[0] + dx * Math.cos(a) - dy * Math.sin(a), hip0[1] + dx * Math.sin(a) + dy * Math.cos(a)]; };
  const sh = rot([0, -240 + pose.bob]); const head = rot([0, -282 + pose.bob]);
  const arm = (ar: Arm) => { const e = add(sh, dir(ar[0]), 62); const h = add(e, dir(ar[0] + ar[1]), 58); return { e, h }; };
  const leg = (l: Arm) => { const k = add(hip0, dir(l[0]), 72); const f = add(k, dir(l[0] + l[1]), 72); return { k, f }; };
  return { hip0, sh, head, aL: arm(pose.aL), aR: arm(pose.aR), lL: leg(pose.lL), lR: leg(pose.lR) };
};
type Tool = "none" | "trowel" | "bucket" | "barV" | "barH" | "block" | "rod" | "can";
const Stick: React.FC<{ x: number; y: number; face: 1 | -1; pose: Pose; tool?: Tool; toolAng?: number; s?: number }> = ({ x, y, face, pose, tool = "none", toolAng = 0, s = 1 }) => {
  const J = fk(pose); const { hip0, sh, head, aL, aR, lL, lR } = J;
  const ln = (a: XY, b: XY, c: XY, op = 1, w = 11) => <path d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]}`} stroke={NAVY} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={op} />;
  const hand = aR.h;
  const g = (children: React.ReactNode) => <g transform={`translate(${hand[0]} ${hand[1]}) rotate(${toolAng})`}>{children}</g>;
  const toolEl = (() => {
    if (tool === "trowel") return g(<><path d="M0 0 L46 -4" stroke={NAVY} strokeWidth={8} strokeLinecap="round" /><path d="M40 -22 L96 -2 L40 14 Z" fill="#fff" stroke={NAVY} strokeWidth={5} strokeLinejoin="round" /></>);
    if (tool === "bucket") return g(<><path d="M-4 -26 L56 -26 L46 34 L6 34 Z" fill="#fff" stroke={NAVY} strokeWidth={5} strokeLinejoin="round" /><path d="M-4 -26 L56 -26" stroke={YEL} strokeWidth={7} strokeLinecap="round" /></>);
    if (tool === "can") return g(<><path d="M-6 -20 L50 -20 L44 30 L0 30 Z" fill="#fff" stroke={NAVY} strokeWidth={5} strokeLinejoin="round" /><path d="M50 -4 L96 -26" stroke={NAVY} strokeWidth={7} strokeLinecap="round" /></>);
    if (tool === "barV") return g(<path d="M0 60 L0 -100" stroke={YEL} strokeWidth={9} strokeLinecap="round" />);
    if (tool === "barH") return g(<path d="M-120 0 L120 0" stroke={YEL} strokeWidth={9} strokeLinecap="round" />);
    if (tool === "rod") return g(<path d="M0 0 L0 -100" stroke={NAVY} strokeWidth={9} strokeLinecap="round" />);
    if (tool === "block") return g(<><rect x={-34} y={-34} width={84} height={42} rx={4} fill="#fff" stroke={NAVY} strokeWidth={5} /><rect x={-10} y={-24} width={36} height={22} rx={3} fill="#dfe3f5" stroke={NAVY} strokeWidth={3} /></>);
    return null;
  })();
  return (
    <g transform={`translate(${x} ${y}) scale(${s * face} ${s})`}>
      <ellipse cx={0} cy={4} rx={70} ry={12} fill="#000" opacity={0.08} />
      {ln(sh, aL.e, aL.h, 0.5)}
      {ln(hip0, lL.k, lL.f, 0.55)}{ln(hip0, lR.k, lR.f)}
      <path d={`M${lL.f[0]} ${lL.f[1]} l22 0`} stroke={NAVY} strokeWidth={11} strokeLinecap="round" opacity={0.55} />
      <path d={`M${lR.f[0]} ${lR.f[1]} l22 0`} stroke={NAVY} strokeWidth={11} strokeLinecap="round" />
      <path d={`M${hip0[0]} ${hip0[1]} L${sh[0]} ${sh[1]}`} stroke={NAVY} strokeWidth={13} strokeLinecap="round" />
      <g transform={`translate(${hip0[0]} ${hip0[1]}) rotate(${pose.lean})`}>
        <path d="M-20 0 L-16 -96 L16 -96 L20 0 Z" fill={YEL} stroke={NAVY} strokeWidth={4} strokeLinejoin="round" />
        <path d="M-19 -26 L19 -26 M-18 -52 L18 -52" stroke="#fff" strokeWidth={6} />
      </g>
      <circle cx={head[0]} cy={head[1]} r={30} fill="#fff" stroke={NAVY} strokeWidth={7} />
      <circle cx={head[0] + 11} cy={head[1] + 4} r={3.4} fill={NAVY} />
      <path d={`M${head[0] + 2} ${head[1] + 15} q9 7 19 0`} stroke={NAVY} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d={`M${head[0] - 34} ${head[1] - 6} A34 34 0 0 1 ${head[0] + 34} ${head[1] - 6} Z`} fill={YEL} stroke={NAVY} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M${head[0] - 42} ${head[1] - 5} L${head[0] + 52} ${head[1] - 5}`} stroke={NAVY} strokeWidth={9} strokeLinecap="round" />
      <path d={`M${head[0] - 4} ${head[1] - 38} L${head[0] - 4} ${head[1] - 10}`} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
      {ln(sh, aR.e, aR.h)}
      {toolEl}
    </g>
  );
};

/* ───────────────────────── chorégraphie : état du bonhomme à chaque instant ───────────────────────── */
type WState = { x: number; face: 1 | -1; pose: Pose; tool: Tool; ta: number; hop?: number };
const base = (): Pose => ({ aL: [8, 6], aR: [8, 6], lL: [5, -5], lR: [-5, 5], lean: 0, bob: 0 });
const walkPose = (ph: number, extra: Partial<Pose> = {}): Pose => {
  const s1 = Math.sin(ph), s2 = Math.sin(ph + Math.PI);
  return { aL: [10 + 26 * s2, 12], aR: [10 + 26 * s1, 12], lL: [30 * s2, -22 * Math.max(0, Math.sin(ph + Math.PI + 1.0))], lR: [30 * s1, -22 * Math.max(0, Math.sin(ph + 1.0))], lean: 3, bob: -4 * Math.abs(Math.sin(ph)), ...extra };
};
const stepPh = (x: number) => x * 11;            // phase de marche liée à la distance
const bendPose = (k: number): Pose => ({ aL: [60, 20], aR: [74, 24], lL: [28, -52], lR: [14, -46], lean: 36 * k, bob: 26 * k });
const reachPose = (up: number, k = 1): Pose => ({ aL: [70 + up * 0.4, 20], aR: [80 + up, 10], lL: [6, -6], lR: [-6, 6], lean: 6, bob: 0 });
// trajets « aller chercher puis poser » : liste de [t0, t1, x0, x1, état]
type Leg = [number, number, number, number, "walk" | "carryBar" | "carryBlock" | "pickBar" | "pickBlock" | "plantBar" | "placeBlock" | "layBar", number?];
const PILE_X = 2.5, PAL_X = -0.25;
const shuttle = (tPlace: number, xPick: number, xPlace: number, kind: "bar" | "block", prevEnd: number, up = 0): Leg[] => {
  const dist = Math.abs(xPlace - xPick); const tw = clamp(dist / 4.2, 0.2, 0.5);
  const tPick0 = tPlace - tw - 0.12 - 0.16, tPick1 = tPlace - tw - 0.12;
  const legs: Leg[] = [];
  if (tPick0 - 0.08 > prevEnd) legs.push([prevEnd, tPick0, 0, 0, "walk", -1]);   // placeholder (position résolue ensuite)
  legs.push([tPick0, tPick1, xPick, xPick, kind === "bar" ? "pickBar" : "pickBlock"]);
  legs.push([tPick1, tPlace - 0.12, xPick, xPlace, kind === "bar" ? "carryBar" : "carryBlock"]);
  legs.push([tPlace - 0.12, tPlace + 0.14, xPlace, xPlace, kind === "bar" ? "plantBar" : "placeBlock", up]);
  return legs;
};
const buildLegs = (): Leg[] => {
  const legs: Leg[] = [];
  // P1 : 4 aciers en attente (tas à gauche)
  let prev = S[1] + 0.2;
  TL.rebarV.forEach((tg, k) => { const sl = shuttle(tg, PILE_X - 0.35, BAR_X[k] - 0.35, "bar", prev); legs.push(...sl); prev = sl[sl.length - 1][1]; });
  // P2/P3 : blocs d'angle puis blocs courants (palette à droite)
  prev = S[2] + 1.1;
  [[0, 0], [0, 3], [0, 1], [0, 2]].forEach(([r, i]) => { const b = rowBlocks(r)[i]; const sl = shuttle(LAND[r][i], PAL_X, b.x0 + 0.1, "block", prev, 30); legs.push(...sl); prev = sl[sl.length - 1][1]; });
  // P5 : fers horizontaux
  prev = S[5] + 0.05;
  TL.rebarH.forEach((tg, k) => { const sl = shuttle(tg + 0.15, PILE_X - 0.35, 0.5 + 0.2 * k, "bar", prev, 20); legs.push(...sl); prev = sl[sl.length - 1][1]; });
  return legs;
};
const LEGS = buildLegs();

const workerAt = (t: number): WState => {
  const pi = planAt(t); const lt = t - S[pi]; let w: WState = { x: 1.2, face: 1, pose: base(), tool: "none", ta: 0 };
  const idle = Math.sin(t * 4) * 1.5; w.pose.bob = idle;
  // trajets programmés
  const legs = LEGS.filter((l) => l[0] <= t + 0.7 && l[1] >= t - 0.7);
  const cur = LEGS.find((l) => t >= l[0] && t < l[1] && l[4] !== "walk");
  if (cur && (pi === 1 || pi === 2 || pi === 3 || pi === 5)) {
    const [t0, t1, x0, x1, st, up = 0] = cur; const q = seg(t, t0, t1); const e = eio(q);
    const x = lerp(x0, x1, e);
    if (st === "pickBar" || st === "pickBlock") { const k = Math.sin(Math.PI * q); return { x, face: x < 1.2 ? -1 : 1, pose: { ...bendPose(k), bob: 26 * k + idle * 0.2 }, tool: "none", ta: 0 }; }
    if (st === "carryBar" || st === "carryBlock") { const ph = stepPh(x) + 0.0; const dirx = x1 >= x0 ? 1 : -1; const tool: Tool = st === "carryBar" ? "barV" : "block"; return { x, face: dirx as 1 | -1, pose: walkPose(ph, st === "carryBar" ? { aL: [70, 40], aR: [76, 36] } : { aL: [74, 30], aR: [80, 28] }), tool, ta: st === "carryBar" ? 0 : -6 }; }
    if (st === "plantBar") { const k = Math.sin(Math.PI * q); return { x, face: 1, pose: { ...base(), aL: [40, 10], aR: [46 + 10 * k, 8], lean: 14 * k, bob: 8 * k }, tool: "barV", ta: 0 }; }
    if (st === "placeBlock") { const k = Math.sin(Math.PI * q); return { x, face: 1, pose: { ...base(), aL: [70 + up, 24], aR: [80 + up, 10], lean: 6 }, tool: q < 0.45 ? "block" : "none", ta: -6 + 0 * k }; }
  }
  void legs;
  // marche de retour / attente entre deux tâches (reste près de la dernière position connue)
  const lastLeg = [...LEGS].filter((l) => l[1] <= t && l[4] !== "walk").sort((a, b) => b[1] - a[1])[0];
  const nextLeg = LEGS.filter((l) => l[0] > t && l[4] !== "walk").sort((a, b) => a[0] - b[0])[0];
  const walkBetween = (xa: number, xb: number, ta: number, tb: number): WState => { const q = eio(seg(t, ta, tb)); const x = lerp(xa, xb, q); const dirx = xb >= xa ? 1 : -1; return { x, face: dirx as 1 | -1, pose: walkPose(stepPh(x)), tool: "none", ta: 0 }; };
  const planned = (p: number) => ((p === 1 || p === 2 || p === 3 || p === 5) && lastLeg && nextLeg && planAt(lastLeg[1]) >= p - 1);
  void planned;
  if (pi === 0) {
    if (lt < 0.95) { const q = eo(seg(lt, 0, 0.95)); const x = lerp(3.0, 1.0, q); return { x, face: -1, pose: walkPose(stepPh(x) * 1.0), tool: "none", ta: 0 }; }
    return { x: 1.0, face: 1, pose: { ...base(), aR: [165 + Math.sin(lt * 11) * 14, -14 + Math.sin(lt * 11) * 10], lean: -3, bob: idle }, tool: "none", ta: 0 };
  }
  if (pi === 1 || pi === 2 || pi === 3 || pi === 5) {
    // avant la première tâche / entre tâches / après
    const nl = nextLeg && planAt(nextLeg[0]) === pi ? nextLeg : null; const ll = lastLeg && planAt(lastLeg[1]) === pi ? lastLeg : null;
    if (pi === 2 && t < TL.mortier[1] + 0.05) { // étale le mortier en avançant le long du mur
      const q = eo(seg(t, TL.mortier[0], TL.mortier[1])); const x = lerp(0.1, L - 0.2, q); const sw = Math.sin(t * 9);
      return { x, face: 1, pose: walkPose(stepPh(x), { aL: [26, 40], aR: [86 + sw * 20, -18], lean: 8 }), tool: "trowel", ta: 18 + sw * 12 };
    }
    if (nl && ll) return walkBetween(ll[3], nl[2], ll[1], nl[0]);
    if (nl) return walkBetween(pi === 1 ? 1.0 : pi === 2 ? 2.0 : pi === 3 ? 0.9 : 1.0, nl[2], Math.max(S[pi], nl[0] - 0.7), nl[0]);
    if (ll) return { x: ll[3], face: 1, pose: { ...base(), aR: [120, -6], bob: idle }, tool: "none", ta: 0 };
  }
  if (pi === 3) return { x: 1.0, face: 1, pose: { ...base(), aR: [120, -6], bob: idle }, tool: "none", ta: 0 };
  if (pi === 4) {   // rangs : « place » en rythme en suivant le bloc courant
    let best = { dt: 9, x: 1.0, r: 1 };
    for (let r = 1; r < 5; r++) rowBlocks(r).forEach((b, i) => { const dtt = Math.abs(t - LAND[r][i]); if (dtt < best.dt) best = { dt: dtt, x: (b.x0 + b.x1) / 2, r }; });
    const x = lerp(1.0, best.x - 0.05, 0.85); const cyc = (t * 5.2) % (2 * Math.PI); const lift = Math.abs(Math.sin(cyc / 2));
    return { x, face: 1, pose: { ...base(), aL: [66 + lift * 30 + best.r * 10, 30], aR: [78 + lift * 36 + best.r * 12, 8], lL: [6 + 6 * Math.sin(t * 6), -6], lR: [-6 - 6 * Math.sin(t * 6), 6], lean: 5, bob: idle - lift * 4 }, tool: lift < 0.5 ? "block" : "none", ta: -8 };
  }
  if (pi === 6) {   // cordeau puis niveau
    const x = lt < 0.4 ? lerp(2.1, 0.1, eio(seg(lt, 0, 0.4))) : lt < 1.3 ? lerp(0.1, 1.9, eio(seg(lt, 0.4, 1.2))) : 1.1;
    const moving = lt < 1.25; return { x, face: moving && lt < 0.4 ? -1 : 1, pose: moving ? walkPose(stepPh(x), { aR: [104, -4] }) : { ...base(), aL: [20, 10], aR: [108, -6], bob: idle, lean: 3 }, tool: "none", ta: 0 };
  }
  if (pi === 7) {   // béton : le bonhomme va et vient le long du mur avec son seau
    if (t < TL.pour[0] - 0.3) { const x = lerp(2.1, xPour(TL.pour[0]) - 0.15, eio(seg(lt, 0, 0.8))); return { x, face: 1, pose: { ...walkPose(stepPh(x)), aR: [90, 10] }, tool: "none", ta: 0 }; }
    const xp = xPour(t); const xs = xp - 0.15; const vel = xPour(t + 0.05) - xPour(t - 0.05);
    const tilt = -10 + 62 * eo(seg(t, TL.pour[0] - 0.3, TL.pour[0] + 0.2)) * (1 - eo(seg(t, TL.pour[1] - 0.1, TL.pour[1] + 0.15)));
    return { x: xs, face: 1, pose: { ...walkPose(stepPh(xs) * (vel >= 0 ? 1 : -1)), aL: [70, 30], aR: [150, -8], lean: -2 }, tool: "bucket", ta: tilt };
  }
  if (pi === 8) {
    const q = seg(t, TL.vib[0], TL.vib[1]);
    if (t < TL.cure[0] - 0.1) { const x = lerp(0.35, 1.65, q); return { x, face: 1, pose: { ...walkPose(stepPh(x)), aL: [30, 24], aR: [96, 4], lean: 4 }, tool: "none", ta: 0 }; }
    const x = 1.2 + 0.35 * Math.sin(t * 2.4); return { x, face: 1, pose: { ...walkPose(stepPh(x)), aL: [30, 20], aR: [104, -6] }, tool: "can", ta: -20 + 18 * Math.sin(t * 4) };
  }
  if (pi === 9) { const j = Math.abs(Math.sin(lt * 4.4)) * 12; return { x: 2.7, face: 1, pose: { ...base(), aL: [168 - Math.sin(lt * 9) * 6, 10], aR: [168 + Math.sin(lt * 9) * 6, 10], bob: -j, lean: -2 }, tool: "none", ta: 0, hop: j }; }
  return w;
};
const Worker: React.FC<{ t: number }> = ({ t }) => {
  const w = workerAt(t); const f0 = P(w.x, laneAt(t), 0);
  return <Stick x={f0[0]} y={f0[1] - (w.hop ?? 0)} face={w.face} pose={w.pose} tool={w.tool} toolAng={w.ta} s={SC} />;
};
// filet de béton qui sort du seau (va-et-vient)
const PourStream: React.FC<{ t: number }> = ({ t }) => {
  if (planAt(t) !== 7 || t < TL.pour[0] - 0.05 || t > TL.pour[1] + 0.25) return null;
  const w = workerAt(t); const f0 = P(w.x, laneAt(t), 0); const J = fk(w.pose); const hand = J.aR.h;
  const lipX = f0[0] + w.face * SC * (hand[0] + 52), lipY = f0[1] + SC * (hand[1] - 24);
  const tgt = P(xPour(t), 0.1, Z0 + 1.0 + 0.02);
  const a = eo(seg(t, TL.pour[0] - 0.05, TL.pour[0] + 0.2)) * (1 - eo(seg(t, TL.pour[1], TL.pour[1] + 0.25)));
  return <g opacity={a}><path d={`M${lipX} ${lipY} Q${(lipX + tgt[0]) / 2 + 6} ${lipY + 20} ${tgt[0]} ${tgt[1]}`} stroke={YEL} strokeWidth={13} fill="none" strokeLinecap="round" strokeDasharray="24 10" strokeDashoffset={-t * 170} /><circle cx={tgt[0]} cy={tgt[1]} r={14 + 6 * Math.sin(t * 20)} fill="#f9d9d9" stroke={YEL} strokeWidth={3} opacity={0.9} /></g>;
};

/* ───────────────────────── textes ───────────────────────── */
type Leg2 = { n?: number; ar: string; fr: string };
const LEG: Leg2[] = [
  { ar: "تحب تبني حيط بالـ Bloc à Bancher ؟", fr: "تبع معايا les étapes" },
  { n: 1, ar: "الـ semelle بالـ béton armé", fr: "Aciers en attente" },
  { n: 2, ar: "الصف لولاني فوق الـ mortier", fr: "On commence par les angles" },
  { n: 3, ar: "الـ blocs d'about في الأطراف", fr: "Blocs d'about aux extrémités" },
  { n: 4, ar: "نصفّو البلوكات à sec", fr: "Joints croisés · décalés ≥ 20 cm" },
  { n: 5, ar: "الـ ferraillage في كل rang", fr: "Aciers horizontaux · selon plan" },
  { n: 6, ar: "نريڤلو بالـ niveau والـ cordeau", fr: "Contrôle du travail" },
  { n: 7, ar: "نبِلّو بالماء، ومبعد نصبّو الـ béton", fr: "Béton par passes" },
  { n: 8, ar: "نفيبريو الـ béton ونعملو الـ cure", fr: "Vibration · protection · cure" },
  { ar: "حيط béton armé صحيح وحاضر", fr: "Selon le plan de l'ingénieur" },
];
const Bidi: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/([A-Za-zÀ-ÿ0-9'’≥·+]+(?:[ \-][A-Za-zÀ-ÿ0-9'’≥·+]+)*)/g);
  return <>{parts.map((p, i) => (/[A-Za-zÀ-ÿ]/.test(p) ? <span key={i} dir="ltr" style={{ unicodeBidi: "isolate", display: "inline-block", fontWeight: 800 }}>{p}</span> : <span key={i}>{p}</span>))}</>;
};
const Legend: React.FC<{ pi: number; lt: number }> = ({ pi, lt }) => {
  const it = LEG[pi]; const a = eo(seg(lt, 0.1, 0.5));
  return (
    <div style={{ position: "absolute", right: 120, left: 100, top: 1320, direction: "rtl", opacity: a, transform: `translateY(${(1 - a) * 26}px)` }}>
      <div style={{ width: 64, height: 7, borderRadius: 4, background: YEL, marginBottom: 20 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        {it.n !== undefined && <div style={{ flex: "none", width: 78, height: 78, borderRadius: 39, background: YEL, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center", direction: "ltr" }}>{it.n}</div>}
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 50, lineHeight: 1.3, color: NAVY, textAlign: "right" }}><Bidi text={it.ar} /></div>
      </div>
      <div style={{ marginTop: 14, fontFamily: FONT, fontWeight: 500, fontSize: 31, color: DK, textAlign: "right" }}><Bidi text={it.fr} /></div>
    </div>
  );
};
const TAGS: Record<number, { t: string; dt: number; check?: boolean }[]> = {
  0: [{ t: "BAB = BLOC À BANCHER", dt: 0.6 }, { t: "8 ÉTAPES", dt: 1.3 }],
  1: [{ t: "SEMELLE EN BÉTON ARMÉ", dt: 0.6 }, { t: "ACIERS EN ATTENTE", dt: 1.2, check: true }],
  2: [{ t: "LIT DE MORTIER", dt: 0.6 }, { t: "ANGLES D'ABORD", dt: 1.3, check: true }],
  3: [{ t: "BLOC D'ABOUT", dt: 0.4 }, { t: "AUX EXTRÉMITÉS", dt: 0.8 }],
  4: [{ t: "MONTAGE À SEC", dt: 0.4 }, { t: "JOINTS CROISÉS ≥ 20 cm", dt: 1.0, check: true }],
  5: [{ t: "FERRAILLAGE", dt: 0.3 }, { t: "ACIER À CHAQUE RANG", dt: 0.8 }],
  6: [{ t: "CORDEAU", dt: 0.4 }, { t: "NIVEAU", dt: 1.4, check: true }],
  7: [{ t: "HUMIDIFIER", dt: 0.2 }, { t: "BÉTON LIQUIDE · PAR PASSES", dt: 1.0 }],
  8: [{ t: "VIBRATION DU BÉTON", dt: 0.3 }, { t: "CURE · PROTECTION", dt: 1.4 }],
  9: [{ t: "MUR EN BÉTON ARMÉ", dt: 1.1, check: true }],
};
// zoom / cadrage par plan : [zoom début, zoom fin, focus monde (x, y, z)]
const KZ = 1.22;
const FOCUS: [number, number, [number, number, number]][] = [
  [1.0, 1.04, [1.0, 0.5, 0.5]], [1.0, 1.05, [0.9, 0.5, 0.4]], [1.02, 1.08, [1.0, 0.5, 0.4]], [1.02, 1.08, [1.0, 0.5, 0.4]], [1.0, 1.03, [1.1, 0.5, 0.6]],
  [1.0, 1.04, [0.9, 0.5, 0.6]], [1.05, 1.1, [1.0, 0.4, 0.8]], [1.05, 1.12, [1.0, 0.4, 0.9]], [1.05, 1.12, [1.0, 0.4, 0.9]], [1.0, 1.04, [1.0, 0.5, 0.6]],
];

const Plan: React.FC<{ t: number; pi: number }> = ({ t, pi }) => {
  const lt = t - S[pi];
  const [z0, z1, fw] = FOCUS[pi]; const z = lerp(z0, z1, lt / LEN[pi]) * KZ; const f = P(fw[0], fw[1], fw[2]);
  const cam = `translate(540 880) scale(${z.toFixed(4)}) translate(${-f[0]} ${-f[1]})`;
  return (
    <g>
      <g transform={cam}>
        <World t={t} pi={pi} />
        <Worker t={t} />
        <PourStream t={t} />
        {pi === 9 && Array.from({ length: 16 }, (_, k) => { const ph = seg(lt, TL.result - S[9] - 0.05, TL.result - S[9] + 1.2); const a = (k / 16) * Math.PI * 2, r = 60 + 230 * eo(ph) * (0.6 + 0.4 * Math.abs(Math.sin(k * 7.3))); const c = P(1.0, 0.1, 0.7); return ph > 0 && ph < 1 ? <rect key={k} x={c[0] + Math.cos(a) * r - 7} y={c[1] + Math.sin(a) * r * 0.55 - 7} width={14} height={14} rx={k % 2 ? 7 : 3} fill={k % 3 ? YEL : NAVY} opacity={1 - ph} /> : null; })}
      </g>
      {(TAGS[pi] ?? []).map((tg, k) => <Tag key={k} x={540} y={395 + k * 70} text={tg.t} t={t} t0={S[pi] + tg.dt} check={tg.check} size={29} />)}
    </g>
  );
};

/* ───────────────────────── plan final : CTA ───────────────────────── */
const Star: React.FC<{ r: number }> = ({ r }) => <polygon points={Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`; }).join(" ")} fill="#fff" />;
const Cta: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - S[10];
  const a1 = ebo(seg(lt, 0.1, 0.55)), a2 = ebo(seg(lt, TL.cta[0] - S[10], TL.cta[0] - S[10] + 0.45)), a3 = ebo(seg(lt, TL.cta[1] - S[10], TL.cta[1] - S[10] + 0.45));
  const wave = Math.sin(lt * 9) * 14; const pulse = 1 + 0.035 * Math.sin(lt * 6);
  return (
    <g>
      <Stick x={540} y={790} s={0.62} face={1} pose={{ ...base(), aR: [165 + wave, -14], bob: Math.sin(lt * 4) * 1.5 }} />
      <g transform={`translate(540 860) scale(${clamp(a1, 0, 1.1)})`} opacity={clamp(a1 * 2)}>
        <foreignObject x={-440} y={0} width={880} height={170}>
          <div style={{ direction: "rtl", textAlign: "center", fontFamily: FONT, fontWeight: 800, color: NAVY, fontSize: 68, lineHeight: 1.25 }}>
            <Bidi text="اطلب الـ devis متاعك" />
            <div style={{ width: 150, height: 8, borderRadius: 4, background: YEL, margin: "12px auto 0" }} />
          </div>
        </foreignObject>
      </g>
      <g transform={`translate(540 1170) scale(${clamp(a2, 0, 1.08)})`} opacity={clamp(a2 * 2)}>
        <rect x={-340} y={-62} width={680} height={124} rx={62} fill={YEL} />
        <circle cx={-278} cy={0} r={44} fill="#fff" />
        <g transform="translate(-278 0) scale(2.3) translate(-12 -12)"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z M8.6 9c0 3.6 2.8 6.4 6.4 6.4l1.4-1.5-2.1-1.1-1 .9c-1-.4-1.9-1.3-2.3-2.3l.9-1-1.1-2.1Z" fill="none" stroke={YEL} strokeWidth={1.6} strokeLinejoin="round" /></g>
        <text x={-210} y={-12} fontSize={24} fontWeight={700} fill="#fff" fontFamily={FONT} letterSpacing={2} opacity={0.9}>WHATSAPP</text>
        <text x={-210} y={30} fontSize={44} fontWeight={800} fill="#fff" fontFamily={FONT}>+216 29 611 748</text>
      </g>
      <g transform={`translate(540 1350) scale(${clamp(a3, 0, 1.08) * pulse})`} opacity={clamp(a3 * 2)}>
        <rect x={-340} y={-62} width={680} height={124} rx={62} fill="#fff" stroke={NAVY} strokeWidth={5} />
        <circle cx={-278} cy={0} r={44} fill={YEL} />
        <g transform="translate(-278 0)"><Star r={26} /></g>
        <foreignObject x={-215} y={-50} width={530} height={100}>
          <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "flex-end", direction: "rtl", fontFamily: FONT, fontWeight: 800, color: NAVY, fontSize: 40, lineHeight: 1.2, textAlign: "right" }}><Bidi text="حط الفيديو في الـ favori" /></div>
        </foreignObject>
      </g>
    </g>
  );
};

/* ───────────────────────── transitions + logo + montage ───────────────────────── */
const Wipe: React.FC<{ t: number }> = ({ t }) => {
  const els: React.ReactNode[] = [];
  S.slice(1).concat([END_T]).forEach((T, i) => {
    const q = (t - (T - 0.2)) / 0.4; if (q <= 0 || q >= 1) return;
    const xs = (qq: number) => -1080 + 2160 * clamp(qq);
    els.push(<rect key={"r" + i} x={xs(q + 0.1)} y={0} width={1080} height={1920} fill={YEL} />, <rect key={"n" + i} x={xs(q)} y={0} width={1080} height={1920} fill={NAVY} />);
  });
  return <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>{els}</svg>;
};
const LogoSmall: React.FC<{ t: number }> = ({ t }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }} opacity={Math.min(1, t / 0.4) * (t < END_T ? 1 : 0)}>
    <g transform="translate(430 268) scale(0.217)">
      {LOGO_PATHS.map((p, i) => (p.rect ? <rect key={i} x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} fill={NAVY} /> : <path key={i} d={p.d} fill={p.c === "r" ? "#db4041" : NAVY} />))}
    </g>
  </svg>
);
const OutroRoot: React.FC = () => { const f = useCurrentFrame(); return <div style={{ position: "absolute", inset: 0, background: "#fff" }}><div style={{ position: "absolute", inset: 0, opacity: Math.min(1, f / 10) }}><Outro t={f / FPS} /></div></div>; };

export const BabMontage: React.FC = () => {
  const frame = useCurrentFrame(); const t = frame / FPS;
  const pi = Math.min(9, planAt(t)); const inCta = t >= S[10] && t < END_T;
  return (
    <FontLoader>
      <IsoFonts>
        <AbsoluteFill style={{ background: "#ffffff" }}>
          <BgPan t={t} />
          {t < END_T && !inCta && (
            <>
              <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><Plan t={t} pi={pi} /></svg>
              <Legend pi={pi} lt={t - S[pi]} />
            </>
          )}
          {inCta && <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><Cta t={t} /></svg>}
          <Wipe t={t} />
          <LogoSmall t={t} />
          <Sequence from={Math.round(END_T * FPS)} durationInFrames={Math.round(TL.total * FPS) - Math.round(END_T * FPS)}><OutroRoot /></Sequence>
        </AbsoluteFill>
      </IsoFonts>
    </FontLoader>
  );
};
