import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Badge } from '../core/Badge.jsx';
import { ProgressTrack } from '../navigation/ProgressTrack.jsx';

const SUBJECTS = {
  math: ['var(--subject-math)', 'sigma', 'Matemáticas'],
  physics: ['var(--subject-physics)', 'atom', 'Física'],
  electronics: ['var(--subject-electronics)', 'circuit-board', 'Electrónica'],
  code: ['var(--subject-code)', 'terminal', 'Programación'],
};

export function LessonCard({ title, summary, subject = 'math', meta, progress, badge, onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const [color, glyph, name] = SUBJECTS[subject] || SUBJECTS.math;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
        background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
        boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out)',
        cursor: onClick ? 'pointer' : 'default', ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase' }}>
          <Icon name={glyph} size={15} />{name}
        </span>
        {badge ? <Badge tone="brand">{badge}</Badge> : null}
      </div>
      <h3 style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontVariationSettings: '"opsz" 48', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-tight)', lineHeight: 1.2, color: 'var(--text-heading)' }}>{title}</h3>
      {summary ? <p style={{ margin: 0, fontSize: 'var(--text-base)', lineHeight: 'var(--leading-normal)', color: 'var(--text-muted)' }}>{summary}</p> : null}
      {meta ? <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{meta}</div> : null}
      {typeof progress === 'number' ? <ProgressTrack value={progress} size="sm" showValue={false} style={{ marginTop: 'var(--space-1)' }} /> : null}
    </div>
  );
}
