import React from 'react';

export function Tabs({ items = [], value, onChange, style, ...rest }) {
  const [hover, setHover] = React.useState(null);
  return (
    <div role="tablist" style={{ display: 'flex', gap: 'var(--space-6)', borderBottom: '1px solid var(--border-subtle)', ...style }} {...rest}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value} role="tab" aria-selected={active}
            onClick={() => onChange && onChange(it.value)}
            onMouseEnter={() => setHover(it.value)} onMouseLeave={() => setHover(null)}
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              padding: '12px 0 13px', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)',
              fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)',
              color: active ? 'var(--text-brand)' : hover === it.value ? 'var(--text-body)' : 'var(--text-muted)',
              boxShadow: active ? 'inset 0 -2px 0 var(--border-brand)' : 'none',
              transition: 'color var(--duration-fast) var(--ease-standard)',
            }}
          >{it.label}</button>
        );
      })}
    </div>
  );
}
