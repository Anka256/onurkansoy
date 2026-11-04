// Quiet motion layer: reading progress, theme, active nav and a light reveal on scroll.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function progress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const bar = document.getElementById('bar');
  if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
}
addEventListener('scroll', progress, { passive: true });
document.getElementById('theme')?.addEventListener('click', () => {
  const r = document.documentElement, d = r.dataset.theme === 'dark' ? 'light' : 'dark';
  r.dataset.theme = d; try { localStorage.setItem('site-theme', d); } catch {}
});
const navh = () => { const n = document.querySelector<HTMLElement>('.nav'); if (n) document.documentElement.style.setProperty('--navh', n.offsetHeight + 'px'); };
addEventListener('resize', navh);
function markNav() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = location.pathname.replace(base, '').replace(/\/$/, '') || '/';
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((a) => {
    const on = path === a.dataset.nav || path.startsWith(a.dataset.nav + '/');
    on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
}
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
document.addEventListener('astro:page-load', () => {
  markNav(); progress(); navh();
  document.querySelectorAll<HTMLAnchorElement>('a[href^="http"]').forEach((a) => { if (a.host !== location.host) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } });
  if (reduce) return;
  document.querySelectorAll<HTMLElement>('.rv').forEach((el) => {
    if (el.getBoundingClientRect().top < innerHeight * 0.94) return;
    el.classList.add('pre'); io.observe(el);
  });
});
