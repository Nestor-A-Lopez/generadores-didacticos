import * as React from 'react';
export interface SelectOption { value: string; label: string; }
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  error?: boolean;
}
export declare function Select(props: SelectProps): JSX.Element;
