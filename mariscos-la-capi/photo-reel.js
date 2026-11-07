(() => {
  const reel = document.querySelector('.photo-reel');
  const frames = [...reel.querySelectorAll('.reel-frame')];
  const controls = reel.querySelector('.reel-controls');
  const toggle = reel.querySelector('[data-reel-toggle]');
  const count = reel.querySelector('.reel-count');
  const title = reel.querySelector('.reel-title');
  const kicker = reel.querySelector('.reel-kicker');
  const announcement = reel.querySelector('.reel-announcement');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const interval = 4500;
  let index = 0;
  let timer;
  let visible = false;
  let paused = false;
  let hovered = false;

  function canAutoplay() {
    return visible && !document.hidden && !paused && !hovered &&
      !motion.matches && !root.classList.contains('motion-paused');
  }

  function schedule() {
    clearTimeout(timer);
    if (canAutoplay()) timer = setTimeout(() => advance(1), interval);
  }

  function updatePlayControl() {
    toggle.setAttribute('aria-label', paused ? 'Play photo reel' : 'Pause photo reel');
    toggle.firstElementChild.textContent = paused ? '▶' : 'Ⅱ';
    toggle.hidden = motion.matches || root.classList.contains('motion-paused');
    schedule();
  }

  function advance(step, manual = false) {
    const nextIndex = (index + step + frames.length) % frames.length;
    const incoming = frames[nextIndex];
    const photo = incoming.querySelector('img');
    if (!photo.complete || !photo.naturalWidth) {
      schedule();
      return;
    }
    reel.classList.remove('is-changing');
    reel.querySelector('.is-leaving')?.classList.remove('is-leaving');
    frames[index].classList.replace('is-current', 'is-leaving');
    frames[index].setAttribute('aria-hidden', 'true');
    incoming.classList.add('is-current');
    incoming.removeAttribute('aria-hidden');
    reel.classList.toggle('is-backward', step < 0);
    // Restart the slide animation even when an arrow is pressed mid-transition.
    void reel.offsetWidth;
    reel.classList.add('is-changing');
    index = nextIndex;
    title.textContent = incoming.dataset.title;
    kicker.textContent = incoming.dataset.kicker;
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`;
    if (manual) announcement.textContent = `${incoming.dataset.title}, photo ${index + 1} of ${frames.length}`;
    schedule();
  }

  controls.hidden = false;
  controls.querySelectorAll('[data-reel-step]').forEach(button => {
    button.addEventListener('click', () => advance(Number(button.dataset.reelStep), true));
  });
  toggle.addEventListener('click', () => {
    paused = !paused;
    updatePlayControl();
  });
  reel.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') {
      hovered = true;
      schedule();
    }
  });
  reel.addEventListener('pointerleave', () => {
    hovered = false;
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', updatePlayControl);
  new MutationObserver(updatePlayControl).observe(root, { attributes: true, attributeFilter: ['class'] });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }, { threshold: .25 }).observe(reel);
  } else {
    visible = true;
  }
  updatePlayControl();
})();
