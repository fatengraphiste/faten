import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { IsoFonts } from "./iso/fonts";
import { NAVY, YEL as RED, FONT } from "./iso/theme";
import { LOGO_PATHS } from "./logo";

const fade = "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent), linear-gradient(to bottom, transparent, #000 10%, #000 90%, transparent)";
const Crop: React.FC<{ src: string; x: number; y: number; w: number; h: number; scale: number; left: number; top: number }> = ({ src, x, y, w, h, scale, left, top }) => (
  <div style={{ position: "absolute", left, top, width: w * scale, height: h * scale, overflow: "hidden", WebkitMaskImage: fade, WebkitMaskComposite: "source-in", maskImage: fade, maskComposite: "intersect" }}>
    <Img src={staticFile(src)} style={{ position: "absolute", left: -x * scale, top: -y * scale, width: 1080 * scale, height: 1920 * scale }} />
  </div>
);
const Pill: React.FC<{ text: string; cx: number; y: number }> = ({ text, cx, y }) => (
  <div style={{ position: "absolute", left: cx - 190, top: y, width: 380, textAlign: "center", background: NAVY, color: "#fff", borderRadius: 60, padding: "14px 0", fontWeight: 800, fontSize: 50, boxShadow: "0 10px 30px rgba(25,34,109,0.25)", direction: "rtl" }}>{text}</div>
);
// Couverture 9:16 — zone utile 4:5 (y 285–1635) : tout le contenu y est contenu
export const CoverIso: React.FC = () => (
  <IsoFonts>
    <AbsoluteFill style={{ background: "#fff", fontFamily: FONT, direction: "rtl" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform="translate(540 345) scale(0.26) translate(-485 -125)">
          {LOGO_PATHS.map((p, i) => (p.rect ? <rect key={i} x={p.rect[0]} y={p.rect[1]} width={p.rect[2]} height={p.rect[3]} fill={NAVY} /> : <path key={i} d={p.d} fill={p.c === "r" ? RED : NAVY} />))}
        </g>
      </svg>
      <div style={{ position: "absolute", left: 60, right: 60, top: 420, textAlign: "center", color: NAVY, fontWeight: 800 }}>
        <div style={{ fontSize: 112, lineHeight: 1.18 }}>poutrelles ولا</div>
        <div style={{ fontSize: 112, lineHeight: 1.18 }}><span style={{ background: RED, color: "#fff", borderRadius: 22, padding: "0 26px" }}>dalle alvéolée</span> ؟</div>
        <div style={{ fontSize: 52, fontWeight: 700, marginTop: 30, opacity: 0.8 }}>شنوّا الفرق و أنهو يناسب chantier متاعك</div>
      </div>
      <Crop src="iso_13.5.png" x={100} y={400} w={740} h={730} scale={0.66} left={20} top={880} />
      <Crop src="iso_31.png" x={110} y={340} w={890} h={770} scale={0.56} left={540} top={900} />
      <div style={{ position: "absolute", left: 540 - 55, top: 1050, width: 110, height: 110, borderRadius: 55, background: RED, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 46, boxShadow: "0 10px 30px rgba(219,64,65,0.4)" }}>VS</div>
      <Pill text="حتى 9 m" cx={270} y={1400} />
      <Pill text="حتى 15 m" cx={810} y={1400} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1545, textAlign: "center", color: NAVY, fontWeight: 700, fontSize: 40, opacity: 0.75 }}>Comptoir GEP · plancher préfabriqué</div>
    </AbsoluteFill>
  </IsoFonts>
);
