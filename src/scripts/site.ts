import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = (): boolean => matchMedia('(hover: hover) and (pointer: fine)').matches;

let lenis: Lenis | null = null;
export const getLenis = (): Lenis | null => lenis;

/** Smooth scroll driven by GSAP's ticker so ScrollTrigger stays in sync. */
function initSmoothScroll(): void {
  if (reducedMotion()) return;
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // In-page anchors scroll smoothly; links to other pages behave normally.
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname && !(url.pathname === '/' && location.pathname === '/index.html')) return;
    const target = url.hash && document.querySelector(url.hash);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    lenis?.scrollTo(target as HTMLElement, { offset: -70, duration: 1.4 });
  });
}

function initProgressAndNav(): void {
  const bar = document.getElementById('progress');
  const nav = document.getElementById('nav');
  let last = 0;
  const onScroll = (): void => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (nav) {
      nav.classList.toggle('scrolled', y > 40);
      nav.classList.toggle('hide', y > 400 && y > last && !nav.classList.contains('open'));
    }
    last = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function closeMenu(): void {
  const nav = document.getElementById('nav');
  const btn = document.getElementById('menuBtn');
  nav?.classList.remove('open');
  btn?.setAttribute('aria-expanded', 'false');
  lenis?.start();
}

function initMenu(): void {
  const nav = document.getElementById('nav');
  const btn = document.getElementById('menuBtn');
  if (!nav || !btn) return;
  btn.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) lenis?.stop(); else lenis?.start();
  });
  document.getElementById('navLinks')?.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) closeMenu();
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
}

/** Custom cursor with hover states; `data-cursor="LABEL"` shows a text label. */
function initCursor(): void {
  if (!finePointer() || reducedMotion()) return;
  const ring = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  const label = document.getElementById('cursorLabel');
  if (!ring || !dot || !label) return;
  document.documentElement.classList.add('has-cursor');
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
  addEventListener('pointermove', (e) => {
    rx(e.clientX); ry(e.clientY);
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  });
  document.addEventListener('pointerover', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('[data-cursor], a, button');
    const text = el?.dataset.cursor ?? '';
    label.textContent = text;
    ring.classList.toggle('is-label', Boolean(text));
    ring.classList.toggle('is-link', Boolean(el) && !text);
  });
  document.addEventListener('pointerleave', () => document.documentElement.classList.remove('has-cursor'));
  document.addEventListener('pointerenter', () => document.documentElement.classList.add('has-cursor'));
}

/** Elements with data-magnetic drift toward the pointer. */
function initMagnetic(): void {
  if (!finePointer() || reducedMotion()) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, .4)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, .4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.35);
      y((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}

/** Wraps each character of [data-split] text in spans for staggered reveals. */
export function splitChars(el: HTMLElement): HTMLElement[] {
  const chars: HTMLElement[] = [];
  const walk = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      (node.textContent ?? '').split(/(\s+)/).forEach((word) => {
        if (!word) return;
        if (/^\s+$/.test(word)) { frag.append(document.createTextNode(word)); return; }
        const wd = document.createElement('span');
        wd.className = 'wd';
        [...word].forEach((c) => {
          const ch = document.createElement('span');
          ch.className = 'ch';
          ch.textContent = c;
          wd.append(ch);
          chars.push(ch);
        });
        frag.append(wd);
      });
      node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName !== 'BR') {
      [...node.childNodes].forEach(walk);
    }
  };
  el.setAttribute('aria-label', el.textContent?.replace(/\s+/g, ' ').trim() ?? '');
  [...el.childNodes].forEach(walk);
  el.classList.add('split');
  el.querySelectorAll('.wd').forEach((w) => w.setAttribute('aria-hidden', 'true'));
  return chars;
}

function initReveals(): void {
  if (reducedMotion()) return;
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const chars = splitChars(el);
    gsap.from(chars, {
      yPercent: 110, rotate: 6, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.018,
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
  });
}

/** Any element with data-video="<YouTube id>" opens the official video in a lightbox. */
function initLightbox(): void {
  const box = document.getElementById('lightbox');
  const frame = document.getElementById('lightboxFrame');
  const close = document.getElementById('lightboxClose');
  if (!box || !frame || !close) return;
  let opener: HTMLElement | null = null;
  const shut = (): void => {
    box.classList.remove('open');
    frame.replaceChildren();
    lenis?.start();
    opener?.focus();
  };
  document.addEventListener('click', (e) => {
    const t = (e.target as Element).closest<HTMLElement>('[data-video]');
    if (!t) return;
    e.preventDefault();
    opener = t;
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(t.dataset.video ?? '')}?autoplay=1&rel=0`;
    iframe.title = t.dataset.videoTitle ?? 'Official video';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    frame.replaceChildren(iframe);
    box.classList.add('open');
    lenis?.stop();
    close.focus();
  });
  close.addEventListener('click', shut);
  box.addEventListener('click', (e) => { if (e.target === box) shut(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && box.classList.contains('open')) shut(); });
}

export function initSite(): void {
  initSmoothScroll();
  initProgressAndNav();
  initMenu();
  initCursor();
  initMagnetic();
  initReveals();
  initLightbox();
  addEventListener('load', () => ScrollTrigger.refresh());
  const page = document.body.dataset.page;
  if (page === 'home') void import('./home').then((m) => m.initHome());
  if (page === 'article') void import('./article').then((m) => m.initArticle());
}

export { gsap, ScrollTrigger };
