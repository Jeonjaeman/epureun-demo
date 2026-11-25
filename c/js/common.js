/* 이푸른티에스 C안 공통: Lenis, 메뉴, 글자 분할, 스크롤 등장 */
(function () {
  var root = document.documentElement;
  var EP = (window.EP = window.EP || {});
  EP.ready = true;

  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('js');
    initMenu(null);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* Lenis smooth scroll */
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  EP.lenis = lenis;
  EP.scrollTo = function (y) {
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  initMenu(lenis);

  /* 글자 분할: 단어는 줄바꿈 단위로 묶고, 글자마다 span */
  EP.split = function (el) {
    if (el._chars) return el._chars;
    var text = el.textContent;
    el.setAttribute('aria-label', text.replace(/\s+/g, ' ').trim());
    var chars = [];
    var walk = function (node, out) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/);
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { out.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.className = 'w';
            w.setAttribute('aria-hidden', 'true');
            Array.from(p).forEach(function (ch) {
              var c = document.createElement('span');
              c.className = 'c';
              c.textContent = ch;
              w.appendChild(c);
              chars.push(c);
            });
            out.appendChild(w);
          });
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          var clone = n.cloneNode(false);
          walk(n, clone);
          clone.setAttribute('aria-hidden', 'true');
          out.appendChild(clone);
        } else if (n.nodeType === 1) {
          out.appendChild(n.cloneNode(false));
        }
      });
    };
    var frag = document.createDocumentFragment();
    walk(el, frag);
    el.textContent = '';
    el.appendChild(frag);
    el._chars = chars;
    return chars;
  };
  EP.charsIn = function (el, opt) {
    var chars = EP.split(el);
    opt = opt || {};
    return gsap.fromTo(chars, { yPercent: 110, opacity: 0 }, {
      yPercent: 0, opacity: 1, duration: opt.duration || 0.9, ease: opt.ease || 'power3.out',
      stagger: opt.stagger != null ? opt.stagger : 0.025, delay: opt.delay || 0, paused: !!opt.paused
    });
  };

  /* 스크롤 등장 */
  function initReveals() {
    gsap.utils.toArray('[data-split="auto"]').forEach(function (el) {
      var chars = EP.split(el);
      gsap.set(chars, { yPercent: 110, opacity: 0 });
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: function () {
          gsap.to(chars, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.022 });
        }
      });
    });
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });
    gsap.utils.toArray('[data-stagger]').forEach(function (wrap) {
      var kids = wrap.children;
      gsap.fromTo(kids, { y: 36, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: wrap, start: 'top 88%', once: true }
      });
    });
    gsap.utils.toArray('[data-parallax]').forEach(function (el) {
      var amt = parseFloat(el.getAttribute('data-parallax')) || 12;
      gsap.fromTo(el, { yPercent: -amt / 2 }, {
        yPercent: amt / 2, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }
  EP.initReveals = initReveals;

  /* 화면 밖 영상은 멈춤 */
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { rootMargin: '200px' });
    document.querySelectorAll('video[autoplay]').forEach(function (v) { vio.observe(v); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.body.hasAttribute('data-home')) {
      initReveals();
      var h1 = document.querySelector('.ph-head h1');
      if (h1) EP.charsIn(h1, { delay: 0.15, stagger: 0.03 });
    }
  });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  function initMenu(lenis) {
    var btn = document.querySelector('.hd-menu');
    var menu = document.getElementById('menu');
    if (!btn || !menu) return;
    var label = btn.querySelector('.lbl');
    var set = function (open) {
      root.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (label) label.textContent = open ? 'Close' : 'Menu';
      if (lenis) { open ? lenis.stop() : lenis.start(); }
      if (open) menu.scrollTop = 0;
    };
    btn.addEventListener('click', function () { set(!root.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }
})();
