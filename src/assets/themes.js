export const theme = {
  primaryBackground: "#1795cc",
  primaryLightBackground: "#2e9ecf",
  primaryDarkBackground: "#2e8abb", // preguntar
  secondaryBackground: "#55a32a",
  secondaryLightBackground: "#71bd47", // preguntar
  secondaryDarkBackground: "#71cd47", // preguntar
  tertiaryBackground: "#de5454",
  tertiaryLightBackground: "transparent",
  transparent: "transparent",
  white: "#ffffff",
  secondaryWhite: "#F3F3F3",
  black: "#000000",
  grey: "#888888",
  text: "#666666",
  dark: "#363A3F",
  iconHoverGrey: "#777777",
  lightGrey: "#F8F8F8",
  iconTitle: "#666666",
  quaternary: "#E45A00",
};

export const color = {
  primary: "#3179A7", // Usar blue 500
  background: "#F2F2F2",
  text: "#666666", // Usar neutral 600
  subText: "#888888", // Usar neutral 500
  inputText: "#4B5768",
  aclarationText: "#3179A7CC",
  lightRed: "#FDECEC",
  textWhite: "#FFF",
  lighterText: "#c8c8c8",
  darkerText: "#444444",
  greenDetails: "#28CF42",
  redDetails: "#e76162",
  yellowDetails: "#B6AB00",
  btnGreen: "#55A32A", // Usar green 500
  btnRed: "#de5454",
  btnLightBlue: "#1795CC",
  lightRedDetails: "#F29A9B",
  lightBorder: "#D5D5D6",
  neutral: {
    0: "#FFFFFF",
    50: "#F8F8F8",
    100: "#EDEDED",
    150: "#E0E0E0",
    200: "#D2D2D2",
    300: "#C0C0C0",
    400: "#A4A4A4",
    500: "#888888",
    600: "#666666",
    700: "#555555",
  },
  blue: {
    50: "#EAF2F6",
    100: "#BFD5E4",
    200: "#A0C1D7",
    300: "#75A5C4",
    400: "#5A94B9",
    500: "#3179A7",
    600: "#2D6E98",
    700: "#235677",
    800: "#1B435C",
    900: "#153346",
  },
  lightBlue: {
    50: "#E8F4FA",
    100: "#B7DEF0",
    200: "#94CEE9",
    300: "#64B8E0",
    400: "#45AAD9",
    500: "#1795D0",
    600: "#1588BD",
    700: "#106A94",
    800: "#0D5272",
    900: "#0A3F57",
  },
  green: {
    50: "#EEF6EA",
    100: "#CAE2BD",
    150: "#C7DBBC",
    200: "#B0D49D",
    300: "#8CC171",
    400: "#76B555",
    500: "#54A22B",
    600: "#4C9327",
    700: "#3C731F",
    800: "#2E5918",
    900: "#234412",
  },
  // Verde vivo, distinto del `green` olivo de marca; para indicadores positivos (tasa/rendimiento).
  greenVivid: {
    50: "#EDF8EF",
    100: "#CEEDD6",
    200: "#A4E0B3",
    300: "#74D28C",
    400: "#44C564",
    500: "#2FA24C",
    600: "#248F3F",
    700: "#1A7431",
    800: "#125924",
    900: "#0C4119",
  },
  red: {
    50: "#FDEFEF",
    100: "#FDEEF7",
    200: "#F4B6B7",
    300: "#EF9596",
    400: "#EC8181",
    500: "#E76162",
    550: "#ff0000",
    600: "#D25555",
    700: "#BF3536",
    800: "#A73336",
    900: "#612923",
  },
  yellow: {
    50: "#F7F5E7",
    100: "#E7E0B4",
    200: "#DBD8BC",
    250: "#CCC797",
    300: "#CBB05E",
    400: "#C1AF3E",
    500: "#B29B0B",
    600: "#A28D06",
    700: "#7E6E0A",
    800: "#625508",
    900: "#4B4106",
  },
  orange: {
    0: "#FDF7F2",
    50: "#FFF2E8",
    100: "#FFE0C2",
    200: "#FFC799",
    300: "#FFA666",
    400: "#FF7D33",
    500: "#E45A00",
    600: "#CC5100",
    700: "#B34600",
    800: "#993C00",
    900: "#803200",
  },
};

// Radios de esquinas (convención global). Ver ticket T21669.
export const radii = {
  card: "16px", // card externa (fondo neutral[50] / #F8F8F8)
  cardInner: "8px", // card interna (hijo blanco)
};

// Tokens de layout globales. Ver ticket T21669.
export const layout = {
  maxWidth: "1600px", // ancho máximo del body de contenido
  contentPadding: "24px", // padding del body de contenido
  iconPadding: "4px", // iconos de bancos / cheque / e-check
};

export const lightTheme = { colors: { ...color }, radii, layout };

export const darkTheme = {
  colors: {
    ...color,
  },
  radii,
  layout,
};

export const fonts = `
  font-family: Lato;
  line-height: normal;
  font-weight: 400;

  &.heading {
    font-size: 1.75rem; /* 28px */
  }
  &.h1 {
    font-size: 3.5re; /* 56px */
  }
  &.h2 {
    font-size: 3rem; /* 48px */
  }
  &.h3 {
    font-size: 2.5rem; /* 40px */
  }
  &.h4 {
    font-size: 2rem; /* 32px */
  }
  &.h5 {
    font-size: 1.5rem; /* 24px */
  }
  &.h6 {
    font-size: 1.25rem; /* 20px */
  }
  &.large {
    font-size: 1.25rem; /* 20px */
  }
  &.medium {
    font-size: 1.125rem; /* 18px */
  }
  &.regular {
    font-size: 1rem; /* 16px */
  }
  &.small {
    font-size: 0.875rem; /* 14px */
  }
  &.tiny {
    font-size: 0.75rem; /* 12px */
  }
  &.mini {
    font-size: 0.625rem; /* 10px */
  }
  &.bold {
    font-weight: 700;
  }
  &.normal {
    font-style: normal;
  }
  &.italic {
    font-style: italic;
  }
  &.black {
    font-weight: 900;
  }
`;
