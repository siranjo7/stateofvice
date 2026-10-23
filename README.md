# State of Vice

The honest GTA 6 hub — [stateofvice.com](https://stateofvice.com). Built with [Astro](https://astro.build), GSAP and Lenis; deployed to Cloudflare Workers on every push to `main`.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Local dev server at http://localhost:4321 |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |

## Adding an article

Every article is one file in `src/content/articles/<slug>.html`, served at `/articles/<slug>.html`.
The file starts with a metadata block, then the article body as HTML:

```html
<script type="application/json" data-meta>
{
 "title": "SEO title",
 "description": "Meta description",
 "slug": "gta-6-example",
 "kind": "news",            // "news" (homepage reel) or "guide" (guides list)
 "order": 1,                // position in its list (1 = first)
 "tag": "CONFIRMED",        // CONFIRMED | RUMOR | ANALYSIS
 "heroImage": "/assets/press/vice-city-01.jpg",
 "kicker": "TRAILER", "h1": "HEADLINE", "crumb": "Short name",
 "published": "2026-10-20", "updated": "2026-10-20",
 "cardTitle": "Short card title", "blurb": "One-line summary",
 "dateLabel": "Oct 20", "cardKicker": "Trailer",
 "jsonld": []
}
</script>
<div class="confirmed"><strong>Confirmed:</strong> …</div>
<p class="lead">…</p>
```

Body building blocks: `.confirmed` (cyan) and `.note` (amber) callouts, `figure.art`, tables, `section.faq`, `a.next-up`.
The homepage reel, guides list, footer, sitemap and related-stories all update automatically.

Homepage data that isn't an article (regions, cast, trailers, facts) lives in `src/data/site.ts`.
