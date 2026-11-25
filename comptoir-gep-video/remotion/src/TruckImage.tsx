import React from "react";
import { AbsoluteFill } from "remotion";
import { LOGO_PATHS } from "./logo";

const NAVY = "#19226d", RED = "#db4041", DARK = "#10153f", SKY = "#dfe6fb", T1 = "#eceff8", T2 = "#e0e5f3", T3 = "#c9d0e8";
const Logo: React.FC<{ x: number; y: number; s: number; white?: boolean }> = ({ x, y, s, white }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) translate(-485 -125)`}>
    {LOGO_PATHS.map((p, i) => (p.rect ? <rect key={i} x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} fill={white ? "#fff" : NAVY} /> : <path key={i} d={p.d} fill={p.c === "r" ? RED : white ? "#fff" : NAVY} />))}
  </g>
);
const Wheel: React.FC<{ x: number }> = ({ x }) => (
  <g><circle cx={x} cy={1262} r={90} fill={DARK} opacity={0.0} /><circle cx={x} cy={1262} r={72} fill={DARK} /><circle cx={x} cy={1262} r={40} fill={SKY} /><circle cx={x} cy={1262} r={16} fill={NAVY} />
    {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={x + 26 * Math.cos((i * 2 * Math.PI) / 5)} cy={1262 + 26 * Math.sin((i * 2 * Math.PI) / 5)} r={5} fill={NAVY} />)}</g>
);
const Building: React.FC<{ x: number; w: number; h: number; c: string; roof?: "flat" | "tower" | "step" }> = ({ x, w, h, c, roof = "flat" }) => (
  <g>
    <rect x={x} y={1330 - h} width={w} height={h} fill={c} />
    {roof === "tower" && <><rect x={x + w / 2 - 6} y={1330 - h - 90} width={12} height={90} fill={c} /><rect x={x + w * 0.2} y={1330 - h - 24} width={w * 0.6} height={24} fill={c} /></>}
    {roof === "step" && <rect x={x + w * 0.15} y={1330 - h - 46} width={w * 0.7} height={46} fill={c} />}
    {Array.from({ length: Math.floor(h / 46) }, (_, r) => <rect key={r} x={x + 14} y={1330 - h + 22 + r * 46} width={w - 28} height={9} rx={4} fill="#fff" opacity={0.55} />)}
  </g>
);
// Image 9:16 — camion plateau (flat design) avec logo Comptoir GEP, charte bleu marine / rouge / blanc
export const TruckImage: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#ffffff 0%,#eef1f8 62%,#e6eaf5 100%)" }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      {/* soleil doux + nuages */}
      <circle cx={820} cy={640} r={170} fill={NAVY} opacity={0.05} /><circle cx={820} cy={640} r={105} fill={NAVY} opacity={0.05} />
      {[[190, 560, 1], [760, 470, 0.8], [980, 760, 0.6]].map(([x, y, s], i) => <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.95}><ellipse cx={0} cy={0} rx={120} ry={34} fill="#fff" /><circle cx={-30} cy={-24} r={38} fill="#fff" /><circle cx={34} cy={-30} r={48} fill="#fff" /></g>)}
      {/* ville : deux plans */}
      <Building x={-30} w={170} h={470} c={T1} roof="tower" /><Building x={150} w={130} h={360} c={T1} /><Building x={300} w={200} h={560} c={T1} roof="step" /><Building x={520} w={150} h={400} c={T1} /><Building x={690} w={170} h={520} c={T1} roof="tower" /><Building x={880} w={220} h={420} c={T1} roof="step" />
      <Building x={40} w={140} h={300} c={T2} /><Building x={210} w={110} h={420} c={T2} roof="step" /><Building x={350} w={150} h={250} c={T2} /><Building x={560} w={120} h={340} c={T2} /><Building x={720} w={150} h={280} c={T2} roof="step" /><Building x={900} w={150} h={380} c={T2} />
      {/* grue de chantier */}
      <g fill={T3}><rect x={118} y={700} width={16} height={630} /><rect x={50} y={700} width={330} height={14} /><rect x={74} y={686} width={54} height={30} fill={RED} opacity={0.55} /><rect x={330} y={714} width={5} height={70} /><rect x={318} y={782} width={30} height={22} fill={NAVY} opacity={0.35} /></g>
      {/* route */}
      <rect x={0} y={1330} width={1080} height={590} fill="#d8dce8" /><rect x={0} y={1330} width={1080} height={14} fill="#c5cbdd" />
      <g fill="#fff" opacity={0.85}>{Array.from({ length: 6 }, (_, i) => <rect key={i} x={-20 + i * 200} y={1490} width={110} height={12} rx={6} />)}</g>
      <rect x={0} y={1620} width={1080} height={300} fill="#cfd4e3" opacity={0.6} />
      {/* traits de vitesse */}
      <g stroke={NAVY} strokeLinecap="round" opacity={0.12}><line x1={0} y1={1010} x2={90} y2={1010} strokeWidth={10} /><line x1={0} y1={1070} x2={60} y2={1070} strokeWidth={10} /><line x1={0} y1={1180} x2={110} y2={1180} strokeWidth={10} /></g>
      {/* ombre au sol */}
      <ellipse cx={560} cy={1346} rx={500} ry={22} fill={NAVY} opacity={0.14} />
      {/* ── camion ── */}
      {/* roues arrière / avant : passages de roue */}
      {/* plateau + châssis */}
      <rect x={90} y={1090} width={620} height={36} rx={8} fill="#b8c0d9" />
      <rect x={90} y={1126} width={910} height={42} rx={8} fill={DARK} />
      {/* jupe latérale blanche avec logo */}
      <rect x={110} y={1134} width={560} height={46} rx={14} fill="#fff" /><rect x={110} y={1168} width={560} height={12} rx={6} fill={RED} />
      {/* charge : dalles empilées + sangles */}
      <g>
        <rect x={110} y={1010} width={570} height={80} rx={16} fill="#cfd4e4" /><rect x={128} y={930} width={534} height={80} rx={16} fill="#dde1ee" /><rect x={150} y={850} width={490} height={80} rx={16} fill="#e8ebf4" />
        {[1010, 930, 850].map((y, i) => <g key={i} opacity={0.5}>{Array.from({ length: 7 }, (_, k) => <circle key={k} cx={150 + i * 20 + k * 70} cy={y + 40} r={11} fill="#fff" />)}</g>)}
        {[150, 620].map((x) => <g key={x}><rect x={x} y={846} width={26} height={248} rx={6} fill={RED} /><rect x={x - 4} y={960} width={34} height={28} rx={6} fill={NAVY} /></g>)}
        <rect x={210} y={886} width={410} height={168} rx={28} fill="#fff" /><rect x={210} y={1040} width={410} height={14} rx={7} fill={RED} />
        <Logo x={415} y={962} s={0.36} />
      </g>
      {/* cabine */}
      <path d="M718 1168 L718 900 Q718 872 746 872 L884 872 Q910 872 928 896 L1000 990 Q1016 1008 1016 1034 L1016 1168 Z" fill={NAVY} />
      <rect x={702} y={770} width={20} height={400} rx={8} fill="#8f98cf" />
      <path d="M744 900 L872 900 Q890 900 902 916 L946 976 L744 976 Z" fill={SKY} /><path d="M770 900 L810 900 L772 976 L732 976 Z" fill="#fff" opacity={0.45} />
      <rect x={718} y={1088} width={298} height={26} fill={RED} />
      <rect x={812} y={992} width={4} height={96} fill="#fff" opacity={0.25} /><rect x={830} y={1040} width={46} height={10} rx={5} fill="#fff" opacity={0.7} />
      <Logo x={918} y={1050} s={0.075} white />
      <path d="M1016 1062 L1034 1068 Q1040 1070 1040 1078 L1040 1100 L1016 1100 Z" fill="#fff" /><rect x={996} y={1150} width={52} height={24} rx={8} fill="#aab3d6" />
      <rect x={968} y={1134} width={36} height={8} rx={4} fill="#fff" opacity={0.8} />
      {/* roues */}
            <Wheel x={250} /><Wheel x={380} /><Wheel x={840} />
      {/* logo en haut (zone sûre) */}
      <Logo x={540} y={345} s={0.26} />
    </svg>
  </AbsoluteFill>
);
