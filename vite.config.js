import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: loadEnv(mode, process.cwd(), 'VITE_').VITE_BASE_PATH || './',
  server: {
    fs: { deny: ['.env', '.env.*', '*firebase-adminsdk*.json', '*serviceaccount*.json', '*service-account*.json', '**/.git/**'] }
  },
}))
