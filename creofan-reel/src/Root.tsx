import { Composition } from "remotion";
import { SafeZoneGuide } from "./components";
import { CC_DURATION } from "./cc/cues";
import { ClaudeCanva } from "./cc/ClaudeCanva";
import { FAIT_DURATION, FaitParClaude } from "./fait/FaitParClaude";
import { Regard, REGARD_DURATION } from "./regard/Regard";
import { Ame, AME_DURATION, AME_FPS } from "./ame/Ame";
import { CoverAme, CoverClaudeCanva, CoverFait, CoverFlow, CoverRegard } from "./covers/Covers";
import { Parfum, PARFUM_DURATION } from "./parfum/Parfum";
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
const RegardG = withGuide(Regard);
const ParfumG = withGuide(Parfum);

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
  <Composition
    id="Regard"
    component={RegardG}
    defaultProps={{ showSafeZone: false }}
    durationInFrames={REGARD_DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
  <Composition
    id="Ame"
    component={Ame}
    durationInFrames={AME_DURATION}
    fps={AME_FPS}
    width={1080}
    height={1920}
  />
  <Composition
    id="Parfum"
    component={ParfumG}
    defaultProps={{ showSafeZone: false }}
    durationInFrames={PARFUM_DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
  <Composition id="CoverRegard" component={CoverRegard} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="CoverFait" component={CoverFait} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="CoverFlow" component={CoverFlow} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="CoverClaudeCanva" component={CoverClaudeCanva} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="CoverAme" component={CoverAme} durationInFrames={1} fps={30} width={1080} height={1920} />
  </>
);
