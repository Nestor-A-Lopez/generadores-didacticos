import React from 'react';
import { Icon } from '../core/Icon.jsx';

const TONES = {
  neutral: ['var(--surface-inverse)', 'var(--text-inverse)', 'info'],
  correct: ['var(--green-700)', 'var(--neutral-0)', 'circle-check'],
  error: ['var(--red-700)', 'var(--neutral-0)', 'circle-alert'],
};

export function Toast({ tone = 'neutral', children, onDismiss, style, ...rest }) {
  const [bg, fg, glyph] = TONES[tone] || TONES.neutral;
  return (
    <div role="status" style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)',
      background: bg, color: fg, padding: '12px 14px 12px 16px',
      borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-lg)',
      fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', maxWidth: 420, ...style,
    }} {...rest}>
      <Icon name={glyph} size={18} />
      <span style={{ flex: 1 }}>{children}</span>
      {onDismiss ? (
        <button onClick={onDismiss} aria-label="Cerrar aviso" style={{ display: 'inline-flex', border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', padding: 4, borderRadius: 'var(--radius-pill)' }}>
          <Icon name="x" size={15} />
        </button>
      ) : null}
    </div>
  );
}
