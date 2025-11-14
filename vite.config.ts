import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

export default defineConfig(async ({ mode }) => {
  // Conditionally import React plugin to avoid bundling in production
  let reactPlugin: any = null;
  try {
    const react = await import("@vitejs/plugin-react");
    reactPlugin = react.default;
  } catch (err) {
    console.warn("@vitejs/plugin-react not available, skipping React plugin");
  }

  // Conditionally import TailwindCSS plugin to avoid bundling in production
  // Only load in development mode or when explicitly building for client
  let tailwindcssPlugin = null;
  if (mode === "development" || process.env.VITE_BUILD === "true") {
    const tailwindcss = await import("@tailwindcss/vite");
    tailwindcssPlugin = tailwindcss.default;
  }

  // Only include jsxLocPlugin in development mode
  const jsxLocPlugin = mode === "development"
    ? (await import("@builder.io/vite-plugin-jsx-loc")).jsxLocPlugin()
    : null;

  const plugins = [
    reactPlugin,
    ...(tailwindcssPlugin ? [tailwindcssPlugin] : []),
    vitePluginManusRuntime(),
    ...(jsxLocPlugin ? [jsxLocPlugin] : []),
  ];

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    envDir: path.resolve(import.meta.dirname),
    root: path.resolve(import.meta.dirname, "client"),
    publicDir: path.resolve(import.meta.dirname, "client", "public"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      host: true,
      allowedHosts: [
        "localhost",
        "127.0.0.1",
      ],
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
