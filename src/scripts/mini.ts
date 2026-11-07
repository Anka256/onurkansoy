import { player } from './player';

// The small now-playing control in the header. The header persists between pages.
const mini = document.getElementById('mini') as HTMLButtonElement;
const song = mini.querySelector<HTMLElement>('.mt')!, who = mini.querySelector<HTMLElement>('.ma')!;
const paint = () => {
  const { s, T } = player, k = T[s.cur];
  mini.hidden = !s.started; mini.classList.toggle('on', s.playing);
  song.textContent = k.t; who.textContent = k.a;
  mini.setAttribute('aria-label', `${s.playing ? 'Pause' : 'Play'} ${k.t} by ${k.a}`);
};
mini.addEventListener('click', () => player.toggle());
player.subscribe(paint); paint();
