import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: false },
  }),
  security: {
    // Form login dikirim ke origin yang sama, jadi cukup longgarkan
    // pemeriksaan origin agar preview deployment Vercel tetap bisa dipakai.
    checkOrigin: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
