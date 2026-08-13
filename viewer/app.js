/* =====================================================================
   Visor — cámara, controles, HUD
   ===================================================================== */
let renderer, scene, camera, apt, shell, labels = [], portals = [];
let pladurOn = true;
let plafonding = false, zones = [], pending = null, zoneGroup = null, selZone = -1;
let mode = 'walk';
const cam = { x: 11.15, y: -10.05, yaw: Math.PI, pitch: 0.10, eye: 1.62 };
const orb = { tx: 13.4, ty: -8.6, tz: -1.4, dist: 36, az: -0.62, el: 0.34 };
const EL_MIN = 0.02, EL_MAX = 1.553;               // hasta 89°: cenital de verdad
/* en maqueta se usa un ángulo de visión estrecho: la maqueta se lee casi
   como una axonometría y las paredes dejan de abrirse hacia los bordes */
const ORBIT_FOV = 32; let walkFov = 68;
let orbAnim = null, orbSeen = false;
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

  scene.add(buildBase());
  apt = buildApartment();
  scene.add(apt.group);
  shell = buildShell(); shell.visible = false; scene.add(shell);

  ROOMS.forEach(r => {
    const [lx, ly] = r.label;
    const s = makeLabel(r.name, r.sup.toFixed(2).replace('.', ',') + ' m²');
    s.position.copy(V(lx, ly, Math.min(ceilAt(lx, ly) - 0.35, 2.35)));
    s.visible = false; labels.push(s); scene.add(s);
  });

  planInit();
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
    if (plafonding) pickZone(e);
  });
  c.addEventListener('pointercancel', () => { drag = false; c.classList.remove('grabbing'); });
  c.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
    if (mode === 'walk') {
      cam.yaw -= dx * 0.0045;
      cam.pitch = clamp(cam.pitch - dy * 0.0035, -1.2, 1.2);
    } else if (btn === 1 || btn === 2 || e.shiftKey) {
      orbAnim = null;
      const s = orb.dist * 0.0016;
      orb.tx -= (Math.cos(orb.az) * dx - Math.sin(orb.az) * dy * 0.6) * s;
      orb.ty -= (Math.sin(orb.az) * dx + Math.cos(orb.az) * dy * 0.6) * s;
    } else {
      orbAnim = null;
      orb.az -= dx * 0.006;
      orb.el = clamp(orb.el - dy * 0.005, EL_MIN, EL_MAX);
    }
  });
  c.addEventListener('contextmenu', e => e.preventDefault());
  c.addEventListener('wheel', e => {
    e.preventDefault();
    if (mode === 'orbit') orbZoom(Math.sign(e.deltaY), e);
    else { walkFov = clamp(walkFov + Math.sign(e.deltaY) * 3, 35, 92);
           camera.fov = walkFov; camera.updateProjectionMatrix(); }
  }, { passive: false });

  addEventListener('keydown', e => {
    if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName || '')) return;
    keys[e.key.toLowerCase()] = true;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) e.preventDefault();
    if (mode !== 'orbit') return;
    const k = { Home:'fit', '1':'fit', '2':'top', '3':'iso', '4':'n', '5':'s', '6':'e', '7':'o' }[e.key];
    if (k) orbView(k);
  });
  addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

  document.getElementById('mode-walk').onclick = () => setMode('walk');
  document.getElementById('mode-orbit').onclick = () => setMode('orbit');
  document.getElementById('mode-plan').onclick = () => setMode('plan');
  bindPlan();
  bindOrbTools();
  document.getElementById('t-labels').onclick = e => toggle(e.currentTarget, v => labels.forEach(l => l.visible = v));
  document.getElementById('t-shell').onclick = e => toggle(e.currentTarget, v => shell.visible = v);
  document.getElementById('t-furn').onclick = e => toggle(e.currentTarget, v => {
    apt.furn.visible = v; apt.figs.visible = v;
  });
  document.getElementById('t-pladur').onclick = e => toggle(e.currentTarget, v => {
    pladurOn = v; syncZoneVis();
  });
  document.getElementById('t-plafond').onclick = e => toggle(e.currentTarget, v => setPlafond(v));
  document.getElementById('t-labels').addEventListener('click', () => { plan.dirty = true; });
  document.getElementById('p-undo').onclick = () => {
    if (pending) pending = null; else zones.pop();
    selZone = -1; renderZones();
  };
  document.getElementById('p-clear').onclick = () => {
    pending = null; zones = []; selZone = -1; renderZones();
  };
  document.getElementById('p-room').onclick = () => addRoomZone();
  document.getElementById('p-copy').onclick = () => copyTo('p-copy', zonesText());
  document.getElementById('p-h').oninput = () => {
    plan.dirty = true;
    if (selZone >= 0) {
      const v = parseFloat(String(document.getElementById('p-h').value).replace(',', '.'));
      if (v >= 1.5 && v <= 6) { zones[selZone].h = +v.toFixed(2); renderZones(); return; }
    }
    if (pending) renderZones();
  };
  document.getElementById('p-name').oninput = () => {
    if (selZone >= 0) { zones[selZone].name = document.getElementById('p-name').value.trim(); renderZones(); }
  };
  ['p-h', 'p-name'].forEach(id => document.getElementById(id)
    .addEventListener('keydown', e => e.stopPropagation()));
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
  ['walk','orbit','plan'].forEach(k =>
    document.getElementById('mode-' + k).setAttribute('aria-pressed', m === k));
  ['walk','orbit','plan'].forEach(k =>
    document.getElementById('hint-' + k).hidden = m !== k);
  document.getElementById('plan').hidden = m !== 'plan';
  document.getElementById('view').style.visibility = m === 'plan' ? 'hidden' : '';
  document.getElementById('touchpad').style.display = m === 'walk' ? '' : 'none';
  document.getElementById('index-panel').style.display = m === 'plan' ? 'none' : '';
  document.getElementById('orbtools').hidden = m !== 'orbit';
  if (m === 'plan') { if (!plan.fitted) planFit(); plan.dirty = true; }
  if (prev === m) return;
  // al pasar a maqueta se retira el techo para poder mirar dentro
  const cb = document.getElementById('t-ceil');
  const on = m === 'walk';
  cb.setAttribute('aria-pressed', on);
  apt.ceil.visible = on;
  syncZoneVis();
  if (m === 'orbit') { orb.tx = cam.x; orb.ty = cam.y; if (!orbSeen) { orbSeen = true; orbView('fit'); } }
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
  if (mode === 'plan') {
    if (plan.dirty) drawPlan();
    hudPlan();
  } else {
    if (mode === 'walk') step(dt);
    else orbStep(dt);
    place();
    renderer.render(scene, camera);
  }
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
  const wantFov = mode === 'orbit' ? ORBIT_FOV : walkFov;
  if (Math.abs(camera.fov - wantFov) > 0.01) { camera.fov = wantFov; camera.updateProjectionMatrix(); }
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
    updateCompass();
    hud(freeH(cx, cy), null);
  }
}
function updateCompass() {
  const n = document.getElementById('ot-compass');
  if (n) n.firstElementChild.style.transform = 'rotate(' + (-orb.az * 180 / Math.PI) + 'deg)';
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
  plan.dirty = true;
  const c = document.getElementById('view');
  const w = c.clientWidth, h = c.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* --------------------- utilidades de puntero -------------------------- */
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


const n2 = v => v.toFixed(2).replace('.', ',');

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
  document.querySelector('.hint').hidden = v;
  syncZoneVis();
  if (v) { pending = null; renderZones(); }
}
/** el botón «Pladur» muestra u oculta las bandas; con la herramienta de
    falso techo abierta se fuerzan visibles, que si no se editaría a ciegas */
function syncZoneVis() {
  if (!zoneGroup) return;
  zoneGroup.visible = pladurOn || plafonding;
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
  const x = mode === 'walk' ? cam.x : mode === 'plan' ? plan.cx : orb.tx;
  const y = mode === 'walk' ? cam.y : mode === 'plan' ? plan.cy : orb.ty;
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
  renderZones();
}

function renderZones() {
  if (selZone >= zones.length) selZone = -1;
  document.getElementById('p-step').innerHTML = pending
    ? '<b>2.</b> Clic en la esquina opuesta. La zona se creará a ' +
      n2(clamp(parseFloat(String(document.getElementById('p-h').value).replace(',', '.')) || 2.5, 1.5, 6)) + ' m.'
    : selZone >= 0
      ? '<b>Zona ' + (selZone + 1) + ' seleccionada.</b> Arrastra los tiradores para ' +
        'alargarla o ensancharla, o el interior para moverla. La altura de aquí abajo ' +
        'se le aplica. <kbd>Supr</kbd> la borra, <kbd>esc</kbd> deselecciona.'
      : '<b>1.</b> Clic en una esquina de la zona. Clic sobre una banda ya hecha para ' +
        'seleccionarla y poder modificarla.';

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
    del.onclick = ev => { ev.stopPropagation(); zones.splice(i, 1); selZone = -1; renderZones(); };
    if (i === selZone) li.classList.add('sel');
    li.onclick = () => selectZone(i === selZone ? -1 : i);
    li.append(nm, hh, del);
    ul.appendChild(li);
  });
  ul.scrollTop = ul.scrollHeight;

  saveZones();
  drawZones();
  plan.dirty = true;
}

/* Las bandas contiguas a la misma cota forman un solo plano: sólo se
   cierran los cantos libres. Cada lado se recorre en tramos de 5 cm y se
   emite únicamente donde no hay otra zona a la misma altura al otro lado,
   de modo que dos rectángulos que se tocan no dejan junta a la vista.   */
const ZT = 0.05;                                   // canto de la placa
function zoneAt(x, y, h, skip) {
  for (let i = 0; i < zones.length; i++) {
    if (i === skip) continue;
    const z = zones[i];
    if (Math.abs(z.h - h) < 0.005 &&
        x > z.x0 - 1e-6 && x < z.x1 + 1e-6 && y > z.y0 - 1e-6 && y < z.y1 + 1e-6) return true;
  }
  return false;
}
/** tramos libres de un lado: t va de a a b y `probe` da el punto exterior */
function freeRuns(a, b, probe, h, idx) {
  const st = 0.05, out = []; let s = null;
  for (let t = a; t < b - 1e-9; t += st) {
    const m = Math.min(t + st / 2, b);
    const [px, py] = probe(m);
    const free = !zoneAt(px, py, h, idx);
    if (free && s === null) s = t;
    if (!free && s !== null) { out.push([s, t]); s = null; }
  }
  if (s !== null) out.push([s, b]);
  return out;
}
function drawZones() {
  while (zoneGroup.children.length) zoneGroup.remove(zoneGroup.children[0]);
  const Mf = new Mesher(), Me = new Mesher();
  zones.forEach((z, i) => {
    const zb = z.h, zt = z.h + ZT;
    Mf.quad(V(z.x0,z.y0,zt), V(z.x1,z.y0,zt), V(z.x1,z.y1,zt), V(z.x0,z.y1,zt));   // trasdós
    Mf.quad(V(z.x0,z.y1,zb), V(z.x1,z.y1,zb), V(z.x1,z.y0,zb), V(z.x0,z.y0,zb));   // cara vista
    const sides = [
      { a:z.x0, b:z.x1, probe:t => [t, z.y0 - 0.03], seg:(u0,u1) => [[u0,z.y0],[u1,z.y0]] },
      { a:z.x0, b:z.x1, probe:t => [t, z.y1 + 0.03], seg:(u0,u1) => [[u0,z.y1],[u1,z.y1]] },
      { a:z.y0, b:z.y1, probe:t => [z.x0 - 0.03, t], seg:(u0,u1) => [[z.x0,u0],[z.x0,u1]] },
      { a:z.y0, b:z.y1, probe:t => [z.x1 + 0.03, t], seg:(u0,u1) => [[z.x1,u0],[z.x1,u1]] }
    ];
    sides.forEach(s => freeRuns(s.a, s.b, s.probe, z.h, i).forEach(([u0, u1]) => {
      const [p, q] = s.seg(u0, u1);
      Mf.quad(V(p[0],p[1],zb), V(q[0],q[1],zb), V(q[0],q[1],zt), V(p[0],p[1],zt));
      const e = 0.014, dx = q[0]-p[0], dy = q[1]-p[1], L = Math.hypot(dx,dy) || 1;
      const nx = -dy/L*e, ny = dx/L*e;
      Me.box([V(p[0]-nx,p[1]-ny,zb), V(q[0]-nx,q[1]-ny,zb), V(q[0]+nx,q[1]+ny,zb), V(p[0]+nx,p[1]+ny,zb)],
             [V(p[0]-nx,p[1]-ny,zt+0.004), V(q[0]-nx,q[1]-ny,zt+0.004),
              V(q[0]+nx,q[1]+ny,zt+0.004), V(p[0]+nx,p[1]+ny,zt+0.004)]);
    }));
  });
  if (!Mf.empty) {
    const m = new THREE.Mesh(Mf.geometry(),
      new THREE.MeshLambertMaterial({ color: 0xf0e6d2, side: THREE.DoubleSide }));
    m.castShadow = m.receiveShadow = true; zoneGroup.add(m);
  }
  if (!Me.empty) zoneGroup.add(new THREE.Mesh(Me.geometry(),
    new THREE.MeshLambertMaterial({ color: 0xd8a25c, side: THREE.DoubleSide })));
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

/* =====================================================================
   NAVEGACIÓN DE LA MAQUETA
   Vistas encajadas (cenital, isométrica y los cuatro alzados), zoom
   hacia el punto del cursor, desplazamiento con el botón central o con
   las flechas, y una brújula que dice hacia dónde cae el Norte.
   ===================================================================== */
/** envolvente de lo que hay que encajar */
function modelBox(onlyFlat) {
  let b = { x0: 1e9, y0: 1e9, z0: 1e9, x1: -1e9, y1: -1e9, z1: -1e9 };
  const add = (x, y, z) => {
    b.x0 = Math.min(b.x0, x); b.x1 = Math.max(b.x1, x);
    b.y0 = Math.min(b.y0, y); b.y1 = Math.max(b.y1, y);
    b.z0 = Math.min(b.z0, z); b.z1 = Math.max(b.z1, z);
  };
  ROOMS.forEach(r => r.rects.forEach(q => {
    add(q[0], q[1], 0); add(q[2], q[3], Math.max(ceilAt(q[0], q[1]), ceilAt(q[2], q[3])));
  }));
  add(ROOF.gableSx, ROOF.ridgeY, ROOF.H + 0.4);
  if (!onlyFlat) BASE_MASS.forEach(r => { add(r[0], r[1], Z_PB); add(r[2], r[3], 0); });
  return b;
}
/** distancia a la que la envolvente entra justa en el encuadre desde
    una dirección dada: se proyectan las ocho esquinas sobre los ejes de
    pantalla, en vez de usar la esfera envolvente, que sobra por todos lados */
function fitDist(b, az, el, k) {
  const e = Math.min(el, 1.5);
  const f = new THREE.Vector3(-Math.cos(e) * Math.sin(az), -Math.sin(e), -Math.cos(e) * Math.cos(az));
  const right = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(right, f).normalize();
  const c = new THREE.Vector3((b.x0 + b.x1) / 2, (b.z0 + b.z1) / 2, -(b.y0 + b.y1) / 2);
  const fv = ORBIT_FOV * Math.PI / 180;
  const fh = 2 * Math.atan(Math.tan(fv / 2) * Math.max(0.35, camera.aspect));
  const th = Math.tan(fh / 2) / (k || 1.06), tv = Math.tan(fv / 2) / (k || 1.06);
  let d = 0;
  /* para cada esquina: |v·derecha| ≤ (v·frente + d)·tan(fh/2)  →  despejar d */
  for (const X of [b.x0, b.x1]) for (const Y of [b.y0, b.y1]) for (const Z of [b.z0, b.z1]) {
    const v = new THREE.Vector3(X, Z, -Y).sub(c), p = v.dot(f);
    d = Math.max(d, Math.abs(v.dot(right)) / th - p, Math.abs(v.dot(up)) / tv - p);
  }
  return clamp(d, 7, 140);
}
/** lleva la órbita a un destino con una transición corta */
function orbGoto(to, ms) {
  const from = { az: orb.az, el: orb.el, dist: orb.dist, tx: orb.tx, ty: orb.ty, tz: orb.tz };
  const t = Object.assign({}, from, to);
  while (t.az - from.az > Math.PI) t.az -= 2 * Math.PI;    // por el camino corto
  while (t.az - from.az < -Math.PI) t.az += 2 * Math.PI;
  orbAnim = { from, to: t, t0: performance.now(), ms: ms === undefined ? 520 : ms };
}
function orbView(kind) {
  const b = modelBox(kind === 'top');    // la cenital encuadra la vivienda; el resto, el edificio
  const c = { tx: (b.x0 + b.x1) / 2, ty: (b.y0 + b.y1) / 2, tz: (b.z0 + b.z1) / 2 };
  const V = {
    fit:  { az: -0.62, el: 0.34 },
    top:  { az: 0,     el: EL_MAX },
    iso:  { az: -0.68, el: 0.60 },
    n:    { az: Math.PI, el: 0.12 },
    s:    { az: 0,        el: 0.12 },
    e:    { az: -Math.PI / 2, el: 0.12 },
    o:    { az:  Math.PI / 2, el: 0.12 }
  }[kind];
  if (!V) return;
  const k = /^[nseo]$/.test(kind) ? 1.12 : 1.08;
  orbGoto(Object.assign({ dist: fitDist(b, V.az, V.el, k) }, c, V));
}
/** acerca o aleja manteniendo bajo el cursor el punto del suelo señalado */
function orbZoom(dir, e) {
  orbAnim = null;
  const before = orb.dist;
  orb.dist = clamp(orb.dist * (1 + dir * 0.12), 6, 140);
  if (!e) return;
  const c = document.getElementById('view'), r = c.getBoundingClientRect();
  const nd = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1,
                               -((e.clientY - r.top) / r.height) * 2 + 1);
  _ray.setFromCamera(nd, camera);
  const pl = new THREE.Plane(new THREE.Vector3(0, 1, 0), -orb.tz);
  const hit = new THREE.Vector3();
  if (!_ray.ray.intersectPlane(pl, hit)) return;
  const k = 1 - orb.dist / before;
  orb.tx += (hit.x - orb.tx) * k;
  orb.ty += (-hit.z - orb.ty) * k;
}
/** desplaza el objetivo en el plano de la pantalla */
function orbPan(sx, sy) {
  orbAnim = null;
  const s = orb.dist * 0.02;
  orb.tx += (Math.cos(orb.az) * sx - Math.sin(orb.az) * sy) * s;
  orb.ty += (Math.sin(orb.az) * sx + Math.cos(orb.az) * sy) * s;
}
function orbStep(dt) {
  let sx = 0, sy = 0;
  if (keys['a'] || keys['arrowleft'])  sx -= 1;
  if (keys['d'] || keys['arrowright']) sx += 1;
  if (keys['w'] || keys['arrowup'])    sy += 1;
  if (keys['s'] || keys['arrowdown'])  sy -= 1;
  if (sx || sy) orbPan(sx * dt * 42, sy * dt * 42);
  if (keys['+'] || keys['='])  orbZoom(-1 * dt * 8);
  if (keys['-'] || keys['_'])  orbZoom( 1 * dt * 8);
  if (!orbAnim) return;
  const u = clamp((performance.now() - orbAnim.t0) / orbAnim.ms, 0, 1);
  const k = u < 0.5 ? 4*u*u*u : 1 - Math.pow(-2*u + 2, 3) / 2;      // suavizado
  for (const p of ['az','el','dist','tx','ty','tz'])
    orb[p] = orbAnim.from[p] + (orbAnim.to[p] - orbAnim.from[p]) * k;
  if (u >= 1) orbAnim = null;
}
function bindOrbTools() {
  document.querySelectorAll('#orbtools [data-orb]').forEach(b => {
    b.onclick = () => {
      const k = b.dataset.orb;
      if (k === 'in') orbZoom(-1);
      else if (k === 'out') orbZoom(1);
      else orbView(k);
    };
  });
}

/* =====================================================================
   VISTA EN PLANTA
   Dibujo 2D a escala sobre canvas: muros con sus huecos, pilares,
   patinillos, cumbreras y las zonas de falso techo. Es donde se trabajan
   los falsos techos: el punto se imanta a las caras de muro y a las
   esquinas, y mientras se teclea una altura se sombrea la parte donde el
   faldón ya está por debajo de ella.
   ===================================================================== */
const plan = { cx: 13.3, cy: -8.0, s: 46, hover: null, dirty: true, fitted: false };
let planCtx = null, SNAPX = [], SNAPY = [];

function planInit() {
  const c = document.getElementById('plan');
  planCtx = c.getContext('2d');
  const push = (a, v) => { if (a.indexOf(+v.toFixed(3)) < 0) a.push(+v.toFixed(3)); };
  WALLS.forEach(w => {
    const [ax, ay] = w.a, [bx, by] = w.b;
    const h = Math.abs(by - ay) < 1e-6;
    if (h) { push(SNAPY, ay - w.t/2); push(SNAPY, ay + w.t/2); push(SNAPX, ax); push(SNAPX, bx); }
    else   { push(SNAPX, ax - w.t/2); push(SNAPX, ax + w.t/2); push(SNAPY, ay); push(SNAPY, by); }
    (w.holes || []).forEach(k => {
      const L = Math.hypot(bx - ax, by - ay), dx = (bx - ax)/L, dy = (by - ay)/L;
      [k[0], k[1]].forEach(u => { push(SNAPX, ax + dx*u); push(SNAPY, ay + dy*u); });
    });
  });
  ROOMS.forEach(r => r.rects.forEach(q => {
    push(SNAPX, q[0]); push(SNAPX, q[2]); push(SNAPY, q[1]); push(SNAPY, q[3]);
  }));
  SHAFTS.forEach(s => { push(SNAPX, s.x0); push(SNAPX, s.x1); push(SNAPY, s.y0); push(SNAPY, s.y1); });
  PILLARS.forEach(p => { push(SNAPX, p.x - p.w/2); push(SNAPX, p.x + p.w/2);
                         push(SNAPY, p.y - p.d/2); push(SNAPY, p.y + p.d/2); });
  SNAPX.sort((a, b) => a - b); SNAPY.sort((a, b) => a - b);
}
function planFit() {
  const c = document.getElementById('plan');
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  ROOMS.forEach(r => r.rects.forEach(q => {
    x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]);
    x1 = Math.max(x1, q[2]); y1 = Math.max(y1, q[3]);
  }));
  plan.cx = (x0 + x1) / 2; plan.cy = (y0 + y1) / 2;
  plan.s = Math.min((c.clientWidth - 130) / (x1 - x0 + 1.6),
                    (c.clientHeight - 190) / (y1 - y0 + 1.6));
  plan.s = clamp(plan.s, 8, 260);
  plan.fitted = true;
}
const pX = x => (x - plan.cx) * plan.s + planCtx.canvas.clientWidth / 2;
const pY = y => (plan.cy - y) * plan.s + planCtx.canvas.clientHeight / 2;
const mX = px => (px - planCtx.canvas.clientWidth / 2) / plan.s + plan.cx;
const mY = py => plan.cy - (py - planCtx.canvas.clientHeight / 2) / plan.s;

/** imanta a la referencia más próxima (dentro de 11 px) */
function planSnap(x, y) {
  const tol = 11 / plan.s;
  const near = (arr, v) => {
    let best = null, bd = tol;
    for (const k of arr) { const d = Math.abs(k - v); if (d < bd) { bd = d; best = k; } }
    return best;
  };
  const sx = near(SNAPX, x), sy = near(SNAPY, y);
  return { x: sx === null ? +x.toFixed(2) : sx, y: sy === null ? +y.toFixed(2) : sy,
           snapX: sx !== null, snapY: sy !== null };
}

/** tramos macizos de cada muro, descontando los huecos de paso */
function wallPolys() {
  const out = [];
  WALLS.forEach(w => {
    const [ax, ay] = w.a, [bx, by] = w.b, L = Math.hypot(bx - ax, by - ay);
    const dx = (bx - ax) / L, dy = (by - ay) / L, nx = -dy * w.t / 2, ny = dx * w.t / 2;
    const hs = (w.holes || []).filter(h => h[4] !== 'win')
                              .map(h => [h[0], h[1]]).sort((p, q) => p[0] - q[0]);
    let u = 0; const seg = [];
    hs.forEach(h => { if (h[0] > u) seg.push([u, h[0]]); u = Math.max(u, h[1]); });
    if (u < L) seg.push([u, L]);
    seg.forEach(([u0, u1]) => out.push([
      [ax + dx*u0 + nx, ay + dy*u0 + ny], [ax + dx*u1 + nx, ay + dy*u1 + ny],
      [ax + dx*u1 - nx, ay + dy*u1 - ny], [ax + dx*u0 - nx, ay + dy*u0 - ny]]));
    (w.holes || []).forEach(h => {                       // umbral de cada hueco
      if (h[3] < 1.9) return;
      out.push({ door: [[ax + dx*h[0], ay + dy*h[0]], [ax + dx*h[1], ay + dy*h[1]]] });
    });
  });
  return out;
}
let PLAN_POLYS = null;

function drawPlan() {
  const c = planCtx.canvas, g = planCtx;
  const W = c.clientWidth, H = c.clientHeight, dpr = Math.min(devicePixelRatio, 2);
  if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) {
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
  }
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const css = getComputedStyle(document.documentElement);
  const col = n => css.getPropertyValue(n).trim() || '#000';
  const PAPER = col('--paper'), TEXT = col('--text'), MUT = col('--muted'), AMB = col('--amber');
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  if (!PLAN_POLYS) PLAN_POLYS = wallPolys();

  // --- retícula de 1 m
  const step = plan.s < 22 ? 5 : 1;
  g.lineWidth = 1;
  g.strokeStyle = 'rgba(128,128,128,0.16)';
  g.beginPath();
  for (let x = Math.ceil(mX(0) / step) * step; x < mX(W); x += step) { g.moveTo(pX(x), 0); g.lineTo(pX(x), H); }
  for (let y = Math.floor(mY(0) / step) * step; y > mY(H); y -= step) { g.moveTo(0, pY(y)); g.lineTo(W, pY(y)); }
  g.stroke();

  // --- estancias
  g.fillStyle = 'rgba(190,145,99,0.13)';
  ROOMS.forEach(r => r.rects.forEach(q =>
    g.fillRect(pX(q[0]), pY(q[3]), (q[2]-q[0]) * plan.s, (q[3]-q[1]) * plan.s)));
  DORMERS.forEach(d =>
    g.fillRect(pX(d.x0), pY(d.y1), (d.x1-d.x0) * plan.s, (d.y1-d.y0) * plan.s));

  // --- zona por debajo de la altura tecleada (sólo con la herramienta activa)
  if (plafonding) {
    const h = clamp(parseFloat(String(document.getElementById('p-h').value).replace(',', '.')) || 2.5, 1.5, 6);
    const st = 0.16;
    g.fillStyle = 'rgba(200,60,40,0.16)';
    ROOMS.forEach(r => r.rects.forEach(q => {
      for (let x = q[0]; x < q[2]; x += st) for (let y = q[1]; y < q[3]; y += st)
        if (ceilAt(x + st/2, y + st/2) < h)
          g.fillRect(pX(x), pY(y + st), st * plan.s + 1, st * plan.s + 1);
    }));
  }

  // --- cumbreras y peldaños
  g.setLineDash([9, 6]); g.lineWidth = 1.2; g.strokeStyle = 'rgba(128,128,128,0.75)';
  g.beginPath();
  [ROOF.ridgeY, ROOF.ridgeY2].forEach(y => { g.moveTo(0, pY(y)); g.lineTo(W, pY(y)); });
  [ROOF.endW, ROOF.endE, ROOF.gableNx, ROOF.gableSx].forEach(x => { g.moveTo(pX(x), 0); g.lineTo(pX(x), H); });
  g.stroke(); g.setLineDash([]);

  // --- muros, pilares y patinillos
  g.fillStyle = TEXT;
  PLAN_POLYS.forEach(p => {
    if (p.door) return;
    g.beginPath(); g.moveTo(pX(p[0][0]), pY(p[0][1]));
    for (let i = 1; i < 4; i++) g.lineTo(pX(p[i][0]), pY(p[i][1]));
    g.closePath(); g.fill();
  });
  g.strokeStyle = MUT; g.lineWidth = 1;
  PLAN_POLYS.forEach(p => {
    if (!p.door) return;
    g.beginPath(); g.moveTo(pX(p.door[0][0]), pY(p.door[0][1]));
    g.lineTo(pX(p.door[1][0]), pY(p.door[1][1])); g.stroke();
  });
  g.fillStyle = '#8c6a3a';
  PILLARS.forEach(p => g.fillRect(pX(p.x - p.w/2), pY(p.y + p.d/2), p.w * plan.s, p.d * plan.s));
  g.fillStyle = 'rgba(140,106,58,0.55)';
  SHAFTS.forEach(s => g.fillRect(pX(s.x0), pY(s.y1), (s.x1-s.x0) * plan.s, (s.y1-s.y0) * plan.s));

  // --- zonas de falso techo
  zones.forEach((z, i) => {
    const x = pX(z.x0), y = pY(z.y1), w = (z.x1-z.x0) * plan.s, h = (z.y1-z.y0) * plan.s;
    const sel = i === selZone;
    g.fillStyle = sel ? 'rgba(224,150,40,0.38)' : 'rgba(224,150,40,0.24)';
    g.fillRect(x, y, w, h);
    g.strokeStyle = AMB; g.lineWidth = sel ? 2.4 : 1.8;
    g.setLineDash(sel ? [] : [6, 4]);
    g.strokeRect(x, y, w, h); g.setLineDash([]);
    if (w > 46 && h > 24) {
      g.fillStyle = AMB; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '700 12px ui-monospace,SFMono-Regular,Menlo,monospace';
      g.fillText(n2(z.h) + ' m', x + w/2, y + h/2);
      if (z.name && h > 40) {
        g.font = '500 10px ui-sans-serif,system-ui,sans-serif';
        g.fillStyle = MUT; g.fillText(z.name, x + w/2, y + h/2 + 14);
      }
    }
    if (sel && plafonding) HANDLES.forEach(([hx, hy]) => {   // tiradores
      const p = handlePos(z, hx, hy), s = hx && hy ? 5 : 4;
      g.fillStyle = PAPER; g.strokeStyle = AMB; g.lineWidth = 2;
      g.beginPath(); g.rect(pX(p.x) - s, pY(p.y) - s, s*2, s*2);
      g.fill(); g.stroke();
    });
  });

  // --- rótulos de estancia
  g.textAlign = 'center'; g.textBaseline = 'middle';
  ROOMS.forEach(r => {
    if (plan.s < 20) return;
    g.fillStyle = TEXT; g.font = '650 12px ui-sans-serif,system-ui,sans-serif';
    g.fillText(r.name, pX(r.label[0]), pY(r.label[1]) - 7);
    g.fillStyle = MUT; g.font = '500 10.5px ui-monospace,SFMono-Regular,Menlo,monospace';
    g.fillText(r.sup.toFixed(2).replace('.', ',') + ' m²', pX(r.label[0]), pY(r.label[1]) + 7);
  });

  // --- esquina pendiente y cursor imantado
  if (pending) crossMark(g, pending, AMB, true);
  if (plan.hover) {
    crossMark(g, plan.hover, plan.hover.snapX || plan.hover.snapY ? AMB : MUT, false);
    if (pending) {
      const x0 = Math.min(pending.x, plan.hover.x), x1 = Math.max(pending.x, plan.hover.x);
      const y0 = Math.min(pending.y, plan.hover.y), y1 = Math.max(pending.y, plan.hover.y);
      g.strokeStyle = AMB; g.lineWidth = 1.5; g.setLineDash([5, 4]);
      g.strokeRect(pX(x0), pY(y1), (x1-x0) * plan.s, (y1-y0) * plan.s);
      g.setLineDash([]);
      g.fillStyle = AMB; g.font = '700 12px ui-monospace,SFMono-Regular,Menlo,monospace';
      g.fillText(n2(x1-x0) + ' × ' + n2(y1-y0) + ' m', (pX(x0)+pX(x1))/2, pY(y1) - 12);
    }
  }

  // --- escala gráfica
  const m = plan.s > 60 ? 1 : plan.s > 26 ? 2 : 5;
  const bx = 24, by = 128;
  g.strokeStyle = TEXT; g.lineWidth = 2;
  g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + m * plan.s, by);
  g.moveTo(bx, by - 4); g.lineTo(bx, by + 4);
  g.moveTo(bx + m * plan.s, by - 4); g.lineTo(bx + m * plan.s, by + 4); g.stroke();
  g.fillStyle = TEXT; g.textAlign = 'left'; g.textBaseline = 'bottom';
  g.font = '600 11px ui-monospace,SFMono-Regular,Menlo,monospace';
  g.fillText(m + ' m', bx, by - 8);
  g.textAlign = 'left'; g.fillStyle = MUT; g.textBaseline = 'top';
  g.font = '600 11px ui-sans-serif,system-ui,sans-serif';
  g.fillText('Norte ↑   ·   planta a04', bx, by + 10);
  plan.dirty = false;
}
/* ---------------- selección y tiradores de las zonas ------------------
   Ocho tiradores: las cuatro esquinas y los cuatro puntos medios de lado.
   Arrastrando un lado la banda se alarga o se ensancha; arrastrando el
   interior se mueve entera. Todo se sigue imantando a los muros.
   ---------------------------------------------------------------------- */
const HANDLES = [[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]];
function handlePos(z, hx, hy) {
  return { x: hx < 0 ? z.x0 : hx > 0 ? z.x1 : (z.x0 + z.x1) / 2,
           y: hy < 0 ? z.y0 : hy > 0 ? z.y1 : (z.y0 + z.y1) / 2 };
}
/** ¿hay un tirador de la zona seleccionada bajo el cursor? */
function handleAt(px, py) {
  if (selZone < 0 || selZone >= zones.length) return null;
  const z = zones[selZone];
  for (const [hx, hy] of HANDLES) {
    const p = handlePos(z, hx, hy);
    if (Math.hypot(pX(p.x) - px, pY(p.y) - py) <= 11) return [hx, hy];
  }
  return null;
}
function zoneIndexAt(x, y) {
  for (let i = zones.length - 1; i >= 0; i--) {
    const z = zones[i];
    if (x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1) return i;
  }
  return -1;
}
function selectZone(i) {
  selZone = i;
  if (i >= 0) {
    document.getElementById('p-h').value = zones[i].h.toFixed(2);
    document.getElementById('p-name').value = zones[i].name || '';
  }
  renderZones();
}
/** aplica el arrastre de un tirador (o el movimiento completo) */
function dragZone(z, mode, p, ref) {
  const MIN = 0.10;
  if (mode === 'move') {
    const dx = p.x - ref.gx, dy = p.y - ref.gy;
    z.x0 = +(ref.x0 + dx).toFixed(2); z.x1 = +(ref.x1 + dx).toFixed(2);
    z.y0 = +(ref.y0 + dy).toFixed(2); z.y1 = +(ref.y1 + dy).toFixed(2);
    return;
  }
  const [hx, hy] = mode;
  if (hx < 0) z.x0 = Math.min(+p.x.toFixed(2), z.x1 - MIN);
  if (hx > 0) z.x1 = Math.max(+p.x.toFixed(2), z.x0 + MIN);
  if (hy < 0) z.y0 = Math.min(+p.y.toFixed(2), z.y1 - MIN);
  if (hy > 0) z.y1 = Math.max(+p.y.toFixed(2), z.y0 + MIN);
}

/* --------------------- controles de la planta ------------------------ */
function bindPlan() {
  const c = document.getElementById('plan');
  let drag = false, moved = false, lx = 0, ly = 0;
  const rel = e => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const touches = new Map();
  let pinch = 0, edit = null, editRef = null;
  c.addEventListener('pointerdown', e => {
    touches.set(e.pointerId, [e.clientX, e.clientY]);
    if (touches.size === 2) { pinch = pinchDist(); drag = false; edit = null; return; }
    drag = true; moved = false; lx = e.clientX; ly = e.clientY;
    c.setPointerCapture(e.pointerId);
    edit = null;
    if (!plafonding || pending) return;
    const [px, py] = rel(e), p = planSnap(mX(px), mY(py));
    const h = handleAt(px, py);
    if (h) { edit = { mode: h, i: selZone }; }
    else {
      const i = zoneIndexAt(p.x, p.y);
      if (i >= 0 && i === selZone) {
        const z = zones[i];
        edit = { mode: 'move', i, ref: { x0:z.x0, y0:z.y0, x1:z.x1, y1:z.y1, gx:p.x, gy:p.y } };
      }
    }
    if (edit) editRef = JSON.parse(JSON.stringify(zones[edit.i]));
  });
  const pinchDist = () => {
    const v = [...touches.values()];
    return Math.hypot(v[0][0] - v[1][0], v[0][1] - v[1][1]);
  };
  const endTouch = e => { touches.delete(e.pointerId); if (touches.size < 2) pinch = 0; };
  c.addEventListener('pointermove', e => {
    if (touches.has(e.pointerId)) touches.set(e.pointerId, [e.clientX, e.clientY]);
    if (touches.size === 2 && pinch) {            // pellizco para acercar
      const d = pinchDist();
      plan.s = clamp(plan.s * (d / pinch), 8, 300);
      pinch = d; plan.dirty = true; moved = true;
      return;
    }
    const [px, py] = rel(e);
    plan.hover = planSnap(mX(px), mY(py));
    if (edit && drag) {
      moved = true;
      const z = zones[edit.i];
      Object.assign(z, editRef);
      dragZone(z, edit.mode, plan.hover, edit.mode === 'move' ? edit.ref : null);
      plan.dirty = true;
      return;
    }
    if (drag) {
      const dx = e.clientX - lx, dy = e.clientY - ly;
      if (Math.hypot(e.clientX - lx, e.clientY - ly) > 0) moved = moved || Math.hypot(dx, dy) > 3;
      plan.cx -= dx / plan.s; plan.cy += dy / plan.s;
      lx = e.clientX; ly = e.clientY;
      c.classList.add('grabbing');
    }
    plan.dirty = true;
  });
  c.addEventListener('pointerleave', () => { plan.hover = null; plan.dirty = true; });
  c.addEventListener('pointerup', e => {
    endTouch(e);
    c.classList.remove('grabbing');
    const wasDrag = drag && moved; drag = false;
    if (edit) { const done = edit; edit = null; if (moved) { renderZones(); return; } }
    if (wasDrag || e.button !== 0) return;
    const [px, py] = rel(e);
    const p = planSnap(mX(px), mY(py));
    if (plafonding) planZoneClick(p);
    plan.dirty = true;
  });
  c.addEventListener('pointercancel', e => { endTouch(e); drag = false; c.classList.remove('grabbing'); });
  c.addEventListener('wheel', e => {
    e.preventDefault();
    const [px, py] = rel(e);
    const bx = mX(px), by = mY(py);
    plan.s = clamp(plan.s * (1 - Math.sign(e.deltaY) * 0.12), 8, 300);
    plan.cx = bx - (px - c.clientWidth / 2) / plan.s;
    plan.cy = by + (py - c.clientHeight / 2) / plan.s;
    plan.dirty = true;
  }, { passive: false });
  addEventListener('keydown', e => {
    if (/^(INPUT|TEXTAREA)$/.test((e.target.tagName || ''))) return;
    if (e.key === 'Escape') { pending = null; selectZone(-1); }
    if ((e.key === 'Delete' || e.key === 'Backspace') && selZone >= 0) {
      zones.splice(selZone, 1); selectZone(-1);
    }
  });
}
/** clic en la planta con la herramienta de falso techo activa */
function planZoneClick(p) {
  if (!pending) {
    const i = zoneIndexAt(p.x, p.y);          // primero, seleccionar lo que ya hay
    if (i >= 0 && i !== selZone) { selectZone(i); return; }
    if (i >= 0 && i === selZone) { selectZone(-1); return; }
    pending = { x: p.x, y: p.y }; renderZones(); return;
  }
  const x0 = Math.min(pending.x, p.x), x1 = Math.max(pending.x, p.x);
  const y0 = Math.min(pending.y, p.y), y1 = Math.max(pending.y, p.y);
  pending = null;
  if (x1 - x0 < 0.05 || y1 - y0 < 0.05) { renderZones(); return; }
  pushZone(x0, y0, x1, y1);
  selectZone(zones.length - 1);
}
function hudPlan() {
  const p = plan.hover;
  const r = p ? roomAt(p.x, p.y) : null;
  document.getElementById('hud-room').textContent = r ? r.name : '—';
  const ft = p ? plafondAt(p.x, p.y) : null;
  document.getElementById('hud-h').textContent = p
    ? (ft === null ? n2(ceilAt(p.x, p.y)) + ' m'
                   : n2(Math.min(ceilAt(p.x, p.y), ft)) + ' m  ·  falso techo')
    : '—';
  document.getElementById('hud-xy').textContent = p ? n2(p.x) + ' / ' + n2(p.y) : '—';
  document.getElementById('hud-low').hidden = true;
}

function crossMark(g, p, color, solid) {
  const x = pX(p.x), y = pY(p.y), r = solid ? 9 : 7;
  g.strokeStyle = color; g.lineWidth = solid ? 2 : 1.3;
  g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y);
  g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke();
  if (solid) { g.fillStyle = color; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); }
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
