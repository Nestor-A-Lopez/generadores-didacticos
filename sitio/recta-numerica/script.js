// ============================================================
//  Constantes (tomadas de recta-numerica.tex y de su PDF compilado)
//  El SVG se dibuja en puntos (1 unidad = 1 pt, width/height en
//  "pt"), como la salida PDF→SVG: así entra en PowerPoint con el
//  tamaño real en cm.
// ============================================================
const COL_TINTA = "#000000";
const CM = 72 / 2.54; // pt por cm
const BORDE = 5; // border=5pt del standalone
const TRAZO = 0.8; // "thick" de TikZ (recta, marcas y flechas)
const EXTENSION = 0.7 * CM; // la recta sobresale 0.7 cm de cada extremo
const MEDIA_MARCA = 0.12 * CM; // las marcas van de +0.12 a -0.12 cm
const RADIO_CERO = 1.2; // punto del 0: circle (1.2pt)

// Flecha "Latex" de arrows.meta para una línea thick, copiada del PDF
// compilado. Coordenadas locales: la base de la flecha en x = 0 y la
// punta hacia +x. La punta queda FLECHA_RETROCESO antes del extremo
// de la recta (TikZ la retrae para que el trazo en inglete no
// sobresalga) y la línea termina en la base de la flecha.
const FLECHA = {
  largo: 4.533,
  mediaBase: 1.771,
  c1: [3.9755, 0.1383],
  c2: [1.5283, 0.9211],
};
const FLECHA_RETROCESO = 6.174; // del extremo de la recta a la base

// Números: \small (9 pt) en modo matemático, node[below=2pt] bajo la
// marca. La línea base queda a esta distancia bajo la recta (medida
// en el PDF compilado).
const TAM_NUMERO = 9;
const BASE_NUMERO = -14.6;
const INNER_SEP = 3.333;

// Límite de marcas: con más, los números no caben en ninguna
// diapositiva y el SVG crece sin sentido.
const MAX_MARCAS = 200;

// ---------------------------------------------------------------
// Glifos vectoriales de Computer Modern (cmr10 / cmsy10): el juego
// completo de compartido/glifos.js (extraído offline por
// herramientas/extraer_glifos.py), del que los números de la recta
// solo usan dígitos, − (menos de cmsy10), punto y coma.
// Cada carácter se dibuja como <path> porque "Convertir en forma" de
// PowerPoint ignora <text>/@font-face.
// Formato: { upm, r: {car: [avance, yMin, yMax, "d"]} } en unidades
// de fuente con y hacia ARRIBA.
// ---------------------------------------------------------------
const GLYPH_DATA = Banco.GLYPH_DATA; // compartido/glifos.js

const _r2 = (v) => Math.round(v * 100) / 100;

// Igual que en fracciones/script.js: un <path> por carácter, con
// la escala y el volteo vertical ya aplicados a las coordenadas (sin
// transform), para que PowerPoint lo convierta a forma libre.
function glyphRunSvg(text, x, y, fontSize, fill) {
  const s = fontSize / GLYPH_DATA.upm;
  let out = "";
  let cx = x;
  for (const ch of text) {
    const g = GLYPH_DATA.r[ch];
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
    const g = GLYPH_DATA.r[ch];
    width += g[0] * s;
    yMax = Math.max(yMax, g[2] * s);
    yMin = Math.min(yMin, g[1] * s);
  }
  return { width, ascent: yMax, descent: -yMin };
}

// ============================================================
//  Cálculo puro
// ============================================================

// Como \pgfmathprintnumber con sus valores por defecto: hasta 2
// decimales sin ceros de relleno, coma de millares y signo menos
// matemático (convención de clase: punto decimal, coma de millares).
function formatoNumero(v) {
  const r = Math.round(v * 100) / 100;
  const neg = r < 0;
  const [ent, dec] = Math.abs(r).toString().split(".");
  const entMiles = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "−" : "") + entMiles + (dec ? "." + dec : "");
}

// Valores de las marcas: por índice entero, redondeados a milésimas,
// igual que el .tex (evita errores de redondeo con pasos decimales).
function valoresMarcas(izq, der, paso) {
  const n = Math.floor((der - izq) / paso + 0.00001);
  const valores = [];
  for (let i = 0; i <= n; i++) valores.push(Math.round((izq + i * paso) * 1000) / 1000);
  return valores;
}

// Primitivas en coordenadas TikZ (pt, y hacia arriba).
function linea(x1, y1, x2, y2) {
  return { tipo: "linea", x1, y1, x2, y2 };
}

// Flecha Latex con la punta hacia `dir` (+1 derecha, −1 izquierda) y
// la base en xBase.
function flecha(xBase, dir) {
  const { largo, mediaBase, c1, c2 } = FLECHA;
  return { tipo: "flecha", xBase, dir, largo, mediaBase, c1, c2 };
}

function numero(valor, x) {
  const s = formatoNumero(valor);
  const m = glyphMetrics(s, TAM_NUMERO);
  return {
    tipo: "texto",
    s,
    x: x - m.width / 2,
    y: BASE_NUMERO,
    w: m.width,
    ascent: m.ascent,
    descent: m.descent,
  };
}

function cajaDe(p) {
  const t = TRAZO / 2;
  // El nodo de TikZ suma su inner sep (0.3333 em de 10 pt) alrededor
  // del número; se cuenta igual para que el borde coincida con el .tex.
  if (p.tipo === "texto")
    return {
      x0: p.x - INNER_SEP,
      x1: p.x + p.w + INNER_SEP,
      y0: p.y - p.descent - INNER_SEP,
      y1: p.y + p.ascent,
    };
  if (p.tipo === "punto")
    return { x0: p.x - p.r, x1: p.x + p.r, y0: -p.r, y1: p.r };
  if (p.tipo === "flecha") {
    const xs = [p.xBase, p.xBase + p.dir * p.largo];
    return {
      x0: Math.min(...xs) - t,
      x1: Math.max(...xs) + t,
      y0: -p.mediaBase - t,
      y1: p.mediaBase + t,
    };
  }
  return {
    x0: Math.min(p.x1, p.x2) - t,
    x1: Math.max(p.x1, p.x2) + t,
    y0: Math.min(p.y1, p.y2) - t,
    y1: Math.max(p.y1, p.y2) + t,
  };
}
function unirCajas(a, c) {
  return {
    x0: Math.min(a.x0, c.x0),
    x1: Math.max(a.x1, c.x1),
    y0: Math.min(a.y0, c.y0),
    y1: Math.max(a.y1, c.y1),
  };
}

// ============================================================
//  buildSVG
//  Agrupamiento en dos niveles, pensado para PowerPoint:
//   svg
//    ├─ g  recta (línea, flechas y el punto del 0)
//    ├─ g  marcas (una línea por marca)
//    └─ g  números (cada número de varios glifos en su propio <g>)
//  Desagrupar una vez separa las tres partes (p. ej. para borrar los
//  números y dejar la recta en blanco); otra vez, sus piezas.
// ============================================================
function buildSVG({ izq, der, paso, separacion }) {
  const escala = (separacion * CM) / paso; // pt por unidad
  const X = (v) => v * escala;

  // Si la recta sale o termina en 0, arranca/acaba justo en el 0 y
  // sin flecha de ese lado.
  const flechaIzq = Math.abs(izq) >= 0.0001;
  const flechaDer = Math.abs(der) >= 0.0001;
  const xIni = flechaIzq ? X(izq) - EXTENSION : 0;
  const xFin = flechaDer ? X(der) + EXTENSION : 0;

  const recta = [
    linea(
      flechaIzq ? xIni + FLECHA_RETROCESO : xIni,
      0,
      flechaDer ? xFin - FLECHA_RETROCESO : xFin,
      0,
    ),
  ];
  if (flechaIzq) recta.push(flecha(xIni + FLECHA_RETROCESO, -1));
  if (flechaDer) recta.push(flecha(xFin - FLECHA_RETROCESO, 1));

  const valores = valoresMarcas(izq, der, paso);
  // El 0 se fuerza si la recta lo cruza, aunque no caiga en el paso
  // (si ya es una marca, no se duplica).
  const cruzaCero = izq < 0 && der > 0;
  if (cruzaCero) {
    if (!valores.some((v) => Math.abs(v) < 1e-9)) valores.push(0);
    recta.push({ tipo: "punto", x: 0, r: RADIO_CERO });
  }
  valores.sort((a, b) => a - b);

  const marcas = valores.map((v) => linea(X(v), MEDIA_MARCA, X(v), -MEDIA_MARCA));
  const numeros = valores.map((v) => numero(v, X(v)));

  // Aviso (no bloqueante) si dos números vecinos se enciman.
  let encimados = false;
  for (let i = 1; i < numeros.length; i++) {
    if (numeros[i - 1].x + numeros[i - 1].w + 1 > numeros[i].x) encimados = true;
  }

  const grupos = [recta, marcas, numeros];
  const caja = grupos.flat().map(cajaDe).reduce(unirCajas);
  const ancho = _r2(caja.x1 - caja.x0 + 2 * BORDE);
  const alto = _r2(caja.y1 - caja.y0 + 2 * BORDE);
  // TikZ (y arriba) -> SVG (y abajo), con el borde ya incluido.
  const sx = (x) => _r2(x - caja.x0 + BORDE);
  const sy = (y) => _r2(caja.y1 - y + BORDE);

  const emitir = (p) => {
    if (p.tipo === "texto") {
      const paths = glyphRunSvg(p.s, sx(p.x), sy(p.y), TAM_NUMERO, COL_TINTA);
      return p.s.length > 1 ? `<g>${paths}</g>` : paths;
    }
    if (p.tipo === "punto")
      return `<circle cx="${sx(p.x)}" cy="${sy(0)}" r="${p.r}" fill="${COL_TINTA}"/>`;
    if (p.tipo === "flecha") {
      // Rellena y con trazo, como la dibuja TikZ.
      const px = (x) => sx(p.xBase + p.dir * x);
      const d =
        `M${px(p.largo)} ${sy(0)}` +
        `C${px(p.c1[0])} ${sy(p.c1[1])} ${px(p.c2[0])} ${sy(p.c2[1])} ${px(0)} ${sy(p.mediaBase)}` +
        `L${px(0)} ${sy(-p.mediaBase)}` +
        `C${px(p.c2[0])} ${sy(-p.c2[1])} ${px(p.c1[0])} ${sy(-p.c1[1])} ${px(p.largo)} ${sy(0)}Z`;
      return `<path d="${d}" fill="${COL_TINTA}" stroke="${COL_TINTA}" stroke-width="${TRAZO}" stroke-linejoin="miter"/>`;
    }
    return `<path d="M${sx(p.x1)} ${sy(p.y1)}L${sx(p.x2)} ${sy(p.y2)}" fill="none" stroke="${COL_TINTA}" stroke-width="${TRAZO}"/>`;
  };

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}pt" height="${alto}pt" viewBox="0 0 ${ancho} ${alto}">`;
  grupos.forEach((piezas) => {
    if (piezas.length) svg += `<g>${piezas.map(emitir).join("")}</g>`;
  });
  svg += `</svg>`;
  return { svg, encimados };
}

// ============================================================
//  Validación
// ============================================================
function leerDatos() {
  const leer = (id) => {
    const t = document.getElementById(id).value.trim();
    return /^-?\d+(\.\d+)?$/.test(t) ? parseFloat(t) : NaN;
  };
  const izq = leer("izquierda");
  const der = leer("derecha");
  const paso = leer("paso");
  const separacion = leer("separacion");
  if (isNaN(izq) || isNaN(der))
    return { error: "Los extremos deben ser números (se admiten negativos y decimales con punto)." };
  if (izq >= der) return { error: "El extremo izquierdo debe ser menor que el derecho." };
  if (isNaN(paso) || paso <= 0) return { error: "El paso debe ser un número mayor que 0." };
  if (isNaN(separacion) || separacion < 0.1)
    return { error: "La separación entre marcas debe ser de al menos 0.1 cm." };
  const n = Math.floor((der - izq) / paso + 0.00001) + 1;
  if (n > MAX_MARCAS)
    return {
      error: `Con ese paso saldrían ${n} marcas (máximo ${MAX_MARCAS}). Usa un paso mayor.`,
    };
  const datos = { izq, der, paso, separacion };
  // El extremo derecho solo lleva marca si cae en el paso, igual que
  // en el .tex.
  const ultima = Math.round((izq + (n - 1) * paso) * 1000) / 1000;
  if (Math.abs(ultima - der) > 0.0005)
    datos.aviso = `El paso no llega exacto a ${formatoNumero(der)}: la última marca es ${formatoNumero(ultima)}.`;
  return datos;
}

function mostrarAviso(id, msg) {
  document.getElementById(id).style.display = msg ? "block" : "none";
  document.getElementById(id + "Msg").textContent = msg || "";
}

// ============================================================
//  UI y eventos
// ============================================================
function render() {
  const datos = leerDatos();
  mostrarAviso("err", datos.error);
  if (datos.error) {
    mostrarAviso("warn", null);
    document.getElementById("svgHolder").innerHTML = "";
    return;
  }
  const { svg, encimados } = buildSVG(datos);
  const avisos = [];
  if (datos.aviso) avisos.push(datos.aviso);
  if (encimados)
    avisos.push("Hay números que se enciman: aumenta la separación entre marcas o usa un paso mayor.");
  mostrarAviso("warn", avisos.join(" "));
  document.getElementById("svgHolder").innerHTML = svg;
}

// Nombre: [Inicio]-[Final]-[Paso].svg, con los valores tal como se
// escribieron, p. ej. "-5-5-1.svg" o "0-1-0.1.svg".
function buildFilename(datos) {
  return `${datos.izq}-${datos.der}-${datos.paso}.svg`;
}


async function download() {
  const datos = leerDatos();
  if (datos.error) return;
  const { svg } = buildSVG(datos);
  const filename = buildFilename(datos);

  await Banco.guardarSVG(svg, filename); // compartido/guardar-svg.js
}

["izquierda", "derecha", "paso", "separacion"].forEach((id) => {
  const el = document.getElementById(id);
  el.addEventListener("input", render);
  el.addEventListener("change", render);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      download();
    }
  });
});
document.getElementById("downloadBtn").addEventListener("click", download);

render();
