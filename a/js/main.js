/* 이푸른티에스 데모 A */
(function () {
  'use strict';
  var d = document, h = d.documentElement, body = d.body;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var desktop = window.matchMedia('(min-width:1024px) and (min-height:620px)');
  var finePointer = window.matchMedia('(hover:hover) and (pointer:fine)');

  /* ---------- intro gate ---------- */
  var gate = $('#gate');
  var gateOn = h.classList.contains('gate-on');
  function endGate(skip) {
    if (!gate || !gateOn) return;
    gateOn = false;
    if (skip) gate.classList.add('is-skip');
    try { sessionStorage.setItem('ept-a-gate', '1'); } catch (e) {}
    setTimeout(function () { h.classList.remove('gate-on'); }, skip ? 500 : 50);
    revealHero();
  }
  if (gate && gateOn) {
    $('#gateSkip').addEventListener('click', function () { endGate(true); });
    setTimeout(function () { endGate(false); }, 2450);
  }

  /* ---------- header + sitemap ---------- */
  var hdr = $('#hdr');
  var sitemap = $('#sitemap'), menuBtn = $('#menuBtn'), menuClose = $('#menuClose');
  function setMenu(open) {
    sitemap.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    h.style.overflow = open ? 'hidden' : '';
    if (open) menuClose.focus(); else menuBtn.focus();
  }
  if (sitemap) {
    menuBtn.addEventListener('click', function () { setMenu(true); });
    menuClose.addEventListener('click', function () { setMenu(false); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sitemap.classList.contains('is-open')) setMenu(false);
    });
  }
  // mark current page in sitemap / footer
  var page = h.getAttribute('data-page');
  var curHref = page === 'about' ? 'about.html' : page === 'service' ? 'service.html' : null;
  if (curHref) {
    $$('a[href="' + curHref + '"]').forEach(function (a) {
      if (a.classList.contains('t')) {
        a.classList.add('is-cur');
        a.setAttribute('aria-current', 'page');
        var s = d.createElement('small'); s.textContent = '현재 페이지'; a.appendChild(s);
      }
      if (a.parentNode.classList.contains('ftr-nav')) { a.classList.add('is-cur'); a.setAttribute('aria-current', 'page'); }
    });
  }

  /* ---------- reveal ---------- */
  var heroEls = $$('[data-hero]');
  function revealHero() { heroEls.forEach(function (el) { el.classList.add('in'); }); }
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      if (el.hasAttribute('data-hero') && gateOn) return; // wait for the gate
      el.classList.add('in');
      revealIO.unobserve(el);
    });
  }, { threshold: 0.2 });
  $$('.rv, .fu').forEach(function (el) { revealIO.observe(el); });
  if (!gateOn) setTimeout(revealHero, 120);

  /* ---------- videos ---------- */
  $$('.media video').forEach(function (v) {
    function ok() { v.classList.add('ready'); }
    if (v.readyState >= 2) ok();
    v.addEventListener('loadeddata', ok);
    v.pause();
  });

  /* ---------- sections: active state, indicator, header theme ---------- */
  var secs = $$('.sec');
  var ind = $('#ind');
  var btns = [];
  if (ind && secs.length) {
    secs.forEach(function (s, i) {
      var b = d.createElement('button');
      b.type = 'button';
      b.innerHTML = '<span class="lb">' + s.getAttribute('data-label') + '</span><span class="no">' + (i < 9 ? '0' : '') + (i + 1) + '</span><span class="dot"></span>';
      b.setAttribute('aria-label', (i + 1) + '번째 섹션 ' + s.getAttribute('data-label') + '로 이동');
      b.addEventListener('click', function () { s.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
      ind.appendChild(b);
      btns.push(b);
    });
  }
  var current = null;
  function activate(s) {
    if (current === s) return;
    current = s;
    var i = secs.indexOf(s);
    btns.forEach(function (b, j) { b.classList.toggle('is-on', i === j); });
    var light = s.getAttribute('data-theme') === 'light';
    if (hdr && !hdr.classList.contains('is-solid')) hdr.classList.toggle('is-light', light);
    if (ind) { ind.classList.toggle('is-light', light); ind.classList.toggle('is-hide', s.id === 's-field' || s.id === 's-svc'); }
    secs.forEach(function (o) {
      var v = $('.media video', o);
      if (!v) return;
      if (o === s) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else v.pause();
    });
    prin.setActive(s.id === 's-prin');
  }
  if (secs.length) {
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) activate(en.target); });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    secs.forEach(function (s) { secIO.observe(s); });
  }

  /* sub pages: header turns solid after hero */
  var subHero = $('.sub-hero');
  if (subHero && hdr) {
    var onScroll = function () {
      hdr.classList.toggle('is-solid', window.scrollY > subHero.offsetHeight - 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- services panels ---------- */
  var panels = $$('.panel');
  function setPanel(p) {
    panels.forEach(function (o) {
      var on = o === p;
      o.classList.toggle('is-active', on);
      $('.p-tt', o).setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  }
  panels.forEach(function (p) {
    p.addEventListener('mouseenter', function () { if (desktop.matches) setPanel(p); });
    p.addEventListener('focusin', function () { if (desktop.matches) setPanel(p); });
    $('.p-tt', p).addEventListener('click', function () {
      if (desktop.matches) { setPanel(p); return; }
      var open = !p.classList.contains('is-open');
      p.classList.toggle('is-open', open);
      this.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  function syncPanels() {
    if (!panels.length) return;
    if (desktop.matches) {
      panels.forEach(function (p) { p.classList.remove('is-open'); });
      if (!$('.panel.is-active')) setPanel(panels[0]);
      else setPanel($('.panel.is-active'));
    } else {
      panels.forEach(function (p, i) {
        p.classList.toggle('is-open', i === 0);
        $('.p-tt', p).setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
      });
    }
  }
  syncPanels();
  if (desktop.addEventListener) desktop.addEventListener('change', syncPanels);

  /* ---------- field strip: drag, arrows, keys ---------- */
  var strip = $('#strip');
  if (strip) {
    var shots = $$('.shot', strip);
    var count = $('#fieldCount');
    var pad = function () { return parseFloat(getComputedStyle(strip).paddingLeft) || 0; };
    var idx = function () {
      var x = strip.scrollLeft + pad() + 4, n = 0;
      shots.forEach(function (s, i) { if (s.offsetLeft <= x) n = i; });
      if (strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4) n = shots.length - 1;
      return n;
    };
    var updCount = function () {
      var n = idx() + 1;
      if (count) count.textContent = (n < 10 ? '0' : '') + n + ' / ' + (shots.length < 10 ? '0' : '') + shots.length;
    };
    var go = function (dir) {
      var n = Math.max(0, Math.min(shots.length - 1, idx() + dir));
      strip.scrollTo({ left: shots[n].offsetLeft - pad(), behavior: 'smooth' });
    };
    $('#fieldPrev').addEventListener('click', function () { go(-1); });
    $('#fieldNext').addEventListener('click', function () { go(1); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    strip.addEventListener('scroll', updCount, { passive: true });
    // mouse drag with inertia
    var down = false, moved = 0, startX = 0, startL = 0, lastX = 0, lastT = 0, vel = 0, raf = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = 0; startX = lastX = e.clientX; startL = strip.scrollLeft; lastT = performance.now(); vel = 0;
      cancelAnimationFrame(raf);
      strip.setPointerCapture(e.pointerId);
    });
    strip.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) strip.classList.add('is-drag');
      strip.scrollLeft = startL - dx;
      var t = performance.now();
      vel = (e.clientX - lastX) / Math.max(1, t - lastT);
      lastX = e.clientX; lastT = t;
    });
    var up = function () {
      if (!down) return;
      down = false;
      strip.classList.remove('is-drag');
      var v = vel * 16;
      (function glide() {
        if (Math.abs(v) < 0.4) return;
        strip.scrollLeft -= v;
        v *= 0.93;
        raf = requestAnimationFrame(glide);
      })();
    };
    strip.addEventListener('pointerup', up);
    strip.addEventListener('pointercancel', up);
    // vertical wheel over the strip moves it sideways until an edge is reached
    strip.addEventListener('wheel', function (e) {
      if (!desktop.matches || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      var max = strip.scrollWidth - strip.clientWidth;
      if ((e.deltaY > 0 && strip.scrollLeft < max - 2) || (e.deltaY < 0 && strip.scrollLeft > 2)) {
        e.preventDefault();
        strip.scrollLeft += e.deltaY;
      }
    }, { passive: false });
    updCount();
  }

  /* ---------- principles ---------- */
  var prin = (function () {
    var tabs = $$('.p-tab'), slides = $$('.p-slide');
    var i = 0, timer = 0, active = false, DUR = 7000;
    if (!tabs.length) return { setActive: function () {} };
    function show(n, restart) {
      i = (n + tabs.length) % tabs.length;
      tabs.forEach(function (t, j) {
        t.classList.remove('is-on');
        t.setAttribute('aria-selected', j === i ? 'true' : 'false');
      });
      void tabs[i].offsetWidth; // restart progress animation
      tabs[i].classList.add('is-on');
      slides.forEach(function (s, j) { s.classList.toggle('is-on', j === i); });
      if (restart !== false) schedule();
    }
    function schedule() {
      clearTimeout(timer);
      if (active) timer = setTimeout(function () { show(i + 1); }, DUR);
    }
    tabs.forEach(function (t, j) { t.addEventListener('click', function () { show(j); }); });
    tabs[0].parentNode.style.setProperty('--dur', DUR + 'ms');
    $$('.p-tab').forEach(function (t) { t.style.setProperty('--dur', DUR + 'ms'); });
    return {
      setActive: function (on) {
        if (on === active) return;
        active = on;
        tabs.forEach(function (t) { t.classList.toggle('paused', !on); });
        if (on) show(i); else clearTimeout(timer);
      }
    };
  })();
  // sub pages have no section observer: nothing else to do
  if (!secs.length) prin.setActive(false);

  /* ---------- custom cursor ---------- */
  if (finePointer.matches) {
    var cur = d.createElement('div');
    cur.className = 'cursor';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<span>DRAG</span>';
    body.appendChild(cur);
    var tx = -100, ty = -100, cx = -100, cy = -100;
    d.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!cur.classList.contains('is-on')) { cx = tx; cy = ty; cur.classList.add('is-on'); }
    }, { passive: true });
    d.addEventListener('mouseleave', function () { cur.classList.remove('is-on'); });
    d.addEventListener('mouseover', function (e) {
      var t = e.target;
      var drag = t.closest && t.closest('[data-cursor="drag"]');
      var hot = t.closest && t.closest('a[href], button, [role="tab"]');
      cur.classList.toggle('is-drag', !!drag && !hot);
      cur.classList.toggle('is-hover', !!hot);
    });
    (function loop() {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }
})();
