import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/SudokuTaro/' : '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Vite reports decimal kB. Keep the historical 244 reference visible;
    // this is slightly stricter than the former Webpack 244 KiB budget.
    chunkSizeWarningLimit: 244,
    // Static imports retain the existing boot/UI behavior. Separating stable
    // React code improves cache reuse; it does not reduce total cold-load JS.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)([\\/]|$)/,
            },
          ],
        },
      },
    },
  },
})
