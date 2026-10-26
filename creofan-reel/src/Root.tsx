import { Composition } from "remotion";
import { SafeZoneGuide } from "./components";
import { CC_DURATION } from "./cc/cues";
import { ClaudeCanva } from "./cc/ClaudeCanva";
import { FAIT_DURATION, FaitParClaude } from "./fait/FaitParClaude";
import { TOTAL_DURATION } from "./cues";
import { Reel } from "./Reel";
import { FPS } from "./theme";

// Ajoute le repère de zone de sécurité (prop « showSafeZone » dans le Studio)
const withGuide = (C: React.FC) => {
  const Wrapped: React.FC<{ showSafeZone: boolean }> = ({ showSafeZone }) => (
    <>
      <C />
      {showSafeZone ? <SafeZoneGuide /> : null}
    </>
  );
  return Wrapped;
};
const CreofanReelG = withGuide(Reel);
const ClaudeCanvaG = withGuide(ClaudeCanva);
const FaitParClaudeG = withGuide(FaitParClaude);

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="CreofanReel"
    component={CreofanReelG}
    defaultProps={{ showSafeZone: false }}
    durationInFrames={TOTAL_DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
  <Composition
    id="ClaudeCanva"
    component={ClaudeCanvaG}
    defaultProps={{ showSafeZone: false }}
    durationInFrames={CC_DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
  <Composition
    id="FaitParClaude"
    component={FaitParClaudeG}
    defaultProps={{ showSafeZone: false }}
    durationInFrames={FAIT_DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
  </>
);
