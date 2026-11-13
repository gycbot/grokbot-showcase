/* ============================================================
   把伞偏向你 · 页面脚本
   读 config.js → 填充文字与照片 → 再启动 GSAP 动效。
   换文案、换图不需要改这里。
   ============================================================ */
(function () {
  "use strict";

  var cfg = window.KEEPSAKE || {};
  var doc = document;
  var root = doc.documentElement;
  var body = doc.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function text(sel, val) {
    $$(sel).forEach(function (el) {
      if (val != null && val !== "") el.textContent = val;
    });
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function parseISO(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
    if (!m) return null;
    return { y: +m[1], m: +m[2], d: +m[3] };
  }
  function dotDate(iso) {
    var p = parseISO(iso);
    return p ? p.y + "." + pad(p.m) + "." + pad(p.d) : "";
  }

  /* 把一段文字拆成逐字遮罩，用于错峰入场（自写，不用 SplitText） */
  function splitChars(el, opts) {
    if (!el) return [];
    opts = opts || {};
    var raw = el.getAttribute("data-raw");
    if (raw == null) { raw = el.textContent; el.setAttribute("data-raw", raw); }
    var frag = doc.createDocumentFragment();
    var out = [];
    Array.from(String(raw)).forEach(function (ch) {
      if (ch === "\n") {
        var br = doc.createElement("br");
        frag.appendChild(br);
        return;
      }
      if (ch === " ") {
        var sp = doc.createElement("span");
        sp.className = "sp";
        sp.style.display = "inline-block";
        sp.style.width = ".32em";
        frag.appendChild(sp);
        return;
      }
      var mask = doc.createElement(opts.tag || "span");
      mask.className = "ch";
      var inner = doc.createElement("i");
      inner.textContent = ch;
      mask.appendChild(inner);
      frag.appendChild(mask);
      out.push(inner);
    });
    el.textContent = "";
    el.appendChild(frag);
    return out;
  }

  /* ---------- 1. 文字：config 覆盖页面里的样例 ---------- */
  var A = cfg.personA || { name: "周予安", short: "予安" };
  var B = cfg.personB || { name: "梁清和", short: "清和" };
  var met = parseISO(cfg.metOn) || { y: 2018, m: 6, d: 17 };
  var ann = parseISO(cfg.anniversary) || met;
  var chapters = Array.isArray(cfg.chapters) ? cfg.chapters.filter(function (c) { return c && c.photo; }) : [];

  if (cfg.title) doc.title = cfg.title + " · " + A.name + "与" + B.name;

  text('[data-bind="nameA"]', A.name);
  text('[data-bind="nameB"]', B.name);
  text('[data-bind="shortA"]', A.short || A.name);
  text('[data-bind="shortB"]', B.short || B.name);
  text('[data-bind="hook"]', cfg.hook);
  text('[data-bind="hookSub"]', cfg.hookSub);
  text('[data-bind="metPlace"]', cfg.metPlace);
  text('[data-bind="metNote"]', cfg.metNote);
  text('[data-bind="closing"]', cfg.closing);
  text('[data-bind="signature"]', cfg.signature || (A.short || A.name));
  text('[data-bind="letterDate"]', dotDate(cfg.letterDate || cfg.anniversary || cfg.metOn));
  text('[data-bind="seal"]', (cfg.signature || A.short || "安").slice(-1));
  text('[data-bind="years"]', met.y + " — " + ann.y);

  var nameAEl = $('[data-bind="nameA"]');
  var nameBEl = $('[data-bind="nameB"]');
  if (nameAEl) nameAEl.parentNode.setAttribute("aria-label", A.name);
  if (nameBEl) nameBEl.parentNode.setAttribute("aria-label", B.name);

  /* 日期数字 */
  var dateBig = $("#dateBig");
  var digits = $$(".dg", dateBig);
  var dateStr = "" + met.y + pad(met.m) + pad(met.d);
  if (dateStr.length === 8 && digits.length === 8) {
    digits.forEach(function (d, i) { d.textContent = dateStr.charAt(i); });
  }
  dateBig.setAttribute("aria-label", met.y + "年" + met.m + "月" + met.d + "日");

  /* ---------- 2. 章节 DOM ---------- */
  var list = $("#chapterList");
  chapters.forEach(function (c, i) {
    var art = doc.createElement("article");
    art.className = "chapter";
    art.id = "ch-" + (i + 1);

    var media = doc.createElement("div");
    media.className = "ch-media";
    media.innerHTML =
      '<div class="frame">' +
        '<img src="' + esc(c.photo) + '" alt="' + esc(c.place || "第 " + (i + 1) + " 张照片") + '，' + esc(dotDate(c.date)) + '" ' +
          'width="1152" height="1440" loading="' + (i < 1 ? "eager" : "lazy") + '" decoding="async">' +
      '</div>' +
      (c.note ? '<p class="ch-note">' + esc(c.note) + '</p>' : "");

    var copy = doc.createElement("div");
    copy.className = "ch-copy";
    copy.innerHTML =
      '<p class="ch-meta">' +
        '<span class="ch-no">' + pad(i + 1) + '</span>' +
        (c.date ? '<time class="ch-time" datetime="' + esc(c.date) + '">' + esc(dotDate(c.date)) + '</time>' : '<span class="ch-time">未署期</span>') +
        (c.place ? '<span class="ch-place">' + esc(c.place) + '</span>' : "") +
      '</p>' +
      '<p class="ch-caption">' + esc(c.caption || "") + '</p>' +
      '<div class="ch-rule" aria-hidden="true"></div>';

    art.appendChild(media);
    art.appendChild(copy);
    list.appendChild(art);
  });

  /* ---------- 3. 情书 ---------- */
  var letterBody = $("#letterBody");
  var letterLines = String(cfg.letter || "").split(/\n+/).filter(function (s) { return s.trim(); });
  letterLines.forEach(function (line, i) {
    var ln = doc.createElement("p");
    ln.className = "ln" + (i === letterLines.length - 1 ? " is-sign" : "");
    var s = doc.createElement("span");
    s.textContent = line;
    ln.appendChild(s);
    letterBody.appendChild(ln);
  });

  /* ---------- 4. 目录 / 进度条 ---------- */
  var drawer = $("#indexDrawer");
  var drawerList = $("#drawerList");
  var indexBtn = $("#indexBtn");
  var indexCount = $("#indexCount");
  var drawerCount = $("#drawerCount");
  var n = chapters.length;
  indexCount.textContent = n < 10 ? "0" + n : "" + n;
  drawerCount.textContent = n;

  chapters.forEach(function (c, i) {
    var li = doc.createElement("li");
    var btn = doc.createElement("button");
    btn.type = "button";
    btn.setAttribute("data-target", "ch-" + (i + 1));
    btn.innerHTML =
      '<span class="d-no">' + pad(i + 1) + '</span>' +
      '<span class="d-cap">' + esc(c.caption || c.place || "") + '</span>' +
      '<span class="d-date">' + (c.date ? esc(dotDate(c.date)) : "未署期") + '</span>';
    li.appendChild(btn);
    drawerList.appendChild(li);
  });

  var rail = $("#rail");
  if (n > 1) {
    chapters.forEach(function (c, i) {
      var rb = doc.createElement("button");
      rb.type = "button";
      rb.className = "rail-item";
      rb.setAttribute("data-target", "ch-" + (i + 1));
      rb.setAttribute("aria-label", "第 " + (i + 1) + " 张：" + (c.place || ""));
      rb.setAttribute("aria-current", "false");
      rb.innerHTML = '<span class="rail-label">' + esc(c.place || pad(i + 1)) + '</span><span class="rail-bar"></span>';
      rail.appendChild(rb);
    });
  } else {
    rail.style.display = "none";
  }

  function goTo(id) {
    var el = doc.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  $$("[data-target]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-target");
      if (!drawer.hidden) closeDrawer(false);
      setTimeout(function () { goTo(id); }, reduce ? 0 : 240);
    });
  });

  /* 抽屉 */
  var lastFocus = null;
  var isOpen = false;
  function openDrawer() {
    if (isOpen) return;
    isOpen = true;
    lastFocus = doc.activeElement;
    drawer.hidden = false;
    indexBtn.setAttribute("aria-expanded", "true");
    body.style.overflow = "hidden";
    if (window.gsap) {
      gsap.fromTo(drawer, { yPercent: -4, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: reduce ? 0 : .5, ease: "power3.out" });
      gsap.fromTo($$(".drawer-list li"), { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: reduce ? 0 : .45, stagger: reduce ? 0 : .035, delay: reduce ? 0 : .1, ease: "power2.out" });
    }
    var close = $("#drawerClose");
    if (close) close.focus();
  }
  function closeDrawer(restore) {
    if (!isOpen) return;
    isOpen = false;
    indexBtn.setAttribute("aria-expanded", "false");
    body.style.overflow = "";
    var finish = function () {
      drawer.hidden = true;
      if (restore !== false && lastFocus && lastFocus.focus) lastFocus.focus();
    };
    if (window.gsap && !reduce) {
      gsap.to(drawer, { yPercent: -3, autoAlpha: 0, duration: .32, ease: "power2.in", onComplete: finish });
    } else { finish(); }
  }
  indexBtn.addEventListener("click", function () {
    if (drawer.hidden) openDrawer(); else closeDrawer(true);
  });
  $("#drawerClose").addEventListener("click", function () { closeDrawer(true); });
  doc.addEventListener("keydown", function (e) {
    if (!isOpen) return;
    if (e.key === "Escape") { e.preventDefault(); closeDrawer(true); return; }
    if (e.key === "Tab") {
      var f = $$("button, [href], input, select, textarea", drawer).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* 打印 */
  var printBtn = $("#printBtn");
  if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

  /* ---------- 5. 动效 ---------- */
  function revealStatic() {
    root.classList.add("no-gsap");
    $$(".name .ch > i, .ch-caption .ch > i, .letter-body .ln > span").forEach(function (el) {
      el.style.transform = "none"; el.style.opacity = "1";
    });
  }

  if (!window.gsap || !window.ScrollTrigger) { revealStatic(); return; }
  gsap.registerPlugin(ScrollTrigger);

  if (reduce) {
    revealStatic();
    return;
  }

  gsap.defaults({ ease: "power3.out" });

  /* 开场：名字逐字装配、伞骨描线、钩子句错峰 */
  var nameAChars = splitChars(nameAEl);
  var nameBChars = splitChars(nameBEl);
  var hookEl = $('[data-bind="hook"]');
  var hookChars = splitChars(hookEl);
  var subEl = $('[data-bind="hookSub"]');

  gsap.set(nameAChars.concat(nameBChars), { yPercent: 118, rotate: 4, transformOrigin: "0% 100%" });
  gsap.set(hookChars, { yPercent: 110, autoAlpha: 0 });
  gsap.set(subEl, { autoAlpha: 0, y: 10 });

  var uPaths = $$(".umbrella path");
  uPaths.forEach(function (p) {
    var len = p.getTotalLength ? p.getTotalLength() : 300;
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
  });

  var intro = gsap.timeline({ delay: .12, defaults: { ease: "power4.out" } });
  intro
    .from(".eyebrow", { autoAlpha: 0, y: 10, duration: .7 })
    .to(nameAChars, { yPercent: 0, rotate: 0, duration: 1.05, stagger: .055 }, "-=.35")
    .to(nameBChars, { yPercent: 0, rotate: 0, duration: 1.05, stagger: .055 }, "-=.82")
    .to(uPaths, { strokeDashoffset: 0, duration: 1.5, stagger: .12, ease: "power2.inOut" }, "-=1.0")
    .to(hookChars, { yPercent: 0, autoAlpha: 1, duration: .8, stagger: .028 }, "-=.85")
    .to(subEl, { autoAlpha: 1, y: 0, duration: .7 }, "-=.45")
    .from(".hero-foot > *", { autoAlpha: 0, y: 12, duration: .7, stagger: .1 }, "-=.55")
    .from(".amp", { autoAlpha: 0, scale: .6, duration: .8, ease: "power2.out" }, "-=1.2");

  /* 开场滚出时轻微让位（不是整块淡出） */
  gsap.to(".hero-type", {
    yPercent: -6, autoAlpha: .55, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to(".umbrella", {
    yPercent: -14, rotation: 5, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  /* 顶部进度 */
  gsap.to("#topProgress", {
    scaleX: 1, ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: .3 }
  });

  /* 日期翻牌 */
  gsap.set(digits, { rotationX: -88, y: 14, autoAlpha: 0, transformPerspective: 700 });
  gsap.to(digits, {
    rotationX: 0, y: 0, autoAlpha: 1, duration: .95, stagger: .07, ease: "power3.out",
    scrollTrigger: { trigger: ".origin", start: "top 72%", toggleActions: "play none none reverse" }
  });
  gsap.from(".origin-row > *", {
    y: 16, autoAlpha: 0, duration: .8, stagger: .1,
    scrollTrigger: { trigger: ".origin-row", start: "top 88%", toggleActions: "play none none reverse" }
  });

  /* 折信：桌面钉住展开，手机直接落下 */
  var mm = gsap.matchMedia();
  mm.add("(min-width: 1000px)", function () {
    gsap.set(".wing-l", { rotationY: 86 });
    gsap.set(".wing-r", { rotationY: -86 });
    gsap.set(".fold-inner", { scale: .94, rotateX: 7 });
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".fold", start: "top top", end: "+=720",
        pin: true, scrub: .7, anticipatePin: 1
      }
    });
    tl.to(".wing-l", { rotationY: 0, duration: 1, ease: "power2.inOut" }, 0)
      .to(".wing-r", { rotationY: 0, duration: 1, ease: "power2.inOut" }, 0)
      .to(".fold-inner", { scale: 1, rotateX: 0, duration: 1, ease: "power2.inOut" }, 0)
      .to(".fold-hint", { autoAlpha: 0, duration: .3 }, .1);
    return function () { gsap.set(".fold-hint", { autoAlpha: 1 }); };
  });
  mm.add("(max-width: 999px)", function () {
    var tl = gsap.timeline({
      scrollTrigger: { trigger: ".fold-inner", start: "top 82%", toggleActions: "play none none reverse" }
    });
    tl.from(".fold-inner", { autoAlpha: 0, y: 34, duration: .9, ease: "power3.out" })
      .from(".fold-inner > *", { autoAlpha: 0, y: 18, duration: .6, stagger: .1 }, "-=.5");
  });

  gsap.from(".fold-inner > *", {
    autoAlpha: 0, y: 20, duration: .8, stagger: .1,
    scrollTrigger: { trigger: ".fold", start: "top 62%", toggleActions: "play none none reverse" }
  });

  /* 章节：照片有厚度地进来，文字逐字让位 */
  var chapterEls = $$(".chapter");
  chapterEls.forEach(function (ch, i) {
    var frame = $(".frame", ch);
    var img = $("img", ch);
    var cap = $(".ch-caption", ch);
    var chars = splitChars(cap);
    var metaBits = $$(".ch-meta > *", ch);
    var rule = $(".ch-rule", ch);
    var dir = i % 2 === 0 ? -1 : 1;

    gsap.set(frame, { transformPerspective: 1300, rotationY: 5 * dir, y: 40, scale: .98, autoAlpha: 0 });
    gsap.set(img, { scale: 1.1, transformOrigin: "50% 55%" });
    gsap.set(chars, { yPercent: 112 });
    gsap.set(metaBits, { autoAlpha: 0, y: 8 });
    gsap.set(rule, { scaleX: 0 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: ch, start: "top 80%", end: "bottom 55%",
        toggleActions: "play none none reverse"
      }
    });
    tl.to(frame, { rotationY: 0, y: 0, scale: 1, autoAlpha: 1, duration: 1.15, ease: "power3.out" }, 0)
      .to(img, { scale: 1, duration: 1.5, ease: "power2.out" }, 0)
      .to(metaBits, { autoAlpha: 1, y: 0, duration: .6, stagger: .06 }, .22)
      .to(chars, { yPercent: 0, duration: .85, stagger: .013, ease: "power2.out" }, .3)
      .to(rule, { scaleX: 1, duration: .9, ease: "power2.inOut" }, .35);
  });

  /* 章节色温：纸面从象牙到微冷，逐章过渡 */
  var tones = ["#F3EBE0", "#F4ECE1", "#F1E7D9", "#F0E9DF", "#F4EEE4", "#EFE4D4", "#F2E9DD", "#F7F1E8"];
  chapterEls.forEach(function (ch, i) {
    ScrollTrigger.create({
      trigger: ch, start: "top 55%", end: "bottom 45%",
      onEnter: function () { tone(tones[i % tones.length]); },
      onEnterBack: function () { tone(tones[i % tones.length]); }
    });
  });
  function tone(color) {
    gsap.to(body, { backgroundColor: color, duration: .7, overwrite: "auto" });
  }

  /* 右侧进度：当前章 */
  var railItems = $$(".rail-item");
  function setRail(i) {
    railItems.forEach(function (el, j) { el.setAttribute("aria-current", j === i ? "true" : "false"); });
  }
  chapterEls.forEach(function (ch, i) {
    ScrollTrigger.create({
      trigger: ch, start: "top 60%", end: "bottom 40%",
      onEnter: function () { setRail(i); },
      onEnterBack: function () { setRail(i); }
    });
  });

  /* 手绘红线：按实际排版算路径 */
  var threadSvg = $("#thread");
  var threadTween = null;
  function buildThread() {
    if (!threadSvg || !chapterEls.length) return;
    if (threadTween) { threadTween.scrollTrigger && threadTween.scrollTrigger.kill(); threadTween.kill(); threadTween = null; }
    var wrap = $(".chapters");
    var w = wrap.clientWidth;
    var h = wrap.clientHeight;
    threadSvg.setAttribute("viewBox", "0 0 " + w + " " + h);
    threadSvg.setAttribute("width", w);
    threadSvg.setAttribute("height", h);
    var wrapTop = wrap.getBoundingClientRect().top;
    var isDesktop = window.matchMedia("(min-width: 820px)").matches;
    var pts = chapterEls.map(function (ch, i) {
      var r = ch.getBoundingClientRect();
      var y = r.top - wrapTop + Math.min(r.height * .45, 280);
      var x = isDesktop ? Math.max(26, w * .028) : 9;
      return { x: x, y: y };
    });
    if (pts.length < 2) return;
    var d = "M " + pts[0].x + " " + pts[0].y;
    for (var i = 1; i < pts.length; i++) {
      var p0 = pts[i - 1], p1 = pts[i];
      var my = (p0.y + p1.y) / 2;
      d += " C " + p0.x + " " + my + ", " + p1.x + " " + my + ", " + p1.x + " " + p1.y;
    }
    var html = '<path d="' + d + '"/>';
    pts.forEach(function (p) {
      html += '<circle cx="' + p.x + '" cy="' + p.y + '" r="4.2"/>';
      html += '<circle class="node-fill" cx="' + p.x + '" cy="' + p.y + '" r="1.4"/>';
      html += '<path d="M ' + (p.x + 7) + ' ' + p.y + ' h 13" opacity=".55"/>';
    });
    threadSvg.innerHTML = html;
    var path = threadSvg.querySelector("path");
    var len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    threadTween = gsap.to(path, {
      strokeDashoffset: 0, ease: "none",
      scrollTrigger: {
        trigger: ".chapter-list", start: "top 82%", end: "bottom 72%", scrub: .5
      }
    });
  }

  /* 情书逐行、封章落下 */
  gsap.set(".letter-body .ln > span", { yPercent: 110 });
  gsap.to(".letter-body .ln > span", {
    yPercent: 0, duration: 1, stagger: .12, ease: "power3.out",
    scrollTrigger: { trigger: ".letter-body", start: "top 82%", toggleActions: "play none none reverse" }
  });
  gsap.from(".seal", {
    scale: 1.7, rotation: -28, autoAlpha: 0, duration: .55, ease: "power4.in",
    scrollTrigger: { trigger: ".letter-sign", start: "top 92%", toggleActions: "play none none reverse" }
  });

  gsap.from(".coda-line", {
    y: 24, autoAlpha: 0, duration: 1,
    scrollTrigger: { trigger: ".coda", start: "top 78%", toggleActions: "play none none reverse" }
  });

  /* 指针视差：只加在照片外框，克制 */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".ch-media").forEach(function (media) {
      var frame = $(".frame", media);
      var rx = gsap.quickTo(frame, "rotationX", { duration: .8, ease: "power3.out" });
      var ry = gsap.quickTo(frame, "rotationY", { duration: .8, ease: "power3.out" });
      var clampTilt = gsap.utils.clamp(-1, 1);
      media.addEventListener("pointermove", function (e) {
        var r = media.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5;
        var py = (e.clientY - r.top) / r.height - .5;
        ry(clampTilt(px * 2) * 2.6);
        rx(-clampTilt(py * 2) * 2.6);
      });
      media.addEventListener("pointerleave", function () { rx(0); ry(0); });
    });
  }

  /* 图片与字体就位后重算 */
  function refresh() {
    buildThread();
    ScrollTrigger.refresh();
  }
  window.addEventListener("load", refresh);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(refresh).catch(function () {});
  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(refresh, 180);
  });

  /* 首次构建，等字体尽量稳定后再画红线 */
  buildThread();
  setTimeout(refresh, 900);
})();
