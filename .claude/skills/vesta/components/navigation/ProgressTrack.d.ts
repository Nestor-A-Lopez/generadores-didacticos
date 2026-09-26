import * as React from 'react';
export interface ProgressTrackProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  label?: React.ReactNode;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
export declare function ProgressTrack(props: ProgressTrackProps): JSX.Element;
