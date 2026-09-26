import * as React from 'react';
/**
 * Post-submission verdict panel for an exercise.
 */
export interface AnswerFeedbackProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: 'correct' | 'retry' | 'incorrect';
  /** Overrides the default Spanish heading. */
  heading?: string;
  /** Usually a Button — "Ver el desarrollo", "Siguiente". */
  action?: React.ReactNode;
}
export declare function AnswerFeedback(props: AnswerFeedbackProps): JSX.Element;
