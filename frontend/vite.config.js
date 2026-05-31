import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const backendTarget = process.env.BACKEND_URL || "http://localhost:8000";

// Some backend routes share a path prefix with client-side routes (/login, /signup).
// When the browser navigates to those URLs (HTML request), we must let vite serve the SPA.
// Only API/XHR requests should be proxied to the backend.
const apiOnly = {
  target: backendTarget,
  changeOrigin: true,
  bypass(req) {
    if (req.headers.accept?.includes("text/html")) {
      return req.url;
    }
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/applications": apiOnly,
      "/signup": apiOnly,
      "/forgot-password": apiOnly,
      "/reset-password": apiOnly,
      "/login": apiOnly,
      "/questions": apiOnly,
      "/api/admin": apiOnly,
    },
  },
});
