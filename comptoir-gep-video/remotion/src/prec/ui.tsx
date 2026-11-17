import React from "react";
import { FONT } from "../lib";
import { COL, Cam, clamp, eo, project, ko } from "./kit";

const NAVY = COL.navy, RED = COL.red;
const SH = "0 2px 10px rgba(255,255,255,0.9)";

// pastille d'étiquette reliée à un point 3D (suit la caméra)
export const Label: React.FC<{ cam: Cam; at: [number, number, number]; text: string; t: number; t0: number; t1?: number; side?: "l" | "r"; dx?: number; dy?: number; tone?: "navy" | "red"; sub?: string }> = ({ cam, at, text, t, t0, t1 = 99, side = "r", dx = 90, dy = -70, tone = "navy", sub }) => {
  const a = ko(t, t0, t0 + 0.45) * (1 - clamp((t - (t1 - 0.3)) / 0.3));
  if (a <= 0.01) return null;
  const [ax, ay] = project(cam, at);
  const c = tone === "red" ? RED : NAVY;
  const px = ax + (side === "r" ? dx : -dx), py = ay + dy;
  const W = 1080;
  const pillStyle: React.CSSProperties = { position: "absolute", top: py, transform: `translate(${side === "r" ? "0" : "-100%"}, -50%) scale(${0.85 + 0.15 * a})`, transformOrigin: side === "r" ? "left center" : "right center", background: "#fff", border: `3px solid ${c}`, borderRadius: 40, padding: "10px 24px", fontFamily: FONT, fontWeight: 700, fontSize: 32, color: c, whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(25,34,109,0.14)", direction: "rtl", lineHeight: 1.15, textAlign: "center" };
  const pw = text.length * 17 + 70;
  const left = side === "r" ? Math.min(W - 70 - pw, Math.max(70, px)) : Math.min(W - 70, Math.max(70 + pw, px));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a, pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={ax} y1={ay} x2={left} y2={py} stroke={c} strokeWidth={3} strokeLinecap="round" strokeDasharray="1 1" pathLength={1} />
        <circle cx={ax} cy={ay} r={9} fill={c} stroke="#fff" strokeWidth={3} />
      </svg>
      <div style={{ ...pillStyle, left }}>{text}{sub && <div style={{ fontSize: 24, fontWeight: 500, opacity: 0.8 }}>{sub}</div>}</div>
    </div>
  );
};

// chip d'étape discret sous le logo
export const StepChip: React.FC<{ n: number; total: number; ar: string; t: number; t0?: number }> = ({ n, total, ar, t, t0 = 0.3 }) => {
  const a = ko(t, t0, t0 + 0.5);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 352, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * -14}px)`, fontFamily: FONT, direction: "rtl" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.88)", border: `2px solid ${NAVY}22`, borderRadius: 40, padding: "8px 24px", color: NAVY, fontWeight: 700, fontSize: 28 }}>
        <span style={{ background: NAVY, color: "#fff", borderRadius: 20, padding: "2px 14px", fontSize: 24, direction: "ltr" }}>{n}/{total}</span>
        <span>{ar}</span>
      </div>
    </div>
  );
};

// gros titre mot par mot
export const BigTitle: React.FC<{ lines: { text: string; red?: boolean; size?: number }[]; t: number; t0: number; t1?: number; top: number; kicker?: string; align?: "center" | "right"; ltr?: boolean }> = ({ lines, t, t0, t1 = 99, top, kicker, align = "center", ltr }) => {
  const out = clamp((t - (t1 - 0.35)) / 0.35);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, textAlign: align, fontFamily: FONT, color: NAVY, opacity: 1 - out, transform: `translateY(${out * -20}px)` }}>
      {kicker && <div style={{ fontSize: 34, fontWeight: 700, color: RED, letterSpacing: 4, marginBottom: 10, opacity: ko(t, t0, t0 + 0.4), direction: "rtl" }}>{kicker}</div>}
      {lines.map((l, i) => {
        const p = ko(t, t0 + 0.12 * i, t0 + 0.12 * i + 0.6);
        return (
          <div key={i} style={{ overflow: "hidden", lineHeight: 1.12 }}>
            <div style={{ fontSize: l.size || 104, fontWeight: 800, color: l.red ? RED : NAVY, transform: `translateY(${(1 - p) * 110}%)`, direction: ltr ? "ltr" : "rtl", textShadow: SH }}>{l.text}</div>
          </div>
        );
      })}
    </div>
  );
};

export const Badge: React.FC<{ text: string; t: number; t0: number; cx?: number; y: number }> = ({ text, t, t0, cx = 540, y }) => {
  const p = ko(t, t0, t0 + 0.6);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: cx - 300, width: 600, top: y, display: "flex", justifyContent: "center", transform: `scale(${0.6 + 0.4 * p})`, opacity: p, fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: NAVY, color: "#fff", borderRadius: 60, padding: "16px 36px", fontWeight: 800, fontSize: 44, boxShadow: "0 12px 32px rgba(25,34,109,0.3)", direction: "rtl" }}>
        <span style={{ display: "inline-flex", width: 52, height: 52, borderRadius: 26, background: "#fff", alignItems: "center", justifyContent: "center" }}>
          <svg width="30" height="30" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={RED} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <span>{text}</span>
      </div>
    </div>
  );
};

// flèche 2D animée (overlay)
export const Arrow2D: React.FC<{ x1: number; y1: number; x2: number; y2: number; t: number; t0: number; color?: string; w?: number }> = ({ x1, y1, x2, y2, t, t0, color = RED, w = 10 }) => {
  const p = eo(clamp((t - t0) / 0.6));
  if (p <= 0) return null;
  const ex = x1 + (x2 - x1) * p, ey = y1 + (y2 - y1) * p;
  const ang = Math.atan2(y2 - y1, x2 - x1); const h = 34;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${ex} ${ey} l ${-h * Math.cos(ang - 0.45)} ${-h * Math.sin(ang - 0.45)} M${ex} ${ey} l ${-h * Math.cos(ang + 0.45)} ${-h * Math.sin(ang + 0.45)}`} stroke={color} strokeWidth={w} strokeLinecap="round" fill="none" />
    </svg>
  );
};
