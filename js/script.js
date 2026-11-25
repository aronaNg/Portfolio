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

  function count(el) {
    var n = +el.dataset.n, s = el.dataset.s || '', t0 = null;
    var pre = s === '×' ? '×' : '', suf = s === '×' ? '' : s;
    if (reduce) { el.textContent = pre + n.toLocaleString('fr-FR') + suf; return; }
    (function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1400, 1), v = Math.round(n * (1 - Math.pow(1 - p, 3)));
      el.textContent = pre + v.toLocaleString('fr-FR') + suf;
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
})();
