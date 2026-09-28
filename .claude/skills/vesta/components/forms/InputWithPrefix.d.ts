import * as React from 'react';
export interface InputWithPrefixProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'style'> {
  /** Texto gris pegado a la izquierda; es la etiqueta visible del campo (`<label>` asociado). */
  prefix: React.ReactNode;
  /** Ancho fijo del prefijo en px. Usa 28 para la variante numérica (solo el número). */
  prefixWidth?: number;
  /** Nombre accesible completo cuando el prefijo es abreviado, p. ej. «Parte 3». */
  accessibleLabel?: string;
  /** Estilos de la caja exterior. */
  style?: React.CSSProperties;
  /** Estilos del `<input>`. */
  inputStyle?: React.CSSProperties;
}
export declare function InputWithPrefix(props: InputWithPrefixProps): JSX.Element;
