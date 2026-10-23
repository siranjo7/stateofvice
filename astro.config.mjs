// @ts-check
import { defineConfig } from 'astro/config';

// Static output; `format: 'file'` keeps the existing URLs (/articles/slug.html, /about.html).
export default defineConfig({
  site: 'https://stateofvice.com',
  output: 'static',
  build: { format: 'file' },
  trailingSlash: 'ignore',
});
