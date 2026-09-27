// ---------------------------------------------------------------
// Texto como <path>, igual en todos los generadores que usan glifos.js
// (fracciones, estrategias, recta-numerica, numeros-dienes y, solo para su
// interfaz, valor-posicional).
//
// Banco.glyphRunSvg(text, x, y, fontSize, fill, glyphFor)
//   Un <path> por carácter, con la escala y el volteo vertical ya
//   aplicados a las coordenadas (sin transform), para que PowerPoint lo
//   convierta a forma libre sin interpretar nada más. (x, y) es el
//   origen de la línea base.
//   glyphFor(ch) es opcional: devuelve el glifo de cada carácter. Si no se
//   da, se usa el recto (Banco.GLYPH_DATA.r). Fracciones pasa el suyo
//   para respetar la convención recto/cursiva.
//
// Necesita compartido/glifos.js (Banco.GLYPH_DATA), cargado antes.
// ---------------------------------------------------------------
window.Banco = window.Banco || {};

(function () {
  const _r2 = (v) => Math.round(v * 100) / 100;

  Banco.glyphRunSvg = function (text, x, y, fontSize, fill, glyphFor) {
    const GLYPH_DATA = Banco.GLYPH_DATA;
    const buscar = glyphFor || ((ch) => GLYPH_DATA.r[ch]);
    const s = fontSize / GLYPH_DATA.upm;
    let out = "";
    let cx = x;
    for (const ch of text) {
      const g = buscar(ch);
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
  };
})();
