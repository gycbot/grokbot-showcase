/* ============================================================
   盒里的一句 · 三维场景
   原始几何：一枚圆角锁骨盒（车削/挤出、铰链、搭扣、内衬、刻字）。
   无外部模型、无付费插件。three.js r149 UMD（MIT），自托管。
   ============================================================ */
(function () {
  "use strict";

  var cfg = window.KEEPSAKE || {};
  var hasThree = !!window.THREE;
  var hasGsap = !!window.gsap && !!window.ScrollTrigger;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas = document.getElementById("scene");
  var fallback = document.getElementById("fallback");
  var chapters = Array.isArray(cfg.chapters) ? cfg.chapters : [];

  var A = cfg.personA || { name: "周予安" };
  var B = cfg.personB || { name: "梁清和" };
  var metY = (/^(\d{4})/.exec(String(cfg.metOn || "2018")) || [0, "2018"])[1];
  var annY = (/^(\d{4})/.exec(String(cfg.anniversary || "2026")) || [0, "2026"])[1];

  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function text(sel, val) { if (val != null && val !== "") $$(sel).forEach(function (el) { el.textContent = val; }); }

  function splitChars(el) {
    if (!el) return [];
    var raw = el.textContent;
    el.setAttribute("data-raw", raw);
    el.textContent = "";
    var out = [];
    Array.from(raw).forEach(function (ch) {
      if (ch === " ") {
        var sp = document.createElement("span");
        sp.className = "sp";
        el.appendChild(sp);
        return;
      }
      var mask = document.createElement("span");
      mask.className = "ch";
      var inner = document.createElement("i");
      inner.textContent = ch;
      mask.appendChild(inner);
      el.appendChild(mask);
      out.push(inner);
    });
    return out;
  }

  /* ---------- 文案 ---------- */
  document.title = (cfg.title || "盒里的一句") + " · " + A.name + "与" + B.name;
  text('[data-bind="title"]', cfg.title);
  text('[data-bind="eyebrow"]', cfg.eyebrow);
  text('[data-bind="heroLine"]', cfg.heroLine);
  text('[data-bind="nameA"]', A.name);
  text('[data-bind="nameB"]', B.name);
  text('[data-bind="years"]', metY + " — " + annY);
  text('[data-bind="inside"]', cfg.inside);
  text('[data-bind="closing"]', cfg.closing);
  text('[data-bind="photoCaption"]', cfg.photoCaption);
  var photoEl = $('[data-bind="photo"]');
  if (photoEl && cfg.photo) {
    photoEl.src = cfg.photo;
    if (cfg.photoAlt) photoEl.alt = cfg.photoAlt;
  }
  chapters.forEach(function (c, i) {
    text('[data-bind="no' + i + '"]', c.no);
    text('[data-bind="label' + i + '"]', c.label);
    text('[data-bind="title' + i + '"]', c.title);
    text('[data-bind="body' + i + '"]', c.body);
  });

  /* ---------- 信物尺寸与场景 ---------- */
  var renderer, scene, camera, tokenRoot, token, lidPivot, keyLight, rimLight, pointLight;
  var pointer = { x: 0, y: 0 };
  var sceneReady = false;

  function webglOK() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  function ovalShape(rx, ry) {
    var s = new THREE.Shape();
    s.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
    return s;
  }

  function roundedShape(w, h, r) {
    var s = new THREE.Shape();
    var x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  function remapUV(geo, w, h) {
    var pos = geo.attributes.position, uv = geo.attributes.uv;
    for (var i = 0; i < pos.count; i++) {
      uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
    }
    uv.needsUpdate = true;
  }

  function textTexture(w, h, draw) {
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    var g = c.getContext("2d");
    g.clearRect(0, 0, w, h);
    draw(g, w, h);
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }

  function roughTexture() {
    var c = document.createElement("canvas");
    c.width = 512; c.height = 512;
    var g = c.getContext("2d");
    g.fillStyle = "#8a8a8a"; g.fillRect(0, 0, 512, 512);
    for (var i = 0; i < 900; i++) {
      var y = Math.random() * 512;
      var v = 120 + Math.random() * 90;
      g.strokeStyle = "rgba(" + v + "," + v + "," + v + "," + (0.05 + Math.random() * .22) + ")";
      g.lineWidth = .6 + Math.random() * 1.6;
      g.beginPath(); g.moveTo(0, y); g.lineTo(512, y + (Math.random() * 2 - 1)); g.stroke();
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    return t;
  }

  function velvetTexture() {
    var c = document.createElement("canvas");
    c.width = 512; c.height = 512;
    var g = c.getContext("2d");
    g.fillStyle = "#170E0F"; g.fillRect(0, 0, 512, 512);
    var rg = g.createRadialGradient(256, 230, 20, 256, 256, 300);
    rg.addColorStop(0, "#5A3A3C");
    rg.addColorStop(.55, "#301C1D");
    rg.addColorStop(1, "#170D0E");
    g.fillStyle = rg; g.fillRect(0, 0, 512, 512);
    for (var i = 0; i < 9000; i++) {
      var v = 20 + Math.random() * 34;
      g.fillStyle = "rgba(" + (v + 16) + "," + v + "," + v + "," + (Math.random() * .5) + ")";
      g.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
    }
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  function envMap() {
    var c = document.createElement("canvas");
    c.width = 1024; c.height = 512;
    var g = c.getContext("2d");
    var lg = g.createLinearGradient(0, 0, 0, 512);
    lg.addColorStop(0, "#ded8cb");
    lg.addColorStop(.28, "#8d8d86");
    lg.addColorStop(.52, "#3a3c3a");
    lg.addColorStop(.78, "#151817");
    lg.addColorStop(1, "#050706");
    g.fillStyle = lg; g.fillRect(0, 0, 1024, 512);

    function soft(x, y, rx, ry, col) {
      var rg = g.createRadialGradient(x, y, 0, x, y, rx);
      rg.addColorStop(0, col);
      rg.addColorStop(1, "rgba(255,255,255,0)");
      g.save();
      g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y);
      g.fillStyle = rg;
      g.beginPath(); g.arc(x, y, rx, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    soft(250, 90, 190, 120, "rgba(255,248,236,.98)");
    soft(760, 130, 120, 200, "rgba(214,229,228,.85)");
    soft(560, 300, 220, 90, "rgba(224,168,116,.5)");
    soft(80, 260, 120, 160, "rgba(120,140,140,.45)");

    var tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    var env = pmrem.fromEquirectangular(tex).texture;
    tex.dispose();
    pmrem.dispose();
    return env;
  }

  function buildScene() {
    if (!hasThree || !webglOK()) { noWebGL(); return; }

    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) { noWebGL(); return; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .92;

    scene = new THREE.Scene();
    scene.environment = envMap();

    camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, .1, 100);
    camera.position.set(0, .12, 5.2);

    tokenRoot = new THREE.Group();
    scene.add(tokenRoot);
    token = new THREE.Group();
    tokenRoot.add(token);

    var bronzeRough = roughTexture();
    var silver = new THREE.MeshStandardMaterial({ color: 0xB9B1A6, metalness: 1, roughness: .62, roughnessMap: bronzeRough, envMapIntensity: 1.35 });
    var velvetTex = velvetTexture();
    var dark = new THREE.MeshBasicMaterial({ map: velvetTex, color: 0xffffff });
    var gold = new THREE.MeshStandardMaterial({ color: 0xC9A676, metalness: .95, roughness: .34, envMapIntensity: 1.1 });

    var W = 2.5, H = 1.64, R = .34;

    /* 盒身 */
    var baseGeo = new THREE.ExtrudeGeometry(ovalShape(W / 2 - .01, H / 2 - .01), {
      depth: .16, bevelEnabled: true, bevelThickness: .045, bevelSize: .045, bevelSegments: 4, curveSegments: 28
    });
    baseGeo.center();
    var baseMesh = new THREE.Mesh(baseGeo, silver);
    baseMesh.position.z = -.02;
    token.add(baseMesh);

    /* 内衬 */
    var velvetGeo = new THREE.ShapeGeometry(ovalShape((W - .3) / 2, (H - .3) / 2), 48);
    remapUV(velvetGeo, W - .3, H - .3);
    var velvet = new THREE.Mesh(velvetGeo, dark);
    velvet.position.z = .132;
    token.add(velvet);

    /* 内衬细金边 */
    var rimPts = ovalShape((W - .34) / 2, (H - .34) / 2).getPoints(64).map(function (p) {
      return new THREE.Vector3(p.x, p.y, .145);
    });
    var rimGeo = new THREE.BufferGeometry().setFromPoints(rimPts);
    var rim = new THREE.LineLoop(rimGeo, new THREE.LineBasicMaterial({ color: 0x8E7458, transparent: true, opacity: .75 }));
    token.add(rim);

    /* 里层刻字 */
    var insideTex = textTexture(1024, 512, function (g, w, h) {
      g.textAlign = "center";
      g.fillStyle = "#D9B888";
      g.font = '600 74px "KS Display", "Songti SC", serif';
      g.fillText(cfg.inside || "把伞偏向你那一侧。", w / 2, 238);
      g.fillStyle = "rgba(217,184,136,.92)";
      g.font = '400 36px "KS Mono", monospace';
      g.fillText(cfg.insideSmall || "已经八年。", w / 2, 312);
    });
    var inside = new THREE.Mesh(
      new THREE.PlaneGeometry(1.62, .81),
      new THREE.MeshBasicMaterial({ map: insideTex, transparent: true, depthWrite: false })
    );
    inside.position.z = .146;
    token.add(inside);

    /* 盒盖：铰链在顶边 */
    lidPivot = new THREE.Group();
    lidPivot.position.set(0, H / 2, .08);
    token.add(lidPivot);

    var lidGeo = new THREE.ExtrudeGeometry(ovalShape(W / 2 - .01, H / 2 - .01), {
      depth: .12, bevelEnabled: true, bevelThickness: .04, bevelSize: .04, bevelSegments: 4, curveSegments: 28
    });
    lidGeo.center();
    var lid = new THREE.Mesh(lidGeo, silver);
    lid.position.set(0, -H / 2, 0);
    lidPivot.add(lid);

    /* 外盖刻字 */
    var outerTex = textTexture(1024, 512, function (g, w, h) {
      g.textAlign = "center";
      g.fillStyle = "rgba(38,31,26,.92)";
      g.font = '600 66px "KS Display", "Songti SC", serif';
      g.fillText(cfg.engraving && cfg.engraving.names ? cfg.engraving.names : A.name + " · " + B.name, w / 2, 236);
      g.fillStyle = "rgba(38,31,26,.62)";
      g.font = '400 34px "KS Mono", monospace';
      g.fillText(cfg.engraving && cfg.engraving.years ? cfg.engraving.years : metY + " — " + annY, w / 2, 306);
      g.strokeStyle = "rgba(38,31,26,.22)";
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(w / 2 - 130, 340); g.lineTo(w / 2 + 130, 340); g.stroke();
    });
    var outer = new THREE.Mesh(
      new THREE.PlaneGeometry(1.92, .96),
      new THREE.MeshBasicMaterial({ map: outerTex, transparent: true, depthWrite: false })
    );
    outer.position.set(0, -H / 2, .112);
    lidPivot.add(outer);

    /* 盒盖内侧：深色绒面，打开时看到 */
    var lidInnerGeo = new THREE.ShapeGeometry(ovalShape((W - .18) / 2, (H - .18) / 2), 48);
    remapUV(lidInnerGeo, W - .18, H - .18);
    var lidInner = new THREE.Mesh(
      lidInnerGeo,
      new THREE.MeshBasicMaterial({ map: velvetTex, color: 0xffffff, side: THREE.DoubleSide })
    );
    lidInner.position.set(0, -H / 2, -.112);
    var lidLinePts = ovalShape(.55, .34).getPoints(48).map(function (p) {
      return new THREE.Vector3(p.x, -H / 2 + p.y, -.12);
    });
    var lidLine = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(lidLinePts),
      new THREE.LineBasicMaterial({ color: 0xC9A676, transparent: true, opacity: .55 })
    );
    lidPivot.add(lidLine);
    lidPivot.add(lidInner);

    /* 铰链 */
    var hingeGeo = new THREE.CylinderGeometry(.045, .045, .3, 16);
    var hinge = new THREE.Mesh(hingeGeo, silver);
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(0, H / 2 + .01, -.02);
    token.add(hinge);

    /* 搭扣（跟着盒盖） */
    var clasp = new THREE.Mesh(new THREE.SphereGeometry(.045, 18, 12), gold);
    clasp.scale.set(1, .7, .6);
    clasp.position.set(0, -H / 2 + .03, .1);
    token.add(clasp);

    /* 面上的一圈细线 */
    var faceLinePts = ovalShape(W / 2 - .19, H / 2 - .19).getPoints(72).map(function (p) {
      return new THREE.Vector3(p.x, -H / 2 + p.y, .115);
    });
    var faceLine = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(faceLinePts),
      new THREE.LineBasicMaterial({ color: 0x6E6257, transparent: true, opacity: .55 })
    );
    lidPivot.add(faceLine);

    /* 顶环 */
    var bail = new THREE.Mesh(new THREE.TorusGeometry(.12, .026, 12, 28), silver);
    bail.position.set(0, H / 2 + .16, 0);
    token.add(bail);
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(.035, .045, .1, 16), silver);
    neck.position.set(0, H / 2 + .04, 0);
    token.add(neck);

    /* 光 */
    scene.add(new THREE.AmbientLight(0xffffff, .22));
    keyLight = new THREE.DirectionalLight(0xFFE1BE, 1.9);
    keyLight.position.set(3.2, 4.2, 5);
    scene.add(keyLight);
    rimLight = new THREE.DirectionalLight(0x9FC3C0, 1.05);
    rimLight.position.set(-4, 1.6, -2.4);
    scene.add(rimLight);
    pointLight = new THREE.PointLight(0xD19A66, 1.25, 12);
    pointLight.position.set(2, 1, 3.2);
    scene.add(pointLight);
    var fill = new THREE.DirectionalLight(0x8899A0, .6);
    fill.position.set(-2, -2, 4);
    scene.add(fill);

    tokenRoot.position.set(0, .05, 0);
    sceneReady = true;
    layoutScene();
    bindPointer();
    bindScroll();
    tick();
  }

  function noWebGL() {
    if (fallback) fallback.hidden = false;
    document.body.classList.add("no3d");
    if (hasGsap) {
      $$(".chapter h2, .body, .inside-quote, .hero-title").forEach(function (el) {
        el.style.opacity = "1";
      });
    }
  }

  function isMobile() { return window.innerWidth <= 900; }

  function layoutScene() {
    if (!sceneReady) return;
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (isMobile()) {
      token.scale.setScalar(.4);
      tokenRoot.position.set(0, .62, 0);
      camera.position.set(0, .2, 5.4);
    } else {
      token.scale.setScalar(.72);
      tokenRoot.position.set(.85, .04, 0);
      camera.position.set(0, .1, 5.2);
    }
    camera.lookAt(0, 0, 0);
  }

  function bindPointer() {
    if (!hasGsap || reduce) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var ry = gsap.quickTo(tokenRoot.rotation, "y", { duration: 1.1, ease: "power3.out" });
    var rx = gsap.quickTo(tokenRoot.rotation, "x", { duration: 1.1, ease: "power3.out" });
    window.addEventListener("pointermove", function (e) {
      var nx = e.clientX / window.innerWidth - .5;
      var ny = e.clientY / window.innerHeight - .5;
      ry(nx * .16);
      rx(-ny * .1);
    });
  }

  /* ---------- 滚动 ---------- */
  var master = null;
  function bindScroll() {
    if (!hasGsap) return;
    if (master) { master.scrollTrigger && master.scrollTrigger.kill(); master.kill(); master = null; }

    if (reduce) {
      token.rotation.set(0, .18, 0);
      lidPivot.rotation.x = -1.9;
      camera.position.set(0, .4, 4.6);
      return;
    }

    var z = isMobile() ? [5.4, 5.1, 5.0, 5.0, 5.8] : [5.2, 4.9, 4.8, 5.0, 5.6];
    master = gsap.timeline({
      scrollTrigger: {
        trigger: ".story", start: "top top", end: "bottom bottom", scrub: .8,
        invalidateOnRefresh: true
      }
    });
    master
      .to(camera.position, { z: z[1], y: .3, duration: 1, ease: "none" }, 0)
      .to(token.rotation, { y: -.3, duration: 1, ease: "none" }, 0)
      .to(lidPivot.rotation, { x: -1.9, duration: 1.15, ease: "power1.inOut" }, 1.02)
      .to(camera.position, { z: z[2], y: .5, duration: 1.2, ease: "none" }, 1.35)
      .to(token.rotation, { y: .12, duration: 1.1, ease: "none" }, 1.35)
      .to(camera.position, { z: z[3], y: .55, duration: 1.1, ease: "none" }, 2.5)
      .to(token.rotation, { y: .26, duration: 1.1, ease: "none" }, 2.5)
      .to(lidPivot.rotation, { x: -.16, duration: .95, ease: "power1.inOut" }, 3.4)
      .to(camera.position, { z: z[4], y: .18, duration: .95, ease: "none" }, 3.4)
      .to(token.rotation, { y: 0, duration: .95, ease: "none" }, 3.4);
  }

  /* ---------- 色温 / 导航 / 文字 ---------- */
  function bindStory() {
    var navBtns = $$(".chapter-nav button");
    var sections = $$(".chapter[data-chapter]");
    var navProgress = $("#navProgress");

    ScrollTrigger.create({
      trigger: ".hero", start: "top 55%", end: "bottom 45%",
      onEnter: function () { document.body.setAttribute("data-tone", "0"); navBtns.forEach(function (b) { b.setAttribute("aria-current", "false"); }); },
      onEnterBack: function () { document.body.setAttribute("data-tone", "0"); navBtns.forEach(function (b) { b.setAttribute("aria-current", "false"); }); }
    });
    sections.forEach(function (sec, i) {
      ScrollTrigger.create({
        trigger: sec, start: "top 55%", end: "bottom 45%",
        onEnter: function () { setTone(sec.getAttribute("data-tone"), i); },
        onEnterBack: function () { setTone(sec.getAttribute("data-tone"), i); }
      });
    });

    function setTone(tone, i) {
      document.body.setAttribute("data-tone", tone);
      navBtns.forEach(function (b, j) { b.setAttribute("aria-current", j === i ? "true" : "false"); });
      var colors = [0xC58B5C, 0x89A7AE, 0xD19A66, 0xE0A874, 0xB08A6A];
      if (pointLight) {
        var c = new THREE.Color(colors[Math.min(i + 1, 4)]);
        gsap.to(pointLight.color, { r: c.r, g: c.g, b: c.b, duration: 1 });
      }
    }

    navBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.getAttribute("data-go");
        var target = document.getElementById("ch-" + (i + 1));
        if (target) target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });
    });

    if (navProgress) {
      ScrollTrigger.create({
        trigger: ".story", start: "top top", end: "bottom bottom",
        onUpdate: function (self) {
          gsap.set(navProgress, { scaleX: self.progress });
          if (self.progress < .04) navBtns.forEach(function (b) { b.setAttribute("aria-current", "false"); });
        }
      });
    }

    /* 文字：标题逐字、正文逐字（不用 SplitText）；减少动效时直接显示 */
    if (reduce) return;
    var hero = $(".hero-title");
    if (hero) {
      var hc = splitChars(hero);
      gsap.from(hc, { yPercent: 118, duration: 1.15, stagger: .07, ease: "power4.out", delay: .15 });
      gsap.from(".hero .eyebrow, .hero-line, .cue", { autoAlpha: 0, y: 14, duration: .8, stagger: .1, delay: .45 });
    }

    $$(".chapter h2").forEach(function (h) {
      var chars = splitChars(h);
      var body = h.parentNode.querySelector(".body");
      var bchars = body ? splitChars(body) : [];
      var quote = h.parentNode.querySelector(".inside-quote");
      var qchars = quote ? splitChars(quote) : [];
      var extras = Array.prototype.slice.call(h.parentNode.querySelectorAll(".memento, .closing, .actions"));
      gsap.set(chars, { yPercent: 115 });
      gsap.set(bchars, { yPercent: 112 });
      gsap.set(qchars, { yPercent: 112 });
      var tl = gsap.timeline({
        scrollTrigger: { trigger: h.parentNode, start: "top 85%", end: "bottom 30%", toggleActions: "play none none reverse" }
      });
      tl.to(chars, { yPercent: 0, duration: .9, stagger: .045, ease: "power3.out" }, 0)
        .to(bchars, { yPercent: 0, duration: .7, stagger: .0045, ease: "power2.out" }, .25)
        .to(qchars, { yPercent: 0, duration: .8, stagger: .02, ease: "power2.out" }, .55);
      if (extras.length) tl.from(extras, { autoAlpha: 0, y: 16, duration: .7, stagger: .08 }, .6);
    });
  }

  /* ---------- 渲染循环 ---------- */
  function tick() {
    if (!sceneReady) return;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  function init() {
    if (!hasGsap) {
      if (fallback) { fallback.hidden = false; fallback.querySelector("p").textContent = "动效脚本未加载，三维部分已关闭；文字与照片仍可完整阅读。"; }
      document.body.classList.add("no3d");
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    buildScene();
    bindStory();
    if (sceneReady && reduce) bindScroll();
  }

  function ready() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(init).catch(init);
    } else {
      init();
    }
  }

  var rt = null;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      layoutScene();
      if (sceneReady) bindScroll();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 180);
  });

  /* three / gsap 都是 defer，本脚本最后执行 */
  if (document.readyState === "complete") ready();
  else window.addEventListener("load", ready);
})();
