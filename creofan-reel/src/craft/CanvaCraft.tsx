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
const PROMPT = "Publicité Instagram premium pour une nourriture pour chat : un beau chat, un packaging élégant, titre « Parce qu'il mérite le meilleur. »";
const Idea: React.FC<{ t: number; p: CraftProps }> = ({ t, p }) => {
  const typed = PROMPT.slice(0, Math.floor(interpolate(t, [V.lli + 4, V.tsawer + 20], [0, PROMPT.length], clamp)));
  const dive = snap(t, V.idee + 4, 10); // le prompt plonge dans l'interface
  const frameIn = outX(t, V.lli, 14);
  const done = t >= V.design;
  const fw = 700, fh = 900;
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      <Grid color={RED} t={t} />
      {/* Cadre de l'interface réelle */}
      <div style={{ position: "absolute", left: CX - fw / 2, top: Z.top + 330, width: fw, height: fh, borderRadius: 28, overflow: "hidden", backgroundColor: WHITE, boxShadow: `18px 18px 0 ${RED}`, transform: `translateY(${(1 - frameIn) * 1200}px)` }}>
        <RealSlot src={p.craftVideo} video label="Votre enregistrement d'écran Canva Craft (prompt → génération)" w={fw} h={fh} />
      </div>
      {/* Coins de sélection qui claquent sur « design » */}
      {done
        ? [0, 1, 2, 3].map((i) => {
            const k = snap(t, V.design, 7);
            const dx = (i % 2 ? 1 : -1) * (fw / 2 + 24 + (1 - k) * 80);
            const dy = (i < 2 ? -1 : 1) * (fh / 2 + 24 + (1 - k) * 80);
            return <div key={i} style={{ position: "absolute", left: CX + dx - 26, top: Z.top + 330 + fh / 2 + dy - 26, width: 52, height: 52, borderTop: i < 2 ? `8px solid ${RED}` : "none", borderBottom: i >= 2 ? `8px solid ${RED}` : "none", borderLeft: i % 2 ? "none" : `8px solid ${RED}`, borderRight: i % 2 ? `8px solid ${RED}` : "none" }} />;
          })
        : null}
      {/* Le prompt tapé, puis aspiré dans l'interface */}
      <div
        style={{
          position: "absolute",
          left: Z.left,
          top: Z.top + 20,
          width: ZW,
          padding: "22px 28px",
          backgroundColor: RED,
          color: WHITE,
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 28,
          lineHeight: 1.35,
          boxSizing: "border-box",
          transformOrigin: "50% 0%",
          transform: `translateY(${dive * 700}px) scale(${1 - dive * 0.75})`,
          opacity: dive > 0.95 ? 0 : 1,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: 3, display: "block", marginBottom: 8 }}>PROMPT · IDÉE</span>
        {typed}
        {Math.floor(t / 8) % 2 ? "|" : ""}
      </div>
      {t >= V.idee ? (
        <div style={{ position: "absolute", left: Z.left, top: Z.top + 250, transform: `scale(${pop(t, V.idee)})`, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: RED, letterSpacing: 4 }}>
          JUSTE UNE IDÉE →
        </div>
      ) : null}
      {done ? (
        <div style={{ position: "absolute", right: Z.right, top: Z.top + 250, transform: `scale(${pop(t, V.design)})`, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: WHITE, backgroundColor: RED, padding: "6px 16px", letterSpacing: 4 }}>
          DESIGN
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- SCÈNE 04 — MAGIC LAYERS en 3D (15,7 → 21,6 s) ---------- */
const LAYER_NAMES = ["Fond", "Chat", "Packaging", "Titre", "Texte"];
const Magic: React.FC<{ t: number; p: CraftProps }> = ({ t, p }) => {
  const stop = t >= V.stanna && t < V.hkaya + 10;
  const tilt = snap(t, V.magic - 4, 14);
  const spread = snap(t, V.magic + 6, 14);
  const rebuild = snap(t, V.ya3ni - 12, 12);
  const sep = spread * (1 - rebuild);
  const side = Math.sin(Math.PI * interpolate(t, [V.element, V.element + 24], [0, 1], clamp));
  const size = 470;
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
      ) : null}
      {t >= V.magic - 6 ? (
        <>
          <div style={{ position: "absolute", zIndex: 5, top: Z.top + 10, left: Z.left, width: ZW, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 104, color: WHITE, letterSpacing: -2, lineHeight: 1, transform: `scale(${pop(t, V.magic - 6)})` }}>
            MAGIC
            <br />
            LAYERS
          </div>
          {/* Pile de calques en perspective */}
          <div style={{ position: "absolute", left: CX - size / 2, top: CY - size / 2 + 230, width: size, height: size, perspective: 1600 }}>
            <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(${55 * tilt * (1 - rebuild)}deg) rotateZ(${-35 * tilt * (1 - rebuild)}deg)` }}>
              {LAYER_NAMES.map((name, i) => {
                const z = i * 95 * sep;
                const slide = i === 2 ? side * 120 : 0;
                return (
                  <div key={name} style={{ position: "absolute", inset: 0, transform: `translateZ(${z}px) translateX(${slide}px)`, border: `3px solid ${WHITE}`, backgroundColor: i === 0 ? BEIGE : "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    {p.layers[i] ? (
                      <Img src={staticFile(p.layers[i])} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <div style={{ position: "absolute", left: 18, top: 14, fontFamily: FONT, fontWeight: 800, fontSize: 26, color: i === 0 ? RED : WHITE, letterSpacing: 2 }}>
                        CALQUE {String(i + 1).padStart(2, "0")} · {name.toUpperCase()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {t >= V.element ? (
            <div style={{ position: "absolute", bottom: Z.bottom + 20, left: Z.left, width: ZW, textAlign: "center", transform: `scale(${pop(t, V.element)})` }}>
              <MixedText text="كل élément وحدو" size={64} color={WHITE} latinColor={BEIGE} />
            </div>
          ) : null}
          {/* Interface réelle Magic Layers, en vignette */}
          {p.magicVideo ? (
            <div style={{ position: "absolute", right: Z.right, top: Z.top + 260, width: 260, height: 340, border: `4px solid ${WHITE}`, overflow: "hidden", transform: `scale(${pop(t, V.magic + 20)})` }}>
              <OffthreadVideo src={staticFile(p.magicVideo)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- SCÈNE 05 — Avant / après (21,6 → 26,5 s) ---------- */
const VERBS: [string, number][] = [["تبدّل", V.tbaddel], ["تحرّك", V.t7arrek], ["تعدّل", V.t3addel]];
const BeforeAfter: React.FC<{ t: number; p: CraftProps }> = ({ t, p }) => {
  const w = 700;
  const wipe = interpolate(t, [V.ya3ni + 6, V.ya3ni + 40, V.t3addel + 20, V.sfer], [0, 0.5, 0.5, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const strike = snap(t, V.sfer + 4, 8);
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      <Grid color={RED} t={t} />
      <div style={{ position: "absolute", left: CX - w / 2, top: Z.top + 300, width: w, height: w, boxShadow: `16px 16px 0 ${RED}`, transform: `scale(${outX(t, V.ya3ni - 6, 10)})` }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <RealSlot src={p.designBefore} label="Design généré par Canva Craft (AVANT)" w={w} h={w} />
        </div>
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - wipe * 100}% 0 0)` }}>
          <RealSlot src={p.designAfter} label="Même design modifié avec Magic Layers (APRÈS)" w={w} h={w} />
        </div>
        <div style={{ position: "absolute", top: -20, bottom: -20, left: `${wipe * 100}%`, width: 8, marginLeft: -4, backgroundColor: RED }} />
        <Label x={10} y={-44}>AVANT</Label>
        <div style={{ position: "absolute", right: 10, top: -44, fontFamily: FONT, fontWeight: 600, fontSize: 22, letterSpacing: 3, color: RED }}>APRÈS</div>
      </div>
      {/* Les trois verbes, un par mot prononcé */}
      <div dir="rtl" style={{ position: "absolute", top: Z.top + 20, left: Z.left, width: ZW, display: "flex", justifyContent: "center", gap: 34 }}>
        {VERBS.map(([v, at]) => (
          <span key={v} style={{ display: "inline-block", transform: `scale(${pop(t, at, 10)})` }}>
            <MixedText text={v} size={92} color={RED} />
          </span>
        ))}
      </div>
      {t >= V.sfer - 6 ? (
        <div style={{ position: "absolute", top: Z.top + 1080, left: Z.left, width: ZW, textAlign: "center", transform: `scale(${pop(t, V.sfer - 6)})` }}>
          <span style={{ position: "relative", display: "inline-block" }}>
            <MixedText text="من الصفر" size={84} color={RED} />
            <span style={{ position: "absolute", left: 0, top: "52%", height: 10, width: `${strike * 100}%`, backgroundColor: RED }} />
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
];

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
      {scene}
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
export const craftDefaults: CraftProps = { craftVideo: "", magicVideo: "", designBefore: "", designAfter: "", layers: [] };
