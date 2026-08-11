/* =====================================================================
   PISO B — Planta bajocubierta  ·  Bloque 3, UE-VP Manzana A, Benasque
   Modelo 3D derivado de los planos a01–a14 (Domper Domingo arquitectos)

   Sistema de coordenadas del plano a04 (metros, escala 1:50 sobre A1):
     x  crece hacia el Este,  y  crece hacia el Norte (valores negativos
     hacia el Sur).  z = 0 en el pavimento acabado de la bajocubierta
     (+118,00 ; forjado estructural +117,92).
   ===================================================================== */

/* ---------- geometría de cubierta (cara interior = techo) ------------
   Derivada de las líneas de limahoya del plano de cubierta a05 y de las
   cotas de las secciones a11/a13 y del alzado principal a07:
     · Cumbrera principal E-O en y = −8,27 ; faldones al 65 %
     · Hastial transversal Norte, cumbrera N-S en x = 14,60, faldones 61 %
     · Hastial transversal Sur  (salón), cumbrera N-S en x = 13,36, 91 %
     · Altura interior de cumbrera 5,00 m  (cara exterior +123,23 =
       11,03 m sobre +112,20, cota del alzado a07)
   -------------------------------------------------------------------- */
const ROOF = {
  H: 5.00,          // altura libre en cumbrera
  ridgeY: -8.27,    // cumbrera principal
  sMain: 0.647,     // 65 %
  gableNx: 14.60, sN: 0.61,   // hastial norte 61 %
  gableSx: 13.36, sS: 0.91    // hastial sur 91 %
};

const DORMERS = [
  { id:'d-hab1',  x0: 3.62, x1: 4.85, y0: -3.57,  y1: -2.25,  jy: -3.57,  dir: +1 },
  { id:'d-coc',   x0: 6.55, x1: 7.40, y0: -14.10, y1: -12.45, jy: -12.45, dir: -1 },
  { id:'d-hab2',  x0:19.20, x1:20.40, y0: -14.10, y1: -12.40, jy: -12.40, dir: -1 }
];
const DORMER_SLOPE = 0.80;

function roofH(x, y) {
  let h = ROOF.H - ROOF.sMain * Math.abs(y - ROOF.ridgeY);
  if (y > ROOF.ridgeY) h = Math.max(h, ROOF.H - ROOF.sN * Math.abs(x - ROOF.gableNx));
  else                 h = Math.max(h, ROOF.H - ROOF.sS * Math.abs(x - ROOF.gableSx));
  return h;
}
DORMERS.forEach(d => { d.xc = (d.x0 + d.x1) / 2; d.eave = roofH(d.xc, d.jy); });

function dormerAt(x, y) {
  for (const d of DORMERS)
    if (x >= d.x0 - 1e-3 && x <= d.x1 + 1e-3 && y >= d.y0 - 1e-3 && y <= d.y1 + 1e-3) return d;
  return null;
}
/** altura libre de techo en cualquier punto de la vivienda */
function ceilAt(x, y) {
  const d = dormerAt(x, y);
  if (d) return d.eave + DORMER_SLOPE * ((d.x1 - d.x0) / 2 - Math.abs(x - d.xc));
  return roofH(x, y);
}

/* ---------------------------- estancias ----------------------------- */
/* rect = [x0, y0, x1, y1] con y0 < y1 (cara interior de los paramentos) */
const ROOMS = [
  { id:'hab1', name:'Habitación 1', rects:[[2.57,-7.95,5.55,-3.55]], dormers:['d-hab1'],
    label:[4.05,-5.60], sup:15.33 },
  { id:'vest', name:'Vestidor', rects:[[5.55,-5.60,9.40,-3.55]], label:[7.45,-4.55], sup:7.73 },
  { id:'ban1', name:'Baño 1', rects:[[5.95,-7.40,9.40,-5.75]], label:[7.65,-6.55], sup:5.45 },
  { id:'coc',  name:'Cocina', rects:[[2.57,-11.00,5.85,-8.10],[5.85,-12.45,10.05,-7.65]],
    dormers:['d-coc'], label:[7.20,-10.00], sup:30.51 },
  { id:'est',  name:'Estudio', rects:[[9.60,-7.35,11.90,-1.60]], label:[10.75,-4.40], sup:13.02 },
  { id:'rec',  name:'Recibidor', rects:[[10.25,-9.35,16.55,-7.55]], label:[13.40,-8.45], sup:7.72 },
  { id:'sal',  name:'Salón–comedor', rects:[[10.25,-14.25,16.55,-9.35]], label:[13.40,-11.80], sup:30.00 },
  { id:'dis',  name:'Distribuidor', rects:[[16.75,-9.35,19.10,-7.55],[19.10,-9.35,21.40,-8.45]],
    label:[17.90,-8.60], sup:6.73 },
  { id:'ban2', name:'Baño 2', rects:[[19.10,-8.45,21.40,-6.65]], label:[20.25,-7.55], sup:3.78 },
  { id:'hab3', name:'Habitación 1 (E)', rects:[[21.40,-11.00,24.20,-7.55]], label:[22.80,-9.30], sup:9.96 },
  { id:'hab2', name:'Habitación 2', rects:[[16.75,-12.40,20.50,-9.45]], dormers:['d-hab2'],
    label:[18.30,-10.90], sup:14.55 }
];

/* ------------------------------ muros -------------------------------
   a,b  = eje del muro ; t = espesor ; holes = huecos [u0,u1,z0,z1,tipo]
   u    = distancia desde a  ·  z = altura sobre el pavimento
   -------------------------------------------------------------------- */
const W_EXT = 0.35, W_INT = 0.20, W_TAB = 0.12;
const WALLS = [
  // ---- fachada Oeste y ala izquierda ----
  { a:[2.385,-3.40], b:[2.385,-11.075], t:W_EXT, holes:[
      [2.35,3.15,0.90,2.30,'win'], [5.15,6.40,0.90,2.30,'win']] },
  { a:[2.385,-3.475], b:[3.53,-3.475], t:W_EXT },
  { a:[3.53,-3.475], b:[3.53,-2.15], t:0.30 },                     // buhardilla hab.1
  { a:[3.53,-2.15], b:[4.94,-2.15], t:0.30, holes:[[0.30,1.11,0.90,1.90,'win']] },
  { a:[4.94,-2.15], b:[4.94,-3.475], t:0.30 },
  { a:[4.94,-3.475], b:[9.50,-3.475], t:W_EXT },
  { a:[5.65,-3.475], b:[5.65,-4.35], t:W_TAB },                    // jamba hab.1 / vestidor
  { a:[5.875,-5.675], b:[9.50,-5.675], t:W_TAB, holes:[[0.55,1.40,0.00,2.10,'door']] },
  { a:[5.85,-5.675], b:[5.85,-7.525], t:W_INT },
  { a:[2.385,-8.175], b:[5.90,-8.175], t:0.15 },                   // hab.1 / cocina
  { a:[5.90,-7.525], b:[9.50,-7.525], t:0.25, holes:[[0.15,1.00,0.00,2.10,'door']] },
  { a:[9.50,-1.50], b:[9.50,-7.525], t:0.30 },                     // cocina/vestidor – estudio
  { a:[2.385,-11.075], b:[5.90,-11.075], t:0.15 },
  { a:[5.85,-11.075], b:[5.85,-12.55], t:W_INT },
  { a:[5.85,-12.55], b:[10.15,-12.55], t:W_INT, holes:[[0.70,1.55,0.00,9.00,'open']] },
  { a:[6.475,-12.55], b:[6.475,-14.18], t:0.15 },                  // mirador cocina
  { a:[6.475,-14.18], b:[7.475,-14.18], t:0.15, holes:[[0.12,0.88,0.90,1.90,'win']] },
  { a:[7.475,-14.18], b:[7.475,-12.55], t:0.15 },

  // ---- estudio y balcón norte ----
  { a:[9.50,-1.50], b:[12.00,-1.50], t:W_EXT, holes:[[0.85,1.75,0.00,2.10,'door']] },
  { a:[12.00,-1.50], b:[12.00,-7.45], t:W_INT },
  { a:[9.50,-7.45], b:[12.00,-7.45], t:W_INT, holes:[[1.15,2.05,0.00,2.10,'door']] },

  // ---- recibidor / salón ----
  { a:[12.00,-7.45], b:[16.65,-7.45], t:W_INT, holes:[[0.35,1.25,0.00,2.10,'entry']] },
  { a:[10.15,-7.55], b:[10.15,-14.42], t:W_INT, holes:[[0.50,1.40,0.00,2.10,'door']] },
  { a:[10.15,-14.42], b:[16.65,-14.42], t:W_EXT, holes:[
      [0.55,2.45,0.00,2.15,'french'], [3.45,5.50,0.00,2.15,'french']] },
  { a:[16.65,-14.42], b:[16.65,-7.45], t:W_INT, holes:[[5.85,6.90,0.00,2.20,'open']] },

  // ---- ala derecha ----
  { a:[16.65,-7.45], b:[19.10,-7.45], t:W_INT },
  { a:[19.10,-6.65], b:[19.10,-8.45], t:W_INT },
  { a:[19.10,-6.65], b:[21.40,-6.65], t:W_INT },
  { a:[21.40,-6.65], b:[21.40,-8.45], t:W_INT },
  { a:[19.10,-8.45], b:[21.40,-8.45], t:W_INT, holes:[[1.35,2.15,0.00,2.10,'door']] },
  { a:[21.40,-7.45], b:[24.385,-7.45], t:W_INT },
  { a:[24.385,-7.45], b:[24.385,-11.075], t:W_EXT, holes:[[0.60,1.75,0.90,2.30,'win']] },
  { a:[21.40,-8.45], b:[21.40,-11.075], t:W_INT, holes:[[0.25,1.05,0.00,2.10,'door']] },
  { a:[20.50,-11.075], b:[24.385,-11.075], t:W_EXT },
  { a:[16.65,-9.40], b:[20.60,-9.40], t:0.10, holes:[[2.70,3.60,0.00,2.10,'door']] },
  { a:[20.50,-9.40], b:[20.50,-12.50], t:W_INT },
  { a:[16.65,-12.50], b:[20.50,-12.50], t:W_INT, holes:[[2.55,3.75,0.00,9.00,'open']] },
  { a:[19.125,-12.50], b:[19.125,-14.18], t:0.15 },                // mirador hab.2
  { a:[19.125,-14.18], b:[20.475,-14.18], t:0.15, holes:[[0.15,1.20,0.90,1.90,'win']] },
  { a:[20.475,-14.18], b:[20.475,-12.50], t:0.15 }
];

/* ------------------------- balcones (contexto) ----------------------- */
const BALCONIES = [
  { x0:10.15, y0:-15.60, x1:16.65, y1:-14.42, name:'Balcón 1 Viv. B' },
  { x0: 9.90, y0: -1.50, x1:11.90, y1: -0.40, name:'Balcón 1 Viv. B (N)' }
];

/* ------------------------- mobiliario (escala) ----------------------- */
/* [x0,y0,x1,y1, alto, tipo] */
const FURNITURE = [
  // habitación 1
  [3.10,-7.00,5.10,-5.00,0.50,'bed'], [3.10,-5.00,5.10,-4.80,0.85,'head'],
  // vestidor: armario corrido
  [6.55,-4.15,9.35,-3.62,2.05,'closet'],
  // baño 1
  [8.60,-7.30,9.35,-5.85,0.55,'tub'], [6.10,-6.05,7.10,-5.85,0.85,'sink'],
  // cocina
  [2.70,-8.80,5.60,-8.20,0.90,'counter'], [5.95,-8.30,9.90,-7.80,0.90,'counter'],
  [4.20,-10.30,6.40,-9.30,0.76,'table'],
  // estudio
  [9.70,-3.20,11.00,-2.55,0.74,'table'], [11.10,-6.90,11.80,-4.20,0.90,'shelf'],
  // salón
  [10.60,-11.60,12.90,-10.30,0.75,'table'],
  [13.90,-13.50,16.20,-12.65,0.42,'sofa'], [14.90,-12.55,16.25,-11.10,0.42,'sofa'],
  [12.20,-13.60,13.60,-12.90,0.40,'sofa'],
  // habitación 2
  [16.95,-12.20,18.85,-10.30,0.50,'bed'], [16.95,-10.30,18.85,-10.10,0.85,'head'],
  // habitación 1 (E)
  [21.80,-10.60,23.80,-8.60,0.50,'bed'], [21.80,-8.60,23.80,-8.40,0.85,'head'],
  // baño 2
  [19.30,-8.25,21.20,-7.60,0.55,'tub']
];

/* --------------------- posiciones de cámara sugeridas ---------------- */
const FIGURES = [[3.55,-4.40],[4.60,-9.60],[11.30,-13.30],[15.90,-12.30],[17.55,-10.90],[11.40,-3.20],[22.60,-10.85]];

const VIEWS = [
  { id:'sal',  name:'Salón–comedor',  pos:[13.30,-10.30], look:[13.36,-14.10, 2.60] },
  { id:'coc',  name:'Cocina',         pos:[ 9.30,-11.80], look:[ 3.20, -9.40, 1.90] },
  { id:'est',  name:'Estudio',        pos:[10.75, -6.60], look:[10.85, -1.70, 2.30] },
  { id:'hab1', name:'Habitación 1',   pos:[ 5.20, -7.60], look:[ 4.24, -2.40, 2.20] },
  { id:'vest', name:'Vestidor',       pos:[ 9.00, -4.90], look:[ 5.70, -4.70, 1.70] },
  { id:'rec',  name:'Recibidor',      pos:[12.40, -8.60], look:[16.60, -8.60, 2.00] },
  { id:'hab2', name:'Habitación 2',   pos:[19.60,-10.20], look:[19.80,-13.90, 2.00] },
  { id:'dis',  name:'Distribuidor',   pos:[17.20, -8.45], look:[21.30, -8.45, 1.90] },
  { id:'hab3', name:'Habitación 1 E', pos:[22.10, -8.20], look:[24.20,-10.40, 1.90] },
  { id:'ban2', name:'Baño 2',         pos:[19.60, -8.15], look:[21.30, -7.10, 1.80] }
];
