import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, interpolate } from "remotion";
import { FontLoader } from "./fonts";
import { Outro } from "./Outro";

export const FPS = 30;
const NAVY = "#19226d", RED = "#db4041", T2 = "#bfc5e4";
const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const eo = (x: number) => 1 - Math.pow(1 - x, 3);
const ei = (x: number) => x * x * x;
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const elastic = (x: number, amp = 1, per = 0.5) => { if (x <= 0) return 0; if (x >= 1) return 1; const a = Math.max(1, amp); const s = (per / (2 * Math.PI)) * Math.asin(1 / a); return 1 - a * Math.pow(2, -10 * x) * Math.sin(((x + s) * 2 * Math.PI) / per); };
const prog = (t: number, t0: number, d: number) => cl((t - t0) / d);
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ───────── chronologie (voix2 = villes + promesse, voix1 = signature) ─────────
const V2_OFF = 4.506;                         // voix1 (4.206 s) d'abord, puis voix2 à V2_OFF
const TRUCK_IN = 1.7;                         // le camion entre dans la scène puis roule au centre
// les villes, dans l'ordre de la voix ; d'autres points de livraison pourront être ajoutés ici (suite)
type City = { ar: string; t0: number; t1: number; fx: string };
const FX = ["pop", "stretch", "drop", "slide", "morph"];
// villes d'une partie : onsets = début de chaque ville dans le fichier de voix ; D = durée du fichier de voix des villes
const INTRO = 1.10;                                   // « أحنا نوصلو » (1.0 s de voix2, coupé à la fin de نوصلو) + 0.1 s, avant la voix des villes
const mk = (names: string[], on: number[], D: number): City[] => names.map((ar, i) => ({ ar, t0: V2_OFF + INTRO + on[i] + 0.03, t1: V2_OFF + INTRO + (i < names.length - 1 ? on[i + 1] - 0.01 : D), fx: FX[i % 5] }));
const TAIL_CUT = 5.72; const TAIL_LEN = 9.95 - TAIL_CUT; // fin commune de voix2 (« وين ما تكون… ») à partir de 5.72 s
const tailPart = (cities: City[], D: number) => ({ cities, tail0: V2_OFF + INTRO + D - TAIL_CUT, end: V2_OFF + INTRO + D + TAIL_LEN + 0.4 });
// ➜ pour une partie suivante : ajouter ici les 5 villes (ordre de la voix) + onsets + durée du fichier voix
export const PARTS: Record<number, { cities: City[]; tail0: number; end: number }> = {
  1: { cities: [
    { ar: "بنزرت", t0: V2_OFF + 0.8, t1: V2_OFF + 1.82, fx: "pop" }, { ar: "سليانة", t0: V2_OFF + 1.84, t1: V2_OFF + 2.83, fx: "stretch" },
    { ar: "الكاف", t0: V2_OFF + 2.84, t1: V2_OFF + 3.8, fx: "drop" }, { ar: "جندوبة", t0: V2_OFF + 3.81, t1: V2_OFF + 4.84, fx: "slide" },
    { ar: "باجة", t0: V2_OFF + 4.85, t1: V2_OFF + 5.78, fx: "morph" }], tail0: V2_OFF, end: V2_OFF + 9.95 + 0.4 },
  2: tailPart(mk(["سيدي بوزيد", "القصرين", "قفصة", "القيروان", "سوسة"], [0, 1.3505, 2.389, 3.3538, 4.275], 4.911), 4.911),
  3: tailPart(mk(["جربة", "مدنين", "قابس", "صفاقس", "المهدية"], [0, 1.2, 2.193, 3.13, 4.116], 4.8326), 4.8326),
};
export const partFrames = (n: number) => Math.round(PARTS[n].end * FPS) + 150;
let CITIES: City[] = PARTS[1].cities; let END = PARTS[1].end;
let PH = { where: [0, 0], time: [0, 0], quality: [0, 0] } as Record<"where" | "time" | "quality", number[]>;
const setPart = (n: number) => { const P = PARTS[n]; CITIES = P.cities; END = P.end; const T = P.tail0; PH = { where: [T + 5.79, T + 6.76], time: [T + 6.78, T + 8.56], quality: [T + 8.63, T + 9.95] }; };
setPart(1);

const WHEELS: [number[], number, number][] = [[[100, 101, 102, 120, 121], 751.5, 1256.5], [[124, 125, 126, 144, 145], 598.5, 1256.5], [[175, 176, 177, 196], 377.5, 1256.5], [[199, 200, 201, 220], 325.5, 1256.5], [[223, 224, 225, 244], 273.5, 1256.5]];
const TRUCK0 = 37, TRUCK1 = 298;
const PCX = 551.5, PCY = 4024.5, PR = 2717.5;          // centre / rayon de la planète (cercle du SVG)
const SPEED = 250;                                      // px/s au niveau de la route

const cityState = (t: number) => { const i = CITIES.findIndex((c) => t >= c.t0 && t < c.t1 + 0.0001); return i; };

const Inner: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS; const host = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null); const [h] = useState(() => delayRender("camion svg"));
  useEffect(() => { fetch(staticFile("camion-user.svg")).then((r) => r.text()).then(setSvg); }, []);
  useEffect(() => { if (svg) requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h))); }, [svg, h]);
  const ci = cityState(t); const city = ci >= 0 ? CITIES[ci] : null;

  useLayoutEffect(() => {
    const s = host.current?.querySelector("svg") as SVGSVGElement | null;     if (!s) return;
    try {
    const q = (i: number) => s.querySelector(`[data-i="${i}"]`) as SVGElement | null;
    // initialisation unique : tirets de route procéduraux (remplacent le tracé fixe)
    if (!s.querySelector("#dashes")) {
      const d27 = q(27); if (d27) d27.style.display = "none";
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("id", "dashes");
      for (let k = -8; k <= 8; k++) { const r = document.createElementNS("http://www.w3.org/2000/svg", "rect"); r.setAttribute("x", "-14"); r.setAttribute("y", "-5.5"); r.setAttribute("width", "28"); r.setAttribute("height", "11"); r.setAttribute("rx", "5"); r.setAttribute("fill", "#cccccc"); r.setAttribute("transform", `translate(${PCX} ${PCY}) rotate(${(k * 43.4 / PR) * 180 / Math.PI}) translate(0 ${-PR})`); g.appendChild(r); }
      d27?.parentElement?.insertBefore(g, d27.nextSibling);
    }
    const dth = 43.4 / PR; const ang = -((SPEED * t) % 43.4) / PR;                // défilement en boucle d'une période de tirets
    const dg = s.querySelector("#dashes") as SVGElement; dg.setAttribute("transform", `rotate(${(ang * 180) / Math.PI} ${PCX} ${PCY})`);
    // décor de la planète
    const dec = s.querySelector("#planet-decor") as SVGElement | null; if (dec) dec.setAttribute("transform", `rotate(${((-SPEED * t) / PR) * 180 / Math.PI * 0.6} ${PCX} ${PCY})`);
    // camion : rebond + roues
    const wheelAngle = ((SPEED * t) / 22.5) * 180 / Math.PI; const bob = 1.6 * Math.sin(t * 9) + 0.8 * Math.sin(t * 21);
    const tx0 = 0; const bobK = 1; const wa2 = wheelAngle;
    for (let i = TRUCK0; i <= TRUCK1; i++) { const e = q(i); if (e) e.setAttribute("transform", `translate(${tx0.toFixed(1)} ${(bob * bobK).toFixed(2)})`); }
    for (const [ids, cx, cy] of WHEELS) for (const i of ids) { const e = q(i); if (e) e.setAttribute("transform", `translate(${tx0.toFixed(1)} ${(bob * bobK).toFixed(2)}) rotate(${wa2.toFixed(2)} ${cx} ${cy})`); }
    // nuages / soleil : dérive douce
    [[322, 34, 0.55], [323, -30, 0.45], [326, 26, 0.7], [343, -38, 0.5]].forEach(([i, A, w], k) => { const e = q(i); if (e) e.setAttribute("transform", `translate(${(A * Math.sin(t * w + k * 1.7)).toFixed(2)} ${(7 * Math.sin(t * 0.9 + k * 2.3)).toFixed(2)})`); });
    { const hs = 1 + 0.07 * Math.sin(t * 1.6); const e = q(324); if (e) e.setAttribute("transform", `translate(190.45 454.82) scale(${hs.toFixed(3)}) translate(-190.45 -454.82)`);
      const e2 = q(325); if (e2) e2.setAttribute("transform", `translate(190.45 454.82) scale(${(1 + 0.025 * Math.sin(t * 1.6 + 1)).toFixed(3)}) translate(-190.45 -454.82)`); }
    // nom de la ville (texte du SVG) + épingle + mât
    const tx = q(340) as SVGTextElement | null; const pin = q(339); const pole = q(342);
    if (tx && pin && pole) {
      const c = city; const k = ci;
      if (c) {
        const tspan = tx.querySelector("tspan"); if (tspan && tspan.textContent !== c.ar) tspan.textContent = c.ar;
        tx.setAttribute("text-anchor", "middle"); tx.style.fontFamily = "GEPF, Cairo, sans-serif"; tx.style.fontWeight = "800";
        if (tspan) tspan.setAttribute("x", "0");
        const raw = tx.getBBox().width || 400; const fit = Math.min(0.92, 440 / raw);
        const lt = t - c.t0; const outP = prog(t, c.t1 - 0.14, 0.14);
        let sx = 1, sy = 1, dy = 0, dx = 0, op = 1, blur = 0, rot = 0;
        if (c.fx === "pop") { const e = elastic(prog(lt, 0, 0.55), 1.3, 0.5); sx = sy = e; rot = (1 - e) * -10; }
        else if (c.fx === "stretch") { const e = eo(prog(lt, 0, 0.35)); sx = 1 + (1 - e) * 3; sy = 1 - (1 - e) * 0.4; blur = (1 - e) * 14; op = cl(lt * 8); }
        else if (c.fx === "drop") { const q2 = prog(lt, 0, 0.6); dy = q2 < 0.55 ? -520 * (1 - ei(q2 / 0.55)) : -60 * Math.sin(Math.PI * (q2 - 0.55) / 0.45) * (1 - q2) * 2.2; if (q2 > 0.5 && q2 < 0.65) { sx = 1.12; sy = 0.88; } op = cl(lt * 8); }
        else if (c.fx === "slide") { const e = elastic(prog(lt, 0, 0.55), 1.1, 0.6); dx = -700 * (1 - e); op = cl(lt * 8); }
        else { const e = elastic(prog(lt, 0, 0.7), 1.2, 0.5); sx = 0.2 + 0.8 * e; sy = 1.6 - 0.6 * e; blur = (1 - Math.min(1, e)) * 8; op = cl(lt * 6); }
        op *= 1 - outP; blur += outP * 6;
        tx.setAttribute("transform", `translate(${430 + dx} ${887 + dy}) rotate(${rot}) scale(${(sx * fit).toFixed(3)} ${(sy * fit).toFixed(3)})`);
        tx.style.opacity = String(op); tx.style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : "none";
        // épingle + ligne = UN SEUL objet : tombe d'en haut, rebondit, s'écrase légèrement sur la planète, puis rentre dans le sol
        const outR = eio(prog(t, c.t1 - 0.22, 0.2)); const pd = prog(lt, 0.02, 0.5);
        const pdy = pd < 0.6 ? -300 * (1 - ei(pd / 0.6)) : -46 * Math.sin(Math.PI * (pd - 0.6) / 0.4) * (1 - pd) * 2.2;
        const sq = pd > 0.58 && pd < 0.78 ? Math.sin(Math.PI * (pd - 0.58) / 0.2) : 0;
        const k1 = 1 - outR; const M = `translate(893.4 1461.6) scale(${((1 + 0.1 * sq) * k1).toFixed(3)} ${((1 - 0.1 * sq) * k1).toFixed(3)}) translate(-893.4 -1461.6) translate(0 ${pdy.toFixed(1)})`;
        for (const e of [pin, pole]) { e.setAttribute("transform", M); e.style.opacity = String(cl(lt * 14)); }
        void k;
      } else { tx.style.opacity = "0"; pin.style.opacity = "0"; pole.style.opacity = "0"; }
    }
    } catch (e) { console.log("FXERR", String(e)); }
  });

  const logoA = interpolate(f, [0, 10, Math.round(END * FPS) - 6, Math.round(END * FPS)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lt = (k: [number, number]) => t - k[0];
  return (
    <>
      <AbsoluteFill style={{ background: "#fff" }}>
        <div ref={host} style={{ position: "absolute", inset: 0, opacity: 1 }} dangerouslySetInnerHTML={svg ? { __html: svg } : undefined} />
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          {CITIES.map((c, i) => t >= c.t0 + 0.3 && t < c.t0 + 1.2 ? Array.from({ length: 14 }, (_, k) => { const a = (k / 14) * Math.PI * 2, p = (t - c.t0 - 0.3) / 0.9, d = 40 + 110 * eo(p) * (0.5 + 0.5 * rnd(k + i)); return <rect key={i + "_" + k} x={893 + Math.cos(a) * d - 6} y={1440 - Math.abs(Math.sin(a)) * d * 0.6 - 6} width={12} height={12} rx={k % 2 ? 6 : 3} fill={k % 3 ? RED : "#fff"} opacity={1 - p} />; }) : null)}
        </svg>
        <Overlay t={t} />
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0 }} />
        <Sequence from={Math.round(END * FPS)} durationInFrames={150}><OutroW /></Sequence>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} opacity={0}><g />{logoA}</svg>
      </AbsoluteFill>
    </>
  );
};
const mkPart = (n: number): React.FC => () => { setPart(n); return <FontLoader><Inner /></FontLoader>; };
export const CamionUser = mkPart(1); export const CamionUser2 = mkPart(2); export const CamionUser3 = mkPart(3);

const FONTF = "GEPF, Cairo, sans-serif";
const L1 = 1.38, L2 = 2.5, SH0 = V2_OFF - 0.65, SH1 = V2_OFF + 0.55;
const Banner: React.FC<{ t: number }> = ({ t }) => {
  // « سلعة متاعك توصل / لوين إنت موجود ! » : grand, calé sur voix1, puis réduit en haut du plan des villes
  const t1 = CITIES[CITIES.length - 1].t1;
  if (t < L1 - 0.05 || t > t1 + 0.05) return null;
  const m = eio(prog(t, SH0, SH1 - SH0)); const y = 680 + (500 - 680) * m; const sc = 1 - 0.42 * m;
  const fade = 1 - prog(t, t1 - 0.2, 0.2);
  const lines = [["سلعة متاعك توصل", L1, RED], ["لوين إنت موجود !", L2, NAVY]] as const;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", direction: "rtl", fontFamily: FONTF, fontWeight: 800, fontSize: 84, lineHeight: 1.22, transform: `scale(${sc})`, transformOrigin: "50% 0%", opacity: fade }}>
      {lines.map(([l, t0, c], i) => <div key={i} style={{ color: c, transform: `scale(${elastic(prog(t, t0, 0.55), 1.25, 0.5)})`, opacity: prog(t, t0, 0.12) }}>{l}</div>)}
    </div>
  );
};
const Overlay: React.FC<{ t: number }> = ({ t }) => {
  const outro = prog(t, END - 0.2, 0.2);
  const txt = (key: keyof typeof PH, text: string, y: number, size: number, color: string, mode: "pop" | "slide" | "stretch" = "pop") => {
    const [a, b] = PH[key]; if (t < a || t > b + 0.12) return null; const lt2 = t - a; const out = prog(t, b - 0.05, 0.17);
    const e = mode === "pop" ? elastic(prog(lt2, 0, 0.5), 1.3, 0.5) : eo(prog(lt2, 0, 0.35)); const tr = mode === "slide" ? `translateX(${(1 - e) * -600}px)` : mode === "stretch" ? `scaleX(${1 + (1 - e) * 2.5})` : `scale(${e})`;
    return <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", direction: "rtl", fontFamily: FONTF, fontWeight: 800, fontSize: size, color, transform: tr, opacity: cl(lt2 * 8) * (1 - out), filter: mode === "stretch" ? `blur(${(1 - e) * 10}px)` : "none" }}>{text}</div>;
  };
  return (
    <>
      <div style={{ opacity: 1 - outro }}><Banner t={t} /></div>
      {txt("where", "وين ما تكون", 700, 112, NAVY, "pop")}
      {txt("time", "سلعتك توصللك", 690, 78, NAVY, "slide")}
      {txt("time", "في وقتها", 780, 112, RED, "pop")}
      {txt("quality", "جودة مضمونة", 700, 100, NAVY, "stretch")}
      {t > PH.time[0] + 0.1 && t < PH.time[1] + 0.1 && <Clock t={t - PH.time[0] - 0.1} />}
      {t > PH.quality[0] + 0.1 && t < PH.quality[1] + 0.4 && <Shield t={t - PH.quality[0] - 0.1} />}
    </>
  );
};
const Clock: React.FC<{ t: number }> = ({ t }) => {
  const p = elastic(prog(t, 0, 0.5), 1.3, 0.5);
  return <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><g transform={`translate(540 560) scale(${p * 0.85})`}><circle r={64} fill="#fff" stroke={NAVY} strokeWidth={10} /><path d={`M0 -36 V0 L${28 * Math.cos(t * 8)} ${28 * Math.sin(t * 8)}`} stroke={RED} strokeWidth={10} strokeLinecap="round" fill="none" /><circle r={8} fill={NAVY} /></g></svg>;
};
const Shield: React.FC<{ t: number }> = ({ t }) => {
  const p = elastic(prog(t, 0, 0.5), 1.3, 0.5); const tick = prog(t, 0.25, 0.4);
  return <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><g transform={`translate(540 560) scale(${p * 0.85})`}><path d="M0 -70 L58 -48 V6 Q58 52 0 78 Q-58 52 -58 6 V-48 Z" fill={NAVY} /><path d="M-26 4 L-8 24 L28 -20" stroke="#fff" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} /></g></svg>;
};
const OutroW: React.FC = () => { const f = useCurrentFrame(); return <div style={{ position: "absolute", inset: 0, background: "#fff" }}><div style={{ position: "absolute", inset: 0, opacity: Math.min(1, f / 10) }}><Outro t={f / FPS} /></div></div>; };
