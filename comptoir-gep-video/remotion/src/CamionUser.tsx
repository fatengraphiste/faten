import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, interpolate } from "remotion";
import { FontLoader } from "./fonts";
import { Outro } from "./Outro";
import { LOGO_PATHS } from "./logo";

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
const V1_OFF = 10.25;                         // début de voix1 (voix2 dure 9.95 s + 0.3 s)
const VOICE_END = V1_OFF + 4.206;
export const END = VOICE_END + 0.4;           // début de l'outro
// les villes, dans l'ordre de la voix ; d'autres points de livraison pourront être ajoutés ici (suite)
export const CITIES = [
  { ar: "بنزرت", t0: 0.8, t1: 1.82, fx: "pop" },
  { ar: "سليانة", t0: 1.84, t1: 2.83, fx: "stretch" },
  { ar: "الكاف", t0: 2.84, t1: 3.8, fx: "drop" },
  { ar: "جندوبة", t0: 3.81, t1: 4.84, fx: "slide" },
  { ar: "باجة", t0: 4.85, t1: 5.78, fx: "morph" },
] as const;
const PH = { where: [5.79, 6.76], time: [6.78, 8.56], quality: [8.63, 9.95], with: [V1_OFF, V1_OFF + 1.1], slogan: [V1_OFF + 1.38, V1_OFF + 3.78] };

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
    for (let i = TRUCK0; i <= TRUCK1; i++) { const e = q(i); if (e) e.setAttribute("transform", `translate(0 ${bob.toFixed(2)})`); }
    for (const [ids, cx, cy] of WHEELS) for (const i of ids) { const e = q(i); if (e) e.setAttribute("transform", `translate(0 ${bob.toFixed(2)}) rotate(${wheelAngle.toFixed(2)} ${cx} ${cy})`); }
    // nuages / soleil : dérive douce
    for (const i of [322, 323, 326, 343]) { const e = q(i); if (e) e.setAttribute("transform", `translate(${(14 * Math.sin(t * 0.6 + i)).toFixed(2)} ${(5 * Math.sin(t * 0.9 + i)).toFixed(2)})`); }
    const sun = 1 + 0.03 * Math.sin(t * 1.5); for (const i of [324, 325]) { const e = q(i); if (e) e.setAttribute("transform", `translate(${190} ${440}) scale(${sun}) translate(-190 -440)`); }
    // nom de la ville (texte du SVG) + épingle + mât
    const tx = q(340) as SVGTextElement | null; const pin = q(339); const pole = q(342);
    if (tx && pin && pole) {
      const c = city; const k = ci;
      if (c) {
        const tspan = tx.querySelector("tspan"); if (tspan && tspan.textContent !== c.ar) tspan.textContent = c.ar;
        tx.setAttribute("text-anchor", "middle"); tx.style.fontFamily = "GEPF, Cairo, sans-serif"; tx.style.fontWeight = "800";
        if (tspan) tspan.setAttribute("x", "0");
        const raw = tx.getBBox().width || 400; const fit = Math.min(1, 520 / raw);
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
        // mât qui pousse puis épingle qui retombe en rebondissant
        const pg = prog(lt, 0.05, 0.25); pole.setAttribute("transform", `translate(0 1330) scale(1 ${pg.toFixed(3)}) translate(0 -1330)`); pole.style.opacity = String(1 - outP);
        const pd = prog(lt, 0.22, 0.6); const drop = pd < 0.5 ? -330 * (1 - ei(pd / 0.5)) : -34 * Math.sin(Math.PI * (pd - 0.5) / 0.5) * (1 - pd) * 2.2; const ps = 0.8 + 0.2 * elastic(prog(lt, 0.2, 0.5), 1.3, 0.5);
        pin.setAttribute("transform", `translate(894 968) scale(${ps.toFixed(3)}) translate(-894 -968) translate(0 ${drop.toFixed(1)})`); pin.style.opacity = String(cl(lt * 10) * (1 - outP));
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
          {CITIES.map((c, i) => t >= c.t0 + 0.4 && t < c.t0 + 1.4 ? Array.from({ length: 14 }, (_, k) => { const a = (k / 14) * Math.PI * 2, p = (t - c.t0 - 0.4) / 0.9, d = 150 * eo(p) * (0.5 + 0.5 * rnd(k + i)); return <rect key={i + "_" + k} x={894 + Math.cos(a) * d - 6} y={968 + Math.sin(a) * d * 0.7 - 6} width={12} height={12} rx={k % 2 ? 6 : 3} fill={k % 3 ? RED : NAVY} opacity={1 - p} />; }) : null)}
        </svg>
        <Overlay t={t} />
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0 }} />
        <Sequence from={Math.round(END * FPS)} durationInFrames={150}><OutroW /></Sequence>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} opacity={0}><g />{logoA}</svg>
      </AbsoluteFill>
    </>
  );
};
export const CamionUser: React.FC = () => <FontLoader><Inner /></FontLoader>;

const FONTF = "GEPF, Cairo, sans-serif";
const Banner: React.FC<{ t: number; big: number }> = ({ t, big }) => {
  // « سلعة متاعك توصل لوين إنت موجود! » : au-dessus du nom de la ville ; s'agrandit à la fin (signature)
  const a = elastic(prog(t, 0.3, 0.6), 1.2, 0.55); const w1 = prog(t, 0.3, 0.2);
  const sc = 1 + 0.55 * big; const y = 520 + (780 - 520) * big;
  const lines = ["سلعة متاعك توصل", "لوين إنت موجود !"];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", direction: "rtl", fontFamily: FONTF, fontWeight: 800, color: RED, fontSize: 60, lineHeight: 1.18, transform: `scale(${a * sc})`, opacity: w1, transformOrigin: "50% 0%" }}>
      {lines.map((l, i) => <div key={i} style={{ color: i === 1 ? NAVY : RED }}>{l}</div>)}
    </div>
  );
};
const Overlay: React.FC<{ t: number }> = ({ t }) => {
  const big = eio(prog(t, PH.slogan[0] - 0.3, 0.6)); const outro = prog(t, END - 0.2, 0.2);
  const inCities = t < PH.where[0] - 0.05;
  const txt = (key: keyof typeof PH, text: string, y: number, size: number, color: string, mode: "pop" | "slide" | "stretch" = "pop") => {
    const [a, b] = PH[key]; if (t < a || t > b + 0.12) return null; const lt2 = t - a; const out = prog(t, b - 0.05, 0.17);
    const e = mode === "pop" ? elastic(prog(lt2, 0, 0.5), 1.3, 0.5) : eo(prog(lt2, 0, 0.35)); const tr = mode === "slide" ? `translateX(${(1 - e) * -600}px)` : mode === "stretch" ? `scaleX(${1 + (1 - e) * 2.5})` : `scale(${e})`;
    return <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", direction: "rtl", fontFamily: FONTF, fontWeight: 800, fontSize: size, color, transform: tr, opacity: cl(lt2 * 8) * (1 - out), filter: mode === "stretch" ? `blur(${(1 - e) * 10}px)` : "none" }}>{text}</div>;
  };
  const withLogo = t >= PH.with[0] - 0.05 && t < PH.slogan[0];
  return (
    <>
      <div style={{ opacity: 1 - outro }}><Banner t={t} big={big} /></div>
      {txt("where", "وين ما تكون", 730, 130, NAVY, "pop")}
      {txt("time", "سلعتك توصللك", 700, 92, NAVY, "slide")}
      {txt("time", "في وقتها", 810, 130, RED, "pop")}
      {txt("quality", "جودة مضمونة", 730, 118, NAVY, "stretch")}
      {t > PH.time[0] + 0.8 && t < PH.time[1] + 0.1 && <Clock t={t - PH.time[0] - 0.8} />}
      {t > PH.quality[0] + 0.5 && t < PH.quality[1] + 0.4 && <Shield t={t - PH.quality[0] - 0.5} />}
      {withLogo && (() => { const p = elastic(prog(t, PH.with[0], 0.6), 1.3, 0.5); return <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><g transform={`translate(540 760) scale(${0.62 * p}) translate(-485 -125)`}>{LOGO_PATHS.map((p2, i) => (p2.rect ? <rect key={i} x={p2.rect[0]} y={p2.rect[1]} width={p2.rect[2]} height={p2.rect[3]} fill={NAVY} /> : <path key={i} d={p2.d} fill={p2.c === "r" ? RED : NAVY} />))}</g></svg>; })()}
    </>
  );
};
const Clock: React.FC<{ t: number }> = ({ t }) => {
  const p = elastic(prog(t, 0, 0.5), 1.3, 0.5);
  return <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><g transform={`translate(150 880) scale(${p})`}><circle r={64} fill="#fff" stroke={NAVY} strokeWidth={10} /><path d={`M0 -36 V0 L${28 * Math.cos(t * 8)} ${28 * Math.sin(t * 8)}`} stroke={RED} strokeWidth={10} strokeLinecap="round" fill="none" /><circle r={8} fill={NAVY} /></g></svg>;
};
const Shield: React.FC<{ t: number }> = ({ t }) => {
  const p = elastic(prog(t, 0, 0.5), 1.3, 0.5); const tick = prog(t, 0.25, 0.4);
  return <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><g transform={`translate(940 800) scale(${p})`}><path d="M0 -70 L58 -48 V6 Q58 52 0 78 Q-58 52 -58 6 V-48 Z" fill={NAVY} /><path d="M-26 4 L-8 24 L28 -20" stroke="#fff" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} /></g></svg>;
};
const OutroW: React.FC = () => { const f = useCurrentFrame(); return <div style={{ position: "absolute", inset: 0, background: "#fff" }}><div style={{ position: "absolute", inset: 0, opacity: Math.min(1, f / 10) }}><Outro t={f / FPS} /></div></div>; };
