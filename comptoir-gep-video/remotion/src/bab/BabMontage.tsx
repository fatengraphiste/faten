import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import TL from "./timeline.json";
import { FontLoader } from "../fonts";
import { IsoFonts } from "../iso/fonts";
import { Outro } from "../Outro";
import { BgPan } from "../iso/Bg";
import { LOGO_PATHS } from "../logo";
import { Cam, Tag, clamp, eio, eo, ebo, iso, XY } from "../iso/engine";
import { DK, FONT, FPS, NAVY, YEL, YEL_L } from "../iso/theme";

/* ───────────────────────── chronologie (tools/bab_timeline.py) ───────────────────────── */
const S = TL.starts as number[];
const DROPS = TL.drops as number[][];
const DD = TL.dropDur;
const END_T = TL.outro;
export const BAB_FRAMES = Math.round(TL.total * FPS);
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const rad = (d: number) => (d * Math.PI) / 180;

/* ───────────────────────── monde isométrique (mur BAB) ───────────────────────── */
const C: Cam = { ox: 348, oy: 830, u: 185 };
const P = (x: number, y: number, z: number): XY => iso(C, x, y, z);
const d = (pts: XY[]) => "M" + pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L") + " Z";
const L = 2.5;                       // longueur du mur (m)
const Z0 = 0.22;                     // dessus de la semelle
const BH = 0.2;                      // hauteur d'un bloc
const rowBlocks = (r: number): [number, number][] => r % 2 === 0
  ? [0, 1, 2, 3, 4].map((k) => [0.5 * k, 0.5 * k + 0.5] as [number, number])
  : [[0, 0.25], [0.25, 0.75], [0.75, 1.25], [1.25, 1.75], [1.75, 2.25], [2.25, 2.5]];
const mix = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(lerp(v, pb[i], k)).toString(16).padStart(2, "0")).join("");
};
// avancement du béton (en rangs), avec une pause « par passes » à mi-hauteur
const pourLevel = (t: number) => { const ph = seg(t, TL.pour[0], TL.pour[1]); const q = ph < 0.5 ? ph * 1.1 : ph < 0.62 ? 0.55 : 0.55 + ((ph - 0.62) / 0.38) * 0.45; return 5 * eio(clamp(q)); };

const Block: React.FC<{ r: number; i: number; t: number; fill: number; xray: number }> = ({ r, i, t, fill, xray }) => {
  const [x0, x1] = rowBlocks(r)[i]; const ts = DROPS[r][i]; if (t < ts) return null;
  const z0 = Z0 + BH * r, z1 = z0 + BH, y0 = 0, y1 = 0.2;
  const p = clamp((t - ts) / DD); const dy = -(280 - 40 * r) * (1 - p * p); const land = clamp((t - ts - DD) / 0.18);
  const sq = land > 0 && land < 1 ? 1 - 0.06 * Math.sin(Math.PI * land) : 1;
  const col = mix("#ffffff", "#f6d3d3", fill), colR = mix("#eef0fa", "#efc2c2", fill);
  const left = [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)];
  const right = [P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1)];
  const top = [P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)];
  const w = x1 - x0; const cores = w > 0.3 ? [[0.06, 0.2], [0.3, 0.44]] : [[0.05, 0.2]];
  const base = P(x0, y1, z0);
  return (
    <g transform={`translate(0 ${dy}) translate(${base[0]} ${base[1]}) scale(1 ${sq}) translate(${-base[0]} ${-base[1]})`} opacity={Math.min(1, p * 6) * (1 - 0.62 * xray)}>
      <path d={d(left)} fill={col} stroke={NAVY} strokeWidth={2.6} strokeLinejoin="round" />
      <path d={d(right)} fill={colR} stroke={NAVY} strokeWidth={2.6} strokeLinejoin="round" />
      <path d={d(top)} fill={fill > 0.5 ? "#f6d3d3" : "#ffffff"} stroke={NAVY} strokeWidth={2.6} strokeLinejoin="round" />
      {cores.map((c, k) => <path key={k} d={d([P(x0 + c[0], 0.04, z1), P(x0 + c[1], 0.04, z1), P(x0 + c[1], 0.16, z1), P(x0 + c[0], 0.16, z1)])} fill={fill > 0.5 ? YEL : "#dfe3f5"} fillOpacity={fill > 0.5 ? 0.55 : 1} stroke={NAVY} strokeWidth={1.4} />)}
    </g>
  );
};
// hauteur du mur en x (sert à n'afficher que la partie des aciers qui dépasse)
const topAt = (x: number, t: number) => { let z = Z0; for (let r = 0; r < 5; r++) { const bl = rowBlocks(r).findIndex(([a, b]) => x >= a && x <= b); if (bl >= 0 && t > DROPS[r][bl] + DD) z = Z0 + BH * (r + 1); } return z; };

const Rebar: React.FC<{ a: XY; b: XY; w?: number; op?: number }> = ({ a, b, w = 6, op = 1 }) => <path d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} stroke={YEL} strokeWidth={w} strokeLinecap="round" opacity={op} />;

const World: React.FC<{ t: number; pi: number }> = ({ t, pi }) => {
  const xray = pi === 5 ? eo(seg(t, S[5] + 0.1, S[5] + 0.5)) * (1 - eo(seg(t, S[6] - 0.3, S[6]))) : 0;
  const lvl = t > TL.pour[0] ? pourLevel(t) : 0;
  const sem = seg(t, TL.semelle[0], TL.semelle[1]);
  const semBox = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => [
    [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], [P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1)], [P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)]];
  const sb = semBox(-0.25, L + 0.25, -0.3, 0.5, 0, Z0);
  const ghost = t < S[2] + 1.4 ? 1 - eo(seg(t, S[2] + 0.9, S[2] + 1.4)) : 0;
  const gh = [P(0, 0, Z0 + 1), P(L, 0, Z0 + 1), P(L, 0.2, Z0 + 1), P(0, 0.2, Z0 + 1)];
  const ghB = [P(0, 0.2, Z0), P(L, 0.2, Z0), P(L, 0.2, Z0 + 1), P(0, 0.2, Z0 + 1)];
  const barX = [0.13, 0.63, 1.13, 1.63, 2.13, 2.38];
  const wallTopNow = Math.max(...barX.map((x) => topAt(x, t)));
  return (
    <g>
      {/* contour fantôme du mur fini (accroche) */}
      {ghost > 0 && <g opacity={ghost * eo(seg(t, 0.3, 1.0)) * 0.9} fill="none" stroke={NAVY} strokeWidth={2.4} strokeDasharray="12 10" strokeLinejoin="round"><path d={d(ghB)} /><path d={d(gh)} /></g>}
      {/* semelle */}
      {sem > 0 && (
        <g opacity={eo(clamp(sem * 3))}>
          <g transform={`translate(0 ${-26 * (1 - eo(sem))})`}>
            <path d={d(sb[0])} fill="#f1f1f1" stroke={NAVY} strokeWidth={2.6} strokeLinejoin="round" />
            <path d={d(sb[1])} fill="#e4e4ea" stroke={NAVY} strokeWidth={2.6} strokeLinejoin="round" />
            <path d={d(sb[2])} fill="#f8f8f8" stroke={NAVY} strokeWidth={2.6} strokeLinejoin="round" />
          </g>
        </g>
      )}
      {/* lit de mortier */}
      {t > TL.mortier[0] && (() => { const q = eo(seg(t, TL.mortier[0], TL.mortier[1])); const x1 = L * q; return <path d={d([P(0, -0.02, Z0 + 0.005), P(x1, -0.02, Z0 + 0.005), P(x1, 0.22, Z0 + 0.005), P(0, 0.22, Z0 + 0.005)])} fill="#f6d3d3" stroke={YEL} strokeWidth={2} opacity={1 - 0.0} />; })()}
      {/* blocs : rang par rang, de bas en haut */}
      {[0, 1, 2, 3, 4].map((r) => rowBlocks(r).map((_, i) => (
        <Block key={r + "_" + i} r={r} i={i} t={t} fill={clamp(lvl - r)} xray={xray} />
      )))}
      {/* blocs d'about : surlignés */}
      {pi === 3 && [0, 4].map((k, n) => { const x0 = k === 0 ? 0 : 2, x1 = x0 + 0.5, z0 = Z0, z1 = Z0 + BH; const a = eo(seg(t, TL.about[n], TL.about[n] + 0.3)); const sc = 1 + 0.04 * Math.sin(Math.PI * a);
        return <g key={k} opacity={a}><path d={d([P(x0, 0.2, z0), P(x1, 0.2, z0), P(x1, 0.2, z1), P(x0, 0.2, z1)])} fill={YEL} fillOpacity={0.3} stroke={YEL} strokeWidth={5} strokeLinejoin="round" transform={`scale(${sc})`} style={{ transformOrigin: `${P((x0 + x1) / 2, 0.2, z0)[0]}px ${P((x0 + x1) / 2, 0.2, z0)[1]}px` }} /></g>; })}
      {/* aciers verticaux en attente (partie visible au-dessus du mur) */}
      {barX.map((x, k) => { const tg = TL.rebarV[k]; if (t < tg) return null; const g = eo(seg(t, tg, tg + 0.35)); const zt = Z0 + 0.62 + (pi >= 5 ? 0.62 : 0) * (t > S[5] ? 1 : 0); const zTop = Z0 + (zt - Z0) * g;
        const zb = Math.max(Z0, topAt(x, t)); if (zb >= zTop) return null; return <Rebar key={k} a={P(x, 0.1, zb)} b={P(x, 0.1, zTop)} />; })}
      {/* aciers horizontaux (radiographie du mur) */}
      {pi === 5 && TL.rebarH.map((tg, k) => { const g = eo(seg(t, tg, tg + 0.4)); const z = Z0 + BH * (k + 1) + 0.1 - BH * 0.0 + (k >= 0 ? 0 : 0); return g > 0 ? <Rebar key={k} a={P(0, 0.1, z)} b={P(L * g, 0.1, z)} w={6} /> : null; })}
      {pi === 5 && barX.map((x, k) => { const g = eo(seg(t, S[5] + 0.2, S[5] + 0.7)); return <Rebar key={"v" + k} a={P(x, 0.1, Z0)} b={P(x, 0.1, Z0 + 1.0 * g)} w={5} op={0.9} />; })}
      {/* cordeau + niveau */}
      {pi === 6 && (() => { const a = eo(seg(t, TL.cordeau[0], TL.cordeau[1])); const zt = Z0 + 1.0 + 0.16;
        const p0 = P(-0.3, 0.1, zt), p1 = P(L + 0.3, 0.1, zt); const e = [p0[0] + (p1[0] - p0[0]) * a, p0[1] + (p1[1] - p0[1]) * a];
        const lv = eo(seg(t, TL.level[0] - 0.4, TL.level[0])); const tilt = (1 - eo(seg(t, TL.level[0], TL.level[1]))) * 7 * Math.sin(Math.min(1, (t - TL.level[0]) * 8) * 6);
        const lc = P(1.25, 0.1, Z0 + 1.0), ang = Math.atan2(P(1, 0, 0)[1] - P(0, 0, 0)[1], P(1, 0, 0)[0] - P(0, 0, 0)[0]) * 180 / Math.PI;
        const bub = 24 * Math.sin(Math.max(0, 1 - seg(t, TL.level[0], TL.level[1])) * 8) * (1 - seg(t, TL.level[0], TL.level[1]));
        return <g>
          <path d={`M${p0[0]} ${p0[1]} L${e[0]} ${e[1]}`} stroke={YEL} strokeWidth={4} strokeDasharray="14 9" strokeLinecap="round" />
          {[p0, p1].map((q, k) => <g key={k} opacity={a}><path d={`M${q[0]} ${q[1] + 70} L${q[0]} ${q[1]}`} stroke={NAVY} strokeWidth={5} strokeLinecap="round" /><circle cx={q[0]} cy={q[1]} r={9} fill="#fff" stroke={NAVY} strokeWidth={4} /></g>)}
          <g transform={`translate(${lc[0]} ${lc[1] - 16 - (1 - lv) * 120}) rotate(${ang + tilt})`} opacity={lv}>
            <rect x={-110} y={-15} width={220} height={30} rx={8} fill="#fff" stroke={NAVY} strokeWidth={4} />
            <rect x={-30} y={-9} width={60} height={18} rx={9} fill="#eef0fa" stroke={NAVY} strokeWidth={2.4} />
            <circle cx={bub} cy={0} r={6.5} fill={YEL} />
          </g>
        </g>; })()}
      {/* humidification */}
      {pi === 7 && t > TL.wet && t < TL.pour[0] + 0.2 && Array.from({ length: 9 }, (_, k) => { const ph = (((t - TL.wet) * 1.7 + k * 0.37) % 1); const x = lerp(1.0, 2.4, (k % 5) / 4); const a = P(x, 0.1, Z0 + 1.4 - ph * 0.5); return <path key={k} d={`M${a[0]} ${a[1] - 14} q10 16 0 22 q-10 -6 0 -22z`} fill={NAVY} opacity={0.75 * (1 - ph) * seg(t, TL.wet, TL.wet + 0.2)} />; })}
      {/* coulage : filet de béton */}
      {pi === 7 && t > TL.pour[0] - 0.1 && t < TL.pour[1] + 0.3 && (() => { const s = P(2.4, 0.1, Z0 + 1.0 + 0.42), e = P(2.38, 0.1, Z0 + 1.0 + 0.02); const a = eo(seg(t, TL.pour[0] - 0.1, TL.pour[0] + 0.2)) * (1 - eo(seg(t, TL.pour[1], TL.pour[1] + 0.3)));
        return <path d={`M${s[0]} ${s[1]} L${e[0]} ${e[1]}`} stroke={YEL} strokeWidth={14} strokeLinecap="round" strokeDasharray="22 12" strokeDashoffset={-t * 160} opacity={a} />; })()}
      {/* piquage : aiguille vibrante */}
      {pi === 8 && t > TL.vib[0] - 0.3 && t < TL.vib[1] + 0.3 && (() => { const a = eo(seg(t, TL.vib[0] - 0.3, TL.vib[0])) * (1 - eo(seg(t, TL.vib[1], TL.vib[1] + 0.3)));
        const x = lerp(0.9, 2.3, seg(t, TL.vib[0], TL.vib[1])); const sh = Math.sin(t * 90) * 3.2; const dip = 0.35 * Math.abs(Math.sin((t - TL.vib[0]) * 5.2)); const a0 = P(x, 0.1, Z0 + 1.55 - dip), a1 = P(x, 0.1, Z0 + 1.0 - dip);
        return <g opacity={a} transform={`translate(${sh} 0)`}><path d={`M${a0[0]} ${a0[1] - 90} L${a1[0]} ${a1[1]}`} stroke={NAVY} strokeWidth={9} strokeLinecap="round" /><path d={`M${a1[0]} ${a1[1] - 20} L${a1[0]} ${a1[1]}`} stroke={YEL} strokeWidth={11} strokeLinecap="round" />
          {[-1, 1].map((s2) => <path key={s2} d={`M${a1[0] + s2 * 18} ${a1[1] - 36} q${s2 * 10} 12 0 24`} fill="none" stroke={YEL} strokeWidth={3.5} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 40)} />)}</g>; })()}
      {/* cure : gouttes */}
      {pi === 8 && TL.cure.map((tg, k) => { const ph = (t - tg) / 0.7; if (ph < 0 || ph > 1) return null; const x = lerp(0.3, 2.2, k / 4); const a = P(x, 0.1, Z0 + 1.0 + 0.9 * (1 - ph * ph)); return <path key={k} d={`M${a[0]} ${a[1] - 16} q11 18 0 24 q-11 -6 0 -24z`} fill={NAVY} opacity={0.85 * (1 - 0.3 * ph)} />; })}
    </g>
  );
};

/* ───────────────────────── bonhomme (stickman) avec casque de chantier ───────────────────────── */
type Arm = [number, number];            // [épaule depuis le bas (°), coude relatif (°)]
type Pose = { aL: Arm; aR: Arm; lL?: Arm; lR?: Arm; lean?: number; bob?: number };
const dir = (a: number): XY => [Math.sin(rad(a)), Math.cos(rad(a))];
const add = (p: XY, v: XY, k: number): XY => [p[0] + v[0] * k, p[1] + v[1] * k];
type Tool = "none" | "trowel" | "level" | "bucket" | "rod" | "phone" | "bar" | "block";
const Stick: React.FC<{ x: number; y: number; s?: number; face?: 1 | -1; pose: Pose; tool?: Tool; toolAng?: number; sheet?: number }> = ({ x, y, s = 1, face = -1, pose, tool = "none", toolAng = 0 }) => {
  const bob = pose.bob ?? 0; const lean = pose.lean ?? 0;
  const hip0: XY = [0, -140 + bob]; const hipRot = (p: XY): XY => { const a = rad(lean); const dx = p[0] - hip0[0], dy = p[1] - hip0[1]; return [hip0[0] + dx * Math.cos(a) - dy * Math.sin(a), hip0[1] + dx * Math.sin(a) + dy * Math.cos(a)]; };
  const sh: XY = hipRot([0, -240 + bob]); const head: XY = hipRot([0, -282 + bob]);
  const arm = (a: Arm, back = false) => { const e = add(sh, dir(a[0]), 62); const h = add(e, dir(a[0] + a[1]), 58); return { e, h, back }; };
  const aL = arm(pose.aL, true), aR = arm(pose.aR);
  const lg = (l: Arm): { k: XY; f: XY } => { const k = add(hip0, dir(l[0]), 72); const f = add(k, dir(l[0] + l[1]), 72); return { k, f }; };
  const lL = lg(pose.lL ?? [6, -6]), lR = lg(pose.lR ?? [-6, 6]);
  const ln = (a: XY, b: XY, c: XY, op = 1, w = 11) => <path d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]}`} stroke={NAVY} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={op} />;
  const hand = aR.h;
  const toolEl = (() => {
    if (tool === "none") return null;
    const g = (children: React.ReactNode) => <g transform={`translate(${hand[0]} ${hand[1]}) rotate(${toolAng})`}>{children}</g>;
    if (tool === "trowel") return g(<><path d="M0 0 L46 -4" stroke={NAVY} strokeWidth={8} strokeLinecap="round" /><path d="M40 -22 L96 -2 L40 14 Z" fill="#fff" stroke={NAVY} strokeWidth={5} strokeLinejoin="round" /></>);
    if (tool === "level") return g(<><rect x={-70} y={-14} width={140} height={28} rx={8} fill="#fff" stroke={NAVY} strokeWidth={5} /><circle cx={0} cy={0} r={6} fill={YEL} /></>);
    if (tool === "bucket") return g(<><path d="M-4 -26 L56 -26 L46 34 L6 34 Z" fill="#fff" stroke={NAVY} strokeWidth={5} strokeLinejoin="round" /><path d="M-4 -26 L56 -26" stroke={YEL} strokeWidth={7} strokeLinecap="round" /></>);
    if (tool === "rod") return g(<><path d="M0 0 L0 -90" stroke={NAVY} strokeWidth={9} strokeLinecap="round" /></>);
    if (tool === "phone") return g(<rect x={-18} y={-58} width={36} height={60} rx={8} fill="#fff" stroke={NAVY} strokeWidth={5} />);
    if (tool === "bar") return g(<path d="M-150 0 L20 0" stroke={YEL} strokeWidth={9} strokeLinecap="round" />);
    return g(<><rect x={-8} y={-30} width={78} height={34} rx={4} fill="#fff" stroke={NAVY} strokeWidth={5} /></>);
  })();
  return (
    <g transform={`translate(${x} ${y}) scale(${s * face} ${s})`}>
      <ellipse cx={0} cy={4} rx={70} ry={12} fill="#000" opacity={0.07} />
      {ln(sh, aL.e, aL.h, 0.5)}
      {ln(hip0, lL.k, lL.f, 0.55)}{ln(hip0, lR.k, lR.f)}
      <path d={`M${lL.f[0]} ${lL.f[1]} l22 0`} stroke={NAVY} strokeWidth={11} strokeLinecap="round" opacity={0.55} />
      <path d={`M${lR.f[0]} ${lR.f[1]} l22 0`} stroke={NAVY} strokeWidth={11} strokeLinecap="round" />
      <path d={`M${hip0[0]} ${hip0[1]} L${sh[0]} ${sh[1]}`} stroke={NAVY} strokeWidth={13} strokeLinecap="round" />
      {/* gilet de chantier */}
      <g transform={`translate(${hip0[0]} ${hip0[1]}) rotate(${lean})`}>
        <path d="M-20 0 L-16 -96 L16 -96 L20 0 Z" fill={YEL} stroke={NAVY} strokeWidth={4} strokeLinejoin="round" />
        <path d="M-19 -26 L19 -26 M-18 -52 L18 -52" stroke="#fff" strokeWidth={6} />
      </g>
      <circle cx={head[0]} cy={head[1]} r={30} fill="#fff" stroke={NAVY} strokeWidth={7} />
      <circle cx={head[0] + 11} cy={head[1] + 4} r={3.4} fill={NAVY} />
      <path d={`M${head[0] + 2} ${head[1] + 15} q9 7 19 0`} stroke={NAVY} strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* casque */}
      <path d={`M${head[0] - 34} ${head[1] - 6} A34 34 0 0 1 ${head[0] + 34} ${head[1] - 6} Z`} fill={YEL} stroke={NAVY} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M${head[0] - 42} ${head[1] - 5} L${head[0] + 52} ${head[1] - 5}`} stroke={NAVY} strokeWidth={9} strokeLinecap="round" />
      <path d={`M${head[0] - 4} ${head[1] - 38} L${head[0] - 4} ${head[1] - 10}`} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
      {ln(sh, aR.e, aR.h)}
      {toolEl}
    </g>
  );
};

/* ───────────────────────── plans (3 s chacun) ───────────────────────── */
type Leg = { n?: number; ar: string; fr: string };
const LEG: Leg[] = [
  { ar: "تركيب الـ BAB خطوة بخطوة", fr: "Bloc à bancher · 8 étapes" },
  { n: 1, ar: "الـ semelle بالـ béton armé", fr: "Aciers en attente" },
  { n: 2, ar: "الصف لولاني على mortier", fr: "Angles d'abord · réglage au niveau" },
  { n: 3, ar: "الـ blocs d'about في الأطراف", fr: "Blocs d'about aux extrémités" },
  { n: 4, ar: "نصفّفو الـ blocs à sec", fr: "Joints décalés ≥ 20 cm" },
  { n: 5, ar: "الـ ferraillage في كل rang", fr: "Aciers horizontaux · selon plan" },
  { n: 6, ar: "نراقبو بالـ niveau والـ cordeau", fr: "Contrôle · étaiement si besoin" },
  { n: 7, ar: "نبلّلو وبعد نصبّو الـ béton", fr: "Micro-béton fluide · par passes" },
  { n: 8, ar: "نشقّو الـ béton وندير الـ cure", fr: "Piquage · protection · cure" },
  { ar: "حيط béton armé واجد", fr: "Ferraillage selon l'étude de l'ingénieur" },
];
// mots latins isolés (sens de lecture correct dans une ligne arabe)
const Bidi: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/([A-Za-zÀ-ÿ0-9'’≥·+]+(?:[ \-][A-Za-zÀ-ÿ0-9'’≥·+]+)*)/g);
  return <>{parts.map((p, i) => (/[A-Za-zÀ-ÿ]/.test(p) ? <span key={i} dir="ltr" style={{ unicodeBidi: "isolate", display: "inline-block", fontWeight: 800 }}>{p}</span> : <span key={i}>{p}</span>))}</>;
};
const Legend: React.FC<{ pi: number; lt: number }> = ({ pi, lt }) => {
  const it = LEG[pi]; const a = eo(seg(lt, 0.12, 0.55));
  return (
    <div style={{ position: "absolute", right: 120, left: 100, top: 1320, direction: "rtl", opacity: a, transform: `translateY(${(1 - a) * 26}px)` }}>
      <div style={{ width: 64, height: 7, borderRadius: 4, background: YEL, marginBottom: 20 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        {it.n !== undefined && <div style={{ flex: "none", width: 78, height: 78, borderRadius: 39, background: YEL, color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center", direction: "ltr" }}>{it.n}</div>}
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, lineHeight: 1.3, color: NAVY, textAlign: "right" }}><Bidi text={it.ar} /></div>
      </div>
      <div style={{ marginTop: 14, fontFamily: FONT, fontWeight: 500, fontSize: 31, color: DK, direction: "ltr", textAlign: "right" }}>{it.fr}</div>
    </div>
  );
};

const wobble = (lt: number, f: number, a: number) => Math.sin(lt * f) * a;
// position du bonhomme (à droite du mur)
const SX = P(2.95, 0.35, 0)[0], SY = P(2.95, 0.35, 0)[1];
const Worker: React.FC<{ t: number; pi: number }> = ({ t, pi }) => {
  const lt = t - S[pi]; const idle = Math.sin(t * 4) * 1.6;
  let pose: Pose = { aL: [8, 6], aR: [8, 6], bob: idle }; let tool: Tool = "none"; let ta = 0; let x = SX, y = SY; let sc = 1;
  if (pi === 0) { x += 420 * (1 - eo(seg(lt, 0, 0.9))); pose = { aL: [10, 6], aR: [165 + wobble(lt, 11, 14), -14 + wobble(lt, 11, 10)], bob: idle, lean: -3 }; }
  else if (pi === 1) { pose = { aL: [14, 8], aR: [112 + wobble(lt, 5, 6), 8], bob: idle, lean: 5 }; }
  else if (pi === 2) { const sw = Math.sin(lt * 6); tool = "trowel"; ta = 18 + sw * 12; pose = { aL: [26, 40], aR: [88 + sw * 20, -18], bob: idle, lean: 6 + sw * 2 }; }
  else if (pi === 3) { pose = { aL: [12, 8], aR: [128 + wobble(lt, 4, 4), -6], bob: idle, lean: -2 }; }
  else if (pi === 4) { const lift = Math.abs(Math.sin(lt * 5.2)); tool = "block"; ta = -8; pose = { aL: [60 + lift * 50, 36], aR: [76 + lift * 54, 8], bob: idle - lift * 5, lean: 4 }; }
  else if (pi === 5) { tool = "bar"; ta = -6 + wobble(lt, 4, 3); pose = { aL: [78, 6], aR: [82 + wobble(lt, 4, 3), 4], bob: idle, lean: 3 }; }
  else if (pi === 6) { pose = { aL: [14, 8], aR: [112, -6], bob: idle, lean: 2 }; x = SX - 10; }
  else if (pi === 7) { const tt = seg(lt, 0.7, 1.4); tool = "bucket"; ta = -20 + tt * 70; pose = { aL: [70, 30], aR: [150, -6], bob: idle, lean: -4 }; x = SX - 6; }
  else if (pi === 8) { tool = "rod"; ta = wobble(lt, 38, 3); pose = { aL: [28, 20], aR: [96, 6], bob: idle, lean: 3 }; }
  else if (pi === 9) { const j = Math.abs(Math.sin(lt * 4.4)) * 12; pose = { aL: [12, 6], aR: [168 + wobble(lt, 9, 6), 10], bob: -j, lean: -3 }; }
  return <Stick x={x} y={y - (pi === 9 ? Math.abs(Math.sin(lt * 4.4)) * 10 : 0)} s={sc} face={-1} pose={pose} tool={tool} toolAng={ta} />;
};

const TAGS: Record<number, { t: string; dt: number; check?: boolean }[]> = {
  0: [{ t: "BAB = BLOC À BANCHER", dt: 0.6 }, { t: "8 ÉTAPES", dt: 1.1 }],
  1: [{ t: "SEMELLE EN BÉTON ARMÉ", dt: 0.8 }, { t: "ACIERS EN ATTENTE", dt: 1.4, check: true }],
  2: [{ t: "LIT DE MORTIER", dt: 0.7 }, { t: "ANGLES D'ABORD", dt: 1.3, check: true }],
  3: [{ t: "BLOC D'ABOUT", dt: 0.8 }, { t: "AUX EXTRÉMITÉS", dt: 1.2 }],
  4: [{ t: "MONTAGE À SEC", dt: 0.6 }, { t: "JOINTS DÉCALÉS ≥ 20 cm", dt: 1.2, check: true }],
  5: [{ t: "FERRAILLAGE", dt: 0.6 }, { t: "ACIER À CHAQUE RANG", dt: 1.1 }],
  6: [{ t: "CORDEAU", dt: 0.6 }, { t: "NIVEAU", dt: 1.5, check: true }],
  7: [{ t: "HUMIDIFIER", dt: 0.4 }, { t: "MICRO-BÉTON · PAR PASSES", dt: 1.2 }],
  8: [{ t: "PIQUAGE DU BÉTON", dt: 0.6 }, { t: "CURE · PROTECTION", dt: 1.5 }],
  9: [{ t: "MUR EN BÉTON ARMÉ", dt: 0.7, check: true }],
};
// zoom / cadrage par plan : [zoom début, zoom fin, focus x, focus y]
const KZ = 1.15;
const FOCUS: [number, number, number, number][] = [
  [1.0, 1.04, 532, 880], [1.0, 1.05, 532, 940], [1.02, 1.08, 532, 930], [1.02, 1.08, 540, 930], [1.0, 1.03, 532, 880],
  [1.0, 1.04, 532, 880], [1.05, 1.1, 532, 830], [1.04, 1.1, 600, 830], [1.04, 1.1, 560, 830], [1.0, 1.04, 532, 860],
];

const Plan: React.FC<{ t: number; pi: number }> = ({ t, pi }) => {
  const lt = t - S[pi];
  const [z0, z1, fx, fy] = FOCUS[pi]; const z = lerp(z0, z1, lt / 3) * KZ;
  const cam = `translate(540 880) scale(${z.toFixed(4)}) translate(${-fx} ${-fy})`;
  return (
    <g>
      <g transform={cam}>
        <World t={t} pi={pi} />
        <Worker t={t} pi={pi} />
        {pi === 9 && Array.from({ length: 16 }, (_, k) => { const ph = seg(lt, TL.result - S[9] - 0.05, TL.result - S[9] + 1.2); const a = (k / 16) * Math.PI * 2, r = 60 + 230 * eo(ph) * (0.6 + 0.4 * Math.abs(Math.sin(k * 7.3))); const c = P(1.25, 0.1, 0.7); return ph > 0 && ph < 1 ? <rect key={k} x={c[0] + Math.cos(a) * r - 7} y={c[1] + Math.sin(a) * r * 0.55 - 7} width={14} height={14} rx={k % 2 ? 7 : 3} fill={k % 3 ? YEL : NAVY} opacity={1 - ph} /> : null; })}
      </g>
      {(TAGS[pi] ?? []).map((tg, k) => <Tag key={k} x={540} y={395 + k * 70} text={tg.t} t={t} t0={S[pi] + tg.dt} check={tg.check} size={29} />)}
    </g>
  );
};

/* ───────────────────────── plan final : CTA ───────────────────────── */
const Star: React.FC<{ r: number }> = ({ r }) => <polygon points={Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`; }).join(" ")} fill="#fff" />;
const Cta: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - S[10];
  const a1 = ebo(seg(lt, 0.15, 0.6)), a2 = ebo(seg(lt, TL.cta[0] - S[10], TL.cta[0] - S[10] + 0.45)), a3 = ebo(seg(lt, TL.cta[1] - S[10], TL.cta[1] - S[10] + 0.45));
  const wave = Math.sin(lt * 9) * 14;
  const pulse = 1 + 0.035 * Math.sin(lt * 6);
  return (
    <g>
      <Stick x={540} y={790} s={0.62} face={-1} pose={{ aL: [10, 6], aR: [165 + wave, -14], bob: Math.sin(lt * 4) * 1.5 }} />
      <g transform={`translate(540 860) scale(${clamp(a1, 0, 1.1)})`} opacity={clamp(a1 * 2)}>
        <foreignObject x={-440} y={0} width={880} height={170}>
          <div style={{ direction: "rtl", textAlign: "center", fontFamily: FONT, fontWeight: 800, color: NAVY, fontSize: 68, lineHeight: 1.25 }}>
            <Bidi text="اطلب الـ devis متاعك" />
            <div style={{ width: 150, height: 8, borderRadius: 4, background: YEL, margin: "12px auto 0" }} />
          </div>
        </foreignObject>
      </g>
      {/* WhatsApp */}
      <g transform={`translate(540 1170) scale(${clamp(a2, 0, 1.08)})`} opacity={clamp(a2 * 2)}>
        <rect x={-340} y={-62} width={680} height={124} rx={62} fill={YEL} />
        <circle cx={-278} cy={0} r={44} fill="#fff" />
        <g transform="translate(-278 0) scale(2.3) translate(-12 -12)"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z M8.6 9c0 3.6 2.8 6.4 6.4 6.4l1.4-1.5-2.1-1.1-1 .9c-1-.4-1.9-1.3-2.3-2.3l.9-1-1.1-2.1Z" fill="none" stroke={YEL} strokeWidth={1.6} strokeLinejoin="round" /></g>
        <text x={-210} y={-12} fontSize={24} fontWeight={700} fill="#fff" fontFamily={FONT} letterSpacing={2} opacity={0.9}>WHATSAPP</text>
        <text x={-210} y={30} fontSize={44} fontWeight={800} fill="#fff" fontFamily={FONT}>+216 29 611 748</text>
      </g>
      {/* favoris */}
      <g transform={`translate(540 1350) scale(${clamp(a3, 0, 1.08) * pulse})`} opacity={clamp(a3 * 2)}>
        <rect x={-340} y={-62} width={680} height={124} rx={62} fill="#fff" stroke={NAVY} strokeWidth={5} />
        <circle cx={-278} cy={0} r={44} fill={YEL} />
        <g transform="translate(-278 0)"><Star r={26} /></g>
        <foreignObject x={-215} y={-50} width={530} height={100}>
          <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "flex-end", direction: "rtl", fontFamily: FONT, fontWeight: 800, color: NAVY, fontSize: 40, lineHeight: 1.2, textAlign: "right" }}><Bidi text="خزّن الفيديو في المفضلة" /></div>
        </foreignObject>
      </g>
    </g>
  );
};

/* ───────────────────────── transitions (bandes rouge + bleu) ───────────────────────── */
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
  const pi = Math.min(9, Math.floor(t / 3)); const inCta = t >= S[10] && t < END_T;
  // à la coupe, on change de plan au milieu de la bande
  const show = (T: number) => t >= T;
  void show;
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
          <Sequence from={Math.round(END_T * FPS)} durationInFrames={150}><OutroRoot /></Sequence>
        </AbsoluteFill>
      </IsoFonts>
    </FontLoader>
  );
};
