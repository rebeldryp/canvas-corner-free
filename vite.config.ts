import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/react')) return 'react';
          if (id.includes('/node_modules/@tanstack')) return 'tanstack';
          if (id.includes('/node_modules/@supabase')) return 'supabase';
          if (id.includes('/node_modules/lucide-react')) return 'lucide';
          if (id.includes('/node_modules/@radix-ui')) return 'radix';
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
