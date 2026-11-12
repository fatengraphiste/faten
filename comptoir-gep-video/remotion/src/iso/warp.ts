import OLD from "../captions.json";
import NEW from "../captions_new.json";
type W = { s: number };
const flat = (c: unknown) => (c as { words: W[] }[]).flatMap((x) => x.words.map((w) => w.s));
const os = flat(OLD), ns = flat(NEW);
export const OLD_END = 67.5004;
export const NEW_END = 67.631;
// knots : real (new voice) time -> design (old voice) time
const K: [number, number][] = [[0, 0]];
for (let i = 0; i < os.length; i++) { const prev = K[K.length - 1]; if (ns[i] > prev[0] + 0.02 && os[i] > prev[1] + 0.02) K.push([ns[i], os[i]]); }
K.push([NEW_END, OLD_END]);
const interp = (x: number, a: number, b: number) => {
  const lo = a === 0 ? 0 : 1, hi = 1 - lo;
  if (x <= K[0][a]) return K[0][b] + (x - K[0][a]);
  for (let i = 1; i < K.length; i++) if (x <= K[i][a]) { const f = (x - K[i - 1][a]) / (K[i][a] - K[i - 1][a]); return K[i - 1][b] + f * (K[i][b] - K[i - 1][b]); }
  void lo; void hi;
  return K[K.length - 1][b] + (x - K[K.length - 1][a]);
};
export const warp = (tReal: number) => interp(tReal, 0, 1);   // real -> design
export const unwarp = (tDesign: number) => interp(tDesign, 1, 0); // design -> real
