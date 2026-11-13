import React from "react";
import { Composition } from "remotion";
import { GepTech } from "./GepTech";
import { GepIso } from "./iso/GepIso";
import { Livraison } from "./Livraison";
import { Cover } from "./Cover";
export const FPS = 30;
export const TOTAL = 2175; // 72.5 s = 67.5 s de voix + outro 5 s
export const Root: React.FC = () => (
  <>
    <Composition id="GepTech" component={GepTech} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
    <Composition id="GepIso" component={GepIso} durationInFrames={2179} fps={FPS} width={1080} height={1920} />
    <Composition id="Livraison" component={Livraison} durationInFrames={972} fps={FPS} width={1080} height={1920} />
    <Composition id="Cover" component={Cover} durationInFrames={1} fps={FPS} width={1080} height={1920} />
  </>
);
