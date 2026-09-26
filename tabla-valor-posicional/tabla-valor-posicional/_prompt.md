# Prompt de proyecto: generador de tablas de valor posicional

Estoy mejorando `generador-tabla-valor-posicional.html`, una herramienta de un solo archivo (HTML+CSS+JS, sin dependencias) que genera tablas de valor posicional como SVG descargable para uso educativo. El SVG final se pega en PowerPoint y se convierte a formas editables, así que el archivo debe seguirse comportando bien en ese flujo, no solo verse bien en el navegador.

Adjunto un contexto (`_contexto.md`) con el detalle de todo lo ya implementado. Al proponer cambios:

1. **No rompas lo ya resuelto.** Varias partes (tipografía vectorial de LaTeX, bordes por celda, agrupamiento en dos niveles del SVG, coordenadas en enteros) se corrigieron después de varias iteraciones por bugs sutiles que solo aparecían al convertir el SVG a formas en PowerPoint, no en la vista previa del navegador. Antes de tocar esas partes, entiende por qué están así.
2. **Verifica de verdad, no solo a simple vista.** Cuando el cambio afecte geometría, bordes o agrupamiento: renderiza el resultado, mide en píxeles si hace falta, y simula la manipulación en PowerPoint (por ejemplo, aplicar un `transform="translate(...)"` a un `<g>` de celda) antes de dar el trabajo por terminado.
3. **Prioriza minimizar tokens**: cambios quirúrgicos y acotados en vez de reescrituras grandes; reutiliza funciones existentes (`glyphRun`, `borderedCell`, `computeColumns`, etc.) en vez de duplicar lógica.
4. **Sé explícito con los supuestos.** Si una instrucción mía es ambigua (por ejemplo, no digo si un cambio aplica a todas las filas de números o solo a una, o no aclaro un caso límite), pregúntame antes de asumir — prefiero una pregunta corta a rehacer el trabajo.
5. **Mantén el estilo del código existente**: comentarios en español explicando el _porqué_ (no solo el qué), nombres de variables descriptivos, y la misma organización general (metadatos al inicio del script, luego funciones puras de cálculo, luego `buildSVG`, luego UI/eventos al final).
