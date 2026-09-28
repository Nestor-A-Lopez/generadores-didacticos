# OrderColorPicker

Color por jerarquía del material base 10 (unidad, decena, centena). Cada celda: muestra de defecto (`--base10-*`) + muestra propia («+» gris hasta elegir; después, ese color). Misma familia visual que `TextColorPicker`.

Usos: «Color de las jerarquías» (tabla de valor posicional, `tooltipTarget="celdas"`) y «Color de los bloques» (Dienes, `tooltipTarget="piezas"`).

```jsx
const [v, setV] = React.useState({});
<OrderColorPicker label="Color de las jerarquías" value={v} onChange={setV} />
// v = { D: { mode: 'custom', color: '#7b3fa0' } }
```

- Sin entrada o `mode: 'default'` → elegida la de defecto. El color propio se conserva al volver al defecto.
- Elegir en el selector el mismo hex que el de defecto → queda en defecto.
- Por debajo de 640 px, las celdas se reparten el ancho en partes iguales.
- Los colores `--base10-*` son fijos: solo para figuras, nunca para la interfaz.
