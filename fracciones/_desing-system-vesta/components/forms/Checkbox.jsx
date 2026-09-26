import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Checkbox({ label, checked = false, onChange, disabled = false, style, ...rest }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 'var(--space-3)', cursor: disabled ? 'not-allowed' : 'pointer', minHeight: 44, padding: '10px 0', opacity: disabled ? .55 : 1, ...style }} {...rest}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} />
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 22, height: 22, flex: '0 0 auto', borderRadius: 'var(--radius-xs)',
        border: '1px solid ' + (checked ? 'var(--action-primary)' : 'var(--border-strong)'),
        background: checked ? 'var(--action-primary)' : 'var(--surface-card)',
        color: 'var(--text-inverse)',
        transition: 'background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)',
      }}>{checked ? <Icon name="check" size={15} /> : null}</span>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', lineHeight: 1.4, color: 'var(--text-body)' }}>{label}</span>
    </label>
  );
}
