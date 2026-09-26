const { Button, Field, Input, Checkbox, Card } = window.VestaDesignSystem_a1e3d1;

function LoginScreen({ onEnter }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-16)' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ fontFamily: 'var(--font-serif-display)', fontVariationSettings: '"opsz" 48', fontSize: 26, fontWeight: 600, letterSpacing: '-.03em', color: 'var(--text-heading)' }}>Vesta<span style={{ color: 'var(--blue-500)' }}>.</span></div>
          <h1 style={{ fontFamily: 'var(--font-serif-display)', fontVariationSettings: '"opsz" 120', fontSize: 40, fontWeight: 600, letterSpacing: 'var(--tracking-tight)', lineHeight: 1.1, color: 'var(--text-heading)', margin: 'var(--space-10) 0 var(--space-3)' }}>Volvamos a mirar</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }}>Dejaste la unidad de cinemática a mitad. Está exactamente donde la dejaste.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', marginTop: 'var(--space-8)' }}>
            <Field label="Correo o nombre de usuario" htmlFor="u"><Input id="u" defaultValue="nadia.r@centro.edu" /></Field>
            <Field label="Contraseña" htmlFor="p"><Input id="p" type="password" defaultValue="vesta2026" /></Field>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Checkbox label="No cerrar sesión" checked onChange={() => {}} />
              <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 'var(--text-sm)' }}>La he olvidado</a>
            </div>
            <Button size="lg" fullWidth iconRight="arrow-right" onClick={onEnter}>Entrar</Button>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>¿Aún no tienes cuenta? <a href="#" onClick={(e) => e.preventDefault()}>Prueba una unidad completa</a></p>
          </div>
        </div>
      </div>
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--surface-sunken)' }}>
        <window.LayerMotif size={720} style={{ position: 'absolute', left: -120, top: 40 }} />
        <div style={{ position: 'absolute', left: 56, bottom: 64, right: 56 }}>
          <div style={{ fontFamily: 'var(--font-math)', fontSize: 34, color: 'var(--blue-950)' }}>h = ½ · g · t²</div>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--blue-900)', marginTop: 'var(--space-3)', maxWidth: '40ch' }}>La altura de una caída no depende del peso, sino del tiempo. Cuesta creerlo hasta que lo ves.</p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
