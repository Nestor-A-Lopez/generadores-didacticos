const COLORS = {
  verde: "#7CBF33",
  amarillo: "#ffd500",
  azul: "#2ED9D9",
  rojo: "#E8384F",
  naranja: "#f48600",
  morado: "#8080F0",
  rosa: "#F06EAA",
};
// Márgenes de las figuras y de las partes: negro.
const STROKE_COLOR = "#000000";
const UNIT = 40; // px por "cm" (unidad TikZ)
const PAD = 14; // margen alrededor de la figura, para que el trazo no se recorte
const STROKE_W = 2.2;

function fillPath(d, fill) {
  return `<path d="${d}" fill="${fill}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}" stroke-linejoin="round" stroke-linecap="round"/>`;
}
function fillCircleShape(cx, cy, r, fill) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>`;
}
function fillRectShape(x, y, w, h, fill) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>`;
}

function getSelectedColorHex() {
  const sel = document.getElementById("color").value;
  if (sel === "personalizado") {
    return document.getElementById("colorPersonalizado").value;
  }
  return COLORS[sel];
}

function updateVisibility() {
  const forma = document.getElementById("forma").value;
  document.getElementById("anchoField").removeAttribute("data-hide-when");
  if (forma !== "rectangulo") {
    document
      .getElementById("anchoField")
      .setAttribute("data-hide-when", "true");
  }

  const colorSel = document.getElementById("color").value;
  document
    .getElementById("colorPersonalizadoField")
    .removeAttribute("data-hide-when");
  if (colorSel !== "personalizado") {
    document
      .getElementById("colorPersonalizadoField")
      .setAttribute("data-hide-when", "true");
  }

  const showPartLabels =
    document.getElementById("showPartLabels").checked;
  const showTotalLabel =
    document.getElementById("showTotalLabel").checked;
  const labelMode = document.getElementById("labelMode").value;

  setHidden("valorEnteroField", !(showPartLabels || showTotalLabel));
  setHidden("labelModeField", !showPartLabels);
  setHidden("manualPanel", !(showPartLabels && labelMode === "manual"));
  setHidden("colorValorParteField", !showPartLabels);
  setHidden("colorValorTotalField", !showTotalLabel);
  setHidden("etiquetasBadge", !(showPartLabels || showTotalLabel));

  // Como `SwitchMenu` de Vesta: cada interruptor dice si su menú está
  // desplegado (los menús los abre el CSS con :has; ver aria-controls).
  document
    .getElementById("showTotalLabel")
    .setAttribute("aria-expanded", String(showTotalLabel));
  document
    .getElementById("showPartLabels")
    .setAttribute("aria-expanded", String(showPartLabels));

  syncDesignControls(forma, colorSel);
}

function setHidden(id, hidden) {
  const el = document.getElementById(id);
  if (hidden) el.setAttribute("data-hide-when", "true");
  else el.removeAttribute("data-hide-when");
}

// ---- Utilidades geométricas comunes ----
// Convención: se trabaja en coordenadas TikZ (y hacia arriba), y se
// convierten a píxeles SVG (y hacia abajo) en el último paso con
// toPx(x, y, offsetX, offsetY) = { x: offsetX + x*UNIT, y: offsetY - y*UNIT }
function toPx(x, y, offsetX, offsetY) {
  return { x: offsetX + x * UNIT, y: offsetY - y * UNIT };
}

// ---------------------------------------------------------------
// Glifos vectoriales de Computer Modern (cmr10 / cmmi10 / cmsy10, las
// fuentes originales de TeX), extraídos offline con fontTools por
// herramientas/extraer_glifos.py. Cada carácter se dibuja como <path> real: es lo
// único que sobrevive a "Convertir en forma" de PowerPoint, que ignora
// <text> con @font-face y cae a Cambria Math. Los datos viven en
// compartido/glifos.js (también los usan estrategias y recta-numerica).
// Para agregar caracteres, editar el script de Python y regenerar ese
// archivo con su salida.
// Formato: { upm, r: {car: [avance, yMin, yMax, "d"]}, i: {...} } en
// unidades de fuente con y hacia ARRIBA; r = recto, i = cursiva
// matemática; "d" solo usa M/L/Q/Z con pares x y alternados.
// ---------------------------------------------------------------
const GLYPH_DATA = Banco.GLYPH_DATA; // compartido/glifos.js

// Convención de LaTeX: letras latinas y griego minúsculo en cursiva
// matemática (cmmi10); dígitos, operadores, griego mayúsculo y el
// contenido de \text{} / \mathrm{} / nombres como \sin, en recto
// (cmr10). Con false, todas las letras latinas salen rectas.
const LETRAS_EN_CURSIVA = true;

// ---------------------------------------------------------------
// Etiquetas numéricas por parte + llave del entero
// ---------------------------------------------------------------
let customLabels = []; // valores manuales por parte coloreada (por índice)

// Solo de respaldo: se usa (como <text>) únicamente si un carácter no
// está en GLYPH_DATA, para que el render nunca falle. Ese carácter no
// sobrevivirá igual a "Convertir en forma" en PowerPoint.
const MATH_FONT_STACK =
  "'Latin Modern Math','STIX Two Text','Cambria Math',Cambria,Georgia,'Times New Roman',serif";

function escapeXml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

// Intenta interpretar un valor como número (acepta enteros, decimales
// y fracciones simples "a/b" o "\frac{a}{b}"). Devuelve NaN si el
// texto es una expresión LaTeX más compleja que no se puede evaluar.
function parseNumericValue(str) {
  const t = (str || "").trim();
  if (t === "") return NaN;
  if (/^-?\d+(\.\d+)?$/.test(t)) return parseFloat(t);
  let m = /^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/.exec(t);
  if (m) return parseFloat(m[1]) / parseFloat(m[2]);
  m = /^\\[dt]?frac\{(-?\d+(?:\.\d+)?)\}\{(-?\d+(?:\.\d+)?)\}$/.exec(t);
  if (m) return parseFloat(m[1]) / parseFloat(m[2]);
  return NaN;
}

// Valor automático por parte = entero ÷ denominador. Si no da un
// entero exacto, se muestra como fracción simplificada en vez de un
// decimal feo (ej. 4÷3 -> "4/3", no "1.33").
function formatAuto(valorEnteroStr, nTotal) {
  const valorEntero = parseNumericValue(valorEnteroStr);
  if (!nTotal || isNaN(valorEntero)) return "";
  if (Number.isInteger(valorEntero)) {
    if (valorEntero % nTotal === 0) return String(valorEntero / nTotal);
    const g = gcd(valorEntero, nTotal);
    const p = valorEntero / g,
      q = nTotal / g;
    return q === 1 ? String(p) : `${p}/${q}`;
  }
  return String(Math.round((valorEntero / nTotal) * 100) / 100);
}

// Solo las partes coloreadas llevan número, siguiendo la convención de
// "tomar una fracción de un entero" (la parte sin colorear no se etiqueta).
function labelForPart(
  idx,
  nColoreadas,
  nTotal,
  valorEnteroStr,
  labelMode,
) {
  if (idx >= nColoreadas) return null;
  if (labelMode === "manual") {
    const custom = customLabels[idx];
    if (custom !== undefined && custom !== "") return custom;
    return null; // sin valor automático posible en modo manual sin escribir nada
  }
  return formatAuto(valorEnteroStr, nTotal);
}

// ---------------------------------------------------------------
// Mini-motor LaTeX → SVG (vectorial, sin dependencias externas)
// Soporta: \frac \dfrac \tfrac, ^{} _{}, \sqrt{}, {...} agrupación,
// \text{} \mathrm{}, operadores y relaciones de LATEX_SYMBOLS, el
// alfabeto griego completo, y texto/números planos (incl. "a/b").
// Cada carácter se pinta con glifos vectoriales (GLYPH_DATA).
// Comandos no reconocidos se muestran como texto literal (sin fallar).
// ---------------------------------------------------------------
const LATEX_SYMBOLS = {
  times: "×",
  div: "÷",
  cdot: "·",
  pm: "±",
  mp: "∓",
  neq: "≠",
  leq: "≤",
  geq: "≥",
  approx: "≈",
  infty: "∞",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  Delta: "Δ",
  theta: "θ",
  pi: "π",
  lambda: "λ",
  mu: "μ",
  sigma: "σ",
  Sigma: "Σ",
  // En LaTeX \phi y \epsilon son las variantes ϕ / ϵ; las "var" son φ / ε.
  phi: "ϕ",
  omega: "ω",
  Omega: "Ω",
  ldots: "…",
  cdots: "⋯",
  dots: "…",
  // Resto del alfabeto griego (todo tiene glifo vectorial en GLYPH_DATA)
  epsilon: "ϵ",
  varepsilon: "ε",
  zeta: "ζ",
  eta: "η",
  vartheta: "ϑ",
  iota: "ι",
  kappa: "κ",
  nu: "ν",
  xi: "ξ",
  varpi: "ϖ",
  rho: "ρ",
  varrho: "ϱ",
  varsigma: "ς",
  tau: "τ",
  upsilon: "υ",
  varphi: "φ",
  chi: "χ",
  psi: "ψ",
  Gamma: "Γ",
  Theta: "Θ",
  Lambda: "Λ",
  Xi: "Ξ",
  Pi: "Π",
  Upsilon: "Υ",
  Phi: "Φ",
  Psi: "Ψ",
  // Operadores y relaciones adicionales / alias
  le: "≤",
  ge: "≥",
  ne: "≠",
  sim: "∼",
  equiv: "≡",
  propto: "∝",
  to: "→",
  rightarrow: "→",
  leftarrow: "←",
  leftrightarrow: "↔",
  Rightarrow: "⇒",
  Leftrightarrow: "⇔",
  in: "∈",
  cup: "∪",
  cap: "∩",
  emptyset: "∅",
  forall: "∀",
  exists: "∃",
  nabla: "∇",
  partial: "∂",
  ell: "ℓ",
  prime: "′",
  perp: "⊥",
  circ: "∘",
  bullet: "•",
  ast: "*",
  mid: "|",
  langle: "⟨",
  rangle: "⟩",
  lbrace: "{",
  rbrace: "}",
  colon: ":",
};

// Marca un subárbol como "recto" (sin cursiva matemática).
function markUpright(node) {
  if (!node) return node;
  if (node.type === "text") node.upright = true;
  for (const k of ["children"])
    if (node[k]) node[k].forEach(markUpright);
  for (const k of ["base", "exp", "num", "den", "arg"])
    if (node[k]) markUpright(node[k]);
  return node;
}

function parseLatexToNodes(src) {
  let i = 0;
  const n = src.length;
  const peek = () => src[i];
  const eof = () => i >= n;
  const skipSpaces = () => {
    while (!eof() && /\s/.test(peek())) i++;
  };

  function parsePrimary() {
    skipSpaces();
    if (eof()) return { type: "text", value: "" };
    if (peek() === "{") {
      i++;
      const children = parseSequence("}");
      if (peek() === "}") i++;
      return { type: "seq", children };
    }
    if (peek() === "\\") return parseCommand();
    const ch = src[i];
    i++;
    return { type: "text", value: ch };
  }

  function parseCommand() {
    i++; // skip backslash
    let name = "";
    while (!eof() && /[a-zA-Z]/.test(peek())) {
      name += src[i];
      i++;
    }
    if (name === "") {
      const ch = src[i];
      i++;
      return { type: "text", value: ch };
    }
    if (name === "frac" || name === "dfrac" || name === "tfrac") {
      const num = parsePrimary();
      const den = parsePrimary();
      return { type: "frac", num, den };
    }
    if (name === "sqrt") {
      const arg = parsePrimary();
      return { type: "sqrt", arg };
    }
    if (name === "text") {
      // Modo texto de LaTeX: se toma el contenido literal (conservando
      // espacios) y en recto.
      skipSpaces();
      if (peek() !== "{") return { type: "text", value: "", upright: true };
      let depth = 0,
        raw = "";
      i++;
      while (!eof() && !(peek() === "}" && depth === 0)) {
        if (peek() === "{") depth++;
        if (peek() === "}") depth--;
        raw += src[i];
        i++;
      }
      if (peek() === "}") i++;
      return { type: "text", value: raw, upright: true };
    }
    if (name === "mathrm" || name === "mathbf") {
      return markUpright(parsePrimary());
    }
    if (name === "left" || name === "right") {
      skipSpaces();
      if (peek() === "\\") {
        i++;
        const c = src[i];
        i++;
        return { type: "text", value: c === "{" || c === "}" ? c : "" };
      }
      const c = src[i];
      i++;
      return { type: "text", value: c === "." ? "" : c };
    }
    if (Object.prototype.hasOwnProperty.call(LATEX_SYMBOLS, name)) {
      return { type: "text", value: LATEX_SYMBOLS[name] };
    }
    // Comando desconocido: se muestra literal, sin romper el render. Va
    // en recto, como LaTeX dibuja \sin, \log, \cos, etc.
    return { type: "text", value: name, upright: true };
  }

  function parseSequence(endChar) {
    const nodes = [];
    while (!eof() && peek() !== endChar) {
      skipSpaces();
      if (eof() || peek() === endChar) break;
      let base = parsePrimary();
      while (!eof() && (peek() === "^" || peek() === "_")) {
        const isSup = peek() === "^";
        i++;
        const exp = parsePrimary();
        base = isSup
          ? { type: "sup", base, exp }
          : { type: "sub", base, exp };
      }
      nodes.push(base);
    }
    return nodes;
  }

  return parseSequence(undefined);
}

// ---- Medición de texto (canvas, sin dependencias externas) ----
const _measureCanvas = document.createElement("canvas");
const _measureCtx = _measureCanvas.getContext("2d");

// Busca el glifo de un carácter respetando la convención recto/cursiva.
function glyphFor(ch, upright) {
  if (LETRAS_EN_CURSIVA && !upright && GLYPH_DATA.i[ch])
    return GLYPH_DATA.i[ch];
  return GLYPH_DATA.r[ch] || GLYPH_DATA.i[ch] || null;
}

// Métricas exactas desde los propios glifos (mismo significado que
// actualBoundingBox del canvas, que es lo que el layout ya esperaba).
// Medir con los mismos datos con que se dibuja garantiza que la vista
// previa y el archivo exportado coincidan, con o sin internet.
function glyphMetrics(text, fontSize, upright) {
  const s = fontSize / GLYPH_DATA.upm;
  let width = 0,
    yMax = -Infinity,
    yMin = Infinity;
  for (const ch of text) {
    const g = glyphFor(ch, upright);
    if (!g) return null;
    width += g[0] * s;
    if (g[3] !== "") {
      yMax = Math.max(yMax, g[2]);
      yMin = Math.min(yMin, g[1]);
    }
  }
  if (yMax === -Infinity)
    return { width, ascent: fontSize * 0.72, descent: 0 };
  return {
    width,
    ascent: yMax * s || fontSize * 0.72,
    descent: -yMin * s || 0,
  };
}

// Un <path> por carácter (compartido/texto-svg.js), con la búsqueda de
// glifos de este generador para respetar la convención recto/cursiva.
function glyphRunSvg(text, x, y, fontSize, fill, upright) {
  return Banco.glyphRunSvg(text, x, y, fontSize, fill, (ch) =>
    glyphFor(ch, upright),
  );
}

function measureText(text, fontSize, upright) {
  const gm = glyphMetrics(text || "", fontSize, upright);
  if (gm) return gm;
  // Respaldo (carácter sin glifo vectorial): medición con canvas.
  _measureCtx.font = `${fontSize}px ${MATH_FONT_STACK}`;
  const m = _measureCtx.measureText(text || "");
  const width = m.width;
  const ascent =
    m.actualBoundingBoxAscent !== undefined &&
    !isNaN(m.actualBoundingBoxAscent)
      ? m.actualBoundingBoxAscent
      : fontSize * 0.72;
  const descent =
    m.actualBoundingBoxDescent !== undefined &&
    !isNaN(m.actualBoundingBoxDescent)
      ? m.actualBoundingBoxDescent
      : fontSize * 0.22;
  return {
    width,
    ascent: ascent || fontSize * 0.72,
    descent: descent || 0,
  };
}

// ---- Layout recursivo: cada nodo -> {width, ascent, descent, draw(x, baselineY, fill)} ----
function layoutNode(node, fontSize) {
  switch (node.type) {
    case "text": {
      const value = node.value || "";
      const mtr = measureText(value, fontSize, node.upright);
      const vectorial = glyphMetrics(value, fontSize, node.upright) !== null;
      return {
        width: mtr.width,
        ascent: mtr.ascent,
        descent: mtr.descent,
        draw: (x, y, fill) =>
          value === ""
            ? ""
            : vectorial
            ? glyphRunSvg(value, x, y, fontSize, fill, node.upright)
            : `<text x="${x}" y="${y}" font-family="${MATH_FONT_STACK}" font-size="${fontSize}" fill="${fill}">${escapeXml(value)}</text>`,
      };
    }
    case "seq": {
      const parts = (node.children || []).map((c) =>
        layoutNode(c, fontSize),
      );
      const width = parts.reduce((s, p) => s + p.width, 0);
      const ascent = parts.length
        ? Math.max(...parts.map((p) => p.ascent))
        : fontSize * 0.7;
      const descent = parts.length
        ? Math.max(...parts.map((p) => p.descent))
        : 0;
      return {
        width,
        ascent,
        descent,
        draw: (x, y, fill) => {
          let out = "";
          let cx = x;
          for (const p of parts) {
            out += p.draw(cx, y, fill);
            cx += p.width;
          }
          return out;
        },
      };
    }
    case "sup": {
      const base = layoutNode(node.base, fontSize);
      const expSize = Math.max(7, fontSize * 0.64);
      const exp = layoutNode(node.exp, expSize);
      const gap = fontSize * 0.04;
      const shift = fontSize * 0.38;
      return {
        width: base.width + gap + exp.width,
        ascent: Math.max(base.ascent, shift + exp.ascent),
        descent: base.descent,
        draw: (x, y, fill) =>
          base.draw(x, y, fill) +
          exp.draw(x + base.width + gap, y - shift, fill),
      };
    }
    case "sub": {
      const base = layoutNode(node.base, fontSize);
      const expSize = Math.max(7, fontSize * 0.64);
      const exp = layoutNode(node.exp, expSize);
      const gap = fontSize * 0.04;
      const shift = fontSize * 0.16;
      return {
        width: base.width + gap + exp.width,
        ascent: base.ascent,
        descent: Math.max(base.descent, shift + exp.descent),
        draw: (x, y, fill) =>
          base.draw(x, y, fill) +
          exp.draw(x + base.width + gap, y + shift, fill),
      };
    }
    case "frac": {
      const subSize = fontSize * 0.85;
      const num = layoutNode(node.num, subSize);
      const den = layoutNode(node.den, subSize);
      const pad = fontSize * 0.16;
      const barW = Math.max(num.width, den.width) + pad;
      const barThickness = Math.max(1.4, fontSize * 0.045);
      const gapAbove = fontSize * 0.09;
      const gapBelow = fontSize * 0.11;
      const barY = -fontSize * 0.28;
      const numBaseline = barY - gapAbove - num.descent;
      const denBaseline = barY + gapBelow + den.ascent;
      return {
        width: barW,
        ascent: -(numBaseline - num.ascent),
        descent: denBaseline + den.descent,
        draw: (x, y, fill) => {
          const numX = x + (barW - num.width) / 2;
          const denX = x + (barW - den.width) / 2;
          return (
            num.draw(numX, y + numBaseline, fill) +
            den.draw(denX, y + denBaseline, fill) +
            `<line x1="${x}" y1="${y + barY}" x2="${x + barW}" y2="${y + barY}" stroke="${fill}" stroke-width="${barThickness}" stroke-linecap="round"/>`
          );
        },
      };
    }
    case "sqrt": {
      const arg = layoutNode(node.arg, fontSize);
      // El radical de cmsy10 cuelga bajo la línea base (TeX lo sube):
      // se coloca de modo que su borde superior toque la barra.
      const rg = GLYPH_DATA.r["√"];
      const rs = fontSize / GLYPH_DATA.upm;
      const radical = { width: rg[0] * rs };
      const gap = fontSize * 0.06;
      const overlineY = -(arg.ascent + fontSize * 0.14);
      const barThickness = Math.max(1.2, fontSize * 0.04);
      const radicalY = overlineY - barThickness / 2 + rg[2] * rs;
      const width = radical.width + gap + arg.width + fontSize * 0.06;
      return {
        width,
        ascent: -overlineY + barThickness,
        descent: Math.max(arg.descent, radicalY - rg[1] * rs),
        draw: (x, y, fill) => {
          const argX = x + radical.width + gap;
          // La barra arranca en el extremo derecho del radical (no
          // después del hueco), para que se vea como un solo trazo.
          return (
            glyphRunSvg("√", x, y + radicalY, fontSize, fill, true) +
            arg.draw(argX, y, fill) +
            `<line x1="${x + radical.width - fontSize * 0.01}" y1="${y + overlineY}" x2="${x + width}" y2="${y + overlineY}" stroke="${fill}" stroke-width="${barThickness}" stroke-linecap="round"/>`
          );
        },
      };
    }
    default:
      return {
        width: 0,
        ascent: fontSize * 0.7,
        descent: 0,
        draw: () => "",
      };
  }
}

// Convierte accesos directos tipo "a/b" (sin backslash) en \frac{a}{b}.
function preprocessLatex(str) {
  const t = str.trim();
  const m = /^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/.exec(t);
  if (m) return `\\frac{${m[1]}}{${m[2]}}`;
  return t;
}

// Renderiza un valor (número, fracción o LaTeX) como grupo SVG
// centrado en local (0,0) horizontalmente y con baseline en y=0.
function renderLatexLabel(str, fontSize, fill) {
  const trimmed = (str || "").trim();
  if (trimmed === "") return { svg: "", width: 0, ascent: 0, descent: 0 };
  let laidOut;
  try {
    const nodes = parseLatexToNodes(preprocessLatex(trimmed));
    laidOut = layoutNode({ type: "seq", children: nodes }, fontSize);
  } catch (e) {
    laidOut = layoutNode({ type: "text", value: trimmed }, fontSize);
  }
  return {
    svg: laidOut.draw(0, 0, fill),
    width: laidOut.width,
    ascent: laidOut.ascent,
    descent: laidOut.descent,
  };
}

// Detecta si el valor es una fracción (propia "a/b" o \frac{}{}), a
// diferencia de un entero o decimal plano.
function isFractionValue(str) {
  const t = (str || "").trim();
  if (/\\[dt]?frac\{/.test(t)) return true;
  if (/^-?\d+(?:\.\d+)?\s*\/\s*-?\d+(?:\.\d+)?$/.test(t)) return true;
  return false;
}

// Los enteros/decimales se ven proporcionalmente más grandes que una
// fracción al mismo tamaño de fuente (una fracción ocupa más alto por
// el numerador+línea+denominador), así que se les aplica un factor de
// reducción adicional para que no se vean sobredimensionados.
const INTEGER_SIZE_FACTOR = 0.68;

// Igual que renderLatexLabel, pero reduce el tamaño de fuente si el
// resultado no cabe en el espacio disponible (útil en celdas chicas).
function fitLatexLabel(str, fontSize, fill, maxWidth, maxHeight) {
  if (!isFractionValue(str)) {
    if (maxWidth) maxWidth *= INTEGER_SIZE_FACTOR;
    if (maxHeight) maxHeight *= INTEGER_SIZE_FACTOR;
  }
  let result = renderLatexLabel(str, fontSize, fill);
  let scale = 1;
  if (maxWidth && result.width > maxWidth)
    scale = Math.min(scale, maxWidth / result.width);
  const totalH = result.ascent + result.descent;
  if (maxHeight && totalH > maxHeight)
    scale = Math.min(scale, maxHeight / totalH);
  if (scale < 0.999 && result.width > 0) {
    result = renderLatexLabel(str, Math.max(6, fontSize * scale), fill);
  }
  return result;
}

// Grupo <g> centrado horizontalmente y verticalmente en (cx, cy).
function centeredLabelGroup(label, cx, cy) {
  if (!label || label.svg === "") return "";
  const x = cx - label.width / 2;
  const y = cy + (label.ascent - label.descent) / 2;
  return `<g transform="translate(${x}, ${y})">${label.svg}</g>`;
}

// Llave curva (curly brace) horizontal entre (x1,y) y (x2,y), con
// profundidad "depth" hacia abajo y un vértice centrado.
function bracePath(x1, x2, y, depth, q) {
  const y1 = y,
    y2 = y;
  const dx = x1 - x2;
  const dy = y1 - y2;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len,
    uy = dy / len;
  const qx1 = x1 + q * depth * uy;
  const qy1 = y1 - q * depth * ux;
  const qx2 = x1 - 0.25 * len * ux + q * depth * uy;
  const qy2 = y1 - 0.25 * len * uy - q * depth * ux;
  const tx1 = x1 - 0.5 * len * ux + depth * uy;
  const ty1 = y1 - 0.5 * len * uy - depth * ux;
  const qx3 = x2 + q * depth * uy;
  const qy3 = y2 - q * depth * ux;
  const qx4 = x1 - 0.75 * len * ux + q * depth * uy;
  const qy4 = y1 - 0.75 * len * uy - q * depth * ux;
  return (
    `M ${x1} ${y1} Q ${qx1} ${qy1} ${qx2} ${qy2} T ${tx1} ${ty1} ` +
    `M ${x2} ${y2} Q ${qx3} ${qy3} ${qx4} ${qy4} T ${tx1} ${ty1}`
  );
}

// El tope máximo de altura que puede alcanzar el valor de UNA parte en
// el caso más generoso (pocas partes / la parte más grande posible),
// usando exactamente las mismas cifras que ya usa cada forma para sus
// partes — así el valor del entero queda del mismo tamaño máximo.
function maxPartHeightForShape(forma, isFrac) {
  if (forma === "circulo") {
    const R = 5 * UNIT;
    return isFrac ? R * 0.3 : R * 0.44;
  }
  if (forma === "rectangulo") {
    const h = 10 * UNIT; // celda más grande posible: todo el rectángulo (nTotal=1)
    return h * 0.56;
  }
  // triángulo: caso más generoso, nTotal=1 (un solo triángulo = todo el alto)
  const h = 10 * UNIT;
  return h * 0.5;
}

// Arma la figura como dos grupos hermanos de nivel superior:
//   <g> todas las partes (cada una en su <g>) </g>
//   <g> todas las etiquetas de valor </g>
// dx desplaza ambos grupos por igual (lo usa appendTotalBrace cuando
// ensancha el lienzo); se aplica a cada grupo y NO en un <g> envolvente,
// porque ese nivel extra obligaría a desagrupar dos veces en PowerPoint
// para separar valores de partes.
function composeFigura(svgPartes, svgValores, dx) {
  const tr = dx ? ` transform="translate(${dx}, 0)"` : "";
  return (
    `<g${tr}>${svgPartes}</g>` +
    (svgValores ? `<g${tr}>${svgValores}</g>` : "")
  );
}

function figura(svgPartes, svgValores, width, height) {
  return {
    svg: composeFigura(svgPartes, svgValores, 0),
    partes: svgPartes,
    valores: svgValores,
    width,
    height,
  };
}

// Agrega la llave + número/expresión total debajo de una figura ya
// construida. Si el texto del total no cabe en el ancho de la figura,
// el lienzo se ensancha (centrando la figura) en vez de recortarlo. El
// alto máximo del texto es el mismo tope que usa el valor por parte en
// su caso más grande posible (ver maxPartHeightForShape).
function appendTotalBrace(result, valorEnteroText, maxHeight, color) {
  const gap1 = 16,
    depth = 26,
    gap2 = 20,
    bottomPad = 8;
  const braceColor = color || "#000000";
  const baseFontSize = Math.max(20, maxHeight * 3);
  const label = fitLatexLabel(
    valorEnteroText,
    baseFontSize,
    braceColor,
    undefined,
    maxHeight,
  );
  const minWidth = label.width + 2 * PAD;
  const finalWidth = Math.max(result.width, minWidth);
  const shapeOffsetX = (finalWidth - result.width) / 2;
  const x1 = shapeOffsetX + PAD;
  const x2 = shapeOffsetX + result.width - PAD;
  const braceY = result.height + gap1;
  const d = bracePath(x1, x2, braceY, depth, 0.6);
  const labelBaselineY = braceY + depth + gap2 + label.ascent;
  const labelX = finalWidth / 2 - label.width / 2;
  const extraSvg =
    `<path d="${d}" fill="none" stroke="${braceColor}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<g transform="translate(${labelX}, ${labelBaselineY})">${label.svg}</g>`;
  const newHeight =
    braceY + depth + gap2 + label.ascent + label.descent + bottomPad;
  // La llave y el total quedan sueltos al final (fuera de los dos
  // grupos), como siempre.
  const shiftedShapeSvg = composeFigura(
    result.partes,
    result.valores,
    shapeOffsetX,
  );
  return {
    svg: shiftedShapeSvg + extraSvg,
    width: finalWidth,
    height: newHeight,
  };
}

// ---------------------------------------------------------------
// CÍRCULO
// ---------------------------------------------------------------
// Nota: un arco SVG de exactamente 180° (o 360°, para nTotal=1) es un
// caso ambiguo/degenerado para varios conversores (por ejemplo, al
// convertir el SVG a formas nativas en PowerPoint), lo que puede hacer
// que ese sector se dibuje colapsado a tamaño casi nulo y que el
// tamaño final de la figura varíe según el denominador. Para evitarlo,
// cada sector se divide siempre en arcos de máximo 179°.
function polarPx(angleDeg, r, cx, cy) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function wedgePath(cx, cy, r, angleStart, sweepDeg) {
  const segments = Math.max(1, Math.ceil(sweepDeg / 179));
  const step = sweepDeg / segments;
  let cur = angleStart;
  const p0 = polarPx(cur, r, cx, cy);
  let d = `M ${cx} ${cy} L ${p0.x} ${p0.y}`;
  for (let i = 0; i < segments; i++) {
    const next = cur - step;
    const p = polarPx(next, r, cx, cy);
    d += ` A ${r} ${r} 0 0 1 ${p.x} ${p.y}`;
    cur = next;
  }
  d += " Z";
  return d;
}

function buildCirculo(nColoreadas, nTotal, colorHex, labelOpts) {
  const diametro = 10;
  const r = diametro / 2;
  const R = r * UNIT;
  const size = 2 * R + 2 * PAD;
  const cx = R + PAD;
  const cy = R + PAD;
  // Tamaño "base" deliberadamente grande: el tamaño real que se ve
  // queda definido por los límites de ancho/alto de cada sector (más
  // abajo), que son los que preservan la proporción con el espacio
  // disponible — igual que en la imagen de referencia.
  const fontSize = R * 2;

  // Dos grupos hermanos: al desagrupar UNA vez en PowerPoint se
  // separan "las partes" de "los valores"; desagrupando las partes
  // otra vez, cada parte queda suelta (ver composeFigura).
  let svgPartes = "";
  let svgValores = "";

  if (nTotal === 1) {
    // Un entero: círculo completo, sin líneas divisorias internas.
    const fill = nColoreadas >= 1 ? colorHex : "#ffffff";
    let partSvg = fillCircleShape(cx, cy, R, fill);
    if (labelOpts && labelOpts.show) {
      const labelStr = labelForPart(
        0,
        nColoreadas,
        nTotal,
        labelOpts.valorEntero,
        labelOpts.mode,
      );
      if (labelStr !== null) {
        const label = fitLatexLabel(
          labelStr,
          fontSize,
          labelOpts.textColor || "#ffffff",
          R * 0.85,
          R * 0.5,
        );
        svgValores += centeredLabelGroup(label, cx, cy);
      }
    }
    svgPartes += `<g>${partSvg}</g>`;
  } else {
    const anguloParte = 360 / nTotal;
    const midRadius = R * 0.58;
    for (let i = 0; i < nTotal; i++) {
      const anguloInicio = 90 - i * anguloParte;
      const fill = i < nColoreadas ? colorHex : "#ffffff";
      const d = wedgePath(cx, cy, R, anguloInicio, anguloParte);
      // Cada parte (solo relleno + trazo) va en su propio <g> dentro del
      // grupo de partes; su número va aparte, en el grupo de valores.
      let partSvg = fillPath(d, fill);

      if (labelOpts && labelOpts.show) {
        const labelStr = labelForPart(
          i,
          nColoreadas,
          nTotal,
          labelOpts.valorEntero,
          labelOpts.mode,
        );
        if (labelStr !== null) {
          const midAngle = anguloInicio - anguloParte / 2;
          const p = polarPx(midAngle, midRadius, cx, cy);
          // Cuerda disponible en el radio donde se centra el número,
          // para que sectores angostos (denominadores grandes) no
          // hagan que los números se encimen entre sí. Para las
          // fracciones (más altas por el numerador+línea+denominador)
          // el alto también se limita por esa cuerda, no solo por un
          // valor fijo, para que no se vean sobredimensionadas en
          // sectores angostos.
          const chord =
            2 * midRadius * Math.sin((anguloParte * Math.PI) / 180 / 2);
          const maxW = Math.min(R * 0.46, chord * 0.62);
          const maxH = isFractionValue(labelStr)
            ? Math.min(R * 0.3, chord * 0.7)
            : R * 0.44;
          const label = fitLatexLabel(
            labelStr,
            fontSize,
            labelOpts.textColor || "#ffffff",
            maxW,
            maxH,
          );
          svgValores += centeredLabelGroup(label, p.x, p.y);
        }
      }

      svgPartes += `<g>${partSvg}</g>`;
    }
  }

  return figura(svgPartes, svgValores, size, size);
}

// ---------------------------------------------------------------
// RECTÁNGULO (cuadrícula)
// ---------------------------------------------------------------
function mayorDivisorHastaRaiz(nTotal) {
  const raiz = Math.floor(Math.sqrt(nTotal));
  let nFilas = 1;
  for (let i = 1; i <= raiz; i++) {
    if (nTotal % i === 0) nFilas = i;
  }
  return nFilas;
}

function buildRectangulo(
  nColoreadas,
  nTotal,
  colorHex,
  anchoTotal,
  labelOpts,
) {
  const altoTotal = 10;
  const nFilas = mayorDivisorHastaRaiz(nTotal);
  const nColumnas = nTotal / nFilas;
  const anchoCelda = anchoTotal / nColumnas;
  const altoCelda = altoTotal / nFilas;

  const W = anchoTotal * UNIT;
  const H = altoTotal * UNIT;
  const offsetX = PAD;
  const offsetY = PAD;
  const w = anchoCelda * UNIT;
  const h = altoCelda * UNIT;
  // Tamaño base deliberadamente grande: el límite real lo ponen
  // maxWidth/maxHeight al dibujar cada etiqueta (más abajo).
  const fontSize = Math.min(w, h) * 2;

  // Dos grupos hermanos: al desagrupar UNA vez en PowerPoint se
  // separan "las partes" de "los valores"; desagrupando las partes
  // otra vez, cada parte queda suelta (ver composeFigura).
  let svgPartes = "";
  let svgValores = "";
  // Se colorea por columnas, de izquierda a derecha, y cada columna de
  // abajo hacia arriba (pedido del usuario, 2026-09-28): i es el orden de
  // coloreado, que es también el de las etiquetas personalizadas. fila 0
  // es la de arriba.
  for (let i = 0; i < nTotal; i++) {
    const columna = Math.floor(i / nFilas);
    const fila = nFilas - 1 - (i % nFilas);
    const xInicio = columna * anchoCelda;
    const yInicio = -fila * altoCelda;
    const fill = i < nColoreadas ? colorHex : "#ffffff";
    const topLeft = toPx(xInicio, yInicio, offsetX, offsetY);

    // Cada parte (solo relleno + trazo) va en su propio <g> dentro del
    // grupo de partes; su número va aparte, en el grupo de valores.
    let partSvg = fillRectShape(topLeft.x, topLeft.y, w, h, fill);

    if (labelOpts && labelOpts.show) {
      const labelStr = labelForPart(
        i,
        nColoreadas,
        nTotal,
        labelOpts.valorEntero,
        labelOpts.mode,
      );
      if (labelStr !== null) {
        const cx = topLeft.x + w / 2;
        const cy = topLeft.y + h / 2;
        const label = fitLatexLabel(
          labelStr,
          fontSize,
          labelOpts.textColor || "#ffffff",
          w * 0.62,
          h * 0.56,
        );
        svgValores += centeredLabelGroup(label, cx, cy);
      }
    }

    svgPartes += `<g>${partSvg}</g>`;
  }

  return figura(svgPartes, svgValores, W + 2 * PAD, H + 2 * PAD);
}

// ---------------------------------------------------------------
// TRIÁNGULO
// ---------------------------------------------------------------
function buildTriangulo(nColoreadas, nTotal, colorHex, labelOpts) {
  const alturaTotal = 10;
  const nFilas = Math.round(Math.sqrt(nTotal));
  const lado = (2 * alturaTotal) / (nFilas * Math.sqrt(3));
  const alturaChica = (lado * Math.sqrt(3)) / 2;

  const halfWidth = (nFilas * lado) / 2;
  const W = nFilas * lado * UNIT;
  const H = alturaTotal * UNIT;
  const offsetX = PAD + halfWidth * UNIT;
  const offsetY = PAD;
  // Tamaño base deliberadamente grande: el límite real lo ponen
  // maxWidth/maxHeight al dibujar cada etiqueta (más abajo).
  const fontSize = lado * UNIT * 1.5;

  // Dos grupos hermanos: al desagrupar UNA vez en PowerPoint se
  // separan "las partes" de "los valores"; desagrupando las partes
  // otra vez, cada parte queda suelta (ver composeFigura).
  let svgPartes = "";
  let svgValores = "";
  for (let r = 0; r < nFilas; r++) {
    const yTop = -r * alturaChica;
    const yBot = -(r + 1) * alturaChica;

    for (let j = 0; j <= 2 * r; j++) {
      const t = r * r + j;
      const fill = t < nColoreadas ? colorHex : "#ffffff";
      const esPar = j % 2 === 0;
      let pts;

      if (esPar) {
        const m = j / 2;
        const xUno = -((r + 1) * lado) / 2 + m * lado;
        const xDos = xUno + lado;
        const xApice = -(r * lado) / 2 + m * lado;
        pts = [
          [xUno, yBot],
          [xDos, yBot],
          [xApice, yTop],
        ];
      } else {
        const m = (j - 1) / 2;
        const xTUno = -(r * lado) / 2 + m * lado;
        const xTDos = xTUno + lado;
        const xBase = -((r + 1) * lado) / 2 + (m + 1) * lado;
        pts = [
          [xTUno, yTop],
          [xTDos, yTop],
          [xBase, yBot],
        ];
      }

      const P = pts.map(([x, y]) => toPx(x, y, offsetX, offsetY));
      const d = `M ${P[0].x} ${P[0].y} L ${P[1].x} ${P[1].y} L ${P[2].x} ${P[2].y} Z`;
      const cxTri = (P[0].x + P[1].x + P[2].x) / 3;
      const cyTri = (P[0].y + P[1].y + P[2].y) / 3;

      // Cada parte (solo relleno + trazo) va en su propio <g> dentro del
      // grupo de partes; su número va aparte, en el grupo de valores.
      let partSvg = fillPath(d, fill);

      if (labelOpts && labelOpts.show) {
        const labelStr = labelForPart(
          t,
          nColoreadas,
          nTotal,
          labelOpts.valorEntero,
          labelOpts.mode,
        );
        if (labelStr !== null) {
          const label = fitLatexLabel(
            labelStr,
            fontSize,
            labelOpts.textColor || "#ffffff",
            lado * UNIT * 0.46,
            alturaChica * UNIT * 0.5,
          );
          svgValores += centeredLabelGroup(label, cxTri, cyTri);
        }
      }

      svgPartes += `<g>${partSvg}</g>`;
    }
  }

  return figura(svgPartes, svgValores, W + 2 * PAD, H + 2 * PAD);
}

// ---------------------------------------------------------------
// Construcción general + validaciones
// ---------------------------------------------------------------
function esCuadradoPerfecto(n) {
  const raiz = Math.round(Math.sqrt(n));
  return raiz * raiz === n;
}

function buildSVG() {
  const err = document.getElementById("err");
  const warn = document.getElementById("warn");
  // El mensaje va en un <span> interno: #err/#warn son el aviso completo
  // (con su título fijo), así que asignarles textContent lo borraría.
  const errMsg = document.getElementById("errMsg");
  const warnMsg = document.getElementById("warnMsg");
  err.style.display = "none";
  warn.style.display = "none";
  const warnings = [];

  const forma = document.getElementById("forma").value;
  const nColoreadasRaw = document.getElementById("numerador").value;
  const nTotalRaw = document.getElementById("denominador").value;
  const colorHex = getSelectedColorHex();
  const anchoTotal = parseFloat(document.getElementById("ancho").value);

  const nColoreadas = parseInt(nColoreadasRaw, 10);
  const nTotal = parseInt(nTotalRaw, 10);

  if (!Number.isInteger(nColoreadas) || nColoreadas < 0) {
    errMsg.textContent =
      "El numerador debe ser un entero mayor o igual a 0.";
    err.style.display = "block";
    return null;
  }
  if (!Number.isInteger(nTotal) || nTotal < 1) {
    errMsg.textContent =
      "El denominador debe ser un entero mayor o igual a 1.";
    err.style.display = "block";
    return null;
  }
  if (
    forma === "rectangulo" &&
    (!(anchoTotal > 0) || isNaN(anchoTotal))
  ) {
    errMsg.textContent = "El ancho total debe ser un número mayor a 0.";
    err.style.display = "block";
    return null;
  }

  if (nColoreadas > nTotal) {
    warnings.push(
      "El numerador es mayor que el denominador: se colorearán todas las partes.",
    );
  }
  if (forma === "triangulo" && !esCuadradoPerfecto(nTotal)) {
    const nFilas = Math.round(Math.sqrt(nTotal));
    warnings.push(
      `El denominador (${nTotal}) no es un cuadrado perfecto. Se usarán ${nFilas * nFilas} partes (${nFilas}×${nFilas}).`,
    );
  }

  const showPartLabels =
    document.getElementById("showPartLabels").checked;
  const showTotalLabel =
    document.getElementById("showTotalLabel").checked;
  const labelMode = document.getElementById("labelMode").value;
  const valorEnteroRaw = document.getElementById("valorEntero").value;

  if (
    (showPartLabels || showTotalLabel) &&
    valorEnteroRaw.trim() === ""
  ) {
    errMsg.textContent =
      "Escribe el valor del entero (un número, una fracción como 1/2, o una expresión LaTeX).";
    err.style.display = "block";
    return null;
  }
  if (
    showPartLabels &&
    labelMode === "auto" &&
    isNaN(parseNumericValue(valorEnteroRaw))
  ) {
    warnings.push(
      'El valor del entero no es un número simple (entero, decimal o fracción), así que el modo "Automático" no puede calcular cada parte. Usa "Personalizado por parte" para escribir cada valor a mano.',
    );
  }

  if (warnings.length) {
    warnMsg.textContent = warnings.join(" ");
    warn.style.display = "block";
  }

  const labelOpts = {
    show: showPartLabels,
    mode: labelMode,
    valorEntero: valorEnteroRaw,
    textColor: document.getElementById("colorValorParte").value,
  };

  let result;
  if (forma === "circulo") {
    result = buildCirculo(nColoreadas, nTotal, colorHex, labelOpts);
  } else if (forma === "rectangulo") {
    result = buildRectangulo(
      nColoreadas,
      nTotal,
      colorHex,
      anchoTotal,
      labelOpts,
    );
  } else {
    result = buildTriangulo(nColoreadas, nTotal, colorHex, labelOpts);
  }

  if (showTotalLabel) {
    const maxH = maxPartHeightForShape(
      forma,
      isFractionValue(valorEnteroRaw),
    );
    const colorTotal = document.getElementById("colorValorTotal").value;
    result = appendTotalBrace(result, valorEnteroRaw, maxH, colorTotal);
  }

  const svg = `<svg viewBox="0 0 ${result.width} ${result.height}" width="${result.width}" height="${result.height}" xmlns="http://www.w3.org/2000/svg">${result.svg}</svg>`;
  return svg;
}

function renderShapeOnly() {
  const svg = buildSVG();
  const holder = document.getElementById("svgHolder");
  // Con error (svg null) se vacía la vista previa: dejar la figura anterior
  // hacía pensar que era la de los valores con error.
  holder.innerHTML = svg || "";
}

// Genera los campos de texto para las etiquetas manuales (uno por
// parte coloreada). Se reconstruye solo cuando cambian el numerador,
// denominador, forma o el modo de etiquetas — nunca al escribir dentro
// de sus propios campos, para no perder el foco mientras se escribe.
function rebuildManualPanel() {
  const panel = document.getElementById("manualPanel");
  const showPartLabels =
    document.getElementById("showPartLabels").checked;
  const labelMode = document.getElementById("labelMode").value;

  if (!showPartLabels || labelMode !== "manual") {
    panel.innerHTML = "";
    return;
  }

  const nColoreadas =
    parseInt(document.getElementById("numerador").value, 10) || 0;
  const nTotal =
    parseInt(document.getElementById("denominador").value, 10) || 1;
  const valorEnteroStr = document.getElementById("valorEntero").value;
  const count = Math.max(0, Math.min(nColoreadas, 300));

  while (customLabels.length < count) customLabels.push("");
  customLabels.length = count;

  panel.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const wrap = document.createElement("div");
    wrap.className = "manualField";

    const label = document.createElement("label");
    label.textContent = `Parte ${i + 1}`;

    const input = document.createElement("input");
    input.type = "text";
    input.value = customLabels[i] || "";
    input.placeholder = formatAuto(valorEnteroStr, nTotal) || "—";
    input.addEventListener("input", (e) => {
      customLabels[i] = e.target.value;
      renderShapeOnly();
    });

    wrap.appendChild(label);
    wrap.appendChild(input);
    panel.appendChild(wrap);
  }
}

function render() {
  updateVisibility();
  rebuildManualPanel();
  renderShapeOnly();
}

function buildFilename() {
  const numerador = document.getElementById("numerador").value;
  const denominador = document.getElementById("denominador").value;
  // Con numerador 0 no hay partes coloreadas (todas en blanco, solo con
  // sus márgenes): el color no cambia la figura, así que no va en el
  // nombre. «0», «00» o «0.0» dan todos «0-[denominador].svg».
  if (numerador.trim() !== "" && Number(numerador) === 0) {
    return `0-${denominador}.svg`;
  }
  const colorSel = document.getElementById("color").value;
  const colorNombre =
    colorSel === "personalizado"
      ? document
          .getElementById("colorPersonalizado")
          .value.replace("#", "")
      : colorSel;
  return `${numerador}-${denominador}-${colorNombre}.svg`;
}


async function download() {
  // El SVG ya es autosuficiente (glifos como <path>): no hay fuente
  // que descargar ni incrustar.
  const svg = buildSVG();
  if (!svg) return;
  const filename = buildFilename();

  await Banco.guardarSVG(svg, filename); // compartido/guardar-svg.js
}

[
  "forma",
  "numerador",
  "denominador",
  "color",
  "colorPersonalizado",
  "ancho",
  "showPartLabels",
  "showTotalLabel",
  "valorEntero",
  "labelMode",
  "colorValorParte",
  "colorValorTotal",
].forEach((id) => {
  document.getElementById(id).addEventListener("input", render);
  document.getElementById(id).addEventListener("change", render);
});
document
  .getElementById("downloadBtn")
  .addEventListener("click", download);

["numerador", "denominador"].forEach((id) => {
  document.getElementById(id).addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      download();
    }
  });
});

// ============================================================
//  Interfaz (diseño «Generador fracciones» de Vesta)
// ============================================================
// Los segmentados, las muestras y los menús son solo una "fachada": el
// estado real sigue viviendo en los controles que lee todo el script
// (#forma, #color, #labelMode, #colorValorParte, #colorValorTotal…). Al
// hacer clic se cambia su valor y se dispara "change", así que el flujo
// de render() no cambia. syncDesignControls() —llamada desde
// updateVisibility() en cada render— pone la fachada al día.
function syncDesignControls(forma, colorSel) {
  // Los avisos de «Denominador» y «Ancho total» solo valen con su forma
  // (style.css los muestra según data-forma).
  document.querySelector(".page").dataset.forma = forma;
  setDescribedBy("denominador", "denominadorTip", forma === "triangulo");
  setDescribedBy("ancho", "anchoTip", forma === "rectangulo");
  // «Ancho total» se queda en pantalla, sin ancho, mientras sale (ver
  // style.css): fuera del orden de tabulación con inert.
  document.getElementById("anchoField").inert = forma !== "rectangulo";

  syncSegmented("forma");
  syncSegmented("labelMode");
  syncSwatches(colorSel);
  document.getElementById("colorPersonalizadoHex").textContent = document
    .getElementById("colorPersonalizado")
    .value.toUpperCase();
  document.querySelectorAll(".colorPick[data-for]").forEach(syncColorPick);
  syncManual();
}

function setDescribedBy(inputId, tipId, activo) {
  const input = document.getElementById(inputId);
  if (activo) input.setAttribute("aria-describedby", tipId);
  else input.removeAttribute("aria-describedby");
}

// ---- Enter en «Forma del entero» y «Color de las partes» ----
// Las flechas de todos los segmentados y de las muestras vienen de
// compartido/flechas.js (eligen la opción al llegar y Tab entra y sale del
// grupo en un paso). En estos dos, además, Enter guarda el SVG, como en
// numerador y denominador (la opción ya quedó elegida con las flechas).
function guardarConEnter(e) {
  if (e.key !== "Enter") return;
  e.preventDefault(); // sin el clic nativo del botón
  download();
}

// ---- Segmentados: fachada de los <select> ocultos (como numeros-dienes) ----
// Cada .seg[data-for=id] maneja el <select id=id>. Si el select cambia por
// otro lado, syncSegmented pone los botones al día.
function syncSegmented(id) {
  const select = document.getElementById(id);
  const seg = document.querySelector(`.seg[data-for="${id}"]`);
  if (!seg) return;
  seg.querySelectorAll("button").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.value === select.value));
  });
  placeIndicator(seg);
}

// Con data-animate, la píldora se mueve a la opción elegida. Se mide con
// offsetLeft/Top porque .seg es su offsetParent (position: relative).
function placeIndicator(seg) {
  const ind = seg.querySelector(".segInd");
  if (!ind) return;
  const b = seg.querySelector('button[aria-pressed="true"]');
  if (!b) return;
  ind.style.left = b.offsetLeft + "px";
  ind.style.top = b.offsetTop + "px";
  ind.style.width = b.offsetWidth + "px";
  ind.style.height = b.offsetHeight + "px";
}

document.querySelectorAll(".seg[data-for]").forEach((seg) => {
  const select = document.getElementById(seg.dataset.for);
  if (seg.hasAttribute("data-animate")) {
    const ind = document.createElement("span");
    ind.className = "segInd";
    ind.setAttribute("aria-hidden", "true");
    seg.prepend(ind);
    // Al cambiar de distribución, o al abrirse su menú, los botones
    // cambian de tamaño.
    if (window.ResizeObserver) new ResizeObserver(() => placeIndicator(seg)).observe(seg);
    // Sin transición en la primera colocación, para que no entre deslizándose.
    requestAnimationFrame(() => {
      placeIndicator(seg);
      requestAnimationFrame(() => ind.classList.add("is-ready"));
    });
  }
  seg.querySelectorAll("button").forEach((b) => {
    b.addEventListener("click", () => {
      if (select.value === b.dataset.value) return;
      select.value = b.dataset.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
  Banco.flechasEnGrupo(seg, "button");
  if (seg.classList.contains("segForma")) seg.addEventListener("keydown", guardarConEnter);
});

// ---- Color de las partes: muestras que manejan el <select id="color"> ----
// Un solo anillo (.swatchRing) se desliza a la muestra elegida. «＋» toma
// el color personalizado mientras está elegido. Con el teclado se recorren
// con las flechas (compartido/flechas.js).
function syncSwatches(colorSel) {
  document.querySelectorAll(".swatch").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.color === colorSel));
  });
  const custom = document.querySelector('.swatch[data-color="personalizado"]');
  custom.style.background =
    colorSel === "personalizado"
      ? document.getElementById("colorPersonalizado").value
      : "";
  placeRing();
}

function placeRing() {
  const ring = document.querySelector(".swatchRing");
  const b = document.querySelector('.swatch[aria-pressed="true"]');
  if (!b) return;
  ring.style.transform = `translate(${b.offsetLeft}px, ${b.offsetTop}px)`;
}

document.querySelectorAll(".swatch").forEach((b) => {
  b.addEventListener("click", () => {
    const select = document.getElementById("color");
    if (select.value === b.dataset.color) return;
    select.value = b.dataset.color;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
});
(function () {
  const swatches = document.querySelector(".swatches");
  Banco.flechasEnGrupo(swatches, ".swatch");
  swatches.addEventListener("keydown", guardarConEnter);
  // Las muestras pasan a otra fila según el ancho: el anillo las sigue.
  if (window.ResizeObserver) new ResizeObserver(placeRing).observe(swatches);
  requestAnimationFrame(() => {
    placeRing();
    requestAnimationFrame(() =>
      document.querySelector(".swatchRing").classList.add("is-ready"),
    );
  });
})();

// ---- Color del número de cada parte y de la llave ----
// Las dos muestras fijas copian su color en el <input type="color"> (el que
// lee el script) y avisan con "input" y "change". «+» es ese mismo input:
// con un color que no es de las muestras, lo muestra y lleva el anillo.
function syncColorPick(grupo) {
  const input = document.getElementById(grupo.dataset.for);
  const valor = input.value.toLowerCase();
  let esFijo = false;
  grupo.querySelectorAll(".colorPickSwatch").forEach((b) => {
    const elegido = b.dataset.valor === valor;
    if (elegido) esFijo = true;
    b.setAttribute("aria-pressed", String(elegido));
  });
  const mas = grupo.querySelector(".colorPickMas");
  mas.classList.toggle("is-selected", !esFijo);
  mas.style.background = esFijo ? "" : valor;
}

document.querySelectorAll(".colorPick[data-for]").forEach((grupo) => {
  const input = document.getElementById(grupo.dataset.for);
  grupo.querySelectorAll(".colorPickSwatch").forEach((b) => {
    b.addEventListener("click", () => {
      if (input.value.toLowerCase() === b.dataset.valor) return;
      input.value = b.dataset.valor;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
});

// ---- «Personalizado» y «Mismo valor» ----
// El panel de campos por parte se despliega con «Personalizado» (y la
// etiqueta de cada parte activa). «Mismo valor» es solo de la interfaz:
// escribe #valorTodasPartes en customLabels para todas las partes, así el
// SVG es el mismo que si se escribiera parte por parte. Se hace aquí, antes
// de que rebuildManualPanel recorte customLabels al numerador, y con el
// tope de 300 campos que usa rebuildManualPanel.
function syncManual() {
  const abierto =
    document.getElementById("showPartLabels").checked &&
    document.getElementById("labelMode").value === "manual";
  const menu = document.getElementById("manualMenu");
  menu.classList.toggle("is-open", abierto);
  menu.inert = !abierto;

  const mismo = document.getElementById("mismoValorTodas").checked;
  document.getElementById("manualBox").classList.toggle("is-same", mismo);
  const n = Math.max(
    0,
    Math.min(parseInt(document.getElementById("numerador").value, 10) || 0, 300),
  );
  document.getElementById("valorTodasPartesPrefijo").textContent =
    n === 1 ? "La parte" : `Las ${n} partes`;
  if (mismo) {
    const v = document.getElementById("valorTodasPartes").value;
    customLabels.length = 0;
    for (let i = 0; i < 300; i++) customLabels.push(v);
  }
}

document.getElementById("mismoValorTodas").addEventListener("change", (e) => {
  const todas = document.getElementById("valorTodasPartes");
  // Al activarlo, arranca con lo que ya tenía la primera parte.
  if (e.target.checked && todas.value === "") todas.value = customLabels[0] || "";
  render();
});
document.getElementById("valorTodasPartes").addEventListener("input", render);

// ---- Sección plegable «Etiquetas numéricas» (como numeros-dienes) ----
// .is-settled llega cuando termina de abrirse: hasta entonces el contenido
// se recorta (para la animación); después se dejan ver los tooltips.
// Cerrada, sus controles quedan inert (fuera del orden de tabulación) pero
// siguen en el DOM, porque el script los lee siempre. Las etiquetas activas
// se siguen dibujando con el panel cerrado.
let etiquetasTimer = null;
function setEtiquetasExpanded(open) {
  const seccion = document.getElementById("etiquetas");
  clearTimeout(etiquetasTimer);
  seccion.classList.toggle("is-open", open);
  seccion.classList.remove("is-settled");
  document.getElementById("etiquetasInner").inert = !open;
  document.getElementById("etiquetasBody").setAttribute("aria-hidden", String(!open));
  document
    .getElementById("etiquetasToggle")
    .setAttribute("aria-expanded", String(open));
  if (open) etiquetasTimer = setTimeout(() => seccion.classList.add("is-settled"), 400);
}
document.getElementById("etiquetasToggle").addEventListener("click", () => {
  const open =
    document.getElementById("etiquetasToggle").getAttribute("aria-expanded") ===
    "true";
  setEtiquetasExpanded(!open);
});
// Si el navegador restauró los checkboxes al recargar, se abre el panel
// para que las etiquetas activas no queden escondidas.
setEtiquetasExpanded(
  document.getElementById("showPartLabels").checked ||
    document.getElementById("showTotalLabel").checked,
);

render();
