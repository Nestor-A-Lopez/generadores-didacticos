const { Button, Card, Icon, Badge, LessonCard, ProgressTrack, Callout } = window.VestaDesignSystem_a1e3d1;

function StatCard({ label, value, unit, glyph }) {
  return (
    <Card padding="var(--space-5)">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}><Icon name={glyph} size={16} />{label}</div>
      <div style={{ marginTop: 'var(--space-3)', fontFamily: 'var(--font-serif-display)', fontVariationSettings: '"opsz" 48', fontSize: 34, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text-heading)' }}>
        {value}<span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>{unit}</span>
      </div>
    </Card>
  );
}

function DashboardScreen({ onOpenLesson }) {
  return (
    <React.Fragment>
      <window.TopBar subtitle="Martes, 16 de septiembre" title="Buenos días, Nadia"
        right={<Button icon="search" variant="outline">Buscar una lección</Button>} />
      <div style={{ padding: 'var(--space-8) var(--space-10) var(--space-16)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', background: 'var(--surface-subtle)', minHeight: '100%' }}>
        <Card tone="inverse" padding="var(--space-8)" style={{ position: 'relative', overflow: 'hidden' }}>
          <window.LayerMotif size={360} style={{ position: 'absolute', right: -70, top: -120, opacity: .25 }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-8)' }}>
            <div style={{ maxWidth: '46ch' }}>
              <div style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', fontWeight: 600, color: 'var(--blue-200)' }}>Continúa donde lo dejaste</div>
              <h3 style={{ fontFamily: 'var(--font-serif-display)', fontVariationSettings: '"opsz" 48', fontSize: 30, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--neutral-0)', margin: 'var(--space-3) 0 var(--space-2)' }}>Caída libre</h3>
              <p style={{ color: 'var(--text-inverse-muted)', fontSize: 'var(--text-base)', margin: 0 }}>Te quedan 4 ejercicios de 8. Unos diez minutos.</p>
            </div>
            <Button variant="inverse" size="lg" iconRight="arrow-right" onClick={onOpenLesson}>Seguir</Button>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
          <StatCard label="Racha" value="9" unit="días" glyph="flame" />
          <StatCard label="Esta semana" value="2 h 40" unit="de estudio" glyph="clock" />
          <StatCard label="Lecciones" value="38" unit="completadas" glyph="circle-check" />
          <StatCard label="Aciertos" value="82" unit="%" glyph="target" />
        </div>

        <Callout tone="info" title="Un repaso pendiente">Hace dos semanas que no tocas <b>Resistencias en serie</b>. Cinco minutos bastan para que no se enfríe.</Callout>

        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif-display)', fontVariationSettings: '"opsz" 48', fontSize: 'var(--text-xl)', fontWeight: 600, letterSpacing: '-.02em', color: 'var(--text-heading)', margin: 0 }}>Siguiente en tu ruta</h3>
            <Button variant="ghost" size="sm" iconRight="arrow-right">Ver el aula completa</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
            <LessonCard subject="physics" title="Caída libre" summary="Por qué una pluma y un martillo caen igual en el vacío." meta={<><span>12 min</span><span>8 ejercicios</span></>} progress={50} badge="Continuar" onClick={onOpenLesson} />
            <LessonCard subject="math" title="El área bajo una curva" summary="Sumar infinitos rectángulos muy finos resulta ser una buena idea." meta={<><span>26 min</span><span>11 ejercicios</span></>} onClick={onOpenLesson} />
            <LessonCard subject="electronics" title="Resistencias en serie" summary="Poner obstáculos en fila no es lo mismo que ponerlos en paralelo." meta={<><span>15 min</span><span>10 ejercicios</span></>} progress={80} onClick={onOpenLesson} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { DashboardScreen });
