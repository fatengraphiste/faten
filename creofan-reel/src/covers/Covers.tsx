import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Img, random, staticFile } from "remotion";
import { MixedText } from "../components";
import { INK, RED, WHITE } from "../theme";

// Couvertures 1080×1920 : contenu important dans le recadrage 4:5 de la grille (y 285 → 1635)
for (const w of ["700", "900"]) {
  loadFont({ family: "KufiCover", url: staticFile(`fonts/noto-kufi-arabic-arabic-${w}-normal.woff2`), weight: w });
}
const KUFI = "KufiCover, sans-serif";
const GREY = "#8a7f7e";

// « Regard » : la grille « ذكاء » avec le mot caché « ديزاين » révélé
export const CoverRegard: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: INK, alignItems: "center" }}>
    <div style={{ position: "absolute", top: 330, left: 70, right: 70, textAlign: "center" }}>
      <MixedText text="عينيك ليك ولا للـ IA ؟" size={84} color={WHITE} latinColor={RED} />
    </div>
    <div style={{ position: "absolute", top: 520, left: 90, width: 900, height: 760 }}>
      {Array.from({ length: 8 }).map((_, r) =>
        Array.from({ length: 6 }).map((__, c) => {
          const hidden = r === 4 && c === 2;
          return (
            <div key={`${r}-${c}`} style={{ position: "absolute", left: c * 150, top: r * 95, width: 150, textAlign: "center", opacity: hidden ? 1 : 0.25 + random(`o${r}${c}`) * 0.3 }}>
              <MixedText text={hidden ? "ديزاين" : "ذكاء"} size={hidden ? 74 : 44} color={hidden ? RED : GREY} style={hidden ? { display: "inline-block", transform: "scale(1.5)" } : undefined} />
            </div>
          );
        }),
      )}
    </div>
    <div style={{ position: "absolute", top: 1380, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ display: "inline-block", backgroundColor: RED, borderRadius: 999, padding: "6px 56px" }}>
        <MixedText text="لقيتها في 2 ثواني ؟" size={64} color={WHITE} />
      </div>
    </div>
    <Img src={staticFile("logo-creofan-complet.png")} style={{ position: "absolute", top: 1520, width: 220 }} />
  </AbsoluteFill>
);

// « الروح » : les cercles qui fusionnent en un point rouge, sur charbon
export const CoverAme: React.FC = () => {
  const C = { x: 540, y: 1090 };
  return (
    <AbsoluteFill style={{ backgroundColor: "#1c1412" }}>
      <div dir="rtl" style={{ position: "absolute", top: 340, left: 70, right: 70, textAlign: "center", fontFamily: KUFI, fontWeight: 900, lineHeight: 1.3 }}>
        <div style={{ fontSize: 104, color: "transparent", WebkitTextStroke: "3px #f6eee4" }}>مش الـ إي آي</div>
        <div style={{ fontSize: 104, color: "#f6eee4" }}>
          اللي خلّاك <span style={{ color: RED }}>تحسّ</span>
        </div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[300, 250, 205, 165, 130].map((r, i) => (
          <circle key={r} cx={C.x} cy={C.y} r={r} fill="none" stroke={i % 2 ? "#d4a857" : "#f6eee4"} strokeWidth={i === 0 ? 3 : 2} opacity={0.35 + i * 0.12} />
        ))}
        <circle cx={C.x + 205} cy={C.y - 165} r={44} fill="#d4a857" />
        <circle cx={C.x - 230} cy={C.y + 120} r={30} fill="#f6eee4" />
        <circle cx={C.x} cy={C.y} r={92} fill={RED} />
      </svg>
      <div style={{ position: "absolute", top: 1470, left: 0, right: 0, textAlign: "center", fontFamily: KUFI, fontWeight: 900, fontSize: 64, color: "#d4a857" }}>
        الديزاينر هو الروح
      </div>
    </AbsoluteFill>
  );
};

// « Fait par Claude » : l'accroche + le tampon + le logo Claude
export const CoverFait: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: RED, alignItems: "center" }}>
    <div style={{ position: "absolute", top: 360, left: 70, right: 70, textAlign: "center" }}>
      <MixedText text="الـ vidéo هذي" size={130} color={"#fff5f5"} />
    </div>
    <div style={{ position: "absolute", top: 560, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ display: "inline-block", backgroundColor: "#fff5f5", borderRadius: 30, padding: "6px 50px", transform: "rotate(-6deg)" }}>
        <MixedText text="ما عملتهاش أنا" size={104} color={RED} />
      </div>
    </div>
    <Img src={staticFile("cc/claude-icon.png")} style={{ position: "absolute", top: 830, width: 330, height: 330, filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.25))" }} />
    <div style={{ position: "absolute", top: 1230, left: 70, right: 70, textAlign: "center" }}>
      <MixedText text="كلها خدمها Claude" size={84} color={"#fff5f5"} latinColor={INK} />
    </div>
    <Img src={staticFile("logo-creofan-complet.png")} style={{ position: "absolute", top: 1440, width: 260 }} />
  </AbsoluteFill>
);

// « Google Flow » : l'accroche, le rendu café, le secret du prompt
export const CoverFlow: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: RED, alignItems: "center" }}>
    <div style={{ position: "absolute", top: 330, left: 70, right: 70, textAlign: "center" }}>
      <MixedText text="ما عندكش وقت" size={78} color={"#fff5f5"} />
      <MixedText text="تتعلم الـ design ؟" size={78} color={"#fff5f5"} latinColor={INK} />
    </div>
    <div style={{ position: "absolute", top: 610, width: 560, height: 560, borderRadius: 40, overflow: "hidden", border: "10px solid #fff5f5", transform: "rotate(-3deg)", boxShadow: "0 30px 70px rgba(0,0,0,0.3)" }}>
      <Img src={staticFile("resultat-flow.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <Img src={staticFile("flow-logo.png")} style={{ position: "absolute", top: 22, left: 22, width: 90, height: 90, borderRadius: 22 }} />
    </div>
    <div style={{ position: "absolute", top: 1235, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ display: "inline-block", backgroundColor: "#fff5f5", borderRadius: 30, padding: "4px 46px", transform: "rotate(-2deg)" }}>
        <MixedText text="السر في الـ prompt" size={88} color={INK} latinColor={RED} />
      </div>
    </div>
    <Img src={staticFile("logo-creofan-complet.png")} style={{ position: "absolute", top: 1440, width: 240 }} />
  </AbsoluteFill>
);

// « Claude × Canva » : les deux logos reliés, la question, le post ROSA
export const CoverClaudeCanva: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#fff5f5", alignItems: "center" }}>
    <div style={{ position: "absolute", top: 330, display: "flex", alignItems: "center" }}>
      <Img src={staticFile("cc/claude-icon.png")} style={{ width: 230, height: 230, transform: "rotate(-6deg)" }} />
      <div style={{ width: 110, height: 10, backgroundColor: RED, borderRadius: 9, position: "relative" }}>
        <div style={{ position: "absolute", left: 40, top: -10, width: 30, height: 30, borderRadius: 99, backgroundColor: RED }} />
      </div>
      <Img src={staticFile("cc/canva-icon.png")} style={{ width: 230, height: 230, transform: "rotate(6deg)" }} />
    </div>
    <div style={{ position: "absolute", top: 640, left: 70, right: 70, textAlign: "center" }}>
      <MixedText text="كيفاش تربط Claude بـ Canva ؟" size={64} color={INK} latinColor={RED} />
    </div>
    <div style={{ position: "absolute", top: 790, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ display: "inline-block", backgroundColor: RED, borderRadius: 999, padding: "4px 44px" }}>
        <MixedText text="في 4 étapes" size={62} color={"#fff5f5"} />
      </div>
    </div>
    <div style={{ position: "absolute", top: 960, width: 520, height: 520, borderRadius: 36, overflow: "hidden", boxShadow: "0 30px 70px rgba(42,15,14,0.2)", transform: "rotate(2deg)" }}>
      <Img src={staticFile("cc/rosa-photo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 60%" }} />
      <div style={{ position: "absolute", left: 30, top: 30, fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 88, color: "#7a1328", letterSpacing: 4 }}>ROSA</div>
    </div>
  </AbsoluteFill>
);

// « Parfum » : le flacon rouge plein cadre et l'accroche sur deux lignes
export const CoverParfum: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: INK, alignItems: "center" }}>
    <Img src={staticFile("parfum/cover-bg.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(42,15,14,0.92) 0%, rgba(42,15,14,0.7) 32%, rgba(42,15,14,0) 48%)" }} />
    <div style={{ position: "absolute", top: 330, left: 70, right: 70, textAlign: "center" }}>
      <MixedText text="فيبالك هذا" size={120} color={"#fff5f5"} />
      <MixedText text="تصوير ستوديو ؟" size={120} color={"#fff5f5"} />
    </div>
  </AbsoluteFill>
);
