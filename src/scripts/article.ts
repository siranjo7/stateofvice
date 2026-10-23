import { gsap, ScrollTrigger, getLenis, reducedMotion } from './site';

const WORDS_PER_MIN = 230;

function readingTime(prose: HTMLElement): void {
  const el = document.getElementById('readTime');
  const words = (prose.textContent ?? '').trim().split(/\s+/).length;
  if (el) el.textContent = String(Math.max(1, Math.round(words / WORDS_PER_MIN)));
}

/** Builds the sticky contents list from the article's h2s and tracks the active one. */
function buildToc(prose: HTMLElement): void {
  const list = document.getElementById('toc');
  const heads = [...prose.querySelectorAll<HTMLHeadingElement>('h2')];
  if (!list || heads.length < 2) { list?.closest('.toc')?.setAttribute('hidden', ''); return; }
  const links = heads.map((h, i) => {
    if (!h.id) h.id = `s-${i + 1}-${(h.textContent ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)}`;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent ?? '';
    li.append(a);
    list.append(li);
    return a;
  });
  heads.forEach((h, i) => ScrollTrigger.create({
    trigger: h, start: 'top 40%', endTrigger: heads[i + 1] ?? prose, end: heads[i + 1] ? 'top 40%' : 'bottom 40%',
    onToggle: (s) => { if (s.isActive) links.forEach((l, j) => l.classList.toggle('on', j === i)); },
  }));
}

function initCopyLink(): void {
  const btn = document.getElementById('copyLink');
  btn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href.split('#')[0]);
      btn.textContent = 'Link copied ✓';
    } catch {
      btn.textContent = 'Copy failed';
    }
    setTimeout(() => { btn.textContent = 'Copy link'; }, 2000);
  });
}

export function initArticle(): void {
  const prose = document.getElementById('prose');
  if (!prose) return;
  readingTime(prose);
  buildToc(prose);
  initCopyLink();
  if (reducedMotion()) return;
  gsap.to('#aheroImg', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.ahero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.from(['.ahero-bc', '.ahero-tags', '.ahero-meta'], { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.2 });
  gsap.from('#aheroImg', { scale: 1.12, duration: 2, ease: 'expo.out' });
  prose.querySelectorAll<HTMLElement>('figure, .confirmed, .note, table, .faq, .next-up, .media-grid, .rcar').forEach((el) => {
    gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  getLenis()?.resize();
}
