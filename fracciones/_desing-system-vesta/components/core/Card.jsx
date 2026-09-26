import React from 'react';

export function Card({ children, elevation = 'sm', tone = 'default', padding = 'var(--space-6)', interactive = false, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const tones = {
    default: { background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' },
    soft: { background: 'var(--surface-brand-soft)', border: '1px solid transparent' },
    outline: { background: 'var(--surface-card)', border: '1px solid var(--border-default)' },
    inverse: { background: 'var(--surface-brand)', border: '1px solid transparent', color: 'var(--text-inverse)' },
  }[tone];
  const shadows = { none: 'none', sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)' };
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 'var(--radius-lg)', padding,
        boxShadow: shadows[elevation] || shadows.sm,
        transition: 'box-shadow var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out)',
        cursor: interactive ? 'pointer' : undefined,
        ...tones,
        ...(interactive && hover ? { boxShadow: 'var(--shadow-lg)', transform: 'translateY(-2px)' } : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
