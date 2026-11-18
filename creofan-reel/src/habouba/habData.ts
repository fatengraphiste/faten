// Données de la voix : à remplacer par la synchro réelle dès que le MP3 est disponible
// ENV : amplitude RMS (0..1) par image à 30 i/s ; BEATS : temps (s) de chaque phrase.
export const HAB_VOICE: string | null = null; // ex. "habouba/voix.mp3"
export const HAB_DURATION_S = 30;
export const HAB_ENV: number[] = [];
export type Beat = { a: number; b: number; kind: string; text: string; l: "hips" | "down" | "open" | "up" | "wave"; r: "hips" | "down" | "open" | "up" | "wave"; wiggle?: boolean };
export const HAB_BEATS: Beat[] = [
  { a: 0.0, b: 2.2, kind: "wait", text: "Wait", l: "hips", r: "wave", wiggle: true },
  { a: 2.2, b: 5.0, kind: "come", text: "اي اجا نقلك", l: "hips", r: "open" },
  { a: 5.0, b: 7.5, kind: "name", text: "انا حبوبة", l: "hips", r: "up" },
  { a: 7.5, b: 11.0, kind: "claude", text: "تصنعت في Claude", l: "hips", r: "open" },
  { a: 11.0, b: 15.5, kind: "secret", text: "سر", l: "hips", r: "hips" },
  { a: 15.5, b: 20.0, kind: "more", text: "أكثر", l: "hips", r: "open" },
  { a: 20.0, b: 25.0, kind: "next", text: "جديد", l: "hips", r: "up" },
  { a: 25.0, b: 30.0, kind: "cta", text: "habouba", l: "hips", r: "wave", wiggle: true },
];
