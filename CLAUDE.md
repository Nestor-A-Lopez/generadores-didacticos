# Banco didáctico — generadores de material en SVG

Generadores de figuras matemáticas para clase (fracciones, material base 10, tablas de valor posicional, rectas numéricas, estrategias de cálculo). Cada generador es una aplicación web: se abre en el navegador, se configura con controles y se guarda un SVG.

**Destino final de todo SVG: PowerPoint.** El SVG se pega en una diapositiva y se usa «Convertir en forma» para editarlo. Un SVG que se ve bien en el navegador pero falla en ese flujo está mal. Casi todos los bugs corregidos en este repo solo aparecían al convertir a formas.

**Destino final de los generadores: una sola plataforma web publicada en GitHub Pages** (ver «Plataforma» abajo). El repositorio es `generadores-didacticos` (público, usuario `Nestor-A-Lopez`); el sitio es https://nestor-a-lopez.github.io/generadores-didacticos/.

## Estructura del repositorio

```
README.md  CLAUDE.md  .gitignore
LICENSE                         ← CC BY-NC 4.0 (texto oficial), con la excepción de terceros
AVISOS-DE-TERCEROS.md           ← material de terceros: qué es, de dónde viene, licencia y dónde está
.github/workflows/pages.yml     ← publica sitio/ en GitHub Pages
.claude/skills/vesta/           ← sistema de diseño Vesta (copia local, como skill)
herramientas/                   ← no se publican
├── extraer_glifos.py           ← regenera sitio/compartido/glifos.js
└── verificar-svg.html/.js      ← comprueba que el SVG exportado no cambió (49 casos)
sitio/                          ← lo único que se publica
├── index.html  style.css       ← portada
├── licencia/index.html         ← «Licencia y avisos» (usa ../style.css)
├── compartido/
├── fracciones/  numeros-dienes/  estrategias/  recta-numerica/
└── valor-posicional/          ← tabla de valor posicional y operaciones
```

Los SVG generados **no** viven en el repositorio: se guardan en `_recursos/figuras/`, al lado de él (ver «Nombres de archivo de los SVG»).

## Decisiones vigentes

1. **Todo se desarrolla en HTML/CSS/JS.** LaTeX/TikZ quedó retirado: ya no hay `.tex`, no se compila nada y no se convierte de PDF a SVG. Si aparece un `.tex` o una carpeta `temp/`, es un resto que se puede eliminar (preguntando antes).
2. **Cada generador son tres archivos propios**: un HTML, un CSS y un JS, y además carga lo que está en `sitio/compartido/` (ver «Arquitectura de un generador» y «Carpeta compartida»). Los seis generadores ya están separados (2026-09-26). En los `CLAUDE.md` de las subcarpetas, «el script» es su `script.js` y «la interfaz» su `index.html` + `style.css`.
3. **Se permiten dependencias externas** en la aplicación (librerías por CDN, fuentes, iconos). Lo que **no** cambia: el SVG exportado sigue siendo autosuficiente (ver «Reglas transversales»).
4. **Licencia: CC BY-NC 4.0** (`LICENSE`, © 2026 Néstor A. López), salvo el material de terceros, que conserva la suya: los contornos BaKoMa de `glifos.js` y `glifos-tabla.js`, y los iconos de Lucide/Feather incrustados en los `index.html`. **Todo material de terceros nuevo** (iconos, fuentes, imágenes, código copiado) se registra en `AVISOS-DE-TERCEROS.md` en el mismo commit en que entra: qué es, de dónde viene, su licencia (con el texto si pide conservar el aviso) y dónde está. Lo que solo se enlaza por CDN va en su tabla «Enlazado, no incluido». Si el material se **publica** (está en `sitio/`), su aviso se copia también en la página `sitio/licencia/index.html`: el sitio publicado no incluye `LICENSE` ni `AVISOS-DE-TERCEROS.md`, y esas licencias piden que el aviso acompañe las copias. Los textos de las dos tienen que ser idénticos. No se agrega nada cuya licencia no permita redistribuirlo; si hace falta como referencia local, va en `.gitignore`. El aviso de BaKoMa va en la cabecera de los dos archivos de glifos; el de `glifos.js` lo escribe `extraer_glifos.py`, así que se cambia ahí.

## Arquitectura de un generador

```
sitio/<carpeta-del-generador>/
├── index.html    ← estructura y controles; enlaza los otros dos
├── style.css     ← estilos propios de la interfaz (los tokens vienen de compartido/vesta.css)
└── script.js     ← toda la lógica (constantes, cálculo, buildSVG, UI); los glifos vienen de compartido/
```

- `index.html` porque GitHub Pages sirve `…/fracciones/` directamente, sin escribir el nombre del archivo.
- El JS se carga como **script clásico**: `<script src="script.js" defer></script>`. **No** usar `type="module"` ni `fetch()` de archivos locales (por ejemplo, cargar `GLYPH_DATA` desde un `.json`): Chrome y Edge los bloquean al abrir el HTML con doble clic (`file://`), y la herramienta tiene que seguir funcionando así. Si algún día se necesitan módulos, se trabaja con un servidor local (`python -m http.server`) y se documenta aquí.
- Dependencias externas: por CDN (cdnjs, jsDelivr, Google Fonts) y **con versión fija** en la URL. Sin internet la interfaz puede degradarse, pero el SVG exportado no debe depender de nada externo.
- **Cómo se separaron** (por si llega otro generador de un solo archivo): el contenido de `<style>` pasó a `style.css` y el de `<script>` a `script.js` **sin cambiar lógica**, solo quitando la sangría común, y con todos los ids del DOM intactos. Luego se movió a `compartido/` lo repetido. En cada paso se comprobó que el SVG exportado seguía **idéntico byte a byte** en 40 casos representativos (de 6 a 7 por generador) y que las capturas de la interfaz coincidían píxel a píxel. Esos casos se perdieron; los actuales, rehechos el 2026-09-26 para la reorganización, están en `herramientas/verificar-svg.js` (ver «Cómo trabajar aquí»).
- Quitar sangría es seguro salvo dentro de plantillas `` `…` `` de varias líneas que terminen en el SVG: revisarlas antes. Al separar solo había una, en operaciones, y arma HTML de la interfaz.

## Carpeta compartida

`sitio/compartido/` guarda lo que usan **dos o más** generadores, para no repetirlo en cada uno:

```
compartido/
├── vesta.css        ← tokens de Vesta (todos los bloques :root de .claude/skills/vesta/tokens/, sin base.css ni el @import de fuentes)
├── cabecera.css     ← .headerMarca + .icono: el ícono de la tarjeta de la portada a la izquierda del título
├── generadores.js   ← Banco.GENERADORES (la lista de la portada), Banco.buscarGeneradores(consulta), Banco.iconoSVG(contenido)
├── menu.js, menu.css ← menú para pasar de un generador a otro sin volver a la portada, con buscador
├── glifos.js        ← Banco.GLYPH_DATA: juego completo de Computer Modern (lo escribe herramientas/extraer_glifos.py)
├── texto-svg.js     ← Banco.glyphRunSvg(text, x, y, fontSize, fill, glyphFor?): texto como un <path> por carácter, con glifos.js
├── glifos-tabla.js  ← Banco.GLYPH_DATA_TABLA: glifos de las tablas, en su propio formato {upm, regular, bold} (desde el 2026-09-27 solo lo usa valor-posicional)
└── guardar-svg.js   ← Banco.guardarSVG(svg, filename): showSaveFilePicker (recuerda la carpeta) + respaldo <a download>
```

Quién carga qué:

| Generador | `vesta.css` + `cabecera.css` + `menu.css` | `generadores.js` + `menu.js` | `glifos.js` + `texto-svg.js` | `glifos-tabla.js` | `guardar-svg.js` |
| --- | --- | --- | --- | --- | --- |
| fracciones, estrategias, recta-numerica | sí | sí | sí | — | sí |
| valor-posicional | sí | sí | sí (solo para los signos «123 + − × ÷» del selector de operación) | sí | sí |
| numeros-dienes | sí | sí | sí (solo para el valor y la descomposición de la vista previa) | — | sí |

- Cada `index.html` los carga **antes** que los suyos, con rutas relativas: `<link rel="stylesheet" href="../compartido/vesta.css" />` y `cabecera.css` (en ese orden, porque usa sus tokens) antes de `style.css`, y los `<script src="../compartido/…" defer></script>` antes de `script.js`. Todos los generadores están al mismo nivel dentro de `sitio/`, así que la ruta es siempre `../compartido/` (la portada, que está en `sitio/`, usa `compartido/`).
- En `script.js` se toman con una línea (`const GLYPH_DATA = Banco.GLYPH_DATA;`), así el resto del código no cambió. `download()` arma el SVG y el nombre, y termina con `await Banco.guardarSVG(svg, filename)`. El atajo de **Enter** se queda en cada generador porque cada uno lo pone en campos distintos.
- `glifos.js` es el juego completo de fracciones (237 glifos). Estrategias y recta-numerica tenían recortes de 13 glifos, copiados tal cual de ese juego; se unificaron por decisión del usuario, porque solo buscan por carácter y la salida no cambia. Las tablas usan otro formato (con `bold`), así que van aparte en `glifos-tabla.js`.
- `cabecera.css` (desde el 2026-09-26): todos los generadores muestran, a la izquierda del título, el ícono de su tarjeta de la portada en un recuadro de 48 px (`<div class="headerMarca"><span class="icono">…</span><div>h1 + p</div></div>`), y el mismo ícono como ícono de la pestaña (`<link rel="icon">` con el SVG incrustado en `data:`, para que funcione con doble clic). El ícono de cada uno está en su `index.html`; `cabecera.css` solo tiene los estilos. numeros-dienes añade en su `style.css` el ancho flexible de `.headerMarca`.
- **Menú de navegación** (desde el 2026-09-28; se probaron dos diseños, horizontal y lateral, y el usuario eligió el lateral; el horizontal, una barra fija arriba con enlaces y buscador, se descartó): `generadores.js` tiene la lista (la misma de las tarjetas de la portada, con un nombre corto, una descripción y `claves` de búsqueda) y la búsqueda, que es igual en las dos: sin acentos ni mayúsculas, cada palabra de la consulta tiene que aparecer en el nombre, la descripción o las claves, y primero van los que la tienen en el nombre. `menu.js` + `menu.css` dibujan la barra y el menú. Se inserta desde el script, al principio de `<body>`, sin tocar `.page` ni los ids de los generadores (los suyos llevan el prefijo `menuGen`). Enlaces relativos a la carpeta de `menu.js`, con `index.html`, para que funcionen con doble clic. «/» (fuera de un campo) o Ctrl+K llevan al buscador. **Al agregar un generador**, se agrega su tarjeta en la portada y su entrada en `Banco.GENERADORES`. `menu.css` va después de `cabecera.css`, y `generadores.js` + `menu.js` antes que los demás scripts. La portada y «Licencia y avisos» no lo cargan.
  - Diseño (desde el 2026-09-28, igual en todos los anchos): una **barra fija arriba** (`.menuGen-barra`, `position: sticky`, 56 px, blanca translúcida con borde abajo, como la de la portada) con el botón del menú, «Banco.» (lleva a la portada) y la lupa; y un **menú lateral** oscuro, como el `Sidebar` del kit de app de Vesta (`ui_kits/app/AppChrome.jsx`), que se abre encima de la página y de la barra, con un velo, igual que en el celular: «Banco.» y la X, el buscador, la lista de generadores (el abierto con `aria-current`, en blanco sobre `rgba(255,255,255,.12)`) y abajo «Todos los generadores». Se cierra con la X, el velo o Escape, y el foco vuelve a lo que lo tenía al abrir. Al abrir con el botón, el foco va al generador abierto; con la lupa, «/» o Ctrl+K, al buscador. Al escribir, la lista se filtra en su lugar (conserva el orden de la portada); Enter abre el primero según la búsqueda, flecha abajo pasa a la lista y Escape borra o cierra. La pista «/» del buscador solo se ve desde 1024 px. El contenido de la barra (`.menuGen-barraInterior`) no llega a las orillas de la pantalla, como en la portada: tiene el ancho de `.page` (1280 px como máximo, centrado) y los íconos de ≡ y la lupa quedan justo a la altura de la orilla del contenido del generador, `--menuGen-orilla` (40 px, y 16 px con menos de 640 px; recta-numerica y estrategias la ponen en 32 px en su `style.css`, junto al padding de su `.section`). Si cambia el margen de un generador, se cambia también esa variable.
  - Historia (para no repetirla): hasta la tarde del 2026-09-28 el menú estaba abierto y fijo a la izquierda desde 1440 px (con `padding-left` en `body`), era un riel de íconos de 72 px de 1024 a 1439 px, y se podía ocultar con un botón flotante para mostrarlo, guardado en `localStorage` (`banco.menuOculto`). El usuario pidió en su lugar la barra del celular en todos los anchos, con el menú siempre encima; ya no hay `padding-left`, riel, «Ocultar menú» ni `localStorage`, y los generadores conservan todo su ancho.
- `texto-svg.js` (desde el 2026-09-26) es la función que dibuja texto con esos glifos, que estaba copiada en los cuatro generadores que cargan `glifos.js`. Las copias solo diferían en cómo buscan el glifo, así que eso es un parámetro opcional: por defecto, el recto (`GLYPH_DATA.r`); fracciones pasa su `glyphFor` para respetar recto/cursiva. Se carga después de `glifos.js`. En los scripts se toma como `const glyphRunSvg = Banco.glyphRunSvg;` (fracciones la envuelve para pasar `upright`). `glyphMetrics` sigue en cada generador porque sus versiones no son iguales.
- `glifos.js` no se edita a mano: se regenera con `python herramientas/extraer_glifos.py` desde la raíz del repo (necesita `fontTools` y `matplotlib`: `pip install fonttools matplotlib`), que escribe `sitio/compartido/glifos.js` directamente.
- En cada `style.css` quedan solo los tokens que no son de Vesta: la paleta de fracciones (`--morado`…) y los alias `--colU/--colD/--colC`, que ahora valen `var(--base10-*)`.
- Mismas reglas que `script.js`: scripts clásicos, sin `type="module"` ni `fetch()`, para que todo siga funcionando con doble clic.
- Los scripts clásicos comparten el ámbito global: lo compartido se expone en **un solo objeto**, `window.Banco` (por ejemplo, `Banco.GLYPH_DATA`, `Banco.guardarSVG(...)`), para no chocar con nombres de los generadores.
- Solo entra en `compartido/` lo que es **idéntico** en dos o más generadores. Si un generador necesita una variante (por ejemplo, otro subconjunto de glifos), se queda en su `script.js` hasta que se decida unificar.
- **Un cambio en `compartido/` afecta a todos los generadores que lo cargan.** Antes de darlo por terminado, comprobar en **cada uno** que el SVG exportado sigue idéntico byte a byte (o que cambia solo donde se buscaba) y que la interfaz se ve bien.
- Consecuencia aceptada: una carpeta de generador ya no funciona sola; para usarla fuera del repo hay que llevar también `compartido/`.

## Mapa de carpetas

Todo lo publicable está en `sitio/`. Cada carpeta de generador tiene `index.html` + `style.css` + `script.js`.

| Carpeta | Generador | Instrucciones propias |
| --- | --- | --- |
| `sitio/` (`index.html`, `style.css`) | Portada: una tarjeta por generador | — |
| `sitio/fracciones/` | Fracciones: círculo, rectángulo, triángulo. Interfaz responsiva (diseño «Generador fracciones» de Vesta, 2026-09-27), con la misma base que numeros-dienes y valor-posicional: panel lateral desde 1024 px y filas por debajo; forma, fracción y color arriba, y la plegable «Etiquetas numéricas» con un menú por interruptor. «Mismo valor» (un solo valor para todas las partes en «Personalizado») es solo de la interfaz: el SVG es el mismo que escribiéndolo parte por parte | su `CLAUDE.md` |
| `sitio/valor-posicional/` | Tabla de valor posicional y operaciones: une «Tabla de valor posicional» (`tabla-valor-posicional/`) y «Operaciones en la tabla» (`operaciones/`) (rama `unificar-tabla-operaciones`, 2026-09-26), que se retiraron el 2026-09-27 sin redirección: sus URL publicadas ya no existen y su código sigue en el historial de git. Con «Ninguna» da el mismo SVG que la tabla; con una operación, el de operaciones con las medidas de la tabla. Tarjeta en la portada con el ícono Lucide `sheet`. Interfaz responsiva (diseño «Tabla valor posicional» de Vesta, 2026-09-26), con la misma base que numeros-dienes: barra de opciones arriba, panel lateral desde 1024 px y filas por debajo | su `CLAUDE.md` |
| `sitio/numeros-dienes/` | Números con bloques Dienes (material base 10): unidades, decenas, centenas. Se llamó «Números con material» y estaba en `numeros-material/` hasta el 2026-09-26. Interfaz responsiva (diseño «Pantalla base 10» de Vesta, 2026-09-26): panel lateral (propuesta 1b) desde 1024 px y filas (1a) por debajo; los segmentados son fachada de `<select>` ocultos. El cuadrito mide siempre 20 (`L_CUADRITO`; el tamaño se ajusta en PowerPoint) y el número va de 1 a 999 (`NUM_MIN`, `NUM_MAX`): con 0 no hay material y con 999 cada cifra es una pieza. Con «2 filas» (`#filasCentenas`, bajo «Las centenas se acomodan como»; por defecto «1 fila») y 2 o más centenas, las centenas van en dos filas (la de abajo se llena primero), reducidas para que las dos filas, con su separación, midan lo mismo que una decena. Bajo la figura, solo en la vista previa y con glifos de Computer Modern (sección plegable «¿Cuál es la cantidad?», después de «¿Cómo se ve cada pieza?»): «Mostrar valor» y «Mostrar descomposición» (`#mostrarDesglose`, en valor en unidades o en jerarquía C D U), cada uno en «Negro» (por defecto) o «Color» (el de cada pieza); con los dos, la descomposición y luego el valor: «200 + 30 + 6 = 236». «Color de los bloques» cambia el relleno de cada pieza; sus muestras imitan `OrderColorPicker` de Vesta (40 px desde el 2026-09-27; antes, 32) | — |
| `sitio/estrategias/` | Completar la decena en suma y resta; en la resta, pestaña «Distancia entre dos números» (recta numérica + material + ecuación) | — |
| `sitio/recta-numerica/` | Recta numérica: extremos, paso y separación entre marcas | — |
| `sitio/compartido/` | Tokens, glifos y guardado que usan varios generadores; ver «Carpeta compartida» | — |
| `herramientas/` | `extraer_glifos.py` (regenera `sitio/compartido/glifos.js`) y `verificar-svg.html` (49 casos de exportación con su hash; `verificar-svg-referencia.txt` es la corrida del 2026-09-26) | — |
| `.claude/skills/vesta/` | Sistema de diseño **Vesta** (no es un generador; ver abajo) | `SKILL.md`, `readme.md` |

Antes, cada generador era un solo `.html` con prefijo `_` (para que quedara arriba de la lista de SVG en el explorador); ahora todos se llaman `index.html`. Hasta el 2026-09-26 los generadores estaban en la raíz (las tablas, en `tabla-valor-posicional/tabla-valor-posicional/` y `tabla-valor-posicional/operaciones/`), el script de glifos en `fracciones/_extraer_glifos.py` y Vesta en `fracciones/_desing-system-vesta/`. Los nombres viejos siguen en el historial de git (`git log --follow`).

## Nombres de archivo de los SVG

Los SVG se guardan **fuera del repositorio**, en `D:\Archivos\Kubix\preparacionClases\banco-didactico\_recursos\figuras\`, con una carpeta por generador (los mismos nombres que en `sitio/`):

```
_recursos/
├── generadores-didacticos/   ← este repositorio
└── figuras/
    ├── fracciones/circulo/  fracciones/rectangulo/  fracciones/triangulo/
    ├── numeros-dienes/  estrategias/  recta-numerica/
    └── valor-posicional/
```

Se movieron ahí el 2026-09-26 (439 archivos); ese mismo día `numeros-material/` pasó a `numeros-dienes/`, como el generador. Las carpetas que todavía no tienen SVG (`fracciones/triangulo/`, `recta-numerica/`) no existen: se crean al guardar el primero. El 2026-09-27, al retirar los generadores viejos, el usuario mandó a la papelera `figuras/tabla-valor-posicional/` y `figuras/operaciones/` (379 SVG) y creó `figuras/valor-posicional/`, vacía, para los nuevos. Al guardar, el diálogo del navegador recuerda la última carpeta de la sesión, así que la primera vez hay que elegir la de `figuras/`. El nombre describe el contenido, sin prefijo de carpeta ni de tipo de figura.

| Generador | Formato | Ejemplos |
| --- | --- | --- |
| Fracciones | `[numerador]-[denominador]-[color].svg`, en la subcarpeta de la forma (`circulo/`, `rectangulo/`, `triangulo/`) | `3-4-verde.svg`, `0-6-azul.svg` |
| Tabla de valor posicional y operaciones (`valor-posicional`), sin operación | `[Orden]-[Número].svg`; millares separados con `-`, punto decimal tal cual; varios números unidos con `+`; tabla en blanco → `vacia.svg` | `U-950-000.svg`, `mil-9-673.svg`, `U-0.37+U-0.370.svg`, `U-427..svg` (punto sin dígitos después) |
| Tabla de valor posicional y operaciones (`valor-posicional`), con operación | `[A\|S\|M\|D]-[operando]-[operando]….SVG` (extensión en **mayúsculas**, así la genera `buildFilename()`); cada operando en unidades reales. Con o sin operación, todos se guardan en `figuras/valor-posicional/` | `A-0.15-0.028.SVG`, `S-8750-2300.SVG`, `M-2.31-24.SVG` |
| Números con bloques Dienes | `[número].svg`, sin ceros a la izquierda (`007` → `7.svg`), como lo genera `buildFilename()` desde el 2026-09-26 (antes, `numero-N.svg`). Los archivos guardados antes llevan un prefijo con los órdenes, puesto a mano: `U-` (todo en unidades), `DU-`, `CDU-` | `236.svg`; antiguos: `U-36.svg`, `DU-36.svg`, `CDU-427.svg` |
| Completar decena (`estrategias`) | `[A]+[b].svg` (suma) / `[A]-[b].svg` (resta) | `28+5.svg`, `51-7.svg` |
| Distancia entre números (`estrategias`) | `[A]-[b].svg`; sufijo `-sin-material` cuando el interruptor «Material sobre la recta» está apagado | `100-19.svg`, `10-3-sin-material.svg` |
| Recta numérica | `[Inicio]-[Final]-[Paso].svg`, con los valores tal como se escriben | `-5-5-1.svg`, `0-1-0.1.svg` |

Los códigos de orden son `U D C UM DM CM UMM…` para enteros y `dec cen mil` (tres letras) para decimales. No hay que inventar un formato nuevo: si un generador tiene `buildFilename()`, ese es el formato.

## Colores de las figuras

- Material base 10 (fijos; los alumnos ya los asocian con el material físico): unidad `#57A639` (verde), decena `#1C75BC` (azul), centena `#CC2027` (rojo). Son tokens de Vesta: `--base10-unidad`, `--base10-decena`, `--base10-centena`. Son los únicos colores de figura que viven en el sistema de diseño. Son los de defecto: en numeros-dienes, «Color de los bloques» deja elegir otro por pieza (`colorPieza` en su `script.js`), y en valor-posicional, «Color de las jerarquías» otro para las celdas de cada orden (`colorCeldaDe`); con los de defecto el SVG no cambia.
- Fracciones: `verde #7CBF33`, `amarillo #ffd500`, `azul #2ED9D9`, `rojo #E8384F`, `naranja #f48600`, `morado #8080F0`, `rosa #F06EAA` (`COLORS` de `sitio/fracciones/script.js`).
- Ninguna paleta de figuras se «armoniza» con la rampa azul de Vesta. La de fracciones no está en Vesta.

## Sistema de diseño «Vesta»

- **Fuente de verdad:** el proyecto «Vesta» de Claude Design en claude.ai (`a1e3d138-2f59-4b09-a37b-bfefd2e094f5`, https://claude.ai/design/p/a1e3d138-2f59-4b09-a37b-bfefd2e094f5). Ahí trabaja el chat de Vesta y ahí caen los cambios. Hubo además un artifact «Vesta» de tipo Design System, una copia aparte creada el 2026-09-26 que no se actualizaba desde el proyecto; el usuario lo borró el 2026-09-28. La copia local está en `.claude/skills/vesta/`, como skill de Claude Code (`/vesta`). Su `uploads/` (plantilla de Slidesgo, presentaciones) y `assets/reference-landing-mood.jpg` (imagen de banco) **no** se suben a GitHub por su licencia: están en `.gitignore` y solo existen en la copia local.
- Es la fuente de la **interfaz** de los generadores, no de las figuras. Antes de rediseñar una interfaz, leer su `readme.md` (reglas de contenido y visuales) y los tokens en `tokens/*.css`.

Cómo se aplica en este repo:

- Los generadores **no** cargan `styles.css`, `_ds_bundle.js` ni componentes React. Los tokens que usan las interfaces (colores, radios, sombras, tipografía, movimiento) viven en `sitio/compartido/vesta.css`; el `style.css` de cada generador solo tiene sus estilos propios y usa esos tokens con `var(--…)`.
- Tipografía de la interfaz: **Fraunces** (títulos) + **Poppins** (todo lo demás), por Google Fonts.
- Rampa azul `--blue-50 … --blue-950`, neutros con tinte azul, botones en cápsula (`999px`), tarjetas = borde 1px + `--shadow-sm`, avisos con el estilo `Callout`, foco con `--ring-focus`. Sin degradados, sin emoji, sin rebotes.
- **Interruptores contiguos** (regla del usuario, 2026-09-26): el espacio vertical entre dos interruptores seguidos es siempre el mismo, en todos los generadores y a todos los anchos, e igual al que hay entre «Mostrar periodos» y «Mostrar clases» en valor-posicional: **9 px entre la pista de uno y la del siguiente** (con la pista de 26 px centrada en su fila de 44 px, las filas se solapan 9 px). Se aplica desde el 2026-09-27 en fracciones, valor-posicional y numeros-dienes con `.switch + .switch { margin-top: -9px }` en su `style.css` (estrategias tiene un solo interruptor), medida en 9 px a 375 y 1280 px. En numeros-dienes, además, `.subOpcion.is-hidden + .switch` («Mostrar valor» y «Mostrar descomposición» solo quedan seguidos cuando la opción de en medio está oculta); los ocultos con `[hidden]` no ocupan lugar, así que la regla vale entre los que quedan a la vista. Es regla de Vesta desde el 2026-09-27: la documentan `SwitchMenu` (que la aplica con `SwitchGroup`) y `Switch`.
- **Etiqueta de interruptor en una línea** (regla de Vesta, en `Switch.prompt.md`, también para `size="sm"`): si no cabe, se acorta el texto. Con dos líneas la fila crece y la pista, centrada, se aleja: «Punto decimal en los productos parciales» quedaba a 11.8 px en el panel de 330 px, y el 2026-09-27 se acortó a «Punto en los productos parciales» («Punto decimal», a «Punto»).
- **Idioma y números:** español de México con la convención de clase: punto decimal, coma de millares y apóstrofe entre periodos, tanto en las figuras como en la interfaz (el `readme.md` de Vesta ya lo dice así desde el 2026-09-26).

Coordinación entre diseño y código:

- Los cambios de diseño (colores, tipografía, componentes, pantallas) se hacen en Vesta, en claude.ai, y de ahí se bajan a la copia local (`.claude/skills/vesta/`) y a `sitio/compartido/vesta.css`. No inventar colores ni estilos nuevos directamente en un generador.
- Si al programar surge un componente reutilizable nuevo, se pide **dentro del proyecto de Vesta en claude.ai**, un componente a la vez: un mensaje con su anatomía, medidas, tokens y comportamiento tomados del generador, aclarando que no cambie el namespace `EntornoDesignSystem_a1e3d1` ni toque los componentes que ya existen (ver pendiente 1). Después se baja a la copia local.
- **Cómo se baja**: leyendo los archivos del proyecto (`components/<grupo>/<Nombre>.{jsx,d.ts,prompt.md}` y sus `*.card.html`) con la herramienta `DesignSync` de Claude Code, solo con `list_files` y `get_file` (lectura, sin permisos de escritura), y copiándolos tal cual a `.claude/skills/vesta/`. En las tarjetas se cambia `EntornoDesignSystem_a1e3d1` por `VestaDesignSystem_a1e3d1`; los `.jsx` no mencionan el namespace. Se agregan los componentes y las tarjetas nuevas a `_ds_manifest.json`. El `_ds_bundle.js` local **no** se recompila (el del proyecto usa el otro namespace y pasa el límite de lectura de 256 KiB), así que las tarjetas nuevas no se ven en la copia local; a los generadores no les afecta, porque no cargan el bundle.
- **No se usa `/design-sync` para subir**: esa herramienta importa un repositorio de componentes React completo a un proyecto nuevo de Claude Design (o reemplaza el contenido de uno existente); no sirve para agregar un componente a Vesta, y subiría `_ds_bundle.js` y los `.jsx` de la copia local (comprobado el 2026-09-27).
- **Los generadores no usan los componentes React**: los imitan en su CSS. Cuando un componente llega o cambia, se comparan sus medidas, tokens y colores con el `style.css` de cada generador que lo imita y se ajusta el CSS, verificando que la exportación no cambie (`verificar-svg.html`).

## Reglas transversales para el SVG exportado

Aplican a todos los generadores (el detalle y el porqué están en el `CLAUDE.md` de cada subcarpeta):

1. **Sin `<text>` ni `@font-face`**: todo texto se dibuja como `<path>` con glifos de Computer Modern extraídos offline con `fontTools` (`sitio/compartido/glifos.js`, que escribe `herramientas/extraer_glifos.py`, y `sitio/compartido/glifos-tabla.js` para las tablas). PowerPoint ignora `@font-face` al convertir a formas. Poder usar dependencias externas no cambia esto: nada de fuentes web ni librerías cargadas por red dentro del SVG.
2. **Agrupamiento en dos niveles** pensado para «desagrupar una vez / dos veces» en PowerPoint. No añadir un `<g>` envolvente (ni para márgenes: se desplaza el `viewBox`).
3. **Fondo transparente**, sin `<rect>` de fondo blanco.
4. En las tablas: bordes como rectángulos rellenos (nada de `<line>` ni `stroke`), medidas redondeadas a enteros y `stroke` par.
5. Guardado con `Banco.guardarSVG` (`sitio/compartido/guardar-svg.js`): `showSaveFilePicker`, que recuerda la carpeta en la sesión, y respaldo `<a download>`. **Enter** en los campos numéricos guarda en todos los generadores (en valor-posicional, también en `#divisor`; en fracciones, también en «Forma del entero» y «Color de las partes»).
6. No quitar controles del DOM para ocultarlos: el script lee todos los ids al cargar.
7. Los trazos punteados (`stroke-dasharray`) y las formas huecas (`fill="none"`) **sobreviven** a «Convertir en forma»: el usuario lo confirmó en PowerPoint el 2026-09-26 con el generador de estrategias.
8. **Borde del material concreto, igual en todos los generadores**: blanco (`#FFFFFF`), 0.75 pt en la unidad y 1.05 pt en la decena y la centena. `numeros-dienes` lo escribe como 1 px / 1.4 px (su SVG está en px y PowerPoint toma 1 px = 0.75 pt); los generadores que dibujan en pt (`estrategias`) usan 0.75 / 1.05. Es un grosor absoluto: no se escala con el tamaño del cuadrito.

## Plataforma (GitHub Pages)

Objetivo: un solo sitio con una portada que enlace a todos los generadores. GitHub Pages sirve archivos estáticos tal cual, sin compilación.

**Está en línea** desde el 2026-09-26: https://nestor-a-lopez.github.io/generadores-didacticos/ (repositorio público `Nestor-A-Lopez/generadores-didacticos`, Pages con «Source: GitHub Actions»). Cada push a `main` lo vuelve a publicar.


- Portada: `sitio/index.html` + `sitio/style.css`, con una tarjeta por generador. Sale del diseño «Menú de generadores» de Vesta, pasado a HTML/CSS estáticos (sin React ni `_ds_bundle.js`), con los iconos de Lucide 0.544.0 incrustados como `<svg>` para que también funcione con doble clic y sin red. El pie lleva el enlace a la página «Licencia y avisos» (`sitio/licencia/index.html`, que usa la barra, el pie y los estilos de documento de `sitio/style.css`) y el del repositorio. Enlaza a `<carpeta>/index.html` (no a `<carpeta>/`) por lo mismo: con `file://` una carpeta no abre su `index.html`.
- Cada generador queda en `sitio/<carpeta>/`, así su URL es `…/generadores-didacticos/<carpeta>/`; `compartido/` se publica junto a ellos.
- Publicación: `.github/workflows/pages.yml` (en cada push a `main`, o a mano). Copia `sitio/` a `_site/`, borra de la copia los `CLAUDE.md` (y cualquier SVG suelto) y la publica con las acciones oficiales (`configure-pages`, `upload-pages-artifact`, `deploy-pages`), fijadas por commit con la versión en un comentario. Nada fuera de `sitio/` se publica. En GitHub hay que elegir «Settings → Pages → Source: GitHub Actions».
- **Los SVG generados no están en el repositorio** (se guardan en `_recursos/figuras/`) ni en el sitio. `*.svg`/`*.SVG` siguen en `.gitignore` por si alguno se guarda aquí por error.

## Pendientes

En este orden, y preguntando antes de mover o borrar:

1. **Vesta**: mantener sincronizada la copia local con el proyecto de claude.ai (`a1e3d138-2f59-4b09-a37b-bfefd2e094f5`; cómo se baja, en «Coordinación entre diseño y código»). Al 2026-09-28 coinciden en componentes, `readme.md` y `SKILL.md`; desde el 2026-09-26 ya coincidían en tokens con `--base10-*`, diapositivas, plantilla, UI kits, `reference-palette.png` y punto decimal (`Icon` carga Lucide 0.544.0 desde unpkg en los dos). Las diferencias son **a propósito**:
   - El namespace de los componentes: en claude.ai es `EntornoDesignSystem_a1e3d1` (lo usan los diseños ya hechos, como «Pantalla base 10»); en la copia local, `VestaDesignSystem_a1e3d1`. Se decidió (2026-09-28) **no** unificarlo: cambiar el del proyecto obligaría a actualizar a mano cada diseño de Claude Design que lo usa (están en otros proyectos, fuera del alcance de `DesignSync`), y un diseño olvidado se rompería; la diferencia solo cuesta el cambio de nombre en las tarjetas al bajarlas. Por eso **no** se suben `_ds_bundle.js`, `_ds_manifest.json` ni los `.jsx` desde la copia local, y los archivos que lo mencionan se suben con el nombre de claude.ai. Los cambios en `.jsx` se piden dentro del proyecto en claude.ai, aclarando que no cambie el namespace; cambiarlo recompila el bundle y rompe los diseños que usan el nombre viejo.
   - El `_ds_bundle.js` local es el del 2026-09-26: no trae los componentes nuevos, así que sus tarjetas no se ven en la copia local.

Hechos el 2026-09-27 y 28 (para no repetirlos): los nueve componentes de `forms` pedidos desde fracciones y valor-posicional (`SegmentedControl`, `ColorSwatchGroup`, `TextColorPicker`, `InputWithPrefix`, `SwitchMenu` + `SwitchGroup`, `NumberRow`, `OrderColorPicker` + `DEFAULT_ORDERS`, `ColorModeGrid` y `Switch` `size="sm"`) están en Vesta y en la copia local, con las correcciones pedidas después (punto decimal en el ejemplo de `NumberRow`, las dos exportaciones extra documentadas en `readme.md`, la etiqueta de `NumberRow` que cede ancho y el anillo de foco en los dos tamaños de `Switch`). `NumberRow`, `OrderColorPicker` y `ColorModeGrid` no tienen tarjeta propia: se ven en la de `forms`. Fracciones, valor-posicional y numeros-dienes ya se ajustaron a ellos sin cambiar la exportación; lo que se queda distinto a propósito está en el `CLAUDE.md` de fracciones (sección 9) y de valor-posicional.

## Cómo trabajar aquí

- Cambios quirúrgicos; reutilizar las funciones existentes en vez de duplicar lógica. Nada de reescrituras grandes sin pedirlo.
- Comentarios en **español**, explicando el porqué. Mantener la organización del script: constantes/metadatos → cálculo puro → `buildSVG` → UI/eventos al final.
- Si una instrucción es ambigua (a qué forma/fila/operación aplica, un caso límite), preguntar antes de asumir.
- **Verificar de verdad**: renderizar (en esta máquina no hay Playwright; sirve Edge sin interfaz, `msedge --headless=new --screenshot=salida.png file:///…`; para la interfaz con servidor, `python -m http.server` desde la raíz y abrir `http://localhost:8000/sitio/`), inspeccionar el SVG resultante, medir en píxeles, y simular la manipulación en PowerPoint (añadir `transform="translate(…)"` a un `<g>` y ver que se mueve lo que debe). Mirar la vista previa no alcanza.
- **Verificar la exportación**: antes y después de un cambio que no debía tocar las figuras, abrir `herramientas/verificar-svg.html` con un servidor local (`python -m http.server 8000` desde la raíz → http://localhost:8000/herramientas/verificar-svg.html; con doble clic no funciona) y comparar las dos corridas. Si el cambio sí debía cambiar alguna figura, solo deben cambiar esos casos; entonces se actualiza `verificar-svg-referencia.txt`.
- No mover, renombrar ni borrar SVG ya generados (en `_recursos/figuras/`) sin preguntar.
