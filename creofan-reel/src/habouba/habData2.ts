import type { Beat } from "./habData";
// Voix de Faten : voix1 (3,63 s) + voix2 (18,68 s) mises bout à bout — plans calés sur les pauses de la voix
export const HAB2_VOICE = "habouba/voix-hab.mp3";
export const HAB2_BEATS: Beat[] = [
  { a: 0.0, b: 1.15, kind: "wait", text: "wait!!!", l: "hips", r: "wave", wiggle: true },
  { a: 1.15, b: 3.63, kind: "come", text: "اي اجا", l: "hips", r: "open" },
  { a: 3.63, b: 4.94, kind: "name", text: "حبوبة", l: "hips", r: "up" },
  { a: 4.94, b: 6.86, kind: "claude", text: "Claude", l: "hips", r: "open", icon: "claude" },
  { a: 6.86, b: 8.55, kind: "curious", text: "كيفاه؟", l: "hips", r: "open" },
  { a: 8.55, b: 11.34, kind: "secret", text: "سر", l: "hips", r: "hips", icon: "lock" },
  { a: 11.34, b: 13.97, kind: "more", text: "أكثر", l: "hips", r: "open" },
  { a: 13.97, b: 17.77, kind: "new", text: "جديد", l: "hips", r: "up", icon: "spark" },
  { a: 17.77, b: 19.3, kind: "wait2", text: "استناوني", l: "hips", r: "wave", wiggle: true, icon: "hourglass" },
  { a: 19.3, b: 22.4, kind: "cta", text: "habouba", l: "hips", r: "wave", wiggle: true, icon: "bubble" },
];
