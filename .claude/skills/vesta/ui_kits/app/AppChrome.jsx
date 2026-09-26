const { Icon, IconButton, Badge, Tooltip } = window.VestaDesignSystem_a1e3d1;

const NAV = [
  { id: 'panel', label: 'Mi panel', glyph: 'layout-dashboard' },
  { id: 'aula', label: 'Aula', glyph: 'book-open' },
  { id: 'avance', label: 'Mi avance', glyph: 'trending-up' },
];

function Sidebar({ screen, onNavigate }) {
  return (
    <aside style={{ width: 232, flex: '0 0 auto', background: 'var(--surface-inverse)', color: 'var(--text-inverse)', display: 'flex', flexDirection: 'column', padding: 'var(--space-6) var(--space-4)', gap: 'var(--space-8)' }}>
      <div style={{ padding: '0 var(--space-3)', fontFamily: 'var(--font-serif-display)', fontVariationSettings: '"opsz" 48', fontSize: 22, fontWeight: 600, letterSpacing: '-.03em' }}>
        Vesta<span style={{ color: 'var(--blue-300)' }}>.</span>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        {NAV.map((n) => {
          const on = screen === n.id;
          return (
            <button key={n.id} onClick={() => onNavigate(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '100%',
              padding: '11px var(--space-3)', minHeight: 44, border: 'none', cursor: 'pointer',
              borderRadius: 'var(--radius-md)', textAlign: 'left',
              background: on ? 'rgba(255,255,255,.12)' : 'transparent',
              color: on ? 'var(--neutral-0)' : 'var(--text-inverse-muted)',
              fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', fontWeight: on ? 600 : 400,
              transition: 'background var(--duration-fast) var(--ease-standard)',
            }}><Icon name={n.glyph} size={19} />{n.label}</button>
          );
        })}
      </nav>
      <div style={{ padding: '0 var(--space-3)' }}>
        <div style={{ fontSize: 'var(--text-2xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--blue-300)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Materias</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[['Matemáticas', 'sigma', 'var(--blue-300)'], ['Física', 'atom', '#a5a1e0'], ['Electrónica', 'circuit-board', '#f0c257'], ['Programación', 'terminal', '#6fc9c9']].map(([n, g, c]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--text-sm)', color: 'var(--text-inverse-muted)' }}><span style={{ color: c, display: 'inline-flex' }}><Icon name={g} size={15} /></span>{n}</div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,.08)' }}>
        <span style={{ width: 34, height: 34, borderRadius: 'var(--radius-pill)', background: 'var(--blue-500)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>NR</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Nadia R.</div>
          <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-inverse-muted)' }}>Racha de 9 días</div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ title, subtitle, right }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', padding: 'var(--space-6) var(--space-10)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-page)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {subtitle ? <div style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)' }}>{subtitle}</div> : null}
        <h2 style={{ fontFamily: 'var(--font-serif-display)', fontVariationSettings: '"opsz" 48', fontSize: 'var(--text-2xl)', fontWeight: 600, letterSpacing: 'var(--tracking-tight)', color: 'var(--text-heading)', margin: subtitle ? '4px 0 0' : 0 }}>{title}</h2>
      </div>
      {right}
    </header>
  );
}

Object.assign(window, { Sidebar, TopBar });
