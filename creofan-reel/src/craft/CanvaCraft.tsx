import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { MixedText } from "../components";
import { BEIGE, FONT, RED, WHITE } from "../theme";

/* =====================================================================
   CREOFAN × CANVA CRAFT — calé sur la voix off (30 i/s)
   Palette stricte : rouge #f7322a, beige #fff5f5, blanc.
   Les emplacements « RÉEL » attendent les vrais enregistrements d'écran
   Canva Craft / Magic Layers (props) : rien n'est simulé.
   ===================================================================== */
export const CRAFT_DURATION = 956; // voix 30,85 s + 1 s de fin

// Zone de sécurité du brief : haut 250, bas 380, gauche 90, droite 180
const Z = { top: 250, bottom: 380, left: 90, right: 180 };
const ZW = 1080 - Z.left - Z.right; // 810
const ZH = 1920 - Z.top - Z.bottom; // 1290
const CX = Z.left + ZW / 2; // 495
const CY = Z.top + ZH / 2; // 895

// Repères de la voix (secondes, d'après les pauses de l'enregistrement)
const s = (sec: number) => Math.round(sec * 30);
export const V = {
  canva: s(0.1),
  jdida: s(2.0),
  dakhel: s(4.1), // « داخل بقوّة »
  ai: s(5.9),
  craft: s(6.72), // « CANVA CRAFT ! »
  craftWord: s(7.2),
  nouvelle: s(7.95),
  ia: s(9.3),
  lli: s(9.96), // « اللي تنجم تسهّل… »
  tsawer: s(12.58),
  idee: s(13.7),
  design: s(15.0),
  stanna: s(15.84), // « أما استنّى »
  hkaya: s(16.64),
  magic: s(18.4), // « ماجيك ليرس »
  element: s(20.6),
  ya3ni: s(21.69),
  tbaddel: s(22.6),
  t7arrek: s(23.3),
  t3addel: s(23.9),
  sfer: s(26.0),
  franchement: s(26.6),
  yalla: s(28.63),
  end: s(30.62),
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const snap = (t: number, a: number, d: number) =>
  interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: Easing.bezier(0.85, 0, 0.12, 1) });
const outX = (t: number, a: number, d: number) =>
  interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: Easing.out(Easing.exp) });
const pop = (t: number, a: number, damping = 13) =>
  spring({ frame: t - a, fps: 30, config: { damping, stiffness: 200, mass: 0.6 } });

const elastic = (t: number, a: number) => spring({ frame: t - a, fps: 30, config: { damping: 7, stiffness: 170, mass: 0.7 } });

export type CraftProps = {
  craftVideo: string; // enregistrement réel : prompt → génération (public/craft/…)
  magicVideo: string; // enregistrement réel : Magic Layers
  designBefore: string; // design généré (export PNG)
  designAfter: string; // design modifié avec Magic Layers (export PNG)
  layers: string[]; // calques exportés (fond, chat, packaging, titre, texte)
};


// Grille technique discrète (détails « interface »)
const Grid: React.FC<{ color: string; t: number }> = ({ color, t }) => (
  <AbsoluteFill style={{ opacity: 0.18 }}>
    <svg width={1080} height={1920}>
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 90 + ((t * 0.6) % 90)} y1={0} x2={i * 90 + ((t * 0.6) % 90)} y2={1920} stroke={color} strokeWidth={1} />
      ))}
      {Array.from({ length: 22 }).map((_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 90} x2={1080} y2={i * 90} stroke={color} strokeWidth={1} />
      ))}
    </svg>
  </AbsoluteFill>
);

const Label: React.FC<{ x: number; y: number; children: React.ReactNode; color?: string; o?: number }> = ({ x, y, children, color = RED, o = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: FONT, fontWeight: 600, fontSize: 22, letterSpacing: 3, color, opacity: o }}>{children}</div>
);

// Emplacement d'un média réel ; sans fichier, un cadre explicite (pas de faux écran)
const RealSlot: React.FC<{ src?: string; video?: boolean; label: string; w: number; h: number; startFrom?: number }> = ({ src, video, label, w, h, startFrom = 0 }) =>
  src ? (
    video ? (
      <OffthreadVideo src={staticFile(src)} startFrom={startFrom} style={{ width: w, height: h, objectFit: "cover" }} muted />
    ) : (
      <Img src={staticFile(src)} style={{ width: w, height: h, objectFit: "cover" }} />
    )
  ) : (
    <div style={{ width: w, height: h, boxSizing: "border-box", border: `4px dashed ${RED}`, backgroundColor: WHITE, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: FONT, textAlign: "center", padding: 30 }}>
      <div style={{ fontWeight: 800, fontSize: 34, color: RED, letterSpacing: 2 }}>RÉEL · À INSÉRER</div>
      <div style={{ fontWeight: 600, fontSize: 24, color: RED, opacity: 0.75 }}>{label}</div>
    </div>
  );

// Enregistrement réel recadré sur l'interface, segment [from, from+dur[ à la vitesse rate
const STRIP = { x: 381, w: 516, srcW: 1280, srcH: 720 };
const Clip: React.FC<{ src: string; from: number; dur: number; srcStart: number; rate: number; h: number }> = ({ src, from, dur, srcStart, rate, h }) => {
  const k = h / STRIP.srcH;
  return (
    <Sequence from={from} durationInFrames={dur} layout="none">
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <OffthreadVideo
          src={staticFile(src)}
          muted
          startFrom={Math.round(srcStart * 30)}
          playbackRate={rate}
          style={{ position: "absolute", left: -STRIP.x * k, top: 0, width: STRIP.srcW * k, height: h, maxWidth: "none" }}
        />
      </div>
    </Sequence>
  );
};
const stripW = (h: number) => (STRIP.w * h) / STRIP.srcH;

/* ---------- SCÈNE 01 — L'accroche (0 → 6,4 s) ---------- */
const FRAGS = Array.from({ length: 22 }, (_, i) => ({
  a: random(`a${i}`) * Math.PI * 2,
  d: 260 + random(`d${i}`) * 520,
  k: i % 4,
  rot: (random(`r${i}`) - 0.5) * 220,
  label: ["TEXT", "IMAGE", "LAYER", "FONT", "SHAPE", "1080×1080", "Aa", "#F7322A"][i % 8],
}));
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const impact = snap(t, V.dakhel, 8); // panneau rouge en 3D
  const toward = outX(t, V.dakhel, 12); // CANVA aspiré vers la caméra
  const ai = t >= V.ai;
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      <Grid color={RED} t={t} />
      {/* Explosion de fragments de design */}
      {FRAGS.map((f, i) => {
        const k = outX(t, 0, 16 + (i % 5) * 3);
        const back = snap(t, V.dakhel - 6, 8);
        const r = f.d * k * (1 + back * 2);
        const x = CX + Math.cos(f.a) * r;
        const y = CY + Math.sin(f.a) * r * 1.3;
        const common: React.CSSProperties = { position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${f.rot * k}deg)` };
        if (f.k === 0) return <div key={i} style={{ ...common, width: 70 + (i % 3) * 40, height: 18, backgroundColor: RED }} />;
        if (f.k === 1) return <div key={i} style={{ ...common, width: 46, height: 46, borderRadius: 99, border: `6px solid ${RED}` }} />;
        if (f.k === 2) return <div key={i} style={{ ...common, padding: "6px 14px", borderRadius: 999, backgroundColor: WHITE, border: `2px solid ${RED}`, fontFamily: FONT, fontWeight: 600, fontSize: 20, color: RED }}>{f.label}</div>;
        return <div key={i} style={{ ...common, width: 90, height: 110, backgroundColor: WHITE, boxShadow: `8px 8px 0 ${RED}` }} />;
      })}
      {/* CANVA : chaque lettre claque depuis la profondeur */}
      <div style={{ position: "absolute", top: CY - 240, left: Z.left, width: ZW, display: "flex", justifyContent: "center", transform: `scale(${1 + toward * 3}) translateY(${toward * -40}px)`, opacity: toward > 0.85 ? 0 : 1 }}>
        {"CANVA".split("").map((ch, i) => {
          const k = outX(t, 2 + i * 3, 9);
          return (
            <span key={i} style={{ display: "inline-block", fontFamily: FONT, fontWeight: 800, fontSize: 158, color: RED, letterSpacing: -4, transform: `scale(${interpolate(k, [0, 1], [4, 1])}) translateY(${(1 - k) * -120}px)`, opacity: k > 0 ? 1 : 0 }}>
              {ch}
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: CY + 10, left: Z.left, width: ZW, textAlign: "center", transform: `scale(${pop(t, V.jdida - 8)})`, opacity: 1 - toward }}>
        <MixedText text="كل مرة حاجة جديدة" size={58} color={RED} />
      </div>
      <Img src={staticFile("cc/canva-icon.png")} style={{ position: "absolute", top: CY + 150, left: CX - 80, width: 160, height: 160, transform: `scale(${pop(t, 12)}) rotate(${(1 - pop(t, 12)) * -30}deg)`, opacity: 1 - toward }} />
      {/* « داخل بقوّة » : panneau rouge qui bascule en 3D et couvre l'écran */}
      <AbsoluteFill style={{ perspective: 1400 }}>
        <AbsoluteFill style={{ backgroundColor: RED, transformOrigin: "50% 0%", transform: `rotateX(${(1 - impact) * 88}deg)`, opacity: impact > 0 ? 1 : 0 }}>
          <Grid color={WHITE} t={t} />
          <div style={{ position: "absolute", top: Z.top + 60, left: Z.left, width: ZW, textAlign: "center", transform: `scale(${pop(t, V.dakhel + 4)})` }}>
            <MixedText text="داخل بقوّة" size={110} color={WHITE} />
          </div>
          {ai ? (
            <div style={{ position: "absolute", top: CY - 230, left: Z.left, width: ZW, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 480, lineHeight: 1, letterSpacing: -10 }}>
              {/* Extrusion : copies décalées en profondeur */}
              {[6, 5, 4, 3, 2, 1].map((d) => (
                <span key={d} style={{ position: "absolute", left: 0, right: 0, color: d % 2 ? BEIGE : WHITE, opacity: 0.18 + 0.06 * (6 - d), transform: `translate(${d * 9 * outX(t, V.ai, 10)}px, ${d * 9 * outX(t, V.ai, 10)}px)` }}>AI</span>
              ))}
              <span style={{ position: "relative", color: WHITE, display: "inline-block", transform: `scale(${interpolate(outX(t, V.ai, 8), [0, 1], [2.4, 1])})` }}>AI</span>
            </div>
          ) : null}
          <Label x={Z.left} y={Z.top + 1210} color={WHITE} o={ai ? 1 : 0}>NEW DIMENSION — 01</Label>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- SCÈNE 02 — CANVA CRAFT se construit (6,4 → 9,9 s) ---------- */
const SliceWord: React.FC<{ word: string; t: number; at: number; size: number; color: string }> = ({ word, t, at, size, color }) => (
  <div style={{ position: "relative", height: size * 1.05, display: "flex", justifyContent: "center" }}>
    {[0, 1, 2].map((sl) => {
      const k = snap(t, at + sl * 3, 9);
      const dir = sl % 2 ? 1 : -1;
      return (
        <div key={sl} style={{ position: sl ? "absolute" : "relative", fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.05, color, letterSpacing: -3, clipPath: `inset(${sl * 33.4}% 0 ${100 - (sl + 1) * 33.4}% 0)`, transform: `translateX(${(1 - k) * dir * 900}px)` }}>
          {word}
        </div>
      );
    })}
  </div>
);
const Reveal: React.FC<{ t: number }> = ({ t }) => {
  const exitUp = snap(t, V.lli - 6, 8);
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      <Grid color={RED} t={t} />
      <div style={{ position: "absolute", top: Z.top + 230, left: Z.left, width: ZW, transform: `translateY(${exitUp * -1400}px)` }}>
        <Img src={staticFile("cc/canva-icon.png")} style={{ display: "block", margin: "0 auto 30px", width: 150, height: 150, transform: `scale(${pop(t, V.craft)})` }} />
        <SliceWord word="CANVA" t={t} at={V.craft} size={190} color={RED} />
        <SliceWord word="CRAFT" t={t} at={V.craftWord} size={190} color={RED} />
        <div style={{ marginTop: 50, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, transform: `scale(${pop(t, V.nouvelle)})` }}>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 26, color: WHITE, backgroundColor: RED, borderRadius: 999, padding: "8px 20px", letterSpacing: 3 }}>NEW</span>
          <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 38, color: RED }}>
            Une nouvelle fonctionnalité <span style={{ backgroundColor: t >= V.ia ? RED : "transparent", color: t >= V.ia ? WHITE : RED, padding: "0 10px" }}>IA</span>
          </span>
        </div>
      </div>
      <Label x={Z.left} y={Z.top + 1210} o={0.8}>CANVA CRAFT · 02</Label>
    </AbsoluteFill>
  );
};

/* ---------- SCÈNE 03 — L'idée devient design (9,9 → 15,7 s) ---------- */
// Le prompt réellement tapé dans Canva Craft (voir l'enregistrement)
const PROMPT = "Faire un post instagram pour une marque \"pets\" pour les chats, couleur chaud";
const Idea: React.FC<{ t: number; p: CraftProps }> = ({ t, p }) => {
  const typed = PROMPT.slice(0, Math.floor(interpolate(t, [V.lli + 4, V.tsawer + 10], [0, PROMPT.length], clamp)));
  const dive = snap(t, V.idee + 4, 10); // le prompt plonge dans l'interface
  const frameIn = elastic(t, V.lli);
  const done = t >= V.design;
  // Zoom « punch » sur le premier résultat généré, puis léger panoramique
  const zoom = interpolate(snap(t, V.design - 2, 10), [0, 1], [1, 1.9]);
  const pan = interpolate(t, [V.design + 8, V.design + 40], [0, -40], clamp);
  const fh = 886, fw = Math.round(stripW(fh));
  const top = Z.top + 330;
  return (
    <AbsoluteFill style={{ backgroundColor: RED, overflow: "hidden" }}>
      <Grid color={WHITE} t={t} />
      {/* Cadre de l'interface réelle */}
      <div style={{ position: "absolute", left: CX - fw / 2, top, width: fw, height: fh, borderRadius: 28, overflow: "hidden", backgroundColor: WHITE, boxShadow: `18px 18px 0 ${BEIGE}`, transform: `translateY(${(1 - frameIn) * 1200}px) rotate(${(1 - frameIn) * 8}deg)` }}>
        <div style={{ position: "absolute", inset: 0, transformOrigin: "30% 37%", transform: `scale(${zoom}) translateX(${pan}px)` }}>
          {p.craftVideo ? (
            <>
              {/* frappe du prompt (2 → 42 s) · génération (44 → 72 s) · résultats (72 → 80 s) */}
              <Clip src={p.craftVideo} from={V.lli} dur={76} srcStart={2} rate={16} h={fh} />
              <Clip src={p.craftVideo} from={V.lli + 76} dur={54} srcStart={44} rate={16} h={fh} />
              <Clip src={p.craftVideo} from={V.lli + 130} dur={60} srcStart={72} rate={4} h={fh} />
            </>
          ) : (
            <RealSlot label="Votre enregistrement d'écran Canva Craft (prompt → génération)" w={fw} h={fh} />
          )}
        </div>
      </div>
      {/* Coins de sélection qui claquent sur « design » */}
      {done
        ? [0, 1, 2, 3].map((i) => {
            const k = elastic(t, V.design);
            const dx = (i % 2 ? 1 : -1) * (fw / 2 + 24 + (1 - k) * 80);
            const dy = (i < 2 ? -1 : 1) * (fh / 2 + 24 + (1 - k) * 80);
            return <div key={i} style={{ position: "absolute", left: CX + dx - 26, top: top + fh / 2 + dy - 26, width: 52, height: 52, borderTop: i < 2 ? `8px solid ${WHITE}` : "none", borderBottom: i >= 2 ? `8px solid ${WHITE}` : "none", borderLeft: i % 2 ? "none" : `8px solid ${WHITE}`, borderRight: i % 2 ? `8px solid ${WHITE}` : "none" }} />;
          })
        : null}
      {/* Le prompt réel, tapé puis aspiré dans l'interface */}
      <div style={{ position: "absolute", left: Z.left, top: Z.top + 20, width: ZW, padding: "22px 28px", backgroundColor: BEIGE, color: RED, fontFamily: FONT, fontWeight: 600, fontSize: 30, lineHeight: 1.35, boxSizing: "border-box", transformOrigin: "50% 0%", transform: `translateY(${dive * 700}px) scale(${(1 - dive * 0.75) * (0.6 + 0.4 * elastic(t, V.lli + 2))})`, opacity: dive > 0.95 ? 0 : 1 }}>
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: 3, display: "block", marginBottom: 8 }}>PROMPT · CANVA CRAFT</span>
        {typed}
        {Math.floor(t / 8) % 2 ? "|" : ""}
      </div>
      {t >= V.idee ? (
        <div style={{ position: "absolute", left: Z.left, top: Z.top + 250, transform: `scale(${elastic(t, V.idee)})`, transformOrigin: "0 50%", fontFamily: FONT, fontWeight: 800, fontSize: 30, color: WHITE, letterSpacing: 4 }}>
          JUSTE UNE IDÉE →
        </div>
      ) : null}
      {done ? (
        <div style={{ position: "absolute", right: Z.right, top: Z.top + 250, transform: `scale(${elastic(t, V.design)})`, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: RED, backgroundColor: BEIGE, padding: "6px 16px", letterSpacing: 4 }}>
          DESIGN
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- SCÈNE 04 — MAGIC LAYERS en 3D (15,7 → 21,6 s) ---------- */
// Zones du design généré (image 1507×2000) que Magic Layers a rendues modifiables
const ZONES = [
  { name: "Titre", x: 105, y: 215, w: 560, h: 395 },
  { name: "Sous-titre", x: 105, y: 650, w: 470, h: 120 },
  { name: "Chat", x: 560, y: 520, w: 947, h: 960 },
  { name: "Gamelle", x: 0, y: 1190, w: 910, h: 500 },
  { name: "Logo", x: 1110, y: 1640, w: 340, h: 230 },
];
const IMG = { w: 1507, h: 2000 };
const Magic: React.FC<{ t: number; p: CraftProps }> = ({ t, p }) => {
  const stop = t < V.magic - 6;
  const ui = t >= V.magic - 6 && t < V.magic + 44; // interface réelle (Calques magiques → analyse)
  const stack = t >= V.magic + 44;
  const tilt = Math.min(1.08, elastic(t, V.magic + 44));
  const spread = snap(t, V.magic + 50, 12);
  const rebuild = snap(t, V.ya3ni - 12, 12);
  const sep = spread * (1 - rebuild);
  const side = Math.sin(Math.PI * interpolate(t, [V.element, V.element + 24], [0, 1], clamp));
  const H = 560, Wd = (H * IMG.w) / IMG.h; // design 3:4
  const k = H / IMG.h;
  const fh = 860, fw = Math.round(stripW(fh));
  return (
    <AbsoluteFill style={{ backgroundColor: RED, overflow: "hidden" }}>
      <Grid color={WHITE} t={t} />
      {/* « أما استنّى » : arrêt net, tranches décalées */}
      {stop ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, top: Z.top + 200 + i * 170, height: 14, backgroundColor: WHITE, transform: `translateX(${(i % 2 ? 1 : -1) * (1 - snap(t, V.stanna + i, 6)) * 1100}px)` }} />
          ))}
          <div style={{ transform: `scale(${pop(t, V.stanna, 9)})` }}>
            <MixedText text="أما استنّى" size={150} color={WHITE} />
          </div>
          {t >= V.hkaya ? (
            <div style={{ marginTop: 20, transform: `scale(${pop(t, V.hkaya)})` }}>
              <MixedText text="الحكاية ما وقفتش لهنا" size={62} color={BEIGE} />
            </div>
          ) : null}
        </AbsoluteFill>
      ) : (
        <div style={{ position: "absolute", zIndex: 5, top: Z.top + 10, left: Z.left, width: ZW, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 96, color: WHITE, letterSpacing: -2, lineHeight: 1, transform: `scale(${pop(t, V.magic - 6)})` }}>
          MAGIC LAYERS
        </div>
      )}
      {/* 1. L'interface réelle : « Calques magiques » puis l'analyse */}
      {ui && p.magicVideo ? (
        <div style={{ position: "absolute", left: CX - fw / 2, top: Z.top + 150, width: fw, height: fh, overflow: "hidden", border: `6px solid ${WHITE}`, transform: `translateY(${(1 - elastic(t, V.magic - 6)) * 1300}px)` }}>
          {/* zoom sur le bouton « Calques magiques » au moment du clic, puis retour */}
          <div style={{ position: "absolute", inset: 0, transformOrigin: "52% 33%", transform: `scale(${1 + 0.9 * snap(t, V.magic + 4, 8) * (1 - snap(t, V.magic + 18, 6))})` }}>
            <Clip src={p.magicVideo} from={V.magic - 6} dur={24} srcStart={1.5} rate={4} h={fh} />
            <Clip src={p.magicVideo} from={V.magic + 18} dur={26} srcStart={8} rate={18} h={fh} />
          </div>
        </div>
      ) : null}
      {/* 2. Le vrai design séparé en calques dans l'espace */}
      {stack ? (
        <div style={{ position: "absolute", left: CX - Wd / 2 - 40, top: Z.top + 330, width: Wd, height: H, perspective: 1600 }}>
          <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(${50 * tilt * (1 - rebuild)}deg) rotateZ(${-30 * tilt * (1 - rebuild)}deg)` }}>
            <div style={{ position: "absolute", inset: 0, border: `3px solid ${WHITE}` }}>
              <Img src={staticFile(p.designBefore || "craft/avant.jpg")} style={{ width: "100%", height: "100%" }} />
            </div>
            {ZONES.map((zn, i) => {
              const z = (i + 1) * 70 * sep;
              const slide = zn.name === "Gamelle" ? side * 90 : 0;
              return (
                <div key={zn.name} style={{ position: "absolute", left: zn.x * k, top: zn.y * k, width: zn.w * k, height: zn.h * k, overflow: "hidden", outline: `3px solid ${WHITE}`, transform: `translateZ(${z}px) translateX(${slide}px)` }}>
                  <Img src={staticFile(p.designBefore || "craft/avant.jpg")} style={{ position: "absolute", left: -zn.x * k, top: -zn.y * k, width: Wd, height: H, maxWidth: "none" }} />
                  <div style={{ position: "absolute", left: 0, top: 0, padding: "2px 6px", backgroundColor: WHITE, color: RED, fontFamily: FONT, fontWeight: 800, fontSize: 13, letterSpacing: 1, opacity: sep }}>{zn.name.toUpperCase()}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      {/* Vignette : l'édition réelle des calques (sélection, agrandissement, déplacement) */}
      {stack && p.magicVideo ? (
        <div style={{ position: "absolute", right: Z.right, top: Z.top + 140, width: Math.round(stripW(330)), height: 330, overflow: "hidden", border: `4px solid ${WHITE}`, transform: `scale(${pop(t, V.magic + 50)})`, transformOrigin: "100% 0%" }}>
          <Clip src={p.magicVideo} from={V.magic + 44} dur={V.ya3ni - (V.magic + 44)} srcStart={24} rate={26} h={330} />
        </div>
      ) : null}
      {t >= V.element ? (
        <div style={{ position: "absolute", bottom: Z.bottom + 20, left: Z.left, width: ZW, textAlign: "center", transform: `scale(${pop(t, V.element)})` }}>
          <MixedText text="كل élément وحدو" size={64} color={WHITE} latinColor={BEIGE} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- SCÈNE 05 — Avant / après en split screen (21,6 → 26,5 s) ---------- */
const VERBS: [string, number][] = [["تبدّل", V.tbaddel], ["تحرّك", V.t7arrek], ["تعدّل", V.t3addel]];
const BeforeAfter: React.FC<{ t: number; p: CraftProps }> = ({ t, p }) => {
  const w = 370, h = Math.round((w * 2000) / 1507);
  const top = Z.top + 330;
  const L = elastic(t, V.ya3ni - 4), R = elastic(t, V.ya3ni + 2);
  const bar = elastic(t, V.ya3ni + 6);
  // L'« après » réagit à chaque verbe : petit rebond
  const beat = VERBS.reduce((acc, [, at]) => acc + (t >= at ? 0.06 * Math.exp(-(t - at) / 5) * Math.cos((t - at) / 1.6) : 0), 0);
  const strike = snap(t, V.sfer + 4, 8);
  const card = (src: string, label: string, x: number, k: number, from: number, extra = 1) => (
    <div style={{ position: "absolute", left: x, top, width: w, height: h, transform: `translateX(${(1 - k) * from}px) scale(${extra})`, boxShadow: `12px 12px 0 ${BEIGE}` }}>
      <Img src={staticFile(src)} style={{ width: w, height: h, display: "block" }} />
      <div style={{ position: "absolute", left: 0, top: -48, fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: RED, backgroundColor: BEIGE, padding: "4px 14px" }}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: RED, overflow: "hidden" }}>
      <Grid color={WHITE} t={t} />
      {/* moitié gauche légèrement plus claire : lecture « avant | après » immédiate */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: CX, backgroundColor: "rgba(255,245,245,0.12)", transform: `translateX(${(1 - L) * -600}px)` }} />
      {card(p.designBefore, "AVANT", CX - w - 22, L, -900)}
      {card(p.designAfter, "APRÈS", CX + 22, R, 900, 1 + beat)}
      {/* séparateur élastique */}
      <div style={{ position: "absolute", left: CX - 4, top: top - 70, width: 8, height: (h + 140) * bar, backgroundColor: BEIGE }} />
      {/* Les trois verbes, un par mot prononcé */}
      <div dir="rtl" style={{ position: "absolute", top: Z.top + 20, left: Z.left, width: ZW, display: "flex", justifyContent: "center", gap: 34 }}>
        {VERBS.map(([v, at]) => (
          <span key={v} style={{ display: "inline-block", transform: `scale(${t >= at ? elastic(t, at) : 0})` }}>
            <MixedText text={v} size={92} color={BEIGE} />
          </span>
        ))}
      </div>
      {t >= V.sfer - 6 ? (
        <div style={{ position: "absolute", top: Z.top + 130, left: Z.left, width: ZW, textAlign: "center", transform: `scale(${elastic(t, V.sfer - 6)})` }}>
          <span style={{ position: "relative", display: "inline-block" }}>
            <MixedText text="من الصفر" size={76} color={WHITE} />
            <span style={{ position: "absolute", left: 0, top: "52%", height: 10, width: `${strike * 100}%`, backgroundColor: BEIGE }} />
          </span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- SCÈNE 06 — Signature CREOFAN (26,5 → 31,9 s) ---------- */
const Outro: React.FC<{ t: number }> = ({ t }) => {
  const iris = outX(t, V.yalla - 4, 14);
  const logoK = snap(t, V.yalla + 6, 16);
  const tag = outX(t, V.yalla + 26, 14);
  return (
    <AbsoluteFill style={{ backgroundColor: RED, overflow: "hidden" }}>
      <Grid color={WHITE} t={t} />
      <div style={{ position: "absolute", top: Z.top + 200, left: Z.left, width: ZW, textAlign: "center", fontFamily: FONT, color: WHITE, transform: `translateY(${iris * -900}px)` }}>
        <div style={{ fontWeight: 600, fontSize: 52, transform: `scale(${pop(t, V.franchement)})` }}>Franchement,</div>
        <div style={{ fontWeight: 800, fontSize: 112, lineHeight: 1.05, letterSpacing: -3, transform: `scale(${pop(t, V.franchement + 14, 10)})` }}>
          ça vaut
          <br />
          le coup !
        </div>
      </div>
      {/* Transition : un carré beige se déplie depuis le centre (comme un calque qui s'ouvre) */}
      <div style={{ position: "absolute", left: CX - 1200 * iris, top: CY - 1200 * iris, width: 2400 * iris, height: 2400 * iris, backgroundColor: BEIGE, transform: `rotate(${45 * (1 - iris)}deg)` }} />
      {t >= V.yalla ? (
        <>
          <div style={{ position: "absolute", top: CY - 170, left: CX - 280, width: 560, clipPath: `inset(0 ${100 - logoK * 100}% 0 0)` }}>
            <Img src={staticFile("ame/logo-creofan-rouge.png")} style={{ width: 560 }} />
          </div>
          <div style={{ position: "absolute", top: CY + 230, left: Z.left, width: ZW, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 30, letterSpacing: 6, color: RED, transform: `translateY(${(1 - tag) * 40}px)`, opacity: tag > 0 ? 1 : 0 }}>
            CREATIVE TOOLS.
            <br />
            NEW POSSIBILITIES.
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- Son ---------- */
type Sfx = [string, number, number, number];
const SFX: Sfx[] = [
  ["regard/sub.wav", 0, 27, 0.6],
  ...[0, 1, 2, 3, 4].map((i) => ["cc/pop.wav", 2 + i * 3, 6, 0.5] as Sfx),
  ["ame/boom.wav", V.dakhel, 60, 0.55],
  ["cc/whoosh.wav", V.dakhel - 4, 15, 0.5],
  ["regard/glitch.wav", V.ai, 8, 0.4],
  ["regard/sub.wav", V.ai, 27, 0.5],
  ["cc/whoosh.wav", V.craft - 6, 15, 0.5],
  ["regard/snap.wav", V.craft, 3, 0.5],
  ["regard/snap.wav", V.craftWord, 3, 0.5],
  ["cc/pop.wav", V.nouvelle, 6, 0.5],
  ["cc/whoosh.wav", V.lli - 6, 15, 0.45],
  ["cc/typing.wav", V.lli + 4, 70, 0.45],
  ["ame/zoom.wav", V.idee + 2, 8, 0.6],
  ["cc/ding.wav", V.design, 25, 0.45],
  ["regard/glitch.wav", V.stanna, 8, 0.6],
  ["regard/riser.wav", V.magic - 30, 30, 0.45],
  ...[0, 1, 2, 3, 4].map((i) => ["regard/glass.wav", V.magic + 6 + i * 3, 30, 0.3] as Sfx),
  ["cc/whoosh.wav", V.element, 15, 0.45],
  ["regard/crunch.wav", V.ya3ni - 12, 10, 0.5],
  ...VERBS.map(([, at]) => ["cc/pop.wav", at, 6, 0.55] as Sfx),
  ["regard/swish.wav", V.sfer + 4, 10, 0.6],
  ["cc/whoosh.wav", V.franchement - 4, 15, 0.45],
  ["ame/boom.wav", V.yalla + 6, 60, 0.45],
  ["regard/bell.wav", V.yalla + 26, 50, 0.35],
  ...[V.craft - 8, V.lli - 2, V.stanna, V.ya3ni - 2, V.franchement - 2].map((c) => ["ame/zoom.wav", c - 7, 9, 0.45] as Sfx),
];

const CUTS = [V.craft - 8, V.lli - 2, V.stanna, V.ya3ni - 2, V.franchement - 2];
// Zoom swipe : la scène sortante zoome et part vers le haut (flou), l'entrante monte du bas
const swipe = (t: number): React.CSSProperties => {
  const bounds = [0, ...CUTS, CRAFT_DURATION];
  let i = 0;
  while (i < bounds.length - 2 && t >= bounds[i + 1]) i++;
  const start = bounds[i], end = bounds[i + 1];
  if (i > 0 && t < start + 9) {
    const k = interpolate(t, [start, start + 9], [0, 1], { ...clamp, easing: Easing.out(Easing.exp) });
    return { transform: `translateY(${(1 - k) * 520}px) scale(${1.25 - 0.25 * k})`, filter: `blur(${(1 - k) * 14}px)` };
  }
  if (i < bounds.length - 2 && t > end - 7) {
    const k = interpolate(t, [end - 7, end], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
    return { transform: `translateY(${-k * 520}px) scale(${1 + 0.35 * k})`, filter: `blur(${k * 14}px)` };
  }
  return {};
};

export const CanvaCraft: React.FC<CraftProps> = (p) => {
  const t = useCurrentFrame();
  const scene =
    t < V.craft - 8 ? <Hook t={t} /> :
    t < V.lli - 2 ? <Reveal t={t} /> :
    t < V.stanna ? <Idea t={t} p={p} /> :
    t < V.ya3ni - 2 ? <Magic t={t} p={p} /> :
    t < V.franchement - 2 ? <BeforeAfter t={t} p={p} /> :
    <Outro t={t} />;
  return (
    <>
      <AbsoluteFill style={{ backgroundColor: RED }}>
        <AbsoluteFill style={swipe(t)}>{scene}</AbsoluteFill>
      </AbsoluteFill>
      <Audio src={staticFile("craft/voix-off.mp3")} />
      <Audio src={staticFile("cc/music.mp3")} volume={(f) => interpolate(f, [0, 10, CRAFT_DURATION - 30, CRAFT_DURATION], [0, 0.12, 0.12, 0], clamp)} />
      {SFX.map(([file, at, len, vol], i) => (
        <Sequence key={i} from={Math.max(0, at)} durationInFrames={len}>
          <Audio src={staticFile(file)} volume={vol * 0.7} />
        </Sequence>
      ))}
    </>
  );
};
export const craftDefaults: CraftProps = { craftVideo: "craft/craft.mp4", magicVideo: "craft/magic.mp4", designBefore: "craft/avant.jpg", designAfter: "craft/apres.jpg", layers: [] };
