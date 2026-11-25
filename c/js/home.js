/* 이푸른티에스 C안 메인: 사진 터널, 커지는 카드, 프레임 스크럽, 원형 전환, 서비스 챕터 */
(function () {
  if (!window.gsap || !window.ScrollTrigger || !window.EP) return;
  var EP = window.EP;
  var root = document.documentElement;
  var isMobile = window.matchMedia('(max-width: 768px)').matches;
  var vh = function () { return window.innerHeight; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var P = '../assets/photos/';

  /* =========================================================
     1. 사진 터널
     ========================================================= */
  var TUN = [
    ['glass-lobby-1', 1058, 1347], ['factory-1', 1058, 1347], ['sculpture-1', 1058, 1347], ['warehouse-2', 1058, 1347],
    ['glass-dome-1', 1058, 1347], ['exwall-1', 1400, 1002], ['wax-3', 1058, 1347], ['factory-4', 1058, 1347],
    ['glass-4', 1058, 1347], ['school-0', 1008, 721], ['aircon-6', 563, 955], ['sculpture-3', 1050, 1337],
    ['glass-5', 1440, 1031], ['office-gov', 1058, 1347], ['exglass-2', 1058, 1347], ['factory-3', 1440, 774],
    ['glass-dome-2', 1058, 1347], ['interior-1', 1440, 1031], ['subway-1', 1050, 1337], ['trash-after', 1000, 716],
    ['glass-high', 1050, 1337], ['completion', 1387, 952], ['wax-1', 1050, 1337], ['exwall-2', 1058, 1347],
    ['police', 1400, 1002], ['sculpture-4', 1058, 1347], ['steam', 1600, 860], ['building-1', 1058, 1347]
  ];
  var hero = document.getElementById('hero');
  var heroState = { p: 0 };
  var heroH = hero.querySelector('.hero-h');
  var heroEnd = hero.querySelector('.hero-end');
  heroEnd.innerHTML = '맡은 공간마다, <em>같은 정성</em>으로';

  EP.charsIn(heroH, { delay: 0.25, stagger: 0.05, duration: 1.1 });
  gsap.from(hero.querySelectorAll('.hero-cap, .hero-sub'), { opacity: 0, y: 20, duration: 1, delay: 0.7, stagger: 0.15, ease: 'power3.out' });

  var heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: hero, start: 'top top',
      end: function () { return '+=' + vh() * (isMobile ? 1.6 : 3); },
      pin: true, scrub: true, anticipatePin: 1,
      onUpdate: function (s) { heroState.p = s.progress; }
    }
  });
  heroTl.to(hero.querySelector('.hero-ov'), { opacity: 0, scale: 1.12, duration: 0.24, ease: 'power1.in' }, 0)
    .to(hero.querySelector('.hero-scroll'), { opacity: 0, duration: 0.06 }, 0)
    .to(hero.querySelector('.hero-note'), { opacity: 1, duration: 0.08 }, 0.28)
    .to(hero.querySelector('.hero-note'), { opacity: 0, duration: 0.08 }, 0.66)
    .fromTo(heroEnd, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.12 }, 0.8)
    .to(hero.querySelector('.hero-prog i'), { scaleX: 1, ease: 'none', duration: 1 }, 0);

  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', function (e) {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  var heroVisible = true;
  var onHeroVis = [];
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      heroVisible = es[0].isIntersecting;
      onHeroVis.forEach(function (f) { f(heroVisible); });
    }).observe(hero);
  }

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  if (!isMobile && hasWebGL()) {
    import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js')
      .then(function (THREE) { initTunnelGL(THREE); })
      .catch(function () { initTunnelCSS(20); });
  } else {
    initTunnelCSS(isMobile ? 12 : 20);
  }

  function initTunnelGL(THREE) {
    var canvas = document.createElement('canvas');
    canvas.className = 'hero-gl';
    canvas.setAttribute('aria-hidden', 'true');
    hero.insertBefore(canvas, hero.firstChild);
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
    } catch (e) { canvas.remove(); initTunnelCSS(20); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x0b0c0d, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b0c0d, 3, 30);
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 90);

    var HALF = 2.7, STEP = 2.35, Z0 = -1.5;
    var planes = [];
    var rnd = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(7);
    TUN.forEach(function (d, i) {
      var ar = d[1] / d[2];
      var h = ar >= 1 ? 2.05 / ar * 1.15 : 2.35;
      var w = ar >= 1 ? 2.05 * 1.15 : h * ar;
      var geo = new THREE.PlaneGeometry(w, h);
      var mat = new THREE.MeshBasicMaterial({ color: 0x17191b, transparent: true, opacity: 1 });
      var m = new THREE.Mesh(geo, mat);
      var z = Z0 - i * STEP - rnd() * 0.6;
      var kind = i % 7 === 3 ? 'ceil' : (i % 7 === 6 ? 'floor' : 'wall');
      var side = (i % 2 === 0) ? -1 : 1;
      if (kind === 'wall') {
        m.position.set(side * (HALF + rnd() * 0.35), (rnd() - 0.5) * 0.9, z);
        m.rotation.y = -side * (Math.PI / 2 - 0.62 - rnd() * 0.12);
      } else if (kind === 'ceil') {
        m.position.set((rnd() - 0.5) * 1.6, 2.35, z);
        m.rotation.x = Math.PI / 2 - 0.58;
      } else {
        m.position.set((rnd() - 0.5) * 1.6, -2.35, z);
        m.rotation.x = -(Math.PI / 2 - 0.58);
      }
      m.userData.src = P + d[0] + '.webp?v=2';
      scene.add(m);
      planes.push(m);
    });
    var DEPTH = TUN.length * STEP + 4;

    /* 바닥과 천장 가이드 선 */
    var pts = [];
    var zA = 8, zB = -DEPTH - 10;
    [-2.4, 2.4].forEach(function (y) {
      for (var x = -HALF; x <= HALF + 0.01; x += HALF / 3) { pts.push(x, y, zA, x, y, zB); }
      for (var z = zA; z > zB; z -= 2.35) { pts.push(-HALF, y, z, HALF, y, z); }
    });
    var lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    var lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0xf1f0eb, transparent: true, opacity: 0.07 }));
    scene.add(lines);

    /* 텍스처: 가까운 것부터 차례로, 줄여서 올림 */
    var queue = planes.slice();
    var active = 0;
    var MAXS = 760;
    function next() {
      if (!queue.length || active >= 4) return;
      var m = queue.shift();
      active++;
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () {
        var s = Math.min(1, MAXS / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * s);
        c.height = Math.round(img.naturalHeight * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        var tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        m.material.map = tex;
        m.material.color.set(0x161718);
        m.material.needsUpdate = true;
        var col = { v: 0.09 };
        gsap.to(col, { v: 0.86, duration: 1.2, ease: 'power2.out', onUpdate: function () { m.material.color.setScalar(col.v); } });
        active--; next();
      };
      img.onerror = function () { active--; next(); };
      img.src = m.userData.src;
      next();
    }
    next();

    function resize() {
      var w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w / h < 1.2 ? 72 : 60;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    var cur = 0, raf = 0, t0 = performance.now();
    function frame(now) {
      raf = requestAnimationFrame(frame);
      var t = (now - t0) / 1000;
      cur += (heroState.p - cur) * 0.085;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      var cz = 2.2 - cur * DEPTH;
      camera.position.set(mouse.x * 0.55 + Math.sin(t * 0.35) * 0.08, -mouse.y * 0.32 + Math.cos(t * 0.3) * 0.06, cz);
      camera.lookAt(mouse.x * 0.25, -mouse.y * 0.12, cz - 12);
      renderer.render(scene, camera);
    }
    function run(on) {
      if (on && !raf) raf = requestAnimationFrame(frame);
      if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    onHeroVis.push(run);
    run(heroVisible);
    EP.tunnel = 'webgl';
  }

  function initTunnelCSS(count) {
    var wrap = document.createElement('div');
    wrap.className = 'tun-css';
    wrap.setAttribute('aria-hidden', 'true');
    var world = document.createElement('div');
    world.className = 'tun-world';
    wrap.appendChild(world);
    hero.insertBefore(wrap, hero.firstChild);
    var W = window.innerWidth;
    var half = isMobile ? Math.min(W * 0.46, 200) : Math.min(W * 0.36, 520);
    var ph = isMobile ? 230 : 360;
    var step = isMobile ? 340 : 420;
    var items = [];
    var list = TUN.slice(0, count);
    list.forEach(function (d, i) {
      var ar = d[1] / d[2];
      var h = ar >= 1 ? ph * 0.75 : ph;
      var w = h * ar;
      var side = i % 2 === 0 ? -1 : 1;
      var el = document.createElement('div');
      el.className = 'tp';
      el.style.width = w + 'px';
      el.style.height = h + 'px';
      el.style.marginLeft = (-w / 2) + 'px';
      el.style.marginTop = (-h / 2) + 'px';
      var img = new Image();
      img.alt = '';
      img.decoding = 'async';
      if (i > 5) img.loading = 'lazy';
      img.src = P + d[0] + '.webp?v=2';
      el.appendChild(img);
      var x = side * (half + (i % 3) * 14);
      var y = ((i * 37) % 60 - 30) * (isMobile ? 0.8 : 1.2);
      var z = -i * step - 200;
      el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px) rotateY(' + (-side * 58) + 'deg)';
      world.appendChild(el);
      items.push({ el: el, z: z });
    });
    var depth = count * step + 200;
    var cur = 0, raf = 0;
    function frame() {
      raf = requestAnimationFrame(frame);
      cur += (heroState.p - cur) * 0.09;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      var wz = cur * depth;
      world.style.transform = 'translate3d(' + (-mouse.x * 30) + 'px,' + (-mouse.y * 20) + 'px,' + wz + 'px)';
      for (var i = 0; i < items.length; i++) {
        var d = items[i].z + wz;
        var o = clamp((d + 3000) / 2000, 0, 1) * clamp((440 - d) / 220, 0, 1);
        items[i].el.style.opacity = o.toFixed(3);
        items[i].el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      }
    }
    function run(on) {
      if (on && !raf) raf = requestAnimationFrame(frame);
      if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    onHeroVis.push(run);
    run(heroVisible);
    EP.tunnel = 'css';
  }

  /* =========================================================
     2. 커지는 카드
     ========================================================= */
  (function () {
    var stage = document.querySelector('.xc-stage');
    var cards = stage.querySelectorAll('.xc-card');
    var small = isMobile ? 'inset(28% 18% 28% 18% round 22px)' : 'inset(31% 35% 31% 35% round 28px)';
    var full = 'inset(0% 0% 0% 0% round 18px)';
    var lines = [];
    cards.forEach(function (c, i) {
      var p = c.querySelector('.xc-line p');
      var chars = EP.split(p);
      gsap.set(chars, { yPercent: 110, opacity: 0 });
      gsap.set(c.querySelector('.xc-line .cap'), { opacity: 0 });
      gsap.set(c, { clipPath: small, yPercent: i === 0 ? 0 : 110 });
      lines.push(chars);
    });
    var tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: stage, start: 'top top',
        end: function () { return '+=' + vh() * (isMobile ? 3 : 4.2); },
        pin: true, scrub: 1, anticipatePin: 1
      }
    });
    cards.forEach(function (c, i) {
      var media = c.querySelector('.xc-media');
      var at = i === 0 ? 0 : '>-0.05';
      if (i > 0) {
        tl.to(c, { yPercent: 0, duration: 0.7, ease: 'power2.out' }, at);
        tl.to(cards[i - 1], { scale: 0.92, duration: 1.4 }, '<');
        tl.to(cards[i - 1].querySelector('.xc-dim'), { opacity: 0.75, duration: 1.4 }, '<');
        tl.to(c, { clipPath: full, duration: 1 }, '<0.35');
      } else {
        tl.to(c, { clipPath: full, duration: 1 }, 0);
      }
      tl.fromTo(media, { scale: 1.35 }, { scale: 1, duration: 1.2, ease: 'power2.out' }, '<');
      tl.to(c.querySelector('.xc-line .cap'), { opacity: 1, duration: 0.3 }, '>-0.5');
      tl.to(lines[i], { yPercent: 0, opacity: 1, stagger: 0.025, duration: 0.45, ease: 'power3.out' }, '<');
      tl.to({}, { duration: 0.6 });
    });
  })();

  /* =========================================================
     3. 프레임 시퀀스 (corridor 120장) + 관리 원칙
     ========================================================= */
  (function () {
    var fs = document.getElementById('fs');
    var stage = fs.querySelector('.fs-stage');
    var canvas = fs.querySelector('.fs-canvas');
    var ctx = canvas.getContext('2d');
    var poster = fs.querySelector('.fs-poster');
    var loadEl = fs.querySelector('.fs-load');
    var loadBar = loadEl.querySelector('b');
    var N = 120;
    var STEP = isMobile ? 2 : 1;
    var frames = new Array(N);
    var state = { p: 0 };
    var lastDrawn = -1, needResize = true;
    var src = function (i) { return '../assets/gen/frames/corridor/f_' + String(i + 1).padStart(3, '0') + '.webp'; };

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(stage.clientWidth * dpr);
      canvas.height = Math.round(stage.clientHeight * dpr);
      lastDrawn = -1;
      draw();
    }
    function nearest(idx) {
      for (var k = 0; k < N; k++) {
        if (frames[idx - k]) return idx - k;
        if (frames[idx + k]) return idx + k;
      }
      return -1;
    }
    function draw() {
      var idx = Math.round(state.p * (N - 1));
      var j = nearest(idx);
      if (j < 0 || j === lastDrawn) return;
      var img = frames[j];
      var cw = canvas.width, ch = canvas.height;
      var s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      var w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      lastDrawn = j;
    }
    function buildOrder() {
      var seen = {}, out = [];
      [16, 8, 4, 2, 1].forEach(function (s) {
        for (var i = 0; i < N; i += s) {
          if (i % STEP) continue;
          if (!seen[i]) { seen[i] = 1; out.push(i); }
        }
      });
      if (!seen[N - 1]) out.push(N - 1);
      return out;
    }
    var started = false;
    function load() {
      if (started) return;
      started = true;
      var probe = new Image();
      probe.decoding = 'async';
      probe.onload = function () {
        frames[0] = probe;
        fs.classList.add('has-frames');
        resize();
        var order = buildOrder().filter(function (i) { return i !== 0; });
        var total = order.length + 1, done = 1, active = 0, misses = 0;
        var pump = function () {
          while (active < 6 && order.length) {
            (function (i) {
              active++;
              var im = new Image();
              im.decoding = 'async';
              im.onload = function () { frames[i] = im; fin(); draw(); };
              im.onerror = function () { misses++; fin(); };
              im.src = src(i);
            })(order.shift());
          }
        };
        var fin = function () {
          active--; done++;
          loadBar.style.transform = 'scaleX(' + (done / total) + ')';
          if (done >= total) loadEl.classList.add('done');
          if (misses > 12 && done < 30) { order.length = 0; }
          pump();
        };
        pump();
      };
      probe.onerror = function () {
        loadEl.classList.add('done');
        fs.classList.remove('has-frames');
      };
      probe.src = src(0);
    }
    ScrollTrigger.create({ trigger: fs, start: 'top bottom+=150%', once: true, onEnter: load });
    window.addEventListener('resize', function () { if (fs.classList.contains('has-frames')) resize(); });

    var items = fs.querySelectorAll('.fs-p');
    var count = fs.querySelector('.fs-count b');
    var marks = [0.12, 0.45, 0.78];
    items.forEach(function (it, i) {
      gsap.set(it, { opacity: 0 });
      EP.split(it.querySelector('h3'));
    });
    gsap.set(items[0], { opacity: 1 });
    gsap.set(items[0].querySelector('h3')._chars, { yPercent: 110, opacity: 0 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage, start: 'top top',
        end: function () { return '+=' + vh() * (isMobile ? 2.4 : 3.2); },
        pin: true, scrub: 0.6, anticipatePin: 1,
        onUpdate: function (s) {
          state.p = s.progress;
          draw();
          count.textContent = '0' + (s.progress < 0.4 ? 1 : s.progress < 0.73 ? 2 : 3);
        }
      }
    });
    tl.fromTo(poster, { scale: 1 }, { scale: 1.28, ease: 'none', duration: 1 }, 0);
    tl.to(fs.querySelector('.fs-bar i'), { scaleX: 1, ease: 'none', duration: 1 }, 0);
    items.forEach(function (it, i) {
      var chars = it.querySelector('h3')._chars;
      var p = it.querySelector('p');
      var no = it.querySelector('.no');
      var t = marks[i] - 0.08;
      if (i > 0) tl.fromTo(it, { opacity: 0 }, { opacity: 1, duration: 0.01 }, t);
      tl.fromTo(chars, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.006, duration: 0.07, ease: 'power3.out' }, t);
      tl.fromTo([no, p], { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.07, stagger: 0.02 }, t + 0.02);
      if (i < items.length - 1) {
        tl.to(it, { opacity: 0, y: -40, duration: 0.06, ease: 'power2.in' }, marks[i + 1] - 0.15);
      }
    });
  })();

  /* =========================================================
     4. 원형 전환
     ========================================================= */
  (function () {
    var cw = document.getElementById('cw');
    var stage = cw.querySelector('.cw-stage');
    var pre = cw.querySelector('.cw-pre p');
    var circle = cw.querySelector('.cw-circle');
    var preChars = EP.split(pre);
    var inner = cw.querySelectorAll('.cw-txt > *, .cw-facts li');
    gsap.set(preChars, { yPercent: 110, opacity: 0 });
    ScrollTrigger.create({
      trigger: stage, start: 'top 70%', once: true,
      onEnter: function () { gsap.to(preChars, { yPercent: 0, opacity: 1, stagger: 0.03, duration: 0.9, ease: 'power3.out' }); }
    });
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage, start: 'top top',
        end: function () { return '+=' + vh() * (isMobile ? 1.8 : 2.4); },
        pin: true, scrub: 1, anticipatePin: 1
      }
    });
    tl.to({}, { duration: 0.25 })
      .fromTo(circle, { clipPath: 'circle(0% at 50% 100%)' }, { clipPath: 'circle(150% at 50% 100%)', duration: 1, ease: 'power2.in' })
      .to(cw.querySelector('.cw-pre'), { scale: 0.86, opacity: 0, duration: 0.7, ease: 'power1.in' }, '<0.2')
      .fromTo(inner, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' }, '>-0.15')
      .to({}, { duration: 0.5 });
  })();

  /* =========================================================
     5. 서비스 챕터
     ========================================================= */
  var chs = document.getElementById('chs');
  var mm = gsap.matchMedia();
  mm.add('(min-width: 769px)', function () { return buildChapterBrowser(); });
  mm.add('(max-width: 768px)', function () {
    chs.querySelectorAll('.ch').forEach(function (a) {
      gsap.fromTo(a.querySelectorAll('.ch-no, .ch-t, .ch-h, .ch-d, .ch-sub, .pill, .ch-photos'), { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: 'power3.out',
        scrollTrigger: { trigger: a, start: 'top 85%', once: true }
      });
    });
  });

  function buildChapterBrowser() {
    var arts = Array.prototype.slice.call(chs.querySelectorAll('.ch'));
    var NCH = arts.length;
    var chb = chs.querySelector('.chb');
    chs.classList.add('is-pinned');
    chb.removeAttribute('aria-hidden');
    chb.innerHTML = '<div class="chb-stage"><div class="chb-top"><div class="chb-list"><span class="cap g">SERVICE · 여섯 가지 일</span><ol></ol></div><div class="chb-texts"></div></div><div class="chb-rail"><div class="chb-track"></div></div></div>';
    var stage = chb.querySelector('.chb-stage');
    var ol = chb.querySelector('ol');
    var texts = chb.querySelector('.chb-texts');
    var track = chb.querySelector('.chb-track');
    var rail = chb.querySelector('.chb-rail');
    var lis = [], tx = [], cards = [];

    arts.forEach(function (a, i) {
      var li = document.createElement('li');
      li.innerHTML = '<button type="button"><em>' + a.querySelector('.ch-no').textContent + '</em><span></span></button>';
      li.querySelector('span').textContent = a.querySelector('.ch-t').textContent;
      li.querySelector('button').addEventListener('click', function () { goTo(i); });
      ol.appendChild(li);
      lis.push(li);

      var t = document.createElement('div');
      t.className = 'chb-text';
      t.innerHTML = '<p class="ch-no"></p><p class="ch-h"></p><p class="ch-d"></p><div class="row"></div>';
      t.querySelector('.ch-no').textContent = a.querySelector('.ch-no').textContent + ' · ' + a.querySelector('.ch-t').textContent;
      t.querySelector('.ch-h').innerHTML = a.querySelector('.ch-h').innerHTML;
      t.querySelector('.ch-d').textContent = a.querySelector('.ch-d').textContent;
      var row = t.querySelector('.row');
      row.appendChild(a.querySelector('.ch-sub').cloneNode(true));
      row.appendChild(a.querySelector('.pill').cloneNode(true));
      texts.appendChild(t);
      t._chars = EP.split(t.querySelector('.ch-h'));
      tx.push(t);

      a.querySelectorAll('.ch-photos figure').forEach(function (f) {
        var card = document.createElement('div');
        card.className = 'chb-card';
        var ph = f.querySelector('.ph').cloneNode(true);
        var img = ph.querySelector('img');
        img.loading = 'eager';
        var lbl = document.createElement('span');
        lbl.className = 'lbl';
        lbl.textContent = f.querySelector('figcaption').textContent;
        ph.appendChild(lbl);
        card.appendChild(ph);
        track.appendChild(card);
        cards.push({ el: card, ch: i, x: 0, cx: 0 });
      });
    });

    var geo = {};
    function measure() {
      var H = rail.clientHeight;
      var cw = Math.round(H * 0.74);
      var gap = Math.round(cw * 0.14);
      var x = 0, prev = 0;
      cards.forEach(function (c, k) {
        if (k > 0 && c.ch !== prev) x += gap * 2.2;
        prev = c.ch;
        c.x = x; c.cx = x + cw / 2;
        c.el.style.width = cw + 'px';
        x += cw + gap;
      });
      var knots = [];
      for (var i = 0; i < NCH; i++) {
        for (var k = 0; k < cards.length; k++) { if (cards[k].ch === i) { knots.push(cards[k].cx); break; } }
      }
      knots.push(cards[cards.length - 1].cx);
      geo = { cw: cw, gap: gap, knots: knots, vw: rail.clientWidth };
    }
    measure();

    var state = { p: 0 };
    var current = -1;
    function setActive(i) {
      if (i === current) return;
      var old = current;
      current = i;
      lis.forEach(function (li, k) { li.classList.toggle('on', k === i); });
      cards.forEach(function (c) { c.el.classList.toggle('off', c.ch !== i); });
      if (old >= 0) {
        var o = tx[old];
        gsap.killTweensOf(o);
        gsap.to(o, { opacity: 0, y: -24, duration: 0.35, ease: 'power2.in', onComplete: function () { o.classList.remove('on'); } });
      }
      var t = tx[i];
      gsap.killTweensOf(t);
      t.classList.add('on');
      gsap.fromTo(t, { opacity: 1, y: 0 }, { opacity: 1, y: 0, duration: 0.01 });
      gsap.fromTo(t._chars, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.018, duration: 0.7, ease: 'power3.out', delay: old >= 0 ? 0.2 : 0 });
      gsap.fromTo(t.querySelectorAll('.ch-no, .ch-d, .row'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.07, ease: 'power3.out', delay: old >= 0 ? 0.3 : 0.1 });
    }

    function render() {
      var p = clamp(state.p, 0, 1);
      var seg = Math.min(NCH - 1, Math.floor(p * NCH));
      var t = p * NCH - seg;
      var tt = clamp((t - 0.12) / 0.88, 0, 1);
      tt = tt * tt * (3 - 2 * tt) * 0.55 + tt * 0.45;
      var c = geo.knots[seg] + (geo.knots[seg + 1] - geo.knots[seg]) * tt;
      var half = geo.vw / 2;
      track.style.transform = 'translate3d(' + (half - c).toFixed(1) + 'px,0,0)';
      var unit = geo.cw + geo.gap;
      for (var k = 0; k < cards.length; k++) {
        var cd = cards[k];
        var d = (cd.cx - c) / unit;
        var ad = Math.abs(d);
        if (ad > 7) { cd.el.style.visibility = 'hidden'; continue; }
        cd.el.style.visibility = 'visible';
        var ry = clamp(-d * 15, -58, 58);
        var rz = d * 2.2;
        var ty = Math.pow(Math.min(ad, 6), 1.5) * 7;
        var tz = -ad * 80;
        cd.el.style.transform = 'translate3d(' + cd.x.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,' + tz.toFixed(1) + 'px) rotateY(' + ry.toFixed(2) + 'deg) rotateZ(' + rz.toFixed(2) + 'deg)';
      }
      setActive(seg);
    }

    var tween = gsap.to(state, {
      p: 1, ease: 'none', onUpdate: render,
      scrollTrigger: {
        trigger: stage, start: 'top top',
        end: function () { return '+=' + vh() * 5; },
        pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true
      }
    });
    function goTo(i) {
      var st = tween.scrollTrigger;
      var y = st.start + ((i + 0.14) / NCH) * (st.end - st.start);
      EP.scrollTo(y);
    }
    var onResize = function () { measure(); render(); };
    window.addEventListener('resize', onResize);
    render();

    return function () {
      window.removeEventListener('resize', onResize);
      chs.classList.remove('is-pinned');
      chb.innerHTML = '';
      chb.setAttribute('aria-hidden', 'true');
    };
  }

  /* 6. 상담 등 나머지 등장 */
  EP.initReveals();
  EP.home = true;
})();
