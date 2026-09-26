const { Button, IconButton, Card, Icon, Tabs, Callout, Formula, Radio, Input, Field, AnswerFeedback, StepIndicator, ProgressTrack, Switch, Tooltip, Toast, Dialog, Badge } = window.VestaDesignSystem_a1e3d1;

function WorkspaceScreen({ onExit }) {
  const [tab, setTab] = React.useState('ejercicio');
  const [answer, setAnswer] = React.useState('');
  const [state, setState] = React.useState(null);
  const [steps, setSteps] = React.useState(false);
  const [toast, setToast] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);

  const check = () => {
    const v = answer.replace(',', '.').trim();
    setState(v === '44.1' || v === '44' ? 'correct' : v === '' ? null : 'retry');
    setToast(true);
    setTimeout(() => setToast(false), 2600);
  };

  return (
    <React.Fragment>
      <window.TopBar subtitle="Física · Unidad 3 · Lección 2" title="Caída libre"
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Badge tone="brand">4 de 8</Badge>
          <Tooltip content="Escuchar el enunciado"><IconButton icon="volume-2" label="Escuchar" variant="soft" /></Tooltip>
          <Button variant="ghost" icon="x" onClick={() => setLeaving(true)}>Salir</Button>
        </div>} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 0, minHeight: '100%' }}>
        <div style={{ padding: 'var(--space-8) var(--space-10) var(--space-16)' }}>
          <Tabs items={[{ value: 'teoria', label: 'Teoría' }, { value: 'ejercicio', label: 'Ejercicio' }, { value: 'simulador', label: 'Simulador' }]} value={tab} onChange={setTab} />

          {tab === 'teoria' ? (
            <div style={{ maxWidth: 'var(--measure-prose)', marginTop: 'var(--space-8)' }}>
              <p style={{ fontSize: 'var(--text-md)', lineHeight: 'var(--leading-relaxed)' }}>En 1971, un astronauta soltó a la vez una pluma y un martillo sobre la Luna. Llegaron al suelo en el mismo instante: allí no hay aire que frene a la pluma.</p>
              <Callout tone="definition" title="Caída libre">Movimiento de un cuerpo sobre el que sólo actúa la gravedad. En la Tierra siempre es una aproximación: algo de aire queda.</Callout>
              <Formula display label="h es la altura recorrida; g, la gravedad del lugar; t, el tiempo de caída.">h = ½ · g · t²</Formula>
            </div>
          ) : tab === 'simulador' ? (
            <Card elevation="md" padding="0" style={{ marginTop: 'var(--space-8)', overflow: 'hidden' }}>
              <div style={{ height: 340, background: 'var(--surface-sunken)', position: 'relative' }}>
                <window.LayerMotif size={380} style={{ position: 'absolute', right: -90, bottom: -140, opacity: .55 }} />
                <div style={{ position: 'absolute', left: 32, top: 26, fontFamily: 'var(--font-math)', fontSize: 'var(--text-lg)', color: 'var(--blue-800)' }}>t = 1.8 s · h = 15.9 m</div>
                <div style={{ position: 'absolute', left: 130, top: 130, width: 22, height: 22, borderRadius: 'var(--radius-pill)', background: 'var(--blue-800)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-5) var(--space-6)', borderTop: '1px solid var(--border-subtle)' }}>
                <Button icon="play" size="sm">Soltar</Button>
                <Button variant="ghost" icon="rotate-ccw" size="sm">Reiniciar</Button>
                <span style={{ flex: 1 }} />
                <Switch label="Con aire" checked={false} onChange={() => {}} />
              </div>
            </Card>
          ) : (
            <div style={{ maxWidth: 'var(--measure-prose)', marginTop: 'var(--space-8)' }}>
              <StepIndicator steps={['Planteamiento', 'Desarrollo', 'Resultado']} current={state === 'correct' ? 2 : 1} />
              <Card elevation="sm" padding="var(--space-8)" style={{ marginTop: 'var(--space-6)' }}>
                <div style={{ fontSize: 'var(--text-md)', lineHeight: 'var(--leading-normal)', color: 'var(--text-body)' }}>
                  Una piedra cae desde un puente durante <b>3 segundos</b>. Tomando <span style={{ fontFamily: 'var(--font-math)' }}>g = 9.8 m/s²</span>, ¿qué altura tiene el puente?
                </div>
                <Formula style={{ marginTop: 'var(--space-5)' }} display>h = ½ · g · t²</Formula>
                <Field label="Altura del puente" hint="Redondea a una cifra decimal." htmlFor="h" style={{ marginTop: 'var(--space-5)' }}>
                  <Input id="h" value={answer} onChange={(e) => { setAnswer(e.target.value); setState(null); }} placeholder="Escribe el resultado" suffix="m" inputMode="decimal" error={state === 'retry'} />
                </Field>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
                  <Button onClick={check} disabled={!answer}>Revisar respuesta</Button>
                  <Button variant="ghost" onClick={() => setSteps(!steps)}>{steps ? 'Ocultar el desarrollo' : 'Ver el desarrollo'}</Button>
                </div>
              </Card>

              {steps ? (
                <Card tone="soft" padding="var(--space-6)" style={{ marginTop: 'var(--space-4)' }}>
                  <ol style={{ margin: 0, paddingLeft: '1.2em', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-base)', color: 'var(--text-body)' }}>
                    <li>Escribe la fórmula: <span style={{ fontFamily: 'var(--font-math)' }}>h = ½ · g · t²</span></li>
                    <li>Sustituye: <span style={{ fontFamily: 'var(--font-math)' }}>h = ½ · 9.8 · 3²</span></li>
                    <li>Opera: <span style={{ fontFamily: 'var(--font-math)' }}>h = 4.9 · 9 = 44.1 m</span></li>
                  </ol>
                </Card>
              ) : null}

              {state ? (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <AnswerFeedback state={state} action={<Button variant="outline" size="sm" onClick={() => setSteps(true)}>Ver el desarrollo</Button>}>
                    {state === 'correct' ? '44.1 metros. Al triplicar el tiempo, la altura se multiplica por nueve.' : 'El planteamiento es correcto; revisa el cuadrado del tiempo antes de multiplicar.'}
                  </AnswerFeedback>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <aside style={{ borderLeft: '1px solid var(--border-subtle)', padding: 'var(--space-8) var(--space-6)', background: 'var(--surface-subtle)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <ProgressTrack label="Lección" value={4} max={8} />
          <div>
            <div style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Ejercicios</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[1,2,3,4,5,6,7,8].map((n) => {
                const done = n < 4, now = n === 4;
                return <span key={n} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 40, borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600,
                  background: done ? 'var(--green-100)' : now ? 'var(--action-primary)' : 'var(--neutral-0)',
                  color: done ? 'var(--green-700)' : now ? 'var(--neutral-0)' : 'var(--text-muted)',
                  border: '1px solid ' + (done ? 'transparent' : now ? 'transparent' : 'var(--border-default)') }}>{n}</span>;
              })}
            </div>
          </div>
          <Card padding="var(--space-5)">
            <div style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Fórmulas de la unidad</div>
            <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--font-math)', fontSize: 'var(--text-md)', color: 'var(--text-heading)' }}>
              <span>v = d ⁄ t</span><span>a = Δv ⁄ Δt</span><span>h = ½ · g · t²</span>
            </div>
          </Card>
          <Card padding="var(--space-5)">
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Icon name="message-circle" size={18} style={{ color: 'var(--blue-600)', marginTop: 2 }} />
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-body)', lineHeight: 'var(--leading-normal)' }}>¿Te has atascado? Pide una pista antes de mirar el desarrollo.</div>
            </div>
            <Button variant="outline" size="sm" fullWidth style={{ marginTop: 'var(--space-4)' }}>Pedir una pista</Button>
          </Card>
        </aside>
      </div>

      {toast ? <div style={{ position: 'fixed', left: '50%', bottom: 28, transform: 'translateX(-50%)', zIndex: 50 }}><Toast tone="correct">Progreso guardado.</Toast></div> : null}
      <Dialog open={leaving} title="¿Salir de la lección?" description="Tu progreso se guarda solo; puedes volver justo aquí cuando quieras."
        onClose={() => setLeaving(false)}
        footer={<React.Fragment><Button variant="ghost" onClick={() => setLeaving(false)}>Seguir aquí</Button><Button onClick={() => { setLeaving(false); onExit(); }}>Salir</Button></React.Fragment>} />
    </React.Fragment>
  );
}

Object.assign(window, { WorkspaceScreen });
