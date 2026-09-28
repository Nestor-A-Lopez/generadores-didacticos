import * as React from 'react';
export interface ColorSwatch {
  value: string;
  /** Nombre del color; se usa como aria-label. */
  label: string;
  /** Color de la muestra. No es un token de Vesta: lo define quien consume. */
  hex: string;
  /** Color de la palomita en muestras claras (p. ej. 'var(--blue-950)' para amarillo). Por defecto blanco. */
  checkColor?: string;
}
export interface ColorSwatchGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  colors: ColorSwatch[];
  /** Valor elegido; 'custom' = «Personalizado…». */
  value?: string;
  onChange?: (value: string) => void;
  /** Agrega la muestra «Personalizado…» al final. Default true. */
  allowCustom?: boolean;
  /** Hex del color personalizado (#RRGGBB). */
  customColor?: string;
  onCustomColorChange?: (hex: string) => void;
  customLabel?: string;
  'aria-labelledby'?: string;
  'aria-label'?: string;
}
export declare function ColorSwatchGroup(props: ColorSwatchGroupProps): JSX.Element;
