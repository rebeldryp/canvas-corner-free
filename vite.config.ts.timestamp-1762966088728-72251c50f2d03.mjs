// vite.config.ts
import { defineConfig } from "file:///C:/Users/User/Desktop/canvas-corner-free-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/User/Desktop/canvas-corner-free-main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/User/Desktop/canvas-corner-free-main/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\User\\Desktop\\canvas-corner-free-main";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/react")) return "react";
          if (id.includes("/node_modules/@tanstack")) return "tanstack";
          if (id.includes("/node_modules/@supabase")) return "supabase";
          if (id.includes("/node_modules/lucide-react")) return "lucide";
          if (id.includes("/node_modules/@radix-ui")) return "radix";
        }
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVc2VyXFxcXERlc2t0b3BcXFxcY2FudmFzLWNvcm5lci1mcmVlLW1haW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXFVzZXJcXFxcRGVza3RvcFxcXFxjYW52YXMtY29ybmVyLWZyZWUtbWFpblxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvVXNlci9EZXNrdG9wL2NhbnZhcy1jb3JuZXItZnJlZS1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvbm9kZV9tb2R1bGVzL3JlYWN0JykpIHJldHVybiAncmVhY3QnO1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL25vZGVfbW9kdWxlcy9AdGFuc3RhY2snKSkgcmV0dXJuICd0YW5zdGFjayc7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvbm9kZV9tb2R1bGVzL0BzdXBhYmFzZScpKSByZXR1cm4gJ3N1cGFiYXNlJztcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9ub2RlX21vZHVsZXMvbHVjaWRlLXJlYWN0JykpIHJldHVybiAnbHVjaWRlJztcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9ub2RlX21vZHVsZXMvQHJhZGl4LXVpJykpIHJldHVybiAncmFkaXgnO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKSwgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVUsU0FBUyxvQkFBb0I7QUFDaFcsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixhQUFhLElBQUk7QUFDZixjQUFJLEdBQUcsU0FBUyxxQkFBcUIsRUFBRyxRQUFPO0FBQy9DLGNBQUksR0FBRyxTQUFTLHlCQUF5QixFQUFHLFFBQU87QUFDbkQsY0FBSSxHQUFHLFNBQVMseUJBQXlCLEVBQUcsUUFBTztBQUNuRCxjQUFJLEdBQUcsU0FBUyw0QkFBNEIsRUFBRyxRQUFPO0FBQ3RELGNBQUksR0FBRyxTQUFTLHlCQUF5QixFQUFHLFFBQU87QUFBQSxRQUNyRDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLGlCQUFpQixnQkFBZ0IsQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQzlFLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
