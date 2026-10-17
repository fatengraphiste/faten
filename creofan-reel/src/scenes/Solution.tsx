import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caption, Captions, LogoCorner, PunchIn } from "../components";
import { BEIGE, INK, RED, WHITE } from "../theme";

const captions: Caption[] = [
  {
    from: 0,
    to: 55,
    text: "3la khatrek marketing w ma 3andekch wa9t…",
    highlight: ["marketing"],
  },
  {
    from: 55,
    to: 100,
    text: "la solution mawjouda w tayara : Google Flow",
    highlight: ["google", "flow"],
  },
  {
    from: 100,
    to: 150,
    text: "Ama el ser lkollou fi kelmtin : el prompt !",
    highlight: ["prompt"],
  },
];

// Scène face-cam : si tu ajoutes public/facecam-1.mp4, elle s'affiche dans le cadre.
export const Solution: React.FC<{ facecam?: string }> = ({ facecam }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t1 = spring({ frame: frame - 5, fps, config: { damping: 12 } });
  const t2 = spring({ frame: frame - 55, fps, config: { damping: 10 } });
  const t3 = spring({ frame: frame - 100, fps, config: { damping: 9 } });
  const wiggle = Math.sin(frame * 0.35) * 12;

  return (
    <PunchIn bg={BEIGE}>
      {facecam ? (
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile(facecam)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      ) : null}
      <LogoCorner />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 50,
          paddingBottom: 260,
        }}
      >
        {!facecam ? (
          <div
            style={{
              fontSize: 180,
              transform: `rotate(${wiggle}deg) scale(${t1})`,
            }}
          >
            👌
          </div>
        ) : null}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: INK,
            opacity: t1,
            transform: `translateY(${(1 - t1) * 30}px)`,
          }}
        >
          T'inquiète, la solution :
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            color: WHITE,
            backgroundColor: RED,
            padding: "18px 60px",
            borderRadius: 40,
            transform: `scale(${t2}) rotate(${interpolate(t2, [0, 1], [-8, -2])}deg)`,
            boxShadow: "0 20px 50px rgba(247,50,42,0.35)",
          }}
        >
          Google Flow
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: RED,
            transform: `scale(${t3})`,
          }}
        >
          🔑 El ser : le PROMPT
        </div>
      </AbsoluteFill>

      <Captions captions={captions} onRed={false} />
    </PunchIn>
  );
};
