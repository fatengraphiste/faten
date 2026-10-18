import { Audio, Sequence, staticFile } from "remotion";
import { CUE, TOTAL_DURATION, VOICE_START, VOICE_TRIM } from "./cues";
import { Cta } from "./scenes/Cta";
import { FlowScene } from "./scenes/FlowScene";
import { OnsVocal } from "./scenes/OnsVocal";

export const Reel: React.FC = () => {
  return (
    <>
      <Sequence from={0} durationInFrames={VOICE_START} name="Vocal d'Ons">
        <OnsVocal />
      </Sequence>
      <Sequence
        from={CUE.flowIn}
        durationInFrames={CUE.cta - CUE.flowIn}
        name="Google Flow"
      >
        <FlowScene />
      </Sequence>
      <Sequence from={CUE.cta} durationInFrames={TOTAL_DURATION - CUE.cta} name="CTA">
        <Cta />
      </Sequence>
      <Sequence from={VOICE_START} name="Voix off">
        <Audio src={staticFile("voix-off.mp3")} startFrom={VOICE_TRIM} />
      </Sequence>
    </>
  );
};
