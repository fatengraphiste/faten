import React from "react";
import CAPS from "./captions.json";

export const NAVY = "#19226d";
export const RED = "#db4041";
export const TINT = "#eef0fa";
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const eo = (x: number) => 1 - Math.pow(1 - x, 3);
export const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eob = (x: number) => {
  const c1 = 1.6, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
export const sm = (x: number, a: number, b: number) => eo(clamp((x - a) / (b - a)));

type W = { w: string; s: number; e: number };
export const FLAT: W[] = (CAPS as { words: W[] }[]).flatMap((c) => c.words);
export const A = (i: number) => FLAT[i].s;
export const FONT = "GEPF, 'Montserrat', sans-serif";

/* ---------- window (visibility + enter/exit) ---------- */
export const Win: React.FC<{ t: number; t0: number; t1: number; inD?: number; outD?: number; up?: number; children: React.ReactNode }> = ({ t, t0, t1, inD = 0.4, outD = 0.3, up = 40, children }) => {
  if (t < t0 || t > t1) return null;
  const a = eo(clamp((t - t0) / inD)), b = eo(clamp((t1 - t) / outD));
  return <g opacity={Math.min(a, b)} transform={`translate(0 ${(1 - a) * up})`}>{children}</g>;
};

/* ---------- stroke drawing ---------- */
export const Stroke: React.FC<{ d: string; t: number; t0: number; dur?: number; w?: number; c?: string; fill?: string; fillFrom?: number; cap?: "round" | "butt"; join?: "round" | "miter"; op?: number }> = ({ d, t, t0, dur = 0.5, w = 5, c = NAVY, fill = "none", fillFrom = 0.6, cap = "round", join = "round", op = 1 }) => {
  const p = eio(seg(t, t0, t0 + dur));
  if (p <= 0) return null;
  return (
    <path d={d} pathLength={1} strokeDasharray="1 1.02" strokeDashoffset={1 - p} stroke={c} strokeWidth={w} strokeLinecap={cap} strokeLinejoin={join}
      fill={fill} fillOpacity={fill === "none" ? 0 : sm(p, fillFrom, 1)} opacity={op} />
  );
};
export const Dashed: React.FC<{ d: string; t: number; t0: number; w?: number; c?: string; dash?: string }> = ({ d, t, t0, w = 6, c = RED, dash = "16 12" }) => {
  const p = seg(t, t0, t0 + 0.4);
  if (p <= 0) return null;
  return <path d={d} fill="none" stroke={c} strokeWidth={w} strokeDasharray={dash} strokeLinecap="round" opacity={p} />;
};
export const Pop: React.FC<{ t: number; t0: number; cx: number; cy: number; dur?: number; children: React.ReactNode }> = ({ t, t0, cx, cy, dur = 0.45, children }) => {
  const p = seg(t, t0, t0 + dur);
  if (p <= 0) return null;
  const s = 0.55 + 0.45 * eob(p);
  return <g opacity={Math.min(1, p * 3)} transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>{children}</g>;
};
export const Txt: React.FC<{ t: number; t0: number; x: number; y: number; size?: number; w?: number; fill?: string; anchor?: "start" | "middle" | "end"; ls?: number; op?: number; children: React.ReactNode }> = ({ t, t0, x, y, size = 40, w = 800, fill = NAVY, anchor = "middle", ls = 0, op = 1, children }) => (
  <Pop t={t} t0={t0} cx={x} cy={y}>
    <text x={x} y={y} fontSize={size} fontWeight={w} fill={fill} textAnchor={anchor} dominantBaseline="central" letterSpacing={ls} opacity={op} fontFamily={FONT}>{children}</text>
  </Pop>
);
export const Pill: React.FC<{ t: number; t0: number; cx: number; cy: number; w: number; h: number; text: string; bg?: string; fg?: string; size?: number; check?: boolean; stroke?: string }> = ({ t, t0, cx, cy, w, h, text, bg = RED, fg = "#fff", size = 30, check, stroke }) => (
  <Pop t={t} t0={t0} cx={cx} cy={cy}>
    <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={h / 2} fill={bg} stroke={stroke ?? "none"} strokeWidth={stroke ? 5 : 0} />
    <text x={cx + (check ? h * 0.3 : 0)} y={cy + 2} fontSize={size} fontWeight={800} fill={fg} textAnchor="middle" dominantBaseline="central" letterSpacing={1} fontFamily={FONT}>{text}</text>
    {check && <path d="M-14 0 L-4 11 L16 -12" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${cx - w / 2 + h / 2 + 6} ${cy})`} />}
  </Pop>
);
/* dimension line with extension lines, arrowheads and label */
export const Dim: React.FC<{ t: number; t0: number; x1: number; y1: number; x2: number; y2: number; label: string; lx?: number; ly?: number; size?: number; ex1?: [number, number]; ex2?: [number, number]; anchor?: "start" | "middle" | "end"; c?: string }> = ({ t, t0, x1, y1, x2, y2, label, lx, ly, size = 28, ex1, ex2, anchor = "middle", c = RED }) => {
  const p = eio(seg(t, t0, t0 + 0.7));
  if (p <= 0) return null;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const head = (x: number, y: number, a: number) => {
    const L = 24, W = 9;
    const bx = x - Math.cos(a) * L, by = y - Math.sin(a) * L;
    return `${x},${y} ${bx + Math.sin(a) * W},${by - Math.cos(a) * W} ${bx - Math.sin(a) * W},${by + Math.cos(a) * W}`;
  };
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const tx = lx ?? mx, ty = ly ?? my - 20;
  const lw = label.length * (size * 0.62) + 24;
  return (
    <g>
      {ex1 && <line x1={ex1[0]} y1={ex1[1]} x2={x1} y2={y1} stroke={c} strokeWidth={2} opacity={p} />}
      {ex2 && <line x1={ex2[0]} y1={ex2[1]} x2={x2} y2={y2} stroke={c} strokeWidth={2} opacity={p} />}
      <path d={`M${x1} ${y1} L${x2} ${y2}`} pathLength={1} strokeDasharray="1 1.02" strokeDashoffset={1 - p} stroke={c} strokeWidth={4} strokeLinecap="round" fill="none" />
      {p > 0.85 && <polygon points={head(x1, y1, ang + Math.PI)} fill={c} opacity={sm(p, 0.85, 1)} />}
      {p > 0.85 && <polygon points={head(x2, y2, ang)} fill={c} opacity={sm(p, 0.85, 1)} />}
      <g opacity={sm(p, 0.4, 1)}>
        <rect x={anchor === "middle" ? tx - lw / 2 : anchor === "start" ? tx - 6 : tx - lw + 6} y={ty - size * 0.7} width={lw} height={size * 1.4} fill="#fff" />
        <text x={tx} y={ty + 2} fontSize={size} fontWeight={800} fill={c} textAnchor={anchor} dominantBaseline="central" fontFamily={FONT}>{label}</text>
      </g>
    </g>
  );
};
