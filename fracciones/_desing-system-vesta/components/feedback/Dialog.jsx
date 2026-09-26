import React from 'react';
import { IconButton } from '../core/IconButton.jsx';

export function Dialog({ open = true, title, description, children, footer, onClose, width = 520, style, ...rest }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)', background: 'var(--surface-overlay)', backdropFilter: 'blur(3px)' }} onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: width, background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)',
          padding: 'var(--space-8)', ...style,
        }}
        {...rest}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif-display)', fontVariationSettings: '"opsz" 48', fontSize: 'var(--text-xl)', letterSpacing: 'var(--tracking-tight)', color: 'var(--text-heading)', margin: 0 }}>{title}</h3>
          {onClose ? <IconButton icon="x" label="Cerrar" size="sm" /> : null}
        </div>
        {description ? <p style={{ marginTop: 'var(--space-3)', marginBottom: 0, color: 'var(--text-muted)', fontSize: 'var(--text-base)' }}>{description}</p> : null}
        {children ? <div style={{ marginTop: 'var(--space-6)' }}>{children}</div> : null}
        {footer ? <div style={{ marginTop: 'var(--space-8)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>{footer}</div> : null}
      </div>
    </div>
  );
}
