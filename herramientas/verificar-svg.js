// Verificación de la salida de los generadores: exporta 52 casos fijos
// (de 6 a 23 por generador) y da, para cada uno, el nombre de archivo, el
// tamaño y un hash SHA-256 del SVG. Sirve para comprobar que un cambio
// que no debía tocar las figuras (mover archivos, reorganizar compartido/,
// refactorizar) deja el SVG idéntico byte a byte.
//
// Uso: desde la raíz del repo, `python -m http.server 8000`, y abrir
// http://localhost:8000/herramientas/verificar-svg.html. Correr ANTES del
// cambio, copiar el resultado, hacer el cambio, correr de nuevo y pegar
// la corrida anterior en «Comparar». Con doble clic (file://) no funciona:
// el navegador no deja leer el contenido de los iframes.
//
// Cada caso abre el generador en un iframe nuevo, aplica los pasos a los
// controles (como si el usuario los tocara) y llama a su download(), con
// Banco.guardarSVG reemplazado para capturar el SVG en vez de guardarlo.
// Así se prueba el camino real de guardado, no solo buildSVG.

// Rutas relativas a esta página.
const RUTAS = {
  fracciones: "../sitio/fracciones/index.html",
  "numeros-dienes": "../sitio/numeros-dienes/index.html",
  estrategias: "../sitio/estrategias/index.html",
  "recta-numerica": "../sitio/recta-numerica/index.html",
  "valor-posicional": "../sitio/valor-posicional/index.html",
};

// Pasos: ["set", selector, valor] (cambia el valor o la casilla y dispara
// input + change) o ["click", selector]. "selector@i" toma el i-ésimo.
// La tabla vacía no produce SVG: se espera «SIN SVG».
const CASOS = {
  fracciones: {
    "circ-3-4-azul": [["click", "[data-forma=circulo]"], ["set", "#numerador", 3], ["set", "#denominador", 4], ["click", "[data-color=azul]"]],
    "rect-5-12-verde": [["click", "[data-forma=rectangulo]"], ["set", "#numerador", 5], ["set", "#denominador", 12], ["click", "[data-color=verde]"]],
    "tri-2-9-rojo": [["click", "[data-forma=triangulo]"], ["set", "#numerador", 2], ["set", "#denominador", 9], ["click", "[data-color=rojo]"]],
    "circ-0-6-morado": [["click", "[data-forma=circulo]"], ["set", "#numerador", 0], ["set", "#denominador", 6], ["click", "[data-color=morado]"]],
    "rect-7-20-ancho14-etiq": [["click", "[data-forma=rectangulo]"], ["set", "#numerador", 7], ["set", "#denominador", 20], ["set", "#ancho", 14], ["click", "[data-color=naranja]"], ["set", "#showPartLabels", true]],
    "circ-1-5-total": [["click", "[data-forma=circulo]"], ["set", "#numerador", 1], ["set", "#denominador", 5], ["click", "[data-color=amarillo]"], ["set", "#showTotalLabel", true], ["set", "#valorEntero", "10"], ["set", "#showPartLabels", true]],
    "tri-4-4-personal": [["click", "[data-forma=triangulo]"], ["set", "#numerador", 4], ["set", "#denominador", 4], ["click", "[data-color=personalizado]"], ["set", "#colorPersonalizado", "#123456"]],
  },
  "numeros-dienes": {
    "236": [],
    "36-sin-centenas": [["set", "#numero", "36"]],
    "427-cen-decenas": [["set", "#numero", "427"], ["set", "#modoCentena", "decenas"]],
    "150-dec-unid-col": [["set", "#numero", "150"], ["set", "#modoDecena", "unidades"], ["set", "#formatoDiez", "columnas"]],
    "9-desglose": [["set", "#numero", "9"], ["set", "#mostrarDesglose", true]],
    "305-cen-unid": [["set", "#numero", "305"], ["set", "#modoCentena", "unidades"]],
    // Centenas en «2 filas»
    "475-dos-filas": [["set", "#numero", "475"], ["set", "#filasCentenas", "2"]],
    "961-dos-filas-cen-unid": [["set", "#numero", "961"], ["set", "#modoCentena", "unidades"], ["set", "#filasCentenas", "2"]],
    // «Color de los bloques»: unidades y centenas con color propio
    "236-colores": [["set", "#colorUnidad", "#123456"], ["set", "#colorCentena", "#abcdef"]],
  },
  estrategias: {
    "28+5": [],
    "47+8-unid": [["set", "#numero", 47], ["set", "#segundo", 8], ["set", "#modoDecena", "unidades"]],
    "51-7": [["click", "[data-operacion=resta]"], ["set", "#numero", 51], ["set", "#segundo", 7]],
    "63-9-col": [["click", "[data-operacion=resta]"], ["set", "#numero", 63], ["set", "#segundo", 9], ["set", "#formatoDiez", "columnas"]],
    "dist-36-27": [["click", "[data-operacion=resta]"], ["click", "[data-estrategia=distancia]"]],
    "dist-100-19-sin": [["click", "[data-operacion=resta]"], ["click", "[data-estrategia=distancia]"], ["set", "#distA", 100], ["set", "#distB", 19], ["set", "#incluirMaterial", false]],
    "dist-10-3-izq2": [["click", "[data-operacion=resta]"], ["click", "[data-estrategia=distancia]"], ["set", "#distA", 10], ["set", "#distB", 3], ["set", "#distIzq", 2]],
  },
  "recta-numerica": {
    "-5-5-1": [],
    "0-1-0.1": [["set", "#izquierda", 0], ["set", "#derecha", 1], ["set", "#paso", 0.1]],
    "0-100-10-sep2": [["set", "#izquierda", 0], ["set", "#derecha", 100], ["set", "#paso", 10], ["set", "#separacion", 2]],
    "-3-3-0.5": [["set", "#izquierda", -3], ["set", "#derecha", 3], ["set", "#paso", 0.5]],
    "10-20-2-sep05": [["set", "#izquierda", 10], ["set", "#derecha", 20], ["set", "#paso", 2], ["set", "#separacion", 0.5]],
    "0-12-1": [["set", "#izquierda", 0], ["set", "#derecha", 12]],
  },
  // Generador unificado. Los 7 primeros repiten los casos del generador de
  // la tabla (retirado el 2026-09-27) con la operación «Ninguna»: su hash en
  // la referencia es el que daba ese generador, así que siguen garantizando
  // que la salida es la de la tabla.
  "valor-posicional": {
    "950000": [["set", "#numerosList .numero-input@0", "950000"]],
    "9673": [["set", "#numerosList .numero-input@0", "9673"]],
    "dos-decimales": [["set", "#hastaOrdenDecimal", "-3"], ["set", "#numerosList .numero-input@0", "0.37"], ["click", "#addNumero"], ["set", "#numerosList .numero-input@1", "0.370"]],
    "427-punto": [["set", "#numerosList .numero-input@0", "427."]],
    "sin-coma-clase": [["set", "#numerosList .fmt@0", false], ["set", "#mostrarClase", true], ["set", "#numerosList .numero-input@0", "4500"]],
    "periodos-millon": [["set", "#hastaOrden", "8"], ["set", "#mostrarPeriodos", true], ["set", "#numerosList .numero-input@0", "12345678"]],
    "vacia": [["set", "#numerosList .numero-input@0", ""]],
    "suma-dec": [["set", "#operacion", "suma"], ["set", "#hastaOrden", "2"], ["set", "#hastaOrdenDecimal", "-3"], ["set", "#sumandosList .numero-input@0", "0.15"], ["set", "#sumandosList .numero-input@1", "0.028"]],
    "suma-3": [["set", "#operacion", "suma"], ["set", "#hastaOrden", "2"], ["set", "#sumandosList .numero-input@0", "125"], ["set", "#sumandosList .numero-input@1", "348"], ["click", "#addSumando"], ["set", "#sumandosList .numero-input@2", "27"]],
    "resta-miles": [["set", "#operacion", "resta"], ["set", "#minuendoRow .numero-input@0", "8750"], ["set", "#sustraendosList .numero-input@0", "2300"]],
    "mult-2.31x24": [["set", "#operacion", "multiplicacion"], ["set", "#hastaOrden", "2"], ["set", "#hastaOrdenDecimal", "-2"]],
    // Multiplicador decimal: productos parciales 0.924 y 4.62, producto 5.544
    "mult-2.31x2.4": [["set", "#operacion", "multiplicacion"], ["set", "#hastaOrden", "2"], ["set", "#hastaOrdenDecimal", "-3"], ["set", "#multiplicadorRow .numero-input@0", "2.4"]],
    "div-93-4": [["set", "#operacion", "division"], ["set", "#hastaOrden", "2"], ["set", "#hastaOrdenDecimal", "-2"], ["set", "#decimales", "0"]],
    // Dividendo y divisor decimales: 9.3 ÷ 0.25 tiene tres pasos (9.3 ÷ 0.25, 93 ÷ 2.5, 930 ÷ 25).
    // El primero es solo expositivo (sin cociente, con la altura del último); el último se resuelve.
    "div-9.3-0.25-paso0": [["set", "#operacion", "division"], ["set", "#hastaOrden", "2"], ["set", "#hastaOrdenDecimal", "-2"], ["set", "#dividendoRow .numero-input@0", "9.3"], ["set", "#divisor", "0.25"]],
    "div-9.3-0.25-final": [["set", "#operacion", "division"], ["set", "#hastaOrden", "2"], ["set", "#hastaOrdenDecimal", "-2"], ["set", "#dividendoRow .numero-input@0", "9.3"], ["set", "#divisor", "0.25"], ["set", "#pasoDivision", "2"]],
    "suma-sin-res": [["set", "#operacion", "suma"], ["set", "#hastaOrden", "2"], ["set", "#mostrarResultado", false]],
    "resta-dec-cero": [["set", "#operacion", "resta"], ["set", "#hastaOrden", "2"], ["set", "#hastaOrdenDecimal", "-2"], ["set", "#minuendoRow .numero-input@0", "05.4"], ["set", "#sustraendosList .numero-input@0", "2.35"]],
    "celdas-propias": [["set", "#celdaU", "#ffcc00"], ["set", "#celdaC", "#663399"], ["set", "#numerosList .numero-input@0", "9673"]],
    "numeros-color": [["set", "#colorNumeros", "color"], ["set", "#hastaOrdenDecimal", "-3"], ["set", "#numerosList .numero-input@0", "4521.378"]],
    "suma-color-celda": [["set", "#operacion", "suma"], ["set", "#hastaOrden", "2"], ["set", "#colorNumeros", "color"], ["set", "#celdaD", "#00aa88"]],
    "separadores-negro": [["set", "#colorSeparadores", "negro"], ["set", "#hastaOrden", "8"], ["set", "#hastaOrdenDecimal", "-2"], ["set", "#numerosList .numero-input@0", "12345678.25"]],
    "numeros-personalizado": [["set", "#colorNumerosPropio", "#336699"], ["set", "#hastaOrdenDecimal", "-2"], ["set", "#numerosList .numero-input@0", "4521.37"]],
    "separadores-personalizado": [["set", "#colorSeparadoresPropio", "#7a3db8"], ["set", "#hastaOrden", "8"], ["set", "#hastaOrdenDecimal", "-2"], ["set", "#numerosList .numero-input@0", "12345678.25"]],
  },
};


async function sha(s) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

function el(doc, sel) {
  const [s, i] = sel.split("@");
  return doc.querySelectorAll(s)[i ? +i : 0];
}

async function correrCaso(ruta, pasos) {
  const f = document.createElement("iframe");
  f.className = "banco";
  document.body.appendChild(f);
  await new Promise((r) => {
    f.onload = r;
    f.src = ruta;
  });
  const w = f.contentWindow;
  const d = f.contentDocument;
  let capturado = null;
  w.Banco.guardarSVG = async (svg, fn) => {
    capturado = { svg, fn };
  };
  for (const [op, sel, v] of pasos) {
    const e = el(d, sel);
    if (!e) throw new Error("no existe " + sel);
    if (op === "click") e.click();
    else {
      if (e.type === "checkbox") e.checked = v;
      else e.value = v;
      e.dispatchEvent(new w.Event("input", { bubbles: true }));
      e.dispatchEvent(new w.Event("change", { bubbles: true }));
    }
  }
  await w.download();
  f.remove();
  return capturado;
}

async function correrTodo() {
  const lineas = [];
  for (const [gen, casos] of Object.entries(CASOS)) {
    for (const [nombre, pasos] of Object.entries(casos)) {
      const id = `${gen}/${nombre}`;
      try {
        const c = await correrCaso(RUTAS[gen], pasos);
        lineas.push(
          c ? `${id}: ${c.fn} ${c.svg.length} ${await sha(c.svg)}` : `${id}: SIN SVG`,
        );
      } catch (e) {
        lineas.push(`${id}: ERROR ${e.message}`);
      }
      document.getElementById("resultado").value = lineas.join("\n");
    }
  }
  return lineas.join("\n");
}

function comparar() {
  const antes = document.getElementById("anterior").value.trim().split(/\r?\n/);
  const ahora = document.getElementById("resultado").value.trim().split(/\r?\n/);
  const out = document.getElementById("comparacion");
  const dif = ahora.filter((l, i) => l !== antes[i]);
  if (antes.length !== ahora.length) dif.unshift(`Distinto número de casos: ${antes.length} antes, ${ahora.length} ahora`);
  out.textContent = dif.length
    ? `${dif.length} diferencia(s):\n` + dif.join("\n")
    : `Idénticos: ${ahora.length} casos.`;
}

document.getElementById("correr").addEventListener("click", async (e) => {
  e.target.disabled = true;
  await correrTodo();
  e.target.disabled = false;
});
document.getElementById("comparar").addEventListener("click", comparar);
