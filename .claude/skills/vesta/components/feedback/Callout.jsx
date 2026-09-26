import React from 'react';
import { Icon } from '../core/Icon.jsx';

const TONES = {
  info: ['var(--feedback-info-bg)', 'var(--feedback-info-fg)', 'var(--feedback-info-line)', 'info'],
  correct: ['var(--feedback-correct-bg)', 'var(--feedback-correct-fg)', 'var(--feedback-correct-line)', 'circle-check'],
  retry: ['var(--feedback-retry-bg)', 'var(--feedback-retry-fg)', 'var(--feedback-retry-line)', 'rotate-ccw'],
  error: ['var(--feedback-error-bg)', 'var(--feedback-error-fg)', 'var(--feedback-error-line)', 'circle-alert'],
  definition: ['var(--neutral-25)', 'var(--text-heading)', 'var(--blue-300)', 'book-open'],
};

export function Callout({ tone = 'info', title, children, icon, style, ...rest }) {
  const [bg, fg, line, glyph] = TONES[tone] || TONES.info;
  return (
    <div style={{
      display: 'flex', gap: 'var(--space-3)', background: bg,
      borderLeft: 'var(--border-accent) solid ' + line,
      borderRadius: '0 var(--radius-md) var(--radius-md) 0',
      padding: 'var(--space-4) var(--space-5)', color: fg, ...style,
    }} {...rest}>
      <Icon name={icon || glyph} size={20} style={{ marginTop: 2 }} />
      <div style={{ minWidth: 0 }}>
        {title ? <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-base)', marginBottom: 2 }}>{title}</div> : null}
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-normal)', color: 'inherit' }}>{children}</div>
      </div>
    </div>
  );
}
