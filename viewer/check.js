/* =====================================================================
   Comprobación geométrica del modelo   ·   node viewer/check.js

   1. ESTANQUEIDAD — recorre el perímetro de cada estancia 5 cm por fuera
      y exige que cada punto sea macizo (muro, pilar, patinillo, balcón) o
      interior de otra estancia / de un hueco de paso. Un tramo de puntos
      seguidos que no cumple es un agujero: o falta muro, o los muros no
      llegan a cerrar la esquina, o el rectángulo de la estancia no casa
      con la cara del paramento.

   2. CONEXIÓN — relleno por inundación desde el recibidor con el mismo
      disco de radio 0,20 m que usa la cámara, para verificar que las once
      estancias son accesibles.

   Las dos hacen falta: la conexión sola sólo detecta pasos que faltan,
   nunca pasos que sobran.
   ===================================================================== */
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'model.js'), 'utf8');
/* model.js declara todo con const en ámbito de bloque: se reexporta al
   objeto global para poder usarlo aquí */
eval(src + ';[["ROOMS",ROOMS],["WALLS",WALLS],["PILLARS",PILLARS],["SHAFTS",SHAFTS],' +
     '["DORMERS",DORMERS],["BALCONIES",BALCONIES]].forEach(([k,v])=>globalThis[k]=v);');

const EPS = 0.02;                       // tolerancia en bordes y jambas
const OUT = 0.05;                       // separación de la sonda
const STEP = 0.05;

/* --- tramos macizos de muro (con los huecos de paso descontados) ------ */
const SEG = [];
WALLS.forEach(w => {
  const [ax, ay] = w.a, [bx, by] = w.b;
  const L = Math.hypot(bx - ax, by - ay), dx = (bx - ax) / L, dy = (by - ay) / L;
  const hs = (w.holes || []).filter(h => h[4] !== 'win').sort((p, q) => p[0] - q[0]);
  let u = 0; const parts = [];
  hs.forEach(h => { if (h[0] > u) parts.push([u, h[0]]); u = h[1]; });
  if (u < L) parts.push([u, L]);
  parts.forEach(([u0, u1]) => SEG.push({ ax, ay, dx, dy, u0, u1, t: w.t }));
});
/* --- huecos de paso, ensanchados al grueso del muro ------------------- */
const PORT = [];
WALLS.forEach(w => (w.holes || []).forEach(h => {
  if (h[3] < 1.9) return;
  const [ax, ay] = w.a, [bx, by] = w.b;
  const L = Math.hypot(bx - ax, by - ay), dx = (bx - ax) / L, dy = (by - ay) / L;
  const e = w.t / 2 + 0.14;
  const xa = ax + dx * h[0], ya = ay + dy * h[0];
  const xb = ax + dx * h[1], yb = ay + dy * h[1];
  PORT.push([Math.min(xa, xb) - e * Math.abs(dy), Math.min(ya, yb) - e * Math.abs(dx),
             Math.max(xa, xb) + e * Math.abs(dy), Math.max(ya, yb) + e * Math.abs(dx)]);
}));

const inRect = (q, x, y, m = 0) => x >= q[0] - m && x <= q[2] + m && y >= q[1] - m && y <= q[3] + m;

function inWall(x, y, m) {
  return SEG.some(s => {
    const px = x - s.ax, py = y - s.ay;
    const u = px * s.dx + py * s.dy, v = -px * s.dy + py * s.dx;
    return u >= s.u0 - m && u <= s.u1 + m && Math.abs(v) <= s.t / 2 + m;
  });
}
function solid(x, y, m = 0) {
  return inWall(x, y, m)
    || PILLARS.some(p => Math.abs(x - p.x) <= p.w / 2 + m && Math.abs(y - p.y) <= p.d / 2 + m)
    || SHAFTS.some(s => inRect([s.x0, s.y0, s.x1, s.y1], x, y, m))
    || BALCONIES.some(b => inRect([b.x0, b.y0, b.x1, b.y1], x, y, m));
}
function interior(x, y, m = 0) {
  return ROOMS.some(r => r.rects.some(q => inRect(q, x, y, m)))
    || DORMERS.some(d => inRect([d.x0, d.y0, d.x1, d.y1], x, y, m))
    || PORT.some(q => inRect(q, x, y, m));
}

/* ------------------------- 1 · estanqueidad --------------------------- */
const leaks = [];
ROOMS.forEach(r => r.rects.forEach(q => {
  const [x0, y0, x1, y1] = q;
  const run = (a, b, f) => { for (let t = a + STEP / 2; t < b; t += STEP) f(+t.toFixed(4)); };
  run(x0, x1, x => probe(r, x, y1 + OUT));
  run(x0, x1, x => probe(r, x, y0 - OUT));
  run(y0, y1, y => probe(r, x0 - OUT, y));
  run(y0, y1, y => probe(r, x1 + OUT, y));
}));
function probe(r, x, y) {
  if (solid(x, y, EPS) || interior(x, y, EPS)) return;
  leaks.push({ room: r.name, x: +x.toFixed(2), y: +y.toFixed(2) });
}
/* sólo importan los tramos: un punto suelto es ruido de muestreo */
const runs = [];
leaks.forEach(l => {
  const g = runs.find(g => g.room === l.room &&
                           Math.abs(g.x1 - l.x) <= STEP * 1.5 && Math.abs(g.y1 - l.y) <= STEP * 1.5);
  if (g) { g.x1 = l.x; g.y1 = l.y; g.n++; } else runs.push({ room: l.room, x0: l.x, y0: l.y, x1: l.x, y1: l.y, n: 1 });
});
const holes = runs.filter(g => g.n > 1);

/* --------------------------- 2 · conexión ----------------------------- */
const R = 0.20;
const OFFS = [[0,0],[1,0],[-1,0],[0,1],[0,-1],[.71,.71],[-.71,.71],[.71,-.71],[-.71,-.71]];
const walkable = (x, y) => !solid(x, y) && OFFS.every(([a, b]) => interior(x + a * R, y + b * R));
const G = 0.05, key = (i, j) => i + '|' + j;
const start = [Math.round(12.6 / G), Math.round(-8.55 / G)];
const seen = new Set([key(...start)]), stack = [start], hit = new Set();
while (stack.length) {
  const [i, j] = stack.pop(), x = i * G, y = j * G;
  const r = ROOMS.find(r => r.rects.some(q => inRect(q, x, y)));
  if (r) hit.add(r.id);
  for (const [di, dj] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    const k = key(i + di, j + dj);
    if (seen.has(k) || !walkable((i + di) * G, (j + dj) * G)) continue;
    seen.add(k); stack.push([i + di, j + dj]);
  }
}
const unreached = ROOMS.filter(r => !hit.has(r.id));

/* ------------------------------ informe ------------------------------- */
console.log('estanqueidad  ' + (holes.length ? '✗ ' + holes.length + ' tramo(s) abiertos' : '✓ sin agujeros')
            + '   (' + leaks.length + ' puntos sueltos en jambas, tolerados)');
holes.forEach(g => console.log('   ' + g.room.padEnd(18) +
  ' x ' + g.x0.toFixed(2) + '…' + g.x1.toFixed(2) + '   y ' + g.y0.toFixed(2) + '…' + g.y1.toFixed(2)));
console.log('conexión      ' + (unreached.length
  ? '✗ sin acceso: ' + unreached.map(r => r.name).join(', ')
  : '✓ ' + hit.size + '/' + ROOMS.length + ' estancias'));
process.exit(holes.length || unreached.length ? 1 : 0);
