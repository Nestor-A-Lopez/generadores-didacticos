import React from 'react';

export function Formula({ children, display = false, label, style, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', ...(display ? { margin: 'var(--space-6) 0' } : null), ...style }} {...rest}>
      <div style={{
        fontFamily: 'var(--font-math)',
        fontSize: display ? 'var(--text-2xl)' : 'var(--text-md)',
        lineHeight: 1.4, color: 'var(--text-heading)',
        textAlign: display ? 'center' : 'left',
        padding: display ? 'var(--space-6) var(--space-5)' : 0,
        background: display ? 'var(--surface-sunken)' : 'transparent',
        borderRadius: display ? 'var(--radius-md)' : 0,
      }}>{children}</div>
      {label ? <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textAlign: display ? 'center' : 'left' }}>{label}</div> : null}
    </div>
  );
}
