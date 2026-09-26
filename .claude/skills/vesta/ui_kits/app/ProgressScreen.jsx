const { Card, Icon, Badge, ProgressTrack, Button, Tabs } = window.VestaDesignSystem_a1e3d1;

const UNITS = [
  ['Matemáticas', 'math', 'var(--subject-math)', [['Álgebra básica', 100], ['Funciones y gráficas', 72], ['Derivadas', 25], ['Integrales', 0]]],
  ['Física', 'physics', 'var(--subject-physics)', [['Magnitudes y unidades', 100], ['Cinemática', 58], ['Dinámica', 10]]],
  ['Electrónica', 'electronics', 'var(--subject-electronics)', [['Corriente y voltaje', 100], ['Circuitos en serie', 80], ['Circuitos en paralelo', 0]]],
  ['Programación', 'code', 'var(--subject-code)', [['Variables', 100], ['Condiciones', 90], ['Bucles', 45]]],
];

function ProgressScreen() {
  const [tab, setTab] = React.useState('materias');
  return (
    <React.Fragment>
      <window.TopBar subtitle="Desde marzo de 2026" title="Mi avance"
        right={<Button variant="outline" icon="download">Descargar el informe</Button>} />
      <div style={{ padding: 'var(--space-8) var(--space-10) var(--space-16)', background: 'var(--surface-subtle)', minHeight: '100%' }}>
        <Tabs items={[{ value: 'materias', label: 'Por materia' }, { value: 'semana', label: 'Semana a semana' }]} value={tab} onChange={setTab} style={{ marginBottom: 'var(--space-8)' }} />
        {tab === 'materias' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-5)' }}>
            {UNITS.map(([name, key, color, units]) => (
              <Card key={key} padding="var(--space-6)">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color, fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', fontWeight: 600 }}>
                  <Icon name={{ math: 'sigma', physics: 'atom', electronics: 'circuit-board', code: 'terminal' }[key]} size={15} />{name}
                </div>
                <div style={{ marginTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {units.map(([u, v]) => <ProgressTrack key={u} label={u} value={v} />)}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card padding="var(--space-8)">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-4)', height: 200 }}>
              {[['L', 40], ['M', 72], ['X', 55], ['J', 88], ['V', 30], ['S', 96], ['D', 12]].map(([d, v]) => (
                <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', height: v + '%', background: v > 80 ? 'var(--blue-800)' : 'var(--blue-300)', borderRadius: 'var(--radius-sm)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{d}</span>
                </div>
              ))}
            </div>
            <p style={{ margin: 'var(--space-6) 0 0', fontSize: 'var(--text-base)', color: 'var(--text-muted)' }}>Minutos de estudio esta semana. Tu mejor día fue el sábado, con 48 minutos seguidos.</p>
          </Card>
        )}
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { ProgressScreen });
