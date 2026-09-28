import React from 'react';
import { Input } from './Input.jsx';
import { Select } from './Select.jsx';
import { Switch } from './Switch.jsx';

export function NumberRow({
  label, value = '', onValueChange, order = 'U', orderOptions = [], onOrderChange,
  showSeparators = true, onShowSeparatorsChange, separatorsLabel = 'Coma y punto',
  onRemove, canRemove = true, reserveRemoveSpace = false,
  hint, error = false, placeholder, id, style, ...rest
}) {
  const inRange = orderOptions.some(o => o.value === order);
  const current = inRange ? order : 'U';
  React.useEffect(() => {
    if (!inRange && orderOptions.length && onOrderChange) onOrderChange('U');
  }, [inRange, orderOptions.length]);

  const removeStyle = {
    minHeight: 44, padding: '0 4px', border: 0, background: 'transparent',
    fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)',
    lineHeight: '44px', color: 'var(--action-primary)', cursor: 'pointer',
  };
  const labelText = typeof label === 'string' ? label : '';
  const lower = labelText ? labelText.charAt(0).toLowerCase() + labelText.slice(1) : 'número';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', minHeight: 44 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)', minWidth: 0 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexShrink: 0 }}>
          <Switch size="sm" label={separatorsLabel} checked={showSeparators}
            onChange={e => onShowSeparatorsChange && onShowSeparatorsChange(e.target.checked)}
            style={{ flexDirection: 'row-reverse' }} />
          {onRemove ? (
            <button type="button" onClick={onRemove} disabled={!canRemove}
              style={{ ...removeStyle, ...(canRemove ? {} : { color: 'var(--neutral-400)', cursor: 'not-allowed' }) }}>Quitar</button>
          ) : reserveRemoveSpace ? (
            <span aria-hidden="true" style={{ ...removeStyle, visibility: 'hidden', pointerEvents: 'none', display: 'inline-block' }}>Quitar</span>
          ) : null}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(96px, 0.8fr) minmax(0, 1.25fr)', gap: 'var(--space-2)' }}>
        <Input id={id} type="text" inputMode="decimal" autoComplete="off" aria-label={labelText || undefined}
          placeholder={placeholder} value={value} error={error} aria-invalid={error ? 'true' : undefined}
          onChange={e => onValueChange && onValueChange(e.target.value)}
          style={error ? { boxShadow: 'var(--ring-error)' } : undefined} />
        <Select aria-label={'Jerarquía de ' + lower} value={current} options={orderOptions}
          onChange={e => onOrderChange && onOrderChange(e.target.value)} />
      </div>
      {hint ? <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', lineHeight: 1.5, color: 'var(--text-muted)', textWrap: 'pretty' }}>{hint}</span> : null}
    </div>
  );
}
