// ============================================================
//  Constantes: colores y medidas
//  Las medidas son las del .tex original (en cm) y el SVG se dibuja
//  en puntos (1 unidad = 1 pt, width/height en "pt"), igual que la
//  salida PDF→SVG que se usaba antes: así la figura entra en
//  PowerPoint con el mismo tamaño que los SVG ya generados.
// ============================================================
const COL_U = "#57A639"; // unidades -> verde
const COL_D = "#1C75BC"; // decenas  -> azul
const COL_TINTA = "#000000"; // ecuación y casillas

const CM = 72 / 2.54; // pt por cm
const L = 0.55 * CM; // lado del cuadrito "unidad"
const G = 0.1 * CM; // separación entre piezas del número base
const SEP_GRUPOS = 1.6 * CM; // separación entre el número y el segundo grupo
const LADO_CAJA = 1.5 * CM; // casilla de respuesta
const Y_BASE_ECUACION = -2.15 * CM; // línea base de la ecuación (material en y=0)
const TAM_FUENTE = 24.88; // \Huge de LaTeX a 10 pt
const BORDE = 4; // border=4pt del standalone (completar la decena)

// ---- Distancia entre dos números (medidas del antiguo
// _generador-distancia-entre-numeros.tex)
const DIST_ANCHO_RECTA = 12 * CM; // largo de la recta, de extremoIzq a A
const DIST_GAP_MATERIAL = 0.45 * CM; // separación recta-material
const DIST_MARGEN_ECUACION = 1.5 * CM; // etiqueta más baja -> casillas
const DIST_BORDE = 6; // border=6pt del standalone
const DIST_TAM_ETIQUETA = 14.4; // \Large de LaTeX a 10 pt
// node[below]: el texto cuelga del punto con inner sep (0.3333 em) y
// la caja mide lo que miden los dígitos (0.644 em en cmr).
const DIST_INNER_SEP = 0.3333 * DIST_TAM_ETIQUETA;
const DIST_ALTO_DIGITO = 0.6444 * DIST_TAM_ETIQUETA;
const DIST_TRAZO_RECTA = 1; // recta y marcas de los extremos
const DIST_TRAZO_MARCA = 0.8; // marcas de b y de la decena
const DIST_TRAZO_GUIA = 0.6; // guía punteada de la etiqueta escalonada

// Borde del material concreto, el MISMO en todas las estrategias y en
// numeros-material/script.js: blanco, 1 px en
// la unidad y 1.4 px en la decena. Ese generador escribe el SVG en px
// (PowerPoint: 1 px = 0.75 pt) y este en pt, de ahí la conversión. Es
// un grosor absoluto: no cambia con el tamaño del cuadrito.
const PT_POR_PX = 0.75;
const COL_BORDE_MATERIAL = "#FFFFFF";
const TRAZO_UNIDAD = 1 * PT_POR_PX;
const TRAZO_DECENA = 1.4 * PT_POR_PX;
const TRAZO_HUECA = 1.2; // borde punteado de las unidades que se restan
const PUNTEADO_HUECA = "3 2"; // dash pattern=on 3pt off 2pt
const TRAZO_CAJA = 0.9;

// Espaciado matemático de TeX, en mu (1 mu = 1/18 em): \medmuskip
// alrededor de + y −, \thickmuskip alrededor de =, y el \; que
// \RespBox pone a cada lado de la casilla.
const MU = TAM_FUENTE / 18;
const ESP_BIN = 4 * MU;
const ESP_REL = 5 * MU;
const ESP_CAJA = 5 * MU;
// La casilla se centra en el eje matemático (\vcenter), que en cmsy10
// está a 0.25 em sobre la línea base.
const EJE_MATEMATICO = 0.25 * TAM_FUENTE;

// ---------------------------------------------------------------
// Glifos vectoriales de Computer Modern (cmr10 / cmsy10): el juego
// completo de compartido/glifos.js (extraído offline por
// fracciones/_extraer_glifos.py), del que esta figura solo usa
// dígitos, +, − y =. Cada carácter se dibuja como <path>
// porque "Convertir en forma" de PowerPoint ignora <text>/@font-face.
// Formato: { upm, r: {car: [avance, yMin, yMax, "d"]} } en unidades
// de fuente con y hacia ARRIBA.
// ---------------------------------------------------------------
const GLYPH_DATA = Banco.GLYPH_DATA; // compartido/glifos.js

function glyphFor(ch) {
  return GLYPH_DATA.r[ch] || null;
}

const _r2 = (v) => Math.round(v * 100) / 100;

// Igual que en fracciones/script.js: un <path> por carácter, con
// la escala y el volteo vertical ya aplicados a las coordenadas (sin
// transform), para que PowerPoint lo convierta a forma libre.
function glyphRunSvg(text, x, y, fontSize, fill) {
  const s = fontSize / GLYPH_DATA.upm;
  let out = "";
  let cx = x;
  for (const ch of text) {
    const g = glyphFor(ch);
    if (g[3] !== "") {
      let isX = true;
      const d = g[3].replace(/[MLQZ]|-?\d+/g, (t) => {
        if (/[MLQZ]/.test(t)) {
          isX = true;
          return t;
        }
        const v = isX ? cx + t * s : y - t * s;
        isX = !isX;
        return " " + _r2(v);
      });
      out += `<path d="${d}" fill="${fill}"/>`;
    }
    cx += g[0] * s;
  }
  return out;
}

// Ancho (avance) y alto de tinta de una cadena, desde los glifos.
function glyphMetrics(text, fontSize) {
  const s = fontSize / GLYPH_DATA.upm;
  let width = 0,
    yMax = -Infinity,
    yMin = Infinity;
  for (const ch of text) {
    const g = glyphFor(ch);
    width += g[0] * s;
    if (g[3] !== "") {
      yMax = Math.max(yMax, g[2] * s);
      yMin = Math.min(yMin, g[1] * s);
    }
  }
  return { width, ascent: yMax, descent: -yMin };
}

// ============================================================
//  Cálculo puro: piezas del material y de la ecuación
//  Todo se acumula como "primitivas" en coordenadas TikZ (pt, y hacia
//  arriba). Al final se mide la caja total y se traducen a
//  coordenadas SVG, para que el viewBox empiece en 0 0 sin necesidad
//  de un <g> envolvente.
// ============================================================

// Cuadrito "unidad" (relleno verde, borde blanco) o hueco (sin
// relleno, borde verde punteado) para lo que se resta.
function unidad(x, y, hueca) {
  return hueca
    ? { tipo: "rect", x, y, w: L, h: L, hueca: true, trazo: TRAZO_HUECA }
    : { tipo: "rect", x, y, w: L, h: L, fill: COL_U, trazo: TRAZO_UNIDAD };
}

// ---- Una decena, respetando el modo elegido (como en
// numeros-material/script.js). Devuelve { pieza, width }: la
// pieza es un rect (barra) o un grupo de 10 unidades, para que al
// desagrupar en PowerPoint cada decena se mueva entera.
function drawTen(x, y, modoDecena, formatoDiez) {
  if (modoDecena === "unidades") {
    const hijos = [];
    if (formatoDiez === "columnas") {
      // 2 columnas de 5, con separación entre filas y columnas
      // (igual que numeros-material/script.js)
      for (let r = 0; r < 5; r++) {
        const yy = y + r * (L + G);
        hijos.push(unidad(x, yy, false), unidad(x + L + G, yy, false));
      }
      return { pieza: { tipo: "grupo", hijos }, width: 2 * L + G };
    }
    // 1 columna de 10 pegadas: la altura sigue siendo exactamente 10L
    for (let k = 0; k < 10; k++) hijos.push(unidad(x, y + k * L, false));
    return { pieza: { tipo: "grupo", hijos }, width: L };
  }
  return {
    pieza: { tipo: "rect", x, y, w: L, h: 10 * L, fill: COL_D, trazo: TRAZO_DECENA },
    width: L,
  };
}

// ---- Unidades sueltas en 2 columnas (igual que el .tex): pares
// completos; si sobra 1, queda solo en la columna izquierda, arriba.
function drawLooseUnits(x, n, hueca) {
  const piezas = [];
  if (n <= 0) return { piezas, width: 0 };
  const pares = Math.floor(n / 2);
  const filas = pares + (n % 2);
  for (let r = 0; r < filas; r++) {
    const y = r * (L + G);
    piezas.push(unidad(x, y, hueca));
    if (r < pares) piezas.push(unidad(x + L + G, y, hueca));
  }
  return { piezas, width: n >= 2 ? 2 * L + G : L };
}

// ---- Número base: decenas + unidades sueltas, desde x = 0 ----
function drawNumero(n, modoDecena, formatoDiez) {
  const decenas = Math.floor((n % 100) / 10);
  const unidades = n % 10;
  const piezas = [];
  let x = 0;
  for (let i = 0; i < decenas; i++) {
    const t = drawTen(x, 0, modoDecena, formatoDiez);
    piezas.push(t.pieza);
    x += t.width + G;
  }
  if (unidades > 0) {
    const u = drawLooseUnits(x, unidades, false);
    piezas.push(...u.piezas);
    x += u.width;
  } else if (decenas > 0) {
    x -= G; // sin unidades sueltas, sobra la última separación
  }
  return { piezas, width: x };
}

// Valores de las tres casillas (la solución, solo para la interfaz).
function solucionCasillas(datos) {
  const { A, b } = datos;
  if (datos.estrategia === "distancia") {
    const decena = 10 * Math.ceil(b / 10);
    return [decena - b, A - decena, A - b];
  }
  const u = A % 10;
  if (datos.operacion === "suma") {
    const paraDecena = 10 - u;
    return [paraDecena, b - paraDecena, A + b];
  }
  return [u, b - u, A - b];
}

// Fichas de las ecuaciones: número, operador binario (+ −), relación
// (=) o casilla de respuesta.
const num = (n) => ({ t: "num", s: String(n) });
const bin = (s) => ({ t: "bin", s });
const REL_IGUAL = { t: "rel", s: "=" };
const CAJA = { t: "caja" };

// Completar la decena: "A ± b = A ± [ ] ± [ ] = [ ]"
function fichasCompletar(A, b, signo) {
  return [
    num(A), bin(signo), num(b), REL_IGUAL,
    num(A), bin(signo), CAJA, bin(signo), CAJA, REL_IGUAL, CAJA,
  ];
}

// Distancia entre dos números: "A − b = [ ] + [ ] = [ ]"
function fichasDistancia(A, b) {
  return [num(A), bin("−"), num(b), REL_IGUAL, CAJA, bin("+"), CAJA, REL_IGUAL, CAJA];
}

// ---- Ecuación ----
// Se arma como una fila de fichas con el espaciado de TeX, centrada en
// xCentro y con la línea base en yBase. Cada número es un grupo (sus
// dígitos viajan juntos).
function drawEcuacion(fichas, xCentro, yBase) {
  const anchoDe = (f) =>
    f.t === "caja" ? LADO_CAJA : glyphMetrics(f.s, TAM_FUENTE).width;
  // Espacio entre dos fichas vecinas: el de la clase del operador
  // (bin/rel) más el \; de la casilla si alguna lo es.
  const espacio = (a, c) => {
    let e = 0;
    if (a.t === "bin" || c.t === "bin") e += ESP_BIN;
    if (a.t === "rel" || c.t === "rel") e += ESP_REL;
    if (a.t === "caja") e += ESP_CAJA;
    if (c.t === "caja") e += ESP_CAJA;
    return e;
  };
  let total = 0;
  fichas.forEach((f, i) => {
    if (i > 0) total += espacio(fichas[i - 1], f);
    total += anchoDe(f);
  });

  const piezas = [];
  let x = xCentro - total / 2;
  fichas.forEach((f, i) => {
    if (i > 0) x += espacio(fichas[i - 1], f);
    const w = anchoDe(f);
    if (f.t === "caja") {
      piezas.push({
        tipo: "caja",
        x,
        y: yBase + EJE_MATEMATICO - LADO_CAJA / 2,
        w: LADO_CAJA,
        h: LADO_CAJA,
      });
    } else {
      const m = glyphMetrics(f.s, TAM_FUENTE);
      piezas.push({
        tipo: "texto",
        s: f.s,
        x,
        y: yBase,
        w,
        ascent: m.ascent,
        descent: m.descent,
        agrupar: f.t === "num" && f.s.length > 1,
      });
    }
    x += w;
  });
  return piezas;
}

// Caja de una primitiva en coordenadas TikZ, incluido medio trazo.
function cajaDe(p) {
  if (p.tipo === "grupo") {
    return p.hijos.map(cajaDe).reduce(unirCajas);
  }
  if (p.tipo === "texto") {
    return { x0: p.x, x1: p.x + p.w, y0: p.y - p.descent, y1: p.y + p.ascent };
  }
  if (p.tipo === "linea") {
    const t = p.trazo / 2;
    return {
      x0: Math.min(p.x1, p.x2) - t,
      x1: Math.max(p.x1, p.x2) + t,
      y0: Math.min(p.y1, p.y2) - t,
      y1: Math.max(p.y1, p.y2) + t,
    };
  }
  const t = (p.tipo === "caja" ? TRAZO_CAJA : p.trazo) / 2;
  return { x0: p.x - t, x1: p.x + p.w + t, y0: p.y - t, y1: p.y + p.h + t };
}
function unirCajas(a, c) {
  return {
    x0: Math.min(a.x0, c.x0),
    x1: Math.max(a.x1, c.x1),
    y0: Math.min(a.y0, c.y0),
    y1: Math.max(a.y1, c.y1),
  };
}

// ---- Recta numérica (distancia entre dos números) ----
function linea(x1, y1, x2, y2, trazo, punteado) {
  return { tipo: "linea", x1, y1, x2, y2, trazo, punteado };
}

// Etiqueta como node[below] de TikZ: centrada en x, colgando de yTop.
function etiqueta(valor, x, yTop) {
  const s = String(valor);
  const m = glyphMetrics(s, DIST_TAM_ETIQUETA);
  return {
    tipo: "texto",
    s,
    x: x - m.width / 2,
    y: yTop - DIST_INNER_SEP - DIST_ALTO_DIGITO,
    w: m.width,
    ascent: m.ascent,
    descent: m.descent,
    tam: DIST_TAM_ETIQUETA,
    agrupar: s.length > 1,
  };
}

// Cuadrito o barra del material sobre la recta, con el mismo borde
// que el resto del material (el .tex original usaba negro de 0.4 pt).
function celdaMaterial(x, w, lado, fill) {
  return {
    tipo: "rect",
    x,
    y: DIST_GAP_MATERIAL,
    w,
    h: lado,
    fill,
    trazo: fill === COL_D ? TRAZO_DECENA : TRAZO_UNIDAD,
  };
}

// ============================================================
//  Composición del SVG (común a todas las estrategias)
//  `grupos` es una lista de listas de primitivas; cada lista es un
//  <g> de primer nivel. Agrupamiento en dos niveles para PowerPoint:
//  desagrupar una vez separa los grupos; otra vez, sus piezas.
// ============================================================
function componerSVG(grupos, borde) {
  const caja = grupos
    .flat()
    .map(cajaDe)
    .reduce(unirCajas);
  const ancho = _r2(caja.x1 - caja.x0 + 2 * borde);
  const alto = _r2(caja.y1 - caja.y0 + 2 * borde);
  // TikZ (y arriba) -> SVG (y abajo), con el borde ya incluido.
  const sx = (x) => _r2(x - caja.x0 + borde);
  const sy = (y) => _r2(caja.y1 - y + borde);

  const emitir = (p) => {
    if (p.tipo === "grupo") return `<g>${p.hijos.map(emitir).join("")}</g>`;
    if (p.tipo === "texto") {
      const paths = glyphRunSvg(p.s, sx(p.x), sy(p.y), p.tam || TAM_FUENTE, COL_TINTA);
      return p.agrupar ? `<g>${paths}</g>` : paths;
    }
    if (p.tipo === "linea") {
      const dash = p.punteado ? ` stroke-dasharray="${p.punteado}"` : "";
      return `<path d="M${sx(p.x1)} ${sy(p.y1)}L${sx(p.x2)} ${sy(p.y2)}" fill="none" stroke="${COL_TINTA}" stroke-width="${p.trazo}"${dash}/>`;
    }
    const attrs = `x="${sx(p.x)}" y="${sy(p.y + p.h)}" width="${_r2(p.w)}" height="${_r2(p.h)}"`;
    if (p.tipo === "caja")
      return `<rect ${attrs} fill="none" stroke="${COL_TINTA}" stroke-width="${TRAZO_CAJA}"/>`;
    if (p.hueca)
      return `<rect ${attrs} fill="none" stroke="${COL_U}" stroke-width="${p.trazo}" stroke-dasharray="${PUNTEADO_HUECA}"/>`;
    return `<rect ${attrs} fill="${p.fill}" stroke="${COL_BORDE_MATERIAL}" stroke-width="${_r2(p.trazo)}"/>`;
  };

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}pt" height="${alto}pt" viewBox="0 0 ${ancho} ${alto}">`;
  grupos.forEach((piezas) => {
    if (piezas.length) svg += `<g>${piezas.map(emitir).join("")}</g>`;
  });
  svg += `</svg>`;
  return svg;
}

// ============================================================
//  Completar la decena
//   svg
//    ├─ g  número base (cada barra, decena de unidades o cuadrito)
//    ├─ g  unidades que se suman / se restan
//    └─ g  ecuación (cada número —grupo de dígitos—, signo y casilla)
// ============================================================
function buildCompletar(datos) {
  const { A, b, operacion, modoDecena, formatoDiez } = datos;
  const resta = operacion === "resta";

  const base = drawNumero(A, modoDecena, formatoDiez);
  // El segundo grupo arranca tras las unidades de A y un espacio mayor.
  const xSegundo = base.width + SEP_GRUPOS;
  const segundo = drawLooseUnits(xSegundo, b, resta);
  const xFinal = xSegundo + segundo.width;
  const ecuacion = drawEcuacion(
    fichasCompletar(A, b, resta ? "−" : "+"),
    xFinal / 2,
    Y_BASE_ECUACION,
  );
  return componerSVG([base.piezas, segundo.piezas, ecuacion], BORDE);
}

// ============================================================
//  Resta como distancia entre dos números
//  (antes _generador-distancia-entre-numeros.tex)
//  A − b = (decena − b) + (A − decena), con decena = la decena
//  siguiente a b. La recta va de izq a A con largo fijo; el material
//  mide siempre la distancia real de b a A (izq no lo cambia).
//   svg
//    ├─ g  recta numérica (recta, marcas y etiquetas)
//    ├─ g  material (cuadritos y barras de decena) — si se incluye
//    └─ g  ecuación
// ============================================================
function buildDistancia(datos) {
  const { A, b, izq, material } = datos;
  const decena = 10 * Math.ceil(b / 10);
  const escala = DIST_ANCHO_RECTA / (A - izq); // pt por unidad
  const xB = (b - izq) * escala;
  const xD = (decena - izq) * escala;
  const xA = (A - izq) * escala;
  const marcaExt = 0.14 * CM; // medio largo de las marcas de los extremos
  const marcaInt = 0.11 * CM; // medio largo de las marcas intermedias

  const recta = [
    linea(0, 0, xA, 0, DIST_TRAZO_RECTA),
    linea(0, -marcaExt, 0, marcaExt, DIST_TRAZO_RECTA),
    linea(xA, -marcaExt, xA, marcaExt, DIST_TRAZO_RECTA),
  ];
  // Si b coincide con el inicio de la recta, o la decena con A, su
  // marca y su etiqueta ya están en el extremo: no se repiten.
  if (b !== izq) recta.push(linea(xB, -marcaInt, xB, marcaInt, DIST_TRAZO_MARCA));
  if (decena !== A) recta.push(linea(xD, -marcaInt, xD, marcaInt, DIST_TRAZO_MARCA));

  recta.push(etiqueta(izq, 0, -0.16 * CM));
  if (b !== izq) recta.push(etiqueta(b, xB, -0.13 * CM));
  let etiquetaAbajo = -0.55 * CM; // bajo las etiquetas normales
  if (decena !== A) {
    // Si b y la decena quedan muy juntas en la recta (rangos grandes,
    // p. ej. 100 − 27), la etiqueta de la decena se escalona hacia
    // abajo con una guía punteada para que no se encimen.
    if (xD - xB < 1.1 * CM) {
      recta.push(linea(xD, -marcaInt, xD, -0.62 * CM, DIST_TRAZO_GUIA, "2 2"));
      recta.push(etiqueta(decena, xD, -0.62 * CM));
      etiquetaAbajo = -1.05 * CM;
    } else {
      recta.push(etiqueta(decena, xD, -0.13 * CM));
    }
  }
  recta.push(etiqueta(A, xA, -0.16 * CM));

  // Material: de b a la decena siempre en unidades (son menos de 10);
  // de la decena a A, decenas completas y el resto en unidades. El
  // lado del cuadrito es la escala de la recta, para que sea cuadrado.
  const mat = [];
  if (material) {
    for (let i = 0; i < decena - b; i++)
      mat.push(celdaMaterial(xB + i * escala, escala, escala, COL_U));
    const decenasDos = Math.floor((A - decena) / 10);
    const unidadesDos = (A - decena) % 10;
    for (let j = 0; j < decenasDos; j++)
      mat.push(celdaMaterial(xD + j * 10 * escala, 10 * escala, escala, COL_D));
    const xResto = xD + decenasDos * 10 * escala;
    for (let k = 0; k < unidadesDos; k++)
      mat.push(celdaMaterial(xResto + k * escala, escala, escala, COL_U));
  }

  // La línea base de la ecuación queda MARGEN por debajo de la
  // etiqueta más baja (más media casilla), centrada bajo la recta.
  const yEq = etiquetaAbajo - DIST_MARGEN_ECUACION - LADO_CAJA / 2;
  const ecuacion = drawEcuacion(fichasDistancia(A, b), xA / 2, yEq);
  return componerSVG([recta, mat, ecuacion], DIST_BORDE);
}

function buildSVG(datos) {
  return datos.estrategia === "distancia" ? buildDistancia(datos) : buildCompletar(datos);
}

// ============================================================
//  Validación
// ============================================================
// La estrategia "distancia" solo existe en la resta.
function estrategiaActual() {
  return document.getElementById("operacion").value === "resta"
    ? document.getElementById("estrategia").value
    : "completar";
}

function leerDatos() {
  if (estrategiaActual() === "distancia") return leerDistancia();
  const operacion = document.getElementById("operacion").value;
  const numeroRaw = document.getElementById("numero").value.trim();
  const segundoRaw = document.getElementById("segundo").value.trim();
  const datos = {
    estrategia: "completar",
    operacion,
    modoDecena: document.getElementById("modoDecena").value,
    formatoDiez: document.getElementById("formatoDiez").value,
  };
  if (!/^\d+$/.test(numeroRaw) || +numeroRaw < 1 || +numeroRaw > 99)
    return { error: "El número debe ser un entero de 1 a 99." };
  if (!/^\d+$/.test(segundoRaw) || +segundoRaw < 1 || +segundoRaw > 9)
    return {
      error:
        operacion === "suma"
          ? "El sumando debe ser un entero de una cifra (1 a 9)."
          : "El sustraendo debe ser un entero de una cifra (1 a 9).",
    };
  datos.A = parseInt(numeroRaw, 10);
  datos.b = parseInt(segundoRaw, 10);
  if (operacion === "resta" && datos.b > datos.A)
    return { error: "En la resta, el sustraendo no puede ser mayor que el número." };

  // Avisos no bloqueantes: la figura se genera igual, pero la
  // estrategia no tiene sentido con esos números.
  const u = datos.A % 10;
  if (operacion === "suma" && u + datos.b <= 10) {
    datos.aviso =
      u + datos.b === 10
        ? `${datos.A} + ${datos.b} completa justo la decena: la segunda casilla quedaría en 0.`
        : `${datos.A} + ${datos.b} no llega a la decena siguiente, así que no hace falta completarla.`;
  } else if (operacion === "resta" && u === 0) {
    datos.aviso = `${datos.A} ya es una decena completa: la primera casilla quedaría en 0.`;
  } else if (operacion === "resta" && datos.b <= u) {
    datos.aviso =
      datos.b === u
        ? `${datos.A} − ${datos.b} llega justo a la decena: la segunda casilla quedaría en 0.`
        : `${datos.A} − ${datos.b} no necesita romper la decena (${datos.b} es menor que las unidades de ${datos.A}).`;
  }
  return datos;
}

function leerDistancia() {
  const leer = (id) => document.getElementById(id).value.trim();
  const [aRaw, bRaw, izqRaw] = [leer("distA"), leer("distB"), leer("distIzq")];
  if (!/^\d+$/.test(aRaw) || +aRaw < 2 || +aRaw > 1000)
    return { error: "El minuendo debe ser un entero de 2 a 1000." };
  const A = parseInt(aRaw, 10);
  if (!/^\d+$/.test(bRaw) || +bRaw < 1 || +bRaw >= A)
    return { error: "El sustraendo debe ser un entero mayor que 0 y menor que el minuendo." };
  const b = parseInt(bRaw, 10);
  if (b % 10 === 0)
    return {
      error: `El sustraendo no debe ser múltiplo de 10: ${b} ya es una decena y no hay distancia hasta la siguiente.`,
    };
  const decena = 10 * Math.ceil(b / 10);
  if (decena > A)
    return {
      error: `El minuendo debe llegar al menos a ${decena}, la decena siguiente a ${b}.`,
    };
  if (!/^\d+$/.test(izqRaw) || +izqRaw > b)
    return { error: `La recta debe empezar en un entero de 0 a ${b} (el sustraendo).` };
  return {
    estrategia: "distancia",
    operacion: "resta",
    A,
    b,
    izq: parseInt(izqRaw, 10),
    material: document.getElementById("incluirMaterial").checked,
  };
}

function mostrarAviso(id, msg) {
  document.getElementById(id).style.display = msg ? "block" : "none";
  document.getElementById(id + "Msg").textContent = msg || "";
}

// ============================================================
//  UI y eventos
// ============================================================
function updateVisibility() {
  const operacion = document.getElementById("operacion").value;
  document.getElementById("segundoLabel").textContent =
    operacion === "suma" ? "Sumando" : "Sustraendo";
  const f = document.getElementById("formatoDiezField");
  if (document.getElementById("modoDecena").value === "unidades")
    f.removeAttribute("data-hide-when");
  else f.setAttribute("data-hide-when", "true");
  document.querySelectorAll(".opBtn").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.operacion === operacion));
  });

  const estrategia = estrategiaActual();
  setHidden("estrategiaField", operacion !== "resta");
  document.querySelectorAll(".tab").forEach((tab) => {
    const activa = tab.dataset.estrategia === document.getElementById("estrategia").value;
    tab.setAttribute("aria-selected", String(activa));
    tab.tabIndex = activa ? 0 : -1;
  });
  setHidden("camposCompletar", estrategia !== "completar");
  setHidden("hintCompletar", estrategia !== "completar");
  setHidden("camposDistancia", estrategia !== "distancia");
  setHidden("hintDistancia", estrategia !== "distancia");
}

function setHidden(id, hidden) {
  const el = document.getElementById(id);
  if (hidden) el.setAttribute("data-hide-when", "true");
  else el.removeAttribute("data-hide-when");
}

function render() {
  updateVisibility();
  const datos = leerDatos();
  mostrarAviso("err", datos.error);
  const solucion = document.getElementById("solucion");
  if (datos.error) {
    mostrarAviso("warn", null);
    document.getElementById("svgHolder").innerHTML = "";
    solucion.textContent = "";
    return;
  }
  mostrarAviso("warn", datos.aviso);
  document.getElementById("svgHolder").innerHTML = buildSVG(datos);
  // Con un aviso, alguna casilla quedaría en 0 o negativa: no se
  // muestra una "solución" que no corresponde a la estrategia.
  if (datos.aviso) {
    solucion.textContent = "";
    return;
  }
  const [c1, c2, c3] = solucionCasillas(datos);
  if (datos.estrategia === "distancia") {
    solucion.innerHTML = `Casillas: ${datos.A} − ${datos.b} = <b>${c1}</b> + <b>${c2}</b> = <b>${c3}</b>`;
    return;
  }
  const signo = datos.operacion === "suma" ? "+" : "−";
  solucion.innerHTML = `Casillas: ${datos.A} ${signo} <b>${c1}</b> ${signo} <b>${c2}</b> = <b>${c3}</b>`;
}

// Formato de los SVG ya guardados: 28+5.svg / 51-7.svg (completar la
// decena) y 100-19.svg / 10-3-sin-material.svg (distancia).
function buildFilename(datos) {
  if (datos.estrategia === "distancia")
    return `${datos.A}-${datos.b}${datos.material ? "" : "-sin-material"}.svg`;
  return `${datos.A}${datos.operacion === "suma" ? "+" : "-"}${datos.b}.svg`;
}


async function download() {
  const datos = leerDatos();
  if (datos.error) return;
  const svg = buildSVG(datos);
  const filename = buildFilename(datos);

  await Banco.guardarSVG(svg, filename); // compartido/guardar-svg.js
}

[
  "operacion",
  "estrategia",
  "numero",
  "segundo",
  "modoDecena",
  "formatoDiez",
  "distA",
  "distB",
  "distIzq",
  "incluirMaterial",
].forEach((id) => {
  document.getElementById(id).addEventListener("input", render);
  document.getElementById(id).addEventListener("change", render);
});
document.getElementById("downloadBtn").addEventListener("click", download);

["numero", "segundo", "distA", "distB", "distIzq"].forEach((id) => {
  document.getElementById(id).addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      download();
    }
  });
});

// Botones de operación y pestañas de estrategia: fachada de los
// <select> ocultos #operacion y #estrategia, que es lo que lee el
// script. Se cambia el valor y se dispara "change" -> render().
function setSelectValue(id, value) {
  const sel = document.getElementById(id);
  if (sel.value === value) return;
  sel.value = value;
  sel.dispatchEvent(new Event("change"));
}
document.querySelectorAll(".opBtn").forEach((btn) => {
  btn.addEventListener("click", () => setSelectValue("operacion", btn.dataset.operacion));
});
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => setSelectValue("estrategia", tab.dataset.estrategia));
  // Flechas izquierda/derecha entre pestañas, como en un tablist.
  tab.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const otra = [...document.querySelectorAll(".tab")].find((t) => t !== tab);
    setSelectValue("estrategia", otra.dataset.estrategia);
    otra.focus();
  });
});

render();
