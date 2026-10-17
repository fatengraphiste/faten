import { Composition } from "remotion";
import { Reel, ReelProps } from "./Reel";
import { FPS, TOTAL_DURATION } from "./theme";

const defaultProps: ReelProps = {
  voiceover: "",
  facecam: "",
  resultImage: "",
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CreofanReel"
    component={Reel}
    durationInFrames={TOTAL_DURATION}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={defaultProps}
  />
);
