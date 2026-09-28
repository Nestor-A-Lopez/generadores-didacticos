import React from 'react';
import { Icon } from '../core/Icon.jsx';

const CUSTOM = 'custom';

/** Fila de muestras de color con palomita y anillo deslizante. La última puede ser «Personalizado…». */
export function ColorSwatchGroup({ colors = [], value, onChange, allowCustom = true, customColor = '#8080F0', onCustomColorChange, customLabel = 'Personalizado…', style, ...rest }) {
  const rootRef = React.useRef(null);
  const btnRefs = React.useRef({});
  const [pos, setPos] = React.useState(null);
  const [animate, setAnimate] = React.useState(false);
  const [hover, setHover] = React.useState(null);
  const [focus, setFocus] = React.useState(null);
  const inputId = React.useId();

  const measure = React.useCallback(() => {
    const b = btnRefs.current[value];
    if (!b) { setPos(null); return; }
    setPos(p => (p && p.x === b.offsetLeft && p.y === b.offsetTop) ? p : { x: b.offsetLeft, y: b.offsetTop });
  }, [value]);

  React.useLayoutEffect(() => { measure(); }, [measure, colors.length, allowCustom]);
  React.useEffect(() => {
    if (!pos || animate) return;
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [pos, animate]);
  React.useEffect(() => {
    if (typeof ResizeObserver === 'undefined' || !rootRef.current) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCustom = allowCustom && value === CUSTOM;
  const items = [...colors, ...(allowCustom ? [{ value: CUSTOM, label: customLabel, hex: customColor, custom: true }] : [])];

  const swatch = (c) => {
    const selected = c.value === value;
    const empty = c.custom && !selected;
    const bg = empty ? (hover === c.value ? 'var(--neutral-200)' : 'var(--neutral-100)') : c.hex;
    return (
      <button key={c.value} ref={el => { btnRefs.current[c.value] = el; }} type="button"
        aria-label={c.label} aria-pressed={selected}
        onClick={() => { if (!selected && onChange) onChange(c.value); }}
        onMouseEnter={() => setHover(c.value)} onMouseLeave={() => setHover(null)}
        onFocus={e => setFocus(e.currentTarget.matches(':focus-visible') ? c.value : null)} onBlur={() => setFocus(null)}
        style={{
          width: 40, height: 40, padding: 0, margin: 0, flex: '0 0 auto', boxSizing: 'border-box',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(9,47,107,.08)', borderRadius: 'var(--radius-sm)', background: bg, cursor: 'pointer',
          boxShadow: focus === c.value ? '0 0 0 2px var(--neutral-0), var(--focus-ring)' : 'none', outline: 'none',
          transition: 'background var(--duration-fast) var(--ease-standard)',
        }}>
        {empty
          ? <Icon name="plus" size={20} style={{ color: 'var(--neutral-600)' }} />
          : <Icon name="check" size={20} aria-hidden="true"
              style={{ color: c.custom ? 'var(--neutral-0)' : (c.checkColor || 'var(--neutral-0)'), opacity: selected ? 1 : 0 }} />}
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, ...style }}>
      <div ref={rootRef} role="group" style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 0' }} {...rest}>
        {items.map(swatch)}
        {pos ? <span aria-hidden="true" style={{
          position: 'absolute', left: 0, top: 0, width: 40, height: 40, pointerEvents: 'none', boxSizing: 'border-box',
          borderRadius: 'var(--radius-sm)', boxShadow: '0 0 0 2px var(--neutral-0), 0 0 0 4px var(--action-primary)',
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: animate && !reduced ? 'transform 260ms var(--ease-out)' : 'none',
        }} /> : null}
      </div>
      {isCustom ? (
        <label htmlFor={inputId} style={{
          display: 'flex', alignItems: 'center', gap: 10, minHeight: 48, boxSizing: 'border-box',
          padding: '0 16px 0 10px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
          background: 'var(--surface-card)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
        }}>
          <input id={inputId} type="color" value={customColor}
            onChange={e => onCustomColorChange && onCustomColorChange(e.target.value)}
            style={{ width: 28, height: 28, padding: 0, margin: 0, border: 0, borderRadius: 'var(--radius-xs)', background: 'none', cursor: 'pointer', flex: '0 0 auto' }} />
          <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>Color personalizado</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{String(customColor).toUpperCase()}</span>
        </label>
      ) : null}
    </div>
  );
}
