import { useEffect, useRef } from "react";

/**
 * Ejecuta `handler` cuando ocurre un `mousedown` fuera del/los elemento(s)
 * referenciado(s). Encapsula el patrón de "click afuera" usado para cerrar
 * dropdowns, menús y popovers.
 *
 * @param {React.RefObject|React.RefObject[]} ref - Ref (o array de refs) de los
 *   elementos considerados "adentro". El click cuenta como afuera solo si cae
 *   fuera de todos ellos (útil cuando el trigger y el dropdown viven en nodos
 *   distintos, p. ej. un portal).
 * @param {(event: MouseEvent) => void} handler - Callback al detectar el click afuera.
 * @param {boolean} [enabled=true] - Si es `false`, no se registra el listener.
 */
export const useOutsideClick = (ref, handler, enabled = true) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const listener = (event) => {
      const refs = Array.isArray(ref) ? ref : [ref];
      const clickedInside = refs.some(
        (r) => r.current && r.current.contains(event.target)
      );
      if (!clickedInside) {
        handlerRef.current(event);
      }
    };

    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, enabled]);
};
