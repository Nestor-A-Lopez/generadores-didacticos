import * as React from 'react';
export interface SwitchProps extends Omit<React.HTMLAttributes<HTMLLabelElement>, 'onChange'> {
  label?: React.ReactNode;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  /** "sm": same track and knob, --text-sm label, --space-2 gap, -8px vertical margin (28px in the row, 44px hit area). Default "md". */
  size?: 'md' | 'sm';
}
export declare function Switch(props: SwitchProps): JSX.Element;
