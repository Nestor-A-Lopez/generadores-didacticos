import React from 'react';

export function Field({ label, hint, error, htmlFor, required = false, children, style, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', ...style }} {...rest}>
      {label ? (
        <label htmlFor={htmlFor} style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-body)' }}>
          {label}{required ? <span style={{ color: 'var(--red-500)' }}> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--feedback-error-fg)' }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{hint}</span>
      ) : null}
    </div>
  );
}
