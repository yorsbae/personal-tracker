import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "injectManifest", // ganti dari 'generateSW' default supaya bisa nulis custom push handler
      srcDir: "src",
      filename: "sw.ts",
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      manifest: {
        name: "Life OS",
        short_name: "LifeOS",
        description: "Personal life management app",
        theme_color: "#111827",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
        shortcuts: [
          {
            name: "Sesi Fokus",
            short_name: "Fokus",
            url: "/focus",
            icons: [{ src: "/icon-192.png", sizes: "192x192" }],
          },
          {
            name: "Money",
            short_name: "Money",
            url: "/money",
            icons: [{ src: "/icon-192.png", sizes: "192x192" }],
          },
          {
            name: "Tambah Latihan",
            short_name: "Latihan",
            url: "/exercises",
            icons: [{ src: "/icon-192.png", sizes: "192x192" }],
          },
        ],
      },
    }),
  ],
});
