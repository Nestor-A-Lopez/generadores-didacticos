import * as React from 'react';
export interface SwitchProps extends Omit<React.HTMLAttributes<HTMLLabelElement>, 'onChange'> {
  label?: React.ReactNode;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
}
export declare function Switch(props: SwitchProps): JSX.Element;
