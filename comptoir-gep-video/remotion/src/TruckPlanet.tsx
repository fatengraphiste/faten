import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { FontLoader } from "./fonts";

// Rejoue l'animation SMIL du SVG image par image (rendu MP4 déterministe)
export const TruckPlanet: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null); const [h] = useState(() => delayRender("svg"));
  useEffect(() => { fetch(staticFile("camion-planete-gep.svg")).then((r) => r.text()).then(setSvg).finally(() => continueRender(h)); }, [h]);
  useLayoutEffect(() => {
    const s = ref.current?.querySelector("svg") as SVGSVGElement | null; if (!s) return;
    s.pauseAnimations(); s.setCurrentTime(f / 30 + 0.001);
  });
  return (
    <FontLoader>
      <AbsoluteFill style={{ background: "#fff" }}>{svg && <div ref={ref} dangerouslySetInnerHTML={{ __html: svg }} />}</AbsoluteFill>
    </FontLoader>
  );
};
