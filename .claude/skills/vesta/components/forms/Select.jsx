import React from 'react';

export function Select({ options = [], error = false, style, children, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{ position: 'relative', ...style }}>
      <select
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: '100%', appearance: 'none', minHeight: 48, padding: '12px 42px 12px 14px',
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', color: 'var(--text-body)',
          background: 'var(--surface-card)', borderRadius: 'var(--radius-md)',
          border: '1px solid ' + (error ? 'var(--red-500)' : focus ? 'var(--border-brand)' : 'var(--border-default)'),
          boxShadow: focus ? 'var(--ring-focus)' : 'none', outline: 'none', cursor: 'pointer',
        }}
        {...rest}
      >
        {children || options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span aria-hidden style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-60%) rotate(45deg)', width: 8, height: 8, borderRight: '2px solid var(--neutral-500)', borderBottom: '2px solid var(--neutral-500)', pointerEvents: 'none' }} />
    </div>
  );
}
