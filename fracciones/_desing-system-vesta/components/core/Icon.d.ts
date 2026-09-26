import * as React from 'react';
export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Lucide icon name in kebab-case, e.g. "calculator", "circuit-board". */
  name?: string;
  /** Rendered box in px. Matches the optical sizes 16 / 20 / 24 / 32. */
  size?: number;
  /** Accessible label. Omit for purely decorative icons. */
  label?: string;
}
export declare function Icon(props: IconProps): JSX.Element;
