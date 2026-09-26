Lucide glyph tinted with `currentColor` — the only icon primitive in Vesta; never inline hand-drawn SVG.

```jsx
<Icon name="calculator" size={20} />
<Icon name="circle-check" size={24} label="Respuesta correcta" />
```

Icons inherit colour from their parent, so they are tinted by placing them inside a coloured element rather than by a `color` prop. Sizes step 16 / 20 / 24 / 32; anything larger is illustration, not iconography.
