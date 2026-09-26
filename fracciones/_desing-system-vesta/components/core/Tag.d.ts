import * as React from 'react';
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Discipline accent + leading glyph. */
  subject?: 'math' | 'physics' | 'electronics' | 'code' | 'none';
  selected?: boolean;
  /** Renders the dismiss affordance. */
  onRemove?: (e: React.MouseEvent) => void;
}
export declare function Tag(props: TagProps): JSX.Element;
