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

## Organización de `script.js`

Constantes (`ORDERS`, colores, `SIGN_GLYPHS`) → cálculo puro (`computeColumns`, `leerTerminos`, `filasSumaResta`, `filasMultiplicacion`, `filasDivision`) → dibujo (`dibujarTabla`, con `makeBorderedCell`, `glyphRun*`) → `buildSVG(cfg)` y `buildFilename(cfg)` (puras) → estado e interfaz.

- `dibujarTabla(filas, cfg, opts)` dibuja siempre la misma estructura (encabezado agrupado + números sueltos); cada operación solo arma sus `filas` y, en la división, agrega la galera, el divisor y el resto con `opts.extra`. `opts.leftPad` deja espacio para el signo (`56·s`) o el divisor (`110·s`); con 0 la salida es la de la tabla.
- Una fila es `{ cols: {pow: dígito}, hayDecimal, nivel, shift, numDigits, showComma, showPunto, sign?, lineAbove? }`; `nivel` es la columna a cuya derecha va el punto.
- Los errores se lanzan como `ErrorCampo(mensaje, campo)`: `campo` es el índice del número en `terminosDe(op)` (mismo orden que los campos del panel), `"divisor"` o `null`.
- Todos los paneles están siempre en el DOM; se ocultan con `hidden`.
