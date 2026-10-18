import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BEIGE, FONT, RED } from "./theme";

export const Logo: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 110,
  style,
}) => (
  <Img
    src={staticFile("logo-creofan.png")}
    style={{ width: size, height: size, ...style }}
  />
);

// Logo Creofan beige sur pastille rouge, en haut à gauche
export const LogoCorner: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 70,
      left: 70,
      width: 130,
      height: 130,
      borderRadius: 999,
      backgroundColor: RED,
      border: `4px solid ${BEIGE}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Logo size={92} />
  </div>
);

// Léger "punch-in" à chaque coupe (jump cut)
export const PunchIn: React.FC<{ children: React.ReactNode; bg: string }> = ({
  children,
  bg,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18, mass: 0.6 } });
  const scale = interpolate(s, [0, 1], [1.08, 1]);
  return (
    <AbsoluteFill style={{ backgroundColor: bg, fontFamily: FONT }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Logo Google Flow (fleur en pixels), redessiné case par case
const FLOWER = [
  "................",
  ".......##.......",
  "...##.#..#.##...",
  "..#..#....#..#..",
  "..#...#..#...#..",
  "...#...##...#...",
  "..#.#......#.#..",
  ".#...#.##.#...#.",
  ".#...#.##.#...#.",
  "..#.#......#.#..",
  "...#...##...#...",
  "..#...#..#...#..",
  "..#..#....#..#..",
  "...##.#..#.##...",
  ".......##.......",
  ".......#........",
  ".......#..###...",
  "...##..#.#...#..",
  "..#..#.##...#...",
  "...#..##...#....",
  "....#..####.....",
  ".....###........",
  ".......#........",
  ".......#........",
];

export const FlowLogo: React.FC<{ cell?: number; color?: string }> = ({
  cell = 6,
  color = "#ffffff",
}) => (
  <svg
    width={16 * cell}
    height={FLOWER.length * cell}
    viewBox={`0 0 16 ${FLOWER.length}`}
    shapeRendering="crispEdges"
  >
    {FLOWER.flatMap((row, y) =>
      row
        .split("")
        .map((ch, x) =>
          ch === "#" ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
          ) : null,
        ),
    )}
  </svg>
);

// Flèche simple en SVG (pas d'emoji)
export const Arrow: React.FC<{ size: number; color: string; rotate?: number }> = ({
  size,
  color,
  rotate = 0,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ transform: `rotate(${rotate}deg)` }}
  >
    <path
      d="M4 12h15M13 6l6 6-6 6"
      stroke={color}
      strokeWidth={2.4}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
