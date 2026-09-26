const { Button, Icon, IconButton } = window.VestaDesignSystem_a1e3d1;

const NAV = [
  { id: 'home', label: 'Inicio' },
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'metodo', label: 'El método' },
  { id: 'precios', label: 'Precios' },
];

function Wordmark({ tone = 'dark' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2, fontFamily: 'var(--font-serif-display)', fontVariationSettings: '"opsz" 48', fontSize: 24, fontWeight: 600, letterSpacing: '-.03em', color: tone === 'dark' ? 'var(--text-heading)' : 'var(--neutral-0)' }}>
      Vesta<span style={{ color: 'var(--blue-500)' }}>.</span>
    </span>
  );
}

function SiteHeader({ screen, onNavigate }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--gutter-lg)', height: 76, display: 'flex', alignItems: 'center', gap: 'var(--space-10)' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} style={{ textDecoration: 'none' }}><Wordmark /></a>
        <nav style={{ display: 'flex', gap: 'var(--space-8)', flex: 1 }}>
          {NAV.map((n) => (
            <a key={n.id} href="#" onClick={(e) => { e.preventDefault(); onNavigate(n.id); }}
              style={{ textDecoration: 'none', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', fontWeight: screen === n.id ? 'var(--weight-semibold)' : 'var(--weight-regular)', color: screen === n.id ? 'var(--text-brand)' : 'var(--text-body)' }}>{n.label}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <IconButton icon="search" label="Buscar" size="sm" />
          <Button variant="ghost" size="sm">Entrar</Button>
          <Button size="sm" iconRight="arrow-right">Probar gratis</Button>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  const cols = [
    ['Materias', ['Matemáticas', 'Física', 'Electrónica', 'Programación']],
    ['Vesta', ['El método', 'Para centros', 'Para familias', 'Empleo']],
    ['Recursos', ['Blog', 'Guía del docente', 'Ayuda', 'Estado del servicio']],
  ];
  return (
    <footer style={{ background: 'var(--surface-inverse)', color: 'var(--text-inverse)', padding: 'var(--space-20) var(--gutter-lg) var(--space-10)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.6fr repeat(3, 1fr)', gap: 'var(--space-12)' }}>
        <div>
          <Wordmark tone="light" />
          <p style={{ color: 'var(--text-inverse-muted)', fontSize: 'var(--text-base)', marginTop: 'var(--space-4)', maxWidth: '34ch' }}>
            Un lugar donde las ciencias exactas se aprenden mirándolas de cerca, a cualquier edad a partir de los doce.
          </p>
        </div>
        {cols.map(([title, items]) => (
          <div key={title}>
            <div style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--blue-200)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-4)' }}>{title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {items.map((i) => <a key={i} href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--text-inverse-muted)', textDecoration: 'none', fontSize: 'var(--text-base)' }}>{i}</a>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 'var(--container-max)', margin: 'var(--space-16) auto 0', paddingTop: 'var(--space-6)', borderTop: '1px solid rgba(255,255,255,.14)', display: 'flex', justifyContent: 'space-between', color: 'var(--text-inverse-muted)', fontSize: 'var(--text-sm)' }}>
        <span>© 2026 Vesta</span>
        <span style={{ display: 'flex', gap: 'var(--space-6)' }}><a href="#" onClick={(e)=>e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>Privacidad</a><a href="#" onClick={(e)=>e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>Condiciones</a></span>
      </div>
    </footer>
  );
}

/** The layered paper-cut motif from the brand material. Flat planes, never gradients. */
function LayerMotif({ size = 560, style }) {
  const layers = [
    ['var(--blue-50)', 1],
    ['var(--blue-200)', 0.78],
    ['var(--blue-500)', 0.58],
    ['var(--subject-physics)', 0.4],
    ['var(--blue-950)', 0.24],
  ];
  return (
    <div style={{ position: 'relative', width: size, height: size, ...style }} aria-hidden>
      {layers.map(([c, k], i) => (
        <div key={i} style={{
          position: 'absolute', top: '50%', left: '50%', width: size * k, height: size * k,
          transform: 'translate(-45%, -52%) rotate(' + (i * 14) + 'deg)',
          background: c, borderRadius: 'var(--radius-blob)',
        }} />
      ))}
    </div>
  );
}

function Section({ children, tone = 'page', style }) {
  const bg = { page: 'var(--surface-page)', sunken: 'var(--surface-sunken)', subtle: 'var(--surface-subtle)', inverse: 'var(--surface-brand)' }[tone];
  return (
    <section style={{ background: bg, padding: 'var(--space-24) var(--gutter-lg)', ...style }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>{children}</div>
    </section>
  );
}

function Eyebrow({ children, color = 'var(--blue-600)' }) {
  return <div style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', fontWeight: 'var(--weight-semibold)', color, marginBottom: 'var(--space-4)' }}>{children}</div>;
}

function Display({ children, size = 60, tone = 'var(--text-heading)', style }) {
  return <h1 style={{ fontFamily: 'var(--font-serif-display)', fontVariationSettings: '"opsz" 120', fontSize: size, fontWeight: 600, letterSpacing: 'var(--tracking-tight)', lineHeight: 'var(--leading-tight)', color: tone, margin: 0, textWrap: 'pretty', ...style }}>{children}</h1>;
}

Object.assign(window, { SiteHeader, SiteFooter, Wordmark, LayerMotif, Section, Eyebrow, Display });
