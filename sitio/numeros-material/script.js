// ============================================================
//  Colores (mismos que en el material .tex de referencia)
// ============================================================
const COL_U = "#57A639"; // unidades -> verde
const COL_D = "#1C75BC"; // decenas  -> azul
const COL_C = "#CC2027"; // centenas -> rojo

function getOptions() {
  const numeroRaw = document.getElementById("numero").value.trim();
  const L = parseFloat(document.getElementById("tamano").value);
  const modoCentena = document.getElementById("modoCentena").value; // bloque | decenas | unidades
  const modoDecena = document.getElementById("modoDecena").value; // bloque | unidades
  const formatoDiez = document.getElementById("formatoDiez").value; // columna | columnas
  const mostrarDesglose =
    document.getElementById("mostrarDesglose").checked;
  return {
    numeroRaw,
    L,
    modoCentena,
    modoDecena,
    formatoDiez,
    mostrarDesglose,
  };
}

function showError(msg) {
  const err = document.getElementById("err");
  if (msg) {
    err.textContent = msg;
    err.style.display = "block";
  } else {
    err.style.display = "none";
  }
}

function updateDisabledStates() {
  const modoDecena = document.getElementById("modoDecena").value;
  document.getElementById("formatoDiez").disabled =
    modoDecena !== "unidades";
}

// ---- Ladrillo básico: un cuadrito "unidad" ----
function drawUnit(x, y, L) {
  return `<rect x="${x}" y="${y}" width="${L}" height="${L}" fill="${COL_U}" stroke="#ffffff" stroke-width="1"/>`;
}

// ---- Una decena, respetando el modo elegido ----
// Devuelve { svg, width, height } — la huella SIEMPRE es consistente
// dentro de cada modo (bloque: L x 10L; unidades: depende del formato).
function drawTen(x, y, L, G, modoDecena, formatoDiez) {
  if (modoDecena === "unidades") {
    if (formatoDiez === "columnas") {
      // 2 columnas de 5 unidades, con separación entre filas y columnas
      let svg = "";
      for (let r = 0; r < 5; r++) {
        const yy = y + r * (L + G);
        svg += drawUnit(x, yy, L);
        svg += drawUnit(x + L + G, yy, L);
      }
      return { svg, width: 2 * L + G, height: 5 * L + 4 * G };
    }
    // 1 columna de 10 unidades, pegadas (sin huecos) para que la altura
    // total siga siendo exactamente 10*L
    let svg = "";
    for (let k = 0; k < 10; k++) {
      svg += drawUnit(x, y + k * L, L);
    }
    return { svg, width: L, height: 10 * L };
  }
  // bloque sólido (barra azul)
  const svg = `<rect x="${x}" y="${y}" width="${L}" height="${10 * L}" fill="${COL_D}" stroke="#ffffff" stroke-width="1.4"/>`;
  return { svg, width: L, height: 10 * L };
}

// ---- Una centena, respetando el modo elegido ----
function drawHundred(x, y, L, G, modoCentena, modoDecena, formatoDiez) {
  if (modoCentena === "unidades") {
    // cuadrícula de 10x10 unidades, pegadas
    let svg = "";
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        svg += drawUnit(x + col * L, y + row * L, L);
      }
    }
    return { svg, width: 10 * L, height: 10 * L };
  }
  if (modoCentena === "decenas") {
    // 10 decenas puestas una junto a otra, pegadas (sin separación
    // entre ellas), cada una respetando a su vez el modo de decena
    let svg = "";
    let xx = x;
    let maxH = 0;
    for (let k = 0; k < 10; k++) {
      const t = drawTen(xx, y, L, G, modoDecena, formatoDiez);
      svg += t.svg;
      xx += t.width;
      maxH = Math.max(maxH, t.height);
    }
    return { svg, width: xx - x, height: maxH };
  }
  // bloque sólido (cuadrado rojo)
  const svg = `<rect x="${x}" y="${y}" width="${10 * L}" height="${10 * L}" fill="${COL_C}" stroke="#ffffff" stroke-width="1.4"/>`;
  return { svg, width: 10 * L, height: 10 * L };
}

// ---- Unidades sueltas, en 2 columnas (igual que el material .tex) ----
// Pares -> se apilan completos en 2 columnas.
// Impar -> el residuo se deja SOLO en la columna izquierda, arriba de todo.
function drawLooseUnits(x, L, G, unidades) {
  if (unidades <= 0) return { svg: "", width: 0, height: 0 };
  const pares = Math.floor(unidades / 2);
  const resto = unidades % 2;
  const filas = pares + resto;
  let svg = "";
  for (let r = 0; r < filas; r++) {
    const y = r * (L + G);
    svg += drawUnit(x, y, L);
    if (r < pares) {
      svg += drawUnit(x + L + G, y, L);
    }
  }
  const width = unidades >= 2 ? 2 * L + G : L;
  const height = filas * L + (filas - 1) * G;
  return { svg, width, height };
}

// ---- Construye el SVG completo para el número dado ----
function buildSVG(n, opts) {
  const { L, modoCentena, modoDecena, formatoDiez } = opts;
  const G = L * 0.22;
  const margin = L * 0.9;

  const centenas = Math.floor(n / 100);
  const decenas = Math.floor((n % 100) / 10);
  const unidades = n % 10;

  let x = 0;
  let bodySvg = "";
  let maxH = 0;
  let usedAny = false;

  for (let i = 0; i < centenas; i++) {
    const b = drawHundred(
      x,
      0,
      L,
      G,
      modoCentena,
      modoDecena,
      formatoDiez,
    );
    bodySvg += b.svg;
    x += b.width + G;
    maxH = Math.max(maxH, b.height);
    usedAny = true;
  }
  for (let i = 0; i < decenas; i++) {
    const b = drawTen(x, 0, L, G, modoDecena, formatoDiez);
    bodySvg += b.svg;
    x += b.width + G;
    maxH = Math.max(maxH, b.height);
    usedAny = true;
  }
  if (unidades > 0) {
    const b = drawLooseUnits(x, L, G, unidades);
    bodySvg += b.svg;
    x += b.width;
    maxH = Math.max(maxH, b.height);
    usedAny = true;
  } else if (usedAny) {
    // había algo antes de las unidades sueltas: quitamos la última separación
    x -= G;
  }

  const totalW = usedAny ? x : L;
  const totalH = usedAny ? maxH : L;

  const svgW = totalW + margin * 2;
  const svgH = totalH + margin * 2;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">`;
  if (usedAny) {
    // Volteamos el eje Y para que el material "crezca hacia arriba",
    // igual que en el archivo .tex de referencia (coordenadas cartesianas).
    svg += `<g transform="translate(${margin}, ${totalH + margin}) scale(1,-1)">`;
    svg += bodySvg;
    svg += `</g>`;
  } else {
    svg += `<text x="${svgW / 2}" y="${svgH / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${L * 0.8}" fill="#9aa2ad">0</text>`;
  }
  svg += `</svg>`;

  return { svg, centenas, decenas, unidades };
}

function buildDesglose(centenas, decenas, unidades) {
  const partes = [];
  if (centenas > 0) partes.push(`<span class="c">${centenas} C</span>`);
  if (decenas > 0) partes.push(`<span class="d">${decenas} D</span>`);
  if (unidades > 0 || (centenas === 0 && decenas === 0))
    partes.push(`<span class="u">${unidades} U</span>`);
  return partes.join(" &nbsp;+&nbsp; ");
}

function render() {
  updateDisabledStates();
  const opts = getOptions();

  if (!/^\d+$/.test(opts.numeroRaw)) {
    showError(
      "Escribe un número entero mayor o igual a 0 (sin signos, comas ni decimales).",
    );
    return;
  }
  const n = parseInt(opts.numeroRaw, 10);
  if (n > 99999) {
    showError(
      "Con números tan grandes la imagen queda enorme. Prueba con un número entre 0 y 99999.",
    );
    return;
  }
  showError(null);

  const { svg, centenas, decenas, unidades } = buildSVG(n, opts);
  document.getElementById("svgHolder").innerHTML = svg;

  const desgloseHolder = document.getElementById("desgloseHolder");
  if (opts.mostrarDesglose) {
    desgloseHolder.innerHTML = buildDesglose(centenas, decenas, unidades);
    desgloseHolder.style.display = "block";
  } else {
    desgloseHolder.style.display = "none";
  }
}

function buildFilename() {
  const numero = document.getElementById("numero").value.trim();
  return `numero-${numero || "0"}.svg`;
}


async function download() {
  const opts = getOptions();
  if (!/^\d+$/.test(opts.numeroRaw)) return;
  const n = parseInt(opts.numeroRaw, 10);
  const { svg } = buildSVG(n, opts);
  const filename = buildFilename();

  await Banco.guardarSVG(svg, filename); // compartido/guardar-svg.js
}

[
  "numero",
  "tamano",
  "modoCentena",
  "modoDecena",
  "formatoDiez",
  "mostrarDesglose",
].forEach((id) => {
  document.getElementById(id).addEventListener("input", render);
  document.getElementById(id).addEventListener("change", render);
});
document
  .getElementById("downloadBtn")
  .addEventListener("click", download);

render();
