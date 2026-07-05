import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Currently hosted on GitHub Pages under a project path.
// When the site moves to the custom domain, change to:
//   site: 'https://medeon.ai'  and remove the `base` line.
export default defineConfig({
  site: 'https://jimnadackal.github.io',
  base: '/medeon-site',
  trailingSlash: 'ignore',
  integrations: [sitemap()]
});
