/** Cari akar repo yang benar dengan memeriksa keberadaan folder nps-dashboard. */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

const candidates = [
  path.resolve(scriptDir, '..', '..'),
  path.resolve(scriptDir, '..', '..', '..'),
  path.resolve(scriptDir, '..', '..', '..', '..'),
];

for (const candidate of candidates) {
  const inside = path.join(candidate, 'nps-dashboard');
  console.log(
    existsSync(inside) ? 'OK  ' : 'MISS',
    candidate,
    existsSync(inside) ? `(ada ${inside})` : '',
  );
}
