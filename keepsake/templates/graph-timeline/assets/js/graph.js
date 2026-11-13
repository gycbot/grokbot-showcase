/* ============================================================
   八年的站与站 · Canvas2D 关系图谱
   同一份 config 数据驱动画布、站序、站点面板。
   无 WebGPU 依赖；Canvas2D 是完整路径，file:// 直接可用。
   ============================================================ */
(function () {
  "use strict";

  var cfg = window.KEEPSAKE || {};
  var chapters = Array.isArray(cfg.chapters) ? cfg.chapters.filter(function (c) { return c && c.photo; }) : [];
  var canvas = document.getElementById("graph");
  var wrap = document.querySelector(".graph-wrap");
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!window.gsap;
  var panel = document.getElementById("panel");

  var A = cfg.personA || { name: "周予安" };
  var B = cfg.personB || { name: "梁清和" };
  var n = chapters.length;

  /* ---------- 文案 ---------- */
  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function pad(x) { return x < 10 ? "0" + x : "" + x; }
  function dot(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
    return m ? m[1] + "." + m[2] + "." + m[3] : "未署期";
  }
  function year(iso) { var m = /^(\d{4})/.exec(String(iso || "")); return m ? m[1] : "—"; }
  function text(sel, val) { if (val != null && val !== "") $$(sel).forEach(function (el) { el.textContent = val; }); }

  document.title = (cfg.title || "八年的站与站") + " · " + A.name + "与" + B.name;
  text('[data-bind="title"]', cfg.title);
  text('[data-bind="intro"]', cfg.intro);
  text('[data-bind="quote"]', cfg.quote);
  text('[data-bind="nameA"]', A.name);
  text('[data-bind="nameB"]', B.name);
  text('[data-bind="count"]', n < 10 ? "0" + n : "" + n);
  $("#panelTotal").textContent = n < 10 ? "0" + n : "" + n;

  /* ---------- 站序 ---------- */
  var railList = $("#railList");
  chapters.forEach(function (c, i) {
    var li = document.createElement("li");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("data-index", i);
    btn.setAttribute("aria-label", "第 " + (i + 1) + " 站：" + (c.place || ""));
    btn.innerHTML = '<span class="rail-no">' + pad(i + 1) + '</span>' +
      '<span class="rail-name">' + esc(c.place || "") + '</span>' +
      '<span class="rail-year">' + esc(year(c.date)) + '</span>';
    btn.addEventListener("click", function () {
      stopTour();
      select(i, { focus: true });
      if (window.matchMedia("(max-width: 900px)").matches) {
        setTimeout(function () { panel.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }, 120);
      }
    });
    li.appendChild(btn);
    railList.appendChild(li);
  });

  /* ---------- 画布状态 ---------- */
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var cw = 0, chh = 0;
  var W = 1180, H = 760;
  var nodes = [];
  var state = {
    cam: { x: W / 2, y: H / 2, zoom: 1 },
    active: 0,
    hover: -1,
    reveal: 0,
    nodeT: 0,
    pulse: 0,
    dragging: false,
    moved: false,
    userMoved: false
  };
  var pointer = { id: null, x: 0, y: 0, sx: 0, sy: 0, down: false };
  var pinch = { a: null, b: null, dist: 0, zoom: 1 };

  function isMobile() { return window.innerWidth <= 900; }

  function layout() {
    nodes = chapters.map(function (c, i) {
      var t = n > 1 ? i / (n - 1) : .5;
      var x, y;
      if (isMobile()) {
        W = 760; H = 1400;
        x = 380 + (i % 2 ? 92 : -92);
        y = 150 + i * 138;
      } else {
        W = 1180; H = 760;
        x = 140 + t * (W - 280);
        y = H * .5 + Math.sin(t * Math.PI * 2.35 + .55) * H * .27 + (i % 2 ? -22 : 22);
      }
      return { x: x, y: y, data: c, i: i };
    });
    if (isMobile()) H = Math.max(1100, 180 + (n - 1) * 138 + 220);
  }

  function resize() {
    var r = wrap.getBoundingClientRect();
    cw = Math.max(1, Math.round(r.width));
    chh = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(chh * dpr);
    canvas.style.width = cw + "px";
    canvas.style.height = chh + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout();
    if (!state.userMoved) fit(false); else clampCam();
  }

  function fit(animate) {
    var z = Math.min((cw - 90) / W, (chh - 90) / H);
    z = Math.max(isMobile() ? .19 : .45, Math.min(z, 1.5));
    moveCam(W / 2, H / 2, z, animate, 0);
  }

  function focusNode(i, animate) {
    var nd = nodes[i];
    if (!nd) return;
    var z = Math.max(state.cam.zoom, isMobile() ? .78 : .72);
    z = Math.min(z, 1.6);
    moveCam(nd.x, nd.y, z, animate !== false, 0);
  }

  function moveCam(x, y, z, animate, dur) {
    z = clamp(z, isMobile() ? .18 : .35, 2.4);
    var m = 340;
    x = clamp(x, -m, W + m);
    y = clamp(y, -m, H + m);
    if (hasGsap && animate && !reduce) {
      gsap.to(state.cam, { x: x, y: y, zoom: z, duration: dur || .9, ease: "power3.inOut", overwrite: true });
    } else {
      state.cam.x = x; state.cam.y = y; state.cam.zoom = z;
    }
  }
  function clampCam() {
    var m = 340;
    state.cam.x = clamp(state.cam.x, -m, W + m);
    state.cam.y = clamp(state.cam.y, -m, H + m);
    state.cam.zoom = clamp(state.cam.zoom, isMobile() ? .18 : .35, 2.4);
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function project(p) {
    return { x: (p.x - state.cam.x) * state.cam.zoom + cw / 2, y: (p.y - state.cam.y) * state.cam.zoom + chh / 2 };
  }
  function unproject(sx, sy) {
    return { x: (sx - cw / 2) / state.cam.zoom + state.cam.x, y: (sy - chh / 2) / state.cam.zoom + state.cam.y };
  }

  /* ---------- 曲线 ---------- */
  function curvePath(points) {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[i - 1] || points[i];
      var p1 = points[i];
      var p2 = points[i + 1];
      var p3 = points[i + 2] || p2;
      var c1x = p1.x + (p2.x - p0.x) / 6;
      var c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6;
      var c2y = p2.y - (p3.y - p1.y) / 6;
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2.x, p2.y);
    }
  }
  function screenPts(list) { return list.map(function (nd) { return project(nd); }); }

  /* ---------- 绘制 ---------- */
  function draw(ts) {
    if (!cw) return;
    state.pulse = (ts || 0) / 1000;
    ctx.clearRect(0, 0, cw, chh);
    drawGrid();
    var cam = state.cam;

    /* 支线（同 tag 的站） */
    var groups = {};
    nodes.forEach(function (nd) {
      var t = nd.data.tag;
      if (!t) return;
      (groups[t] = groups[t] || []).push(nd);
    });
    Object.keys(groups).forEach(function (key) {
      var g = groups[key];
      if (g.length < 2) return;
      var pts = screenPts(g);
      ctx.save();
      ctx.globalAlpha = .55 * state.reveal;
      ctx.strokeStyle = "#2F6F68";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 7]);
      curvePath(pts);
      ctx.stroke();
      ctx.restore();
    });

    /* 主时间线 */
    var pts = screenPts(nodes);
    ctx.save();
    ctx.globalAlpha = .5 * state.reveal;
    ctx.strokeStyle = "#E7E4D8";
    ctx.lineWidth = 1.2;
    curvePath(pts);
    ctx.stroke();
    ctx.restore();

    /* 当前站点前后两段点亮 */
    if (state.reveal > .2) {
      var a = state.active;
      [a - 1, a].forEach(function (idx) {
        if (idx < 0 || idx + 1 >= pts.length) return;
        var p1 = pts[idx], p2 = pts[idx + 1];
        var mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
        ctx.save();
        ctx.globalAlpha = .9;
        ctx.strokeStyle = "#D98A4B";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(mx, my - 10, p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      });
    }

    /* 节点 */
    nodes.forEach(function (nd, i) {
      var p = project(nd);
      var active = i === state.active;
      var hovered = i === state.hover;
      var grow = easeOut(clamp(state.nodeT * 1.4 - i * .06, 0, 1));
      var r = (active ? 11 : 8.5) * (.6 + grow * .4);
      if (p.x < -80 || p.x > cw + 80 || p.y < -80 || p.y > chh + 80) return;

      if (active) {
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 70);
        g.addColorStop(0, "rgba(217,138,75,.22)");
        g.addColorStop(1, "rgba(217,138,75,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, 70, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 20 + Math.sin(state.pulse * 1.6) * 2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(217,138,75,.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = active ? "#D98A4B" : "#0E1A18";
      ctx.fill();
      ctx.lineWidth = active ? 1.5 : 1.2;
      ctx.strokeStyle = active ? "#D98A4B" : (hovered ? "#E7E4D8" : "rgba(231,228,216,.55)");
      ctx.stroke();

      ctx.fillStyle = active ? "#0E1A18" : "rgba(231,228,216,.72)";
      ctx.font = (active ? '500 9px ' : '500 8px ') + '"KS Mono", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(pad(i + 1), p.x, p.y + .5);

      /* 桌面全显；手机上放大到能读时才显，总览时只留当前站 */
      if (!isMobile() || active || state.cam.zoom > .55) {
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = active ? "#E7E4D8" : "rgba(231,228,216,.72)";
        var fs = active ? 13 : (isMobile() ? 10.5 : 11);
        ctx.font = (active ? '700 ' + fs + 'px ' : '500 ' + fs + 'px ') + '"KS Grotesk", "PingFang SC", sans-serif';
        ctx.fillText(nd.data.place || "", p.x, p.y - 17);
        ctx.fillStyle = active ? "#D98A4B" : "rgba(231,228,216,.38)";
        ctx.font = '400 9px "KS Mono", monospace';
        ctx.fillText(year(nd.data.date), p.x, p.y + 24);
      }
    });
  }

  function drawGrid() {
    var s = 28 * state.cam.zoom;
    if (s < 9) s = 9;
    var ox = (-state.cam.x * state.cam.zoom + cw / 2) % s;
    var oy = (-state.cam.y * state.cam.zoom + chh / 2) % s;
    ctx.fillStyle = "rgba(231,228,216,.10)";
    for (var x = ox; x < cw; x += s) {
      for (var y = oy; y < chh; y += s) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function loop(ts) {
    draw(ts);
    requestAnimationFrame(loop);
  }

  /* ---------- 面板 ---------- */
  var img = $("#panelImg");
  var ui = {
    index: $("#panelIndex"), tag: $("#panelTag"), date: $("#panelDate"),
    place: $("#panelPlace"), caption: $("#panelCaption"), note: $("#panelNote")
  };
  var firstPanel = true;

  function updatePanel(i, animate) {
    var c = chapters[i];
    if (!c) return;
    ui.index.textContent = pad(i + 1);
    ui.tag.textContent = c.tag || "站";
    ui.date.textContent = dot(c.date);
    ui.date.setAttribute("datetime", c.date || "");
    ui.place.textContent = c.place || "";
    ui.caption.textContent = c.caption || "";
    ui.note.textContent = c.note || "";
    if (img.getAttribute("src") !== c.photo) {
      img.src = c.photo;
      img.alt = (c.place || "第 " + (i + 1) + " 站") + "，" + dot(c.date);
      if (hasGsap && animate && !reduce) {
        gsap.fromTo(img, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)", duration: .85, ease: "power3.out" });
      }
    }
    if (hasGsap && animate && !reduce) {
      gsap.fromTo([ui.date, ui.place, ui.caption],
        { y: 14, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: .5, stagger: .06, ease: "power2.out", overwrite: true });
    }
    firstPanel = false;
  }

  function updateRail(i) {
    $$(".rail button").forEach(function (b, j) {
      b.setAttribute("aria-current", j === i ? "true" : "false");
    });
  }

  function select(i, opts) {
    if (!n) return;
    opts = opts || {};
    i = ((i % n) + n) % n;
    state.active = i;
    updatePanel(i, !firstPanel);
    updateRail(i);
    if (opts.focus) focusNode(i, true);
    var chip = $$(".rail button")[i];
    if (chip && chip.parentNode && window.matchMedia("(max-width: 900px)").matches) {
      chip.parentNode.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
    }
  }

  /* ---------- 指针：拖动 / 缩放 / 点站 ---------- */
  function hitTest(sx, sy) {
    var best = -1, bd = 30;
    nodes.forEach(function (nd, i) {
      var p = project(nd);
      var d = Math.hypot(p.x - sx, p.y - sy);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }

  canvas.addEventListener("pointerdown", function (e) {
    stopTour();
    state.userMoved = true;
    pointer.id = e.pointerId;
    pointer.x = pointer.sx = e.clientX;
    pointer.y = pointer.sy = e.clientY;
    pointer.down = true;
    state.dragging = true;
    state.moved = false;
    canvas.classList.add("is-grabbing");
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  });

  canvas.addEventListener("pointermove", function (e) {
    var r = canvas.getBoundingClientRect();
    var sx = e.clientX - r.left, sy = e.clientY - r.top;

    if (!pointer.down) {
      var h = hitTest(sx, sy);
      if (h !== state.hover) {
        state.hover = h;
        canvas.classList.toggle("is-pointing", h > -1);
      }
      return;
    }
    if (pointer.id !== e.pointerId) return;
    var dx = e.clientX - pointer.x;
    var dy = e.clientY - pointer.y;
    if (Math.abs(e.clientX - pointer.sx) + Math.abs(e.clientY - pointer.sy) > 5) state.moved = true;
    state.cam.x -= dx / state.cam.zoom;
    state.cam.y -= dy / state.cam.zoom;
    clampCam();
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });

  canvas.addEventListener("pointerup", function (e) {
    if (pointer.id !== e.pointerId) return;
    pointer.down = false;
    state.dragging = false;
    canvas.classList.remove("is-grabbing");
    if (!state.moved) {
      var r = canvas.getBoundingClientRect();
      var i = hitTest(e.clientX - r.left, e.clientY - r.top);
      if (i > -1) {
        select(i, { focus: false });
        if (window.matchMedia("(max-width: 900px)").matches) {
          setTimeout(function () { panel.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }, 160);
        }
      }
    }
  });
  canvas.addEventListener("pointercancel", function () {
    pointer.down = false; state.dragging = false;
    canvas.classList.remove("is-grabbing");
  });
  canvas.addEventListener("pointerleave", function () {
    if (!pointer.down) { state.hover = -1; canvas.classList.remove("is-pointing"); }
  });

  /* 双指缩放的简化处理：第二个触点按下时记录距离 */
  var touches = {};
  canvas.addEventListener("pointerdown", function (e) {
    touches[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(touches);
    if (ids.length === 2) {
      var a = touches[ids[0]], b = touches[ids[1]];
      pinch.dist = Math.hypot(a.x - b.x, a.y - b.y);
      pinch.zoom = state.cam.zoom;
    }
  }, true);
  canvas.addEventListener("pointermove", function (e) {
    if (touches[e.pointerId]) touches[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(touches);
    if (ids.length === 2 && pinch.dist > 0) {
      var a = touches[ids[0]], b = touches[ids[1]];
      var d = Math.hypot(a.x - b.x, a.y - b.y);
      var mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      var before = unproject(mid.x - canvas.getBoundingClientRect().left, mid.y - canvas.getBoundingClientRect().top);
      state.cam.zoom = clamp(pinch.zoom * d / pinch.dist, isMobile() ? .18 : .35, 2.4);
      var after = unproject(mid.x - canvas.getBoundingClientRect().left, mid.y - canvas.getBoundingClientRect().top);
      state.cam.x += before.x - after.x;
      state.cam.y += before.y - after.y;
      state.moved = true;
      state.userMoved = true;
      clampCam();
    }
  }, true);
  function clearTouch(e) { delete touches[e.pointerId]; if (Object.keys(touches).length < 2) pinch.dist = 0; }
  canvas.addEventListener("pointerup", clearTouch, true);
  canvas.addEventListener("pointercancel", clearTouch, true);

  canvas.addEventListener("wheel", function (e) {
    e.preventDefault();
    stopTour();
    state.userMoved = true;
    var r = canvas.getBoundingClientRect();
    var mx = e.clientX - r.left, my = e.clientY - r.top;
    var before = unproject(mx, my);
    var factor = Math.exp(-e.deltaY * .0014);
    state.cam.zoom = clamp(state.cam.zoom * factor, isMobile() ? .18 : .35, 2.4);
    var after = unproject(mx, my);
    state.cam.x += before.x - after.x;
    state.cam.y += before.y - after.y;
    clampCam();
  }, { passive: false });

  /* ---------- 控件 ---------- */
  $("#zoomIn").addEventListener("click", function () {
    stopTour(); state.userMoved = true;
    moveCam(state.cam.x, state.cam.y, state.cam.zoom * 1.25, true, .45);
  });
  $("#zoomOut").addEventListener("click", function () {
    stopTour(); state.userMoved = true;
    moveCam(state.cam.x, state.cam.y, state.cam.zoom / 1.25, true, .45);
  });
  $("#fitBtn").addEventListener("click", function () {
    stopTour(); state.userMoved = false; fit(true);
  });
  $("#prevBtn").addEventListener("click", function () { stopTour(); select(state.active - 1, { focus: true }); });
  $("#nextBtn").addEventListener("click", function () { stopTour(); select(state.active + 1, { focus: true }); });

  /* 自动走一遍 */
  var tourTimer = null, tourStep = 0, tourCount = 0;
  var tourBtn = $("#tourBtn");
  function stopTour() {
    if (tourTimer) { clearTimeout(tourTimer); tourTimer = null; }
    tourCount = 0;
    tourBtn.setAttribute("aria-pressed", "false");
    tourBtn.textContent = "走一遍";
  }
  function startTour() {
    if (tourTimer) { stopTour(); return; }
    tourBtn.setAttribute("aria-pressed", "true");
    tourBtn.textContent = "停一下";
    tourStep = state.active;
    tourCount = 0;
    (function step() {
      if (!tourTimer && tourCount > 0) return;
      select(tourStep, { focus: true });
      tourStep = (tourStep + 1) % n;
      tourCount++;
      if (tourCount >= n) { tourTimer = setTimeout(stopTour, 2400); return; }
      tourTimer = setTimeout(step, 2600);
    })();
  }
  tourBtn.addEventListener("click", startTour);

  document.addEventListener("keydown", function (e) {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === "ArrowRight") { stopTour(); select(state.active + 1, { focus: true }); }
    if (e.key === "ArrowLeft") { stopTour(); select(state.active - 1, { focus: true }); }
    if (e.key === "Escape") stopTour();
  });

  /* ---------- 启动 ---------- */
  layout();
  resize();
  select(0, { focus: false });
  if (isMobile()) {
    moveCam(nodes[0].x, nodes[0].y + 26, .7, false);
  } else {
    fit(false);
  }

  if (hasGsap && !reduce) {
    var titleZh = $(".title-zh");
    if (titleZh) {
      var raw = titleZh.textContent;
      titleZh.textContent = "";
      var chars = [];
      Array.from(raw).forEach(function (ch) {
        var sp = document.createElement("span");
        sp.className = "tch";
        sp.style.display = "inline-block";
        sp.textContent = ch;
        titleZh.appendChild(sp);
        chars.push(sp);
      });
      gsap.from(chars, { yPercent: 115, skewY: 5, duration: 1, stagger: .06, ease: "power4.out", delay: .1 });
    }
    gsap.from(".kicker, .intro, .mast-foot", { autoAlpha: 0, y: 10, duration: .7, stagger: .08, delay: .2 });
    gsap.from(panel, { autoAlpha: 0, x: 18, duration: .9, ease: "power3.out", delay: .25 });
    gsap.to(state, { reveal: 1, nodeT: 1, duration: 1.6, ease: "power2.out", delay: .45 });
  } else {
    state.reveal = 1; state.nodeT = 1;
  }

  requestAnimationFrame(loop);

  var rt = null;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      resize();
      if (!state.userMoved) fit(false); else focusNode(state.active, false);
    }, 160);
  });

  /* 预载照片，点站时不空白 */
  setTimeout(function () {
    chapters.forEach(function (c) { var im = new Image(); im.src = c.photo; });
  }, 900);
})();
