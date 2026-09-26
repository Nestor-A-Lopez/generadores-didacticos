import React from 'react';

export function Switch({ label, checked = false, onChange, disabled = false, style, ...rest }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', cursor: disabled ? 'not-allowed' : 'pointer', minHeight: 44, opacity: disabled ? .55 : 1, ...style }} {...rest}>
      <input type="checkbox" role="switch" checked={checked} onChange={onChange} disabled={disabled} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} />
      <span style={{
        position: 'relative', width: 46, height: 26, flex: '0 0 auto',
        borderRadius: 'var(--radius-pill)',
        background: checked ? 'var(--action-primary)' : 'var(--neutral-200)',
        transition: 'background var(--duration-base) var(--ease-standard)',
      }}>
        <span style={{
          position: 'absolute', top: 3, left: checked ? 23 : 3, width: 20, height: 20,
          borderRadius: 'var(--radius-pill)', background: 'var(--neutral-0)', boxShadow: 'var(--shadow-sm)',
          transition: 'left var(--duration-base) var(--ease-out)',
        }} />
      </span>
      {label ? <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', color: 'var(--text-body)' }}>{label}</span> : null}
    </label>
  );
}
