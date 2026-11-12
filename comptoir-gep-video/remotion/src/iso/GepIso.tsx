import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import CAPS from "../captions.json";
import { IsoFonts } from "./fonts";
import { ArLine } from "./Legend";
import { Scene1 } from "./Scene1";
import { Scene2 } from "./Scene2";
import { Scene3 } from "./Scene3";
import { Scene4A, Scene4B } from "./Scene4";
import { Scene5 } from "./Scene5";
import { Scene6, Scene7, Scene8 } from "./Scene6";
import { Scene9, Scene10 } from "./Scene9";
import { FPS } from "./theme";

/* ---- music ducking driven by the voice-over word timings (no ffmpeg needed) ---- */
const N = 2175;
const act = new Float32Array(N);
(CAPS as { words: { s: number; e: number }[] }[]).forEach((c) => c.words.forEach((w) => {
  for (let f = Math.floor((w.s - 0.15) * FPS); f <= Math.ceil((w.e + 0.3) * FPS); f++) if (f >= 0 && f < N) act[f] = 1;
}));
const smooth = (f: number) => { let s = 0, n = 0; for (let k = -9; k <= 9; k++) { const i = Math.min(N - 1, Math.max(0, f + k)); s += act[i]; n++; } return s / n; };
const musicVol = (f: number) => 0.2 * (1 - 0.72 * smooth(f));

type SceneDef = { from: number; to: number; C: React.FC<{ t: number }> };
const SCENES: SceneDef[] = [{ from: 0, to: 8.6, C: Scene1 }, { from: 8.6, to: 10.9, C: Scene2 }, { from: 10.9, to: 16.2, C: Scene3 }, { from: 16.2, to: 21.0, C: Scene4A }, { from: 21.0, to: 27.4, C: Scene4B }, { from: 27.4, to: 36.9, C: Scene5 }, { from: 36.9, to: 45.45, C: Scene6 }, { from: 45.45, to: 51.3, C: Scene7 }, { from: 51.3, to: 59.4, C: Scene8 }, { from: 59.4, to: 63.3, C: Scene9 }, { from: 63.3, to: 72.5, C: Scene10 }];

const SceneRoot: React.FC<{ s0: number; C: React.FC<{ t: number }>; len: number }> = ({ s0, C, len }) => {
  const f = useCurrentFrame();
  const t = s0 + f / FPS;
  const e = Math.min(1, f / 8, (len - f) / 8);
  return <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }} opacity={Math.max(0, e)}><C t={t} /></svg>;
};

export const GepIso: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <IsoFonts>
      <AbsoluteFill style={{ background: "#ffffff" }}>
        <Audio src={staticFile("audio/comptoir-gep-voice.mp3")} />
        <Audio src={staticFile("audio/music.wav")} volume={musicVol} />
        {SCENES.map((s, i) => {
          const from = Math.round(s.from * FPS), len = Math.round((s.to - s.from) * FPS);
          return <Sequence key={i} from={from} durationInFrames={len}><SceneRoot s0={s.from} C={s.C} len={len} /></Sequence>;
        })}
        <ArLine t={t} />
      </AbsoluteFill>
    </IsoFonts>
  );
};
