import React from 'react';

export function Radio({ label, checked = false, onChange, name, value, disabled = false, style, ...rest }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 'var(--space-3)', cursor: disabled ? 'not-allowed' : 'pointer', minHeight: 44, padding: '10px 0', opacity: disabled ? .55 : 1, ...style }} {...rest}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} />
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 22, height: 22, flex: '0 0 auto', borderRadius: 'var(--radius-pill)',
        border: '1px solid ' + (checked ? 'var(--action-primary)' : 'var(--border-strong)'),
        background: 'var(--surface-card)',
        transition: 'border-color var(--duration-fast) var(--ease-standard)',
      }}>
        <span style={{ width: 11, height: 11, borderRadius: 'var(--radius-pill)', background: checked ? 'var(--action-primary)' : 'transparent', transition: 'background var(--duration-fast) var(--ease-standard)' }} />
      </span>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', lineHeight: 1.4, color: 'var(--text-body)' }}>{label}</span>
    </label>
  );
}
