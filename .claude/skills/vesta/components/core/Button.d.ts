import * as React from 'react';
/**
 * Primary action control. Pill-shaped, Poppins medium, never all-caps.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'inverse';
  size?: 'sm' | 'md' | 'lg';
  /** Lucide icon name rendered before the label. */
  icon?: string;
  /** Lucide icon name rendered after the label. */
  iconRight?: string;
  fullWidth?: boolean;
}
export declare function Button(props: ButtonProps): JSX.Element;
