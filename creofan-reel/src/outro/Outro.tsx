import { getLength, getPointAtLength } from "@remotion/paths";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BEIGE, RED } from "../theme";

// Outro Creofan — 3 s (90 images à 30 i/s), 1080×1920
// 0.0 → 1.7 s  la ligne du « f » se trace comme un stylo : o → barre → boucle haute
//              → descente → boucle basse → remontée → a (caméra serrée sur le f)
// 1.4 → 2.1 s  la caméra recule, le ventre du « a » se ferme, c-r-e et n. apparaissent
// 2.1 → 3.0 s  logo complet, tenue
export const OUTRO_DURATION = 90;

// c, r, e, n, puis « o-f-a » (la signature)
const [C_PATH, R_PATH, E_PATH, N_PATH, OFA_PATH] = [
  "m65.41,296.31c14.56,0,27.11,9.93,32.45,24.04h31.4c-6.5-30.99-32.66-54.28-63.85-54.28-36.08,0-65.41,31.15-65.41,69.39s29.33,69.35,65.41,69.35c31.19,0,57.35-23.23,63.85-54.23h-31.4c-5.34,14.06-17.89,23.99-32.45,23.99-19.4,0-35.17-17.54-35.17-39.11s15.77-39.16,35.17-39.16Z",
  "M144.83 403.21 174.8 403.21 174.8 294.57 214.6 294.57 214.6 264.21 144.83 264.21 144.83 403.21Z",
  "m283.56,266.32c-35.73,0-64.76,30.84-64.76,68.74s29.03,68.74,64.76,68.74c28.72,0,53.12-19.91,61.58-47.47h-31.4c-6.3,11.14-17.49,18.49-30.19,18.49-16.98,0-31.19-13.1-34.82-30.74h98.98c.4-2.97.61-5.95.61-9.02,0-7.41-1.11-14.56-3.17-21.22-8.42-27.57-32.86-47.52-61.58-47.52Zm-30.19,47.52c6.25-11.14,17.44-18.55,30.19-18.55s23.94,7.41,30.19,18.55h-60.37Z",
  "m832.4,258.58c-36.07,0-65.41,31.12-65.41,69.37v69.56h30.24v-69.57c0-21.58,15.78-39.14,35.17-39.14s35.17,17.56,35.17,39.14v69.32h30.24v-69.32c0-38.25-29.34-69.37-65.41-69.37Z",
  "m730.29,270.94c-30.27-26-89.3-8.42-123.92,6.16,1.31-11.92,2.59-23.79,3.87-35.68,14.63-12.21,77.59-70.03,95.27-116.88,17.76-44.13,25.69-103.18-11.75-120.53-23.83-11.19-56.76,1.92-71.94,28.59-20.57,36.19-29.84,111.04-38.7,192.62-50.41,29.67-135.59,13.74-186.04,41.36-18.99,10.4-31.17,26.62-36,47.02-6.1,23.23-2.5,47.8,13.83,66.55,11.97,14.02,29.22,22.88,48.42,22.88,57.57.09,85.96-73.75,48.19-116.23-18.45,2.03-33.04,4.36-44.27,7.97,43.39,6.61,40.45,76.53-3.93,78.01-18.09.14-32.53-15.67-34.72-33.02-1.49-7.96,1.16-20.02,2.72-26.66,7.78-18.65,25.52-26.92,52.25-31.81.06,0,.09-.02.15-.02,44.53-7.94,92.52-5.63,135.79-22.6-1.25,11.54-2.51,23.1-3.83,34.6-68.34,40.4-122.69,121.18-120.99,197.39,0,24.03,4.89,39.72,15.37,49.42,7.07,6.55,16.21,9.85,27.21,9.85,85.11-2.52,94.18-168.58,105.25-239.05,24.42-13.87,86.66-35.09,108.77-18.43,2.16,1.91,3.92,4.49,5.26,7.73h-25.33c-26.78,0-48.57,21.79-48.57,48.57s21.79,48.57,48.57,48.57c5.41,0,16.53-1.06,27.67-8.29v5.75h.65v.65s28.68,0,28.68,0v-64.65c1.81-28.02-4.06-47.6-17.94-59.85Zm-83.52-224.16c6.66-11.69,18.86-18.13,28.22-18.13,26.81,1.97,17.38,47.85,3.69,85.76-10.22,27.08-41.12,61.54-63.66,83.8,7.46-64.76,16.4-124.38,31.76-151.43Zm-94.13,389.64c-13.66,55.45-36.3,94.53-63.09,82.59-2.29-2.12-6.14-8.64-6.14-28.35,0-64.13,37.94-122.09,87.75-159.66-4.91,38.22-10.74,74.55-18.52,105.41Zm138.6-69.34c-10.11,0-18.33-8.23-18.33-18.33s8.22-18.33,18.33-18.33h27.08c-2.37,15.63-8.92,36.67-27.08,36.67Z",
];

// Ligne médiane de la signature (repère du logo 897.8 × 549.94), lissée en Catmull-Rom.
// Elle sert de masque : un trait épais qui avance dévoile le vrai tracé du logo.
const MAIN_PTS: [number, number][] = [
  [446, 292], [463, 303], [471, 335], [455, 377], [423, 389], [386, 376], [371, 332], [379, 295],
  [400, 276], [435, 267], [500, 259], [555, 251], [594, 238], [604, 190], [613, 120], [628, 52],
  [650, 22], [677, 14], [694, 30], [698, 70], [689, 115], [668, 157], [640, 190], [612, 218],
  [592, 250], [575, 298], [532, 346], [498, 392], [476, 439], [469, 491], [475, 523], [492, 537],
  [520, 528], [546, 485], [567, 425], [582, 362], [594, 318], [608, 295], [655, 285], [700, 281],
  [726, 290], [734, 310], [733, 350], [733, 398],
];
const BOWL_PTS: [number, number][] = [[722, 316], [691, 315], [665, 329], [658, 349], [667, 373], [691, 382], [720, 378]];

export const smooth = (pts: [number, number][]) => {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)},${c2[0].toFixed(1)},${c2[1].toFixed(1)},${p2[0]},${p2[1]}`;
  }
  return d;
};
const MAIN = smooth(MAIN_PTS);
const BOWL = smooth(BOWL_PTS);
const MAIN_LEN = getLength(MAIN);
const BOWL_LEN = getLength(BOWL);
// Moment où le stylo, après le tour du « o », repasse au-dessus de sa pointe
const O_DONE = getLength(smooth(MAIN_PTS.slice(0, 10))) / MAIN_LEN;

const W = 1080;
const H = 1920;
const LOGO_W = 897.8;
const LOGO_H = 549.94;
const BASE = 940 / LOGO_W; // logo final : 940 px de large
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pen = Easing.bezier(0.5, 0, 0.25, 1);
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

// Lettres qui apparaissent après le f (depuis le f vers les bords)
const LETTERS: { d: string; start: number }[] = [
  { d: E_PATH, start: 44 },
  { d: N_PATH, start: 47 },
  { d: R_PATH, start: 49 },
  { d: C_PATH, start: 52 },
];

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Tracé du stylo
  const drawP = interpolate(frame, [2, 50], [0, 1], { ...clamp, easing: pen });
  const bowlP = interpolate(frame, [42, 56], [0, 1], { ...clamp, easing: easeInOut });
  const head = getPointAtLength(MAIN, Math.max(0.01, drawP * MAIN_LEN)) ?? { x: MAIN_PTS[0][0], y: MAIN_PTS[0][1] };
  const nib = interpolate(frame, [2, 6, 46, 52], [0, 1, 1, 0], clamp);

  // Caméra : serrée sur le f, puis recul vers le logo entier
  const cam = interpolate(frame, [30, 64], [0, 1], { ...clamp, easing: easeInOut });
  const zoom = interpolate(cam, [0, 1], [1.4, 1]) * interpolate(frame, [64, 90], [1, 1.025], clamp);
  const fx = interpolate(cam, [0, 1], [585, LOGO_W / 2]);
  const fy = interpolate(cam, [0, 1], [278, LOGO_H / 2]);
  const s = BASE * zoom;

  // Point final du « n. »
  const dot = spring({ frame: frame - 58, fps, config: { damping: 9, stiffness: 200 } });

  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <mask id="penMask" maskUnits="userSpaceOnUse" x={-200} y={-200} width={1300} height={1000}>
            <path
              d={MAIN}
              fill="none"
              stroke="white"
              strokeWidth={50}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${MAIN_LEN} ${MAIN_LEN}`}
              strokeDashoffset={MAIN_LEN * (1 - drawP)}
              opacity={drawP > 0 ? 1 : 0}
            />
            <path
              d={BOWL}
              fill="none"
              stroke="white"
              strokeWidth={50}
              strokeLinecap="round"
              strokeDasharray={`${BOWL_LEN} ${BOWL_LEN}`}
              strokeDashoffset={BOWL_LEN * (1 - bowlP)}
              opacity={bowlP > 0 ? 1 : 0}
            />
            {/* Évite que la pointe du « o » dévoile la barre trop tôt */}
            {drawP < O_DONE ? <polygon points="392,240 487,240 487,285 471,285.5 427,293 392,293" fill="black" /> : null}
          </mask>
        </defs>

        <g transform={`translate(${W / 2} ${H / 2 - 30}) scale(${s}) translate(${-fx} ${-fy})`}>
          {/* La signature o-f-a, dévoilée par le stylo */}
          <path d={OFA_PATH} fill={RED} mask="url(#penMask)" />

          {/* Pointe du stylo */}
          <circle cx={head.x} cy={head.y} r={20} fill={RED} opacity={nib} />
          <circle cx={head.x} cy={head.y} r={34} fill={RED} opacity={nib * 0.18} />

          {/* Lettres c, r, e, n : montent et se posent */}
          {LETTERS.map(({ d, start }) => {
            const p = spring({ frame: frame - start, fps, config: { damping: 15, stiffness: 140 } });
            const o = interpolate(frame, [start, start + 6], [0, 1], { ...clamp, easing: easeOut });
            return <path key={start} d={d} fill={RED} opacity={o} transform={`translate(0 ${(1 - p) * 60})`} />;
          })}

          {/* Point */}
          <circle cx={832.61} cy={383.03} r={18.24 * dot} fill={RED} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
