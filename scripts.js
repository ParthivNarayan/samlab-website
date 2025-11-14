// SAM Lab — dynamic site scripts

document.addEventListener('DOMContentLoaded', () => {
  /* ====== Header interactions ====== */
  const header = document.querySelector('.site-header') || document.querySelector('header');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('show');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Close when clicking a link (mobile)
    navLinks.querySelectorAll('a[href]').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('show');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Sticky header shadow
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY || 0;
    if (header) {
      if (y > 8 && lastY <= 8) header.style.boxShadow = '0 6px 20px rgba(0,0,0,.08)';
      if (y <= 8 && lastY > 8) header.style.boxShadow = 'none';
    }
    if (backToTopButton) backToTopButton.style.display = y > 200 ? 'block' : 'none';
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Smooth scroll for on-page anchors
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0);
          window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
          history.pushState(null, '', id);
        }
      }
    });
  });

  // Active link highlight
  const path = location.pathname.split('/').pop() || 'index.html';
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if ((path === 'index.html' && href.endsWith('index.html')) || href.endsWith(path)) {
        a.classList.add('active');
      }
    });
  }

  // External link safety
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    if (!a.hasAttribute('rel')) a.setAttribute('rel', 'noopener noreferrer');
  });

  // Back to top button
  const backToTopButton = document.createElement('button');
  backToTopButton.textContent = '↑';
  backToTopButton.id = 'back-to-top';
  Object.assign(backToTopButton.style, {
    position: 'fixed', bottom: '20px', right: '20px', display: 'none',
    background: 'var(--accent)', color: '#fff', border: 'none',
    padding: '10px 15px', cursor: 'pointer', borderRadius: '999px',
    boxShadow: '0 6px 18px rgba(0,0,0,.15)'
  });
  backToTopButton.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(backToTopButton);
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });

  onScroll();

  /* ====== Home: render Research Focus cards ====== */
  const dataScript = document.getElementById('samlab-data');
  const focusGrid = document.getElementById('focusGrid');
  if (dataScript && focusGrid) {
    try {
      const data = JSON.parse(dataScript.textContent.trim());
      (data.focus || []).forEach(item => {
        const el = document.createElement('div');
        el.className = 'card';
        el.innerHTML = `
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
        `;
        focusGrid.appendChild(el);
      });
    } catch(e){ console.warn('Focus data error', e); }
  }

  /* ====== About: render Highlights ====== */
  const aboutScript = document.getElementById('about-data');
  const aboutGrid = document.getElementById('aboutHighlights');
  if (aboutScript && aboutGrid) {
    try {
      const data = JSON.parse(aboutScript.textContent.trim());
      (data.highlights || []).forEach(h => {
        const el = document.createElement('div');
        el.className = 'card';
        el.innerHTML = `<h3>${h.title}</h3><p>${h.desc}</p>`;
        aboutGrid.appendChild(el);
      });
    } catch(e){ console.warn('About data error', e); }
  }

  /* ====== Team: render members with search/filter ====== */
  const teamScript = document.getElementById('team-data');
  const teamGrid = document.getElementById('teamGrid');
  const teamSearch = document.getElementById('teamSearch');
  const teamFilter = document.getElementById('teamFilter');

  function renderTeam(members) {
    teamGrid.innerHTML = '';
    members.forEach(m => {
      const card = document.createElement('div');
      card.className = 'team-card';
      card.innerHTML = `
        <img loading="lazy" src="${m.img}" alt="${m.name}">
        <div class="meta">
          <div class="name">${m.name}</div>
          <div class="role">${m.role}</div>
          <div class="bio">${m.bio}</div>
          <div class="email"><a href="mailto:${m.email}">${m.email}</a></div>
        </div>
      `;
      teamGrid.appendChild(card);
    });
  }

  if (teamScript && teamGrid) {
    let members = [];
    try {
      const data = JSON.parse(teamScript.textContent.trim());
      members = data.members || [];
      renderTeam(members);
    } catch(e){ console.warn('Team data error', e); }

    const doFilter = () => {
      const q = (teamSearch?.value || '').toLowerCase().trim();
      const role = teamFilter?.value || 'all';
      const filtered = members.filter(m => {
        const matchesRole = role === 'all' ? true : m.role === role;
        const text = (m.name + ' ' + m.role + ' ' + m.bio).toLowerCase();
        const matchesQuery = q ? text.includes(q) : true;
        return matchesRole && matchesQuery;
      });
      renderTeam(filtered);
    };

    teamSearch?.addEventListener('input', doFilter);
    teamFilter?.addEventListener('change', doFilter);
  }

  /* ====== Publications: render Top Cited + search ====== */
  const pubScript = document.getElementById('pub-data');
  const pubList = document.getElementById('pubList');
  const pubSearch = document.getElementById('pubSearch');

  function renderPubs(items) {
    pubList.innerHTML = '';
    items.forEach((p, i) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="pub-num">${i+1}.</div>
        <div class="pub-item">
          <div><a href="${p.link}" target="_blank" rel="noopener">${p.title}</a> (${p.year})</div>
          <div class="muted">${p.venue} · <strong>${p.note}</strong></div>
        </div>
      `;
      pubList.appendChild(li);
    });
  }

  if (pubScript && pubList) {
    let pubs = [];
    try {
      const data = JSON.parse(pubScript.textContent.trim());
      pubs = data.top || [];
      renderPubs(pubs);
    } catch(e){ console.warn('Pub data error', e); }

    pubSearch?.addEventListener('input', () => {
      const q = (pubSearch.value || '').toLowerCase().trim();
      const filtered = pubs.filter(p =>
        (p.title + ' ' + p.venue + ' ' + p.year).toLowerCase().includes(q)
      );
      renderPubs(filtered);
    });
  }
});
