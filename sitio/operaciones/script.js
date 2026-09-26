const GLYPH_DATA = Banco.GLYPH_DATA_TABLA; // compartido/glifos-tabla.js

// ---- Glifos vectoriales reales de Computer Modern (cmr10 / cmb10) ----
// Se dibujan como <path>, no como <text>: así el resultado se ve idéntico
// en cualquier programa que abra el SVG, sin depender de que la fuente
// esté instalada o de cómo cada visor centre el texto verticalmente.
const UPM = GLYPH_DATA.upm;

function unionBounds(fontData, chars) {
  let ymin = Infinity,
    ymax = -Infinity;
  for (const ch of chars) {
    const g = fontData[ch];
    if (!g || !g.bounds) continue;
    const [, gy0, , gy1] = g.bounds;
    if (gy0 < ymin) ymin = gy0;
    if (gy1 > ymax) ymax = gy1;
  }
  return { ymin, ymax };
}

const DIGIT_REF = unionBounds(GLYPH_DATA.regular, "0123456789");
const HEADER_REF = unionBounds(GLYPH_DATA.bold, "CDUdecnmil");
const PUNCT_REF = unionBounds(GLYPH_DATA.bold, ".,'");

function centerFontY(ref) {
  return (ref.ymin + ref.ymax) / 2;
}

function stringWidth(str, fontData, scale) {
  let w = 0;
  for (const ch of str) {
    const g = fontData[ch];
    w += (g ? g.adv : UPM * 0.5) * scale;
  }
  return w;
}

// Dibuja `str` centrado horizontalmente en cx, con la línea base calculada
// a partir de `ref` (bbox de referencia) para que quede centrado en rowCenterY.
function glyphRun(str, fontData, cx, rowCenterY, fontSizePx, ref, fill) {
  const scale = fontSizePx / UPM;
  const totalWidth = stringWidth(str, fontData, scale);
  const baselineY = rowCenterY + centerFontY(ref) * scale;
  let x = cx - totalWidth / 2;
  let out = "";
  for (const ch of str) {
    const g = fontData[ch];
    const adv = g ? g.adv : UPM * 0.5;
    if (g && g.d) {
      out += `<g transform="translate(${x} ${baselineY}) scale(${scale} ${-scale})"><path d="${g.d}" fill="${fill}"/></g>`;
    }
    x += adv * scale;
  }
  return out;
}

// Redondea a una precisión fija (3 decimales). Dos celdas vecinas
// calculan la coordenada de su frontera compartida con
// multiplicaciones distintas (ej. columna_i*colW+colW vs
// columna_(i+1)*colW), que en punto flotante pueden diferir por una
// fracción mínima. Redondear ambas al mismo valor antes de usarlas
// elimina el desajuste por completo.
function R(n) {
  return Math.round(n * 1000) / 1000;
}

// Fábrica de la función que dibuja una celda de encabezado (periodo,
// clase u orden) con su borde como UNA sola figura de fondo negro (no
// 4 franjas independientes): primero un rectángulo negro que define
// el contorno completo de la celda, y encima el relleno de color,
// recortado hacia adentro exactamente "stroke" en cada lado, dejando
// ver el negro de abajo como marco. Al ser una sola figura por color,
// el grosor del borde queda garantizado idéntico en los 4 lados de
// una misma celda; y en una frontera compartida con la celda vecina,
// ambas dibujan exactamente el mismo rectángulo negro superpuesto
// (nunca la unión de dos franjas separadas), así que el grosor
// tampoco cambia si esas celdas se separan en PowerPoint.
// "gridLeft"/"gridRight" son los límites horizontales absolutos de
// toda la cuadrícula de esta tabla (pueden no ser 0, ej. cuando hay
// espacio reservado a la izquierda para el signo o el divisor): solo
// ahí el negro no se extiende hacia afuera (se recortaría fuera del
// lienzo) y en su lugar el relleno se recorta el grosor completo de
// ese lado. El límite superior siempre es y=0 (la fila más arriba
// del encabezado, sea cual sea, empieza en 0); el límite inferior
// nunca se trata como exterior porque siempre hay filas de números
// debajo.
function makeBorderedCell(gridLeft, gridRight, stroke, lineColor) {
  return function borderedCell(x0, y0, w, h, fillColor) {
    x0 = R(x0);
    y0 = R(y0);
    w = R(w);
    h = R(h);
    const esBordeIzq = x0 === R(gridLeft);
    const esBordeDer = R(x0 + w) === R(gridRight);
    const esBordeSup = y0 === 0;

    const blackLeft = esBordeIzq ? x0 : R(x0 - stroke / 2);
    const blackRight = esBordeDer ? R(x0 + w) : R(x0 + w + stroke / 2);
    const blackTop = esBordeSup ? 0 : R(y0 - stroke / 2);
    const blackBottom = R(y0 + h + stroke / 2); // nunca es borde exterior

    const insetLeft = esBordeIzq ? stroke : stroke / 2;
    const insetRight = esBordeDer ? stroke : stroke / 2;
    const insetTop = esBordeSup ? stroke : stroke / 2;
    const insetBottom = stroke / 2;

    const fx = R(x0 + insetLeft);
    const fy = R(y0 + insetTop);
    const fw = R(w - insetLeft - insetRight);
    const fh = R(h - insetTop - insetBottom);

    return (
      `<rect x="${blackLeft}" y="${blackTop}" width="${R(blackRight - blackLeft)}" height="${R(blackBottom - blackTop)}" fill="${lineColor}"/>` +
      `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="${fillColor}"/>`
    );
  };
}

// =====================================================================
// Sistema de columnas generalizado (hasta CMMM, con o sin milésimos)
// =====================================================================
const COLORS = {
  C: "#CC2027",
  D: "#1C75BC",
  U: "#57A639",
  d: "#1C75BC",
  c: "#CC2027",
  m: "#57A639",
  Millares: "#8EBADE",
  Unidades: "#ABD39C",
  Decimal: "#8EBADE",
};
// Color de los dígitos/signos: es "let" (no "const") porque buildSVG()
// lo reasigna en cada render a partir del selector de color de la
// interfaz ("colorDigitos"). renderTable() y buildDivision() lo leen
// por closure, así que basta con actualizarlo antes de llamarlas.
let DIGIT_COLOR = "#141414";
const DECIMAL_CLASS = "decimal";
const CLASS_LABELS = [
  "Clase de las unidades",
  "Clase de los millares",
  "Clase de los millones",
  "Clase de los millares de millones",
];
const DECIMAL_CLASS_LABEL = "Clase de los milesimos"; // sin acento: glifo no disponible
// Con esta plantilla (maxPow <= 11) nunca se necesita más de 2 periodos,
// así que "Tercer/Cuarto periodo" no hacen falta (y esas letras no
// existen en el juego de glifos disponible).
const PERIOD_LABELS = ["Primer periodo", "Segundo periodo"];
const PERIOD_COLORS = ["#FFF200", "#FFA500"];

// pow: potencia de diez. code: identificador único (usado como valor de
// jerarquía). label: lo que se dibuja en el encabezado de la columna.
// colorKey: letra usada para buscar el color en COLORS. fullLabel: texto
// del <option> en los selects de jerarquía. classIndex: agrupa cada 3
// órdenes enteros en una "clase" (unidades/millares/millones/...); los
// órdenes decimales forman su propia clase (DECIMAL_CLASS).
const ORDERS = [
  {
    pow: -3,
    code: "m",
    label: "mil",
    colorKey: "m",
    fullLabel: "Milésimas (mil)",
    classIndex: DECIMAL_CLASS,
  },
  {
    pow: -2,
    code: "c",
    label: "cen",
    colorKey: "c",
    fullLabel: "Centésimas (cen)",
    classIndex: DECIMAL_CLASS,
  },
  {
    pow: -1,
    code: "d",
    label: "dec",
    colorKey: "d",
    fullLabel: "Décimas (dec)",
    classIndex: DECIMAL_CLASS,
  },
  {
    pow: 0,
    code: "U",
    label: "U",
    colorKey: "U",
    fullLabel: "Unidades (U)",
    classIndex: 0,
  },
  {
    pow: 1,
    code: "D",
    label: "D",
    colorKey: "D",
    fullLabel: "Decenas (D)",
    classIndex: 0,
  },
  {
    pow: 2,
    code: "C",
    label: "C",
    colorKey: "C",
    fullLabel: "Centenas (C)",
    classIndex: 0,
  },
  {
    pow: 3,
    code: "UM",
    label: "U",
    colorKey: "U",
    fullLabel: "Unidades de millar (UM)",
    classIndex: 1,
  },
  {
    pow: 4,
    code: "DM",
    label: "D",
    colorKey: "D",
    fullLabel: "Decenas de millar (DM)",
    classIndex: 1,
  },
  {
    pow: 5,
    code: "CM",
    label: "C",
    colorKey: "C",
    fullLabel: "Centenas de millar (CM)",
    classIndex: 1,
  },
  {
    pow: 6,
    code: "UMM",
    label: "U",
    colorKey: "U",
    fullLabel: "Unidades de millón (UMM)",
    classIndex: 2,
  },
  {
    pow: 7,
    code: "DMM",
    label: "D",
    colorKey: "D",
    fullLabel: "Decenas de millón (DMM)",
    classIndex: 2,
  },
  {
    pow: 8,
    code: "CMM",
    label: "C",
    colorKey: "C",
    fullLabel: "Centenas de millón (CMM)",
    classIndex: 2,
  },
  {
    pow: 9,
    code: "UMMM",
    label: "U",
    colorKey: "U",
    fullLabel: "Unidades de millar de millón (UMMM)",
    classIndex: 3,
  },
  {
    pow: 10,
    code: "DMMM",
    label: "D",
    colorKey: "D",
    fullLabel: "Decenas de millar de millón (DMMM)",
    classIndex: 3,
  },
  {
    pow: 11,
    code: "CMMM",
    label: "C",
    colorKey: "C",
    fullLabel: "Centenas de millar de millón (CMMM)",
    classIndex: 3,
  },
];
const NIVEL = Object.fromEntries(ORDERS.map((o) => [o.code, o.pow]));

function getVisibleOrders(maxPow, minPow) {
  return ORDERS.filter((o) => o.pow <= maxPow && o.pow >= minPow).sort(
    (a, b) => b.pow - a.pow,
  );
}

// Agrupa columnas consecutivas (en el orden en que se dibujan, de
// maxPow a minPow) por clase y por periodo, igual que en la plantilla
// de valor posicional. Un periodo agrupa 2 clases (6 órdenes); los
// órdenes decimales no forman periodos.
function computeClassGroups(orders) {
  const groups = [];
  orders.forEach((o, i) => {
    const last = groups[groups.length - 1];
    if (last && last.classIndex === o.classIndex) {
      last.span++;
    } else {
      groups.push({ classIndex: o.classIndex, startCol: i, span: 1 });
    }
  });
  return groups;
}
function computePeriodGroups(orders) {
  const groups = [];
  orders.forEach((o, i) => {
    if (o.pow < 0) return;
    const pi = Math.floor(o.pow / 6);
    const last = groups[groups.length - 1];
    if (last && last.periodIndex === pi) {
      last.span++;
    } else {
      groups.push({ periodIndex: pi, startCol: i, span: 1 });
    }
  });
  return groups;
}

function decideDisplay(pow, digit, shift, numDigits) {
  if (digit === 0) {
    if (shift > pow) return null;
    if (numDigits + shift > pow) return 0;
    return null;
  }
  return digit;
}

// Convierte NUMERO (con JERARQUIA opcional, admite punto decimal) en
// columnas visibles [minPow..maxPow], validando que quepa. Devuelve
// también un BigInt "scaled" = valor real * 10^(-minPow), útil para
// sumar/restar/multiplicar con precisión exacta.
function computeColumnsGeneral(numStr, jerarquiaCode, maxPow, minPow) {
  const nivel = NIVEL[jerarquiaCode];
  let parteEntera = numStr,
    parteDecimal = "";
  if (numStr.includes(".")) {
    const partes = numStr.split(".");
    parteEntera = partes[0];
    parteDecimal = partes[1] || "";
  }
  if (parteEntera === "") parteEntera = "0";
  const NDec = parteDecimal.length;
  // El recorte de ceros sobrantes a la izquierda solo se aplica a la
  // PARTE ENTERA (ej. "007" -> "7"): los ceros de la parte decimal
  // nunca se recortan aquí, aunque la parte entera sea "0", porque el
  // usuario los escribió explícitamente y deben verse tal cual (ej.
  // "0.007" debe mostrar 0-0-0-7, no solo "7"). Antes se recortaba la
  // cadena combinada completa, lo que confundía "0" de entera con
  // ceros decimales reales.
  const parteEnteraNorm = parteEntera.replace(/^0+(?=\d)/, "") || "0";
  const digitsStr = parteEnteraNorm + parteDecimal || "0";
  const numDigits = digitsStr.length;
  const shift = nivel - NDec;
  if (shift < minPow) {
    throw new Error(
      minPow < 0
        ? "Este número tiene demasiados decimales: no caben ni siquiera mostrando milésimos."
        : 'Este número tiene decimales, pero la casilla "Mostrar hasta milésimos" está desactivada.',
    );
  }
  const internalShift = shift - minPow;
  const scaled = BigInt(digitsStr) * 10n ** BigInt(internalShift);
  const numColumnas = maxPow - minPow + 1;
  const maxValue = 10n ** BigInt(numColumnas) - 1n;
  if (scaled > maxValue) {
    throw new Error(
      `El número no cabe en las ${numColumnas} columnas visibles para el orden máximo elegido.`,
    );
  }
  const cols = {};
  for (let pow = maxPow; pow >= minPow; pow--) {
    const ipow = pow - minPow;
    const digit = Number((scaled / 10n ** BigInt(ipow)) % 10n);
    cols[pow] = decideDisplay(pow, digit, shift, numDigits);
  }
  return { cols, shift, numDigits, scaled, hasDecimals: NDec > 0 };
}

// BigInt escalado a minPow -> string decimal normal (para volver a
// pasarlo por computeColumnsGeneral tras sumar/restar/multiplicar).
// decimalPlaces indica cuántos decimales son "reales" para ESTE número
// (0 si el resultado de la operación es siempre entero). Sin este dato,
// un entero como 959 quedaría escrito "959.000" al escalar a minPow=-3,
// y decideDisplay interpretaría esos ceros como cifras reales.
function scaledToNumStr(scaled, minPow, decimalPlaces) {
  decimalPlaces = decimalPlaces || 0;
  const neg = scaled < 0n;
  let s = (neg ? -scaled : scaled).toString();
  const decLenFull = minPow < 0 ? -minPow : 0;
  while (s.length <= decLenFull) s = "0" + s;
  const entera = s.slice(0, s.length - decLenFull) || "0";
  const fullDecimal = s.slice(s.length - decLenFull);
  const decimal = fullDecimal.slice(0, decimalPlaces);
  const out = decimal.length ? entera + "." + decimal : entera;
  return (neg ? "-" : "") + out;
}

// ---- Utilidades para nombrar el archivo descargado ----
// Convierte una cadena de dígitos (posiblemente con decimales) más su
// jerarquía en el valor real "en unidades", como cadena decimal plana
// (sin separadores de miles), para usarlo en el nombre del archivo.
// Ej.: digits="24", jerarquia="D" (decenas) -> "240".
//      digits="9.5", jerarquia="U" -> "9.5".
function shiftedDigitsToStr(digitsStr, shift) {
  digitsStr = digitsStr.replace(/^0+(?=\d)/, "") || "0";
  if (shift >= 0) {
    return digitsStr + "0".repeat(shift);
  }
  const decLen = -shift;
  let s = digitsStr;
  while (s.length <= decLen) s = "0" + s;
  const entera = s.slice(0, s.length - decLen) || "0";
  let decimal = s.slice(s.length - decLen).replace(/0+$/, "");
  return decimal.length ? `${entera}.${decimal}` : entera;
}
function termToUnitValueStr(digitsStr, jerarquiaCode) {
  const nivel = NIVEL[jerarquiaCode] || 0;
  let parteEntera = digitsStr,
    parteDecimal = "";
  if (digitsStr.includes(".")) {
    const partes = digitsStr.split(".");
    parteEntera = partes[0] || "0";
    parteDecimal = partes[1] || "";
  }
  const NDec = parteDecimal.length;
  const allDigits = parteEntera + parteDecimal || "0";
  const shift = nivel - NDec;
  return shiftedDigitsToStr(allDigits, shift);
}

function esc(s) {
  return String(s).replace(
    /[&<>]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c],
  );
}

// =====================================================================
// Comas de millares y apóstrofes de periodo (solo para la fila de
// resultado, "relativos" a las columnas visibles).
// =====================================================================
// Las comas/apóstrofes agrupan SIEMPRE de a 3 a partir de la unidad
// real (pow=0), sin importar si el número visible no llega hasta ahí
// (por ejemplo "24" en jerarquía Decenas = 240 debe leerse "240", no
// agruparse como si sus dos únicas cifras fueran el número completo).
// Las comas agrupan de a 3 EN RELACIÓN AL PUNTO DECIMAL de esa fila
// (es decir, a partir de la columna de su propia jerarquía), no
// siempre desde la unidad absoluta. Así, "2500" en jerarquía Centenas
// agrupa como "2,500" (coma entre el 2 y el 5), y "2000" en Decenas
// como "2,000" — ambos relativos a su propio punto, no al de U.
// El apóstrofe de periodo (millón, millar de millón...), en cambio,
// sigue anclado a las clases reales de la tabla (múltiplos de 6 en
// términos absolutos), para que coincida con las bandas de "Clase" /
// "Periodo" ya coloreadas; si el número no alcanza esa longitud,
// sencillamente no aparece ningún apóstrofe ni coma de más.
// "pointPow" puede ser una jerarquía decimal (dec/cen/mil, pow<0)
// cuando así se eligió para el PUNTO del resultado; el agrupamiento
// de a 3 nunca debe cruzar hacia las cifras decimales (no tiene
// sentido "agrupar" décimas/centésimas/milésimas), así que el ancla
// de agrupamiento se recorta a 0 (Unidades) como mínimo.
function commaMarks(
  shift,
  numDigits,
  pointPow,
  maxPow,
  minPow,
  colW,
  leftPad,
) {
  const marks = [];
  const leadPow = shift + numDigits - 1;
  const basePow = Math.max(0, pointPow || 0);
  for (let k = 1; basePow + 3 * k <= leadPow; k++) {
    const boundaryPow = basePow + 3 * k;
    const esPeriodo = boundaryPow % 6 === 0;
    const x = leftPad + colW * (maxPow - boundaryPow + 1);
    marks.push({ x, symbol: esPeriodo ? "'" : "," });
  }
  return marks;
}

// ---- Glifos de los signos de operación (+, -, ×) ----
// El juego de glifos de Computer Modern extraído para esta plantilla
// solo incluye letras y dígitos (no símbolos matemáticos), así que aquí
// se definen como glifos vectoriales propios en el mismo espacio de
// diseño (UPM=2048) que el resto de la fuente, para que se dibujen con
// <path> igual que cualquier otro carácter y compartan su mecanismo de
// escalado/centrado (glyphRun + DIGIT_REF).
function rectPts(x0, y0, x1, y1) {
  return `${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1} L ${x0} ${y1} Z`;
}
const SIGN_GLYPHS = {
  "-": {
    d: `M ${rectPts(-500, 505, 500, 595)}`,
    adv: 1200,
    bounds: [-500, 505, 500, 595],
  },
  "+": {
    d: `M ${rectPts(-500, 505, 500, 595)} M ${rectPts(-45, 50, 45, 1050)}`,
    adv: 1200,
    bounds: [-500, 50, 500, 1050],
  },
  "×": {
    d:
      "M 350.1 977.9 L 427.9 900.1 L -350.1 122.1 L -427.9 199.9 Z " +
      "M 427.9 199.9 L 350.1 122.1 L -427.9 900.1 L -350.1 977.9 Z",
    adv: 1100,
    bounds: [-427.9, 122.1, 427.9, 977.9],
  },
};

function drawSign(symbol, cx, cy, size, color) {
  return glyphRun(symbol, SIGN_GLYPHS, cx, cy, size, DIGIT_REF, color);
}

// Línea punteada y de baja opacidad que separa visualmente el número
// de una fila del de la siguiente (cuando no hay ya una línea sólida
// ahí, como antes del resultado).
function dashedSeparator(x1, x2, y, strokeW) {
  const dash = Math.max(1.5, strokeW * 1.6).toFixed(2);
  const gap = Math.max(1.5, strokeW * 1.4).toFixed(2);
  return `<line x1="${x1.toFixed(2)}" y1="${y.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y.toFixed(2)}" stroke="#000000" stroke-opacity="0.22" stroke-width="${strokeW.toFixed(2)}" stroke-dasharray="${dash},${gap}"/>`;
}

function hasNegDigit(cols) {
  return [-1, -2, -3].some(
    (p) => cols[p] !== null && cols[p] !== undefined,
  );
}

// El punto decimal de una fila se dibuja a la derecha de la columna
// "pointPow" (por defecto Unidades = 0), NO forzosamente entre U y
// dec. "pointPow" viene de la jerarquía elegida para ese número (o
// para el resultado, vía el selector "Punto decimal del resultado a
// la derecha de…"). Se muestra solo si el número realmente tiene
// parte decimal ("row.hasDecimals", calculado en
// computeColumnsGeneral a partir de los decimales escritos/del
// resultado) — nunca a partir de comparar shift con pointPow: si el
// usuario elige como jerarquía del resultado justo la más fina que
// el número tiene (ej. milésimas), el punto debe dibujarse ahí de
// todos modos, aunque no queden cifras "más allá".
function shouldDrawPoint(row) {
  if (row.showPunto === false) return false;
  if (!row.hasDecimals) return false;
  if (row.pointPow === undefined) return false;
  return true;
}
function pointColIndex(orders, pointPow) {
  const idx = orders.findIndex((o) => o.pow === (pointPow || 0));
  return idx >= 0 ? idx : orders.findIndex((o) => o.pow === 0);
}

// =====================================================================
// Render genérico de una tabla apilada (suma / resta / multiplicación)
// =====================================================================
function renderTable(rows, maxPow, minPow, scale, opts) {
  opts = opts || {};
  const orders = getVisibleOrders(maxPow, minPow);
  // Todas las medidas de la cuadrícula se redondean a números ENTEROS
  // exactos (ver comentario detallado sobre esto en makeBorderedCell /
  // R más arriba): así ninguna celda cae en una posición de sub-píxel
  // distinta y, al convertir a PowerPoint, el grosor de cada borde
  // resulta idéntico en todos lados.
  const colW = Math.round(92 * scale);
  const letterH = Math.round(46 * scale);
  const rowH = Math.round(88 * scale);
  const fDigit = 42 * scale;
  const fHeader = 20 * scale;
  const fClase = 13.5 * scale;
  const fPeriod = 15 * scale;
  let stroke = Math.round(2 * scale);
  if (stroke < 2) stroke = 2;
  if (stroke % 2 !== 0) stroke += 1; // par, para que stroke/2 sea entero
  const signGap = opts.hasSign ? Math.round(56 * scale) : 0;
  const leftPad = signGap;
  const gridW = colW * orders.length;
  const totalW = leftPad + gridW;
  const zeroIdx = orders.findIndex((o) => o.pow === 0);

  const classGroups = computeClassGroups(orders);
  const periodGroups = computePeriodGroups(orders);
  const numPeriods = Math.ceil((maxPow + 1) / 6);
  const showClase = !!opts.mostrarClase;
  const showPeriods = !!opts.mostrarPeriodos && numPeriods > 1;
  const periodH = showPeriods ? Math.round(34 * scale) : 0;
  const claseH = showClase ? Math.round(34 * scale) : 0;
  const headerH = periodH + claseH + letterH;
  const totalH = headerH + rowH * rows.length;

  const borderedCell = makeBorderedCell(
    leftPad,
    leftPad + gridW,
    stroke,
    "#111111",
  );

  // Dos acumuladores: "svgTable" (encabezados de periodo, clase y
  // orden — cada celda agrupada con su propio fondo+borde+etiqueta en
  // un <g>) se agrupará en un solo <g> para que, al convertir el SVG a
  // formas editables en PowerPoint y desagrupar el dibujo una vez, todo
  // el encabezado quede como UNA sola figura (y una segunda vez, cada
  // celda quede suelta con su borde intacto). "svgLoose" acumula todo
  // lo demás (dígitos, signos, comas, puntos y líneas separadoras de
  // fila) como elementos sueltos desde el inicio, para poder mover
  // cada número por separado.
  let svgTable = "";
  let svgLoose = "";

  // ---- Fila de periodos (opcional) ----
  if (showPeriods) {
    periodGroups.forEach((g) => {
      const x0 = leftPad + g.startCol * colW;
      const w = g.span * colW;
      const fill = PERIOD_COLORS[g.periodIndex % PERIOD_COLORS.length];
      svgTable += "<g>";
      svgTable += borderedCell(x0, 0, w, periodH, fill);
      svgTable += glyphRun(
        PERIOD_LABELS[g.periodIndex] || `Periodo ${g.periodIndex + 1}`,
        GLYPH_DATA.bold,
        x0 + w / 2,
        periodH / 2,
        fPeriod,
        HEADER_REF,
        "#1a1a1a",
      );
      svgTable += "</g>";
    });
  }

  // ---- Fila de clases (opcional) ----
  if (showClase) {
    classGroups.forEach((g) => {
      const x0 = leftPad + g.startCol * colW;
      const w = g.span * colW;
      const esDecimal = g.classIndex === DECIMAL_CLASS;
      const fill = esDecimal
        ? COLORS.Decimal
        : g.classIndex % 2 === 0
          ? COLORS.Unidades
          : COLORS.Millares;
      const label = esDecimal
        ? DECIMAL_CLASS_LABEL
        : CLASS_LABELS[g.classIndex];
      svgTable += "<g>";
      svgTable += borderedCell(x0, periodH, w, claseH, fill);
      svgTable += glyphRun(
        label,
        GLYPH_DATA.bold,
        x0 + w / 2,
        periodH + claseH / 2,
        fClase,
        HEADER_REF,
        "#1a1a1a",
      );
      svgTable += "</g>";
    });
  }

  // ---- Fila de letras (C/D/U/dec/cen/mil), siempre visible ----
  const letterTop = periodH + claseH;
  orders.forEach((o, i) => {
    const x = leftPad + i * colW;
    svgTable += "<g>";
    svgTable += borderedCell(
      x,
      letterTop,
      colW,
      letterH,
      COLORS[o.colorKey],
    );
    svgTable += glyphRun(
      o.label,
      GLYPH_DATA.bold,
      x + colW / 2,
      letterTop + letterH / 2 + 1,
      fHeader,
      HEADER_REF,
      "#ffffff",
    );
    svgTable += "</g>";
  });

  // Nota: la cuadrícula y el borde del encabezado ya no se dibujan
  // aparte — cada celda de periodo/clase/orden incluye su borde
  // completo como UNA sola figura de fondo negro (ver
  // makeBorderedCell), con el relleno de color recortado hacia adentro
  // encima. En una frontera compartida, las celdas vecinas dibujan el
  // mismo rectángulo negro superpuesto, así que el grosor no cambia
  // sin importar si esas celdas están juntas o si en PowerPoint se
  // separan o se mueven.

  // ---- Filas de números (sin fondo ni celda: quedan sueltas y
  // transparentes) ----
  rows.forEach((row, ri) => {
    const y0 = headerH + ri * rowH;
    const yc = y0 + rowH / 2;
    if (row.lineAbove) {
      svgLoose += `<rect x="${leftPad}" y="${R(y0 - stroke / 2)}" width="${gridW}" height="${stroke}" fill="#111111"/>`;
    } else if (ri > 0) {
      svgLoose += dashedSeparator(
        leftPad,
        leftPad + gridW,
        y0,
        stroke * 0.6,
      );
    }
    orders.forEach((o, i) => {
      const x = leftPad + i * colW + colW / 2;
      const digit = row.cols[o.pow];
      if (digit !== null && digit !== undefined) {
        svgLoose += glyphRun(
          String(digit),
          GLYPH_DATA.regular,
          x,
          yc,
          fDigit,
          DIGIT_REF,
          DIGIT_COLOR,
        );
      }
    });
    if (shouldDrawPoint(row)) {
      const pIdx = pointColIndex(orders, row.pointPow);
      const px = leftPad + (pIdx + 1) * colW;
      svgLoose += glyphRun(
        ".",
        GLYPH_DATA.bold,
        px,
        yc,
        fDigit * 0.85,
        PUNCT_REF,
        COLORS.C,
      );
    }
    if (row.showComma !== false && row.shift !== undefined) {
      commaMarks(
        row.shift,
        row.numDigits,
        row.pointPow,
        maxPow,
        minPow,
        colW,
        leftPad,
      ).forEach((m) => {
        svgLoose += glyphRun(
          m.symbol,
          GLYPH_DATA.bold,
          m.x,
          yc,
          fDigit * 0.85,
          PUNCT_REF,
          COLORS.C,
        );
      });
    }
    if (row.sign) {
      svgLoose += drawSign(
        row.sign,
        leftPad / 2,
        yc,
        fDigit,
        DIGIT_COLOR,
      );
    }
  });

  // Margen de seguridad alrededor de toda la figura (evita que un
  // borde exactamente pegado al límite del viewBox se vea recortado o
  // más delgado por antialiasing). Se aplica desplazando el ORIGEN del
  // viewBox (no envolviendo el contenido en un <g transform>): así no
  // se añade ningún nivel extra de agrupación y los hijos directos del
  // <svg> siguen siendo exactamente [el grupo de la tabla, los
  // elementos sueltos] — el reagrupamiento en dos niveles descrito
  // arriba.
  const PAD = Math.max(3, Math.round(3 * scale));
  const outW = totalW + 2 * PAD;
  const outH = totalH + 2 * PAD;

  return {
    svg: `<svg viewBox="${-PAD} ${-PAD} ${outW} ${outH}" width="${outW}" height="${outH}" xmlns="http://www.w3.org/2000/svg"><g>${svgTable}</g>${svgLoose}</svg>`,
    width: outW,
    height: outH,
  };
}

// =====================================================================
// SUMA / RESTA
// =====================================================================
function buildSumaResta(
  terms,
  isResta,
  mostrarResultado,
  mostrarComas,
  mostrarPunto,
  maxPow,
  minPow,
  scale,
  mostrarClase,
  mostrarPeriodos,
  resultJerarquia,
) {
  if (terms.length < 2) {
    throw new Error(
      isResta
        ? "Agrega el minuendo y al menos un sustraendo."
        : "Agrega al menos dos sumandos.",
    );
  }
  const parsed = terms.map((t) => {
    const digitsStr = (t.digits || "").trim();
    if (!/^\d+(\.\d+)?$/.test(digitsStr)) {
      throw new Error(
        "Cada número debe ser un entero o decimal válido (ej. 436 o 19.5).",
      );
    }
    return computeColumnsGeneral(digitsStr, t.jerarquia, maxPow, minPow);
  });

  let totalScaled = parsed[0].scaled;
  for (let i = 1; i < parsed.length; i++) {
    totalScaled = isResta
      ? totalScaled - parsed[i].scaled
      : totalScaled + parsed[i].scaled;
  }
  if (isResta && totalScaled < 0n) {
    throw new Error(
      "El minuendo debe ser mayor o igual que la suma de los sustraendos.",
    );
  }
  const decimalPlaces = Math.max(0, ...parsed.map((p) => -p.shift));
  const totalStr = scaledToNumStr(totalScaled, minPow, decimalPlaces);
  const totalResult = computeColumnsGeneral(
    totalStr,
    "U",
    maxPow,
    minPow,
  );

  const rows = parsed.map((p, i) => ({
    cols: p.cols,
    bold: false,
    sign: i === parsed.length - 1 ? (isResta ? "-" : "+") : null,
    shift: p.shift,
    numDigits: p.numDigits,
    pointPow: NIVEL[terms[i].jerarquia],
    hasDecimals: p.hasDecimals,
    showComma: terms[i].mostrarFormato !== false,
    showPunto: terms[i].mostrarFormato !== false,
  }));
  rows.push({
    cols: mostrarResultado ? totalResult.cols : {},
    bold: true,
    lineAbove: true,
    isResult: true,
    shift: totalResult.shift,
    numDigits: totalResult.numDigits,
    pointPow: NIVEL[resultJerarquia],
    hasDecimals: totalResult.hasDecimals,
    showComma: mostrarComas,
    showPunto: mostrarPunto,
  });

  return renderTable(rows, maxPow, minPow, scale, {
    hasSign: true,
    mostrarClase,
    mostrarPeriodos,
  });
}

// =====================================================================
// MULTIPLICACIÓN
// =====================================================================
function buildMultiplicacion(
  mcandoTerm,
  mcadorTerm,
  mostrarResultado,
  mostrarComas,
  mostrarPunto,
  maxPow,
  minPow,
  scale,
  mostrarClase,
  mostrarPeriodos,
  resultJerarquia,
  mostrarPuntoProductos,
) {
  const mcandoStr = (mcandoTerm.digits || "").trim();
  const mcadorStr = (mcadorTerm.digits || "").trim();
  if (!/^\d+(\.\d+)?$/.test(mcandoStr)) {
    throw new Error(
      "El multiplicando debe ser un entero o decimal válido.",
    );
  }
  if (!/^\d+$/.test(mcadorStr)) {
    throw new Error(
      'El multiplicador debe ser un número entero (sin punto decimal). Usa su jerarquía para escalarlo, ej. "24" en Decenas.',
    );
  }
  const mcandoResult = computeColumnsGeneral(
    mcandoStr,
    mcandoTerm.jerarquia,
    maxPow,
    minPow,
  );
  const mcadorDigits = mcadorStr.replace(/^0+(?=\d)/, "") || "0";
  const mcadorResult = computeColumnsGeneral(
    mcadorDigits,
    mcadorTerm.jerarquia,
    maxPow,
    minPow,
  );
  const nivelMcador = NIVEL[mcadorTerm.jerarquia];
  if (nivelMcador < 0) {
    throw new Error(
      "El multiplicador no admite una jerarquía decimal (dec/cen/mil); usa Unidades o superior.",
    );
  }
  const mcadorTrue = BigInt(mcadorDigits) * 10n ** BigInt(nivelMcador);
  const dp = Math.max(0, -mcandoResult.shift);
  const mcandoFmt = mcandoTerm.mostrarFormato !== false;
  const mcadorFmt = mcadorTerm.mostrarFormato !== false;

  const rows = [];
  rows.push({
    cols: mcandoResult.cols,
    bold: false,
    shift: mcandoResult.shift,
    numDigits: mcandoResult.numDigits,
    pointPow: NIVEL[mcandoTerm.jerarquia],
    hasDecimals: mcandoResult.hasDecimals,
    showComma: mcandoFmt,
    showPunto: mcandoFmt,
  });
  rows.push({
    cols: mcadorResult.cols,
    bold: false,
    sign: "×",
    shift: mcadorResult.shift,
    numDigits: mcadorResult.numDigits,
    pointPow: NIVEL[mcadorTerm.jerarquia],
    hasDecimals: mcadorResult.hasDecimals,
    showComma: mcadorFmt,
    showPunto: mcadorFmt,
  });

  const nDig = mcadorDigits.length;
  const partials = [];
  for (let k = 0; k < nDig; k++) {
    const digit = BigInt(mcadorDigits[nDig - 1 - k]);
    if (digit === 0n) continue;
    const p = nivelMcador + k;
    const partialScaled = mcandoResult.scaled * digit * 10n ** BigInt(p);
    const partialStr = scaledToNumStr(partialScaled, minPow, dp);
    const partialResult = computeColumnsGeneral(
      partialStr,
      "U",
      maxPow,
      minPow,
    );
    partials.push({
      cols: partialResult.cols,
      bold: false,
      lineAbove: partials.length === 0,
      shift: partialResult.shift,
      numDigits: partialResult.numDigits,
      pointPow: NIVEL[resultJerarquia],
      hasDecimals: partialResult.hasDecimals,
      showPunto: mostrarPuntoProductos,
    });
  }

  const totalScaled = mcandoResult.scaled * mcadorTrue;
  const totalStr = scaledToNumStr(totalScaled, minPow, dp);
  const totalResult = computeColumnsGeneral(
    totalStr,
    "U",
    maxPow,
    minPow,
  );
  const resultMeta = {
    isResult: true,
    shift: totalResult.shift,
    numDigits: totalResult.numDigits,
    pointPow: NIVEL[resultJerarquia],
    hasDecimals: totalResult.hasDecimals,
    showComma: mostrarComas,
    showPunto: mostrarPunto,
  };

  if (partials.length === 0) {
    rows.push(
      Object.assign(
        {
          cols: mostrarResultado ? totalResult.cols : {},
          bold: true,
          lineAbove: true,
        },
        resultMeta,
      ),
    );
  } else if (partials.length === 1) {
    Object.assign(partials[0], resultMeta, {
      bold: true,
      cols: mostrarResultado ? partials[0].cols : {},
    });
    rows.push(...partials);
  } else {
    rows.push(...partials);
    rows.push(
      Object.assign(
        {
          cols: mostrarResultado ? totalResult.cols : {},
          bold: true,
          lineAbove: true,
        },
        resultMeta,
      ),
    );
  }

  return renderTable(rows, maxPow, minPow, scale, {
    hasSign: true,
    mostrarClase,
    mostrarPeriodos,
  });
}

// =====================================================================
// DIVISIÓN (galera clásica)
// =====================================================================
function buildDivision(
  dividendoTerm,
  divisorStr,
  decimales,
  mostrarPasos,
  mostrarComas,
  mostrarPunto,
  maxPow,
  minPow,
  scale,
  mostrarClase,
  mostrarPeriodos,
  resultJerarquia,
) {
  const dividendoStr = (dividendoTerm.digits || "").trim();
  if (!/^\d+$/.test(dividendoStr)) {
    throw new Error(
      'El dividendo debe ser un número entero (sin punto decimal). Usa su jerarquía para escalarlo, ej. "93" en Unidades de millar.',
    );
  }
  const dividendoDigits = dividendoStr.replace(/^0+(?=\d)/, "") || "0";
  const dividendoResult = computeColumnsGeneral(
    dividendoDigits,
    dividendoTerm.jerarquia,
    maxPow,
    minPow,
  );
  const nivelDividendo = NIVEL[dividendoTerm.jerarquia];
  if (nivelDividendo < 0) {
    throw new Error(
      "El dividendo no admite una jerarquía decimal (dec/cen/mil); usa Unidades o superior.",
    );
  }
  const dividendoTrue =
    BigInt(dividendoDigits) * 10n ** BigInt(nivelDividendo);
  const dividendo = dividendoTrue.toString();
  const dividendoFmt = dividendoTerm.mostrarFormato !== false;
  if (!/^[1-9]$/.test(divisorStr.trim())) {
    throw new Error("El divisor debe ser un dígito del 1 al 9.");
  }
  const divisor = Number(divisorStr.trim());
  const maxDecimales = Math.max(0, -minPow);
  if (decimales > maxDecimales) decimales = maxDecimales;

  const digits = dividendo.split("").map(Number);
  const leadingPow = digits.length - 1;

  const quotient = [];
  const scratchRows = [];
  let current = 0;
  let started = false;
  let firstQuotientDone = false;

  digits.forEach((d, i) => {
    current = current * 10 + d;
    const pow = leadingPow - i;
    if (!started && current < divisor) return;
    started = true;
    const qd = Math.floor(current / divisor);
    quotient.push({ digit: qd, pow });
    if (firstQuotientDone)
      scratchRows.push({ value: current, rightPow: pow });
    firstQuotientDone = true;
    current = current - qd * divisor;
  });

  if (quotient.length === 0) {
    quotient.push({ digit: 0, pow: 0 });
    firstQuotientDone = true;
  }

  if (decimales > 0) {
    for (let k = 0; k < decimales; k++) {
      if (current === 0) break;
      current = current * 10;
      const pow = -(k + 1);
      const qd = Math.floor(current / divisor);
      quotient.push({ digit: qd, pow });
      scratchRows.push({ value: current, rightPow: pow });
      current = current - qd * divisor;
    }
  }
  const residuoFinal = current;

  const quotientCols = {};
  quotient.forEach((q) => (quotientCols[q.pow] = q.digit));
  const qShift =
    quotient[quotient.length - 1].pow < 0
      ? quotient[quotient.length - 1].pow
      : 0;
  const qNumDigits = quotient[0].pow - qShift + 1;

  function scratchToCols(value, rightPow) {
    const s = String(value);
    const cols = {};
    for (let i = 0; i < s.length; i++) {
      cols[rightPow + (s.length - 1 - i)] = Number(s[i]);
    }
    return cols;
  }

  const orders = getVisibleOrders(maxPow, minPow);
  // Todas las medidas de la cuadrícula se redondean a números ENTEROS
  // exactos (ver comentario detallado en makeBorderedCell / R más
  // arriba): así el grosor de cada borde resulta idéntico en todos
  // lados al convertir a PowerPoint.
  const colW = Math.round(92 * scale);
  const rowH = Math.round(88 * scale);
  const letterH = Math.round(46 * scale);
  const fDigit = 42 * scale;
  const fHeader = 20 * scale;
  const fClase = 13.5 * scale;
  const fPeriod = 15 * scale;
  let stroke = Math.round(2 * scale);
  if (stroke < 2) stroke = 2;
  if (stroke % 2 !== 0) stroke += 1; // par, para que stroke/2 sea entero
  const divisorW = Math.round(110 * scale);
  const gridW = colW * orders.length;
  const zeroIdx = orders.findIndex((o) => o.pow === 0);
  const showResiduo = mostrarPasos && residuoFinal > 0;
  const captionH = showResiduo ? Math.round(40 * scale) : 0;

  const classGroups = computeClassGroups(orders);
  const periodGroups = computePeriodGroups(orders);
  const numPeriods = Math.ceil((maxPow + 1) / 6);
  const showClase = !!mostrarClase;
  const showPeriods = !!mostrarPeriodos && numPeriods > 1;
  const periodH = showPeriods ? Math.round(34 * scale) : 0;
  const claseH = showClase ? Math.round(34 * scale) : 0;
  const headerH = periodH + claseH + letterH;

  const rows = [];
  rows.push({
    cols: mostrarPasos ? quotientCols : {},
    bold: true,
    isResult: true,
    shift: qShift,
    numDigits: qNumDigits,
    pointPow: NIVEL[resultJerarquia],
    hasDecimals: decimales > 0,
    showComma: mostrarComas,
    showPunto: mostrarPunto,
  });
  rows.push({
    cols: dividendoResult.cols,
    bold: false,
    shift: dividendoResult.shift,
    numDigits: dividendoResult.numDigits,
    pointPow: NIVEL[dividendoTerm.jerarquia],
    hasDecimals: dividendoResult.hasDecimals,
    showComma: dividendoFmt,
    showPunto: dividendoFmt,
  });
  if (mostrarPasos) {
    scratchRows.forEach((r) => {
      rows.push({
        cols: scratchToCols(r.value, r.rightPow),
        bold: false,
        shift: r.rightPow,
        pointPow: 0,
      });
    });
  }

  const totalW = divisorW + gridW;
  const totalH = headerH + rowH * rows.length + captionH;

  const borderedCell = makeBorderedCell(
    divisorW,
    divisorW + gridW,
    stroke,
    "#111111",
  );

  // Igual que en renderTable: "svgTable" agrupa las celdas del
  // encabezado (periodo/clase/orden, cada una con su propio
  // fondo+borde+etiqueta en un <g>) para que sea UNA sola figura al
  // desagrupar una vez, y cada celda quede suelta al desagrupar una
  // segunda vez. "svgLoose" agrupa todo lo demás (dígitos del
  // cociente/dividendo/pasos, el divisor, la galera y el resto) como
  // elementos sueltos desde el inicio.
  let svgTable = "";
  let svgLoose = "";

  if (showPeriods) {
    periodGroups.forEach((g) => {
      const x0 = divisorW + g.startCol * colW;
      const w = g.span * colW;
      const fill = PERIOD_COLORS[g.periodIndex % PERIOD_COLORS.length];
      svgTable += "<g>";
      svgTable += borderedCell(x0, 0, w, periodH, fill);
      svgTable += glyphRun(
        PERIOD_LABELS[g.periodIndex] || `Periodo ${g.periodIndex + 1}`,
        GLYPH_DATA.bold,
        x0 + w / 2,
        periodH / 2,
        fPeriod,
        HEADER_REF,
        "#1a1a1a",
      );
      svgTable += "</g>";
    });
  }
  if (showClase) {
    classGroups.forEach((g) => {
      const x0 = divisorW + g.startCol * colW;
      const w = g.span * colW;
      const esDecimal = g.classIndex === DECIMAL_CLASS;
      const fill = esDecimal
        ? COLORS.Decimal
        : g.classIndex % 2 === 0
          ? COLORS.Unidades
          : COLORS.Millares;
      const label = esDecimal
        ? DECIMAL_CLASS_LABEL
        : CLASS_LABELS[g.classIndex];
      svgTable += "<g>";
      svgTable += borderedCell(x0, periodH, w, claseH, fill);
      svgTable += glyphRun(
        label,
        GLYPH_DATA.bold,
        x0 + w / 2,
        periodH + claseH / 2,
        fClase,
        HEADER_REF,
        "#1a1a1a",
      );
      svgTable += "</g>";
    });
  }

  const letterTop = periodH + claseH;
  orders.forEach((o, i) => {
    const x = divisorW + i * colW;
    svgTable += "<g>";
    svgTable += borderedCell(
      x,
      letterTop,
      colW,
      letterH,
      COLORS[o.colorKey],
    );
    svgTable += glyphRun(
      o.label,
      GLYPH_DATA.bold,
      x + colW / 2,
      letterTop + letterH / 2 + 1,
      fHeader,
      HEADER_REF,
      "#ffffff",
    );
    svgTable += "</g>";
  });

  // Nota: la cuadrícula y el borde del encabezado ya no se dibujan
  // aparte — cada celda de periodo/clase/orden trae su borde completo
  // (ver makeBorderedCell). Las filas de números (cociente, dividendo
  // y pasos) siguen sin fondo ni celda propia, igual que antes.
  rows.forEach((row, ri) => {
    const y0 = headerH + ri * rowH;
    const yc = y0 + rowH / 2;
    if (ri >= 2) {
      svgLoose += dashedSeparator(
        divisorW,
        divisorW + gridW,
        y0,
        stroke * 0.6,
      );
    }
    orders.forEach((o, i) => {
      const x = divisorW + i * colW + colW / 2;
      const d = row.cols[o.pow];
      if (d !== null && d !== undefined) {
        svgLoose += glyphRun(
          String(d),
          GLYPH_DATA.regular,
          x,
          yc,
          fDigit,
          DIGIT_REF,
          DIGIT_COLOR,
        );
      }
    });
    if (shouldDrawPoint(row)) {
      const pIdx = pointColIndex(orders, row.pointPow);
      const px = divisorW + (pIdx + 1) * colW;
      svgLoose += glyphRun(
        ".",
        GLYPH_DATA.bold,
        px,
        yc,
        fDigit * 0.85,
        PUNCT_REF,
        COLORS.C,
      );
    }
    if (row.showComma !== false && row.shift !== undefined) {
      commaMarks(
        row.shift,
        row.numDigits,
        row.pointPow,
        maxPow,
        minPow,
        colW,
        divisorW,
      ).forEach((m) => {
        svgLoose += glyphRun(
          m.symbol,
          GLYPH_DATA.bold,
          m.x,
          yc,
          fDigit * 0.85,
          PUNCT_REF,
          COLORS.C,
        );
      });
    }
  });

  const dividendRowY0 = headerH + rowH;
  svgLoose += glyphRun(
    divisorStr.trim(),
    GLYPH_DATA.regular,
    divisorW / 2,
    dividendRowY0 + rowH / 2,
    fDigit,
    DIGIT_REF,
    DIGIT_COLOR,
  );

  const bracketTopY = dividendRowY0;
  const bracketBottomY = dividendRowY0 + rowH;
  svgLoose += `<rect x="${divisorW}" y="${R(bracketTopY - stroke / 2)}" width="${gridW}" height="${stroke}" fill="#111111"/>`;
  svgLoose += `<rect x="${R(divisorW - stroke / 2)}" y="${bracketTopY}" width="${stroke}" height="${bracketBottomY - bracketTopY}" fill="#111111"/>`;

  if (showResiduo) {
    svgLoose += `<text x="${totalW / 2}" y="${totalH - captionH / 2}" font-family="Verdana, Arial, sans-serif" font-size="${(20 * scale).toFixed(2)}" fill="#374151" text-anchor="middle" dominant-baseline="central">Resto: ${residuoFinal}</text>`;
  }

  // Margen de seguridad vía desplazamiento del origen del viewBox (no
  // un <g transform> envolvente), para no añadir un nivel extra de
  // agrupación: ver la nota equivalente en renderTable.
  const PAD = Math.max(3, Math.round(3 * scale));
  const outW = totalW + 2 * PAD;
  const outH = totalH + 2 * PAD;

  return {
    svg: `<svg viewBox="${-PAD} ${-PAD} ${outW} ${outH}" width="${outW}" height="${outH}" xmlns="http://www.w3.org/2000/svg"><g>${svgTable}</g>${svgLoose}</svg>`,
    width: outW,
    height: outH,
  };
}

// =====================================================================
// Estado + formularios dinámicos
// =====================================================================
const state = {
  sumandos: [
    { digits: "436", jerarquia: "U", mostrarFormato: true },
    { digits: "523", jerarquia: "U", mostrarFormato: true },
  ],
  minuendo: { digits: "257", jerarquia: "U", mostrarFormato: true },
  sustraendos: [{ digits: "124", jerarquia: "U", mostrarFormato: true }],
  multiplicando: { digits: "2.31", jerarquia: "U", mostrarFormato: true },
  multiplicador: { digits: "24", jerarquia: "U", mostrarFormato: true },
  dividendo: { digits: "93", jerarquia: "U", mostrarFormato: true },
};

function getMaxPow() {
  return parseInt(document.getElementById("hastaOrden").value, 10);
}
function getMinPow() {
  return document.getElementById("mostrarMilesimos").checked ? -3 : 0;
}

function jerarquiaSelectHTML(value, maxPow, minPow, soloEnteras) {
  let html = "";
  getVisibleOrders(maxPow, minPow)
    .filter((o) => !soloEnteras || o.pow >= 0)
    .forEach((o) => {
      html += `<option value="${o.code}" ${o.code === value ? "selected" : ""}>${o.fullLabel}</option>`;
    });
  return `<select class="jer">${html}</select>`;
}

function buildTermRowDOM(
  tag,
  item,
  onDigits,
  onJer,
  onFormato,
  onRemove,
  canRemove,
  maxPow,
  minPow,
  opts,
) {
  opts = opts || {};
  const row = document.createElement("div");
  row.className = "termRow";
  row.innerHTML = `
    <span class="tag">${tag}</span>
    <input type="text" class="textInput num" value="${item.digits}" placeholder="${opts.placeholder || ""}" />
    ${jerarquiaSelectHTML(item.jerarquia, maxPow, minPow, opts.soloEnteras)}
    <label class="checkbox">
      <input type="checkbox" class="fmt" ${item.mostrarFormato !== false ? "checked" : ""} /><span class="box">✓</span>Coma/punto</label>
    ${canRemove ? '<button type="button" class="btn btn-ghost removeBtn">Quitar</button>' : ""}
  `;
  const jerSel = row.querySelector(".jer");
  if (![...jerSel.options].some((o) => o.value === item.jerarquia)) {
    item.jerarquia = "U";
    jerSel.value = "U";
  }
  row.querySelector(".num").addEventListener("input", (e) => {
    onDigits(e.target.value);
    render();
  });
  jerSel.addEventListener("change", (e) => {
    onJer(e.target.value);
    render();
  });
  row.querySelector(".fmt").addEventListener("change", (e) => {
    onFormato(e.target.checked);
    render();
  });
  if (canRemove) {
    row.querySelector(".removeBtn").addEventListener("click", () => {
      onRemove();
      renderForms();
      render();
    });
  }
  return row;
}

function renderSumaForm() {
  const maxPow = getMaxPow(),
    minPow = getMinPow();
  const list = document.getElementById("sumandosList");
  list.innerHTML = "";
  state.sumandos.forEach((s, i) => {
    list.appendChild(
      buildTermRowDOM(
        `Sumando ${i + 1}`,
        s,
        (v) => (s.digits = v),
        (v) => (s.jerarquia = v),
        (v) => (s.mostrarFormato = v),
        () => state.sumandos.splice(i, 1),
        state.sumandos.length > 2,
        maxPow,
        minPow,
        { placeholder: "Ej. 19.5" },
      ),
    );
  });
}

function renderRestaForm() {
  const maxPow = getMaxPow(),
    minPow = getMinPow();
  const minRow = document.getElementById("minuendoRow");
  minRow.innerHTML = "";
  minRow.appendChild(
    buildTermRowDOM(
      "Minuendo",
      state.minuendo,
      (v) => (state.minuendo.digits = v),
      (v) => (state.minuendo.jerarquia = v),
      (v) => (state.minuendo.mostrarFormato = v),
      null,
      false,
      maxPow,
      minPow,
      { placeholder: "Ej. 19.5" },
    ),
  );
  const list = document.getElementById("sustraendosList");
  list.innerHTML = "";
  state.sustraendos.forEach((s, i) => {
    list.appendChild(
      buildTermRowDOM(
        `Sustraendo ${i + 1}`,
        s,
        (v) => (s.digits = v),
        (v) => (s.jerarquia = v),
        (v) => (s.mostrarFormato = v),
        () => state.sustraendos.splice(i, 1),
        state.sustraendos.length > 1,
        maxPow,
        minPow,
        { placeholder: "Ej. 19.5" },
      ),
    );
  });
}

function renderMultiplicandoForm() {
  const maxPow = getMaxPow(),
    minPow = getMinPow();
  const c = document.getElementById("multiplicandoRow");
  c.innerHTML = "";
  c.appendChild(
    buildTermRowDOM(
      "Multiplicando",
      state.multiplicando,
      (v) => (state.multiplicando.digits = v),
      (v) => (state.multiplicando.jerarquia = v),
      (v) => (state.multiplicando.mostrarFormato = v),
      null,
      false,
      maxPow,
      minPow,
      { placeholder: "Ej. 2.31" },
    ),
  );
}

function renderMultiplicadorForm() {
  const maxPow = getMaxPow(),
    minPow = getMinPow();
  const c = document.getElementById("multiplicadorRow");
  c.innerHTML = "";
  c.appendChild(
    buildTermRowDOM(
      "Multiplicador",
      state.multiplicador,
      (v) => (state.multiplicador.digits = v),
      (v) => (state.multiplicador.jerarquia = v),
      (v) => (state.multiplicador.mostrarFormato = v),
      null,
      false,
      maxPow,
      minPow,
      { placeholder: "Ej. 24 (entero)", soloEnteras: true },
    ),
  );
}

function renderDividendoForm() {
  const maxPow = getMaxPow(),
    minPow = getMinPow();
  const c = document.getElementById("dividendoRow");
  c.innerHTML = "";
  c.appendChild(
    buildTermRowDOM(
      "Dividendo",
      state.dividendo,
      (v) => (state.dividendo.digits = v),
      (v) => (state.dividendo.jerarquia = v),
      (v) => (state.dividendo.mostrarFormato = v),
      null,
      false,
      maxPow,
      minPow,
      { placeholder: "Ej. 93 (entero)", soloEnteras: true },
    ),
  );
}

function renderDecimalesSelect() {
  const sel = document.getElementById("decimales");
  const minPow = getMinPow();
  const maxDec = Math.max(0, -minPow);
  const prev = sel.value;
  sel.innerHTML = "";
  const labels = [
    "Ninguno (división entera)",
    "1 decimal",
    "2 decimales",
    "3 decimales",
  ];
  for (let i = 0; i <= maxDec; i++) {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = labels[i];
    sel.appendChild(opt);
  }
  const prevNum = parseInt(prev, 10);
  sel.value =
    !isNaN(prevNum) && prevNum <= maxDec
      ? String(prevNum)
      : String(Math.min(2, maxDec));
}

function renderResultJerarquiaSelect() {
  const sel = document.getElementById("resultJerarquia");
  const maxPow = getMaxPow(),
    minPow = getMinPow();
  const prev = sel.value || "U";
  sel.innerHTML = jerarquiaSelectHTML(prev, maxPow, minPow, false)
    .replace(/^<select class="jer">/, "")
    .replace(/<\/select>$/, "");
  if (![...sel.options].some((o) => o.value === prev)) {
    sel.value = "U";
  } else {
    sel.value = prev;
  }
}

function renderForms() {
  renderSumaForm();
  renderRestaForm();
  renderMultiplicandoForm();
  renderMultiplicadorForm();
  renderDividendoForm();
  renderDecimalesSelect();
  renderResultJerarquiaSelect();
}

document.getElementById("addSumando").addEventListener("click", () => {
  state.sumandos.push({
    digits: "0",
    jerarquia: "U",
    mostrarFormato: true,
  });
  renderForms();
  render();
});
document.getElementById("addSustraendo").addEventListener("click", () => {
  state.sustraendos.push({
    digits: "0",
    jerarquia: "U",
    mostrarFormato: true,
  });
  renderForms();
  render();
});

// =====================================================================
// Cambio de operación
// =====================================================================
const OP_RESULT_LABEL = {
  suma: "Mostrar resultado",
  resta: "Mostrar resultado",
  multiplicacion: "Mostrar resultado",
  division: "Mostrar cociente y procedimiento",
};

function updateOpPanels() {
  const op = document.getElementById("operacion").value;
  document
    .querySelectorAll("[data-op-panel]")
    .forEach((el) => (el.style.display = "none"));
  document.querySelector(`[data-op-panel="${op}"]`).style.display =
    "flex";
  document.getElementById("mostrarResultadoLabel").textContent =
    OP_RESULT_LABEL[op];
}

document.getElementById("operacion").addEventListener("change", () => {
  updateOpPanels();
  render();
});
document.getElementById("hastaOrden").addEventListener("change", () => {
  renderForms();
  render();
});
document
  .getElementById("mostrarMilesimos")
  .addEventListener("change", () => {
    renderForms();
    render();
  });

// =====================================================================
// Render principal
// =====================================================================
// El tamaño de los dígitos ya no es seleccionable: siempre se usa el
// valor que antes correspondía a "Grande".
const SCALE_GRANDE = 1.22;

function buildSVG() {
  const err = document.getElementById("err");
  err.style.display = "none";
  const op = document.getElementById("operacion").value;
  const scale = SCALE_GRANDE;
  const maxPow = getMaxPow();
  const minPow = getMinPow();
  const mostrarResultado =
    document.getElementById("mostrarResultado").checked;
  const mostrarComas = document.getElementById("mostrarComas").checked;
  const mostrarPunto = document.getElementById(
    "mostrarPuntoResultado",
  ).checked;
  const mostrarClase = document.getElementById("mostrarClase").checked;
  const mostrarPeriodos =
    document.getElementById("mostrarPeriodos").checked;
  const resultJerarquia =
    document.getElementById("resultJerarquia").value;
  DIGIT_COLOR = document.getElementById("colorDigitos").value;

  try {
    if (op === "suma") {
      return buildSumaResta(
        state.sumandos,
        false,
        mostrarResultado,
        mostrarComas,
        mostrarPunto,
        maxPow,
        minPow,
        scale,
        mostrarClase,
        mostrarPeriodos,
        resultJerarquia,
      );
    } else if (op === "resta") {
      const terms = [state.minuendo, ...state.sustraendos];
      return buildSumaResta(
        terms,
        true,
        mostrarResultado,
        mostrarComas,
        mostrarPunto,
        maxPow,
        minPow,
        scale,
        mostrarClase,
        mostrarPeriodos,
        resultJerarquia,
      );
    } else if (op === "multiplicacion") {
      const mostrarPuntoProductos = document.getElementById(
        "mostrarPuntoProductos",
      ).checked;
      return buildMultiplicacion(
        state.multiplicando,
        state.multiplicador,
        mostrarResultado,
        mostrarComas,
        mostrarPunto,
        maxPow,
        minPow,
        scale,
        mostrarClase,
        mostrarPeriodos,
        resultJerarquia,
        mostrarPuntoProductos,
      );
    } else {
      const divisor = document.getElementById("divisor").value;
      const decimales = parseInt(
        document.getElementById("decimales").value,
        10,
      );
      return buildDivision(
        state.dividendo,
        divisor,
        decimales,
        mostrarResultado,
        mostrarComas,
        mostrarPunto,
        maxPow,
        minPow,
        scale,
        mostrarClase,
        mostrarPeriodos,
        resultJerarquia,
      );
    }
  } catch (e) {
    err.textContent = e.message;
    err.style.display = "block";
    return null;
  }
}

function render() {
  const result = buildSVG();
  const holder = document.getElementById("svgHolder");
  if (result) holder.innerHTML = result.svg;
}

// =====================================================================
// Descarga
// =====================================================================
// Nombre del archivo: [Operacion]-[Numero]-[Numero]...SVG, con
// [Operacion] = A/S/M/D (suma/resta/multiplicación/división) y un
// [Numero] por cada número involucrado en la operación (minuendo y
// cada sustraendo, cada sumando, etc.), expresado en unidades
// (aplicando la jerarquía de cada término).
function buildFilename() {
  const op = document.getElementById("operacion").value;
  const val = (t) => termToUnitValueStr(t.digits || "0", t.jerarquia);
  const LETRA = {
    suma: "A",
    resta: "S",
    multiplicacion: "M",
    division: "D",
  };
  let numeros;
  if (op === "suma") {
    numeros = state.sumandos.map(val);
  } else if (op === "resta") {
    numeros = [state.minuendo, ...state.sustraendos].map(val);
  } else if (op === "multiplicacion") {
    numeros = [val(state.multiplicando), val(state.multiplicador)];
  } else {
    const divisor = (
      document.getElementById("divisor").value || ""
    ).trim();
    numeros = [val(state.dividendo), divisor];
  }
  return `${[LETRA[op], ...numeros].join("-")}.SVG`;
}


async function download() {
  const result = buildSVG();
  if (!result) return;
  const filename = buildFilename();

  await Banco.guardarSVG(result.svg, filename); // compartido/guardar-svg.js
}

document
  .getElementById("downloadBtn")
  .addEventListener("click", download);
[
  "colorDigitos",
  "mostrarResultado",
  "mostrarComas",
  "mostrarPuntoResultado",
  "resultJerarquia",
  "mostrarPuntoProductos",
  "mostrarClase",
  "mostrarPeriodos",
  "divisor",
  "decimales",
].forEach((id) => {
  document.getElementById(id).addEventListener("input", render);
  document.getElementById(id).addEventListener("change", render);
});

renderForms();
updateOpPanels();
render();
