# ColorModeGrid

Segmentado de color en cuadrícula de 2 × 2 (70 px de alto): dos opciones fijas, «Personalizado» y un bloque «+» que abre el selector de color. Misma familia que `SegmentedControl` (contenedor, botones, píldora) y `TextColorPicker` (el «+»).

```jsx
const [v, setV] = React.useState('negro'); const [c, setC] = React.useState();
<ColorModeGrid label="Color de los números" options={[{value:'negro',label:'Negro'},{value:'color',label:'Color'}]}
  value={v} customColor={c} onChange={(val, col) => { setV(val); setC(col); }} />
<ColorModeGrid label="Color de las comas y punto" defaultCustomColor="#cc2027"
  options={[{value:'rojo',label:'Rojo'},{value:'negro',label:'Negro'}]} value="rojo" onChange={…} />
```

- Se llena por columnas: 1.ª opción arriba, 2.ª debajo; «Personalizado» arriba a la derecha, «+» debajo.
- Elegir un color en el «+» elige «Personalizado». «Personalizado» sin color propio abre el selector; con color, solo lo elige.
- `onChange(value, customColor)`: guarda ambos.
- En la tabla de valor posicional, dos campos lado a lado (`flex: 1 1 260px`, `gap: var(--space-4)`), a la misma altura que «Agrupaciones» y «Color de las jerarquías».
