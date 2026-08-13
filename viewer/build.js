/* =====================================================================
   Construcción de la geometría three.js a partir de model.js
   ===================================================================== */

/* three.js: y = altura.  Mapeo:  X3 = x_plano ,  Y3 = z ,  Z3 = −y_plano  */
const V = (x, y, z) => new THREE.Vector3(x, z, -y);

/* ---------------------------- utilidades ---------------------------- */
class Mesher {
  constructor() { this.pos = []; this.nor = []; this.uv = []; }
  tri(a, b, c, n) {
    const N = n || new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize();
    for (const p of [a, b, c]) { this.pos.push(p.x, p.y, p.z); this.nor.push(N.x, N.y, N.z); }
    this.uv.push(0, 0, 1, 0, 1, 1);
  }
  quad(a, b, c, d) { this.tri(a, b, c); this.tri(a, c, d); }
  /** hexaedro: 4 vértices inferiores + 4 superiores, en el mismo orden */
  box(lo, hi) {
    this.quad(hi[0], hi[1], hi[2], hi[3]);                 // techo
    this.quad(lo[3], lo[2], lo[1], lo[0]);                 // suelo
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      this.quad(lo[i], lo[j], hi[j], hi[i]);
    }
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    return g;
  }
  get empty() { return this.pos.length === 0; }
}

/* ------------------------------ muros --------------------------------
   Cada paño se construye como una cinta continua: el remate superior
   sigue el faldón, y sólo se cierran los testeros de los extremos, de
   modo que no aparecen costuras entre tramos.
   --------------------------------------------------------------------- */
function buildWall(w, M) {
  const [ax, ay] = w.a, [bx, by] = w.b;
  const L = Math.hypot(bx - ax, by - ay);
  if (L < 1e-6) return;
  const dx = (bx - ax) / L, dy = (by - ay) / L;
  const nx = -dy * w.t / 2, ny = dx * w.t / 2;
  const holes = (w.holes || [])
    .map(h => [Math.max(0, h[0]), Math.min(L, h[1]), h[2], h[3]])
    .filter(h => h[1] - h[0] > 1e-4);

  const cuts = new Set([0, L]);
  holes.forEach(h => { cuts.add(h[0]); cuts.add(h[1]); });
  const us = [...cuts].sort((p, q) => p - q);

  for (let i = 0; i < us.length - 1; i++) {
    const u0 = us[i], u1 = us[i + 1];
    if (u1 - u0 < 1e-4) continue;
    const um = (u0 + u1) / 2;
    let spans = [[0, 1e3]];
    for (const h of holes) {
      if (um <= h[0] || um >= h[1]) continue;
      const out = [];
      for (const [s, e] of spans) {
        if (h[3] <= s || h[2] >= e) { out.push([s, e]); continue; }
        if (h[2] > s) out.push([s, h[2]]);
        if (h[3] < e) out.push([h[3], e]);
      }
      spans = out;
    }
    for (const [s, e] of spans) ribbon(M, ax, ay, dx, dy, nx, ny, u0, u1, s, e);
  }
}

function ribbon(M, ax, ay, dx, dy, nx, ny, u0, u1, s, e) {
  const n = Math.max(1, Math.ceil((u1 - u0) / 0.30));
  const P = [];
  for (let i = 0; i <= n; i++) {
    const u = u0 + (u1 - u0) * i / n;
    const px = ax + dx * u, py = ay + dy * u;
    const t = Math.max(ceilAt(px, py), ceilAt(px - nx, py - ny), ceilAt(px + nx, py + ny)) + 0.02;
    P.push({ px, py, top: Math.max(s, Math.min(e, t)) });
  }
  if (P.every(p => p.top - s < 0.006)) return;
  const A = (p, z) => V(p.px - nx, p.py - ny, z);
  const B = (p, z) => V(p.px + nx, p.py + ny, z);
  for (let i = 0; i < n; i++) {
    const p = P[i], q = P[i + 1];
    M.quad(A(p, s), A(q, s), A(q, q.top), A(p, p.top));
    M.quad(B(q, s), B(p, s), B(p, p.top), B(q, q.top));
    M.quad(A(p, p.top), A(q, q.top), B(q, q.top), B(p, p.top));
    M.quad(B(p, s), B(q, s), A(q, s), A(p, s));
  }
  const f = P[0], l = P[n];
  M.quad(A(f, s), A(f, f.top), B(f, f.top), B(f, s));
  M.quad(B(l, s), B(l, l.top), A(l, l.top), A(l, s));
}

/* -------------------- suelos y techos por estancia -------------------- */
function buildSlab(r, z, M, up) {
  const [x0, y0, x1, y1] = r;
  const a = V(x0, y0, z), b = V(x1, y0, z), c = V(x1, y1, z), d = V(x0, y1, z);
  if (up) M.quad(a, b, c, d); else M.quad(d, c, b, a);
}

/* Techo continuo: se malla el rectángulo envolvente de la vivienda y se
   emiten sólo las celdas que caen sobre alguna estancia (dilatada 0,22 m
   para cubrir el espesor de los muros).  Así no quedan juntas entre paños
   ni resquicios por los que se cuele el cielo.                            */
const CEIL_PAD = 0.22, CEIL_STEP = 0.22;

function roomCovers(x, y) {
  for (const r of ROOMS) for (const q of r.rects)
    if (x > q[0] - CEIL_PAD && x < q[2] + CEIL_PAD &&
        y > q[1] - CEIL_PAD && y < q[3] + CEIL_PAD) return true;
  return false;
}
/** líneas de corte: aristas de cumbrera y peldaños entre las dos cubiertas */
function gridEdges(a, b, hard) {
  const e = [];
  for (let v = a; v < b - 1e-6; v += CEIL_STEP) e.push(v);
  e.push(b);
  hard.forEach(h => { if (h > a + 1e-3 && h < b - 1e-3) e.push(h); });
  return [...new Set(e.map(v => +v.toFixed(4)))].sort((p, q) => p - q);
}
function buildCeiling(M) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  ROOMS.forEach(r => r.rects.forEach(q => {
    x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]);
    x1 = Math.max(x1, q[2]); y1 = Math.max(y1, q[3]);
  }));
  x0 -= CEIL_PAD; y0 -= CEIL_PAD; x1 += CEIL_PAD; y1 += CEIL_PAD;
  const XS = gridEdges(x0, x1, [ROOF.endW, ROOF.endE, ROOF.gableNx, ROOF.gableSx]);
  const YS = gridEdges(y0, y1, [ROOF.ridgeY, ROOF.ridgeY2]);
  for (let i = 0; i < XS.length - 1; i++) for (let j = 0; j < YS.length - 1; j++) {
    const xa = XS[i], xb = XS[i + 1], ya = YS[j], yb = YS[j + 1];
    const cx = (xa + xb) / 2, cy = (ya + yb) / 2;
    if (!roomCovers(cx, cy) || dormerAt(cx, cy)) continue;
    const p = (X, Y) => V(X, Y, roofH(X, Y, cx));   // cx fija el lado del peldaño
    M.quad(p(xa, yb), p(xb, yb), p(xb, ya), p(xa, ya));
  }
}
/** Peldaño vertical entre la cubierta alta y la baja (x = 4,33 y 22,38). */
function buildRoofSteps(M, lift) {
  const L = lift || 0, dy = 0.15;
  [ROOF.endW, ROOF.endE].forEach(xs => {
    for (let y = ROOF.ridgeY2; y > -16; y -= dy) {
      const ya = y, yb = y - dy;
      if (!roomCovers(xs, (ya + yb) / 2)) continue;
      const lo = [roofH(xs, ya, xs - 0.05) + L, roofH(xs, yb, xs - 0.05) + L];
      const hi = [roofH(xs, ya, xs + 0.05) + L, roofH(xs, yb, xs + 0.05) + L];
      const a0 = Math.min(lo[0], hi[0]), a1 = Math.max(lo[0], hi[0]);
      const b0 = Math.min(lo[1], hi[1]), b1 = Math.max(lo[1], hi[1]);
      if (a1 - a0 < 0.01 && b1 - b0 < 0.01) continue;
      M.quad(V(xs, ya, a0), V(xs, yb, b0), V(xs, yb, b1), V(xs, ya, a1));
    }
  });
}

/* Paño de buhardilla: usa su propia cubierta, sin solape. */
function buildCeilingPatch(r, M, fn, pad) {
  const [x0, y0, x1, y1] = r;
  const P = pad === undefined ? 0 : pad;
  const ax = x0 - P, bx = x1 + P, ay = y0 - P, by = y1 + P;
  const nx = Math.max(1, Math.ceil((bx - ax) / 0.25));
  const ny = Math.max(1, Math.ceil((by - ay) / 0.25));
  const f = fn || roofH;
  const p = (X, Y) => V(X, Y, f(X, Y));
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const xa = ax + (bx - ax) * i / nx, xb = ax + (bx - ax) * (i + 1) / nx;
    const ya = ay + (by - ay) * j / ny, yb = ay + (by - ay) * (j + 1) / ny;
    M.quad(p(xa, yb), p(xb, yb), p(xb, ya), p(xa, ya));
  }
}

/* ----------------------- construcción del modelo ---------------------- */
function buildApartment() {
  const group = new THREE.Group();

  const S = THREE.DoubleSide;
  const matWall = new THREE.MeshLambertMaterial({ color: 0xf2ece1, side: S });
  const matFloor = new THREE.MeshLambertMaterial({ color: 0xbe9163, side: S });
  const matCeil = new THREE.MeshLambertMaterial({ color: 0xe4d9c4, side: S });
  const matSlab = new THREE.MeshLambertMaterial({ color: 0xa9a29a, side: S });
  const matBalc = new THREE.MeshLambertMaterial({ color: 0xb4b0a8, side: S });
  const matGlass = new THREE.MeshLambertMaterial({ color: 0xcfe4ee, transparent: true, opacity: 0.16,
                                                  side: S, depthWrite: false });
  const matFurn = new THREE.MeshLambertMaterial({ color: 0x8d7660, side: S });
  const matPil  = new THREE.MeshLambertMaterial({ color: 0xdcd4c6, side: S });
  const matShaft= new THREE.MeshLambertMaterial({ color: 0xb9ab97, side: S });
  const matFig = new THREE.MeshLambertMaterial({ color: 0x7b93a6, side: S });

  // --- muros
  const Mw = new Mesher();
  WALLS.forEach(w => buildWall(w, Mw));
  const walls = new THREE.Mesh(Mw.geometry(), matWall);
  walls.castShadow = walls.receiveShadow = true;
  group.add(walls);

  // --- suelos, techos
  const Mf = new Mesher(), Mc = new Mesher();
  buildCeiling(Mc);
  buildRoofSteps(Mc, 0);
  ROOMS.forEach(room => {
    room.rects.forEach(r => buildSlab(r, 0, Mf, true));
    (room.dormers || []).forEach(id => {
      const d = DORMERS.find(k => k.id === id);
      buildSlab([d.x0, d.y0, d.x1, d.y1], 0, Mf, true);
      buildCeilingPatch([d.x0, d.y0, d.x1, d.y1], Mc, ceilAt, 0);
      // testero triangular de encuentro buhardilla / faldón
      const nseg = 12;
      for (let i = 0; i < nseg; i++) {
        const xa = d.x0 + (d.x1 - d.x0) * i / nseg, xb = d.x0 + (d.x1 - d.x0) * (i + 1) / nseg;
        const ea = roofH(xa, d.jy), eb = roofH(xb, d.jy);
        const ta = ceilAt(xa, d.jy + 0.001 * d.dir), tb = ceilAt(xb, d.jy + 0.001 * d.dir);
        if (ta - ea < 0.01 && tb - eb < 0.01) continue;
        Mc.quad(V(xa, d.jy, ea), V(xb, d.jy, eb), V(xb, d.jy, Math.max(tb, eb)), V(xa, d.jy, Math.max(ta, ea)));
      }
    });
  });
  const floor = new THREE.Mesh(Mf.geometry(), matFloor); floor.receiveShadow = true; group.add(floor);
  const ceil = new THREE.Mesh(Mc.geometry(), matCeil); group.add(ceil);

  // --- canto del forjado (contexto exterior)
  const Ms = new Mesher();
  const OUT = [[2.20,-11.25,10.30,-3.30],[9.35,-14.60,16.85,-1.35],[16.55,-12.70,24.60,-3.30]];
  OUT.forEach(r => { buildSlab(r, -0.02, Ms, true); buildSlab(r, -0.38, Ms, false);
    const [x0,y0,x1,y1]=r;
    Ms.quad(V(x0,y0,-0.02),V(x1,y0,-0.02),V(x1,y0,-0.38),V(x0,y0,-0.38));
    Ms.quad(V(x1,y1,-0.02),V(x0,y1,-0.02),V(x0,y1,-0.38),V(x1,y1,-0.38));
    Ms.quad(V(x1,y0,-0.02),V(x1,y1,-0.02),V(x1,y1,-0.38),V(x1,y0,-0.38));
    Ms.quad(V(x0,y1,-0.02),V(x0,y0,-0.02),V(x0,y0,-0.38),V(x0,y1,-0.38));
  });
  group.add(new THREE.Mesh(Ms.geometry(), matSlab));

  // --- balcones
  const Mb = new Mesher();
  BALCONIES.forEach(b => {
    const lo = [V(b.x0,b.y0,-0.06), V(b.x1,b.y0,-0.06), V(b.x1,b.y1,-0.06), V(b.x0,b.y1,-0.06)];
    const hi = [V(b.x0,b.y0,0.00), V(b.x1,b.y0,0.00), V(b.x1,b.y1,0.00), V(b.x0,b.y1,0.00)];
    Mb.box(lo, hi);
    const rail = (x0,y0,x1,y1) => {
      const t=0.05, L=Math.hypot(x1-x0,y1-y0), dx=(x1-x0)/L, dy=(y1-y0)/L, nx=-dy*t/2, ny=dx*t/2;
      Mb.box([V(x0-nx,y0-ny,0.95),V(x1-nx,y1-ny,0.95),V(x1+nx,y1+ny,0.95),V(x0+nx,y0+ny,0.95)],
             [V(x0-nx,y0-ny,1.05),V(x1-nx,y1-ny,1.05),V(x1+nx,y1+ny,1.05),V(x0+nx,y0+ny,1.05)]);
      const n=Math.round(L/0.12);
      for(let i=1;i<n;i++){ const u=L*i/n, px=x0+dx*u, py=y0+dy*u;
        Mb.box([V(px-0.012,py-0.012,0.02),V(px+0.012,py-0.012,0.02),V(px+0.012,py+0.012,0.02),V(px-0.012,py+0.012,0.02)],
               [V(px-0.012,py-0.012,1.00),V(px+0.012,py-0.012,1.00),V(px+0.012,py+0.012,1.00),V(px-0.012,py+0.012,1.00)]); }
    };
    rail(b.x0,b.y0,b.x1,b.y0); rail(b.x0,b.y0,b.x0,b.y1); rail(b.x1,b.y0,b.x1,b.y1);
  });
  group.add(new THREE.Mesh(Mb.geometry(), matBalc));

  // --- vidrios en los huecos
  const Mg = new Mesher();
  WALLS.forEach(w => {
    (w.holes || []).forEach(h => {
      if (h[4] === 'open' || h[4] === 'door' || h[4] === 'entry') return;
      const [ax,ay]=w.a,[bx,by]=w.b, L=Math.hypot(bx-ax,by-ay);
      const dx=(bx-ax)/L, dy=(by-ay)/L;
      const p0x=ax+dx*h[0], p0y=ay+dy*h[0], p1x=ax+dx*h[1], p1y=ay+dy*h[1];
      Mg.quad(V(p0x,p0y,h[2]), V(p1x,p1y,h[2]), V(p1x,p1y,h[3]), V(p0x,p0y,h[3]));
    });
  });
  const glass = new THREE.Mesh(Mg.geometry(), matGlass); group.add(glass);

  // --- pilares (del pavimento al faldón)
  const Mpil = new Mesher();
  PILLARS.forEach(p => {
    const x0 = p.x - p.w / 2, x1 = p.x + p.w / 2, y0 = p.y - p.d / 2, y1 = p.y + p.d / 2;
    const top = Math.max(ceilAt(p.x, p.y), ceilAt(x0, y0), ceilAt(x1, y1)) + 0.02;
    Mpil.box([V(x0,y0,0),V(x1,y0,0),V(x1,y1,0),V(x0,y1,0)],
             [V(x0,y0,top),V(x1,y0,top),V(x1,y1,top),V(x0,y1,top)]);
  });
  const pillars = new THREE.Mesh(Mpil.geometry(), matPil);
  pillars.castShadow = pillars.receiveShadow = true; group.add(pillars);

  // --- patinillos: atraviesan el faldón y rematan sobre cubierta
  const Msh = new Mesher();
  SHAFTS.forEach(s => {
    const bx = (x0,y0,x1,y1,z0,z1) => Msh.box(
      [V(x0,y0,z0),V(x1,y0,z0),V(x1,y1,z0),V(x0,y1,z0)],
      [V(x0,y0,z1),V(x1,y0,z1),V(x1,y1,z1),V(x0,y1,z1)]);
    bx(s.x0, s.y0, s.x1, s.y1, 0, SHAFT_TOP - 0.16);
    bx(s.x0 - 0.09, s.y0 - 0.09, s.x1 + 0.09, s.y1 + 0.09, SHAFT_TOP - 0.16, SHAFT_TOP);  // albardilla
  });
  const shafts = new THREE.Mesh(Msh.geometry(), matShaft);
  shafts.castShadow = shafts.receiveShadow = true; group.add(shafts);

  // --- mobiliario
  const Mu = new Mesher();
  FURNITURE.forEach(f => {
    const [x0,y0,x1,y1,hh] = f;
    Mu.box([V(x0,y0,0.02),V(x1,y0,0.02),V(x1,y1,0.02),V(x0,y1,0.02)],
           [V(x0,y0,hh),V(x1,y0,hh),V(x1,y1,hh),V(x0,y1,hh)]);
  });
  const furn = new THREE.Mesh(Mu.geometry(), matFurn); furn.castShadow = true; group.add(furn);

  // --- figuras de escala (1,75 m)
  const Mp = new Mesher();
  FIGURES.forEach(([px,py]) => {
    const bx = (x0,y0,x1,y1,z0,z1) => Mp.box(
      [V(x0,y0,z0),V(x1,y0,z0),V(x1,y1,z0),V(x0,y1,z0)],
      [V(x0,y0,z1),V(x1,y0,z1),V(x1,y1,z1),V(x0,y1,z1)]);
    bx(px-0.155,py-0.075,px-0.025,py+0.075, 0.00, 0.92);   // pierna
    bx(px+0.025,py-0.075,px+0.155,py+0.075, 0.00, 0.92);   // pierna
    bx(px-0.185,py-0.105,px+0.185,py+0.105, 0.88, 1.47);   // torso
    bx(px-0.095,py-0.085,px+0.095,py+0.085, 1.47, 1.75);   // cabeza
  });
  const figs = new THREE.Mesh(Mp.geometry(), matFig); figs.castShadow = true; group.add(figs);

  return { group, walls, ceil, floor, furn, figs, glass, pillars, shafts };
}

/* ------------------- envolvente de cubierta (modo maqueta) ------------
   Plano de cubierta a 0,30 m sobre la cara interior, con 0,70 m de vuelo
   de alero (cota anotada en a05).
   --------------------------------------------------------------------- */
function buildShell() {
  const M = new Mesher();
  const T = 0.30, EAVE = 0.72;
  const patch = (r, pad, fn) => {
    const [x0, y0, x1, y1] = r;
    const ax = x0 - pad, bx = x1 + pad, ay = y0 - pad, by = y1 + pad;
    const nx = Math.max(1, Math.ceil((bx - ax) / 0.35));
    const ny = Math.max(1, Math.ceil((by - ay) / 0.35));
    const p = (X, Y) => V(X, Y, fn(X, Y) + T);
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const xa = ax + (bx - ax) * i / nx, xb = ax + (bx - ax) * (i + 1) / nx;
      const ya = ay + (by - ay) * j / ny, yb = ay + (by - ay) * (j + 1) / ny;
      M.quad(p(xa, ya), p(xb, ya), p(xb, yb), p(xa, yb));
    }
  };
  ROOMS.forEach(r => r.rects.forEach(q => patch(q, EAVE, roofH)));
  buildRoofSteps(M, T);
  DORMERS.forEach(d => patch([d.x0, d.y0, d.x1, d.y1], 0.22,
    (X, Y) => d.eave + DORMER_SLOPE * ((d.x1 - d.x0) / 2 + 0.22 - Math.abs(X - d.xc))));
  const mat = new THREE.MeshLambertMaterial({ color: 0x8a8478, transparent: true, opacity: 0.5,
                                              side: THREE.DoubleSide, depthWrite: false });
  return new THREE.Mesh(M.geometry(), mat);
}

/* -------------------- cielo y terreno (luz por los huecos) ------------ */
function buildSky() {
  const c = document.createElement('canvas'); c.width = 32; c.height = 512;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0.00, '#3d6d9e');
  grd.addColorStop(0.42, '#8fb6d6');
  grd.addColorStop(0.58, '#cfdce6');
  grd.addColorStop(0.62, '#9aa8a4');
  grd.addColorStop(1.00, '#5f6a57');
  g.fillStyle = grd; g.fillRect(0, 0, 32, 512);
  // silueta de sierra en el horizonte (Benasque)
  g.fillStyle = 'rgba(96,110,116,0.55)';
  g.beginPath(); g.moveTo(0, 270);
  for (let i = 0; i <= 32; i++) {
    const s = Math.sin(i * 1.7) * 9 + Math.sin(i * 0.53) * 13;
    g.lineTo(i, 258 + s);
  }
  g.lineTo(32, 300); g.lineTo(0, 300); g.closePath(); g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.LinearFilter;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(160, 24, 16),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, depthWrite: false, fog: false }));
  sky.position.set(13, -6.0, 8);
  return sky;
}
/* ------------------- plantas inferiores (contexto) --------------------
   Dos plantas más el arranque del semisótano, con los huecos medidos en
   a02/a03. La fábrica se dibuja como paños con hueco; detrás va un
   prisma retranqueado 0,12 que hace de mocheta y deja los huecos oscuros.
   ---------------------------------------------------------------------- */
function buildBase() {
  const group = new THREE.Group();
  const TOP = 0.00, BOT = Z_SOT;
  const REV = 0.12;

  // --- macizo retranqueado (se ve por los huecos)
  const Mr = new Mesher();
  const solid = (r, z0, z1, in_) => {
    const [x0, y0, x1, y1] = [r[0] + in_, r[1] + in_, r[2] - in_, r[3] - in_];
    Mr.box([V(x0,y0,z0),V(x1,y0,z0),V(x1,y1,z0),V(x0,y1,z0)],
           [V(x0,y0,z1),V(x1,y0,z1),V(x1,y1,z1),V(x0,y1,z1)]);
  };
  BASE_MASS.forEach(r => solid(r, BOT, TOP - 0.02, REV));
  BASE_JOINT.forEach(r => solid(r, BOT, TOP - 0.03, 0));
  const rev = new THREE.Mesh(Mr.geometry(),
    new THREE.MeshLambertMaterial({ color: 0x4a4640, side: THREE.DoubleSide }));
  group.add(rev);

  // --- paños de fachada con sus huecos, planta a planta
  const Mf = new Mesher(), Mg = new Mesher();
  const bands = [[Z_PB, Z_P1], [Z_P1, TOP]];          // planta baja y primera
  BASE_FACES.forEach(f => {
    const hor = f.d === 'h';
    const P = (t, z) => hor ? V(t, f.c, z) : V(f.c, t, z);
    const lo = Math.min(f.a, f.b), hi = Math.max(f.a, f.b);
    // banda ciega bajo la planta baja (arranque enterrado)
    quadStrip(Mf, P, lo, hi, BOT, Z_PB);
    bands.forEach(([zf, zt]) => {
      const zs = zf + BASE_SILL, zh = zf + BASE_HEAD;
      const hs = f.holes.map(h => [Math.min(h[0], h[1]), Math.max(h[0], h[1])])
                        .filter(h => h[1] > lo && h[0] < hi).sort((a, b) => a[0] - b[0]);
      let t = lo;
      hs.forEach(h => {
        if (h[0] > t) quadStrip(Mf, P, t, h[0], zf, zt);
        quadStrip(Mf, P, h[0], h[1], zf, zs);          // antepecho
        quadStrip(Mf, P, h[0], h[1], zh, zt);          // dintel
        Mg.quad(P(h[0], zs), P(h[1], zs), P(h[1], zh), P(h[0], zh));
        t = h[1];
      });
      if (t < hi) quadStrip(Mf, P, t, hi, zf, zt);
    });
  });
  // remate superior: 0,10 por debajo del pavimento de la vivienda, para no
  // solaparse con sus solados (queda oculto bajo los faldones y el alero)
  BASE_MASS.forEach(r => {
    const [x0, y0, x1, y1] = r, z = TOP - 0.10;
    Mf.quad(V(x0,y0,z), V(x1,y0,z), V(x1,y1,z), V(x0,y1,z));
  });
  // cornisa bajo el arranque de la vivienda
  BASE_MASS.forEach(r => {
    const [x0, y0, x1, y1] = [r[0]-0.11, r[1]-0.11, r[2]+0.11, r[3]+0.11];
    Mf.box([V(x0,y0,-0.26),V(x1,y0,-0.26),V(x1,y1,-0.26),V(x0,y1,-0.26)],
           [V(x0,y0,-0.05),V(x1,y0,-0.05),V(x1,y1,-0.05),V(x0,y1,-0.05)]);
  });
  // imposta de forjado
  [Z_P1, Z_PB].forEach(z => BASE_MASS.forEach(r => {
    const [x0, y0, x1, y1] = [r[0]-0.07, r[1]-0.07, r[2]+0.07, r[3]+0.07];
    Mf.box([V(x0,y0,z-0.10),V(x1,y0,z-0.10),V(x1,y1,z-0.10),V(x0,y1,z-0.10)],
           [V(x0,y0,z+0.06),V(x1,y0,z+0.06),V(x1,y1,z+0.06),V(x0,y1,z+0.06)]);
  }));
  const fac = new THREE.Mesh(Mf.geometry(),
    new THREE.MeshLambertMaterial({ color: 0xcfc7b8, side: THREE.DoubleSide }));
  fac.castShadow = fac.receiveShadow = true;
  group.add(fac);
  group.add(new THREE.Mesh(Mg.geometry(), new THREE.MeshLambertMaterial({
    color: 0x2b3138, side: THREE.DoubleSide })));

  // --- balcones de las dos plantas
  const Mb = new Mesher();
  [Z_P1, Z_PB].forEach(z => BASE_BALC.forEach(b => balcony(Mb, b, z)));
  const balc = new THREE.Mesh(Mb.geometry(),
    new THREE.MeshLambertMaterial({ color: 0xb4b0a8, side: THREE.DoubleSide }));
  balc.castShadow = true; group.add(balc);

  // --- cubierta baja de las dos alas de dos plantas
  const Mw = new Mesher();
  WING_BAYS.forEach(([x0, x1]) => {
    const n = 12, ya = WING_ROOF.eaveN, yb = WING_ROOF.eaveS;
    for (let i = 0; i < n; i++) {
      const y0 = ya + (yb - ya) * i / n, y1 = ya + (yb - ya) * (i + 1) / n;
      const h0 = wingRoofH(y0), h1 = wingRoofH(y1);
      Mw.quad(V(x0,y0,h0), V(x1,y0,h0), V(x1,y1,h1), V(x0,y1,h1));
    }
    [x0, x1].forEach(x => Mw.tri(V(x,ya,wingRoofH(ya)), V(x,WING_ROOF.ridgeY,WING_ROOF.top),
                                 V(x,yb,wingRoofH(yb))));
  });
  const wing = new THREE.Mesh(Mw.geometry(),
    new THREE.MeshLambertMaterial({ color: 0x7d7568, side: THREE.DoubleSide }));
  wing.castShadow = wing.receiveShadow = true; group.add(wing);
  return group;
}
/** paño rectangular vertical entre dos parámetros y dos cotas */
function quadStrip(M, P, t0, t1, z0, z1) {
  if (t1 - t0 < 1e-6 || z1 - z0 < 1e-6) return;
  M.quad(P(t0, z0), P(t1, z0), P(t1, z1), P(t0, z1));
}
/** losa de balcón con su barandilla, a la cota z */
function balcony(M, b, z) {
  const [x0, y0, x1, y1] = b;
  M.box([V(x0,y0,z-0.18),V(x1,y0,z-0.18),V(x1,y1,z-0.18),V(x0,y1,z-0.18)],
        [V(x0,y0,z),V(x1,y0,z),V(x1,y1,z),V(x0,y1,z)]);
  const rail = (ax, ay, bx, by) => {
    const t = 0.05, L = Math.hypot(bx-ax, by-ay), dx = (bx-ax)/L, dy = (by-ay)/L;
    const nx = -dy*t/2, ny = dx*t/2;
    M.box([V(ax-nx,ay-ny,z+0.95),V(bx-nx,by-ny,z+0.95),V(bx+nx,by+ny,z+0.95),V(ax+nx,ay+ny,z+0.95)],
          [V(ax-nx,ay-ny,z+1.05),V(bx-nx,by-ny,z+1.05),V(bx+nx,by+ny,z+1.05),V(ax+nx,ay+ny,z+1.05)]);
    const n = Math.round(L/0.13);
    for (let i = 1; i < n; i++) {
      const u = L*i/n, px = ax+dx*u, py = ay+dy*u, e = 0.012;
      M.box([V(px-e,py-e,z+0.02),V(px+e,py-e,z+0.02),V(px+e,py+e,z+0.02),V(px-e,py+e,z+0.02)],
            [V(px-e,py-e,z+1.00),V(px+e,py-e,z+1.00),V(px+e,py+e,z+1.00),V(px-e,py+e,z+1.00)]);
    }
  };
  // la barandilla va por los tres lados libres (el cuarto es la fachada)
  const w = x1 - x0, d = y1 - y0;
  if (w >= d) { rail(x0,y0,x1,y0); rail(x0,y0,x0,y1); rail(x1,y0,x1,y1); }
  else        { rail(x0,y0,x0,y1); rail(x0,y0,x1,y0); rail(x0,y1,x1,y1); }
}

function buildGround() {
  const N = 60, R = 130, cx = 13.3, cy = -7.5;
  const M = new Mesher();
  const h = (x, y) => groundZ(Math.max(-40, Math.min(67, x)), Math.max(-70, Math.min(50, y)));
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const xa = cx - R + 2*R*i/N, xb = cx - R + 2*R*(i+1)/N;
    const ya = cy - R + 2*R*j/N, yb = cy - R + 2*R*(j+1)/N;
    M.quad(V(xa,ya,h(xa,ya)), V(xb,ya,h(xb,ya)), V(xb,yb,h(xb,yb)), V(xa,yb,h(xa,yb)));
  }
  const mesh = new THREE.Mesh(M.geometry(),
    new THREE.MeshLambertMaterial({ color: 0x6e7a5c, side: THREE.DoubleSide }));
  mesh.receiveShadow = true;
  return mesh;
}

/* ---------------------------- etiquetas ------------------------------ */
function makeLabel(text, sub) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 160;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(20,22,26,0.82)'; roundRect(g, 8, 8, 496, 144, 14); g.fill();
  g.strokeStyle = 'rgba(232,163,61,0.85)'; g.lineWidth = 3; roundRect(g, 8, 8, 496, 144, 14); g.stroke();
  g.fillStyle = '#f6f2ea'; g.textAlign = 'center';
  g.font = '600 46px ui-sans-serif, system-ui, sans-serif'; g.fillText(text, 256, 68);
  g.fillStyle = '#e8a33d';
  g.font = '500 34px ui-monospace, SFMono-Regular, Menlo, monospace'; g.fillText(sub, 256, 118);
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  spr.scale.set(2.7, 0.84, 1);
  return spr;
}
function roundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
