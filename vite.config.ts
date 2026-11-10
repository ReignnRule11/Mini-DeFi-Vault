import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages serves this repository under /Mini-DeFi-Vault/.
  // Keep the root path for local development.
  base: process.env.GITHUB_ACTIONS === "true" ? "/Mini-DeFi-Vault/" : "/",
  plugins: [react()],
});
