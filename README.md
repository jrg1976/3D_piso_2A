# Piso B · planta bajocubierta — modelo 3D interior

Recorrido interior en 3D de la **vivienda B de la planta bajocubierta** del
Bloque 3 (UE-VP Manzana A, Benasque), levantado a partir de los planos de
ejecución `a01`–`a14` de Domper Domingo arquitectos (septiembre 2015).

Abrir `viewer/piso-b-3d.html` en un navegador. Es un único archivo
autocontenido (three.js incluido), sin dependencias externas.

## Qué se ve

- **Recorrer** — cámara en primera persona a 1,62 m de altura de ojo, con
  `WASD` / flechas y arrastre para mirar. La cámara no atraviesa muros y se
  agacha automáticamente bajo los faldones; el panel inferior izquierdo indica
  la altura libre en cada punto.
- **Maqueta** — vista orbital; al entrar se retira el techo para mirar dentro.
  `Cubierta` superpone el plano de faldones con 0,72 m de vuelo de alero.
- **Rótulos** — nombre y superficie útil de cada estancia (las del cuadro de a04).
- **Estructura** — tiñe pilares y patinillos para localizarlos de un vistazo.
- **Medir** — marca puntos con un clic en el suelo y copia sus coordenadas; dos
  clics definen un rectángulo. Sirve para situar cualquier añadido sin tener que
  describirlo con palabras.
- **Falso techo** — crea zonas de pladur. Una estancia puede llevar varias
  alturas, así que la unidad es la **zona**: un rectángulo con *su* altura.
  Se escribe la altura libre (y una nota opcional), se dan dos clics en el suelo
  —o se pulsa *Toda la estancia*— y la banda aparece al momento en el modelo con
  el canto marcado. Donde dos zonas se solapan manda la más baja. El indicador de
  altura libre pasa a leer la del falso techo y la cámara se agacha bajo él.
  *Copiar lista* exporta todas las zonas con coordenadas y alturas; se guardan
  en el navegador, de modo que se pueden ir metiendo por tandas.
- Figuras de escala de 1,75 m y mobiliario esquemático como referencia de tamaño.

## Cómo se ha obtenido la geometría

Los PDF son vectoriales con el texto convertido a curvas, así que la geometría
se ha medido directamente sobre las polilíneas con PyMuPDF, no a ojo.
Escala verificada: **1:50 sobre A1** (hoja de 2384×1684 pt = 841×594 mm), es
decir **1 pt = 17,639 mm**; contrastada con la cota de 29,06 m de `a01`.

### Cotas verticales (secciones a10–a14)

| Elemento | Cota |
|---|---|
| Solera semisótano | +109,13 |
| Planta baja | +112,20 |
| Planta primera | +115,10 |
| Forjado bajocubierta (cara superior) | +117,92 |
| Pavimento bajocubierta (**z = 0** del modelo) | +118,00 |
| Canto de forjado | 0,30 + 0,08 de pavimento |
| Altura libre entre plantas | 2,52 m |

### Cubierta: dos aguas a distinta altura

No hay una cubierta sino **dos**, superpuestas y desfasadas. Se ven de frente en
`a08` y en la sección `a13`, donde las dos cumbreras aparecen una detrás de otra,
separadas 0,80 m en planta y 0,52 m en altura:

| | Cumbrera | Vértice interior | Cota exterior |
|---|---|---|---|
| Cuerpo principal, `4,33 < x < 22,38` | `y = −8,27` | 5,00 m | 11,03 m |
| Vuelos extremos, `x < 4,33` y `x > 22,38` | `y = −7,47` | 4,48 m | 10,51 m |

El faldón **Norte es común** a las dos: el plano que pasa por el vértice alto
pasa exactamente por el bajo, y por eso en `a04` no hay línea de quiebro al
norte de la cumbrera. Lo que se duplica es el faldón **Sur**, y entre ambos
queda un **peldaño vertical** en `x = 4,33` y `x = 22,38` —dibujado en `a04`
justo desde la cumbrera (`y = −7,47`) hasta el muro Sur de los vuelos
(`y = −11,16`)— que llega a **1,04 m** de salto. Parte en dos el techo de la
**cocina** y el de la **habitación 1 (E)**.

Sobre el cuerpo central montan además dos hastiales transversales, ambos con el
vértice a 5,00 m:

| Plano | Cumbrera | Pendiente |
|---|---|---|
| Hastial transversal Norte (estudio) | `x = 14,60` | 61 % |
| Hastial transversal Sur (salón, frontón del alzado principal) | `x = 13,36` | 91 % |

**Comprobaciones.** Los cuatro planos que ven las cumbreras de frente —alzados
`a06` y `a08`, secciones `a11` y `a13`— dan el mismo par medido sobre los
vectores: 5,00 y 4,48 m, con 0,80 m de desfase en planta y 0,52 m en altura. Que
0,52/0,80 = 65 % es justamente lo que obliga a que el faldón Norte sea común a
las dos cubiertas. En `a05` la cumbrera baja está dibujada **sólo** sobre
`x = 1,53–4,33` y `x = 22,39–25,19`, que son exactamente los dos vuelos extremos.

Las limahoyas dibujadas en `a05` son la intersección de estos planos: los puntos medidos —(9,62; −3,57) y (14,59; −8,27) para la del Norte,
(10,07; −12,90) y (13,29; −8,37) para la del Sur— caen sobre la intersección
calculada con menos de 2 cm de error. La altura de alero que se deduce (0,40 m
al Sur, 0,65 m al Norte) coincide con la medida directamente en la sección `a11`.
Y las dos cumbreras exteriores reproducen las dos cotas acotadas en los alzados
`a07` y `a08`: 11,03 y 10,51 m sobre +112,20.

Tres buhardillas/miradores: habitación 1 (Norte) y cocina y habitación 2 (Sur),
con faldón al 80 % y alero enrasado con el faldón general.

Existe todavía una **tercera cubierta más baja** —cumbrera en `y = −3,51`,
vértice a 2,09 m sobre el pavimento— que es el frontón pequeño que se ve a la
izquierda de `a06`. En `a05` sus dos aleros (`y = −0,56` y `y = −6,46`) y su
cumbrera sólo aparecen sobre `x < 1,53` y `x > 25,19`: cubre las alas de dos
plantas de los extremos y queda fuera de la vivienda, cuyo muro Oeste está en
`x = 2,20`. Por eso no se modela.

### Pilares

Detectados en `a04` como cuadrados de trazo grueso de **0,14 m** dentro de un
trasdosado de 0,21 × 0,20. Casi todos caen sobre los ejes de cumbrera, que es
donde apoya la estructura de cubierta: seis sobre `y = −8,27` y dos sobre
`x = 13,36`. Cinco quedan **exentos** dentro de la vivienda:

| Estancia | Posición |
|---|---|
| Cocina | 9,08 / −8,27 |
| Recibidor | 13,36 / −8,27 |
| Salón–comedor | 13,36 / −11,06 |
| Distribuidor | 17,75 / −8,27 |
| Baño 2 | 20,85 / −8,27 |

El del salón queda en mitad de la estancia, sobre el eje del hastial.
Otros cuatro van embebidos en muros (jamba cocina, tabique del recibidor,
machón entre las puertas del balcón y testero del estudio).

### Patinillos y salidas de humos

Bloques de fábrica que arrancan del semisótano —la sala de máquinas de
ventilación del garaje de `a01`— y salen por cubierta. La coronación está
acotada en la sección A-A' (`a10`): **+6,25 m** sobre el pavimento de la
bajocubierta, es decir ≈ 1 m por encima de la cumbrera, coherente con las
chimeneas dibujadas en los alzados.

| Patinillo | Planta | Situación |
|---|---|---|
| Cocina | 0,51 × 0,90 | exento en el centro de la cocina |
| Estudio | 0,78 × 1,09 | adosado al testero Este |
| Estudio Sur | 1,02 × 0,45 | dentro del muro Sur |
| Recibidor «V. GARAJE» | 1,56 × 0,95 | adosado al muro Norte, `14,46–16,02 / −7,42…−8,37` |
| Habitación 1 (E) | 0,80 × 0,78 | en el rincón con habitación 2 |

Según los rótulos de `a05` llevan la extracción de campana y la ventilación de
cocina y baños de 1ºB, 2ºD, 1ºE, 2ºB y de este mismo 3ºB, más las bajantes y
los montantes de calefacción y AFS/ACS.

El mayor de todos es el rotulado **«V. GARAJE»** en `a04`: es la salida de la
ventilación del garaje y vuelve a aparecer con el mismo rótulo en la planta de
cubierta `a05`, junto a la trampilla y a la máquina de ventilación.

## Puertas y circulación

Los huecos se han medido jamba a jamba sobre `a04`:

| Paso | Hueco |
|---|---|
| Entrada desde el espacio común | `x 11,56–12,30` en `y = −7,76` |
| Recibidor – Distribuidor | sin puerta: hueco corrido |
| Cocina – Baño 1 | no existe paso |
| Vestidor – Baño 1 | `x 7,72–8,45` en `y = −5,68` |
| Vestidor – Estudio | `y −4,72…−5,42` en `x = 9,39` |
| Baño 2 | `x 19,44–20,14` en `y = −8,32` |
| Habitación 1 (E) | `y −8,51…−9,19` en `x = 20,76` |
| Habitación 2 | `x 19,42–20,10` en `y = −9,37` |

Entre el recibidor y el distribuidor no hay tabique: el muro de `x = 16,50`
sólo arranca en `y = −9,30` hacia el Sur, separando el salón de la habitación 2.
El muro Sur del baño 1 (`y = −7,52`) es corrido de `x = 5,90` a `9,50`, de modo
que el baño 1 sólo se abre al vestidor y el ala izquierda se recorre por el paso
vestidor–estudio de `x = 9,39`.

El pequeño «Distribuidor S: 1,76 m²» dibujado al Norte del muro `y = −7,43` no
pertenece a esta vivienda —su puerta está en el tabique `x = 16,30`— y las once
estancias rotuladas de B suman 144,78 m², que es la superficie del cuadro
(144,76 m²).

## Falsos techos

Las zonas confirmadas se guardan en `CEILINGS`, dentro de `viewer/model.js`:

```js
const CEILINGS = [
  { x0: 5.95, y0: -7.40, x1: 9.40, y1: -5.75, h: 2.40, name: 'Baño 1' },
  { x0: 8.60, y0: -7.30, x1: 9.40, y1: -5.85, h: 2.15, name: 'sobre la bañera' },
];
```

`h` es la altura libre del pavimento a la cara inferior del pladur. Una estancia
admite tantas zonas como haga falta y pueden solaparse: donde lo hagan manda la
más baja. El botón **Falso techo** del visor genera exactamente ese bloque, listo
para pegar aquí.

## Estructura

```
planos/            a01–a14 originales
viewer/
  model.js         cotas, cubierta, estancias, muros, huecos, falsos techos, vistas
  build.js         generación de la malla three.js
  app.js           cámara, controles, HUD
  shell.html       interfaz y estilos
  build.py         empaqueta todo en piso-b-3d.html
  piso-b-3d.html   ← el visor (autocontenido)
```

Para regenerar el visor tras editar cualquier fuente: `python3 viewer/build.py`.
