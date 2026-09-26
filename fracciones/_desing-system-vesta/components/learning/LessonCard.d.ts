import * as React from 'react';
/**
 * Catalogue / dashboard tile for a single lesson or unit.
 */
export interface LessonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  /** One sentence, plain language, no jargon. */
  summary?: string;
  subject?: 'math' | 'physics' | 'electronics' | 'code';
  /** Duration, exercise count, etc. */
  meta?: React.ReactNode;
  /** 0–100. Omit for lessons not started. */
  progress?: number;
  /** Short status pill — "Nuevo", "Continuar". */
  badge?: React.ReactNode;
}
export declare function LessonCard(props: LessonCardProps): JSX.Element;
