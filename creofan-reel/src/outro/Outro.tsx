import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BEIGE, RED, WHITE } from "../theme";

// Outro Creofan — 3 s (90 images à 30 i/s), 1080×1920
// 0.0 s  fond beige, un point rouge apparaît puis envahit l'écran
// 0.3 s  l'icône blanche tourne et se dessine (révélation circulaire)
// 1.3 s  l'icône s'efface, le logo complet se révèle en cercle
// 2.0 s  ligne blanche sous le logo, puis tenue jusqu'à 3 s
export const OUTRO_DURATION = 90;

const ICON_PATH =
  "m763.46,369.45c-.83-.65-1.7-1.27-2.55-1.91-49.92-37.27-135.18-42.06-229.1-12.66-33.81,10.59-77.42,30.25-120.51,56.57,1.82-16.1,3.56-32.28,5.28-48.34.21-1.9.41-3.81.62-5.71,17.74-14.89,84.47-76.32,103.98-128.02,37.11-98.31,2.45-127.08-14.18-134.89-27.2-12.77-64.72,2.02-81.93,32.3-22.74,39.98-32.5,118.43-42.52,210.72-83.51,58.33-250.77,145.04-318.23,113.65-5.78-2.69-21.9-10.19-27.73-39.26-.14-4.18-.24-8.37-.24-12.58,0-7.29.24-14.52.67-21.71C48.29,187.54,206.47,36.35,399.33,36.35c180.35,0,330.37,132.21,358.3,304.8,6.53,3.73,12.69,7.83,18.4,12.34,8.54,6.73,15.83,14.17,21.91,22.16C785.64,166.44,611.57,0,399.33,0S10.5,168.85.47,380.18c-.3,6.35-.47,12.73-.47,19.16,0,.42.01.83.02,1.25.02,5.67.16,11.32.42,16.93,7.08,37.63,27.64,56.25,45.66,65.45.94.48,1.87.94,2.79,1.37,82.8,38.53,243.66-45.29,328.56-99.54-1.94,17.83-3.95,35.67-6.09,53.23-69.85,50.64-129.09,117.82-129.09,190.16,0,16.99,1.83,41.27,17.63,55.88,8.23,7.61,18.8,11.45,31.47,11.45,1.72,0,3.48-.07,5.28-.21,53.29-4.2,75.79-69.37,88.07-118.03,8.88-35.17,15.42-75.97,20.92-118.67,51.14-34.86,103.74-58.37,137.09-68.81,98.9-30.97,167.17-15.97,198.08,8.39,8.17,6.44,17.37,16.43,20.35,30.01-.86,10.87-2.21,21.6-4.01,32.17-29.11,171.19-178.47,301.95-357.82,301.95-162.43,0-300.28-107.25-346.47-254.65-4.36-1.42-8.55-3.05-12.55-4.91-13.42-6.24-23.97-14.45-32.29-23.63,37.08,182.09,198.44,319.53,391.32,319.53s363.75-145.72,394.26-335.84c1.07-6.68,1.98-13.4,2.71-20.19.63-5.78,1.12-11.6,1.5-17.45-3.26-21.18-15.05-40.54-34.35-55.75Zm-306.59-224.57c6.7-11.78,19.27-18.47,28.54-18.47,2.25,0,4.31.39,6.04,1.21,16.95,7.96,9.55,51.64-4.5,88.86-10.26,27.18-39.87,61.27-63.57,85.26,7.94-67.5,17.51-128.77,33.48-156.86Zm-107.61,423.44c-10.12,40.1-27.96,88.35-55.48,90.52-4.45.35-7.5-.2-9.05-1.63-1.77-1.63-5.88-7.73-5.88-29.02,0-53.99,44.39-103.83,85.54-138.43-4.25,28.24-9.16,54.88-15.13,78.55Z";

const WORDMARK_PATHS = [
  "m65.41,296.31c14.56,0,27.11,9.93,32.45,24.04h31.4c-6.5-30.99-32.66-54.28-63.85-54.28-36.08,0-65.41,31.15-65.41,69.39s29.33,69.35,65.41,69.35c31.19,0,57.35-23.23,63.85-54.23h-31.4c-5.34,14.06-17.89,23.99-32.45,23.99-19.4,0-35.17-17.54-35.17-39.11s15.77-39.16,35.17-39.16Z",
  "M144.83 403.21 174.8 403.21 174.8 294.57 214.6 294.57 214.6 264.21 144.83 264.21 144.83 403.21Z",
  "m283.56,266.32c-35.73,0-64.76,30.84-64.76,68.74s29.03,68.74,64.76,68.74c28.72,0,53.12-19.91,61.58-47.47h-31.4c-6.3,11.14-17.49,18.49-30.19,18.49-16.98,0-31.19-13.1-34.82-30.74h98.98c.4-2.97.61-5.95.61-9.02,0-7.41-1.11-14.56-3.17-21.22-8.42-27.57-32.86-47.52-61.58-47.52Zm-30.19,47.52c6.25-11.14,17.44-18.55,30.19-18.55s23.94,7.41,30.19,18.55h-60.37Z",
  "m832.4,258.58c-36.07,0-65.41,31.12-65.41,69.37v69.56h30.24v-69.57c0-21.58,15.78-39.14,35.17-39.14s35.17,17.56,35.17,39.14v69.32h30.24v-69.32c0-38.25-29.34-69.37-65.41-69.37Z",
  "m730.29,270.94c-30.27-26-89.3-8.42-123.92,6.16,1.31-11.92,2.59-23.79,3.87-35.68,14.63-12.21,77.59-70.03,95.27-116.88,17.76-44.13,25.69-103.18-11.75-120.53-23.83-11.19-56.76,1.92-71.94,28.59-20.57,36.19-29.84,111.04-38.7,192.62-50.41,29.67-135.59,13.74-186.04,41.36-18.99,10.4-31.17,26.62-36,47.02-6.1,23.23-2.5,47.8,13.83,66.55,11.97,14.02,29.22,22.88,48.42,22.88,57.57.09,85.96-73.75,48.19-116.23-18.45,2.03-33.04,4.36-44.27,7.97,43.39,6.61,40.45,76.53-3.93,78.01-18.09.14-32.53-15.67-34.72-33.02-1.49-7.96,1.16-20.02,2.72-26.66,7.78-18.65,25.52-26.92,52.25-31.81.06,0,.09-.02.15-.02,44.53-7.94,92.52-5.63,135.79-22.6-1.25,11.54-2.51,23.1-3.83,34.6-68.34,40.4-122.69,121.18-120.99,197.39,0,24.03,4.89,39.72,15.37,49.42,7.07,6.55,16.21,9.85,27.21,9.85,85.11-2.52,94.18-168.58,105.25-239.05,24.42-13.87,86.66-35.09,108.77-18.43,2.16,1.91,3.92,4.49,5.26,7.73h-25.33c-26.78,0-48.57,21.79-48.57,48.57s21.79,48.57,48.57,48.57c5.41,0,16.53-1.06,27.67-8.29v5.75h.65v.65s28.68,0,28.68,0v-64.65c1.81-28.02-4.06-47.6-17.94-59.85Zm-83.52-224.16c6.66-11.69,18.86-18.13,28.22-18.13,26.81,1.97,17.38,47.85,3.69,85.76-10.22,27.08-41.12,61.54-63.66,83.8,7.46-64.76,16.4-124.38,31.76-151.43Zm-94.13,389.64c-13.66,55.45-36.3,94.53-63.09,82.59-2.29-2.12-6.14-8.64-6.14-28.35,0-64.13,37.94-122.09,87.75-159.66-4.91,38.22-10.74,74.55-18.52,105.41Zm138.6-69.34c-10.11,0-18.33-8.23-18.33-18.33s8.22-18.33,18.33-18.33h27.08c-2.37,15.63-8.92,36.67-27.08,36.67Z",
];

const W = 1080;
const H = 1920;
const CX = W / 2;
const CY = H / 2;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Point rouge → plein écran
  const dot = spring({ frame, fps, config: { damping: 14, stiffness: 180 }, durationInFrames: 8 });
  const flood = interpolate(frame, [6, 20], [0, 1], { ...clamp, easing: easeInOut });
  const diag = Math.hypot(CX, CY);
  const redR = 26 * dot + flood * (diag - 26);

  // Anneaux beige qui se propagent derrière le point
  const ring = (start: number) => {
    const p = interpolate(frame, [start, start + 26], [0, 1], { ...clamp, easing: easeOut });
    return { r: 40 + p * 520, o: (1 - p) * 0.55 };
  };

  // 2. Icône blanche : rotation + échelle + révélation circulaire
  const iconIn = spring({ frame: frame - 10, fps, config: { damping: 13, stiffness: 120 } });
  const iconReveal = interpolate(frame, [10, 30], [0, 1], { ...clamp, easing: easeOut });
  const iconOut = interpolate(frame, [38, 50], [0, 1], { ...clamp, easing: easeInOut });
  const iconSize = 420;
  const iconScale = (0.4 + 0.6 * iconIn) * (1 - 0.35 * iconOut);
  const iconRot = (1 - iconIn) * -120;

  // 3. Logo complet : révélation circulaire depuis le centre + léger zoom
  const logoP = interpolate(frame, [40, 62], [0, 1], { ...clamp, easing: easeOut });
  const logoW = 820;
  const logoH = (logoW * 549.94) / 897.8;
  const logoScale = 1.12 - 0.12 * logoP + 0.02 * interpolate(frame, [62, 90], [0, 1], clamp);

  // 4. Ligne blanche sous le logo
  const line = interpolate(frame, [56, 72], [0, 1], { ...clamp, easing: easeOut });

  return (
    <AbsoluteFill style={{ backgroundColor: BEIGE, overflow: "hidden" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {[0, 5].map((s) => {
          const r = ring(s);
          return <circle key={s} cx={CX} cy={CY} r={r.r} fill="none" stroke={RED} strokeWidth={6} opacity={r.o} />;
        })}
        <circle cx={CX} cy={CY} r={redR} fill={RED} />
      </svg>

      {/* Icône */}
      <svg
        viewBox="0 0 797.94 798.67"
        width={iconSize}
        height={iconSize}
        style={{
          position: "absolute",
          left: CX - iconSize / 2,
          top: CY - iconSize / 2,
          transform: `scale(${iconScale}) rotate(${iconRot}deg)`,
          opacity: (frame >= 10 ? 1 : 0) * (1 - iconOut),
        }}
      >
        <defs>
          <clipPath id="iconReveal">
            <circle cx={399} cy={399} r={iconReveal * 570} />
          </clipPath>
        </defs>
        <path d={ICON_PATH} fill={WHITE} clipPath="url(#iconReveal)" />
      </svg>

      {/* Logo complet */}
      <svg
        viewBox="0 0 897.8 549.94"
        width={logoW}
        height={logoH}
        style={{
          position: "absolute",
          left: CX - logoW / 2,
          top: CY - logoH / 2 - 40,
          transform: `scale(${logoScale})`,
          opacity: logoP > 0 ? 1 : 0,
        }}
      >
        <defs>
          <clipPath id="logoReveal">
            <circle cx={620} cy={330} r={logoP * 720} />
          </clipPath>
        </defs>
        <g fill={WHITE} clipPath="url(#logoReveal)">
          {WORDMARK_PATHS.map((d) => (
            <path key={d.slice(0, 12)} d={d} />
          ))}
          <circle cx={832.61} cy={383.03} r={18.24} />
        </g>
      </svg>

      {/* Ligne */}
      <div
        style={{
          position: "absolute",
          top: CY + logoH / 2 + 10,
          left: CX - 160 * line,
          width: 320 * line,
          height: 8,
          borderRadius: 4,
          backgroundColor: WHITE,
        }}
      />
    </AbsoluteFill>
  );
};
