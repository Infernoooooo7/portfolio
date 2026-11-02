(() => {
  'use strict';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const icon = (name) => `<svg class="i" aria-hidden="true"><use href="assets/icons.svg#${name}"/></svg>`;

  /* ---------- Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('.menu-btn');
  const nav = $('#site-nav');
  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
  }

  /* ---------- Particle network: tsParticles slim (MIT), lazy-loaded after first paint.
     Skipped for reduced-motion and data-saver users; CSS glows + grid still render. ---------- */
  const startParticles = () => {
    const host = $('#particles');
    if (!host || reduceMotion.matches || saveData) return;
    const s = document.createElement('script');
    s.src = 'vendor/tsparticles/tsparticles.slim.bundle.min.js';
    s.async = true;
    s.onload = async () => {
      try {
        const ts = window.tsParticles;
        if (typeof window.loadSlim === 'function') await window.loadSlim(ts);
        const small = window.matchMedia('(max-width: 700px)').matches;
        await ts.load({
          id: 'particles',
          options: {
            fullScreen: { enable: false },
            fpsLimit: 40,
            detectRetina: true,
            pauseOnBlur: true,
            pauseOnOutsideViewport: true,
            background: { color: 'transparent' },
            particles: {
              number: { value: small ? 22 : 44, density: { enable: true, width: 1000, height: 1000 } },
              color: { value: ['#3fd8e4', '#3fd8e4', '#e04fae'] },
              opacity: { value: { min: 0.12, max: 0.42 } },
              size: { value: { min: 1, max: 2 } },
              links: { enable: true, distance: 150, color: '#3fd8e4', opacity: 0.12, width: 1 },
              move: { enable: true, speed: 0.3, direction: 'none', random: true, straight: false, outModes: { default: 'out' } },
            },
            interactivity: {
              detectsOn: 'window',
              events: { onHover: { enable: finePointer.matches, mode: 'grab' }, resize: { enable: true } },
              modes: { grab: { distance: 160, links: { opacity: 0.28 } } },
            },
          },
        });
        host.classList.add('is-ready');
      } catch (err) {
        console.warn('Particle background unavailable:', err); // decorative; fail quietly
      }
    };
    document.head.appendChild(s);
  };
  const idle = window.requestIdleCallback ? (fn) => window.requestIdleCallback(fn, { timeout: 2500 }) : (fn) => setTimeout(fn, 800);
  if (document.readyState === 'complete') idle(startParticles);
  else window.addEventListener('load', () => idle(startParticles), { once: true });

  /* ---------- Scroll: progress bar, background dimming, mobile dock ---------- */
  const progress = $('#progress-bar');
  const dock = $('#dock');
  const hero = $('.hero');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress && max > 0) progress.parentElement.style.setProperty('--p', Math.min(1, scrollY / max).toFixed(4));
    const pastHero = hero ? scrollY > hero.offsetHeight * 0.6 : scrollY > 400;
    document.body.classList.toggle('is-scrolled', pastHero);
    if (dock) {
      dock.hidden = false;
      dock.classList.toggle('is-visible', pastHero);
    }
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Hero stack: pointer tilt + explode toggle ---------- */
  const stage = $('#stage');
  const stack = $('#stack');
  const explode = $('#explode');
  if (stage && stack) {
    let raf = 0;
    const apply = (rx, ry) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        stack.style.setProperty('--rx', rx.toFixed(2));
        stack.style.setProperty('--ry', ry.toFixed(2));
      });
    };
    if (!reduceMotion.matches) {
      stage.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const r = stage.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        stage.classList.add('is-active');
        apply(x * 14, -y * 9);
      });
      stage.addEventListener('pointerleave', () => { stage.classList.remove('is-active'); apply(0, 0); });
    }
    const setExploded = (on) => {
      stage.classList.toggle('is-exploded', on);
      if (explode) {
        explode.setAttribute('aria-pressed', String(on));
        explode.textContent = on ? 'Collapse layers' : 'Explode layers';
      }
    };
    if (explode) explode.addEventListener('click', () => setExploded(explode.getAttribute('aria-pressed') !== 'true'));
    const hint = $('.stage-hint');
    if (hint && !finePointer.matches) hint.textContent = 'My stack, as layers. Tap the button to pull them apart.';
    const hoverExplode = (on) => { if (explode && explode.getAttribute('aria-pressed') === 'false') stage.classList.toggle('is-exploded', on); };
    if (finePointer.matches && !reduceMotion.matches) {
      stage.addEventListener('pointerenter', () => hoverExplode(true));
      stage.addEventListener('pointerleave', () => hoverExplode(false));
    }
  }

  /* ---------- Card tilt + glare: vanilla-tilt.js (MIT); desktop pointers only ---------- */
  if (window.VanillaTilt && !reduceMotion.matches && finePointer.matches) {
    window.VanillaTilt.init($$('[data-tilt-card]'), { max: 3, speed: 500, perspective: 1300, scale: 1.008, glare: true, 'max-glare': 0.08 });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Active nav link ---------- */
  const links = $$('.nav a[href^="#"]');
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.removeAttribute('aria-current'));
        const a = map.get(en.target.id);
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Copy email ---------- */
  const copyBtn = $('#copy-mail');
  const copyStatus = $('#copy-status');
  const copyEmail = async () => {
    const email = copyBtn ? copyBtn.dataset.email : 'pavanmp256@gmail.com';
    let ok = false;
    try { await navigator.clipboard.writeText(email); ok = true; }
    catch (_) {
      const t = document.createElement('textarea');
      t.value = email; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { ok = document.execCommand('copy'); } catch (__) { ok = false; }
      t.remove();
    }
    if (copyBtn) {
      const label = $('span', copyBtn);
      const original = label.dataset.orig || (label.dataset.orig = label.textContent);
      label.textContent = ok ? 'Copied ✓' : 'Copy failed — select it manually';
      setTimeout(() => { label.textContent = original; }, 2200);
    }
    if (copyStatus) copyStatus.textContent = ok ? 'Email address copied to clipboard' : 'Could not copy the email address';
    return ok;
  };
  if (copyBtn) copyBtn.addEventListener('click', copyEmail);

  /* ---------- Project write-up dialog ---------- */
  const caseDlg = $('#case-dialog');
  const cards = $$('[data-case]');
  let current = 0;

  const kindOf = (card) => ($('.card-kind', card) || {}).textContent || '';
  const indexOf = (card) => ($('.card-index', card) || {}).textContent || '';
  const fillCase = (i) => {
    current = (i + cards.length) % cards.length;
    const card = cards[current];
    $('#case-kicker').textContent = `${indexOf(card)} · ${kindOf(card)}`;
    $('#case-title').textContent = $('.card-title', card).textContent;
    const body = $('#case-body');
    body.textContent = '';
    const sum = $('.card-sum', card);
    if (sum) body.appendChild(sum.cloneNode(true));
    const flow = $('.flow', card);
    if (flow) body.appendChild(flow.cloneNode(true));
    const tags = $('.tags', card);
    if (tags) body.appendChild(tags.cloneNode(true));
    const detail = $('.case', card);
    if (detail) {
      const pts = $('.points', detail);
      if (pts) body.appendChild(pts.cloneNode(true));
      const note = $('.case-note', detail);
      if (note) body.appendChild(note.cloneNode(true));
    }
    const lnk = $$('.card-foot a.link', card);
    if (lnk.length) {
      const wrap = document.createElement('div');
      wrap.className = 'dlg-links';
      lnk.forEach((a) => wrap.appendChild(a.cloneNode(true)));
      body.appendChild(wrap);
    } else {
      const none = document.createElement('p');
      none.className = 'case-note';
      none.textContent = 'No public repository or demo link is listed for this project.';
      body.appendChild(none);
    }
    $('#case-count').textContent = `${current + 1} / ${cards.length}`;
    $('.dlg-panel', caseDlg).scrollTop = 0;
  };
  const openCase = (i) => {
    if (!caseDlg || typeof caseDlg.showModal !== 'function') return;
    fillCase(i);
    if (!caseDlg.open) caseDlg.showModal();
  };
  if (caseDlg && typeof caseDlg.showModal === 'function') {
    cards.forEach((card, i) => {
      const btn = $('.card-open', card);
      if (btn) {
        btn.hidden = false;
        btn.setAttribute('aria-haspopup', 'dialog');
        btn.setAttribute('aria-label', 'Read details: ' + $('.card-title', card).textContent.trim());
        btn.addEventListener('click', () => openCase(i));
      }
      // Whole card is clickable (mouse); links inside still work, and text selection isn't hijacked.
      card.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        if (String(window.getSelection && window.getSelection()).length) return;
        openCase(i);
      });
    });
    $('#case-close').addEventListener('click', () => caseDlg.close());
    $('#case-prev').addEventListener('click', () => fillCase(current - 1));
    $('#case-next').addEventListener('click', () => fillCase(current + 1));
    caseDlg.addEventListener('click', (e) => { if (e.target === caseDlg) caseDlg.close(); });
    caseDlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); fillCase(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); fillCase(current + 1); }
    });
  } else {
    // No <dialog> support: keep the write-ups inline.
    document.documentElement.classList.remove('js');
    document.documentElement.classList.add('js-lite');
  }

  /* ---------- Quick-jump palette (Ctrl/⌘ + K) ---------- */
  const pal = $('#palette');
  const palQ = $('#pal-q');
  const palList = $('#pal-list');
  const palBtn = $('#open-palette');
  if (pal && typeof pal.showModal === 'function') {
    const goto = (id) => () => { location.hash = '#' + id; };
    const ext = (url) => () => window.open(url, '_blank', 'noopener');
    const items = [
      { label: 'Projects', group: 'Section', icon: 'arrow-right', run: goto('projects') },
      { label: 'Skills', group: 'Section', icon: 'arrow-right', run: goto('skills') },
      { label: 'Competitions & certifications', group: 'Section', icon: 'arrow-right', run: goto('journey') },
      { label: 'Education', group: 'Section', icon: 'arrow-right', run: goto('education') },
      { label: 'Contact', group: 'Section', icon: 'arrow-right', run: goto('contact') },
      ...cards.map((card, i) => ({ label: $('.card-title', card).textContent, group: 'Project', icon: 'command', run: () => openCase(i) })),
      { label: 'Open GitHub profile', group: 'Link', icon: 'brand-github', run: ext('https://github.com/Infernoooooo7') },
      { label: 'Open LinkedIn profile', group: 'Link', icon: 'brand-linkedin', run: ext('https://www.linkedin.com/in/pavan-mp-5a2bbb378') },
      { label: 'Send an email', group: 'Action', icon: 'mail', run: () => { location.href = 'mailto:pavanmp256@gmail.com?subject=Hello%20Pavan'; } },
      { label: 'Copy email address', group: 'Action', icon: 'copy', run: copyEmail },
      { label: 'Download résumé (PDF)', group: 'Action', icon: 'download', run: () => { const a = document.createElement('a'); a.href = 'assets/Pavan_MP_Resume.pdf'; a.download = 'Pavan_MP_Resume.pdf'; document.body.appendChild(a); a.click(); a.remove(); } },
    ];
    let shown = [];
    let sel = 0;
    const render = () => {
      const q = palQ.value.trim().toLowerCase();
      shown = items.filter((it) => !q || (it.label + ' ' + it.group).toLowerCase().includes(q));
      sel = Math.min(sel, Math.max(shown.length - 1, 0));
      palList.textContent = '';
      if (!shown.length) {
        const li = document.createElement('li');
        li.className = 'pal-empty'; li.setAttribute('role', 'presentation'); li.textContent = 'No matches';
        palList.appendChild(li);
        palQ.removeAttribute('aria-activedescendant');
        return;
      }
      shown.forEach((it, i) => {
        const li = document.createElement('li');
        li.className = 'pal-item'; li.id = 'pal-' + i; li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', String(i === sel));
        li.innerHTML = `${icon(it.icon)}<span></span><small></small>`;
        $('span', li).textContent = it.label;
        $('small', li).textContent = it.group;
        li.addEventListener('mousemove', () => { if (sel !== i) { sel = i; mark(); } });
        li.addEventListener('click', () => choose(i));
        palList.appendChild(li);
      });
      palQ.setAttribute('aria-activedescendant', 'pal-' + sel);
    };
    const mark = () => {
      $$('.pal-item', palList).forEach((el, i) => el.setAttribute('aria-selected', String(i === sel)));
      palQ.setAttribute('aria-activedescendant', 'pal-' + sel);
      const el = $('#pal-' + sel, palList); if (el) el.scrollIntoView({ block: 'nearest' });
    };
    const choose = (i) => {
      const it = shown[i];
      if (!it) return;
      pal.close();
      setTimeout(it.run, 30);
    };
    const openPalette = () => { if (pal.open) return; palQ.value = ''; sel = 0; render(); pal.showModal(); palQ.focus(); };
    palQ.addEventListener('input', () => { sel = 0; render(); });
    palQ.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (shown.length) { sel = (sel + 1) % shown.length; mark(); } }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (shown.length) { sel = (sel - 1 + shown.length) % shown.length; mark(); } }
      else if (e.key === 'Enter') { e.preventDefault(); choose(sel); }
    });
    pal.addEventListener('click', (e) => { if (e.target === pal) pal.close(); });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (caseDlg && caseDlg.open) caseDlg.close();
        pal.open ? pal.close() : openPalette();
      }
    });
    if (palBtn) {
      if (finePointer.matches) { palBtn.hidden = false; if (/Mac|iPhone|iPad/.test(navigator.platform)) $('kbd', palBtn).textContent = '⌘ K'; }
      palBtn.addEventListener('click', openPalette);
    }
  }

  /* ---------- Cards that link to #case-… anchors (hero pill) ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#case-"]');
    if (!a) return;
    const card = document.getElementById(a.getAttribute('href').slice(1));
    if (card) { e.preventDefault(); card.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' }); }
  });
})();
