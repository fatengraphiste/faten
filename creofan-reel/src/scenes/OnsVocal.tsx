import {
  AbsoluteFill,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ONS_TRIM } from "../cues";
import { LogoCorner, PunchIn } from "../components";
import { BEIGE, INK, RED, WHITE } from "../theme";

// 0:00 – 0:10 : le vrai vocal WhatsApp d'Ons (image + son)
export const OnsVocal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn = spring({ frame: frame - 2, fps, config: { damping: 14 } });
  const cardIn = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const bubbleIn = spring({ frame: frame - 18, fps, config: { damping: 12 } });
  // Respiration légère de la carte pendant le vocal
  const breathe = 1 + 0.008 * Math.sin(frame / 6);

  return (
    <PunchIn bg={RED}>
      <LogoCorner />

      <div
        style={{
          position: "absolute",
          top: 300,
          left: 70,
          right: 70,
          textAlign: "center",
          color: BEIGE,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * -40}px)`,
        }}
      >
        <div style={{ fontSize: 46, fontWeight: 600 }}>Vocal reçu de</div>
        <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 1.1 }}>Ons</div>
        <div style={{ fontSize: 40, fontWeight: 600, marginTop: 8 }}>
          responsable marketing en agence de communication
        </div>
      </div>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 260 }}>
        <div
          style={{
            width: 940,
            borderRadius: 48,
            backgroundColor: BEIGE,
            overflow: "hidden",
            transform: `translateY(${(1 - cardIn) * 400}px) scale(${breathe})`,
            opacity: cardIn,
            boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              padding: "30px 36px",
              backgroundColor: WHITE,
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 999,
                backgroundColor: RED,
                color: BEIGE,
                fontSize: 48,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              O
            </div>
            <div>
              <div style={{ fontSize: 42, fontWeight: 800, color: INK }}>Ons</div>
              <div style={{ fontSize: 28, color: RED, fontWeight: 600 }}>
                Responsable marketing · Agence de com
              </div>
            </div>
          </div>
          <div style={{ padding: "50px 30px 60px" }}>
            <div
              style={{
                borderRadius: 30,
                overflow: "hidden",
                transform: `scale(${bubbleIn})`,
                transformOrigin: "left center",
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              }}
            >
              <OffthreadVideo
                src={staticFile("vocal-ons.mp4")}
                startFrom={ONS_TRIM}
                style={{ width: "100%", display: "block" }}
              />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </PunchIn>
  );
};
