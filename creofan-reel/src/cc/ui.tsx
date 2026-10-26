import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MixedText } from "../components";
import { BEIGE, FONT, INK, RED, SAFE, WHITE } from "../theme";

const WIN_SCALE = (1080 - SAFE.left - SAFE.right) / 980;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Couleurs de l'interface Claude (thème clair)
export const CL = {
  bg: "#faf9f5",
  panel: "#ffffff",
  text: "#1f1e1d",
  muted: "#73726c",
  border: "#e5e3dc",
  hover: "#ecebe6",
  orange: "#d97757",
};

// Temps absolu de la vidéo dans une Sequence qui démarre à `from`
export const useT = (from: number) => useCurrentFrame() + from;

export const usePop = () => {
  const { fps } = useVideoConfig();
  return (t: number, at: number, damping = 12) =>
    spring({ frame: t - at, fps, config: { damping } });
};

// Fond beige Creofan avec formes douces (comme la vidéo de référence)
export const BeigeBg: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, fontFamily: FONT, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: 999,
          backgroundColor: `${RED}1a`,
          top: -260,
          right: -220,
          transform: `translateY(${Math.sin(frame / 40) * 12}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 380,
          height: 380,
          borderRadius: 999,
          border: `34px solid ${RED}14`,
          bottom: -120,
          left: -140,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

export const AppIcon: React.FC<{ name: "claude" | "canva"; size: number }> = ({
  name,
  size,
}) => (
  <Img
    src={staticFile(`cc/${name}-icon.png`)}
    style={{
      width: size,
      height: size,
      filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.18))",
    }}
  />
);

// Titre mixte arabe / français qui « pop » quand il change
export const Headline: React.FC<{
  t: number;
  items: { at: number; text: string; sub?: string; subAt?: number }[];
  top?: number;
  size?: number;
  color?: string;
  latinColor?: string;
}> = ({ t, items, top = SAFE.top + 5, size = 72, color = INK, latinColor = RED }) => {
  const pop = usePop();
  const cur = [...items].reverse().find((i) => t >= i.at);
  if (!cur) return null;
  const s = pop(t, cur.at, 11);
  const subS = cur.sub ? pop(t, cur.subAt ?? cur.at + 8, 13) : 0;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: SAFE.left,
        right: SAFE.right,
        textAlign: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
          opacity: s,
        }}
      >
        <MixedText text={cur.text} size={size} color={color} latinColor={latinColor} />
      </div>
      {cur.sub ? (
        <div style={{ marginTop: 12, opacity: subS, transform: `translateY(${(1 - subS) * 20}px)` }}>
          <MixedText text={cur.sub} size={40} color={color} latinColor={latinColor} latinWeight={600} />
        </div>
      ) : null}
    </div>
  );
};

// Fenêtre d'application (coins arrondis, ombre)
export const Window: React.FC<{
  t: number;
  inAt: number;
  top?: number;
  height?: number;
  bg?: string;
  children: React.ReactNode;
}> = ({ t, inAt, top = 540, height = 1060, bg = CL.bg, children }) => {
  const pop = usePop();
  const s = pop(t, inAt, 15);
  return (
    // Conçue en 980 px de large, réduite pour tenir dans la zone de sécurité
    <div style={{ position: "absolute", top, left: SAFE.left, transform: `scale(${WIN_SCALE})`, transformOrigin: "0 0" }}>
    <div
      style={{
        position: "relative",
        width: 980,
        height,
        borderRadius: 36,
        backgroundColor: bg,
        overflow: "hidden",
        border: `2px solid ${CL.border}`,
        boxShadow: "0 30px 80px rgba(42,15,14,0.18)",
        transform: `translateY(${(1 - s) * 500}px)`,
        opacity: Math.min(1, s * 2),
        color: CL.text,
      }}
    >
      {children}
    </div>
    </div>
  );
};

// Curseur souris animé entre des points clés (coordonnées dans la fenêtre)
export type CursorKey = { t: number; x: number; y: number; click?: boolean };

export const Cursor: React.FC<{ t: number; keys: CursorKey[] }> = ({ t, keys }) => {
  if (t < keys[0].t) return null;
  let i = keys.findIndex((k) => k.t > t);
  if (i === -1) i = keys.length;
  const a = keys[Math.max(0, i - 1)];
  const b = keys[Math.min(keys.length - 1, i)];
  const p =
    a === b
      ? 1
      : interpolate(t, [a.t, b.t], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const x = a.x + (b.x - a.x) * p;
  const y = a.y + (b.y - a.y) * p;
  // Effet de clic : petit rétrécissement + onde
  const clickK = keys.find((k) => k.click && t >= k.t && t < k.t + 12);
  const press = clickK ? interpolate(t - clickK.t, [0, 4, 12], [1, 0.8, 1], clamp) : 1;
  const ring = clickK ? (t - clickK.t) / 12 : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 50, pointerEvents: "none" }}>
      {clickK ? (
        <div
          style={{
            position: "absolute",
            left: -30 * ring - 6,
            top: -30 * ring - 6,
            width: 12 + 60 * ring,
            height: 12 + 60 * ring,
            borderRadius: 999,
            border: `4px solid ${RED}`,
            opacity: 1 - ring,
          }}
        />
      ) : null}
      <svg width={46} height={46} viewBox="0 0 24 24" style={{ transform: `scale(${press})`, transformOrigin: "0 0" }}>
        <path
          d="M3 2 L3 19 L7.5 14.8 L10.5 21.5 L13.4 20.2 L10.5 13.6 L16.6 13.6 Z"
          fill="#111"
          stroke={WHITE}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export const Check: React.FC<{ size: number; color?: string; stroke?: number }> = ({
  size,
  color = WHITE,
  stroke = 3,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M5 12.5 L10 17.5 L19 7" stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Pastille « gratuit, utilisation limitée »
export const FreeChip: React.FC<{ scale: number }> = ({ scale }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 14,
      padding: "14px 30px",
      borderRadius: 999,
      backgroundColor: WHITE,
      border: `3px solid ${RED}`,
      color: INK,
      fontFamily: FONT,
      fontSize: 34,
      fontWeight: 600,
      transform: `scale(${scale})`,
      boxShadow: "0 10px 30px rgba(42,15,14,0.12)",
    }}
  >
    <span style={{ width: 16, height: 16, borderRadius: 99, backgroundColor: RED }} />
    <span style={{ fontWeight: 800, color: RED }}>Gratuit</span>· utilisation limitée
  </div>
);
