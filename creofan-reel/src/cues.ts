// Synchronisation sur la voix off (transcription mot à mot).
// La voix off démarre à 10 s dans la vidéo, en coupant les 1,3 premières
// secondes de silence du fichier : un mot dit à `s` secondes dans
// voix-off.mp3 tombe donc à (s + 8.7) secondes dans la vidéo.
export const VOICE_START = 300; // frame où commence la voix off
export const VOICE_TRIM = 39; // 1,3 s coupées au début du fichier
export const ONS_TRIM = 24; // 0,8 s coupées au début du vocal d'Ons

const vo = (s: number) => Math.round((s + 8.7) * 30);

export const CUE = {
  flowIn: VOICE_START,
  flowWord: vo(3.14), // « Flow »
  secret: vo(4.28), // « le secret… »
  promptWord: vo(5.56), // « …dans le prompt »
  dont: vo(6.24), // « ne lui dis pas juste… »
  badType: vo(7.06), // « a3mel li pub café »
  badStrike: vo(8.4),
  sujet: vo(9.26), // « sujet »
  detail: vo(11.9), // « description détaillée »
  sujetEnd: vo(14.2),
  style: vo(15.7), // « style »
  cine: vo(17.92), // « cinématique »
  hyper: vo(18.66), // « hyperréal »
  cartoon: vo(19.8), // « cartoon »
  pick: vo(20.36), // « enti chnowa t7eb »
  prise: vo(23.06), // « prise de vue »
  mouvement: vo(25.34), // « mouvement de caméra »
  send: vo(27.6),
  photoshop: vo(28.22), // « bla Photoshop »
  outils: vo(29.08), // « w bla outils okhra »
  reveal: vo(30.58), // « n9ajem nkharrej… »
  rendu: vo(32.26), // « …a3az rendu »
  cta: vo(33.1), // « kan t7eb… »
  ctaPrompt: vo(35.1), // « kelmet prompt »
  comment: vo(35.68), // « fi commentaire »
  liste: vo(37.32), // « liste »
  listStyle: vo(38.12),
  listAmbiance: vo(38.74),
  listPrise: vo(39.44),
  tayara: vo(42.5), // « prompt tayara »
};

export const TOTAL_DURATION = 1620; // 54 s
