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
import { BEIGE, FONT, INK, RED, SAFE, WHITE } from "../theme";

// Pub parfum : montage dynamique des deux rushs, puis la vidéo se réduit
// en carte sur le rouge Creofan et le texte vend le service. 23 s, 120 BPM
// (1 temps = 15 frames) : toutes les coupes tombent sur un temps.
export const PARFUM_DURATION = 690;
const GREEN = "#25D366";
const PHONE = "+216 51 097 272";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ZONE_W = 1080 - SAFE.left - SAFE.right;
const CX = SAFE.left + ZONE_W / 2;

const snap = (t: number, at: number, dur = 10) =>
  interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing: Easing.bezier(0.7, 0, 0.2, 1) });
const pop = (t: number, at: number, damping = 11) =>
  spring({ frame: t - at, fps: 30, config: { damping, stiffness: 160 } });

// ---------- Rushs : [fichier, seconde de départ, cadrage vertical (%)] ----------
type Shot = { src: string; at: number; y?: number };
const V1 = "parfum/v1.mp4";
const V2 = "parfum/v2.mp4";
const SHOT = {
  sparkle: { src: V2, at: 0.3 }, // flacon + tourbillon de paillettes
  hands1: { src: V1, at: 0.1, y: 40 }, // flacon tenu à deux mains
  hands2: { src: V2, at: 2.1, y: 40 },
  spray1: { src: V1, at: 3.0, y: 45 }, // macro du spray
  spray2: { src: V2, at: 4.0, y: 30 },
  silk: { src: V1, at: 4.55, y: 45 }, // bouchon cristal + soie
  marble: { src: V1, at: 1.55, y: 55 }, // flacon sur le marbre, moucharabieh
  tile: { src: V2, at: 8.0, y: 62 },
  hero1: { src: V1, at: 8.8, y: 62 },
  face1: { src: V1, at: 6.05, y: 40 }, // visage, mains au cou
  face2: { src: V2, at: 5.55, y: 40 }, // profil yeux fermés
  place: { src: V1, at: 7.75, y: 55 }, // la main pose le flacon
  hero2: { src: V2, at: 7.8, y: 62 }, // flacon + paillettes, plan final
} satisfies Record<string, Shot>;

// Rush calé pour démarrer au début de la séquence qui le contient
const Clip: React.FC<{ shot: Shot; from: number; dur: number; zoom?: number }> = ({ shot, from, dur, zoom = 1 }) => (
  <Sequence from={from} durationInFrames={dur} layout="none">
    <OffthreadVideo
      src={staticFile(shot.src)}
      muted
      trimBefore={Math.round(shot.at * 30)}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: `50% ${shot.y ?? 50}%`,
        transform: `scale(${zoom})`,
      }}
    />
  </Sequence>
);

// Panneau rectangulaire (split screen) qui glisse depuis un côté
const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  dx?: number;
  dy?: number;
  enter: number;
  children: React.ReactNode;
}> = ({ x, y, w, h, dx = 0, dy = 0, enter, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      overflow: "hidden",
      transform: `translate(${dx * (1 - enter)}px, ${dy * (1 - enter)}px)`,
    }}
  >
    {children}
  </div>
);

// Transition signature : trois bandes rouge / beige / encre qui balaient l'écran
// et masquent la coupe. `at` = frame de la coupe.
const ColorWipe: React.FC<{ t: number; at: number; vertical?: boolean }> = ({ t, at, vertical = false }) => {
  if (t < at - 8 || t > at + 8) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {[RED, BEIGE, INK].map((c, i) => {
        const p = interpolate(t, [at - 8 + i * 2, at + 4 + i * 2], [-110, 110], {
          ...clamp,
          easing: Easing.bezier(0.7, 0, 0.2, 1),
        });
        return (
          <AbsoluteFill
            key={c}
            style={{
              backgroundColor: c,
              transform: vertical ? `translateY(${p}%)` : `translateX(${-p}%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Flash blanc (coup de projecteur sur un temps fort)
const Flash: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const o = interpolate(t, [at, at + 1, at + 6], [0, 0.85, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{ backgroundColor: WHITE, opacity: o }} /> : null;
};

// ================= PARTIE 1 : le film parfum (0 → 300) =================
const Promo: React.FC<{ t: number }> = ({ t }) => {
  const GAP = 10;
  const half = (1080 - GAP) / 2;
  const halfH = (1920 - GAP) / 2;
  const third = (1080 - GAP * 2) / 3;
  const hero = interpolate(t, [240, 300], [1, 1.08], clamp);
  const silkPunch = interpolate(t, [90, 96], [1.18, 1], { ...clamp, easing: Easing.bezier(0.7, 0, 0.2, 1) });
  const intro = interpolate(t, [0, 8], [1.2, 1], { ...clamp, easing: Easing.bezier(0.7, 0, 0.2, 1) });
  return (
    <AbsoluteFill style={{ backgroundColor: RED, overflow: "hidden" }}>
      {/* 0 → 30 : accroche, paillettes */}
      {t < 30 ? <Clip shot={SHOT.sparkle} from={0} dur={30} zoom={intro} /> : null}

      {/* 30 → 60 : split vertical, deux mains en miroir (haut / bas) */}
      {t >= 30 && t < 60 ? (
        <>
          <Panel x={0} y={0} w={half} h={1920} dy={-1920} enter={snap(t, 30, 10)}>
            <Clip shot={SHOT.hands1} from={30} dur={30} />
          </Panel>
          <Panel x={half + GAP} y={0} w={half} h={1920} dy={1920} enter={snap(t, 32, 10)}>
            <Clip shot={SHOT.hands2} from={30} dur={30} />
          </Panel>
        </>
      ) : null}

      {/* 60 → 90 : split horizontal, deux sprays qui se croisent */}
      {t >= 60 && t < 90 ? (
        <AbsoluteFill style={{ backgroundColor: INK }}>
          <Panel x={0} y={0} w={1080} h={halfH} dx={-1080} enter={snap(t, 56, 8)}>
            <Clip shot={SHOT.spray1} from={60} dur={30} />
          </Panel>
          <Panel x={0} y={halfH + GAP} w={1080} h={halfH} dx={1080} enter={snap(t, 62, 8)}>
            <Clip shot={SHOT.spray2} from={60} dur={30} />
          </Panel>
        </AbsoluteFill>
      ) : null}

      {/* 90 → 120 : bouchon cristal et soie, plein cadre */}
      {t >= 90 && t < 120 ? <Clip shot={SHOT.silk} from={90} dur={30} zoom={silkPunch} /> : null}

      {/* 120 → 165 : trois bandes verticales, trois flacons */}
      {t >= 120 && t < 165 ? (
        <AbsoluteFill style={{ backgroundColor: BEIGE }}>
          {[SHOT.marble, SHOT.tile, SHOT.hero1].map((s, i) => (
            <Panel
              key={i}
              x={i * (third + GAP)}
              y={0}
              w={third}
              h={1920}
              dy={i % 2 ? 1920 : -1920}
              enter={snap(t, 116 + i * 4, 8)}
            >
              <Clip shot={s} from={120} dur={45} />
            </Panel>
          ))}
        </AbsoluteFill>
      ) : null}

      {/* 165 → 210 : les deux visages face à face */}
      {t >= 165 && t < 210 ? (
        <>
          <Panel x={0} y={0} w={half} h={1920} dx={-half} enter={snap(t, 165, 10)}>
            <Clip shot={SHOT.face1} from={165} dur={45} />
          </Panel>
          <Panel x={half + GAP} y={0} w={half} h={1920} dx={half} enter={snap(t, 168, 10)}>
            <Clip shot={SHOT.face2} from={165} dur={45} />
          </Panel>
        </>
      ) : null}

      {/* 210 → 240 : la main pose le flacon */}
      {t >= 210 && t < 240 ? <Clip shot={SHOT.place} from={210} dur={30} /> : null}

      {/* 240 → 300 : plan héros, paillettes */}
      {t >= 240 ? <Clip shot={SHOT.hero2} from={240} dur={66} zoom={hero} /> : null}

      <Flash t={t} at={0} />
      <ColorWipe t={t} at={30} vertical />
      <ColorWipe t={t} at={90} />
      <ColorWipe t={t} at={165} vertical />
      <Flash t={t} at={240} />
    </AbsoluteFill>
  );
};

// ================= PARTIE 2-3 : la carte sur le rouge + le texte (282 → 690) =================

// Mini-montage qui tourne dans la carte (une coupe par mesure)
const CARD_SHOTS: Shot[] = [SHOT.sparkle, SHOT.silk, SHOT.face2, SHOT.spray1, SHOT.tile, SHOT.hands1, SHOT.face1, SHOT.marble, SHOT.hero2, SHOT.place, SHOT.sparkle, SHOT.hero1];
const CardReel: React.FC<{ t: number }> = ({ t }) => {
  if (t < 306) return <Clip shot={SHOT.hero2} from={240} dur={66} zoom={interpolate(t, [240, 300], [1, 1.08], clamp)} />;
  const i = Math.floor((t - 306) / 30);
  const from = 306 + i * 30;
  return <Clip key={i} shot={CARD_SHOTS[i % CARD_SHOTS.length]} from={from} dur={30} />;
};

// Fonds successifs : rouge → encre → beige → rouge → beige (inversions de contraste)
const Backdrop: React.FC<{ t: number }> = ({ t }) => {
  // Encre qui se referme en deux volets verticaux (375)
  const ink = snap(t, 372, 10);
  const inkOut = snap(t, 447, 10);
  // Beige qui monte du bas (450)
  const beige = snap(t, 447, 10);
  const beigeOut = snap(t, 537, 10);
  // Beige final (600)
  const fin = snap(t, 597, 10);
  return (
    <AbsoluteFill style={{ backgroundColor: RED }}>
      {t >= 372 && t < 460 ? (
        <>
          <div style={{ position: "absolute", left: 0, top: 0, width: 540, height: 1920, backgroundColor: INK, transform: `translateX(${(-1 + ink) * 540 - inkOut * 540}px)` }} />
          <div style={{ position: "absolute", left: 540, top: 0, width: 540, height: 1920, backgroundColor: INK, transform: `translateX(${(1 - ink) * 540 + inkOut * 540}px)` }} />
        </>
      ) : null}
      {t >= 447 && t < 550 ? (
        <AbsoluteFill style={{ backgroundColor: BEIGE, transform: `translateY(${(1 - beige) * 100 - beigeOut * 100}%)` }} />
      ) : null}
      {t >= 597 ? <AbsoluteFill style={{ backgroundColor: BEIGE, transform: `translateY(${(1 - fin) * -100}%)` }} /> : null}
    </AbsoluteFill>
  );
};

// Position de la carte vidéo au fil des plans : [frame, centreX, centreY, échelle, rotation, rayon]
const CARD_KEYS: [number, number, number, number, number][] = [
  [282, 540, 960, 1, 0],
  [300, CX, 690, 0.42, -3],
  [372, CX, 690, 0.42, -3],
  [384, CX, 560, 0.3, 3],
  [447, CX, 560, 0.3, 3],
  [459, CX, 520, 0.27, -2],
  [537, CX, 520, 0.27, -2],
];
const lerpKeys = (t: number, k: number) =>
  interpolate(
    t,
    CARD_KEYS.map((c) => c[0]),
    CARD_KEYS.map((c) => c[k]),
    { ...clamp, easing: Easing.bezier(0.7, 0, 0.2, 1) },
  );

const Card: React.FC<{ t: number }> = ({ t }) => {
  // 540 → 600 : la carte devient la moitié haute d'un split horizontal
  if (t >= 540) {
    const open = snap(t, 540, 12);
    const close = snap(t, 594, 8);
    const h = interpolate(open, [0, 1], [520, 950]) * (1 - close);
    return (
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: h, overflow: "hidden", borderBottom: `12px solid ${BEIGE}` }}>
        <div style={{ position: "absolute", left: 0, top: (h - 1920) / 2, width: 1080, height: 1920 }}>
          <CardReel t={t} />
        </div>
      </div>
    );
  }
  const x = lerpKeys(t, 1);
  const y = lerpKeys(t, 2);
  const s = lerpKeys(t, 3);
  const r = lerpKeys(t, 4);
  const shrink = interpolate(t, [282, 300], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 540,
        top: y - 960,
        width: 1080,
        height: 1920,
        transform: `scale(${s}) rotate(${r}deg)`,
        borderRadius: 90 * shrink,
        overflow: "hidden",
        outline: `${28 * shrink}px solid ${t >= 447 ? RED : BEIGE}`,
        boxShadow: `0 ${60 * shrink}px ${140 * shrink}px rgba(42,15,14,${0.45 * shrink})`,
      }}
    >
      <CardReel t={t} />
    </div>
  );
};

// Phrase arabe qui apparaît mot par mot (droite → gauche), un mot par demi-temps
const Words: React.FC<{
  t: number;
  at: number;
  words: string[];
  size: number;
  color: string;
  accent?: Record<string, React.CSSProperties>;
}> = ({ t, at, words, size, color, accent = {} }) => (
  <div dir="rtl" style={{ textAlign: "center", lineHeight: 1.45 }}>
    {words.map((w, i) => {
      const s = pop(t, at + i * 5, 12);
      return (
        <span key={i} style={{ display: "inline-block", margin: "0 10px", opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 40}px) scale(${0.7 + 0.3 * s})` }}>
          <MixedText text={w} size={size} color={color} style={accent[w]} />
        </span>
      );
    })}
  </div>
);

const Block: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ top, children, style }) => (
  <div style={{ position: "absolute", top, left: SAFE.left, width: ZONE_W, display: "flex", justifyContent: "center", ...style }}>{children}</div>
);

// Sortie commune : le bloc s'efface vers le haut
const exit = (t: number, at: number) => {
  const e = snap(t, at, 8);
  return { opacity: 1 - e, transform: `translateY(${-60 * e}px)` };
};

const PILL_RED: React.CSSProperties = { backgroundColor: RED, color: WHITE, borderRadius: 24, padding: "0 26px" };

const Texts: React.FC<{ t: number }> = ({ t }) => (
  <>
    {/* 300 → 375 : le doute */}
    {t >= 300 && t < 382 ? (
      <Block top={1150} style={exit(t, 372)}>
        <Words t={t} at={302} words={["فيبالك", "هذا", "تصوير", "ستوديو ؟"]} size={92} color={WHITE} accent={{ "ستوديو ؟": { color: INK } }} />
      </Block>
    ) : null}

    {/* 375 → 450 : la révélation, sur fond encre */}
    {t >= 380 && t < 457 ? (
      <Block top={950} style={exit(t, 447)}>
        <div>
          <Words t={t} at={382} words={["لا...", "مخدوم", "كامل"]} size={96} color={BEIGE} />
          <div style={{ height: 24 }} />
          <div style={{ transform: `scale(${pop(t, 402, 10)})` }}>
            <MixedText text="بالذكاء الاصطناعي" size={100} style={{ ...PILL_RED, display: "inline-block", textAlign: "center" }} />
          </div>
        </div>
      </Block>
    ) : null}

    {/* 450 → 540 : l'offre, sur fond beige, trois chips contrastées */}
    {t >= 455 && t < 547 ? (
      <Block top={880} style={exit(t, 537)}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          {(
            [
              ["بلا ستوديو", RED, WHITE, 462],
              ["بلا مصوّر", INK, BEIGE, 477],
              ["بلا مصاريف كبيرة", RED, WHITE, 492],
            ] as [string, string, string, number][]
          ).map(([txt, bg, fg, at], i) => {
            const s = pop(t, at, 10);
            return (
              <div key={i} style={{ transform: `scale(${s}) rotate(${(i % 2 ? 2 : -2) * s}deg)`, backgroundColor: bg, borderRadius: 34, padding: "10px 46px" }}>
                <MixedText text={txt} size={78} color={fg} />
              </div>
            );
          })}
          <div style={{ marginTop: 10, transform: `scale(${pop(t, 510, 12)})` }}>
            <MixedText text="وفيديو جاهز في وقت قياسي." size={64} color={INK} />
          </div>
        </div>
      </Block>
    ) : null}

    {/* 540 → 600 : split horizontal, texte dans la moitié basse rouge */}
    {t >= 548 && t < 604 ? (
      <Block top={1070} style={exit(t, 594)}>
        <Words t={t} at={550} words={["ماركتك", "تستاهل", "فيديو", "هكّا."]} size={104} color={WHITE} accent={{ "هكّا.": { color: INK } }} />
      </Block>
    ) : null}
  </>
);

// Logo WhatsApp (tracé officiel simplifié, 24 × 24)
const WA_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";

const Cta: React.FC<{ t: number }> = ({ t }) => {
  if (t < 600) return null;
  const q = pop(t, 604, 12);
  const icon = pop(t, 618, 9);
  const open = snap(t, 630, 12);
  const pulse = t > 645 ? 1 + 0.045 * Math.max(0, Math.sin(((t - 645) / 15) * Math.PI)) : 1;
  const badge = pop(t, 645, 8);
  const num = pop(t, 650, 12);
  const band = snap(t, 655, 12);
  const logo = snap(t, 662, 12);
  const tap = t >= 672 && t < 684 ? (t - 672) / 12 : -1;
  return (
    <AbsoluteFill>
      {/* Bande rouge basse qui porte le logo (split horizontal beige / rouge) */}
      <div style={{ position: "absolute", left: 0, top: 1150, width: 1080, height: 770, backgroundColor: RED, transform: `translateY(${(1 - band) * 770}px)` }} />
      <Block top={360} style={{ transform: `scale(${q})`, opacity: Math.min(1, q * 1.5) }}>
        <MixedText text="تحب فيديو هكّا لماركتك ؟" size={86} color={INK} style={{ textAlign: "center" }} />
      </Block>
      <Block top={1240}>
        <Img src={staticFile("logo-creofan-complet.png")} style={{ width: 360, opacity: logo, transform: `translateY(${(1 - logo) * 40}px)` }} />
      </Block>
      {/* Bouton WhatsApp : l'icône pop, puis la pilule se déplie */}
      <div style={{ position: "absolute", top: 640, left: SAFE.left, width: ZONE_W, display: "flex", justifyContent: "center" }}>
        <div
          dir="rtl"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 26,
            height: 180,
            padding: `0 ${20 + 40 * open}px`,
            borderRadius: 90,
            backgroundColor: GREEN,
            transform: `scale(${icon * pulse})`,
            boxShadow: "0 30px 60px rgba(37,211,102,0.35)",
            overflow: "hidden",
          }}
        >
          <svg width={140} height={140} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path d={WA_PATH} fill={WHITE} />
          </svg>
          <div style={{ maxWidth: 560 * open, overflow: "hidden", whiteSpace: "nowrap" }}>
            <MixedText text="كلّمني على الواتساب" size={66} color={WHITE} />
          </div>
          {tap >= 0 ? (
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 600 * tap, height: 600 * tap, marginLeft: -300 * tap, marginTop: -300 * tap, borderRadius: "50%", backgroundColor: WHITE, opacity: 0.35 * (1 - tap) }} />
          ) : null}
        </div>
        {/* Pastille de notification */}
        <div style={{ position: "absolute", top: -14, right: open > 0.5 ? 40 : 300, width: 64, height: 64, borderRadius: 32, backgroundColor: RED, border: `5px solid ${BEIGE}`, transform: `scale(${badge})`, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontFamily: FONT, fontWeight: 800, fontSize: 34 }}>
          1
        </div>
      </div>
      <Block top={890} style={{ transform: `scale(${num})`, opacity: Math.min(1, num * 1.5) }}>
        <div dir="ltr" style={{ fontFamily: FONT, fontWeight: 800, fontSize: 92, color: INK, letterSpacing: 2, whiteSpace: "nowrap" }}>
          {PHONE}
        </div>
      </Block>
      <Block top={1030} style={{ opacity: num }}>
        <div style={{ height: 12, width: 520 * snap(t, 655, 14), backgroundColor: RED, borderRadius: 6 }} />
      </Block>
    </AbsoluteFill>
  );
};

// ---------- Son ----------
const SFX_GAIN = 0.65;
// [fichier, frame, durée max en frames, volume]
const SFX: [string, number, number, number][] = [
  ["regard/sub.wav", 0, 27, 0.8],
  ["regard/shutter.wav", 0, 5, 0.9],
  ["regard/swish.wav", 24, 11, 0.8],
  ["regard/snap.wav", 30, 3, 0.5],
  ["cc/whoosh.wav", 58, 15, 0.6],
  ["regard/snap.wav", 66, 3, 0.5],
  ["regard/swish.wav", 84, 11, 0.8],
  ["regard/glass.wav", 90, 50, 0.6],
  ["regard/tick.wav", 120, 2, 0.9],
  ["regard/tick.wav", 125, 2, 0.9],
  ["regard/tick.wav", 130, 2, 0.9],
  ["regard/swish.wav", 159, 11, 0.8],
  ["regard/snap.wav", 210, 3, 0.5],
  ["regard/riser.wav", 210, 30, 0.6],
  ["regard/shutter.wav", 240, 5, 0.9],
  ["regard/chord.wav", 240, 45, 0.7],
  ["cc/whoosh.wav", 280, 15, 0.8],
  ["regard/sub.wav", 298, 27, 0.8],
  ...[0, 1, 2, 3, 4].map((i) => ["cc/pop.wav", 302 + i * 5, 5, 0.6] as [string, number, number, number]),
  ["regard/glitch.wav", 372, 5, 0.6],
  ["regard/sub.wav", 375, 20, 0.6],
  ["cc/pop.wav", 402, 5, 0.9],
  ["regard/swish.wav", 447, 11, 0.8],
  ["cc/pop.wav", 462, 5, 0.8],
  ["cc/pop.wav", 477, 5, 0.8],
  ["cc/pop.wav", 492, 5, 0.8],
  ["regard/bell.wav", 510, 30, 0.5],
  ["cc/whoosh.wav", 538, 15, 0.6],
  ["regard/snap.wav", 552, 3, 0.5],
  ["cc/whoosh.wav", 596, 15, 0.7],
  ["cc/pop.wav", 618, 5, 0.9],
  ["cc/ding.wav", 645, 24, 0.9],
  ["cc/click.wav", 672, 2, 1],
  ["regard/revriser.wav", 675, 15, 0.6],
];

export const Parfum: React.FC = () => {
  const t = useCurrentFrame();
  // Musique : légère baisse pendant la réduction en carte (respiration), coupe finale nette
  const musicVol = (f: number) =>
    interpolate(f, [0, 4, 280, 292, 306, 684, 689], [0, 0.34, 0.34, 0.18, 0.32, 0.32, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: RED, fontFamily: FONT, overflow: "hidden" }}>
      {t < 282 ? <Promo t={t} /> : null}
      {t >= 282 ? (
        <>
          <Backdrop t={t} />
          {t < 604 ? <Card t={t} /> : null}
          <Texts t={t} />
          <Cta t={t} />
        </>
      ) : null}
      <Audio src={staticFile("cc/music.mp3")} volume={musicVol} />
      {SFX.map(([file, at, len, vol], i) => (
        <Sequence key={i} from={at} durationInFrames={len}>
          <Audio src={staticFile(file)} volume={vol * SFX_GAIN} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
