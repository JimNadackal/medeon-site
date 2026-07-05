import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://medeon.ai',
  trailingSlash: 'ignore',
  integrations: [sitemap()]
});
