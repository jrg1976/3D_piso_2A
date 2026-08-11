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

### Cubierta

Tres planos, todos con el vértice a **5,00 m** sobre el pavimento
(cara exterior +123,23 = los 11,03 m acotados en el alzado `a07`):

| Plano | Cumbrera | Pendiente |
|---|---|---|
| Faldón principal E–O | `y = −8,27` | 65 % |
| Hastial transversal Norte (estudio) | `x = 14,60` | 61 % |
| Hastial transversal Sur (salón, frontón del alzado principal) | `x = 13,36` | 91 % |

La comprobación clave: las **limahoyas** dibujadas en `a05` son la intersección
de esos planos. Los puntos medidos sobre el plano —(9,62; −3,57), (14,59; −8,27)
para la del Norte y (10,07; −12,90), (13,29; −8,37) para la del Sur— caen sobre
la intersección calculada con menos de 2 cm de error, y la altura de alero que
se deduce (0,40 m al Sur, 0,65 m al Norte) coincide con la medida directamente
en la sección `a11`. La altura de cumbrera resultante reproduce las dos cotas
del alzado `a07`: 11,03 m (cumbrera) y 10,51 m.

Tres buhardillas/miradores: habitación 1 (Norte) y cocina y habitación 2 (Sur),
con faldón al 80 % y alero enrasado con el faldón general.

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
| Habitación 2 | 0,50 × 0,73 | en el rincón con habitación 1 (E) |

Según los rótulos de `a05` llevan la extracción de campana y la ventilación de
cocina y baños de 1ºB, 2ºD, 1ºE, 2ºB y de este mismo 3ºB, más las bajantes y
los montantes de calefacción y AFS/ACS.

### Simplificación asumida

Los planos dibujan además una **cumbrera secundaria 0,52 m más baja**
(`y = −7,47`, 10,51 m en el alzado) sobre los dos vuelos extremos
(`x < 4,33` y `x > 22,38`). No se ha modelado, para no fragmentar la lectura del
volumen; afectaría sólo a las esquinas de cocina y habitación 1.

## Estructura

```
planos/            a01–a14 originales
viewer/
  model.js         cotas, cubierta, estancias, muros, huecos, vistas
  build.js         generación de la malla three.js
  app.js           cámara, controles, HUD
  shell.html       interfaz y estilos
  build.py         empaqueta todo en piso-b-3d.html
  piso-b-3d.html   ← el visor (autocontenido)
```

Para regenerar el visor tras editar cualquier fuente: `python3 viewer/build.py`.
