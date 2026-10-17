import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption, Captions, LogoCorner, PunchIn } from "../components";
import { BEIGE, INK, RED, WHITE } from "../theme";

const BAD_PROMPT = "a3melli pub café";

export const PROMPT_STEPS = [
  {
    title: "1. Sujet précis",
    sub: "produit · mannequin · décor",
    text: "A steaming cup of coffee on a rustic wooden table, roasted beans around, ",
    start: 85,
  },
  {
    title: "2. Style & Ambiance",
    sub: "cinematic · hyper-realistic · minimaliste",
    text: "cinematic lighting, hyper-realistic, warm minimalist mood, ",
    start: 205,
  },
  {
    title: "3. Détails de caméra",
    sub: "4K · macro shot · slow motion",
    text: "4K, macro shot, slow motion.",
    start: 325,
  },
];

export const FULL_PROMPT = PROMPT_STEPS.map((s) => s.text).join("");

const TYPE_SPEED = 1.1; // caractères par frame
const SEND_AT = 425;

const captions: Caption[] = [
  {
    from: 0,
    to: 80,
    text: "Matjich t9ollou juste « a3melli pub café »",
    highlight: ["juste"],
  },
  {
    from: 85,
    to: 205,
    text: "1. Sujet précis : chnowa mawjoud bethabt",
    highlight: ["sujet", "précis"],
  },
  {
    from: 205,
    to: 325,
    text: "2. Style & Ambiance : cinematic, hyper-realistic",
    highlight: ["style", "ambiance"],
  },
  {
    from: 325,
    to: 450,
    text: "3. Détails de caméra : 4K, macro, slow motion",
    highlight: ["caméra"],
  },
];

const typed = (text: string, frame: number, start: number) =>
  text.slice(0, Math.max(0, Math.floor((frame - start) * TYPE_SPEED)));

export const Prompt: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Étape active (-1 = mauvais prompt)
  let step = -1;
  PROMPT_STEPS.forEach((s, i) => {
    if (frame >= s.start) step = i;
  });

  // --- Mauvais prompt barré
  const badText = typed(BAD_PROMPT, frame, 8);
  const strike = interpolate(frame, [38, 48], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badShake =
    frame > 46 && frame < 70 ? Math.sin(frame * 2.5) * 10 : 0;
  const nopeIn = spring({ frame: frame - 46, fps, config: { damping: 10 } });

  // --- Zoom dynamique sur le champ de saisie pendant la frappe
  const zoom =
    frame < 85
      ? interpolate(frame, [0, 20], [1, 1.04], { extrapolateRight: "clamp" })
      : frame < SEND_AT
        ? 1.04 +
          0.03 *
            spring({
              frame: frame - (PROMPT_STEPS[step]?.start ?? 0),
              fps,
              config: { damping: 12 },
            })
        : interpolate(frame, [SEND_AT, SEND_AT + 15], [1.07, 1], {
            extrapolateRight: "clamp",
          });

  const titleIn = spring({
    frame: frame - (step >= 0 ? PROMPT_STEPS[step].start : 0),
    fps,
    config: { damping: 12 },
  });

  const cursorOn = Math.floor(frame / 15) % 2 === 0;
  const sendPulse =
    frame >= SEND_AT
      ? spring({ frame: frame - SEND_AT, fps, config: { damping: 8 } })
      : 0;

  return (
    <PunchIn bg={RED}>
      <LogoCorner />

      {/* Titre de l'étape en cours */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 60,
          right: 60,
          textAlign: "center",
          color: BEIGE,
          transform: `scale(${interpolate(titleIn, [0, 1], [0.7, 1])})`,
          opacity: titleIn,
        }}
      >
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.1 }}>
          {step < 0 ? "❌ Prompt trop vague" : PROMPT_STEPS[step].title}
        </div>
        <div style={{ fontSize: 38, fontWeight: 600, marginTop: 10 }}>
          {step < 0 ? "Résultat : générique et sans âme" : PROMPT_STEPS[step].sub}
        </div>
      </div>

      {/* Fenêtre style Google Flow */}
      <AbsoluteFill style={{ alignItems: "center" }}>
        <div
          style={{
            position: "absolute",
            top: 500,
            width: 960,
            height: 880,
            borderRadius: 44,
            backgroundColor: WHITE,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
            transform: `scale(${zoom})`,
            transformOrigin: "50% 78%",
          }}
        >
          {/* Barre du haut */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "26px 36px",
              borderBottom: `2px solid ${RED}1f`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 40, color: RED }}>✦</div>
              <div style={{ fontSize: 38, fontWeight: 800, color: INK }}>Flow</div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {["Images", "Vidéos"].map((t, i) => (
                <div
                  key={t}
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    padding: "8px 22px",
                    borderRadius: 999,
                    color: i === 1 ? WHITE : INK,
                    backgroundColor: i === 1 ? RED : BEIGE,
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* La formule : 3 pastilles */}
          <div style={{ display: "flex", gap: 14, padding: "26px 36px 0" }}>
            {["Sujet", "Style & Ambiance", "Caméra"].map((label, i) => {
              const done = step > i;
              const active = step === i;
              return (
                <div
                  key={label}
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    padding: "12px 22px",
                    borderRadius: 999,
                    color: active ? WHITE : done ? RED : `${INK}66`,
                    backgroundColor: active ? RED : done ? BEIGE : WHITE,
                    border: `3px solid ${active || done ? RED : `${INK}22`}`,
                    transform: `scale(${active ? 1.06 : 1})`,
                  }}
                >
                  {done ? "✓" : i + 1} {label}
                </div>
              );
            })}
          </div>

          {/* Zone des créations */}
          <div
            style={{
              flex: 1,
              margin: "26px 36px",
              borderRadius: 28,
              backgroundColor: BEIGE,
              border: `3px dashed ${RED}33`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              color: `${INK}88`,
              fontWeight: 600,
            }}
          >
            {frame >= SEND_AT ? "⏳ Génération en cours…" : "Tes créations apparaîtront ici"}
          </div>

          {/* Champ de discussion / prompt */}
          <div
            style={{
              margin: "0 36px 36px",
              padding: "26px 28px",
              borderRadius: 30,
              border: `4px solid ${RED}`,
              backgroundColor: WHITE,
              boxShadow: `0 0 0 8px ${RED}1a`,
              transform: `translateX(${badShake}px)`,
            }}
          >
            <div
              style={{
                fontSize: 34,
                lineHeight: 1.35,
                minHeight: 140,
                color: INK,
                fontWeight: 600,
              }}
            >
              {step < 0 ? (
                badText.length === 0 ? (
                  <span style={{ color: `${INK}55` }}>Décris ta scène…</span>
                ) : (
                  <span style={{ position: "relative" }}>
                    {badText}
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "52%",
                        height: 6,
                        width: `${strike}%`,
                        backgroundColor: RED,
                        borderRadius: 3,
                      }}
                    />
                  </span>
                )
              ) : (
                PROMPT_STEPS.map((s, i) =>
                  i <= step ? (
                    <span
                      key={i}
                      style={{
                        color: i === step && frame < SEND_AT ? RED : INK,
                        fontWeight: i === step ? 800 : 600,
                      }}
                    >
                      {typed(s.text, frame, s.start)}
                    </span>
                  ) : null,
                )
              )}
              {frame < SEND_AT && cursorOn ? (
                <span style={{ color: RED, fontWeight: 400 }}>|</span>
              ) : null}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 16,
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                {["Veo", "9:16", "x2"].map((t) => (
                  <div
                    key={t}
                    style={{
                      fontSize: 24,
                      fontWeight: 600,
                      padding: "6px 18px",
                      borderRadius: 999,
                      backgroundColor: BEIGE,
                      color: INK,
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 999,
                  backgroundColor: RED,
                  color: WHITE,
                  fontSize: 40,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${1 + 0.25 * Math.sin(sendPulse * Math.PI)})`,
                }}
              >
                ↑
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* Tampon "trop vague" */}
      {step < 0 && frame > 46 ? (
        <div
          style={{
            position: "absolute",
            top: 820,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 70,
              fontWeight: 800,
              color: WHITE,
              backgroundColor: RED,
              padding: "14px 44px",
              borderRadius: 24,
              border: `6px solid ${WHITE}`,
              transform: `scale(${nopeIn}) rotate(-6deg)`,
            }}
          >
            TROP VAGUE !
          </div>
        </div>
      ) : null}

      <Captions captions={captions} bottom={250} />
    </PunchIn>
  );
};
