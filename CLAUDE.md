# Banco didáctico — generadores de material en SVG

Generadores de figuras matemáticas para clase (fracciones, material base 10, tablas de valor posicional, rectas numéricas, estrategias de cálculo). Cada generador es una aplicación web: se abre en el navegador, se configura con controles y se guarda un SVG.

**Destino final de todo SVG: PowerPoint.** El SVG se pega en una diapositiva y se usa «Convertir en forma» para editarlo. Un SVG que se ve bien en el navegador pero falla en ese flujo está mal. Casi todos los bugs corregidos en este repo solo aparecían al convertir a formas.

**Destino final de los generadores: una sola plataforma web publicada en GitHub Pages** (ver «Plataforma» abajo).

## Decisiones vigentes

1. **Todo se desarrolla en HTML/CSS/JS.** LaTeX/TikZ quedó retirado: ya no hay `.tex`, no se compila nada y no se convierte de PDF a SVG. Si aparece un `.tex` o una carpeta `temp/`, es un resto que se puede eliminar (preguntando antes).
2. **Cada generador son tres archivos propios**: un HTML, un CSS y un JS, y además carga lo que está en `compartido/` (ver «Arquitectura de un generador» y «Carpeta compartida»). Los generadores actuales todavía son de un solo archivo; separarlos es un pendiente. Los `CLAUDE.md` de las subcarpetas describen el estado de un solo archivo hasta que se separe cada uno: al separarlo, actualizar también su `CLAUDE.md`.
3. **Se permiten dependencias externas** en la aplicación (librerías por CDN, fuentes, iconos). Lo que **no** cambia: el SVG exportado sigue siendo autosuficiente (ver «Reglas transversales»).

## Arquitectura de un generador

```
<carpeta-del-generador>/
├── index.html    ← estructura y controles; enlaza los otros dos
├── style.css     ← estilos propios de la interfaz (los tokens vienen de compartido/vesta.css)
└── script.js     ← toda la lógica (constantes, GLYPH_DATA, cálculo, buildSVG, UI)
```

- `index.html` porque GitHub Pages sirve `…/fracciones/` directamente, sin escribir el nombre del archivo.
- El JS se carga como **script clásico**: `<script src="script.js" defer></script>`. **No** usar `type="module"` ni `fetch()` de archivos locales (por ejemplo, cargar `GLYPH_DATA` desde un `.json`): Chrome y Edge los bloquean al abrir el HTML con doble clic (`file://`), y la herramienta tiene que seguir funcionando así. Si algún día se necesitan módulos, se trabaja con un servidor local (`python -m http.server`) y se documenta aquí.
- Dependencias externas: por CDN (cdnjs, jsDelivr, Google Fonts) y **con versión fija** en la URL. Sin internet la interfaz puede degradarse, pero el SVG exportado no debe depender de nada externo.
- **Cómo separar un generador de un solo archivo:** mover el contenido de `<style>` a `style.css` y el de `<script>` a `script.js` **sin cambiar lógica**; conservar todos los ids del DOM. Antes de dar por terminada la separación, comprobar que el SVG exportado es **idéntico byte a byte** al de la versión anterior en varios casos representativos (así se validó el rediseño de fracciones y de la tabla de valor posicional).

## Carpeta compartida

`compartido/` (en la raíz del repo) guarda lo que usan **dos o más** generadores, para no repetirlo en cada uno:

```
compartido/
├── vesta.css        ← tokens de Vesta que usan las interfaces (colores, radios, sombras, tipografía, movimiento)
├── glifos.js        ← GLYPH_DATA de Computer Modern (lo genera fracciones/_extraer_glifos.py)
└── guardar-svg.js   ← showSaveFilePicker + respaldo <a download> + Enter para guardar
```

(Los nombres son la propuesta inicial; se crean al separar el primer generador que los necesite.)

- Cada `index.html` los carga **antes** que los suyos, con rutas relativas: `<link rel="stylesheet" href="../compartido/vesta.css">` antes de `style.css`, y `<script src="../compartido/glifos.js" defer></script>` antes de `script.js`. Los generadores que están un nivel más abajo (`tabla-valor-posicional/operaciones/`) usan `../../compartido/`.
- Mismas reglas que `script.js`: scripts clásicos, sin `type="module"` ni `fetch()`, para que todo siga funcionando con doble clic.
- Los scripts clásicos comparten el ámbito global: lo compartido se expone en **un solo objeto**, `window.Banco` (por ejemplo, `Banco.GLYPH_DATA`, `Banco.guardarSVG(...)`), para no chocar con nombres de los generadores.
- Solo entra en `compartido/` lo que es **idéntico** en dos o más generadores. Si un generador necesita una variante (por ejemplo, otro subconjunto de glifos), se queda en su `script.js` hasta que se decida unificar.
- **Un cambio en `compartido/` afecta a todos los generadores que lo cargan.** Antes de darlo por terminado, comprobar en **cada uno** que el SVG exportado sigue idéntico byte a byte (o que cambia solo donde se buscaba) y que la interfaz se ve bien.
- Consecuencia aceptada: una carpeta de generador ya no funciona sola; para usarla fuera del repo hay que llevar también `compartido/`.

## Mapa de carpetas

| Carpeta | Generador (estado actual) | Instrucciones propias |
| --- | --- | --- |
| `fracciones/` | `generador_fracciones.html` (círculo, rectángulo, triángulo) | `fracciones/CLAUDE.md` |
| `fracciones/_desing-system-vesta/` | Sistema de diseño **Vesta** (no es un generador; ver abajo) | `SKILL.md`, `readme.md` |
| `tabla-valor-posicional/tabla-valor-posicional/` | `_generador-tabla-valor-posicional.html` | su `CLAUDE.md` |
| `tabla-valor-posicional/operaciones/` | `_operaciones-tabla-valor-posicional.html` (suma, resta, multiplicación, división) | su `CLAUDE.md` |
| `numeros-material/` | `_generador-numeros-material.html` (material base 10: unidades, decenas, centenas) | — |
| `estrategias/` | `estrategias.html` (completar la decena en suma y resta; en la resta, pestaña «Distancia entre dos números»: recta numérica + material + ecuación) | — |
| `recta-numerica/` | `recta-numerica.html` (extremos, paso y separación entre marcas) | — |
| `compartido/` | (por crear) Tokens, glifos y guardado que usan varios generadores; ver «Carpeta compartida» | — |
| `_respaldo-marca-x/` | Respaldo del design system anterior «Marca X», ya eliminado de claude.ai. Solo referencia; no usar como fuente de diseño | — |

Convención actual: el archivo generador lleva prefijo `_` para que quede arriba de la lista de SVG en el explorador. Con la arquitectura de tres archivos pasa a llamarse `index.html`. Los `_contexto.md` y `_prompt.md` son los contextos que se usaron en el chat de Claude; su contenido ya está en los `CLAUDE.md` de cada subcarpeta.

## Nombres de archivo de los SVG

Los SVG se guardan junto a su generador, en la misma carpeta. El nombre describe el contenido, sin prefijo de carpeta ni de tipo de figura.

| Generador | Formato | Ejemplos |
| --- | --- | --- |
| Fracciones | `[numerador]-[denominador]-[color].svg`, en la subcarpeta de la forma (`circulo/`, `rectangulo/`, `triangulo/`) | `3-4-verde.svg`, `0-6-azul.svg` |
| Tabla de valor posicional | `[Orden]-[Número].svg`; millares separados con `-`, punto decimal tal cual; varios números unidos con `+`; tabla en blanco → `vacia.svg` (en la carpeta hay un `U-vacia.svg`) | `U-950-000.svg`, `mil-9-673.svg`, `U-0.37+U-0.370.svg`, `U-427..svg` (punto sin dígitos después) |
| Operaciones | `[A\|S\|M\|D]-[operando]-[operando]….SVG` (extensión en **mayúsculas**, así la genera `buildFilename()`); cada operando en unidades reales | `A-0.15-0.028.SVG`, `S-8750-2300.SVG` |
| Números con material | El HTML sugiere `numero-N.svg`, pero los archivos guardados llevan un prefijo con los órdenes: `U-` (todo en unidades), `DU-`, `CDU-` | `U-36.svg`, `DU-36.svg`, `CDU-427.svg` |
| Completar decena (`estrategias`) | `[A]+[b].svg` (suma) / `[A]-[b].svg` (resta) | `28+5.svg`, `51-7.svg` |
| Distancia entre números (`estrategias`) | `[A]-[b].svg`; sufijo `-sin-material` cuando el interruptor «Material sobre la recta» está apagado | `100-19.svg`, `10-3-sin-material.svg` |
| Recta numérica | `[Inicio]-[Final]-[Paso].svg`, con los valores tal como se escriben | `-5-5-1.svg`, `0-1-0.1.svg` |

Los códigos de orden son `U D C UM DM CM UMM…` para enteros y `dec cen mil` (tres letras) para decimales. No hay que inventar un formato nuevo: si un generador tiene `buildFilename()`, ese es el formato.

## Colores de las figuras

- Material base 10 (fijos; los alumnos ya los asocian con el material físico): unidad `#57A639` (verde), decena `#1C75BC` (azul), centena `#CC2027` (rojo). Son tokens de Vesta: `--base10-unidad`, `--base10-decena`, `--base10-centena`. Son los únicos colores de figura que viven en el sistema de diseño.
- Fracciones: `morado #8080F0`, `azul #2ED9D9`, `naranja #f48600`, `rojo #E8384F`, `verde #7CBF33`, `amarillo #ffd500` (`COLORS` de `generador_fracciones.html`).
- Ninguna paleta de figuras se «armoniza» con la rampa azul de Vesta. La de fracciones no está en Vesta.

## Sistema de diseño «Vesta»

- **Fuente de verdad:** el Design System «Vesta» en claude.ai (https://claude.ai/artifact/JvA5Su73jS88dP5j3KvL3B). La copia local está en `fracciones/_desing-system-vesta/` (la carpeta conserva la errata «desing»).
- Es la fuente de la **interfaz** de los generadores, no de las figuras. Antes de rediseñar una interfaz, leer su `readme.md` (reglas de contenido y visuales) y los tokens en `tokens/*.css`.

Cómo se aplica en este repo:

- Los generadores **no** cargan `styles.css`, `_ds_bundle.js` ni componentes React. Los tokens que usan las interfaces (colores, radios, sombras, tipografía, movimiento) viven en `compartido/vesta.css`; el `style.css` de cada generador solo tiene sus estilos propios y usa esos tokens con `var(--…)`.
- Tipografía de la interfaz: **Fraunces** (títulos) + **Poppins** (todo lo demás), por Google Fonts.
- Rampa azul `--blue-50 … --blue-950`, neutros con tinte azul, botones en cápsula (`999px`), tarjetas = borde 1px + `--shadow-sm`, avisos con el estilo `Callout`, foco con `--ring-focus`. Sin degradados, sin emoji, sin rebotes.
- **Idioma y números:** español de México con la convención de clase: punto decimal, coma de millares y apóstrofe entre periodos, tanto en las figuras como en la interfaz (el `readme.md` de Vesta ya lo dice así desde el 2026-09-26).

Coordinación entre diseño y código:

- Los cambios de diseño (colores, tipografía, componentes, pantallas) se hacen en Vesta, en claude.ai, y de ahí se bajan a la copia local y a `compartido/vesta.css`. No inventar colores ni estilos nuevos directamente en un generador.
- Si al programar surge un componente reutilizable nuevo, se sube a Vesta con `/design-sync` (un componente a la vez, sin reemplazar el sistema completo).

## Reglas transversales para el SVG exportado

Aplican a todos los generadores (el detalle y el porqué están en el `CLAUDE.md` de cada subcarpeta):

1. **Sin `<text>` ni `@font-face`**: todo texto se dibuja como `<path>` con glifos de Computer Modern extraídos offline con `fontTools` (`GLYPH_DATA` incrustado en el script; `fracciones/_extraer_glifos.py`). PowerPoint ignora `@font-face` al convertir a formas. Poder usar dependencias externas no cambia esto: nada de fuentes web ni librerías cargadas por red dentro del SVG.
2. **Agrupamiento en dos niveles** pensado para «desagrupar una vez / dos veces» en PowerPoint. No añadir un `<g>` envolvente (ni para márgenes: se desplaza el `viewBox`).
3. **Fondo transparente**, sin `<rect>` de fondo blanco.
4. En las tablas: bordes como rectángulos rellenos (nada de `<line>` ni `stroke`), medidas redondeadas a enteros y `stroke` par.
5. Guardado con `showSaveFilePicker` (recuerda la carpeta en la sesión) y respaldo `<a download>`; **Enter** en los campos numéricos guarda.
6. No quitar controles del DOM para ocultarlos: el script lee todos los ids al cargar.
7. Los trazos punteados (`stroke-dasharray`) y las formas huecas (`fill="none"`) **sobreviven** a «Convertir en forma»: el usuario lo confirmó en PowerPoint el 2026-09-26 con `estrategias.html`.
8. **Borde del material concreto, igual en todos los generadores**: blanco (`#FFFFFF`), 0.75 pt en la unidad y 1.05 pt en la decena y la centena. `_generador-numeros-material.html` lo escribe como 1 px / 1.4 px (su SVG está en px y PowerPoint toma 1 px = 0.75 pt); los generadores que dibujan en pt (`estrategias.html`) usan 0.75 / 1.05. Es un grosor absoluto: no se escala con el tamaño del cuadrito.

## Plataforma (GitHub Pages)

Objetivo: un solo sitio con una portada que enlace a todos los generadores. GitHub Pages sirve archivos estáticos tal cual, sin compilación.

- Portada: `index.html` en la raíz del repo, con una tarjeta por generador (diseñada con Vesta).
- Cada generador queda en su carpeta con sus tres archivos, así su URL es `…/<carpeta>/`; `compartido/` se publica junto a ellos.
- **Los SVG generados NO se publican** en GitHub Pages. El sitio se publica con un flujo de GitHub Actions que copia al sitio solo los `index.html`, `style.css` y `script.js` y la carpeta `compartido/`, en lugar de publicar la rama completa. Por lo mismo, `_desing-system-vesta/`, `_respaldo-marca-x/` y los `CLAUDE.md` tampoco se publican. Ojo: si el repositorio es público, los SVG siguen visibles en GitHub aunque no estén en el sitio.

## Pendientes

En este orden, y preguntando antes de mover o borrar:

1. **Limpieza**
   - `tabla-valor-posicional/operaciones/Claude outputs/generador-tabla-valor-posicional-INTEGRADO.html`: versión intermedia; comparar con el generador vigente y eliminar si no aporta nada.
   - `_contexto.md` y `_prompt.md` de cada subcarpeta: ya están en los `CLAUDE.md`; se pueden eliminar.
   - `fracciones/triangulo/`: la carpeta quedó vacía al quitar el `.tex`.
   - `_respaldo-marca-x/`: eliminar cuando ya no se necesite como referencia.
   - `textColorFor` en fracciones: función sin uso.
   - Comentarios que todavía dicen «Entorno» en `estrategias.html` y `recta-numerica.html`: cambiarlos a «Vesta».
2. **Separar cada generador en tres archivos** (uno por uno, con la comprobación byte a byte), moviendo a `compartido/` lo que ya esté repetido en otro generador separado.
3. **Montar la plataforma**: portada, estructura final de carpetas y publicación en GitHub Pages.
4. **Vesta**: mantener sincronizada la copia local con la de claude.ai. En la de claude.ai el componente `Icon` carga Lucide desde jsDelivr; la copia local sigue usando unpkg (misma versión).

## Cómo trabajar aquí

- Cambios quirúrgicos; reutilizar las funciones existentes en vez de duplicar lógica. Nada de reescrituras grandes sin pedirlo.
- Comentarios en **español**, explicando el porqué. Mantener la organización del script: constantes/metadatos → cálculo puro → `buildSVG` → UI/eventos al final.
- Si una instrucción es ambigua (a qué forma/fila/operación aplica, un caso límite), preguntar antes de asumir.
- **Verificar de verdad**: renderizar (en esta máquina no hay Playwright; sirve Edge sin interfaz, `msedge --headless=new --screenshot=salida.png file:///…`), inspeccionar el SVG resultante, medir en píxeles, y simular la manipulación en PowerPoint (añadir `transform="translate(…)"` a un `<g>` y ver que se mueve lo que debe). Mirar la vista previa no alcanza.
- No mover, renombrar ni borrar SVG ya generados sin preguntar.
