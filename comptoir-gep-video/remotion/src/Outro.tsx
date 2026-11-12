import React from "react";
import { FONT, NAVY, RED, TINT, clamp, eio, eo, eob, seg, sm } from "./lib";
import { LOGO_PATHS } from "./logo";

const STAG = [[0.18, 0.55], [0.3, 0.55], [0.0, 0.7], [0.45, 0.4], [0.28, 0.62], [0.5, 0.45], [0.1, 0.6], [0.12, 0.55], [0.6, 0.3], [0.62, 0.3]];
const ICON: Record<string, string[]> = {
  wa: ["M7.9 20A9 9 0 1 0 4 16.1L2 22Z", "M8.6 9c0 3.6 2.8 6.4 6.4 6.4l1.4-1.5-2.1-1.1-1 .9c-1-.4-1.9-1.3-2.3-2.3l.9-1-1.1-2.1Z"],
  mail: ["M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z", "M3.5 7.5l8.5 6 8.5-6"],
  web: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M3 12h18", "M12 3c2.6 2.5 3.9 5.5 3.9 9s-1.3 6.5-3.9 9c-2.6-2.5-3.9-5.5-3.9-9S9.4 5.5 12 3Z"],
};
const CARDS = [
  { key: "wa", label: "WHATSAPP", val: "+216 29 611 748", y: 930, primary: true },
  { key: "mail", label: "E-MAIL", val: "devis@comptoir-gep.tn", y: 1105 },
  { key: "web", label: "SITE WEB", val: "www.comptoir-gep.tn", y: 1280 },
];
const CW = 760, CH = 140, CR = 70;
const dash = (p: number) => ({ pathLength: 1, strokeDasharray: "1 1.02", strokeDashoffset: 1 - p } as const);

/* t = seconds since outro start (0..5) */
export const Outro: React.FC<{ t: number }> = ({ t }) => {
  const dw = seg(t, 0.25, 1.65);
  const fi = eo(seg(t, 1.4, 1.95));
  const mv = eio(seg(t, 2.15, 2.75));
  const sc = (0.8 + (0.7 - 0.8) * mv) * (1 + 0.04 * Math.sin(Math.PI * seg(t, 1.4, 1.9)));
  const cy = 960 + (560 - 960) * mv;
  const rings = [[0.1, RED, 9], [0.28, NAVY, 4]] as const;
  const tg = eo(seg(t, 2.45, 3.05));
  const sw = seg(t, 1.9, 2.5);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <rect width={1080} height={1920} fill="#fff" />
      {rings.map(([t0, c, w], i) => {
        const p = seg(t, t0, t0 + 1.0);
        return p > 0 && p < 1 ? <circle key={i} cx={540} cy={960} r={20 + eo(p) * 1400} fill="none" stroke={c} strokeWidth={w} opacity={0.85 * (1 - p)} /> : null;
      })}
      <defs><clipPath id="logoClip">{LOGO_PATHS.map((p, i) => (p.rect ? <rect key={i} x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} /> : <path key={i} d={p.d} />))}</clipPath></defs>
      <g transform={`translate(540 ${cy}) scale(${sc}) translate(${-1013.44 / 2} ${-238.97 / 2})`}>
        {LOGO_PATHS.map((p, i) => {
          const col = p.c === "r" ? RED : NAVY;
          const [a, b] = STAG[i];
          const pr = eio(clamp((dw - a) / b));
          const common = { stroke: col, strokeWidth: 3.2, strokeLinejoin: "round" as const, fill: "none", ...dash(pr) };
          return (
            <g key={i}>
              {pr > 0 && (p.rect ? <rect x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} {...common} /> : <path d={p.d} {...common} />)}
              {p.rect ? <rect x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} fill={col} opacity={fi} /> : <path d={p.d} fill={col} opacity={fi} />}
            </g>
          );
        })}
        {sw > 0 && sw < 1 && <rect x={-250 + eio(sw) * 1300} y={-60} width={120} height={420} fill={RED} clipPath="url(#logoClip)" transform="skewX(-20)" />}
      </g>
      {/* tagline */}
      <g transform={`translate(540 ${752 + 18 * (1 - tg)})`}>
        <clipPath id="tagClip"><rect x={-380 * tg} y={-40} width={760 * tg} height={80} /></clipPath>
        <text x={0} y={0} fontSize={36} fontWeight={800} fill={NAVY} textAnchor="middle" dominantBaseline="central" letterSpacing={7} clipPath="url(#tagClip)" fontFamily={FONT}>DEMANDEZ VOTRE DEVIS</text>
        <path d="M-330 40 H330" stroke={RED} strokeWidth={6} fill="none" {...dash(eio(seg(t, 2.6, 3.2)))} />
        <rect x={-362} y={34} width={12} height={12} fill={RED} opacity={seg(t, 2.9, 3.15)} />
        <rect x={350} y={34} width={12} height={12} fill={RED} opacity={seg(t, 2.9, 3.15)} />
      </g>
      {CARDS.map((c, i) => {
        const s = 2.55 + i * 0.24;
        const a = seg(t, s, s + 0.3);
        if (a <= 0) return null;
        const slide = 1 - eob(seg(t, s, s + 0.65));
        const pop = eob(seg(t, s + 0.3, s + 0.85));
        const x0 = -CW / 2, ix = x0 + CR;
        const rp = seg(t, s + 0.55, s + 1.15);
        return (
          <g key={i} opacity={a} transform={`translate(540 ${c.y + 100 * slide})`}>
            <rect x={x0} y={-CH / 2} width={CW} height={CH} rx={CR} fill={c.primary ? RED : TINT} fillOpacity={sm(seg(t, s + 0.35, s + 0.8), 0, 1)} />
            <rect x={x0} y={-CH / 2} width={CW} height={CH} rx={CR} fill="none" stroke={c.primary ? RED : NAVY} strokeWidth={6} {...dash(eio(seg(t, s, s + 0.6)))} />
            <g transform={`translate(${ix} 0) scale(${pop})`}>
              {rp > 0 && rp < 1 && <circle r={50 + 40 * eo(rp)} fill="none" stroke={c.primary ? "#fff" : RED} strokeWidth={4} opacity={0.8 * (1 - rp)} />}
              <circle r={50} fill={c.primary ? "#fff" : RED} />
              <g transform="scale(2.2) translate(-12 -12)">
                {ICON[c.key].map((d, k) => <path key={k} d={d} fill="none" stroke={c.primary ? RED : "#fff"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...dash(eio(seg(t, s + 0.4, s + 0.95)))} />)}
              </g>
            </g>
            <clipPath id={"cc" + i}><rect x={x0 + 140} y={-60} width={600 * eo(seg(t, s + 0.45, s + 1.0))} height={120} /></clipPath>
            <g clipPath={`url(#cc${i})`}>
              <text x={x0 + 140} y={-26} fontSize={21} fontWeight={700} fill={c.primary ? "#fff" : NAVY} fillOpacity={0.75} dominantBaseline="central" letterSpacing={4} fontFamily={FONT}>{c.label}</text>
              <text x={x0 + 140} y={16} fontSize={c.val.length > 18 ? 41 : 44} fontWeight={800} fill={c.primary ? "#fff" : NAVY} dominantBaseline="central" fontFamily={FONT}>{c.val}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
};
