import React from 'react';
import { Switch } from './Switch.jsx';

function useMedia(q) {
  const get = () => typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q).matches : false;
  const [m, setM] = React.useState(get);
  React.useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
    return () => (mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on));
  }, [q]);
  return m;
}

/* Fila del interruptor: texto a la izquierda, pista a la derecha. */
function SwitchRow({ label, checked, onChange, disabled, menuId, stacked }) {
  const ref = React.useRef(null);
  const small = useMedia('(max-width: 639px)');
  React.useEffect(() => {
    const input = ref.current && ref.current.querySelector('input[role="switch"]');
    if (!input) return;
    input.setAttribute('aria-expanded', checked ? 'true' : 'false');
    input.setAttribute('aria-controls', menuId);
  }, [checked, menuId]);
  return (
    <div ref={ref} style={{ marginTop: stacked ? -9 : 0 }}>
      <Switch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        label={<span style={{ fontSize: small ? 'var(--text-sm)' : 'var(--text-base)', whiteSpace: 'nowrap' }}>{label}</span>}
        style={{ display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', width: '100%', minHeight: 44 }}
      />
    </div>
  );
}

/* Menú plegable: grid-template-rows 0fr → 1fr. */
function SwitchMenuPanel({ id, open, children }) {
  const reduce = useMedia('(prefers-reduced-motion: reduce)');
  const [settled, setSettled] = React.useState(open);
  const ref = React.useRef(null);
  React.useEffect(() => {
    setSettled(false);
    if (reduce) { setSettled(open); return; }
    const t = setTimeout(() => setSettled(open), 400);
    return () => clearTimeout(t);
  }, [open, reduce]);
  React.useEffect(() => {
    if (!ref.current) return;
    if (open) ref.current.removeAttribute('inert'); else ref.current.setAttribute('inert', '');
  }, [open]);
  const onEnd = (e) => { if (e.target === e.currentTarget && e.propertyName === 'grid-template-rows') setSettled(open); };
  const t = (p, d) => (reduce ? 'none' : `${p} ${d}ms var(--ease-out)`);
  return (
    <div
      id={id}
      ref={ref}
      role="group"
      onTransitionEnd={onEnd}
      style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        visibility: open ? 'visible' : 'hidden',
        transition: reduce ? 'none' : `grid-template-rows 380ms var(--ease-out), visibility 0s linear ${open ? 0 : 380}ms`,
      }}
    >
      <div style={{ minHeight: 0, overflow: open && settled ? 'visible' : 'hidden', opacity: open ? 1 : 0, transition: t('opacity', 220) }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '4px 0 12px', alignItems: 'flex-end' }}>{children}</div>
      </div>
    </div>
  );
}

export function SwitchMenu({ label, checked = false, onChange, disabled = false, children, id, style, ...rest }) {
  const auto = React.useId();
  const menuId = id || `switch-menu-${auto.replace(/:/g, '')}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)', ...style }} {...rest}>
      <SwitchRow label={label} checked={checked} onChange={onChange} disabled={disabled} menuId={menuId} />
      <SwitchMenuPanel id={menuId} open={checked}>{children}</SwitchMenuPanel>
    </div>
  );
}

/* Interruptores juntos arriba (9px entre pistas) y sus menús debajo, en el mismo orden. */
export function SwitchGroup({ children, style, ...rest }) {
  const auto = React.useId().replace(/:/g, '');
  const items = React.Children.toArray(children).filter(React.isValidElement);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)', ...style }} {...rest}>
      {items.map((el, i) => (
        <SwitchRow key={'s' + i} label={el.props.label} checked={!!el.props.checked} onChange={el.props.onChange}
          disabled={el.props.disabled} menuId={el.props.id || `${auto}-menu-${i}`} stacked={i > 0} />
      ))}
      {items.map((el, i) => (
        <SwitchMenuPanel key={'m' + i} id={el.props.id || `${auto}-menu-${i}`} open={!!el.props.checked}>{el.props.children}</SwitchMenuPanel>
      ))}
    </div>
  );
}
