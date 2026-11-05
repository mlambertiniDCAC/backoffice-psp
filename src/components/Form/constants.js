/**
 * Variantes de `InputSwitch`:
 * - `segmented`: N opciones con label (Sí / No, Simple / Doble, etc.).
 * - `toggle`: on/off de un solo valor booleano.
 * Ambas comparten el contrato `onChange(name, nuevoValor)`.
 */
export const INPUT_SWITCH_VARIANT = {
  SEGMENTED: "segmented",
  TOGGLE: "toggle",
};
