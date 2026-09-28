import * as React from 'react';
export interface NumberRowOrderOption { value: string; label: string; }
export interface NumberRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Row label: «Número 1», «Minuendo»… Also the Input's aria-label; the Select gets «Jerarquía de <label>». */
  label: string;
  value?: string;
  onValueChange?: (value: string) => void;
  /** Selected order (hierarchy) value. Falls back to "U" silently if not in orderOptions. */
  order?: string;
  /** Orders within the table range, e.g. { value: 'D', label: 'Decenas (D)' }. Omit decimals for integer-only rows. */
  orderOptions?: NumberRowOrderOption[];
  onOrderChange?: (order: string) => void;
  /** Switch sm «Coma y punto». Default true. */
  showSeparators?: boolean;
  onShowSeparatorsChange?: (checked: boolean) => void;
  separatorsLabel?: string;
  /** Shows «Quitar» when provided. */
  onRemove?: () => void;
  /** false → «Quitar» disabled (list at its minimum). Default true. */
  canRemove?: boolean;
  /** Fixed rows (no onRemove): keep «Quitar»'s space hidden so the switch doesn't jump. */
  reserveRemoveSpace?: boolean;
  hint?: React.ReactNode;
  /** Input error state + aria-invalid. The message goes in a Callout, not in the row. */
  error?: boolean;
  placeholder?: string;
}
export declare function NumberRow(props: NumberRowProps): JSX.Element;
