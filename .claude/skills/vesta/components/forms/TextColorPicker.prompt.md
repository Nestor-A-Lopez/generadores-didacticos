Compact picker for the color of a text or stroke (e.g. the number inside a figure). Two fixed swatches (first = original) plus a «+» block holding an invisible native `<input type="color">`. When `value` matches neither swatch, «+» takes that color, drops its icon and shows the selected ring. Swatch hexes come from props — they are NOT Vesta tokens.

```jsx
<TextColorPicker label="Color del número" value={hex} onChange={setHex}
  customLabel="Elige otro color para la llave y su valor"
  options={[{ hex: '#000000', label: 'Negro (original)' }, { hex: '#FFFFFF', label: 'Blanco' }]} />
```

Use it for text/stroke color; for a figure's fill with a palette, use `ColorSwatchGroup`.
