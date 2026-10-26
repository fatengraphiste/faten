import { Composition } from "remotion";
import { CC_DURATION } from "./cc/cues";
import { ClaudeCanva } from "./cc/ClaudeCanva";
import { FAIT_DURATION, FaitParClaude } from "./fait/FaitParClaude";
import { TOTAL_DURATION } from "./cues";
import { Reel } from "./Reel";
import { FPS } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="CreofanReel"
    component={Reel}
    durationInFrames={TOTAL_DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
  <Composition
    id="ClaudeCanva"
    component={ClaudeCanva}
    durationInFrames={CC_DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
  <Composition
    id="FaitParClaude"
    component={FaitParClaude}
    durationInFrames={FAIT_DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
  </>
);
