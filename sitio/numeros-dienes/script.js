// ============================================================
//  Colores (mismos que en el material .tex de referencia)
// ============================================================
const COL_U = "#57A639"; // unidades -> verde
const COL_D = "#1C75BC"; // decenas  -> azul
const COL_C = "#CC2027"; // centenas -> rojo

// Lado del cuadrito, fijo. Antes se elegía (14 / 20 / 28); se dejó el de
// «Mediano» porque el tamaño se ajusta al escalar la figura en PowerPoint.
const L_CUADRITO = 20;

// Límites del número. Desde 1: con 0 no hay material que dibujar. Hasta
// 999: así cada cifra es una pieza (centenas, decenas, unidades) y el valor
// coloreado no tiene millares.
const NUM_MIN = 1;
const NUM_MAX = 999;

// Glifos de Computer Modern (compartido/glifos.js). Aquí solo se usan en la
// interfaz, para que el valor y la descomposición de la vista previa se
// vean como en LaTeX.
const GLYPH_DATA = Banco.GLYPH_DATA;

function getOptions() {
  const numeroRaw = document.getElementById("numero").value.trim();
  const L = L_CUADRITO;
  const modoCentena = document.getElementById("modoCentena").value; // bloque | decenas | unidades
  const modoDecena = document.getElementById("modoDecena").value; // bloque | unidades
  const formatoDiez = document.getElementById("formatoDiez").value; // columna | columnas
  const filasCentenas = document.getElementById("filasCentenas").value; // 1 | 2
  const mostrarValor = document.getElementById("mostrarValor").checked;
  // "Mostrar descomposición" (el id viene de cuando era "desglose")
  const mostrarDesglose =
    document.getElementById("mostrarDesglose").checked;
  const modoDescomposicion =
    document.getElementById("modoDescomposicion").value; // unidades | jerarquia
  return {
    numeroRaw,
    L,
    modoCentena,
    modoDecena,
    formatoDiez,
    filasCentenas,
    mostrarValor,
    mostrarDesglose,
    modoDescomposicion,
  };
}

// Con error: aviso visible, campo marcado y botón de guardar desactivado.
// La vista previa se queda con la última figura válida.
function showError(msg) {
  const err = document.getElementById("err");
  document.getElementById("errMsg").textContent = msg || "";
  err.style.display = msg ? "flex" : "none";
  document
    .getElementById("numero")
    .setAttribute("aria-invalid", msg ? "true" : "false");
  document.getElementById("downloadBtn").disabled = !!msg;
}

function updateDisabledStates() {
  const modoDecena = document.getElementById("modoDecena").value;
  const off = modoDecena !== "unidades";
  document.getElementById("formatoDiez").disabled = off;
  // Fachada del segmentado + tooltip que explica por qué está desactivado
  document.getElementById("formatoDiezField").classList.toggle("is-disabled", off);
  syncSegmented("formatoDiez");
  // Cómo se escribe la descomposición: solo tiene sentido si se muestra.
  document
    .getElementById("descOpcion")
    .classList.toggle("is-hidden", !document.getElementById("mostrarDesglose").checked);
  syncSegmented("modoDescomposicion");
}

// Resumen que se lee con "Cómo se ve cada pieza" plegado.
function updatePiezasResumen(opts) {
  const centena = {
    bloque: "Centenas en bloque",
    decenas: "Centenas en 10 decenas",
    unidades: "Centenas en 100 unidades",
  }[opts.modoCentena];
  const decena =
    opts.modoDecena === "bloque"
      ? "Decenas en barra"
      : opts.formatoDiez === "columnas"
        ? "Decenas en columnas de 5"
        : "Decenas en columna de 10";
  const partes = [centena, decena];
  if (opts.filasCentenas === "2") partes.push("Centenas en 2 filas");
  document.getElementById("piezasResumen").textContent = partes.join(" · ");
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
  const { L, modoCentena, modoDecena, formatoDiez, filasCentenas } = opts;
  const G = L * 0.22;
  const margin = L * 0.9;

  const centenas = Math.floor(n / 100);
  const decenas = Math.floor((n % 100) / 10);
  const unidades = n % 10;

  let x = 0;
  let bodySvg = "";
  let maxH = 0;

  if (filasCentenas === "2" && centenas > 1) {
    // «2 filas» (con una sola centena no hay nada que repartir): la figura
    // no queda tan larga.
    // Las centenas van en dos filas, llenando primero la de abajo (el eje
    // Y está volteado: y = 0 es abajo), y se reducen para que las dos
    // filas, con su separación G, midan lo mismo que una decena (10*L).
    // La escala sale del alto real de una centena en el modo elegido.
    const ref = drawHundred(0, 0, L, G, modoCentena, modoDecena, formatoDiez);
    const k = (10 * L - G) / (2 * ref.height);
    const cols = Math.ceil(centenas / 2);
    const w = ref.width * k;
    const h = ref.height * k;
    for (let i = 0; i < centenas; i++) {
      const fila = i < cols ? 0 : 1;
      const col = fila === 0 ? i : i - cols;
      const b = drawHundred(
        x + col * (w + G),
        fila * (h + G),
        L * k,
        G * k,
        modoCentena,
        modoDecena,
        formatoDiez,
      );
      bodySvg += b.svg;
    }
    x += cols * (w + G);
    maxH = Math.max(maxH, 2 * h + G);
  } else {
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
    }
  }
  for (let i = 0; i < decenas; i++) {
    const b = drawTen(x, 0, L, G, modoDecena, formatoDiez);
    bodySvg += b.svg;
    x += b.width + G;
    maxH = Math.max(maxH, b.height);
  }
  if (unidades > 0) {
    const b = drawLooseUnits(x, L, G, unidades);
    bodySvg += b.svg;
    x += b.width;
    maxH = Math.max(maxH, b.height);
  } else {
    // Sin unidades sueltas (n >= 1, así que hay centenas o decenas antes):
    // quitamos la última separación
    x -= G;
  }

  const totalW = x;
  const totalH = maxH;

  const svgW = totalW + margin * 2;
  const svgH = totalH + margin * 2;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">`;
  // Volteamos el eje Y para que el material "crezca hacia arriba",
  // igual que en el archivo .tex de referencia (coordenadas cartesianas).
  // (El número va de NUM_MIN = 1 en adelante: siempre hay material.)
  svg += `<g transform="translate(${margin}, ${totalH + margin}) scale(1,-1)">`;
  svg += bodySvg;
  svg += `</g>`;
  svg += `</svg>`;

  return { svg, centenas, decenas, unidades };
}

const _r2 = (v) => Math.round(v * 100) / 100;

// Un <path> por carácter, con glifos rectos (compartido/texto-svg.js).
const glyphRunSvg = Banco.glyphRunSvg;

// Línea bajo la figura (solo en la vista previa, no va en el SVG
// exportado), como en LaTeX, con glifos de Computer Modern:
//   valor:            $236$, cada cifra con el color de su pieza
//   descomposición:   $200 + 30 + 6$ (valor en unidades) o
//                     $2\,\mathrm{C} + 3\,\mathrm{D} + 6\,\mathrm{U}$ (jerarquía)
//   las dos:          $236 = 200 + 30 + 6$
// Las partes en cero no se escriben (205 = 200 + 5). Los signos + e =, en
// negro. Espacios de TeX: \, (3mu) entre cifra y letra, 4mu alrededor del
// + y 5mu alrededor del =.
function buildLectura(n, centenas, decenas, unidades, opts) {
  const NEGRO = "#000000";
  const size = 30; // px de la interfaz; el svg se escala si no cabe
  const s = size / GLYPH_DATA.upm;
  const mu = size / 18;

  // Piezas de texto: [texto, color, espacio antes en mu]
  const piezas = [];
  let espacio = 0;
  const poner = (t, fill, antes = 0) => {
    piezas.push([t, fill, espacio + antes]);
    espacio = 0;
  };

  if (opts.mostrarValor) {
    // De derecha a izquierda: unidades, decenas, centenas
    const colores = [COL_U, COL_D, COL_C];
    const cifras = String(n);
    [...cifras].forEach((ch, i) => poner(ch, colores[cifras.length - 1 - i]));
  }
  if (opts.mostrarValor && opts.mostrarDesglose) {
    poner("=", NEGRO, 5);
    espacio = 5;
  }
  if (opts.mostrarDesglose) {
    const partes = [];
    if (centenas > 0) partes.push([centenas, 100, "C", COL_C]);
    if (decenas > 0) partes.push([decenas, 10, "D", COL_D]);
    if (unidades > 0 || partes.length === 0)
      partes.push([unidades, 1, "U", COL_U]);
    partes.forEach(([cifra, valor, letra, color], i) => {
      if (i > 0) {
        poner("+", NEGRO, 4);
        espacio = 4;
      }
      if (opts.modoDescomposicion === "jerarquia") {
        poner(String(cifra), color);
        poner(letra, color, 3);
      } else {
        poner(String(cifra * valor), color);
      }
    });
  }

  // Alto de la línea: el de todos los glifos que aparecen, más + y =
  let ascent = 0,
    descent = 0;
  for (const ch of piezas.map((p) => p[0]).join("") + "+=") {
    const g = GLYPH_DATA.r[ch];
    ascent = Math.max(ascent, g[2] * s);
    descent = Math.max(descent, -g[1] * s);
  }

  let x = 0;
  let paths = "";
  let etiqueta = "";
  for (const [t, fill, antes] of piezas) {
    x += antes * mu;
    paths += glyphRunSvg(t, x, ascent, size, fill);
    for (const ch of t) x += GLYPH_DATA.r[ch][0] * s;
    etiqueta += (antes ? " " : "") + t;
  }
  const w = _r2(x);
  const h = _r2(ascent + descent);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${etiqueta}">${paths}</svg>`;
}

function render() {
  updateDisabledStates();
  const opts = getOptions();
  updatePiezasResumen(opts);

  if (!/^\d+$/.test(opts.numeroRaw)) {
    showError(
      "Escribe solo cifras, sin signos, comas ni decimales. Por ejemplo, 236.",
    );
    return;
  }
  const n = parseInt(opts.numeroRaw, 10);
  if (n < NUM_MIN || n > NUM_MAX) {
    showError(`Escribe un número entre ${NUM_MIN} y ${NUM_MAX}.`);
    return;
  }
  showError(null);

  const { svg, centenas, decenas, unidades } = buildSVG(n, opts);
  const holder = document.getElementById("svgHolder");
  holder.innerHTML = svg;
  holder.setAttribute("aria-label", `Figura del número ${n}`);

  const desgloseHolder = document.getElementById("desgloseHolder");
  if (opts.mostrarValor || opts.mostrarDesglose) {
    desgloseHolder.innerHTML = buildLectura(n, centenas, decenas, unidades, opts);
    desgloseHolder.style.display = "flex";
  } else {
    desgloseHolder.style.display = "none";
  }
}

// Con el número ya convertido, así "007" se guarda como 7.svg.
function buildFilename(n) {
  return `${n}.svg`;
}


async function download() {
  const opts = getOptions();
  if (!/^\d+$/.test(opts.numeroRaw)) return;
  const n = parseInt(opts.numeroRaw, 10);
  if (n < NUM_MIN || n > NUM_MAX) return;
  const { svg } = buildSVG(n, opts);
  const filename = buildFilename(n);

  await Banco.guardarSVG(svg, filename); // compartido/guardar-svg.js
}

[
  "numero",
  "modoCentena",
  "modoDecena",
  "formatoDiez",
  "filasCentenas",
  "mostrarValor",
  "mostrarDesglose",
  "modoDescomposicion",
].forEach((id) => {
  document.getElementById(id).addEventListener("input", render);
  document.getElementById(id).addEventListener("change", render);
});
document
  .getElementById("downloadBtn")
  .addEventListener("click", download);

// Enter en el número guarda, como en los otros generadores.
document.getElementById("numero").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !document.getElementById("downloadBtn").disabled)
    download();
});

// ============================================================
//  Controles segmentados: fachada de los <select> ocultos
// ============================================================
// Cada .seg[data-for=id] maneja el <select id=id>: al hacer clic cambia
// su valor y dispara "change", así render() y download() siguen leyendo
// .value como siempre. Si el select cambia por otro lado, syncSegmented
// pone los botones al día.
function syncSegmented(id) {
  const select = document.getElementById(id);
  const seg = document.querySelector(`.seg[data-for="${id}"]`);
  if (!seg) return;
  seg.classList.toggle("is-disabled", select.disabled);
  seg.querySelectorAll("button").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.value === select.value));
    b.disabled = select.disabled;
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
  const id = seg.dataset.for;
  const select = document.getElementById(id);
  if (seg.hasAttribute("data-animate")) {
    const ind = document.createElement("span");
    ind.className = "segInd";
    ind.setAttribute("aria-hidden", "true");
    seg.prepend(ind);
    // Al cambiar de distribución (1a ↔ 1b) los botones cambian de tamaño.
    if (window.ResizeObserver) new ResizeObserver(() => placeIndicator(seg)).observe(seg);
    // Sin transición en la primera colocación, para que no entre deslizándose.
    requestAnimationFrame(() => {
      placeIndicator(seg);
      requestAnimationFrame(() => ind.classList.add("is-ready"));
    });
  }
  seg.querySelectorAll("button").forEach((b) => {
    b.addEventListener("click", () => {
      if (select.disabled || select.value === b.dataset.value) return;
      select.value = b.dataset.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
  select.addEventListener("change", () => syncSegmented(id));
  syncSegmented(id);
});

// ============================================================
//  "Cómo se ve cada pieza": plegar / desplegar
// ============================================================
// .is-settled llega cuando termina de abrirse: hasta entonces el contenido
// se recorta (para la animación); después se deja ver el tooltip completo.
(function () {
  const piezas = document.getElementById("piezas");
  const toggle = document.getElementById("piezasToggle");
  const body = document.getElementById("piezasBody");
  let timer = null;
  toggle.addEventListener("click", () => {
    const open = !piezas.classList.contains("is-open");
    clearTimeout(timer);
    piezas.classList.toggle("is-open", open);
    piezas.classList.remove("is-settled");
    toggle.setAttribute("aria-expanded", String(open));
    body.setAttribute("aria-hidden", String(!open));
    if (open) timer = setTimeout(() => piezas.classList.add("is-settled"), 400);
  });
})();

render();
