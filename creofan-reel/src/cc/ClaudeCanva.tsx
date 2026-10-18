import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { CanvaEditor } from "./CanvaEditor";
import { Chat } from "./Chat";
import { ClaudeSteps } from "./ClaudeSteps";
import { Connected } from "./Connected";
import { C, CC_DURATION, VOICE_TRIM } from "./cues";
import { Hook } from "./Hook";
import { Outro } from "./Outro";

type Sfx = "whoosh" | "pop" | "click" | "typing" | "ding";

// Effets sonores calés sur les animations
const SFX: [Sfx, number, number?][] = [
  ["pop", C.claude],
  ["pop", C.canva],
  ["pop", C.kifech],
  ["pop", C.arba3],
  ["whoosh", C.steps - 6],
  ["click", C.avatarClick],
  ["click", C.parametres],
  ["pop", C.step2],
  ["click", C.connecteurs],
  ["click", C.searchClick],
  ["typing", C.typeCanva, 16],
  ["pop", C.step3],
  ["click", C.canvaCard],
  ["pop", C.step3b],
  ["click", C.connecter],
  ["pop", C.step4],
  ["click", C.autoriser],
  ["ding", C.connected],
  ["whoosh", C.caYest - 6],
  ["pop", C.gratuit],
  ["whoosh", C.chat - 6],
  ["typing", C.chat + 6, 38],
  ["click", C.chat + 48],
  ["pop", C.chat + 84],
  ["pop", C.lien],
  ["click", C.canvaEditor - 8],
  ["whoosh", C.canvaEditor - 6],
  ["click", C.modification - 22],
  ["typing", C.modification, 22],
  ["whoosh", C.outro - 6],
  ["pop", C.save],
  ["ding", C.follow],
];

export const ClaudeCanva: React.FC = () => (
  <>
    <Sequence from={0} durationInFrames={C.steps} name="Accroche">
      <Hook />
    </Sequence>
    <Sequence from={C.steps} durationInFrames={C.caYest - C.steps} name="Étapes Claude">
      <ClaudeSteps />
    </Sequence>
    <Sequence from={C.caYest} durationInFrames={C.chat - C.caYest} name="ça y est">
      <Connected />
    </Sequence>
    <Sequence from={C.chat} durationInFrames={C.canvaEditor - C.chat} name="Chat">
      <Chat />
    </Sequence>
    <Sequence from={C.canvaEditor} durationInFrames={C.outro - C.canvaEditor} name="Canva">
      <CanvaEditor />
    </Sequence>
    <Sequence from={C.outro} durationInFrames={CC_DURATION - C.outro} name="Fin">
      <Outro />
    </Sequence>

    {/* Voix off améliorée */}
    <Audio src={staticFile("cc/voix-off.mp3")} startFrom={VOICE_TRIM} />
    {/* Musique rythmée, en fond sous la voix */}
    <Audio
      src={staticFile("cc/music.mp3")}
      volume={(f) =>
        interpolate(f, [0, 15, CC_DURATION - 45, CC_DURATION], [0, 0.17, 0.17, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
    {SFX.map(([name, at, len], i) => (
      <Sequence key={i} from={Math.max(0, at)} durationInFrames={len ?? 30} name={`sfx ${name}`}>
        <Audio src={staticFile(`cc/${name}.wav`)} volume={name === "whoosh" ? 0.35 : 0.5} />
      </Sequence>
    ))}
  </>
);
