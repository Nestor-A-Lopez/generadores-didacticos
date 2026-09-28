import React from 'react';
import { Icon } from '../core/Icon.jsx';

const norm = (h) => String(h || '').trim().toLowerCase();

export const DEFAULT_ORDERS = [
  { key: 'U', label: 'Unidad', plural: 'unidades', defaultColor: 'var(--base10-unidad)', defaultHex: '#57a639', defaultLabel: 'Verde original de las unidades' },
  { key: 'D', label: 'Decena', plural: 'decenas', defaultColor: 'var(--base10-decena)', defaultHex: '#1c75bc', defaultLabel: 'Azul original de las decenas' },
  { key: 'C', label: 'Centena', plural: 'centenas', defaultColor: 'var(--base10-centena)', defaultHex: '#cc2027', defaultLabel: 'Rojo original de las centenas' },
];

function useNarrow() {
  const q = '(max-width: 639px)';
  const get = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia(q).matches;
  const [n, setN] = React.useState(get);
  React.useEffect(() => {
    if (!window.matchMedia) return;
    const m = window.matchMedia(q); const h = () => setN(m.matches);
    m.addEventListener ? m.addEventListener('change', h) : m.addListener(h);
    return () => { m.removeEventListener ? m.removeEventListener('change', h) : m.removeListener(h); };
  }, []);
  return n;
}

/** Color por orden del material base 10 (unidad, decena, centena): muestra de defecto + color propio con selector nativo. */
export function OrderColorPicker({ label = 'Color de las jerarquías', orders = DEFAULT_ORDERS, value, defaultValue, onChange, tooltipTarget = 'celdas', style, ...rest }) {
  const labelId = React.useId();
  const narrow = useNarrow();
  const [inner, setInner] = React.useState(defaultValue || {});
  const val = value !== undefined ? value : inner;
  const [hover, setHover] = React.useState(null);
  const [focus, setFocus] = React.useState(null);
  const [tip, setTip] = React.useState(null);
  const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ring = '0 0 0 2px var(--neutral-0), 0 0 0 4px var(--action-primary)';
  const focusRing = '0 0 0 2px var(--neutral-0), var(--focus-ring)';

  const set = (key, entry) => {
    const next = { ...val, [key]: entry };
    if (value === undefined) setInner(next);
    if (onChange) onChange(next);
  };
  const base = {
    position: 'relative', width: 40, height: 40, padding: 0, margin: 0, flex: '0 0 auto', boxSizing: 'border-box',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid rgba(9,47,107,.16)', borderRadius: 'var(--radius-sm)', outline: 'none', cursor: 'pointer',
    transition: reduced ? 'none' : 'box-shadow var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)',
  };
  const shadow = (k, selected, xs) => {
    const p = [];
    if (focus === k) p.push(focusRing); else if (selected) p.push(ring);
    if (xs) p.push('var(--shadow-xs)');
    return p.length ? p.join(', ') : 'none';
  };
  const tipStyle = (open, pos) => ({
    position: 'absolute', zIndex: 40, bottom: 'calc(100% + 8px)', ...pos,
    width: 'max-content', maxWidth: 240, whiteSpace: 'normal', textAlign: 'left', textWrap: 'pretty',
    background: 'var(--surface-inverse)', color: 'var(--text-inverse)', padding: '7px 11px',
    borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)', pointerEvents: 'none',
    fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', lineHeight: 1.45,
    opacity: open ? 1 : 0, visibility: open ? 'visible' : 'hidden',
    transition: reduced ? 'none' : 'opacity var(--duration-fast) var(--ease-standard), visibility var(--duration-fast) var(--ease-standard)',
  });
  const focusOn = (k) => ({
    onFocus: e => { setFocus(e.currentTarget.matches(':focus-visible') ? k : null); setTip(k); },
    onBlur: () => { setFocus(null); setTip(t => (t === k ? null : t)); },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', minWidth: 0, fontFamily: 'var(--font-sans)', ...style }} {...rest}>
      {label ? <span id={labelId} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-body)' }}>{label}</span> : null}
      <div role="group" aria-labelledby={label ? labelId : undefined} aria-label={label ? undefined : 'Color por jerarquía'}
        style={narrow ? { display: 'grid', gridTemplateColumns: `repeat(${orders.length}, minmax(0, 1fr))` } : { display: 'flex', flexWrap: 'wrap' }}>
        {orders.map((o, i) => {
          const plural = o.plural || o.label.toLowerCase();
          const entry = val[o.key] || {};
          const custom = entry.color && norm(entry.color) !== norm(o.defaultHex) ? entry.color : null;
          const isCustom = entry.mode === 'custom' && !!custom;
          const first = i === 0, last = i === orders.length - 1;
          const kd = o.key + ':d', kc = o.key + ':c';
          const cellPad = narrow ? '0 var(--space-2)' : (first ? '0 var(--space-3) 0 0' : '0 var(--space-3)');
          const tipPos = first ? { left: -48 } : last ? { right: 0 } : { left: '50%', transform: 'translateX(-50%)' };
          const onPick = (hex) => {
            if (norm(hex) === norm(o.defaultHex)) set(o.key, { mode: 'default', color: entry.color });
            else set(o.key, { mode: 'custom', color: hex });
          };
          return (
            <div key={o.key} role="group" aria-label={`Color de las ${plural}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', padding: cellPad, borderLeft: first ? 'none' : '1px solid var(--border-subtle)', minWidth: 0 }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{o.label}</span>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button type="button" aria-pressed={!isCustom} aria-label={o.defaultLabel}
                  onClick={() => set(o.key, { mode: 'default', color: entry.color })} {...focusOn(kd)}
                  style={{ ...base, background: o.defaultColor, boxShadow: shadow(kd, !isCustom, true) }} />
                <span style={{ position: 'relative', display: 'flex' }}
                  onMouseEnter={() => { setHover(kc); setTip(kc); }} onMouseLeave={() => { setHover(null); setTip(t => (t === kc ? null : t)); }}>
                  <label style={{ ...base, borderColor: custom ? 'rgba(9,47,107,.16)' : 'rgba(9,47,107,.08)',
                    background: custom || (hover === kc && !isCustom ? 'var(--neutral-200)' : 'var(--neutral-100)'),
                    color: 'var(--neutral-600)', boxShadow: shadow(kc, isCustom, !!custom) }}>
                    {custom ? null : <Icon name="plus" size={20} aria-hidden="true" />}
                    <input type="color" value={custom || o.defaultHex}
                      aria-label={custom ? `Cambiar el color propio de las ${plural}` : `Elegir otro color para las ${plural}`}
                      aria-pressed={isCustom}
                      onClick={() => { if (custom && !isCustom) set(o.key, { mode: 'custom', color: custom }); }}
                      onChange={e => onPick(e.target.value)} {...focusOn(kc)}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', margin: 0, padding: 0, border: 'none', opacity: 0, cursor: 'pointer' }} />
                  </label>
                  <span aria-hidden="true" style={tipStyle(tip === kc, tipPos)}>
                    {custom ? 'Haz clic para cambiar este color. Para volver al original, elige el primer bloque.' : `Elige otro color para las ${tooltipTarget} de las ${plural}`}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
