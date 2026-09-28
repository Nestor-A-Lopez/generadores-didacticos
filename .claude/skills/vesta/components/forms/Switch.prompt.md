Instant-effect preference: sound on/off, show steps, dark reading mode.

```jsx
<Switch label="Mostrar el desarrollo paso a paso" checked={steps} onChange={...} />
```

For anything needing a Save button, use `Checkbox`.

**One-line label (all sizes, `sm` included):** if it doesn't fit the available width, shorten the text — never let it wrap or reduce the font size. The track (46×26) is centred in a 44px row; a second line grows the row, pushes the track away from the previous switch and breaks the fixed 9px between consecutive tracks. Real case: «Punto decimal en los productos parciales» in a 330px panel ended up 11.8px from the previous one → shortened to «Punto en los productos parciales».
- Good: «Punto», «Mostrar clases».
- Bad: a label that takes two lines in the panel.

**`size="sm"`**: secondary option inside a row that already has content (e.g. a one-line header next to a label), without making the row taller. Same track (46×26) and knob; label `--text-sm`, gap `--space-2`, margin `-8px 0` → takes 28px in the row, keeps the 44px hit area. Works with the track on either side (`flexDirection: 'row-reverse'` puts the text first).

```jsx
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
  <span>Valor en las partes</span>
  <Switch size="sm" label="Mismo valor" checked={same} onChange={e => setSame(e.target.checked)}
    style={{ flexDirection: 'row-reverse' }} />
</div>
```
