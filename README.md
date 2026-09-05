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
  Lleva su propia barra de navegación: **Encajar**, **Cenital**, **Isométrica**
  y los cuatro **alzados** (N, S, E, O), cada uno encuadrado de forma exacta
  —se proyectan las ocho esquinas de la envolvente sobre los ejes de pantalla,
  no una esfera envolvente, así que el encuadre queda justo—, con transición
  suave y una brújula que dice hacia dónde cae el Norte. La rueda acerca
  **hacia el punto del cursor**; el botón central, el derecho o `⇧`+arrastrar
  desplazan; `WASD` y las flechas también; `1`…`7` llaman a las vistas.
  La órbita llega hasta los **89°**, de modo que la cenital es cenital de
  verdad, y en maqueta el ángulo de visión baja a 32° para que la maqueta se
  lea casi como una axonometría y las paredes no se abran hacia los bordes.
- **Planta** — dibujo 2D a escala: muros con sus huecos, pilares, patinillos,
  cumbreras y peldaños de cubierta, rótulos y escala gráfica. Es la vista donde
  se trabajan los falsos techos: el punto se **imanta** a las caras de muro, a
  las jambas y a las esquinas de cada estancia, y al arrastrar se ve en vivo la
  medida del rectángulo. Con la herramienta de falso techo activa, se **sombrea
  en rojo la parte donde el faldón ya está por debajo de la altura tecleada**,
  así que se ve de un vistazo hasta dónde cabe cada banda. Arrastrar desplaza,
  la rueda (o el pellizco) acerca, `esc` anula la esquina pendiente.
- **Rótulos** — nombre y superficie útil de cada estancia (las del cuadro de a04).
- **Estructura** — tiñe pilares y patinillos para localizarlos de un vistazo.
- **Pladur** — muestra u oculta las bandas de falso techo, para poder mirar la
  maqueta sin ellas. Con la herramienta de *Falso techo* abierta se fuerzan
  visibles, que si no se editaría a ciegas.
- **Falso techo** — crea zonas de pladur (mejor desde **Planta**). Una estancia puede llevar varias
  alturas, así que la unidad es la **zona**: un rectángulo con *su* altura.
  Se escribe la altura libre (y una nota opcional), se dan dos clics en el suelo
  —o se pulsa *Toda la estancia*— y la banda aparece al momento en el modelo con
  el canto marcado. Donde dos zonas se solapan manda la más baja. El indicador de
  altura libre pasa a leer la del falso techo y la cámara se agacha bajo él.
  El botón **Pladur** las muestra u oculta.
  *Copiar lista* exporta todas las zonas con coordenadas y alturas; se guardan
  en el navegador, de modo que se pueden ir metiendo por tandas.
  **Se pueden modificar**: un clic sobre una banda en la vista *Planta* la
  selecciona y saca ocho tiradores —las cuatro esquinas y los cuatro puntos
  medios de lado—; se arrastra un lado para alargarla o ensancharla, o el
  interior para moverla entera, y todo se sigue imantando a los muros. La
  altura y la nota del panel pasan a aplicarse a la banda seleccionada.
  `Supr` la borra, `esc` deselecciona.
  Las bandas contiguas **a la misma cota forman un solo plano**: sólo se
  cierran los cantos libres, así que dos rectángulos que se tocan no dejan
  junta a la vista. El escalón sí se ve cuando las alturas son distintas.
- **El edificio entero** bajo la vivienda: las dos plantas inferiores con sus
  huecos y balcones, las alas de dos plantas de los extremos con su cubierta
  baja, y el terreno a la cota que le corresponde. La vivienda es una tercera
  planta y se ve como tal.
- **El rellano** al otro lado de la puerta de entrada, en gris: el espacio común
  (9,30 m²), la caja de escalera con sus 17 peldaños bajando a la planta
  primera, el hueco del ascensor —abierto por arriba, con su puerta al rellano—,
  los armarios de contadores y el R.I.T.S., y el muro medianero que separa el
  rellano de la vivienda A. Lleva su falso techo a 2,35 m con el hueco de la
  Velux y su cañón de luz hasta el faldón. Aparece también en la vista
  **Planta**.
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
`x = 2,20`. Se modela con el resto del edificio, no con la vivienda.

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
| Habitación 1 (norte) | 0,61 × 0,78 | junto a la buhardilla, `4,75–5,36 / −3,32…−4,10` |
| Habitación 1 (E) | 0,85 × 0,78 | en el rincón con habitación 2 |

El de la habitación 1 pasa por dentro del dormitorio sin servirlo: en `a05`
está rotulado *«Extracción de campana 1ºC y 2ºE · Bajante · Ventilación cocina
y wc de 1ºC y 2ºE»*.

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
| Vestidor – Estudio | `y −4,72…−5,42` en `x = 9,40` |
| Recibidor – Estudio | hueco de 0,94 m entre `x = 9,46` y el patinillo (`x = 10,40`), sin puerta |
| Cocina – Recibidor | corredera, `y −8,36…−9,25` en `x = 9,40` |
| Baño 2 | `x 19,44–20,14` en `y = −8,32` |
| Habitación 1 (E) | `y −8,51…−9,19` en `x = 20,76` |
| Habitación 2 | `x 19,42–20,10` en `y = −9,37` |

Entre el recibidor y el distribuidor no hay tabique: el muro de `x = 16,50`
sólo arranca en `y = −9,30` hacia el Sur, separando el salón de la habitación 2.
El muro Sur del baño 1 (`y = −7,52`) es corrido de `x = 5,90` a `9,50`, de modo
que el baño 1 sólo se abre al vestidor y el ala izquierda se recorre por el paso
vestidor–estudio de `x = 9,40`.

Al **estudio se entra desde el recibidor**, no desde la cocina: el tabique de
`x = 9,40` es corrido desde el muro Norte hasta `y = −8,36`, así que separa la
cocina del recibidor en toda esa altura, y el hueco que queda entre su cara
Este y el patinillo del testero Sur del estudio es el paso. La cocina comunica
con el recibidor por una **corredera** en ese mismo tabique (`y −8,36…−9,25`,
0,89 m), y con el salón no comunica: el muro de `y = −9,32` y el de `x = 10,22`
cierran ese lado.

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

## Las plantas inferiores

`a02` (planta baja) y `a03` (planta primera) están dibujados en el mismo marco
que `a04`, así que su geometría se lee sin registrar nada. El perímetro sale de
proyectar la mancha de tinta de `a03` fila a fila y columna a columna:
**27,10 × 13,35 m**, que son las cotas 27,06 y 13,33 acotadas en el propio
plano. Es una huella escalonada en tres cuerpos:

| Cuerpo | Huella |
|---|---|
| Barra Norte, todo el frente | `−0,20 … 26,80` × `−1,25 … −5,70` |
| Cuerpo central | `2,05 … 24,45` × `−5,70 … −13,05` |
| Cuerpo Sur (el de los balcones) | `4,70 … 21,65` × `−13,05 … −14,55` |

Los **huecos** se sacan rasterizando cada paño de fachada y buscando los tramos
sin fábrica: nueve en la fachada Norte, cinco en la Sur del cuerpo profundo, uno
en cada retranqueo y la puerta de balcón del testero Oeste (Viv. E). Los cuatro
balcones del Sur y el del Oeste salen del mismo barrido.

Las **alas de los extremos** son de dos plantas y llevan la tercera cubierta
—cumbrera en `y = −3,51` a +2,09 sobre el pavimento de la bajocubierta, aleros
en `−0,56` y `−6,46`— que en `a05` sólo aparece sobre `x < 1,53` y `x > 25,19`.

El **terreno** sigue la línea de terreno natural de `a07` y `a08`: la calle
queda al Sur y sube hacia el Norte y el Este, de modo que el semisótano del
garaje (solera +109,13) queda visto por delante y enterrado por detrás.

## El rellano, la escalera y el ascensor

Todo lo que queda fuera de la puerta de entrada se modela en **gris**, igual que
el resto del edificio: no forma parte de la vivienda y por eso queda fuera de
`ROOMS`/`WALLS` y de las comprobaciones de `check.js`. Los datos están en
`CORE` (`model.js`) y la malla la levanta `buildCore()` (`build.js`).

Está medido sobre `a04` y contrastado con `a03`; en `a01` el hueco del ascensor
aparece rotulado **«Previsión Hueco Ascensor»** con la misma huella (ese plano
va desplazado ≈ +0,44 m en x respecto del marco de `a04`, desfase que se detecta
alineando el muro Oeste de la caja de escalera y el propio hueco).

| Recinto | Huella |
|---|---|
| Escalera · `S: 7,15 m²` | `12,21 … 14,38` × `−1,60 … −4,87` (7,11 medidos) |
| Espacio común, el rellano · `S: 9,30 m²` | `11,34 … 16,21` × `−4,87 … −7,35` |
| Hueco de ascensor | `14,40 … 16,40` × `−3,85 … −5,90`, muros de 0,20 |
| Puerta del ascensor (al Sur) | `x = 14,70 … 15,75` |
| R.I.T.S. | `13,30 … 14,38` × `−4,87 … −5,41` |
| Contadores A.F.S. y A.C.S. | `11,16 … 12,21` × `−4,87 … −6,05` |
| Ventanal de la escalera | `x = 12,92 … 13,68`, `z = 0,90 … 2,20` |

La escalera es de **ida y vuelta**, con **17 peldaños** entre la planta primera
(`−2,90`) y la bajocubierta: tabica `2,90/17 = 0,1706` y huella `0,2838`
(2·t + h = 0,63). El tramo Oeste baja del rellano a la meseta con 8 tabicas y el
Este sigue hasta la primera planta con 9; al ser distintos, la **meseta queda
escalonada** —por eso en `a04` el peldaño 9 está una huella más al Norte que el
10— y los dos tramos desembocan en la misma línea `y = −4,87`, uno a cada lado
del zanquín central (`x = 13,23 … 13,36`). El arranque del tramo Este queda
protegido por el propio armario del R.I.T.S., que cierra ese borde del rellano.

El **hueco de la escalera** baja 2,90 m, así que atraviesa todas las losas
horizontales del zócalo: macizo retranqueado, remate, cornisa, imposta de la
planta primera y canto de forjado. `capHole()` y `boxHole()` las recortan con el
mismo rectángulo, y **sin cerrar los cantos del hueco**: los paramentos grises
que pone `buildCore()` coinciden justo con el borde del recorte, de modo que no
quedan caras superpuestas que produzcan bandas de *z-fighting*.

### Falso techo y lucernario

El rellano lleva **falso techo a 2,35 m** (cota dada por la propiedad) con un
**hueco para la Velux** que lo ilumina. El hueco es el rectángulo de
0,75 × 0,98 m que `a04` dibuja en el centro del rellano en la capa de proyección
—lo que queda por encima del plano de corte—: quedaba sin explicar hasta que la
propiedad confirmó que ahí hay un lucernario.

Cae en el faldón Oeste del hastial Norte (61 %), donde la cubierta está entre
`4,29` y `4,75 m`, así que el **cañón de luz** baja 1,94–2,40 m desde el faldón
hasta el falso techo. El hueco se recorta también en el faldón: las líneas del
mallado de `buildCeiling()` se fuerzan a pasar por los cuatro bordes de cada
lucernario (`VELUX`), de modo que el recorte es exacto y no queda dentado por el
paso de 0,22 m de la retícula. El vidrio va en el plano de cubierta, 4 mm por
fuera, y se oculta con el botón **Techo**; el falso techo, con **Pladur**.

El ascensor abre **al Sur**, sobre el rellano; delante está trazado el círculo
de maniobra de `Ø 1,50` y por eso el rellano se prolonga al Este hasta el muro
de la vivienda A (`x = 16,30`). La caja se deja **abierta por arriba** para poder
mirar el hueco desde la maqueta. La fachada Norte de la caja de escalera se
pinta del color del resto del edificio para que el paño siga siendo continuo
desde fuera; el resto del núcleo va en gris.

No se modela la vivienda A: al Este del rellano sólo está el muro medianero.

## Comprobación del modelo

`node viewer/check.js` pasa dos pruebas sobre la geometría, y `build.py` la
ejecuta antes de empaquetar: si falla, no genera el visor.

1. **Estanqueidad** — recorre el perímetro de cada estancia 5 cm por fuera y
   exige que cada punto sea macizo (muro, pilar, patinillo, balcón) o interior
   de otra estancia o de un hueco de paso. Un tramo de puntos seguidos que no
   cumple es un agujero: falta muro, los muros no cierran la esquina, o el
   rectángulo de la estancia no casa con la cara del paramento.
2. **Conexión** — relleno por inundación desde el recibidor con el mismo disco
   de 0,20 m que usa la cámara, para verificar que las once estancias son
   accesibles.

Hacen falta las dos. La de conexión sola sólo detecta pasos que **faltan**,
nunca pasos que **sobran**: así es como sobrevivió durante varias revisiones una
ranura de 15 cm a lo largo de todo el muro entre la habitación 1 y la cocina
—el muro estaba colocado 15 cm al Sur de su sitio y los rectángulos de las dos
estancias no llegaban a él— mientras la prueba de conexión seguía dando 11/11.

## Estructura

```
planos/            a01–a14 originales
viewer/
  model.js         cotas, cubierta, estancias, muros, huecos, falsos techos, vistas
  build.js         generación de la malla three.js
  app.js           cámara, controles, HUD
  shell.html       interfaz y estilos
  check.js         estanqueidad + conexión
  build.py         comprueba y empaqueta todo en piso-b-3d.html
  piso-b-3d.html   ← el visor (autocontenido)
```

Para regenerar el visor tras editar cualquier fuente: `python3 viewer/build.py`.
