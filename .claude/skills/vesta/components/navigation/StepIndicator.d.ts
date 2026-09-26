import * as React from 'react';
export interface StepIndicatorProps extends React.HTMLAttributes<HTMLOListElement> {
  /** Step labels, in order. */
  steps?: string[];
  /** Zero-based index of the step in progress. */
  current?: number;
}
export declare function StepIndicator(props: StepIndicatorProps): JSX.Element;
