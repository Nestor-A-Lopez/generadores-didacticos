import React from 'react';
import { Icon } from './Icon.jsx';

const SIZES = { sm: 36, md: 44, lg: 52 };
const GLYPH = { sm: 16, md: 20, lg: 24 };

export function IconButton({ icon = 'x', label, variant = 'ghost', size = 'md', disabled = false, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const box = SIZES[size] || SIZES.md;
  const base = {
    ghost: { background: 'transparent', color: 'var(--text-brand)' },
    soft: { background: 'var(--action-secondary)', color: 'var(--text-brand)' },
    solid: { background: 'var(--action-primary)', color: 'var(--text-inverse)' },
  }[variant];
  return (
    <button
      aria-label={label}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: box, height: box, padding: 0, border: '1px solid transparent',
        borderRadius: 'var(--radius-pill)', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--duration-fast) var(--ease-standard)',
        ...base,
        ...(hover && !disabled ? { background: variant === 'solid' ? 'var(--action-primary-hover)' : 'var(--action-secondary-hover)' } : null),
        ...(disabled ? { background: 'transparent', color: 'var(--action-disabled-fg)' } : null),
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={GLYPH[size] || 20} />
    </button>
  );
}
