import { music } from '../data/music';

// One music player for the whole site. Its YouTube iframes live under <html>, outside the
// <body> that the router swaps, so playback carries on from page to page.
// Each record has its own loaded player and a click starts that player directly: browsers
// block sound that begins later than the gesture that asked for it.
type Listener = () => void;

function create() {
  const T = music, n = T.length, P: any[] = [], ready: boolean[] = [], made: boolean[] = [], subs = new Set<Listener>();
  const s = { cur: 0, playing: false, started: false, failed: false };
  let want = false, fails = 0, host: HTMLElement | null = null;
  const emit = () => subs.forEach((f) => f());
  const setPlay = (p: boolean) => { s.playing = p; if (p) s.started = true; emit(); };
  const api = () => new Promise<any>((res) => {
    const w = window as any; if (w.YT?.Player) return res(w.YT);
    const prev = w.onYouTubeIframeAPIReady; w.onYouTubeIframeAPIReady = () => { prev?.(); res(w.YT); };
    if (!document.querySelector('script[data-yt-api]')) { const e = document.createElement('script'); e.src = 'https://www.youtube.com/iframe_api'; e.dataset.ytApi = '1'; document.head.append(e); }
  });
  const make = async (i: number) => {
    if (made[i]) return; made[i] = true;
    const YT = await api();
    if (!host) { host = document.createElement('div'); host.style.cssText = 'position:fixed;left:-1200px;bottom:0;width:356px;height:200px;pointer-events:none'; host.setAttribute('aria-hidden', 'true'); document.documentElement.append(host); }
    const el = document.createElement('div'); el.id = `ytp${i}`; host.append(el);
    P[i] = new YT.Player(el.id, { width: 356, height: 200, videoId: T[i].yt, playerVars: { controls: 0, rel: 0, playsinline: 1, iv_load_policy: 3, disablekb: 1, origin: location.origin, enablejsapi: 1 },
      events: {
        onReady: () => { ready[i] = true; if (i === s.cur && want) P[i].playVideo(); },
        onError: () => { if (i === s.cur) skip(); },
        onStateChange: (e: any) => {
          if (i !== s.cur) { if (e.data === 1) P[i].stopVideo(); return; }
          if (e.data === 1) { fails = 0; want = true; s.failed = false; setPlay(true); }
          if (e.data === 2) { want = false; setPlay(false); }
          if (e.data === 0) move(1);
        } } });
  };
  const warm = () => { make(s.cur); make((s.cur + 1) % n); make((s.cur + n - 1) % n); };
  const start = () => { want = true; warm(); if (ready[s.cur]) P[s.cur].playVideo(); };
  const move = (d: number) => {
    const was = want; if (ready[s.cur]) P[s.cur].stopVideo();
    s.cur = (s.cur + d + n) % n; s.failed = false; want = false; setPlay(false); warm();
    if (was) start();
  };
  // A track YouTube refuses to embed is skipped; the player itself is never shown.
  const skip = () => { if (++fails < n) { want = true; move(1); return; } fails = 0; want = false; s.failed = true; setPlay(false); };
  const toggle = () => { if (s.playing) { want = false; P[s.cur].pauseVideo(); } else start(); };
  const subscribe = (f: Listener) => { subs.add(f); return () => { subs.delete(f); }; };
  return { T, s, warm, toggle, move, subscribe };
}

const w = window as any;
export const player: ReturnType<typeof create> = (w.__music ??= create());
