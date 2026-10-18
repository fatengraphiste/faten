// Synchronisation sur la voix off « Claude × Canva ».
// Les silences de la voix ont été raccourcis à 0,14 s : SPEECH liste les
// passages parlés du fichier d'origine (en secondes), et `v` convertit un
// instant de l'enregistrement d'origine en frame de la vidéo finale.
const SPEECH: [number, number][] = [
  [2.0755, 5.4321],
  [5.8703, 7.4969],
  [7.739, 8.9425],
  [9.2413, 10.7377],
  [11.0503, 12.0172],
  [12.3561, 13.363],
  [13.6866, 16.8204],
  [17.0146, 23.5979],
  [24.7927, 26.7072],
  [27.0236, 30.1851],
  [30.3807, 32.589],
  [32.7706, 33.7566],
];
const GAP = 0.14;
const LEAD = 0.04;

const toEdited = (s: number) => {
  let start = LEAD; // instant de début du passage courant dans le fichier coupé
  for (let i = 0; i < SPEECH.length; i++) {
    const [a, b] = SPEECH[i];
    if (s < a) return start - Math.min(a - s, i === 0 ? LEAD : GAP);
    if (s <= b) return start + (s - a);
    const next = SPEECH[i + 1];
    if (!next) return start + (b - a) + (s - b);
    const gap = Math.min(GAP, next[0] - b);
    if (s < next[0]) return start + (b - a) + Math.min(s - b, gap);
    start += b - a + gap;
  }
  return start;
};

export const VOICE_TRIM = 0;
const v = (s: number) => Math.round(Math.max(0, toEdited(s)) * 30);

export const C = {
  // Accroche
  claude: v(2.1),
  canva: v(2.6),
  hookEnd: v(5.43),
  kifech: v(5.9),
  arba3: v(8.1),
  // Étapes dans Claude
  steps: v(9.1),
  step1: v(9.3),
  avatarClick: v(9.6),
  parametres: v(10.0),
  step2: v(11.05),
  connecteurs: v(11.5),
  step3: v(12.36),
  searchClick: v(12.2),
  typeCanva: v(12.4),
  canvaCard: v(13.5),
  step3b: v(13.69),
  connecter: v(14.9),
  step4: v(15.3),
  autoriser: v(16.3),
  connected: v(16.55),
  // Résultat
  caYest: v(17.6),
  gratuit: v(18.6),
  chat: v(19.3),
  lien: v(23.1),
  canvaEditor: v(24.6),
  modification: v(28.6),
  outro: v(30.3),
  save: v(30.4),
  follow: v(32.8),
};

export const CC_DURATION = v(33.7566) + 50; // fin de la voix + 1,7 s
