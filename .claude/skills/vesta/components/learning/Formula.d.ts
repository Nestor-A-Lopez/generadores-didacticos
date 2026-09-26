import * as React from 'react';
/**
 * Equation holder. Sets the math family so KaTeX/MathJax output sits in the same
 * high-contrast register as the Fraunces headings.
 */
export interface FormulaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Block presentation on a sunken blue ground. */
  display?: boolean;
  /** Caption below — name the variables in plain words. */
  label?: React.ReactNode;
}
export declare function Formula(props: FormulaProps): JSX.Element;
