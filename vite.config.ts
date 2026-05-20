/* Copyright (C) 2024, FutureApp Solutions GmbH. Alle Rechte vorbehalten. */
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import svgr from "@svgr/rollup";
import tailwindcss from '@tailwindcss/vite'
// Fix __dirname for ES module context (used in Vite)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      src: resolve(__dirname, "src"),
    },
  },
  plugins: [svgr(), react(), basicSsl(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("react-router") || id.includes("@remix-run")) {
            return "router-vendor";
          }

          if (id.includes("@tanstack/react-query")) {
            return "query-vendor";
          }

          if (id.includes("@tanstack/react-table")) {
            return "table-vendor";
          }

          if (id.includes("@mui/icons-material")) {
            return "mui-icons-vendor";
          }

          if (id.includes("@mui/x-date-pickers")) {
            return "mui-pickers-vendor";
          }

          if (id.includes("react-hook-form")) {
            return "form-vendor";
          }

          if (id.includes("framer-motion")) {
            return "motion-vendor";
          }

          if (id.includes("simplebar")) {
            return "scroll-vendor";
          }

          if (id.includes("html2canvas")) {
            return "html-vendor";
          }

          if (id.includes("@iconify-icon")) {
            return "icon-vendor";
          }

          if (
            id.includes("@dnd-kit/") ||
            id.includes("sortablejs") ||
            id.includes("react-beautiful-dnd")
          ) {
            return "dnd-vendor";
          }

          if (id.includes("dayjs") || id.includes("date-fns") || id.includes("moment")) {
            return "date-vendor";
          }

          return undefined;
        },
      },
    },
  },
  server: {
    watch: {
      // Don't watch the .vite cache directory to prevent EPERM locks on Windows
      ignored: ['**/node_modules/.vite/**'],
    },
  },
  optimizeDeps: {
    holdUntilCrawlEnd: true,
  },
});
