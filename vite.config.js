import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {resolve} from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001
  },
  resolve: {
    alias: [
      {
        find: "@", replacement: resolve(__dirname, "/src")
      }
    ]
  },
});
