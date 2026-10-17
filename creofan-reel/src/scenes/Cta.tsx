import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption, Captions, Logo, PunchIn } from "../components";
import { BEIGE, INK, RED, WHITE } from "../theme";

const captions: Caption[] = [
  {
    from: 0,
    to: 75,
    text: "Écris « Prompt » fi commentaire",
    highlight: ["prompt"],
  },
  {
    from: 75,
    to: 150,
    text: "w neb3athlek template wesfa kemla !",
    highlight: ["template"],
  },
];

const WORD = "PROMPT";

export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoIn = spring({ frame, fps, config: { damping: 12 } });
  const boxIn = spring({ frame: frame - 15, fps, config: { damping: 13 } });
  const typedWord = WORD.slice(0, Math.max(0, Math.floor((frame - 30) / 4)));
  const sent = frame > 65;
  const sentIn = spring({ frame: frame - 65, fps, config: { damping: 11 } });
  const heart = spring({ frame: frame - 80, fps, config: { damping: 6 } });
  const giftIn = spring({ frame: frame - 85, fps, config: { damping: 10 } });
  const pointer = Math.sin(frame / 5) * 14;

  return (
    <PunchIn bg={RED}>
      <AbsoluteFill
        style={{ alignItems: "center", paddingTop: 220, gap: 50 }}
      >
        <div
          style={{
            transform: `scale(${logoIn}) rotate(${interpolate(logoIn, [0, 1], [-90, 0])}deg)`,
          }}
        >
          <Logo size={300} />
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: BEIGE,
            letterSpacing: 10,
            opacity: logoIn,
          }}
        >
          CREOFAN
        </div>

        {/* Commentaire */}
        <div
          style={{
            width: 900,
            padding: 34,
            borderRadius: 36,
            backgroundColor: WHITE,
            transform: `translateY(${(1 - boxIn) * 200}px)`,
            opacity: boxIn,
            boxShadow: "0 30px 70px rgba(0,0,0,0.25)",
          }}
        >
          {sent ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                marginBottom: 26,
                transform: `scale(${sentIn})`,
                transformOrigin: "left center",
              }}
            >
              <div
                style={{
                  width: 74,
                  height: 74,
                  borderRadius: 999,
                  backgroundColor: BEIGE,
                  border: `3px solid ${RED}`,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 26, color: `${INK}88`, fontWeight: 600 }}>
                  toi · à l'instant
                </div>
                <div style={{ fontSize: 46, fontWeight: 800, color: INK }}>
                  PROMPT 🙌
                </div>
              </div>
              <div style={{ fontSize: 56, transform: `scale(${heart})` }}>❤️</div>
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "18px 26px",
              borderRadius: 999,
              backgroundColor: BEIGE,
            }}
          >
            <div
              style={{
                flex: 1,
                fontSize: 40,
                fontWeight: 800,
                color: sent || typedWord.length === 0 ? `${INK}55` : RED,
              }}
            >
              {sent || typedWord.length === 0
                ? "Ajoute un commentaire…"
                : typedWord + (Math.floor(frame / 8) % 2 ? "|" : "")}
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, color: RED }}>
              Publier
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: RED,
            backgroundColor: BEIGE,
            padding: "16px 40px",
            borderRadius: 999,
            transform: `scale(${giftIn})`,
          }}
        >
          🎁 Template offert
        </div>
        <div
          style={{
            fontSize: 80,
            transform: `translateY(${pointer}px)`,
            opacity: giftIn,
          }}
        >
          👇
        </div>
      </AbsoluteFill>

      <Captions captions={captions} bottom={250} />
    </PunchIn>
  );
};
