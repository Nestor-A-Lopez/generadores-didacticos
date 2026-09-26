import * as React from 'react';
export interface RadioProps extends Omit<React.HTMLAttributes<HTMLLabelElement>, 'onChange'> {
  label?: React.ReactNode;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  name?: string;
  value?: string;
  disabled?: boolean;
}
export declare function Radio(props: RadioProps): JSX.Element;
