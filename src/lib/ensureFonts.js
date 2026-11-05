const FONTS_LINK_ID = "dcp-fonts-lato";
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap";

const PRECONNECTS = [
  { href: "https://fonts.googleapis.com" },
  { href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
];

/**
 * Carga la font Lato (incluido el eje itálico) inyectando el <link> de Google
 * Fonts en el <head>. En standalone ya lo trae index.html; embebido vía Module
 * Federation ese index.html no se usa, así que sin esto el host tendría que
 * proveer la itálica y `font-style: italic` no se renderiza. Idempotente por id.
 */
export const ensureFonts = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONTS_LINK_ID)) return;

  PRECONNECTS.forEach(({ href, crossOrigin }) => {
    if (document.querySelector(`link[rel="preconnect"][href="${href}"]`))
      return;
    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = href;
    if (crossOrigin) preconnect.crossOrigin = crossOrigin;
    document.head.appendChild(preconnect);
  });

  const link = document.createElement("link");
  link.id = FONTS_LINK_ID;
  link.rel = "stylesheet";
  link.href = FONTS_HREF;
  document.head.appendChild(link);
};
