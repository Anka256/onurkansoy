// Canvas worlds used across the site. HnsPlayer replays real trained episodes;
// HunterEnv is a line-by-line port of the Gymnasium environment; the others are small live models.
const cssv = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
export const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const shown = new WeakMap<HTMLElement, string>();
/** Writes a labelled grid of live values, touching the DOM only when something changed. */
export function metrics(el: HTMLElement, pairs: [string, string | number][]) {
  const html = pairs.map(([k, v]) => `<span><i>${k}</i><b>${v}</b></span>`).join('');
  if (shown.get(el) !== html) { shown.set(el, html); el.innerHTML = html; }
}
export function hnsMetrics(q: HnsPlayer): [string, string | number][] {
  const d = q.d, t = q.t, f = q.frame, fr = q.episode.frames, prep = t < d.prep; let seen = 0;
  for (let i = d.prep; i <= t && i < fr.length; i++) seen += fr[i][14];
  const steps = Math.max(0, t - d.prep + 1), r = steps - 2 * seen, locks = (f[9] ? 1 : 0) + (f[13] ? 1 : 0);
  return [['Time', `${t}/240`], ['Phase', prep ? 'Prep' : 'Seek'], ['Hider', prep ? 'Free' : f[14] ? 'Seen' : 'Hidden'], ['Distance', `${Math.hypot(f[0] - f[3], f[1] - f[4]).toFixed(1)} m`], ['Unseen', steps ? `${Math.round((100 * (steps - seen)) / steps)}%` : '-'], ['Boxes locked', `${locks}/2`], ['Hider return', `${r >= 0 ? '+' : ''}${r}`], ['Seeker return', `${r > 0 ? '-' : '+'}${Math.abs(r)}`], ['Episode', `${q.ep + 1}/${d.episodes.length}`]];
}
export function hunterMetrics(e: HunterEnv): [string, string | number][] {
  return [['Day', `${Math.min(e.day + 1, 30)}/30`], ['Phase', PHASES[e.phase][0] + PHASES[e.phase].slice(1).toLowerCase()], ['Location', LOCS[e.loc][0] + LOCS[e.loc].slice(1).toLowerCase()], ['Energy', `${e.energy}/15`], ['Health', e.health ? 'Injured' : 'Healthy'], ['Fruit', `${e.fruit}/4`], ['Skill', `${e.skill}/2`], ['Return', e.ret]];
}
export function fit(c: HTMLCanvasElement) {
  const r = c.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
  c.width = Math.max(10, r.width * d); c.height = Math.max(10, r.height * d);
  const g = c.getContext('2d')!; g.setTransform(d, 0, 0, d, 0, 0);
  return { g, W: r.width, H: r.height };
}
type Seg = number[];
function hit(ox: number, oy: number, dx: number, dy: number, s: Seg) {
  const rx = s[2] - s[0], ry = s[3] - s[1], den = dx * ry - dy * rx;
  if (Math.abs(den) < 1e-9) return 1e9;
  const t = ((s[0] - ox) * ry - (s[1] - oy) * rx) / den, u = ((s[0] - ox) * dy - (s[1] - oy) * dx) / den;
  return t > 0 && u >= 0 && u <= 1 ? t : 1e9;
}
export function cast(ox: number, oy: number, a: number, S: Seg[], max = 30) {
  let b = max; const dx = Math.cos(a), dy = Math.sin(a);
  for (const s of S) { const t = hit(ox, oy, dx, dy, s); if (t < b) b = t; }
  return b;
}
function boxCorners(x: number, y: number, a: number, L: number, Wd: number) {
  const dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx, l = L / 2, w = Wd / 2;
  return [[x + dx * l + nx * w, y + dy * l + ny * w], [x + dx * l - nx * w, y + dy * l - ny * w], [x - dx * l - nx * w, y - dy * l - ny * w], [x - dx * l + nx * w, y - dy * l + ny * w]];
}
const boxSegs = (p: number[][]) => p.map((q, i) => [...q, ...p[(i + 1) % 4]]);

export interface Episode { seed: number; hide: number; walls: Seg[]; frames: number[][] }
export interface HnsData { step: number; prep: number; arena: number; boxSize: number[]; episodes: Episode[] }

/** Replays a stored episode: [hx,hy,ha, sx,sy,sa, b1x,b1y,b1a,b1lock, b2x,b2y,b2a,b2lock, seen]. */
export class HnsPlayer {
  t = 0; ep = 0; playing = true; speed = 1; showRays = true; showCone = true; trail = true;
  onTick?: (p: HnsPlayer) => void;
  private acc = 0; private raf = 0; private last = 0; private vis = true; private io?: IntersectionObserver; private ro?: ResizeObserver;
  private dims = { g: null as CanvasRenderingContext2D | null, W: 0, H: 0 };
  constructor(public c: HTMLCanvasElement, public d: HnsData) {
    this.ro = new ResizeObserver(() => { this.resize(); this.draw(); }); this.ro.observe(c);
    this.resize();
    this.io = new IntersectionObserver((e) => (this.vis = e[0].isIntersecting)); this.io.observe(c);
    if (reduce()) { this.playing = false; this.t = 130; this.draw(); } else this.raf = requestAnimationFrame((t) => this.loop(t));
  }
  resize() { const f = fit(this.c); this.dims = f; }
  get episode() { return this.d.episodes[this.ep]; }
  get frame() { return this.episode.frames[Math.min(this.t, this.episode.frames.length - 1)]; }
  destroy() { cancelAnimationFrame(this.raf); this.io?.disconnect(); this.ro?.disconnect(); this.onTick = undefined; }
  setEp(i: number) { this.ep = (i + this.d.episodes.length) % this.d.episodes.length; this.t = 0; this.draw(); }
  private loop(now: number) {
    this.raf = requestAnimationFrame((t) => this.loop(t));
    const dt = Math.min(60, now - this.last); this.last = now;
    if (!this.vis) return;
    if (this.playing) {
      this.acc += dt * this.speed;
      while (this.acc > 62) {
        this.acc -= 62; this.t++;
        if (this.t >= this.episode.frames.length) { this.t = 0; this.ep = (this.ep + 1) % this.d.episodes.length; }
      }
    }
    this.draw();
  }
  draw() {
    const { g, W, H } = this.dims; if (!g) return;
    const e = this.episode, f = this.frame, A = this.d.arena, M = Math.min(W, H), s = M / A, ox = (W - M) / 2, oy = (H - M) / 2;
    const X = (v: number) => ox + v * s, Y = (v: number) => oy + v * s;
    const [bl, bw] = this.d.boxSize;
    const boxes = [[f[6], f[7], f[8], f[9]], [f[10], f[11], f[12], f[13]]];
    const corners = boxes.map((b) => boxCorners(b[0], b[1], b[2], bl, bw));
    const S = [...e.walls, ...corners.flatMap(boxSegs)];
    const c = { h: cssv('--hider'), k: cssv('--seek'), b: cssv('--box'), w: cssv('--wall'), r: cssv('--ray') };
    g.clearRect(0, 0, W, H);
    const seen = !!f[14];
    const agents = [[f[0], f[1], f[2], c.h], [f[3], f[4], f[5], c.k]] as [number, number, number, string][];
    if (this.showCone) agents.forEach(([x, y, a, col], i) => {
      g.fillStyle = col; g.globalAlpha = i ? 0.15 : 0.07; g.beginPath(); g.moveTo(X(x), Y(y));
      const half = 1.178; for (let k = 0; k <= 56; k++) { const an = a - half + (2 * half * k) / 56, dd = cast(x, y, an, S); g.lineTo(X(x + Math.cos(an) * dd), Y(y + Math.sin(an) * dd)); }
      g.closePath(); g.fill(); g.globalAlpha = 1;
    });
    if (this.showRays) { g.strokeStyle = c.r; g.lineWidth = 1; agents.forEach(([x, y]) => { for (let k = 0; k < 16; k++) { const an = (k * Math.PI) / 8, dd = cast(x, y, an, S); g.beginPath(); g.moveTo(X(x), Y(y)); g.lineTo(X(x + Math.cos(an) * dd), Y(y + Math.sin(an) * dd)); g.stroke(); } }); }
    if (this.trail) [[0, c.h], [3, c.k]].forEach(([o, col]) => { g.strokeStyle = col as string; g.lineWidth = 1.5; g.globalAlpha = 0.35; g.beginPath(); for (let i = Math.max(0, this.t - 40); i <= this.t; i++) { const q = e.frames[i]; if (!q) break; const px = X(q[o as number]), py = Y(q[(o as number) + 1]); i === Math.max(0, this.t - 40) ? g.moveTo(px, py) : g.lineTo(px, py); } g.stroke(); g.globalAlpha = 1; });
    g.strokeStyle = c.w; g.lineCap = 'round'; g.lineWidth = Math.max(2.5, s * 0.2);
    e.walls.forEach((w) => { g.beginPath(); g.moveTo(X(w[0]), Y(w[1])); g.lineTo(X(w[2]), Y(w[3])); g.stroke(); });
    corners.forEach((p, i) => {
      g.fillStyle = c.b; g.strokeStyle = c.w; g.lineWidth = 1.5; g.beginPath();
      p.forEach((q, k) => (k ? g.lineTo(X(q[0]), Y(q[1])) : g.moveTo(X(q[0]), Y(q[1])))); g.closePath(); g.fill(); g.stroke();
      if (boxes[i][3]) { g.fillStyle = boxes[i][3] === 1 ? c.h : c.k; g.beginPath(); g.arc(X(boxes[i][0]), Y(boxes[i][1]), s * 0.13, 0, 7); g.fill(); }
    });
    if (seen) { g.strokeStyle = c.h; g.lineWidth = 2; g.beginPath(); g.moveTo(X(f[3]), Y(f[4])); g.lineTo(X(f[0]), Y(f[1])); g.stroke(); }
    agents.forEach(([x, y, a, col]) => { g.fillStyle = col; g.beginPath(); g.arc(X(x), Y(y), s * 0.5, 0, 7); g.fill(); g.strokeStyle = cssv('--panel'); g.lineWidth = 2; g.beginPath(); g.moveTo(X(x), Y(y)); g.lineTo(X(x + Math.cos(a) * 0.5), Y(y + Math.sin(a) * 0.5)); g.stroke(); });
    this.onTick?.(this);
  }
}

/* ---- Hunter-Gatherer: port of hunter_gatherer/env.py with default Config ---- */
export const ACTIONS = ['GO_CAMP', 'GO_FOREST', 'GO_PLAINS', 'FORAGE', 'HUNT_SMALL', 'HUNT_BIG', 'REST'];
export const PHASES = ['MORNING', 'NOON', 'AFTERNOON', 'EVENING', 'NIGHT', 'MIDNIGHT'];
export const LOCS = ['CAMP', 'FOREST', 'PLAINS'];
const CFG = { start: 6, maxE: 15, maxF: 4, perForage: 2, ePerFruit: 2, regrow: [0.1, 0.3, 0.5, 0.7, 0], smallP: 0.6, smallE: 3, bigP: 0.3, bigBonus: 0.15, bigE: 6, skillUp: 0.5, bigInj: 0.25, maxSkill: 2, cold: 1, pred: 0.3, heal: 0.3, days: 30, deathR: -10 };
export class HunterEnv {
  energy = 6; health = 0; phase = 0; loc = 0; fruit = 4; skill = 0; day = 0; dead = false; cause: string | null = null; events: string[] = []; done = false; ret = 0;
  reset() { Object.assign(this, { energy: CFG.start, health: 0, phase: 0, loc: 0, fruit: CFG.maxF, skill: 0, day: 0, dead: false, cause: null, events: [], done: false, ret: 0 }); return this; }
  private injure(c: string) { if (this.health === 0) { this.health = 1; this.events.push(`injured (${c})`); } else { this.dead = true; this.cause = c; this.events.push(`dead (${c})`); } }
  step(a: number) {
    if (this.done) return 0;
    const ch = (p: number) => Math.random() < p; this.events = [];
    const start = this.loc; let gain = 0, cost = 1;
    if (a <= 2) this.loc = a;
    else if (a === 3 && this.loc === 1) { const n = Math.min(this.fruit, CFG.perForage); this.fruit -= n; gain += n * CFG.ePerFruit; this.events.push(`${n} fruit gathered`); }
    else if (a === 4 && this.loc === 2) { if (ch(CFG.smallP)) { gain += CFG.smallE; this.events.push('small hunt succeeded'); } else this.events.push('small hunt failed'); }
    else if (a === 5 && this.loc === 2) {
      let p = CFG.bigP + CFG.bigBonus * this.skill; if (this.health === 1) p /= 2;
      if (ch(p)) { gain += CFG.bigE; this.events.push('big hunt succeeded'); if (this.skill < CFG.maxSkill && ch(CFG.skillUp)) { this.skill++; this.events.push('hunting skill improved'); } }
      else { this.events.push('big hunt failed'); if (ch(CFG.bigInj)) this.injure('big hunt'); }
    } else if (a === 6) {
      if (this.loc === 0 && this.phase >= 4) cost = 0;
      if (this.loc === 0 && this.health === 1 && ch(CFG.heal)) { this.health = 0; this.events.push('healed'); }
    } else this.events.push('invalid action');
    if (this.phase >= 4 && (start !== 0 || this.loc !== 0)) { cost += CFG.cold; this.events.push('outside at night: cold'); if (ch(CFG.pred)) this.injure('predator'); }
    this.energy = Math.max(Math.min(this.energy + gain, CFG.maxE) - cost, 0);
    if (this.energy === 0 && !this.dead) { this.dead = true; this.cause = 'hunger'; this.events.push('dead (hunger)'); }
    let completed = false;
    if (!this.dead) { if (this.phase === 5) { this.phase = 0; this.day++; completed = true; if (ch(CFG.regrow[this.fruit] ?? 0)) this.fruit = Math.min(this.fruit + 1, CFG.maxF); } else this.phase++; }
    const r = this.dead ? CFG.deathR : completed ? 1 : 0; this.ret += r;
    this.done = this.dead || this.day >= CFG.days; return r;
  }
}
/** The `careful` scripted policy from the course report. */
export function careful(e: HunterEnv) {
  if (e.phase >= 4) return e.loc === 0 ? 6 : 0;
  if (e.phase === 3) return e.loc === 0 ? 6 : 0;
  if (e.fruit > 0) return e.loc === 1 ? 3 : 1;
  return e.loc === 2 ? 4 : 2;
}

/** Draws the camp, forest and plains scene of the environment. */
const SAY: Record<string, string> = { 'big hunt succeeded': 'caught!', 'small hunt succeeded': 'caught!', 'big hunt failed': 'missed', 'small hunt failed': 'missed', healed: 'healed', 'hunting skill improved': 'skill up!', 'outside at night: cold': 'cold!' };
function tree(g: CanvasRenderingContext2D, x: number, y: number, s: number, c: string) {
  g.fillStyle = '#6b4a2f'; g.fillRect(x - s * 0.09, y - s * 0.1, s * 0.18, s * 0.5);
  g.fillStyle = c; [[0, -0.55, 0.42], [-0.28, -0.25, 0.32], [0.28, -0.25, 0.32]].forEach(([a, b, r]) => { g.beginPath(); g.arc(x + a * s, y + b * s, r * s, 0, 7); g.fill(); });
}
function animal(g: CanvasRenderingContext2D, x: number, y: number, s: number, deer: boolean, hop: number) {
  g.fillStyle = deer ? '#8a5a33' : '#b9a58c'; y -= Math.abs(Math.sin(hop)) * s * 0.12;
  g.beginPath(); g.ellipse(x, y, s * (deer ? 0.5 : 0.3), s * (deer ? 0.24 : 0.2), 0, 0, 7); g.fill();
  g.beginPath(); g.arc(x + s * (deer ? 0.5 : 0.3), y - s * (deer ? 0.28 : 0.16), s * (deer ? 0.15 : 0.13), 0, 7); g.fill();
  g.strokeStyle = g.fillStyle; g.lineWidth = Math.max(1.5, s * 0.08); g.lineCap = 'round'; g.beginPath();
  if (deer) { g.moveTo(x + s * 0.42, y - s * 0.1); g.lineTo(x + s * 0.5, y - s * 0.28); [-0.3, 0.3].forEach((d) => { g.moveTo(x + d * s, y + s * 0.15); g.lineTo(x + d * s, y + s * 0.52); }); g.moveTo(x + s * 0.5, y - s * 0.4); g.lineTo(x + s * 0.43, y - s * 0.62); g.moveTo(x + s * 0.56, y - s * 0.4); g.lineTo(x + s * 0.66, y - s * 0.62); }
  else { g.moveTo(x + s * 0.3, y - s * 0.26); g.lineTo(x + s * 0.27, y - s * 0.52); g.moveTo(x + s * 0.36, y - s * 0.26); g.lineTo(x + s * 0.4, y - s * 0.5); }
  g.stroke();
}
export function drawHunter(g: CanvasRenderingContext2D, W: number, H: number, e: HunterEnv, pos: { x: number; y: number }, t: number) {
  const M = Math.min(W, H), night = e.phase >= 4, dusk = e.phase === 3, split = H * 0.56;
  const P = [[0.5, 0.8], [0.25, 0.38], [0.72, 0.38]];
  g.clearRect(0, 0, W, H);
  g.fillStyle = '#7fa35c'; g.fillRect(0, 0, W / 2, split); g.fillStyle = '#c9c778'; g.fillRect(W / 2, 0, W / 2, split); g.fillStyle = '#c7ab7d'; g.fillRect(0, split, W, H - split);
  const s = M * 0.1;
  [[0.08, 0.17, 1], [0.27, 0.13, 1.1], [0.42, 0.2, 0.95], [0.11, 0.42, 1.05], [0.4, 0.45, 1.1]].forEach(([x, y, k], i) => {
    tree(g, x * W, y * H, s * k, i % 2 ? '#3f7a45' : '#4b8a4e');
    if (i < e.fruit) { g.fillStyle = '#d33b2f'; g.beginPath(); g.arc(x * W + s * 0.15 * k, y * H - s * 0.35 * k, s * 0.12, 0, 7); g.fill(); }
  });
  g.strokeStyle = 'rgba(90,100,40,.45)'; g.lineWidth = 1.2; for (let i = 0; i < 26; i++) { const x = W / 2 + ((i * 53) % 100) / 100 * W / 2, y = ((i * 37) % 100) / 100 * split * 0.92 + split * 0.05; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y - 7); g.moveTo(x, y); g.lineTo(x + 3, y - 7); g.stroke(); }
  animal(g, W * 0.87, split * 0.74, s * 1.05, true, t * 0.002); animal(g, W * 0.6, split * 0.8, s * 0.72, false, t * 0.006);
  // camp
  const cx = W * 0.36, cy = H * 0.82; g.fillStyle = '#b4553c'; g.beginPath(); g.moveTo(cx - s * 1.3, cy + s * 0.75); g.lineTo(cx, cy - s * 0.95); g.lineTo(cx + s * 1.3, cy + s * 0.75); g.closePath(); g.fill();
  g.fillStyle = '#5a2c22'; g.beginPath(); g.moveTo(cx - s * 0.36, cy + s * 0.75); g.lineTo(cx, cy - s * 0.1); g.lineTo(cx + s * 0.36, cy + s * 0.75); g.closePath(); g.fill();
  const fx = W * 0.66, fy = H * 0.86; g.strokeStyle = '#5f4128'; g.lineWidth = Math.max(3, s * 0.13); g.lineCap = 'round'; g.beginPath(); g.moveTo(fx - s * 0.5, fy + s * 0.25); g.lineTo(fx + s * 0.5, fy + s * 0.08); g.moveTo(fx + s * 0.5, fy + s * 0.25); g.lineTo(fx - s * 0.5, fy + s * 0.08); g.stroke();
  // sky light
  if (dusk || night) { g.fillStyle = night ? 'rgba(14,20,48,.66)' : 'rgba(180,90,40,.2)'; g.fillRect(0, 0, W, H); }
  if (night) {
    g.fillStyle = '#f5eeca'; g.beginPath(); g.arc(W * 0.9, H * 0.11, s * 0.42, 0, 7); g.fill(); g.fillStyle = 'rgba(14,20,48,.9)'; g.beginPath(); g.arc(W * 0.875, H * 0.1, s * 0.36, 0, 7); g.fill();
    g.fillStyle = '#fff'; for (let i = 0; i < 24; i++) { g.globalAlpha = 0.4 + 0.5 * Math.abs(Math.sin(t * 0.002 + i)); { const a = Math.sin(i * 12.9898) * 43758.5453, c = Math.sin(i * 78.233) * 12345.678; g.fillRect((a - Math.floor(a)) * W, (c - Math.floor(c)) * H * 0.46, 2, 2); } } g.globalAlpha = 1;
    const gr = g.createRadialGradient(fx, fy, 2, fx, fy, s * 3.4); gr.addColorStop(0, 'rgba(255,170,70,.6)'); gr.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const fl = s * (0.65 + 0.14 * Math.sin(t * 0.02)); g.fillStyle = '#f09a36'; g.beginPath(); g.moveTo(fx - s * 0.3, fy + s * 0.12); g.quadraticCurveTo(fx, fy - fl * 1.5, fx + s * 0.3, fy + s * 0.12); g.fill(); g.fillStyle = '#ffd86b'; g.beginPath(); g.moveTo(fx - s * 0.14, fy + s * 0.12); g.quadraticCurveTo(fx, fy - fl * 0.75, fx + s * 0.14, fy + s * 0.12); g.fill();
  }
  // agent
  const tx = P[e.loc][0], ty = P[e.loc][1]; pos.x += (tx - pos.x) * 0.1; pos.y += (ty - pos.y) * 0.1;
  const ax = pos.x * W, ay = pos.y * H, r = s * 0.34;
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(ax, ay + r * 2, r * 1.1, r * 0.35, 0, 0, 7); g.fill();
  g.fillStyle = e.dead ? '#777' : '#2c4a6e'; g.beginPath(); g.roundRect(ax - r * 0.7, ay - r * 0.1, r * 1.4, r * 2, r * 0.5); g.fill();
  g.fillStyle = e.dead ? '#999' : '#e4b58f'; g.beginPath(); g.arc(ax, ay - r * 0.65, r * 0.72, 0, 7); g.fill();
  if (e.health) { g.fillStyle = '#fff'; g.fillRect(ax - r * 0.72, ay - r * 1, r * 1.44, r * 0.32); g.fillStyle = '#d33b2f'; g.fillRect(ax - r * 0.1, ay - r * 1.0, r * 0.2, r * 0.32); }
  const say = e.dead ? 'dead' : e.events.map((x) => SAY[x] || (x.includes('fruit gathered') ? `+${x[0]} fruit` : x.startsWith('injured') ? 'injured!' : '')).find(Boolean);
  if (say) { g.font = `500 ${clamp(s * 0.36, 11, 15)}px "DM Mono",monospace`; g.textAlign = 'center'; const w = g.measureText(say).width + 14, by = ay - r * 3; g.fillStyle = '#fff'; g.beginPath(); g.roundRect(ax - w / 2, by - 14, w, 22, 5); g.fill(); g.fillStyle = '#222'; g.fillText(say, ax, by + 2); }
  // labels and energy
  g.font = `500 ${clamp(s * 0.32, 10, 13)}px "DM Mono",monospace`; g.textAlign = 'left'; g.fillStyle = night ? '#eee' : '#20241d';
  g.fillText('FOREST', 10, 18); g.fillText('PLAINS', W / 2 + 10, 18); g.fillText('CAMP', 10, split + 18);
  const bw = W * 0.36, bx = W - bw - 12, by2 = H - 22; g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(bx, by2, bw, 12); g.fillStyle = e.energy <= 3 ? '#e2553f' : '#f0c14a'; g.fillRect(bx, by2, (bw * e.energy) / 15, 12); g.fillStyle = night ? '#eee' : '#20241d'; g.textAlign = 'right'; g.fillText(`energy ${e.energy}`, bx - 8, by2 + 11);
}

/* ---- Recognition: the K / M update from the environment README, reduced to a live sketch ---- */
export class RecWorld {
  N = 10; A: { x: number; y: number; a: number; f: boolean }[] = []; K: number[][] = []; t = 0; R0 = 0.17; cap = 3;
  constructor() { this.reset(); }
  reset() { this.t = 0; const N = this.N; this.A = [...Array(N)].map((_, i) => ({ x: Math.random(), y: Math.random(), a: Math.random() * 6.28, f: i < 2 })); this.K = [...Array(N)].map((_, i) => [...Array(N)].map((_, j) => (j < 2 && i !== j ? 0.85 : 0))); }
  status() { return this.A.map((_, j) => this.K.reduce((s, r) => s + r[j], 0)); }
  metrics(): [string, string | number][] {
    const s = this.status(), n = s.length, mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0), f = s.filter((_, i) => this.A[i].f), o = s.filter((_, i) => !this.A[i].f), links = this.K.flat().filter((k) => k > 0.5).length;
    return [['Step', this.t], ['Status Gini', this.gini().toFixed(2)], ['Mean status', mean(s).toFixed(1)], ['Highest', Math.max(...s).toFixed(1)], ['Lowest', Math.min(...s).toFixed(1)], ['Born famous', mean(f).toFixed(1)], ['Others', mean(o).toFixed(1)], ['Strong links', `${links}/${n * (n - 1)}`]];
  }
  gini() { const s = [...this.status()].sort((a, b) => a - b), n = s.length, sum = s.reduce((a, b) => a + b, 0) || 1; return s.reduce((v, x, i) => v + (2 * i - n + 1) * x, 0) / (n * sum); }
  step() {
    const { A, K, N } = this; this.t++; const st = this.status(); let cx = 0, cy = 0; A.forEach((a) => { cx += a.x / N; cy += a.y / N; });
    A.forEach((a, i) => { const des = Math.atan2(0.5 + (cy - 0.5) * 0.5 - a.y, 0.5 + (cx - 0.5) * 0.5 - a.x) + Math.sin(this.t * 0.02 + i * 2) * 1.6; a.a += Math.atan2(Math.sin(des - a.a), Math.cos(des - a.a)) * 0.04; a.x = clamp(a.x + Math.cos(a.a) * 0.003, 0.04, 0.96); a.y = clamp(a.y + Math.sin(a.a) * 0.003, 0.04, 0.96); });
    for (let i = 0; i < N; i++) { const L = K[i].reduce((a, b) => a + b, 0); for (let j = 0; j < N; j++) { if (i === j) continue; const dx = A[j].x - A[i].x, dy = A[j].y - A[i].y, d = Math.hypot(dx, dy), R = Math.min(this.R0 + 0.05 * Math.log(1 + st[j]), 0.42), th = Math.atan2(dy, dx) - A[i].a, an = Math.atan2(Math.sin(th), Math.cos(th)); K[i][j] = Math.abs(an) < 0.785 && d < R ? K[i][j] + 0.03 * (1 - d / (R + 0.05)) * (1 - K[i][j]) : K[i][j] * (1 - 0.0018 * (1 + L / this.cap)); } }
    if (this.t > 1800) this.reset();
  }
  draw(g: CanvasRenderingContext2D, W: number, H: number) {
    const { A, K, N } = this, st = this.status(), M = Math.min(W, H); g.clearRect(0, 0, W, H);
    const wall = cssv('--wall'), seek = cssv('--seek'), box = cssv('--box'), hid = cssv('--hider');
    g.strokeStyle = wall; g.lineWidth = 1; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (K[i][j] > 0.08) { g.globalAlpha = K[i][j] * 0.34; g.beginPath(); g.moveTo(A[i].x * W, A[i].y * H); g.lineTo(A[j].x * W, A[j].y * H); g.stroke(); }
    A.forEach((a, i) => { g.globalAlpha = 0.1; g.fillStyle = seek; g.beginPath(); g.moveTo(a.x * W, a.y * H); g.arc(a.x * W, a.y * H, M * 0.16, a.a - 0.785, a.a + 0.785); g.fill(); g.globalAlpha = 1; g.fillStyle = a.f ? hid : box; g.beginPath(); g.arc(a.x * W, a.y * H, M * (0.012 + 0.0042 * st[i]), 0, 7); g.fill(); });
  }
}

/* ---- Logic grid: AC-3 steps from Appendix B of the Smart Zebra paper ---- */
export const ZEBRA = {
  rows: ['Name', 'Drink'], vals: [['Peter', 'Eric', 'Arnold'], ['tea', 'water', 'milk']],
  steps: [
    { say: 'Clue 1: Peter is in the second house.', rm: ['0-0-Peter', '2-0-Peter', '1-0-Eric', '1-0-Arnold'] },
    { say: 'Clue 3: water is directly left of milk, so water is in {1,2} and milk in {2,3}.', rm: ['2-1-water', '0-1-milk'] },
    { say: 'Clue 2: Arnold is directly left of water. Water in house 1 has no partner.', rm: ['0-1-water'] },
    { say: 'Forced: Arnold = 1, water = 2, milk = 3.', rm: ['1-1-tea', '1-1-milk', '2-1-tea', '0-0-Eric', '2-0-Arnold'] },
  ],
};
export function drawZebra(g: CanvasRenderingContext2D, W: number, H: number, gone: Set<string>) {
  g.clearRect(0, 0, W, H); const M = Math.min(W, H), pad = M * 0.05, top = M * 0.1, cw = (W - pad * 2) / 3, ch = (H - pad * 2 - top) / 2, fs = clamp(cw * 0.13, 11, 18);
  const wall = cssv('--wall'), fg = cssv('--fg'), mut = cssv('--mut'), seek = cssv('--seek'), hid = cssv('--hider');
  g.textAlign = 'center'; g.font = `500 ${clamp(M * 0.028, 11, 15)}px "DM Mono",monospace`; g.fillStyle = mut;
  for (let h = 0; h < 3; h++) g.fillText(`House ${h + 1}`, pad + cw * (h + 0.5), pad + top * 0.6);
  for (let a = 0; a < 2; a++) for (let h = 0; h < 3; h++) {
    const x = pad + h * cw, y = pad + top + a * ch, left = ZEBRA.vals[a].filter((v) => !gone.has(`${h}-${a}-${v}`)), one = left.length === 1;
    g.strokeStyle = wall; g.lineWidth = one ? 2 : 1; g.strokeRect(x + 4, y + 4, cw - 8, ch - 8);
    if (one) { g.fillStyle = seek; g.globalAlpha = 0.14; g.fillRect(x + 4, y + 4, cw - 8, ch - 8); g.globalAlpha = 1; }
    ZEBRA.vals[a].forEach((v, i) => {
      const off = gone.has(`${h}-${a}-${v}`), ty = y + ch / 2 + (i - 1) * fs * 1.7 + fs * 0.35;
      if (one && off) return; g.font = `${one ? 500 : 400} ${one ? fs * 1.35 : fs}px "DM Mono",monospace`; g.fillStyle = off ? mut : fg; g.globalAlpha = off ? 0.45 : 1;
      const yy = one ? y + ch / 2 + fs * 0.45 : ty; g.fillText(v, x + cw / 2, yy);
      if (off) { const w = g.measureText(v).width; g.strokeStyle = hid; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + cw / 2 - w / 2 - 3, ty - fs * 0.32); g.lineTo(x + cw / 2 + w / 2 + 3, ty - fs * 0.32); g.stroke(); } g.globalAlpha = 1;
    });
  }
}
