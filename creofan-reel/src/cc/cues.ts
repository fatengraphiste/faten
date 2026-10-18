// Synchronisation sur la voix off « Claude × Canva ».
// Les 1,9 premières secondes du fichier (silence + clic) sont coupées :
// un mot dit à `s` secondes dans voix-off.mp3 tombe à (s − 1,9) s dans la vidéo.
export const VOICE_TRIM = 57;
const v = (s: number) => Math.round((s - 1.9) * 30);

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

export const CC_DURATION = 1010; // ≈ 33,7 s
