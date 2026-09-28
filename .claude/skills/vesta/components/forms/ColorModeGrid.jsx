import React from 'react';
import { Icon } from '../core/Icon.jsx';

/** Segmentado de color en 2 × 2: dos opciones fijas, «Personalizado» y un bloque «+» con selector nativo. */
export function ColorModeGrid({ label, options = [], value, customColor, defaultCustomColor = '#000000', onChange, customLabel = 'Personalizado', customValue = 'personalizado', disabled = false, style, ...rest }) {
  const labelId = React.useId();
  const rootRef = React.useRef(null);
  const btnRefs = React.useRef([]);
  const inputRef = React.useRef(null);
  const [pill, setPill] = React.useState(null);
  const [animate, setAnimate] = React.useState(false);
  const [hover, setHover] = React.useState(null);
  const [tip, setTip] = React.useState(false);
  const [focusPlus, setFocusPlus] = React.useState(false);
  const all = [...options.slice(0, 2), { value: customValue, label: customLabel }];
  const idx = all.findIndex(o => o.value === value);
  const isCustom = value === customValue;
  const hasColor = !!customColor;
  const color = customColor || defaultCustomColor;

  const measure = React.useCallback(() => {
    const root = rootRef.current, btn = btnRefs.current[idx];
    if (!root || !btn) { setPill(null); return; }
    const r = root.getBoundingClientRect(), b = btn.getBoundingClientRect();
    setPill({ left: b.left - r.left - root.clientLeft, top: b.top - r.top - root.clientTop, width: b.width, height: b.height });
  }, [idx]);
  React.useLayoutEffect(() => { measure(); }, [measure]);
  React.useEffect(() => { const id = requestAnimationFrame(() => setAnimate(true)); return () => cancelAnimationFrame(id); }, []);
  React.useEffect(() => {
    if (typeof ResizeObserver === 'undefined' || !rootRef.current) return;
    const ro = new ResizeObserver(measure); ro.observe(rootRef.current); return () => ro.disconnect();
  }, [measure]);

  const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = '220ms var(--ease-out)';
  const openPicker = () => { const el = inputRef.current; if (!el) return; try { el.showPicker ? el.showPicker() : el.click(); } catch (e) { el.click(); } };
  const pick = (o) => {
    if (disabled) return;
    if (o.value === customValue) {
      if (!isCustom && onChange) onChange(customValue, color);
      if (!hasColor) openPicker();
      return;
    }
    if (o.value !== value && onChange) onChange(o.value, customColor);
  };
  const onColor = e => { if (onChange) onChange(customValue, e.target.value); };
  const tipText = hasColor ? 'Cambiar el color personalizado' : 'Elegir un color personalizado';
  const plusShadow = focusPlus ? 'var(--focus-ring)' : isCustom && !disabled ? '0 0 0 2px var(--neutral-0), 0 0 0 4px var(--action-primary)' : 'none';

  const group = (
    <div ref={rootRef} role="group" aria-labelledby={label ? labelId : undefined} {...rest}
      style={{ position: 'relative', display: 'grid', gridTemplateRows: 'auto auto', gridAutoFlow: 'column', gridAutoColumns: 'minmax(0, 1fr)',
        gap: 4, padding: 4, minWidth: 0, boxSizing: 'border-box', background: 'var(--neutral-50)',
        border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', ...(label ? null : style) }}>
      {pill ? <span aria-hidden="true" style={{ position: 'absolute', left: pill.left, top: pill.top, width: pill.width, height: pill.height, borderRadius: 8,
        background: disabled ? 'var(--neutral-200)' : 'var(--action-primary)', boxShadow: disabled ? 'none' : 'var(--shadow-xs)',
        transition: animate && !reduced ? `left ${ease}, top ${ease}, width ${ease}, height ${ease}` : 'none' }} /> : null}
      {all.map((o, i) => {
        const sel = i === idx;
        return (
          <button key={o.value} ref={el => { btnRefs.current[i] = el; }} type="button" aria-pressed={sel} disabled={disabled}
            onClick={() => pick(o)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            style={{ position: 'relative', zIndex: 1, minWidth: 0, minHeight: 28, padding: '4px 10px', margin: 0, boxSizing: 'border-box',
              border: 0, borderRadius: 8, overflow: 'hidden', textOverflow: 'ellipsis',
              background: !disabled && !sel && hover === i ? 'var(--action-secondary)' : 'transparent',
              color: disabled ? 'var(--neutral-400)' : sel ? 'var(--text-inverse)' : 'var(--text-body)',
              fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', lineHeight: 1.2, whiteSpace: 'nowrap',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: `background var(--duration-fast) var(--ease-out), color ${ease}` }}>{o.label}</button>
        );
      })}
      <span style={{ position: 'relative', display: 'flex', justifySelf: 'center', alignSelf: 'center', zIndex: 1 }}
        onMouseEnter={() => { setHover('plus'); setTip(true); }} onMouseLeave={() => { setHover(null); setTip(false); }}>
        <label style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, padding: 0, boxSizing: 'border-box',
          border: '1px solid rgba(9, 47, 107, 0.08)', borderRadius: 'var(--radius-sm)',
          background: hasColor ? color : hover === 'plus' && !isCustom && !disabled ? 'var(--neutral-200)' : 'var(--neutral-100)',
          color: disabled ? 'var(--neutral-400)' : 'var(--neutral-600)', cursor: disabled ? 'not-allowed' : 'pointer', boxShadow: plusShadow,
          transition: reduced ? 'none' : 'box-shadow var(--duration-fast) var(--ease-out)' }}>
          {hasColor ? null : <Icon name="plus" size={16} aria-hidden="true" />}
          <input ref={inputRef} type="color" value={color} disabled={disabled} aria-label={tipText}
            onInput={onColor} onChange={onColor}
            onFocus={e => { setFocusPlus(e.currentTarget.matches(':focus-visible')); setTip(true); }}
            onBlur={() => { setFocusPlus(false); setTip(false); }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', margin: 0, padding: 0, border: 'none', opacity: 0, cursor: disabled ? 'not-allowed' : 'pointer' }} />
        </label>
        <span aria-hidden="true" style={{ position: 'absolute', zIndex: 40, bottom: 'calc(100% + 8px)', right: 0, padding: '7px 11px',
          borderRadius: 'var(--radius-sm)', background: 'var(--surface-inverse)', color: 'var(--text-inverse)', fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-xs)', lineHeight: 1.45, whiteSpace: 'nowrap', boxShadow: 'var(--shadow-md)', pointerEvents: 'none',
          opacity: tip && !disabled ? 1 : 0, visibility: tip && !disabled ? 'visible' : 'hidden',
          transition: reduced ? 'none' : 'opacity var(--duration-fast) var(--ease-standard), visibility var(--duration-fast) var(--ease-standard)' }}>{tipText}</span>
      </span>
    </div>
  );
  if (!label) return group;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', minWidth: 0, fontFamily: 'var(--font-sans)', ...style }}>
      <span id={labelId} style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-body)' }}>{label}</span>
      {group}
    </div>
  );
}
