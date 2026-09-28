Compact short text field with a gray prefix on the left that names the value (e.g. the part number in «Las 15 partes»). Lower and denser than `Input`; meant for grids of many fields. The prefix is the field's `<label>`.

```jsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: 8 }}>
  {partes.map((v, i) => (
    <InputWithPrefix key={i} prefix={i + 1} prefixWidth={28} accessibleLabel={`Parte ${i + 1}`}
      value={v} onChange={e => setParte(i, e.target.value)} placeholder="1/15" />
  ))}
</div>

<InputWithPrefix prefix="Numerador" value={n} onChange={e => setN(e.target.value)} />
```

Numeric prefix → always pass `prefixWidth={28}` and a full `accessibleLabel`. Single standalone field with a visible label above → `Field` + `Input`.
