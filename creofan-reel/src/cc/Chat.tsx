import { Img, interpolate, staticFile } from "remotion";
import { RosaPost } from "./RosaPost";
import { INK, RED, WHITE } from "../theme";
import { C } from "./cues";
import { BeigeBg, CL, clamp, Cursor, FreeChip, Headline, usePop, useT, Window } from "./ui";

const PROMPT = "Crée-moi un post Instagram pro pour ROSA, une marque de parfum";
const TYPE_FROM = C.chat + 6;
const TYPE_TO = C.chat + 44;
const SENT = C.chat + 50;
const REPLY = C.chat + 72;
const CARD = C.chat + 84;

// Démo : on demande un design à Claude, il le crée dans Canva
export const Chat: React.FC = () => {
  const t = useT(C.chat);
  const pop = usePop();
  const typedText = PROMPT.slice(0, Math.floor(interpolate(t, [TYPE_FROM, TYPE_TO], [0, PROMPT.length], clamp)));
  const sent = t >= SENT;
  const bubble = pop(t, SENT, 13);
  const thinking = t >= SENT + 6 && t < REPLY;
  const reply = pop(t, REPLY, 14);
  const card = pop(t, CARD, 12);
  const linkGlow = interpolate(t, [C.lien, C.lien + 8], [0, 1], clamp);

  return (
    <BeigeBg>
      <Headline
        t={t}
        top={240}
        items={[
          { at: C.chat, text: "اطلب منو أي design" },
          { at: C.lien, text: "تلقاه في الـ lien" },
        ]}
      />
      <div style={{ position: "absolute", top: 400, left: 0, right: 0, textAlign: "center" }}>
        <FreeChip scale={pop(t, C.chat + 4, 12)} />
      </div>

      <Window t={t} inAt={C.chat} top={540}>
        {/* Message de l'utilisateur */}
        {sent ? (
          <div
            style={{
              position: "absolute",
              top: 40,
              right: 40,
              maxWidth: 620,
              padding: "22px 28px",
              borderRadius: 26,
              backgroundColor: "#f0eee6",
              fontSize: 30,
              transform: `scale(${bubble})`,
              transformOrigin: "right top",
            }}
          >
            {PROMPT}
          </div>
        ) : null}

        {/* Réponse de Claude */}
        {sent ? (
          <div style={{ position: "absolute", top: 200, left: 40, right: 40 }}>
            <Img
              src={staticFile("cc/claude-spark.png")}
              style={{ width: 54, height: 54, transform: `rotate(${thinking ? t * 6 : 0}deg)` }}
            />
            <div style={{ opacity: reply, fontSize: 30, marginTop: 16, fontFamily: "Georgia, 'DejaVu Serif', serif" }}>
              Voici ton design, créé directement dans Canva :
            </div>
            <div
              style={{
                marginTop: 26,
                width: 330,
                borderRadius: 24,
                overflow: "hidden",
                border: `2px solid ${CL.border}`,
                backgroundColor: WHITE,
                transform: `scale(${card})`,
                transformOrigin: "left top",
              }}
            >
              <RosaPost width={330} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 22px",
                  fontSize: 24,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  backgroundColor: linkGlow > 0 ? `rgba(247,50,42,${0.1 * linkGlow})` : WHITE,
                }}
              >
                <Img src={staticFile("cc/canva-small.png")} style={{ width: 44, height: 44, borderRadius: 10 }} />
                <span style={{ color: linkGlow > 0.5 ? RED : INK, textDecoration: linkGlow > 0.5 ? "underline" : "none" }}>
                  Ouvrir dans Canva
                </span>
                <svg width={26} height={26} viewBox="0 0 24 24" style={{ marginLeft: "auto" }}>
                  <path d="M8 16 L16 8 M9 8 H16 V15" stroke={linkGlow > 0.5 ? RED : INK} strokeWidth={2.4} fill="none" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        ) : null}

        {/* Champ de saisie */}
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            bottom: 36,
            height: 150,
            borderRadius: 28,
            border: `2px solid ${CL.border}`,
            backgroundColor: WHITE,
            padding: "26px 30px",
            fontSize: 30,
          }}
        >
          {!sent && typedText ? (
            <span>
              {typedText}
              {Math.floor(t / 10) % 2 ? "|" : ""}
            </span>
          ) : (
            <span style={{ color: CL.muted }}>Répondre…</span>
          )}
          <div
            style={{
              position: "absolute",
              right: 22,
              bottom: 20,
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: typedText && !sent ? CL.orange : "#e9c4b6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={28} height={28} viewBox="0 0 24 24">
              <path d="M12 19 V5 M6 11 L12 5 L18 11" stroke={WHITE} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <Cursor
          t={t}
          keys={[
            { t: C.chat, x: 700, y: 900 },
            { t: SENT - 10, x: 900, y: 975 },
            { t: SENT - 2, x: 900, y: 975, click: true },
            { t: C.lien - 4, x: 250, y: 800 },
            { t: C.canvaEditor - 14, x: 250, y: 800 },
            { t: C.canvaEditor - 8, x: 250, y: 800, click: true },
          ]}
        />
      </Window>
    </BeigeBg>
  );
};
