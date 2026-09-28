// ---------------------------------------------------------------
// Lista de generadores y búsqueda, para el menú de navegación
// (compartido/menu.js). Es la misma lista que las tarjetas de la
// portada (sitio/index.html): al agregar un generador, se agrega en
// los dos lugares.
//
// - carpeta: la de sitio/; el enlace es <carpeta>/index.html (con
//   file:// una carpeta no abre su index.html).
// - nombre: el de la tarjeta de la portada; corto: el del menú, donde
//   no cabe el completo.
// - claves: palabras con las que alguien lo buscaría aunque no estén en
//   el nombre (lo que dibuja, las operaciones, el material).
// - icono: el contenido del <svg viewBox="0 0 24 24"> de la tarjeta
//   (Lucide 0.544.0; ver AVISOS-DE-TERCEROS.md).
// ---------------------------------------------------------------
window.Banco = window.Banco || {};

(function () {
  Banco.GENERADORES = [
    {
      carpeta: "fracciones",
      nombre: "Fracciones",
      corto: "Fracciones",
      descripcion: "Círculo, rectángulo o triángulo en partes iguales.",
      claves: "circulo rectangulo triangulo partes numerador denominador pastel colorear",
      icono:
        '<path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z" /><path d="M21.21 15.89A10 10 0 1 1 8 2.83" />',
    },
    {
      carpeta: "recta-numerica",
      nombre: "Recta numérica",
      corto: "Recta numérica",
      descripcion: "Marcas y valores con inicio, final y paso.",
      claves: "linea marcas paso negativos decimales enteros",
      icono: '<path d="m18 8 4 4-4 4" /><path d="M2 12h20" /><path d="m6 8-4 4 4 4" />',
    },
    {
      carpeta: "estrategias",
      nombre: "Estrategias",
      corto: "Estrategias",
      descripcion: "Completar la decena y distancia entre dos números.",
      claves: "completar decena suma resta distancia recta material base 10 calculo mental",
      icono:
        '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" />',
    },
    {
      carpeta: "numeros-dienes",
      nombre: "Números con bloques Dienes",
      corto: "Bloques Dienes",
      descripcion: "Un número con unidades, decenas y centenas.",
      claves: "material base 10 diez unidades decenas centenas cubos descomposicion",
      icono:
        '<path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2" /><rect x="14" y="2" width="8" height="8" rx="1" />',
    },
    {
      carpeta: "valor-posicional",
      nombre: "Tabla de valor posicional",
      corto: "Valor posicional",
      descripcion: "Números u operaciones acomodados en la tabla.",
      claves:
        "tabla periodos clases ordenes decimales operaciones suma resta multiplicacion division",
      icono:
        '<rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="3" x2="21" y1="15" y2="15" /><line x1="9" x2="9" y1="9" y2="21" /><line x1="15" x2="15" y1="9" y2="21" />',
    },
  ];

  // Minúsculas y sin acentos: «numerica» encuentra «Recta numérica».
  function normalizar(texto) {
    return texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
  }

  // Cada palabra de la consulta tiene que aparecer (en cualquier parte)
  // en el nombre, la descripción o las claves, así «tabla div» encuentra
  // la de valor posicional. Primero los que la tienen en el nombre.
  // Sin consulta, todos, en el orden de la portada.
  Banco.buscarGeneradores = function (consulta) {
    const palabras = normalizar(consulta || "").split(/\s+/).filter(Boolean);
    if (!palabras.length) return Banco.GENERADORES.slice();
    const resultado = [];
    Banco.GENERADORES.forEach((g, i) => {
      const nombre = normalizar(g.nombre + " " + g.corto);
      const todo = nombre + " " + normalizar(g.descripcion + " " + g.claves);
      if (!palabras.every((p) => todo.includes(p))) return;
      const enNombre = palabras.filter((p) => nombre.includes(p)).length;
      resultado.push({ g, i, enNombre });
    });
    resultado.sort((a, b) => b.enNombre - a.enNombre || a.i - b.i);
    return resultado.map((r) => r.g);
  };

  // <svg> de un ícono de Lucide, con los atributos de trazo que la
  // portada pone por CSS (aquí van en el propio <svg> para no depender
  // del style.css de cada generador).
  Banco.iconoSVG = function (contenido) {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      contenido +
      "</svg>"
    );
  };
})();
