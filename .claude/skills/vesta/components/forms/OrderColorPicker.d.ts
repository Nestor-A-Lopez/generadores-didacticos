import * as React from 'react';
export interface OrderColorOrder {
  /** Clave del orden: 'U', 'D', 'C'… */
  key: string;
  /** Nombre visible: «Unidad». */
  label: string;
  /** Plural en minúsculas para aria-label y tooltip: «unidades». Por defecto, label en minúsculas. */
  plural?: string;
  /** Color de la muestra de defecto; por defecto var(--base10-*). */
  defaultColor: string;
  /** Hex del color de defecto (#RRGGBB): valor inicial del selector y comparación «mismo color». */
  defaultHex: string;
  /** aria-label de la muestra de defecto: «Verde original de las unidades». */
  defaultLabel: string;
}
export interface OrderColorValue { mode: 'default' | 'custom'; color?: string; }
export interface OrderColorPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Etiqueta del campo: «Color de las jerarquías», «Color de los bloques». */
  label?: string;
  /** Órdenes; por defecto unidad, decena y centena con sus tokens. */
  orders?: OrderColorOrder[];
  /** Controlado. Un orden sin entrada está en 'default'. */
  value?: Record<string, OrderColorValue>;
  defaultValue?: Record<string, OrderColorValue>;
  onChange?: (value: Record<string, OrderColorValue>) => void;
  /** Palabra del tooltip «Elige otro color para las ___ de las unidades». Por defecto 'celdas'; en bloques Dienes, 'piezas'. */
  tooltipTarget?: string;
}
export declare const DEFAULT_ORDERS: OrderColorOrder[];
export declare function OrderColorPicker(props: OrderColorPickerProps): JSX.Element;
