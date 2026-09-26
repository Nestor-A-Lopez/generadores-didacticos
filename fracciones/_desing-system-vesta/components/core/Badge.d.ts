import * as React from 'react';
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'brand' | 'correct' | 'retry' | 'error' | 'solid';
}
export declare function Badge(props: BadgeProps): JSX.Element;
