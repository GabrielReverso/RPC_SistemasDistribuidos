import { defineConfig } from "vite";

export default defineConfig({
    root: "_web",
    server: {
        port: 5173,
        proxy: {
            '/add': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    build: {
        outDir: "../dist",
        emptyOutDir: true
    }
});