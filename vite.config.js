import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/rsvp-north-26/',
  server: {
    fs: { deny: ['.env', '.env.*', '*firebase-adminsdk*.json', '*serviceaccount*.json', '*service-account*.json', '**/.git/**'] }
  },
})
