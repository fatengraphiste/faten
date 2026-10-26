import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BEIGE, FONT, FONT_AR, RED, SAFE } from "./theme";

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

const ARABIC = /[؀-ۿ]/;

// Texte mixte : mots arabes en Salma, mots français en Poppins.
// Dès qu'il y a de l'arabe, la phrase se lit de droite à gauche.
export const MixedText: React.FC<{
  text: string;
  size: number;
  color?: string;
  latinWeight?: number;
  // Couleur des mots français (par défaut : même couleur que le reste)
  latinColor?: string;
  style?: React.CSSProperties;
}> = ({ text, size, color, latinWeight = 800, latinColor, style }) => {
  const words = text.split(" ");
  const rtl = words.some((w) => ARABIC.test(w));
  return (
    <div dir={rtl ? "rtl" : "ltr"} style={{ color, lineHeight: 1.25, ...style }}>
      {words.map((w, i) => {
        const ar = ARABIC.test(w);
        return (
          <span
            key={i}
            style={{
              fontFamily: ar ? FONT_AR : FONT,
              fontWeight: ar ? 700 : latinWeight,
              color: !ar && latinColor ? latinColor : undefined,
              // Salma est plus petite à corps égal
              fontSize: ar ? size * 1.15 : size,
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
};

// Repère visuel de la zone de sécurité (à activer dans le Studio)
export const SafeZoneGuide: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", zIndex: 999 }}>
    <div
      style={{
        position: "absolute",
        top: SAFE.top,
        bottom: SAFE.bottom,
        left: SAFE.left,
        right: SAFE.right,
        border: "4px dashed #00e0ff",
      }}
    />
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: SAFE.top, backgroundColor: "rgba(0,224,255,0.18)" }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: SAFE.bottom, backgroundColor: "rgba(0,224,255,0.18)" }} />
    <div style={{ position: "absolute", top: SAFE.top, bottom: SAFE.bottom, right: 0, width: SAFE.right, backgroundColor: "rgba(0,224,255,0.18)" }} />
  </AbsoluteFill>
);
