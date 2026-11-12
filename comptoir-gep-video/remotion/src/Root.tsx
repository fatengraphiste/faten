import React from "react";
import { Composition } from "remotion";
import { GepTech } from "./GepTech";
export const FPS = 30;
export const TOTAL = 2175; // 72.5 s = 67.5 s de voix + outro 5 s
export const Root: React.FC = () => (
  <Composition id="GepTech" component={GepTech} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
);
