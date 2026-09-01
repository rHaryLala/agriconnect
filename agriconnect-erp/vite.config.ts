import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "hero/*.webp"],
      manifest: {
        name: "AgriConnect",
        short_name: "AgriConnect",
        description: "Logiciel de gestion de ferme — production, stock, finances, clients.",
        theme_color: "#0F8A5F",
        background_color: "#F6F8FA",
        display: "standalone",
        start_url: "/",
        icons: [
          { 
            src: "/icons/web-app-manifest-192x192.png", 
            sizes: "192x192", 
            type: "image/png" 
          },
          { 
            src: "/icons/web-app-manifest-512x512.png", 
            sizes: "512x512", 
            type: "image/png" 
          },
          { 
            src: "/icons/web-app-manifest-512x512.png", 
            sizes: "512x512", 
            type: "image/png", 
            purpose: "maskable" 
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => 
              request.destination === "image" || 
              /^\/(hero|backgrounds)\/.*\.(jpg|jpeg|webp|png)$/.test(request.url),
            handler: "CacheFirst",
            options: {
              cacheName: "agriconnect-images",
              expiration: { 
                maxEntries: 100, 
                maxAgeSeconds: 60 * 60 * 24 * 30 
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              matchOptions: {
                ignoreSearch: true
              }
            },
          },
          {
            urlPattern: /^\/$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "start-url",
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api/, /^\/auth/],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
})