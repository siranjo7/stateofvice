import { defineCollection, z } from 'astro:content';
import type { Loader } from 'astro/loaders';
import { readdir, readFile } from 'node:fs/promises';

/**
 * Each content file is plain HTML: a leading
 * `<script type="application/json" data-meta>{...}</script>` block with metadata,
 * followed by the page body. Adding an article = adding one file to src/content/articles/.
 */
const META_RX = /^\s*<script type="application\/json" data-meta>([\s\S]*?)<\/script>/;

function htmlDir(dir: string): Loader {
  return {
    name: `html-dir:${dir}`,
    load: async ({ store, parseData, logger, watcher }) => {
      const base = new URL(`./content/${dir}/`, import.meta.url);
      const sync = async () => {
        store.clear();
        for (const file of (await readdir(base)).filter((f) => f.endsWith('.html'))) {
          const raw = await readFile(new URL(file, base), 'utf-8');
          const m = raw.match(META_RX);
          if (!m) {
            logger.error(`${dir}/${file}: missing <script data-meta> block`);
            continue;
          }
          const id = file.replace(/\.html$/, '');
          const data = await parseData({ id, data: { ...JSON.parse(m[1]), body: raw.slice(m[0].length) } });
          store.set({ id, data });
        }
      };
      await sync();
      watcher?.on('change', (p) => p.includes(`/content/${dir}/`) && sync());
    },
  };
}

const tag = z.enum(['CONFIRMED', 'RUMOR', 'ANALYSIS']);
const common = {
  title: z.string(),
  description: z.string(),
  ogTitle: z.string().default(''),
  ogDescription: z.string().default(''),
  jsonld: z.array(z.string()).default([]),
  styles: z.array(z.string()).default([]),
  body: z.string(),
};

const articles = defineCollection({
  loader: htmlDir('articles'),
  schema: z.object({
    ...common,
    slug: z.string(),
    kind: z.enum(['news', 'guide']),
    order: z.number(),
    tag,
    heroImage: z.string(),
    heroAlt: z.string().default(''),
    crumb: z.string().default(''),
    kicker: z.string(),
    h1: z.string(),
    metaLine: z.string().default(''),
    published: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD'),
    updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD'),
    cardTitle: z.string(),
    blurb: z.string(),
    dateLabel: z.string().optional(),
    cardKicker: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: htmlDir('pages'),
  schema: z.object({ ...common, wide: z.boolean().default(false) }),
});

export const collections = { articles, pages };
