// Generador unificado de tablas de valor posicional: une el de la tabla
// (tabla-valor-posicional/) y el de operaciones (operaciones/), que se
// retiraron el 2026-09-27 (siguen en el historial de git).
// Con la operación «Ninguna» dibuja uno o varios números en la tabla, igual
// que la tabla de valor posicional (mismo SVG byte a byte); con suma, resta,
// multiplicación o división dibuja además signos, la línea del resultado,
// los productos parciales o la galera.
//
// Qué viene de cada uno:
// - De la tabla: las medidas y tamaños de letra del dibujo, la lectura de
//   los números (ceros a la izquierda, «36.», validación por posición), las
//   comas relativas al punto, el ajuste de etiquetas que no caben
//   (fittedFontSize) y de signos en el borde (glyphRunClamped), el selector
//   fino de decimales y el aviso de error que marca la fila.
// - De operaciones: las cuatro operaciones, la casilla «Coma y punto» de
//   cada número, el resultado con su jerarquía y sus casillas, y el nombre
//   de archivo A/S/M/D.
// - El residuo de la división va dentro de la galera, como última resta
//   (antes, «Resto: N» debajo de la tabla).
//
// buildSVG(cfg) es pura: recibe la configuración ya leída del DOM y devuelve
// { svg, filename } o { error: { message, campo } }.

const GLYPH_DATA = Banco.GLYPH_DATA_TABLA; // compartido/glifos-tabla.js
const UPM = GLYPH_DATA.upm;

// =====================================================================
// Constantes y metadatos
// =====================================================================
const DECIMAL_CLASS = "decimal";
// pow: potencia de diez. code: valor de la jerarquía (y prefijo del nombre
// de archivo). label: texto del <option>. cellLabel: lo que se dibuja en la
// celda del orden. colorKey: color de esa celda en COLORS (los decimales
// reutilizan el de su «reflejo»: dec↔D, cen↔C, mil↔U). classIndex: agrupa
// cada 3 órdenes enteros en una clase; los decimales forman la suya.
const ORDERS = [
  { pow: -3, code: "m", label: "Milésimos (mil)", cellLabel: "mil", colorKey: "U", classIndex: DECIMAL_CLASS },
  { pow: -2, code: "c", label: "Centésimos (cen)", cellLabel: "cen", colorKey: "C", classIndex: DECIMAL_CLASS },
  { pow: -1, code: "d", label: "Décimos (dec)", cellLabel: "dec", colorKey: "D", classIndex: DECIMAL_CLASS },
  { pow: 0, code: "U", label: "Unidades (U)", cellLabel: "U", colorKey: "U", classIndex: 0 },
  { pow: 1, code: "D", label: "Decenas (D)", cellLabel: "D", colorKey: "D", classIndex: 0 },
  { pow: 2, code: "C", label: "Centenas (C)", cellLabel: "C", colorKey: "C", classIndex: 0 },
  { pow: 3, code: "UM", label: "Unidades de millar (UM)", cellLabel: "U", colorKey: "U", classIndex: 1 },
  { pow: 4, code: "DM", label: "Decenas de millar (DM)", cellLabel: "D", colorKey: "D", classIndex: 1 },
  { pow: 5, code: "CM", label: "Centenas de millar (CM)", cellLabel: "C", colorKey: "C", classIndex: 1 },
  { pow: 6, code: "UMM", label: "Unidades de millón (UMM)", cellLabel: "U", colorKey: "U", classIndex: 2 },
  { pow: 7, code: "DMM", label: "Decenas de millón (DMM)", cellLabel: "D", colorKey: "D", classIndex: 2 },
  { pow: 8, code: "CMM", label: "Centenas de millón (CMM)", cellLabel: "C", colorKey: "C", classIndex: 2 },
  { pow: 9, code: "UMMM", label: "Unidades de millar de millón (UMMM)", cellLabel: "U", colorKey: "U", classIndex: 3 },
  { pow: 10, code: "DMMM", label: "Decenas de millar de millón (DMMM)", cellLabel: "D", colorKey: "D", classIndex: 3 },
  { pow: 11, code: "CMMM", label: "Centenas de millar de millón (CMMM)", cellLabel: "C", colorKey: "C", classIndex: 3 },
];
const ORDER_BY_POW = Object.fromEntries(ORDERS.map((o) => [o.pow, o])); // admite claves negativas
const NIVEL = Object.fromEntries(ORDERS.map((o) => [o.code, o.pow]));

const CLASS_LABELS = [
  "Clase de las unidades",
  "Clase de los millares",
  "Clase de los millones",
  "Clase de los millares de millones",
];
const DECIMAL_CLASS_LABEL = "Clase de los milesimos"; // sin acento: glifo no disponible

// Un «periodo» agrupa 2 clases (6 órdenes). Los órdenes decimales no forman
// parte de ningún periodo. Con maxPow <= 11 solo aparecen los dos primeros.
const PERIOD_LABELS = [
  "Primer periodo",
  "Segundo periodo",
  "Tercer periodo",
  "Cuarto periodo",
];
const PERIOD_COLORS = ["#FFF200", "#FFA500"];

// Colores de la figura: los del material base 10 y los tintes de clase.
const COLORS = {
  C: "#CC2027",
  D: "#1C75BC",
  U: "#57A639",
  Millares: "#8EBADE",
  Unidades: "#ABD39C",
};
const LINE_COLOR = "#111111";

// Tamaño fijo del dibujo (el antiguo «Grande»); no hay selector.
const SCALE = 1.22;

// ---- Referencias verticales de los glifos (para centrar cada fila) ----
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

// ---- Glifos de los signos de operación (+, −, ×) ----
// El juego de glifos de la tabla no trae símbolos matemáticos, así que se
// definen aquí en el mismo espacio de diseño (UPM = 2048), para dibujarlos
// con <path> y centrarlos igual que los dígitos (glyphRun + DIGIT_REF).
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

// Error de validación que sabe qué campo lo causó, para marcarlo en la
// interfaz: un índice en la lista de números de la operación, "divisor",
// o null si no es de un campo concreto (p. ej. el resultado no cabe).
class ErrorCampo extends Error {
  constructor(message, campo) {
    super(message);
    this.campo = campo;
  }
}

// =====================================================================
// Cálculo puro: lectura de los números
// =====================================================================
function decideDisplay(pow, digit, shift, numDigits) {
  if (digit === 0) {
    if (shift > pow) return null;
    if (numDigits + shift > pow) return 0;
    return null;
  }
  return digit;
}

// Reparte un número escrito (con su jerarquía) en las columnas visibles
// [minPow..maxPow]. Devuelve cols como objeto {pow: dígito o null}, y
// además value (BigInt = valor real × 10^(-minPow)) para poder sumar,
// restar y multiplicar sin errores de precisión.
// puntoForzado: true cuando se escribió un punto sin dígitos después
// (ej. "36."), que dibuja el punto aunque no haya cifras decimales.
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
      minPow <= -3
        ? "Demasiados decimales: no caben ni siquiera mostrando milésimos."
        : 'Demasiados decimales para la jerarquía elegida (elige una jerarquía mayor, o más órdenes decimales en «Trabajar hasta el orden de…»).',
    );
  }
  // El punto decimal se coloca siempre justo a la derecha de la columna de
  // la jerarquía elegida (por ejemplo, a la derecha de "decenas" si el
  // número se interpreta en decenas).
  const hayDecimal = NDec > 0 || puntoForzado;
  const numColumnas = maxPow - minPow + 1;

  // Aritmética con BigInt para evitar errores de precisión con números
  // grandes. internalShift alinea el valor para que la columna menos
  // significativa visible (minPow) corresponda a exponente 0.
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

  const cols = {};
  for (let pow = maxPow; pow >= minPow; pow--) {
    const ipow = pow - minPow;
    const digit = Number((value / 10n ** BigInt(ipow)) % 10n);
    cols[pow] = decideDisplay(pow, digit, shift, numDigits);
  }

  return { cols, hayDecimal, nivel, shift, numDigits, value };
}

// BigInt escalado a minPow → cadena decimal normal (para volver a pasarla
// por computeColumns tras sumar/restar/multiplicar). decimalPlaces indica
// cuántos decimales son «reales» para ESTE número: sin ese dato, un entero
// como 959 quedaría escrito "959.000" al escalar a minPow = -3, y esos
// ceros se dibujarían como cifras.
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

// Lista ordenada de los números que se escriben en cada operación, con su
// etiqueta (para los mensajes de error) y si solo admiten enteros. El orden
// es el mismo en que aparecen los campos en la interfaz, así un error puede
// marcar su campo por índice.
function terminosDe(op, datos) {
  switch (op) {
    case "suma":
      return datos.sumandos.map((t, i) => ({ t, etiqueta: `Sumando ${i + 1}` }));
    case "resta":
      return [
        { t: datos.minuendo, etiqueta: "Minuendo" },
        ...datos.sustraendos.map((t, i) => ({ t, etiqueta: `Sustraendo ${i + 1}` })),
      ];
    case "multiplicacion":
      return [
        { t: datos.multiplicando, etiqueta: "Multiplicando" },
        { t: datos.multiplicador, etiqueta: "Multiplicador" },
      ];
    case "division":
      return [{ t: datos.dividendo, etiqueta: "Dividendo", soloEnteros: true }];
    default:
      return datos.numeros.map((t, i) => ({ t, etiqueta: `Número ${i + 1}` }));
  }
}

// Valida y reparte en columnas cada número de la operación. El prefijo
// «Etiqueta: » se omite solo cuando hay un único número sin operación
// (igual que en la tabla de valor posicional).
function leerTerminos(cfg) {
  const lista = terminosDe(cfg.op, cfg.datos);
  const conPrefijo = cfg.op !== "ninguna" || lista.length > 1;
  return lista.map(({ t, etiqueta, soloEnteros }, i) => {
    const pref = conPrefijo ? etiqueta + ": " : "";
    const numero = t.numero.trim();
    const valido = soloEnteros ? /^\d+\.?$/ : /^\d+(\.\d*)?$/;
    if (!valido.test(numero)) {
      throw new ErrorCampo(
        pref +
          (soloEnteros
            ? 'Escribe un número entero, sin cifras decimales. Usa su jerarquía para escalarlo (ej. "24" en Decenas).'
            : "Escribe un número válido (solo dígitos y, opcionalmente, un punto decimal)."),
        i,
      );
    }
    try {
      return computeColumns(numero, t.jerarquia, cfg.maxPow, cfg.minPow, numero.endsWith("."));
    } catch (e) {
      throw new ErrorCampo(pref + e.message, i);
    }
  });
}

// Reparte un resultado calculado (siempre en unidades reales) en columnas.
function columnasResultado(numStr, cfg, que) {
  try {
    return computeColumns(numStr, "U", cfg.maxPow, cfg.minPow, false);
  } catch (e) {
    throw new ErrorCampo(
      `${que} no cabe en las columnas visibles: elige un orden mayor en «Trabajar hasta el orden de…».`,
      null,
    );
  }
}

// Fila de la figura a partir de un número ya repartido en columnas.
// nivel = columna a cuya derecha va el punto (la de su jerarquía, o la
// elegida para el resultado).
function filaDe(r, formato, extra) {
  return Object.assign(
    {
      cols: r.cols,
      hayDecimal: r.hayDecimal,
      nivel: r.nivel,
      shift: r.shift,
      numDigits: r.numDigits,
      showComma: formato,
      showPunto: formato,
    },
    extra,
  );
}

// =====================================================================
// Cálculo puro: filas de cada operación
// =====================================================================
function filasSumaResta(leidos, terms, esResta, cfg) {
  const res = cfg.resultado;
  let total = leidos[0].value;
  for (let i = 1; i < leidos.length; i++) {
    total = esResta ? total - leidos[i].value : total + leidos[i].value;
  }
  if (esResta && total < 0n) {
    throw new ErrorCampo(
      "El minuendo debe ser mayor o igual que la suma de los sustraendos.",
      0,
    );
  }
  const decimalPlaces = Math.max(0, ...leidos.map((p) => -p.shift));
  const totalR = columnasResultado(
    scaledToNumStr(total, cfg.minPow, decimalPlaces),
    cfg,
    "El resultado",
  );
  const ultimo = leidos.length - 1;
  const filas = leidos.map((p, i) =>
    filaDe(p, terms[i].formato !== false, {
      sign: i === ultimo ? (esResta ? "-" : "+") : null,
    }),
  );
  // Si el resultado está oculto, la fila queda en blanco pero conserva
  // sus comas y su punto (si están activados) como guía para escribirlo.
  filas.push(
    filaDe(totalR, false, {
      cols: res.mostrar ? totalR.cols : {},
      lineAbove: true,
      nivel: NIVEL[res.jerarquia],
      showComma: res.comas,
      showPunto: res.punto,
    }),
  );
  return filas;
}

function filasMultiplicacion(leidos, cfg) {
  const res = cfg.resultado;
  const [mcando, mcador] = leidos;
  const { multiplicando: mcandoTerm, multiplicador: mcadorTerm } = cfg.datos;
  // Las cifras del multiplicador, sin punto ni ceros a la izquierda: cada
  // una da un producto parcial. mcador.shift es el orden de la última
  // (negativo si el multiplicador tiene decimales: 2.4 → -1).
  const mcadorDigits =
    mcadorTerm.numero.trim().replace(".", "").replace(/^0+(?=\d)/, "") || "0";
  // Valor escalado por 10^e (e puede ser negativo; entonces la división es
  // exacta porque el producto cabe en la parte decimal, ver abajo).
  const por10 = (x, e) => (e >= 0 ? x * 10n ** BigInt(e) : x / 10n ** BigInt(-e));
  // Cifras decimales del producto: las del multiplicando más las del
  // multiplicador, como en el cuaderno (2.5 × 2.4 = 6.00). Cada producto
  // parcial lleva las del multiplicando más las de su cifra (2.5 × 0.4 = 1.00).
  const dpMcando = Math.max(0, -mcando.shift);
  const dp = dpMcando + Math.max(0, -mcador.shift);
  if (dp > -cfg.minPow) {
    throw new ErrorCampo(
      `El producto tiene ${dp} cifras decimales: elige más órdenes decimales en «¿Con parte decimal?».`,
      null,
    );
  }

  const filas = [
    filaDe(mcando, mcandoTerm.formato !== false),
    filaDe(mcador, mcadorTerm.formato !== false, { sign: "×" }),
  ];

  const nDig = mcadorDigits.length;
  const parciales = [];
  for (let k = 0; k < nDig; k++) {
    const digit = BigInt(mcadorDigits[nDig - 1 - k]);
    if (digit === 0n) continue;
    const p = mcador.shift + k;
    const parcialR = columnasResultado(
      scaledToNumStr(por10(mcando.value * digit, p), cfg.minPow, dpMcando + Math.max(0, -p)),
      cfg,
      "Un producto parcial",
    );
    parciales.push(
      filaDe(parcialR, true, {
        lineAbove: parciales.length === 0,
        nivel: NIVEL[res.jerarquia],
        showPunto: res.puntoProductos,
      }),
    );
  }

  const totalR = columnasResultado(
    scaledToNumStr(por10(mcando.value * BigInt(mcadorDigits), mcador.shift), cfg.minPow, dp),
    cfg,
    "El producto",
  );
  const resultMeta = {
    hayDecimal: totalR.hayDecimal,
    shift: totalR.shift,
    numDigits: totalR.numDigits,
    nivel: NIVEL[res.jerarquia],
    showComma: res.comas,
    showPunto: res.punto,
  };

  if (parciales.length === 1) {
    // Un solo producto parcial ya es el resultado: no se repite.
    Object.assign(parciales[0], resultMeta, {
      cols: res.mostrar ? parciales[0].cols : {},
    });
    filas.push(...parciales);
  } else {
    filas.push(...parciales);
    filas.push(
      Object.assign(
        { cols: res.mostrar ? totalR.cols : {}, lineAbove: true },
        resultMeta,
      ),
    );
  }
  return filas;
}

// División en galera: devuelve las filas (cociente, dividendo y, si se
// muestra el resultado, las restas parciales y el residuo). «Decimales en
// el cociente» es un tope (milésimos como máximo): si el resto llega a 0
// antes, la división se detiene ahí.
function filasDivision(leidos, cfg) {
  const res = cfg.resultado;
  const [dividendoR] = leidos;
  const dividendoTerm = cfg.datos.dividendo;
  const nivelDividendo = NIVEL[dividendoTerm.jerarquia];
  if (nivelDividendo < 0) {
    throw new ErrorCampo(
      "Dividendo: no admite una jerarquía decimal (dec/cen/mil); usa Unidades o superior.",
      0,
    );
  }
  const divisorStr = cfg.division.divisor.trim();
  if (!/^[1-9]$/.test(divisorStr)) {
    throw new ErrorCampo("El divisor debe ser un dígito del 1 al 9.", "divisor");
  }
  const divisor = Number(divisorStr);
  const decimales = Math.min(cfg.division.decimales || 0, Math.max(0, -cfg.minPow));

  const dividendoDigits =
    dividendoTerm.numero.trim().replace(/\.$/, "").replace(/^0+(?=\d)/, "") || "0";
  const dividendo = (
    BigInt(dividendoDigits) * 10n ** BigInt(nivelDividendo)
  ).toString();
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
    if (firstQuotientDone) scratchRows.push({ value: current, rightPow: pow });
    firstQuotientDone = true;
    current = current - qd * divisor;
  });

  if (quotient.length === 0) {
    quotient.push({ digit: 0, pow: 0 });
  }

  for (let k = 0; k < decimales; k++) {
    if (current === 0) break;
    current = current * 10;
    const pow = -(k + 1);
    const qd = Math.floor(current / divisor);
    quotient.push({ digit: qd, pow });
    scratchRows.push({ value: current, rightPow: pow });
    current = current - qd * divisor;
  }
  const residuo = current;

  const quotientCols = {};
  quotient.forEach((q) => (quotientCols[q.pow] = q.digit));
  const ultimaPow = quotient[quotient.length - 1].pow;
  const qShift = ultimaPow < 0 ? ultimaPow : 0;

  const filas = [
    {
      cols: res.mostrar ? quotientCols : {},
      // El punto del cociente solo se dibuja si de verdad tiene cifras
      // decimales (8 ÷ 4 con «2 decimales» da 2, no «2.»).
      hayDecimal: ultimaPow < 0,
      nivel: NIVEL[res.jerarquia],
      shift: qShift,
      numDigits: quotient[0].pow - qShift + 1,
      showComma: res.comas,
      showPunto: res.punto,
    },
    filaDe(dividendoR, dividendoTerm.formato !== false),
  ];
  // El residuo se escribe como en el cuaderno: última fila de la galera,
  // en la columna de la última cifra del cociente. Si es 0 no se escribe.
  if (residuo > 0) scratchRows.push({ value: residuo, rightPow: ultimaPow });
  if (res.mostrar) {
    scratchRows.forEach((r) => {
      const s = String(r.value);
      const cols = {};
      for (let i = 0; i < s.length; i++) {
        cols[r.rightPow + (s.length - 1 - i)] = Number(s[i]);
      }
      filas.push({
        cols,
        hayDecimal: false,
        nivel: 0,
        shift: r.rightPow,
        numDigits: s.length,
        showComma: true,
        showPunto: false,
      });
    });
  }
  return { filas, divisorStr };
}

// =====================================================================
// Dibujo
// =====================================================================
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
// que a veces abarcan una sola columna.
function fittedFontSize(str, fontData, desiredSize, maxWidth) {
  const w = stringWidth(str, fontData, desiredSize / UPM);
  if (w <= maxWidth) return desiredSize;
  return desiredSize * (maxWidth / w);
}

// Redondea a una precisión fija (3 decimales). Dos celdas vecinas calculan
// la coordenada de su frontera compartida con multiplicaciones distintas
// (ej. columna_i*colW+colW vs columna_(i+1)*colW), que en punto flotante
// pueden diferir por una fracción mínima. Esa diferencia basta para que el
// antialiasing dibuje esa línea con un grosor ligeramente distinto al
// resto. Redondear ambas al mismo valor elimina el desajuste.
function R(n) {
  return Math.round(n * 1000) / 1000;
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

// Como glyphRun, pero recorta (clamp) la posición horizontal si el glifo se
// saldría de [xmin, xmax] (la cuadrícula): así una coma o un punto en el
// borde nunca queda cortado, y la tabla sigue ocupando todo el ancho del
// archivo sin márgenes extra.
function glyphRunClamped(str, fontData, cx, rowCenterY, fontSizePx, ref, fill, xmin, xmax) {
  const scale = fontSizePx / UPM;
  const w = stringWidth(str, fontData, scale);
  let x = cx;
  if (x - w / 2 < xmin) x = xmin + w / 2;
  if (x + w / 2 > xmax) x = xmax - w / 2;
  return glyphRun(str, fontData, x, rowCenterY, fontSizePx, ref, fill);
}

// Línea punteada y de baja opacidad que separa visualmente el número de
// una fila del de la siguiente.
function dashedSeparator(x1, x2, y, strokeW) {
  const dash = Math.max(1.5, strokeW * 1.6).toFixed(2);
  const gap = Math.max(1.5, strokeW * 1.4).toFixed(2);
  return `<line x1="${x1.toFixed(2)}" y1="${y.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y.toFixed(2)}" stroke="#000000" stroke-opacity="0.22" stroke-width="${strokeW.toFixed(2)}" stroke-dasharray="${dash},${gap}"/>`;
}

// Fábrica de la función que dibuja una celda de encabezado con su borde
// como UNA sola figura de fondo negro (no 4 franjas independientes):
// primero un rectángulo negro que define el contorno completo de la celda,
// y encima el relleno de color, recortado hacia adentro exactamente
// `stroke` en cada lado, dejando ver el negro de abajo como marco. En una
// frontera compartida, las dos celdas vecinas dibujan el mismo rectángulo
// negro superpuesto, así que el grosor no cambia si se separan en
// PowerPoint. gridLeft/gridRight son los límites de la cuadrícula (la
// izquierda puede no ser 0 si hay espacio para el signo o el divisor):
// ahí el negro no se extiende hacia afuera y el relleno se recorta el
// grosor completo. El límite superior siempre es y = 0; el inferior nunca
// es exterior porque debajo hay filas de números.
function makeBorderedCell(gridLeft, gridRight, stroke) {
  return function borderedCell(x0, y0, w, h, fillColor) {
    x0 = R(x0);
    y0 = R(y0);
    w = R(w);
    h = R(h);
    const esBordeIzq = x0 === R(gridLeft);
    const esBordeDer = R(x0 + w) === R(gridRight);
    const esBordeSup = y0 === 0;

    const blackLeft = esBordeIzq ? R(gridLeft) : R(x0 - stroke / 2);
    const blackRight = esBordeDer ? R(gridRight) : R(x0 + w + stroke / 2);
    const blackTop = esBordeSup ? 0 : R(y0 - stroke / 2);
    const blackBottom = R(y0 + h + stroke / 2);

    const insetLeft = esBordeIzq ? stroke : stroke / 2;
    const insetRight = esBordeDer ? stroke : stroke / 2;
    const insetTop = esBordeSup ? stroke : stroke / 2;
    const insetBottom = stroke / 2;

    const fx = R(x0 + insetLeft);
    const fy = R(y0 + insetTop);
    const fw = R(w - insetLeft - insetRight);
    const fh = R(h - insetTop - insetBottom);

    return (
      `<rect x="${blackLeft}" y="${blackTop}" width="${R(blackRight - blackLeft)}" height="${R(blackBottom - blackTop)}" fill="${LINE_COLOR}"/>` +
      `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="${fillColor}"/>`
    );
  };
}

// Dibuja la tabla completa: encabezado (periodos, clases, órdenes) y una
// fila por cada elemento de `filas`. opts:
//   leftPad        espacio a la izquierda de la cuadrícula (signo o divisor)
//   separadorDesde primera fila que lleva línea punteada arriba (1 o 2)
//   extra(geo)     devuelve más elementos sueltos (galera, divisor, resto)
function dibujarTabla(filas, cfg, opts) {
  const { maxPow, minPow, showClase, digitColor } = cfg;
  // Relleno de la celda de cada orden (U, D, C; los decimales usan el de su
  // colorKey) y color de sus cifras: negro (digitColor) o, con «Color», el
  // de la celda de su orden. Sin cfg.colorCeldas, los del material.
  const colorCelda = (key) => (cfg.colorCeldas || COLORS)[key];
  const colorCifra = (pow) =>
    cfg.colorNumeros === "color"
      ? colorCelda(ORDER_BY_POW[pow].colorKey)
      : cfg.colorNumeros === "personalizado"
        ? cfg.colorNumerosPropio
        : digitColor;
  // Comas, apóstrofes y punto: rojos (COLORS.C, como siempre), negros o
  // en un color propio.
  const colorSeparador =
    cfg.colorSeparadores === "negro"
      ? digitColor
      : cfg.colorSeparadores === "personalizado"
        ? cfg.colorSeparadoresPropio
        : COLORS.C;
  const s = SCALE;
  const leftPad = opts.leftPad || 0;
  const separadorDesde = opts.separadorDesde || 1;
  const numColumnas = maxPow - minPow + 1;

  // Todas las medidas de la cuadrícula (ancho de columna, altos de fila,
  // grosor de línea) se redondean a ENTEROS: con decimales, cada celda
  // caería en una posición de sub-píxel distinta y, al convertir a
  // PowerPoint, cada borde se redondearía de forma independiente —con
  // grosores desiguales entre bordes—.
  const colW = Math.round(80 * s);
  const numPeriods = Math.ceil((maxPow + 1) / 6); // los decimales no forman periodos
  const showPeriods = cfg.showPeriodos && numPeriods > 1;
  const periodH = showPeriods ? Math.round(38 * s) : 0;
  const headerH = showClase ? Math.round(38 * s) : 0;
  const letterH = Math.round(46 * s);
  const digitH = Math.round(80 * s);
  let stroke = Math.round(2 * s);
  if (stroke < 2) stroke = 2;
  if (stroke % 2 !== 0) stroke += 1; // par, para que stroke/2 sea entero
  const fPeriod = 17 * s;
  const fHeader = 15 * s;
  const fLetter = 25 * s;
  const fDigit = 40 * s;
  const fComma = 46 * s;
  const fPoint = 34 * s;

  const gridW = colW * numColumnas;
  const totalW = leftPad + gridW;
  const totalH = periodH + headerH + letterH + digitH * filas.length;
  const borderedCell = makeBorderedCell(leftPad, totalW, stroke);

  // Dos acumuladores: "svgTable" (celdas del encabezado) se agrupa en un
  // solo <g> para que, al desagrupar una vez en PowerPoint, la tabla quede
  // como UNA sola figura. "svgNumbers" (dígitos, signos, comas, puntos y
  // líneas) queda fuera del grupo, como figuras sueltas.
  let svgTable = "";
  let svgNumbers = "";

  // Columnas de izquierda a derecha: de maxPow hasta minPow.
  const colPows = [];
  for (let p = maxPow; p >= minPow; p--) colPows.push(p);

  // Columnas consecutivas agrupadas por clase y por periodo (cada periodo
  // = 2 clases = 6 órdenes; los órdenes decimales no forman periodos).
  const classGroups = [];
  const periodGroups = [];
  colPows.forEach((pow, i) => {
    const ci = ORDER_BY_POW[pow].classIndex;
    const lastC = classGroups[classGroups.length - 1];
    if (lastC && lastC.classIndex === ci) lastC.span++;
    else classGroups.push({ classIndex: ci, startCol: i, span: 1 });
    if (pow < 0) return;
    const pi = Math.floor(pow / 6);
    const lastP = periodGroups[periodGroups.length - 1];
    if (lastP && lastP.periodIndex === pi) lastP.span++;
    else periodGroups.push({ periodIndex: pi, startCol: i, span: 1 });
  });

  const headerTop = periodH;
  const letterTop = periodH + headerH;
  const digitTop = periodH + headerH + letterH;

  // ---- Fila de periodos (opcional, solo si hay 2+ periodos) ----
  // Cada celda se agrupa: fondo+borde unido + etiqueta.
  if (showPeriods) {
    periodGroups.forEach((g) => {
      const x0 = leftPad + g.startCol * colW;
      const w = g.span * colW;
      const fill = PERIOD_COLORS[g.periodIndex % PERIOD_COLORS.length];
      const label = PERIOD_LABELS[g.periodIndex] || `Periodo ${g.periodIndex + 1}`;
      const fSize = fittedFontSize(label, GLYPH_DATA.bold, fPeriod, w * 0.92);
      svgTable += "<g>";
      svgTable += borderedCell(x0, 0, w, periodH, fill);
      svgTable += glyphRun(label, GLYPH_DATA.bold, x0 + w / 2, periodH / 2, fSize, PERIOD_REF, "#1a1a1a");
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
        ? COLORS.Millares
        : g.classIndex % 2 === 0
          ? COLORS.Unidades
          : COLORS.Millares;
      const label = esDecimal ? DECIMAL_CLASS_LABEL : CLASS_LABELS[g.classIndex];
      const fSize = fittedFontSize(label, GLYPH_DATA.bold, fHeader, w * 0.92);
      svgTable += "<g>";
      svgTable += borderedCell(x0, headerTop, w, headerH, fill);
      svgTable += glyphRun(label, GLYPH_DATA.bold, x0 + w / 2, headerTop + headerH / 2, fSize, HEADER_REF, "#1a1a1a");
      svgTable += "</g>";
    });
  }

  // ---- Fila de órdenes (C/D/U/dec/cen/mil), siempre visible ----
  colPows.forEach((pow, i) => {
    const order = ORDER_BY_POW[pow];
    const x0 = leftPad + i * colW;
    const fSize = fittedFontSize(order.cellLabel, GLYPH_DATA.bold, fLetter, colW * 0.9);
    svgTable += "<g>";
    svgTable += borderedCell(x0, letterTop, colW, letterH, colorCelda(order.colorKey));
    svgTable += glyphRun(order.cellLabel, GLYPH_DATA.bold, x0 + colW / 2, letterTop + letterH / 2, fSize, LETTERROW_REF, "#ffffff");
    svgTable += "</g>";
  });

  // ---- Filas de números (sin fondo: quedan transparentes) ----
  filas.forEach((row, ri) => {
    const { cols, hayDecimal, nivel, shift, numDigits } = row;
    const rowTop = digitTop + ri * digitH;
    const digitCY = rowTop + digitH / 2;

    // Línea sólida sobre el resultado; punteada entre los demás números.
    if (row.lineAbove) {
      svgNumbers += `<rect x="${leftPad}" y="${R(rowTop - stroke / 2)}" width="${gridW}" height="${stroke}" fill="${LINE_COLOR}"/>`;
    } else if (ri >= separadorDesde) {
      svgNumbers += dashedSeparator(leftPad, totalW, rowTop, stroke * 0.6);
    }

    colPows.forEach((pow, i) => {
      const val = cols[pow];
      if (val !== null && val !== undefined) {
        const cx = leftPad + i * colW + colW / 2;
        svgNumbers += glyphRun(String(val), GLYPH_DATA.regular, cx, digitCY, fDigit, DIGIT_REF, colorCifra(pow));
      }
    });

    // ---- Comas de millares y apóstrofes de periodo ----
    // Relativas a los dígitos ENTEROS realmente visibles del número: se
    // agrupan de 3 en 3 a la izquierda del punto (columna `nivel`, nunca
    // más allá de U) y no invaden la parte decimal. Cada frontera lleva
    // coma, salvo que además sea frontera de periodo: entonces, apóstrofe.
    if (row.showComma) {
      const leadPow = shift + numDigits - 1; // potencia del dígito visible más significativo
      // Sin punto decimal real, las columnas de potencia negativa no son
      // «parte decimal» de nada: son dígitos enteros que la jerarquía
      // desplazó (ej. "2498" en Milésimos se lee "2,498"). Entonces el ancla
      // es el dígito menos significativo escrito (columna `shift`) y la
      // alternancia coma/apóstrofe se cuenta en relativo. Con punto real,
      // nunca se agrupa más allá de la columna U (Math.max(nivel, 0)).
      const intShift = hayDecimal ? Math.max(nivel, 0) : shift;
      const intNumDigits = leadPow - intShift + 1;
      for (let k = 1; 3 * k <= intNumDigits - 1; k++) {
        const boundaryPow = intShift + 3 * k; // columna a la izquierda de la frontera
        const x = leftPad + colW * (maxPow - boundaryPow + 1);
        const esFronteraDePeriodo = hayDecimal ? boundaryPow % 6 === 0 : k % 2 === 0;
        const simbolo = esFronteraDePeriodo ? "'" : ",";
        svgNumbers += glyphRunClamped(simbolo, GLYPH_DATA.bold, x, digitCY, fComma, DIGIT_REF, colorSeparador, leftPad, totalW);
      }
    }

    // ---- Punto decimal: justo a la derecha de la columna `nivel` ----
    if (row.showPunto && hayDecimal) {
      const px = leftPad + colW * (maxPow - nivel + 1);
      svgNumbers += glyphRunClamped(".", GLYPH_DATA.bold, px, digitCY, fPoint, DIGIT_REF, colorSeparador, leftPad, totalW);
    }

    if (row.sign) {
      svgNumbers += glyphRun(row.sign, SIGN_GLYPHS, leftPad / 2, digitCY, fDigit, DIGIT_REF, digitColor);
    }
  });

  if (opts.extra) {
    svgNumbers += opts.extra({ digitTop, digitH, gridW, leftPad, totalW, totalH, stroke, fDigit, s });
  }

  // Estructura final (pensada para «Convertir en forma» de PowerPoint):
  //   svg
  //    ├─ g (LA TABLA COMPLETA — una figura al desagrupar la 1.ª vez)
  //    │   └─ g (celda de periodo / clase / orden, con su borde) × N
  //    └─ dígitos, signos, comas, puntos y líneas, sueltos desde el inicio
  // Sin <g transform> envolvente ni rect de fondo (fondo transparente).
  return (
    `<svg viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">` +
    `<g>${svgTable}</g>` +
    svgNumbers +
    `</svg>`
  );
}

// =====================================================================
// buildSVG (pura) y nombre de archivo
// =====================================================================
// cfg = { op, datos, maxPow, minPow, showClase, showPeriodos, digitColor,
//         colorCeldas: { U, D, C },
//         colorNumeros: "negro" | "color" | "personalizado", colorNumerosPropio,
//         colorSeparadores: "rojo" | "negro" | "personalizado", colorSeparadoresPropio,
//         resultado: { mostrar, comas, punto, jerarquia, puntoProductos },
//         division: { divisor, decimales } }
function buildSVG(cfg) {
  try {
    const leidos = leerTerminos(cfg);
    const d = cfg.datos;
    const signGap = Math.round(56 * SCALE);
    let svg;
    if (cfg.op === "suma" || cfg.op === "resta") {
      const esResta = cfg.op === "resta";
      const terms = esResta ? [d.minuendo, ...d.sustraendos] : d.sumandos;
      svg = dibujarTabla(filasSumaResta(leidos, terms, esResta, cfg), cfg, { leftPad: signGap });
    } else if (cfg.op === "multiplicacion") {
      svg = dibujarTabla(filasMultiplicacion(leidos, cfg), cfg, { leftPad: signGap });
    } else if (cfg.op === "division") {
      const { filas, divisorStr } = filasDivision(leidos, cfg);
      svg = dibujarTabla(filas, cfg, {
        leftPad: Math.round(110 * SCALE),
        separadorDesde: 2, // cociente y dividendo van separados por la galera
        extra: (g) => {
          // Fila 1 = dividendo: a su izquierda, el divisor; encima y a la
          // izquierda, la galera (dos rectángulos sueltos que se tocan en
          // la esquina).
          const y0 = g.digitTop + g.digitH;
          let out = glyphRun(divisorStr, GLYPH_DATA.regular, g.leftPad / 2, y0 + g.digitH / 2, g.fDigit, DIGIT_REF, cfg.digitColor);
          const xBarra = R(g.leftPad - g.stroke / 2);
          out += `<rect x="${xBarra}" y="${R(y0 - g.stroke / 2)}" width="${R(g.totalW - xBarra)}" height="${g.stroke}" fill="${LINE_COLOR}"/>`;
          out += `<rect x="${xBarra}" y="${y0}" width="${g.stroke}" height="${g.digitH}" fill="${LINE_COLOR}"/>`;
          return out;
        },
      });
    } else {
      // Sin operación: un número por fila, cada uno con su jerarquía.
      svg = dibujarTabla(
        leidos.map((r, i) => filaDe(r, d.numeros[i].formato !== false)),
        cfg,
        {},
      );
    }
    return { svg, filename: buildFilename(cfg) };
  } catch (e) {
    if (e instanceof ErrorCampo) return { error: { message: e.message, campo: e.campo } };
    throw e;
  }
}

// ---- Nombre del archivo: [Numero]-[Numero]….svg ----
// Cada número en unidades reales (aplicando su jerarquía): "24" en
// Decenas → "240", "7" en Décimos → "0.7". Sin letra de operación ni de
// jerarquía: los SVG se guardan en una carpeta por operación (y otra para
// la tabla con solo números). En las operaciones van solo los números que
// se escriben, sin el resultado.
function shiftedDigitsToStr(digitsStr, shift) {
  digitsStr = digitsStr.replace(/^0+(?=\d)/, "") || "0";
  if (shift >= 0) {
    return digitsStr + "0".repeat(shift);
  }
  const decLen = -shift;
  let s = digitsStr;
  while (s.length <= decLen) s = "0" + s;
  const entera = s.slice(0, s.length - decLen) || "0";
  const decimal = s.slice(s.length - decLen).replace(/0+$/, "");
  return decimal.length ? `${entera}.${decimal}` : entera;
}
function termToUnitValueStr(digitsStr, jerarquiaCode) {
  const nivel = NIVEL[jerarquiaCode] || 0;
  const [parteEntera, parteDecimal = ""] = digitsStr.split(".");
  const allDigits = (parteEntera || "0") + parteDecimal || "0";
  return shiftedDigitsToStr(allDigits, nivel - parteDecimal.length);
}

function buildFilename(cfg) {
  const d = cfg.datos;
  const val = (t) => termToUnitValueStr(t.numero.trim() || "0", t.jerarquia);
  let numeros;
  if (cfg.op === "ninguna") numeros = d.numeros.map(val);
  else if (cfg.op === "suma") numeros = d.sumandos.map(val);
  else if (cfg.op === "resta") numeros = [d.minuendo, ...d.sustraendos].map(val);
  else if (cfg.op === "multiplicacion") numeros = [val(d.multiplicando), val(d.multiplicador)];
  else numeros = [val(d.dividendo), cfg.division.divisor.trim()];
  return `${numeros.join("-")}.svg`;
}

// =====================================================================
// Estado e interfaz
// =====================================================================
const nuevo = (numero) => ({ numero, jerarquia: "U", formato: true });
const datos = {
  numeros: [nuevo("950000")],
  sumandos: [nuevo("436"), nuevo("523")],
  minuendo: nuevo("257"),
  sustraendos: [nuevo("124")],
  multiplicando: nuevo("2.31"),
  multiplicador: nuevo("24"),
  dividendo: nuevo("93"),
};

const $ = (id) => document.getElementById(id);

function currentMaxMin() {
  return {
    maxPow: parseInt($("hastaOrden").value, 10),
    minPow: parseInt($("hastaOrdenDecimal").value, 10),
  };
}

// HTML de las <option> de jerarquía válidas para el rango actual y el
// valor final (corregido a "U" si el guardado dejó de ser válido).
function jerarquiaOptionsHTML(selectedCode, maxPow, minPow, soloEnteros) {
  const opts = ORDERS.filter(
    (o) => o.pow <= maxPow && o.pow >= (soloEnteros ? Math.max(minPow, 0) : minPow),
  ).sort((a, b) => a.pow - b.pow);
  const value = opts.some((o) => o.code === selectedCode) ? selectedCode : "U";
  return {
    html: opts
      .map((o) => `<option value="${o.code}"${o.code === value ? " selected" : ""}>${o.label}</option>`)
      .join(""),
    value,
  };
}

const CHEVRON_SVG =
  '<svg class="selectChevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

// Una fila de la interfaz para un número. Arriba: etiqueta, interruptor
// «Coma y punto» y «Quitar» (en las filas fijas queda su hueco, para que el
// interruptor no cambie de lugar entre operaciones). Abajo: campo y
// jerarquía; debajo, la ayuda si la hay.
function filaNumeroDOM(t, etiqueta, { soloEnteros, placeholder, quitar, ayuda }) {
  const { maxPow, minPow } = currentMaxMin();
  const { html, value } = jerarquiaOptionsHTML(t.jerarquia, maxPow, minPow, soloEnteros);
  t.jerarquia = value;
  const row = document.createElement("div");
  row.className = "numeroRow";
  row.innerHTML =
    `<div class="numeroCabeza"><span class="tag">${etiqueta}</span><div class="numeroAcciones">` +
    `<label class="switch switchSm"><input type="checkbox" role="switch" class="fmt"${t.formato !== false ? " checked" : ""} />` +
    `<span class="switchTrack" aria-hidden="true"></span>Coma y punto</label>` +
    (quitar
      ? `<button type="button" class="removeBtn"${quitar.puede ? "" : " disabled"}>Quitar</button>`
      : `<span class="removeBtn removeHueco" aria-hidden="true">Quitar</span>`) +
    `</div></div>` +
    `<div class="numeroCampos">` +
    `<input type="text" class="input numero-input" inputmode="decimal" autocomplete="off" aria-label="${etiqueta}" placeholder="${placeholder}">` +
    `<span class="selectWrap"><select class="select jerarquia-select" aria-label="Jerarquía de ${etiqueta.toLowerCase()}">${html}</select>${CHEVRON_SVG}</span>` +
    `</div>` +
    (ayuda ? `<span class="numeroHint">${ayuda}</span>` : "");
  const input = row.querySelector(".numero-input");
  input.value = t.numero;
  input.addEventListener("input", () => {
    t.numero = input.value;
    render();
  });
  row.querySelector(".jerarquia-select").addEventListener("change", (e) => {
    t.jerarquia = e.target.value;
    render();
  });
  row.querySelector(".fmt").addEventListener("change", (e) => {
    t.formato = e.target.checked;
    render();
  });
  if (quitar) {
    row.querySelector(".removeBtn").addEventListener("click", () => {
      if (!quitar.puede) return;
      quitar.fn();
      renderForms();
      render();
    });
  }
  return row;
}

function llenar(id, filas) {
  const c = $(id);
  c.innerHTML = "";
  filas.forEach((f) => c.appendChild(f));
}

// Filas de una lista con un mínimo de elementos (no se puede quitar por
// debajo de él).
function filasDeLista(lista, nombre, minimo, placeholder) {
  return lista.map((t, i) =>
    filaNumeroDOM(t, `${nombre} ${i + 1}`, {
      placeholder,
      quitar: { puede: lista.length > minimo, fn: () => lista.splice(i, 1) },
    }),
  );
}

// «Decimales en el cociente»: tope de la división (se detiene antes si el
// resto es 0); llega hasta la parte decimal de la tabla. Sus
// botones del segmentado se rehacen con las opciones que quedan.
function renderDecimalesSelect() {
  const sel = $("decimales");
  const maxDec = Math.max(0, -currentMaxMin().minPow);
  const prev = parseInt(sel.value, 10);
  const opciones = [
    ["Ninguno (división entera)", "Ninguno"],
    ["Décimos (1 decimal)", "Déc"],
    ["Centésimos (2 decimales)", "Cen"],
    ["Milésimos (3 decimales)", "Mil"],
  ];
  sel.innerHTML = opciones
    .slice(0, maxDec + 1)
    .map(([l, c], i) => `<option value="${i}" data-corto="${c}">${l}</option>`)
    .join("");
  sel.value = String(!isNaN(prev) && prev <= maxDec ? prev : Math.min(2, maxDec));
  $("decimalesHint").textContent =
    maxDec === 0 ? "Elige una parte decimal para poder sacar decimales" : "Orden mínimo; para antes cuando el resto es 0";
  armarSegmentado(document.querySelector('.seg[data-for="decimales"]'));
}

function renderResultJerarquiaSelect() {
  const sel = $("resultJerarquia");
  const { maxPow, minPow } = currentMaxMin();
  const { html, value } = jerarquiaOptionsHTML(sel.value || "U", maxPow, minPow, false);
  sel.innerHTML = html;
  sel.value = value;
}

function renderForms() {
  llenar("numerosList", filasDeLista(datos.numeros, "Número", 1, "Ej. 4500 o 63.21"));
  llenar("sumandosList", filasDeLista(datos.sumandos, "Sumando", 2, "Ej. 19.5"));
  llenar("minuendoRow", [filaNumeroDOM(datos.minuendo, "Minuendo", { placeholder: "Ej. 19.5" })]);
  llenar("sustraendosList", filasDeLista(datos.sustraendos, "Sustraendo", 1, "Ej. 19.5"));
  llenar("multiplicandoRow", [filaNumeroDOM(datos.multiplicando, "Multiplicando", { placeholder: "Ej. 2.31" })]);
  llenar("multiplicadorRow", [
    filaNumeroDOM(datos.multiplicador, "Multiplicador", {
      placeholder: "Ej. 24 o 2.4",
    }),
  ]);
  llenar("dividendoRow", [
    filaNumeroDOM(datos.dividendo, "Dividendo", {
      placeholder: "Ej. 93 (entero)",
      soloEnteros: true,
      ayuda: "Número entero; puede llevar jerarquía: 93 en Unidades de millar es 93,000.",
    }),
  ]);
  renderDecimalesSelect();
  renderResultJerarquiaSelect();
}

const OP_RESULT_LABEL = {
  suma: "Mostrar resultado",
  resta: "Mostrar resultado",
  multiplicacion: "Mostrar resultado",
  division: "Mostrar cociente y procedimiento",
};

// Solo se ve el panel de la operación elegida (los demás se ocultan, no se
// quitan del DOM), el de «Resultado» cuando hay operación y, dentro de él,
// lo que es de una sola operación ([data-solo-op]).
function updateOpPanels() {
  const op = $("operacion").value;
  document.querySelectorAll("[data-op-panel]").forEach((el) => {
    el.hidden = el.dataset.opPanel !== op;
  });
  document.querySelectorAll("[data-solo-op]").forEach((el) => {
    el.hidden = el.dataset.soloOp !== op;
  });
  $("panelResultado").hidden = op === "ninguna";
  if (op !== "ninguna") $("mostrarResultadoLabel").textContent = OP_RESULT_LABEL[op];
  // El segmentado del cociente estaba oculto: su píldora se mide de nuevo.
  syncSegmented("decimales");
}

// Sin resultado, sus opciones no aplican y se ven desactivadas; sin punto,
// tampoco su jerarquía. Solo cambia la apariencia: leerConfig() sigue
// leyendo los mismos valores.
function syncResultado() {
  const off = !$("mostrarResultado").checked;
  ["mostrarComas", "mostrarPuntoResultado", "mostrarPuntoProductos", "decimales"].forEach((id) => {
    $(id).disabled = off;
  });
  const sinPunto = off || !$("mostrarPuntoResultado").checked;
  $("resultJerarquia").disabled = sinPunto;
  document.querySelector('label[for="resultJerarquia"]').classList.toggle("is-disabled", sinPunto);
  $("cocLabel").classList.toggle("is-disabled", off);
  syncSegmented("decimales");
}

// Relleno elegido para las celdas de un orden ("U", "D" o "C"): el del
// material (COLORS, tal cual, para que el SVG de defecto no cambie) o el
// propio de su <input type="color">.
function colorCeldaDe(key) {
  const celda = document.querySelector(`.colorPieza[data-pieza="${key}"]`);
  return celda.dataset.activo === "propio" ? $("celda" + key).value : COLORS[key];
}

function leerConfig() {
  const { maxPow, minPow } = currentMaxMin();
  return {
    op: $("operacion").value,
    datos,
    maxPow,
    minPow,
    showClase: $("mostrarClase").checked,
    showPeriodos: $("mostrarPeriodos").checked,
    // Signos y divisor van siempre en negro; las cifras de la
    // tabla, según «Color de los números».
    digitColor: "#000000",
    colorNumeros: $("colorNumeros").value,
    colorNumerosPropio: $("colorNumerosPropio").value,
    colorSeparadores: $("colorSeparadores").value,
    colorSeparadoresPropio: $("colorSeparadoresPropio").value,
    colorCeldas: { U: colorCeldaDe("U"), D: colorCeldaDe("D"), C: colorCeldaDe("C") },
    resultado: {
      mostrar: $("mostrarResultado").checked,
      comas: $("mostrarComas").checked,
      punto: $("mostrarPuntoResultado").checked,
      jerarquia: $("resultJerarquia").value,
      puntoProductos: $("mostrarPuntoProductos").checked,
    },
    division: {
      divisor: $("divisor").value,
      // «Coma y punto» del divisor. Hoy el divisor es de una cifra y nunca
      // lleva ni coma ni punto, así que buildSVG no lo usa todavía.
      formato: $("divisorFormato").checked,
      decimales: parseInt($("decimales").value, 10) || 0,
    },
  };
}

function render() {
  syncResultado();
  const cfg = leerConfig();
  const result = buildSVG(cfg);
  const panel = document.querySelector(`[data-op-panel="${cfg.op}"]`);
  const campo = result.error ? result.error.campo : undefined;
  // Marca en rojo el campo que causó el error y limpia los demás.
  document.querySelectorAll(".numero-input").forEach((el) => {
    el.classList.remove("hasError");
    el.removeAttribute("aria-invalid");
  });
  panel.querySelectorAll(".numero-input").forEach((el, i) => {
    el.classList.toggle("hasError", i === campo);
    if (i === campo) el.setAttribute("aria-invalid", "true");
  });
  $("divisor").classList.toggle("hasError", campo === "divisor");
  if (campo === "divisor") $("divisor").setAttribute("aria-invalid", "true");
  else $("divisor").removeAttribute("aria-invalid");
  // Con error no hay nada que guardar.
  $("downloadBtn").disabled = !!result.error;
  if (result.error) {
    $("errorMessage").textContent = result.error.message;
    $("errorCallout").style.display = "flex";
    return;
  }
  $("errorCallout").style.display = "none";
  $("svgHolder").innerHTML = result.svg;
}

async function download() {
  const result = buildSVG(leerConfig());
  if (result.error || !result.svg) return;
  await Banco.guardarSVG(result.svg, result.filename); // compartido/guardar-svg.js
}

// ---- Eventos ----
[
  "colorNumeros",
  "colorSeparadores",
  "mostrarClase",
  "mostrarPeriodos",
  "mostrarResultado",
  "mostrarComas",
  "mostrarPuntoResultado",
  "resultJerarquia",
  "mostrarPuntoProductos",
  "divisor",
  "divisorFormato",
  "decimales",
].forEach((id) => {
  $(id).addEventListener("input", render);
  $(id).addEventListener("change", render);
});
$("operacion").addEventListener("change", () => {
  updateOpPanels();
  render();
});
["hastaOrden", "hastaOrdenDecimal"].forEach((id) =>
  $(id).addEventListener("change", () => {
    renderForms();
    render();
  }),
);
[
  ["addNumero", datos.numeros],
  ["addSumando", datos.sumandos],
  ["addSustraendo", datos.sustraendos],
].forEach(([id, lista]) =>
  $(id).addEventListener("click", () => {
    lista.push(nuevo("0"));
    renderForms();
    render();
  }),
);
$("downloadBtn").addEventListener("click", download);
// Enter en cualquier campo de número (o en el divisor) guarda el SVG.
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  if (!e.target.matches(".numero-input, #divisor")) return;
  e.preventDefault();
  download();
});
// Flechas en los selectores de jerarquía: arriba o izquierda sube a la
// jerarquía mayor (U → D, CM → UMM) y abajo o derecha baja a la menor
// (U → dec, D → U). Las <option> van de menor a mayor, así que el
// comportamiento nativo del <select> (arriba = opción anterior) era el
// contrario. Con el menú desplegado, el navegador no manda estas teclas a
// la página y las flechas siguen recorriendo la lista como siempre.
const FLECHA_JERARQUIA = { ArrowUp: 1, ArrowLeft: 1, ArrowDown: -1, ArrowRight: -1 };
document.addEventListener("keydown", (e) => {
  const paso = FLECHA_JERARQUIA[e.key];
  if (!paso || e.altKey || e.ctrlKey || e.metaKey) return;
  if (!e.target.matches(".jerarquia-select, #resultJerarquia")) return;
  e.preventDefault();
  const sel = e.target;
  const i = sel.selectedIndex + paso;
  if (i < 0 || i >= sel.options.length) return;
  sel.selectedIndex = i;
  sel.dispatchEvent(new Event("change", { bubbles: true }));
});

// ---- Controles segmentados: fachada de los <select> ocultos ----
// (Como en numeros-dienes.) Cada .seg[data-for=id] maneja el <select id=id>:
// al hacer clic cambia su valor y dispara "change", así el resto del script
// sigue leyendo .value como siempre. Los botones salen de las <option>: el
// texto corto de data-corto (si no, el de la opción) y el nombre completo en
// el tooltip; en la operación, los signos de data-glifos.
function syncSegmented(id) {
  const select = $(id);
  const seg = document.querySelector(`.seg[data-for="${id}"]`);
  if (!seg) return;
  seg.classList.toggle("is-disabled", select.disabled);
  seg.querySelectorAll("button[data-value]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.value === select.value));
    b.disabled = select.disabled;
  });
  placeIndicator(seg);
}

// La píldora se mueve a la opción elegida. Se mide con offsetLeft/Top
// porque .seg es su offsetParent (position: relative).
function placeIndicator(seg) {
  const ind = seg.querySelector(".segInd");
  const b = seg.querySelector('button[data-value][aria-pressed="true"]');
  if (!ind || !b) return;
  ind.style.left = b.offsetLeft + "px";
  ind.style.top = b.offsetTop + "px";
  ind.style.width = b.offsetWidth + "px";
  ind.style.height = b.offsetHeight + "px";
}

function armarSegmentado(seg) {
  const select = $(seg.dataset.for);
  seg.querySelectorAll("button[data-value]").forEach((b) => b.remove());
  // En los de cuadrícula, el bloque «+» (.segExtra) queda al final.
  const extra = seg.querySelector(".segExtra");
  for (const opt of select.options) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.value = opt.value;
    const corto = opt.dataset.corto;
    if (opt.dataset.glifos) b.innerHTML = glifosCM(opt.dataset.glifos);
    else b.textContent = corto || opt.text;
    if (opt.dataset.glifos || (corto && corto !== opt.text)) {
      b.setAttribute("aria-label", opt.text);
      b.insertAdjacentHTML("beforeend", `<span class="segTip" role="tooltip">${opt.text}</span>`);
    }
    b.addEventListener("click", () => {
      if (select.disabled || select.value === b.dataset.value) return;
      select.value = b.dataset.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    seg.insertBefore(b, extra);
  }
  syncSegmented(seg.dataset.for);
}

// Texto con los glifos de Computer Modern (compartido/glifos.js), como en
// LaTeX, en un <svg> que toma el color del botón. Todos comparten el mismo
// alto (el de «123+−×÷»), así los signos quedan a la altura de siempre.
// En negritas: los juegos de glifos del repo no traen dígitos ni signos en
// negritas (glifos.js es cmr10/cmmi10; la negrita de glifos-tabla.js solo
// tiene letras), así que se simula con un contorno del mismo color
// (GROSOR_NEGRITA, en unidades de F). El viewBox crece medio contorno por
// lado para que no se recorte. Solo es la interfaz: no llega al SVG.
const GLIFOS_OP = "123+−×÷";
const GROSOR_NEGRITA = 36;
function glifosCM(texto) {
  const G = Banco.GLYPH_DATA;
  const F = 1000; // tamaño de trabajo; el alto real lo pone el CSS
  const s = F / G.upm;
  const m = GROSOR_NEGRITA / 2;
  let arriba = -Infinity;
  let abajo = Infinity;
  for (const ch of GLIFOS_OP) {
    abajo = Math.min(abajo, G.r[ch][1] * s);
    arriba = Math.max(arriba, G.r[ch][2] * s);
  }
  let ancho = 0;
  for (const ch of texto) ancho += G.r[ch][0] * s;
  const alto = arriba - abajo;
  return (
    `<svg viewBox="${-m} ${-m} ${Math.round(ancho + 2 * m)} ${Math.round(alto + 2 * m)}" aria-hidden="true">` +
    `<g stroke="currentColor" stroke-width="${GROSOR_NEGRITA}" stroke-linejoin="round">` +
    Banco.glyphRunSvg(texto, 0, arriba, F, "currentColor") +
    `</g></svg>`
  );
}

document.querySelectorAll(".seg[data-for]").forEach((seg) => {
  const id = seg.dataset.for;
  const ind = document.createElement("span");
  ind.className = "segInd";
  ind.setAttribute("aria-hidden", "true");
  seg.prepend(ind);
  // Al cambiar de distribución los botones cambian de tamaño.
  if (window.ResizeObserver) new ResizeObserver(() => placeIndicator(seg)).observe(seg);
  // Sin transición en la primera colocación, para que no entre deslizándose.
  requestAnimationFrame(() => {
    placeIndicator(seg);
    requestAnimationFrame(() => ind.classList.add("is-ready"));
  });
  $(id).addEventListener("change", () => syncSegmented(id));
  if (id !== "decimales") armarSegmentado(seg); // el del cociente lo arma renderDecimalesSelect
  // Flechas entre las opciones (compartido/flechas.js), también el bloque
  // «+» de los de cuadrícula. Lo que abre el selector de color («+», y
  // «Personalizado» mientras no hay color elegido) solo recibe el foco al
  // llegar: el selector se abre con Enter (el clic nativo del botón).
  Banco.flechasEnGrupo(seg, "button[data-value], .swatchSeg", {
    alLlegar: (b) => {
      if (b.classList.contains("swatchSeg")) return;
      if (b.dataset.value === "personalizado" && !seg.querySelector(".swatchSeg.tieneColor")) return;
      b.click();
    },
  });
});

// ---- Secciones plegables («¿Cómo se ve la tabla?», «… el resultado?») ----
// .is-settled llega cuando termina de abrirse: hasta entonces el contenido
// se recorta (para la animación); después se dejan ver los tooltips.
document.querySelectorAll(".plegable").forEach((seccion) => {
  const toggle = seccion.querySelector(".plegableToggle");
  const body = seccion.querySelector(".plegableBody");
  let timer = null;
  toggle.addEventListener("click", () => {
    const open = !seccion.classList.contains("is-open");
    clearTimeout(timer);
    seccion.classList.toggle("is-open", open);
    seccion.classList.remove("is-settled");
    toggle.setAttribute("aria-expanded", String(open));
    body.setAttribute("aria-hidden", String(!open));
    if (open) timer = setTimeout(() => seccion.classList.add("is-settled"), 400);
    // Los segmentados que estaban ocultos se miden de nuevo.
    seccion.querySelectorAll(".seg[data-for]").forEach(placeIndicator);
  });
});

// ---- «Color de las jerarquías»: un color por orden ----
// (Como «Color de los bloques» de numeros-dienes.) Cada orden tiene dos
// bloques: el de su color de defecto y otro que abre el selector de color
// (gris con «+» mientras no hay color propio; después, del color elegido).
// Elegir el mismo color que el de defecto no cuenta como propio.
(function () {
  const NOMBRE = { U: "las unidades", D: "las decenas", C: "las centenas" };

  // Pone al día los dos bloques de un orden y su aviso.
  function syncColor(celda) {
    const k = celda.dataset.pieza;
    const input = $("celda" + k);
    const propio = celda.querySelector('[data-opcion="propio"]');
    const tieneColor = celda.dataset.propio === "si";
    const activo = celda.dataset.activo;
    celda.querySelector('[data-opcion="defecto"]').setAttribute("aria-pressed", String(activo !== "propio"));
    propio.setAttribute("aria-pressed", String(activo === "propio"));
    propio.classList.toggle("tieneColor", tieneColor);
    propio.style.background = tieneColor ? input.value : "";
    propio.setAttribute(
      "aria-label",
      tieneColor ? `Cambiar el color propio de ${NOMBRE[k]}` : `Elegir otro color para ${NOMBRE[k]}`,
    );
    celda.querySelector(".swatchTip").textContent = tieneColor
      ? "Haz clic para cambiar este color. Para volver al original, elige el primer bloque."
      : `Elige otro color para las celdas de ${NOMBRE[k]}`;
  }

  document.querySelectorAll(".colorPieza").forEach((celda) => {
    const k = celda.dataset.pieza;
    const input = $("celda" + k);
    celda.dataset.activo = "defecto";
    celda.dataset.propio = "no";

    celda.querySelector('[data-opcion="defecto"]').addEventListener("click", () => {
      celda.dataset.activo = "defecto";
      syncColor(celda);
      render();
    });

    // Si ya hay color propio, se usa de inmediato; el selector permite cambiarlo.
    const usarPropio = () => {
      if (celda.dataset.propio !== "si" || celda.dataset.activo === "propio") return;
      celda.dataset.activo = "propio";
      syncColor(celda);
      render();
    };
    celda.querySelector('[data-opcion="propio"]').addEventListener("click", () => {
      usarPropio();
      try {
        if (input.showPicker) input.showPicker();
        else input.click();
      } catch (e) {
        input.click();
      }
    });

    // "input" llega mientras se mueve el selector; "change", al cerrarlo.
    const elegir = () => {
      const igual = input.value.toLowerCase() === COLORS[k].toLowerCase();
      celda.dataset.propio = igual ? "no" : "si";
      celda.dataset.activo = igual ? "defecto" : "propio";
      syncColor(celda);
      render();
    };
    input.addEventListener("input", elegir);
    input.addEventListener("change", elegir);

    // Flechas entre los dos bloques (compartido/flechas.js). Al llegar al
    // segundo solo se usa su color propio, si lo hay; el selector se abre
    // con Enter (el clic nativo del botón).
    Banco.flechasEnGrupo(celda, "[data-opcion]", {
      alLlegar: (b) => (b.dataset.opcion === "propio" ? usarPropio() : b.click()),
    });

    syncColor(celda);
  });
})();

// ---- «Personalizado» de «Color de los números» y «… de las comas y punto» ----
// Bajo «Personalizado», un bloque «+» abre el selector de color; al elegir
// uno, se selecciona «Personalizado» y el bloque toma ese color. Si se pulsa
// «Personalizado» sin haber elegido color, también se abre el selector.
document.querySelectorAll(".swatchSeg").forEach((boton) => {
  const id = boton.dataset.propioDe;
  const select = $(id);
  const input = $(id + "Propio");
  const tip = boton.parentElement.querySelector(".swatchTip");
  let elegido = false;

  const abrir = () => {
    try {
      if (input.showPicker) input.showPicker();
      else input.click();
    } catch (e) {
      input.click();
    }
  };
  const sync = () => {
    boton.classList.toggle("tieneColor", elegido);
    boton.classList.toggle("is-activo", select.value === "personalizado");
    boton.style.background = elegido ? input.value : "";
    const texto = elegido ? "Cambiar el color personalizado" : "Elegir un color personalizado";
    boton.setAttribute("aria-label", texto);
    tip.textContent = texto;
  };
  const elegir = () => {
    elegido = true;
    if (select.value !== "personalizado") {
      select.value = "personalizado";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    sync();
    render();
  };

  boton.addEventListener("click", abrir);
  // "input" llega mientras se mueve el selector; "change", al cerrarlo.
  input.addEventListener("input", elegir);
  input.addEventListener("change", elegir);
  select.addEventListener("change", () => {
    sync();
    if (select.value === "personalizado" && !elegido) abrir();
  });
  sync();
});

renderForms();
updateOpPanels();
render();
