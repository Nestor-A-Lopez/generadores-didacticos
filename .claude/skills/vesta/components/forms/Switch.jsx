import React from 'react';

export function Switch({ label, checked = false, onChange, disabled = false, size = 'md', style, ...rest }) {
  const sm = size === 'sm';
  const [focusRing, setFocusRing] = React.useState(false);
  const focusProps = {
    onFocus: e => setFocusRing(e.target.matches(':focus-visible')),
    onBlur: () => setFocusRing(false),
  };
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: sm ? 'var(--space-2)' : 'var(--space-3)', cursor: disabled ? 'not-allowed' : 'pointer', minHeight: 44, ...(sm ? { margin: '-8px 0' } : {}), opacity: disabled ? .55 : 1, ...style }} {...rest}>
      <input type="checkbox" role="switch" checked={checked} onChange={onChange} disabled={disabled} {...focusProps} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} />
      <span style={{
        position: 'relative', width: 46, height: 26, flex: '0 0 auto',
        borderRadius: 'var(--radius-pill)',
        background: checked ? 'var(--action-primary)' : 'var(--neutral-200)',
        transition: 'background var(--duration-base) var(--ease-standard)',
        ...(focusRing ? { boxShadow: 'var(--focus-ring)' } : {}),
      }}>
        <span style={{
          position: 'absolute', top: 3, left: checked ? 23 : 3, width: 20, height: 20,
          borderRadius: 'var(--radius-pill)', background: 'var(--neutral-0)', boxShadow: 'var(--shadow-sm)',
          transition: 'left var(--duration-base) var(--ease-out)',
        }} />
      </span>
      {label ? <span style={{ fontFamily: 'var(--font-sans)', fontSize: sm ? 'var(--text-sm)' : 'var(--text-base)', color: 'var(--text-body)', ...(sm ? { whiteSpace: 'nowrap' } : {}) }}>{label}</span> : null}
    </label>
  );
}
