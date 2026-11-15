import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Loop, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { MixedText } from "../components";
import { OutroIcon } from "../outro/OutroIcon";
import "../theme";

// CREOFAN — « Fatene clone » : motion 2D flat, style cercles concentriques + gros texte mot par mot.
// Voix 34,3 s ; 14 phrases repérées sur les 14 pauses de la voix.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const RED = "#f7322a";
const PINK = "#fa8985";
const BEIGE = "#fff5f5";
const CHAR = "#1A1A1A";
const WHITE = "#ffffff";
const FONT = "Poppins, sans-serif";
const L = 90;
const RG = 900;
const CX = (L + RG) / 2;

// Fenêtres de parole (s) des 14 phrases
const SEG: [number, number][] = [[0, 0.83], [1.31, 3.93], [4.47, 5.89], [6.24, 7.43], [7.76, 9.88], [10.29, 12.88], [13.2, 14.49], [14.87, 18.44], [18.87, 22.65], [22.98, 24.1], [24.47, 25.9], [26.11, 28.41], [28.79, 31.88], [32.25, 34.27]];
const TXT: string[][] = [
  ["شنوة", "رايك؟"],
  ["أكيد", "الـ", "produit", "متاعك", "زاد", "نوّر", "في", "الفيديو", "هذا!"],
  ["معاك", "فاتن", "من", "Creofan"],
  ["ومن", "غير", "ما", "نطول", "عليك،"],
  ["هذي", "هي", "الـ", "qualité", "اللي", "نجم", "نخدمك", "بيها."],
  ["إنت", "ما", "عليك", "كان", "تبعثلي", "التصاور", "والـ", "charte", "متاعكم،"],
  ["وأنا", "نتكفل", "بالباقي:"],
  ["الفكرة،", "السكريبت،", "والـ", "voix-off", "التونسية", "اللي", "تسمع", "فيها", "توا."],
  ["نجمو", "نخدمو", "بـ", "Packs", "متاع", "4،", "6،", "ولا", "8", "فيديوهات..."],
  ["ولا", "بنظام", "الـ", "Crédits:"],
  ["تشري", "رصيد", "متاع", "فيديوهات"],
  ["وتستهلكو", "على", "3", "شهور", "وقت", "ما", "تستحق."],
  ["كان", "عجبك", "الـ", "style", "وتحب", "نخرجو", "الـ", "produits", "متاعكم", "هكا،"],
  ["تواصل", "معايا", "وخلينا", "نحكيو."],
];
// Temps (frames) de chaque mot : répartis selon la longueur dans la fenêtre de la phrase
const WT: number[][] = TXT.map((ws, k) => {
  const [a, b] = SEG[k];
  const tot = ws.reduce((n, w) => n + w.length + 1.5, 0);
  let acc = 0;
  return ws.map((w) => {
    const at = s(a + ((b - a) * acc) / tot);
    acc += w.length + 1.5;
    return at;
  });
});
const wt = (k: number, i: number) => WT[k][i];

const CUT = [0, s(1.07), s(4.2), s(6.05), s(10.1), s(13.0), s(14.7), s(18.65), s(22.8), s(24.3), s(28.6), s(32.05)];
const OUT = s(34.3);
export const CLONE_DURATION = OUT + 140;
const BG = (i: number) => (i % 2 === 0 ? RED : BEIGE);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number, a: number, d: number, e = Easing.bezier(0.65, 0, 0.35, 1)) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: e });
const outE = (t: number, a: number, d: number) => ease(t, a, d, Easing.bezier(0.16, 1, 0.3, 1));
const el = (t: number, a: number, damping = 12) => (t < a ? 0 : spring({ frame: t - a, fps: FPS, config: { damping, stiffness: 170, mass: 0.8 } }));
const ink = (c: string) => (c === RED || c === CHAR ? WHITE : CHAR);
const ARABIC = /[؀-ۿ]/;

const Big: React.FC<{ size: number; color: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color, children, style }) => (
  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 0.95, letterSpacing: -size * 0.035, color, whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Pill: React.FC<{ text: string; c: string; size?: number; style?: React.CSSProperties; color?: string }> = ({ text, c, size = 44, style, color }) => (
  <span style={{ display: "inline-block", backgroundColor: c, borderRadius: 999, padding: `${size * 0.12}px ${size * 0.62}px ${size * 0.22}px`, whiteSpace: "nowrap", ...style }}>
    <MixedText text={text} size={size} color={color ?? ink(c)} latinColor={color ?? ink(c)} style={{ lineHeight: 1.15 }} />
  </span>
);
const At: React.FC<{ x: number; y: number; k?: number; r?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, k = 1, r = 0, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${r}deg) scale(${k})`, ...style }}>{children}</div>
);
const Card: React.FC<{ x: number; y: number; w: number; h: number; c: string; k?: number; r?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, c, k = 1, r = 44, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, backgroundColor: c, borderRadius: r, overflow: "hidden", transform: `translateY(${(1 - k) * 80}px) scale(${0.9 + 0.1 * k})`, opacity: Math.min(1, k * 1.4), ...style }}>{children}</div>
);

// Ligne de mots qui apparaissent un à un, au rythme de la voix. Les mots latins passent en pastille.
const Words: React.FC<{ t: number; seg: number; from?: number; to?: number; y: number; size: number; color: string; pillBg: string; style?: React.CSSProperties; hot?: number[] }> = ({ t, seg, from = 0, to, y, size, color, pillBg, style, hot = [] }) => {
  const ws = TXT[seg].slice(from, to);
  return (
    <div dir="rtl" style={{ position: "absolute", left: L, width: RG - L, top: y, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: `${size * 0.1}px ${size * 0.28}px`, ...style }}>
      {ws.map((w, j) => {
        const i = from + j;
        const k = el(t, wt(seg, i), 10);
        const latin = !ARABIC.test(w);
        return (
          <div key={i} style={{ opacity: Math.min(1, k * 2), transform: `translateY(${(1 - k) * size * 0.5}px) scale(${0.7 + 0.3 * k})` }}>
            {latin ? <Pill text={w} c={pillBg} size={size * 0.78} color={ink(pillBg)} /> : <MixedText text={w} size={size} color={hot.includes(i) ? (color === WHITE ? CHAR : RED) : color} />}
          </div>
        );
      })}
    </div>
  );
};

// Cercles concentriques (style de la référence), qui respirent
const Rings: React.FC<{ t: number; at: number; bg: string; cx?: number; cy?: number }> = ({ t, at, bg, cx = CX, cy = 760 }) => {
  const dark = bg === RED;
  const k = outE(t, at, 24);
  const pulse = 1 + Math.sin(t / 22) * 0.025;
  const rings = [{ r: 800, c: dark ? "rgba(255,255,255,0.07)" : "rgba(250,137,133,0.30)" }, { r: 520, c: dark ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.75)" }, { r: 270, c: dark ? "rgba(255,255,255,0.07)" : "rgba(250,137,133,0.30)" }];
  return (
    <>
      {rings.map((rg, i) => {
        const r = rg.r * k * pulse;
        return <div key={i} style={{ position: "absolute", left: cx - r, top: cy - r, width: 2 * r, height: 2 * r, borderRadius: 9999, backgroundColor: rg.c }} />;
      })}
    </>
  );
};
const Plus: React.FC<{ x: number; y: number; c: string; k: number }> = ({ x, y, c, k }) => (
  <div style={{ position: "absolute", left: x - 38, top: y - 38, width: 76, height: 76, transform: `scale(${k}) rotate(${(1 - k) * 90}deg)` }}>
    <div style={{ position: "absolute", left: 36, top: 0, width: 5, height: 76, backgroundColor: c }} />
    <div style={{ position: "absolute", left: 0, top: 36, width: 76, height: 5, backgroundColor: c }} />
  </div>
);

/* ---------- Icônes plates ---------- */
const Ico: React.FC<{ d: string; c: string; size: number; w?: number; fill?: string }> = ({ d, c, size, w = 1.8, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const I_BULB = "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z";
const I_DOC = "M6 3h9l3 3v15H6zM9 10h6M9 14h6M9 18h4";
const I_MIC = "M9 3h6v10a3 3 0 0 1-6 0zM5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7";
const I_PLAY = "M8 5l11 7-11 7z";
const I_STAR = "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z";
const HEART = "M12 20.5S3 15 3 8.8A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 9 2.4C21 15 12 20.5 12 20.5z";
const FOLLOW = "M15 19c0-3.3-2.7-6-6-6s-6 2.7-6 6M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M19 8v6M16 11h6";
const REPOST = "M17 2.5l3.5 3.5-3.5 3.5M3.5 11.5v-1A4.5 4.5 0 0 1 8 6h12.5M7 21.5L3.5 18 7 14.5M20.5 12.5v1A4.5 4.5 0 0 1 16 18H3.5";
const WA = "M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2C11 19.5 4.5 13 4.5 5a2 2 0 0 1 2-2z";

// Produit flat : boîte + ruban ; `glow` 0→1 l'allume
const Product: React.FC<{ size: number; glow: number; body?: string; lid?: string; t: number }> = ({ size, glow, body = PINK, lid = BEIGE, t }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x={97} y={6 - glow * 14} width={6} height={22 + glow * 22} rx={3} fill={i % 2 ? WHITE : CHAR} opacity={glow} transform={`rotate(${i * 30} 100 104)`} />
    ))}
    <rect x={40} y={74} width={120} height={92} rx={14} fill={glow > 0.5 ? RED : body} />
    <rect x={32} y={56} width={136} height={30} rx={12} fill={lid} />
    <rect x={92} y={56} width={16} height={110} fill={glow > 0.5 ? CHAR : RED} opacity={0.9} />
    <circle cx={100} cy={52} r={11 + Math.sin(t / 5) * glow * 2} fill={glow > 0.5 ? CHAR : RED} />
  </svg>
);

/* ---------- Scènes ---------- */
type SP = { t: number; bg: string; a: number };

// A — « شنوة رايك؟ »
const SA: React.FC<SP> = ({ t, bg }) => (
  <>
    <Rings t={t} at={0} bg={bg} cy={600} />
    <Plus x={760} y={420} c={CHAR} k={el(t, s(0.35), 8)} />
    <Words t={t} seg={0} y={400} size={230} color={WHITE} pillBg={CHAR} style={{ flexDirection: "column" }} hot={[1]} />
  </>
);
// B — le produit s'allume
const SB: React.FC<SP> = ({ t, bg }) => {
  const glow = ease(t, wt(1, 5), 10);
  return (
    <>
      <Rings t={t} at={CUT[1]} bg={bg} cy={760} />
      <Words t={t} seg={1} from={0} to={4} y={330} size={74} color={CHAR} pillBg={RED} />
      <Words t={t} seg={1} from={4} y={500} size={74} color={CHAR} pillBg={RED} hot={[5]} />
      <At x={CX} y={900} k={el(t, wt(1, 2), 9)}><Product size={400} glow={glow} t={t} /></At>
      {glow > 0.4 ? [0, 1, 2, 3].map((i) => <At key={i} x={CX + [-210, 210, -170, 190][i]} y={[760, 790, 1000, 1010][i]} k={el(t, wt(1, 5) + i * 4, 8)}><Ico d={I_STAR} c={RED} size={60} fill={i % 2 ? PINK : RED} /></At>) : null}
    </>
  );
};
// C — « معاك فاتن من Creofan »
const SC: React.FC<SP> = ({ t, bg }) => (
  <>
    <Rings t={t} at={CUT[2]} bg={bg} cy={700} />
    <At x={CX} y={600} k={el(t, CUT[2] + 4, 9)}>
      <div style={{ width: 380, height: 380, borderRadius: 9999, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 270, height: 270 }} />
      </div>
    </At>
    <Plus x={780} y={420} c={CHAR} k={el(t, CUT[2] + 14, 8)} />
    <Words t={t} seg={2} from={0} to={2} y={850} size={116} color={WHITE} pillBg={CHAR} />
    <Words t={t} seg={2} from={2} y={985} size={84} color={WHITE} pillBg={WHITE} />
  </>
);
// D — « هذي هي الـ qualité »
const SD: React.FC<SP> = ({ t, bg }) => (
  <>
    <Rings t={t} at={CUT[3]} bg={bg} cy={760} />
    <Words t={t} seg={3} y={340} size={62} color={CHAR} pillBg={RED} />
    <Words t={t} seg={4} from={0} to={4} y={520} size={96} color={CHAR} pillBg={RED} />
    <Words t={t} seg={4} from={4} y={720} size={64} color={CHAR} pillBg={RED} />
    <div style={{ position: "absolute", left: L, width: RG - L, top: 860, display: "flex", justifyContent: "center", gap: 22 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ transform: `scale(${el(t, wt(4, 3) + i * 4, 8)}) rotate(${(1 - el(t, wt(4, 3) + i * 4, 8)) * 40}deg)` }}><Ico d={I_STAR} c={RED} size={116} fill={RED} /></div>
      ))}
    </div>
  </>
);
// E — les images et la charte
const SE: React.FC<SP> = ({ t, bg }) => {
  const W2 = (RG - L - 24) / 2;
  const sw = [RED, PINK, BEIGE, CHAR];
  return (
    <>
      <Rings t={t} at={CUT[4]} bg={bg} cy={760} />
      <Words t={t} seg={5} from={0} to={5} y={330} size={74} color={WHITE} pillBg={CHAR} />
      <Card x={L} y={600} w={W2} h={440} c={WHITE} k={el(t, wt(5, 5), 11)}>
        <div style={{ position: "absolute", left: 40, right: 40, top: 40, height: 220, borderRadius: 28, backgroundColor: PINK, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 40, top: 30, width: 70, height: 70, borderRadius: 99, backgroundColor: WHITE }} />
          <svg width={330} height={220} style={{ position: "absolute", inset: 0 }}><polygon points="0,220 120,90 200,170 250,120 330,200 330,220" fill={RED} /></svg>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 38, textAlign: "center" }}><MixedText text="التصاور" size={74} color={CHAR} /></div>
      </Card>
      <Card x={L + W2 + 24} y={600} w={W2} h={440} c={CHAR} k={el(t, wt(5, 7), 11)}>
        <div style={{ position: "absolute", left: 40, right: 40, top: 40, height: 220, display: "flex", gap: 14 }}>
          {sw.map((c, i) => <div key={i} style={{ flex: 1, borderRadius: 24, backgroundColor: c, transform: `scaleY(${el(t, wt(5, 7) + i * 3, 9)})`, transformOrigin: "50% 100%" }} />)}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 38, textAlign: "center" }}><Pill text="charte" c={RED} size={58} /></div>
      </Card>
      <At x={CX} y={820} k={el(t, wt(5, 7), 8)}><div style={{ width: 84, height: 84, borderRadius: 99, backgroundColor: RED, border: `8px solid ${bg}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Big size={58} color={WHITE}>+</Big></div></At>
    </>
  );
};
// F — « وأنا نتكفل بالباقي: »
const SF: React.FC<SP> = ({ t, bg }) => {
  const draw = ease(t, wt(6, 1) + 4, 14);
  return (
    <>
      <Rings t={t} at={CUT[5]} bg={bg} cy={760} />
      <Words t={t} seg={6} from={0} to={2} y={380} size={130} color={CHAR} pillBg={RED} />
      <Words t={t} seg={6} from={2} y={560} size={130} color={RED} pillBg={RED} />
      <At x={CX} y={900} k={el(t, wt(6, 1), 9)}>
        <div style={{ width: 240, height: 240, borderRadius: 9999, backgroundColor: RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={150} height={150} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={WHITE} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} /></svg>
        </div>
      </At>
    </>
  );
};
// G — idée / script / voix-off
const SG: React.FC<SP> = ({ t, bg }) => {
  const rows: [string, string, string, string, number][] = [
    ["01", "الفكرة", I_BULB, WHITE, 0],
    ["02", "السكريبت", I_DOC, CHAR, 1],
    ["03", "voix-off", I_MIC, PINK, 3],
  ];
  return (
    <>
      <Rings t={t} at={CUT[6]} bg={bg} cy={760} />
      {rows.map(([n, label, ic, c, wi], i) => {
        const k = el(t, wt(7, wi), 11);
        const y = 330 + i * 230;
        return (
          <Card key={n} x={L} y={y} w={RG - L} h={200} c={c} k={k}>
            <Big size={110} color={c === WHITE || c === PINK ? RED : PINK} style={{ position: "absolute", left: 34, top: 44, letterSpacing: -6 }}>{n}</Big>
            <div style={{ position: "absolute", right: 150, top: 56 }}>{ARABIC.test(label) ? <MixedText text={label} size={76} color={ink(c)} /> : <Pill text={label} c={RED} size={64} />}</div>
            <div style={{ position: "absolute", right: 36, top: 56 }}><Ico d={ic} c={c === CHAR ? WHITE : RED} size={88} w={1.6} /></div>
            {i === 2 ? (
              <div style={{ position: "absolute", left: 250, bottom: 26, display: "flex", alignItems: "flex-end", gap: 8, height: 60 }}>
                {Array.from({ length: 14 }).map((_, j) => <div key={j} style={{ width: 10, borderRadius: 6, backgroundColor: RED, height: 14 + (t >= wt(7, 6) ? Math.abs(Math.sin(t / 4 + j * 0.9)) * 44 : 6) }} />)}
              </div>
            ) : null}
          </Card>
        );
      })}
      {t >= wt(7, 4) ? <At x={RG - 70} y={1010} k={el(t, wt(7, 4), 8)} r={-6}><Pill text="تونسية" c={RED} size={42} /></At> : null}
    </>
  );
};
// H — Packs 4 / 6 / 8
const SH: React.FC<SP> = ({ t, bg }) => {
  const W3 = (RG - L - 40) / 3;
  const packs: [string, string, number][] = [["4", RED, 5], ["6", CHAR, 6], ["8", PINK, 8]];
  return (
    <>
      <Rings t={t} at={CUT[7]} bg={bg} cy={800} />
      <Words t={t} seg={8} from={0} to={5} y={330} size={70} color={CHAR} pillBg={RED} />
      {packs.map(([n, c, wi], i) => {
        const k = el(t, wt(8, wi), 10);
        return (
          <Card key={n} x={L + i * (W3 + 20)} y={590} w={W3} h={410} c={c} k={k} r={60}>
            <Big size={230} color={ink(c)} style={{ position: "absolute", left: 0, right: 0, top: 20, textAlign: "center", letterSpacing: -12 }}>{n}</Big>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", gap: 6 }}>
              {Array.from({ length: Number(n) > 4 ? 3 : 2 }).map((_, j) => <Ico key={j} d={I_PLAY} c={ink(c)} size={44} fill={ink(c)} />)}
            </div>
          </Card>
        );
      })}
      {t >= wt(8, 9) ? <Row2 t={t} at={wt(8, 9)} /> : null}
    </>
  );
};
const Row2: React.FC<{ t: number; at: number }> = ({ t, at }) => (
  <div style={{ position: "absolute", left: L, width: RG - L, top: 1020, textAlign: "center", transform: `scale(${el(t, at, 9)})` }}>
    <Pill text="فيديوهات" c={CHAR} size={50} />
  </div>
);
// I — « ولا بنظام الـ Crédits: »
const SI: React.FC<SP> = ({ t, bg }) => (
  <>
    <Rings t={t} at={CUT[8]} bg={bg} cy={700} />
    <Words t={t} seg={9} from={0} to={3} y={340} size={92} color={WHITE} pillBg={CHAR} />
    <Words t={t} seg={9} from={3} y={500} size={110} color={WHITE} pillBg={WHITE} />
    <div style={{ position: "absolute", left: CX - 220, top: 760, width: 440, height: 300 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const k = el(t, wt(9, 3) + i * 3, 9);
        return <div key={i} style={{ position: "absolute", left: 60 + (i % 2) * 130, top: 210 - i * 46 + (i % 2) * 20, width: 200, height: 70, borderRadius: 999, backgroundColor: i % 2 ? PINK : WHITE, transform: `scale(${k})`, display: "flex", alignItems: "center", justifyContent: "center" }}><Big size={34} color={RED}>CRÉDIT</Big></div>;
      })}
    </div>
  </>
);
// J — rechargé puis consommé en 3 mois
const SJ: React.FC<SP> = ({ t, bg }) => {
  const prog = ease(t, wt(11, 3) - 2, s(1.9));
  const used = Math.floor(prog * 8);
  return (
    <>
      <Rings t={t} at={CUT[9]} bg={bg} cy={800} />
      <Words t={t} seg={10} y={330} size={78} color={CHAR} pillBg={RED} />
      <At x={CX} y={690} k={el(t, wt(11, 0), 10)}>
        <svg width={420} height={420} viewBox="0 0 420 420">
          <circle cx={210} cy={210} r={180} fill="none" stroke={PINK} strokeWidth={34} opacity={0.5} />
          <circle cx={210} cy={210} r={180} fill="none" stroke={RED} strokeWidth={34} strokeLinecap="round" strokeDasharray={`${prog * 1131} 1131`} transform="rotate(-90 210 210)" />
        </svg>
        <Big size={190} color={CHAR} style={{ position: "absolute", left: 0, right: 0, top: 90, textAlign: "center", letterSpacing: -10 }}>3</Big>
        <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center" }}><MixedText text="شهور" size={66} color={CHAR} /></div>
      </At>
      <div style={{ position: "absolute", left: L, width: RG - L, top: 930, display: "flex", justifyContent: "center", gap: 12 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: i < used ? PINK : RED, opacity: i < used ? 0.45 : 1, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${el(t, CUT[9] + 10 + i * 2, 9)})` }}>
            <Ico d={I_PLAY} c={WHITE} size={34} fill={WHITE} />
          </div>
        ))}
      </div>
      {t >= wt(11, 4) ? <At x={CX} y={1045} k={el(t, wt(11, 4), 9)} r={-3}><Pill text="وقت ما تستحق" c={CHAR} size={46} /></At> : null}
    </>
  );
};
// K — avant / après style
const SK: React.FC<SP> = ({ t, bg }) => {
  const after = ease(t, wt(12, 7), 12);
  return (
    <>
      <Rings t={t} at={CUT[10]} bg={bg} cy={800} />
      <Words t={t} seg={12} from={0} to={4} y={330} size={74} color={WHITE} pillBg={CHAR} />
      <Words t={t} seg={12} from={4} y={500} size={64} color={WHITE} pillBg={CHAR} />
      <At x={CX - 210} y={870} k={el(t, wt(12, 5), 9)}><div style={{ opacity: 0.9 - after * 0.4 }}><Product size={300} glow={0} body={BEIGE} lid={PINK} t={t} /></div></At>
      <At x={CX} y={870} k={el(t, wt(12, 7), 8)}><div style={{ width: 70, height: 70, borderRadius: 99, backgroundColor: CHAR, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico d="M5 12h13M13 6l6 6-6 6" c={WHITE} size={40} w={2.6} /></div></At>
      <At x={CX + 215} y={870} k={el(t, wt(12, 7) + 3, 9)}><Product size={300} glow={after} t={t} /></At>
    </>
  );
};
// L — contact
const SL: React.FC<SP> = ({ t, bg }) => (
  <>
    <Rings t={t} at={CUT[11]} bg={bg} cy={760} />
    <Words t={t} seg={13} from={0} to={2} y={340} size={120} color={CHAR} pillBg={RED} />
    <Words t={t} seg={13} from={2} y={510} size={90} color={RED} pillBg={RED} />
    <At x={CX} y={860} k={el(t, wt(13, 2), 9) * (1 + Math.sin(t / 8) * 0.015)}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, backgroundColor: RED, borderRadius: 999, padding: "20px 46px 20px 28px" }}>
        <div style={{ width: 96, height: 96, borderRadius: 99, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico d={WA} c={RED} size={58} w={2} fill={RED} /></div>
        <Big size={78} color={WHITE}>51 097 272</Big>
      </div>
    </At>
  </>
);

// Outro : même fin que les autres vidéos, avec le numéro WhatsApp
const ICONS = [{ label: "Suivre", d: FOLLOW, fill: false }, { label: "J'aime", d: HEART, fill: true }, { label: "Partager", d: REPOST, fill: false }];
const Outro: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ backgroundColor: RED }}>
    <OutroIcon f={t - OUT} fg={WHITE} bg="transparent" size={420} cy={760} />
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1060, display: "flex", justifyContent: "center", gap: 70 }}>
      {ICONS.map((ic, i) => {
        const at = OUT + 58 + i * 6;
        const k = el(t, at, 9);
        const tapAt = OUT + 88 + i * 14;
        const tap = interpolate(t, [tapAt - 4, tapAt, tapAt + 8], [1, 0.82, 1], clamp);
        const on = t >= tapAt;
        return (
          <div key={ic.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: t >= at ? 1 : 0, transform: `translateY(${(1 - k) * 120}px) scale(${k * tap})` }}>
            <div style={{ width: 150, height: 150, borderRadius: 999, border: `5px solid ${WHITE}`, backgroundColor: on ? WHITE : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={78} height={78} viewBox="0 0 24 24" fill={on && ic.fill ? RED : "none"} stroke={on ? RED : WHITE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={ic.d} /></svg>
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 34, color: WHITE }}>{ic.label}</div>
          </div>
        );
      })}
    </div>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1340, display: "flex", justifyContent: "center", transform: `scale(${el(t, OUT + 104, 9)})` }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 16, backgroundColor: WHITE, borderRadius: 999, padding: "14px 36px 14px 20px" }}>
        <span style={{ width: 62, height: 62, borderRadius: 99, backgroundColor: RED, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Ico d={WA} c={WHITE} size={36} w={2} fill={WHITE} /></span>
        <Big size={52} color={RED}>51 097 272</Big>
      </span>
    </div>
  </AbsoluteFill>
);

// Transition : un disque de la couleur du plan suivant s'ouvre en cercle, bordé d'un anneau rose
const Ripple: React.FC<{ t: number; at: number; c: string }> = ({ t, at, c }) => {
  if (t < at - 12 || t > at + 1) return null;
  const e = Easing.bezier(0.7, 0, 0.3, 1);
  const r = interpolate(t, [at - 12, at], [0, 1500], { ...clamp, easing: e });
  return (
    <>
      <div style={{ position: "absolute", left: CX - r - 36, top: 760 - r - 36, width: 2 * r + 72, height: 2 * r + 72, borderRadius: 9999, backgroundColor: c === RED ? PINK : RED, zIndex: 40 }} />
      <div style={{ position: "absolute", left: CX - r, top: 760 - r, width: 2 * r, height: 2 * r, borderRadius: 9999, backgroundColor: c, zIndex: 41 }} />
    </>
  );
};

type S = [string, number, number, number];
const SFX: S[] = [
  ["cc/pop.wav", wt(0, 0), 6, 0.6],
  ["regard/snap.wav", wt(0, 1), 4, 0.5],
  ...[2, 5].map((i) => ["cc/pop.wav", wt(1, i), 6, 0.45] as S),
  ["ame/shimmer.wav", wt(1, 5), 50, 0.4],
  ["cc/ding.wav", wt(2, 3), 30, 0.4],
  ["ame/boom.wav", CUT[2] + 4, 40, 0.35],
  ...[0, 1, 2, 3, 4].map((i) => ["cc/pop.wav", wt(4, 3) + i * 4, 6, 0.35] as S),
  ["cc/pop.wav", wt(5, 5), 6, 0.5],
  ["cc/pop.wav", wt(5, 7), 6, 0.5],
  ["cc/click.wav", wt(6, 1) + 4, 3, 0.7],
  ...[0, 1, 3].map((i) => ["cc/pop.wav", wt(7, i), 6, 0.5] as S),
  ["regard/ticktock.wav", wt(7, 6), 30, 0.3],
  ...[5, 6, 8].map((i) => ["cc/pop.wav", wt(8, i), 6, 0.55] as S),
  ["ame/boom.wav", wt(8, 5), 40, 0.3],
  ...[0, 1, 2, 3, 4].map((i) => ["cc/click.wav", wt(9, 3) + i * 3, 3, 0.5] as S),
  ["cc/ding.wav", wt(10, 1), 30, 0.35],
  ["regard/riser.wav", wt(11, 3), 50, 0.3],
  ["cc/pop.wav", wt(11, 4), 6, 0.5],
  ["cc/pop.wav", wt(12, 5), 6, 0.5],
  ["cc/whoosh.wav", wt(12, 7), 15, 0.45],
  ["ame/shimmer.wav", wt(12, 7), 50, 0.35],
  ["cc/pop.wav", wt(13, 2), 6, 0.55],
  ["cc/ding.wav", wt(13, 3), 30, 0.4],
  ...CUT.slice(1).map((c) => ["cc/whoosh.wav", c - 10, 15, 0.45] as S),
  ["cc/whoosh.wav", OUT - 10, 15, 0.45],
  ["ame/shimmer.wav", OUT, 60, 0.35],
  ["ame/boom.wav", OUT + 62, 60, 0.4],
  ...[0, 1, 2].map((i) => ["cc/pop.wav", OUT + 58 + i * 6, 6, 0.45] as S),
  ...[0, 1, 2].map((i) => ["cc/click.wav", OUT + 88 + i * 14, 3, 0.6] as S),
  ["cc/pop.wav", OUT + 104, 6, 0.5],
];

const SCENES = [SA, SB, SC, SD, SE, SF, SG, SH, SI, SJ, SK, SL];

// Ta vidéo, recadrée en cercle sur le visage
const Avatar: React.FC<{ t: number }> = ({ t }) => {
  const D = 340;
  const k = el(t, 4, 11);
  const speaking = SEG.some(([a, b]) => t >= s(a) && t <= s(b) + 3);
  const pulse = speaking ? 1 + Math.abs(Math.sin(t / 3.2)) * 0.05 : 1;
  return (
    <div style={{ position: "absolute", left: CX - D / 2, top: 1130, width: D, height: D, transform: `scale(${k})`, zIndex: 30 }}>
      <div style={{ position: "absolute", left: -18, top: -18, width: D + 36, height: D + 36, borderRadius: 9999, backgroundColor: WHITE, opacity: speaking ? 0.9 : 0.5, transform: `scale(${pulse})` }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 9999, overflow: "hidden", backgroundColor: CHAR }}>
        <OffthreadVideo src={staticFile("clone/clone.mp4")} muted style={{ position: "absolute", left: D / 2 - 290 * 0.52, top: D / 2 - 680 * 0.52, width: 1080 * 0.52, height: 1920 * 0.52, objectFit: "cover" }} />
      </div>
    </div>
  );
};

export const CloneReel: React.FC = () => {
  const t = useCurrentFrame();
  let i = 0;
  while (i < 11 && t >= CUT[i + 1]) i++;
  const Scene = SCENES[i];
  const bg = BG(i);
  const inOutro = t >= OUT;
  return (
    <AbsoluteFill style={{ backgroundColor: inOutro ? RED : bg, overflow: "hidden" }}>
      {!inOutro ? (
        <>
          <Scene t={t} bg={bg} a={CUT[i]} />
          <Avatar t={t} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 236, display: "flex", justifyContent: "center", zIndex: 20 }}>
            <div style={{ width: 84, height: 84, borderRadius: 99, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 62, height: 62 }} />
            </div>
          </div>
        </>
      ) : (
        <Outro t={t} />
      )}
      {CUT.slice(1).map((c, k) => (
        <Ripple key={c} t={t} at={c} c={BG(k + 1)} />
      ))}
      <Ripple t={t} at={OUT} c={RED} />
      <Audio src={staticFile("clone/voix.mp3")} />
      <Loop durationInFrames={1020}>
        <Audio src={staticFile("cc/music.mp3")} volume={0.1} />
      </Loop>
      {SFX.map(([file, at, len, vol], k) => (
        <Sequence key={k} from={Math.max(0, at)} durationInFrames={len}>
          <Audio src={staticFile(file)} volume={vol * 0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const CoverClone: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: RED, overflow: "hidden" }}>
    <Rings t={100} at={0} bg={RED} cy={760} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 236, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 84, height: 84, borderRadius: 99, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile("outro/logo-creofan-icon.svg")} style={{ width: 62, height: 62 }} /></div>
    </div>
    <div dir="rtl" style={{ position: "absolute", left: L, width: RG - L, top: 400, textAlign: "center" }}><MixedText text="شنوة رايك؟" size={190} color={WHITE} /></div>
    <At x={CX} y={900}><Pill text="Produit · Style · Qualité" c={CHAR} size={50} /></At>
    <div style={{ position: "absolute", left: CX - 190, top: 1030, width: 380, height: 380, transform: "none" }}>
      <div style={{ position: "absolute", left: -18, top: -18, width: 416, height: 416, borderRadius: 9999, backgroundColor: WHITE }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 9999, overflow: "hidden", backgroundColor: CHAR }}>
        <Img src={staticFile("clone/face.jpg")} style={{ position: "absolute", left: 190 - 290 * 0.58, top: 190 - 680 * 0.58, width: 1080 * 0.58, height: 1920 * 0.58 }} />
      </div>
    </div>
  </AbsoluteFill>
);
