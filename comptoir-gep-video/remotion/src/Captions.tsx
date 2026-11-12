import React from "react";
import CAPS from "./captions.json";
import { FONT, NAVY, RED, eo, clamp } from "./lib";

type W = { w: string; s: number; e: number };
const pages: W[][] = [];
(CAPS as { words: W[] }[]).forEach((c) => {
  const ws = c.words;
  if (ws.length <= 8) { pages.push(ws); return; }
  const parts = Math.ceil(ws.length / 7), per = Math.ceil(ws.length / parts);
  for (let i = 0; i < ws.length; i += per) pages.push(ws.slice(i, i + per));
});
const isLat = (w: string) => /[A-Za-z]/.test(w);

export const Captions: React.FC<{ t: number }> = ({ t }) => {
  let idx = -1;
  pages.forEach((p, i) => { if (t >= p[0].s - 0.07 && t <= p[p.length - 1].e + 0.3) idx = i; });
  if (idx < 0) return null;
  const ws = pages[idx];
  const a = ws[0].s - 0.07, b = ws[ws.length - 1].e + 0.3;
  const op = Math.min(1, (t - a) / 0.12) * Math.min(1, (b - t) / 0.18);
  const cls = (w: W) => {
    if (t >= w.s - 0.03 && t < w.e) return { color: "#fff", background: RED };
    if (t >= w.e) return { color: "#fff", background: "transparent" };
    return { color: "rgba(255,255,255,.55)", background: "transparent" };
  };
  const span = (w: W, k: number, txt: string) => (
    <span key={k} style={{ ...cls(w), padding: "2px 12px", borderRadius: 18, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{txt}</span>
  );
  const out: React.ReactNode[] = [];
  let j = 0;
  while (j < ws.length) {
    if (isLat(ws[j].w)) {
      const group: React.ReactNode[] = []; let k = j; let trail = "";
      while (k < ws.length && isLat(ws[k].w)) {
        let txt = ws[k].w; const m = txt.match(/[،؟]+$/);
        if (m) { trail = m[0]; txt = txt.slice(0, -m[0].length); }
        group.push(span(ws[k], k, txt)); group.push(" "); k++;
      }
      out.push(<span key={"g" + j} style={{ direction: "ltr", unicodeBidi: "isolate" }}>{group}</span>);
      if (trail) out.push(<span key={"p" + j} style={{ color: "#fff" }}>{trail}</span>);
      out.push(" "); j = k;
    } else { out.push(span(ws[j], j, ws[j].w)); out.push(" "); j++; }
  }
  void eo; void clamp;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 380, textAlign: "center", direction: "rtl", fontFamily: FONT, opacity: op }}>
      <span style={{ display: "inline-block", background: NAVY, borderRadius: 46, padding: "22px 46px 26px", fontSize: 54, fontWeight: 700, lineHeight: 1.55, maxWidth: 900 }}>{out}</span>
    </div>
  );
};
