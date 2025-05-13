import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  optimizeDeps: {
    include: [
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react",
      "react-dom",
      "react-router-dom",
      "firebase/compat/app",
      "firebase/compat/auth",
      "react-hot-toast",
      "react-icons",
      "react-qr-code",
      "pdf-lib",
      "pdfjs-dist",
    ],
  },
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api/, "/api"),
      },
    },
    historyApiFallback: true,
  },
});
