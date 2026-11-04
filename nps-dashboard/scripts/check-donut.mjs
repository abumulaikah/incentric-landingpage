/** Uji cepat geometri donut chart tanpa perlu dev server. */
import { readFileSync } from 'node:fs';

const source = readFileSync('src/components/DonutChart.astro', 'utf8');

// Hitung ulang dengan slicer yang sama untuk data RS Ananda.
const values = [73.7, 26.3, 0];
const sum = values.reduce((a, b) => a + b, 0);
const size = 160;
const center = size / 2;
const outer = 74;
const inner = 48;
const point = (radius, angle) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [center + radius * Math.cos(rad), center + radius * Math.sin(rad)];
};

let cursor = 0;
for (const value of values) {
  if (value <= 0) continue;
  const sweep = (value / sum) * 360;
  const start = cursor;
  const end = Math.min(360, cursor + sweep);
  cursor = end;
  const largeArc = end - start > 180 ? 1 : 0;
  const [x1, y1] = point(outer, start);
  const [x2, y2] = point(outer, end);
  const [ix1, iy1] = point(inner, end);
  const [ix2, iy2] = point(inner, start);
  const d = [
    `M${x1.toFixed(1)},${y1.toFixed(1)}`,
    `A${outer},${outer} 0 ${largeArc} 1 ${x2.toFixed(1)},${y2.toFixed(1)}`,
    `L${ix1.toFixed(1)},${iy1.toFixed(1)}`,
    `A${inner},${inner} 0 ${largeArc} 0 ${ix2.toFixed(1)},${iy2.toFixed(1)}`,
    'Z',
  ].join(' ');
  console.log(`${value}% → ${sweep.toFixed(1)}° dari ${start.toFixed(1)}° ke ${end.toFixed(1)}°`);
  console.log('  ', d);
}

console.log('total sweep:', cursor.toFixed(2), '°');
console.log('komponen memakai path:', source.includes('<path'), '| dasharray tersisa:', /stroke-dasharray/.test(source));
