import {
  AbsoluteFill,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ONS_TRIM } from "../cues";
import { LogoCorner, MixedText, PunchIn } from "../components";
import { BEIGE, FONT, RED, WHITE } from "../theme";

// Zone de la bulle dans l'enregistrement d'écran (1080×206)
const SRC = { w: 1080, h: 206 };
const BUBBLE = { x: 48, y: 26, w: 870, h: 172 };
// « 09:40 » à masquer
const TIME = { x: 580, y: 146, w: 112, h: 48 };

const HOOK = ["ما", "عندكش", "وقت", "تتعلم", "الـ design ؟"];
const KEY = "الـ design ؟";

// 0:00 – 0:10 : accroche + vrai vocal WhatsApp d'Ons
export const OnsVocal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const width = 960;
  const s = width / BUBBLE.w;
  const bubbleIn = spring({ frame: frame - 20, fps, config: { damping: 13 } });
  const labelIn = spring({ frame: frame - 16, fps, config: { damping: 14 } });
  const line2 = spring({ frame: frame - 48, fps, config: { damping: 10 } });

  return (
    <PunchIn bg={RED}>
      <LogoCorner />

      {/* Accroche (lue dans les 3 premières secondes) */}
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 60,
          right: 60,
          textAlign: "center",
        }}
      >
        <div dir="rtl">
          {HOOK.map((w, i) => {
            const pop = spring({ frame: frame - i * 4, fps, config: { damping: 11 } });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  margin: "0 10px",
                  transform: `translateY(${(1 - pop) * 40}px) scale(${pop})`,
                  opacity: pop,
                }}
              >
                <MixedText
                  text={w}
                  size={w === KEY ? 96 : 92}
                  color={w === KEY ? RED : BEIGE}
                  style={
                    w === KEY
                      ? { backgroundColor: BEIGE, borderRadius: 24, padding: "0 24px" }
                      : undefined
                  }
                />
              </span>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 30,
            transform: `scale(${line2})`,
            opacity: line2,
          }}
        >
          <MixedText text="Flow يحلهالك في دقيقة" size={58} color={BEIGE} />
        </div>
      </div>

      {/* Bulle vocale WhatsApp, sans le fond ni l'heure */}
      <AbsoluteFill style={{ alignItems: "center", top: 1020 }}>
        <div
          style={{
            width,
            marginBottom: 22,
            fontFamily: FONT,
            fontSize: 36,
            fontWeight: 600,
            color: BEIGE,
            opacity: labelIn,
          }}
        >
          Ons · responsable marketing
        </div>
        <div
          style={{
            position: "relative",
            width,
            height: BUBBLE.h * s,
            transform: `scale(${bubbleIn})`,
            transformOrigin: "left top",
          }}
        >
          {/* Petite pointe de bulle "message reçu" */}
          <svg
            width={34}
            height={30}
            viewBox="0 0 34 30"
            style={{ position: "absolute", left: -20, top: 0 }}
          >
            <path d="M34 0 H4 Q0 0 3 4 L34 30 Z" fill={WHITE} />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 36,
              overflow: "hidden",
              backgroundColor: WHITE,
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <OffthreadVideo
              src={staticFile("vocal-ons.mp4")}
              startFrom={ONS_TRIM}
              style={{
                position: "absolute",
                width: SRC.w * s,
                height: SRC.h * s,
                left: -BUBBLE.x * s,
                top: -BUBBLE.y * s,
                maxWidth: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: (TIME.x - BUBBLE.x) * s,
                top: (TIME.y - BUBBLE.y) * s,
                width: TIME.w * s,
                height: TIME.h * s,
                backgroundColor: WHITE,
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </PunchIn>
  );
};
