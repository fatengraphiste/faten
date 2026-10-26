import { Img, interpolate, staticFile } from "remotion";
import { MixedText } from "../components";
import { INK, RED, SAFE, WHITE } from "../theme";
import { C } from "./cues";
import { BeigeBg, CL, Check, clamp, Cursor, usePop, useT, Window } from "./ui";

const STEPS = [
  { at: C.step1, n: "01", text: "ادخل Paramètres" },
  { at: C.step2, n: "02", text: "امشي Connecteurs" },
  { at: C.step3, n: "03", text: "لوّج على Canva" },
  { at: C.step3b, n: "03", text: "كليكي Connecter" },
  { at: C.step4, n: "04", text: "اعمل Autoriser" },
];

const SIDEBAR = [
  "Facturation",
  "Utilisation",
  "Capacités",
  "Mémoire",
  "Systèmes de design",
  "Réflexion",
  "Claude Code",
  "Claude dans Chrome",
];

const CONNECTORS = [
  { id: "drive", name: "Google Drive", by: "par Google", on: true },
  { id: "gmail", name: "Gmail", by: "par Google", on: true },
  { id: "gcal", name: "Google Calendar", by: "par Google", on: false },
  { id: "canva-small", name: "Canva", by: "par Canva", on: false },
  { id: "m365", name: "Microsoft 365", by: "par Anthropic", on: false },
  { id: "notion", name: "Notion", by: "par Notion", on: false },
];

const typed = (s: string, t: number, a: number, b: number) =>
  s.slice(0, Math.floor(interpolate(t, [a, b], [0, s.length], clamp)));


// Petite icône de ligne (contour) pour la barre latérale des paramètres
const LineIcon: React.FC = () => (
  <div style={{ width: 28, height: 28, border: `3px solid ${CL.muted}`, borderRadius: 8, flexShrink: 0 }} />
);

export const ClaudeSteps: React.FC = () => {
  const t = useT(C.steps);
  const pop = usePop();

  // --- Titre de l'étape
  const cur = [...STEPS].reverse().find((s) => t >= s.at) ?? STEPS[0];
  const titleS = pop(t, cur.at, 11);
  const stepIndex = Number(cur.n) - 1;

  // --- États de l'interface
  const menuOpen = t >= C.avatarClick && t < C.parametres + 2;
  const inSettings = t >= C.parametres + 2;
  const inConnectors = t >= C.connecteurs + 2;
  const query = typed("Canva", t, C.typeCanva, C.typeCanva + 15);
  const filtered = t >= C.typeCanva + 17;
  const inDetail = t >= C.canvaCard + 2;
  const modal = t >= C.connecter + 3 && t < C.autoriser + 4;
  const isConnected = t >= C.connected;
  const modalS = pop(t, C.connecter + 3, 14);
  const doneS = pop(t, C.connected, 9);

  const click = (at: number, x: number, y: number) => [
    { t: at - 10, x, y },
    { t: at, x, y, click: true },
  ];
  const cursorKeys = [
    { t: C.steps - 30, x: 620, y: 760 },
    ...click(C.avatarClick, 44, 1000),
    ...click(C.parametres, 150, 742),
    ...click(C.connecteurs, 150, 726),
    ...click(C.searchClick, 620, 182),
    ...click(C.canvaCard, 515, 325),
    ...click(C.connecter, 495, 313),
    ...click(C.autoriser, 630, 755),
    { t: C.autoriser + 25, x: 760, y: 560 },
  ];

  return (
    <BeigeBg>
      {/* Points de progression (4 étapes) */}
      <div style={{ position: "absolute", top: SAFE.top + 8, left: SAFE.left, right: SAFE.right, display: "flex", justifyContent: "center", gap: 14 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 16,
              width: i === stepIndex ? 56 : 16,
              borderRadius: 99,
              backgroundColor: i <= stepIndex ? RED : `${RED}40`,
            }}
          />
        ))}
      </div>

      {/* Numéro + titre de l'étape */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 40,
          left: SAFE.left,
          right: SAFE.right,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          transform: `scale(${interpolate(titleS, [0, 1], [0.6, 1])})`,
          opacity: titleS,
        }}
      >
        <div
          style={{
            width: 86,
            height: 86,
            borderRadius: 99,
            backgroundColor: RED,
            color: WHITE,
            fontSize: 44,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isConnected ? <Check size={60} /> : cur.n}
        </div>
        <MixedText text={isConnected ? "Connecté !" : cur.text} size={72} color={INK} latinColor={RED} />
      </div>

      <Window t={t} inAt={C.steps}>
        {!inSettings ? (
          /* ---------- Accueil Claude ---------- */
          <>
            {/* Barre latérale gauche */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 88, borderRight: `2px solid ${CL.border}` }}>
              {[40, 110, 180].map((y) => (
                <div key={y} style={{ position: "absolute", left: 26, top: y, width: 36, height: 36, borderRadius: 10, border: `3px solid ${CL.muted}` }} />
              ))}
              <div style={{ position: "absolute", left: 18, bottom: 34, width: 52, height: 52, borderRadius: 99, backgroundColor: "#d9d6cc" }} />
            </div>

            <div style={{ position: "absolute", top: 330, left: 88, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }}>
              <Img src={staticFile("cc/claude-spark.png")} style={{ width: 72, height: 72 }} />
              <div style={{ fontFamily: "Georgia, 'DejaVu Serif', serif", fontSize: 74, color: CL.text }}>Bonjour</div>
            </div>

            <div
              style={{
                position: "absolute",
                top: 470,
                left: 140,
                right: 50,
                height: 180,
                borderRadius: 30,
                border: `2px solid ${CL.border}`,
                backgroundColor: WHITE,
                boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ position: "absolute", top: 30, left: 32, fontSize: 32, color: CL.muted }}>Tapez / pour les Skills</div>
              <svg width={36} height={36} viewBox="0 0 24 24" style={{ position: "absolute", left: 28, bottom: 26 }}>
                <path d="M12 4v16M4 12h16" stroke={CL.text} strokeWidth={2} strokeLinecap="round" />
              </svg>
              <svg width={40} height={40} viewBox="0 0 24 24" style={{ position: "absolute", right: 30, bottom: 24 }}>
                {[4, 8, 12, 16, 20].map((x, i) => (
                  <path key={x} d={`M${x} ${12 - [3, 6, 8, 5, 2][i]}v${[6, 12, 16, 10, 4][i]}`} stroke={CL.text} strokeWidth={2} strokeLinecap="round" />
                ))}
              </svg>
            </div>
            <div style={{ position: "absolute", top: 676, left: 170, fontSize: 28, color: CL.muted }}>Projet ⌄</div>
            <div style={{ position: "absolute", top: 676, right: 80, fontSize: 28, color: CL.text }}>
              Sonnet 5.5 <span style={{ color: CL.muted }}>Moyen</span>
              <span style={{ marginLeft: 36 }}>Auto</span>
            </div>

            {/* Menu du profil */}
            {menuOpen ? (
              <div
                style={{
                  position: "absolute",
                  left: 30,
                  top: 700,
                  width: 340,
                  borderRadius: 20,
                  backgroundColor: WHITE,
                  border: `2px solid ${CL.border}`,
                  boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
                  padding: "10px 0",
                  transform: `scale(${pop(t, C.avatarClick, 14)})`,
                  transformOrigin: "left bottom",
                }}
              >
                {["Paramètres", "Langue", "Obtenir de l'aide", "Se déconnecter"].map((it, i) => (
                  <div
                    key={it}
                    style={{
                      height: 60,
                      padding: "0 26px",
                      display: "flex",
                      alignItems: "center",
                      fontSize: 30,
                      backgroundColor: i === 0 && t > C.parametres - 10 ? CL.hover : "transparent",
                    }}
                  >
                    {it}
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          /* ---------- Paramètres ---------- */
          <>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 340, borderRight: `2px solid ${CL.border}` }}>
              <div style={{ position: "absolute", top: 30, left: 24, right: 24, height: 60, borderRadius: 14, border: `2px solid ${CL.border}`, backgroundColor: WHITE, display: "flex", alignItems: "center", padding: "0 20px", fontSize: 26, color: CL.muted }}>
                Rechercher
              </div>
              {SIDEBAR.map((it, i) => (
                <div key={it} style={{ position: "absolute", top: 130 + i * 60, left: 24, right: 24, height: 52, display: "flex", alignItems: "center", gap: 16, fontSize: 26, padding: "0 14px", whiteSpace: "nowrap" }}>
                  <LineIcon />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{it}</span>
                </div>
              ))}
              <div style={{ position: "absolute", top: 610, left: 38, fontSize: 22, color: CL.muted }}>Personnalisation</div>
              {["Skills", "Connecteurs", "Plugins"].map((it, i) => (
                <div
                  key={it}
                  style={{
                    position: "absolute",
                    top: 640 + i * 60,
                    left: 24,
                    right: 24,
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    fontSize: 26,
                    padding: "0 14px",
                    borderRadius: 12,
                    backgroundColor: it === "Connecteurs" && t > C.connecteurs - 8 ? CL.hover : "transparent",
                    fontWeight: it === "Connecteurs" && inConnectors ? 600 : 400,
                  }}
                >
                  <LineIcon />
                  {it}
                </div>
              ))}
            </div>

            <div style={{ position: "absolute", left: 340, top: 0, right: 0, bottom: 0, padding: 40 }}>
              {!inConnectors ? (
                <>
                  <div style={{ fontSize: 36, fontWeight: 600, marginBottom: 40 }}>Apparence</div>
                  {["Thème", "Police de la conversation", "Taille du texte", "Largeur de la conversation", "Animations"].map((r) => (
                    <div key={r} style={{ height: 96, borderBottom: `2px solid ${CL.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 26 }}>
                      {r}
                      <div style={{ width: 150, height: 46, borderRadius: 12, backgroundColor: CL.hover }} />
                    </div>
                  ))}
                </>
              ) : !inDetail ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <div style={{ fontSize: 40, fontWeight: 700 }}>Connecteurs</div>
                    <div style={{ display: "flex", padding: 5, borderRadius: 14, backgroundColor: CL.hover, fontSize: 22, whiteSpace: "nowrap" }}>
                      <div style={{ padding: "8px 16px", color: CL.muted }}>Les vôtres</div>
                      <div style={{ padding: "8px 16px", borderRadius: 10, backgroundColor: WHITE }}>Découvrir</div>
                    </div>
                  </div>
                  <div style={{ position: "absolute", top: 150, left: 40, width: 560, height: 64, borderRadius: 16, border: `2px solid ${t >= C.searchClick ? CL.text : CL.border}`, backgroundColor: WHITE, display: "flex", alignItems: "center", padding: "0 22px", fontSize: 28 }}>
                    {query ? <span>{query}</span> : <span style={{ color: CL.muted }}>Rechercher</span>}
                    {t >= C.searchClick && t < C.canvaCard && Math.floor(t / 12) % 2 === 0 ? <span>|</span> : null}
                  </div>
                  {(filtered ? CONNECTORS.filter((c) => c.id === "canva-small") : CONNECTORS).map((c, i) => {
                    const s = filtered ? pop(t, C.typeCanva + 17, 12) : 1;
                    return (
                      <div
                        key={c.id}
                        style={{
                          position: "absolute",
                          top: 250 + Math.floor(i / 2) * 170,
                          left: 40 + (i % 2) * 290,
                          width: 270,
                          height: 150,
                          borderRadius: 20,
                          border: `2px solid ${filtered && t > C.canvaCard - 8 ? CL.text : CL.border}`,
                          backgroundColor: WHITE,
                          padding: 18,
                          transform: `scale(${s})`,
                        }}
                      >
                        <Img src={staticFile(`cc/${c.id}.png`)} style={{ width: 56, height: 56, borderRadius: 12 }} />
                        <div style={{ fontSize: 24, fontWeight: 600, marginTop: 10 }}>{c.name}</div>
                        <div style={{ fontSize: 18, color: CL.muted }}>{c.by}</div>
                        <div
                          style={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            backgroundColor: c.on ? "#cfe9cf" : WHITE,
                            border: c.on ? "none" : `2px solid ${CL.border}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {c.on ? (
                            <Check size={30} color="#3d8b3d" />
                          ) : (
                            <svg width={24} height={24} viewBox="0 0 24 24">
                              <path d="M12 4v16M4 12h16" stroke={CL.text} strokeWidth={2.4} strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  <div style={{ fontSize: 26 }}>← Connecteurs</div>
                  <div style={{ position: "absolute", top: 100, left: 0, right: 0, height: 300, backgroundColor: "#f0efea" }} />
                  <Img src={staticFile("cc/canva-small.png")} style={{ position: "absolute", top: 130, left: 40, width: 110, height: 110, borderRadius: 22, border: `2px solid ${CL.border}` }} />
                  <div style={{ position: "absolute", top: 136, left: 175, fontSize: 48, fontWeight: 600 }}>Canva</div>
                  <div style={{ position: "absolute", top: 200, left: 175, right: 30, fontSize: 22, color: CL.muted, lineHeight: 1.3 }}>
                    Search, create, autofill, and export Canva designs
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: 280,
                      left: 40,
                      width: 230,
                      height: 66,
                      borderRadius: 16,
                      backgroundColor: isConnected ? "#e4e2db" : CL.text,
                      color: isConnected ? CL.text : WHITE,
                      fontSize: 28,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      transform: `scale(${isConnected ? 1 + 0.12 * Math.sin(Math.min(1, doneS) * Math.PI) : 1})`,
                    }}
                  >
                    {isConnected ? (
                      <>
                        <Check size={30} color={CL.text} /> Connecté
                      </>
                    ) : (
                      "Connecter"
                    )}
                  </div>
                  <div style={{ position: "absolute", top: 440, left: 40, right: 40, fontSize: 26, lineHeight: 1.5 }}>
                    Browse, summarize, autofill, and even generate new Canva designs directly from Claude.
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Fenêtre d'autorisation Canva */}
        {modal ? (
          <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(0,0,0,${0.35 * modalS})` }}>
            <div
              style={{
                position: "absolute",
                left: 170,
                top: 220,
                width: 640,
                height: 600,
                borderRadius: 30,
                backgroundColor: WHITE,
                transform: `scale(${modalS})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 40,
              }}
            >
              <Img src={staticFile("cc/canva-icon.png")} style={{ width: 110, height: 110 }} />
              <div style={{ fontSize: 32, fontWeight: 700, textAlign: "center", marginTop: 24, lineHeight: 1.3 }}>
                Claude souhaite accéder à votre compte Canva
              </div>
              <div style={{ alignSelf: "stretch", marginTop: 30, fontSize: 26 }}>
                {["Voir vos designs", "Créer et modifier des designs", "Exporter vos designs"].map((p) => (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 14, height: 50 }}>
                    <Check size={30} color="#8b3dff" /> {p}
                  </div>
                ))}
              </div>
              <div style={{ position: "absolute", bottom: 40, left: 40, right: 40, display: "flex", gap: 20 }}>
                <div style={{ flex: 1, height: 70, borderRadius: 14, border: `2px solid ${CL.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 600 }}>
                  Annuler
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 70,
                    borderRadius: 14,
                    backgroundColor: "#8b3dff",
                    color: WHITE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 700,
                    boxShadow: t > C.autoriser - 12 ? "0 0 0 6px #8b3dff44" : "none",
                  }}
                >
                  Autoriser
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <Cursor t={t} keys={cursorKeys} />
      </Window>
    </BeigeBg>
  );
};
