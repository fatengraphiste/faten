import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { clamp, eio, eo, eob, sm } from "./lib";

export type Kind = "draw" | "fade" | "pop";
export type Step = { sel: string; t0: number; dur?: number; kind?: Kind; stagger?: number };
type Leaf = { el: SVGElement; stroke: boolean; fill: boolean; text: boolean; dashed: boolean; isMarker: boolean };
type Item = { top: SVGElement; kind: Kind; t0: number; dur: number; leaves: Leaf[] };

const SHAPES = new Set(["path", "polygon", "rect", "circle", "line", "polyline", "ellipse"]);

export const SvgDrawing: React.FC<{
  src: string; t: number; steps: Step[]; x: number; y: number; scale?: number; opacity?: number;
  origin?: string; zoom?: number; crop?: { y: number; h: number }; onFrame?: (root: SVGSVGElement, t: number) => void;
}> = ({ src, t, steps, x, y, scale = 1, opacity = 1, origin = "0 0", zoom = 1, crop, onFrame }) => {
  const [svg, setSvg] = useState<string | null>(null);
  const [handle] = useState(() => delayRender("svg " + src));
  const host = useRef<HTMLDivElement>(null);
  const items = useRef<Item[]>([]);
  const dims = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    fetch(staticFile(src)).then((r) => r.text()).then((txt) => {
      const m = txt.match(/viewBox="[-\d.]+ [-\d.]+ ([\d.]+) ([\d.]+)"/);
      if (m) dims.current = { w: +m[1], h: +m[2] };
      const scoped = txt
        .replace(/<rect id="bg"[^>]*\/>/, "")
        .replace(/@font-face\{[^}]*\}\}?/g, "")
        .replace(/<style>([\s\S]*?)<\/style>/, (_m, css: string) =>
          "<style>" + css.replace(/'Montserrat',Arial,sans-serif/g, "GEPF,sans-serif").replace(/(^|\})\s*([^{}@\n][^{}]*)\{/g, (_x, c: string, sel: string) => `${c} .sd ${sel.trim()}{`) + "</style>");
      setSvg(scoped);
      continueRender(handle);
    });
  }, [src, handle]);

  useLayoutEffect(() => {
    if (!svg || !host.current) return;
    const root = host.current.querySelector("svg") as SVGSVGElement;
    if (!root) return;
    const covered = new Set<Element>();
    const list: Item[] = [];
    steps.forEach((st) => {
      const tops = Array.from(root.querySelectorAll(st.sel)) as SVGElement[];
      tops.forEach((top, i) => {
        covered.add(top);
        const leafEls = SHAPES.has(top.tagName) || top.tagName === "text" ? [top] : (Array.from(top.querySelectorAll("path,polygon,rect,circle,line,polyline,ellipse,text")) as SVGElement[]);
        const leaves: Leaf[] = leafEls.map((el) => {
          const cs = getComputedStyle(el);
          return {
            el,
            stroke: cs.stroke !== "none" && parseFloat(cs.strokeWidth) > 0 && el.tagName !== "text",
            fill: cs.fill !== "none" && el.tagName !== "text",
            text: el.tagName === "text",
            dashed: el.hasAttribute("stroke-dasharray"),
            isMarker: el.classList.contains("dl"),
          };
        });
        list.push({ top, kind: st.kind ?? "draw", t0: st.t0 + i * (st.stagger ?? 0), dur: st.dur ?? 0.7, leaves });
      });
    });
    items.current = list;
    // hide direct children never mentioned
    Array.from(root.children).forEach((c) => {
      if (["defs", "style"].includes(c.tagName)) return;
      const isCovered = covered.has(c) || Array.from(covered).some((e) => c.contains(e));
      if (!isCovered) (c as SVGElement).style.display = "none";
    });
  }, [svg, steps]);

  useLayoutEffect(() => {
    if (!svg || !host.current) return;
    const root = host.current.querySelector("svg") as SVGSVGElement;
    items.current.forEach((it) => {
      const p = clamp((t - it.t0) / it.dur);
      const top = it.top as SVGElement;
      if (p <= 0) { top.style.opacity = "0"; return; }
      if (it.kind === "fade") { top.style.opacity = String(eo(p)); it.leaves.forEach((l) => resetLeaf(l)); return; }
      if (it.kind === "pop") {
        top.style.opacity = String(Math.min(1, p * 3));
        top.style.transformBox = "fill-box"; top.style.transformOrigin = "center";
        top.style.transform = `scale(${0.55 + 0.45 * eob(p)})`;
        it.leaves.forEach((l) => resetLeaf(l)); return;
      }
      // draw
      top.style.opacity = "1";
      const pe = eio(p);
      it.leaves.forEach((l, i) => {
        const el = l.el;
        if (l.text) { el.style.opacity = String(sm(pe, 0.45, 1)); return; }
        if (l.stroke && !l.dashed) {
          el.setAttribute("pathLength", "1");
          el.style.strokeDasharray = "1 1.02";
          el.style.strokeDashoffset = String(1 - pe);
          if (l.isMarker) { const m = pe > 0.92 ? "" : "none"; el.style.markerStart = m; el.style.markerEnd = m; }
          if (l.fill) el.style.fillOpacity = String(sm(pe, 0.55, 1));
        } else if (l.stroke) {
          el.style.opacity = String(sm(pe, 0.3, 1));
        } else if (l.fill) {
          el.style.opacity = String(sm(pe, 0.5, 1));
        }
        void i;
      });
    });
    if (onFrame) onFrame(root, t);
  });

  const resetLeaf = (l: Leaf) => {
    const el = l.el;
    el.style.strokeDasharray = ""; el.style.strokeDashoffset = ""; el.style.fillOpacity = ""; el.style.opacity = "";
    if (l.isMarker) { el.style.markerStart = ""; el.style.markerEnd = ""; }
  };

  if (!svg) return null;
  const { w, h } = dims.current;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w * scale, height: (crop ? crop.h : h) * scale, overflow: crop ? "hidden" : "visible", opacity, transform: `scale(${zoom})`, transformOrigin: origin }}>
      <div ref={host} className="sd" style={{ width: w, height: h, marginTop: crop ? -crop.y * scale : 0, transform: `scale(${scale})`, transformOrigin: "0 0" }} dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
};
