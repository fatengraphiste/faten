import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

const LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATINEXT = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
const ARAB = "U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF";

export const FontLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [handle] = useState(() => delayRender("fonts"));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const defs: [string, string, string][] = [
      ["fonts/Montserrat-latin.woff2", "100 900", LATIN],
      ["fonts/Montserrat-latin-ext.woff2", "100 900", LATINEXT],
      ["fonts/ArbFONTS-Montserrat-Arabic-ExtraLight.ttf", "100 400", ARAB],
      ["fonts/ArbFONTS-Montserrat-Arabic-Bold.ttf", "500 800", ARAB],
      ["fonts/ArbFONTS-Montserrat-Arabic-Black.ttf", "801 900", ARAB],
    ];
    Promise.all(
      defs.map(async ([src, weight, unicodeRange]) => {
        const f = new FontFace("GEPF", `url(${staticFile(src)})`, { weight, unicodeRange } as FontFaceDescriptors);
        await f.load();
        (document.fonts as unknown as { add: (f: FontFace) => void }).add(f);
      })
    )
      .then(() => setOk(true))
      .catch((e) => console.error(e))
      .finally(() => continueRender(handle));
  }, [handle]);
  return <>{ok ? children : null}</>;
};
