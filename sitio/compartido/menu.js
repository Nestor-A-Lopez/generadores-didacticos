// ---------------------------------------------------------------
// Menú de navegación entre generadores (propuesta lateral).
// Una barra a la izquierda, oscura, como el Sidebar del kit de app de
// Vesta: la marca «Banco.» (lleva a la portada), un buscador y un
// enlace por generador.
//
// - Los generadores y la búsqueda vienen de compartido/generadores.js,
//   que se carga antes que este archivo.
// - Se inserta al principio de <body>; no toca .page ni ningún id de
//   los generadores (los suyos empiezan con «menuGen»).
// - Según el ancho (ver menu.css): abierta y fija desde 1440 px; de
//   1024 a 1439 px, un riel de íconos que se abre encima de la página;
//   con menos, oculta, y se abre con el botón de la barra de arriba.
// - Buscador: filtra la lista al escribir. Enter abre el primero que
//   quede, flecha abajo pasa a la lista y Escape borra o cierra. «/» o
//   Ctrl+K llevan al buscador desde cualquier parte, salvo mientras se
//   escribe en un campo.
// - Los enlaces son relativos a la carpeta de este script, así funcionan
//   igual con doble clic (file://) que publicados.
// ---------------------------------------------------------------
(function () {
  const script = document.currentScript;
  const base = new URL("..", script.src);
  const enlace = (carpeta) => new URL(carpeta + "/index.html", base).href;

  // La carpeta del generador abierto: la penúltima parte de la ruta,
  // tanto en «…/fracciones/index.html» como en «…/fracciones/».
  const partes = location.pathname.split("/");
  const actual = partes[partes.length - 2];

  // Iconos de Lucide 0.544.0: search, menu, x, layout-grid.
  const I = {
    buscar: '<path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" />',
    menu: '<path d="M4 12h16" /><path d="M4 18h16" /><path d="M4 6h16" />',
    cerrar: '<path d="M18 6 6 18" /><path d="m6 6 12 12" />',
    portada:
      '<rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />',
  };
  const icono = Banco.iconoSVG;
  const portada = new URL("index.html", base).href;

  // ---- Estructura ----
  // Barra de arriba, solo en pantallas angostas (menu.css la oculta en
  // las demás): botón del menú, marca y lupa.
  const barra = document.createElement("div");
  barra.className = "menuGen-barra";
  barra.innerHTML = `
    <button type="button" class="menuGen-boton" data-abrir aria-controls="menuGen" aria-expanded="false" aria-label="Abrir menú de generadores">${icono(I.menu)}</button>
    <a class="menuGen-marca" href="${portada}" title="Todos los generadores">Banco<span class="menuGen-punto">.</span></a>
    <button type="button" class="menuGen-boton" data-buscar aria-controls="menuGen" aria-label="Buscar generador">${icono(I.buscar)}</button>`;

  const menu = document.createElement("aside");
  menu.className = "menuGen";
  menu.id = "menuGen";
  menu.setAttribute("aria-label", "Generadores");
  menu.innerHTML = `
    <div class="menuGen-cabeza">
      <a class="menuGen-marca" href="${portada}" title="Todos los generadores">B<span class="menuGen-marcaResto">anco</span><span class="menuGen-punto">.</span></a>
      <button type="button" class="menuGen-boton menuGen-cerrar" data-cerrar aria-label="Cerrar menú">${icono(I.cerrar)}</button>
    </div>
    <div class="menuGen-riel">
      <button type="button" class="menuGen-boton" data-abrir aria-controls="menuGen" aria-expanded="false" aria-label="Abrir menú de generadores" title="Abrir menú">${icono(I.menu)}</button>
      <button type="button" class="menuGen-boton" data-buscar aria-controls="menuGen" aria-label="Buscar generador" title="Buscar generador">${icono(I.buscar)}</button>
    </div>
    <div class="menuGen-buscador">
      <span class="menuGen-lupa">${icono(I.buscar)}</span>
      <input id="menuGenBuscar" type="search" placeholder="Buscar generador" autocomplete="off" spellcheck="false" aria-label="Buscar generador" aria-controls="menuGenLista" />
      <kbd class="menuGen-atajo" aria-hidden="true">/</kbd>
    </div>
    <div class="menuGen-titulo" aria-hidden="true">Generadores</div>
    <nav class="menuGen-nav" aria-label="Generadores">
      <ul id="menuGenLista">
        ${Banco.GENERADORES.map(
          (g) => `
          <li data-carpeta="${g.carpeta}">
            <a href="${enlace(g.carpeta)}" title="${g.nombre}"${g.carpeta === actual ? ' aria-current="page"' : ""}>
              ${icono(g.icono)}<span class="menuGen-texto">${g.nombre}</span>
            </a>
          </li>`,
        ).join("")}
      </ul>
      <p class="menuGen-vacio" role="status" hidden></p>
    </nav>
    <a class="menuGen-portada" href="${portada}" title="Todos los generadores">
      ${icono(I.portada)}<span class="menuGen-texto">Todos los generadores</span>
    </a>`;

  const velo = document.createElement("div");
  velo.className = "menuGen-velo";
  velo.hidden = true;

  document.body.prepend(barra, menu, velo);
  document.body.classList.add("menuGen-con");

  const campo = menu.querySelector("#menuGenBuscar");
  const items = [...menu.querySelectorAll("#menuGenLista li")];
  const vacio = menu.querySelector(".menuGen-vacio");
  const botonesAbrir = document.querySelectorAll("[data-abrir]");
  const fijo = matchMedia("(min-width: 1440px)");
  let resultados = Banco.GENERADORES.slice();
  let origen = null; // el botón que abrió el menú, para devolverle el foco

  // ---- Abrir y cerrar (riel y pantallas angostas) ----
  function abrir(conBusqueda) {
    if (!fijo.matches) {
      origen = document.activeElement;
      menu.classList.add("is-abierto");
      velo.hidden = false;
      botonesAbrir.forEach((b) => b.setAttribute("aria-expanded", "true"));
    }
    if (conBusqueda) {
      campo.focus();
      campo.select();
    } else if (!fijo.matches) {
      (menu.querySelector("[aria-current]") || campo).focus();
    }
  }
  function cerrar() {
    if (!menu.classList.contains("is-abierto")) return;
    menu.classList.remove("is-abierto");
    velo.hidden = true;
    botonesAbrir.forEach((b) => b.setAttribute("aria-expanded", "false"));
    // Si se abrió con el atajo no hay botón al que volver: se suelta el
    // foco, que si no quedaría en el buscador, ya oculto en el riel.
    if (origen && origen !== document.body && document.contains(origen)) origen.focus();
    else if (menu.contains(document.activeElement)) document.activeElement.blur();
    origen = null;
  }
  botonesAbrir.forEach((b) => b.addEventListener("click", () => abrir(false)));
  document.querySelectorAll("[data-buscar]").forEach((b) => b.addEventListener("click", () => abrir(true)));
  menu.querySelector("[data-cerrar]").addEventListener("click", cerrar);
  velo.addEventListener("click", cerrar);
  // Al pasar a 1440 px o más el menú queda fijo: se quita el «abierto».
  fijo.addEventListener("change", () => {
    if (fijo.matches) cerrar();
  });

  // ---- Búsqueda ----
  // La lista conserva el orden de la portada; solo se ocultan los que no
  // coinciden. Enter abre el primero según la búsqueda (primero los que
  // coinciden en el nombre).
  function filtrar() {
    resultados = Banco.buscarGeneradores(campo.value);
    const quedan = new Set(resultados.map((g) => g.carpeta));
    items.forEach((li) => (li.hidden = !quedan.has(li.dataset.carpeta)));
    vacio.hidden = resultados.length > 0;
    vacio.textContent = `Ningún generador coincide con «${campo.value.trim()}».`;
    menu.classList.toggle("is-buscando", campo.value.trim() !== "");
  }
  campo.addEventListener("input", filtrar);

  const visibles = () => items.filter((li) => !li.hidden).map((li) => li.querySelector("a"));

  campo.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (resultados[0]) location.href = enlace(resultados[0].carpeta);
    } else if (e.key === "ArrowDown") {
      const v = visibles();
      if (v.length) {
        e.preventDefault();
        v[0].focus();
      }
    }
  });

  // Flechas dentro de la lista; arriba desde el primero vuelve al buscador.
  menu.querySelector(".menuGen-nav").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const v = visibles();
    const i = v.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    if (e.key === "ArrowUp" && i === 0) campo.focus();
    else v[Math.min(v.length - 1, Math.max(0, i + (e.key === "ArrowDown" ? 1 : -1)))].focus();
  });

  menu.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (e.target === campo && campo.value) {
      campo.value = "";
      filtrar();
    } else if (menu.classList.contains("is-abierto")) {
      cerrar();
    } else {
      campo.blur();
    }
  });

  // Atajo para buscar: «/» o Ctrl+K (⌘K en Mac), salvo mientras se
  // escribe en un campo, para no robarle la tecla a los generadores.
  document.addEventListener("keydown", (e) => {
    const escribiendo = e.target.closest("input, textarea, select, [contenteditable]");
    const ctrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
    if (ctrlK || (e.key === "/" && !escribiendo && !e.ctrlKey && !e.metaKey && !e.altKey)) {
      e.preventDefault();
      abrir(true);
    }
  });
})();
