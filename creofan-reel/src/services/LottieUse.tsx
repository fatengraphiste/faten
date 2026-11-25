import React from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { Lottie, LottieAnimationData } from "@remotion/lottie";

// Charge un fichier Lottie (public/lottie/*.json) ; recolore éventuellement (couleurs → palette Creofan).
const cache: Record<string, LottieAnimationData> = {};
export const useLottie = (name: string, recolor?: (rgb: [number, number, number]) => [number, number, number]) => {
  const key = name + (recolor ? "*" : "");
  const [data, setData] = React.useState<LottieAnimationData | null>(cache[key] ?? null);
  const [h] = React.useState(() => (cache[key] ? null : delayRender("lottie " + name)));
  React.useEffect(() => {
    if (cache[key]) return;
    fetch(staticFile(`lottie/${name}.json`)).then((r) => r.json()).then((j) => {
      const d = recolor ? JSON.parse(JSON.stringify(j), undefined) : j;
      if (recolor) walk(d, recolor);
      cache[key] = d; setData(d); if (h !== null) continueRender(h);
    }).catch((e) => cancelRender(e));
  }, [name]);
  return data;
};
const walk = (o: any, f: (c: [number, number, number]) => [number, number, number]) => {
  if (Array.isArray(o)) { o.forEach((x) => walk(x, f)); return; }
  if (o && typeof o === "object") {
    if ((o.ty === "fl" || o.ty === "st") && o.c && Array.isArray(o.c.k) && typeof o.c.k[0] === "number") { const n = f([o.c.k[0], o.c.k[1], o.c.k[2]]); o.c.k[0] = n[0]; o.c.k[1] = n[1]; o.c.k[2] = n[2]; }
    else if ((o.ty === "fl" || o.ty === "st") && o.c && Array.isArray(o.c.k) && o.c.k[0] && o.c.k[0].s) { o.c.k.forEach((kf: any) => { if (kf.s) { const n = f([kf.s[0], kf.s[1], kf.s[2]]); kf.s[0] = n[0]; kf.s[1] = n[1]; kf.s[2] = n[2]; } if (kf.e) { const n = f([kf.e[0], kf.e[1], kf.e[2]]); kf.e[0] = n[0]; kf.e[1] = n[1]; kf.e[2] = n[2]; } }); }
    Object.values(o).forEach((x) => walk(x, f));
  }
};
// luminance → dégradé Creofan : sombre → rouge, clair → blanc
export const toBrand = (c: [number, number, number]): [number, number, number] => {
  const l = 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  const sat = Math.max(...c) - Math.min(...c);
  if (l > 0.85 && sat < 0.15) return [1, 1, 1];
  if (l < 0.25) return [0.1, 0.1, 0.1];
  const t = Math.min(1, Math.max(0, (l - 0.2) / 0.6));
  return [0.97, 0.196 + t * 0.5, 0.165 + t * 0.55];
};
export const Lot: React.FC<{ name: string; size: number; loop?: boolean; recolor?: boolean; style?: React.CSSProperties }> = ({ name, size, loop = true, recolor = true, style }) => {
  const d = useLottie(name, recolor ? toBrand : undefined);
  if (!d) return null;
  return <div style={{ width: size, height: size, ...style }}><Lottie animationData={d} loop={loop} style={{ width: size, height: size }} /></div>;
};
