import React from "react";
import { Composition } from "remotion";
import { GepTech } from "./GepTech";
import { GepIso } from "./iso/GepIso";
import { Livraison } from "./Livraison";
import { Cover } from "./Cover";
import { Precontrainte } from "./prec/Precontrainte";
import { CoverPrec } from "./prec/CoverPrec";
import { BetoVideo } from "./beto/BetoVideo";
import { BetoV2 } from "./beto/BetoV2";
import { BetoV3 } from "./beto/BetoV3";
import { BetoV4 } from "./beto/BetoV4";
import { BetoV5 } from "./beto/BetoV5";
import { CoverIso } from "./CoverIso";
export const FPS = 30;
export const TOTAL = 2175; // 72.5 s = 67.5 s de voix + outro 5 s
export const Root: React.FC = () => (
  <>
    <Composition id="GepTech" component={GepTech} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
    <Composition id="GepIso" component={GepIso} durationInFrames={2179} fps={FPS} width={1080} height={1920} />
    <Composition id="Livraison" component={Livraison} durationInFrames={972} fps={FPS} width={1080} height={1920} />
    <Composition id="Cover" component={Cover} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="CoverIso" component={CoverIso} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="Precontrainte" component={Precontrainte} durationInFrames={2080} fps={FPS} width={1080} height={1920} />
    <Composition id="BetoVideo" component={BetoVideo} durationInFrames={1170} fps={FPS} width={1080} height={1920} />
    <Composition id="CoverPrec" component={CoverPrec} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="BetoV2" component={BetoV2} durationInFrames={1210} fps={FPS} width={1080} height={1920} />
    <Composition id="BetoV3" component={BetoV3} durationInFrames={1160} fps={FPS} width={1080} height={1920} />
    <Composition id="BetoV4" component={BetoV4} durationInFrames={1160} fps={FPS} width={1080} height={1920} />
    <Composition id="BetoV5" component={BetoV5} durationInFrames={1160} fps={FPS} width={1080} height={1920} />
  </>
);
