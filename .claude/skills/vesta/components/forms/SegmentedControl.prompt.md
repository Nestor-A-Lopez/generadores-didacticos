Exclusive choice among 2–6 short options, shown all at once in a bar with a sliding pill (e.g. modo Automático/Personalizado, forma de la figura). Always pair with a visible label via `aria-labelledby`.

```jsx
<span id="modo">Modo</span>
<SegmentedControl aria-labelledby="modo" fill value={modo} onChange={setModo}
  options={[{ value: 'auto', label: 'Automático' }, { value: 'custom', label: 'Personalizado' }]} />

<SegmentedControl aria-label="Forma del entero" value={forma} onChange={setForma}
  options={[{ value: 'circulo', icon: 'circle', tooltip: 'Círculo' },
            { value: 'rect', icon: 'rectangle-horizontal', tooltip: 'Rectángulo' },
            { value: 'tri', icon: 'triangle', tooltip: 'Triángulo' }]} />
```

Icon-only options need `tooltip` (used as aria-label). More than 6 options or long labels → `Select`. Switching content panels → `Tabs`.
