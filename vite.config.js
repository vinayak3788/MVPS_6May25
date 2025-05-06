// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/", // ✅ Important for correct routing base
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
    allowedHosts: [
      "6853b457-5a16-442d-a7d6-78a08e40a5f4-00-gvjlx5qqknli.pike.replit.dev",
      "localhost",
    ],
    historyApiFallback: true,
  },
});
