// Módulo puro de generación de la tabla de valor posicional como SVG.
// Extraído de _generador-tabla-valor-posicional.html: mismas reglas y
// misma tipografía vectorial (glifos Computer Modern), sin acoplarse al DOM.
// buildSVG(state) recibe { numerosState, maxPow, minPow, showComma,
// showPunto, showClase, showPeriodos, digitColor }
// y devuelve { svg, filename } o { error: { message, rowIndex } }.
// Un punto decimal sin dígitos después (ej. "36.") siempre se permite: no
// existe una casilla que lo desactive.

const DECIMAL_CLASS = "decimal";
const ORDERS = [
  {
    pow: -1,
    code: "d",
    label: "Décimos (d)",
    classIndex: DECIMAL_CLASS,
    cellLabel: "dec",
    colorKey: "D",
  },
  {
    pow: -2,
    code: "c",
    label: "Centésimos (c)",
    classIndex: DECIMAL_CLASS,
    cellLabel: "cen",
    colorKey: "C",
  },
  {
    pow: -3,
    code: "m",
    label: "Milésimos (m)",
    classIndex: DECIMAL_CLASS,
    cellLabel: "mil",
    colorKey: "U",
  },
  { pow: 0, code: "U", label: "Unidades (U)", classIndex: 0 },
  { pow: 1, code: "D", label: "Decenas (D)", classIndex: 0 },
  { pow: 2, code: "C", label: "Centenas (C)", classIndex: 0 },
  { pow: 3, code: "UM", label: "Unidades de millar (UM)", classIndex: 1 },
  { pow: 4, code: "DM", label: "Decenas de millar (DM)", classIndex: 1 },
  { pow: 5, code: "CM", label: "Centenas de millar (CM)", classIndex: 1 },
  {
    pow: 6,
    code: "UMM",
    label: "Unidades de millón (UMM)",
    classIndex: 2,
  },
  {
    pow: 7,
    code: "DMM",
    label: "Decenas de millón (DMM)",
    classIndex: 2,
  },
  {
    pow: 8,
    code: "CMM",
    label: "Centenas de millón (CMM)",
    classIndex: 2,
  },
  {
    pow: 9,
    code: "UMMM",
    label: "Unidades de millar de millón (UMMM)",
    classIndex: 3,
  },
  {
    pow: 10,
    code: "DMMM",
    label: "Decenas de millar de millón (DMMM)",
    classIndex: 3,
  },
  {
    pow: 11,
    code: "CMMM",
    label: "Centenas de millar de millón (CMMM)",
    classIndex: 3,
  },
];
const ORDER_BY_CODE = Object.fromEntries(ORDERS.map((o) => [o.code, o]));
const ORDER_BY_POW = Object.fromEntries(ORDERS.map((o) => [o.pow, o])); // admite claves negativas
const NIVEL = Object.fromEntries(ORDERS.map((o) => [o.code, o.pow]));

const CLASS_LABELS = [
  "Clase de las unidades",
  "Clase de los millares",
  "Clase de los millones",
  "Clase de los millares de millones",
];
const DECIMAL_CLASS_LABEL = "Clase de los milesimos"; // sin acento: glifo no disponible

// Un "periodo" agrupa 2 clases (6 órdenes): unidades+millares = primer
// periodo, millones+millares de millón = segundo periodo, etc. Los órdenes
// decimales no forman parte de ningún periodo.
const PERIOD_LABELS = [
  "Primer periodo",
  "Segundo periodo",
  "Tercer periodo",
  "Cuarto periodo",
];
const PERIOD_COLORS = ["#FFF200", "#FFA500"];

// Rellena un <select> de jerarquía con las opciones disponibles según el
// orden máximo elegido en "hastaOrden" y el orden decimal en
// "hastaOrdenDecimal", conservando su selección previa si sigue siendo
// válida. Se usa una vez por cada fila de la lista de números (cada número
// puede tener su propia jerarquía).
const GLYPH_DATA = Banco.GLYPH_DATA_TABLA; // compartido/glifos-tabla.js

const COLORS = {
  C: "#CC2027",
  D: "#1C75BC",
  U: "#57A639",
  Millares: "#8EBADE",
  Unidades: "#ABD39C",
};

const SCALE = {
  normal: 1,
  grande: 1.22,
  extra: 1.45,
};

function decideDisplay(pow, digit, shift, numDigits) {
  if (digit === 0) {
    if (shift > pow) return null;
    if (numDigits + shift > pow) return 0;
    return null;
  }
  return digit;
}

// numeroDeColumnas = maxPow - minPow + 1 (todas las potencias de minPow a maxPow)
// minPow es 0 normalmente, o -3 cuando se muestran los milésimos.
// puntoForzado: true cuando el usuario escribió un punto sin dígitos después
// (ej. "36.") y activó la casilla que permite esta excepción.
function computeColumns(numStr, jerarquia, maxPow, minPow, puntoForzado) {
  const nivel = NIVEL[jerarquia];
  let parteEntera = numStr,
    parteDecimal = "";
  if (numStr.includes(".")) {
    [parteEntera, parteDecimal] = numStr.split(".");
  }
  if (parteEntera === "") parteEntera = "0";
  const NDec = parteDecimal.length;
  // Los ceros a la izquierda NO se recortan: si el usuario los escribe
  // (ej. "04.8" o "0950"), es porque quiere verlos en su columna (útil para
  // mostrar a los alumnos que esa posición vale cero). Por eso cada dígito
  // escrito ocupa su columna y cuenta para numDigits (y, por tanto, para la
  // agrupación de comas: "0950" → "0,950").
  const digitsStr = parteEntera + parteDecimal;
  const numDigits = digitsStr.length;
  const shift = nivel - NDec;
  if (shift < minPow) {
    throw new Error(
      minPow < 0
        ? "Demasiados decimales: no caben ni siquiera mostrando milésimos."
        : 'Demasiados decimales para la jerarquía elegida (elige un orden decimal mayor, o "Milésimos", en el selector "…y hasta el orden decimal de…").',
    );
  }
  // El punto decimal se coloca siempre justo a la derecha de la columna de
  // la jerarquía elegida (por ejemplo, a la derecha de "decenas" si el
  // número se interpreta en decenas), sin importar si hay cifras decimales
  // visibles más allá o si se muestran los órdenes de milésimos. También se
  // puede forzar sin dígitos decimales reales (ej. "36.") si el usuario lo
  // pidió explícitamente.
  const hayDecimal = NDec > 0 || puntoForzado;
  const numColumnas = maxPow - minPow + 1;

  // Aritmética con BigInt para evitar errores de precisión con números
  // grandes (hasta 10^11 y más). internalShift alinea el valor para que la
  // columna menos significativa visible (minPow) corresponda a exponente 0.
  const internalShift = shift - minPow;
  const value = BigInt(digitsStr) * 10n ** BigInt(internalShift);
  // Se valida por la POSICIÓN del dígito escrito más a la izquierda, no por
  // el valor numérico: un cero a la izquierda no aumenta el valor, pero sí
  // necesita su propia columna. Validar por valor dejaría pasar "0950" con
  // solo 3 columnas y ese cero se perdería en silencio.
  const leadPow = shift + numDigits - 1;
  if (leadPow > maxPow) {
    throw new Error(
      `El número no cabe en las ${numColumnas} columnas visibles para la jerarquía y el rango de órdenes elegidos.`,
    );
  }

  const cols = [];
  for (let pow = maxPow; pow >= minPow; pow--) {
    const ipow = pow - minPow;
    const digit = Number((value / 10n ** BigInt(ipow)) % 10n);
    cols.push(decideDisplay(pow, digit, shift, numDigits));
  }

  return { cols, hayDecimal, nivel, shift, numDigits };
}

function buildSVG(state) {
  const {
    numerosState,
    maxPow,
    minPow,
    showComma,
    showPunto,
    showClase,
    showPeriodos: showPeriodosFlag,
    digitColor,
  } = state;
  const s = SCALE.grande;
  const numColumnas = maxPow - minPow + 1;

  // Una fila por cada número de la lista. Cada número tiene su propia
  // jerarquía. Un punto decimal sin dígitos después (ej. "36.") siempre
  // se acepta.
  const rows = [];
  for (let i = 0; i < numerosState.length; i++) {
    const jerarquia = numerosState[i].jerarquia;
    const numero = numerosState[i].numero.trim();
    const etiqueta = numerosState.length > 1 ? `Número ${i + 1}: ` : "";
    if (!/^\d+(\.\d*)?$/.test(numero)) {
      return {
        error: {
          message:
            etiqueta +
            "Escribe un número válido (solo dígitos y, opcionalmente, un punto decimal).",
          rowIndex: i,
        },
      };
    }
    const puntoSinDigitos = numero.endsWith(".");
    try {
      const r = computeColumns(
        numero,
        jerarquia,
        maxPow,
        minPow,
        puntoSinDigitos,
      );
      rows.push(r);
    } catch (e) {
      return { error: { message: etiqueta + e.message, rowIndex: i } };
    }
  }
  const numRows = rows.length;

  // Todas las medidas de la cuadrícula (ancho de columna, altos de fila,
  // grosor de línea) se redondean a números ENTEROS exactos. Si quedaran
  // en decimales (ej. 80*1.22=97.6), cada celda caería en una posición de
  // sub-píxel distinta y, al convertir a PowerPoint, cada borde se
  // redondearía de forma independiente y ligeramente distinta —causando
  // el grosor inconsistente entre bordes que se veía en la vista previa.
  // Con enteros, toda celda cae exactamente en la misma cuadrícula de
  // píxeles y el grosor resulta idéntico en todos los bordes.
  const colW = Math.round(80 * s);
  const numPeriods = Math.ceil((maxPow + 1) / 6); // los órdenes decimales no forman periodos
  const showPeriods = showPeriodosFlag && numPeriods > 1;
  const periodH = showPeriods ? Math.round(38 * s) : 0;
  const headerH = showClase ? Math.round(38 * s) : 0;
  const letterH = Math.round(46 * s);
  const digitH = Math.round(80 * s);
  let stroke = Math.round(2 * s);
  if (stroke < 2) stroke = 2;
  if (stroke % 2 !== 0) stroke += 1; // par, para que stroke/2 sea entero
  const lineColor = "#111111";
  const fPeriod = 17 * s;
  const fHeader = 15 * s;
  const fLetter = 25 * s;
  const fDigit = 40 * s;
  const fComma = 46 * s;
  const fPoint = 34 * s;

  const totalW = colW * numColumnas;
  const totalH = periodH + headerH + letterH + digitH * numRows;

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
  const LETTERROW_REF = unionBounds(GLYPH_DATA.bold, "CDUdecnmil");
  const HEADER_REF = unionBounds(GLYPH_DATA.bold, "Clasedomirun");
  const PERIOD_REF = unionBounds(GLYPH_DATA.bold, "PSrimepodgun");

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

  // Devuelve un tamaño de fuente reducido (nunca mayor al pedido) para que
  // `str` quepa dentro de `maxWidth`. Necesario para encabezados de clase
  // que a veces abarcan una sola columna (ej. "Clase de las milesimas"
  // mostrando solo "Décimos").
  function fittedFontSize(str, fontData, desiredSize, maxWidth) {
    const w = stringWidth(str, fontData, desiredSize / UPM);
    if (w <= maxWidth) return desiredSize;
    return desiredSize * (maxWidth / w);
  }

  // Dibuja las 4 franjas del borde de una celda (arriba, abajo, izquierda,
  // derecha), cada trazo centrado exactamente sobre el borde de la celda
  // (igual que antes con la cuadrícula compartida). Al incluir el borde
  // DENTRO del grupo de cada celda, mover o quitar una celda en PowerPoint
  // no dañaR el borde de las celdas vecinas: cada una lleva el suyo propio.
  // Redondea a una precisión fija (3 decimales). Dos celdas vecinas calculan
  // la coordenada de su frontera compartida con multiplicaciones distintas
  // (ej. columna_i*colW+colW vs columna_(i+1)*colW), que en punto flotante
  // pueden diferir por una fracción mínima (1 unidad en el último bit). Esa
  // diferencia basta para que el antialiasing dibuje esa línea con un grosor
  // ligeramente distinto al resto. Redondear ambas al mismo valor antes de
  // usarlas elimina el desajuste por completo.
  function R(n) {
    return Math.round(n * 1000) / 1000;
  }

  // Línea punteada y de baja opacidad que separa visualmente el número de
  // una fila del de la siguiente (igual que en el generador de operaciones).
  function dashedSeparator(x1, x2, y, strokeW) {
    const dash = Math.max(1.5, strokeW * 1.6).toFixed(2);
    const gap = Math.max(1.5, strokeW * 1.4).toFixed(2);
    return `<line x1="${x1.toFixed(2)}" y1="${y.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y.toFixed(2)}" stroke="#000000" stroke-opacity="0.22" stroke-width="${strokeW.toFixed(2)}" stroke-dasharray="${dash},${gap}"/>`;
  }

  // Dibuja una celda con su borde como UNA sola figura de fondo negro (no
  // 4 franjas independientes): primero un rectángulo negro que define el
  // contorno completo de la celda, y encima el relleno de color, recortado
  // hacia adentro exactamente `stroke` en cada lado, dejando ver el negro
  // de abajo como marco. Al ser una sola figura por color, el grosor del
  // borde queda garantizado idéntico en los 4 lados de una misma celda; y
  // en una frontera compartida con la celda vecina, ambas dibujan
  // exactamente el mismo rectángulo negro superpuesto (nunca la unión de
  // dos franjas separadas), así que el grosor tampoco cambia si se separan.
  // Si la frontera coincide con el perímetro exterior del SVG (x=0, x=totalW
  // o y=0), el negro no se extiende más allá (se recortaría) y en su lugar
  // el relleno se recorta el doble de ese lado, para mantener el mismo
  // grosor visible de borde.
  function borderedCell(x0, y0, w, h, fillColor) {
    x0 = R(x0);
    y0 = R(y0);
    w = R(w);
    h = R(h);
    const esBordeIzq = x0 === 0;
    const esBordeDer = R(x0 + w) === R(totalW);
    const esBordeSup = y0 === 0;

    const blackLeft = esBordeIzq ? 0 : R(x0 - stroke / 2);
    const blackRight = esBordeDer ? R(totalW) : R(x0 + w + stroke / 2);
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
  }

  // Dibuja `str` centrado horizontalmente en cx, con la línea base calculada
  // a partir de `ref` (bbox de referencia) para que quede centrado en rowCenterY.
  function glyphRun(
    str,
    fontData,
    cx,
    rowCenterY,
    fontSizePx,
    ref,
    fill,
  ) {
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

  // Dos acumuladores: "svgTable" (encabezados, letras, cuadrícula y
  // borde) se agrupará en un solo <g> para que, al convertir el SVG a
  // formas editables en PowerPoint y desagrupar una vez, la tabla quede
  // como UNA sola figura. "svgNumbers" (dígitos, comas, apóstrofes y
  // punto decimal) queda fuera del grupo, como figuras sueltas, para
  // poder manipular cada número por separado.
  let svgTable = "";
  let svgNumbers = "";

  // Dibuja un carácter suelto (coma, apóstrofe o punto) centrado en cx, pero
  // recortando (clamp) su posición si eso lo haría salirse por la izquierda
  // o la derecha del lienzo — así nunca queda cortado por el borde del SVG
  // y, a la vez, la tabla sigue ocupando exactamente todo el ancho del
  // archivo (sin márgenes extra).
  function glyphRunClamped(
    str,
    fontData,
    cx,
    rowCenterY,
    fontSizePx,
    ref,
    fill,
  ) {
    const scale = fontSizePx / UPM;
    const w = stringWidth(str, fontData, scale);
    let x = cx;
    if (x - w / 2 < 0) x = w / 2;
    if (x + w / 2 > totalW) x = totalW - w / 2;
    return glyphRun(str, fontData, x, rowCenterY, fontSizePx, ref, fill);
  }

  // Columnas de izquierda a derecha: de maxPow hasta minPow.
  const colPows = [];
  for (let p = maxPow; p >= minPow; p--) colPows.push(p);

  // Agrupar columnas consecutivas por clase (unidades, millares, millones, ...)
  const classGroups = []; // {classIndex, startCol, span}
  colPows.forEach((pow, i) => {
    const ci = ORDER_BY_POW[pow].classIndex;
    const last = classGroups[classGroups.length - 1];
    if (last && last.classIndex === ci) {
      last.span++;
    } else {
      classGroups.push({ classIndex: ci, startCol: i, span: 1 });
    }
  });

  // Agrupar columnas consecutivas por periodo (cada periodo = 2 clases = 6
  // órdenes). Los órdenes decimales (pow negativo) no forman periodos.
  const periodGroups = []; // {periodIndex, startCol, span}
  colPows.forEach((pow, i) => {
    if (pow < 0) return;
    const pi = Math.floor(pow / 6);
    const last = periodGroups[periodGroups.length - 1];
    if (last && last.periodIndex === pi) {
      last.span++;
    } else {
      periodGroups.push({ periodIndex: pi, startCol: i, span: 1 });
    }
  });

  const headerTop = periodH;
  const letterTop = periodH + headerH;
  const digitTop = periodH + headerH + letterH;

  // ---- Fila 0: encabezados de periodo (opcional, solo si hay 2+ periodos) ----
  // Cada celda de periodo se agrupa (fondo+borde unido + etiqueta).
  if (showPeriods) {
    periodGroups.forEach((g) => {
      const x0 = g.startCol * colW;
      const w = g.span * colW;
      const fill = PERIOD_COLORS[g.periodIndex % PERIOD_COLORS.length];
      const label =
        PERIOD_LABELS[g.periodIndex] || `Periodo ${g.periodIndex + 1}`;
      const fSize = fittedFontSize(
        label,
        GLYPH_DATA.bold,
        fPeriod,
        w * 0.92,
      );
      svgTable += "<g>";
      svgTable += borderedCell(x0, 0, w, periodH, fill);
      svgTable += glyphRun(
        label,
        GLYPH_DATA.bold,
        x0 + w / 2,
        periodH / 2,
        fSize,
        PERIOD_REF,
        "#1a1a1a",
      );
      svgTable += "</g>";
    });
  }

  // ---- Fila 1: encabezados de clase (opcional) ----
  // Cada celda de clase se agrupa (fondo+borde unido + etiqueta); todas
  // comparten el mismo alto (headerH), y el mismo ancho entre sí cuando
  // abarcan el mismo número de columnas (el caso normal).
  if (showClase) {
    classGroups.forEach((g) => {
      const x0 = g.startCol * colW;
      const w = g.span * colW;
      const esDecimal = g.classIndex === DECIMAL_CLASS;
      const fill = esDecimal
        ? COLORS.Millares
        : g.classIndex % 2 === 0
          ? COLORS.Unidades
          : COLORS.Millares;
      const label = esDecimal
        ? DECIMAL_CLASS_LABEL
        : CLASS_LABELS[g.classIndex];
      const fSize = fittedFontSize(
        label,
        GLYPH_DATA.bold,
        fHeader,
        w * 0.92,
      );
      svgTable += "<g>";
      svgTable += borderedCell(x0, headerTop, w, headerH, fill);
      svgTable += glyphRun(
        label,
        GLYPH_DATA.bold,
        x0 + w / 2,
        headerTop + headerH / 2,
        fSize,
        HEADER_REF,
        "#1a1a1a",
      );
      svgTable += "</g>";
    });
  }

  // ---- Fila 2: letras/etiquetas de los órdenes ----
  // Cada celda de orden se agrupa (fondo+borde unido + etiqueta); todas
  // comparten exactamente el mismo alto (letterH) y ancho (colW).
  colPows.forEach((pow, i) => {
    const order = ORDER_BY_POW[pow];
    const cellLabel = order.cellLabel || order.code[0]; // 'dec'/'cen'/'mil' o C/D/U
    const colorKey = order.colorKey || order.code[0];
    const x0 = i * colW;
    const fSize = fittedFontSize(
      cellLabel,
      GLYPH_DATA.bold,
      fLetter,
      colW * 0.9,
    );
    svgTable += "<g>";
    svgTable += borderedCell(
      x0,
      letterTop,
      colW,
      letterH,
      COLORS[colorKey],
    );
    svgTable += glyphRun(
      cellLabel,
      GLYPH_DATA.bold,
      x0 + colW / 2,
      letterTop + letterH / 2,
      fSize,
      LETTERROW_REF,
      "#ffffff",
    );
    svgTable += "</g>";
  });

  // ---- Filas de números (sin fondo: quedan transparentes) ----
  // Cada número de la lista ocupa su propia fila, separada de la anterior
  // por una línea punteada de baja opacidad (igual que en el generador de
  // operaciones). La primera fila no lleva línea arriba.
  rows.forEach((row, ri) => {
    const { cols, hayDecimal, nivel, shift, numDigits } = row;
    const rowTop = digitTop + ri * digitH;
    const digitCY = rowTop + digitH / 2;

    if (ri > 0) {
      svgNumbers += dashedSeparator(0, totalW, rowTop, stroke * 0.6);
    }

    cols.forEach((val, i) => {
      if (val !== null) {
        const cx = i * colW + colW / 2;
        svgNumbers += glyphRun(
          String(val),
          GLYPH_DATA.regular,
          cx,
          digitCY,
          fDigit,
          DIGIT_REF,
          digitColor,
        );
      }
    });

    // ---- Comas de millares y apóstrofes de periodo (sujetas a su casilla) ----
    // Relativas a los dígitos ENTEROS realmente visibles del número (nunca
    // invaden la parte decimal): se agrupan de 3 en 3 a partir de la unidad.
    // Cada frontera de agrupación lleva coma, salvo que además caiga en un
    // múltiplo de 6 (frontera de periodo), en cuyo caso lleva apóstrofe. Si
    // el número no alcanza cierta frontera, esa coma/apóstrofe no se dibuja.
    if (showComma) {
      // Solo se agrupan los dígitos a la izquierda del punto decimal (la
      // columna "nivel"); los dígitos a su derecha —sean columnas d/c/m o
      // columnas enteras usadas como decimales, como en "9.5 decenas"—
      // nunca llevan coma. La agrupación tampoco debe cruzar nunca la
      // columna de unidades (pow 0): si la jerarquía elegida es ella misma
      // decimal (ej. milésimos, nivel=-3), no hay parte entera que agrupar
      // más allá de esa columna.
      const leadPow = shift + numDigits - 1; // potencia del dígito visible más significativo
      // Si NO hay punto decimal real (hayDecimal=false), las columnas de
      // potencia negativa no son "parte decimal" de nada: son dígitos
      // enteros que la jerarquía elegida desplazó hacia la derecha (ej.
      // "2498" en jerarquía Milésimos, sin punto escrito, se lee tal
      // cual "2498" y debe llevar su coma de millar). En ese caso el
      // ancla de la agrupación es el dígito menos significativo
      // realmente escrito (columna `shift`), no la columna U. Con punto
      // decimal real, se mantiene la regla de siempre: nunca agrupar
      // más allá de la columna U (Math.max(nivel, 0)).
      const intShift = hayDecimal ? Math.max(nivel, 0) : shift;
      const intNumDigits = leadPow - intShift + 1;
      if (intNumDigits > 0) {
        for (let k = 1; 3 * k <= intNumDigits - 1; k++) {
          const boundaryPow = intShift + 3 * k; // potencia de la columna a la izquierda de la frontera
          const x = colW * (maxPow - boundaryPow + 1);
          // Con punto real, la frontera de periodo es absoluta (columna
          // múltiplo de 6). Sin punto, la secuencia se trata como un
          // entero llano anclado en su propio dígito menos
          // significativo, así que la alternancia coma/apóstrofe se
          // cuenta en relativo (k-ésima frontera desde la derecha) —
          // para un entero normal (shift=0) ambos criterios coinciden,
          // así que esto no cambia nada de lo ya existente.
          const esFronteraDePeriodo = hayDecimal
            ? boundaryPow % 6 === 0
            : k % 2 === 0;
          const simbolo = esFronteraDePeriodo ? "'" : ",";
          svgNumbers += glyphRunClamped(
            simbolo,
            GLYPH_DATA.bold,
            x,
            digitCY,
            fComma,
            DIGIT_REF,
            COLORS.C,
          );
        }
      }
    }

    // ---- Punto decimal ----
    // Se coloca siempre justo a la derecha de la columna de la jerarquía
    // elegida (por ejemplo, a la derecha de "decenas" si el número se
    // interpreta en decenas), sin importar si se muestran los órdenes de
    // milésimos. Solo si la casilla "Mostrar punto decimal" está activada.
    if (showPunto && hayDecimal) {
      const px = colW * (maxPow - nivel + 1);
      svgNumbers += glyphRunClamped(
        ".",
        GLYPH_DATA.bold,
        px,
        digitCY,
        fPoint,
        DIGIT_REF,
        COLORS.C,
      );
    }
  });

  // La cuadrícula y el borde ya no se dibujan aparte: cada celda de
  // periodo/clase/orden incluye su borde completo como UNA sola figura de
  // fondo negro (ver borderedCell más arriba), con el relleno de color
  // recortado hacia adentro encima. En una frontera compartida, las dos
  // celdas vecinas dibujan el mismo rectángulo negro superpuesto —nunca la
  // unión de piezas separadas—, así que el grosor no cambia sin importar si
  // esas celdas están juntas o si en PowerPoint se separan o se mueven.

  // Estructura final de agrupación (pensada para "Convertir en forma" de
  // PowerPoint):
  //   svg
  //    └─ g (LA TABLA COMPLETA — una sola figura al desagrupar el dibujo)
  //        ├─ g (celda de periodo, con su propio borde) × N  ← al desagrupar
  //        ├─ g (celda de clase, con su propio borde)   × N     la tabla,
  //        └─ g (celda de orden, con su propio borde)   × N     cada una
  //                                                             queda suelta
  //    └─ g (dígito / coma / apóstrofe / punto) × N   ← sueltos desde el inicio
  const svg =
    `<svg viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">` +
    `<g>${svgTable}</g>` +
    svgNumbers +
    `</svg>`;
  return { svg, filename: buildFilename(numerosState) };
}
// Construye el nombre de archivo: [Orden]-[Numero].svg
// [Orden] = U, D, C, UM, DM o CM (igual que el valor de la jerarquía)
// [Numero] = el número mostrado, con los millares separados por "-"
function groupThousands(digitsStr) {
  let out = "";
  let count = 0;
  for (let i = digitsStr.length - 1; i >= 0; i--) {
    out = digitsStr[i] + out;
    count++;
    if (count % 3 === 0 && i !== 0) out = "-" + out;
  }
  return out;
}

function buildFilename(numerosState) {
  // Para los órdenes decimales, el prefijo del archivo usa la misma
  // abreviatura de 3 letras que se muestra en la celda (dec/cen/mil) en
  // vez del código de una letra (d/c/m).
  const FILENAME_PREFIX = { d: "dec", c: "cen", m: "mil" };

  // Un número por fila, cada uno con su propia jerarquía; si hay varios,
  // se unen con "+" en el nombre (ej. "U-950-000+D-1-234.svg").
  const combined = numerosState
    .map((row) => {
      const ordenPart = FILENAME_PREFIX[row.jerarquia] || row.jerarquia;
      const numero = row.numero.trim();
      let numeroPart;
      if (!/^\d+(\.\d*)?$/.test(numero)) {
        numeroPart = "vacia";
      } else {
        const [entera, decimal] = numero.split(".");
        numeroPart =
          groupThousands(entera) +
          (numero.includes(".") ? "." + decimal : "");
      }
      return `${ordenPart}-${numeroPart}`;
    })
    .join("+");

  return `${combined}.svg`;
}

// ---- Estado y wiring de la interfaz (dirección "Barra segmentada") ----
let numerosState = [{ numero: "950000", jerarquia: "U" }];

function currentMaxMin() {
  return {
    maxPow: parseInt(document.getElementById("hastaOrden").value, 10),
    minPow: parseInt(
      document.getElementById("hastaOrdenDecimal").value,
      10,
    ),
  };
}

function jerarquiaOptionsHTML(selectedCode, maxPow, minPow) {
  const opts = ORDERS.filter(
    (o) => o.pow <= maxPow && o.pow >= minPow,
  ).sort((a, b) => a.pow - b.pow);
  const valid = opts.some((o) => o.code === selectedCode);
  const value = valid ? selectedCode : "U";
  return {
    html: opts
      .map(
        (o) =>
          `<option value="${o.code}"${o.code === value ? " selected" : ""}>${o.label}</option>`,
      )
      .join(""),
    value,
  };
}

function clampJerarquias() {
  const { maxPow, minPow } = currentMaxMin();
  numerosState.forEach((row) => {
    const pow = NIVEL[row.jerarquia];
    if (pow === undefined || pow > maxPow || pow < minPow)
      row.jerarquia = "U";
  });
}

function renderNumerosList() {
  const { maxPow, minPow } = currentMaxMin();
  const container = document.getElementById("numerosList");
  container.innerHTML = "";
  numerosState.forEach((rowState, idx) => {
    const row = document.createElement("div");
    row.className = "numeroRow";
    const { html: optHtml } = jerarquiaOptionsHTML(
      rowState.jerarquia,
      maxPow,
      minPow,
    );
    row.innerHTML =
      '<span class="tag">Número ' +
      (idx + 1) +
      "</span>" +
      '<input type="text" class="textInput numero-input" placeholder="Ej. 4500 o 63.21">' +
      '<select class="jerarquia-select">' +
      optHtml +
      "</select>" +
      '<button type="button" class="btn btn-ghost removeBtn"' +
      (numerosState.length <= 1 ? " disabled" : "") +
      ">Quitar</button>";
    const input = row.querySelector(".numero-input");
    input.value = rowState.numero;
    input.addEventListener("input", () => {
      rowState.numero = input.value;
      render();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        download();
      }
    });
    const select = row.querySelector(".jerarquia-select");
    select.addEventListener("change", () => {
      rowState.jerarquia = select.value;
      render();
    });
    row.querySelector(".removeBtn").addEventListener("click", () => {
      if (numerosState.length <= 1) return;
      numerosState.splice(idx, 1);
      renderNumerosList();
      render();
    });
    container.appendChild(row);
  });
}

function render() {
  const { maxPow, minPow } = currentMaxMin();
  const result = buildSVG({
    numerosState,
    maxPow,
    minPow,
    showComma: document.getElementById("coma").checked,
    showPunto: document.getElementById("mostrarPunto").checked,
    showClase: document.getElementById("mostrarClase").checked,
    showPeriodos: document.getElementById("mostrarPeriodos").checked,
    digitColor: document.getElementById("colorDigitos").value,
  });
  const errorBox = document.getElementById("errorCallout");
  const errorMsg = document.getElementById("errorMessage");
  const holder = document.getElementById("svgHolder");
  if (result.error) {
    errorMsg.textContent = result.error.message;
    errorBox.style.display = "flex";
    document
      .querySelectorAll(".numero-input")
      .forEach((el, i) =>
        el.classList.toggle("hasError", i === result.error.rowIndex),
      );
    return;
  }
  errorBox.style.display = "none";
  document
    .querySelectorAll(".numero-input")
    .forEach((el) => el.classList.remove("hasError"));
  holder.innerHTML = result.svg;
  lastFilename = result.filename;
}

let lastFilename = "tabla.svg";

async function download() {
  const { maxPow, minPow } = currentMaxMin();
  const result = buildSVG({
    numerosState,
    maxPow,
    minPow,
    showComma: document.getElementById("coma").checked,
    showPunto: document.getElementById("mostrarPunto").checked,
    showClase: document.getElementById("mostrarClase").checked,
    showPeriodos: document.getElementById("mostrarPeriodos").checked,
    digitColor: document.getElementById("colorDigitos").value,
  });
  if (result.error || !result.svg) return;
  const filename = result.filename;
  await Banco.guardarSVG(result.svg, filename); // compartido/guardar-svg.js
}

[
  "colorDigitos",
  "coma",
  "mostrarPunto",
  "mostrarClase",
  "mostrarPeriodos",
].forEach((id) => {
  document.getElementById(id).addEventListener("input", render);
  document.getElementById(id).addEventListener("change", render);
});
document.getElementById("hastaOrden").addEventListener("change", () => {
  clampJerarquias();
  renderNumerosList();
  render();
});
document
  .getElementById("hastaOrdenDecimal")
  .addEventListener("change", () => {
    clampJerarquias();
    renderNumerosList();
    render();
  });
document.getElementById("addNumero").addEventListener("click", () => {
  numerosState.push({ numero: "0", jerarquia: "U" });
  renderNumerosList();
  render();
});
document
  .getElementById("downloadBtn")
  .addEventListener("click", download);

renderNumerosList();
render();
