(function () {
  'use strict';
  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* ---------- header: shrink + mega menu ---------- */
  var hd = $('#hd');
  var toTop = $('.to-top');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (hd) hd.classList.toggle('is-scrolled', y > 40);
    if (toTop) toTop.classList.toggle('is-on', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  if (hd) {
    var gnbItems = $$('.gnb > ul > li', hd);
    var cols = $$('.mega-col', hd);
    var closeT;
    var setHot = function (i) {
      gnbItems.forEach(function (li, k) { li.classList.toggle('is-hot', k === i); });
      cols.forEach(function (c, k) { c.classList.toggle('is-hot', k === i); });
    };
    var open = function (i) { clearTimeout(closeT); hd.classList.add('mega-open'); if (typeof i === 'number') setHot(i); };
    var close = function () { closeT = setTimeout(function () { hd.classList.remove('mega-open'); setHot(-1); }, 140); };
    gnbItems.forEach(function (li, i) {
      li.addEventListener('mouseenter', function () { open(i); });
      li.addEventListener('focusin', function () { open(i); });
    });
    cols.forEach(function (c, i) { c.addEventListener('mouseenter', function () { open(i); }); });
    var mega = $('.mega', hd);
    if (mega) mega.addEventListener('mouseenter', function () { open(); });
    hd.addEventListener('mouseleave', close);
    hd.addEventListener('focusout', function (e) { if (!hd.contains(e.relatedTarget)) close(); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hd.classList.contains('mega-open')) { hd.classList.remove('mega-open'); setHot(-1); } });
  }

  /* ---------- mobile nav ---------- */
  var burger = $('.burger');
  var mnav = $('#mnav');
  if (burger && mnav) {
    var mclose = $('.mnav-close', mnav);
    var setNav = function (on) {
      mnav.classList.toggle('is-open', on);
      burger.setAttribute('aria-expanded', on ? 'true' : 'false');
      mnav.setAttribute('aria-hidden', on ? 'false' : 'true');
      doc.body.style.overflow = on ? 'hidden' : '';
      if (on) setTimeout(function () { mclose.focus(); }, 50); else burger.focus();
    };
    burger.addEventListener('click', function () { setNav(true); });
    mclose.addEventListener('click', function () { setNav(false); });
    $$('a[href^="#"], a[href$=".html"]', mnav).forEach(function (a) { a.addEventListener('click', function () { if (mnav.classList.contains('is-open')) { mnav.classList.remove('is-open'); doc.body.style.overflow = ''; burger.setAttribute('aria-expanded', 'false'); } }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mnav.classList.contains('is-open')) setNav(false); });
  }

  /* ---------- scroll reveal (staggered) ---------- */
  $$('[data-stagger]').forEach(function (g) {
    var step = parseFloat(g.getAttribute('data-stagger')) || 0.08;
    $$('[data-reveal]', g).forEach(function (el, i) { el.style.setProperty('--d', (i * step).toFixed(2) + 's'); });
  });
  var revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- hero mosaic ---------- */
  var hero = $('.hero');
  if (hero) {
    var tiles = $$('.tile', hero);
    var pool = (hero.getAttribute('data-pool') || '').split(',').filter(Boolean);
    var base = hero.getAttribute('data-base') || '';
    var shown = function () {
      return tiles.map(function (t) { return t.getAttribute('data-photo'); });
    };
    tiles.forEach(function (t, i) {
      var img = $('img', t);
      img.style.setProperty('--ox', (20 + Math.random() * 60).toFixed(0) + '%');
      img.style.setProperty('--oy', (20 + Math.random() * 60).toFixed(0) + '%');
      img.style.setProperty('--kb', (18 + Math.random() * 10).toFixed(1) + 's');
      img.style.setProperty('--kbd', (-Math.random() * 20).toFixed(1) + 's');
      t.style.setProperty('--td', (0.05 * i + Math.random() * 0.2).toFixed(2) + 's');
    });
    var paused = false;
    var lastTile = -1;
    var visibleTiles = function () {
      var hr = hero.getBoundingClientRect();
      return tiles.filter(function (t) {
        if (t.offsetParent === null) return false;
        var r = t.getBoundingClientRect();
        return r.bottom > hr.top + 20 && r.top < hr.bottom - 20 && r.right > hr.left && r.left < hr.right;
      });
    };
    var swap = function () {
      if (paused || doc.hidden) return;
      var vis = visibleTiles();
      if (!vis.length) return;
      var t;
      for (var n = 0; n < 6; n++) { t = vis[Math.floor(Math.random() * vis.length)]; if (tiles.indexOf(t) !== lastTile) break; }
      lastTile = tiles.indexOf(t);
      var cur = shown();
      var cand = pool.filter(function (p) { return cur.indexOf(p) === -1; });
      if (!cand.length) return;
      var name = cand[Math.floor(Math.random() * cand.length)];
      var old = $('img', t);
      var nx = new Image();
      nx.alt = '';
      nx.decoding = 'async';
      nx.className = 'next';
      nx.style.setProperty('--ox', (20 + Math.random() * 60).toFixed(0) + '%');
      nx.style.setProperty('--oy', (20 + Math.random() * 60).toFixed(0) + '%');
      nx.style.setProperty('--kb', (18 + Math.random() * 10).toFixed(1) + 's');
      nx.onload = function () {
        t.setAttribute('data-photo', name);
        t.appendChild(nx);
        requestAnimationFrame(function () { requestAnimationFrame(function () { nx.classList.add('in'); }); });
        setTimeout(function () {
          if (old && old.parentNode) old.parentNode.removeChild(old);
          nx.classList.remove('next', 'in');
        }, 1800);
      };
      nx.src = base + name + '.webp';
    };
    var timer = setInterval(swap, 2600);

    var pauseBtn = $('.hero-pause', hero);
    if (pauseBtn) pauseBtn.addEventListener('click', function () {
      paused = !paused;
      hero.classList.toggle('is-paused', paused);
      pauseBtn.setAttribute('aria-label', paused ? '사진 움직임 다시 재생' : '사진 움직임 멈춤');
      pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    });

    // parallax depth layers on mouse move
    var colsEl = $$('.m-col', hero);
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, active = false;
    var tick = function () {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      colsEl.forEach(function (c) {
        var d = parseFloat(c.getAttribute('data-depth')) || 1;
        c.style.transform = 'translate3d(' + (cx * d * 16).toFixed(2) + 'px,' + (cy * d * 12).toFixed(2) + 'px,0)';
      });
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) raf = requestAnimationFrame(tick); else { raf = 0; }
    };
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * -2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * -2;
        if (!raf) raf = requestAnimationFrame(tick);
      });
      hero.addEventListener('mouseleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); });
    }
  }

  /* ---------- tabs (before/after) ---------- */
  $$('[data-tabs]').forEach(function (root) {
    var tabs = $$('[role="tab"]', root);
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var p = doc.getElementById(t.getAttribute('aria-controls'));
        if (!p) return;
        if (on) { p.hidden = false; p.classList.remove('is-in'); void p.offsetWidth; p.classList.add('is-in'); }
        else p.hidden = true;
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = -1;
        if (k === 'ArrowRight') n = (i + 1) % tabs.length;
        else if (k === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        else if (k === 'Home') n = 0;
        else if (k === 'End') n = tabs.length - 1;
        if (n > -1) { e.preventDefault(); select(tabs[n], true); }
      });
    });
  });

  /* ---------- gallery: filter + masonry + FLIP ---------- */
  var grid = $('.g-grid');
  if (grid) {
    var items = $$('.g-item', grid);
    var filter = 'all';
    var countEl = $('.g-count');
    var colCount = function () {
      var w = grid.clientWidth;
      return w >= 1000 ? 4 : w >= 640 ? 3 : 2;
    };
    var layout = function (animate) {
      var n = colCount();
      var gap = window.innerWidth < 768 ? 8 : 14;
      var W = grid.clientWidth;
      var cw = (W - gap * (n - 1)) / n;
      var hs = []; for (var i = 0; i < n; i++) hs.push(0);
      var visible = 0;
      items.forEach(function (it) {
        var on = filter === 'all' || it.getAttribute('data-cat') === filter;
        var img = $('img', it);
        var ratio = (parseFloat(img.getAttribute('height')) || 4) / (parseFloat(img.getAttribute('width')) || 3);
        ratio = Math.min(Math.max(ratio, 0.62), 1.32);
        var h = Math.round(cw * ratio);
        if (on) {
          var c = 0; for (var k = 1; k < n; k++) if (hs[k] < hs[c] - 1) c = k;
          var x = c * (cw + gap), y = hs[c];
          hs[c] += h + gap;
          var wasOut = it.classList.contains('is-out') || !it.style.width;
          it.style.width = cw + 'px';
          it.style.height = h + 'px';
          if (wasOut || !animate) {
            it.classList.add('no-tr');
            it.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(.94)';
            void it.offsetWidth;
            it.classList.remove('no-tr', 'is-gone');
            it.classList.remove('is-out');
          }
          it.style.transform = 'translate(' + x + 'px,' + y + 'px)';
          it.querySelector('.g-btn').tabIndex = 0;
          visible++;
        } else {
          if (!it.classList.contains('is-out')) {
            it.classList.add('is-out');
            var cur = it.style.transform.replace(/ scale\([^)]*\)/, '');
            it.style.transform = cur + ' scale(.94)';
            setTimeout(function () { if (it.classList.contains('is-out')) it.classList.add('is-gone'); }, 460);
          }
          it.querySelector('.g-btn').tabIndex = -1;
        }
      });
      grid.style.height = Math.max(0, Math.max.apply(null, hs) - gap) + 'px';
      if (countEl) countEl.textContent = '사진 ' + visible + '장';
    };
    layout(false);
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { layout(false); }, 120); });
    var gtabs = $$('.g-tabs [role="tab"]');
    var gsel = function (b, focus) {
      gtabs.forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); x.tabIndex = x === b ? 0 : -1; });
      filter = b.getAttribute('data-filter');
      layout(true);
      if (focus) b.focus();
    };
    gtabs.forEach(function (b, i) {
      b.addEventListener('click', function () { gsel(b); });
      b.addEventListener('keydown', function (e) {
        var n = -1;
        if (e.key === 'ArrowRight') n = (i + 1) % gtabs.length;
        else if (e.key === 'ArrowLeft') n = (i - 1 + gtabs.length) % gtabs.length;
        if (n > -1) { e.preventDefault(); gsel(gtabs[n], true); }
      });
    });

    // lightbox
    var lb = $('#lb');
    if (lb && typeof lb.showModal === 'function') {
      var lbImg = $('img', lb), lbCap = $('figcaption', lb), idx = 0;
      var list = function () { return items.filter(function (it) { return !it.classList.contains('is-out'); }); };
      var show = function (i) {
        var l = list(); if (!l.length) return;
        idx = (i + l.length) % l.length;
        var it = l[idx], im = $('img', it);
        lbImg.classList.remove('swap'); void lbImg.offsetWidth; lbImg.classList.add('swap');
        lbImg.src = im.getAttribute('src');
        lbImg.alt = im.alt;
        lbCap.textContent = it.getAttribute('data-caption') + '  (' + (idx + 1) + ' / ' + l.length + ')';
      };
      items.forEach(function (it) {
        $('.g-btn', it).addEventListener('click', function () {
          show(list().indexOf(it));
          lb.showModal();
          doc.body.style.overflow = 'hidden';
        });
      });
      $('.lb-close', lb).addEventListener('click', function () { lb.close(); });
      $('.lb-prev', lb).addEventListener('click', function () { show(idx - 1); });
      $('.lb-next', lb).addEventListener('click', function () { show(idx + 1); });
      lb.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
      });
      lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
      lb.addEventListener('close', function () { doc.body.style.overflow = ''; });
    }
  }

  /* ---------- sub tabs scrollspy ---------- */
  var subLinks = $$('.subtabs a[href^="#"]');
  if (subLinks.length && 'IntersectionObserver' in window) {
    var secs = subLinks.map(function (a) { return doc.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
    var setOn = function (id) {
      subLinks.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-on', on);
        if (on) {
          a.setAttribute('aria-current', 'true');
          var ul = a.closest('ul');
          if (ul && ul.scrollWidth > ul.clientWidth) ul.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
        } else a.removeAttribute('aria-current');
      });
    };
    var spy = new IntersectionObserver(function (ens) {
      ens.forEach(function (en) { if (en.isIntersecting) setOn(en.target.id); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    secs.forEach(function (s) { spy.observe(s); });
    setOn(secs[0] && secs[0].id);
  }

  /* ---------- video: keep poster if file missing ---------- */
  $$('video').forEach(function (v) {
    v.addEventListener('error', function () { v.style.display = 'none'; }, true);
    var src = $('source', v);
    if (src) src.addEventListener('error', function () { v.style.display = 'none'; });
    var p = v.play && v.play();
    if (p && p.catch) p.catch(function () {});
  });
})();
