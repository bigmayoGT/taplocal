(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('#motion-toggle');
  let paused = reduced.matches;
  const applyMotion = () => {
    document.documentElement.classList.toggle('motion-paused', paused);
    toggle.textContent = paused ? 'Play motion' : 'Pause motion';
    toggle.setAttribute('aria-pressed', String(paused));
  };
  applyMotion();
  toggle.addEventListener('click', () => { paused = !paused; applyMotion(); });
  reduced.addEventListener('change', e => { paused = e.matches; applyMotion(); });
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    document.querySelectorAll('.signatures > .pad, .menu-heading, .visit .loc, .ask').forEach(el => {
      el.classList.add('reveal-ready'); observer.observe(el);
    });
  }
  const rail = document.querySelector('.rail');
  const moveGallery = direction => rail.scrollBy({ left: direction * (rail.querySelector('.card').getBoundingClientRect().width + 24), behavior: reduced.matches || paused ? 'instant' : 'smooth' });
  document.querySelector('#gallery-prev').addEventListener('click', () => moveGallery(-1));
  document.querySelector('#gallery-next').addEventListener('click', () => moveGallery(1));
  const features = [ ['m-charolas', 'Charola La Capi'], null, ['m-cocteles', 'La Capi'], ['m-ostiones', 'Ostiones Preparados'], ['m-charolas', 'Charola La Capi'] ];
  document.querySelectorAll('[data-feature]').forEach(button => button.addEventListener('click', () => {
    const feature = features[Number(button.dataset.feature)];
    if (!feature) { document.querySelector('#m-bebidas').scrollIntoView({ behavior: reduced.matches || paused ? 'instant' : 'smooth' }); return; }
    const dish = [...document.querySelectorAll('#' + feature[0] + ' .mi')].find(li => li.dataset.name === feature[1]);
    dish?.querySelector('.mi-open').click();
    // Featured-card focus returns to its original control when the sheet closes.
    document.querySelector('#dish').addEventListener('close', () => button.focus(), { once: true });
  }));
  const input = document.querySelector('#menu-search');
  const status = document.querySelector('#search-status');
  const empty = document.querySelector('#search-empty');
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const sections = [...document.querySelectorAll('.msec')];
  const filter = () => {
    const query = normalize(input.value.trim());
    let count = 0;
    sections.forEach(section => {
      let visible = 0;
      section.querySelectorAll('.mi').forEach(item => {
        item.hidden = !normalize([item.dataset.name, item.dataset.sec, item.dataset.desc, item.textContent].join(' ')).includes(query);
        if (!item.hidden) { visible++; count++; }
      });
      section.hidden = visible === 0;
      const chip = document.querySelector('.chips a[href="#' + section.id + '"]');
      if (chip) chip.hidden = section.hidden;
    });
    empty.hidden = count !== 0;
    status.textContent = query ? `${count} ${count === 1 ? 'dish' : 'dishes'} found` : 'Explore the full menu';
  };
  input.addEventListener('input', filter);
  // Keep restaurant status accurate if a visitor leaves the page open.
  setInterval(() => {
    if (!window.__statusAt) return;
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone:'America/Phoenix', weekday:'short',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(new Date()).map(p => [p.type,p.value]));
    const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(parts.weekday);
    const state = window.__statusAt(day, Number(parts.hour) * 60 + Number(parts.minute));
    const badge = document.querySelector('#status');
    badge.classList.toggle('open',state.open); badge.querySelector('span').textContent = (badge.dataset.prefix || '') + state.text;
  }, 60000);
})();
