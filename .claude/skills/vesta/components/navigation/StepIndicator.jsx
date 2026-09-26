import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function StepIndicator({ steps = [], current = 0, style, ...rest }) {
  return (
    <ol style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', listStyle: 'none', margin: 0, padding: 0, ...style }} {...rest}>
      {steps.map((label, i) => {
        const done = i < current, active = i === current;
        return (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, flex: '0 0 auto', borderRadius: 'var(--radius-pill)',
              background: done ? 'var(--action-primary)' : active ? 'var(--blue-50)' : 'transparent',
              border: '1px solid ' + (done ? 'var(--action-primary)' : active ? 'var(--border-brand)' : 'var(--border-default)'),
              color: done ? 'var(--text-inverse)' : active ? 'var(--text-brand)' : 'var(--text-muted)',
              fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)',
            }}>{done ? <Icon name="check" size={14} /> : i + 1}</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: active ? 'var(--text-body)' : 'var(--text-muted)', fontWeight: active ? 'var(--weight-medium)' : 'var(--weight-regular)', whiteSpace: 'nowrap' }}>{label}</span>
            {i < steps.length - 1 ? <span style={{ width: 28, height: 1, background: 'var(--border-default)', margin: '0 var(--space-2)' }} /> : null}
          </li>
        );
      })}
    </ol>
  );
}
