import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption, Captions, LogoCorner, PunchIn } from "../components";
import { BEIGE, INK, RED, WHITE } from "../theme";
import { PROMPT_STEPS } from "./Prompt";

const captions: Caption[] = [
  {
    from: 0,
    to: 70,
    text: "Google Flow ya9ra les détails b d9i9a",
    highlight: ["détails"],
  },
  {
    from: 70,
    to: 140,
    text: "Image walla vidéo qualité studio",
    highlight: ["studio"],
  },
  {
    from: 140,
    to: 210,
    text: "bla Photoshop, bla headache ! 🤯",
    highlight: ["photoshop", "headache"],
  },
];

// Illustration de remplacement : remplace-la par ton vrai rendu Google Flow
const CoffeeIllustration: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 35%, ${BEIGE} 0%, #f9b3ad 45%, ${RED} 100%)`,
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      {/* Vapeur */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: 330 + ((frame * 1.6 + i * 40) % 120),
            left: 390 + i * 70 + Math.sin(frame / 8 + i) * 18,
            width: 26,
            height: 110,
            borderRadius: 999,
            backgroundColor: WHITE,
            opacity: 0.55 - ((frame * 1.6 + i * 40) % 120) / 260,
            filter: "blur(10px)",
          }}
        />
      ))}
      {/* Table */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: 150,
          background: `linear-gradient(${INK}, #4a1d1a)`,
        }}
      />
      {/* Grains */}
      {[[200, 120], [270, 95], [760, 110], [820, 140], [700, 80]].map(([x, b], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            bottom: b,
            width: 36,
            height: 24,
            borderRadius: "50%",
            backgroundColor: "#5a2a22",
            transform: `rotate(${i * 40}deg)`,
          }}
        />
      ))}
      {/* Tasse */}
      <div style={{ position: "absolute", bottom: 120, left: 340 }}>
        <div
          style={{
            width: 300,
            height: 220,
            backgroundColor: WHITE,
            borderRadius: "20px 20px 120px 120px",
            boxShadow: "inset -30px 0 40px rgba(0,0,0,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -22,
            left: 0,
            width: 300,
            height: 50,
            borderRadius: "50%",
            backgroundColor: WHITE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 260,
              height: 34,
              borderRadius: "50%",
              backgroundColor: "#4a1d1a",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 40,
            right: -70,
            width: 90,
            height: 110,
            borderRadius: "0 60px 60px 0",
            border: `22px solid ${WHITE}`,
            borderLeft: "none",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const Result: React.FC<{ resultImage?: string }> = ({ resultImage }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const promptIn = spring({ frame, fps, config: { damping: 14 } });
  const arrow = spring({ frame: frame - 12, fps, config: { damping: 10 } });
  const reveal = interpolate(frame, [22, 55], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badge = spring({ frame: frame - 60, fps, config: { damping: 9 } });
  const slowZoom = interpolate(frame, [22, 210], [1.12, 1]);

  return (
    <PunchIn bg={RED}>
      <LogoCorner />

      {/* Prompt */}
      <div
        style={{
          position: "absolute",
          top: 250,
          left: 70,
          right: 70,
          padding: "28px 34px",
          borderRadius: 32,
          backgroundColor: WHITE,
          fontSize: 30,
          lineHeight: 1.4,
          color: INK,
          fontWeight: 600,
          transform: `translateY(${(1 - promptIn) * -60}px)`,
          opacity: promptIn,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: RED,
            marginBottom: 8,
            letterSpacing: 2,
          }}
        >
          TON PROMPT
        </div>
        {PROMPT_STEPS.map((s, i) => (
          <span
            key={i}
            style={{
              textDecoration: "underline",
              textDecorationColor: RED,
              textDecorationThickness: 3,
              textUnderlineOffset: 6,
            }}
          >
            {s.text}
          </span>
        ))}
      </div>

      {/* Flèche */}
      <div
        style={{
          position: "absolute",
          top: 560,
          width: "100%",
          textAlign: "center",
          fontSize: 90,
          color: BEIGE,
          fontWeight: 800,
          transform: `translateY(${Math.sin(frame / 6) * 8}px) scale(${arrow})`,
        }}
      >
        ⬇
      </div>

      {/* Résultat */}
      <div
        style={{
          position: "absolute",
          top: 690,
          left: 70,
          right: 70,
          height: 820,
          borderRadius: 40,
          overflow: "hidden",
          border: `8px solid ${WHITE}`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
          clipPath: `inset(0 0 ${100 - reveal}% 0 round 40px)`,
        }}
      >
        <AbsoluteFill style={{ transform: `scale(${slowZoom})` }}>
          {resultImage ? (
            <Img
              src={staticFile(resultImage)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <CoffeeIllustration />
          )}
        </AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: 26,
            right: 26,
            padding: "10px 24px",
            borderRadius: 999,
            backgroundColor: WHITE,
            color: RED,
            fontSize: 30,
            fontWeight: 800,
            transform: `scale(${badge})`,
          }}
        >
          ✓ Qualité studio · 4K
        </div>
      </div>

      <Captions captions={captions} bottom={250} />
    </PunchIn>
  );
};
