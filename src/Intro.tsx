import { zColor } from "@remotion/zod-types";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

export const introSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  accent: zColor(),
});

export const Intro: React.FC<z.infer<typeof introSchema>> = ({
  title,
  subtitle,
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const unit = Math.min(width, height);

  const circle = spring({ frame, fps, config: { damping: 200 } });
  const titleIn = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  const subtitleOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [25, 60], [0, unit * 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f12",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Helvetica, Arial, sans-serif",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: unit * 0.9,
          height: unit * 0.9,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}55 0%, transparent 70%)`,
          transform: `scale(${circle})`,
        }}
      />
      <div
        style={{
          color: "white",
          fontSize: unit * 0.16,
          fontWeight: 800,
          letterSpacing: -2,
          transform: `translateY(${(1 - titleIn) * unit * 0.1}px)`,
          opacity: titleIn,
        }}
      >
        {title}
      </div>
      <div
        style={{
          height: unit * 0.008,
          width: lineWidth,
          backgroundColor: accent,
          margin: `${unit * 0.025}px 0`,
          borderRadius: 999,
        }}
      />
      <div
        style={{
          color: "#d8d8de",
          fontSize: unit * 0.045,
          letterSpacing: unit * 0.004,
          textTransform: "uppercase",
          opacity: subtitleOpacity,
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};
