# Vesta — Sistema de diseño

> **Nombre: Vesta.** Es el nombre definitivo del sistema. Todavía no existe logotipo: donde iría la marca se compone el nombre tipográficamente (ver «Logotipo» más abajo).

## Qué es Vesta

Un entorno digital para aprender **ciencias exactas** — matemáticas, física, electrónica y programación — dirigido a personas **de 12 años en adelante**, de la preadolescencia a la adultez. El producto se manifiesta en dos superficies y un formato de comunicación:

1. **Sitio público** (marketing + catálogo + vista previa de lección) — `ui_kits/website/`
2. **Aplicación de aprendizaje** (panel, lección con teoría/ejercicio/simulador, avance) — `ui_kits/app/`
3. **Mazo de diapositivas** para presentar el producto y el método — `slides/` y `templates/slide-deck/`

El rasgo que define el sistema: **una ecuación insertada en un titular nunca debe sentirse como un cuerpo extraño**. Todo — la elección de tipografías, el color, el ritmo — está subordinado a que texto y matemática convivan.

## Fuentes recibidas

| Fuente | Ruta en el proyecto | Qué aportó |
| --- | --- | --- |
| Paleta de Color Hunt `e3f2fd / 90caf9 / 2196f3 / 0d47a1` | `assets/reference-palette.png` (muestra propia de esos cuatro colores, no la captura de Color Hunt) | La rampa azul completa del sistema. |
| Ilustración de referencia (portada genérica con formas recortadas azules) | `assets/reference-landing-mood.jpg` | El **motivo de capas** y el contraste blanco/azul. Es una imagen de banco, **no** un activo de marca: no la uses en producción. No está en el repositorio público (licencia del banco de imágenes): solo existe en la copia local. |
| Notas de marca (tipografía, audiencia, tono) | Briefing en el chat | Fraunces / Poppins / STIX Two Math; audiencia 12+; mínimos de legibilidad. |

**No se recibió:** logotipo, marca gráfica, capturas del producto real, código, Figma, ni copy existente. Todo el texto de los kits y diapositivas es *copy de muestra* escrito siguiendo las reglas de la sección «Fundamentos de contenido»; revísalo antes de usarlo en producción.

---

## Fundamentos de contenido

**La voz.** Adulta y tranquila, nunca infantil, nunca académica. Vesta habla como alguien que sabe mucho y no necesita demostrarlo. Se permiten metáforas de registro adulto — amor, contemplación, historia, oficio — porque el lector de 12 años las entiende; lo que no se permite es el jerga sin explicar.

**Persona gramatical.** **Tú** al lector, siempre («puedes volver cuando quieras», «te quedan cuatro ejercicios»). **Nosotros** sólo cuando habla la organización («cómo enseñamos», «quitamos la fórmula del principio»). Nunca «el usuario», nunca «el alumno» dirigiéndose al alumno.

**Español de México.** Comillas angulares («») para citas. **Punto decimal** (`44.1 m`), coma para agrupar millares y apóstrofe entre periodos (`1'250,000`), como se enseña en clase. Espacio fino antes de unidades (`9.8 m/s²`).

**Casing.** Frase, siempre — títulos, botones, etiquetas de campo, encabezados de tarjeta. La **única** excepción es el cintillo de disciplina (`Física`, `Matemáticas`) y las etiquetas de sección, en versalitas con `letter-spacing: .12em`. Nunca un botón en mayúsculas.

**La regla del término técnico.** Toda palabra técnica se explica la primera vez que aparece, en el mismo lugar donde aparece: un `Callout tone="definition"` en la lección, un `hint` en un campo de formulario. No se asume formación previa ni siquiera para «variable», «aceleración» o «condensador».

**Cómo se nombra una lección.** Título corto, concreto y con un verbo o una pregunta implícita; nunca «Introducción a…» ni «Aprende a…».

> ✅ «Por qué parpadea un LED» · «Qué mide una pendiente» · «Bucles que terminan»
> ❌ «Introducción a los circuitos RC» · «Aprende a derivar en 5 pasos»

**Cómo se resume una lección.** Una sola frase, sin jerga, que dé una razón para entrar:

> «Un condensador que se llena, se vacía y vuelve a empezar.»
> «Toda repetición necesita una condición que algún día se cumpla.»

**Feedback de ejercicio — lo más delicado del sistema.** Tres estados, y ninguno juzga a la persona:

| Estado | Encabezado | Cuerpo |
| --- | --- | --- |
| Acierto | **Correcto** | Qué ha pasado, no qué bien lo has hecho: «44.1 metros. Al triplicar el tiempo, la altura se multiplica por nueve.» |
| Casi | **Casi** | Nombra **dónde mirar**: «El planteamiento es correcto; revisa las unidades del último paso.» |
| Fallo | **Todavía no** | Una pista, no la solución: «Fíjate en cómo crece la altura al doblar el tiempo.» |

Nunca «¡Incorrecto!», nunca «¡Genial!», nunca signos de exclamación apilados, nunca confeti.

**Emoji: no.** Ni en producto, ni en marketing, ni en diapositivas. El repertorio de símbolos de Vesta son los glifos matemáticos (`∫ Σ Δ π ½ ² ⁄ →`), que se componen en la familia matemática y **sí** se usan libremente.

**Longitudes.** Titular de página ≤ 8 palabras. Párrafo de lección ≤ 3 frases antes de un respiro (fórmula, nota o imagen). Etiqueta de botón ≤ 3 palabras, verbo primero.

---

## Fundamentos visuales

### Color

La rampa azul es el sistema entero; no hay segundo color de marca. `--blue-800 #0d47a1` es la tinta profunda (titulares invertidos, fondos plenos, barra lateral); `--blue-500 #2196f3` es el azul señal (foco, enlaces, barras de progreso); `--blue-200 #90caf9` y `--blue-50 #e3f2fd` son aire (superficies hundidas, fondos de fórmula). Los neutros llevan **una gota de azul** — nunca grises puros, que al lado de la rampa se ven sucios.

Máximo **dos fondos por pantalla o por mazo**: blanco y uno de {azul hundido, azul profundo}. Nunca tres.

### Tipografía

Tres familias con roles separados y sin solapamiento:

- **Fraunces** (`--font-serif-display`) — titulares. Serif variable de alto contraste, mismo registro clásico que la tipografía matemática. Eje óptico fijado por tamaño: `opsz 120–144` en display, `opsz 48` en títulos de tarjeta. Peso 600, `letter-spacing: -.02em`. Itálica sólo en citas.
- **Poppins** (`--font-sans`) — **todo lo funcional**: cuerpo, botones, etiquetas, formularios, feedback. Si es interfaz o es contenido corrido, es Poppins. Pesos 400/500/600.
- **STIX Two Math / New Computer Modern Math** (`--font-math`) — ecuaciones. Fija el motor de KaTeX/MathJax a una de estas dos, **no** a la Computer Modern por defecto. Las variables sueltas en medio de una frase (`g`, `t`) también van en esta familia, en itálica.

**Mínimos innegociables:** 16px de cuerpo de lectura, 14px de texto secundario, 12px sólo para cintillos en versalitas. En diapositivas, 19px. Contraste ≥ 4.5:1 en texto y ≥ 3:1 en titulares; nunca texto atenuado con `opacity` sobre fondos de color.

### Espacio y retícula

Base de 4px (`--space-1`). Dentro de un componente, pasos 2–6 (8–24px); entre bloques de página, 12–24 (48–96px). Contenedor máximo 1200px, canalón 48px. Medida de lectura 66ch; en columnas estrechas, 48ch.

### Fondos y motivo

El fondo por defecto es **blanco**. La profundidad viene del **motivo de capas**: formas orgánicas superpuestas, cada una un **plano de color liso** en un peldaño distinto de la rampa (`--radius-blob`). **Nunca degradados** — la referencia de marca es papel recortado, no luz. Las capas se sangran fuera del lienzo (esquinas, bordes) y quedan siempre detrás del texto, nunca bajo él.

Sin texturas, sin grano, sin patrones repetidos, sin fotografía de banco. Si hace falta imagen real (aula, montaje, laboratorio), pídela: el sistema no incluye ninguna.

### Bordes, radios y tarjetas

Nada es cuadrado y nada es una cápsula salvo las acciones. Radios: 4px casillas, 6px tooltips, 10px campos y bloques de fórmula, 16px tarjetas, 24px modales, 32px secciones grandes, `999px` botones y etiquetas.

Una tarjeta = fondo blanco + **borde de 1px** `--border-subtle` + **sombra `--shadow-sm`**. Borde y sombra siempre juntos; una sombra sin borde flota, un borde sin sombra se ve plano. La única franja de color lateral del sistema es la del `Callout` (3px); no la uses en tarjetas genéricas.

### Sombras

Cinco escalones, todos con tinte azul (`rgba(9,47,107,…)`) y difusos. `xs/sm` para reposo, `md` para elementos elevados, `lg` para hover de tarjeta clicable y toasts, `xl` sólo para modales. Sombras interiores: sólo el brillo superior `--shadow-inset` en superficies claras; nunca sombra interior como decoración.

### Movimiento

**Sin rebotes.** El movimiento acompaña, no celebra: `--ease-out` (entra rápido, se posa lento) por defecto. 140ms para tintes de hover y foco, 220ms para paneles y pestañas, 380ms para la barra de progreso y el despliegue del desarrollo, 700ms para escenas de simulador. Las transiciones de opacidad son fundidos limpios, sin escalados. `prefers-reduced-motion` anula todo (ya está en `tokens/base.css`).

### Estados

- **Hover:** el fondo se **oscurece un peldaño** en acciones sólidas (`--action-primary` → `--action-primary-hover`) y se **tiñe de azul claro** en las fantasma y contorneadas. Las tarjetas clicables suben 2px y pasan a `--shadow-lg`. Nunca se usa opacidad para el hover.
- **Press:** `translateY(1px)` y se retira la sombra. Sin escalado.
- **Foco:** anillo `--ring-focus` de 3px en `rgba(33,150,243,.35)`, visible sobre cualquier fondo. Jamás se elimina el foco.
- **Inactivo:** fondo `--neutral-100`, texto `--neutral-400`, sin borde ni sombra, cursor `not-allowed`.
- **Error:** borde `--red-500` + anillo `--ring-error`; el mensaje sustituye a la ayuda, nunca se apilan.

### Transparencia y desenfoque

Se usan en **dos sitios y sólo dos**: la cabecera pegajosa del sitio (`rgba(255,255,255,.88)` + `blur(10px)`) y el velo de los modales (`--surface-overlay`, azul profundo al 52% + `blur(3px)`). En ningún otro lugar hay vidrio esmerilado. El texto **nunca** se pone semitransparente; para bajar jerarquía se usa `--text-muted`, que es un color real.

### Disposición

La cabecera del sitio es pegajosa; la barra lateral de la app es fija; la columna auxiliar de la lección es `sticky` a 96px. No hay elementos flotantes sobre el contenido salvo el toast (abajo, centrado, 4s) y los modales.

---

## Iconografía

**Lucide**, trazo de 2px, esquinas redondeadas — cargado desde CDN (`unpkg.com/lucide-static@0.544.0`) y **teñido con `currentColor` mediante máscara CSS** en el componente `Icon`. No hay fuente de iconos propia ni sprite; no se entregó ninguno.

> ⚠️ **Sustitución declarada.** Las fuentes recibidas no contenían ningún sistema de iconos. Lucide es una elección nuestra por afinidad de trazo con la delicadeza de Fraunces. Si tenéis un set propio, sustituid el contenido de `components/core/Icon.jsx` y nada más cambiará.

Tamaños: **16** (en línea, dentro de texto o etiquetas), **20** (botones y navegación), **24** (feedback, cabeceras), **32** (vacíos y estados). Por encima de 32px ya no es icono, es ilustración.

Los iconos **nunca llevan color propio**: heredan el del contenedor. Los iconos de disciplina son fijos y no se intercambian: `sigma` (matemáticas), `atom` (física), `circuit-board` (electrónica), `terminal` (programación).

**Emoji: nunca.** **Caracteres Unicode como icono:** sólo los matemáticos (`∫ Σ Δ π ½ ² ⁄ → ×`), y siempre compuestos en `--font-math`, nunca en Poppins. **SVG a mano: no** — todo glifo sale de Lucide.

**Logotipo: no existe.** Donde iría la marca se compone el nombre en Fraunces 600 con un punto azul (`Vesta.`). Es un marcador de posición tipográfico, no una marca. Aportad el logotipo y sustituid `Wordmark` en `ui_kits/website/SiteChrome.jsx`, la barra lateral de `ui_kits/app/AppChrome.jsx` y `thumbnail.html`.

---

## Adiciones intencionales

No había fuente que definiera un inventario de componentes, así que se autoró el set estándar (Button, IconButton, Input, Select, Checkbox, Radio, Switch, Card, Badge, Tag, Tabs, Dialog, Toast, Tooltip). A eso se suman cinco piezas que el dominio exige y sin las cuales el sistema no cubre su producto:

| Adición | Por qué |
| --- | --- |
| `Icon` | Envoltorio del set de glifos; sin él cada consumidor inventaría su propio SVG. |
| `Formula` | Es *el* requisito del briefing: que la ecuación conviva con el titular. Fija la familia matemática y el tratamiento en bloque. |
| `AnswerFeedback` | El feedback de ejercicio tiene reglas de tono propias (tres estados, nunca juzga); dejarlo a un `Callout` genérico las perdería. |
| `LessonCard` | Unidad del catálogo y del panel; combina disciplina, resumen y progreso en una composición fija. |
| `ProgressTrack` / `StepIndicator` | El avance es contenido, no adorno: aparece en tarjeta, en lección, en panel y en informe. |
| `Field` | Contenedor de etiqueta + ayuda + error; es donde vive la regla de «explicar el término la primera vez». |

---

## Índice

### Raíz

| Archivo | Qué es |
| --- | --- |
| `styles.css` | **Punto de entrada único.** Sólo `@import`. Enlázalo y tendrás todos los tokens. |
| `readme.md` | Este documento. |
| `SKILL.md` | Envoltorio para usar el sistema como Agent Skill. |
| `thumbnail.html` | Miniatura del sistema. |

### Tokens — `tokens/`

`fonts.css` (familias + carga desde Google Fonts) · `colors.css` (rampa azul, neutros, semánticos, disciplinas) · `typography.css` (escala, interlineados, pesos, ejes ópticos) · `spacing.css` · `radius.css` · `elevation.css` · `motion.css` · `semantic.css` (alias: superficies, texto, bordes, interacción, feedback) · `base.css` (reset y defaults heredables).

### Componentes — `components/`

| Grupo | Componentes |
| --- | --- |
| `core/` | `Button` · `IconButton` · `Card` · `Badge` · `Tag` · `Icon` |
| `forms/` | `Field` · `Input` · `Select` · `Checkbox` · `Radio` · `Switch` |
| `feedback/` | `Callout` · `AnswerFeedback` · `Toast` · `Tooltip` · `Dialog` |
| `navigation/` | `Tabs` · `ProgressTrack` · `StepIndicator` |
| `learning/` | `Formula` · `LessonCard` |

Cada uno trae `.d.ts` (contrato de props) y `.prompt.md` (cuándo y cómo usarlo). Cada carpeta tiene su tarjeta de previsualización `*.card.html`.

### UI kits — `ui_kits/`

- `website/` — sitio público navegable: portada, catálogo, vista previa de lección. Ver su `README.md`.
- `app/` — entorno de aprendizaje navegable: acceso, panel, lección, avance. Ver su `README.md`.

### Diapositivas — `slides/`

Ocho tipos a 1280×720 (`TitleSlide`, `SectionSlide`, `ConceptSlide`, `FormulaSlide`, `ComparisonSlide`, `DataSlide`, `QuoteSlide`, `ClosingSlide`) + `README.md` con las reglas del mazo.

### Plantillas — `templates/`

- `slide-deck/SlideDeck.dc.html` — mazo completo de seis diapositivas listo para copiar en un proyecto consumidor.

### Fundamentos visibles — `guidelines/`

17 tarjetas de especimen que pueblan la pestaña Design System, agrupadas en **Colors**, **Type**, **Spacing** y **Brand**.

### Activos — `assets/`

`reference-palette.png` y `reference-landing-mood.jpg`: las dos referencias entregadas, guardadas como procedencia (el `.jpg` solo en la copia local; no se sube a GitHub por su licencia). `reference-palette.png` se rehízo el 2026-09-26 como muestra propia de los cuatro colores, en franjas iguales, para no redistribuir la captura de Color Hunt. **No hay logotipo ni imágenes de producto.**
