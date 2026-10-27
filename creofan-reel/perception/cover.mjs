// Génère les images de couverture du reel (1080×1920), avec les polices et le logo de perception.html
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const here = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto("file://" + path.join(here, "perception.html"));
await page.evaluate(() => window.ready);

// A — recommandée : le piège (cercle noir + « هذا أحمر »)
await page.evaluate(() => {
  ctx.fillStyle = BEIGE; ctx.fillRect(0, 0, W, H);
  drawWord("هذا أحمر", 540, 560, 190, INK);
  ctx.beginPath(); ctx.arc(540, 1000, 290, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  drawLine("متأكد ؟", 540, 1420, 84, () => RED);
  const lw = 230, lh = (lw * logo.naturalHeight) / logo.naturalWidth;
  ctx.drawImage(logo, 540 - lw / 2, 1540 - lh / 2, lw, lh);
});
await page.screenshot({ path: path.join(here, "out/couverture-A-piege.png") });

// B — alternative : le climax (« تختلف » sur rouge)
await page.evaluate(() => {
  ctx.fillStyle = RED; ctx.fillRect(0, 0, W, H);
  drawWord("ماتحاولش تقنعهم", 540, 640, 96, INK);
  drawWord("تختلف", 540, 960, 300, BEIGE);
  drawWord("العقول", 540, 1290, 96, INK);
});
await page.screenshot({ path: path.join(here, "out/couverture-B-tekhtelef.png") });
await browser.close();
