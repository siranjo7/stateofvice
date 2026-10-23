import { gsap, ScrollTrigger, getLenis, reducedMotion, splitChars } from './site';

interface CastMember { name: string; role: string; still: string; bio: string }

const $ = <T extends HTMLElement = HTMLElement>(id: string): T | null => document.getElementById(id) as T | null;
const finePointer = (): boolean => matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Live countdown to launch (days / hours / minutes / seconds). */
function initCountdown(): void {
  const cd = $('cd');
  if (!cd) return;
  const end = new Date(cd.dataset.launch ?? '').getTime();
  const cells = [...cd.querySelectorAll<HTMLElement>('b[data-u]')];
  const tick = (): void => {
    const t = Math.max(0, end - Date.now());
    const v: Record<string, number> = { d: Math.floor(t / 864e5), h: Math.floor((t % 864e5) / 36e5), m: Math.floor((t % 36e5) / 6e4), s: Math.floor((t % 6e4) / 1e3) };
    cells.forEach((b) => { b.textContent = String(v[b.dataset.u ?? 'd']).padStart(2, '0'); });
  };
  tick();
  setInterval(tick, 1000);
}

/** First-visit preloader; resolves when it's out of the way. */
function runLoader(): Promise<void> {
  const loader = $('loader');
  if (!loader) return Promise.resolve();
  let seen = false;
  try { seen = sessionStorage.getItem('sov-intro') === '1'; sessionStorage.setItem('sov-intro', '1'); } catch { /* storage blocked */ }
  if (seen || reducedMotion()) { loader.remove(); return Promise.resolve(); }
  getLenis()?.stop();
  const count = $('loaderCount');
  const state = { n: 0 };
  return new Promise((resolve) => {
    gsap.timeline({ onComplete: () => { loader.remove(); getLenis()?.start(); resolve(); } })
      .to('.loader-word', { clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'expo.out' })
      .to(state, { n: 100, duration: 1.4, ease: 'power2.inOut', onUpdate: () => { if (count) count.textContent = String(Math.round(state.n)).padStart(3, '0'); } }, 0)
      .to('#loaderBar', { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, 0)
      .to(loader, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '+=0.15');
  });
}

function initHero(): void {
  const h1 = $('heroH1');
  if (!h1) return;
  const chars = splitChars(h1);
  // Give every letter its own slice of one continuous gradient.
  const paint = (): void => {
    const box = h1.getBoundingClientRect();
    chars.forEach((c) => {
      const r = c.getBoundingClientRect();
      c.style.backgroundSize = `${box.width}px ${box.height}px`;
      c.style.backgroundPosition = `${box.left - r.left}px ${box.top - r.top}px`;
    });
  };
  paint();
  addEventListener('resize', paint);
  gsap.timeline({ delay: 0.1 })
    .from(chars, { yPercent: 120, rotate: 8, duration: 1.4, ease: 'expo.out', stagger: 0.035 })
    .from(['#heroKick', '#heroSub', '#heroCta', '.hero-foot'], { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.1 }, '-=1');

  // Video shrinks into a framed card while the title lifts away.
  gsap.to('#heroMedia', { scale: 0.6, borderRadius: 32, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: true } });
  gsap.to('#heroTitle', { yPercent: -50, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '35% top', scrub: true } });

  // Subtle mouse parallax on the title and video.
  if (finePointer()) {
    const tx = gsap.quickTo('#heroTitle', 'x', { duration: 1.2, ease: 'power3' });
    const vx = gsap.quickTo('#heroMedia video', 'x', { duration: 1.6, ease: 'power3' });
    const vy = gsap.quickTo('#heroMedia video', 'y', { duration: 1.6, ease: 'power3' });
    gsap.set('#heroMedia video', { scale: 1.06 });
    $('heroMedia')?.parentElement?.addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      tx(nx * -24); vx(nx * 30); vy(ny * 20);
    });
  }
}

/** Marquee whose speed and direction follow scroll velocity. */
function initTicker(): void {
  const track = $('tickerTrack');
  if (!track) return;
  let x = 0;
  let boost = 0;
  getLenis()?.on('scroll', ({ velocity }: { velocity: number }) => { boost = velocity * 0.6; });
  gsap.ticker.add(() => {
    const half = track.scrollWidth / 2;
    x -= 0.6 + boost;
    boost *= 0.92;
    if (x <= -half) x += half;
    if (x > 0) x -= half;
    track.style.transform = `translate3d(${x}px,0,0)`;
  });
}

/** Pinned horizontal news reel with filter chips and 3D-tilt cards. */
function initReel(): void {
  const reel = $('reel');
  const track = $('reelTrack');
  const bar = $('reelProgress');
  if (!reel || !track) return;
  const desktop = matchMedia('(min-width: 861px)').matches;
  let st: ScrollTrigger | undefined;

  const build = (): void => {
    st?.kill();
    gsap.set(track, { x: 0 });
    if (!desktop) return;
    const dist = (): number => Math.max(0, track.scrollWidth - innerWidth);
    const tween = gsap.to(track, { x: () => -dist(), ease: 'none' });
    st = ScrollTrigger.create({
      trigger: reel, start: 'top 14%', end: () => `+=${dist()}`, pin: true, scrub: 1, animation: tween, invalidateOnRefresh: true,
      onUpdate: (self) => { if (bar) bar.style.transform = `scaleX(${self.progress})`; },
    });
  };
  if (!desktop && bar) reel.addEventListener('scroll', () => { bar.style.transform = `scaleX(${reel.scrollLeft / Math.max(1, reel.scrollWidth - reel.clientWidth)})`; }, { passive: true });

  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      const cards = [...track.querySelectorAll<HTMLElement>('.nc')];
      gsap.to(cards, {
        opacity: 0, y: 30, duration: 0.25, stagger: 0.02, onComplete: () => {
          cards.forEach((c) => c.classList.toggle('hidden', f !== 'ALL' && c.dataset.tag !== f));
          build();
          ScrollTrigger.refresh();
          gsap.fromTo(cards.filter((c) => !c.classList.contains('hidden')), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.05 });
        },
      });
    });
  });

  if (finePointer()) {
    track.querySelectorAll<HTMLElement>('.nc').forEach((card) => {
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 10); rx((0.5 - py) * 8);
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }
  build();
}

function initRegions(): void {
  const dots = $('regionDots');
  const links = dots ? [...dots.querySelectorAll('a')] : [];
  document.querySelectorAll<HTMLElement>('.rg').forEach((rg, i) => {
    gsap.to(rg.querySelector('.bg'), { yPercent: 14, ease: 'none', scrollTrigger: { trigger: rg, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from(rg.querySelectorAll('.num, h3, .rnote, p'), { y: 90, opacity: 0, stagger: 0.08, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: rg, start: 'top 60%' } });
    gsap.from(rg.querySelector('.pc'), { rotate: -14, y: 140, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: rg, start: 'top 55%' } });
    ScrollTrigger.create({ trigger: rg, start: 'top center', end: 'bottom center', onToggle: (s) => { if (s.isActive) links.forEach((l, j) => l.classList.toggle('on', j === i)); } });
  });
  const first = $('region-1');
  const last = $('region-6');
  if (dots && first && last) {
    ScrollTrigger.create({ trigger: first, endTrigger: last, start: 'top center', end: 'bottom center', onToggle: (s) => dots.classList.toggle('show', s.isActive) });
  }
}

/** Cast grid: hover plays the clip, click opens a character drawer. */
function initCast(): void {
  const data = JSON.parse($('castData')?.textContent ?? '[]') as CastMember[];
  const drawer = $('drawer');
  if (!drawer || !data.length) return;
  const img = $<HTMLImageElement>('drawerImg');
  const name = $('drawerName');
  const bio = $('drawerBio');
  let idx = 0;
  let opener: HTMLElement | null = null;

  document.querySelectorAll<HTMLElement>('.cc').forEach((cc) => {
    const v = cc.querySelector('video');
    cc.addEventListener('pointerenter', () => { v?.play().catch(() => undefined); });
    cc.addEventListener('pointerleave', () => v?.pause());
    cc.addEventListener('click', () => { opener = cc; show(Number(cc.dataset.char)); });
  });
  const show = (i: number): void => {
    idx = (i + data.length) % data.length;
    const c = data[idx];
    if (img) { img.src = c.still; img.alt = `${c.name} — official GTA 6 screenshot`; }
    if (name) name.textContent = c.name;
    if (bio) bio.textContent = c.bio;
    if (!drawer.classList.contains('open')) {
      drawer.classList.add('open');
      getLenis()?.stop();
      $('drawerClose')?.focus();
    } else {
      gsap.fromTo('.drawer-panel .body > *', { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.5, ease: 'expo.out' });
    }
  };
  const close = (): void => { drawer.classList.remove('open'); getLenis()?.start(); opener?.focus(); };
  $('drawerClose')?.addEventListener('click', close);
  $('drawerScrim')?.addEventListener('click', close);
  $('drawerPrev')?.addEventListener('click', () => show(idx - 1));
  $('drawerNext')?.addEventListener('click', () => show(idx + 1));
  addEventListener('keydown', (e) => {
    if (!drawer.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
  });
  gsap.from('.cc', { y: 70, opacity: 0, stagger: 0.06, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#castGrid', start: 'top 80%' } });
}

function initMeter(): void {
  const meter = $('meter');
  const arc = document.getElementById('meterArc');
  const num = $('meterNum');
  if (!meter || !arc) return;
  const value = Number(meter.dataset.value);
  const total = Number(meter.dataset.total);
  const state = { v: 0 };
  ScrollTrigger.create({
    trigger: meter, start: 'top 75%', once: true,
    onEnter: () => gsap.to(state, {
      v: value, duration: 1.8, ease: 'power3.out',
      onUpdate: () => {
        arc.setAttribute('stroke-dashoffset', String(100 - (state.v / total) * 100));
        if (num) num.textContent = String(Math.round(state.v));
      },
    }),
  });
}

/** Guide rows reveal a floating preview image that follows the pointer. */
function initGuidePreview(): void {
  const box = $('glPreview');
  const img = $<HTMLImageElement>('glPreviewImg');
  if (!box || !img || !finePointer()) return;
  const x = gsap.quickTo(box, 'left', { duration: 0.6, ease: 'power3' });
  const y = gsap.quickTo(box, 'top', { duration: 0.6, ease: 'power3' });
  document.querySelectorAll<HTMLElement>('.gl').forEach((row) => {
    row.addEventListener('pointerenter', () => { img.src = row.dataset.preview ?? ''; box.classList.add('show'); });
    row.addEventListener('pointerleave', () => box.classList.remove('show'));
    row.addEventListener('pointermove', (e) => { x(e.clientX + 200); y(e.clientY); });
  });
}

export async function initHome(): Promise<void> {
  initCountdown();
  document.querySelectorAll<HTMLVideoElement>('video[autoplay]').forEach((v) => { v.play().catch(() => undefined); });
  initCast();
  if (reducedMotion()) {
    $('loader')?.remove();
    const m = $('meter');
    document.getElementById('meterArc')?.setAttribute('stroke-dashoffset', String(100 - (Number(m?.dataset.value) / Number(m?.dataset.total)) * 100));
    return;
  }
  initTicker();
  initReel();
  initRegions();
  initMeter();
  initGuidePreview();
  await runLoader();
  initHero();
  ScrollTrigger.refresh();
}
