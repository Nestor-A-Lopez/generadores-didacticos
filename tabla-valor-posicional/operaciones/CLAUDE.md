# Generador de operaciones con valor posicional — `_operaciones-tabla-valor-posicional.html`

Generador de tablas SVG de valor posicional para suma, resta, multiplicación y división, pensado para exportarse y convertirse en formas editables de PowerPoint. Proyecto hermano: `../tabla-valor-posicional/` (misma tipografía, bordes y agrupamiento). Las convenciones generales del repo están en el `CLAUDE.md` de la raíz.

## Reglas de diseño obligatorias

1. **Fondo transparente**: nunca reintroducir rects de fondo blanco.
2. Cada celda de encabezado (periodo/clase/orden) dibuja su **propio borde completo como una sola figura** (rect negro + rect de color recortado encima) con `makeBorderedCell`/`borderedCell`. Nunca líneas de cuadrícula compartidas ni bordes de 4 franjas independientes.
3. Todas las medidas de cuadrícula (anchos, altos, grosor) se **redondean a enteros** y las coordenadas de las celdas pasan por `R()`, para que el grosor de los bordes sea idéntico entre celdas al convertir a PowerPoint.
4. **Agrupamiento en dos niveles**: los hijos directos de `<svg>` son exactamente `[<g> con toda la tabla de encabezado, elementos sueltos]`. Nada de `<g transform="translate(...)">` envolvente: el margen se maneja desplazando el origen del `viewBox`.
5. Dígitos, signos y separadores de fila **sin fondo ni borde propio**: sueltos y transparentes.
6. El color de los números sale de `#colorDigitos` (variable `DIGIT_COLOR`); no reintroducir un color fijo.
7. Nombre de archivo con `buildFilename()`: `[Operacion]-[Numero]-[Numero]....SVG` (A/S/M/D + cada operando en unidades reales, separados por guiones).
8. Tamaño del dibujo fijo (`SCALE_GRANDE = 1.22`); no hay selector de tamaño.

Antes de dar por terminado un cambio, verificar visualmente (por ejemplo, renderizando con Playwright y tomando capturas) que las 4 operaciones se siguen viendo bien y que los bordes de las celdas no se rompen ni quedan desiguales. Cambios quirúrgicos, comentarios en español que expliquen el porqué, y preguntar ante la ambigüedad.

---

# Contexto técnico


## 1. Qué es

Generador de tablas de valor posicional en **SVG** para las 4 operaciones
básicas (suma, resta, multiplicación, división), pensado para **exportarse y
convertirse en formas editables dentro de PowerPoint**. El usuario configura
la operación y sus números en una interfaz HTML, y la app dibuja el
algoritmo vertical clásico (encabezado de columnas + números apilados) como
un SVG descargable.

## 2. Funcionalidades de cara al usuario

- **Selector de operación**: suma, resta, multiplicación, división
  (`#operacion`).
- **Hasta qué orden mostrar** (`#hastaOrden`): desde Decenas de unidad hasta
  Centenas de millar de millón. Determina cuántas columnas C/D/U/dec/cen/mil
  aparecen.
- **Filas de encabezado configurables**:
  - Fila de **órdenes** (C/D/U/dec/cen/mil): siempre visible.
  - Fila de **clases** (Unidades, Millares, Millones…): toggle
    `mostrarClase`.
  - Fila de **periodos** (Primer periodo, Segundo periodo…): toggle
    `mostrarPeriodos`, solo aplica si hay más de un periodo.
- **Términos por operación**:
  - Suma: número variable de sumandos (`state.sumandos`, array).
  - Resta: un minuendo + número variable de sustraendos
    (`state.sustraendos`, array).
  - Multiplicación: multiplicando (admite decimales) × multiplicador (debe
    ser entero).
  - División: dividendo, divisor de un solo dígito, con toggle
    `mostrarPasos` que muestra las filas de la resta parcial y el residuo, y
    un texto "Resto: N" cuando sobra algo.
  - Cada término tiene `digits` (dígitos tal cual los escribe el usuario,
    puede incluir un punto decimal) y `jerarquia` (a qué orden corresponden
    esos dígitos: C/D/U/dec/cen/mil…). El valor real en unidades se calcula
    escalando por `10^NIVEL[jerarquia]`.
- **Fila de resultado** (suma/resta/multiplicación): toggle
  `mostrarResultado`, con `resultJerarquia` para elegir en qué jerarquía se
  expresa.
- **Comas y puntos decimales**: `mostrarComas`, `mostrarPuntoResultado`,
  `mostrarPuntoProductos` — se dibujan en rojo (`COLORS.C`).
- **Color de los números**: selector de color (`#colorDigitos`) que pinta
  todos los dígitos, signos (+/−/×) y el divisor. Variable interna
  `DIGIT_COLOR` (antes era una constante negra fija `BLACK`).
- **Tamaño del dibujo**: fijo, ya no es seleccionable por el usuario. Se usa
  siempre `SCALE_GRANDE = 1.22` (antes había un selector Normal/Grande/Extra
  que fue eliminado).
- **Descarga**: botón que genera el SVG y lo descarga con nombre automático
  (ver sección de nomenclatura).

## 3. Nomenclatura automática del archivo (`buildFilename()`)

Formato: **`[Operacion]-[Numero]-[Numero]....SVG`**

- `Operacion` es una sola letra: `A` (suma), `S` (resta), `M`
  (multiplicación), `D` (división).
- Aparece un `[Numero]` por cada término involucrado (ej. una resta con 2
  sustraendos genera 3 números: minuendo y cada sustraendo).
- Cada número se expresa en **unidades reales** (aplicando la jerarquía de
  ese término), no en los dígitos tal cual se escribieron.
- Ejemplos: `A-436-523.SVG`, `S-950-436-100.SVG`, `M-2.31-24.SVG`,
  `D-93-4.SVG`.
- Función clave: `termToUnitValueStr(digits, jerarquia)` +
  `shiftedDigitsToStr(digits, shift)`.

## 4. Diseño interno del SVG (crítico — no romper esto)

Estas decisiones se tomaron después de varias iteraciones para que el SVG
se comporte bien al convertirlo a formas editables en PowerPoint. Cualquier
cambio futuro debe preservarlas:

1. **Fondo transparente**: no hay ningún `<rect>` de fondo blanco en
   ninguna parte del SVG. El lienzo es transparente salvo las figuras
   dibujadas.
2. **Reagrupamiento en dos niveles**: los hijos directos del `<svg>` son
   exactamente `[<g> con toda la tabla de encabezado, elementos sueltos]`.
   - Al desagrupar una vez en PowerPoint: se separa el encabezado completo
     (periodos+clases+órdenes) como UNA sola figura, de los números/signos/
     líneas (que ya están sueltos desde el inicio).
   - Al desagrupar el grupo del encabezado una segunda vez: se separa
     celda por celda (cada celda de periodo/clase/orden, con su fondo+
     borde+etiqueta juntos en su propio `<g>`).
   - El margen de seguridad contra recorte por antialiasing se logra
     desplazando el **origen del viewBox** (`viewBox="-PAD -PAD outW
     outH"`), **nunca** envolviendo el contenido en un
     `<g transform="translate(...)">`, porque eso añadiría un nivel extra
     de agrupación y rompería el diseño de "2 desagrupados".
3. **Bordes de celda autocontenidos** (`makeBorderedCell` / `borderedCell`):
   cada celda de periodo/clase/orden dibuja su propio borde completo como
   UNA sola figura — un rect negro de fondo + un rect de color encima,
   recortado hacia adentro exactamente `stroke` (o `stroke/2` en fronteras
   compartidas). Nunca se vuelve a la técnica antigua de líneas de
   cuadrícula compartidas ni de 4 franjas independientes por lado — eso
   generaba grosor desigual al convertir a PowerPoint y bordes rotos al
   separar una celda.
4. **Redondeo a enteros**: todas las medidas de cuadrícula (`colW`,
   `letterH`, `rowH`, `periodH`, `claseH`, `divisorW`, `stroke`) se
   redondean con `Math.round` antes de usarse, y las coordenadas de cada
   celda pasan además por la función de redondeo fino `R()`. `stroke`
   siempre se fuerza a ser un entero par ≥ 2. Esto evita que distintas
   celdas caigan en posiciones de sub-píxel distintas y que PowerPoint
   redondee cada borde de forma distinta.
5. **Números sueltos y sin fondo**: los dígitos, signos, comas y puntos
   decimales no tienen fondo ni celda propia — quedan sueltos y
   transparentes desde el inicio, para poder moverse cada uno por
   separado en PowerPoint.
6. **Líneas auxiliares**: los separadores punteados entre filas de números
   (`dashedSeparator`) y la línea sólida sobre la fila de resultado
   (`row.lineAbove`) son simples rects sueltos, no parte del sistema de
   celdas con borde.
7. **División**: además de lo anterior, dibuja una galera (barra horizontal
   + barra vertical, sueltas) y el dígito del divisor a la izquierda de la
   galera.

## 5. Mapa rápido de funciones y constantes clave

- `renderTable(rows, maxPow, minPow, scale, opts)` — arma el SVG de suma,
  resta y multiplicación (todas comparten esta función).
- `buildDivision(...)` — arma el SVG de división (misma lógica de
  encabezado, distinta disposición de filas por la galera).
- `makeBorderedCell(gridLeft, gridRight, stroke, lineColor)` → devuelve
  `borderedCell(x0, y0, w, h, fillColor)`: dibuja una celda con borde
  autocontenido.
- `R(n)`: redondeo fino a 3 decimales, para que fronteras compartidas
  coincidan exactamente.
- `glyphRun(...)`: dibuja texto como paths vectoriales (glifos), no
  `<text>`, para que se conviertan bien a formas en PowerPoint.
- `termToUnitValueStr` / `shiftedDigitsToStr`: convierten dígitos+jerarquía
  al valor real en unidades (usado en el nombre del archivo).
- `DIGIT_COLOR`: variable (no constante) con el color actual de los
  números, reasignada en cada render desde `#colorDigitos`.
- `SCALE_GRANDE = 1.22`: único factor de escala usado (ya no hay selector).
- Tamaños de letra: `fPeriod = 15*scale`, `fClase = 13.5*scale`,
  `fHeader = 46*scale` (fila de órdenes), `fDigit = 42*scale`.
- `NIVEL`: mapa de código de jerarquía (C/D/U/dec/cen/mil…) a su potencia
  de 10.

## 6. Cómo se verificó todo esto

Cada cambio de diseño se validó renderizando el archivo con Playwright
(headless Chromium): capturas de pantalla de las 4 operaciones, inspección
del SVG resultante (búsqueda de `fill="#ffffff"` residual, medición de
coordenadas de rects de borde para confirmar que coinciden entre celdas
vecinas), y una simulación de "separar una celda" (agregando
`transform="translate(...)"` a su `<g>` y renderizando a alta resolución)
para confirmar que el borde queda completo y de grosor uniforme en sus 4
lados.
