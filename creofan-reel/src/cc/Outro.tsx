import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { MixedText } from "../components";
import { BEIGE, FONT, RED } from "../theme";
import { C } from "./cues";
import { usePop, useT } from "./ui";

// Fin : « sauvegarde la vidéo » + « تبعنا للأقوى »
export const Outro: React.FC = () => {
  const t = useT(C.outro);
  const pop = usePop();
  const save = pop(t, C.save, 11);
  const follow = pop(t, C.follow, 11);
  const pill = pop(t, C.follow + 10, 9);

  return (
    <AbsoluteFill style={{ backgroundColor: RED, fontFamily: FONT, alignItems: "center" }}>
      {/* Icône « enregistrer » dessinée en SVG */}
      <div style={{ marginTop: 300, transform: `scale(${save})` }}>
        <svg width={150} height={150} viewBox="0 0 24 24">
          <path
            d="M6 3 H18 Q19 3 19 4 V21 L12 16.5 L5 21 V4 Q5 3 6 3 Z"
            fill={BEIGE}
          />
        </svg>
      </div>
      <div style={{ marginTop: 30, opacity: save, textAlign: "center" }}>
        <MixedText text="سجل الـ vidéo" size={84} color={BEIGE} />
        <MixedText text="باش ترجعلها" size={52} color={BEIGE} style={{ marginTop: 6 }} />
      </div>

      <div
        style={{
          marginTop: 120,
          opacity: follow,
          transform: `translateY(${(1 - follow) * 80}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
        }}
      >
        <Img src={staticFile("logo-creofan-complet.png")} style={{ width: 560 }} />
        <MixedText text="تبعنا للأقوى" size={70} color={BEIGE} />
        <div
          style={{
            backgroundColor: BEIGE,
            color: RED,
            fontSize: 56,
            fontWeight: 800,
            padding: "14px 46px",
            borderRadius: 26,
            transform: `scale(${pill}) rotate(${interpolate(pill, [0, 1], [-10, -3])}deg)`,
          }}
        >
          Astuces IA
        </div>
      </div>
    </AbsoluteFill>
  );
};
