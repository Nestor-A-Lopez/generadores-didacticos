Number + order (hierarchy) row for place-value tables and operation terms: «36» in Decenas reads 360. Stack rows with `gap: var(--space-4)` and end the list with `<Button variant="outline">Agregar número</Button>`.

```jsx
<NumberRow label="Número 1" value={v} onValueChange={setV}
  order={o} orderOptions={orders} onOrderChange={setO}
  showSeparators={sep} onShowSeparatorsChange={setSep}
  onRemove={remove} canRemove={rows.length > 2} placeholder="Ej. 4500 o 63.21" />
```

- **List row**: pass `onRemove`; `canRemove={false}` disables «Quitar» at the list minimum.
- **Fixed row** (minuendo, multiplicando, multiplicador, dividendo): omit `onRemove`, set `reserveRemoveSpace` — the hidden «Quitar» keeps «Coma y punto» in the same place across operations. User decision: don't remove the gap.
- **Integer-only** (multiplicador, dividendo): pass `orderOptions` without decimal orders.
- **Error**: `error` → Input red border + ring + `aria-invalid`. Show the message in an error `Callout` over the figure, not in the row.
- `orderOptions` follow the table range; an out-of-range `order` falls back to «Unidades (U)» silently (calls `onOrderChange('U')`).
- `hint` is optional helper text below the fields.
