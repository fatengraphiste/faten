import React from "react";
import { AbsoluteFill } from "remotion";
import { MixedText } from "../components";
import "../theme";

// CREOFAN — CREATIVE AI MASTERCLASS : storyboard en 6 plans, flat design « dossiers »
// Palette stricte : rouge, beige, rose (accent), charbon. Aucune ombre, aucun dégradé.
const RED = "#f7322a";
const BEIGE = "#fff5f5";
const PINK = "#fa8985";
const CHAR = "#1c1716";
const FONT = "Poppins, sans-serif";
// Zone sûre Reels : haut 250, bas 380, gauche 90, droite 180
const L = 90;
const RGT = 900;

const T = 64; // hauteur de l'onglet
const R = 26; // rayon des coins
const folderPath = (w: number, h: number, tw: number) =>
  `M0 ${R} A${R} ${R} 0 0 1 ${R} 0 L${tw} 0 C${tw + T * 0.55} 0 ${tw + T * 0.45} ${T} ${tw + T} ${T} L${w - R} ${T} A${R} ${R} 0 0 1 ${w} ${T + R} L${w} ${T + h - R} A${R} ${R} 0 0 1 ${w - R} ${T + h} L${R} ${T + h} A${R} ${R} 0 0 1 0 ${T + h - R} Z`;
const ink = (c: string) => (c === RED || c === CHAR ? BEIGE : CHAR);

type FP = { x: number; y: number; w: number; h: number; c: string; label?: string; rot?: number; tabW?: number; num?: string; children?: React.ReactNode };
const Folder: React.FC<FP> = ({ x, y, w, h, c, label, rot = 0, tabW, num, children }) => {
  const tw = tabW ?? Math.max(200, w * 0.42);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: T + h, transform: `rotate(${rot}deg)`, transformOrigin: "50% 50%" }}>
      <svg width={w} height={T + h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={folderPath(w, h, tw)} fill={c} stroke={CHAR} strokeWidth={6} strokeLinejoin="round" />
      </svg>
      {label ? (
        <div style={{ position: "absolute", left: 28, top: 0, height: T, display: "flex", alignItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: ink(c), whiteSpace: "nowrap" }}>{label}</div>
      ) : null}
      {num ? <div style={{ position: "absolute", right: 28, bottom: 20, fontFamily: FONT, fontWeight: 600, fontSize: 20, letterSpacing: 2, color: ink(c), opacity: 0.6 }}>{num}</div> : null}
      <div style={{ position: "absolute", left: 0, top: T, width: w, height: h }}>{children}</div>
    </div>
  );
};

// Lignes de liste à l'intérieur d'un dossier
const Lines: React.FC<{ c: string; n?: number; x?: number; y?: number; w?: number; seed?: number }> = ({ c, n = 3, x = 28, y = 34, w = 300, seed = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, display: "flex", flexDirection: "column", gap: 16 }}>
    {Array.from({ length: n }).map((_, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 14, height: 14, borderRadius: 99, backgroundColor: ink(c), opacity: 0.85 }} />
        <div style={{ height: 12, borderRadius: 99, width: w * (0.45 + (((i + 1) * 37 * seed) % 50) / 100), backgroundColor: ink(c), opacity: 0.3 }} />
      </div>
    ))}
  </div>
);

const Header: React.FC<{ n: number; dark?: boolean }> = ({ n, dark = true }) => {
  const c = dark ? BEIGE : CHAR;
  return (
    <div style={{ position: "absolute", top: 256, left: L, width: RGT - L, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontWeight: 600, fontSize: 20, letterSpacing: 4, color: c }}>
      <span>CREOFAN — CREATIVE AI MASTERCLASS</span>
      <span style={{ color: RED }}>0{n} / 06</span>
    </div>
  );
};
const Title: React.FC<{ text: string; top: number; size?: number; color?: string; latin?: string }> = ({ text, top, size = 72, color = BEIGE, latin = RED }) => (
  <div style={{ position: "absolute", top, left: L, width: RGT - L, textAlign: "center" }}>
    <MixedText text={text} size={size} color={color} latinColor={latin} />
  </div>
);
const Chip: React.FC<{ text: string; top: number; c?: string }> = ({ text, top, c = PINK }) => (
  <div style={{ position: "absolute", top, left: L, width: RGT - L, display: "flex", justifyContent: "center" }}>
    <span style={{ backgroundColor: c, color: ink(c), fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: 3, padding: "10px 28px", borderRadius: 999 }}>{text}</span>
  </div>
);
const Q: React.FC<{ x: number; y: number; s?: number; r?: number; c?: string }> = ({ x, y, s = 120, r = 0, c = PINK }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: FONT, fontWeight: 800, fontSize: s, lineHeight: 1, color: c, transform: `rotate(${r}deg)` }}>?</div>
);
// Flèche dessinée (trait + pointe), en SVG plein écran
const Arrow: React.FC<{ d: string; c?: string; w?: number; dash?: boolean; head: [number, number, number] }> = ({ d, c = BEIGE, w = 6, dash, head: [hx, hy, ha] }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash ? "2 18" : undefined} />
    <path d="M-22 -16 L4 0 L-22 16" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${hx} ${hy}) rotate(${ha})`} />
  </svg>
);
const Bg: React.FC<{ c?: string; children: React.ReactNode }> = ({ c = CHAR, children }) => <AbsoluteFill style={{ backgroundColor: c, overflow: "hidden" }}>{children}</AbsoluteFill>;

/* PLAN 01 — trop d'informations */
export const Plan01: React.FC = () => {
  const F: [string, string, number, number, number][] = [
    ["SKILLS", BEIGE, 40, 560, -8],
    ["PROMPTS", RED, 430, 530, 6],
    ["COMMANDS", PINK, 150, 710, 3],
    ["AI TOOLS", BEIGE, 450, 800, -5],
    ["TUTORIALS", RED, 50, 930, -3],
    ["REELS", PINK, 400, 1040, 7],
    ["WORKFLOWS", BEIGE, 110, 1150, 4],
    ["TECHNIQUES", RED, 360, 1250, -2],
  ];
  return (
    <Bg>
      <Header n={1} />
      <Title text="لمّيت Skills, Prompts, Commands" top={316} size={50} />
      <Title text="وتفرّجت في Reels..." top={396} size={66} color={PINK} latin={RED} />
      {F.map(([lb, c, x, y, r], i) => (
        <Folder key={lb} x={x} y={y} w={520} h={240} c={c} label={lb} rot={r} num={`${String(i + 1).padStart(2, "0")} / 08`}>
          <Lines c={c} n={i === F.length - 1 ? 4 : 3} seed={i + 2} />
        </Folder>
      ))}
      <div style={{ position: "absolute", left: 640, top: 1452, transform: "rotate(-6deg)", backgroundColor: BEIGE, color: RED, fontFamily: FONT, fontWeight: 800, fontSize: 30, padding: "8px 22px", borderRadius: 999, border: `5px solid ${CHAR}` }}>+248 SAVED</div>
    </Bg>
  );
};

/* PLAN 02 — confusion */
export const Plan02: React.FC = () => (
  <Bg>
    <Header n={2} />
    <Title text="أما كي تجي تخدم وحدك..." top={310} size={62} />
    <Title text="منين تبدأ؟" top={395} size={90} color={RED} />
    <Folder x={30} y={580} w={340} h={170} c={BEIGE} label="PROMPT 01" rot={-16}><Lines c={BEIGE} n={2} w={220} /></Folder>
    <Folder x={620} y={560} w={340} h={170} c={PINK} label="TOOL 02" rot={14}><Lines c={PINK} n={2} w={220} seed={3} /></Folder>
    <Folder x={20} y={1240} w={340} h={170} c={PINK} label="TUTORIAL" rot={10}><Lines c={PINK} n={2} w={220} seed={5} /></Folder>
    <Folder x={600} y={1250} w={340} h={170} c={RED} label="IDEA 03" rot={-12}><Lines c={RED} n={2} w={220} seed={2} /></Folder>
    <Folder x={330} y={1360} w={340} h={170} c={BEIGE} label="WORKFLOW" rot={-4}><Lines c={BEIGE} n={2} w={220} seed={4} /></Folder>
    <Arrow d="M300 760 C 420 700, 520 760, 600 700" dash head={[600, 700, -30]} />
    <Arrow d="M820 800 C 900 900, 760 900, 820 960 S 900 1060, 840 1100" dash head={[840, 1100, 110]} />
    <Arrow d="M240 1240 C 160 1150, 260 1100, 180 1040" dash c={PINK} head={[180, 1040, -120]} />
    <Arrow d="M560 1300 C 520 1340, 600 1360, 540 1390" dash c={PINK} head={[540, 1390, 120]} />
    <Folder x={140} y={800} w={640} h={360} c={RED} label="?" rot={-2} tabW={150} num="ERROR 404">
      <div style={{ position: "absolute", left: 40, top: 40, right: 40, fontFamily: FONT, fontWeight: 800, fontSize: 96, lineHeight: 0.95, letterSpacing: -3, color: BEIGE }}>
        WHERE DO
        <br />I START?
      </div>
    </Folder>
    <Q x={820} y={1020} s={150} r={14} />
    <Q x={90} y={760} s={110} r={-18} c={BEIGE} />
    <Q x={470} y={1150} s={90} r={8} />
  </Bg>
);

/* PLAN 03 — du chaos à la méthode */
export const Plan03: React.FC = () => {
  const mess: [string, string, number, number, number][] = [
    ["PROMPT", BEIGE, 40, 640, -14],
    ["TOOL", PINK, 120, 790, 11],
    ["REEL", RED, 30, 950, -6],
    ["SKILL", BEIGE, 140, 1100, 15],
    ["IDEA", PINK, 50, 1250, -10],
  ];
  const order: [string, string, string][] = [
    ["IDEA", BEIGE, "01"],
    ["DESIGN", PINK, "02"],
    ["CREATION", RED, "03"],
  ];
  return (
    <Bg>
      <Header n={3} />
      <Title text="الحل في الـ pratique!" top={330} size={76} />
      <div style={{ position: "absolute", left: L, top: 520, fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: 5, color: PINK }}>CHAOS</div>
      <div style={{ position: "absolute", left: 540, top: 520, fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: 5, color: RED }}>METHOD</div>
      {mess.map(([lb, c, x, y, r], i) => (
        <Folder key={lb} x={x} y={y} w={290} h={140} c={c} label={lb} rot={r} tabW={150}><Lines c={c} n={2} w={180} seed={i + 1} /></Folder>
      ))}
      {order.map(([lb, c, n], i) => (
        <Folder key={lb} x={540} y={570 + i * 300} w={360} h={170} c={c} label={lb} tabW={190}>
          <div style={{ position: "absolute", right: 30, top: 10, fontFamily: FONT, fontWeight: 800, fontSize: 120, lineHeight: 1, letterSpacing: -6, color: ink(c) }}>{n}</div>
          <Lines c={c} n={2} w={140} y={60} seed={i + 3} />
        </Folder>
      ))}
      {/* flèches verticales entre les étapes */}
      <Arrow d="M720 812 L720 862" w={8} head={[720, 866, 90]} />
      <Arrow d="M720 1112 L720 1162" w={8} head={[720, 1166, 90]} />
      {/* grosse flèche chaos → méthode */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M330 960 L470 960 L470 920 L540 990 L470 1060 L470 1020 L330 1020 Z" fill={RED} stroke={CHAR} strokeWidth={6} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left: 540, top: 1460, width: 360, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontWeight: 800, fontSize: 28, color: BEIGE }}>
        <span>IDEA</span><span style={{ color: PINK }}>→</span><span>DESIGN</span><span style={{ color: PINK }}>→</span><span style={{ color: RED }}>CREATION</span>
      </div>
    </Bg>
  );
};

/* PLAN 04 — atelier 01 : Canva + Claude */
export const Plan04: React.FC = () => (
  <Bg>
    <Header n={4} />
    <Title text="من الفكرة حتى للتصميم" top={310} size={80} />
    <Chip text="WORKSHOP 01 — CANVA + CLAUDE" top={430} />
    <Folder x={L} y={560} w={560} h={280} c={BEIGE} label="IDEA" num="STEP 01"><Lines c={BEIGE} n={2} w={260} /></Folder>
    <Folder x={L + 50} y={680} w={560} h={280} c={PINK} label="CLAUDE" num="STEP 02"><Lines c={PINK} n={2} w={260} seed={3} /></Folder>
    <Folder x={L + 100} y={800} w={560} h={280} c={RED} label="CANVA" num="STEP 03"><Lines c={RED} n={2} w={260} seed={4} /></Folder>
    <Folder x={L + 150} y={920} w={600} h={500} c={BEIGE} label="FINAL DESIGN" num="STEP 04" tabW={250} />
    {/* la toile du post qui sort du dossier */}
    <div style={{ position: "absolute", left: 545, top: 770, width: 350, height: 470, transform: "rotate(5deg)", backgroundColor: CHAR, border: `6px solid ${CHAR}`, borderRadius: 18, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: PINK }} />
      <div style={{ position: "absolute", left: 180, top: -60, width: 300, height: 300, borderRadius: 999, backgroundColor: RED }} />
      <div style={{ position: "absolute", left: -40, top: 300, width: 200, height: 200, backgroundColor: BEIGE, transform: "rotate(45deg)" }} />
      <div style={{ position: "absolute", left: 30, top: 70, fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 0.92, letterSpacing: -3, color: CHAR }}>
        BIG
        <br />
        IDEAS
        <br />
        <span style={{ color: BEIGE }}>ONLY.</span>
      </div>
      <div style={{ position: "absolute", left: 30, bottom: 34, right: 30, height: 70, borderRadius: 999, backgroundColor: CHAR, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: BEIGE }}>SWIPE →</div>
    </div>
    <div style={{ position: "absolute", left: 260, top: 1290, width: 420, fontFamily: FONT, fontWeight: 600, fontSize: 24, letterSpacing: 2, color: CHAR, lineHeight: 1.6 }}>
      IDEA → PROMPT → LAYOUT
      <br />
      <span style={{ fontWeight: 800, color: RED }}>→ READY TO POST</span>
    </div>
  </Bg>
);

/* PLAN 05 — atelier 02 : motion design IA */
export const Plan05: React.FC = () => (
  <Bg>
    <Header n={5} />
    <Title text="كيفاش تحوّل تصاميمك" top={300} size={66} />
    <Title text="لفيديوهات متحرّكة" top={385} size={66} color={PINK} />
    <Chip text="WORKSHOP 02 — AI MOTION DESIGN" top={490} c={RED} />
    <Folder x={L} y={600} w={470} h={300} c={BEIGE} label="CARD 01" num="STATIC DESIGN">
      <div style={{ position: "absolute", left: 40, top: 40, width: 130, height: 130, borderRadius: 999, backgroundColor: RED }} />
      <div style={{ position: "absolute", left: 200, top: 60, width: 200, height: 26, borderRadius: 99, backgroundColor: CHAR }} />
      <div style={{ position: "absolute", left: 200, top: 104, width: 140, height: 26, borderRadius: 99, backgroundColor: PINK }} />
    </Folder>
    <Folder x={220} y={840} w={600} h={300} c={PINK} label="CARD 02" num="ANIMATION FRAMES">
      <div style={{ position: "absolute", left: 30, top: 40, display: "flex", gap: 16 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ width: 120, height: 150, borderRadius: 14, backgroundColor: BEIGE, border: `5px solid ${CHAR}`, position: "relative" }}>
            <div style={{ position: "absolute", left: 10 + i * 18, top: 70 - i * 18, width: 44, height: 44, borderRadius: 99, backgroundColor: RED }} />
            <div style={{ position: "absolute", left: 10, bottom: 6, fontFamily: FONT, fontWeight: 800, fontSize: 16, color: CHAR }}>F0{i + 1}</div>
          </div>
        ))}
      </div>
    </Folder>
    <Folder x={300} y={1080} w={600} h={380} c={RED} label="CARD 03" num="MOTION DESIGN">
      {/* traînée du mouvement : formes dupliquées */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ position: "absolute", left: 40 + i * 70, top: 210 - i * 36, width: 90 + i * 12, height: 90 + i * 12, borderRadius: 999, backgroundColor: i === 4 ? BEIGE : i % 2 ? PINK : CHAR, border: `5px solid ${CHAR}` }} />
      ))}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: 40 + i * 20, top: 300 + i * 0, width: 260 - i * 60, height: 12, marginTop: i * 26, borderRadius: 99, backgroundColor: BEIGE }} />
      ))}
      <div style={{ position: "absolute", right: 30, top: 30, width: 90, height: 90, borderRadius: 999, backgroundColor: BEIGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={40} height={40} viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" fill={RED} /></svg>
      </div>
    </Folder>
    <Arrow d="M600 720 C 720 720, 800 760, 800 830" head={[800, 834, 90]} />
    <Arrow d="M180 1000 C 160 1120, 200 1200, 290 1230" c={PINK} head={[292, 1232, 20]} />
  </Bg>
);

/* PLAN 06 — l'événement */
export const Plan06: React.FC = () => (
  <Bg>
    <Header n={6} />
    <Folder x={L} y={300} w={RGT - L} h={360} c={RED} label="28.11.2026" tabW={300}>
      <div style={{ position: "absolute", left: 40, top: 40, fontFamily: FONT, fontWeight: 800, fontSize: 112, lineHeight: 0.95, letterSpacing: -4, color: BEIGE }}>CREATIVE AI</div>
      <div style={{ position: "absolute", left: 40, top: 150, fontFamily: FONT, fontWeight: 800, fontSize: 100, lineHeight: 0.95, letterSpacing: -4, color: CHAR }}>MASTERCLASS</div>
      <div style={{ position: "absolute", left: 40, top: 280, fontFamily: FONT, fontWeight: 600, fontSize: 24, letterSpacing: 4, color: BEIGE }}>BY CREOFAN</div>
    </Folder>
    <Folder x={L} y={690} w={RGT - L} h={280} c={BEIGE} label="WORKSHOPS" rot={-1.5} tabW={260}>
      <div style={{ position: "absolute", left: 40, top: 30, fontFamily: FONT, fontWeight: 800, fontSize: 50, letterSpacing: -1, color: CHAR }}>2 PRACTICAL WORKSHOPS</div>
      {["CANVA + CLAUDE", "AI MOTION DESIGN"].map((w, i) => (
        <div key={w} style={{ position: "absolute", left: 40, top: 110 + i * 70, display: "flex", alignItems: "center", gap: 20, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: RED }}>
          <span style={{ backgroundColor: RED, color: BEIGE, borderRadius: 999, fontSize: 24, padding: "6px 16px" }}>0{i + 1}</span>
          {w}
        </div>
      ))}
    </Folder>
    <Folder x={L} y={1000} w={RGT - L} h={300} c={PINK} label="INFOS" rot={1.5} tabW={200}>
      <div style={{ position: "absolute", left: 40, top: 26, fontFamily: FONT, fontWeight: 800, fontSize: 46, color: CHAR }}>28 NOVEMBRE 2026</div>
      <div style={{ position: "absolute", left: 40, top: 86, fontFamily: FONT, fontWeight: 600, fontSize: 28, letterSpacing: 2, color: CHAR }}>PRÉSENTIEL — ARIANA VILLE</div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 140, height: 5, borderRadius: 9, backgroundColor: CHAR }} />
      {[["85 DT", "/ PERSONNE"], ["70 DT", "/ PERSONNE EN DUO"]].map(([p, s], i) => (
        <div key={p} style={{ position: "absolute", left: 40 + i * 380, top: 160, fontFamily: FONT, color: CHAR }}>
          <div style={{ fontWeight: 800, fontSize: 76, lineHeight: 1, letterSpacing: -3, color: i ? BEIGE : RED }}>{p}</div>
          <div style={{ fontWeight: 600, fontSize: 22, letterSpacing: 2 }}>{s}</div>
        </div>
      ))}
    </Folder>
    {/* espace libre en bas : logo Creofan + WhatsApp */}
  </Bg>
);

export const PLANS = [Plan01, Plan02, Plan03, Plan04, Plan05, Plan06];
