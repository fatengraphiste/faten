import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { FontLoader } from "./fonts";
import { Body } from "./Scenes";
import { Outro } from "./Outro";
import { Captions } from "./Captions";
import { eio, seg } from "./lib";

const FPS = 30;
const BANDS = [8.45, 16.0, 27.3, 36.85, 63.2];
const OUTRO_START = 67.5;

export const GepTech: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  let band: number | null = null;
  BANDS.forEach((b0) => { const p = seg(t, b0 - 0.05, b0 + 0.55); if (p > 0 && p < 1) band = eio(p); });
  const outroT = t - OUTRO_START;
  const oOp = seg(t, OUTRO_START, OUTRO_START + 0.4);
  return (
    <FontLoader>
      <AbsoluteFill style={{ background: "#ffffff" }}>
        <Audio src={staticFile("audio/mix.m4a")} />
        <Body t={t} />
        {band !== null && (
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
            <g transform={`translate(540 960) rotate(-18) translate(${-1500 + band * 3000} 0)`}>
              <rect x={-230} y={-2600} width={460} height={5200} fill="#db4041" />
              <rect x={-340} y={-2600} width={60} height={5200} fill="#19226d" />
            </g>
          </svg>
        )}
        {outroT >= 0 && <div style={{ position: "absolute", inset: 0, opacity: oOp }}><Outro t={outroT} /></div>}
        {t < OUTRO_START + 0.2 && <Captions t={t} />}
      </AbsoluteFill>
    </FontLoader>
  );
};
