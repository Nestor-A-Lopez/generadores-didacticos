# Tabla de valor posicional y operaciones — `sitio/valor-posicional/`

Generador unificado (2026-09-26, rama `unificar-tabla-operaciones`): une `../tabla-valor-posicional/` y `../operaciones/`, que eran casi la misma herramienta. Mientras no se decida retirarlos, los dos siguen publicados e intactos; su `CLAUDE.md` explica el porqué de los bordes, el agrupamiento y la tipografía, y todo eso aplica aquí igual. Las convenciones generales están en el `CLAUDE.md` de la raíz.

En la portada tiene su propia tarjeta (ícono Lucide `sheet`, también en la cabecera y la pestaña), después de las de los dos generadores viejos. **Sus SVG se guardan en `_recursos/figuras/tabla-valor-posicional/`**, con o sin operación (decisión del usuario, 2026-09-26): no tiene carpeta propia en `figuras/`.

## Qué hace

- **Operación** (`#operacion`): «Ninguna (solo números)» (por defecto), suma, resta, multiplicación o división.
- **Con «Ninguna»** hace lo mismo que la tabla de valor posicional: uno o varios números, cada uno con su jerarquía, separados por una línea punteada. **El SVG es idéntico byte a byte al de `tabla-valor-posicional`** (lo comprueban los 7 primeros casos de `valor-posicional` en `herramientas/verificar-svg.js`).
- **Con una operación**, lo de operaciones: signos + − × a la izquierda, línea sólida sobre el resultado, productos parciales, galera con el divisor, pasos de la división y «Resto: N». Panel «Resultado»: mostrarlo, sus comas, su punto y en qué jerarquía va el punto (`#resultJerarquia`).

## Qué se tomó de cada generador (decisión del usuario, 2026-09-26)

| Aspecto | Viene de | Consecuencia |
| --- | --- | --- |
| Medidas y tamaños de letra del dibujo (columna 98, fila 98, encabezados 46/56; letra 40·s, comas 46·s, punto 34·s) | tabla | Las operaciones se ven más compactas que en `operaciones/`; sin margen `PAD` en el `viewBox` (comas y punto se recortan a la cuadrícula con `glyphRunClamped`) |
| Lectura de los números (`computeColumns`): conserva los ceros a la izquierda, acepta «36.», valida por la posición del primer dígito | tabla | También en las operaciones: «05.4 − 2.35» dibuja el 0 en la columna D |
| Comas relativas al punto (`intShift`) y ajuste de etiquetas (`fittedFontSize`) | tabla | Una sola regla de comas para todas las filas |
| Rango decimal con selector fino (`#hastaOrdenDecimal`: sin decimales, décimos, centésimos, milésimos) | tabla | Sustituye a la casilla «Mostrar hasta milésimos»; «Decimales en el cociente» llega hasta `-minPow` |
| Casilla «Coma y punto» en **cada** número (`.fmt`) | operaciones | Sustituye a las casillas globales `#coma`/`#mostrarPunto` de la tabla; el resultado conserva sus dos casillas |
| Aviso de error con título que marca el campo (`.hasError`) y **Enter** para guardar | tabla | También en las operaciones y en `#divisor` |
| Nombres de archivo | los dos | Sin operación, `[Orden]-[Número].svg` (tabla); con operación, `[A\|S\|M\|D]-….SVG` (operaciones) |

Cambios respecto a `operaciones/`, además de lo anterior:

- «Resto: N» ya no es `<text>` (rompía la regla 1 del repo): se dibuja con glifos («Resto:» en `cmb10`, el número en `cmr10`) y va en un solo `<g>` suelto. Para eso se agregaron `R`, `t` y `:` a `compartido/glifos-tabla.js`, sin tocar los glifos que ya existían: el SVG de todos los demás generadores quedó idéntico.
- El punto del cociente solo aparece si el cociente tiene cifras decimales (antes, 8 ÷ 4 con «2 decimales» mostraba «2.»).
- La barra horizontal de la galera empieza en la barra vertical, así la esquina queda cerrada.

## Interfaz (diseño «Tabla valor posicional» de Vesta, 2026-09-26)

Sale del diseño hecho con Claude Design en el proyecto de Vesta (`c01f5295-ac6a-4466-98bf-06eb779621b6`, archivo `Tabla valor posicional.dc.html`), pasado a HTML/CSS/JS estáticos con la misma base que `numeros-dienes` (segmentados, interruptores, plegables, pie).

- **Cabecera**: ícono, título, texto y **Guardar SVG** (con ícono; desactivado mientras hay error).
- **Barra de opciones** (tarjeta arriba): «¿Qué quieres mostrar?» (segmentado de `#operacion`), «¿Hasta qué orden?» (segmentados de `#hastaOrden`: U, DU, CU, CM, CMM, CMMM, y de `#hastaOrdenDecimal`: Sin decimales, Déc, Cen, Mil) y la plegable «¿Cómo se ve la tabla?»: en una fila, «Agrupaciones» (`#mostrarPeriodos`, `#mostrarClase` como interruptores), «Color de las jerarquías» y un bloque (`.colorCifras`) con «Color de los números» y, a su lado, «Color de las comas y punto» (ver abajo). A 1440 px caben las cuatro en una fila; con menos ancho (1024 px) el bloque baja a otra fila con las dos lado a lado, y en el celular, una debajo de otra. Desde 1240 px una línea separa los dos grupos.
- **Distribución**: panel lateral de 380 px desde 1024 px; por debajo, los números arriba y la figura a todo lo ancho. Bajo 640 px, márgenes de 16 px.
- **Panel «¿Qué números?»**: los cinco `data-op-panel`, uno visible. Cada fila (`filaNumeroDOM`): arriba, etiqueta, interruptor «Coma y punto» (`.fmt`) y «Quitar»; abajo, campo y jerarquía; debajo, la ayuda (multiplicador y dividendo). **Las filas sin «Quitar» (minuendo, factores, dividendo, divisor) guardan su hueco** (`.removeHueco`) para que el interruptor no se mueva entre operaciones (decisión del usuario). El divisor es una fila más, con su propio «Coma y punto» (`#divisorFormato`, pedido por el usuario): llega a `cfg.division.formato`, pero `buildSVG` todavía no lo usa, porque el divisor es de una cifra y nunca lleva ni coma ni punto.
- **Plegable «¿Cómo se ve el resultado?»** (`#panelResultado`, cerrada al abrir, solo con operación): interruptores del resultado; `#mostrarPuntoProductos` solo en la multiplicación y «Decimales en el cociente» (segmentado de `#decimales`, con su ayuda `#decimalesHint`) solo en la división (`[data-solo-op]`). Sin resultado, sus opciones se ven desactivadas; sin punto, también `#resultJerarquia` (`syncResultado`; solo apariencia).
- **Vista previa**: aviso de error con ícono (`#errorCallout`) sobre la tarjeta de la figura; el campo culpable lleva `.hasError` y `aria-invalid`.
- **Segmentados**: fachada de los `<select>` ocultos, como en numeros-dienes, pero los botones los arma `armarSegmentado` a partir de las `<option>`: texto corto en `data-corto` y nombre completo en el tooltip (`.segTip`). Los de `#decimales` se rehacen al cambiar el rango. Los signos de la operación («123 + − × ÷») van en Computer Modern, como en LaTeX: `glifosCM` los dibuja con `compartido/glifos.js` + `texto-svg.js`, que esta página carga **solo para la interfaz** (el SVG exportado sigue usando `glifos-tabla.js`).
- Iconos Lucide 0.544.0 incrustados: `sheet`, descargar, `chevron-down`, `plus`, `circle-alert` (registrados en `AVISOS-DE-TERCEROS.md`).
- **«Color de las jerarquías»** (2026-09-26, reemplaza al selector libre `#colorDigitos`): relleno de las celdas de cada orden en la fila C/D/U (y dec/cen/mil, que usan el de su `colorKey`). Por orden, dos bloques como «Color de los bloques» de numeros-dienes: el de defecto (`--base10-*`, igual que `COLORS`) y uno propio con su `<input type="color">` (`#celdaU`, `#celdaD`, `#celdaC`). `colorCeldaDe(key)` devuelve `COLORS[key]` tal cual (mayúsculas) con el de defecto, así el SVG de defecto no cambia; elegir en el selector el mismo color que el de defecto no cuenta como propio. Llega a `cfg.colorCeldas`.
- **«Color de los números»** (`#colorNumeros`: Negro, Color, Personalizado; por defecto Negro): con «Color», cada cifra de la tabla toma el color de la celda de su orden (el propio, si lo hay); con «Personalizado», el de `#colorNumerosPropio`. Llega a `cfg.colorNumeros` y `cfg.colorNumerosPropio`. Los signos + − ×, el divisor y «Resto: N» siguen en negro (`cfg.digitColor`, fijo en `#000000`). Los casos `celdas-propias`, `numeros-color` y `suma-color-celda` de `verificar-svg.js` lo cubren.
- **«Color de las comas y punto»** (`#colorSeparadores`: Rojo, Negro, Personalizado; por defecto Rojo): comas, apóstrofes y punto decimal de todas las filas en rojo (`COLORS.C`, como siempre, aunque la centena tenga color propio), en negro (`cfg.digitColor`) o en el de `#colorSeparadoresPropio`. Llega a `cfg.colorSeparadores` y `cfg.colorSeparadoresPropio`; lo cubren los casos `separadores-negro` y `separadores-personalizado` (y `numeros-personalizado`, el de los números).
- **Segmentados de 2×2** (`.seg.segGrid`, los dos anteriores, a pedido del usuario): se llenan por columnas, así quedan arriba la 1.ª opción y «Personalizado», y abajo la 2.ª opción y un bloque «+» (`.segExtra`, `.swatchSeg`) que abre el selector de color. Al elegir un color se selecciona «Personalizado» y el bloque toma ese color (con anillo mientras «Personalizado» está elegido); pulsar «Personalizado» sin haber elegido color abre el selector. Hasta elegir uno, el color propio vale lo que trae su `<input>` (`#000000` y `#cc2027`). `syncSegmented`, `placeIndicator` y `armarSegmentado` solo tocan los `button[data-value]`; el bloque «+» se queda al final. Los bloques de «Color de las jerarquías» miden 40 px para que a 1440 px quepan las cuatro secciones en una fila.
- **Misma altura aparente en la fila** (rama `altura-reducir-cuadricula`, opción 2): las celdas de las cuadrículas de 2×2 (botones y bloque «+») miden 28 px, así cada cuadrícula mide 70 px, lo mismo que el contenido de «Color de las jerarquías» (del nombre a los bloques) y de «Agrupaciones» (de la primera pista a la última). Como cada pista (26 px) va centrada en su fila de 44 px, desde 640 px el segundo interruptor de «Agrupaciones» sube 9 px (`.tablaOpciones .switch + .switch`), así la pista del último termina donde la cuadrícula.
- Las abreviaturas del millón son las del script (CMM), no las del diseño (CMi).
- **Pendiente de subir a Vesta** (con `/design-sync`, uno a la vez): la fila de número con jerarquía, el segmentado con tooltip, el interruptor pequeño con etiqueta y el selector de color por jerarquía (igual al de numeros-dienes).

## Organización de `script.js`

Constantes (`ORDERS`, colores, `SIGN_GLYPHS`) → cálculo puro (`computeColumns`, `leerTerminos`, `filasSumaResta`, `filasMultiplicacion`, `filasDivision`) → dibujo (`dibujarTabla`, con `makeBorderedCell`, `glyphRun*`) → `buildSVG(cfg)` y `buildFilename(cfg)` (puras) → estado e interfaz.

- `dibujarTabla(filas, cfg, opts)` dibuja siempre la misma estructura (encabezado agrupado + números sueltos); cada operación solo arma sus `filas` y, en la división, agrega la galera, el divisor y el resto con `opts.extra`. `opts.leftPad` deja espacio para el signo (`56·s`) o el divisor (`110·s`); con 0 la salida es la de la tabla.
- Una fila es `{ cols: {pow: dígito}, hayDecimal, nivel, shift, numDigits, showComma, showPunto, sign?, lineAbove? }`; `nivel` es la columna a cuya derecha va el punto.
- Los errores se lanzan como `ErrorCampo(mensaje, campo)`: `campo` es el índice del número en `terminosDe(op)` (mismo orden que los campos del panel), `"divisor"` o `null`.
- Todos los paneles están siempre en el DOM; se ocultan con `hidden`.
- Estado e interfaz: `filaNumeroDOM`, `renderForms`, `renderDecimalesSelect`, `updateOpPanels`, `syncResultado`, `leerConfig`, `render`, `download`; al final, los eventos, los segmentados (`syncSegmented`, `armarSegmentado`, `glifosCM`) y las plegables.
