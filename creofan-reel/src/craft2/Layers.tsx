import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { MixedText } from "../components";
import { BEIGE, FONT, FONT_AR, RED, WHITE } from "../theme";
import { CRAFT_DURATION, V } from "../craft/CanvaCraft";

/* =====================================================================
   « TOUT EST CALQUE » — Creofan × Canva Craft, version 2
   Le film est un fichier de design traversé en 3D : chaque scène est un
   calque de papier (décollement, plongée en profondeur, lamelles).
   Palette : rouge #f7322a, beige #fff5f5, blanc. Salma + Poppins.
   ===================================================================== */
export const LAYERS_DURATION = CRAFT_DURATION;
const W = 1080, H = 1920;
const Z = { top: 250, bottom: 380, left: 90, right: 180 };
const ZW = W - Z.left - Z.right; // 810
const CX = Z.left + ZW / 2; // 495
const CY = Z.top + (H - Z.top - Z.bottom) / 2; // 895

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number, a: number, d: number, e = Easing.bezier(0.85, 0, 0.12, 1)) => interpolate(t, [a, a + d], [0, 1], { ...clamp, easing: e });
const outX = (t: number, a: number, d: number) => ease(t, a, d, Easing.out(Easing.exp));
const inX = (t: number, a: number, d: number) => ease(t, a, d, Easing.in(Easing.exp));
const el = (t: number, a: number, damping = 8) => spring({ frame: t - a, fps: 30, config: { damping, stiffness: 180, mass: 0.7 } });

/* ---------- Enregistrements réels recadrés sur l'interface Canva ---------- */
const STRIP = { x: 381, w: 516, srcW: 1280, srcH: 720 };
const stripW = (h: number) => (STRIP.w * h) / STRIP.srcH;
const Clip: React.FC<{ src: string; from: number; dur: number; srcStart: number; rate: number; h: number }> = ({ src, from, dur, srcStart, rate, h }) => {
  const k = h / STRIP.srcH;
  return (
    <Sequence from={from} durationInFrames={dur} layout="none">
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <OffthreadVideo src={staticFile(src)} muted startFrom={Math.round(srcStart * 30)} playbackRate={rate} style={{ position: "absolute", left: -STRIP.x * k, top: 0, width: STRIP.srcW * k, height: h, maxWidth: "none" }} />
      </div>
    </Sequence>
  );
};

/* ---------- Détails éditoriaux ---------- */
const Tag: React.FC<{ x: number; y: number; c: string; children: React.ReactNode; align?: "left" | "right" }> = ({ x, y, c, children, align = "left" }) => (
  <div style={{ position: "absolute", [align]: x, top: y, fontFamily: FONT, fontWeight: 600, fontSize: 19, letterSpacing: 3, color: c, whiteSpace: "nowrap" }}>{children}</div>
);
// Repères d'impression aux coins de la zone utile
const CropMarks: React.FC<{ c: string }> = ({ c }) => (
  <>
    {[[Z.left - 30, Z.top - 30], [W - Z.right + 30, Z.top - 30], [Z.left - 30, H - Z.bottom + 30], [W - Z.right + 30, H - Z.bottom + 30]].map(([x, y], i) => (
      <svg key={i} width={40} height={40} style={{ position: "absolute", left: x - 20, top: y - 20 }}>
        <path d="M20 0 V40 M0 20 H40" stroke={c} strokeWidth={2} />
      </svg>
    ))}
  </>
);
const Paper: React.FC<{ bg: string; children: React.ReactNode }> = ({ bg, children }) => (
  <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
    {/* grain de papier très léger */}
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.035) 1px, transparent 1px)", backgroundSize: "6px 6px" }} />
    {children}
  </AbsoluteFill>
);
const Timecode: React.FC<{ t: number; c: string; layer: string }> = ({ t, c, layer }) => {
  const s = Math.floor(t / 30), f = t % 30;
  return (
    <>
      <Tag x={Z.left} y={Z.top - 70} c={c}>CREOFAN × CANVA</Tag>
      <Tag x={Z.right} y={Z.top - 70} c={c} align="right">{`${layer} · 00:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`}</Tag>
    </>
  );
};

/* =====================================================================
   SCÈNE 1 — CANVA en lamelles, puis plongée à travers les calques
   ===================================================================== */
const BANDS = 6;
const S1: React.FC<{ t: number }> = ({ t }) => {
  const dive = t >= V.dakhel;
  const bandH = H / BANDS;
  return (
    <Paper bg={RED}>
      {Array.from({ length: BANDS }).map((_, i) => {
        const inK = outX(t, i * 2, 12);
        const dir = i % 2 ? 1 : -1;
        // décalage rythmique : un cran tous les 15 frames (un temps)
        const step = Math.floor(Math.max(0, t - 15) / 15);
        const shear = dir * ((step % 3) - 1) * 60 * (1 - inX(t, V.dakhel - 10, 10));
        // plongée : chaque lamelle file vers la caméra, l'une après l'autre
        const fly = inX(t, V.dakhel + i * 2, 12);
        const light = i % 2 === 0;
        return (
          <div key={i} style={{ position: "absolute", left: 0, top: i * bandH, width: W, height: bandH, overflow: "hidden", backgroundColor: light ? BEIGE : RED, transform: `translateX(${(1 - inK) * dir * W + shear}px) scale(${1 + fly * 7})`, transformOrigin: `${CX}px ${CY - i * bandH}px`, opacity: fly > 0.9 ? 0 : 1 }}>
            <div style={{ position: "absolute", left: -120 + dir * 40, top: -i * bandH + CY - 330, fontFamily: FONT, fontWeight: 800, fontSize: 560, lineHeight: 1, letterSpacing: -30, color: light ? RED : BEIGE, whiteSpace: "nowrap" }}>CANVA</div>
            <Tag x={18} y={10} c={light ? RED : BEIGE}>{`LAYER 0${i + 1}`}</Tag>
          </div>
        );
      })}
      {!dive ? (
        <>
          <div style={{ position: "absolute", left: CX - 90, top: Z.top + 1090, width: 180, height: 180, borderRadius: 999, backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${el(t, 14)})`, boxShadow: "0 18px 40px rgba(0,0,0,0.18)" }}>
            <Img src={staticFile("cc/canva-icon.png")} style={{ width: 130, height: 130 }} />
          </div>
          {t >= V.jdida - 10 ? (
            <div style={{ position: "absolute", left: Z.left, width: ZW, top: Z.top + 960, textAlign: "center", transform: `scale(${el(t, V.jdida - 10)})` }}>
              <span style={{ backgroundColor: RED, padding: "2px 22px" }}>
                <MixedText text="كل مرة حاجة جديدة" size={50} color={WHITE} style={{ display: "inline" }} />
              </span>
            </div>
          ) : null}
        </>
      ) : (
        <>
          {/* « داخل بقوّة » traverse l'écran puis s'efface vers la caméra */}
          {t < V.ai + 4 ? (
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${0.4 + outX(t, V.dakhel + 2, 10) * 0.6 + inX(t, V.ai - 6, 10) * 6})`, opacity: t > V.ai + 2 ? 0 : 1 }}>
              <MixedText text="داخل بقوّة" size={190} color={BEIGE} />
            </AbsoluteFill>
          ) : null}
          {/* AI : surgit du fond, extrudé en calques */}
          {t >= V.ai - 4 ? (
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", perspective: 1400 }}>
              <div style={{ position: "relative", transform: `scale(${interpolate(outX(t, V.ai - 4, 14), [0, 1], [0.15, 1])}) rotateY(${(1 - outX(t, V.ai - 4, 20)) * -40 + Math.sin(t / 14) * 6}deg) rotateX(${Math.cos(t / 17) * 5}deg)`, transformStyle: "preserve-3d" }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} style={{ position: i ? "absolute" : "relative", left: 0, top: 0, fontFamily: FONT, fontWeight: 800, fontSize: 560, lineHeight: 1, letterSpacing: -30, color: i === 0 ? WHITE : "transparent", WebkitTextStroke: i ? `2px ${i % 2 ? BEIGE : WHITE}` : undefined, transform: `translateZ(${-i * 16}px)`, opacity: i ? 0.5 - i * 0.04 : 1 }}>
                    AI
                  </div>
                ))}
              </div>
            </AbsoluteFill>
          ) : null}
          <Tag x={Z.left} y={H - Z.bottom - 30} c={BEIGE}>NEW DIMENSION / Z-AXIS</Tag>
        </>
      )}
      <Timecode t={t} c={dive ? BEIGE : RED} layer="LAYER 01" />
    </Paper>
  );
};

/* =====================================================================
   SCÈNE 2 — CANVA CRAFT : un bloc de calques en 3D isométrique
   ===================================================================== */
const S2: React.FC<{ t: number }> = ({ t }) => {
  const iso = ease(t, V.craft, 16) * (1 - ease(t, V.craftWord + 22, 14));
  const ticker = (t * 9) % 1200;
  return (
    <Paper bg={BEIGE}>
      <CropMarks c={RED} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", perspective: 1800 }}>
        <div style={{ transformStyle: "preserve-3d", transform: `translateY(-80px) rotateX(${iso * 52}deg) rotateZ(${iso * -32}deg) scale(${0.9 + 0.1 * el(t, V.craft)})` }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{ position: i ? "absolute" : "relative", left: 0, top: 0, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 200, lineHeight: 0.92, letterSpacing: -8, color: i === 0 ? RED : "transparent", WebkitTextStroke: i ? `2px ${RED}` : undefined, transform: `translateZ(${-i * 9 * iso}px)`, opacity: i ? 0.55 : 1 }}>
              CANVA
              <br />
              <span style={{ display: "inline-block", transform: `translateX(${(1 - outX(t, V.craftWord, 10)) * 900}px)` }}>CRAFT</span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: CX - 75, top: Z.top + 40, transform: `scale(${el(t, V.craft)}) rotate(${(1 - el(t, V.craft)) * 40}deg)` }}>
        <Img src={staticFile("cc/canva-icon.png")} style={{ width: 150, height: 150 }} />
      </div>
      {/* Bandeau défilant : « Une nouvelle fonctionnalité IA » */}
      <div style={{ position: "absolute", left: -200, right: -200, top: Z.top + 1080, height: 96, backgroundColor: RED, transform: `rotate(-4deg) scaleX(${outX(t, V.nouvelle, 10)})`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: -ticker, top: 18, whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 800, fontSize: 48, color: WHITE, letterSpacing: 1 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} style={{ marginRight: 40 }}>
              UNE NOUVELLE FONCTIONNALITÉ <span style={{ color: RED, backgroundColor: t >= V.ia ? BEIGE : WHITE, padding: "0 10px" }}>IA</span> ✦
            </span>
          ))}
        </div>
      </div>
      <Timecode t={t} c={RED} layer="LAYER 02" />
    </Paper>
  );
};

/* =====================================================================
   SCÈNE 3 — L'idée (le vrai prompt) devient design ; le design s'arrache
   ===================================================================== */
const PROMPT = "FAIRE UN POST INSTAGRAM POUR UNE MARQUE “PETS” POUR LES CHATS, COULEUR CHAUD — ";
const S3: React.FC<{ t: number; p: LayersProps }> = ({ t, p }) => {
  const fh = 860, fw = Math.round(stripW(fh));
  const cardIn = el(t, V.lli - 2, 10);
  const suck = inX(t, V.idee, 12); // la phrase est aspirée dans l'interface
  const pull = outX(t, V.design - 3, 16); // le design s'arrache de l'écran
  const tilt = (1 - pull) * -16 + Math.sin(t / 20) * 3;
  const m1 = (t * 7) % 2200, m2 = (t * 5) % 2200;
  return (
    <Paper bg={RED}>
      {/* L'idée en typographie géante qui défile */}
      {[0, 1].map((row) => (
        <div key={row} style={{ position: "absolute", top: row ? 1380 : 140, left: 0, whiteSpace: "nowrap", fontFamily: FONT, fontWeight: 800, fontSize: 120, letterSpacing: -3, color: row ? "transparent" : BEIGE, WebkitTextStroke: row ? `2px ${BEIGE}` : undefined, transform: `translateX(${row ? -2200 + m2 : -m1}px) scaleY(${1 - suck * 0.95})`, transformOrigin: `${CX}px 50%`, opacity: row ? 0.7 : 1 }}>
          {PROMPT.repeat(3)}
        </div>
      ))}
      {/* Le calque « interface réelle » en perspective */}
      <AbsoluteFill style={{ perspective: 1600 }}>
        <div style={{ position: "absolute", left: CX - fw / 2, top: Z.top + 150, width: fw, height: fh, transformStyle: "preserve-3d", transform: `translateY(${(1 - cardIn) * 1400}px) rotateY(${tilt}deg) rotateX(${(1 - pull) * 6}deg)` }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 26, overflow: "hidden", backgroundColor: WHITE, boxShadow: "30px 40px 60px rgba(0,0,0,0.25)" }}>
            <Clip src={p.craftVideo} from={V.lli} dur={76} srcStart={2} rate={16} h={fh} />
            <Clip src={p.craftVideo} from={V.lli + 76} dur={54} srcStart={44} rate={16} h={fh} />
            <Clip src={p.craftVideo} from={V.lli + 130} dur={60} srcStart={72} rate={4} h={fh} />
          </div>
          {/* reflet lumineux qui balaie le calque */}
          <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: `linear-gradient(105deg, transparent ${30 + ((t * 3) % 120) - 60}%, rgba(255,255,255,0.35) ${40 + ((t * 3) % 120) - 60}%, transparent ${50 + ((t * 3) % 120) - 60}%)` }} />
        </div>
      </AbsoluteFill>
      {/* Le design généré quitte l'interface et vient vers le spectateur */}
      {t >= V.design - 3 ? (
        <div style={{ position: "absolute", left: CX - 230, top: Z.top + 300, width: 460, height: 610, transform: `translate(${(1 - pull) * -90}px, ${(1 - pull) * -170}px) scale(${interpolate(pull, [0, 1], [0.32, 1])}) rotate(${(1 - pull) * -6 + 3}deg)`, boxShadow: `22px 22px 0 ${BEIGE}` }}>
          <Img src={staticFile(p.designBefore)} style={{ width: "100%", height: "100%", display: "block" }} />
          <div style={{ position: "absolute", right: -18, top: -26, backgroundColor: BEIGE, color: RED, fontFamily: FONT, fontWeight: 800, fontSize: 30, padding: "6px 18px", letterSpacing: 4, transform: `scale(${el(t, V.design + 6)}) rotate(4deg)` }}>DESIGN</div>
        </div>
      ) : null}
      {t >= V.idee - 2 && t < V.design ? (
        <div style={{ position: "absolute", left: Z.left, top: H - Z.bottom - 70, transform: `scale(${el(t, V.idee - 2)})`, transformOrigin: "0 50%", fontFamily: FONT, fontWeight: 800, fontSize: 40, color: WHITE, letterSpacing: 2 }}>
          juste une idée →
        </div>
      ) : null}
      <Timecode t={t} c={BEIGE} layer="LAYER 03" />
    </Paper>
  );
};

/* =====================================================================
   SCÈNE 4 — « استنّى » puis MAGIC LAYERS : le vrai design éclaté, en orbite
   ===================================================================== */
const ZONES = [
  { name: "TITRE", x: 105, y: 215, w: 560, h: 395 },
  { name: "SOUS-TITRE", x: 105, y: 650, w: 470, h: 120 },
  { name: "CHAT", x: 560, y: 520, w: 947, h: 960 },
  { name: "GAMELLE", x: 0, y: 1190, w: 910, h: 500 },
  { name: "LOGO", x: 1110, y: 1640, w: 340, h: 230 },
];
const S4: React.FC<{ t: number; p: LayersProps }> = ({ t, p }) => {
  const pause = t < V.magic - 8;
  if (pause) {
    // Arrêt sur image : barres « pause » géantes
    const k = el(t, V.stanna, 9);
    return (
      <Paper bg={BEIGE}>
        <CropMarks c={RED} />
        <div style={{ position: "absolute", left: CX - 170, top: Z.top + 170, display: "flex", gap: 80, transform: `scale(${k})` }}>
          {[0, 1].map((i) => <div key={i} style={{ width: 130, height: 440, backgroundColor: RED, transform: `translateY(${(1 - el(t, V.stanna + i * 3, 9)) * -600}px)` }} />)}
        </div>
        <div style={{ position: "absolute", left: Z.left, width: ZW, top: Z.top + 680, textAlign: "center", transform: `scale(${el(t, V.stanna + 4)})` }}>
          <MixedText text="أما استنّى" size={150} color={RED} />
        </div>
        {t >= V.hkaya ? (
          <div style={{ position: "absolute", left: Z.left, width: ZW, top: Z.top + 900, textAlign: "center", transform: `translateY(${(1 - outX(t, V.hkaya, 10)) * 60}px)` }}>
            <MixedText text="الحكاية ما وقفتش لهنا" size={58} color={RED} />
          </div>
        ) : null}
        <Timecode t={t} c={RED} layer="PAUSE ▌▌" />
      </Paper>
    );
  }
  const ui = t < V.magic + 44;
  const fh = 820, fw = Math.round(stripW(fh));
  const H0 = 640, W0 = (H0 * 1507) / 2000, k = H0 / 2000;
  const explode = el(t, V.magic + 46, 11);
  const rebuild = ease(t, V.ya3ni - 14, 12);
  const sep = Math.max(0, explode * (1 - rebuild));
  const orbit = interpolate(t, [V.magic + 44, V.ya3ni], [-28, 24], clamp);
  const side = Math.sin(Math.PI * interpolate(t, [V.element, V.element + 26], [0, 1], clamp));
  return (
    <Paper bg={RED}>
      {/* typographie de fond géante, coupée par le cadre */}
      <div style={{ position: "absolute", left: -60, top: 520, fontFamily: FONT, fontWeight: 800, fontSize: 330, lineHeight: 0.86, letterSpacing: -14, color: "transparent", WebkitTextStroke: `2px ${BEIGE}`, opacity: 0.55, transform: `translateX(${-((t - V.magic) * 2)}px)` }}>
        MAGIC
        <br />
        LAYERS
      </div>
      <div style={{ position: "absolute", left: Z.left, width: ZW, top: Z.top + 10, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 92, letterSpacing: -2, color: WHITE, transform: `scale(${el(t, V.magic - 8)})` }}>MAGIC LAYERS</div>
      {ui ? (
        <AbsoluteFill style={{ perspective: 1600 }}>
          <div style={{ position: "absolute", left: CX - fw / 2, top: Z.top + 170, width: fw, height: fh, borderRadius: 22, overflow: "hidden", boxShadow: "30px 40px 60px rgba(0,0,0,0.25)", transform: `translateY(${(1 - el(t, V.magic - 8, 10)) * 1400}px) rotateY(14deg)` }}>
            <div style={{ position: "absolute", inset: 0, transformOrigin: "52% 33%", transform: `scale(${1 + 0.9 * ease(t, V.magic + 4, 8) * (1 - ease(t, V.magic + 18, 6))})` }}>
              <Clip src={p.magicVideo} from={V.magic - 8} dur={26} srcStart={1.5} rate={4} h={fh} />
              <Clip src={p.magicVideo} from={V.magic + 18} dur={26} srcStart={8} rate={18} h={fh} />
            </div>
          </div>
        </AbsoluteFill>
      ) : (
        <>
          <AbsoluteFill style={{ perspective: 1500 }}>
            <div style={{ position: "absolute", left: CX - W0 / 2, top: Z.top + 230, width: W0, height: H0, transformStyle: "preserve-3d", transform: `rotateX(${sep * 48}deg) rotateY(${orbit * sep}deg) rotateZ(${sep * -18}deg)` }}>
              <div style={{ position: "absolute", inset: 0, boxShadow: "0 30px 60px rgba(0,0,0,0.25)" }}>
                <Img src={staticFile(p.designBefore)} style={{ width: "100%", height: "100%" }} />
              </div>
              {ZONES.map((zn, i) => {
                const z = (i + 1) * 80 * sep;
                const slide = zn.name === "GAMELLE" ? side * 110 : 0;
                return (
                  <div key={zn.name} style={{ position: "absolute", left: zn.x * k, top: zn.y * k, width: zn.w * k, height: zn.h * k, overflow: "hidden", outline: `3px solid ${BEIGE}`, transform: `translateZ(${z}px) translateX(${slide}px)` }}>
                    <Img src={staticFile(p.designBefore)} style={{ position: "absolute", left: -zn.x * k, top: -zn.y * k, width: W0, height: H0, maxWidth: "none" }} />
                    <div style={{ position: "absolute", left: 0, top: 0, padding: "3px 8px", backgroundColor: BEIGE, color: RED, fontFamily: FONT, fontWeight: 800, fontSize: 14, letterSpacing: 2, opacity: sep }}>{`0${i + 1} ${zn.name}`}</div>
                  </div>
                );
              })}
            </div>
          </AbsoluteFill>
          {/* vignette : l'édition réelle des calques */}
          <div style={{ position: "absolute", right: Z.right - 10, top: Z.top + 190, width: Math.round(stripW(300)), height: 300, overflow: "hidden", border: `4px solid ${BEIGE}`, transform: `scale(${el(t, V.magic + 52)}) rotate(3deg)`, transformOrigin: "100% 0%" }}>
            <Clip src={p.magicVideo} from={V.magic + 44} dur={V.ya3ni - (V.magic + 44)} srcStart={24} rate={26} h={300} />
          </div>
          {t >= V.element ? (
            <div style={{ position: "absolute", left: Z.left, width: ZW, top: H - Z.bottom - 110, textAlign: "center", transform: `scale(${el(t, V.element)})` }}>
              <MixedText text="كل élément وحدو" size={70} color={WHITE} latinColor={BEIGE} />
            </div>
          ) : null}
        </>
      )}
      <Timecode t={t} c={BEIGE} layer="LAYER 04" />
    </Paper>
  );
};

/* =====================================================================
   SCÈNE 5 — la carte se retourne : avant → après ; verbes géants en fond
   ===================================================================== */
const VERBS: [string, number][] = [["تبدّل", V.tbaddel], ["تحرّك", V.t7arrek], ["تعدّل", V.t3addel]];
const S5: React.FC<{ t: number; p: LayersProps }> = ({ t, p }) => {
  const w = 500, h = Math.round((w * 2000) / 1507);
  const flip = el(t, V.tbaddel, 10); // 0 → avant, 1 → après
  const move = Math.sin(Math.PI * interpolate(t, [V.t7arrek, V.t7arrek + 18], [0, 1], clamp));
  const cur = [...VERBS].reverse().find(([, at]) => t >= at);
  const strike = ease(t, V.sfer + 4, 8);
  return (
    <Paper bg={BEIGE}>
      <CropMarks c={RED} />
      {/* le verbe prononcé, en très grand, derrière la carte */}
      {cur ? (
        <div key={cur[0]} style={{ position: "absolute", left: -100, right: -100, top: 560, textAlign: "center", fontFamily: FONT_AR, fontWeight: 700, fontSize: 420, lineHeight: 1, color: RED, opacity: 0.16, transform: `translateY(${(1 - outX(t, cur[1], 10)) * 300}px)` }}>{cur[0]}</div>
      ) : null}
      <AbsoluteFill style={{ perspective: 1800 }}>
        <div style={{ position: "absolute", left: CX - w / 2, top: Z.top + 250, width: w, height: h, transformStyle: "preserve-3d", transform: `translateY(${(1 - el(t, V.ya3ni - 12, 10)) * 1400}px) translateX(${move * 60}px) rotateY(${flip * 180 + move * 10}deg) rotateZ(${move * -4}deg)` }}>
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", boxShadow: `18px 18px 0 ${RED}` }}>
            <Img src={staticFile(p.designBefore)} style={{ width: "100%", height: "100%" }} />
            <div style={{ position: "absolute", left: -10, top: -40, fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: BEIGE, backgroundColor: RED, padding: "4px 14px" }}>AVANT</div>
          </div>
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", boxShadow: `-18px 18px 0 ${RED}` }}>
            <Img src={staticFile(p.designAfter)} style={{ width: "100%", height: "100%" }} />
            <div style={{ position: "absolute", right: -10, top: -40, fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: BEIGE, backgroundColor: RED, padding: "4px 14px" }}>APRÈS</div>
          </div>
        </div>
      </AbsoluteFill>
      <div dir="rtl" style={{ position: "absolute", top: Z.top + 10, left: Z.left, width: ZW, display: "flex", justifyContent: "center", gap: 30 }}>
        {VERBS.map(([v, at]) => (
          <span key={v} style={{ display: "inline-block", transform: `scale(${t >= at ? el(t, at) : 0})` }}>
            <MixedText text={v} size={86} color={RED} />
          </span>
        ))}
      </div>
      {t >= V.sfer - 6 ? (
        <div style={{ position: "absolute", left: Z.left, width: ZW, top: H - Z.bottom - 120, textAlign: "center", transform: `scale(${el(t, V.sfer - 6)})` }}>
          <span style={{ position: "relative", display: "inline-block" }}>
            <MixedText text="من الصفر" size={80} color={RED} />
            <span style={{ position: "absolute", left: -10, top: "52%", height: 12, width: `${strike * 110}%`, backgroundColor: RED }} />
          </span>
        </div>
      ) : null}
      <Timecode t={t} c={RED} layer="LAYER 05" />
    </Paper>
  );
};

/* =====================================================================
   SCÈNE 6 — tous les calques se rangent : signature CREOFAN
   ===================================================================== */
const S6: React.FC<{ t: number }> = ({ t }) => {
  const stack = ease(t, V.yalla - 2, 18);
  const logoK = ease(t, V.yalla + 14, 14);
  const tag = outX(t, V.yalla + 30, 12);
  const words = ["ça", "vaut", "le coup !"];
  return (
    <Paper bg={RED}>
      <CropMarks c={BEIGE} />
      <div style={{ position: "absolute", left: Z.left, width: ZW, top: Z.top + 120, textAlign: "center", fontFamily: FONT, color: WHITE, transform: `translateY(${-stack * 1300}px)` }}>
        <div style={{ fontWeight: 600, fontSize: 56, transform: `translateY(${(1 - el(t, V.franchement)) * -300}px)` }}>Franchement,</div>
        {words.map((wd, i) => (
          <div key={wd} style={{ fontWeight: 800, fontSize: 150, lineHeight: 1, letterSpacing: -6, color: i === 2 ? BEIGE : WHITE, transform: `translateY(${(1 - el(t, V.franchement + 10 + i * 6, 7)) * -900}px)` }}>{wd}</div>
        ))}
      </div>
      {/* les 5 calques du film tombent et s'empilent en un seul */}
      {[RED, BEIGE, RED, BEIGE, WHITE].map((c, i) => {
        const k = el(t, V.yalla - 2 + i * 4, 10);
        return <div key={i} style={{ position: "absolute", left: CX - 300 + (4 - i) * 8 * (1 - logoK), top: CY - 260 - i * 8 * (1 - logoK), width: 600, height: 440, backgroundColor: c, border: `2px solid ${c === BEIGE || c === WHITE ? RED : BEIGE}`, transform: `translateY(${(1 - k) * -1600}px) rotate(${(1 - k) * (i % 2 ? 12 : -12)}deg)`, boxShadow: "0 18px 40px rgba(0,0,0,0.18)" }} />;
      })}
      {t >= V.yalla + 14 ? (
        <div style={{ position: "absolute", left: CX - 250, top: CY - 150, width: 500, clipPath: `inset(0 ${100 - logoK * 100}% 0 0)` }}>
          <Img src={staticFile("ame/logo-creofan-rouge.png")} style={{ width: 500 }} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: Z.left, width: ZW, top: CY + 240, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 30, letterSpacing: 7, color: BEIGE, transform: `translateY(${(1 - tag) * 50}px)`, opacity: tag > 0 ? 1 : 0 }}>
        CREATIVE TOOLS.
        <br />
        NEW POSSIBILITIES.
      </div>
      <Timecode t={t} c={BEIGE} layer="FINAL" />
    </Paper>
  );
};

/* =====================================================================
   TRANSITIONS
   ===================================================================== */
type Pt = [number, number];
const dot = (a: Pt, b: Pt) => a[0] * b[0] + a[1] * b[1];
// Garde la partie du polygone où dot(P − O, u) ≥ s (Sutherland–Hodgman)
function clipHalf(poly: Pt[], o: Pt, u: Pt, s: number): Pt[] {
  const f = (p: Pt) => dot([p[0] - o[0], p[1] - o[1]], u) - s;
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a), fb = f(b);
    if (fa >= 0) out.push(a);
    if (fa * fb < 0) { const k = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]); }
  }
  return out;
}
const poly = (pts: Pt[]) => `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;
// Décollement de papier : le calque du dessus se plie en diagonale et révèle celui du dessous
const Peel: React.FC<{ p: number; corner: "tr" | "bl"; top: React.ReactNode; under: React.ReactNode; flap: string }> = ({ p, corner, top, under, flap }) => {
  const R: Pt[] = [[0, 0], [W, 0], [W, H], [0, H]];
  const o: Pt = corner === "tr" ? [W, 0] : [0, H];
  const u: Pt = corner === "tr" ? [-Math.SQRT1_2, Math.SQRT1_2] : [Math.SQRT1_2, -Math.SQRT1_2];
  const L = (W + H) * Math.SQRT1_2 + 600;
  const s = p * L;
  const remain = clipHalf(R, o, u, s);
  const peeled = clipHalf(R, o, [-u[0], -u[1]], -s); // partie déjà décollée
  const refl = peeled.map(([x, y]): Pt => { const d = dot([x - o[0], y - o[1]], u) - s; return [x - 2 * d * u[0], y - 2 * d * u[1]]; });
  return (
    <AbsoluteFill>
      <AbsoluteFill>{under}</AbsoluteFill>
      {remain.length > 2 ? <AbsoluteFill style={{ clipPath: poly(remain) }}>{top}</AbsoluteFill> : null}
      {refl.length > 2 && p < 1 ? (
        <AbsoluteFill style={{ clipPath: poly(refl), background: `linear-gradient(${corner === "tr" ? 225 : 45}deg, ${flap} 0%, ${flap} 55%, rgba(0,0,0,0.18) 100%)`, filter: "drop-shadow(0 0 30px rgba(0,0,0,0.3))" }} />
      ) : null}
    </AbsoluteFill>
  );
};
// Lamelles : l'image sortante se découpe en bandes qui partent en alternance
const Slices: React.FC<{ p: number; top: React.ReactNode; under: React.ReactNode }> = ({ p, top, under }) => (
  <AbsoluteFill>
    <AbsoluteFill>{under}</AbsoluteFill>
    {Array.from({ length: 8 }).map((_, i) => {
      const k = Easing.in(Easing.cubic)(Math.min(1, Math.max(0, p * 1.6 - i * 0.08)));
      return <AbsoluteFill key={i} style={{ clipPath: `inset(${(i * 100) / 8}% 0 ${100 - ((i + 1) * 100) / 8}% 0)`, transform: `translateX(${(i % 2 ? 1 : -1) * k * W}px)` }}>{top}</AbsoluteFill>;
    })}
  </AbsoluteFill>
);

/* =====================================================================
   MONTAGE
   ===================================================================== */
export type LayersProps = { craftVideo: string; magicVideo: string; designBefore: string; designAfter: string };
export const layersDefaults: LayersProps = { craftVideo: "craft/craft.mp4", magicVideo: "craft/magic.mp4", designBefore: "craft/avant.jpg", designAfter: "craft/apres.jpg" };

const C1 = V.craft - 8, C2 = V.lli - 2, C3 = V.stanna, C4 = V.ya3ni - 4, C5 = V.franchement - 4;

type S = [string, number, number, number];
const SFX: S[] = [
  ["regard/sub.wav", 0, 27, 0.6],
  ...Array.from({ length: BANDS }).map((_, i) => ["cc/click.wav", i * 2, 3, 0.6] as S),
  ...[30, 45, 60, 75, 90, 105].map((f) => ["regard/tick.wav", f, 3, 0.4] as S),
  ["cc/pop.wav", 14, 6, 0.5],
  ["ame/zoom.wav", V.dakhel - 2, 9, 0.7],
  ["ame/boom.wav", V.dakhel + 2, 60, 0.55],
  ["regard/sub.wav", V.ai, 27, 0.5],
  ["regard/swish.wav", C1 - 8, 12, 0.7],
  ["regard/crunch.wav", C1 - 6, 8, 0.35],
  ["regard/snap.wav", V.craft, 3, 0.5],
  ["cc/whoosh.wav", V.craftWord - 2, 15, 0.45],
  ["cc/whoosh.wav", V.nouvelle, 15, 0.3],
  ["ame/zoom.wav", C2 - 8, 9, 0.6],
  ["cc/typing.wav", V.lli + 4, 70, 0.35],
  ["regard/riser.wav", V.design - 30, 30, 0.4],
  ["ame/boom.wav", V.design - 2, 50, 0.4],
  ["regard/glitch.wav", C3, 8, 0.6],
  ["regard/sub.wav", C3, 27, 0.6],
  ["cc/whoosh.wav", V.magic - 8, 15, 0.5],
  ["cc/click.wav", V.magic + 6, 3, 0.7],
  ...[0, 1, 2, 3, 4].map((i) => ["regard/glass.wav", V.magic + 46 + i * 3, 30, 0.28] as S),
  ["cc/whoosh.wav", V.element, 15, 0.45],
  ["regard/swish.wav", C4 - 8, 12, 0.7],
  ["regard/crunch.wav", C4 - 6, 8, 0.35],
  ["cc/whoosh.wav", V.tbaddel, 15, 0.55],
  ...VERBS.map(([, at]) => ["cc/pop.wav", at, 6, 0.5] as S),
  ["regard/swish.wav", V.sfer + 4, 10, 0.5],
  ["ame/zoom.wav", C5 - 6, 9, 0.6],
  ...[0, 1, 2, 3, 4].map((i) => ["regard/crunch.wav", V.yalla - 2 + i * 4 + 6, 8, 0.25] as S),
  ["ame/boom.wav", V.yalla + 14, 60, 0.45],
  ["regard/bell.wav", V.yalla + 30, 50, 0.3],
];

export const LayersFilm: React.FC<LayersProps> = (p) => {
  const t = useCurrentFrame();
  const s1 = () => <S1 t={t} />, s2 = () => <S2 t={t} />, s3 = () => <S3 t={t} p={p} />, s4 = () => <S4 t={t} p={p} />, s5 = () => <S5 t={t} p={p} />, s6 = () => <S6 t={t} />;
  let view: React.ReactNode;
  if (t < C1 - 10) view = s1();
  else if (t < C1 + 2) view = <Peel p={ease(t, C1 - 10, 12)} corner="tr" top={s1()} under={s2()} flap={BEIGE} />;
  else if (t < C2 - 8) view = s2();
  else if (t < C2 + 4) {
    // plongée : la scène 2 fonce vers la caméra, la 3 monte de la profondeur
    const k = ease(t, C2 - 8, 12);
    view = (
      <AbsoluteFill style={{ backgroundColor: RED }}>
        <AbsoluteFill style={{ transform: `scale(${0.6 + 0.4 * k})`, filter: `blur(${(1 - k) * 10}px)` }}>{s3()}</AbsoluteFill>
        <AbsoluteFill style={{ transform: `scale(${1 + k * 4})`, opacity: 1 - k, filter: `blur(${k * 16}px)` }}>{s2()}</AbsoluteFill>
      </AbsoluteFill>
    );
  } else if (t < C3) view = s3();
  else if (t < C4 - 10) view = s4();
  else if (t < C4 + 2) view = <Peel p={ease(t, C4 - 10, 12)} corner="bl" top={s4()} under={s5()} flap={BEIGE} />;
  else if (t < C5 - 10) view = s5();
  else if (t < C5 + 2) view = <Slices p={ease(t, C5 - 10, 12)} top={s5()} under={s6()} />;
  else view = s6();
  return (
    <>
      {view}
      <Audio src={staticFile("craft/voix-off.mp3")} />
      <Audio src={staticFile("cc/music.mp3")} volume={(f) => interpolate(f, [0, 8, LAYERS_DURATION - 30, LAYERS_DURATION], [0, 0.13, 0.13, 0], clamp)} />
      {SFX.map(([file, at, len, vol], i) => (
        <Sequence key={i} from={Math.max(0, at)} durationInFrames={len}>
          <Audio src={staticFile(file)} volume={vol * 0.5} />
        </Sequence>
      ))}
    </>
  );
};
