# Generador de fracciones — `fracciones/`

Herramienta web (`index.html` + `style.css` + `script.js`, más lo que carga de `../compartido/`) que genera figuras de fracciones (círculo, rectángulo en cuadrícula, triángulo subdividido) como SVG descargable. El SVG se pega en PowerPoint y se convierte a formas editables: tiene que funcionar en ese flujo, no solo verse bien en el navegador. Las convenciones generales del repo (nombres de archivo, sistema de diseño, compilación) están en el `CLAUDE.md` de la raíz.

Otros archivos de esta carpeta:
- `_extraer_glifos.py`: extrae offline con `fontTools` los glifos de Computer Modern y escribe `../compartido/glifos.js` (sección 6).
- `circulo/`, `rectangulo/`, `triangulo/`: los SVG generados, separados por forma (por eso el nombre de archivo no lleva la forma). No están en el repositorio (los SVG se ignoran en `.gitignore`). `triangulo/` se eliminó porque había quedado vacía; se vuelve a crear al guardar el primer triángulo. Las fórmulas de `buildTriangulo` salen de la versión TikZ original, ya retirada.
- `_desing-system-vesta/`: sistema de diseño «Vesta» usado para la interfaz (ver `CLAUDE.md` raíz).

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

1. `_extraer_glifos.py` (en esta carpeta) extrae **offline** con `fontTools` los contornos de las fuentes originales de TeX: `cmr10.ttf` (recto), `cmmi10.ttf` (cursiva matemática) y `cmsy10.ttf` (símbolos). Por defecto toma las que trae matplotlib; acepta otra carpeta como argumento. Estas fuentes no tienen un cmap Unicode útil, así que el script mapea a mano Unicode → nombre de glifo. Escribe directamente `compartido/glifos.js` (`Banco.GLYPH_DATA`, con su encabezado); no hay que pegar nada a mano.
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

## 9. Interfaz

Rediseñada con el sistema de diseño **"Vesta"** (Claude Design) e integrada como HTML/CSS normales: los tokens (colores, tipografía, radios, sombras, movimiento) vienen de `../compartido/vesta.css`, sin `support.js`, `_ds/` ni React. El `:root` de `style.css` solo declara la paleta de las figuras (`--morado`, `--azul`, …), que no es del sistema de diseño y debe coincidir con `COLORS` del script.

Estructura, de arriba abajo:

- **Cabecera**: título (Fraunces) + subtítulo, y `#downloadBtn` ("Guardar SVG…", botón primario) a la derecha.
- **Forma**: tres botones `.formaBtn[data-forma]` (Círculo / Rectángulo / Triángulo). Son solo una fachada: el estado real vive en el `<select id="forma">` oculto (`.visuallyHidden`), que es lo que lee todo el script.
- **Fila principal** (`.mainRow`): `#numerador`, `#denominador`, `#ancho` (dentro de `#anchoField`, solo visible con rectángulo) y "Color de las partes": seis muestras `.swatch[data-color]` + muestra "＋" personalizada, que manejan el `<select id="color">` oculto; `#colorPersonalizado` (dentro de `#colorPersonalizadoField`) aparece bajo las muestras al elegir "Personalizado…".
- Texto de ayuda sobre tamaños fijos, cuadrados perfectos del triángulo y el diálogo de guardado en Chrome/Edge.
- **Panel plegable "Etiquetas numéricas"** (`#etiquetasToggle` / `#etiquetasBody` / `#etiquetasInner`): cerrado por defecto; se abre al cargar si el navegador restauró algún toggle activo. Contiene los interruptores `#showPartLabels` / `#showTotalLabel` (checkbox reales con `role="switch"`, el script lee `.checked`), `#valorEntero`, `#labelMode`, `#colorValorParte`, `#colorValorTotal`, `#manualPanel`, y la ayuda de LaTeX (con la lista de comandos y la nota de que todo se dibuja como vectores Computer Modern, ver sección 6). Con el panel cerrado sus controles quedan `inert` pero siguen en el DOM; las etiquetas activas se siguen dibujando y la insignia `#etiquetasBadge` ("Activas") lo indica. Se descartó a propósito la insignia "Próximamente" y el aviso "Todavía no está activo" que traía la propuesta de diseño (las etiquetas ya funcionan).
- **Avisos** `#err` / `#warn` (estilo Callout: "No se puede generar la figura" / "Revisa este detalle"), ver sección 2.
- **Vista previa**: tarjeta `.stage-inner` con `#svgHolder`. La regla `#svgHolder svg { max-width:100%; max-height:70vh }` es imprescindible (un rectángulo ancho o la llave ensanchando el lienzo desbordarían la tarjeta).

Puente entre la fachada y el script (bloque al final de `script.js`): `setSelectValue(id, value)` cambia el `<select>` oculto y dispara `change` (así `render()` corre igual que antes); `syncDesignControls(forma, colorSel)` —llamada desde `updateVisibility()`— marca con `aria-pressed` el botón de forma y la muestra de color activos; `setEtiquetasExpanded(open)` abre/cierra el panel.

Regla clave: **ningún control se quita del DOM para ocultarlo** — el script registra listeners y lee todos los ids al cargar (incluidos `#ancho` y `#colorPersonalizado` aunque no estén visibles). Se ocultan con el atributo `data-hide-when` (`display:none !important`). Los contenedores `#anchoField`, `#colorPersonalizadoField`, `#valorEnteroField`, `#labelModeField`, `#colorValorParteField`, `#colorValorTotalField` son los que alterna `updateVisibility()`.

Responsivo: por debajo de 640 px los márgenes laterales bajan a 16 px; por debajo de 420 px los botones de forma ocultan su icono para que quepa "Rectángulo".

Fuentes cargadas por `<link>`: solo Google Fonts (Fraunces + Poppins para la interfaz, STIX Two Text como respaldo). **No afectan a las etiquetas** ni al archivo exportado: la vista previa y el SVG usan los mismos glifos vectoriales (sección 6), así que se ven igual con o sin internet.

## Advertencias para seguir trabajando aquí

- Las secciones 6 y 7 (tipografía vectorial y agrupamiento en dos niveles) ya están aplicadas; **falta confirmarlas en el flujo real de PowerPoint** (pegar el SVG → Convertir en forma → desagrupar una y dos veces), porque solo se verificaron en el navegador y con simulación. No reintroducir `<text>`/`@font-face` en el SVG exportado ni volver a envolver los dos grupos en un `<g>` común.
- Antes de tocar los ángulos/arcos del círculo, entender por qué `wedgePath` divide en tramos ≤179° (sección 1) — es una corrección de un bug real, no una elección arbitraria.
- No reintroducir el halo blanco de los márgenes salvo pedido explícito (se quitó a propósito).
- Cualquier cambio de tipografía o de agrupamiento debe verificarse pensando en el flujo real: convertir el SVG a formas en PowerPoint, no solo la vista previa del navegador — así es como se detectaron los problemas de tipografía y agrupamiento.
- Si se cambia la interfaz, conservar todos los ids que usa el script y no eliminar controles del DOM para ocultarlos (sección 9). Tras el rediseño se verificó que el SVG exportado es idéntico byte a byte al de la versión anterior en 8 casos (tres formas, círculo 1/2, error, warning, etiquetas auto/manual con LaTeX, llave, color personalizado).
