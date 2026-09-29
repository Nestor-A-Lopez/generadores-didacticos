// ---------------------------------------------------------------
// Flechas del teclado en las barras de opciones (segmentados, muestras
// de color, botones de operación), igual en todos los generadores.
// Banco.flechasEnGrupo(grupo, selector, opciones?): las opciones son los
// elementos de `grupo` que cumplen `selector`; la elegida es la que tiene
// aria-pressed="true" (la pone el sync de cada generador).
//
// - ← ↑ van a la opción anterior y → ↓ a la siguiente, dando la vuelta;
//   Inicio y Fin, a la primera y a la última. Eligen la opción al llegar
//   (con .click(), así corre lo mismo que con el ratón) y el foco se va
//   con ella. Se saltan las desactivadas y las ocultas.
// - opciones.alLlegar(el) reemplaza ese .click(). Sirve para las opciones
//   que abren el selector de color: al llegar con las flechas solo reciben
//   el foco (o se eligen sin abrirlo), y el selector se abre con Enter, que
//   hace el clic nativo del botón.
// - opciones.esElegida(el) reemplaza la regla de aria-pressed (fracciones:
//   el «+» de los colores del texto es el propio <input type="color">).
// - Solo la elegida tiene tabIndex 0, así Tab entra y sale del grupo en
//   un paso. Un MutationObserver lo pone al día cuando cambian
//   aria-pressed, disabled, class (la del «+» de fracciones) o las
//   opciones mismas (valor-posicional rehace
//   las del cociente), así los sync de cada generador no se tocan.
// - Escucha en el grupo, no en cada botón: sirve también para opciones
//   que se crean después.
// ---------------------------------------------------------------
window.Banco = window.Banco || {};

(function () {
  const PASO = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };

  Banco.flechasEnGrupo = function (grupo, selector, opciones = {}) {
    const alLlegar = opciones.alLlegar || ((el) => el.click());
    const esElegida = opciones.esElegida || ((el) => el.getAttribute("aria-pressed") === "true");
    const ajustarTabindex = () => {
      const todas = [...grupo.querySelectorAll(selector)];
      const elegida = todas.find(esElegida) || todas.find((b) => !b.disabled);
      todas.forEach((b) => (b.tabIndex = b === elegida ? 0 : -1));
    };

    grupo.addEventListener("keydown", (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const actual = e.target.closest(selector);
      if (!actual || !grupo.contains(actual)) return;
      const todas = [...grupo.querySelectorAll(selector)].filter(
        (b) => !b.disabled && b.getClientRects().length > 0,
      );
      const i = todas.indexOf(actual);
      if (i < 0) return;
      let destino;
      if (e.key === "Home") destino = 0;
      else if (e.key === "End") destino = todas.length - 1;
      else if (PASO[e.key]) destino = i + PASO[e.key];
      else return;
      e.preventDefault(); // que ↑ ↓ no desplacen la página
      const otra = todas[(destino + todas.length) % todas.length];
      if (otra !== actual) alLlegar(otra);
      otra.focus();
    });

    new MutationObserver(ajustarTabindex).observe(grupo, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-pressed", "disabled", "class"],
    });
    ajustarTabindex();
  };
})();
