# Contexto: `generador-tabla-valor-posicional.html`

Aplicación de un solo archivo HTML (HTML+CSS+JS embebido) que genera **tablas de valor posicional** como SVG descargable, pensadas para insertarse y editarse como formas dentro de PowerPoint. Todo el código vive en un único `<script>`; la función central es `buildSVG(state)`, que recibe el estado de los controles como objeto y devuelve el SVG completo como string (junto con el nombre de archivo sugerido).

## 1. Rango de órdenes que puede mostrar la tabla

- **Selector "Trabajar hasta el orden de…" (`#hastaOrden`)**: define el orden entero más alto a mostrar. Opciones: Unidades, Decenas de unidad, Centenas de unidad, Centenas de millar (por defecto), Centenas de millón, Centenas de millares de millón. Internamente cada orden es una potencia de 10 (`pow`), de 0 (unidades) a 11 (centenas de millar de millón).
- **Selector "…y hasta el orden decimal de…" (`#hastaOrdenDecimal`)**: agrega columnas decimales a la derecha de las unidades. Opciones: no mostrar decimales (por defecto), Décimos, Centésimos, Milésimos (`pow` -1 a -3).
- Los 12 órdenes enteros se agrupan en **4 clases de 3** (Unidades, Millares, Millones, Millares de millón) y esas, en **periodos de 2 clases** (Primer periodo = Unidades+Millares, Segundo periodo = Millones+Millares de millón). Los 3 órdenes decimales forman su propia clase ("Clase de los milesimos") y no pertenecen a ningún periodo.
- Todos los metadatos de cada orden (potencia, código, etiqueta larga, clase a la que pertenece, y para los decimales también su etiqueta de celda y color a reutilizar) viven en el arreglo `ORDERS`, indexado también por potencia en `ORDER_BY_POW` (admite claves negativas) y por código en `ORDER_BY_CODE`/`NIVEL`.

## 2. Varios números, cada uno con su propia jerarquía

- La tabla puede mostrar **más de un número**, uno por fila, mediante una lista dinámica (`numerosState`, arreglo de `{numero, jerarquia}`) con botones "+ Agregar número" y "Quitar" por fila (mínimo 1 fila).
- **Cada fila tiene su propio selector de "Jerarquía"** (`.jerarquia-select`, uno por fila, con sus opciones generadas por `jerarquiaOptionsHTML(selectedCode, maxPow, minPow)`), independiente entre filas. La jerarquía indica en qué columna empieza a interpretarse el número escrito (p. ej. "36" en jerarquía "Decenas" se interpreta como 360).
- Entre cada fila y la siguiente se dibuja una **línea punteada de baja opacidad** (`dashedSeparator`, negro al 22% de opacidad, con patrón de guiones), igual que en `_operaciones-tabla-valor-posicional.html`. La primera fila no lleva línea arriba.
- Si el rango de órdenes se reduce y la jerarquía guardada de alguna fila deja de ser válida, `clampJerarquias()` la reajusta automáticamente a "Unidades" (sin generar error).
- La casilla "Tabla en blanco" ignora la lista de números y muestra una sola fila vacía (plantilla para llenar a mano), con la cuadrícula completa de comas/apóstrofes de referencia.

## 3. Interpretación del número escrito

- Función central: `computeColumns(numStr, jerarquia, maxPow, minPow, puntoForzado)`.
- Acepta un punto decimal opcional (`/^\d+(\.\d*)?$/`). Los ceros a la izquierda se recortan como superfluos (`"0950"` → `"950"`), **excepto** cuando la parte entera es exactamente `"0"` y hay decimales (`"0.7"` conserva el 0 en su columna).
- El **punto decimal se coloca siempre justo a la derecha de la columna de la jerarquía elegida** (no en una posición fija): si la jerarquía es "Decenas", el punto va después de la columna D, sin importar si hay columnas de milésimos visibles o no. Esto permite que dígitos "decimales" caigan en columnas enteras reales (ej. "9.5 decenas" → 9 en D, 5 en U).
- **Excepción "punto sin dígitos después"**: escribir `"36."` (sin nada después del punto) es inválido por defecto (muestra error explicando que es una excepción poco común) — solo se permite si se activa la casilla "Permitir punto sin dígitos después", y entonces coloca el punto sin necesidad de que haya columnas decimales visibles.
- Aritmética con `BigInt` para evitar errores de precisión con números grandes.
- Errores de validación (número inválido, demasiados decimales para la jerarquía/rango elegido, número que no cabe en las columnas visibles) se muestran en el banner de error; si hay más de un número en la lista, el mensaje indica a cuál fila corresponde ("Número 2: ...").

## 4. Comas de millares y apóstrofes de periodo

- Checkbox "Mostrar comas de millares" (`#coma`).
- Las comas son **relativas a los dígitos realmente visibles** del número (no a las fronteras fijas de la cuadrícula): se agrupan de 3 en 3 empezando justo a la izquierda del punto decimal (columna `max(nivel, 0)`), nunca cruzando hacia la parte decimal ni invadiéndola, e independientemente de si la jerarquía elegida es ella misma un orden decimal.
- Cada frontera de agrupación lleva **coma** salvo que además caiga en un múltiplo de 6 (frontera entre periodos), en cuyo caso lleva **apóstrofe** (convención mexicana: comas dentro de un periodo, apóstrofe entre periodos).
- Si el número no alcanza cierta frontera, esa coma/apóstrofe simplemente no se dibuja (no aparecen marcas "flotando" en celdas vacías).
- En la tabla en blanco se muestran todas las comas/apóstrofes de la cuadrícula completa como plantilla de referencia.

## 5. Estilo visual de la tabla

- **Fila de periodos** (opcional, casilla "Mostrar fila de periodos"; se autooculta si solo hay 1 periodo visible): colores alternos amarillo (`#FFF200`)/naranja (`#FFA500`), etiquetas "Primer periodo", "Segundo periodo", etc.
- **Fila de clases** (opcional, casilla "Mostrar fila de clases"): tinte alterna verde claro (`#ABD39C`, "Unidades") / azul claro (`#8EBADE`, "Millares") según paridad del índice de clase; la clase decimal ("Clase de los milesimos") siempre usa el tinte azul claro. Etiquetas sin acentos (`"milesimos"`, `"millones"`) porque la fuente vectorial no tiene esos glifos precompuestos.
- **Fila de órdenes**: celdas C (rojo `#CC2027`), D (azul `#1C75BC`), U (verde `#57A639`) cíclicas para los órdenes enteros. Los órdenes decimales muestran etiquetas de 3 letras — "dec" (reutiliza azul de D), "cen" (reutiliza rojo de C), "mil" (reutiliza verde de U) — en vez de una paleta propia.
- **Fila(s) de dígitos**: sin ningún rectángulo de fondo (queda transparente). Color de los dígitos configurable con un `<input type="color">` (`#colorDigitos`, negro por defecto).
- Si una etiqueta de clase o periodo no cabe en el ancho de su celda (p. ej. una clase de una sola columna), el tamaño de fuente se reduce automáticamente (`fittedFontSize`) para que no se desborde.
- Ya no existe selector de "tamaño de los dígitos": el factor de escala está fijo en `SCALE.grande` (1.22). Con ese valor, alturas y tamaños de fuente resultantes: fila de órdenes = 56, fila de clases/periodos = 46, fila de dígitos = 98 (por número; se multiplica por la cantidad de filas). Tamaños de fuente: periodos 20.74, clases 18.3, órdenes 30.5, dígitos 48.8, coma/apóstrofe 56.12, punto 41.48.

## 6. Tipografía del SVG exportado: Computer Modern real, como vectores

- Los dígitos y letras **de la tabla dibujada** no usan `<text>` ni ninguna fuente instalada: cada glifo se dibuja como `<path>` vectorial, extraído directamente de las fuentes reales de LaTeX (`cmr10` para dígitos, `cmb10` para negritas) con `fontTools`, e incrustado como JSON (`GLYPH_DATA`, con `upm`, y subconjuntos `regular`/`bold`) directamente en el script. Esto es independiente de la tipografía de la *interfaz de controles* (ver sección 10) — el SVG exportado nunca depende de una fuente externa ni instalada.
- `glyphRun(str, fontData, cx, rowCenterY, fontSizePx, ref, fill)` centra un texto (horizontal y verticalmente, usando un bbox de referencia `ref` por fila) dibujando cada carácter como un `<g transform="translate(...) scale(...)"><path.../></g>`.
- `glyphRunClamped(...)` es igual pero recorta (clamp) la posición horizontal si el glifo se saldría por el borde izquierdo/derecho del SVG (usado para comas, apóstrofes y el punto decimal, que pueden caer justo en el borde de la tabla).
- Si se necesita un carácter nuevo en el futuro, hay que extraerlo con `fontTools` (`SVGPathPen` + `BoundsPen`) de `cmr10.ttf`/`cmb10.ttf` y añadirlo a `GLYPH_DATA`.

## 7. Bordes y cuadrícula (pensados para "Convertir en forma" de PowerPoint)

Esta fue la parte más iterada del proyecto. Reglas ya resueltas:

- **Nada de `<line>` ni `<rect stroke="...">`**: todo trazo es un rectángulo *relleno*, porque el "stroke" centrado en una trayectoria se recorta o redondea de forma inconsistente al convertir el SVG a formas en PowerPoint.
- **Cada celda (periodo, clase u orden) es una figura autocontenida**: un solo `<g>` con su fondo+borde+etiqueta juntos, mediante `borderedCell(x0, y0, w, h, fillColor)`, que dibuja:
  1. Un rectángulo **negro** que cubre toda la celda (más medio grosor de línea hacia afuera en los lados internos, para superponerse exactamente con el rectángulo negro de la celda vecina).
  2. Encima, el rectángulo de **color de relleno**, recortado hacia adentro exactamente `stroke` en cada lado, dejando ver el negro de abajo como marco.
  - Si el lado de una celda coincide con el **perímetro exterior** del SVG (x=0, x=totalW o y=0), el negro no se extiende más allá (se recortaría) y el relleno se recorta el grosor completo de ese lado en vez de la mitad.
  - Todas las medidas de la cuadrícula (`colW`, `letterH`, `headerH`, `periodH`, `digitH`, `stroke`) se **redondean a enteros** (y `stroke` se fuerza a un número par) antes de calcular cualquier posición, para que dos celdas vecinas siempre calculen la misma coordenada de frontera compartida — si no, el conversor de PowerPoint podía redondear ligeramente distinto cada borde y el grosor se veía desigual.
  - Función auxiliar `R(n)` redondea a 3 decimales como refuerzo extra contra imprecisión de punto flotante.
- La fila de dígitos **nunca** tiene borde izquierdo, derecho ni inferior (solo el superior, que la separa de la fila de órdenes) y no tiene relleno de fondo.

## 8. Agrupamiento del SVG en dos niveles (para PowerPoint)

```
svg
 └─ g   (LA TABLA COMPLETA — una sola figura al desagrupar el dibujo la 1ª vez)
     ├─ g  (celda de periodo, fondo+borde+etiqueta) × N
     ├─ g  (celda de clase,   fondo+borde+etiqueta) × N
     └─ g  (celda de orden,   fondo+borde+etiqueta) × N
 └─ g  (dígito / coma / apóstrofe / punto) × N   ← sueltos desde el inicio
```

- Al convertir el SVG a formas en PowerPoint y desagrupar **una vez**, se separan los **números** (dígitos, comas, apóstrofes, punto) de **la tabla** (que queda unida como una sola figura).
- Al desagrupar esa tabla **una segunda vez**, se separa **celda por celda** (cada una con su fondo, borde y etiqueta ya juntos gracias al punto 7).
- En el código, dos acumuladores de string separados (`svgTable` y `svgNumbers`) se concatenan al final dentro de esta estructura, y `buildSVG(state)` devuelve `{ svg, filename }` (o `{ error: { message, rowIndex } }` si algún número no es válido).

## 9. Nombres de archivo al guardar

- Formato por número: `[Orden]-[Numero].svg`, donde `[Numero]` lleva los millares separados por `-` (ej. `950000` → `950-000`) y el punto decimal tal cual (ej. `1234.5` → `1-234.5`).
- Para los órdenes decimales, el prefijo usa la abreviatura de 3 letras (`dec`, `cen`, `mil`) en vez del código de una letra (`d`, `c`, `m`).
- Si hay varios números en la lista, cada uno aporta su propio `[Orden]-[Numero]` y se unen con `+` (ej. `U-950-000+D-1-234.svg`).
- Si la tabla está en blanco, el nombre completo es `vacia.svg`.
- Función: `buildFilename(numerosState, blank)` — recibe el estado explícitamente (no lee el DOM), y es llamada desde dentro de `buildSVG(state)`, que la incluye en su resultado (`result.filename`). Guardado real: `download()` — usa `showSaveFilePicker` (Chrome/Edge) recordando la última carpeta usada en la sesión (`lastSaveHandle`), con fallback a descarga estándar (`<a download>`) en otros navegadores.
- **Enter** en cualquier campo de número dispara el guardado (igual que hacer clic en "Guardar SVG…").

## 10. Interfaz general

Rediseñada (con Claude Design) a partir de la versión original de barra horizontal; la estructura de controles y sus hooks de JS se conservan/remapean, pero el aspecto visual y algunos detalles de wiring cambiaron. Lo que hay que saber para seguir trabajando aquí:

- **Tipografía de la interfaz**: "Fraunces" (título, serif) + "Poppins" (resto, sans), cargadas por un único `@import url("https://fonts.googleapis.com/...")` en el `<style>`. Esta es una **excepción documentada** a la regla general de "sin dependencias externas" del proyecto: aplica **solo a la interfaz de controles**, nunca al SVG exportado (que sigue usando `GLYPH_DATA`/glifos vectoriales propios, sección 6, sin ninguna fuente externa ni instalada). Si el usuario abre el archivo sin internet, los `@import` fallan silenciosamente y el navegador cae a las fuentes de sistema declaradas como *fallback* en cada `font-family` — la app sigue funcionando igual, solo cambia la tipografía de la interfaz.
- **Layout**: `topbar` (título + subtítulo) → `toolbar` horizontal con grupos separados por `.divider` verticales (Rango → Números → Color → Presentación → botón de guardar), sin panel lateral. El banner de error, cuando aplica, aparece como una franja completa debajo del `toolbar`. Debajo de todo, el área de vista previa (`.stage` > `.stage-inner` > `#svgHolder`), que antes del primer render muestra un placeholder de texto ("Cargando vista previa…") reemplazado de inmediato por el SVG real.
- **Controles y sus ids** (sin cambios respecto a la versión anterior, para no romper nada que dependa de ellos): `#hastaOrden`, `#hastaOrdenDecimal`, `#numerosList` (contenedor de filas), `#addNumero`, `#colorDigitos`, `#mostrarPeriodos`, `#mostrarClase`, `#coma`, `#mostrarPunto`, `#permitirPuntoSinDigitos`, `#vacia`, `#downloadBtn`, `#svgHolder`. Cada fila de número (`.numeroRow`) sigue teniendo `span.tag`, `input.numero-input`, `select.jerarquia-select` y `button.removeBtn`.
- **Checkboxes**: mismos 6 ids de siempre (`mostrarPeriodos`, `mostrarClase`, `coma`, `mostrarPunto`, `permitirPuntoSinDigitos`, `vacia`), pero ahora con marcado custom (`label.checkbox` envolviendo el `<input>` oculto + un `<span class="box">` que dibuja la casilla) en vez de `<input>` + `<label>` planos. Siguen disparando `render()` en `input`/`change` igual que antes.
- **Banner de error — cambió de estructura**: antes era un solo `<div id="err" class="error">` (oculto/mostrado con `style.display`, con el mensaje completo como `textContent`, incluyendo el prefijo "Número N: " ya integrado al string). Ahora son dos elementos dentro de un contenedor `.callout`: `#errorCallout` (el contenedor, con un encabezado fijo "No se puede generar la tabla") y `#errorMessage` (un `<span>` con el mensaje, que sigue incluyendo el prefijo "Número N: " cuando hay más de una fila). **Novedad añadida en el rediseño** (no rompe nada existente, pero es nueva): además del mensaje, `render()` marca visualmente con la clase `.hasError` el `input.numero-input` de la fila que causó el error (`result.error.rowIndex`), y la limpia de las demás filas.
- **`buildSVG` se volvió una función pura**: antes `buildSVG()` no recibía argumentos, leía los controles directamente del DOM con `document.getElementById(...)` dentro de la función, devolvía el string del SVG (o `null` si había error, escribiendo el mensaje directamente en `#err` como efecto secundario), y `buildFilename()` se llamaba aparte, también leyendo el DOM. Ahora `buildSVG(state)` recibe un objeto `{ numerosState, blank, maxPow, minPow, showComma, showPunto, showClase, showPeriodos, digitColor, permitirPuntoSinDigitos }` ya armado por quien la llama (`render()`/`download()`, que sí leen el DOM), y devuelve `{ svg, filename }` o `{ error: { message, rowIndex } }`, sin tocar el DOM en ningún momento. **Todo el núcleo de dibujo que usa `buildSVG` por dentro (`ORDERS`, `GLYPH_DATA`, `COLORS`, `SCALE`, `computeColumns`, `borderedCell`, `glyphRun`, `R()`, el redondeo a enteros, el agrupamiento en dos niveles) es idéntico byte a byte a la versión anterior** — se verificó con diff línea por línea al integrar el rediseño; solo cambió la capa de orquestación/lectura del DOM alrededor de él.
- **`populateJerarquiaSelect(sel)` / `rebuildAllJerarquiaSelects()` ya no existen**: esas dos funciones mutaban un `<select>` del DOM directamente. Fueron reemplazadas por `jerarquiaOptionsHTML(selectedCode, maxPow, minPow)` (función pura: devuelve `{ html, value }`, el HTML de las `<option>` válidas para el rango actual y el valor final ya corregido si el guardado dejó de ser válido) y `clampJerarquias()` (recorre `numerosState` y corrige `jerarquia` a `"U"` si quedó fuera de rango, sin tocar el DOM). `renderNumerosList()` arma cada fila usando `jerarquiaOptionsHTML(...)` directamente. También se añadió `currentMaxMin()`, un helper que lee `#hastaOrden`/`#hastaOrdenDecimal` y devuelve `{ maxPow, minPow }` (evita repetir el `parseInt(document.getElementById(...).value, 10)` en cada sitio que lo necesita).
- `render()` sigue llamando a `buildSVG(...)` (ahora armando el objeto `state` primero) y, si no hay error, vuelca `result.svg` en `#svgHolder` con `innerHTML` y guarda `result.filename` en `lastFilename`; si hay error, muestra el banner y marca la fila con `.hasError` como se describe arriba.

## Advertencias para trabajar en este proyecto

- Cualquier cambio a la geometría de la cuadrícula (anchos, altos, `stroke`) debe mantenerse en enteros y probarse pensando en cómo se comporta al convertir a formas en PowerPoint, no solo en la vista previa del navegador — varios bugs de este proyecto solo eran visibles al simular esa conversión (mover un `<g>` de celda con `transform="translate(...)"` y medir en píxeles el grosor resultante).
- No usar `<text>` para nada que deba verse en la tipografía de LaTeX dentro del SVG exportado: todo pasa por `glyphRun`/`glyphRunClamped` y `GLYPH_DATA`. La tipografía de la *interfaz* (Fraunces/Poppins vía Google Fonts) es un asunto aparte y no debe confundirse con esto.
- No reintroducir `<line>` ni `stroke` para bordes/divisores del SVG exportado: usar rectángulos rellenos.
- Cuidado con la lógica de comas: la frontera de agrupación es `Math.max(nivel, 0)`, no `nivel` directo ni `Math.max(shift, 0)` — ambas variantes anteriores tenían bugs ya corregidos (ver `intShift` en `buildSVG`).
- Si se agrega una nueva dependencia externa a la interfaz de controles (fuentes, iconos, etc.), confirmar con el usuario primero — la excepción actual es solo para Google Fonts (Fraunces/Poppins) y no debe darse por sentado que aplica a cualquier otra cosa.
