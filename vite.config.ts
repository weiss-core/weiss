import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@ReactAutomationStudio": path.resolve(
        __dirname,
        "./submodules/React-Automation-Studio/ReactApp/src"
      ),
      "@src": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
    },
  },
  plugins: [react()],
  server: {
    port: 3000,
    hmr: {
      path: "ws",
    },
  },
});
