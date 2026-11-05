import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, ".", "");

  if (command === "build" && mode === "production" && !env.APIGW_PSP_URL) {
    throw new Error(
      "[backoffice-psp] Build de producción sin APIGW_PSP_URL. " +
        "Completá .env.production (o inyectá la variable) con la URL pública de apigateway-psp."
    );
  }

  return {
    base: "/",
    define: {
      __APIGW_PSP_URL__: JSON.stringify(env.APIGW_PSP_URL || ""),
    },
    plugins: [
      react(),
      federation({
        name: "backofficePsp",
        filename: "remoteEntry.js",
        exposes: {
          "./App": "./src/AppWrapper",
        },
        shared: {
          react: { singleton: true, eager: true },
          "react-dom": { singleton: true, eager: true },
          "react-router-dom": { singleton: true },
          "react-redux": { singleton: true },
        },
      }),
    ],
    resolve: {
      alias: {
        src: "/src",
        components: "/src/components",
        hooks: "/src/hooks",
        assets: "/src/assets",
      },
    },
    cacheDir: "node_modules/.cacheDir",
    build: {
      modulePreload: false,
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
    },
    test: {
      environment: "jsdom",
      globals: false,
      setupFiles: ["./src/test/setup.js"],
    },
  };
});
