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
import { OutroIcon } from "../outro/OutroIcon";
import { MixedText } from "../components";
import { BEIGE, FONT, FONT_AR, RED, WHITE } from "../theme";
import { CRAFT_DURATION, V } from "../craft/CanvaCraft";

/* =====================================================================
   « TOUT EST CALQUE » — Creofan × Canva Craft, version 2
   Le film est un fichier de design traversé en 3D : chaque scène est un
   calque de papier (décollement, plongée en profondeur, lamelles).
   Palette : rouge #f7322a, beige #fff5f5, blanc. Salma + Poppins.
   ===================================================================== */
export const LAYERS_DURATION = CRAFT_DURATION + 24;
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
   SCÈNE 1 — la galerie Canva explose autour du logo, accroche courte,
   sortie en « fractions » qui glissent ; puis « داخل بقوّة » et AI
   ===================================================================== */
// Images de la galerie Canva (découpées du visuel officiel) : [largeur, hauteur] d'origine
const TILE_SIZES: [number, number][] = [[125, 117], [46, 46], [66, 92], [112, 111], [66, 72], [125, 58], [141, 78], [95, 70], [152, 86], [53, 51], [187, 105], [114, 80], [92, 65], [113, 89], [45, 88], [99, 142], [105, 64], [140, 99], [120, 67], [128, 79]];
const TILES = TILE_SIZES.map(([w, h], i) => {
  const a = (i / TILE_SIZES.length) * Math.PI * 2 + 0.3;
  const r = i % 2 ? 360 : 560;
  const scale = (i % 3 === 0 ? 2.1 : 1.6) * (Math.max(w, h) < 70 ? 1.6 : 1);
  return { i, w: w * scale, h: h * scale, x: CX + Math.cos(a) * r, y: CY - 60 + Math.sin(a) * r * 1.45, rot: ((i * 37) % 21) - 10, spin: ((i * 53) % 180) - 90, delay: i % 5 };
});
const SWIPE = V.dakhel - 14; // sortie en fractions
// Position finale : AI remonte, le texte se cale 20 px sous la base des lettres
const AI_Y = -110;
const TXT_Y = 140;
const FRACTIONS = 4;
const HookGallery: React.FC<{ t: number }> = ({ t }) => {
  const slam = interpolate(t, [0, 7], [3.4, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const shake = t >= 7 && t < 16 ? Math.sin(t * 3.1) * (16 - t) * 1.6 : 0;
  return (
    <Paper bg={BEIGE}>
      {/* galerie : chaque image jaillit du centre comme une gerbe */}
      {TILES.map((tl) => {
        const k = outX(t, 6 + tl.delay, 18);
        const fl = Math.sin(t / 18 + tl.i) * 10;
        const x = interpolate(k, [0, 1], [CX, tl.x]);
        const y = interpolate(k, [0, 1], [CY - 60, tl.y]) + fl;
        return (
          <div key={tl.i} style={{ position: "absolute", left: x - tl.w / 2, top: y - tl.h / 2, width: tl.w, height: tl.h, borderRadius: 18, overflow: "hidden", boxShadow: "0 14px 34px rgba(0,0,0,0.18)", transform: `scale(${interpolate(k, [0, 1], [0.1, 1])}) rotate(${interpolate(k, [0, 1], [tl.spin, tl.rot])}deg)` }}>
            <Img src={staticFile(`craft/tiles/t${String(tl.i).padStart(2, "0")}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        );
      })}
      {/* onde de choc */}
      {[0, 1].map((r) => {
        const k = outX(t, 7 + r * 3, 22);
        return k > 0 && k < 0.97 ? <div key={r} style={{ position: "absolute", left: CX - 900 * k, top: CY - 60 - 900 * k, width: 1800 * k, height: 1800 * k, borderRadius: 9999, border: `${(1 - k) * 34}px solid ${RED}` }} /> : null;
      })}
      {/* le logo Canva tombe et frappe */}
      <div style={{ position: "absolute", left: CX - 150 + shake, top: CY - 210, width: 300, height: 300, transform: `scale(${slam})`, filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.25))" }}>
        <Img src={staticFile("cc/canva-icon.png")} style={{ width: 300, height: 300 }} />
      </div>
      {/* accroche courte, en deux moitiés qui glissent */}
      {t >= V.jdida - 14 ? (
        <div style={{ position: "absolute", left: Z.left, width: ZW, top: CY + 130, height: 170 }}>
          {[0, 1].map((half) => (
            <div key={half} style={{ position: "absolute", inset: 0, textAlign: "center", clipPath: half ? "inset(50% 0 0 0)" : "inset(0 0 50% 0)", transform: `translateX(${(1 - outX(t, V.jdida - 14 + half * 3, 12)) * (half ? 1 : -1) * 900}px)` }}>
              <span style={{ backgroundColor: RED, padding: "0 30px", display: "inline-block" }}>
                <MixedText text="حاجة جديدة" size={120} color={WHITE} />
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <Timecode t={t} c={RED} layer="LAYER 01" />
    </Paper>
  );
};
const S1: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    {/* dessous : « داخل بقوّة » puis AI, sur rouge */}
    <Paper bg={RED}>
      {/* AI au centre, « داخل بقوّة » reste 20 px en dessous, dans le même plan */}
      {t >= V.ai - 4 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", perspective: 1400, transform: `translateY(${AI_Y}px)` }}>
          <div style={{ position: "relative", transform: `scale(${interpolate(outX(t, V.ai - 4, 14), [0, 1], [0.15, 1])}) rotateY(${(1 - outX(t, V.ai - 4, 20)) * -40 + Math.sin(t / 14) * 6}deg) rotateX(${Math.cos(t / 17) * 5}deg)`, transformStyle: "preserve-3d" }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ position: i ? "absolute" : "relative", left: 0, top: 0, fontFamily: FONT, fontWeight: 800, fontSize: 560, lineHeight: 1, letterSpacing: -30, color: i === 0 ? WHITE : "transparent", WebkitTextStroke: i ? `2px ${i % 2 ? BEIGE : WHITE}` : undefined, transform: `translateZ(${-i * 16}px)`, opacity: i ? 0.5 - i * 0.04 : 1 }}>
                AI
              </div>
            ))}
          </div>
        </AbsoluteFill>
      ) : null}
      {t >= SWIPE ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translateY(${ease(t, V.ai - 6, 14) * TXT_Y}px) scale(${(0.5 + outX(t, V.dakhel - 2, 10) * 0.5) * (1 - ease(t, V.ai - 6, 14) * 0.45)})` }}>
          <MixedText text="داخل بقوّة" size={190} color={BEIGE} />
        </AbsoluteFill>
      ) : null}
      {t >= SWIPE ? <Tag x={Z.left} y={H - Z.bottom - 30} c={BEIGE}>NEW DIMENSION / Z-AXIS</Tag> : null}
      <Timecode t={t} c={BEIGE} layer="LAYER 01" />
    </Paper>
    {/* dessus : la galerie, qui sort en fractions verticales alternées */}
    {t < SWIPE ? (
      <HookGallery t={t} />
    ) : t < SWIPE + 16 ? (
      Array.from({ length: FRACTIONS }).map((_, i) => {
        const k = inX(t, SWIPE + i * 1.5, 10);
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(0 ${100 - ((i + 1) * 100) / FRACTIONS}% 0 ${(i * 100) / FRACTIONS}%)`, transform: `translateY(${(i % 2 ? 1 : -1) * k * H}px)` }}>
            <HookGallery t={t} />
          </AbsoluteFill>
        );
      })
    ) : null}
  </AbsoluteFill>
);

/* =====================================================================
   SCÈNE 2 — CANVA CRAFT : un bloc de calques en 3D isométrique
   ===================================================================== */
const S2: React.FC<{ t: number }> = ({ t }) => {
  const iso = ease(t, V.craft, 16) * (1 - ease(t, V.craftWord + 22, 14));
  const ticker = (t * 9) % 1200;
  return (
    <Paper bg={BEIGE}>
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
const PROMPT = "CANVA CRAFT ✦ ";
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
          {PROMPT.repeat(14)}
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
const OUT = V.yalla - 12; // départ de l'outro icône
const ICONS: { label: string; d: string; fill?: boolean }[] = [
  // Suivre : silhouette + « + »
  { label: "Suivre", d: "M15 19c0-3.3-2.7-6-6-6s-6 2.7-6 6M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M19 8v6M16 11h6" },
  // J'aime : cœur
  { label: "J'aime", d: "M12 20.5S3 15 3 8.8A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 9 2.4C21 15 12 20.5 12 20.5z", fill: true },
  // Sauvegarder : signet
  { label: "Sauvegarder", d: "M6 3.5h12v17l-6-4.5-6 4.5z", fill: true },
];
const S6: React.FC<{ t: number }> = ({ t }) => {
  const away = ease(t, OUT - 8, 16);
  const words = ["ça", "vaut", "le coup !"];
  return (
    <Paper bg={RED}>
      <div style={{ position: "absolute", left: Z.left, width: ZW, top: Z.top + 260, textAlign: "center", fontFamily: FONT, color: WHITE, transform: `translateY(${-away * 1500}px)` }}>
        <div style={{ fontWeight: 600, fontSize: 56, transform: `translateY(${(1 - el(t, V.franchement)) * -300}px)` }}>Franchement,</div>
        {words.map((wd, i) => (
          <div key={wd} style={{ fontWeight: 800, fontSize: 150, lineHeight: 1, letterSpacing: -6, color: i === 2 ? BEIGE : WHITE, transform: `translateY(${(1 - el(t, V.franchement + 10 + i * 6, 7)) * -900}px)` }}>{wd}</div>
        ))}
      </div>
      {/* outro Creofan : l'icône se trace au stylo, en blanc sur rouge */}
      {t >= OUT ? <OutroIcon f={t - OUT} fg={WHITE} bg="transparent" size={460} cy={CY - 130} /> : null}
      {/* Suivre / J'aime / Sauvegarder */}
      <div style={{ position: "absolute", left: Z.left, width: ZW, top: CY + 190, display: "flex", justifyContent: "center", gap: 70 }}>
        {ICONS.map((ic, i) => {
          const at = OUT + 58 + i * 6;
          const k = el(t, at, 9);
          const tap = interpolate(t, [at + 26 + i * 8, at + 30 + i * 8, at + 38 + i * 8], [1, 0.82, 1], clamp);
          const on = t >= at + 30 + i * 8;
          return (
            <div key={ic.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: t >= at ? 1 : 0, transform: `translateY(${(1 - k) * 120}px) scale(${k * tap})` }}>
              <div style={{ width: 150, height: 150, borderRadius: 999, border: `5px solid ${WHITE}`, backgroundColor: on ? WHITE : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={78} height={78} viewBox="0 0 24 24" fill={on && ic.fill ? RED : "none"} stroke={on ? RED : WHITE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d={ic.d} />
                </svg>
              </div>
              <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 34, color: WHITE }}>{ic.label}</div>
            </div>
          );
        })}
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
  ["ame/boom.wav", 6, 60, 0.42],
  ["regard/sub.wav", 6, 27, 0.35],
  ["ame/zoom.wav", 0, 7, 0.6],
  ...[8, 10, 12, 14, 16].map((f) => ["cc/pop.wav", f, 6, 0.35] as S),
  ["ame/shimmer.wav", 10, 60, 0.35],
  ["cc/whoosh.wav", V.jdida - 14, 15, 0.45],
  ...[0, 1, 2, 3].map((i) => ["regard/swish.wav", SWIPE + i * 2, 10, 0.4] as S),
  ["ame/zoom.wav", V.dakhel - 2, 9, 0.7],
  ["ame/boom.wav", V.dakhel + 2, 60, 0.55],
  ["regard/sub.wav", V.ai, 27, 0.5],
  ["regard/swish.wav", C1 - 8, 24, 0.6],
  ["regard/crunch.wav", C1 + 4, 8, 0.3],
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
  ["cc/whoosh.wav", OUT - 8, 15, 0.5],
  ["ame/shimmer.wav", OUT, 60, 0.35],
  ["ame/boom.wav", OUT + 62, 60, 0.4],
  ...[0, 1, 2].map((i) => ["cc/pop.wav", OUT + 58 + i * 6, 6, 0.45] as S),
  ...[0, 1, 2].map((i) => ["cc/click.wav", OUT + 88 + i * 14, 3, 0.6] as S),
];

export const LayersFilm: React.FC<LayersProps> = (p) => {
  const t = useCurrentFrame();
  const s1 = () => <S1 t={t} />, s2 = () => <S2 t={t} />, s3 = () => <S3 t={t} p={p} />, s4 = () => <S4 t={t} p={p} />, s5 = () => <S5 t={t} p={p} />, s6 = () => <S6 t={t} />;
  let view: React.ReactNode;
  if (t < C1 - 12) view = s1();
  else if (t < C1 + 20) view = <Peel p={ease(t, C1 - 12, 32, Easing.inOut(Easing.cubic))} corner="tr" top={s1()} under={s2()} flap={BEIGE} />;
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
