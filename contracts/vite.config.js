import { defineConfig, loadEnv } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const nodeProxyTarget = env.SCL_NODE_PROXY_TARGET || 'https://testscl.mimic.me';

  return {
    root: '.',
    // Pre-compiled WASM pkg must not be pre-bundled by Vite
    optimizeDeps: {
      exclude: ['./pkg', './pkg/scl_wallet.js'],
    },
    server: {
      port: 5173,
      proxy: {
        '/scl-node': {
          target: nodeProxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/scl-node/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          deploy: path.resolve(__dirname, 'deploy-domain-nft.html'),
        },
      },
    },
    define: {
      __SCL_NODE_PROXY_TARGET__: JSON.stringify(nodeProxyTarget),
    },
  };
});
