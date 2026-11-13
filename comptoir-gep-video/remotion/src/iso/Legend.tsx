import React from "react";
import CAPS from "../captions_new.json";
import { DK, FONT, NAVY, YEL } from "./theme";
import { clamp, eo } from "./engine";

export type Leg = { t0: number; t1: number; title: string; sub: string[] };

/* editorial legend : left aligned, bold navy title + short grey subtitle, lower third */
export const Legend: React.FC<{ t: number; items: Leg[] }> = ({ t, items }) => {
  const it = items.find((i) => t >= i.t0 && t <= i.t1);
  if (!it) return null;
  const a = eo(clamp((t - it.t0) / 0.45)), b = eo(clamp((it.t1 - t) / 0.3));
  const op = Math.min(a, b);
  return (
    <g opacity={op} transform={`translate(0 ${(1 - a) * 22})`}>
      <rect x={70} y={1218} width={64} height={7} rx={3.5} fill={YEL} />
      <text x={70} y={1274} fontSize={46} fontWeight={800} fill={NAVY} fontFamily={FONT}>{it.title}</text>
      {it.sub.map((s, i) => <text key={i} x={70} y={1318 + i * 36} fontSize={28} fontWeight={500} fill={DK} fontFamily={FONT}>{s}</text>)}
    </g>
  );
};

/* Arabic voice transcript, word-synced (current word navy + yellow underline) */
type W = { w: string; s: number; e: number };
const pages: W[][] = [];
(CAPS as { words: W[] }[]).forEach((c) => {
  const ws = c.words;
  if (ws.length <= 7) { pages.push(ws); return; }
  const parts = Math.ceil(ws.length / 6), per = Math.ceil(ws.length / parts);
  for (let i = 0; i < ws.length; i += per) pages.push(ws.slice(i, i + per));
});
const isLat = (w: string) => /[A-Za-z]/.test(w);
export const ArLine: React.FC<{ t: number }> = ({ t }) => {
  let idx = -1;
  pages.forEach((p, i) => { if (t >= p[0].s - 0.07 && t <= p[p.length - 1].e + 0.3) idx = i; });
  if (idx < 0) return null;
  const ws = pages[idx];
  const a = ws[0].s - 0.07, b = ws[ws.length - 1].e + 0.3;
  const op = Math.min(1, (t - a) / 0.12) * Math.min(1, (b - t) / 0.18);
  const sty = (w: W): React.CSSProperties => {
    if (t >= w.s - 0.03 && t < w.e) return { color: NAVY, fontWeight: 800, borderBottom: `5px solid ${YEL}` };
    if (t >= w.e) return { color: DK, fontWeight: 600, borderBottom: "5px solid transparent" };
    return { color: "#9a9a9a", fontWeight: 600, borderBottom: "5px solid transparent" };
  };
  const out: React.ReactNode[] = [];
  let j = 0;
  while (j < ws.length) {
    if (isLat(ws[j].w)) {
      const g: React.ReactNode[] = []; let k = j; let trail = "";
      while (k < ws.length && isLat(ws[k].w)) {
        let tx = ws[k].w; const m = tx.match(/[،؟]+$/);
        if (m) { trail = m[0]; tx = tx.slice(0, -m[0].length); }
        g.push(<span key={k} style={{ ...sty(ws[k]), padding: "0 4px" }}>{tx}</span>, " "); k++;
      }
      out.push(<span key={"g" + j} style={{ direction: "ltr", unicodeBidi: "isolate" }}>{g}</span>);
      if (trail) out.push(<span key={"p" + j} style={{ color: DK }}>{trail}</span>);
      out.push(" "); j = k;
    } else { out.push(<span key={j} style={{ ...sty(ws[j]), padding: "0 4px" }}>{ws[j].w}</span>, " "); j++; }
  }
  return <div style={{ position: "absolute", right: 150, left: 70, bottom: 480, textAlign: "right", direction: "rtl", fontFamily: FONT, fontSize: 38, lineHeight: 1.5, opacity: op }}>{out}</div>;
};
