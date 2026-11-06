import { defineConfig } from 'astro/config';
export default defineConfig({
  site: process.env.SITE_URL || 'https://anka256.github.io',
  base: process.env.SITE_BASE || '/onurkansoy',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  redirects: { '/about': '/onurkansoy/personal/' },
});
