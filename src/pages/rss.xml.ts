import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://stateofvice.com';
  const articles = (await getCollection('articles'))
    .filter((a) => a.data.kind === 'news')
    .sort((a, b) => b.data.published.localeCompare(a.data.published) || a.data.order - b.data.order);
  const items = articles
    .map((a) => {
      const url = `${base}/articles/${a.id}.html`;
      return `    <item><title>${esc(`[${a.data.tag}] ${a.data.cardTitle}`)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(a.data.published + 'T12:00:00Z').toUTCString()}</pubDate><description>${esc(a.data.blurb)}</description></item>`;
    })
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>State of Vice — GTA 6 news</title>\n    <link>${base}/</link>\n    <description>Every GTA 6 announcement, labeled CONFIRMED or RUMOR.</description>\n    <language>en</language>\n${items}\n  </channel>\n</rss>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
