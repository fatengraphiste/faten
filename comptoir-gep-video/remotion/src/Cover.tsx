import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { IsoFonts } from "./iso/fonts";
import { NAVY, YEL as RED, FONT } from "./iso/theme";
import { LOGO_PATHS } from "./logo";

const SH = "0 4px 28px rgba(10,14,60,0.85), 0 0 3px rgba(10,14,60,0.7)";
// Couverture Reels/Feed 9:16 — texte dans la zone centrale 4:5 (y 285–1635) pour que la grille du profil reste lisible
export const Cover: React.FC = () => (
  <IsoFonts>
    <AbsoluteFill style={{ background: NAVY, fontFamily: FONT, direction: "rtl" }}>
      <Img src={staticFile("cover_bg.jpg")} style={{ width: 1080, height: 1920, objectFit: "cover" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(25,34,109,0.55) 0%, rgba(25,34,109,0.12) 28%, rgba(25,34,109,0.25) 55%, rgba(25,34,109,0.88) 100%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform="translate(540 380) scale(0.3) translate(-485 -125)">
          {LOGO_PATHS.map((p, i) => (p.rect ? <rect key={i} x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} fill="#fff" /> : <path key={i} d={p.d} fill={p.c === "r" ? RED : "#fff"} />))}
        </g>
      </svg>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1010, textAlign: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 150, whiteSpace: "nowrap", lineHeight: 1.15, color: "#fff", textShadow: SH }}>
          إنت <span style={{ background: RED, borderRadius: 24, padding: "0 28px", boxShadow: "0 10px 34px rgba(10,14,60,0.5)" }}>مقاول</span>؟
        </div>
        <div style={{ fontWeight: 800, fontSize: 82, lineHeight: 1.3, color: "#fff", textShadow: SH, marginTop: 26 }}>وقت = فلوس</div>
        <div style={{ fontWeight: 700, fontSize: 56, color: "#fff", opacity: 0.95, textShadow: SH, marginTop: 14 }}>الداله الحاضرة تربحك الوقت</div>
      </div>
    </AbsoluteFill>
  </IsoFonts>
);
