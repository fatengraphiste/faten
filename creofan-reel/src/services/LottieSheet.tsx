import React from "react";
import { AbsoluteFill } from "remotion";
import { Lot } from "./LottieUse";
const NAMES = ["al1","al2","al3","al4","al5","al6","al7","al8"];
export const OLD = ["brand1","brand2","brand3","brand4","web1","web2","web3","web4","soc1","soc2","soc3","soc4","mo1","mo2","mo3","gr1","gr2","gr3","sp1","sp2","sp3","hr1","hr2"];
export const LottieSheet: React.FC<{ recolor: boolean }> = ({ recolor }) => (
  <AbsoluteFill style={{ backgroundColor: "#cfcfcf", display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, padding: 10 }}>
    {NAMES.map((n) => <div key={n} style={{ backgroundColor: "#fff5f5", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}><Lot name={n} size={280} recolor={recolor} /><div style={{ position: "absolute", left: 6, top: 4, fontSize: 28, fontFamily: "monospace" }}>{n}</div></div>)}
  </AbsoluteFill>
);
