// Rendu headless de goldberg.html → MP4 60 i/s (flou de mouvement par 3 sous-images)
// Usage : node render.mjs [--audit] [--out sortie.mp4]
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const audit = args.includes("--audit");
const out = args.includes("--out") ? args[args.indexOf("--out") + 1] : path.join(here, "out/goldberg.mp4");

const FPS = 60, SUB = 3;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto("file://" + path.join(here, "goldberg.html"));
await page.evaluate(() => window.ready);
const DURATION = await page.evaluate(() => window.DURATION);

if (audit) {
  // Images clés : temps structurels 4, 8, 9, 12, 16 (1 temps structurel = 2 battements)
  const keys = { "t00": 0, "t02": 2.2, "t04": 4.0, "t05": 5.8, "t06": 6.8, "t08": 8.4, "t10": 10.3, "t11": 11.3, "t12": 12.5, "t13": 13.6, "t14": 14.05, "t15": 14.98 };
  for (const [name, b] of Object.entries(keys)) {
    await page.evaluate((t) => window.seek(t), b);
    await page.screenshot({ path: path.join(here, `out/audit-${name}.png`) });
  }
  await browser.close();
  process.exit(0);
}

// 1. Audio : synthèse Web Audio hors ligne → WAV
const wav = await page.evaluate(() => window.renderAudioWav());
const wavPath = path.join(here, "out/goldberg.wav");
writeFileSync(wavPath, Buffer.from(wav, "base64"));

// 2. Images : 3 sous-images par image (−1/3, 0, +1/3 d'image), mélangées par tmix
const frames = Math.round(DURATION * FPS);
const ff = spawn("ffmpeg", [
  "-y", "-loglevel", "error",
  "-f", "image2pipe", "-framerate", String(FPS * SUB), "-c:v", "mjpeg", "-i", "-",
  "-i", wavPath,
  "-vf", `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/(${FPS}*TB)`,
  "-r", String(FPS),
  "-c:v", "libx264", "-preset", "slow", "-b:v", "16M", "-minrate", "16M", "-maxrate", "16M", "-bufsize", "16M", "-x264-params", "nal-hrd=cbr",
  "-pix_fmt", "yuv420p", "-profile:v", "high",
  "-c:a", "aac", "-b:a", "320k",
  "-movflags", "+faststart", "-shortest", out,
], { stdio: ["pipe", "inherit", "inherit"] });

const t0 = Date.now();
for (let f = 0; f < frames; f++) {
  for (let s = 0; s < SUB; s++) {
    const t = (f + (s - (SUB - 1) / 2) / SUB) / FPS;
    await page.evaluate((tt) => window.seek(tt), t);
    const jpg = await page.screenshot({ type: "jpeg", quality: 95 });
    if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once("drain", r));
  }
  if (f % 120 === 0) console.log(`image ${f}/${frames} — ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
await browser.close();
console.log("OK →", out);
