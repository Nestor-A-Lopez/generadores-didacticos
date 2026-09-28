import * as React from 'react';
export interface SwitchMenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Texto del interruptor; una sola línea. */
  label: React.ReactNode;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  /** Contenido del menú (campos, selectores); se despliega al activar. */
  children?: React.ReactNode;
  /** id del menú (aria-controls). Se genera si se omite. */
  id?: string;
}
export declare function SwitchMenu(props: SwitchMenuProps): JSX.Element;

export interface SwitchGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Solo elementos <SwitchMenu>. Interruptores juntos arriba (9px entre pistas), menús debajo en el mismo orden. */
  children?: React.ReactNode;
}
export declare function SwitchGroup(props: SwitchGroupProps): JSX.Element;
