import * as React from 'react';
export interface SegmentedControlOption {
  value: string;
  label?: React.ReactNode;
  /** Nombre de un icono Lucide 0.544.0. Sin `label` → variante solo con iconos. */
  icon?: string;
  /** Texto del Tooltip y del aria-label en la variante de iconos. */
  tooltip?: string;
}
export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** De 2 a 6 opciones cortas. */
  options: SegmentedControlOption[];
  value?: string;
  onChange?: (value: string) => void;
  /** Botones del mismo ancho; la barra ocupa todo el ancho disponible. */
  fill?: boolean;
  disabled?: boolean;
  'aria-labelledby'?: string;
  'aria-label'?: string;
}
export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;
