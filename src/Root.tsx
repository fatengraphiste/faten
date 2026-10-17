import { Composition } from "remotion";
import { Intro, introSchema } from "./Intro";

const defaultProps = {
  title: "Faten",
  subtitle: "Graphiste & Motion Design",
  accent: "#ff5a5f",
} as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 16:9 — YouTube, site web */}
      <Composition
        id="Intro"
        component={Intro}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={introSchema}
        defaultProps={defaultProps}
      />
      {/* 9:16 — Reels, TikTok, Shorts */}
      <Composition
        id="IntroVertical"
        component={Intro}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={introSchema}
        defaultProps={defaultProps}
      />
    </>
  );
};
