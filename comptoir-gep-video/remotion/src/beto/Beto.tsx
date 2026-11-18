import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

// Béto (rig fourni par l'utilisateur, jamais redessiné) piloté image par image : bras, bouche, marche, clignement
const OVERRIDE = "#beto-svg,#beto-svg *{animation:none !important;transition:none !important}";
export type BetoState = { t: number; l: string; r: string; v: string; raise: number; walking: boolean; wiggle: boolean; talking: boolean };
const PH = (t: number, d: number) => (t % d) / d;

export const useRig = () => {
  const [svg, setSvg] = useState<string | null>(null); const [h] = useState(() => delayRender("beto rig"));
  useEffect(() => { fetch(staticFile("beto/rig.svg")).then((r) => r.text()).then((s) => setSvg(s)).finally(() => continueRender(h)); }, [h]);
  return svg;
};

export const Beto: React.FC<{ svg: string; s: BetoState; width: number }> = ({ svg, s, width }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current?.querySelector("#beto-svg") as SVGSVGElement | null; if (!root) return;
    root.setAttribute("data-l", s.l); root.setAttribute("data-r", s.r);
    root.querySelector("#mouth")?.setAttribute("data-v", s.v);
    root.classList.toggle("walking", s.raise > 0.02); root.classList.toggle("wiggle", s.wiggle);
    (root.querySelector("#beto") as SVGElement).style.transform = `translateY(${-26 * s.raise}px)`;
    const ph = Math.floor(PH(s.t, 0.64) * 4);
    for (let i = 1; i <= 4; i++) root.querySelectorAll<SVGElement>(".wf" + i).forEach((e) => { e.style.opacity = s.walking && ph === i - 1 ? "1" : "0"; });
    const torso = root.querySelector(".torso") as SVGElement;
    torso.style.transform = s.walking ? `translateY(${ph === 1 || ph === 3 ? -6 : 0}px)` : s.talking ? `rotate(${-1.2 * (0.5 - 0.5 * Math.cos((2 * Math.PI * s.t) / 1.1))}deg)` : "none";
    root.querySelectorAll<SVGElement>(".swR").forEach((e) => { e.style.transform = s.wiggle ? `rotate(${-9 * (0.5 - 0.5 * Math.cos((2 * Math.PI * s.t) / 0.55))}deg)` : "none"; });
    const bp = PH(s.t, 4.2); const sc = bp > 0.94 ? 1 - 0.9 * (1 - Math.min(1, Math.abs(bp - 0.97) / 0.03)) : 1;
    root.querySelectorAll<SVGElement>(".eye").forEach((e) => { e.style.transform = `scaleY(${sc})`; });
  });
  return (
    <div ref={ref} style={{ width, pointerEvents: "none" }}>
      <style>{OVERRIDE}</style>
      <div style={{ width, height: (width * 740) / 1310 }} dangerouslySetInnerHTML={{ __html: svg.replace("<svg ", `<svg width="${width}" height="${(width * 740) / 1310}" `) }} />
    </div>
  );
};
