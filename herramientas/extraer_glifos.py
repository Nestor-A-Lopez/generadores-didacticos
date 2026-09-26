# -*- coding: utf-8 -*-
"""
Extrae offline (con fontTools) los contornos vectoriales de Computer Modern
(cmr10 / cmmi10 / cmsy10, las fuentes originales de TeX) y genera
sitio/compartido/glifos.js (Banco.GLYPH_DATA), que cargan fracciones, estrategias
y recta-numerica.

Por qué offline y no en el navegador: el SVG exportado se convierte a formas
en PowerPoint, que ignora @font-face; solo sobreviven <path> reales. Parsear
la fuente en tiempo real (opentype.js) se descartó por depender de red.

Uso:  python herramientas/extraer_glifos.py [carpeta_con_ttf]
      (por defecto usa las cmr10/cmmi10/cmsy10 que trae matplotlib)
      Escribe sitio/compartido/glifos.js directamente, en UTF-8 y con saltos LF
      (redirigir la salida en Windows la pasaría a cp1252 y CRLF).

Formato de salida (unidades de fuente, y hacia ARRIBA, upm = 2048):
  GLYPH_DATA = { upm, r: {car: [avance, yMin, yMax, "d"]}, i: {...} }
  r = recto (dígitos, operadores, griego mayúsculo, latín recto para \\text)
  i = cursiva matemática (latín y griego minúsculo, convención de LaTeX)
  "d" usa solo M/L/Q/Z con pares x y alternados (el script los escala).
"""
import json
import sys
from pathlib import Path

from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.ttLib import TTFont

if len(sys.argv) > 1:
    DIR = Path(sys.argv[1])
else:
    import matplotlib

    DIR = Path(matplotlib.get_data_path()) / "fonts" / "ttf"

FONTS = {n: TTFont(DIR / f"{n}.ttf") for n in ("cmr10", "cmmi10", "cmsy10")}
UPM = FONTS["cmr10"]["head"].unitsPerEm


def contours(font, name, dx=0, dy=0):
    """Contornos del glifo como lista de (op, [(x,y),...]) ya desplazados."""
    gs = FONTS[font].getGlyphSet()
    pen = DecomposingRecordingPen(gs)
    gs[name].draw(pen)
    out = []
    for op, pts in pen.value:
        out.append((op, [(x + dx, y + dy) for x, y in pts]))
    return out


def advance(font, name):
    return FONTS[font]["hmtx"][name][0]


def to_d(rec):
    """RecordingPen -> "d" compacto solo con M/L/Q/Z (qCurveTo se parte)."""
    parts = []
    for op, pts in rec:
        if op == "moveTo":
            parts.append("M%d %d" % pts[0])
        elif op == "lineTo":
            parts.append("L%d %d" % pts[0])
        elif op == "qCurveTo":
            # Secuencia TrueType con puntos "off-curve" implícitos: se
            # reconstruyen los puntos intermedios para emitir Q simples.
            *offs, end = pts
            if end is None:  # contorno sin puntos on-curve (raro en CM)
                raise ValueError("qCurveTo cerrado sin punto final")
            for k, c in enumerate(offs):
                if k < len(offs) - 1:
                    n = offs[k + 1]
                    mid = ((c[0] + n[0]) / 2, (c[1] + n[1]) / 2)
                else:
                    mid = end
                parts.append("Q%d %d %d %d" % (round(c[0]), round(c[1]), round(mid[0]), round(mid[1])))
        elif op == "curveTo":
            raise ValueError("curvas cúbicas no esperadas en TrueType")
        elif op in ("closePath", "endPath"):
            parts.append("Z")
    return "".join(parts)


def bbox(rec):
    ys = [p[1] for _, pts in rec for p in pts if p is not None]
    return (min(ys), max(ys)) if ys else (0, 0)


def entry(rec, adv):
    y0, y1 = bbox(rec)
    return [int(adv), int(round(y0)), int(round(y1)), to_d(rec)]


def simple(font, name):
    rec = contours(font, name)
    return entry(rec, advance(font, name))


def x_bbox(rec):
    xs = [p[0] for _, pts in rec for p in pts if p is not None]
    return min(xs), max(xs)


# ---- Glifos compuestos (TeX los arma con varios caracteres) ----
def repeated(font, name, step, n=3):
    rec = []
    for k in range(n):
        rec += contours(font, name, dx=k * step)
    return entry(rec, step * n)


def neq():
    # \neq = \not= : barra negationslash (cmsy10) centrada sobre el "=".
    eq = contours("cmr10", "equal")
    sl = contours("cmsy10", "negationslash")
    ex0, ex1 = x_bbox(eq)
    sx0, sx1 = x_bbox(sl)
    dx = (ex0 + ex1) / 2 - (sx0 + sx1) / 2
    rec = eq + [(op, [(x + dx, y) for x, y in pts]) for op, pts in sl]
    return entry(rec, advance("cmr10", "equal"))


X_HEIGHT = 0.430555 * UPM  # x-height de cmr10 (los acentos están diseñados a esta altura)
CAP_HEIGHT = 0.683332 * UPM


def accented(base, accent, upper):
    b = contours("cmr10", base)
    a = contours("cmr10", accent)
    bx0, bx1 = x_bbox(b)
    ax0, ax1 = x_bbox(a)
    dx = (bx0 + bx1) / 2 - (ax0 + ax1) / 2
    dy = (CAP_HEIGHT - X_HEIGHT) if upper else 0
    rec = b + [(op, [(x + dx, y + dy) for x, y in pts]) for op, pts in a]
    return entry(rec, advance("cmr10", base))


R, I = {}, {}

# Dígitos y puntuación/operadores de cmr10
for ch, nm in zip("0123456789", "zero one two three four five six seven eight nine".split()):
    R[ch] = simple("cmr10", nm)
for ch, nm in {
    "+": "plus", "=": "equal", "(": "parenleft", ")": "parenright",
    "[": "bracketleft", "]": "bracketright", ".": "period", ",": "comma",
    ":": "colon", ";": "semicolon", "!": "exclam", "?": "question",
    "%": "percent", "&": "ampersand", "'": "quoteright", "/": "slash",
    "@": "at", "#": "numbersign", "$": "dollar",
    "¡": "exclamdown", "¿": "questiondown", "–": "endash", "—": "emdash",
}.items():
    R[ch] = simple("cmr10", nm)

# Latín recto (para \text{}, \mathrm{}) — cmr10
for c in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz":
    R[c] = simple("cmr10", c)
R[" "] = [int(UPM / 3), 0, 0, ""]  # espacio de palabra de cmr10 ≈ 1/3 em

# Acentos del español (compuestos como lo hace TeX: \'a, \~n)
for ch, base, acc in [("á", "a", "acute"), ("é", "e", "acute"), ("í", "dotlessi", "acute"),
                      ("ó", "o", "acute"), ("ú", "u", "acute"), ("ü", "u", "dieresis"),
                      ("ñ", "n", "tilde")]:
    R[ch] = accented(base, acc, False)
for ch, base, acc in [("Á", "A", "acute"), ("É", "E", "acute"), ("Í", "I", "acute"),
                      ("Ó", "O", "acute"), ("Ú", "U", "acute"), ("Ü", "U", "dieresis"),
                      ("Ñ", "N", "tilde")]:
    R[ch] = accented(base, acc, True)

# Griego mayúsculo: recto en LaTeX (cmr10)
for ch, nm in zip("ΓΔΘΛΞΠΣΥΦΨΩ", "Gamma Delta Theta Lambda Xi Pi Sigma Upsilon Phi Psi Omega".split()):
    R[ch] = simple("cmr10", nm)

# Símbolos de cmsy10 ("-" se dibuja como signo menos, igual que en modo matemático)
for ch, nm in {
    "−": "minus", "-": "minus", "×": "multiply", "÷": "divide", "±": "plusminus",
    "∓": "minusplus", "≤": "lessequal", "≥": "greaterequal", "≈": "approxequal",
    "∞": "infinity", "√": "radical", "·": "periodcentered", "{": "braceleft",
    "}": "braceright", "|": "bar", "*": "asteriskmath", "∼": "similar",
    "≡": "equivalence", "∝": "proportional", "∠": "angbracketleft",
    "→": "arrowright", "←": "arrowleft", "↔": "arrowboth", "⇒": "arrowdblright",
    "⇔": "arrowdblboth", "∈": "element", "∪": "union", "∩": "intersection",
    "∅": "emptyset", "∀": "universal", "∃": "existential", "∇": "nabla",
    "′": "prime", "⊥": "perpendicular", "∘": "openbullet", "•": "bullet",
}.items():
    R[ch] = simple("cmsy10", nm)
del R["∠"]  # angbracketleft no es un ángulo; se deja fuera para no confundir
R["⟨"] = simple("cmsy10", "angbracketleft")
R["⟩"] = simple("cmsy10", "angbracketright")
R["<"] = simple("cmmi10", "less")      # en TeX < y > vienen de cmmi10
R[">"] = simple("cmmi10", "greater")
R["≠"] = neq()
EL = int(round(0.390625 * UPM))  # paso de \ldots/\cdots ≈ 1.172em / 3
R["…"] = repeated("cmr10", "period", EL)
R["⋯"] = repeated("cmsy10", "periodcentered", EL)

# Cursiva matemática (cmmi10): latín y griego minúsculo
for c in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz":
    I[c] = simple("cmmi10", c)
for ch, nm in {
    "α": "alpha", "β": "beta", "γ": "gamma", "δ": "delta", "ϵ": "epsilon",
    "ε": "epsilon1", "ζ": "zeta", "η": "eta", "θ": "theta", "ϑ": "theta1",
    "ι": "iota", "κ": "kappa", "λ": "lambda", "μ": "mu", "ν": "nu", "ξ": "xi",
    "π": "pi", "ϖ": "pi1", "ρ": "rho", "ϱ": "rho1", "σ": "sigma", "ς": "sigma1",
    "τ": "tau", "υ": "upsilon", "ϕ": "phi", "φ": "phi1", "χ": "chi", "ψ": "psi",
    "ω": "omega", "ℓ": "lscript", "∂": "partialdiff", "℘": "weierstrass",
}.items():
    I[ch] = simple("cmmi10", nm)
# El griego minúsculo no existe en cmr10: si se pide "recto" se usa el mismo.

data = {"upm": UPM, "r": R, "i": I}
js = json.dumps(data, ensure_ascii=False, separators=(",", ":"))

# Los scripts se cargan como scripts clásicos (sin módulos ni fetch, para que
# funcionen con doble clic), así que lo compartido se cuelga de window.Banco.
CABECERA = """\
// ---------------------------------------------------------------
// Glifos vectoriales de Computer Modern (cmr10 / cmmi10 / cmsy10),
// extraídos offline con fontTools. ARCHIVO GENERADO: no editar a mano;
// se regenera con  python herramientas/extraer_glifos.py
//
// Los usan fracciones, estrategias y recta-numerica: cada carácter del SVG
// se dibuja como <path> porque «Convertir en forma» de PowerPoint ignora
// <text> y @font-face.
// Formato: { upm, r: {car: [avance, yMin, yMax, "d"]}, i: {...} } en
// unidades de fuente con y hacia ARRIBA; r = recto, i = cursiva
// matemática; "d" solo usa M/L/Q/Z con pares x y alternados.
// ---------------------------------------------------------------
window.Banco = window.Banco || {};
"""
SALIDA = Path(__file__).resolve().parent.parent / "sitio" / "compartido" / "glifos.js"
with open(SALIDA, "w", encoding="utf-8", newline="\n") as f:
    f.write(CABECERA + "Banco.GLYPH_DATA = " + js + ";\n")
sys.stderr.write("glifos: %d rectos + %d cursivos, %d bytes -> %s\n" % (len(R), len(I), len(js), SALIDA))
