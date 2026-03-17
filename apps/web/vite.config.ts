import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // HTTPS disabled to avoid ERR_SSL_VERSION_OR_CIPHER_MISMATCH on localhost.
    // For GetKollo with digital-core.us, use hosts file + tunnel (e.g. ngrok) or run with --https when needed.
  },
})
