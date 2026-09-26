import React from 'react';

export function Input({ error = false, prefix, suffix, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
      background: 'var(--surface-card)',
      border: '1px solid ' + (error ? 'var(--red-500)' : focus ? 'var(--border-brand)' : 'var(--border-default)'),
      borderRadius: 'var(--radius-md)', padding: '0 14px', minHeight: 48,
      boxShadow: focus ? (error ? 'var(--ring-error)' : 'var(--ring-focus)') : 'none',
      transition: 'border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)',
      ...style,
    }}>
      {prefix ? <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }}>{prefix}</span> : null}
      <input
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', color: 'var(--text-body)', padding: '12px 0' }}
        {...rest}
      />
      {suffix ? <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-math)' }}>{suffix}</span> : null}
    </div>
  );
}
