import * as React from 'react';
export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  /** Explanatory line below the control. Any technical term gets defined here on first use. */
  hint?: string;
  /** Replaces the hint and turns it red. */
  error?: string;
  htmlFor?: string;
  required?: boolean;
}
export declare function Field(props: FieldProps): JSX.Element;
