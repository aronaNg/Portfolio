(function () {
  var $ = function (s, r) { return (r || document).querySelectorAll(s); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // menu mobile
  var links = $('#links')[0], burger = $('#burger')[0];
  burger.addEventListener('click', function () { links.classList.toggle('open'); });
  $('#links a').forEach(function (a) { a.addEventListener('click', function () { links.classList.remove('open'); }); });

  // barre de progression, bouton retour, halo qui suit la souris
  var bar = $('.progress')[0], top = $('.top')[0], glow = $('.glow')[0];
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
    top.style.display = h.scrollTop > 600 ? 'grid' : 'none';
  }, { passive: true });
  window.addEventListener('mousemove', function (e) {
    glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px';
  });

  // apparition au scroll et compteurs
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      $('[data-n]', en.target).forEach(count);
      io.unobserve(en.target);
    });
  }, { threshold: .15 });
  $('.reveal').forEach(function (el) { io.observe(el); });

  function label(el, v) {
    var s = el.dataset.s || '', n = v.toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR');
    if (s === '×') return '×' + n;
    return n + (s === ' ans' && lang === 'en' ? ' yrs' : s);
  }
  function count(el) {
    var n = +el.dataset.n, t0 = null;
    el.dataset.on = 1;
    if (reduce) { el.textContent = label(el, n); return; }
    (function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1400, 1);
      el.textContent = label(el, Math.round(n * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  // machine à écrire
  var ty = $('.type')[0], words = JSON.parse(ty.dataset.words), w = 0, c = 0, del = false;
  (function tick() {
    var word = words[w];
    ty.textContent = '> ' + word.slice(0, c);
    if (reduce) { ty.textContent = '> ' + word; return; }
    if (!del && c === word.length) { del = true; return setTimeout(tick, 1600); }
    if (del && c === 0) { del = false; w = (w + 1) % words.length; }
    c += del ? -1 : 1;
    setTimeout(tick, del ? 25 : 60);
  })();

  // filtres de projets
  $('.filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      $('.filters button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      $('.card').forEach(function (card) {
        card.classList.toggle('hide', b.dataset.f !== 'all' && card.dataset.c !== b.dataset.f);
      });
    });
  });

  // effets de survol : lumière sur les cartes, inclinaison 3D
  $('.tilt').forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      el.style.setProperty('--mx', x + 'px'); el.style.setProperty('--my', y + 'px');
      if (reduce) return;
      el.style.transform = 'perspective(900px) rotateX(' + ((y / r.height - .5) * -6) + 'deg) rotateY(' + ((x / r.width - .5) * 6) + 'deg)';
    });
    el.addEventListener('mouseleave', function () { el.style.transform = ''; });
  });

  // langue FR/EN : le français est lu dans la page, seul l'anglais est listé ici
  var lang = 'fr', EN = [];
  var WORDS_EN = ['ERP migration in industry', 'Secure REST APIs', 'GitLab CI/CD', 'Redundant network infrastructure'];
  var DOC = { title: document.title, desc: $('meta[name=description]')[0].content };
  function add(sel, html) { EN.push([sel, html]); }
  function tl(n, time, h3, org, lis) {
    var b = '.timeline .tl:nth-child(' + n + ') ';
    add(b + 'time', time); add(b + 'h3', h3); add(b + '.org', org);
    add(b + 'ul', '<li>' + lis.join('</li><li>') + '</li>');
  }
  function card(n, badge, h3, p, more) {
    var b = '.grid .card:nth-child(' + n + ') ';
    if (badge) add(b + '.badge', badge);
    add(b + 'h3', h3); add(b + 'p', p);
    if (more) add(b + '.more', more + ' <i class="fas fa-external-link-alt"></i>');
  }
  function edu(n, h3, p) {
    var b = '.edu>div:nth-child(' + n + ') ';
    add(b + 'h3', h3); if (p) add(b + 'p', p);
  }
  function h4(n, icon, t) { add('.stack>div:nth-child(' + n + ') h4', '<i class="fas fa-' + icon + '"></i> ' + t); }

  add('#links a[href="#parcours"]', 'Career'); add('#links a[href="#projets"]', 'Projects');
  add('#links a[href="#formation"]', 'Education'); add('.pill', 'Contact me');
  add('.tag', '<span class="dot"></span> Available for a permanent position (CDI), open to relocating in France');
  add('.hero h1', 'I build software <span class="grad">that holds up in production.</span>');
  add('.lt', 'Arona NGOM, computer engineering graduate from UTBM. Full-stack developer (Laravel and React) specialized in Networks and Cybersecurity.');
  add('.cta .btn.primary', 'View my projects <i class="fas fa-arrow-right"></i>');
  add('.cta .btn:not(.primary)', 'Download my CV <i class="fas fa-download"></i>');
  add('.term pre', '<span class="k">const</span> arona = {\n  <span class="p">role</span>: <span class="s">"Full-Stack Engineer"</span>,\n  <span class="p">degree</span>: <span class="s">"UTBM 2026"</span>,\n  <span class="p">stack</span>: [<span class="s">"Laravel"</span>, <span class="s">"React"</span>, <span class="s">"Docker"</span>],\n  <span class="p">specialty</span>: <span class="s">"Networks &amp; Cybersecurity"</span>,\n  <span class="p">ai</span>: [<span class="s">"Cursor"</span>, <span class="s">"Claude"</span>],\n  <span class="p">base</span>: <span class="s">"Belfort, France"</span>,\n  <span class="p">openTo</span>: <span class="s">"Permanent role"</span>,\n};');
  ['of experience in an industrial environment', 'ERP modules in production', 'average response-time gain on the Tri page', 'customers managed by the KEEPSO ERP'].forEach(function (t, i) {
    add('#impact .stats div:nth-child(' + (i + 1) + ') span', t);
  });

  add('#parcours h2', '<small>01 / Career</small>Professional <span class="grad">experience</span>');
  tl(1, 'Sept. 2023 – Aug. 2026', 'Full-Stack Developer (Work-study)', 'Tri Qualité Service (TQS) · Haute-Savoie, Besançon and Italy', [
    'Autonomous design and modernization of <b>KEEPSO</b>, an internal ERP / MES / CRM (50 employees, 6,000 customers): migration from PHP/MySQL to Laravel, React, Redux and Docker.',
    'Two-way synchronization of the old and new databases so both versions coexist, with no blocking incident.',
    'Secure REST APIs (Sanctum), PHPUnit and Playwright E2E tests, GitLab CI/CD pipeline (staging then production), Gitflow.',
    'Co-design workshops with business users, weekly steering committee with management, IT security awareness sessions for colleagues.']);
  tl(2, 'May – Sept. 2023', 'Full-Stack Developer (Internship)', 'SAD Marketing · Lille', [
    'Improvement of PredictOps, a tool predicting firefighter interventions: responsive redesign, map views, history and statistics pages, Quasar forms, MongoDB authentication, Python scripts.']);
  tl(3, 'July – Oct. 2022', 'Web Developer (Freelance)', 'MSHE / ELLIAD · Besançon', [
    'Creation of the professors\' website <a href="https://cooperer.univ-fcomte.fr" target="_blank" rel="noopener">cooperer.univ-fcomte.fr</a> (WordPress, PHP, Elementor) and training of the professors to manage it.']);

  add('#projets h2', '<small>02 / Work</small>Selected <span class="grad">projects</span>');
  add('.filters [data-f="all"]', 'All'); add('.filters [data-f="pro"]', 'Industrial');
  add('.filters [data-f="net"]', 'Networks'); add('.filters [data-f="ia"]', 'AI');
  card(1, 'Work-study · 2023-2026', 'KEEPSO, overhaul of an industrial ERP', 'Full migration of a legacy ERP / MES / CRM to a modern architecture, with 8 modules delivered (sales, sorting, accounting, management, maintenance, purchasing, HR, settings), aggregated SQL queries, stored procedures and caching.', 'Tri module metrics');
  card(2, 'UTBM · Oct. 2025 – Jan. 2026', 'ISP-style network infrastructure', 'Team simulation in GNS3 of a secure, redundant internet service provider: ring topology, no single point of failure (HSRP, CARP/pfsync, LACP, Keepalived), defense in depth with IPS/IDS, DNS, web and mail services, Prometheus/Grafana monitoring, PPPoE sessions on MikroTik and OpenWrt.');
  card(3, 0, 'DiaBot, chatbot for diabetes patients', 'Conversational assistant answering frequently asked questions, with treatment tracking, meal planning and health goals, while respecting privacy.');
  card(4, 0, 'Interactive Green IT quiz', 'Quiz app that lets users explore future scenarios based on their digital choices, along with a presentation on digital sobriety and low-tech.');
  add('.grid .card:nth-child(4) .tags i:nth-child(3)', 'Eco-design');
  card(5, 0, 'PredictOps', 'Tool predicting firefighter interventions: map views, statistics and intervention request forms.');
  card(6, 0, 'MSHE and ELLIAD website', 'Showcase site that the professors can manage themselves after training.', 'View the site');
  add('#projets .also', 'Also: <b>Laravel</b> real-estate management · <b>React</b> Rick and Morty app · <b>Ionic</b> concert app · <b>Symfony</b> e-commerce · <b>Android</b> quiz · <b>Java</b> Snake game');

  add('#stack h2', '<small>03 / Skills</small>My <span class="grad">stack</span>');
  h4(3, 'database', 'Data'); h4(4, 'rocket', 'DevOps &amp; testing');
  h4(5, 'shield-alt', 'Networking &amp; security'); h4(6, 'robot', 'AI &amp; prototyping');
  add('.stack>div:nth-child(5) p i:nth-child(2)', 'Routing');

  add('#formation h2', '<small>04 / Education</small>Academic <span class="grad">background</span>');
  edu(1, 'Engineering degree in Computer Science', 'UTBM, Belfort. General computer science track, then specialization in Networks and Cybersecurity in the 3rd year (local and wide area networks, systems and network security, cloud infrastructure and virtualization).');
  edu(2, 'Professional Bachelor\'s (TEPROW)', 'Web and Mobile Project Technologies, IUT Nord Franche-Comté. Honours (mention Assez Bien).');
  edu(3, 'DUT in Computer Science');
  edu(4, 'Scientific baccalaureate', 'Al Zahraa, Dakar. Honours (mention Assez Bien).');
  add('#formation .also', 'Languages: French (native), English (B2, Linguaskill) · Interests: AI and development watch, cybersecurity, cloud, football, documentaries · Driver\'s license (B)');

  add('#contact h2', '<small>05 / Contact</small>Let\'s build something <span class="grad">ambitious.</span>');
  add('.contact>p:not(.meta)', 'I am looking for a permanent full-stack developer position, open to relocating anywhere in France.');
  add('footer', '© 2026 Arona NGOM · Designed and hand-coded');

  function setLang(l) {
    lang = l;
    EN.forEach(function (e) {
      $(e[0]).forEach(function (el) {
        if (el.dataset.fr === undefined) el.dataset.fr = el.innerHTML;
        el.innerHTML = l === 'en' ? e[1] : el.dataset.fr;
      });
    });
    document.documentElement.lang = l;
    document.title = l === 'en' ? 'Arona NGOM | Full-Stack Engineer' : DOC.title;
    $('meta[name=description]')[0].content = l === 'en'
      ? 'Portfolio of Arona NGOM, computer engineer (UTBM), full-stack developer (Laravel, React) specialized in networks and cybersecurity.'
      : DOC.desc;
    words = l === 'en' ? WORDS_EN : JSON.parse(ty.dataset.words);
    w = 0; c = 0; del = false;
    if (reduce) ty.textContent = '> ' + words[0];
    $('[data-on]').forEach(function (el) { el.textContent = label(el, +el.dataset.n); });
    $('#lang button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.l === l);
      b.setAttribute('aria-pressed', b.dataset.l === l);
    });
    try { localStorage.setItem('lang', l); } catch (e) {}
  }
  $('#lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.l); });
  });
  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  var start = saved || (/^fr/i.test(navigator.language) ? 'fr' : 'en');
  if (start === 'en') setLang('en');
})();
