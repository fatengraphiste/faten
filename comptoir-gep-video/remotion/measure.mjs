import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
const BROWSER = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const PLAN = {
  s1: [2.2, 4.0, 7.9], s2: [10.6], s3: [13.0, 15.7], s4a: [20.3], s4b: [23.5, 26.9], s5: [30.2, 33.0, 35.3],
  s6: [44.2], s7: [50.6], s8: [54.0, 58.4], s9: [62.8], s10: [64.9],
};
const inputProps = { measure: true };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comp = await selectComposition({ serveUrl, id: "GepIso", inputProps, browserExecutable: BROWSER, logLevel: "error" });
for (const [k, ts] of Object.entries(PLAN)) for (const t of ts) {
  await renderStill({ composition: comp, serveUrl, inputProps, output: `out/m_${k}_${t.toFixed(1)}.png`, frame: Math.round(t * 30), browserExecutable: BROWSER, logLevel: "error", imageFormat: "png" });
}
console.log("measured");
