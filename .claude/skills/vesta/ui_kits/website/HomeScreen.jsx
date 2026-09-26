const { Button, Card, Icon, Tag, LessonCard, Formula, Badge } = window.VestaDesignSystem_a1e3d1;

const DISCIPLINES = [
  { subject: 'math', glyph: 'sigma', name: 'Matemáticas', color: 'var(--subject-math)', line: 'Del álgebra que ordena a la geometría que mide.' },
  { subject: 'physics', glyph: 'atom', name: 'Física', color: 'var(--subject-physics)', line: 'Las reglas que sigue el mundo cuando nadie lo mira.' },
  { subject: 'electronics', glyph: 'circuit-board', name: 'Electrónica', color: 'var(--subject-electronics)', line: 'Lo que ocurre entre una pila y una bombilla.' },
  { subject: 'code', glyph: 'terminal', name: 'Programación', color: 'var(--subject-code)', line: 'Escribir instrucciones que una máquina obedece.' },
];

const STEPS = [
  ['Mira', 'eye', 'Cada idea empieza con algo que puedes ver moverse: un péndulo, una curva, una corriente.'],
  ['Prueba', 'flask-conical', 'Cambias un valor y el simulador responde. La intuición llega antes que la fórmula.'],
  ['Formaliza', 'sigma', 'Sólo entonces aparece la ecuación, y ya no es un símbolo extraño.'],
];

function HomeScreen({ onNavigate }) {
  return (
    <main>
      <section style={{ position: 'relative', overflow: 'hidden', padding: 'var(--space-24) var(--gutter-lg) var(--space-32)' }}>
        <window.LayerMotif size={760} style={{ position: 'absolute', right: -180, top: -120, opacity: .95 }} />
        <div style={{ position: 'relative', maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <div style={{ maxWidth: '18ch' }}>
            <window.Eyebrow>Ciencias exactas, de los 12 en adelante</window.Eyebrow>
            <window.Display size={72}>Aprender a mirar lo exacto</window.Display>
            <p style={{ fontSize: 'var(--text-md)', lineHeight: 'var(--leading-normal)', color: 'var(--text-body)', marginTop: 'var(--space-6)', maxWidth: '38ch' }}>
              Matemáticas, física, electrónica y programación explicadas con calma, con simuladores que puedes tocar y ejercicios que responden como responde un profesor: diciéndote dónde mirar.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-8)' }}>
              <Button size="lg" iconRight="arrow-right" onClick={() => onNavigate('catalogo')}>Ver el catálogo</Button>
              <Button size="lg" variant="outline" icon="play">Ver una lección</Button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-8)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              <Icon name="users" size={17} /> 240 centros educativos · 61 000 personas estudiando
            </div>
          </div>
        </div>
      </section>

      <window.Section tone="sunken">
        <window.Eyebrow>Cuatro materias, un mismo método</window.Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-5)' }}>
          {DISCIPLINES.map((d) => (
            <Card key={d.subject} interactive elevation="sm" padding="var(--space-6)" onClick={() => onNavigate('catalogo')}>
              <span style={{ display: 'inline-flex', width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', background: 'var(--blue-50)', color: d.color }}><Icon name={d.glyph} size={22} /></span>
              <h3 style={{ fontFamily: 'var(--font-serif-display)', fontVariationSettings: '"opsz" 48', fontSize: 'var(--text-lg)', fontWeight: 600, letterSpacing: 'var(--tracking-tight)', color: 'var(--text-heading)', margin: 'var(--space-4) 0 var(--space-2)' }}>{d.name}</h3>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)', color: 'var(--text-muted)' }}>{d.line}</p>
            </Card>
          ))}
        </div>
      </window.Section>

      <window.Section>
        <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 'var(--space-20)', alignItems: 'center' }}>
          <div>
            <window.Eyebrow>El método</window.Eyebrow>
            <window.Display size={44}>Primero la intuición. Después el símbolo.</window.Display>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', marginTop: 'var(--space-8)' }}>
              {STEPS.map(([t, g, d], i) => (
                <div key={t} style={{ display: 'flex', gap: 'var(--space-4)' }}>
                  <span style={{ display: 'inline-flex', width: 40, height: 40, flex: '0 0 auto', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-pill)', background: 'var(--blue-800)', color: 'var(--neutral-0)' }}><Icon name={g} size={19} /></span>
                  <div>
                    <div style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-md)', color: 'var(--text-heading)' }}>{i + 1}. {t}</div>
                    <p style={{ margin: '4px 0 0', fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 'var(--leading-normal)' }}>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card elevation="lg" padding="var(--space-8)">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', fontWeight: 600, color: 'var(--subject-physics)' }}>Física · Unidad 3</span>
              <Badge tone="brand">Vista previa</Badge>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif-display)', fontVariationSettings: '"opsz" 48', fontSize: 'var(--text-2xl)', fontWeight: 600, letterSpacing: 'var(--tracking-tight)', color: 'var(--text-heading)', margin: 'var(--space-3) 0 var(--space-4)' }}>Caída libre</h3>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-body)', lineHeight: 'var(--leading-normal)' }}>
              Sin aire que los frene, una pluma y un martillo llegan al suelo a la vez. La altura que recorren depende sólo del tiempo que llevan cayendo.
            </p>
            <Formula display label="h es la altura recorrida; g, la gravedad del lugar; t, el tiempo de caída.">h = ½ · g · t²</Formula>
            <Button fullWidth iconRight="arrow-right" onClick={() => onNavigate('catalogo')}>Abrir la lección</Button>
          </Card>
        </div>
      </window.Section>

      <window.Section tone="subtle">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
          <div><window.Eyebrow>Empezar por aquí</window.Eyebrow><window.Display size={38}>Lecciones que abren puerta</window.Display></div>
          <Button variant="ghost" iconRight="arrow-right" onClick={() => onNavigate('catalogo')}>Ver las 312 lecciones</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-5)' }}>
          <LessonCard subject="math" title="Qué mide una pendiente" summary="La misma idea sirve para una rampa y para el precio de la luz." meta={<><span>14 min</span><span>9 ejercicios</span></>} badge="Nuevo" onClick={() => onNavigate('catalogo')} />
          <LessonCard subject="electronics" title="Por qué parpadea un LED" summary="Un condensador que se llena, se vacía y vuelve a empezar." meta={<><span>20 min</span><span>6 montajes</span></>} onClick={() => onNavigate('catalogo')} />
          <LessonCard subject="code" title="Bucles que terminan" summary="Toda repetición necesita una condición que algún día se cumpla." meta={<><span>18 min</span><span>5 retos</span></>} onClick={() => onNavigate('catalogo')} />
        </div>
      </window.Section>

      <section style={{ background: 'var(--surface-brand)', color: 'var(--text-inverse)', padding: 'var(--space-24) var(--gutter-lg)', position: 'relative', overflow: 'hidden' }}>
        <window.LayerMotif size={520} style={{ position: 'absolute', left: -200, bottom: -260, opacity: .2 }} />
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <window.Display size={46} tone="var(--neutral-0)">Ninguna ciencia exacta es sólo para quien ya la entiende</window.Display>
          <p style={{ color: 'var(--text-inverse-muted)', fontSize: 'var(--text-md)', margin: 'var(--space-6) auto 0', maxWidth: '52ch' }}>
            Prueba una unidad completa sin cuenta ni tarjeta. Si te sirve, sigues; si no, no pasa nada.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-8)' }}>
            <Button size="lg" variant="inverse" iconRight="arrow-right">Empezar ahora</Button>
            <Button size="lg" variant="ghost" style={{ color: 'var(--neutral-0)' }}>Hablar con nuestro equipo</Button>
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { HomeScreen });
