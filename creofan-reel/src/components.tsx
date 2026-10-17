import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BEIGE, FONT, INK, RED, WHITE } from "./theme";

export const Logo: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 110,
  style,
}) => (
  <Img
    src={staticFile("logo-creofan.png")}
    style={{ width: size, height: size, ...style }}
  />
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

export type Caption = {
  from: number;
  to: number;
  text: string;
  // Mots mis en valeur (couleur d'accent)
  highlight?: string[];
};

// Sous-titres animés, mot par mot, mots-clés en rouge
export const Captions: React.FC<{
  captions: Caption[];
  onRed?: boolean;
  bottom?: number;
}> = ({ captions, onRed = true, bottom = 330 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const current = captions.find((c) => frame >= c.from && frame < c.to);
  if (!current) return null;

  const local = frame - current.from;
  const pop = spring({ frame: local, fps, config: { damping: 14 } });
  const words = current.text.split(" ");
  const span = current.to - current.from;
  const perWord = Math.max(2, Math.min(5, (span * 0.6) / words.length));

  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-end", alignItems: "center", bottom }}
    >
      <div
        style={{
          maxWidth: 900,
          padding: "22px 34px",
          borderRadius: 28,
          backgroundColor: onRed ? WHITE : RED,
          transform: `scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
          opacity: pop,
          textAlign: "center",
          fontSize: 50,
          lineHeight: 1.25,
          fontWeight: 800,
          boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
        }}
      >
        {words.map((w, i) => {
          const clean = w.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
          const isKey = current.highlight?.some(
            (h) => h.toLowerCase() === clean,
          );
          const visible = local >= i * perWord;
          return (
            <span
              key={i}
              style={{
                color: isKey ? (onRed ? RED : BEIGE) : onRed ? INK : WHITE,
                opacity: visible ? 1 : 0.15,
                textDecoration: isKey ? "underline" : undefined,
                textDecorationThickness: 5,
                textUnderlineOffset: 8,
              }}
            >
              {w}{" "}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Petit badge en haut de chaque scène
export const TopLabel: React.FC<{ text: string; dark?: boolean }> = ({
  text,
  dark,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 4, fps, config: { damping: 16 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 250,
        left: 70,
        right: 70,
        textAlign: "center",
        fontSize: 54,
        fontWeight: 800,
        lineHeight: 1.2,
        color: dark ? RED : BEIGE,
        transform: `translateY(${(1 - s) * -40}px)`,
        opacity: s,
      }}
    >
      {text}
    </div>
  );
};

// Fond rouge permanent du logo en haut à gauche
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
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    }}
  >
    <Logo size={96} />
  </div>
);
