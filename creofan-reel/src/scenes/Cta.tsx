import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CUE } from "../cues";
import { MixedText, PunchIn } from "../components";
import { BEIGE, INK, RED, SAFE, WHITE } from "../theme";

const LIST = [
  { label: "Style", at: CUE.listStyle },
  { label: "Ambiance", at: CUE.listAmbiance },
  { label: "Prise de vue", at: CUE.listPrise },
];

// 0:42 – 0:54 : appel à l'action
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame + CUE.cta;
  const sp = (at: number, damping = 12) =>
    spring({ frame: t - at, fps, config: { damping } });

  const logoIn = sp(CUE.cta);
  const boxIn = sp(CUE.cta + 8, 13);
  const typedWord = "prompt".slice(
    0,
    Math.floor(interpolate(t, [CUE.ctaPrompt - 6, CUE.ctaPrompt + 12], [0, 6], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })),
  );
  const posted = t >= CUE.comment;
  const postedIn = sp(CUE.comment, 11);
  const listIn = sp(CUE.liste, 13);
  const finalIn = sp(CUE.tayara, 10);

  return (
    <PunchIn bg={RED}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: SAFE.top, paddingLeft: SAFE.left, paddingRight: SAFE.right, gap: 30 }}>
        {/* Logo Creofan complet, en beige */}
        <Img
          src={staticFile("logo-creofan-complet.png")}
          style={{
            width: 500,
            transform: `scale(${interpolate(logoIn, [0, 1], [0.7, 1])})`,
            opacity: logoIn,
          }}
        />

        <div style={{ opacity: boxIn, marginTop: 20, textAlign: "center" }}>
          <MixedText text="اكتب prompt في commentaire" size={62} color={BEIGE} />
        </div>

        {/* Champ de commentaire */}
        <div
          style={{
            width: 860,
            padding: 30,
            borderRadius: 36,
            backgroundColor: WHITE,
            transform: `translateY(${(1 - boxIn) * 200}px)`,
            opacity: boxIn,
            boxShadow: "0 30px 70px rgba(0,0,0,0.25)",
          }}
        >
          {posted ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                marginBottom: 22,
                transform: `scale(${postedIn})`,
                transformOrigin: "left center",
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 999,
                  backgroundColor: BEIGE,
                  border: `3px solid ${RED}`,
                }}
              />
              <div>
                <div style={{ fontSize: 26, color: `${INK}88`, fontWeight: 600 }}>
                  toi · à l'instant
                </div>
                <div style={{ fontSize: 46, fontWeight: 800, color: INK }}>prompt</div>
              </div>
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "18px 26px",
              borderRadius: 999,
              backgroundColor: BEIGE,
            }}
          >
            <div
              style={{
                flex: 1,
                fontSize: 38,
                fontWeight: 800,
                color: posted || !typedWord ? `${INK}55` : RED,
              }}
            >
              {posted || !typedWord
                ? "Ajoute un commentaire…"
                : typedWord + (Math.floor(t / 8) % 2 ? "|" : "")}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: RED }}>Publier</div>
          </div>
        </div>

        {/* La liste envoyée */}
        <div style={{ textAlign: "center", opacity: listIn, marginTop: 10 }}>
          <div style={{ marginBottom: 20 }}>
            <MixedText text="ونبعثلك liste فيها :" size={42} color={BEIGE} latinWeight={600} />
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            {LIST.map((l) => {
              const pop = sp(l.at, 9);
              return (
                <div
                  key={l.label}
                  style={{
                    fontSize: 38,
                    fontWeight: 800,
                    color: RED,
                    backgroundColor: BEIGE,
                    padding: "14px 30px",
                    borderRadius: 999,
                    transform: `scale(${pop})`,
                  }}
                >
                  {l.label}
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            color: RED,
            backgroundColor: BEIGE,
            padding: "14px 50px",
            borderRadius: 30,
            marginTop: 20,
            transform: `scale(${finalIn}) rotate(-3deg)`,
          }}
        >
          <MixedText text="prompt طيارة" size={76} />
        </div>
      </AbsoluteFill>
    </PunchIn>
  );
};
