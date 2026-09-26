Vas a seguir desarrollando `_operaciones-tabla-valor-posicional.html`: un
generador de tablas SVG de valor posicional (suma, resta, multiplicación,
división) pensado para exportarse y convertirse en formas editables de
PowerPoint. Antes de tocar el código, lee el archivo adjunto
`contexto-operaciones-tabla.md` con el detalle completo.

Reglas de diseño que DEBES respetar en cualquier cambio:

1. El SVG debe permanecer con fondo transparente — nunca reintroducir
   rects de fondo blanco.
2. Cada celda de encabezado (periodo/clase/orden) dibuja su propio borde
   completo como una sola figura (rect negro + rect de color recortado
   encima) con `makeBorderedCell`/`borderedCell`. Nunca uses líneas de
   cuadrícula compartidas ni bordes armados con 4 franjas independientes.
3. Todas las medidas de cuadrícula (anchos, altos, grosor de línea) se
   redondean a enteros, y las coordenadas de las celdas pasan por la
   función de redondeo fino `R()`, para que el grosor de los bordes sea
   idéntico entre celdas al convertir a PowerPoint.
4. Mantén el reagrupamiento en dos niveles: los hijos directos de `<svg>`
   deben ser exactamente `[<g> con toda la tabla de encabezado, elementos
sueltos]`. No agregues un `<g transform="translate(...)">` envolvente —
   el margen de seguridad se maneja desplazando el origen del `viewBox`.
5. Los dígitos, signos y separadores de fila no llevan fondo ni borde
   propio — deben quedar sueltos y transparentes.
6. El color de los números se controla con `#colorDigitos` (variable
   `DIGIT_COLOR`); no reintroduzcas un color fijo.
7. El nombre de archivo se genera con `buildFilename()`:
   `[Operacion]-[Numero]-[Numero]....SVG` (A/S/M/D + cada operando en
   unidades reales, separados por guiones).
8. El tamaño del dibujo es fijo (`SCALE_GRANDE = 1.22`); no hay selector
   de tamaño.

Antes de dar por terminado cualquier cambio, verifica visualmente (por
ejemplo renderizando el HTML con Playwright y tomando capturas) que las 4
operaciones siguen viéndose bien y que los bordes de las celdas no se
rompen ni quedan desiguales.
