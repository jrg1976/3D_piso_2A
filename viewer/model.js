/* =====================================================================
   PISO B — Planta bajocubierta  ·  Bloque 3, UE-VP Manzana A, Benasque
   Modelo 3D derivado de los planos a01–a14 (Domper Domingo arquitectos)

   Sistema de coordenadas del plano a04 (metros, escala 1:50 sobre A1):
     x  crece hacia el Este,  y  crece hacia el Norte (valores negativos
     hacia el Sur).  z = 0 en el pavimento acabado de la bajocubierta
     (+118,00 ; forjado estructural +117,92).
   ===================================================================== */

/* ---------- geometría de cubierta (cara interior = techo) ------------
   Derivada de las limahoyas del plano de cubierta a05 y contrastada con las
   secciones a11/a13 y los alzados a07/a08.

   Hay DOS cubiertas a distinta altura, superpuestas:

     · Cuerpo principal (4,33 < x < 22,38): cumbrera E-O en y = −8,27,
       vértice interior 5,00 m  (cara exterior 11,03 m sobre +112,20).
     · Vuelos extremos (x < 4,33 y x > 22,38), menos profundos en planta:
       cumbrera E-O en y = −7,47, vértice interior 4,48 m  (10,51 m).

   El faldón NORTE es común a las dos: el plano que pasa por el vértice alto
   pasa exactamente por el vértice bajo (0,80 m de separación en planta,
   0,52 m en altura → 65 %), tal como se ve en a08 y a13, donde las dos
   cumbreras aparecen una detrás de otra. Lo que se duplica es el faldón SUR,
   y entre ambos queda un peldaño vertical en x = 4,33 y x = 22,38 que en a04
   está dibujado justo desde la cumbrera (y = −7,47) hasta el muro Sur de los
   vuelos (y = −11,16).

   Sobre el cuerpo central montan además dos hastiales transversales:
     · Norte  (estudio): cumbrera N-S en x = 14,60, faldones al 61 %
     · Sur    (salón):   cumbrera N-S en x = 13,36, faldones al 91 %
   -------------------------------------------------------------------- */
const ROOF = {
  H: 5.00,   ridgeY: -8.27,     // cuerpo principal
  H2: 4.48,  ridgeY2: -7.47,    // vuelos extremos
  endW: 4.33, endE: 22.38,      // límites del cuerpo principal
  sMain: 0.647,                 // 65 %
  gableNx: 14.60, sN: 0.61,     // hastial norte 61 %
  gableSx: 13.36, sS: 0.91      // hastial sur 91 %
};

const isEndBay = x => x < ROOF.endW || x > ROOF.endE;

/** Cara inferior del faldón.  `sideX` permite forzar de qué lado del
    peldaño se evalúa un punto que cae justo sobre x = 4,33 ó 22,38.      */
function roofH(x, y, sideX) {
  const end = isEndBay(sideX === undefined ? x : sideX);
  const ry = end ? ROOF.ridgeY2 : ROOF.ridgeY;
  const H  = end ? ROOF.H2 : ROOF.H;
  let h = (y > ry)
    ? ROOF.H - ROOF.sMain * (y - ROOF.ridgeY)      // faldón Norte, común
    : H + ROOF.sMain * (y - ry);                   // faldón Sur, desdoblado
  if (!end) {                                      // hastiales transversales
    if (y > ROOF.ridgeY) h = Math.max(h, ROOF.H - ROOF.sN * Math.abs(x - ROOF.gableNx));
    else                 h = Math.max(h, ROOF.H - ROOF.sS * Math.abs(x - ROOF.gableSx));
  }
  return h;
}

const DORMERS = [
  { id:'d-hab1',  x0: 3.62, x1: 4.85, y0: -3.57,  y1: -2.25,  jy: -3.57,  dir: +1 },
  { id:'d-coc',   x0: 6.55, x1: 7.40, y0: -14.10, y1: -12.45, jy: -12.45, dir: -1 },
  { id:'d-hab2',  x0:19.20, x1:20.40, y0: -14.10, y1: -12.40, jy: -12.40, dir: -1 }
];
const DORMER_SLOPE = 0.80;
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
  { id:'hab1', name:'Habitación 1', rects:[[2.57,-5.60,5.55,-3.55],[2.57,-7.96,5.81,-5.60]],
    dormers:['d-hab1'], label:[4.05,-5.60], sup:15.33 },
  { id:'vest', name:'Vestidor', rects:[[5.55,-5.60,9.40,-3.55]], label:[7.45,-4.55], sup:7.73 },
  { id:'ban1', name:'Baño 1', rects:[[5.95,-7.36,9.40,-5.75]], label:[7.65,-6.55], sup:5.45 },
  { id:'coc',  name:'Cocina', rects:[[2.57,-11.00,5.95,-8.37],[2.57,-8.37,5.81,-8.09],
                                     [5.95,-12.45,9.338,-7.49],
                                     [9.338,-12.45,10.15,-9.39]],
    dormers:['d-coc'], label:[7.20,-10.00], sup:30.51 },
  { id:'est',  name:'Estudio', rects:[[9.464,-4.88,11.95,-1.60],[9.464,-7.86,11.17,-4.88]],
    label:[10.55,-3.60], sup:13.02 },
  { id:'rec',  name:'Recibidor', rects:[[9.464,-9.245,10.28,-7.85],[10.28,-9.35,12.46,-7.85],[12.46,-9.35,13.46,-7.85],
                                        [13.46,-9.35,14.46,-7.50],[14.46,-9.35,16.02,-8.37]],
    label:[12.60,-8.55], sup:7.72 },
  { id:'sal',  name:'Salón–comedor', rects:[[10.28,-14.25,16.55,-9.35]], label:[13.40,-11.80], sup:30.00 },
  { id:'dis',  name:'Distribuidor', rects:[[16.02,-9.35,18.97,-7.54],[18.97,-9.35,20.70,-8.38]],
    label:[17.60,-8.55], sup:6.73 },
  { id:'ban2', name:'Baño 2', rects:[[19.15,-8.26,21.40,-6.54]], label:[20.28,-7.40], sup:3.78 },
  { id:'hab3', name:'Habitación 1 (E)', rects:[[21.55,-11.06,24.11,-7.70],
                                               [20.81,-9.26,21.55,-8.39],
                                               [20.94,-11.06,21.55,-10.04]],
    label:[22.85,-9.35], sup:9.96 },
  { id:'hab2', name:'Habitación 2', rects:[[16.75,-12.40,20.78,-9.43]], dormers:['d-hab2'],
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
  { a:[2.385,-3.475], b:[3.68,-3.475], t:W_EXT },
  { a:[3.53,-3.475], b:[3.53,-2.15], t:0.30 },                     // buhardilla hab.1
  { a:[3.53,-2.15], b:[4.94,-2.15], t:0.30, holes:[[0.30,1.11,0.90,1.90,'win']] },
  { a:[4.94,-2.15], b:[4.94,-3.475], t:0.30 },
  { a:[4.94,-3.475], b:[9.50,-3.475], t:W_EXT },
  { a:[5.65,-3.475], b:[5.65,-4.35], t:W_TAB },                    // jamba hab.1 / vestidor
  { a:[5.81,-5.675], b:[9.50,-5.675], t:W_TAB, holes:[[1.91,2.64,0.00,2.10,'door']] },
  { a:[5.875,-5.675], b:[5.875,-8.37], t:0.13 },                   // hab.1 y baño 1 / cocina
  { a:[2.385,-8.025], b:[5.875,-8.025], t:0.13 },                  // hab.1 / cocina
  { a:[5.875,-7.424], b:[9.50,-7.424], t:0.12 },                   // corrido: sin paso a la cocina
  { a:[6.975,-7.484], b:[6.975,-8.15], t:0.35 },                   // machón de la cocina
  { a:[9.401,-1.50], b:[9.401,-9.317], t:0.126, holes:[
      [3.22,3.92,0.00,2.10,'door'],      // paso vestidor–estudio
      [6.86,7.745,0.00,2.10,'door']] },  // corredera cocina–recibidor
  { a:[2.385,-11.075], b:[5.95,-11.075], t:0.15 },
  { a:[5.85,-11.075], b:[5.85,-12.55], t:W_INT },
  { a:[5.85,-12.55], b:[10.15,-12.55], t:W_INT, holes:[[0.70,1.55,0.00,9.00,'open']] },
  { a:[6.475,-12.55], b:[6.475,-14.18], t:0.15 },                  // mirador cocina
  { a:[6.475,-14.18], b:[7.475,-14.18], t:0.15, holes:[[0.12,0.88,0.90,1.90,'win']] },
  { a:[7.475,-14.18], b:[7.475,-12.55], t:0.15 },

  // ---- estudio y balcón norte ----
  { a:[9.39,-1.425], b:[12.075,-1.425], t:W_EXT, holes:[[1.40,2.35,0.00,2.10,'door']] },
  { a:[12.075,-1.425], b:[12.075,-4.88], t:0.25 },
  { a:[11.27,-5.97], b:[11.27,-7.45], t:0.20 },

  // ---- recibidor / salón ----
  { a:[11.37,-7.756], b:[12.46,-7.756], t:0.18, holes:[[0.19,0.93,0.00,2.10,'entry']] },  // puerta de entrada
  { a:[12.46,-7.60], b:[13.46,-7.60], t:0.50 },                    // armario del contador (A. Elec.)
  { a:[13.46,-7.425], b:[15.97,-7.425], t:0.15 },
  { a:[9.338,-9.317], b:[10.28,-9.317], t:0.145 },                 // cocina / salón
  { a:[10.215,-9.317], b:[10.215,-14.42], t:0.13 },                // cocina / salón
  { a:[10.15,-14.42], b:[16.65,-14.42], t:W_EXT, holes:[
      [0.55,2.45,0.00,2.15,'french'], [3.45,5.50,0.00,2.15,'french']] },
  { a:[16.65,-14.42], b:[16.65,-9.35], t:W_INT },                  // sólo salón – habitación 2

  // ---- ala derecha ----
  { a:[15.97,-7.44], b:[19.06,-7.44], t:W_INT },                   // testero Norte del distribuidor
  // baño 2 (medido sobre a04: 19,15–21,40 × −6,54/−8,26 interiores)
  { a:[19.06,-6.445], b:[21.475,-6.445], t:0.19 },
  { a:[19.06,-6.445], b:[19.06,-8.38], t:0.18 },
  { a:[21.475,-6.445], b:[21.475,-8.32], t:0.15 },
  { a:[19.06,-8.32], b:[20.70,-8.32], t:0.12, holes:[[0.38,1.08,0.00,2.10,'door']] },  // puerta baño 2
  { a:[19.06,-8.19], b:[19.41,-8.19], t:0.38 },                    // machón de la jamba
  { a:[20.70,-8.265], b:[21.55,-8.265], t:0.25 },                  // machón del pilar
  // habitación 1 (E)
  { a:[21.475,-7.585], b:[24.30,-7.585], t:0.23 },
  { a:[24.30,-7.585], b:[24.30,-11.06], t:W_EXT, holes:[[0.50,1.75,0.90,2.30,'win']] },
  { a:[20.755,-8.26], b:[20.755,-9.365], t:0.11, holes:[[0.25,0.93,0.00,2.10,'door']] },  // puerta hab. 1 (E)
  { a:[20.86,-10.04], b:[20.86,-12.50], t:0.16 },
  { a:[20.86,-11.06], b:[24.30,-11.06], t:W_EXT },
  { a:[16.55,-9.365], b:[20.70,-9.365], t:0.13, holes:[[2.87,3.55,0.00,2.10,'door']] },  // puerta hab. 2
  { a:[16.65,-12.50], b:[20.85,-12.50], t:W_INT, holes:[[2.55,3.75,0.00,9.00,'open']] },
  { a:[19.125,-12.50], b:[19.125,-14.18], t:0.15 },                // mirador hab.2
  { a:[19.125,-14.18], b:[20.475,-14.18], t:0.15, holes:[[0.15,1.20,0.90,1.90,'win']] },
  { a:[20.475,-14.18], b:[20.475,-12.50], t:0.15 }
];

/* -------------------------- pilares --------------------------------
   Perfiles de 0,14 m detectados en a04 con su trasdosado (0,21 × 0,20).
   Casi todos se alinean con la cumbrera principal (y = −8,27) y con el
   eje del hastial del salón (x = 13,36).  `free` = exento en la estancia.
   -------------------------------------------------------------------- */
const PILLARS = [
  { x: 9.08, y: -8.27, w:0.21, d:0.20, room:'coc',  free:true  },
  { x:13.36, y: -8.27, w:0.21, d:0.20, room:'rec',  free:true  },
  { x:13.36, y:-11.06, w:0.21, d:0.20, room:'sal',  free:true  },
  { x:17.75, y: -8.27, w:0.21, d:0.20, room:'dis',  free:true  },
  { x:20.85, y: -8.27, w:0.21, d:0.20, room:'ban2', free:false },
  { x: 5.84, y: -8.27, w:0.21, d:0.28, room:'coc',  free:false },
  { x:14.59, y: -8.27, w:0.21, d:0.20, room:'rec',  free:false },
  { x:13.36, y:-14.26, w:0.21, d:0.20, room:'sal',  free:false },
  { x:12.00, y: -5.83, w:0.26, d:0.24, room:'est',  free:false }
];

/* ------------------- patinillos / conductos de humos -----------------
   Bloques de fábrica que suben desde el garaje (a01) y salen por
   cubierta.  Coronación medida en la sección A-A' (a10): +6,25 m sobre
   el pavimento de la bajocubierta, ≈ 1 m por encima de la cumbrera.
   -------------------------------------------------------------------- */
const SHAFT_TOP = 6.25;
const SHAFTS = [
  // extracción de campana y ventilación de cocina/wc de 1ºB, 2ºD y 3ºB
  { x0: 5.25, y0:-10.12, x1: 5.76, y1: -9.22, room:'coc', free:true,
    note:'Extracción de campana y ventilación 1ºB · 2ºD · 3ºB' },
  // rincón Norte de la habitación 1, junto a la buhardilla; rotulado en a05
  { x0: 4.75, y0: -4.10, x1: 5.36, y1: -3.32, room:'hab1', free:false,
    note:'Extracción de campana y ventilación cocina/wc de 1ºC · 2ºE + bajante' },
  // máquina de ventilación del garaje + montantes de calefacción y AFS/ACS
  { x0:11.17, y0: -5.97, x1:11.95, y1: -4.88, room:'est', free:false,
    note:'Ventilación del garaje y montantes' },
  // patinillo del testero sur del estudio
  { x0:10.40, y0: -7.86, x1:11.40, y1: -7.25, room:'est', free:false,
    note:'Ventilación de cuarto de basuras' },
  // extracción de campana y ventilación de 1ºE, 2ºB y 3ºB
  { x0:20.70, y0:-10.04, x1:21.55, y1: -9.26, room:'hab2', free:false,
    note:'Extracción de campana y ventilación 1ºE · 2ºB · 3ºB' },
  // conducto rotulado «V. GARAJE» en a04; aparece también en la cubierta (a05)
  { x0:14.46, y0: -8.37, x1:16.02, y1: -7.42, room:'rec', free:false,
    note:'Ventilación del garaje (V. GARAJE) + bajante' }
];

/* --------------------- falsos techos de pladur -----------------------
   Cada zona es un rectángulo con SU propia altura libre, de modo que una
   misma estancia puede llevar varias: {x0,y0,x1,y1, h, name}.
   Donde se solapen manda la más baja, que es lo que se ve.
   Se cargan aquí las zonas confirmadas; el botón «Falso techo» del visor
   permite añadir y exportar las que falten.
   -------------------------------------------------------------------- */
const CEILINGS = [
  // { x0: 5.95, y0: -7.40, x1: 9.40, y1: -5.75, h: 2.40, name: 'Baño 1' },
];

/* --------------- núcleo común: rellano, escalera y ascensor -----------
   Todo lo que queda FUERA de la puerta de entrada.  Medido sobre a04 en
   el mismo marco que la vivienda y contrastado con a03 (planta primera)
   y a01 (semisótano, donde el hueco del ascensor aparece rotulado
   «Previsión Hueco Ascensor» con la misma huella).

     · Escalera        S: 7,15 m²   12,21–14,38 × −1,60…−4,87  (7,11 medidos)
     · Espacio común   S: 9,30 m²   el rellano propiamente dicho
     · Ascensor        14,40–16,40 × −3,85…−5,90, puerta al Sur al rellano

   La escalera es de ida y vuelta con 17 peldaños entre la planta primera
   (−2,90) y la bajocubierta: 8 tabicas en el tramo Oeste (de la planta a
   la meseta) y 9 en el tramo Este (de la meseta a la planta primera).
   Tabica 2,90/17 = 0,1706 ; huella 0,286 (2·0,171+0,286 = 0,63).
   El tramo Este baja hacia el Sur y desemboca en el rellano de 1º, de ahí
   el antepecho en y = −4,87 entre x = 13,36 y 14,38.
   -------------------------------------------------------------------- */
const CORE_RISER = 2.90 / 17, CORE_TREAD = 0.2838;

const CORE = {
  /* pavimento del rellano (z = 0); el resto de la caja es hueco.
     El rellano se prolonga al Este por delante de la puerta del ascensor
     —ahí está trazado el círculo de Ø 1,50 de maniobra— hasta el muro de
     la vivienda A.                                                       */
  floor: [
    [11.336, -7.666, 12.212, -5.960],
    [12.212, -7.666, 12.460, -4.868],
    [12.460, -7.350, 14.588, -4.868],
    [14.588, -7.350, 16.210, -5.857]
  ],
  /* muros propios del núcleo.  Los que dan a la vivienda B (tabique del
     estudio, armario del contador y puerta de entrada) ya están en WALLS */
  walls: [
    // medianera con la vivienda A: caja de escalera.  Se prolonga 0,15 al
    // Sur para que su testero quede embebido en el muro del ascensor
    { a:[14.490,-1.425], b:[14.490,-4.000], t:0.221 },
    // medianera con la vivienda A: prolongación al Sur del muro Este del
    // ascensor, hasta el muro que separa el rellano de la vivienda B
    { a:[16.300,-5.857], b:[16.300,-7.350], t:0.18 }
  ],
  /* fachada Norte de la caja de escalera, con su ventanal.  Arranca 0,12
     dentro del muro de la vivienda para que no coincidan los testeros    */
  facade: [
    { a:[11.955,-1.425], b:[14.600,-1.425], t:0.35, holes:[[0.965,1.725,0.90,2.20,'win']] }
  ],
  /* macizo de armarios de contadores (A.F.S. y A.C.S.) al Oeste */
  serv: [11.156, -6.050, 12.212, -4.868],
  /* R.I.T.S. (telecomunicaciones), bajo el arranque del tramo Este */
  rits: [13.304, -5.408, 14.384, -4.868],
  /* hueco de ascensor: caja de 0,20 con la puerta al Sur */
  lift: { x0:14.402, y0:-5.905, x1:16.400, y1:-3.850, t:0.20, top:2.90,
          door:[14.700, 15.750], head:2.10 },
  /* escalera de ida y vuelta.  El tramo Oeste (de la planta a la meseta)
     tiene 8 tabicas y 7 huellas vistas; el Este (de la meseta a la planta
     primera) 9 tabicas y 8 huellas.  Al ser distintos, la meseta queda
     escalonada: el borde Sur del lado Este cae 1 huella más al Sur.      */
  stair: {
    x0:12.212, y0:-4.868, x1:14.384, y1:-1.598,   // caja (S: 7,11 m²)
    xm0:13.234, xm1:13.364,                       // zanquín central («ojo»)
    nWt: 7, nEt: 8,                               // huellas vistas de cada tramo
    zMid: -8 * CORE_RISER                         // cota de la meseta (−1,365)
  }
};
CORE.stair.yLand  = CORE.stair.y0 + CORE.stair.nWt * CORE_TREAD;   // −2,881
CORE.stair.yLand2 = CORE.stair.y0 + CORE.stair.nEt * CORE_TREAD;   // −2,598
/* el techo del núcleo es el mismo faldón que el de la vivienda */
const CORE_CEIL = [[11.30, -7.80, 16.42, -1.52]];

/* ------------------ plantas inferiores (contexto) --------------------
   a02 (planta baja) y a03 (planta primera) están dibujados en el mismo
   marco que a04, así que su geometría se lee sin registrar nada: se
   rasteriza cada paño de fachada y se buscan los tramos sin fábrica.
   El perímetro sale de proyectar la mancha de tinta de a03 fila a fila y
   columna a columna; da 27,10 × 13,35 m, que son las cotas 27,06 y 13,33
   acotadas en el propio plano.

   Cotas (z = 0 en el pavimento de la bajocubierta, +118,00):
     cara inferior del forjado bajocubierta  −0,38   (+117,62)
     planta primera                          −2,90   (+115,10)
     planta baja                             −5,80   (+112,20)
     solera del semisótano                   −8,87   (+109,13)
   -------------------------------------------------------------------- */
const Z_P1 = -2.90, Z_PB = -5.80, Z_SOT = -8.87;

/* la huella son tres prismas escalonados; se tocan sin solaparse */
const BASE_MASS = [
  [-0.20, -5.70, 26.80, -1.25],    // barra Norte, todo el frente
  [ 2.05,-13.05, 24.45, -5.70],    // cuerpo central
  [ 4.70,-14.55, 21.65,-13.05]     // cuerpo Sur (el que lleva los balcones)
];
/* rellenos que cosen las juntas para que no se vea la costura */
const BASE_JOINT = [
  [ 2.05, -5.95, 24.45, -5.45],
  [ 4.70,-13.30, 21.65,-12.80]
];

/* paños vistos.  d='h' recorre en x a una y fija; d='v' recorre en y a
   una x fija.  Los huecos van en coordenada absoluta del eje que recorre */
const BASE_FACES = [
  { d:'h', c: -1.25, a:-0.20, b:26.80, n:+1, holes:[
      [1.23,1.97],[3.35,4.10],[6.20,7.40],[9.95,11.15],[12.78,13.53],
      [15.38,16.57],[19.12,20.32],[22.43,23.18],[24.55,25.30]] },
  { d:'h', c: -5.70, a:-0.20, b: 2.05, n:-1, holes:[[0.42,1.62]] },
  { d:'h', c: -5.70, a:24.45, b:26.80, n:-1, holes:[[24.80,26.00]] },
  { d:'h', c:-13.05, a: 2.05, b: 4.70, n:-1, holes:[[3.05,4.25]] },
  { d:'h', c:-13.05, a:21.65, b:24.45, n:-1, holes:[[22.17,23.38]] },
  { d:'h', c:-14.55, a: 4.70, b:21.65, n:-1, holes:[
      [6.40,7.60],[9.93,11.12],[12.60,13.82],[15.40,16.60],[18.82,20.02]] },
  { d:'v', c: -0.20, a:-1.25, b: -5.70, n:-1, holes:[[-4.03,-2.84]] },
  { d:'v', c: 26.80, a:-1.25, b: -5.70, n:+1, holes:[] },
  { d:'v', c:  2.05, a:-5.70, b:-13.05, n:-1, holes:[] },
  { d:'v', c: 24.45, a:-5.70, b:-13.05, n:+1, holes:[] },
  { d:'v', c:  4.70, a:-13.05, b:-14.55, n:-1, holes:[] },
  { d:'v', c: 21.65, a:-13.05, b:-14.55, n:+1, holes:[] }
];
/* antepecho y dintel de los huecos, sobre el pavimento de cada planta */
const BASE_SILL = 0.95, BASE_HEAD = 2.35;

/* balcones de las plantas inferiores (los cuatro del Sur y el del Oeste) */
const BASE_BALC = [
  [ 5.95,-15.10, 8.20,-14.55], [ 9.40,-15.10,11.75,-14.55],
  [14.95,-15.10,17.25,-14.55], [18.30,-15.10,20.55,-14.55],
  [-0.85, -4.55,-0.20, -2.34]
];

/* cubierta baja de las dos alas de dos plantas: cumbrera en y = −3,51 a
   +2,09 sobre el pavimento de la bajocubierta, aleros en −0,56 y −6,46
   (a05).  Sólo aparece sobre x < 1,53 y x > 25,19.                      */
const WING_ROOF = { ridgeY: -3.51, top: 2.09, s: 0.709, eaveN: -0.16, eaveS: -6.86 };
const WING_BAYS = [[-0.95, 1.53], [25.19, 27.55]];
const wingRoofH = y => WING_ROOF.top - WING_ROOF.s * Math.abs(y - WING_ROOF.ridgeY);

/* terreno: la calle queda al Sur y el terreno sube hacia el Norte y el
   Este (línea de terreno natural de a07 y a08) */
function groundZ(x, y) {
  return -7.55 + 1.75 * Math.min(1, Math.max(0, (y + 16.2) / 16.2))
               + 0.30 * Math.min(1, Math.max(0, (x + 1) / 28));
}

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
  [2.70,-8.80,5.60,-8.20,0.90,'counter'], [5.95,-8.30,9.28,-7.80,0.90,'counter'],
  [3.10,-10.40,4.90,-9.20,0.76,'table'],
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
  [20.35,-8.15,21.35,-6.70,0.55,'tub'], [19.25,-7.00,19.90,-6.60,0.85,'sink']
];

/* --------------------- posiciones de cámara sugeridas ---------------- */
const FIGURES = [[3.55,-4.40],[3.30,-9.10],[11.30,-13.30],[15.90,-12.30],[17.55,-10.90],[11.40,-3.20],[22.60,-10.85]];

const VIEWS = [
  { id:'sal',  name:'Salón–comedor',  pos:[11.15,-10.05], look:[14.60,-13.60, 2.55] },
  { id:'coc',  name:'Cocina',         pos:[ 7.40,-10.75], look:[ 2.90,-10.20, 3.20] },
  { id:'est',  name:'Estudio',        pos:[10.30, -6.60], look:[10.70, -1.70, 2.30] },
  { id:'hab1', name:'Habitación 1',   pos:[ 5.20, -7.60], look:[ 4.24, -2.40, 2.20] },
  { id:'vest', name:'Vestidor',       pos:[ 9.00, -4.90], look:[ 5.70, -4.70, 1.70] },
  { id:'rec',  name:'Recibidor',      pos:[11.20, -8.70], look:[19.60, -8.60, 2.10] },
  { id:'hab2', name:'Habitación 2',   pos:[19.90,-10.20], look:[19.80,-13.90, 2.00] },
  { id:'dis',  name:'Distribuidor',   pos:[16.35, -8.75], look:[20.60, -8.60, 2.30] },
  { id:'hab3', name:'Habitación 1 E', pos:[23.70, -8.20], look:[21.10,-10.60, 1.50] },
  { id:'ban2', name:'Baño 2',         pos:[19.79, -8.10], look:[21.20, -6.85, 1.30] }
];
