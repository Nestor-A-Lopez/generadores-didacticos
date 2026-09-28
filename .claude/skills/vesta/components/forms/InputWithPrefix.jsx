import React from 'react';

/** Campo corto con prefijo gris a la izquierda que actúa como etiqueta (p. ej. número de parte). Compacto, para cuadrículas. */
export function InputWithPrefix({ prefix, prefixWidth, accessibleLabel, id, disabled = false, style, inputStyle, onFocus, onBlur, ...rest }) {
  const autoId = React.useId();
  const inputId = id || `iwp-${autoId}`;
  const [focused, setFocused] = React.useState(false);
  const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', minHeight: 40, minWidth: 0, boxSizing: 'border-box',
      background: 'var(--surface-card)', border: `1px solid ${focused ? 'var(--border-brand)' : 'var(--border-default)'}`,
      borderRadius: 8, overflow: 'hidden', boxShadow: focused ? 'var(--ring-focus)' : 'none',
      opacity: disabled ? 0.6 : 1,
      transition: reduced ? 'none' : 'border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)',
      ...style,
    }}>
      <label htmlFor={inputId} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
        width: prefixWidth, padding: prefixWidth ? 0 : '0 10px', boxSizing: 'border-box',
        background: 'var(--neutral-25)', borderRight: '1px solid var(--border-subtle)',
        fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: 1, color: 'var(--text-muted)',
        whiteSpace: 'nowrap', userSelect: 'none', cursor: disabled ? 'not-allowed' : 'text',
      }}>{prefix}</label>
      <input id={inputId} type="text" disabled={disabled} aria-label={accessibleLabel}
        onFocus={e => { setFocused(true); onFocus && onFocus(e); }}
        onBlur={e => { setFocused(false); onBlur && onBlur(e); }}
        style={{
          flex: '1 1 auto', minWidth: 0, width: '100%', margin: 0, padding: '0 8px', boxSizing: 'border-box',
          border: 0, outline: 'none', background: 'transparent',
          fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-body)',
          cursor: disabled ? 'not-allowed' : 'text',
          ...inputStyle,
        }} {...rest} />
    </div>
  );
}
