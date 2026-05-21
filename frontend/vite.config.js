import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/applications": {
        // target: import.meta.env.BACKEND_URL || "http://localhost:8000",
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/signup": {
        // target: import.meta.env.BACKEND_URL || "http://localhost:8000",
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/forgot-password": {
        // target: import.meta.env.BACKEND_URL || "http://localhost:8000",
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/reset-password": {
        // target: import.meta.env.BACKEND_URL || "http://localhost:8000",
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/login": {
        // target: import.meta.env.BACKEND_URL || "http://localhost:8000",
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      '/api/admin': {
        target: process.env.BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
      '/login': {
        target: process.env.BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
      '/signup': {
        target: process.env.BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
