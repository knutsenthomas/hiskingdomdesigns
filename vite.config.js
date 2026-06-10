import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Helper to parse JSON body for local API middleware
function getBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vite-local-api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url.split('?')[0];
          if (url.startsWith('/api/')) {
            // Mock Vercel res helper methods
            res.status = (code) => {
              res.statusCode = code;
              return res;
            };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };

            // Parse body for POST requests
            if (req.method === 'POST') {
              req.body = await getBody(req);
            }

            try {
              if (url === '/api/get-or-create-conversation') {
                const { default: handler } = await import('./api/get-or-create-conversation.js');
                await handler(req, res);
                return;
              } else if (url === '/api/list-messages') {
                const { default: handler } = await import('./api/list-messages.js');
                await handler(req, res);
                return;
              } else if (url === '/api/send-message') {
                const { default: handler } = await import('./api/send-message.js');
                await handler(req, res);
                return;
              }
            } catch (err) {
              console.error('Vite local API middleware error:', err);
              res.status(500).json({ error: 'Internal Server Error', details: err.message });
              return;
            }
          }
          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('preload-helper') || id.includes('vite/')) {
            return 'react-core';
          }
          if (id.includes('node_modules')) {
            if (id.includes('@wix')) {
              return 'wix-sdk';
            }
            if (id.includes('firebase')) {
              return 'firebase';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('react')) {
              return 'react-core';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});
