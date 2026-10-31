import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  // JSX in src/ is Preact (the dashboard-loop module): h/Fragment are injected per file.
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: "import { h, Fragment } from 'preact'",
  },
  build: {
    lib: { entry: 'src/main.js', name: 'PixelSilo', formats: ['iife'], fileName: () => 'site.js' },
    outDir: 'dist',
    emptyOutDir: true,
    minify: mode !== 'development',
    sourcemap: mode === 'development',
  },
  preview: { cors: true },
}));
