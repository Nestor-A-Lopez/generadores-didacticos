import React from 'react';

export function Tooltip({ content, placement = 'top', children, style, ...rest }) {
  const [open, setOpen] = React.useState(false);
  const pos = {
    top: { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    left: { right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
    right: { left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
  }[placement];
  return (
    <span
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
      style={{ position: 'relative', display: 'inline-flex', ...style }} {...rest}
    >
      {children}
      <span role="tooltip" style={{
        position: 'absolute', zIndex: 40, ...pos,
        background: 'var(--surface-inverse)', color: 'var(--text-inverse)',
        padding: '7px 11px', borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', lineHeight: 1.45,
        whiteSpace: 'nowrap', boxShadow: 'var(--shadow-md)', pointerEvents: 'none',
        opacity: open ? 1 : 0, visibility: open ? 'visible' : 'hidden',
        transition: 'opacity var(--duration-fast) var(--ease-standard)',
      }}>{content}</span>
    </span>
  );
}
