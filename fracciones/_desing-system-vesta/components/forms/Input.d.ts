import * as React from 'react';
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  /** Leading adornment, e.g. a currency or operator sign. */
  prefix?: React.ReactNode;
  /** Trailing adornment, set in the math family — units like "m/s", "Ω". */
  suffix?: React.ReactNode;
}
export declare function Input(props: InputProps): JSX.Element;
