import React from 'react';

export function ProgressTrack({ value = 0, max = 100, label, showValue = true, size = 'md', style, ...rest }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const h = size === 'sm' ? 6 : size === 'lg' ? 12 : 8;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', ...style }} {...rest}>
      {(label || showValue) ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--space-3)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)' }}>
          <span style={{ color: 'var(--text-body)' }}>{label}</span>
          {showValue ? <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(pct)}%</span> : null}
        </div>
      ) : null}
      <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}
        style={{ height: h, borderRadius: 'var(--radius-pill)', background: 'var(--blue-50)', overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', borderRadius: 'var(--radius-pill)', background: 'var(--action-primary)', transition: 'width var(--duration-slow) var(--ease-out)' }} />
      </div>
    </div>
  );
}
