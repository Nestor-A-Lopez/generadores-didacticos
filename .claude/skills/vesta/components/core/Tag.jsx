import React from 'react';
import { Icon } from './Icon.jsx';

const SUBJECTS = {
  math: ['var(--subject-math)', 'sigma'],
  physics: ['var(--subject-physics)', 'atom'],
  electronics: ['var(--subject-electronics)', 'circuit-board'],
  code: ['var(--subject-code)', 'terminal'],
  none: ['var(--blue-700)', null],
};

export function Tag({ children, subject = 'none', selected = false, onRemove, onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const [color, glyph] = SUBJECTS[subject] || SUBJECTS.none;
  const clickable = Boolean(onClick);
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: onRemove ? '5px 6px 5px 12px' : '5px 12px',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid ' + (selected ? color : 'var(--border-default)'),
        background: selected ? color : (clickable && hover ? 'var(--neutral-50)' : 'transparent'),
        color: selected ? 'var(--neutral-0)' : color,
        fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      {glyph ? <Icon name={glyph} size={14} /> : null}
      {children}
      {onRemove ? (
        <button onClick={(e) => { e.stopPropagation(); onRemove(e); }} aria-label={'Quitar ' + children}
          style={{ display: 'inline-flex', border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', padding: 3, borderRadius: 'var(--radius-pill)' }}>
          <Icon name="x" size={13} />
        </button>
      ) : null}
    </span>
  );
}
