import { Composition } from "remotion";
import { TOTAL_DURATION } from "./cues";
import { Reel } from "./Reel";
import { FPS } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CreofanReel"
    component={Reel}
    durationInFrames={TOTAL_DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
