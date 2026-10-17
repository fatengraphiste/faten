import { Audio, Sequence, staticFile } from "remotion";
import { Cta } from "./scenes/Cta";
import { Prompt } from "./scenes/Prompt";
import { Result } from "./scenes/Result";
import { Solution } from "./scenes/Solution";
import { Vocal } from "./scenes/Vocal";
import { SCENES } from "./theme";

export type ReelProps = {
  // Fichiers optionnels à mettre dans le dossier public/
  voiceover: string; // ex. "voix.mp3"
  facecam: string; // ex. "facecam-1.mp4"
  resultImage: string; // ex. "resultat-flow.jpg"
};

export const Reel: React.FC<ReelProps> = ({ voiceover, facecam, resultImage }) => {
  return (
    <>
      <Sequence {...SCENES.vocal} name="0:00 Vocal">
        <Vocal />
      </Sequence>
      <Sequence {...SCENES.solution} name="0:08 Solution">
        <Solution facecam={facecam || undefined} />
      </Sequence>
      <Sequence {...SCENES.prompt} name="0:13 Prompt">
        <Prompt />
      </Sequence>
      <Sequence {...SCENES.result} name="0:28 Résultat">
        <Result resultImage={resultImage || undefined} />
      </Sequence>
      <Sequence {...SCENES.cta} name="0:35 CTA">
        <Cta />
      </Sequence>
      {voiceover ? <Audio src={staticFile(voiceover)} /> : null}
    </>
  );
};
