import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), sentryVitePlugin({
            org: "student-s5e",
            project: "guidia-web"
        })],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: 'localhost',
        port: 1030,
        proxy: {
            '/auth': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
                rewrite: function (path) {
                    // Only rewrite API endpoints, let the frontend handle routes
                    if (path.startsWith('/auth/api/')) {
                        return path.replace('/auth/api/', '/auth/');
                    }
                    return path;
                },
                configure: function (proxy, _options) {
                    proxy.on('error', function (err, _req, _res) {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', function (proxyReq, req, _res) {
                        console.log('Sending Request:', req.method, req.url);
                    });
                    proxy.on('proxyRes', function (proxyRes, req, _res) {
                        console.log('Received Response:', proxyRes.statusCode, req.url);
                    });
                },
                bypass: function (req) {
                    // Bypass proxy for frontend routes
                    if (req.url.startsWith('/auth/reset-password/') && req.method === 'GET') {
                        return req.url;
                    }
                }
            },
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
                rewrite: function (path) { return path; },
                configure: function (proxy, _options) {
                    proxy.on('error', function (err, _req, _res) {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', function (proxyReq, req, _res) {
                        console.log('API Sending Request:', req.method, req.url);
                    });
                    proxy.on('proxyRes', function (proxyRes, req, _res) {
                        console.log('API Received Response:', proxyRes.statusCode, req.url);
                    });
                }
            }
        }
    },
    build: {
        sourcemap: true
    }
});
