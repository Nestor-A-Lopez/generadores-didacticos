# Avisos de terceros

El repositorio está bajo la licencia [CC BY-NC 4.0](LICENSE), **excepto** el material de terceros de esta lista, que conserva su propia licencia. Todo material de terceros que se agregue tiene que registrarse aquí.

El sitio publicado reproduce estos avisos en su página «Licencia y avisos» (`sitio/licencia/index.html`), porque incluye copias de los glifos y los iconos. Si cambia un aviso aquí, se cambia también ahí.

## Incluido en el repositorio

### Contornos de Computer Modern (fuentes BaKoMa)

- **Qué es:** los contornos vectoriales de los caracteres (dígitos, letras, signos) con que se dibuja todo el texto de las figuras. Son de Computer Modern, la tipografía de TeX, en la versión TrueType de Basil K. Malyshev.
- **De dónde viene:** los archivos `cmr10.ttf`, `cmmi10.ttf`, `cmsy10.ttf` y `cmb10.ttf` que trae [matplotlib](https://matplotlib.org/) (`mpl-data/fonts/ttf/`). Los contornos se extrajeron con fontTools. Originales: http://www.ctan.org/tex-archive/fonts/cm/ps-type1/bakoma
- **Dónde está:**
  - `sitio/compartido/glifos.js`: cmr10, cmmi10 y cmsy10. Lo genera `herramientas/extraer_glifos.py`.
  - `sitio/compartido/glifos-tabla.js`: cmr10 y cmb10.
- **Licencia:** BaKoMa Fonts Licence. Permite copiar, modificar y distribuir para cualquier propósito, con el aviso de abajo. Usar las fuentes para incrustarlas en SVG no requiere aviso, así que **los SVG que se exportan no necesitan mencionarla**.

```
BaKoMa Fonts Licence
--------------------

This licence covers two font packs (known as BaKoMa Fonts Collection,
which is available at `CTAN:fonts/cm/ps-type1/bakoma/'):

  1) BaKoMa-CM (1.1/12-Nov-94)
     Computer Modern Fonts in PostScript Type 1 and TrueType font formats.

  2) BaKoMa-AMS (1.2/19-Jan-95)
     AMS TeX fonts in PostScript Type 1 and TrueType font formats.

Copyright (C) 1994, 1995, Basil K. Malyshev. All Rights Reserved.

Permission to copy and distribute these fonts for any purpose is
hereby granted without fee, provided that the above copyright notice,
author statement and this permission notice appear in all copies of
these fonts and related documentation.

Permission to modify and distribute modified fonts for any purpose is
hereby granted without fee, provided that the copyright notice,
author statement, this permission notice and location of original
fonts (http://www.ctan.org/tex-archive/fonts/cm/ps-type1/bakoma)
appear in all copies of modified fonts and related documentation.

Permission to use these fonts (embedding into PostScript, PDF, SVG
and printing by using any software) is hereby granted without fee.
It is not required to provide any notices about using these fonts.

Basil K. Malyshev
INSTITUTE FOR HIGH ENERGY PHYSICS
IHEP, OMVT
Moscow Region
142281 PROTVINO
RUSSIA

E-Mail: bakoma@mail.ru
     or malyshev@mail.ihep.ru
```

### Iconos de Lucide (y Feather)

- **Qué es:** iconos de interfaz de trazo fino.
- **De dónde viene:** [Lucide](https://lucide.dev/) 0.544.0. Algunos vienen de [Feather](https://feathericons.com/), del que deriva Lucide.
- **Dónde está:** incrustados como `<svg>` en el HTML, para que funcionen sin red:
  - `sitio/index.html` (portada): los iconos de las tarjetas y la flecha de «Abrir generador».
  - `sitio/fracciones/index.html`: gráfica de pastel (`chart-pie`, en la cabecera y como ícono de la pestaña) y descargar.
  - `sitio/recta-numerica/index.html`: flechas a los lados (`move-horizontal`, en la cabecera y como ícono de la pestaña) y descargar.
  - `sitio/estrategias/index.html`: foco (`lightbulb`, en la cabecera y como ícono de la pestaña), descargar, más y menos.
  - `sitio/tabla-valor-posicional/index.html`: tabla (`table-2`, en la cabecera y como ícono de la pestaña).
  - `sitio/operaciones/index.html`: calculadora (`calculator`, en la cabecera y como ícono de la pestaña).
  - `sitio/valor-posicional/index.html`: hoja de cálculo (`sheet`, en la cabecera y como ícono de la pestaña), descargar, flecha hacia abajo (`chevron-down`, también en `script.js` para los selectores de jerarquía), alerta (`circle-alert`) y más (`plus`).
  - `sitio/numeros-dienes/index.html`: bloques (`blocks`, en la cabecera y como ícono de la pestaña), descargar, flecha hacia abajo (`chevron-down`), alerta (`circle-alert`) y más (`plus`).
- **Licencia:** ISC, y MIT para lo derivado de Feather. Texto tomado de https://github.com/lucide-icons/lucide/blob/0.544.0/LICENSE:

```
ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

---

The MIT License (MIT) (for portions derived from Feather)

Copyright (c) 2013-2023 Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Enlazado, no incluido

Estos recursos se cargan desde un CDN al abrir la página. No hay ninguna copia en el repositorio.

| Recurso | Dónde se enlaza | Licencia |
| --- | --- | --- |
| Fuentes Fraunces y Poppins (Google Fonts) | `index.html` y `style.css` de la portada y de los generadores | SIL Open Font License 1.1 |
| Fuentes Fraunces, Poppins y STIX Two Text (Google Fonts) | `.claude/skills/vesta/tokens/fonts.css` | SIL Open Font License 1.1 |
| React 18.3.1 y Babel standalone 7.29.0 (unpkg) | Tarjetas, kits y plantilla de `.claude/skills/vesta/` | MIT |
| `lucide-static` 0.544.0 (unpkg) | Componente `Icon` de `.claude/skills/vesta/` | ISC |

## Excluido del repositorio

Estos materiales de referencia del sistema de diseño Vesta tienen licencias que no permiten redistribuirlos. Están en `.gitignore` y solo existen en la copia local:

- `.claude/skills/vesta/uploads/`: plantilla de Slidesgo y presentaciones.
- `.claude/skills/vesta/assets/reference-landing-mood.jpg`: imagen de banco.

`.claude/skills/vesta/assets/reference-palette.png` **no** es de terceros. Es una muestra propia de los cuatro colores de una paleta de Color Hunt (`e3f2fd`, `90caf9`, `2196f3`, `0d47a1`), que se tomó como referencia de color.
