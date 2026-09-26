import React from 'react';
import { Icon } from './Icon.jsx';

const SIZES = {
  sm: { padding: '8px 14px', fontSize: 'var(--text-sm)', gap: '6px', icon: 16, minHeight: 36 },
  md: { padding: '11px 20px', fontSize: 'var(--text-base)', gap: '8px', icon: 18, minHeight: 44 },
  lg: { padding: '15px 28px', fontSize: 'var(--text-md)', gap: '10px', icon: 20, minHeight: 52 },
};

const VARIANTS = {
  primary: { background: 'var(--action-primary)', color: 'var(--text-inverse)', border: '1px solid var(--action-primary)', boxShadow: 'var(--shadow-sm)' },
  secondary: { background: 'var(--action-secondary)', color: 'var(--text-brand)', border: '1px solid transparent', boxShadow: 'none' },
  outline: { background: 'transparent', color: 'var(--text-brand)', border: '1px solid var(--border-brand)', boxShadow: 'none' },
  ghost: { background: 'transparent', color: 'var(--text-brand)', border: '1px solid transparent', boxShadow: 'none' },
  inverse: { background: 'var(--neutral-0)', color: 'var(--blue-900)', border: '1px solid transparent', boxShadow: 'var(--shadow-sm)' },
};

const HOVER = {
  primary: { background: 'var(--action-primary-hover)', borderColor: 'var(--action-primary-hover)' },
  secondary: { background: 'var(--action-secondary-hover)' },
  outline: { background: 'var(--action-secondary)' },
  ghost: { background: 'var(--action-secondary)' },
  inverse: { background: 'var(--blue-50)' },
};

export function Button({
  children, variant = 'primary', size = 'md', icon, iconRight,
  fullWidth = false, disabled = false, style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex', width: fullWidth ? '100%' : undefined,
        alignItems: 'center', justifyContent: 'center', gap: s.gap,
        fontFamily: 'var(--font-sans)', fontWeight: 'var(--weight-medium)',
        fontSize: s.fontSize, lineHeight: 1.2, minHeight: s.minHeight, padding: s.padding,
        borderRadius: 'var(--radius-pill)', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--duration-fast) var(--ease-standard), transform var(--duration-instant) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)',
        ...v,
        ...(hover && !disabled ? HOVER[variant] : null),
        ...(press && !disabled ? { transform: 'translateY(1px)', boxShadow: 'none' } : null),
        ...(disabled ? { background: 'var(--action-disabled-bg)', color: 'var(--action-disabled-fg)', borderColor: 'transparent', boxShadow: 'none' } : null),
        ...style,
      }}
      {...rest}
    >
      {icon ? <Icon name={icon} size={s.icon} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={s.icon} /> : null}
    </button>
  );
}
