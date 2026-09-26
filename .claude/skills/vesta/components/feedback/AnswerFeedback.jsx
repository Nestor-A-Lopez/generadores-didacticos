import React from 'react';
import { Icon } from '../core/Icon.jsx';

const STATES = {
  correct: ['var(--feedback-correct-bg)', 'var(--feedback-correct-fg)', 'circle-check', 'Correcto'],
  retry: ['var(--feedback-retry-bg)', 'var(--feedback-retry-fg)', 'rotate-ccw', 'Casi'],
  incorrect: ['var(--feedback-error-bg)', 'var(--feedback-error-fg)', 'circle-x', 'Todavía no'],
};

export function AnswerFeedback({ state = 'correct', heading, children, action, style, ...rest }) {
  const [bg, fg, glyph, fallback] = STATES[state] || STATES.correct;
  return (
    <div role="status" style={{
      display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)',
      background: bg, color: fg, borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5) var(--space-6)',
      animation: 'none', ...style,
    }} {...rest}>
      <Icon name={glyph} size={26} style={{ marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-serif-display)', fontVariationSettings: '"opsz" 48', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-tight)', marginBottom: 4 }}>{heading || fallback}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-normal)' }}>{children}</div>
      </div>
      {action ? <div style={{ flex: '0 0 auto' }}>{action}</div> : null}
    </div>
  );
}
