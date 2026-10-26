import { interpolate } from "remotion";
import { INK, RED, SAFE } from "../theme";
import { C } from "./cues";
import { AppIcon, BeigeBg, Check, FreeChip, Headline, usePop, useT } from "./ui";

// « ça y est » : Claude est relié à Canva
export const Connected: React.FC = () => {
  const t = useT(C.caYest);
  const pop = usePop();
  const s = pop(t, C.caYest, 12);
  const check = pop(t, C.caYest + 6, 8);
  const chip = pop(t, C.gratuit, 10);

  return (
    <BeigeBg>
      <div
        style={{
          position: "absolute",
          top: 420,
          left: SAFE.left,
          right: SAFE.right,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 0,
          transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`,
        }}
      >
        <AppIcon name="claude" size={240} />
        <div
          style={{
            width: 130,
            height: 130,
            margin: "0 -20px",
            zIndex: 2,
            borderRadius: 99,
            backgroundColor: RED,
            border: "8px solid #fff5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${check})`,
          }}
        >
          <Check size={80} stroke={3.2} />
        </div>
        <AppIcon name="canva" size={240} />
      </div>

      <Headline
        t={t}
        top={800}
        size={110}
        color={INK}
        items={[{ at: C.caYest, text: "ça y est !", sub: "Claude مربوط بـ Canva", subAt: C.caYest + 10 }]}
      />

      <div style={{ position: "absolute", top: 1150, left: SAFE.left, right: SAFE.right, textAlign: "center" }}>
        <FreeChip scale={chip} />
      </div>
    </BeigeBg>
  );
};
