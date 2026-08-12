/* =====================================================================
   Visor — cámara, controles, HUD
   ===================================================================== */
let renderer, scene, camera, apt, shell, labels = [], portals = [];
let measuring = false, marks = [], markGroup = null;
let plafonding = false, zones = [], pending = null, zoneGroup = null;
let mode = 'walk';
const cam = { x: 11.15, y: -10.05, yaw: Math.PI, pitch: 0.10, eye: 1.62 };
const orb = { tx: 13.4, ty: -8.6, tz: 1.4, dist: 21, az: -0.62, el: 0.42 };
const keys = Object.create(null);
const RADIUS = 0.20;

/* ---------------------------- inicio --------------------------------- */
function init() {
  if (!document.querySelector('meta[name="viewport"]')) {
    const mv = document.createElement('meta');
    mv.name = 'viewport';
    mv.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
    document.head.appendChild(mv);
  }
  const canvas = document.getElementById('view');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8fb6d6);
  scene.add(buildSky());
  scene.add(buildGround());

  camera = new THREE.PerspectiveCamera(68, 1, 0.05, 400);

  scene.add(new THREE.HemisphereLight(0xeef4fa, 0xcabfae, 1.25));
  scene.add(new THREE.AmbientLight(0xfff6ea, 0.55));
  const sun = new THREE.DirectionalLight(0xfff1de, 1.55);
  sun.position.set(6, 16, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const d = 20;
  const sc = sun.shadow.camera;
  sc.left = -d; sc.right = d; sc.top = d; sc.bottom = -d; sc.near = 1; sc.far = 80;
  sc.updateProjectionMatrix();
  sun.shadow.bias = -0.0015;
  sun.target.position.set(13, 1, 8);
  scene.add(sun); scene.add(sun.target);
  const fill = new THREE.DirectionalLight(0xcfe0ee, 0.45);
  fill.position.set(-14, 10, -14); scene.add(fill);

  apt = buildApartment();
  scene.add(apt.group);
  shell = buildShell(); shell.visible = false; scene.add(shell);

  ROOMS.forEach(r => {
    const [lx, ly] = r.label;
    const s = makeLabel(r.name, r.sup.toFixed(2).replace('.', ',') + ' m²');
    s.position.copy(V(lx, ly, Math.min(ceilAt(lx, ly) - 0.35, 2.35)));
    s.visible = false; labels.push(s); scene.add(s);
  });

  markGroup = new THREE.Group(); scene.add(markGroup);
  zoneGroup = new THREE.Group(); scene.add(zoneGroup);
  loadZones();
  buildPortals();
  buildViewButtons();
  applyView(VIEWS[0]);
  bindControls();
  onResize();
  addEventListener('resize', onResize);
  requestAnimationFrame(loop);
}

/* --------------------- zonas transitables / puertas ------------------- */
function buildPortals() {
  WALLS.forEach(w => (w.holes || []).forEach(h => {
    if (h[3] < 1.9) return;                                  // sólo pasos, no ventanas
    const [ax, ay] = w.a, [bx, by] = w.b, L = Math.hypot(bx - ax, by - ay);
    const dx = (bx - ax) / L, dy = (by - ay) / L, e = w.t / 2 + 0.14;
    const cxa = ax + dx * (h[0] + 0.02), cya = ay + dy * (h[0] + 0.02);
    const cxb = ax + dx * (h[1] - 0.02), cyb = ay + dy * (h[1] - 0.02);
    portals.push([
      Math.min(cxa, cxb) - e * Math.abs(dy),
      Math.min(cya, cyb) - e * Math.abs(dx),
      Math.max(cxa, cxb) + e * Math.abs(dy),
      Math.max(cya, cyb) + e * Math.abs(dx)
    ]);
  }));
}
/** obstáculos macizos: pilares exentos y patinillos */
function blocked(x, y) {
  for (const p of PILLARS)
    if (Math.abs(x - p.x) < p.w / 2 && Math.abs(y - p.y) < p.d / 2) return true;
  for (const s of SHAFTS)
    if (x > s.x0 && x < s.x1 && y > s.y0 && y < s.y1) return true;
  return false;
}
/** ¿el punto pertenece al interior de la vivienda (unión de estancias)? */
function inside(x, y) {
  if (blocked(x, y)) return false;
  for (const r of ROOMS) for (const q of r.rects)
    if (x > q[0] && x < q[2] && y > q[1] && y < q[3]) return true;
  for (const d of DORMERS)
    if (x > d.x0 && x < d.x1 && y > d.y0 && y < d.y1) return true;
  for (const p of portals)
    if (x > p[0] && x < p[2] && y > p[1] && y < p[3]) return true;
  return false;
}
/** se comprueba el disco de radio RADIUS, no un rectángulo reducido, para
    que los umbrales entre estancias contiguas sigan siendo transitables */
const OFFS = [[0,0],[1,0],[-1,0],[0,1],[0,-1],[0.71,0.71],[-0.71,0.71],[0.71,-0.71],[-0.71,-0.71]];
function allowed(x, y) {
  for (const [ox, oy] of OFFS)
    if (!inside(x + ox * RADIUS, y + oy * RADIUS)) return false;
  return true;
}
function roomAt(x, y) {
  for (const r of ROOMS) {
    for (const q of r.rects) if (x >= q[0] && x <= q[2] && y >= q[1] && y <= q[3]) return r;
    for (const id of (r.dormers || [])) {
      const d = DORMERS.find(k => k.id === id);
      if (x >= d.x0 && x <= d.x1 && y >= d.y0 && y <= d.y1) return r;
    }
  }
  return null;
}

/* ------------------------------ controles ---------------------------- */
function bindControls() {
  const c = document.getElementById('view');
  let drag = false, lx = 0, ly = 0, btn = 0;

  let downX = 0, downY = 0;
  c.addEventListener('pointerdown', e => {
    drag = true; btn = e.button; lx = e.clientX; ly = e.clientY;
    downX = e.clientX; downY = e.clientY;
    c.setPointerCapture(e.pointerId); c.classList.add('grabbing');
  });
  c.addEventListener('pointerup', e => {
    drag = false; c.classList.remove('grabbing');
    if (e.button !== 0 || Math.hypot(e.clientX - downX, e.clientY - downY) >= 5) return;
    if (measuring) pick(e);
    else if (plafonding) pickZone(e);
  });
  c.addEventListener('pointercancel', () => { drag = false; c.classList.remove('grabbing'); });
  c.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
    if (mode === 'walk') {
      cam.yaw -= dx * 0.0045;
      cam.pitch = clamp(cam.pitch - dy * 0.0035, -1.2, 1.2);
    } else if (btn === 2 || e.shiftKey) {
      const s = orb.dist * 0.0016;
      orb.tx -= (Math.cos(orb.az) * dx - Math.sin(orb.az) * dy * 0.6) * s;
      orb.ty -= (Math.sin(orb.az) * dx + Math.cos(orb.az) * dy * 0.6) * s;
    } else {
      orb.az -= dx * 0.006;
      orb.el = clamp(orb.el - dy * 0.005, 0.06, 1.45);
    }
  });
  c.addEventListener('contextmenu', e => e.preventDefault());
  c.addEventListener('wheel', e => {
    e.preventDefault();
    if (mode === 'orbit') orb.dist = clamp(orb.dist * (1 + Math.sign(e.deltaY) * 0.12), 6, 70);
    else camera.fov = clamp(camera.fov + Math.sign(e.deltaY) * 3, 35, 92), camera.updateProjectionMatrix();
  }, { passive: false });

  addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) e.preventDefault();
  });
  addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

  document.getElementById('mode-walk').onclick = () => setMode('walk');
  document.getElementById('mode-orbit').onclick = () => setMode('orbit');
  document.getElementById('t-labels').onclick = e => toggle(e.currentTarget, v => labels.forEach(l => l.visible = v));
  document.getElementById('t-shell').onclick = e => toggle(e.currentTarget, v => shell.visible = v);
  document.getElementById('t-furn').onclick = e => toggle(e.currentTarget, v => {
    apt.furn.visible = v; apt.figs.visible = v;
  });
  document.getElementById('t-measure').onclick = e => toggle(e.currentTarget, v => {
    measuring = v;
    if (v) setPlafond(false);
    document.getElementById('measure').hidden = !v;
    document.querySelector('.hint').hidden = v || plafonding;
    if (v) renderMarks();
  });
  document.getElementById('t-plafond').onclick = e => toggle(e.currentTarget, v => setPlafond(v));
  document.getElementById('p-undo').onclick = () => {
    if (pending) pending = null; else zones.pop();
    renderZones();
  };
  document.getElementById('p-clear').onclick = () => { pending = null; zones = []; renderZones(); };
  document.getElementById('p-room').onclick = () => addRoomZone();
  document.getElementById('p-copy').onclick = () => copyTo('p-copy', zonesText());
  document.getElementById('p-h').oninput = () => { if (pending) renderZones(); };
  ['p-h', 'p-name'].forEach(id => document.getElementById(id)
    .addEventListener('keydown', e => e.stopPropagation()));
  document.getElementById('m-clear').onclick = () => { marks = []; renderMarks(); };
  document.getElementById('m-copy').onclick = () => copyTo('m-copy', marksText());
  document.getElementById('t-struct').onclick = e => toggle(e.currentTarget, v => {
    apt.pillars.material.color.set(v ? 0xd08a2a : 0xdcd4c6);
    apt.shafts.material.color.set(v ? 0x9c6a2e : 0xb9ab97);
  });
  document.getElementById('t-ceil').onclick = e => toggle(e.currentTarget, v => {
    apt.ceil.visible = v; syncZoneVis();
  });
  const hold = (id, k) => {
    const el = document.getElementById(id);
    const on = e => { e.preventDefault(); keys[k] = true; };
    const off = e => { e.preventDefault(); keys[k] = false; };
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointerleave', off);
    el.addEventListener('pointercancel', off);
  };
  hold('tp-fwd', 'w'); hold('tp-back', 's');

  document.getElementById('notes-btn').onclick = () => {
    const p = document.getElementById('notes');
    const open = p.classList.toggle('open');
    document.getElementById('notes-btn').setAttribute('aria-expanded', open);
  };
}
function toggle(el, fn) {
  const on = el.getAttribute('aria-pressed') !== 'true';
  el.setAttribute('aria-pressed', on); fn(on);
}
function setMode(m) {
  const prev = mode;
  mode = m;
  document.getElementById('mode-walk').setAttribute('aria-pressed', m === 'walk');
  document.getElementById('mode-orbit').setAttribute('aria-pressed', m === 'orbit');
  document.getElementById('hint-walk').hidden = m !== 'walk';
  document.getElementById('hint-orbit').hidden = m !== 'orbit';
  if (prev === m) return;
  // al pasar a maqueta se retira el techo para poder mirar dentro
  const cb = document.getElementById('t-ceil');
  const on = m === 'walk';
  cb.setAttribute('aria-pressed', on);
  apt.ceil.visible = on;
  syncZoneVis();
  if (m === 'orbit') { orb.tx = cam.x; orb.ty = cam.y; }
}
function buildViewButtons() {
  const nav = document.getElementById('views');
  VIEWS.forEach(v => {
    const b = document.createElement('button');
    b.className = 'view-btn'; b.type = 'button';
    b.innerHTML = '<span class="vn">' + v.name + '</span>';
    b.onclick = () => {
      setMode('walk');
      applyView(v);
      [...nav.children].forEach(k => k.setAttribute('aria-current', 'false'));
      b.setAttribute('aria-current', 'true');
    };
    nav.appendChild(b);
  });
  nav.firstChild.setAttribute('aria-current', 'true');
}

/* -------------------------------- bucle ------------------------------- */
let last = performance.now();
function loop(t) {
  const dt = Math.min((t - last) / 1000, 0.05); last = t;
  if (mode === 'walk') step(dt);
  place();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
function step(dt) {
  let f = 0, s = 0;
  if (keys['w'] || keys['arrowup']) f += 1;
  if (keys['s'] || keys['arrowdown']) f -= 1;
  if (keys['a'] || keys['arrowleft']) s -= 1;
  if (keys['d'] || keys['arrowright']) s += 1;
  if (!f && !s) return;
  const v = (keys['shift'] ? 3.4 : 1.6) * dt;
  const sx = Math.sin(cam.yaw), cy = Math.cos(cam.yaw);
  let dx = (-sx * f + cy * s) * v, dy = (cy * f + sx * s) * v;
  if (allowed(cam.x + dx, cam.y + dy)) { cam.x += dx; cam.y += dy; }
  else if (allowed(cam.x + dx, cam.y)) cam.x += dx;
  else if (allowed(cam.x, cam.y + dy)) cam.y += dy;
}
function place() {
  if (mode === 'walk') {
    const h = freeH(cam.x, cam.y);
    const eye = Math.min(cam.eye, Math.max(0.85, h - 0.14));
    camera.position.set(cam.x, eye, -cam.y);
    const dir = new THREE.Vector3(
      -Math.sin(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), -Math.cos(cam.yaw) * Math.cos(cam.pitch));
    camera.lookAt(camera.position.clone().add(dir));
    hud(h, eye);
  } else {
    const cx = orb.tx, cy = orb.ty;
    const p = new THREE.Vector3(
      cx + orb.dist * Math.cos(orb.el) * Math.sin(orb.az),
      orb.tz + orb.dist * Math.sin(orb.el),
      -cy + orb.dist * Math.cos(orb.el) * Math.cos(orb.az));
    camera.position.copy(p);
    camera.lookAt(cx, orb.tz, -cy);
    hud(freeH(cx, cy), null);
  }
}
function hud(h, eye) {
  const px = mode === 'walk' ? cam.x : orb.tx, py = mode === 'walk' ? cam.y : orb.ty;
  const r = roomAt(px, py);
  document.getElementById('hud-room').textContent = r ? r.name : '—';
  const ft = plafondAt(px, py);
  document.getElementById('hud-h').textContent = h.toFixed(2).replace('.', ',') + ' m' +
    (ft !== null && ft <= ceilAt(px, py) ? '  ·  falso techo' : '');
  const low = document.getElementById('hud-low');
  low.hidden = !(eye !== null && eye < cam.eye - 0.02);
  document.getElementById('hud-xy').textContent =
    (mode === 'walk' ? cam.x : orb.tx).toFixed(1).replace('.', ',') + ' / ' +
    (mode === 'walk' ? cam.y : orb.ty).toFixed(1).replace('.', ',');
}
function onResize() {
  const c = document.getElementById('view');
  const w = c.clientWidth, h = c.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* -------------------------- medición --------------------------------- */
const _ray = new THREE.Raycaster();
const _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);   // suelo, z = 0
const _hit = new THREE.Vector3();

/** punto del suelo (z = 0) bajo el cursor */
function floorHit(e) {
  const c = document.getElementById('view'), r = c.getBoundingClientRect();
  const nd = new THREE.Vector2(
    ((e.clientX - r.left) / r.width) * 2 - 1,
    -((e.clientY - r.top) / r.height) * 2 + 1);
  _ray.setFromCamera(nd, camera);
  if (!_ray.ray.intersectPlane(_plane, _hit)) return null;
  return { x: +_hit.x.toFixed(2), y: +(-_hit.z).toFixed(2) };
}

function pick(e) {
  const p = floorHit(e); if (!p) return;
  const room = roomAt(p.x, p.y);
  marks.push({ x: p.x, y: p.y, room: room ? room.name : '—', h: +ceilAt(p.x, p.y).toFixed(2) });
  renderMarks();
}

const n2 = v => v.toFixed(2).replace('.', ',');

function renderMarks() {
  const ul = document.getElementById('m-list');
  ul.innerHTML = marks.length ? '' : '<li class="m-empty">Sin puntos todavía.</li>';
  marks.forEach((m, i) => {
    const li = document.createElement('li');
    li.innerHTML = '<b>' + (i + 1) + '</b><span>' + m.room + '</span>' +
                   n2(m.x) + ' / ' + n2(m.y);
    ul.appendChild(li);
  });
  ul.scrollTop = ul.scrollHeight;

  const box = document.getElementById('m-rect');
  if (marks.length >= 2) {
    const a = marks[marks.length - 2], b = marks[marks.length - 1];
    const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x);
    const y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
    box.hidden = false;
    box.innerHTML = '<em>▭</em> ' + n2(x0) + ' ' + n2(y0) + ' → ' + n2(x1) + ' ' + n2(y1) +
                    '<br><em>&nbsp;&nbsp;</em> ' + n2(x1 - x0) + ' × ' + n2(y1 - y0) + ' m';
  } else box.hidden = true;

  // marcadores en la escena
  while (markGroup.children.length) markGroup.remove(markGroup.children[0]);
  const mat = new THREE.MeshBasicMaterial({ color: 0xd08a2a, depthTest: false });
  marks.forEach(m => {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 10), mat);
    pin.position.set(m.x, 0.6, -m.y); pin.renderOrder = 5; markGroup.add(pin);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 8), mat);
    cap.position.set(m.x, 1.25, -m.y); cap.renderOrder = 5; markGroup.add(cap);
  });
}

function marksText() {
  const L = ['Puntos marcados (x / y en metros, sistema del plano a04;',
             'z = 0 en el pavimento acabado, +118,00):'];
  marks.forEach((m, i) => L.push(
    (i + 1) + '. ' + m.room + '  x=' + n2(m.x) + '  y=' + n2(m.y) +
    '  (techo actual ' + n2(m.h) + ' m)'));
  for (let i = 0; i + 1 < marks.length; i += 2) {
    const a = marks[i], b = marks[i + 1];
    const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x);
    const y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
    L.push('rect ' + (i / 2 + 1) + ': [' + n2(x0) + ', ' + n2(y0) + ', ' +
           n2(x1) + ', ' + n2(y1) + ']   ' + n2(x1 - x0) + ' × ' + n2(y1 - y0) + ' m' +
           '   falso techo a ___ m');
  }
  return L.join('\n');
}

/* ------------------------ falsos techos ------------------------------
   Cada zona es un rectángulo con su propia altura, así que una estancia
   puede llevar todas las que haga falta. Donde se solapan manda la más
   baja, que es la que se ve y bajo la que se anda.
   -------------------------------------------------------------------- */
const STORE = 'piso-b-falsos-techos';

function setPlafond(v) {
  plafonding = v;
  document.getElementById('t-plafond').setAttribute('aria-pressed', v);
  document.getElementById('plafond').hidden = !v;
  if (v && measuring) {
    measuring = false;
    document.getElementById('t-measure').setAttribute('aria-pressed', false);
    document.getElementById('measure').hidden = true;
  }
  document.querySelector('.hint').hidden = v || measuring;
  syncZoneVis();
  if (v) { pending = null; renderZones(); }
}
/** en maqueta el techo se retira para mirar dentro; las bandas de pladur
    sólo se mantienen si se está trabajando con ellas */
function syncZoneVis() {
  if (!zoneGroup) return;
  zoneGroup.visible = plafonding || !apt || apt.ceil.visible;
}

/** altura del falso techo en (x,y), o null si no hay */
function plafondAt(x, y) {
  let h = null;
  for (const z of zones)
    if (x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1)
      h = h === null ? z.h : Math.min(h, z.h);
  return h;
}
/** altura libre real: faldón o falso techo, lo que quede más bajo */
function freeH(x, y) {
  const s = ceilAt(x, y), p = plafondAt(x, y);
  return p === null ? s : Math.min(s, p);
}

function pickZone(e) {
  const p = floorHit(e); if (!p) return;
  if (!pending) { pending = p; renderZones(); return; }
  const x0 = Math.min(pending.x, p.x), x1 = Math.max(pending.x, p.x);
  const y0 = Math.min(pending.y, p.y), y1 = Math.max(pending.y, p.y);
  pending = null;
  if (x1 - x0 < 0.05 || y1 - y0 < 0.05) { renderZones(); return; }
  pushZone(x0, y0, x1, y1);
}
/** la estancia entera bajo el punto de vista actual */
function addRoomZone() {
  const x = mode === 'walk' ? cam.x : orb.tx, y = mode === 'walk' ? cam.y : orb.ty;
  const r = roomAt(x, y);
  if (!r) return;
  const q = r.rects.find(k => x >= k[0] && x <= k[2] && y >= k[1] && y <= k[3]) || r.rects[0];
  pushZone(q[0], q[1], q[2], q[3], r.name);
}
function pushZone(x0, y0, x1, y1, fallback) {
  const hi = document.getElementById('p-h');
  const h = clamp(parseFloat(String(hi.value).replace(',', '.')) || 2.5, 1.5, 6);
  const ni = document.getElementById('p-name');
  const room = roomAt((x0 + x1) / 2, (y0 + y1) / 2);
  zones.push({
    x0: +x0.toFixed(2), y0: +y0.toFixed(2), x1: +x1.toFixed(2), y1: +y1.toFixed(2),
    h: +h.toFixed(2),
    room: room ? room.name : (fallback || '—'),
    name: ni.value.trim()
  });
  ni.value = '';
  renderZones();
}

function renderZones() {
  document.getElementById('p-step').innerHTML = pending
    ? '<b>2.</b> Clic en la esquina opuesta. La zona se creará a ' +
      n2(clamp(parseFloat(String(document.getElementById('p-h').value).replace(',', '.')) || 2.5, 1.5, 6)) + ' m.'
    : '<b>1.</b> Clic en una esquina de la zona en el suelo. Puedes añadir todas las que quieras en la misma estancia.';

  const ul = document.getElementById('p-list');
  ul.innerHTML = '';
  if (!zones.length) {
    const li = document.createElement('li');
    li.className = 'p-empty';
    li.textContent = 'Ninguna zona todavía.';
    ul.appendChild(li);
  }
  zones.forEach((z, i) => {
    const li = document.createElement('li');
    const nm = document.createElement('span');
    nm.className = 'pn';
    nm.textContent = z.room + (z.name ? ' · ' + z.name : '');
    const hh = document.createElement('span');
    hh.className = 'ph'; hh.textContent = n2(z.h) + ' m';
    const del = document.createElement('button');
    del.className = 'p-del'; del.type = 'button';
    del.setAttribute('aria-label', 'Quitar zona ' + (i + 1));
    del.textContent = '✕';
    del.onclick = () => { zones.splice(i, 1); renderZones(); };
    li.append(nm, hh, del);
    ul.appendChild(li);
  });
  ul.scrollTop = ul.scrollHeight;

  saveZones();
  drawZones();
}

function drawZones() {
  while (zoneGroup.children.length) zoneGroup.remove(zoneGroup.children[0]);
  const face = new THREE.MeshLambertMaterial({
    color: 0xf0e6d2, side: THREE.DoubleSide, transparent: true, opacity: 0.94
  });
  const edge = new THREE.MeshBasicMaterial({ color: 0xd08a2a });
  zones.forEach(z => {
    const w = z.x1 - z.x0, d = z.y1 - z.y0;
    const g = new THREE.BoxGeometry(w, 0.05, d);
    const m = new THREE.Mesh(g, face);
    m.position.set((z.x0 + z.x1) / 2, z.h + 0.025, -(z.y0 + z.y1) / 2);
    m.castShadow = m.receiveShadow = true;
    zoneGroup.add(m);
    const pts = [[z.x0, z.y0], [z.x1, z.y0], [z.x1, z.y1], [z.x0, z.y1], [z.x0, z.y0]];
    for (let i = 0; i < 4; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      const L = Math.hypot(bx - ax, by - ay);
      const b = new THREE.Mesh(new THREE.BoxGeometry(
        Math.abs(bx - ax) > 0.001 ? L : 0.028, 0.058,
        Math.abs(by - ay) > 0.001 ? L : 0.028), edge);
      b.position.set((ax + bx) / 2, z.h + 0.026, -(ay + by) / 2);
      zoneGroup.add(b);
    }
  });
  if (pending) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 10),
                               new THREE.MeshBasicMaterial({ color: 0xd08a2a, depthTest: false }));
    pin.position.set(pending.x, 0.6, -pending.y); pin.renderOrder = 5;
    zoneGroup.add(pin);
  }
}

function zonesText() {
  const L = ['Falsos techos de pladur — piso B, planta bajocubierta.',
             'x / y en metros, sistema del plano a04; z = 0 en el pavimento (+118,00).',
             'h = altura libre bajo el falso techo.', ''];
  zones.forEach((z, i) => L.push(
    (i + 1) + '. ' + z.room + (z.name ? ' · ' + z.name : '') +
    '\n   [' + n2(z.x0) + ', ' + n2(z.y0) + ', ' + n2(z.x1) + ', ' + n2(z.y1) + ']' +
    '   ' + n2(z.x1 - z.x0) + ' × ' + n2(z.y1 - z.y0) + ' m' +
    '   h = ' + n2(z.h) + ' m'));
  L.push('', 'CEILINGS = [');
  zones.forEach(z => L.push(
    '  { x0:' + z.x0.toFixed(2) + ', y0:' + z.y0.toFixed(2) +
    ', x1:' + z.x1.toFixed(2) + ', y1:' + z.y1.toFixed(2) +
    ', h:' + z.h.toFixed(2) + ", name:'" + (z.name || z.room).replace(/'/g, '') + "' },"));
  L.push('];');
  return L.join('\n');
}

function copyTo(id, text) {
  const b = document.getElementById(id), t = b.textContent;
  const ok = () => { b.textContent = 'Copiado'; setTimeout(() => { b.textContent = t; }, 1200); };
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(ok, () => fallback());
  else fallback();
  function fallback() {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); ok(); } catch (_) {}
    document.body.removeChild(ta);
  }
}

function saveZones() {
  try { localStorage.setItem(STORE, JSON.stringify({ base: baseSig(), zones })); } catch (_) {}
}
/** firma de las zonas ya incorporadas al modelo: si cambian, el borrador
    guardado en el navegador queda obsoleto y manda el modelo */
function baseSig() { return JSON.stringify(CEILINGS); }

function loadZones() {
  zones = CEILINGS.map(z => Object.assign({
    room: (roomAt((z.x0 + z.x1) / 2, (z.y0 + z.y1) / 2) || {}).name || '—', name: ''
  }, z));
  try {
    const s = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (s && Array.isArray(s.zones) && s.zones.length && s.base === baseSig()) zones = s.zones;
  } catch (_) {}
  renderZones();
}

/** coloca la cámara en pos mirando a look[x,y,z] */
function applyView(v) {
  cam.x = v.pos[0]; cam.y = v.pos[1];
  const dx = v.look[0] - cam.x, dy = v.look[1] - cam.y;
  const d = Math.hypot(dx, dy) || 1;
  const h = freeH(cam.x, cam.y);
  const eye = Math.min(cam.eye, Math.max(0.85, h - 0.14));
  cam.yaw = Math.atan2(-dx, dy);
  cam.pitch = clamp(Math.atan2(v.look[2] - eye, d), -0.9, 0.9);
}
