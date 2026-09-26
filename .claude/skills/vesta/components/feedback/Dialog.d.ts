import * as React from 'react';
export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  title?: string;
  description?: string;
  /** Action row, right-aligned. Secondary action first. */
  footer?: React.ReactNode;
  onClose?: () => void;
  /** Max width in px. */
  width?: number;
}
export declare function Dialog(props: DialogProps): JSX.Element;
