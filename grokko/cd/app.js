import * as THREE from '../vendor/three.module.js';
import { EffectComposer } from '../vendor/addons/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../vendor/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../vendor/addons/postprocessing/OutputPass.js';

const stage = document.getElementById('stage');
const canvas = document.getElementById('scene');
const warm = document.getElementById('warm');
const qa = window.__GKK_CD__ = {
  page: 'cd', ready: false, errors: [], programs: 0, album: 0, phase: 'boot',
  webgl: false, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches
};
window.addEventListener('error', e => qa.errors.push(String(e.message || e.error || 'error')));
window.addEventListener('unhandledrejection', e => qa.errors.push(String(e.reason || 'rejection')));

const ALBUMS = [
  {
    vol: 1, title: '写稿与拆解', en: 'DRAFT / STRUCTURE', accent: '#cfd3dc', accentHex: 0xcfd3dc,
    line: '把散在聊天里的要点，收成一页能发的稿。',
    tracks: ['起稿：把散点收成一页', '拆解：长文拆成三步', '改写：同一件事三种说法'],
    cover: 'assets/cover-01.webp', disc: 'assets/disc-01.webp'
  },
  {
    vol: 2, title: '动效网页', en: 'MOTION / WEB', accent: '#a970ff', accentHex: 0xa970ff,
    line: '一句话说清要动什么，它直接写页面。',
    tracks: ['关键帧：先看静帧再渲', '动效：一句话写成页面', '滚动：把一段话拆成节拍'],
    cover: 'assets/cover-02.webp', disc: 'assets/disc-02.webp'
  },
  {
    vol: 3, title: '研究与例程', en: 'RESEARCH / ROUTINE', accent: '#ff8a3d', accentHex: 0xff8a3d,
    line: '每个数字标出处，查不到就写查不到。',
    tracks: ['核源：每个数字标出处', '对照：三份材料只留差异', '例程：固定时间交同一张表'],
    cover: 'assets/cover-03.webp', disc: 'assets/disc-03.webp'
  }
];

const $ = id => document.getElementById(id);
const damp = (cur, goal, lambda, dt) => THREE.MathUtils.damp(cur, goal, lambda, dt);

let renderer, scene, camera, composer, bloom, envTex, caseGroup, lidPivot, discGroup, bookletMat, foilMat;
let dataMat, labelMat, discSideMat, lidMarkMat;
let covers = [], discs = [];
let raf = 0, last = 0, running = false, disposed = false;
let album = 0, paused = false, auto = true, timeline = null, ready = false;
let viewYaw = 0, viewPitch = 0, targetYaw = 0, targetPitch = 0;
let pointer = { x: 0, y: 0 };
let dragging = false, dragX = 0, dragY = 0;
let warmShown = true;
const state = { open: 0, lift: 0, flip: 0, spin: 0 };

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
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
function roundedPath(w, h, r) {
  const p = new THREE.Path();
  const x = -w / 2, y = -h / 2;
  p.moveTo(x + r, y);
  p.lineTo(x + w - r, y);
  p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r);
  p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h);
  p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r);
  p.quadraticCurveTo(x, y, x + r, y);
  return p;
}
function plateGeo(w, d, r, t) {
  const shape = roundedRect(w, d, r);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: t, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008,
    bevelSegments: 2, curveSegments: 16
  });
  geo.center();
  geo.rotateX(-Math.PI / 2);
  return geo;
}
function frameGeo(w, d, r, t, inset) {
  const shape = roundedRect(w, d, r);
  shape.holes.push(roundedPath(w - inset * 2, d - inset * 2, Math.max(0.03, r - inset * 0.7)));
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: t, bevelEnabled: true, bevelSize: 0.005, bevelThickness: 0.005,
    bevelSegments: 1, curveSegments: 16
  });
  geo.center();
  geo.rotateX(-Math.PI / 2);
  return geo;
}
function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function shadowTexture() {
  return canvasTexture(512, 512, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, w * 0.05, w / 2, h / 2, w * 0.5);
    r.addColorStop(0, 'rgba(0,0,0,.82)');
    r.addColorStop(.42, 'rgba(0,0,0,.42)');
    r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, w, h);
  });
}
function glowTexture(color) {
  return canvasTexture(256, 256, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5);
    r.addColorStop(0, color);
    r.addColorStop(.35, color.replace('1)', '.35)'));
    r.addColorStop(1, color.replace('1)', '0)'));
    g.fillStyle = r; g.fillRect(0, 0, w, h);
  });
}

function buildStudio(renderer) {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x06050a);
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(16, 10, 16),
    new THREE.MeshBasicMaterial({ color: 0x0b0910, side: THREE.BackSide })
  );
  s.add(room);
  const panel = (w, h, hex, power, pos, rot) => {
    const c = new THREE.Color(hex).multiplyScalar(power);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.set(...rot);
    s.add(m);
  };
  panel(4.8, 4.0, 0xfff3e8, 3.6, [0, 4.6, 0], [Math.PI / 2, 0, 0]);
  panel(1.1, 4.6, 0xcfd8ff, 3.0, [-4.2, 1.2, 1.6], [0, Math.PI / 2, 0]);
  panel(0.65, 4.0, 0xb58bff, 1.7, [4.2, 1.4, 0.2], [0, -Math.PI / 2, 0]);
  panel(2.4, 0.55, 0xff9a55, 1.7, [1.8, 0.6, -3.8], [0, 0, 0]);
  panel(3.4, 0.5, 0xf4f0ff, 2.0, [0.2, 0.9, 4.3], [0, Math.PI, 0]);
  const rt = new THREE.WebGLCubeRenderTarget(256, {
    type: THREE.HalfFloatType,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter
  });
  const cam = new THREE.CubeCamera(0.1, 40, rt);
  cam.position.set(0, 0.2, 0);
  cam.update(renderer, s);
  s.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  return rt.texture;
}

function buildScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x09080d);
  camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  envTex = buildStudio(renderer);
  scene.environment = envTex;

  const tableMat = new THREE.MeshStandardMaterial({
    color: 0x0b0910, roughness: 0.4, metalness: 0.28, envMap: envTex, envMapIntensity: 0.42
  });
  const table = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), tableMat);
  table.rotation.x = -Math.PI / 2;
  table.position.y = -0.06;
  table.receiveShadow = true;
  scene.add(table);

  const pool = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 5.2),
    new THREE.MeshBasicMaterial({ map: glowTexture('rgba(140,92,220,1)'), transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = -0.052;
  scene.add(pool);

  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(6.2, 6.2),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, opacity: 0.9, depthWrite: false })
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = -0.051;
  scene.add(contact);

  const key = new THREE.DirectionalLight(0xfff0dd, 2.3);
  key.position.set(-3.4, 6.2, 3.6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4; key.shadow.camera.right = 4;
  key.shadow.camera.top = 4; key.shadow.camera.bottom = -4;
  key.shadow.camera.near = 0.5; key.shadow.camera.far = 16;
  key.shadow.bias = -0.0006;
  scene.add(key);

  const rim = new THREE.SpotLight(0xa970ff, 9, 14, 0.62, 1, 1.3);
  rim.position.set(3.4, 4.2, 2.2);
  rim.target.position.set(0, 0.1, 0);
  scene.add(rim, rim.target);

  const warmLight = new THREE.PointLight(0xff8a3d, 3.2, 7, 2);
  warmLight.position.set(2.8, 1.4, -2.8);
  scene.add(warmLight);

  caseGroup = new THREE.Group();
  caseGroup.position.y = 0.03;
  caseGroup.rotation.y = -0.08;
  scene.add(caseGroup);

  const acrylic = new THREE.MeshPhysicalMaterial({
    color: 0xe6e8ff, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.052,
    envMap: envTex, envMapIntensity: 0.55, clearcoat: 1, clearcoatRoughness: 0.02,
    side: THREE.DoubleSide, depthWrite: false
  });
  const acrylicRim = acrylic.clone();
  acrylicRim.opacity = 0.07;
  const lidGlass = new THREE.MeshPhysicalMaterial({
    color: 0xdfe2ff, metalness: 0, roughness: 0.02, transmission: 1, thickness: 0.055,
    ior: 1.49, attenuationColor: new THREE.Color(0x4a3b78), attenuationDistance: 0.55,
    iridescence: 0.18, iridescenceIOR: 1.25, envMap: envTex, envMapIntensity: 1.05, side: THREE.DoubleSide,
    transparent: false, opacity: 1, depthWrite: true
  });
  const trayMat = new THREE.MeshStandardMaterial({ color: 0x14101c, roughness: 0.62, metalness: 0.18, envMap: envTex, envMapIntensity: 0.4 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x09080d, roughness: 0.8, metalness: 0.1 });

  const shell = new THREE.Mesh(plateGeo(2.42, 2.22, 0.14, 0.035), acrylic);
  shell.position.y = 0.02;
  caseGroup.add(shell);

  const tray = new THREE.Mesh(plateGeo(2.3, 2.1, 0.11, 0.085), trayMat);
  tray.position.y = 0.06;
  tray.castShadow = true; tray.receiveShadow = true;
  caseGroup.add(tray);

  const rimFrame = new THREE.Mesh(frameGeo(2.42, 2.22, 0.14, 0.075, 0.045), acrylicRim);
  rimFrame.position.y = 0.075;
  caseGroup.add(rimFrame);

  const rEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(frameGeo(2.42, 2.22, 0.14, 0.075, 0.045), 32),
    new THREE.LineBasicMaterial({ color: 0xdcd6ff, transparent: true, opacity: 0.13 })
  );
  rEdge.position.y = 0.075;
  caseGroup.add(rEdge);

  const ring = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.0, 96), darkMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.103;
  caseGroup.add(ring);

  bookletMat = new THREE.MeshStandardMaterial({ roughness: 0.48, metalness: 0.04, envMap: envTex, envMapIntensity: 0.35 });
  const booklet = new THREE.Mesh(new THREE.PlaneGeometry(2.18, 1.98), bookletMat);
  booklet.rotation.x = -Math.PI / 2;
  booklet.position.y = 0.112;
  booklet.receiveShadow = true;
  caseGroup.add(booklet);

  foilMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.96, depthWrite: false });
  const foil = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.2), foilMat);
  foil.rotation.x = -Math.PI / 2;
  foil.position.set(0.68, 0.118, 0.63);
  caseGroup.add(foil);

  // disc
  discGroup = new THREE.Group();
  discGroup.position.y = 0.168;
  caseGroup.add(discGroup);

  discSideMat = new THREE.MeshStandardMaterial({ color: 0xbfc4ce, metalness: 0.92, roughness: 0.24, envMap: envTex, envMapIntensity: 0.8 });
  const discBody = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.018, 128, 1, false), discSideMat);
  discBody.castShadow = true;
  discGroup.add(discBody);

  labelMat = new THREE.MeshStandardMaterial({ roughness: 0.34, metalness: 0.06, envMap: envTex, envMapIntensity: 0.5 });
  const label = new THREE.Mesh(new THREE.CircleGeometry(0.912, 128), labelMat);
  label.rotation.x = -Math.PI / 2;
  label.position.y = 0.0105;
  discGroup.add(label);

  const discRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.918, 0.0065, 8, 128),
    new THREE.MeshBasicMaterial({ color: 0xdcd8ea, transparent: true, opacity: 0.55 })
  );
  discRim.rotation.x = Math.PI / 2;
  discRim.position.y = 0.012;
  discGroup.add(discRim);

  dataMat = new THREE.ShaderMaterial({
    uniforms: { uTint: { value: new THREE.Color(0xcfd3dc) }, uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vN;
      varying vec3 vW;
      void main(){
        vUv = uv;
        vN = normalize(mat3(modelMatrix) * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: `
      uniform vec3 uTint;
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vN;
      varying vec3 vW;
      void main(){
        vec3 N = normalize(vN);
        vec3 V = normalize(cameraPosition - vW);
        float r = length(vUv - 0.5) * 2.0;
        float a = atan(vUv.y - 0.5, vUv.x - 0.5);
        float fres = pow(1.0 - clamp(abs(dot(N, V)), 0.0, 1.0), 3.0);
        float grooves = 0.5 + 0.5 * sin(r * 58.0 + a * 2.0 + uTime * 0.10);
        float fine = 0.5 + 0.5 * sin(a * 42.0 + r * 3.0);
        vec3 spec = 0.5 + 0.5 * cos(a * 2.0 + r * 15.0 + vec3(0.0, 2.1, 4.2));
        vec3 silver = mix(vec3(0.20, 0.21, 0.24), vec3(0.50, 0.51, 0.56), 0.24 + grooves * 0.18 + fine * 0.03);
        vec3 col = silver + spec * (0.035 + fres * 0.07) + uTint * 0.03;
        vec3 hue = 0.5 + 0.5 * cos(r * 12.0 + a * 3.0 + vec3(0.0, 2.1, 4.2));
        col += hue * 0.07 * (0.35 + 0.65 * fres);
        col += spec * 0.055 * (0.35 + 0.65 * grooves);
        col += vec3(1.0) * pow(max(0.0, dot(reflect(-V, N), normalize(vec3(-0.4, 0.7, 0.6)))), 90.0) * 0.07;
        col *= 0.92;
        gl_FragColor = vec4(col, 1.0);
      }`
  });
  const data = new THREE.Mesh(new THREE.CircleGeometry(0.912, 128), dataMat);
  data.rotation.x = Math.PI / 2;
  data.position.y = -0.0105;
  discGroup.add(data);

  const holeMat = new THREE.MeshStandardMaterial({ color: 0x050408, roughness: 0.7, metalness: 0.1 });
  const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.024, 32), holeMat);
  hole.position.y = 0.0;
  discGroup.add(hole);
  const hub = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.011, 10, 64), discSideMat);
  hub.rotation.x = Math.PI / 2;
  hub.position.y = 0.014;
  discGroup.add(hub);

  // lid
  lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.232, -1.11);
  caseGroup.add(lidPivot);
  const lidPlate = new THREE.Mesh(plateGeo(2.42, 2.22, 0.14, 0.032), lidGlass);
  lidPlate.position.set(0, 0, 1.11);
  lidPivot.add(lidPlate);
  const lidRim = new THREE.Mesh(frameGeo(2.42, 2.22, 0.14, 0.075, 0.045), acrylicRim);
  lidRim.position.set(0, 0.015, 1.11);
  lidPivot.add(lidRim);
  const lidEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(plateGeo(2.42, 2.22, 0.14, 0.032), 32),
    new THREE.LineBasicMaterial({ color: 0xe6e0ff, transparent: true, opacity: 0.16 })
  );
  lidEdge.position.set(0, 0, 1.11);
  lidPivot.add(lidEdge);

  lidMarkMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.2, depthWrite: false });
  const lidMark = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.23), lidMarkMat);
  lidMark.rotation.x = -Math.PI / 2;
  lidMark.position.set(0, 0.019, 1.78);
  lidPivot.add(lidMark);

  // hinge nubs
  for (const x of [-0.96, 0.96]) {
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.13, 12), discSideMat);
    h.rotation.z = Math.PI / 2;
    h.position.set(x, 0.225, -1.11);
    caseGroup.add(h);
  }

  // sparse dust
  const count = 70;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - .5) * 7;
    pos[i * 3 + 1] = Math.random() * 3.2;
    pos[i * 3 + 2] = (Math.random() - .5) * 7;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xbca8e6, size: 0.012, transparent: true, opacity: 0.36, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  scene.add(dust);
  qa.dust = dust;

  // camera fit
  fitCamera();
}

function fitCamera() {
  if (!camera) return;
  const w = stage.clientWidth || 1, h = stage.clientHeight || 1;
  const aspect = w / h;
  const dist = aspect < 1.05 ? 8.5 : 7.25;
  camera.fov = aspect < 1.05 ? 33 : 30;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  camera.position.set(dist * 0.44, dist * 0.52, dist * 0.72);
  camera.lookAt(0, 0.3, 0);
  qa.cameraDistance = dist;
}

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = async () => {
      try {
        if (img.decode) await img.decode();
        const tex = new THREE.Texture(img);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        tex.needsUpdate = true;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        resolve(tex);
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error('image failed: ' + url));
    img.src = url;
  });
}

function setAlbum(i, animate = true) {
  album = (i + ALBUMS.length) % ALBUMS.length;
  const a = ALBUMS[album];
  qa.album = album;
  if (bookletMat) bookletMat.map = covers[album];
  if (labelMat) labelMat.map = discs[album];
  if (dataMat) dataMat.uniforms.uTint.value.setHex(a.accentHex);

  $('volNow').textContent = String(a.vol).padStart(2, '0');
  $('volLabel').textContent = 'VOL. ' + String(a.vol).padStart(2, '0');
  $('albumNo').textContent = String(a.vol).padStart(2, '0');
  $('albumTitle').textContent = a.title;
  $('albumEn').textContent = a.en;
  $('albumLine').textContent = a.line;
  const list = $('tracks');
  list.innerHTML = '';
  a.tracks.forEach((t, idx) => {
    const li = document.createElement('li');
    const s = document.createElement('span');
    s.textContent = String(idx + 1).padStart(2, '0');
    const p = document.createElement('p');
    p.textContent = t;
    li.append(s, p); list.append(li);
  });
  [...$('progress').children].forEach((s, idx) => s.classList.toggle('on', idx === album));
  if (animate && ready) {
    gsap.fromTo('#albumInfo', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out', overwrite: true });
  }
}

function setPhase(text, face = 'label') {
  qa.phase = text;
  $('phaseText').textContent = text;
  const a = $('sideA'), b = $('sideB');
  a.classList.toggle('on', face === 'label');
  b.classList.toggle('on', face === 'data');
}

function playAlbum(i) {
  if (!ready || disposed) return;
  setAlbum(i, true);
  if (timeline) timeline.kill();
  state.open = 0; state.lift = 0; state.flip = 0; state.spin = 0;
  setPhase('合上的盒子', 'label');
  if (qa.reduced) {
    state.open = 0.88; state.lift = 0.86; state.flip = 0; state.spin = 1.1;
    setPhase('静态展示', 'label');
    return;
  }
  timeline = gsap.timeline({ paused: paused });
  timeline
    .to(state, { duration: 0.9 })
    .call(() => setPhase('开盒', 'label'), null, 1.0)
    .to(state, { open: 1, duration: 2.3, ease: 'power2.inOut' }, 1.0)
    .call(() => setPhase('抬盘', 'label'), null, 3.3)
    .to(state, { lift: 1, duration: 1.15, ease: 'power2.out' }, 3.3)
    .call(() => setPhase('翻到数据面', 'data'), null, 4.45)
    .to(state, { flip: 1, duration: 1.35, ease: 'power2.inOut' }, 4.45)
    .call(() => setPhase('旋转', 'data'), null, 5.8)
    .to(state, { spin: Math.PI * 8, duration: 3.1, ease: 'none' }, 5.8)
    .call(() => setPhase('翻回标签面', 'label'), null, 8.9)
    .to(state, { flip: 0, duration: 1.2, ease: 'power2.inOut' }, 8.9)
    .to(state, { lift: 0, duration: 1.15, ease: 'power2.inOut' }, 9.8)
    .call(() => setPhase('归槽', 'label'), null, 10.95)
    .to(state, { open: 0, duration: 2.2, ease: 'power2.inOut' }, 10.95)
    .to(state, { duration: 0.55 }, null, 13.15)
    .call(() => {
      if (!paused && auto) {
        // let the current timeline complete before killing it; avoids self-kill races
        gsap.delayedCall(0.05, () => { if (!paused && auto) playAlbum((album + 1) % ALBUMS.length); });
      }
    }, null, 13.7);
  if (paused) timeline.pause();
}

function nextAlbum(manual = true) {
  if (manual) {
    if (timeline) timeline.kill();
    playAlbum((album + 1) % ALBUMS.length);
  }
}
function prevAlbum() {
  if (timeline) timeline.kill();
  playAlbum((album + ALBUMS.length - 1) % ALBUMS.length);
}
function togglePlay() {
  paused = !paused;
  if (timeline) paused ? timeline.pause() : timeline.resume();
  $('play').classList.toggle('paused', paused);
  $('play').setAttribute('aria-pressed', String(paused));
  $('play').setAttribute('aria-label', paused ? '继续自动播放' : '暂停自动播放');
  $('ctrlNote').textContent = paused ? '已暂停' : '自动循环';
}

function updateScene(dt, t) {
  if (!caseGroup) return;
  lidPivot.rotation.x = -state.open * 1.92;
  discGroup.position.y = 0.168 + state.lift * 1.32;
  discGroup.rotation.x = state.flip * Math.PI;
  discGroup.rotation.y = state.spin;
  discGroup.position.z = state.lift * 0.04;
  if (dataMat) dataMat.uniforms.uTime.value = t;
  if (qa.dust) qa.dust.rotation.y = t * 0.012;

  const baseX = qa.cameraDistance * 0.47;
  const baseY = qa.cameraDistance * 0.55;
  const baseZ = qa.cameraDistance * 0.7;
  const swayX = Math.sin(t * 0.18) * 0.05;
  const swayY = Math.cos(t * 0.13) * 0.025;
  camera.position.x = damp(camera.position.x, baseX + targetYaw * 1.1 + swayX, 5, dt);
  camera.position.y = damp(camera.position.y, baseY - targetPitch * 0.9 + swayY, 5, dt);
  camera.position.z = damp(camera.position.z, baseZ, 5, dt);
  camera.lookAt(0, 0.24 + state.lift * 0.44, 0);
}

function tick(now) {
  raf = 0;
  if (disposed || document.hidden) return;
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
  last = now;
  updateScene(dt, now / 1000);
  composer.render();
  qa.frames = (qa.frames || 0) + 1;
  qa.state = { open: +state.open.toFixed(3), lift: +state.lift.toFixed(3), flip: +state.flip.toFixed(3) };
  qa.timelineTime = timeline ? +timeline.time().toFixed(2) : 0;
  raf = requestAnimationFrame(tick);
}
function start() {
  if (running || disposed) return;
  running = true; last = 0;
  raf = requestAnimationFrame(tick);
}
function stop() {
  running = false;
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

function onResize() {
  if (!renderer || !camera) return;
  const w = stage.clientWidth || 1, h = stage.clientHeight || 1;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setSize(w, h, false);
  if (composer) composer.setSize(w, h);
  fitCamera();
  const dpr = renderer.getPixelRatio();
  qa.renderSize = [Math.round(w * dpr), Math.round(h * dpr)];
}

function bindUI() {
  $('next').addEventListener('click', () => nextAlbum(true));
  $('prev').addEventListener('click', prevAlbum);
  $('play').addEventListener('click', togglePlay);
  window.addEventListener('keydown', e => {
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    else if (e.code === 'ArrowRight') nextAlbum(true);
    else if (e.code === 'ArrowLeft') prevAlbum();
  });
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    dragging = true; dragX = e.clientX; dragY = e.clientY;
    stage.setPointerCapture?.(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / r.width * 2 - 1;
    pointer.y = (e.clientY - r.top) / r.height * 2 - 1;
    if (!dragging) return;
    targetYaw = gsap.utils.clamp(-0.55, 0.55, targetYaw + (e.clientX - dragX) * 0.0022);
    targetPitch = gsap.utils.clamp(-0.3, 0.3, targetPitch + (e.clientY - dragY) * 0.0018);
    dragX = e.clientX; dragY = e.clientY;
  });
  const endDrag = () => { dragging = false; targetYaw *= 0.6; targetPitch *= 0.6; };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('pointerleave', () => { if (!dragging) { targetYaw = 0; targetPitch = 0; } });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
      if (timeline) timeline.pause();
    } else {
      last = 0;
      if (timeline && !paused) timeline.resume();
      start();
    }
  });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('pagehide', dispose, { once: true });
}

function dispose() {
  if (disposed) return;
  disposed = true;
  stop();
  if (timeline) timeline.kill();
  try {
    scene?.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const arr = Array.isArray(o.material) ? o.material : [o.material];
        arr.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
      }
    });
    covers.filter(Boolean).forEach(t => t.dispose());
    discs.filter(Boolean).forEach(t => t.dispose());
    composer?.dispose();
    renderer?.dispose();
    renderer?.forceContextLoss?.();
  } catch (_) { /* best effort */ }
  qa.disposed = true;
}

async function boot() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x09080d, 1);
    qa.webgl = true;

    buildScene();
    onResize();

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.3, 0.6, 1.0);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    const dpr = renderer.getPixelRatio();
    composer.setPixelRatio?.(dpr);
    composer.setSize(stage.clientWidth, stage.clientHeight);

    // sequential pre-decode: six parallel decodes can race on low-memory devices
    const all = [];
    for (const a of ALBUMS) {
      for (const url of [a.cover, a.disc]) {
        try { all.push(await loadTexture(url)); }
        catch (e) { qa.errors.push(String(e)); all.push(null); }
      }
    }
    const fallback = all.find(Boolean) || null;
    covers = [all[0], all[2], all[4]].map(t => t || fallback);
    discs = [all[1], all[3], all[5]].map(t => t || fallback);
    bookletMat.map = covers[0];
    labelMat.map = discs[0];
    try { foilMat.map = await loadTexture('assets/foil.webp'); } catch (e) { qa.errors.push(String(e)); }
    try { lidMarkMat.map = await loadTexture('assets/wordmark.webp'); } catch (e) { qa.errors.push(String(e)); }

    // staged warmup: all materials visible under the overlay, compile once, render twice
    setAlbum(0, false);
    await renderer.compileAsync(scene, camera);
    qa.programs = renderer.info.programs?.length || 0;
    composer.render();
    await new Promise(r => setTimeout(r, 40));
    composer.render();
    ready = true;
    qa.ready = true;
    qa.programsAfterWarm = renderer.info.programs?.length || 0;
    if (warmShown) { warm.classList.add('gone'); warmShown = false; }
    bindUI();
    start();
    playAlbum(0);
  } catch (err) {
    qa.errors.push(String(err?.stack || err));
    warm.innerHTML = '<span class="warm-text">这台设备暂时画不出 3D，先看封面</span>';
    const img = document.createElement('img');
    img.src = 'assets/cover-01.webp';
    img.alt = 'Grokko 能力专辑封面';
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.72';
    stage.append(img);
    canvas.style.display = 'none';
    console.warn('WebGL warmup failed:', err);
  }
}

boot();
