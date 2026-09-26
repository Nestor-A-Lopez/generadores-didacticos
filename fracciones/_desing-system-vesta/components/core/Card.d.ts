import * as React from 'react';
/**
 * Surface container. 16px radius, hairline border, cool blue shadow.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  tone?: 'default' | 'soft' | 'outline' | 'inverse';
  /** Any CSS length; defaults to --space-6. */
  padding?: string;
  /** Adds the lift-on-hover affordance for clickable cards. */
  interactive?: boolean;
}
export declare function Card(props: CardProps): JSX.Element;
