import * as THREE from '../vendor/three.module.js';
import { EffectComposer } from '../vendor/addons/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../vendor/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../vendor/addons/postprocessing/OutputPass.js';

gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById('scene');
const warm = document.getElementById('warm');
const qa = window.__GKK_GEMS__ = {
  page: 'gems', ready: false, errors: [], programs: 0, focus: 0, webgl: false,
  reduced: matchMedia('(prefers-reduced-motion: reduce)').matches
};
window.addEventListener('error', e => qa.errors.push(String(e.message || e.error || 'error')));
window.addEventListener('unhandledrejection', e => qa.errors.push(String(e.reason || 'rejection')));

const GEMS = [
  {
    key: 'draft', name: '速写', en: 'DRAFT', css: '#d9d2ff', color: 0xcfd3dc, accent: 0xe8e4ff, ior: 2.42,
    geo: { sides: 24, sx: 0.86, sz: 0.86, table: 0.5, crown: 0.3, pav: 1.02 },
    line: '把散在聊天里的要点，收成一页能发的稿。',
    prompt: '把这份访谈整理成 600 字，保留原话，不要总结腔。',
    fit: '适合：访谈、会议记录、长文初稿'
  },
  {
    key: 'motion', name: '动效', en: 'MOTION', css: '#a970ff', color: 0x7a3cff, accent: 0xd2b4ff, ior: 2.2,
    geo: { sides: 24, sx: 0.72, sz: 1.06, table: 0.54, crown: 0.28, pav: 0.98 },
    line: '一句话说清要动什么，它直接写页面。',
    prompt: '做一个 8 秒的产品开场，先给静帧关键帧。',
    fit: '适合：产品开场、滚动叙事、H5'
  },
  {
    key: 'verify', name: '核源', en: 'VERIFY', css: '#5b7cff', color: 0x2f55e8, accent: 0x9db4ff, ior: 1.95,
    geo: { sides: 8, sx: 0.78, sz: 1.02, table: 0.66, crown: 0.18, pav: 0.82 },
    line: '每个数字都标出处，查不到就写查不到。',
    prompt: '这三条数据找原始来源，找不到的标 evidence_gap。',
    fit: '适合：财报、研报、事实核对'
  },
  {
    key: 'routine', name: '例程', en: 'ROUTINE', css: '#ff8a3d', color: 0xff6a1f, accent: 0xffc08a, ior: 2.05,
    geo: { sides: 18, sx: 0.8, sz: 1.08, table: 0.52, crown: 0.26, pav: 0.92, pear: true },
    line: '固定时间跑同一件事，交同一张表。',
    prompt: '每天早上八点抓这五个来源，按同一张表交。',
    fit: '适合：日报、监控、重复整理'
  },
  {
    key: 'translate', name: '转译', en: 'TRANSLATE', css: '#ff5fa2', color: 0xe83b82, accent: 0xffb3d0, ior: 2.15,
    geo: { sides: 16, sx: 0.56, sz: 1.3, table: 0.48, crown: 0.27, pav: 0.94 },
    line: '中英日换着说，语气不跑。',
    prompt: '把这封邮件翻成英文，保留拒绝的意思，不要变客气。',
    fit: '适合：邮件、字幕、发布文案'
  },
  {
    key: 'visual', name: '视觉', en: 'VISUAL', css: '#c9b8ff', color: 0xa98cff, accent: 0xe6dcff, ior: 2.3,
    geo: { sides: 3, sx: 1.0, sz: 0.98, table: 0.5, crown: 0.24, pav: 0.78 },
    line: '先出关键帧，再决定要不要渲。',
    prompt: '先给三张封面关键帧，别直接渲视频。',
    fit: '适合：封面、分镜、风格测试'
  }
];

const BASE = [
  [-2.45, 0.32, -0.2], [-1.42, 0.72, 0.15], [-0.52, 0.42, 0.46],
  [0.52, 0.55, 0.46], [1.42, 0.78, 0.15], [2.45, 0.32, -0.2]
];

const $ = id => document.getElementById(id);
const damp = (cur, goal, lambda, dt) => THREE.MathUtils.damp(cur, goal, lambda, dt);
const mobile = innerWidth < 861;
const spread = mobile ? 0.82 : 1.0;
let renderer, scene, camera, composer, envTex, floor, halo, haloMat, ring, ringMat;
let gemGroups = [], gemMeshes = [], gemMats = [], dust;
let raf = 0, last = 0, disposed = false, ready = false, paused = false, reduced = qa.reduced;
let focus = 0, autoTimer = null;
let pointerDown = null;
let bigAnim = null;

function envBackdrop() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#07060c'; g.fillRect(0, 0, 1024, 512);
  const blob = (x, y, r, col) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
  };
  blob(760, 150, 440, 'rgba(120,80,190,.85)');
  blob(180, 300, 380, 'rgba(52,78,170,.55)');
  blob(560, 470, 420, 'rgba(180,95,55,.4)');
  blob(470, 40, 300, 'rgba(240,235,255,.32)');
  // vertical soft strips for facet streaks
  for (let i = 0; i < 7; i++) {
    const x = 90 + i * 145;
    const gr = g.createLinearGradient(x, 0, x + 24, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)');
    gr.addColorStop(.5, 'rgba(255,255,255,' + (0.05 + (i % 3) * 0.03) + ')');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(x, 0, 34, 512);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeStudio(renderer) {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x050409);
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(18, 12, 18),
    new THREE.MeshBasicMaterial({ color: 0x0a0810, side: THREE.BackSide })
  );
  s.add(room);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(22, 32, 16), new THREE.MeshBasicMaterial({ map: envBackdrop(), side: THREE.BackSide }));
  s.add(dome);
  const panel = (w, h, hex, power, pos, rot) => {
    const c = new THREE.Color(hex).multiplyScalar(power);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.set(...rot);
    s.add(m);
  };
  panel(5.2, 4.4, 0xdce4ff, 3.2, [0, 5.1, 0], [Math.PI / 2, 0, 0]);
  panel(0.8, 5.4, 0xdce6ff, 4.8, [-4.6, 1.2, 2.2], [0, Math.PI / 2, 0]);
  panel(0.5, 4.6, 0xd9c2ff, 4.2, [4.6, 1.8, 1.0], [0, -Math.PI / 2, 0]);
  panel(2.6, 0.5, 0xffb47a, 2.6, [2.2, 0.9, -4.2], [0, 0, 0]);
  panel(3.0, 0.55, 0xffffff, 2.4, [-0.4, 1.4, 4.6], [0, Math.PI, 0]);
  panel(0.3, 4.8, 0xffffff, 2.0, [0.4, 1.5, -4.5], [0, 0, 0]);
  const rt = new THREE.WebGLCubeRenderTarget(256, {
    type: THREE.HalfFloatType,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter
  });
  const cam = new THREE.CubeCamera(0.1, 50, rt);
  cam.position.set(0, 0.6, 0);
  cam.update(renderer, s);
  s.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  return rt.texture;
}

function gemGeometry(g) {
  const { sides: n, sx, sz, table, crown, pav, pear } = g;
  const girdle = [], top = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2;
    let x = Math.cos(a) * sx, z = Math.sin(a) * sz;
    let tx = Math.cos(a) * sx * table, tz = Math.sin(a) * sz * table;
    if (pear) {
      const k = 0.58 + 0.42 * ((z / sz) + 1) / 2;
      x *= k; tx *= k;
    }
    girdle.push([x, 0, z]);
    top.push([tx, crown, tz]);
  }
  const pos = [];
  const tri = (a, b, c) => pos.push(...a, ...b, ...c);
  const centerTop = [0, crown, 0];
  const tip = [0, -pav, 0];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    tri(girdle[i], girdle[j], top[j]);
    tri(girdle[i], top[j], top[i]);
    tri(centerTop, top[i], top[j]);
    tri(girdle[j], girdle[i], tip);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  geo.center();
  geo.computeBoundingSphere();
  return geo;
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, 'rgba(255,255,255,.85)');
  r.addColorStop(.3, 'rgba(255,255,255,.28)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(256, 256, 10, 256, 256, 250);
  r.addColorStop(0, 'rgba(0,0,0,.85)');
  r.addColorStop(.45, 'rgba(0,0,0,.38)');
  r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 512, 512);
  return new THREE.CanvasTexture(c);
}

function buildScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x08070c);
  scene.fog = new THREE.FogExp2(0x08070c, 0.028);
  camera = new THREE.PerspectiveCamera(33, 1, 0.1, 90);
  envTex = makeStudio(renderer);

  floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x0a0810, roughness: 0.36, metalness: 0.5, envMap: envTex, envMapIntensity: 0.28 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.08;
  scene.add(floor);

  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, opacity: 0.55, depthWrite: false })
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(0, -1.07, 0.2);
  scene.add(contact);

  // one shared shader, cloned per gem: same program, different uniforms
  const baseMat = new THREE.ShaderMaterial({
    uniforms: {
      uEnv: { value: envTex },
      uColor: { value: new THREE.Color(0xffffff) },
      uAccent: { value: new THREE.Color(0xffffff) },
      uIOR: { value: 2.2 },
      uDim: { value: 1 },
      uLightDir: { value: new THREE.Vector3(-0.4, 0.8, 0.55).normalize() }
    },
    vertexShader: `
      varying vec3 vN;
      varying vec3 vW;
      varying vec3 vL;
      void main(){
        vL = position;
        vN = normalize(mat3(modelMatrix) * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: `
      uniform samplerCube uEnv;
      uniform vec3 uColor;
      uniform vec3 uAccent;
      uniform float uIOR;
      uniform float uDim;
      uniform vec3 uLightDir;
      varying vec3 vN;
      varying vec3 vW;
      varying vec3 vL;
      void main(){
        vec3 N = normalize(vN);
        vec3 V = normalize(cameraPosition - vW);
        if (dot(N, V) < 0.0) N = -N;
        vec3 I = -V;
        float ndv = clamp(dot(N, V), 0.0, 1.0);
        float F = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);

        vec3 rR = refract(I, N, 1.0 / (uIOR - 0.022));
        vec3 rG = refract(I, N, 1.0 / uIOR);
        vec3 rB = refract(I, N, 1.0 / (uIOR + 0.022));
        if (dot(rR, rR) < 1e-5) rR = reflect(I, N);
        if (dot(rG, rG) < 1e-5) rG = reflect(I, N);
        if (dot(rB, rB) < 1e-5) rB = reflect(I, N);

        vec3 envR = textureCube(uEnv, rR).rgb;
        vec3 envG = textureCube(uEnv, rG).rgb;
        vec3 envB = textureCube(uEnv, rB).rgb;
        vec3 trans = vec3(envR.r, envG.g, envB.b) * 1.15;

        vec3 N2 = normalize(N + normalize(vec3(0.42, 0.18, -0.28)) * 0.55);
        vec3 r2 = refract(I, N2, 1.0 / uIOR);
        if (dot(r2, r2) < 1e-5) r2 = reflect(I, N);
        vec3 inner = textureCube(uEnv, r2).rgb;
        trans = mix(trans, inner * 1.25, 0.32) * mix(vec3(1.0), uColor, 0.48);

        vec3 R = reflect(I, N);
        vec3 refl = textureCube(uEnv, R).rgb;
        vec3 bounce = textureCube(uEnv, refract(R, -N, 1.0 / uIOR)).rgb;
        float spec = pow(max(dot(reflect(-uLightDir, N), V), 0.0), 96.0);
        float key = pow(max(dot(N, normalize(vec3(-0.25, 0.9, 0.35))), 0.0), 4.0);
        vec3 col = trans * (1.0 - F) * 0.92 + refl * F * 1.6 + (refl * 0.12 + bounce * 0.10) * mix(vec3(1.0), uColor, 0.55)
          + uColor * spec * 0.62 + vec3(1.0) * spec * 0.14 + vec3(1.0) * key * 0.05;

        float edge = pow(1.0 - ndv, 4.0);
        col += uAccent * edge * 0.3;
        col += uAccent * pow(max(dot(N, normalize(vec3(-0.25, 0.9, 0.4))), 0.0), 10.0) * 0.18;
        col += uColor * pow(ndv, 4.0) * 0.05;
        col *= uDim;
        gl_FragColor = vec4(col, 1.0);
      }`
  });

  gemGroups = [];
  gemMeshes = [];
  gemMats = [];
  GEMS.forEach((g, i) => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uEnv: { value: envTex },
        uColor: { value: new THREE.Color(g.color) },
        uAccent: { value: new THREE.Color(g.accent) },
        uIOR: { value: g.ior },
        uDim: { value: i === 0 ? 1 : 0.3 },
        uLightDir: { value: new THREE.Vector3(-0.4, 0.8, 0.55).normalize() }
      },
      vertexShader: baseMat.vertexShader,
      fragmentShader: baseMat.fragmentShader,
      side: THREE.DoubleSide
    });
    const geo = gemGeometry(g.geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.index = i;
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo, 2),
      new THREE.LineBasicMaterial({ color: g.accent, transparent: true, opacity: 0.14, depthWrite: false })
    );
    edge.userData.isFacetEdge = true;
    const group = new THREE.Group();
    group.add(mesh);
    group.add(edge);
    group.position.set(BASE[i][0] * spread, BASE[i][1], BASE[i][2]);
    group.rotation.y = i * 0.9;
    group.scale.setScalar(i === 0 ? 1.15 : 0.46);
    scene.add(group);
    gemGroups.push(group);
    gemMeshes.push(mesh);
    gemMats.push(mat);
  });

  haloMat = new THREE.MeshBasicMaterial({
    map: glowTexture(), color: 0xd9d2ff, transparent: true, opacity: 0.3,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  });
  halo = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 3.8), haloMat);
  halo.position.set(0, 0.62, 0.75);
  scene.add(halo);

  ringMat = new THREE.MeshBasicMaterial({
    color: 0xd9d2ff, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  });
  ring = new THREE.Mesh(new THREE.RingGeometry(1.28, 1.31, 96), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, -1.06, 1.2);
  scene.add(ring);

  // sparse dust
  const N = 260, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 1] = Math.random() * 6 - 1;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 1;
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dust = new THREE.Points(dg, new THREE.PointsMaterial({
    color: 0xbca8e6, size: 0.016, transparent: true, opacity: 0.35,
    depthWrite: false, blending: THREE.AdditiveBlending, fog: false
  }));
  scene.add(dust);

  fitCamera();
}

function fitCamera() {
  if (!camera) return;
  const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
  const aspect = w / h;
  const mob = w < 700;
  camera.aspect = aspect;
  camera.fov = mob ? 36 : 32;
  camera.updateProjectionMatrix();
  camera.position.set(mob ? 0 : 0.2, 1.3, mob ? 10.2 : 8.8);
  camera.lookAt(mob ? 0 : 0.38, 0.62, 0);
  qa.cameraDistance = camera.position.z;
}

function setFocus(i, animate = true) {
  focus = ((i % GEMS.length) + GEMS.length) % GEMS.length;
  qa.focus = focus;
  const g = GEMS[focus];
  document.documentElement.style.setProperty('--accent', g.css);
  const apply = () => {
    $('bigIndex').textContent = String(focus + 1).padStart(2, '0');
    $('gemName').textContent = g.name;
    $('gemEn').textContent = g.en;
    $('dossierNo').textContent = 'FACET ' + String(focus + 1).padStart(2, '0') + ' / 06';
    $('gemLine').textContent = g.line;
    $('gemPrompt').textContent = g.prompt;
    $('gemFit').textContent = g.fit;
    document.querySelectorAll('.rail-item').forEach((b, idx) => {
      b.classList.toggle('on', idx === focus);
      b.setAttribute('aria-selected', String(idx === focus));
    });
    [...$('progress').children].forEach((s, idx) => s.classList.toggle('on', idx === focus));
  };
  if (!animate || !ready) { apply(); return; }
  const parts = [$('bigIndex'), $('gemName'), $('gemEn')];
  bigAnim?.kill();
  bigAnim = gsap.timeline({ defaults: { overwrite: true } })
    .to(parts, { autoAlpha: 0, y: 8, duration: 0.14, ease: 'power1.in' })
    .add(() => apply())
    .fromTo(parts, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.36, ease: 'power2.out' });
}

function buildRail() {
  const rail = $('rail');
  GEMS.forEach((g, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'rail-item' + (i === 0 ? ' on' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', String(i === 0));
    b.innerHTML = '<b>' + String(i + 1).padStart(2, '0') + '</b><span>' + g.name + '</span>';
    b.addEventListener('click', () => { setFocus(i); restartAuto(); });
    rail.append(b);
    const seg = document.createElement('span');
    seg.className = 'seg' + (i === 0 ? ' on' : '');
    $('progress').append(seg);
  });
}

function restartAuto() {
  if (autoTimer) { autoTimer.kill(); autoTimer = null; }
  if (paused || reduced || !ready) return;
  autoTimer = gsap.delayedCall(6.2, () => { setFocus(focus + 1); restartAuto(); });
}

function togglePlay() {
  paused = !paused;
  $('play').classList.toggle('paused', paused);
  $('play').setAttribute('aria-pressed', String(paused));
  $('play').setAttribute('aria-label', paused ? '继续自动轮播' : '暂停自动轮播');
  $('ctrlNote').textContent = paused ? '已暂停' : '自动 6s';
  if (paused) { if (autoTimer) { autoTimer.kill(); autoTimer = null; } }
  else restartAuto();
}

function updateScene(dt, t) {
  const focusPos = new THREE.Vector3(0, 0.62, 1.35);
  gemGroups.forEach((group, i) => {
    const is = i === focus;
    const b = BASE[i];
    const tx = is ? 0 : b[0] * spread * 1.03;
    const ty = is ? 0.62 : b[1];
    const tz = is ? 1.35 : b[2] - 0.12;
    group.position.x = damp(group.position.x, tx, 5.2, dt);
    group.position.y = damp(group.position.y, ty, 5.2, dt);
    group.position.z = damp(group.position.z, tz, 5.2, dt);
    const s = is ? 1.15 : 0.46;
    const cur = group.scale.x;
    group.scale.setScalar(damp(cur, s, 5.2, dt));
    gemMats[i].uniforms.uDim.value = damp(gemMats[i].uniforms.uDim.value, is ? 1 : 0.3, 5, dt);
    group.rotation.y += dt * (reduced ? 0 : (is ? 0.32 : 0.1));
    group.rotation.x = reduced ? 0 : Math.sin(t * 0.35 + i * 1.7) * 0.06;
  });
  if (halo) {
    halo.position.x = damp(halo.position.x, 0, 4, dt);
    halo.position.y = damp(halo.position.y, 0.62, 4, dt);
    halo.position.z = 0.72;
    const hs = damp(halo.scale.x, 1, 4, dt);
    halo.scale.setScalar(hs);
    haloMat.opacity = damp(haloMat.opacity, reduced ? 0.26 : 0.26 + Math.sin(t * 1.3) * 0.045, 4, dt);
    haloMat.color.setHex(GEMS[focus].accent);
  }
  if (ring) {
    ring.position.z = 1.2;
    ring.rotation.z = reduced ? 0 : t * 0.12;
    ringMat.color.setHex(GEMS[focus].accent);
    ringMat.opacity = reduced ? 0.18 : 0.16 + Math.sin(t * 1.1) * 0.04;
  }
  if (dust) dust.rotation.y = t * 0.01;
  camera.position.x = damp(camera.position.x, (canvas.clientWidth < 700 ? 0 : 0.2), 3, dt);
  camera.lookAt(canvas.clientWidth < 700 ? 0 : 0.38, 0.62, 0);
}

function tick(now) {
  raf = 0;
  if (disposed || document.hidden) return;
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
  last = now;
  updateScene(dt, now / 1000);
  composer.render();
  qa.frames = (qa.frames || 0) + 1;
  raf = requestAnimationFrame(tick);
}
function start() { if (!raf && !disposed) { last = 0; raf = requestAnimationFrame(tick); } }
function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

function onResize() {
  if (!renderer) return;
  const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setSize(w, h, false);
  composer?.setSize(w, h);
  fitCamera();
  qa.renderSize = [Math.round(w * renderer.getPixelRatio()), Math.round(h * renderer.getPixelRatio())];
}

function bind() {
  $('next').addEventListener('click', () => { setFocus(focus + 1); restartAuto(); });
  $('prev').addEventListener('click', () => { setFocus(focus - 1); restartAuto(); });
  $('play').addEventListener('click', togglePlay);
  window.addEventListener('keydown', e => {
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    else if (e.code === 'ArrowRight') { setFocus(focus + 1); restartAuto(); }
    else if (e.code === 'ArrowLeft') { setFocus(focus - 1); restartAuto(); }
  });

  const ray = new THREE.Raycaster();
  const p = new THREE.Vector2();
  canvas.addEventListener('pointerdown', e => {
    pointerDown = { x: e.clientX, y: e.clientY, t: performance.now() };
    canvas.setPointerCapture?.(e.pointerId);
  });
  canvas.addEventListener('pointerup', e => {
    if (!pointerDown) return;
    const dx = e.clientX - pointerDown.x;
    const dy = e.clientY - pointerDown.y;
    const moved = Math.hypot(dx, dy);
    pointerDown = null;
    if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy)) {
      setFocus(focus + (dx < 0 ? 1 : -1));
      restartAuto();
      return;
    }
    if (moved < 12) {
      const r = canvas.getBoundingClientRect();
      p.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      p.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(p, camera);
      const hits = ray.intersectObjects(gemMeshes, false);
      if (hits.length) { setFocus(hits[0].object.userData.index); restartAuto(); }
    }
  });
  canvas.addEventListener('pointercancel', () => { pointerDown = null; });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stop(); if (autoTimer) autoTimer.pause(); }
    else { if (autoTimer && !paused) autoTimer.resume(); start(); }
  });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('pagehide', dispose, { once: true });
}

function notesAnimation() {
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from('.notes-head h2', {
      y: 26, autoAlpha: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: '.notes-head', start: 'top 84%', once: true }
    });
    gsap.utils.toArray('.note').forEach((el, i) => {
      gsap.from(el, {
        y: 22, autoAlpha: 0, duration: 0.55, delay: i * 0.06, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  });
}

function dispose() {
  if (disposed) return;
  disposed = true;
  stop();
  if (autoTimer) autoTimer.kill();
  bigAnim?.kill();

  ScrollTrigger.getAll().forEach(t => t.kill());
  try {
    scene?.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const arr = Array.isArray(o.material) ? o.material : [o.material];
        arr.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
      }
    });
    composer?.dispose();
    renderer?.dispose();
    renderer?.forceContextLoss?.();
  } catch (_) {}
  qa.disposed = true;
}

async function boot() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.86;
    renderer.setClearColor(0x08070c, 1);
    qa.webgl = true;

    buildScene();
    onResize();
    buildRail();
    setFocus(0, false);

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.52, 0.62, 0.82));
    composer.addPass(new OutputPass());
    composer.setPixelRatio?.(renderer.getPixelRatio());
    composer.setSize(canvas.clientWidth, canvas.clientHeight);

    await renderer.compileAsync(scene, camera);
    qa.programs = renderer.info.programs?.length || 0;
    composer.render();
    await new Promise(r => setTimeout(r, 40));
    composer.render();
    ready = true;
    qa.ready = true;
    qa.programsAfterWarm = renderer.info.programs?.length || 0;
    warm.classList.add('gone');
    bind();
    notesAnimation();
    start();
    restartAuto();
  } catch (err) {
    qa.errors.push(String(err?.stack || err));
    warm.innerHTML = '<span class="warm-text">这台设备暂时画不出 3D</span>';
    canvas.style.opacity = '0';
    console.warn('WebGL warmup failed:', err);
  }
}

boot();
