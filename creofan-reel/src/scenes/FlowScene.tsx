import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CUE } from "../cues";
import { Arrow, FlowLogo, MixedText, PunchIn } from "../components";
import { BEIGE, RED, SAFE } from "../theme";

// Couleurs de l'interface Google Flow (thème sombre)
const UI = {
  bg: "#000000",
  bar: "#1e1f20",
  chip: "#2b2c2e",
  text: "#e3e3e3",
  muted: "#8e918f",
  soft: "#c4c7c5",
  accent: "#ff5a52", // rouge Creofan éclairci pour le fond noir
};

const BAD_PROMPT = "a3mel li pub café";
const SEGMENTS = [
  {
    text: "A steaming cup of coffee on a rustic wooden table, roasted coffee beans scattered around, ",
    from: CUE.sujet + 6,
    to: CUE.sujetEnd,
  },
  {
    text: "cinematic lighting, hyper-realistic, warm moody tones, ",
    from: CUE.pick + 4,
    to: CUE.pick + 66,
  },
  {
    text: "close-up shot, shallow depth of field.",
    from: CUE.prise + 6,
    to: CUE.prise + 60,
  },
];

// La fenêtre (960 px) est réduite pour tenir dans la zone de sécurité
const WIN_SCALE = (1080 - SAFE.left - SAFE.right) / 960;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const typed = (text: string, t: number, from: number, to: number) =>
  text.slice(0, Math.floor(interpolate(t, [from, to], [0, text.length], clamp)));

type TitleCue = { at: number; title: string; sub?: string; subAt?: number };

const TITLES: TitleCue[] = [
  { at: CUE.flowIn, title: "كيفاش تحكي مع Flow ؟", sub: "باش يفهمك", subAt: CUE.flowWord },
  { at: CUE.secret, title: "السر ؟" },
  { at: CUE.promptWord, title: "السر في الـ prompt" },
  { at: CUE.dont, title: "ما تقلوش just…" },
  { at: CUE.badStrike, title: "Trop vague", sub: "= un résultat générique" },
  { at: CUE.sujet, title: "1. Sujet", sub: "une description détaillée de la scène", subAt: CUE.detail },
  { at: CUE.style, title: "2. Style" },
  { at: CUE.prise, title: "3. Prise de vue", sub: "+ le mouvement de caméra pour une vidéo", subAt: CUE.mouvement },
  { at: CUE.photoshop, title: "بلا Photoshop", sub: "بلا حتى outils أخرى", subAt: CUE.outils },
  { at: CUE.reveal, title: "أعز rendu", sub: "qualité studio", subAt: CUE.rendu },
];

const STYLES = [
  { label: "Cinématique", at: CUE.cine, picked: true },
  { label: "Hyperréaliste", at: CUE.hyper, picked: true },
  { label: "Cartoon", at: CUE.cartoon, picked: false },
];

export const FlowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame + CUE.flowIn; // temps absolu de la vidéo, en frames
  const sp = (at: number, damping = 12) =>
    spring({ frame: t - at, fps, config: { damping } });

  // --- Titre au-dessus de la fenêtre
  const current = [...TITLES].reverse().find((c) => t >= c.at) ?? TITLES[0];
  const titleIn = sp(current.at);
  const subIn = current.sub ? sp(current.subAt ?? current.at + 6, 14) : 0;
  const isStyle = current.at === CUE.style;

  // --- Fenêtre Flow
  const windowIn = sp(CUE.flowIn, 15);
  const logoPop = sp(CUE.flowWord, 8);
  const typing = t >= CUE.sujet && t < CUE.send;
  const zoom = interpolate(
    t,
    [CUE.sujet, CUE.sujet + 20, CUE.send, CUE.send + 20],
    [1, 1.02, 1.02, 1],
    clamp,
  );

  // --- Mauvais prompt
  const badText = t < CUE.sujet ? typed(BAD_PROMPT, t, CUE.badType, CUE.badType + 34) : "";
  const strike = interpolate(t, [CUE.badStrike, CUE.badStrike + 10], [0, 100], clamp);
  const shake =
    t > CUE.badStrike + 8 && t < CUE.badStrike + 30 ? Math.sin(t * 2.4) * 10 : 0;

  // --- Bon prompt, segment par segment
  const segTexts = SEGMENTS.map((s) => typed(s.text, t, s.from, s.to));
  const activeSeg = SEGMENTS.findIndex((s) => t >= s.from && t < s.to + 15);
  const hasText = t < CUE.sujet ? badText.length > 0 : segTexts[0].length > 0;
  const cursorOn = Math.floor(t / 15) % 2 === 0 && t < CUE.send;

  // --- Génération puis révélation de l'image
  const sendPulse = sp(CUE.send, 7);
  const generating = t >= CUE.send;
  const progress = Math.floor(interpolate(t, [CUE.send, CUE.reveal], [0, 100], clamp));
  const reveal = interpolate(t, [CUE.reveal, CUE.rendu], [0, 1], clamp);
  const renduPop = sp(CUE.rendu, 9);
  const shimmerX = ((t - CUE.send) * 18) % 1400 - 400;

  return (
    <PunchIn bg={RED}>

      {/* Titre synchronisé sur la voix */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top,
          left: SAFE.left,
          right: SAFE.right,
          height: 250,
          textAlign: "center",
          color: BEIGE,
        }}
      >
        {current.at === CUE.flowIn ? (
          <Img
            src={staticFile("flow-logo.png")}
            style={{
              width: 120,
              height: 120,
              borderRadius: 30,
              marginBottom: 12,
              transform: `scale(${titleIn * (1 + 0.15 * Math.sin(Math.min(1, logoPop) * Math.PI))})`,
            }}
          />
        ) : null}
        <div
          key={current.at}
          style={{
            transform: `scale(${interpolate(titleIn, [0, 1], [0.6, 1])})`,
            opacity: titleIn,
          }}
        >
          <MixedText
            text={current.title}
            size={current.at === CUE.promptWord ? 92 : current.at === CUE.flowIn ? 68 : 78}
          />
        </div>
        {current.sub ? (
          <div
            style={{
              marginTop: 14,
              opacity: subIn,
              transform: `translateY(${(1 - subIn) * 20}px)`,
            }}
          >
            <MixedText text={current.sub} size={38} latinWeight={600} />
          </div>
        ) : null}
        {isStyle ? (
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 22 }}>
            {STYLES.map((s) => {
              const pop = sp(s.at, 10);
              const decided = t >= CUE.pick;
              const on = decided && s.picked;
              return (
                <div
                  key={s.label}
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    padding: "12px 28px",
                    borderRadius: 999,
                    border: `4px solid ${BEIGE}`,
                    color: on ? RED : BEIGE,
                    backgroundColor: on ? BEIGE : "transparent",
                    opacity: pop * (decided && !s.picked ? 0.45 : 1),
                    transform: `scale(${pop})`,
                  }}
                >
                  {s.label}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Fenêtre Google Flow */}
      {/* Fenêtre réduite pour tenir dans la zone de sécurité */}
      <div
        style={{
          position: "absolute",
          top: 490,
          left: SAFE.left,
          transform: `scale(${WIN_SCALE})`,
          transformOrigin: "0 0",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 960,
            height: 1090,
            borderRadius: 44,
            backgroundColor: UI.bg,
            border: "2px solid #2a2a2a",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
            transform: `translateY(${(1 - windowIn) * 700}px) scale(${zoom})`,
            transformOrigin: "50% 100%",
          }}
        >
          {/* Zone de contenu : accueil puis génération */}
          <div
            style={{
              flex: 1,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!generating ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 44,
                }}
              >
                <div style={{ transform: `scale(${0.6 + 0.4 * logoPop})` }}>
                  <FlowLogo cell={8} />
                </div>
                <div
                  style={{
                    fontSize: 36,
                    color: UI.soft,
                    textAlign: "center",
                    maxWidth: 760,
                    lineHeight: 1.3,
                  }}
                >
                  Commencez à créer ou déposez un contenu multimédia
                </div>
              </div>
            ) : (
              <div
                style={{
                  width: 540,
                  height: 540,
                  borderRadius: 24,
                  overflow: "hidden",
                  position: "relative",
                  backgroundColor: UI.bar,
                  transform: `scale(${1 + 0.06 * Math.sin(renduPop * Math.PI)})`,
                }}
              >
                {reveal < 1 ? (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: shimmerX,
                        width: 300,
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: UI.soft,
                        fontSize: 34,
                        opacity: 1 - reveal,
                      }}
                    >
                      Génération… {progress}%
                    </div>
                  </>
                ) : null}
                <Img
                  src={staticFile("resultat-flow.jpg")}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: reveal,
                    filter: `blur(${(1 - reveal) * 24}px)`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Champ de discussion Flow */}
          <div
            style={{
              margin: "0 30px 30px",
              padding: "30px 30px 24px",
              borderRadius: 40,
              backgroundColor: UI.bar,
              border: `2px solid ${typing ? UI.accent : "#333537"}`,
              transform: `translateX(${shake}px)`,
            }}
          >
            <div
              style={{
                fontSize: 34,
                lineHeight: 1.4,
                minHeight: 150,
                color: UI.text,
              }}
            >
              {!hasText ? (
                <span style={{ color: UI.muted }}>Que voulez-vous créer ?</span>
              ) : t < CUE.sujet ? (
                <span style={{ position: "relative" }}>
                  {badText}
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "52%",
                      height: 5,
                      width: `${strike}%`,
                      backgroundColor: UI.accent,
                    }}
                  />
                </span>
              ) : (
                segTexts.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      color: i === activeSeg ? UI.accent : UI.text,
                      fontWeight: i === activeSeg ? 600 : 400,
                    }}
                  >
                    {s}
                  </span>
                ))
              )}
              {cursorOn && t >= CUE.dont ? (
                <span style={{ color: UI.accent }}>|</span>
              ) : null}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 18,
              }}
            >
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: 999,
                    backgroundColor: UI.chip,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width={34} height={34} viewBox="0 0 24 24">
                    <path d="M12 4v16M4 12h16" stroke={UI.text} strokeWidth={2} strokeLinecap="round" />
                  </svg>
                </div>
                <div
                  style={{
                    height: 74,
                    padding: "0 30px",
                    borderRadius: 999,
                    backgroundColor: UI.chip,
                    color: UI.text,
                    fontSize: 30,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Agent
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div
                  style={{
                    height: 74,
                    padding: "0 26px",
                    borderRadius: 999,
                    backgroundColor: UI.chip,
                    color: UI.text,
                    fontSize: 28,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  Nano Banana Pro
                  <div style={{ width: 26, height: 26, border: `3px solid ${UI.text}`, borderRadius: 4 }} />
                  x1
                </div>
                <div
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: 999,
                    backgroundColor: generating && sendPulse < 1 ? RED : hasText ? UI.text : UI.chip,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${1 + 0.3 * Math.sin(Math.min(1, sendPulse) * Math.PI) * (generating ? 1 : 0)})`,
                  }}
                >
                  <Arrow size={36} color={hasText && !(generating && sendPulse < 1) ? "#000" : UI.text} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PunchIn>
  );
};
