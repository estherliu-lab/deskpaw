import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/deskpaw/",
  plugins: [react()],
  build: {
    assetsDir: "app-assets",
    rollupOptions: {
      output: {
        entryFileNames: "app-assets/index.js",
        chunkFileNames: "app-assets/[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) return "app-assets/index.css";
          return "app-assets/[name][extname]";
        }
      }
    }
  },
  server: {
    port: 5173
  }
});
