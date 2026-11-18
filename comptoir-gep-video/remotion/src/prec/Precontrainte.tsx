import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { FontLoader } from "../fonts";
import { Outro } from "../Outro";
import { LOGO_PATHS } from "../logo";
import { NAVY } from "../lib";
import { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12 } from "./scenes";
import { VOICE_DUR, BOUNDS } from "./cues";

export const FPS = 30;
export const VOICE_END = VOICE_DUR + 0.1;
// bornes des scènes (s) : milieux des pauses de la voix off
const B = BOUNDS;
const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12];

const Logo: React.FC<{ a: number }> = ({ a }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }} opacity={a}>
    <g transform="translate(430 268) scale(0.217)">{LOGO_PATHS.map((p, i) => (p.rect ? <rect key={i} x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} fill={NAVY} /> : <path key={i} d={p.d} fill={p.c === "r" ? "#db4041" : NAVY} />))}</g>
  </svg>
);

const Scene: React.FC<{ i: number; from: number; to: number }> = ({ i, from, to }) => {
  const f = useCurrentFrame(); const len = Math.round((to - from) * FPS);
  const e = Math.min(i === 0 ? 1 : f / 8, (len - f) / 8, 1);
  const C = SCENES[i];
  return <AbsoluteFill style={{ opacity: Math.max(0, e) }}><C t={f / FPS} dur={to - from} s0={from} /></AbsoluteFill>;
};

export const Precontrainte: React.FC = () => {
  const f = useCurrentFrame();
  const logoA = interpolate(f, [0, 12, Math.round((VOICE_END - 0.3) * FPS), Math.round(VOICE_END * FPS)], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <FontLoader>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,#ffffff 0%,#f1f3f8 100%)" }}>
        {B.slice(0, -1).map((b, i) => (
          <Sequence key={i} from={Math.round(b * FPS)} durationInFrames={Math.round((B[i + 1] - b) * FPS)}><Scene i={i} from={b} to={B[i + 1]} /></Sequence>
        ))}
        <Logo a={logoA} />
        <Sequence from={Math.round(VOICE_END * FPS)} durationInFrames={150}>
          <OutroWrap />
        </Sequence>
      </AbsoluteFill>
    </FontLoader>
  );
};
const OutroWrap: React.FC = () => { const f = useCurrentFrame(); return <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, f / 10), background: "#fff" }}><Outro t={f / FPS} /></div>; };
