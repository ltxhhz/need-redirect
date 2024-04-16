import { defineConfig } from 'vite'
import { join } from 'path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import buildNotifier from './.vite/plugins/rollup-plugin-notifier'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), buildNotifier()],
  build: {
    rollupOptions: {
      input: {
        option: join(__dirname, './src/pages/option/index.html'),
        popup: join(__dirname, './src/pages/popup/index.html'),
        content: join(__dirname, './src/scripts/content.ts'),
        background: join(__dirname, './src/scripts/background.ts')
      },
      output: {
        entryFileNames(chunkInfo) {
          // console.log(chunkInfo);

          if (chunkInfo.name == 'content') {
            return 'scripts/content.js'
          } else if (chunkInfo.name == 'background') {
            return 'scripts/background.js'
          }
          return 'assets/[name]-[hash].js'
        }
      }
    },
    sourcemap: true,
    outDir: 'extension',
    watch: {
      include: [join(__dirname, './public')],
      chokidar: {
        alwaysStat: true
      }
    }
  },
  resolve: {
    alias: {
      '@': join(__dirname, './src')
    }
  },
  optimizeDeps: {
    include: [join(__dirname, './src/scripts/**/*')]
  }
})

