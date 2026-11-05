import { useEffect } from "react";

/**
 * Custom hook para bloquear el scroll del body (pantalla principal)
 * @param {boolean} isLocked - Determina si el scroll debe estar bloqueado
 */
export const useLockBodyScroll = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      // Guardamos el estilo original
      const originalStyle = window.getComputedStyle(document.body).overflow;

      // Bloqueamos el scroll
      document.body.style.overflow = "hidden";

      // Restauramos el scroll original al desmontar o cuando isLocked sea false
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isLocked]);
};
