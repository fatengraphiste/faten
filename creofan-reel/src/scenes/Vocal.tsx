import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption, Captions, LogoCorner, PunchIn, TopLabel } from "../components";
import { BEIGE, INK, RED, WHITE } from "../theme";

const captions: Caption[] = [
  { from: 25, to: 70, text: "« Aman 3awenni ! »", highlight: ["aman", "3awenni"] },
  {
    from: 70,
    to: 135,
    text: "Fil boîte tlabou meni visuels w vidéos marketing",
    highlight: ["visuels", "vidéos"],
  },
  {
    from: 135,
    to: 195,
    text: "w ena zéro fil design w ma 3andich wa9t…",
    highlight: ["zéro", "design"],
  },
  { from: 195, to: 240, text: "chna3mel ?! 😱", highlight: ["chna3mel"] },
];

const BARS = 34;
// Hauteurs fixes pour une onde audio "naturelle"
const heights = Array.from(
  { length: BARS },
  (_, i) => 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)),
);

export const Vocal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = spring({ frame: frame - 6, fps, config: { damping: 14 } });
  const bubbleIn = spring({ frame: frame - 16, fps, config: { damping: 12 } });
  const progress = interpolate(frame, [22, 235], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Petite secousse "panique" sur la fin
  const shake =
    frame > 195 ? Math.sin(frame * 2.2) * interpolate(frame, [195, 240], [8, 0]) : 0;
  const seconds = Math.min(7, Math.floor(progress * 7));

  return (
    <PunchIn bg={RED}>
      <LogoCorner />
      <TopLabel text="Vocal men 3and collègue marketing en panique… 😰" />

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 900,
            borderRadius: 48,
            backgroundColor: BEIGE,
            overflow: "hidden",
            transform: `translateY(${(1 - cardIn) * 300}px) translateX(${shake}px)`,
            opacity: cardIn,
            boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
          }}
        >
          {/* En-tête de la discussion */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              padding: "30px 36px",
              backgroundColor: WHITE,
              borderBottom: `3px solid ${RED}22`,
            }}
          >
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: 999,
                backgroundColor: RED,
                color: WHITE,
                fontSize: 44,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              S
            </div>
            <div>
              <div style={{ fontSize: 40, fontWeight: 800, color: INK }}>
                Collègue Marketing
              </div>
              <div style={{ fontSize: 28, color: RED, fontWeight: 600 }}>
                {frame < 225 ? "enregistre un vocal…" : "en ligne"}
              </div>
            </div>
          </div>

          {/* Bulle vocale */}
          <div style={{ padding: "60px 36px 70px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                padding: "28px 32px",
                width: 760,
                borderRadius: "36px 36px 36px 8px",
                backgroundColor: WHITE,
                transform: `scale(${bubbleIn})`,
                transformOrigin: "left bottom",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 999,
                  backgroundColor: RED,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {/* Icône pause pendant la lecture */}
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 12, height: 36, background: WHITE, borderRadius: 4 }} />
                  <div style={{ width: 12, height: 36, background: WHITE, borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    height: 80,
                  }}
                >
                  {heights.map((h, i) => {
                    const played = i / BARS <= progress;
                    const live = played
                      ? h * (0.75 + 0.25 * Math.sin(frame * 0.5 + i))
                      : h;
                    return (
                      <div
                        key={i}
                        style={{
                          width: 9,
                          height: `${live * 100}%`,
                          borderRadius: 9,
                          backgroundColor: played ? RED : `${RED}40`,
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{ fontSize: 26, color: INK, opacity: 0.6, marginTop: 6 }}>
                  0:0{seconds} / 0:07
                </div>
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <Captions captions={captions} />
    </PunchIn>
  );
};
