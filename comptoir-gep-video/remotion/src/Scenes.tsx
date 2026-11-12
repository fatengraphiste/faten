import React from "react";
import { Img, OffthreadVideo, staticFile } from "remotion";
import { A, Dashed, Dim, FONT, NAVY, Pill, Pop, RED, Stroke, TINT, Txt, Win, clamp, eio, eo, seg } from "./lib";
import { SvgDrawing, Step } from "./SvgDrawing";
import { LOGO_PATHS } from "./logo";
import META from "../public/svg/meta.json";

/* ================= html window helper ================= */
const HWin: React.FC<{ t: number; t0: number; t1: number; children: React.ReactNode }> = ({ t, t0, t1, children }) => {
  if (t < t0 || t > t1) return null;
  const op = Math.min(eo(clamp((t - t0) / 0.35)), eo(clamp((t1 - t) / 0.3)));
  return <div style={{ position: "absolute", inset: 0, opacity: op }}>{children}</div>;
};

/* ================= SVG step specs ================= */
const S03: Step[] = [
  { sel: "#titre", t0: 16.3, kind: "fade", dur: 0.4 },
  { sel: '[id^="poutrelle-"]', t0: A(36), dur: 0.8, stagger: 0.14 },
  { sel: '[id^="entrevous-"]', t0: A(39), dur: 0.8, stagger: 0.2 },
  { sel: "#table", t0: 18.0, dur: 0.7 },
  { sel: '[id^="gousset-"]', t0: 18.3, dur: 0.6, stagger: 0.12 },
  { sel: "#cote-entrevous", t0: 18.75, dur: 0.7 },
  { sel: "#cote-hauteur", t0: 19.15, dur: 0.6 },
  { sel: "#cote-table", t0: 19.4, dur: 0.6 },
  { sel: "#legende-table", t0: 19.3, kind: "fade", dur: 0.4 },
  { sel: "#legende-treillis", t0: 19.55, kind: "fade", dur: 0.4 },
  { sel: "#legende-entrevous", t0: 19.75, kind: "fade", dur: 0.4 },
  { sel: "#legende-poutrelle", t0: 19.95, kind: "fade", dur: 0.4 },
  { sel: "#pill-montage", t0: 20.15, kind: "pop" },
];
const S04: Step[] = [
  { sel: "#titre", t0: 20.95, kind: "fade", dur: 0.4 },
  { sel: '[id^="eclate-poutrelle-"]', t0: A(49), dur: 0.5, stagger: 0.1 },
  { sel: "#eclate-entrevous", t0: 21.3, dur: 0.5 },
  { sel: "#eclate-table", t0: 21.55, dur: 0.5 },
  { sel: '[id^="eclate-cote-"]', t0: 21.85, kind: "fade", dur: 0.35, stagger: 0.1 },
  { sel: '[id^="eclate-leg-"]', t0: 21.95, kind: "fade", dur: 0.3, stagger: 0.08 },
  { sel: "#lignes-assemblage", t0: 22.0, kind: "fade", dur: 0.3 },
  { sel: ":scope > path.dl", t0: 22.0, kind: "fade", dur: 0.3 },
  { sel: "#pill-pose", t0: 22.05, kind: "pop" },
  { sel: "#pill-coulage", t0: 22.1, kind: "pop" },
  { sel: "#pill-ordre", t0: 22.15, kind: "pop" },
];
const S08: Step[] = [
  { sel: "#dalle", t0: 27.45, dur: 0.95 },
  { sel: "#numeros g.num", t0: A(68), kind: "pop", dur: 0.3, stagger: 0.12 },
];
const S01: Step[] = [
  { sel: "#dalle", t0: 29.25, dur: 0.8 },
  { sel: "#torons", t0: 29.85, kind: "fade", dur: 0.3 },
  { sel: "#cote-largeur", t0: 29.7, dur: 0.6 },
  { sel: "#cote-epaisseur", t0: 30.05, dur: 0.5 },
  { sel: "#numeros g.num", t0: 30.3, kind: "pop", dur: 0.25, stagger: 0.07 },
  { sel: "#pill-7", t0: 30.9, kind: "pop" },
];
const S06: Step[] = [{ sel: "#poutrelle", t0: A(29), dur: 0.9 }, { sel: "#armatures", t0: A(29) + 0.7, kind: "fade", dur: 0.3 }];
const S07: Step[] = [{ sel: "#entrevous", t0: A(31), dur: 0.9 }];
const S08c: Step[] = [{ sel: "#dalle", t0: A(33), dur: 0.9 }];

/* ================= hook ================= */
export const HookLayer: React.FC<{ t: number }> = ({ t }) => {
  if (t > 8.8) return null;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {t < 2.97 ? <OffthreadVideo src={staticFile("hook.mp4")} muted style={{ width: 1080, height: 1920 }} /> : <Img src={staticFile("hook_last.jpg")} style={{ width: 1080, height: 1920 }} />}
    </div>
  );
};

/* ================= logo ================= */
export const LogoTop: React.FC<{ t: number }> = ({ t }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }} opacity={eo(seg(t, 0.3, 0.8))}>
    <g transform="translate(390 282) scale(0.3)">
      {LOGO_PATHS.map((p, i) => (p.rect ? <rect key={i} x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} fill={NAVY} /> : <path key={i} d={p.d} fill={p.c === "r" ? RED : NAVY} />))}
    </g>
  </svg>
);

/* ================= reusable drawings ================= */
const Title: React.FC<{ t: number; t0: number; text: string }> = ({ t, t0, text }) => (
  <g>
    <Txt t={t} t0={t0} x={540} y={462} size={42} ls={1.5}>{text}</Txt>
    <Stroke d="M300 494 H780" t={t} t0={t0 + 0.15} dur={0.45} w={7} c={RED} />
  </g>
);
const Chip: React.FC<{ t: number; t0: number; text: string }> = ({ t, t0, text }) => <Pill t={t} t0={t0} cx={540} cy={462} w={800} h={84} text={text} bg={NAVY} size={30} />;

const SlabBand: React.FC<{ t: number; t0: number; x1: number; x2: number; y: number; h?: number }> = ({ t, t0, x1, x2, y, h = 52 }) => {
  const cells = [];
  for (let x = x1 + 22; x + 44 < x2 - 10; x += 56) cells.push(x);
  return (
    <g>
      <Stroke d={`M${x1} ${y} H${x2} V${y + h} H${x1} Z`} t={t} t0={t0} dur={0.7} w={5} fill={TINT} />
      {cells.map((x, i) => (
        <Stroke key={i} d={`M${x + 8} ${y + 14} H${x + 36} a8 8 0 0 1 8 8 V${y + h - 22} a8 8 0 0 1 -8 8 H${x + 8} a8 8 0 0 1 -8 -8 V${y + 22} a8 8 0 0 1 8 -8 Z`} t={t} t0={t0 + 0.25 + i * 0.02} dur={0.4} w={2.5} fill="#fff" />
      ))}
    </g>
  );
};
const Support: React.FC<{ t: number; t0: number; x: number; y: number; w?: number; h?: number }> = ({ t, t0, x, y, w = 130, h = 230 }) => (
  <Stroke d={`M${x} ${y} H${x + w} V${y + h} H${x} Z`} t={t} t0={t0} dur={0.6} w={5} fill="url(#hatch)" fillFrom={0.5} />
);
const Crane: React.FC<{ t: number; t0: number; cx: number; cy: number; s: number }> = ({ t, t0, cx, cy, s }) => (
  <g transform={`translate(${cx} ${cy}) scale(${s})`}>
    <Stroke d="M-50 70 V-70 M-80 -70 H80 M46 -70 V-20 M46 -20 l-9 16 h18 z M-50 -70 L-80 -40 M-50 -70 L-20 -70 M-70 70 H-30" t={t} t0={t0} dur={0.8} w={8 / s} c={NAVY} />
  </g>
);
const Icon: React.FC<{ kind: "house" | "plan"; cx: number; cy: number; col?: string }> = ({ kind, cx, cy, col = "#fff" }) => (
  <g transform={`translate(${cx} ${cy})`} fill="none" stroke={col} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
    {kind === "house" ? <path d="M-24 14 V-8 L0 -30 L24 -8 V14 Z M-7 14 V0 H7 V14" /> : <path d="M-26 -24 H26 V4 H4 V26 H-26 Z M-10 -24 V26 M4 4 H-10" />}
  </g>
);

/* ================= the body ================= */
export const Body: React.FC<{ t: number }> = ({ t }) => {
  const nine = A(57), fifteen = A(73);
  return (
    <>
      <HookLayer t={t} />
      <LogoTop t={t} />

      {/* ---- SVG library drawings (html layer) ---- */}
      <HWin t={t} t0={16.0} t1={20.95}><SvgDrawing src="svg/03_poutrelle_entrevous_coupe.svg" t={t} steps={S03} x={0} y={350} /></HWin>
      <HWin t={t} t0={20.9} t1={22.97}>
        <SvgDrawing src="svg/04_plancher_eclate.svg" t={t} steps={S04} x={0} y={350} scale={1}
          onFrame={(root, tt) => {
            const a = eio(seg(tt, 22.3, 22.9));
            const E = META.eclate;
            (root.querySelector("#eclate-entrevous") as SVGElement).style.transform = `translateY(${-E.dy_entrevous * a}px)`;
            root.querySelectorAll('[id^="eclate-poutrelle-"]').forEach((e) => ((e as SVGElement).style.transform = `translateY(${-E.dy_pout * a}px)`));
            const hide = 1 - seg(tt, 22.25, 22.5);
            ["#lignes-assemblage", ":scope > path.dl", "#pill-pose", "#pill-coulage", "#pill-ordre", '[id^="eclate-leg-"]', '[id^="eclate-cote-"]'].forEach((sel) =>
              root.querySelectorAll(sel).forEach((e) => { if (tt > 22.2) (e as SVGElement).style.opacity = String(hide); })
            );
          }} />
      </HWin>
      <HWin t={t} t0={27.35} t1={29.25}>
        <SvgDrawing src="svg/08_iso_dalle.svg" t={t} steps={S08} x={60} y={560} scale={1.1} origin="30% 50%" zoom={1 + 0.22 * eio(seg(t, 28.5, 29.1))} />
      </HWin>
      <HWin t={t} t0={29.2} t1={32.2}>
        <SvgDrawing src="svg/01_dalle_alveolee_coupe.svg" t={t} steps={S01} x={0} y={345} scale={1} crop={{ y: 175, h: 465 }} />
      </HWin>
      {/* S4 comparison cards: isometric parts */}
      <HWin t={t} t0={10.9} t1={16.1}>
        <SvgDrawing src="svg/06_iso_poutrelle.svg" t={t} steps={S06} x={125} y={470} scale={0.74} />
        <SvgDrawing src="svg/07_iso_entrevous.svg" t={t} steps={S07} x={560} y={430} scale={0.62} />
        <SvgDrawing src="svg/08_iso_dalle.svg" t={t} steps={S08c} x={236} y={880} scale={0.74} />
      </HWin>

      {/* ---- DSL overlay layer ---- */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <pattern id="hatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="16" stroke={NAVY} strokeWidth="3" opacity=".3" /></pattern>
        </defs>

        {/* SCENE B : overlay on the 3D hook (4.7 - 8.55) */}
        <Win t={t} t0={4.7} t1={8.55} up={0}>
          <Pill t={t} t0={A(11)} cx={540} cy={420} w={620} h={96} text="ESPACE OUVERT" bg={NAVY} size={44} />
          <Stroke d="M445 1100 a90 52 0 1 0 180 0 a90 52 0 1 0 -180 0" t={t} t0={A(16) - 0.05} dur={0.8} w={9} c={RED} />
          <Pill t={t} t0={A(17) - 0.1} cx={540} cy={1010} w={380} h={88} text="0 POTEAU" size={40} check />
        </Win>

        {/* S3 : title */}
        <Win t={t} t0={8.75} t1={10.6}>
          <Txt t={t} t0={A(22)} x={540} y={790} size={118} w={900} ls={1}>PLANCHER</Txt>
          <Txt t={t} t0={A(23)} x={540} y={915} size={92} w={900} ls={1}>PRÉFABRIQUÉ</Txt>
          <Stroke d="M170 972 H910" t={t} t0={A(23) + 0.2} dur={0.5} w={9} c={RED} />
          <Txt t={t} t0={A(23) + 0.4} x={540} y={1040} size={28} w={600} ls={2} op={0.8}>POUTRELLES · ENTREVOUS · DALLES ALVÉOLÉES</Txt>
          
        </Win>

        {/* S4 : two cards */}
        <Win t={t} t0={10.9} t1={16.1}>
          {[0, 1].map((i) => {
            const y = i === 0 ? 360 : 830;
            const t0 = 11.0 + i * 0.25;
            return (
              <g key={i}>
                <Stroke d={`M130 ${y} H950 a40 40 0 0 1 40 40 V${y + 410} a40 40 0 0 1 -40 40 H130 a40 40 0 0 1 -40 -40 V${y + 40} a40 40 0 0 1 40 -40 Z`} t={t} t0={t0} dur={0.7} w={4} c={NAVY} />
                <Txt t={t} t0={t0 + 0.3} x={125} y={y + 52} size={26} ls={1.5} anchor="start">{i === 0 ? "A · POUTRELLES + ENTREVOUS" : "B · DALLE ALVÉOLÉE"}</Txt>
              </g>
            );
          })}
          <Txt t={t} t0={A(29) + 0.2} x={510} y={640} size={90} w={900} fill={RED}>+</Txt>
          <Stroke d="M130 360 H950 a40 40 0 0 1 40 40 V770 a40 40 0 0 1 -40 40 H130 a40 40 0 0 1 -40 -40 V400 a40 40 0 0 1 40 -40 Z" t={t} t0={A(29)} dur={0.5} w={9} c={RED} />
          <Stroke d="M130 830 H950 a40 40 0 0 1 40 40 V1240 a40 40 0 0 1 -40 40 H130 a40 40 0 0 1 -40 -40 V870 a40 40 0 0 1 40 -40 Z" t={t} t0={A(33)} dur={0.5} w={9} c={RED} />
          <Pop t={t} t0={A(27) - 0.1} cx={930} cy={810}>
            <circle cx={930} cy={810} r={68} fill={RED} stroke="#fff" strokeWidth={8} />
            <text x={930} y={818} fontSize={100} fontWeight={900} fill="#fff" textAnchor="middle" dominantBaseline="central" fontFamily={FONT}>?</text>
          </Pop>
        </Win>

        {/* S5 : chips under the section */}
        <Win t={t} t0={16.2} t1={20.95} up={20}>
          <Pill t={t} t0={A(43)} cx={300} cy={1225} w={420} h={96} text="HABITATIONS" bg={NAVY} size={30} />
          <Icon kind="house" cx={116} cy={1225} />
          <Pill t={t} t0={A(46)} cx={780} cy={1225} w={420} h={96} text="PLANS COMPLEXES" bg={NAVY} size={28} />
          <Icon kind="plan" cx={596} cy={1225} />
        </Win>

        {/* S6 : no crane */}
        <Win t={t} t0={20.95} t1={22.97} up={0}>
          <Crane t={t} t0={21.4} cx={930} cy={420} s={0.8} />
          <Stroke d="M930 350 a70 70 0 1 0 0.01 0" t={t} t0={A(51) - 0.05} dur={0.4} w={11} c={RED} />
          <Stroke d="M880 470 L980 370" t={t} t0={A(51) + 0.25} dur={0.3} w={11} c={RED} />
          <Pill t={t} t0={A(52) - 0.1} cx={700} cy={425} w={250} h={60} text="SANS GRUE" size={26} />
        </Win>

        {/* S7 + S8 : span 9 m */}
        <Win t={t} t0={22.95} t1={27.4}>
          <Title t={t} t0={23.0} text="PORTÉE MAXIMALE" />
          <Support t={t} t0={A(53)} x={130} y={700} />
          <Support t={t} t0={A(53) + 0.1} x={820} y={700} />
          <SlabBand t={t} t0={A(53)} x1={130} x2={950} y={648} />
          <Dim t={t} t0={A(53) + 0.5} x1={260} y1={800} x2={820} y2={800} label="" ex1={[260, 702]} ex2={[820, 702]} />
          {t < A(60) && <Txt t={t} t0={nine} x={540} y={1050} size={150} w={900} fill={RED}>9 m</Txt>}
          {t < A(60) && <Pill t={t} t0={A(59)} cx={540} cy={1170} w={560} h={70} text="POUTRELLES + ENTREVOUS" bg={NAVY} size={26} />}
          {t >= A(60) && <Txt t={t} t0={A(61)} x={540} y={1050} size={150} w={900} fill={RED}>&gt; 9 m ?</Txt>}
          {t >= A(60) && <Dashed d="M950 800 H1050" t={t} t0={A(63)} w={6} />}
        </Win>

        <Win t={t} t0={27.4} t1={29.25} up={0}>
          <Chip t={t} t0={27.5} text="DALLE ALVÉOLÉE · 7 ALVÉOLES" />
        </Win>
        {/* S10 : 15 m span under the cross-section */}
        <Win t={t} t0={29.2} t1={32.2} up={0}>
          <Support t={t} t0={A(70)} x={110} y={905} w={120} h={150} />
          <Support t={t} t0={A(70) + 0.1} x={850} y={905} w={120} h={150} />
          <SlabBand t={t} t0={A(70)} x1={110} x2={970} y={858} h={46} />
          <Dim t={t} t0={A(70) + 0.4} x1={230} y1={975} x2={850} y2={975} label="" ex1={[230, 910]} ex2={[850, 910]} />
          <Txt t={t} t0={fifteen} x={540} y={1130} size={120} w={900} fill={RED}>15 m</Txt>
          <Pill t={t} t0={A(75)} cx={540} cy={1245} w={600} h={64} text="0 POTEAU INTERMÉDIAIRE" bg={NAVY} size={25} check />
        </Win>

        {/* S11 : crane lifting a slab */}
        <Win t={t} t0={32.2} t1={33.35}>
          <Title t={t} t0={32.25} text="POSE À LA GRUE" />
          <Stroke d="M820 1130 V560 M720 1130 H920" t={t} t0={32.3} dur={0.5} w={9} c={NAVY} />
          <Stroke d="M820 600 L760 560 M300 560 H900 M300 560 V610" t={t} t0={32.4} dur={0.5} w={9} c={NAVY} />
          <g transform={`translate(0 ${-26 * eio(seg(t, 32.55, 33.2))})`}>
            <Stroke d="M520 560 V700" t={t} t0={32.5} dur={0.3} w={6} c={NAVY} />
            <Stroke d="M520 700 L400 800 M520 700 L640 800" t={t} t0={32.6} dur={0.3} w={5} c={NAVY} />
            <Stroke d="M330 800 H710 V870 H330 Z" t={t} t0={32.65} dur={0.5} w={6} fill={TINT} />
            {[0, 1, 2, 3, 4, 5, 6].map((k) => <Stroke key={k} d={`M${350 + k * 48} 815 h26 a8 8 0 0 1 8 8 v24 a8 8 0 0 1 -8 8 h-26 a8 8 0 0 1 -8 -8 v-24 a8 8 0 0 1 8 -8 Z`} t={t} t0={32.8 + k * 0.03} dur={0.3} w={3} fill="#fff" />)}
          </g>
          <Pill t={t} t0={A(80) - 0.2} cx={500} cy={1225} w={560} h={84} text="PLANCHER POSÉ D'UN COUP" size={28} />
        </Win>

        {/* S12 : no props */}
        <Win t={t} t0={33.35} t1={36.9}>
          <Title t={t} t0={33.4} text="SOUS-FACE LIBRE" />
          <Support t={t} t0={33.5} x={130} y={700} />
          <Support t={t} t0={33.55} x={820} y={700} />
          <SlabBand t={t} t0={33.5} x1={130} x2={950} y={648} />
          <g opacity={t > A(85) + 0.4 ? Math.max(0.12, 1 - (t - A(85) - 0.4) * 2) : 1}>
            {[330, 450, 570, 690, 810].map((x, i) => <Stroke key={x} d={`M${x} 700 V940 M${x - 24} 940 H${x + 24}`} t={t} t0={A(82) - 0.3 + i * 0.06} dur={0.4} w={7} c={NAVY} />)}
          </g>
          <Stroke d="M270 720 L880 930 M880 720 L270 930" t={t} t0={A(84)} dur={0.5} w={16} c={RED} />
          <Pill t={t} t0={A(84) + 0.1} cx={300} cy={1100} w={300} h={84} text="SANS ÉTAIS" size={32} />
          <Pill t={t} t0={A(86)} cx={720} cy={1100} w={440} h={84} text="TRAVAUX IMMÉDIATS" bg={NAVY} size={30} check />
        </Win>

        {/* CAS 1 : 14 m */}
        <Win t={t} t0={36.9} t1={45.45}>
          <Chip t={t} t0={A(90)} text="CAS 1 · SALLE OUVERTE DE 14 M" />
          <rect x={150} y={620} width={780} height={350} fill={TINT} />
          <Stroke d="M150 620 H930 V970 H150 Z" t={t} t0={37.6} dur={1.0} w={14} join="miter" />
          {[1, 2, 3, 4].map((k) => <Stroke key={k} d={`M150 ${620 + k * 70} H930`} t={t} t0={A(100) + k * 0.08} dur={0.5} w={2.5} c={NAVY} op={0.5} />)}
          <Dim t={t} t0={A(93) + 0.2} x1={150} y1={560} x2={930} y2={560} label="" ex1={[150, 614]} ex2={[930, 614]} />
          <Txt t={t} t0={A(96) - 0.05} x={540} y={800} size={130} w={900} fill={RED}>14 m</Txt>
          <Dashed d={`M158 735 H${150 + (780 * 9) / 14}`} t={t} t0={A(104) - 0.1} w={8} c={NAVY} />
          <Txt t={t} t0={A(104)} x={150 + (780 * 9) / 28} y={705} size={30} w={700}>9 m max.</Txt>
          <Pill t={t} t0={A(100) - 0.05} cx={540} cy={1100} w={720} h={104} text="DALLE ALVÉOLÉE" size={46} check />
          <Txt t={t} t0={A(105)} x={540} y={1210} size={54}>14 m  &gt;  9 m</Txt>
        </Win>

        {/* CAS 2 : complex plan */}
        <Win t={t} t0={45.45} t1={51.25}>
          <Chip t={t} t0={A(108)} text="CAS 2 · PLAN AVEC PETITES PIÈCES" />
          <path d="M170 600 H920 V810 H700 V1010 H170 Z" fill={TINT} />
          <Stroke d="M170 600 H920 V810 H700 V1010 H170 Z" t={t} t0={A(109)} dur={1.2} w={14} join="miter" />
          <Stroke d="M330 600 V1010 M490 600 V810 M170 800 H490 M700 810 H490 M330 800 V1010" t={t} t0={A(111)} dur={1.1} w={8} join="miter" />
          {[640, 700, 760].map((y, i) => <Stroke key={y} d={`M500 ${y} H910`} t={t} t0={A(114) + i * 0.1} dur={0.4} w={2.5} op={0.5} />)}
          <Pill t={t} t0={A(114) - 0.05} cx={540} cy={1100} w={820} h={104} text="POUTRELLES + ENTREVOUS" size={36} check />
          <Pill t={t} t0={A(115)} cx={320} cy={1215} w={420} h={84} text="S'ADAPTE AU PLAN" bg={NAVY} size={28} />
          <Pill t={t} t0={A(119)} cx={760} cy={1215} w={420} h={84} text="PLUS ÉCONOMIQUE" bg={NAVY} size={28} />
        </Win>

        {/* CAS 3 : 11 m */}
        <Win t={t} t0={51.25} t1={59.35}>
          <Chip t={t} t0={A(121)} text="CAS 3 · PORTÉE DE 11 M" />
          <rect x={205} y={620} width={670} height={250} fill={TINT} />
          <Stroke d="M205 620 H875 V870 H205 Z" t={t} t0={A(122)} dur={0.9} w={14} join="miter" />
          <Dim t={t} t0={A(123)} x1={205} y1={565} x2={875} y2={565} label="" ex1={[205, 614]} ex2={[875, 614]} />
          <Txt t={t} t0={A(124)} x={540} y={745} size={110} w={900} fill={RED}>11 m</Txt>
          <Txt t={t} t0={A(126)} x={540} y={940} size={32} w={600} op={0.75}>Travailler dessous dès le 1er jour ?</Txt>
          <Pill t={t} t0={A(130) - 0.05} cx={540} cy={1030} w={720} h={104} text="DALLE ALVÉOLÉE" size={46} check />
          <Pill t={t} t0={A(132)} cx={250} cy={1170} w={300} h={80} text="SANS ÉTAIS" bg={NAVY} size={28} />
          <Pill t={t} t0={A(134)} cx={560} cy={1170} w={300} h={80} text="POSE À LA GRUE" bg={NAVY} size={26} />
          <Pill t={t} t0={A(138)} cx={850} cy={1170} w={260} h={80} text="DESSOUS LIBRE" bg={NAVY} size={24} />
        </Win>

        {/* RULE */}
        <Win t={t} t0={59.35} t1={63.25}>
          <Title t={t} t0={A(141)} text="LA RÈGLE DU CHOIX" />
          {(() => {
            const x0 = 130, x15 = 950, ppm = (x15 - x0) / 15, x9 = x0 + 9 * ppm, yb = 850, hb = 110;
            const m = 4 + eio(seg(t, A(143), A(148))) * 8.5;
            return (
              <g>
                <Pop t={t} t0={A(142)} cx={(x0 + x9) / 2} cy={yb + hb / 2}><rect x={x0} y={yb} width={x9 - x0} height={hb} fill={NAVY} /></Pop>
                <Pop t={t} t0={A(142) + 0.15} cx={(x9 + x15) / 2} cy={yb + hb / 2}><rect x={x9} y={yb} width={x15 - x9} height={hb} fill={RED} /></Pop>
                <Txt t={t} t0={A(142) + 0.3} x={(x0 + x9) / 2} y={yb + hb / 2 + 2} size={25} fill="#fff" ls={1}>POUTRELLES + ENTREVOUS</Txt>
                <Txt t={t} t0={A(142) + 0.4} x={(x9 + x15) / 2} y={yb + hb / 2 + 2} size={25} fill="#fff" ls={1}>DALLE ALVÉOLÉE</Txt>
                {[[0, "0 m"], [9, "9 m"], [15, "15 m"]].map(([mm, l]) => <Txt key={String(l)} t={t} t0={A(143)} x={x0 + (mm as number) * ppm} y={yb + hb + 50} size={34}>{l as string}</Txt>)}
                {t > A(143) && (
                  <g transform={`translate(${x0 + m * ppm} ${yb - 26})`} opacity={eo(seg(t, A(143), A(143) + 0.3))}>
                    <path d="M-34 -20 H34 L0 26 Z" fill={RED} stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
                    <text x={0} y={-62} fontSize={32} fontWeight={800} fill={NAVY} textAnchor="middle" dominantBaseline="central" letterSpacing={1.5} fontFamily={FONT}>VOTRE PORTÉE</text>
                  </g>
                )}
              </g>
            );
          })()}
          <Pill t={t} t0={A(148)} cx={540} cy={1190} w={700} h={92} text="CHOISISSEZ SELON VOTRE PORTÉE" bg={NAVY} size={28} />
        </Win>

        {/* CTA */}
        <Win t={t} t0={63.3} t1={67.95}>
          <g transform={`translate(540 ${700 - 10 * Math.sin(t * 3)})`}>
            <Stroke d="M-130 10 L140 -90 L60 110 L10 30 Z M10 30 L140 -90" t={t} t0={63.4} dur={0.9} w={12} c={NAVY} />
          </g>
          <Stroke d="M280 760 C340 700 370 780 430 720" t={t} t0={64.0} dur={0.7} w={10} c={RED} />
          <Txt t={t} t0={A(154)} x={540} y={930} size={76} w={900}>ENVOYEZ VOTRE PLAN</Txt>
          <Stroke d="M240 985 H840" t={t} t0={A(154) + 0.3} dur={0.5} w={10} c={RED} />
          <Txt t={t} t0={A(157)} x={540} y={1070} size={36} w={600}>L'équipe Comptoir GEP vous accompagne</Txt>
        </Win>
      </svg>
    </>
  );
};
