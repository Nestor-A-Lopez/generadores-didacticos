import * as React from 'react';
export interface TextColorOption {
  /** Color (#RRGGBB). No es un token de Vesta: lo define quien consume. */
  hex: string;
  /** Nombre del color; aria-label y tooltip (p. ej. «Negro (original)»). */
  label: string;
}
export interface TextColorPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Etiqueta visible, centrada sobre las muestras. */
  label?: string;
  /** Dos muestras fijas; la primera es la original. */
  options: [TextColorOption, TextColorOption];
  /** Hex actual. Si no coincide con ninguna muestra fija, el «+» lo muestra como elegido. */
  value?: string;
  onChange?: (hex: string) => void;
  /** Tooltip y aria-label del «+». */
  customLabel?: string;
}
export declare function TextColorPicker(props: TextColorPickerProps): JSX.Element;
