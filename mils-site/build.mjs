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

// Three.js et la scène 3D : un seul script minifié, intégré dans la page chiffrée.
const bundle = await build({
  entryPoints: [join(root, "src/hero3d.js")], bundle: true, minify: true, write: false,
  format: "iife", globalName: "MILS3D", target: "es2019", legalComments: "none"
});
const hero = bundle.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const logo = readFileSync(join(root, "assets/logo-cca.svg"), "utf8")
  .replace(/<\?xml[^>]*>\s*/, "").replace(/<defs>[\s\S]*?<\/defs>\s*/, "")
  .replace(/class="cls-1"/g, 'fill="#0058a5"').replace(/class="cls-2"/g, 'fill="#ef791f"')
  .replace(/<svg [^>]*viewBox="([^"]+)">/, '<svg viewBox="$1" role="img" aria-label="CCA">').replace(/\s+/g, " ");
const html = readFileSync(join(root, "src/content.html"), "utf8").replace("/*__HERO3D__*/", () => hero);
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" },
  base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
);
// compressé avant chiffrement (un contenu chiffré ne se compresse plus)
const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, gzipSync(enc.encode(html), { level: 9 })));

const login = readFileSync(join(root, "src/login.html"), "utf8")
  .replace("<!--__LOGO__-->", () => logo)
  .replace("__PAYLOAD__", JSON.stringify({ s: b64(salt), i: b64(iv), d: b64(data), n: ITER }));

const out = join(root, "dist");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "index.html"), login);
if (existsSync(join(root, "assets"))) cpSync(join(root, "assets"), join(out, "assets"), {
  recursive: true, filter: (f) => !/logo-cca/.test(f) // logos déjà intégrés
});
cpSync(join(root, "src/vercel.json"), join(out, "vercel.json"));
console.log(`3D : ${(hero.length / 1024).toFixed(0)} Ko · dist/index.html : ${(login.length / 1024).toFixed(0)} Ko`);
