import { getLength, getPointAtLength } from "@remotion/paths";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BEIGE, RED } from "../theme";
import { smooth } from "./Outro";

// Outro Creofan, version icône — 3 s (90 images à 30 i/s), 1080×1920
// Même style que « Outro » : l'icône est une seule ligne continue, tracée au stylo.
// 0.0 → 2.1 s  le stylo part du haut du cercle à droite, fait le tour par le haut,
//              plonge dans le « f » (boucle haute, boucle basse), ressort par la barre
//              et referme le cercle par le bas. La caméra recule doucement.
// 2.1 → 3.0 s  onde rouge et léger rebond, puis tenue
export const OUTRO_ICON_DURATION = 90;

const ICON_PATH =
  "m763.46,369.45c-.83-.65-1.7-1.27-2.55-1.91-49.92-37.27-135.18-42.06-229.1-12.66-33.81,10.59-77.42,30.25-120.51,56.57,1.82-16.1,3.56-32.28,5.28-48.34.21-1.9.41-3.81.62-5.71,17.74-14.89,84.47-76.32,103.98-128.02,37.11-98.31,2.45-127.08-14.18-134.89-27.2-12.77-64.72,2.02-81.93,32.3-22.74,39.98-32.5,118.43-42.52,210.72-83.51,58.33-250.77,145.04-318.23,113.65-5.78-2.69-21.9-10.19-27.73-39.26-.14-4.18-.24-8.37-.24-12.58,0-7.29.24-14.52.67-21.71C48.29,187.54,206.47,36.35,399.33,36.35c180.35,0,330.37,132.21,358.3,304.8,6.53,3.73,12.69,7.83,18.4,12.34,8.54,6.73,15.83,14.17,21.91,22.16C785.64,166.44,611.57,0,399.33,0S10.5,168.85.47,380.18c-.3,6.35-.47,12.73-.47,19.16,0,.42.01.83.02,1.25.02,5.67.16,11.32.42,16.93,7.08,37.63,27.64,56.25,45.66,65.45.94.48,1.87.94,2.79,1.37,82.8,38.53,243.66-45.29,328.56-99.54-1.94,17.83-3.95,35.67-6.09,53.23-69.85,50.64-129.09,117.82-129.09,190.16,0,16.99,1.83,41.27,17.63,55.88,8.23,7.61,18.8,11.45,31.47,11.45,1.72,0,3.48-.07,5.28-.21,53.29-4.2,75.79-69.37,88.07-118.03,8.88-35.17,15.42-75.97,20.92-118.67,51.14-34.86,103.74-58.37,137.09-68.81,98.9-30.97,167.17-15.97,198.08,8.39,8.17,6.44,17.37,16.43,20.35,30.01-.86,10.87-2.21,21.6-4.01,32.17-29.11,171.19-178.47,301.95-357.82,301.95-162.43,0-300.28-107.25-346.47-254.65-4.36-1.42-8.55-3.05-12.55-4.91-13.42-6.24-23.97-14.45-32.29-23.63,37.08,182.09,198.44,319.53,391.32,319.53s363.75-145.72,394.26-335.84c1.07-6.68,1.98-13.4,2.71-20.19.63-5.78,1.12-11.6,1.5-17.45-3.26-21.18-15.05-40.54-34.35-55.75Zm-306.59-224.57c6.7-11.78,19.27-18.47,28.54-18.47,2.25,0,4.31.39,6.04,1.21,16.95,7.96,9.55,51.64-4.5,88.86-10.26,27.18-39.87,61.27-63.57,85.26,7.94-67.5,17.51-128.77,33.48-156.86Zm-107.61,423.44c-10.12,40.1-27.96,88.35-55.48,90.52-4.45.35-7.5-.2-9.05-1.63-1.77-1.63-5.88-7.73-5.88-29.02,0-53.99,44.39-103.83,85.54-138.43-4.25,28.24-9.16,54.88-15.13,78.55Z";

// Ligne médiane (repère de l'icône 797.94 × 798.67) : cercle de rayon 381 centré en (399, 399)
const CX = 399;
const CY = 399;
const R = 381;
const arc = (a0: number, a1: number, step = 20): [number, number][] => {
  const n = Math.max(1, Math.floor(Math.abs(a1 - a0) / step));
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [Math.round((CX + R * Math.cos(a)) * 10) / 10, Math.round((CY + R * Math.sin(a)) * 10) / 10];
  });
};
// Haut du cercle (de droite vers la gauche), puis le « f », puis bas du cercle
const TOP = arc(-6.2, -178);
const F_PTS: [number, number][] = [
  [19, 415], [24, 436], [38, 456], [62, 471], [100, 476], [150, 470], [200, 456], [250, 436],
  [300, 412], [345, 385], [390, 352], [425, 322], [465, 282], [497, 238], [516, 190], [521, 145],
  [508, 114], [482, 103], [455, 112], [434, 135], [420, 180], [412, 240], [406, 300], [399, 360],
  [394, 420], [386, 480], [373, 550], [357, 600], [338, 645], [316, 672], [291, 679], [271, 668],
  [262, 640], [264, 590], [285, 540], [320, 500], [360, 465], [408, 430], [455, 404], [500, 382],
  [550, 366], [600, 357], [650, 355], [700, 362], [740, 378], [765, 402], [779, 432],
];
const BOTTOM = arc(15, 165.6);
const PTS = [...TOP, ...F_PTS, ...BOTTOM];
const LINE = smooth(PTS);
const LEN = getLength(LINE);
// Moment où le stylo attaque le bas du cercle
const BOTTOM_START = getLength(smooth([...TOP, ...F_PTS])) / LEN;
// Moment où la barre du « f » rejoint le cercle à droite
const BAR_ARRIVES = getLength(smooth([...TOP, ...F_PTS.slice(0, F_PTS.length - 3)])) / LEN;

const W = 1080;
const H = 1920;
const ICON = 797.94;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pen = Easing.bezier(0.45, 0, 0.3, 1);
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

type OutroIconProps = { f?: number; fg?: string; bg?: string; size?: number; cy?: number };
export const OutroIcon: React.FC<OutroIconProps> = ({ f, fg = RED, bg = BEIGE, size = 760, cy = H / 2 }) => {
  const cur = useCurrentFrame();
  const frame = f ?? cur;
  const { fps } = useVideoConfig();

  // Tracé du stylo
  const drawP = interpolate(frame, [2, 62], [0, 1], { ...clamp, easing: pen });
  const head = getPointAtLength(LINE, Math.max(0.01, drawP * LEN)) ?? { x: PTS[0][0], y: PTS[0][1] };
  const nib = interpolate(frame, [2, 6, 58, 64], [0, 1, 1, 0], clamp);

  // Caméra : légèrement serrée et inclinée, puis recul
  const cam = interpolate(frame, [0, 66], [0, 1], { ...clamp, easing: easeInOut });
  const zoom = interpolate(cam, [0, 1], [1.22, 1]);
  const rot = interpolate(cam, [0, 1], [-8, 0]);

  // Fin du tracé : petit rebond + onde
  const pop = spring({ frame: frame - 62, fps, config: { damping: 10, stiffness: 220 } });
  const bump = 1 + 0.045 * Math.sin(Math.PI * Math.min(1, pop));
  const wave = interpolate(frame, [62, 86], [0, 1], { ...clamp, easing: easeOut });
  const k = size / ICON;
  const s = k * zoom * bump;

  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <mask id="iconPenMask" maskUnits="userSpaceOnUse" x={-200} y={-200} width={1200} height={1200}>
            <path
              d={LINE}
              fill="none"
              stroke="white"
              strokeWidth={52}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${LEN} ${LEN}`}
              strokeDashoffset={LEN * (1 - drawP)}
              opacity={drawP > 0 ? 1 : 0}
            />
            {/* Évite que la courbe en bas à gauche dévoile trop tôt la fin du cercle */}
            {drawP < BOTTOM_START ? <polygon points="-10,470 56,500 100,600 -10,600" fill="black" /> : null}
            {/* Évite que le départ du stylo, en haut à droite, dévoile trop tôt le bout de la barre */}
            {drawP < BAR_ARRIVES ? <polygon points="735,323 810,385 810,420 735,420" fill="black" /> : null}
          </mask>
        </defs>

        {/* Onde de fin */}
        <circle
          cx={W / 2}
          cy={cy}
          r={k * (400 + wave * 150)}
          fill="none"
          stroke={fg}
          strokeWidth={6 * (1 - wave)}
          opacity={frame >= 62 ? 0.5 * (1 - wave) : 0}
        />

        <g transform={`translate(${W / 2} ${cy}) rotate(${rot}) scale(${s}) translate(${-CX} ${-CY})`}>
          <path d={ICON_PATH} fill={fg} mask="url(#iconPenMask)" />
          {/* Pointe du stylo */}
          <circle cx={head.x} cy={head.y} r={20} fill={fg} opacity={nib} />
          <circle cx={head.x} cy={head.y} r={34} fill={fg} opacity={nib * 0.18} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
