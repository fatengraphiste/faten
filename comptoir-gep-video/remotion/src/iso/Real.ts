import R from "./real_section.json";
import { XY } from "./engine";

/* ----------------------------------------------------------------------------
   Real product sizes (metres)
   - entrevous : 50 cm wide x 20 cm high (profile traced from the GEP brochure)
   - poutrelle : length up to 9 m, section traced from the brochure drawing
   - dalle alvéolée : 120 cm wide, 20 cm thick (DA20), 7 alveoles, up to 15 m
   ---------------------------------------------------------------------------- */
export const ENT_W = 0.5, ENT_H = 0.2, SLAB_T = 0.05;
export const DA_W = 1.2, DA_T = 0.2;
const ent = R.entrevous as number[][], cells = R.cells as number[][][], pout = R.poutrelle as number[][];
const exmin = Math.min(...ent.map((p) => p[0])), exmax = Math.max(...ent.map((p) => p[0]));
const eymin = Math.min(...ent.map((p) => p[1])), eymax = Math.max(...ent.map((p) => p[1]));
const sx = ENT_W / (exmax - exmin), sy = ENT_H / (eymax - eymin);
const ecx = (exmax + exmin) / 2;
export const PITCH = (R.meta.pitch_mm as number) * sx;                 // distance between poutrelle axes
const entOff = (R.meta.entrevous_center_offset_mm as number) * sx;      // entrevous centre vs poutrelle (negative side)
void entOff;
/* entrevous profile centred on uc, bottom at z0 (u = across, v = up) */
export const entProfile = (uc: number, z0: number): XY[] => ent.map((p) => [uc + (p[0] - ecx) * sx, z0 + (eymax - p[1]) * sy] as XY);
export const entCells = (uc: number, z0: number): XY[][] => cells.map((c) => c.map((p) => [uc + (p[0] - ecx) * sx, z0 + (eymax - p[1]) * sy] as XY));
/* poutrelle profile (centred on its own axis, same vertical reference as the entrevous : bottoms aligned) */
export const poutProfile = (uc: number, z0: number): XY[] => pout.map((p) => [uc + p[0] * sx, z0 + (eymax - p[1]) * sy] as XY);
export const POUT_H = Math.max(...pout.map((p) => (eymax - p[1]) * sy));
export const POUT_W = (Math.max(...pout.map((p) => p[0])) - Math.min(...pout.map((p) => p[0]))) * sx;
