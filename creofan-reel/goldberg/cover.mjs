// Couverture du reel « Zero Manual Keyframes » (1080×1920), dessinée avec les fonctions de goldberg.html
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const here = path.dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || path.join(here, "out/couverture-goldberg.png");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto("file://" + path.join(here, "goldberg.html"));
await page.evaluate(() => window.ready);
await page.evaluate(() => {
  ctx.fillStyle = BEIGE; ctx.fillRect(0, 0, W, H);
  text(99, 0, "ما عملتوش أنا", 540, 400, 118, CHAR);
  text(99, 0, "ولا حتى كلمة وحدة بيدي", 540, 525, 74, RED);
  // Rampe → engrenage → bille
  rail([[150, 700], [420, 800]]);
  drawGear(560, 1040, 230, 18, 12);
  drawGear(560 - 320, 1040 + 150, 80, 7, -30);
  const a = (-125 * Math.PI) / 180, R = 230 + 30;
  const bx = 560 + R * Math.cos(a), by = 1040 + R * Math.sin(a);
  ctx.beginPath(); ctx.arc(bx, by, 30, 0, Math.PI * 2); ctx.fillStyle = CHAR; ctx.fill();
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 22, by - 8); ctx.strokeStyle = WHITE; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.stroke();
  // Tampon rouge
  const p = (-40 * Math.PI) / 180, PR = 230 + 52;
  ctx.save(); ctx.translate(560 + PR * Math.cos(p), 1040 + PR * Math.sin(p)); ctx.rotate(p + Math.PI / 2); ctx.fillStyle = RED; ctx.fillRect(-36, -10, 72, 20); ctx.restore();
  // Badge Claude
  ctx.drawImage(claude, 790, 1290, 140, 140);
  text(99, 0, "كلها خدمها Claude", 540, 1480, 86, CHAR, 700);
});
await page.screenshot({ path: out });
await browser.close();
