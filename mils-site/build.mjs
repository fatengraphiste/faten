// Build : compresse puis chiffre src/content.html (AES-GCM 256, clé PBKDF2-SHA256) dans dist/index.html.
// Usage : MILS_PASSWORD="motdepasse" node mils-site/build.mjs
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { gzipSync } from "node:zlib";

const root = dirname(fileURLToPath(import.meta.url));
const password = process.env.MILS_PASSWORD;
if (!password || password.length < 10) {
  console.error("Définir MILS_PASSWORD (10 caractères minimum).");
  process.exit(1);
}

const ITER = 310000;
const enc = new TextEncoder();
const b64 = (u8) => Buffer.from(u8).toString("base64");
const read = (p) => readFileSync(join(root, p), "utf8");

// Three.js et la scène 3D : un seul script minifié, intégré dans la page chiffrée.
const bundle = await build({
  entryPoints: [join(root, "src/scene3d.js")], bundle: true, minify: true, write: false,
  format: "iife", globalName: "MILS3D", target: "es2019", legalComments: "none"
});
const scene3d = bundle.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

// Logos intégrés en ligne (SVG) ou en data URI (MILS, fourni en image).
const inlineSvg = (file, label, fills) => {
  let s = read(file).replace(/<\?xml[^>]*>\s*/, "").replace(/<defs>[\s\S]*?<\/defs>\s*/, "");
  for (const [cls, color] of Object.entries(fills)) s = s.replace(new RegExp(`class="${cls}"`, "g"), `fill="${color}"`);
  return s.replace(/<svg [^>]*viewBox="([^"]+)">/, `<svg viewBox="$1" role="img" aria-label="${label}">`).replace(/\s+/g, " ");
};
const ccaLogo = inlineSvg("assets/logo-cca.svg", "CCA", { "cls-1": "#0058a5", "cls-2": "#ef791f" });
const sfLogo = inlineSvg("assets/logo-salesfactory-white.svg", "CCA Salesfactory", { "cls-1": "#ffffff", "cls-2": "#ee781e" });
const milsLogo = "data:image/webp;base64," + readFileSync(join(root, "assets/logo-mils.webp")).toString("base64");

const html = read("src/content.html")
  .replace("/*__SCENE3D__*/", () => scene3d)
  .replaceAll("<!--__CCA_LOGO__-->", () => ccaLogo)
  .replace("<!--__SF_LOGO__-->", () => sfLogo)
  .replace("__MILS_LOGO__", () => milsLogo);

const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" },
  base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
);
// compressé avant chiffrement (un contenu chiffré ne se compresse plus)
const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, gzipSync(enc.encode(html), { level: 9 })));

const login = read("src/login.html")
  .replace("<!--__LOGO__-->", () => ccaLogo)
  .replace("<!--__SF_LOGO__-->", () => sfLogo)
  .replace("__PAYLOAD__", JSON.stringify({ s: b64(salt), i: b64(iv), d: b64(data), n: ITER }));

const out = join(root, "dist");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "index.html"), login);
// seules les captures de preuve sont servies à part ; les logos sont déjà intégrés
if (existsSync(join(root, "assets"))) cpSync(join(root, "assets"), join(out, "assets"), {
  recursive: true, filter: (f) => !/assets\/logo-(cca|mils|salesfactory)/.test(f)
});
cpSync(join(root, "src/vercel.json"), join(out, "vercel.json"));
cpSync(join(root, "src/track.php"), join(out, "track.php"));
console.log(`3D : ${(scene3d.length / 1024).toFixed(0)} Ko · dist/index.html : ${(login.length / 1024).toFixed(0)} Ko`);
