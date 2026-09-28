Row of color swatches to pick a figure's fill; selected swatch shows a check and a sliding ring. Optional last swatch «Personalizado…» (value `'custom'`) reveals a native color field. Swatch colors come from props — they are NOT Vesta tokens; don't add them to tokens. Always pair with a visible label via `aria-labelledby`.

```jsx
<span id="relleno">Color del relleno</span>
<ColorSwatchGroup aria-labelledby="relleno" value={c} onChange={setC}
  customColor={hex} onCustomColorChange={setHex}
  colors={[{ value: 'morado', label: 'Morado', hex: '#8080F0' },
           { value: 'amarillo', label: 'Amarillo', hex: '#FFD500', checkColor: 'var(--blue-950)' }]} />
```

Use `checkColor` on light swatches so the check stays legible. `allowCustom={false}` hides «Personalizado…».
