import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Tooltip } from '../feedback/Tooltip.jsx';

/** Grupo de botones excluyentes con una píldora que se desliza a la opción elegida. */
export function SegmentedControl({ options = [], value, onChange, fill = false, disabled = false, style, ...rest }) {
  const rootRef = React.useRef(null);
  const btnRefs = React.useRef([]);
  const [pill, setPill] = React.useState(null);
  const [animate, setAnimate] = React.useState(false);
  const [hover, setHover] = React.useState(null);
  const [compact, setCompact] = React.useState(false);
  const iconOnly = options.length > 0 && options.every(o => o.icon && !o.label);
  const idx = options.findIndex(o => o.value === value);

  const measure = React.useCallback(() => {
    const root = rootRef.current, btn = btnRefs.current[idx];
    if (!root || !btn) { setPill(null); return; }
    const r = root.getBoundingClientRect(), b = btn.getBoundingClientRect();
    setPill({ left: b.left - r.left - root.clientLeft, top: b.top - r.top - root.clientTop, width: b.width, height: b.height });
    if (!iconOnly) setCompact(btnRefs.current.some(el => el && el.scrollWidth > el.clientWidth + 1));
  }, [idx, iconOnly]);

  React.useLayoutEffect(() => { measure(); }, [measure, compact]);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);
  React.useEffect(() => {
    if (typeof ResizeObserver === 'undefined' || !rootRef.current) return;
    const ro = new ResizeObserver(() => { setCompact(false); measure(); });
    ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = 'var(--duration-base) var(--ease-out)';
  const pad = iconOnly ? '8px 10px' : compact ? '8px 6px' : '8px 14px';

  return (
    <div ref={rootRef} role="group" style={{
      position: 'relative', display: fill ? 'flex' : 'inline-flex', width: fill ? '100%' : undefined,
      alignSelf: fill ? 'stretch' : 'flex-start', gap: 4, padding: 4, boxSizing: 'border-box',
      background: 'var(--neutral-50)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
      ...style,
    }} {...rest}>
      {pill ? <span aria-hidden="true" style={{
        position: 'absolute', left: pill.left, top: pill.top, width: pill.width, height: pill.height,
        borderRadius: 8,
        background: disabled ? 'var(--neutral-200)' : 'var(--action-primary)',
        boxShadow: disabled ? 'none' : 'var(--shadow-xs)',
        transition: animate && !reduced ? `left ${ease}, top ${ease}, width ${ease}, height ${ease}` : 'none',
      }} /> : null}
      {options.map((o, i) => {
        const selected = i === idx;
        const color = disabled ? 'var(--neutral-400)' : selected ? 'var(--text-inverse)' : 'var(--text-body)';
        const btn = (
          <button key={o.value} ref={el => { btnRefs.current[i] = el; }} type="button"
            aria-pressed={selected} aria-label={iconOnly ? (o.tooltip || String(o.value)) : undefined}
            disabled={disabled}
            onClick={() => { if (!selected && onChange) onChange(o.value); }}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            style={{
              position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              flex: fill ? '1 1 0' : '0 0 auto', minWidth: 0, width: fill && iconOnly ? '100%' : undefined,
              minHeight: iconOnly ? 44 : 40, padding: pad, margin: 0, boxSizing: 'border-box',
              border: 0, borderRadius: 8, overflow: 'hidden',
              background: !disabled && !selected && hover === i ? 'var(--action-secondary)' : 'transparent',
              color, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)',
              lineHeight: 1.2, whiteSpace: 'nowrap',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: `background var(--duration-fast) var(--ease-standard), color ${ease}`,
            }}>
            {o.icon ? <Icon name={o.icon} size={iconOnly ? 24 : 18} /> : null}
            {o.label ? <span>{o.label}</span> : null}
          </button>
        );
        return iconOnly && o.tooltip
          ? <Tooltip key={o.value} content={o.tooltip} placement="top" style={fill ? { flex: '1 1 0' } : undefined}>{btn}</Tooltip>
          : btn;
      })}
    </div>
  );
}
