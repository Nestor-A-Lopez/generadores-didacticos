# UI kit — Sitio público de Vesta

Recreación navegable del sitio de marketing. Tres pantallas en un solo `index.html`:

| Pantalla | Archivo | Qué muestra |
| --- | --- | --- |
| Portada | `HomeScreen.jsx` | Héroe con el motivo de capas, las cuatro disciplinas, el método en tres pasos, lecciones destacadas y cierre en azul profundo. |
| Catálogo | `CatalogScreen.jsx` | Buscador, filtros por disciplina (`Tag`) y rejilla de `LessonCard`. |
| Vista previa de lección | `LessonPreviewScreen.jsx` | Pestañas Teoría / Ejercicios / Simulador, ejercicio con `AnswerFeedback` real y barra lateral de avance. |

`SiteChrome.jsx` aporta la cabecera pegajosa, el pie, el wordmark tipográfico, el motivo de capas (`LayerMotif`) y los ayudantes de sección (`Section`, `Eyebrow`, `Display`).

Todos los primitivos vienen del bundle del sistema (`window.VestaDesignSystem_a1e3d1`); el kit no reimplementa ninguno.

**Nota:** no se entregó ningún logotipo. El wordmark es el nombre compuesto en Fraunces con un punto azul — un marcador de posición, no una marca.
