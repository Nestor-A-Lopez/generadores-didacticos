import * as React from 'react';
export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'info' | 'correct' | 'retry' | 'error' | 'definition';
  title?: string;
  /** Override the tone's default Lucide glyph. */
  icon?: string;
}
export declare function Callout(props: CalloutProps): JSX.Element;
