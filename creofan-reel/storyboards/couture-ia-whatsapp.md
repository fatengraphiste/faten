# Storyboard — « Studio بملاين ؟ » (Reel pub Creofan, 25 s, 9:16)

Vidéo sans voix-off pour vendre mes vidéos promotionnelles aux marques de vêtements / e-commerce.

## Bible technique (charte Creofan appliquée)

| Élément | Valeur |
|---|---|
| Format | 1080 × 1920, 30 fps, 25 s = **750 frames** |
| Grille rythmique | 120 BPM → 1 temps = 0,5 s = **15 frames**. Toutes les coupes tombent sur un temps. |
| Zone de sécurité | `SAFE = { top: 250, bottom: 450, left: 70, right: 150 }` : aucun texte ni bouton hors de cette zone |
| Couleurs | Rouge Creofan `#f7322a` (accent, mots-clés) · Beige `#fff5f5` (fonds graphiques) · Encre `#2a0f0e` (texte sur clair) · Blanc `#ffffff` (texte sur image) · Vert WhatsApp `#25D366` **uniquement** sur le bouton final |
| Typo écran | **Salma Arabic Bold** (`FONT_AR`) pour tout le texte arabe, ×1,15 par rapport au corps latin · Poppins 800 pour les chiffres du numéro |
| Easing signature | `Easing.bezier(0.7, 0, 0.2, 1)` (« snap ») pour les entrées de texte · `spring({ damping: 11, stiffness: 160 })` (« pop ») pour les icônes et chips |
| Étalonnage partie 1 | Noir profond, contraste haut, rouge Creofan comme seule couleur saturée (vêtement hero rouge) |
| Règle IA | **Aucun texte n'est généré par l'IA.** Toutes les images sont générées *sans texte* (`--no text`), le texte arabe est posé dans Remotion avec `MixedText`. |
| Numéro | Toujours isolé en LTR (`<span dir="ltr">` ou `⁦+216 51 097 272⁩`) pour éviter que le « + » et les blocs de chiffres s'inversent dans la phrase RTL |

> Note texte : la ligne 2 contient « IA » et « Motion » en lettres latines (repris tel quel de ton brief). Variante 100 % arabe si tu veux respecter la règle à la lettre : « مخدومة في بلاصتي... بالـ AI » → « مخدومة في بلاصتي... بالذكاء الاصطناعي وموشن يطير طيران. »

---

## Storyboard seconde par seconde

| Plan | Timing (s / frames) | Texte écran (arabe) | Action visuelle | Sound Design & SFX |
|---|---|---|---|---|
| **P1** Macro soie | 0,0 – 1,5 · f0–45 | Mot à mot sur les temps, tiers haut de la zone de sécurité, blanc : f15 « فيبالك » → f30 « هذي » | Macro extrême d'un satin rouge Creofan qui ondule en ralenti dans le noir. Une lumière rasante (strip-light) glisse sur les plis. Mouvement dès la frame 0 (zoom 1,08 → 1,00 en 4 frames, easing snap). | Musique « défilé » : deep-house minimaliste 120 BPM, kick feutré, nappe de cordes. Démarre **sans fade-in** à f0. `swish.wav` très bas sur l'ondulation. |
| **P2** Texture | 1,5 – 3,0 · f45–90 | f45 « تصوّرت » → f60 « في ستوديو » | Coupe sur le temps. Macro sur la trame d'un lin / laine bouclée : fils en relief, poussière de lumière en suspension, mise au point qui roule le long d'une couture. | Le kick continue. Petit `tick.wav` à chaque apparition de mot (−18 dB). |
| **P3** Silhouette | 3,0 – 4,5 · f90–135 | f75 « بملاين ؟ » : « بملاين » en **rouge Creofan**, punch d'échelle 1,25 → 1 (pop). Phrase complète tenue. | Mannequin de dos qui avance vers un fond noir, manteau long rouge qui flotte au ralenti, contre-jour (rim light) qui découpe la silhouette, sol miroir. | Entrée d'un hi-hat ouvert = la montée. `sub.wav` sur le mot « بملاين ». |
| **P4** Détail luxe | 4,5 – 6,0 · f135–180 | Phrase tenue (respiration légère scale 1 → 1,02) | Gros plan sur une main qui ajuste un col / un bouton doré, tissu qui se tend, profondeur de champ très courte, reflets spéculaires. | Cordes plus présentes. `glass.wav` discret sur le reflet du bouton. |
| **P5** Hero shot | 6,0 – 7,0 · f180–210 | La phrase sort à f200 (glissement vers le haut + flou, 8 frames) | Plan pied du mannequin face caméra, pose finale. Flash studio à f195 (frame blanche 2 frames), image figée à f200. | `shutter.wav` sur le flash. À **f207 la musique coupe net** : tape-stop de 3 frames puis **silence total** jusqu'à f210. |
| **P6** Le Reveal | 7,0 – 9,0 · f210–270 | f240 apparition de la ligne 1 : « مخدومة في بلاصتي... » (blanc, ombre portée douce) | **Transition glitch** f210–216 : RGB split + déchirures horizontales sur l'image figée. Puis **travelling arrière** : l'image hero rétrécit, devient l'écran d'un moniteur 32″ dans un bureau de designer sombre, lumière d'écran sur le visage hors champ, clavier rétro-éclairé rouge. | `glitch.wav` f210. `noise.wav` court. Puis room-tone de bureau + **bip d'interface** `click.wav` à f240. Nouveau beat (trap-house léger, 120 BPM, plus moderne) **drop à f240**. |
| **P7** Le workflow | 9,0 – 11,5 · f270–345 | f285 suite de la ligne : « بـ IA وMotion » (« IA » et « Motion » en rouge, Poppins 800) | Over-the-shoulder sur l'écran : panneau de génération IA qui sort des variations d'image, puis timeline de motion design avec keyframes qui défilent. Insert sur des mains qui tapent un prompt et cliquent « Render ». | `typing.wav` sur la frappe. `click.wav` sur « Render ». `tick.wav` en rafale (keyframes). |
| **P8** Avant / Après | 11,5 – 15,0 · f345–450 | f360 fin de ligne : « يطير طيران. » + émoji-style ✈︎ dessiné en trait rouge qui traverse l'écran. Ligne complète tenue jusqu'à f440. | Split vertical : à droite une photo smartphone plate du même manteau sur cintre (mur blanc, lumière moche) ; un **wipe rouge** balaie de droite à gauche (sens de lecture arabe) et la transforme en plan cinématique du P3. 2 aller-retours (f375, f405) puis plein écran sur le « après ». | `riser.wav` de f345 à f375, `swish.wav` sur chaque wipe, `snap.wav` à l'arrivée plein écran. |
| **P9** Offre — chip 1 | 15,0 – 16,5 · f450–495 | « خدمة سريعة، » | Bascule sur **fond beige** `#fff5f5`. Chip rouge arrondie qui pop depuis le centre, icône chronomètre qui fait un tour complet en 15 frames. En fond, en flou, la vidéo hero tourne dans un mockup de téléphone. | `pop.wav` sur la chip. `ticktock.wav` sur le chronomètre. Beat continu. |
| **P10** Offre — chip 2 | 16,5 – 18,0 · f495–540 | « كواليتي عالمية، » | 2ᵉ chip qui s'empile sous la 1ʳᵉ (pop). Icône globe / étoile. Le mockup téléphone scrolle un feed de Reels de la marque, cœurs qui jaillissent. | `pop.wav` + `heart.wav` sur les cœurs. |
| **P11** Offre — chip 3 | 18,0 – 20,0 · f540–600 | « وبسوم مدروس لمشروعك. » (« مدروس » souligné en rouge, trait animé de droite à gauche) | 3ᵉ chip. Petite étiquette de prix stylisée (sans montant) qui se balance. À f585 les 3 chips se compressent vers le haut (snap). | `pop.wav`, `bell.wav` léger sur l'étiquette. `swish.wav` sur la compression. |
| **P12** Question CTA | 20,0 – 22,5 · f600–675 | « تحب فيديو هكّا لمجموعتك الجديدة ؟ » (gros, centré, « مجموعتك الجديدة » en rouge) | Retour sur le plan hero rouge, **flouté et assombri à 40 %**, léger push-in continu. Le texte entre mot par mot sur les temps (droite → gauche). | Le beat se réduit (filtre passe-bas qui se ferme). `chord.wav` à f600. |
| **P13** Écran final WhatsApp | 22,5 – 25,0 · f675–750 | « كلّمني على الواتساب : » + numéro en LTR isolé « +216 51 097 272 » (Poppins 800, très gros) | Fond beige. Icône WhatsApp **verte** qui pop au centre (spring), puis bouton pilule vert avec le numéro qui se déplie à partir de l'icône. **Pulse** du bouton toutes les 15 frames (scale 1 → 1,05). Une bulle de notification « 1 » rouge apparaît sur l'icône à f705. Logo Creofan en bas de la zone de sécurité. Doigt / curseur qui tape le bouton à f720 (ripple). | `whoosh.wav` à f675. `pop.wav` icône. **Notification type messagerie** (`ding.wav`) à f705. `click.wav` au tap f720. Le beat s'arrête net sur le dernier temps f735, 0,5 s de queue de réverb. |

---

## Prompts de génération par plan

Paramètres communs Midjourney (v7) : `--ar 9:16 --style raw --s 150 --no text, watermark, logo, letters`
Flux (1.1 Pro / Kontext) : retirer les paramètres `--`, résolution **1080 × 1920** (ou 768 × 1344 puis upscale), guidance 3–3,5, ajouter « no text, no watermark » à la fin du prompt.
Kling (2.x) : mode **Pro**, durée 5 s, ratio 9:16, *creativity/relevance* 0,5 sauf mention. Runway (Gen-3 Alpha / Gen-4) : 5 s, image en *first frame*. Ensuite je retime à 50 % en optical flow si besoin de ralenti supplémentaire, et je ne garde que la fenêtre utile.

Negative prompt Kling commun : `text, letters, watermark, logo, distorted hands, extra fingers, warped fabric, flicker, jitter, morphing face, low quality, cartoon`

### P1 — Macro soie rouge
**Image (MJ / Flux)**
```
Extreme macro shot of crimson red silk satin fabric rippling in slow motion, color #f7322a, liquid folds catching a single hard strip light raking from the left, deep black background, specular highlights sliding along the folds, visible micro weave, luxury fashion campaign, shot on Phase One with 120mm macro lens, high contrast, cinematic, ultra detailed --ar 9:16 --style raw --s 150 --no text, watermark, logo, letters
```
**Mouvement**
- Kling : `Slow-motion silk ripples flowing from left to right like liquid, light sweeping across the folds, fabric gently lifting in an invisible breeze. Camera: slow dolly-in macro, very subtle. Smooth, elegant, no cuts.`
- Runway : `Macro slow dolly in: crimson silk satin ripples in slow motion like liquid, a strip of light glides across the folds, deep black background, cinematic luxury commercial.`

### P2 — Texture du tissu
**Image**
```
Extreme close-up of luxurious bouclé wool and raw linen weave, individual threads in sharp relief, raking golden-white side light, floating dust particles in the light beam, shallow depth of field with focus on a fine stitched seam, dark moody studio, haute couture atelier aesthetic, 100mm macro, cinematic texture study --ar 9:16 --style raw --s 150 --no text, watermark, logo, letters
```
**Mouvement**
- Kling : `Camera: slow lateral truck right along the seam with a rack focus following the stitches. Dust particles drift slowly through the light beam. Fabric fibers subtly shift.`
- Runway : `Slow truck right along a stitched seam, rack focus following the threads, dust floating in a raking light beam, macro fabric texture, premium fashion commercial.`

### P3 — Silhouette au manteau rouge
**Image**
```
Full-length rear view of a tall elegant model walking away into a pitch-black studio, wearing a long flowing crimson red wool coat (#f7322a), strong rim light outlining the silhouette, glossy black mirror floor reflecting the coat, light haze, minimal set, high-end fashion campaign, shot on ARRI Alexa 35mm anamorphic, cinematic, dramatic contrast --ar 9:16 --style raw --s 150 --no text, watermark, logo, letters
```
**Mouvement**
- Kling : `The model walks slowly forward away from camera, the long red coat billows and flows behind her in slow motion, haze drifting. Camera: slow tracking follow from behind at low height, steady. Natural walking, no face visible.`
- Runway : `Low tracking shot following from behind: a model in a long crimson coat walks in slow motion on a mirror floor, coat billowing, rim light, haze, luxury fashion film.`

### P4 — Détail luxe (main, col, bouton)
**Image**
```
Close-up of an elegant hand with natural manicure adjusting the lapel of a tailored crimson red coat, polished gold button in focus with specular reflection, fabric tension visible, very shallow depth of field, soft key light with hard edge light, black background, luxury tailoring detail, 85mm f1.4, cinematic fashion editorial --ar 9:16 --style raw --s 150 --no text, watermark, logo, letters
```
**Mouvement**
- Kling : `The hand slowly smooths and adjusts the coat lapel, fabric tightens, light glints across the gold button. Camera: slow push-in. Hand anatomy stays natural.` (relevance 0,6 pour limiter les déformations de doigts)
- Runway : `Slow push in: a hand gently adjusts the lapel of a crimson coat, a glint of light runs across the gold button, shallow depth of field, luxury detail shot.`

### P5 — Hero shot face caméra
**Image** (sert aussi de *first frame* pour P6 et de fond pour P12)
```
Full-length front view of a confident fashion model striking a final pose in a long crimson red tailored coat (#f7322a), minimal black seamless studio, large softbox key light and strong rim light, mirror floor reflection, editorial high fashion campaign, symmetrical composition centered in the frame, empty space above the head, shot on medium format, cinematic, magazine cover quality --ar 9:16 --style raw --s 150 --no text, watermark, logo, letters
```
**Mouvement**
- Kling : `The model settles into her final pose with a subtle head turn toward the camera, coat hem sways and settles. Camera: static, locked off. Slight studio haze.`
- Runway : `Locked-off camera: a fashion model in a crimson coat settles into a final pose, coat hem sways then stops, studio haze, editorial fashion film.`
- Le flash et le freeze sont faits au montage (Remotion), pas par l'IA.

### P6 — Le Reveal (travelling arrière vers l'écran)
**Image de fin (end frame)**
```
Dark modern motion designer workspace at night, a large 32-inch monitor on a desk displays a full-screen fashion photo of a model in a crimson red coat in a black studio, red backlit mechanical keyboard, graphics tablet, warm desk lamp off, the monitor light illuminates the desk, a designer's shoulder and hands slightly out of focus in the foreground, cinematic, moody, realistic --ar 9:16 --style raw --s 150 --no text, watermark, logo, letters
```
**Mouvement**
- Kling (mode **Start & End frame**) : start = image P5, end = image ci-dessus. `Camera: continuous smooth dolly out pulling back through the image, revealing that it is displayed on a computer monitor in a dark designer workspace. One continuous move, no cut.` (relevance 0,7)
- Runway (Gen-3 Alpha Turbo, *first + last keyframe*) : `Smooth continuous pull back: the fashion image recedes and is revealed to be on a computer monitor in a dark motion designer studio, monitor glow lights the desk.`
- Le glitch f210–216 est ajouté au montage par-dessus le début du travelling.

### P7 — Le workflow à l'écran
**Image**
```
Over-the-shoulder shot of a designer working on a large monitor, the screen shows a motion design software interface with a timeline of colorful keyframes and an AI image generation panel with a grid of fashion images of a crimson coat, hands on a backlit keyboard and a graphics tablet, dark room lit by the screen, red accent lights, realistic professional creative studio, cinematic shallow depth of field --ar 9:16 --style raw --s 150 --no text, watermark, logo, letters
```
**Mouvement**
- Kling : `The designer's hands type quickly then click with the pen; on screen the timeline playhead moves and keyframes scroll, thumbnails of images appear one after another. Camera: slow push-in over the shoulder.`
- Runway : `Slow push in over the shoulder: hands type and click, the playhead runs across a motion design timeline, new images pop into an AI generation grid, monitor glow.`
- Conseil : l'interface lisible sera remplacée en compositing par une vraie capture de mon écran (After Effects / Remotion / outil IA), l'IA rendant les UI illisibles.

### P8 — Avant / Après
**Image « avant »**
```
Amateur smartphone photo of a long crimson red wool coat hanging on a plain plastic hanger against a white wall, flat harsh overhead lighting, slight shadow, wrinkled fabric, unedited, ordinary e-commerce product photo, realistic --ar 9:16 --style raw --s 50 --no text, watermark, logo, letters
```
**Image « après »** = l'image P3 (ou un recadrage de P5).
**Mouvement**
- « Avant » : pas de génération vidéo, image fixe avec léger zoom numérique (1 → 1,03) pour garder le contraste « plat vs vivant ».
- « Après » : réutiliser le clip Kling de P3.
- Le wipe rouge et le split sont faits dans Remotion (masque `clipPath` animé de droite à gauche, couleur `#f7322a`).

### P9 → P11 — Offre (motion design pur)
Tout est fait dans Remotion (chips, icônes, soulignement). Seul l'écran du mockup téléphone a besoin d'une génération :
**Image (fond du feed)**
```
Vertical social media fashion video frame, model in a crimson red coat walking on a city street at golden hour, editorial lookbook style, vibrant but elegant, shallow depth of field, cinematic --ar 9:16 --style raw --s 150 --no text, watermark, logo, letters, user interface
```
**Mouvement**
- Kling : `The model walks toward camera confidently, coat swinging with each step, golden hour light flickers through the trees. Camera: slow backward tracking, handheld feel.`
- Runway : `Backward tracking shot: a model in a crimson coat walks toward camera on a golden-hour street, coat swinging, lookbook fashion video.`
- Le mockup du téléphone, le scroll et les cœurs : Remotion (pas d'IA).

### P12 — Fond de la question CTA
Réutiliser le clip P5 (hero). Dans Remotion : `filter: blur(18px) brightness(0.6)`, push-in 1 → 1,06 sur 75 frames. Pas de nouvelle génération.

### P13 — Écran final WhatsApp
100 % motion design Remotion (pas d'IA) : fond beige `#fff5f5`, icône WhatsApp en SVG vert `#25D366`, bouton pilule, pulse, badge de notification rouge Creofan, logo `logo-creofan-complet.png`.
Option texture de fond (très subtile, opacité 8 %) :
```
Seamless macro texture of soft blush pink silk fabric, very subtle folds, even soft lighting, minimal, pale tones close to #fff5f5, clean luxury background --ar 9:16 --style raw --s 100 --no text, watermark, logo, letters
```
- Kling : `Very subtle slow fabric undulation, almost still. Camera: static.`

---

## Mixage audio (récap)

| Piste | Contenu | Niveau |
|---|---|---|
| Musique A | Deep-house « défilé » 120 BPM, f0 → f207, coupe en tape-stop | −10 LUFS court terme, sans fade-in |
| Silence | f207 → f210 | rien (c'est le choc) |
| Musique B | Trap-house légère 120 BPM, drop f240 → f735, passe-bas f600–675, stop sec f735 | −11 LUFS |
| SFX interface | `click`, `typing`, `tick`, `glitch`, `noise` (`public/cc`, `public/regard`) | −16 à −20 dB sous la musique |
| SFX offre | `pop`, `heart`, `ticktock`, `bell`, `swish`, `snap` | −14 dB |
| SFX CTA | `whoosh` f675, `pop`, `ding` (notification) f705, `click` f720 | notification à −8 dB : c'est le son qui doit rester en tête |
| Master | Loudness intégrée −14 LUFS, true peak −1 dBTP (norme Reels / TikTok) | — |

## Cues Remotion (à coller dans un `cues.ts`)

```ts
export const COUTURE = {
  hookW1: 15, hookW2: 30, hookW3: 45, hookW4: 60, hookW5: 75, // mots du hook
  flash: 195, freeze: 200, musicCut: 207, glitch: 210,
  revealLine: 240, drop: 240, iaMotion: 285, tayer: 360,
  wipe1: 375, wipe2: 405, offer1: 450, offer2: 495, offer3: 540, compress: 585,
  question: 600, endCard: 675, notif: 705, tap: 720, beatStop: 735,
  duration: 750,
};
```
