import React from 'react';

const TONES = {
  neutral: ['var(--neutral-100)', 'var(--neutral-700)'],
  brand: ['var(--blue-50)', 'var(--blue-800)'],
  correct: ['var(--feedback-correct-bg)', 'var(--feedback-correct-fg)'],
  retry: ['var(--feedback-retry-bg)', 'var(--feedback-retry-fg)'],
  error: ['var(--feedback-error-bg)', 'var(--feedback-error-fg)'],
  solid: ['var(--blue-800)', 'var(--neutral-0)'],
};

export function Badge({ children, tone = 'neutral', style, ...rest }) {
  const [bg, fg] = TONES[tone] || TONES.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: bg, color: fg, padding: '3px 10px',
      borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)',
      letterSpacing: 'var(--tracking-wide)', lineHeight: 1.6, whiteSpace: 'nowrap',
      ...style,
    }} {...rest}>{children}</span>
  );
}
