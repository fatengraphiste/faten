import { interpolate } from "remotion";
import { MixedText } from "../components";
import { INK, RED, SAFE, WHITE } from "../theme";
import { C } from "./cues";
import { AppIcon, BeigeBg, clamp, Headline, usePop, useT } from "./ui";

const HOOK = ["أقوى", "duo", "يعمل", "design", "في", "أسرع", "وقت"];

// 0:00 – 0:07 : accroche « أقوى duo يعمل design في أسرع وقت »
export const Hook: React.FC = () => {
  const t = useT(0);
  const pop = usePop();
  const cl = pop(t, C.claude, 10);
  const ca = pop(t, C.canva, 10);
  const line = interpolate(t, [C.canva + 4, C.canva + 18], [0, 1], clamp);
  const pulse = 1 + 0.25 * Math.sin(t / 4) * line;
  const step = (C.hookEnd - C.claude) / HOOK.length;
  const pill = pop(t, C.arba3, 9);

  return (
    <BeigeBg>
      {/* Logos réels Claude + Canva reliés */}
      <div
        style={{
          position: "absolute",
          top: 360,
          left: SAFE.left,
          right: SAFE.right,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ transform: `scale(${cl}) rotate(${interpolate(cl, [0, 1], [-30, -6])}deg)` }}>
          <AppIcon name="claude" size={270} />
        </div>
        <div style={{ width: 130, height: 10, position: "relative", margin: "0 -6px" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: 10,
              width: `${line * 100}%`,
              backgroundColor: RED,
              borderRadius: 9,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 65 - 15,
              top: -10,
              width: 30,
              height: 30,
              borderRadius: 99,
              backgroundColor: RED,
              transform: `scale(${line * pulse})`,
              boxShadow: `0 0 0 10px ${RED}33`,
            }}
          />
        </div>
        <div style={{ transform: `scale(${ca}) rotate(${interpolate(ca, [0, 1], [30, 6])}deg)` }}>
          <AppIcon name="canva" size={270} />
        </div>
      </div>

      {/* Accroche mot par mot, calée sur la voix */}
      <div dir="rtl" style={{ position: "absolute", top: 780, left: SAFE.left, right: SAFE.right, textAlign: "center" }}>
        {HOOK.map((w, i) => {
          const s = pop(t, C.claude + i * step, 11);
          const latin = /[a-z]/i.test(w);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                margin: "0 12px",
                opacity: s,
                transform: `translateY(${(1 - s) * 50}px) scale(${s})`,
              }}
            >
              <MixedText
                text={w}
                size={latin ? 100 : 96}
                color={latin ? WHITE : INK}
                style={latin ? { backgroundColor: RED, borderRadius: 24, padding: "0 26px" } : undefined}
              />
            </span>
          );
        })}
      </div>

      <Headline t={t} top={1180} size={58} items={[{ at: C.kifech, text: "كيفاش تربط Claude بـ Canva ؟" }]} />

      <div style={{ position: "absolute", top: 1300, left: SAFE.left, right: SAFE.right, textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            backgroundColor: RED,
            borderRadius: 999,
            padding: "10px 44px",
            transform: `scale(${pill}) rotate(-2deg)`,
          }}
        >
          <MixedText text="في 4 étapes" size={60} color={WHITE} />
        </div>
      </div>
    </BeigeBg>
  );
};
