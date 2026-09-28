import * as React from 'react';
export interface ColorModeOption { value: string; label: string; }
export interface ColorModeGridProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Etiqueta del campo; el grupo la usa en aria-labelledby. Sin ella, pasa aria-labelledby/aria-label. */
  label?: string;
  /** Las dos opciones fijas: 1.ª arriba a la izquierda, 2.ª debajo. */
  options: ColorModeOption[];
  /** Opción elegida: 'negro', 'color', 'personalizado'… */
  value: string;
  /** Color propio (#RRGGBB). Sin él, el bloque «+» queda gris. */
  customColor?: string;
  /** Valor inicial del selector mientras no hay color propio. Por defecto '#000000'. */
  defaultCustomColor?: string;
  onChange?: (value: string, customColor?: string) => void;
  /** Por defecto «Personalizado». */
  customLabel?: string;
  /** Valor de la opción personalizada. Por defecto 'personalizado'. */
  customValue?: string;
  disabled?: boolean;
}
export declare function ColorModeGrid(props: ColorModeGridProps): JSX.Element;
