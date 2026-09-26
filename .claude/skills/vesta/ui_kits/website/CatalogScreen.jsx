const { Button, Card, Icon, Tag, LessonCard, Select, Input, Badge, Tabs } = window.VestaDesignSystem_a1e3d1;

const LESSONS = [
  { subject: 'math', title: 'Qué mide una pendiente', summary: 'La misma idea sirve para una rampa y para el precio de la luz.', min: 14, n: 9, progress: 100 },
  { subject: 'math', title: 'Ecuaciones que no se dejan despejar', summary: 'Cuando la incógnita aparece dos veces, cambia la estrategia.', min: 22, n: 12, progress: 35 },
  { subject: 'physics', title: 'Caída libre', summary: 'Por qué una pluma y un martillo caen igual en el vacío.', min: 12, n: 8, progress: 40, badge: 'Continuar' },
  { subject: 'physics', title: 'El péndulo y su compás', summary: 'Un peso colgado mide el tiempo mejor que la mayoría de relojes.', min: 17, n: 7 },
  { subject: 'electronics', title: 'Por qué parpadea un LED', summary: 'Un condensador que se llena, se vacía y vuelve a empezar.', min: 20, n: 6, badge: 'Nuevo' },
  { subject: 'electronics', title: 'Resistencias en serie', summary: 'Poner obstáculos en fila no es lo mismo que ponerlos en paralelo.', min: 15, n: 10 },
  { subject: 'code', title: 'Bucles que terminan', summary: 'Toda repetición necesita una condición que algún día se cumpla.', min: 18, n: 5 },
  { subject: 'code', title: 'Guardar para después', summary: 'Una variable es un nombre puesto a un valor que aún no conoces.', min: 11, n: 8, progress: 70 },
  { subject: 'math', title: 'El área bajo una curva', summary: 'Sumar infinitos rectángulos muy finos resulta ser una buena idea.', min: 26, n: 11 },
];

const FILTERS = [
  { key: 'all', label: 'Todas', subject: 'none' },
  { key: 'math', label: 'Matemáticas', subject: 'math' },
  { key: 'physics', label: 'Física', subject: 'physics' },
  { key: 'electronics', label: 'Electrónica', subject: 'electronics' },
  { key: 'code', label: 'Programación', subject: 'code' },
];

function CatalogScreen({ onNavigate }) {
  const [filter, setFilter] = React.useState('all');
  const [level, setLevel] = React.useState('2');
  const shown = LESSONS.filter((l) => filter === 'all' || l.subject === filter);
  return (
    <main>
      <section style={{ background: 'var(--surface-sunken)', padding: 'var(--space-16) var(--gutter-lg) var(--space-12)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <window.Eyebrow>Catálogo</window.Eyebrow>
          <window.Display size={48}>312 lecciones, ordenadas por lo que ya sabes</window.Display>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-8)', maxWidth: 720 }}>
            <Input placeholder="Buscar: derivada, circuito, bucle…" prefix={<Icon name="search" size={18} />} style={{ flex: 1, background: 'var(--neutral-0)' }} />
            <Select value={level} onChange={(e) => setLevel(e.target.value)} style={{ width: 210 }}
              options={[{ value: '1', label: 'Desde cero' }, { value: '2', label: 'Nivel intermedio' }, { value: '3', label: 'Avanzado' }]} />
          </div>
        </div>
      </section>

      <section style={{ padding: 'var(--space-10) var(--gutter-lg) var(--space-24)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {FILTERS.map((ft) => (
                <Tag key={ft.key} subject={ft.subject} selected={filter === ft.key} onClick={() => setFilter(ft.key)}>{ft.label}</Tag>
              ))}
            </div>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{shown.length} lecciones</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-5)' }}>
            {shown.map((l) => (
              <LessonCard key={l.title} subject={l.subject} title={l.title} summary={l.summary} badge={l.badge}
                meta={<><span>{l.min} min</span><span>{l.n} ejercicios</span></>} progress={l.progress} onClick={() => onNavigate('leccion')} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { CatalogScreen });
