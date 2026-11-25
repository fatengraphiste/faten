import { Composition } from "remotion";
import { SafeZoneGuide } from "./components";
import { CC_DURATION } from "./cc/cues";
import { ClaudeCanva } from "./cc/ClaudeCanva";
import { FAIT_DURATION, FaitParClaude } from "./fait/FaitParClaude";
import { Regard, REGARD_DURATION } from "./regard/Regard";
import { Ame, AME_DURATION, AME_FPS } from "./ame/Ame";
import { CanvaCraft, CRAFT_DURATION, craftDefaults } from "./craft/CanvaCraft";
import { LayersFilm, LAYERS_DURATION, layersDefaults } from "./craft2/Layers";
import { CoverAme, CoverClaudeCanva, CoverCraft, CoverCraftB, CoverCraftC, CoverFait, CoverFlow, CoverRegard } from "./covers/Covers";
import { TOTAL_DURATION } from "./cues";
import { Reel } from "./Reel";
import { FPS } from "./theme";
import { PLANS } from "./masterclass/Storyboard";
import { CloneReel, CLONE_DURATION, CoverClone } from "./clone/CloneReel";
import { CloneV2, CLONE2_DURATION, CoverClone2 } from "./clone/CloneV2";
import { CloneV3, CLONE3_DURATION } from "./clone/CloneV3";
import { CloneV4, CLONE4_DURATION, CoverClone4 } from "./clone/CloneV4";
import { CloneV5, CLONE5_DURATION, CoverClone5 } from "./clone/CloneV5";
import { HabV1, HAB_TOTAL } from "./habouba/HabV1";
import { HabV2, HAB2_TOTAL } from "./habouba/HabV2";
import { HabV3, HAB3_TOTAL } from "./habouba/HabV3";
import { HabV4, HAB4_TOTAL } from "./habouba/HabV4";
import { HabV5, HAB5_TOTAL, CoverHab5 } from "./habouba/HabV5";
import { ServV1, SERV1_TOTAL } from "./services/ServV1";
import { ServV2, SERV2_TOTAL } from "./services/ServV2";
import { CoverFable, Fable52, FABLE_DURATION } from "./fable/Fable52";
import { AIContest, AIContestV2, CONTEST_DURATION, CoverContest, CoverContestV2 } from "./contest/AIContest";
import { CoverMasterclass, MasterclassReel, MC_DURATION } from "./masterclass/MasterclassReel";

// Ajoute le repère de zone de sécurité (prop « showSafeZone » dans le Studio)
const withGuide = (C: React.FC) => {
  const Wrapped: React.FC<{ showSafeZone: boolean }> = ({ showSafeZone }) => (
    <>
      <C />
      {showSafeZone ? <SafeZoneGuide /> : null}
    </>
  );
  return Wrapped;
};
const CreofanReelG = withGuide(Reel);
const ClaudeCanvaG = withGuide(ClaudeCanva);
const FaitParClaudeG = withGuide(FaitParClaude);
const RegardG = withGuide(Regard);

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="CreofanReel"
    component={CreofanReelG}
    defaultProps={{ showSafeZone: false }}
    durationInFrames={TOTAL_DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
  <Composition
    id="ClaudeCanva"
    component={ClaudeCanvaG}
    defaultProps={{ showSafeZone: false }}
    durationInFrames={CC_DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
  <Composition
    id="FaitParClaude"
    component={FaitParClaudeG}
    defaultProps={{ showSafeZone: false }}
    durationInFrames={FAIT_DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
  <Composition
    id="Regard"
    component={RegardG}
    defaultProps={{ showSafeZone: false }}
    durationInFrames={REGARD_DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
  <Composition
    id="Ame"
    component={Ame}
    durationInFrames={AME_DURATION}
    fps={AME_FPS}
    width={1080}
    height={1920}
  />
  <Composition id="CoverRegard" component={CoverRegard} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="CoverFait" component={CoverFait} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="CoverFlow" component={CoverFlow} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="CoverClaudeCanva" component={CoverClaudeCanva} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="CoverAme" component={CoverAme} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="CoverHab5" component={CoverHab5} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="ServV2" component={ServV2} durationInFrames={SERV2_TOTAL} fps={30} width={1080} height={1350} />
  <Composition id="ServV1" component={ServV1} durationInFrames={SERV1_TOTAL} fps={30} width={1080} height={1920} />
  <Composition id="HabV5" component={HabV5} durationInFrames={HAB5_TOTAL} fps={30} width={1080} height={1920} />
  <Composition id="HabV4" component={HabV4} durationInFrames={HAB4_TOTAL} fps={30} width={1080} height={1920} />
  <Composition id="HabV3" component={HabV3} durationInFrames={HAB3_TOTAL} fps={30} width={1080} height={1920} />
  <Composition id="HabV2" component={HabV2} durationInFrames={HAB2_TOTAL} fps={30} width={1080} height={1920} />
  <Composition id="HabV1" component={HabV1} durationInFrames={HAB_TOTAL} fps={30} width={1080} height={1920} />
  <Composition id="CloneV5" component={CloneV5} durationInFrames={CLONE5_DURATION} fps={30} width={1080} height={1920} />
  <Composition id="CoverClone5" component={CoverClone5} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="CloneV4" component={CloneV4} durationInFrames={CLONE4_DURATION} fps={30} width={1080} height={1920} />
  <Composition id="CoverClone4" component={CoverClone4} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="CloneV3" component={CloneV3} durationInFrames={CLONE3_DURATION} fps={30} width={1080} height={1920} />
  <Composition id="CloneV2" component={CloneV2} durationInFrames={CLONE2_DURATION} fps={30} width={1080} height={1920} />
  <Composition id="CoverClone2" component={CoverClone2} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="CloneReel" component={CloneReel} durationInFrames={CLONE_DURATION} fps={30} width={1080} height={1920} />
  <Composition id="CoverClone" component={CoverClone} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="Fable52" component={Fable52} durationInFrames={FABLE_DURATION} fps={30} width={1080} height={1920} />
  <Composition id="CoverFable" component={CoverFable} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="AIContest" component={AIContest} durationInFrames={CONTEST_DURATION} fps={30} width={1080} height={1920} />
  <Composition id="AIContestV2" component={AIContestV2} durationInFrames={CONTEST_DURATION} fps={30} width={1080} height={1920} />
  <Composition id="CoverContestV2" component={CoverContestV2} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="CoverContest" component={CoverContest} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="MasterclassReel" component={MasterclassReel} durationInFrames={MC_DURATION} fps={30} width={1080} height={1920} />
  <Composition id="CoverMasterclass" component={CoverMasterclass} durationInFrames={1} fps={30} width={1080} height={1920} />
  {PLANS.map((P, i) => (
    <Composition key={i} id={`Masterclass0${i + 1}`} component={P} durationInFrames={1} fps={30} width={1080} height={1920} />
  ))}
  <Composition id="CoverCraft" component={CoverCraft} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="CoverCraftB" component={CoverCraftB} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="CoverCraftC" component={CoverCraftC} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="CanvaCraft" component={CanvaCraft} defaultProps={craftDefaults} durationInFrames={CRAFT_DURATION} fps={30} width={1080} height={1920} />
  <Composition id="CanvaCraftLayers" component={LayersFilm} defaultProps={layersDefaults} durationInFrames={LAYERS_DURATION} fps={30} width={1080} height={1920} />
  </>
);
