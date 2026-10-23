import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://stateofvice.com';
  const articles = await getCollection('articles');
  const latest = articles.map((a) => a.data.updated).sort().at(-1) ?? '';
  const urls = [
    { loc: `${base}/`, lastmod: latest, freq: 'daily', pri: '1.0' },
    ...articles.map((a) => ({ loc: `${base}/articles/${a.id}.html`, lastmod: a.data.updated, freq: 'weekly', pri: '0.9' })),
    { loc: `${base}/wallpapers.html`, lastmod: '2026-10-20', freq: 'monthly', pri: '0.8' },
    { loc: `${base}/about.html`, lastmod: '2026-06-12', freq: 'monthly', pri: '0.5' },
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.pri}</priority></url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
