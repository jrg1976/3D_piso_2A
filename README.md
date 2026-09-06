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
- **Altillo 1 / Altillo 2** (propuestas, excluyentes) — dos estudios de
  volumetría. El 1, sobre el distribuidor y el baño 2: forjado nuevo a +2,45, hueco de escalera, barandilla,
  Velux propuesto, mobiliario y los tabiques que habría que derribar por encima.
  En *Planta* se sombrea por bandas de altura libre; la vista *Altillo* sube la
  cámara al tablero y se anda por él.
  El 2, sobre el falso techo del rellano, suprimiendo el cañón de luz para que la
  Velux ilumine el altillo. El botón levanta la propuesta dentro del
  piso; la vista *Altillo* de la barra de maqueta aísla la activa —recorta la
  escena a su caja y pasa muros y faldón a translúcido— y en Recorrer devuelve
  todo a opaco y sube la cámara al tablero.
- Figuras de escala de 1,75 m y mobiliario esquemático como referencia de tamaño.

## Cómo está ordenada la interfaz

Los controles no son todos de la misma clase, así que no se presentan igual. La
barra superior lleva dos filas: la primera dice **qué** se mira —la hoja y sus
datos—, la segunda **cómo**, en cuatro grupos rotulados.

| Grupo | Forma | Contenido |
|---|---|---|
| **Vista** | segmentado negro (selector) | Recorrer · Maqueta · Planta |
| **Propuesta** | segmentado ámbar (selector) | Estado actual · Altillo 1 · Altillo 2 |
| **Capas** | píldoras con punto (interruptores) | Techo · Cubierta · Estructura · Mobiliario · Pladur · Rótulos |
| **Herramienta** | botón que abre panel | Falso techo |

- **Vista y Propuesta son selectores.** Antes «Altillo 1» y «Altillo 2» parecían
  interruptores sueltos aunque fueran excluyentes, y no existía forma de pedir
  explícitamente el estado actual: se salía apagando el altillo encendido. Ahora
  son tres botones de un mismo mando con **Estado actual** como opción de pleno
  derecho (`setAltillo(0)`).
- **Las propuestas van en ámbar** y encienden un filo ámbar en la barra
  (`.topbar.proposal`): lo que se ve no es lo construido.
- **Las capas son independientes** y tienen otra forma —píldora con punto— porque
  se combinan libremente y ninguna cambia el modelo.
- **Falso techo es lo único que edita**, así que va aparte y abre su propio panel.
  Lo que produce se muestra u oculta con la capa **Pladur**.
- La lista de la izquierda separa **estancias** de **propuestas**.
- **Aislar altillo** (barra de maqueta) sale deshabilitado sin propuesta activa.
- Los dos paneles de la derecha —notas y falso techo— se excluyen y se cierran con
  la ✕ o con `esc`.
- La altura real de la barra se mide en tiempo de ejecución y se publica como
  `--topbar-h`, porque en pantallas estrechas la fila de control se envuelve; las
  notas y el índice se posicionan contra esa variable. Por debajo de 760 px la
  fila pasa a ser una sola tira deslizable sin rótulos de grupo.

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

Éste es el **estado actual**. La propuesta **Altillo 2** suprime el cañón y cierra
el falso techo entero, y entonces la Velux ilumina el altillo y deja el rellano sin
luz natural (ver más abajo).

**Pie derecho de madera.** En el borde Sur del rellano, sobre el eje `x = 14,588`,
a04 dibuja un cuadrado de 0,14 con la cruz de ejes estructurales
(`14,52–14,66 / −7,35…−7,50`). Ese eje es la **cumbrera del hastial Norte**
(`ROOF.gableNx = 14,60`) y es también el que escalona el pavimento del rellano, así
que el pilar sube hasta ella: es el pie derecho que recibe la cumbrera. Va embebido
en el tabique de 0,15 que separa el rellano del recibidor; se modela 2 cm más ancho
(`CORE.post`) para que asome por las dos caras y se vea, en madera, en lugar de
quedar escondido. Atraviesa el altillo 2 por su esquina Sureste —y le sirve de
apoyo—; la cama se ha separado 3 cm del muro para dejarlo libre.

La caja del ascensor se deja **abierta por arriba** para ver el recorrido, pero sus
dos paños Este y Norte son **medianera con la vivienda A** y suben hasta el faldón
(`upTo()` en `buildCore()`): desde el tablero del altillo 2, a 2,55, la vista pasa
por encima de la caja —que corona a 2,90— y sin ellos se veía el exterior.

El ascensor abre **al Sur**, sobre el rellano; delante está trazado el círculo
de maniobra de `Ø 1,50` y por eso el rellano se prolonga al Este hasta el muro
de la vivienda A (`x = 16,30`). La caja se deja **abierta por arriba** para poder
mirar el hueco desde la maqueta. La fachada Norte de la caja de escalera se
pinta del color del resto del edificio para que el paño siga siendo continuo
desde fuera; el resto del núcleo va en gris.

No se modela la vivienda A: al Este del rellano sólo está el muro medianero.

## Altillo 1 — sobre el distribuidor y el baño 2 (propuesta)

Estudio de volumetría, no estado actual: se enciende con el botón **Altillo**.
Datos en `ALTILLO` (`model.js`), malla en `buildAltillo()` (`build.js`).

La zona es la mejor del piso para un altillo: la **cumbrera principal**
(`y = −8,27`, 5,00 m) la cruza de Este a Oeste, **no hay ningún patinillo**
dentro, y el único **pilar exento** (`17,75 / −8,27`) cae justo en el eje, de
modo que sirve de apoyo en vez de estorbar.

| Cubierta sobre la zona | |
|---|---|
| Borde Norte del baño 2 | `3,85 m` |
| Cumbrera | `5,00 m` |
| Borde Sur del distribuidor | `4,30 m` |

**El falso techo no se puede reforzar**: va colgado del faldón con varillas y
aguanta ~20 kg/m²; un suelo pide 200 (300 si es trastero). Hace falta forjado
nuevo — pero las luces son mínimas: viguetas **N–S de 1,85–1,95 m** apoyadas en
cargaderos (UPN o angular) atornillados a los muros Norte y Sur, canto total
`0,20` con el tablero. Con esa luz no hacen falta vigas ni pilares nuevos.

Tablero a `2,45` → `2,25 m` libres debajo (mínimo habitual de pasillo y baño;
debajo sólo quedan distribuidor y baño). Mantener 2,44 debajo obliga a subir el
tablero a 2,62 y cuesta 1,8 m² de superficie de pie.

| tablero a 2,45 | |
|---|---|
| Huella bruta | 11,28 m² |
| Pilar exento y machón de la bajante | −0,19 m² |
| Hueco de escalera | −1,52 m² |
| Suelo pisable | 9,57 m² |
| h ≥ 1,50 (computable) | **9,34 m²** |
| h ≥ 1,90 (de pie) | **7,60 m²** |
| h ≥ 2,20 | 4,25 m² |
| Altura media / máxima | 2,12 / 2,55 m |
| Volumen | 20,3 m³ |

### La bajante del baño 2

En `a04`, dentro del machón de 0,38 de la jamba del baño, hay un círculo de 0,11
en un recuadro de 0,13 (`19,13–19,26 × −8,14…−8,26`). **No es un pilar**: los dos
pilares de la zona —`17,75` y `20,85`— van rayados en cruz y con la marca de eje
estructural, y éste no; es el símbolo de bajante que el plano usa también en los
patinillos. En `a05` no asoma por cubierta, así que o baja sin ventilación
primaria o ésta no está dibujada: se modela subiendo hasta el faldón, que es el
caso malo.

Consecuencia: **el machón no se derriba** —encierra la bajante— y atraviesa el
tablero, dejando el paso Norte entre los dos brazos en `0,46 m`. Se rodea por el
Sur, donde hay `0,97`.

**Obras que implica.** Derribar por encima del forjado el tabique `x = 19,06`
entre `y = −7,44` y `−8,38` —el tramo al Norte de −7,44 es medianera y se queda—
y el de `y = −8,32` con la puerta del baño. Son tabiquería, no estructura. Sin eso el altillo queda partido en dos. Van marcados con `cut:true`
en `WALLS`: `buildApartment()` los mete en una malla aparte (`apt.cutWalls`) que
se oculta al encender el altillo, y `buildAltillo()` levanta su versión recortada
a la cota del tablero.

**Acceso: 1,60 m no da el desarrollo.** Con 11 tabicas de `0,223` en 1,60 m la
huella sale de `0,145` y la pendiente de 57°: eso es una escala de gato. Se
adopta la de peldaños alternos a 45°, que con la misma tabica da huella de
`0,223` y sólo cuesta 0,37 m² más de tablero.

| Escalera | Hueco | Pisable | h ≥ 1,90 |
|---|---|---|---|
| A · escala de gato · 1,60 × 0,72 · 57° | 1,15 m² | 9,94 m² | 7,97 m² |
| **B · peldaños alternos · 2,45 × 0,62 · 45°** | 1,52 m² | **9,57 m²** | **7,60 m²** |
| C · escalera CTE · 2,64 × 0,80 | 2,11 m² | 9,02 m² | 7,05 m² |

La C es la única que cumple *escalera de uso restringido* (ancho 0,80, tabica
≤ 0,20, huella ≥ 0,22), pero se come 2,11 m² y deja el altillo sin armario. Va
contra el muro **Norte** del brazo Oeste para que el paso quede por el **Sur del
pilar**, que da `0,98 m`; al revés sólo quedarían `0,63`.

**Luz.** La única posición posible para un Velux es el faldón Norte sobre el baño
2 (`19,60–20,38 × −6,75…−7,74`): ahí quedan 1,72 m de faldón propio antes de la
medianera con la vivienda A. Sobre el distribuidor no cabe —al Norte la medianera
está a 0,83 m de la cumbrera y al Sur sólo hay 1,08—. Queda a 1,57–2,21 m sobre
el tablero, justo donde el faldón baja de 1,50, que es lo que hace utilizable esa
franja.

**Amueblado.** El faldón manda: lo que necesita altura va al eje de la cumbrera y
lo que se usa tumbado o sentado, bajo el alero.

| Mueble | Altura libre encima |
|---|---|
| Cama 1,20 × 1,90 · E–O bajo el alero Norte y bajo la Velux | `1,48 → 2,26 m` |
| Cabecero al Este, contra el muro · sobre el colchón | `1,37 m` |
| Armario 1,48 × 0,55 × 1,75 · muro Sur del brazo Oeste | `1,85 → 2,21 m` |
| Escritorio 1,20 × 0,55 · muro Sur del brazo central | `1,85 → 2,21 m` |
| Silla · frente al escritorio, sobre la cumbrera | `2,24 → 2,53 m` |
| Balda 0,40 × 0,35 × 0,45 · a la cabecera de la cama | `2,26 → 2,49 m` |

La cama va **tumbada de Este a Oeste**, no de Norte a Sur: el brazo del baño sólo
tiene `1,72 m` de fondo y un colchón de 1,90 no cabe sin invadir el paso. Se
duerme a lo largo, así que **el cabecero va en el testero corto del Este**,
contra el muro del baño; a la cama se entra por el Oeste (los pies) y por el lado
Sur, donde quedan `0,44 m` y 2,26 m de altura. Sentado contra el cabecero quedan
`1,37 m` sobre el colchón. Almohada y cabecero van en un tono claro aparte
(`Mt` en `buildAltillo`) y rotulados en *Planta*. La Velux cae sobre la mitad de
los pies.

**Sí cabe armario**, pero de altillo: 1,48 × 0,55 × **1,75** de alto (1,4 m³, casi
1,50 m de barra), contra el muro Sur del brazo Oeste y **al Oeste del pilar**,
para que al pasar por delante del pilar queden los 0,98 m enteros. Uno de 2,00
sólo entraría contra el muro Norte, y ahí está la escalera. Con la escalera C del
CTE ya no cabe.

**Volumetría aislada.** El botón **Altillo** de la cartela sólo levanta la
propuesta: en Maqueta se ve dentro del piso entero. El aislado es una **vista de
la barra de maqueta** (`data-orb="alt"`), junto a Encajar / Cenital / Isométrica:
pone seis `THREE.Plane` de recorte global en el renderer alrededor de la caja del
altillo —desde el pavimento del distribuidor hasta el faldón, para que la
escalera se vea entera— y pasa a translúcido los muros, el faldón, **los
patinillos** y **las dos masas del núcleo** (`core.mats`: fábrica y caja del
ascensor). Los patinillos entraron en la caja de recorte al incluir en ella la
escalera de acceso del altillo 2 y, opacos, tapaban el tablero desde cualquier
ángulo. Cualquier otra vista de esa barra lo desactiva.

`applyIso()` sólo aplica el recorte cuando `mode === 'orbit'`: en *Recorrer* el
recorte dejaba fuera todo lo que hay por debajo de la caja y no se veía nada, y
con los muros en translúcido tampoco se leían los techos desde dentro. Al pasar a
*Recorrer* la cámara sube al tablero (`setMode` llama a la vista `alt`), y al
volver a Maqueta se reencuadra el altillo.

**A verificar.** Altura libre mínima admitida debajo y cómputo de la superficie
del altillo (habitabilidad de Aragón y ordenanza de Benasque); autorización de la
comunidad; capacidad de los muros Norte (0,20) y Sur (0,13) para recibir los
cargaderos —si no dan, dos pies derechos junto al pilar—; y el paso de la
extracción del baño 2 hasta el patinillo, que ahora va por el falso techo y
tendrá que caber en el canto del forjado nuevo.

En la vista **Planta** el altillo sale sombreado por bandas de altura libre
(≥ 1,20 / 1,50 / 1,90 / 2,20) con sus curvas de nivel. La vista *Altillo* de la
lista de estancias sube la cámara al tablero: `camBase()` desplaza el ojo a
`ALTILLO.z` y `walkOk()` limita el paseo al tablero.

## Altillo 2 — sobre el falso techo del rellano (propuesta)

Segunda opción. Datos en `ALTILLO2` (`model.js`); `buildAltillo(A)` está
parametrizado y `ALTILLOS` recoge las dos. Los botones **Altillo 1** y
**Altillo 2** son excluyentes (`setAltillo(n)`, con `n` 0/1/2).

El rellano tiene 9,89 m² en planta y su falso techo está a `2,35`, así que por
encima queda un volumen libre hasta el faldón. Tablero a `2,55` (2,35 + 0,20 de
forjado), respetando la altura del rellano.

| tablero a 2,55 | |
|---|---|
| Suelo pisable (descontada la caja del ascensor) | 9,62 m² |
| h ≥ 1,50 | 7,25 m² |
| h ≥ 1,90 (de pie) | 3,61 m² |
| h ≥ 2,20 | 1,41 m² |
| Altura media / máxima | 1,76 / 2,45 m |
| Volumen | 17,0 m³ |

**Por qué sale peor.** Aquí no manda la cumbrera principal sino el **hastial
Norte**, con la cumbrera N–S en `x = 14,60` y faldones al 61 %: la franja alta es
una banda estrecha Norte–Sur y a 1,60 m de ella el faldón ya ha bajado un metro.
En el altillo 1 la cumbrera principal (5,00 m) cruza toda la zona de Este a
Oeste. De ahí que el de pie pase de `7,60` a `3,61 m²`, y en una banda estrecha
Norte–Sur de `x = 13,70 a 15,50`.

**Sin cañón de luz: la Velux pasa a ser del altillo.** Se suprime el cañón, el
falso techo del rellano se cierra entero y el tablero queda continuo —de ahí los
0,73 m² y los 1,45 m³ que gana respecto a la versión con hueco (9,62 frente a
8,89 pisables)—. La Velux queda `1,74 → 2,20 m` por encima del tablero, sobre la
zona alta: ilumina el altillo directamente, sin cañón ni acristalamientos. La
contrapartida es seria: **era la única luz natural del rellano**, que se queda
con luz artificial solamente, y eso es lo primero que va a mirar la comunidad.

En el modelo esto se resuelve con tres mallas en `buildCore()`: `plafond` (la losa
con el hueco), `shaft` (brocal + cañón) y `plafondFull` (la tapa del hueco).
`setAltillo(n)` apaga `shaft` y enciende `plafondFull` cuando `n === 2`;
`plafondAt` cierra el cañón en el mismo caso, para que el recorrido ande sobre el
falso techo continuo.

**Acceso.** Escalera de peldaños alternos de 2,45 m de desarrollo en el estudio,
en `x = 10,48–11,08` (`dir:'y'` — `buildAltillo` admite escaleras que suben en x o
en y), y paso por encima del forjado a través del muro `x = 11,27` (`altHole`, que
sólo se abre con el altillo 2 encendido: el muro va en la malla `cutWalls`, que
`setAltillo()` apaga, y el parche del altillo levanta su versión perforada — si se
quedara en la malla general, el paño macizo taparía el hueco). La **puerta** mide
0,75 de ancho entre `y = −6,52` y `−7,27`, enfrente del último peldaño, y va **sin
dintel**, del tablero al faldón: la altura libre ahí es 1,73, así que un dintel a
la altura de una puerta normal quedaría por debajo del techo.
Tabica 0,23 · huella 0,22 · 2C+H = 0,69,
dentro de la escalera de uso restringido del DB-SUA 1. Dos correcciones sobre el
primer trazado:

- **Chocaba con un patinillo.** Pegada al muro se metía en el de ventilación del
  cuarto de basuras (`10,40–11,40 / −7,25…−7,86`), que sube hasta cubierta y no se
  toca. Ahora va entre ése y el de ventilación del garaje
  (`11,17–11,95 / −4,88…−5,97`), sin tocar ninguno.
- **Subía al revés.** El faldón principal baja hacia el Norte, así que subiendo de
  Sur a Norte el último peldaño quedaba a `0,19 m` del techo. Sube de Norte a Sur
  (`y0 = −4,75` arranque, `y1 = −7,20` llegada) y en *Planta* lleva flecha de
  `SUBE`.

Llega a la esquina Suroeste del tablero. La altura libre **sobre el último peldaño
es de 1,62 m** —el punto flojo de esta opción—; ya sobre el tablero son
`1,73–1,85 m`, y 2,05 medio metro más al Sur. Bajar el arranque no ayuda: al Sur de
`y = −7,20` está el patinillo. Cuesta 1,5 m² del estudio.

**Lo que cabe.** Cama de 1,20 × 1,90 tumbada de Este a Oeste con el cabecero al
Oeste, bajo la cumbrera del hastial (`x = 14,60`): ahí quedan `1,95 m` sobre el
colchón —el mejor sitio de los dos altillos para incorporarse— y los pies quedan
bajo el alero, con 0,98 m sobre el colchón. Más almacenaje bajo de
1,80 × 0,55 × 0,90 contra el antepecho del hueco de escalera, que hace de
barandilla.

**Y sí cabe mesa de estudio**, precisamente porque se ha quitado el cañón de luz:
ocupaba `13,44–14,19 / −6,48…−5,50`, que es el mejor sitio del altillo. Mesa de
0,80 × 0,55 contra el muro Sur (`13,30–14,10`), con `1,69 → 2,18 m` libres sobre el
tablero —0,94 m sobre el tablero de la mesa— y la silla justo **debajo de la
Velux**, con `1,39 → 1,66 m` sobre el asiento.

**La propiedad del rellano no es un obstáculo:** el edificio entero es de la
propiedad, así que el acuerdo de comunidad y la unanimidad que exigiría anexionar
el vuelo sobre un elemento común los da ella misma. Queda el papeleo —modificar la
división horizontal para pasar esos metros a la vivienda, y la licencia— y tres
condiciones técnicas, que sí siguen en pie: mantener los `2,35 m` libres del
rellano, no estorbar el recorrido de evacuación hasta la escalera, y resolver que
el rellano se queda sin luz natural al quitarle la Velux.

| | Altillo 1 | Altillo 2 |
|---|---|---|
| Sobre | distribuidor + baño 2 (privativo) | rellano (común, mismo dueño) |
| Tablero / libre debajo | 2,45 / 2,25 | 2,55 / 2,35 |
| Pisable | 9,57 m² | **9,62 m²** |
| h ≥ 1,50 | **9,34 m²** | 7,25 m² |
| h ≥ 1,90 | **7,60 m²** | 3,61 m² |
| Altura media | **2,12 m** | 1,76 m |
| Volumen | **20,3 m³** | 17,0 m³ |
| Mobiliario | cama + armario + escritorio | cama + almacenaje + escritorio |
| Altura libre en la llegada | **2,09 m** | 1,62 m |
| Luz natural | Velux nueva propia | la Velux del rellano, que se queda a oscuras |
| Permisos | licencia | licencia + acuerdo de la comunidad |

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
