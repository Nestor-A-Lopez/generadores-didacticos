# Generador de fracciones — `sitio/fracciones/`

Herramienta web (`index.html` + `style.css` + `script.js`, más lo que carga de `../compartido/`) que genera figuras de fracciones (círculo, rectángulo en cuadrícula, triángulo subdividido) como SVG descargable. El SVG se pega en PowerPoint y se convierte a formas editables: tiene que funcionar en ese flujo, no solo verse bien en el navegador. Las convenciones generales del repo (nombres de archivo, sistema de diseño, compilación) están en el `CLAUDE.md` de la raíz.

Archivos relacionados:
- Los SVG generados se guardan fuera del repositorio, separados por forma en `circulo/`, `rectangulo/` y `triangulo/` (por eso el nombre de archivo no lleva la forma); ver «Nombres de archivo de los SVG» en el `CLAUDE.md` raíz. Las fórmulas de `buildTriangulo` salen de la versión TikZ original, ya retirada.

Fuera de esta carpeta: `herramientas/extraer_glifos.py` (en la raíz del repo) extrae offline con `fontTools` los glifos de Computer Modern y escribe `sitio/compartido/glifos.js` (sección 6). El sistema de diseño «Vesta» de la interfaz está en `.claude/skills/vesta/` (ver `CLAUDE.md` raíz).

## Reglas de trabajo

1. **No romper lo ya resuelto.** Los arcos del círculo en tramos ≤179°, los tamaños proporcionales de las etiquetas y el cálculo del valor del entero se corrigieron tras varias iteraciones por bugs que solo aparecían al convertir a formas en PowerPoint. Antes de tocarlos, entender por qué están así (lo explica cada sección de abajo).
2. **Tipografía y agrupamiento ya están resueltos** (secciones 6 y 7): glifos vectoriales de Computer Modern extraídos offline y agrupamiento en dos niveles partes/valores. No volver a `<text>`, `@font-face` ni a parsear fuentes en el navegador; no envolver los dos grupos en un `<g>` común. Lo que falta es confirmarlos en PowerPoint real.
3. **Verificar de verdad.** Si el cambio toca geometría, tipografía o agrupamiento: renderizar, medir en píxeles si hace falta y simular la manipulación en PowerPoint (por ejemplo, `transform="translate(...)"` a un `<g>` de parte, o revisar qué pasa con un `<text>`/`@font-face` al aplanarse a formas).
4. **Cambios quirúrgicos**, reutilizando funciones existentes (`fitLatexLabel`, `layoutNode`, `toPx`, `maxPartHeightForShape`, `glyphRunSvg`…) en vez de duplicar lógica.
5. **Preguntar ante la ambigüedad**: si no está claro si un cambio de tamaño/color aplica a una forma o a las tres, o qué subconjunto de glifos soportar, preguntar antes de asumir.
6. **Estilo del código**: comentarios en español que expliquen el porqué, nombres descriptivos, y la organización actual del script: metadatos/constantes → motor LaTeX→SVG → `build*` de cada forma → `buildSVG` → UI/eventos.

---

# Contexto técnico


Aplicación sin dependencias de build (`index.html` con la estructura, `style.css` con los estilos propios y `script.js` con toda la lógica) que genera figuras de **fracciones** (círculo, rectángulo en cuadrícula, triángulo subdividido) como SVG descargable para uso educativo. El SVG final se pega en PowerPoint y se convierte a formas editables, así que el archivo debe comportarse bien en ese flujo, no solo verse bien en el navegador — este es el origen de casi todos los bugs ya corregidos (incluidos la tipografía y el agrupamiento, secciones 6 y 7).

Todo el código vive en `script.js`; de `../compartido/` toma los glifos (`glifos.js`), el guardado (`guardar-svg.js`) y los tokens de Vesta (`vesta.css`). La función central es `buildSVG()`, que lee los controles del DOM, valida, construye la forma elegida (`buildCirculo`/`buildRectangulo`/`buildTriangulo`), opcionalmente le agrega la llave del entero (`appendTotalBrace`), y devuelve el SVG completo como string.

## 1. Las tres formas y su geometría

- Selector `#forma`: círculo, rectángulo (cuadrícula), triángulo. Unidad interna: `UNIT = 40` px por "unidad TikZ", `PAD = 14` px de margen. Convención de coordenadas: se trabaja en el sistema TikZ (y hacia arriba) y se convierte a SVG (y hacia abajo) al final con `toPx(x, y, offsetX, offsetY)`.
- **Círculo**: diámetro fijo en 10 unidades (`R = 5*UNIT = 200px`). `wedgePath(cx, cy, r, angleStart, sweepDeg)` dibuja cada sector dividiendo el arco en tramos de **máximo 179°** — un arco SVG de exactamente 180°/360° es un caso ambiguo que varios conversores (incluido el de PowerPoint) pueden colapsar a tamaño casi nulo; esto ya se investigó y resolvió, no reintroducir arcos de un solo tramo ≥180°. Si `nTotal === 1` se dibuja un `<circle>` liso, sin líneas divisorias.
- **Rectángulo**: alto fijo en 10 unidades, ancho ajustable (`#ancho`). `mayorDivisorHastaRaiz(nTotal)` reparte `nTotal` en la cuadrícula nFilas×nColumnas más cuadrada posible.
- **Triángulo**: alto fijo en 10 unidades. `nFilas = round(sqrt(nTotal))`; si `nTotal` no es cuadrado perfecto se muestra un warning (no bloqueante) y se usa `nFilas²` partes. `lado` y `alturaChica` salen de las fórmulas TikZ originales trasladadas a JS.

## 2. Numerador, denominador y validaciones

- `#numerador` (≥0) y `#denominador` (≥1), enteros; `#ancho` (rectángulo) debe ser > 0. Errores bloqueantes se muestran en `#err`. `#err`/`#warn` son el aviso completo (contenedor con título fijo, que el script muestra/oculta con `style.display`); el texto del mensaje se escribe en su `<span>` interno `#errMsg`/`#warnMsg` — nunca asignar `textContent` directamente a `#err`/`#warn`, porque borraría el título.
- Warnings no bloqueantes (`#warn`): numerador > denominador (se colorean todas las partes), o denominador de triángulo no es cuadrado perfecto.

## 3. Color de las partes y de los márgenes

- Paleta fija en `COLORS` (morado/azul/naranja/rojo/verde/amarillo) + opción "Personalizado…" con `<input type="color">`.
- Margen/borde de las figuras: **negro liso**, `STROKE_COLOR = "#000000"`, dibujado con `stroke` normal (sin técnica especial). Hubo una versión con un "halo blanco" detrás del trazo negro (para visibilidad en fondos oscuros); **se eliminó por pedido explícito del usuario** — no reintroducir esa función salvo que se pida de nuevo.

## 4. Etiquetas numéricas por parte + valor del entero (llave)

- Toggles `#showPartLabels` / `#showTotalLabel`. `#valorEntero` es texto libre: acepta número, decimal, fracción simple `a/b`, o LaTeX.
- `#labelMode`: **Automático** (`formatAuto`: entero ÷ denominador; si no da entero exacto, se simplifica a fracción con `gcd`, ej. 4÷3 → `4/3`, nunca decimal feo) o **Personalizado por parte** (`rebuildManualPanel` genera un `<input>` de texto por cada parte *coloreada*, guardados en `customLabels[]`; el placeholder muestra el valor automático de referencia).
- Solo se etiquetan las partes **coloreadas** (`labelForPart`), nunca las blancas — así se ve en las imágenes de referencia que usó el usuario.
- Colores de texto independientes entre sí: `#colorValorParte` (blanco por defecto) para las etiquetas por parte, `#colorValorTotal` (negro por defecto) para la llave + el valor total. No hay cálculo automático de contraste (existió brevemente vía `textColorFor`; se eliminó por no usarse).
- Tamaños: `INTEGER_SIZE_FACTOR = 0.68` reduce el tope de enteros/decimales frente a fracciones (una fracción ocupa más alto por numerador+barra+denominador, así que a tamaño de fuente igual se ve más grande). Topes geométricos por forma, ya afinados con varias rondas de feedback visual:
  - Círculo: ancho `min(R*0.46, cuerda*0.62)`; alto `R*0.44` (entero) / `min(R*0.30, cuerda*0.7)` (fracción) — la cuerda se calcula en el radio donde se centra el número, para que sectores angostos (denominadores grandes) reduzcan el tope también en alto, no solo en ancho.
  - Rectángulo: `w*0.62, h*0.56` de la celda.
  - Triángulo: `lado*UNIT*0.46, alturaChica*UNIT*0.5`.
- `maxPartHeightForShape(forma, isFrac)` calcula el tope "más generoso posible" de cada forma (el que tendría una sola parte grande) y se reutiliza para el **valor del entero**, para que su tamaño máximo iguale exactamente el tope máximo de una parte (pedido explícito del usuario).
- Llave curva bajo la figura: `bracePath` (técnica clásica de Bézier para curly-brace). Si el texto del total no cabe en el ancho de la figura, el lienzo se **ensancha** (centrando la figura) en vez de recortar el texto.

## 5. Mini motor LaTeX → SVG

Parser recursivo propio, sin dependencias (`parseLatexToNodes` + `layoutNode`):

- Soporta `\frac \dfrac \tfrac`, `^{} _{}` (superíndice/subíndice), `\sqrt{}`, agrupación `{...}`, `\text{}` (contenido literal, conserva espacios, en recto), `\mathrm{}`/`\mathbf{}` (en recto, vía `markUpright`), y la tabla `LATEX_SYMBOLS`: alfabeto griego completo con variantes (`\epsilon`→ϵ, `\varepsilon`→ε, `\phi`→ϕ, `\varphi`→φ, como en LaTeX), operadores/relaciones (×, ÷, ·, ±, ∓, ≠, ≤, ≥, ≈, ∞, ∼, ≡, ∝, flechas, ∈, ∪, ∩, ∅, ∀, ∃, ∇, ∂, ℓ, ⟨⟩…) y alias (`\le`, `\ge`, `\ne`, `\to`). Comando desconocido → se muestra como texto literal **en recto** (así `\sin`, `\log`, `\cos` salen como en LaTeX; nunca falla).
- Atajo "a/b" sin backslash se autoconvierte a `\frac{a}{b}` (`preprocessLatex`).
- `layoutNode(node, fontSize)` devuelve `{width, ascent, descent, draw(x, y, fill)}` por nodo, recursivo (fracción anidada, exponente de fracción, etc. funcionan solos). El ancho/alto de cada carácter sale de los propios glifos vectoriales (`measureText` → `glyphMetrics`, mismo significado que el `actualBoundingBox` del canvas que se usaba antes, así que los topes de tamaño no cambiaron de sentido). Solo si un carácter no tiene glifo se recurre al `<canvas>` con `MATH_FONT_STACK`.
- `fitLatexLabel(str, fontSize, fill, maxWidth, maxHeight)` reduce el `fontSize` si no cabe (aplicando antes `INTEGER_SIZE_FACTOR` si no es fracción). `centeredLabelGroup` centra el resultado en un punto `(cx, cy)`.
- El *layout* (fracciones, exponentes, raíces) no depende de ninguna fuente externa: dibuja líneas y posiciona glifos. Cómo se pinta cada carácter está en la sección 6.

## 6. Tipografía del SVG exportado — resuelto: glifos vectoriales de Computer Modern

**Problema que resolvía**: antes cada carácter era un `<text font-family="KaTeX_Main,…">` y al exportar se incrustaba la fuente en un `@font-face` (base64). "Convertir en forma" de PowerPoint ignora `@font-face` y el texto caía a Cambria Math, aunque en el navegador se viera perfecto. También se descartó parsear la fuente en tiempo real con `opentype.js` (dependía de red al exportar). **No volver a ninguno de esos dos enfoques.**

**Solución actual** (mismo enfoque que el generador hermano de la tabla de valor posicional):

1. `herramientas/extraer_glifos.py` (en la raíz del repo) extrae **offline** con `fontTools` los contornos de las fuentes originales de TeX: `cmr10.ttf` (recto), `cmmi10.ttf` (cursiva matemática) y `cmsy10.ttf` (símbolos). Por defecto toma las que trae matplotlib; acepta otra carpeta como argumento. Estas fuentes no tienen un cmap Unicode útil, así que el script mapea a mano Unicode → nombre de glifo. Escribe directamente `sitio/compartido/glifos.js` (`Banco.GLYPH_DATA`, con su encabezado); no hay que pegar nada a mano.
2. `GLYPH_DATA = { upm: 2048, r: {car: [avance, yMin, yMax, "d"]}, i: {...} }`, en unidades de fuente con y hacia arriba, vive en `compartido/glifos.js` (unos 130 KB, 153 glifos rectos + 84 cursivos) y `script.js` lo toma con `const GLYPH_DATA = Banco.GLYPH_DATA;`. Estrategias y recta-numerica cargan el mismo archivo, así que agregar o cambiar un glifo también los afecta. Su `"d"` solo usa `M/L/Q/Z` con pares x y alternados (las cuadráticas de TrueType; PowerPoint ya aceptaba `Q`/`T` en la llave).
3. Subconjunto (pedido por el usuario: "todo a vectores"):
   - **Recto** (`r`): dígitos, `+ = ( ) [ ] . , : ; ! ? % & ' / @ # $ ¡ ¿ – —`, el latín A–Z a–z (para `\text`), el espacio y los acentos del español compuestos (á é í ó ú ü ñ Á É Í Ó Ú Ü Ñ). También el griego mayúsculo (Γ Δ Θ Λ Ξ Π Σ Υ Φ Ψ Ω) y los símbolos de cmsy10: − × ÷ ± ∓ ≤ ≥ ≈ ∞ √ · { } | * ∼ ≡ ∝ → ← ↔ ⇒ ⇔ ∈ ∪ ∩ ∅ ∀ ∃ ∇ ′ ⊥ ∘ • ⟨ ⟩. Por último `<` y `>`, que en TeX vienen de cmmi10.
   - **Cursiva** (`i`): latín A–Z a–z, todo el griego minúsculo con variantes (ϵ ε ϑ ϖ ϱ ς ϕ φ) y ℓ ∂ ℘.
   - **Compuestos como en TeX**: `≠` = "=" + barra `negationslash` centrada; `…` y `⋯` = tres puntos con paso de 1.172em/3; los acentos centrados sobre la letra (subidos a la altura de mayúsculas cuando corresponde).
   - `-` se dibuja como el signo menos de cmsy10, igual que en modo matemático.
4. **Convención recto/cursiva** (`LETRAS_EN_CURSIVA = true`, un solo interruptor): igual que LaTeX, las letras latinas y el griego minúsculo van en cursiva; los dígitos, los operadores, el griego mayúsculo, el contenido de `\text{}`/`\mathrm{}` y los nombres de comandos desconocidos (`\sin`) van en recto. `glyphFor(ch, upright)` resuelve cuál usar.
5. `glyphRunSvg` dibuja **un `<path>` por carácter** con la escala y el volteo vertical ya aplicados a las coordenadas (sin `transform` propio). Lo usan `layoutNode` (caso `"text"`) y el `√` del caso `"sqrt"`. El radical de cmsy10 cuelga bajo la línea base (TeX lo sube), así que se coloca con su borde superior tocando la barra, y la barra arranca en su extremo derecho.
6. **Respaldo**: si un carácter no está en `GLYPH_DATA`, esa corrida se mide con canvas y se dibuja como `<text>` con `MATH_FONT_STACK`, para no fallar nunca. Ese carácter no sobrevivirá igual en PowerPoint; para agregarlo, ampliar el mapa del script de Python y volver a correrlo para regenerar `compartido/glifos.js`.
7. **Se retiraron** `getEmbeddedFontCss`, `arrayBufferToBase64`, `CM_FONT_URL`, `KATEX_VERSION`, el `<link>` al CSS de KaTeX y el `<defs><style>@font-face` de `buildSVG`. El SVG exportado ya no contiene ni `<text>` ni `<style>`.

**Verificado**: en 6 casos (las tres formas, etiquetas automáticas y manuales con `\frac`, `x^2`, `\sqrt{2}`, `\alpha+\beta`, `\times`, `\text{2 cm}`, y un total `\frac{3}{4}+\pi-\Omega\neq\sin\theta`) el SVG exportado no tiene `<text>` ni `<style>`, las formas son idénticas a la versión anterior y se revisó una hoja con los 237 glifos. Como la medición ahora sale de los glifos reales de CM, un total ancho puede ensanchar el lienzo un poco distinto que antes, porque los operadores de CM traen sus márgenes laterales.

## 7. Agrupamiento del SVG para PowerPoint — resuelto: dos niveles

```
svg
 ├─ g   (TODAS las partes; cada parte en su propio <g> con solo su relleno + trazo)
 ├─ g   (TODAS las etiquetas de valor por parte; cada una en su <g transform>) — se omite si no hay etiquetas
 ├─ path  (llave, suelta)        ┐ solo si "Mostrar valor total";
 └─ g     (valor del entero)     ┘ quedan fuera de los dos grupos, como siempre
```

- En cada `build*` hay dos acumuladores, `svgPartes` y `svgValores`, y todos devuelven `figura(svgPartes, svgValores, width, height)` → `{svg, partes, valores, width, height}`.
- `composeFigura(partes, valores, dx)` arma los dos grupos hermanos. Cuando `appendTotalBrace` ensancha el lienzo, el desplazamiento `dx` se aplica como `transform` **a cada uno de los dos grupos**, no en un `<g>` envolvente como antes: ese nivel extra obligaba a desagrupar dos veces en PowerPoint para separar valores de partes.
- En PowerPoint: al desagrupar **una vez** se separan "las partes" de "los valores" (y la llave y el total, sueltos); al desagrupar el grupo de partes **otra vez**, cada parte queda individual.
- Consecuencia buscada: el número de una parte **ya no viaja con ella** al moverla (vive en el grupo de valores). Se simuló aplicando `translate` a un `<g>` de parte y al grupo de valores: cada uno se mueve solo.
- Historial: antes cada parte era un `<g>` con su relleno, trazo y etiqueta juntos, un diseño heredado del "halo blanco" ya eliminado (sección 3).

## 8. Descarga del SVG

- `download()`: el SVG ya es autosuficiente (glifos como `<path>`), así que no descarga ni incrusta ninguna fuente. Arma el SVG y el nombre y llama a `Banco.guardarSVG(svg, filename)` (`compartido/guardar-svg.js`): `showSaveFilePicker` (Chrome/Edge), recordando la última carpeta de la sesión, con fallback a `<a download>` en otros navegadores.
- **Enter** en los campos de numerador o denominador dispara la descarga (igual que el botón).
- Nombre de archivo: `buildFilename()` → `[numerador]-[denominador]-[color].svg` (ej. `4-20-azul.svg`). Sin prefijo de forma — el usuario ya organiza los SVG en carpetas separadas por forma.

## 9. Interfaz (diseño «Generador fracciones» de Vesta, 2026-09-27)

Sale del diseño hecho con Claude Design en el proyecto `d58b363a-9cc0-4ae6-a62c-557c54b40c0c` (lienzo `Generador de fracciones - organizacion.dc.html`, que muestra `Generador fracciones.dc.html` a 1440, 768 y 375 px; `generador-fracciones/index.html` + `style.css` es una versión estática del mismo diseño, sin «Mismo valor» y con «Valor de las partes» como select; donde difieren, se siguió el lienzo). Se pasó a HTML/CSS/JS estáticos con la misma base que `numeros-dienes` y `valor-posicional`: los tokens vienen de `../compartido/vesta.css`, sin `support.js`, `_ds/` ni React. El `:root` de `style.css` solo declara la paleta de las figuras (`--morado`, `--azul`, …), que no es del sistema de diseño y debe coincidir con `COLORS` del script.

Distribución: panel lateral de 444 px desde 1024 px (la figura a su derecha); por debajo, las mismas secciones en filas sobre la figura; bajo 640 px, márgenes de 16 px, título de 28 px, botón a todo lo ancho e interruptores a 14 px. La figura mide como máximo 600 px de alto con el panel lateral, 440 px en filas y 300 px en el celular (y nunca más del 70 % de la ventana); `#svgHolder svg { max-width: 100% }` es imprescindible (un rectángulo ancho o la llave ensanchando el lienzo desbordarían la tarjeta).

Estructura, de arriba abajo:

- **Cabecera**: ícono, título, texto y `#downloadBtn` («Guardar SVG»).
- **Forma y fracción** (`.barra`, lado a lado mientras quepan): «Forma del entero», un segmentado solo con iconos (`.seg.segForma[data-for=forma]`; el nombre va en el tooltip y los botones conservan `data-forma` porque lo usa `herramientas/verificar-svg.js`), y `#numerador`, `#denominador` y `#ancho`. `#anchoField` entra y sale deslizándose: oculto sigue con `data-hide-when`, pero el CSS lo deja en pantalla sin ancho (y el script lo marca `inert`) para que la salida también se anime. La fracción no se encoge por debajo de sus columnas (96 px cada una): si no cabe, baja a otra fila.
- **Avisos de forma** (en lugar de la nota fija de tamaños, a pedido del usuario): tooltip sobre «Denominador» solo con el triángulo (cuadrado perfecto) y sobre «Ancho total» solo con el rectángulo (mide 10 de alto: con ancho 10 se ve como un cuadrado). Los muestra el CSS según `.page[data-forma]`, al pasar el cursor o con el foco en el campo; `aria-describedby` se pone solo con su forma.
- **Color de las partes**: seis muestras `.swatch[data-color]` + «＋», fachada del `<select id="color">`. Un solo anillo (`.swatchRing`) se desliza a la elegida; «＋» elegido toma el color personalizado. `#colorPersonalizadoField` muestra el selector y el código del color (`#colorPersonalizadoHex`).
- **Plegable «Etiquetas numéricas»** (`#etiquetas`, la de numeros-dienes: `.plegable` con `is-open`/`is-settled`), cerrada al abrir; se abre sola si el navegador restauró algún interruptor. Cerrada, `#etiquetasInner` queda `inert` y las etiquetas activas se siguen dibujando. `#etiquetasBadge` se conserva vacío y oculto (lo busca `updateVisibility`; el diseño quitó la insignia «Activas»). Dentro:
  - `#showTotalLabel` y `#showPartLabels`, a 9 px de pista a pista (`.switch + .switch`, regla del repo).
  - Tres menús (`.menuSwitch`) que se despliegan con su interruptor por CSS (`:has`): «Valor del entero» (`#valorEnteroField`, con cualquiera de los dos, porque también da el valor automático de las partes; el diseño lo tenía solo en el del total, decisión del usuario), «Color del total» (`#colorValorTotal`) y el de las partes: «Valor de las partes» (segmentado de `#labelMode`: Automático / Personalizado) y «Color en las partes» (`#colorValorParte`). Los campos de dentro se muestran siempre (quien los oculta es el menú), así la contracción también se anima.
  - Colores del texto (`.colorPick[data-for]`): dos muestras fijas que copian su color en el `<input type="color">` y disparan `input`/`change`, y «+», que es ese mismo input; con un color propio, «+» lo muestra y lleva el anillo (como «Color de los bloques» de numeros-dienes).
  - «Personalizado» (`#manualMenu`, se despliega con ese modo): `#manualPanel` (lo llena `rebuildManualPanel`; cada campo muestra solo su número con un contador CSS y el texto «Parte N» queda como nombre accesible) y el interruptor «Mismo valor» (`#mismoValorTodas`), **solo de la interfaz**: con él se ve un solo campo (`#valorTodasPartes`, «Las N partes») y `syncManual` copia su valor en `customLabels` antes de que `rebuildManualPanel` los recorte, así el SVG es idéntico al de escribirlo parte por parte (verificado).
  - «¿Qué puedes escribir?»: `<details>` con la ayuda de LaTeX.
- **Vista previa**: `#err` / `#warn` (Callout con ícono; el script los muestra con `display: block`, así que el ícono va posicionado) sobre la tarjeta `.stage` con `#svgHolder`.
- **Pie**: derechos y enlace a la licencia.

Puente con el script (bloque «Interfaz» al final de `script.js`): `syncDesignControls(forma, colorSel)` —llamada desde `updateVisibility()` en cada render— pone al día segmentados (`syncSegmented`, `placeIndicator`), muestras y anillo (`syncSwatches`, `placeRing`), colores del texto (`syncColorPick`), «Ancho total», avisos de forma y «Personalizado»/«Mismo valor» (`syncManual`); `setEtiquetasExpanded(open)` abre y cierra la plegable. Los clics cambian el control real y disparan `change`, así `render()` corre igual que antes.

Regla clave: **ningún control se quita del DOM para ocultarlo**: el script registra listeners y lee todos los ids al cargar. Se ocultan con `data-hide-when` (`display:none !important`); los contenedores que alterna `updateVisibility()` son `#anchoField`, `#colorPersonalizadoField`, `#valorEnteroField`, `#labelModeField`, `#colorValorParteField`, `#colorValorTotalField` y `#manualPanel`.

Diferencias con el diseño, a propósito: la paleta es la de `COLORS` (el diseño traía otro orden y un «rosa»); «Valor del entero» en fila propia; «Color del total» y «Color en las partes» en vez de «Color» en los dos menús; la nota de tamaños como tooltips; «Forma del entero» parte de 300 px (no 380) para que con el rectángulo quepa junto a la fracción a 768 px; el «+» de los colores del texto muestra el color propio. Iconos Lucide 0.544.0 incrustados (registrados en `AVISOS-DE-TERCEROS.md`).

**Pendiente de subir a Vesta** (con `/design-sync`, uno a la vez): el segmentado de iconos con tooltip, las muestras con anillo deslizante, el selector de color de texto (dos fijos + «+»), el campo con prefijo (número de parte / «Las N partes») y los menús que se despliegan con su interruptor.

Fuentes cargadas por `<link>`: solo Google Fonts (Fraunces + Poppins para la interfaz, STIX Two Text como respaldo). **No afectan a las etiquetas** ni al archivo exportado: la vista previa y el SVG usan los mismos glifos vectoriales (sección 6), así que se ven igual con o sin internet.

## Advertencias para seguir trabajando aquí

- Las secciones 6 y 7 (tipografía vectorial y agrupamiento en dos niveles) ya están aplicadas; **falta confirmarlas en el flujo real de PowerPoint** (pegar el SVG → Convertir en forma → desagrupar una y dos veces), porque solo se verificaron en el navegador y con simulación. No reintroducir `<text>`/`@font-face` en el SVG exportado ni volver a envolver los dos grupos en un `<g>` común.
- Antes de tocar los ángulos/arcos del círculo, entender por qué `wedgePath` divide en tramos ≤179° (sección 1) — es una corrección de un bug real, no una elección arbitraria.
- No reintroducir el halo blanco de los márgenes salvo pedido explícito (se quitó a propósito).
- Cualquier cambio de tipografía o de agrupamiento debe verificarse pensando en el flujo real: convertir el SVG a formas en PowerPoint, no solo la vista previa del navegador — así es como se detectaron los problemas de tipografía y agrupamiento.
- Si se cambia la interfaz, conservar todos los ids que usa el script y no eliminar controles del DOM para ocultarlos (sección 9), y correr `herramientas/verificar-svg.html` antes y después (sus 7 casos de fracciones hacen clic en `[data-forma=…]` y `[data-color=…]`). Tras el rediseño responsivo (2026-09-27) los 63 casos salieron idénticos a la referencia.
