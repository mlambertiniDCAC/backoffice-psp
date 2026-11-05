module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  globals: {
    __APIGW_PSP_URL__: "readonly",
    __ONBOARDING_PSP_URL__: "readonly",
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended", // Añade esta línea
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: { react: { version: "18.2" } },
  plugins: ["react-refresh", "prettier"], // Añade 'prettier' aquí
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "react-hooks/exhaustive-deps": "off", // Desactiva la advertencia de dependencias en useEffect
    "prettier/prettier": "error", // Añade esta regla
    "react/prop-types": "error", // o "error" si querés que lo trate como error
    "no-unused-vars": [
      "error",
      { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
    ],
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
  },
};
