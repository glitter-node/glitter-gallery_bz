import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },

  plugins: [
    react(),
    tailwindcss(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'node_modules'],
    }),
  ],

  build: {
    
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'GlitterGalleryBz', 
      fileName: 'components',
      formats: ['iife'], 
    },

    
    outDir: 'dist',
    emptyOutDir: true,

    
    // 배포용 빌드(--production)는 G7_BUILD_SOURCEMAP=0 을 주입해 소스맵을 생성하지 않는다.
    // 미설정(로컬 npm run build)이면 생성 — 개발 디버깅 경험을 유지한다.
    sourcemap: !['0', 'false'].includes(process.env.G7_BUILD_SOURCEMAP ?? ''),

    
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],

      output: {
        footer: 'globalThis.GlitterGalleryBz = globalThis.GlitterGalleryBz || GlitterGalleryBz;',
        
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'ReactJSXRuntime',
        },

        
        assetFileNames: (assetInfo) => {
          
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name][extname]';
          }
          
          if (assetInfo.name?.match(/\.(woff|woff2|eot|ttf|otf)$/)) {
            return 'assets/fonts/[name][extname]';
          }
          
          if (assetInfo.name?.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
            return 'assets/images/[name][extname]';
          }
          return 'assets/[name][extname]';
        },

        
        entryFileNames: 'js/components.iife.js',
        chunkFileNames: 'js/[name]-[hash].js',
      },
    },

    
    minify: 'esbuild',
    target: 'es2020',

    
    chunkSizeWarningLimit: 1000,
  },

  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
    },
  },

  
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    
    deps: {
      inline: ['react-dom'],
    },
  },
});
