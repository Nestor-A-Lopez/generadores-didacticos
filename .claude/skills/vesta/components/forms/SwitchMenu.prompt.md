`Switch` que, al activarse, despliega debajo sus opciones (campos, selectores) y las pliega al desactivarse. Varios seguidos forman una lista de ajustes: envuélvelos en `SwitchGroup`.

```jsx
<SwitchGroup>
  <SwitchMenu label="Mostrar valor total del entero" checked={total} onChange={e => setTotal(e.target.checked)}>
    <Input aria-label="Valor del entero" />
  </SwitchMenu>
  <SwitchMenu label="Mostrar valor de cada parte" checked={partes} onChange={e => setPartes(e.target.checked)}>
    <SegmentedControl aria-label="Valor de cada parte" value={modo} onChange={setModo}
      options={[{ value: 'auto', label: 'Automático' }, { value: 'custom', label: 'Personalizado' }]} />
  </SwitchMenu>
</SwitchGroup>
```

**Regla de separación (Vesta):** entre la pista de un interruptor y la del siguiente hay siempre **9px**. La pista mide 26px centrada en una fila de 44px, así que cada interruptor contiguo sube 9px (`margin-top: -9px`). `SwitchGroup` lo aplica; no lo repitas a mano.

- Fila: min-height 44px, texto a la izquierda y pista a la derecha, `--text-base` (`--text-sm` < 640px), sin salto de línea.
- Menú: `grid-template-rows` 0fr → 1fr en 380ms `--ease-out`, contenido en fundido (opacity 220ms). Recorta mientras se mueve; abierto deja salir tooltips. Plegado es `inert` y `visibility: hidden`. Sin animación con `prefers-reduced-motion`.
- Contenido: flex con wrap, gap 16px, padding 4px 0 12px.
- En `SwitchGroup` los interruptores van juntos arriba y sus menús debajo, en el mismo orden.
- Accesibilidad: checkbox real con `role="switch"`, `aria-expanded` y `aria-controls` apuntan al menú. Da etiqueta a cada campo del menú.

Un solo ajuste sin opciones → `Switch`.
