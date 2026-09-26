import * as React from 'react';
export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'neutral' | 'correct' | 'error';
  onDismiss?: () => void;
}
export declare function Toast(props: ToastProps): JSX.Element;
