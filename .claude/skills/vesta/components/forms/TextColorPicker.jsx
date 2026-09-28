import React from 'react';
import { Icon } from '../core/Icon.jsx';

const norm = (h) => String(h || '').trim().toLowerCase();

/** Selector compacto del color de un texto o trazo: dos muestras fijas (la primera es la original) + «+» con selector nativo. */
export function TextColorPicker({ label, options = [], value, onChange, customLabel = 'Elige otro color', style, ...rest }) {
  const labelId = React.useId();
  const [hover, setHover] = React.useState(null);
  const [focus, setFocus] = React.useState(null);
  const [tip, setTip] = React.useState(null);
  const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fixed = options.slice(0, 2);
  const matchIdx = fixed.findIndex(o => norm(o.hex) === norm(value));
  const isCustom = !!value && matchIdx === -1;
  const pick = (hex) => { if (onChange && norm(hex) !== norm(value)) onChange(hex); };
  const ring = '0 0 0 2px var(--neutral-0), 0 0 0 4px var(--action-primary)';
  const focusRing = '0 0 0 2px var(--neutral-0), var(--focus-ring)';

  const tipStyle = (open, pos) => ({
    position: 'absolute', zIndex: 40, bottom: 'calc(100% + 8px)', ...pos,
    background: 'var(--surface-inverse)', color: 'var(--text-inverse)',
    padding: '7px 11px', borderRadius: 'var(--radius-sm)', boxSizing: 'border-box',
    fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', lineHeight: 1.45,
    boxShadow: 'var(--shadow-md)', pointerEvents: 'none',
    opacity: open ? 1 : 0, visibility: open ? 'visible' : 'hidden',
    transition: reduced ? 'none' : 'opacity var(--duration-fast) var(--ease-standard)',
  });
  const base = {
    position: 'relative', width: 40, height: 40, padding: 0, margin: 0, flex: '0 0 auto', boxSizing: 'border-box',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid rgba(9,47,107,.16)', borderRadius: 'var(--radius-sm)', outline: 'none',
    transition: reduced ? 'none' : 'background var(--duration-fast) var(--ease-standard)',
  };
  const shadowFor = (key, selected) => {
    const parts = [];
    if (selected) parts.push(focus === key ? focusRing : ring);
    else if (focus === key) parts.push(focusRing);
    parts.push('var(--shadow-xs)');
    return parts.join(', ');
  };
  const hoverOn = (k) => ({ onMouseEnter: () => { setHover(k); setTip(k); }, onMouseLeave: () => { setHover(null); setTip(t => (t === k ? null : t)); } });
  const focusOn = (k) => ({
    onFocus: e => { const fv = e.currentTarget.matches(':focus-visible'); setFocus(fv ? k : null); setTip(k); },
    onBlur: () => { setFocus(null); setTip(t => (t === k ? null : t)); },
  });

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-sans)', ...style }} {...rest}>
      {label ? <span id={labelId} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-body)', textAlign: 'center' }}>{label}</span> : null}
      <div role="group" aria-labelledby={label ? labelId : undefined} aria-label={label ? undefined : 'Color del texto'}
        style={{ position: 'relative', display: 'flex', gap: 8, padding: 4 }}>
        {fixed.map((o, i) => {
          const k = 'o' + i, selected = matchIdx === i;
          return (
            <span key={k} style={{ position: 'relative', display: 'inline-flex' }}>
              <button type="button" aria-label={o.label} aria-pressed={selected}
                onClick={() => pick(o.hex)} {...hoverOn(k)} {...focusOn(k)}
                style={{ ...base, background: o.hex, cursor: 'pointer', boxShadow: shadowFor(k, selected) }} />
              <span role="tooltip" style={tipStyle(tip === k, i === 0 ? { left: 0 } : { left: '50%', transform: 'translateX(-50%)' }, )}>
                <span style={{ whiteSpace: 'nowrap' }}>{o.label}</span>
              </span>
            </span>
          );
        })}
        <span {...hoverOn('c')}
          style={{ ...base, background: isCustom ? value : (hover === 'c' ? 'var(--neutral-200)' : 'var(--neutral-100)'), boxShadow: shadowFor('c', isCustom), overflow: 'hidden' }}>
          {isCustom ? null : <Icon name="plus" size={20} aria-hidden="true" style={{ color: 'var(--neutral-600)' }} />}
          <input type="color" aria-label={customLabel} value={isCustom ? value : '#000000'}
            onChange={e => pick(e.target.value)} {...focusOn('c')}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', margin: 0, padding: 0, border: 0, opacity: 0, cursor: 'pointer' }} />
        </span>
        <span role="tooltip" style={{ ...tipStyle(tip === 'c', { left: 0, right: 0 }), textAlign: 'center', textWrap: 'pretty' }}>{customLabel}</span>
      </div>
    </div>
  );
}
