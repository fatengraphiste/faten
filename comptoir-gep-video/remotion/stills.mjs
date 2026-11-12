import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
const BROWSER = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const times = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comp = await selectComposition({ serveUrl, id: process.env.COMP || "GepTech", browserExecutable: BROWSER, logLevel: "error" });
for (const t of times) {
  const frame = Math.round(t * 30);
  await renderStill({ composition: comp, serveUrl, output: `out/${process.env.COMP||"x"}_${t.toFixed(2)}.png`, frame, browserExecutable: BROWSER, logLevel: "error", imageFormat: "png" });
  console.log("still", t);
}
