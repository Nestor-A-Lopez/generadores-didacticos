const { Button, Card, Icon, Badge, Tabs, Callout, Formula, ProgressTrack, StepIndicator, Radio, AnswerFeedback } = window.VestaDesignSystem_a1e3d1;

function LessonPreviewScreen({ onNavigate }) {
  const [tab, setTab] = React.useState('teoria');
  const [answer, setAnswer] = React.useState(null);
  const [checked, setChecked] = React.useState(false);
  return (
    <main>
      <section style={{ borderBottom: '1px solid var(--border-subtle)', padding: 'var(--space-10) var(--gutter-lg) 0' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('catalogo'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', textDecoration: 'none' }}><Icon name="arrow-left" size={15} /> Volver al catálogo</a>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-8)', marginTop: 'var(--space-5)' }}>
            <div>
              <window.Eyebrow color="var(--subject-physics)">Física · Unidad 3 · Lección 2</window.Eyebrow>
              <window.Display size={44}>Caída libre</window.Display>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', paddingBottom: 6 }}>
              <Button variant="outline" icon="bookmark">Guardar</Button>
              <Button iconRight="arrow-right">Continuar la unidad</Button>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-6)' }}>
            <Tabs items={[{ value: 'teoria', label: 'Teoría' }, { value: 'ejercicios', label: 'Ejercicios' }, { value: 'simulador', label: 'Simulador' }]} value={tab} onChange={setTab} />
          </div>
        </div>
      </section>

      <section style={{ padding: 'var(--space-12) var(--gutter-lg) var(--space-24)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-16)', alignItems: 'start' }}>
          <div>
            {tab === 'teoria' ? (
              <div style={{ maxWidth: 'var(--measure-prose)' }}>
                <p style={{ fontSize: 'var(--text-md)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-body)' }}>
                  En 1971, un astronauta soltó a la vez una pluma y un martillo sobre la superficie de la Luna. Llegaron al suelo en el mismo instante. No hubo truco: allí no hay aire que frene a la pluma.
                </p>
                <Callout tone="definition" title="Caída libre">Movimiento de un cuerpo sobre el que sólo actúa la gravedad. En la Tierra es una aproximación: siempre queda algo de aire.</Callout>
                <p style={{ fontSize: 'var(--text-md)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-body)', marginTop: 'var(--space-6)' }}>
                  La altura recorrida no depende del peso del objeto, sino del tiempo que lleva cayendo y de la gravedad del lugar.
                </p>
                <Formula display label="h es la altura recorrida; g, la gravedad del lugar; t, el tiempo de caída.">h = ½ · g · t²</Formula>
                <Callout tone="info">En la Luna, <span style={{ fontFamily: 'var(--font-math)' }}>g</span> vale una sexta parte que en la Tierra. Por eso los saltos de los astronautas parecen tan lentos.</Callout>
              </div>
            ) : tab === 'ejercicios' ? (
              <div style={{ maxWidth: 'var(--measure-prose)' }}>
                <StepIndicator steps={['Planteamiento', 'Desarrollo', 'Resultado']} current={1} />
                <Card elevation="sm" padding="var(--space-8)" style={{ marginTop: 'var(--space-6)' }}>
                  <div style={{ fontSize: 'var(--text-md)', color: 'var(--text-body)', lineHeight: 'var(--leading-normal)' }}>
                    Una piedra cae desde un puente durante 3 segundos. ¿Qué expresión te da la altura del puente?
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'var(--space-4)' }}>
                    {[['a', 'h = g · t'], ['b', 'h = ½ · g · t²'], ['c', 'h = g / t²']].map(([k, l]) => (
                      <Radio key={k} name="q" label={<span style={{ fontFamily: 'var(--font-math)', fontSize: 'var(--text-md)' }}>{l}</span>} checked={answer === k} onChange={() => { setAnswer(k); setChecked(false); }} />
                    ))}
                  </div>
                  <Button style={{ marginTop: 'var(--space-5)' }} disabled={!answer} onClick={() => setChecked(true)}>Revisar respuesta</Button>
                </Card>
                {checked ? (
                  <div style={{ marginTop: 'var(--space-5)' }}>
                    <AnswerFeedback state={answer === 'b' ? 'correct' : 'retry'} action={<Button variant="outline" size="sm">Ver el desarrollo</Button>}>
                      {answer === 'b' ? 'La altura crece con el cuadrado del tiempo: en 3 s son unos 44 metros.' : 'Fíjate en cómo crece la altura al doblar el tiempo: no se dobla, se multiplica por cuatro.'}
                    </AnswerFeedback>
                  </div>
                ) : null}
              </div>
            ) : (
              <Card elevation="md" padding="0" style={{ overflow: 'hidden' }}>
                <div style={{ height: 380, background: 'var(--surface-sunken)', position: 'relative' }}>
                  <window.LayerMotif size={420} style={{ position: 'absolute', right: -80, bottom: -120, opacity: .6 }} />
                  <div style={{ position: 'absolute', left: 32, top: 28, fontFamily: 'var(--font-math)', fontSize: 'var(--text-lg)', color: 'var(--blue-800)' }}>t = 1.8 s · h = 15.9 m</div>
                  <div style={{ position: 'absolute', left: 120, top: 120, width: 22, height: 22, borderRadius: 'var(--radius-pill)', background: 'var(--blue-800)' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-5) var(--space-6)', borderTop: '1px solid var(--border-subtle)' }}>
                  <Button icon="play" size="sm">Soltar</Button>
                  <Button variant="ghost" icon="rotate-ccw" size="sm">Reiniciar</Button>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Gravedad: Tierra (9.8 m/s²)</span>
                </div>
              </Card>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', position: 'sticky', top: 96 }}>
            <Card tone="soft" padding="var(--space-6)">
              <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)', marginBottom: 'var(--space-4)' }}>Tu avance en la unidad</div>
              <ProgressTrack label="Cinemática" value={7} max={12} />
              <div style={{ marginTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[['Velocidad media', true], ['Aceleración', true], ['Caída libre', false], ['Tiro parabólico', false]].map(([t, done]) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--text-sm)', color: done ? 'var(--text-muted)' : 'var(--text-body)' }}>
                    <Icon name={done ? 'circle-check' : 'circle'} size={16} style={{ color: done ? 'var(--green-500)' : 'var(--neutral-300)' }} />{t}
                  </div>
                ))}
              </div>
            </Card>
            <Card padding="var(--space-6)">
              <div style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Necesitas antes</div>
              <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 'var(--text-base)' }}>Qué es la aceleración</a>
                <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 'var(--text-base)' }}>Unidades del sistema internacional</a>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { LessonPreviewScreen });
