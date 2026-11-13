import * as THREE from '../vendor/three.module.js';
import { OrbitControls } from '../vendor/addons/controls/OrbitControls.js';

const ACCENTS = ['#b47cff', '#7fd4ff', '#7fd4ff', '#b47cff', '#7fd4ff', '#ff9a5a'];
const TAU = Math.PI * 2;

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function canvasTexture(size, draw) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function radialTexture(size, rgb, inner = 0.0) {
  return canvasTexture(size, (ctx, S) => {
    const g = ctx.createRadialGradient(S / 2, S / 2, S * inner, S / 2, S / 2, S / 2);
    g.addColorStop(0, `rgba(${rgb},0.95)`);
    g.addColorStop(0.32, `rgba(${rgb},0.32)`);
    g.addColorStop(0.66, `rgba(${rgb},0.08)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
  });
}

function tickTexture() {
  return canvasTexture(1024, (ctx, S) => {
    const c = S / 2;
    ctx.translate(c, c);
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineCap = 'butt';
    const R = c * 0.94;
    ctx.globalAlpha = 0.22;
    for (let ring = 0; ring < 3; ring++) {
      ctx.lineWidth = S * (0.0015 + ring * 0.0007);
      ctx.beginPath();
      ctx.arc(0, 0, R * (0.62 + ring * 0.12), 0, TAU);
      ctx.stroke();
    }
    for (let i = 0; i < 144; i++) {
      const a = (i / 144) * TAU;
      const long = i % 12 === 0;
      const mid = i % 6 === 0;
      const r0 = R * (long ? 0.78 : mid ? 0.82 : 0.86);
      const r1 = R * 0.92;
      ctx.globalAlpha = long ? 0.6 : mid ? 0.34 : 0.16;
      ctx.lineWidth = S * (long ? 0.0032 : 0.0016);
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const a0 = (i / 12) * TAU + 0.035;
      const a1 = a0 + TAU / 12 - 0.07;
      ctx.globalAlpha = i % 3 === 0 ? 0.42 : 0.16;
      ctx.lineWidth = S * 0.012;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.73, a0, a1);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.28;
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((i / 6) * TAU + Math.PI / 12);
      ctx.beginPath();
      ctx.moveTo(R * 0.58, -S * 0.012);
      ctx.lineTo(R * 0.54, 0);
      ctx.lineTo(R * 0.58, S * 0.012);
      ctx.lineWidth = S * 0.003;
      ctx.stroke();
      ctx.restore();
    }
  });
}

async function loadTexture(url) {
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  try {
    await Promise.race([
      img.decode(),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  } catch (err) {
    // decode can reject in headless; fall through to onload
  }
  if (!img.complete || !img.naturalWidth) {
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('image decode failed'));
    });
  }
  const tex = new THREE.Texture(img);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

const portraitVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const portraitFrag = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uReveal;
  uniform float uSweep;
  uniform float uSweepOn;
  uniform float uOpacity;
  uniform vec3  uAccent;
  uniform float uAber;
  varying vec2 vUv;
  varying vec3 vWorld;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    float tq = floor(uTime * 8.0);
    float band = step(0.91, hash(vec2(floor(vUv.y * 26.0), tq)));
    float shift = (hash(vec2(floor(vUv.y * 26.0), tq + 3.1)) - 0.5) * 0.012;
    vec2 uv = vUv;
    uv.x += band * shift;

    vec2 ab = vec2(uAber * 0.0016, 0.0);
    vec4 cr = texture2D(uMap, uv + ab);
    vec4 cg = texture2D(uMap, uv);
    vec4 cb = texture2D(uMap, uv - ab);
    vec4 tex = vec4(cr.r, cg.g, cb.b, max(cg.a, max(cr.a, cb.a)));

    if (tex.a < 0.012) discard;
    if (vUv.y > uReveal) discard;

    float line = smoothstep(0.05, 0.0, abs(vUv.y - uReveal)) * step(uReveal, 0.999);
    float sw = smoothstep(0.028, 0.0, abs(vUv.y - uSweep)) * uSweepOn;

    float scan = 0.70 + 0.30 * pow(mod((vWorld.y - uTime * 0.22) * 30.0, 1.0), 2.0);
    float grain = 0.96 + 0.04 * hash(floor(vUv * vec2(260.0, 360.0)) + tq);

    float aL = texture2D(uMap, uv - vec2(0.004, 0.0)).a;
    float aR = texture2D(uMap, uv + vec2(0.004, 0.0)).a;
    float aU = texture2D(uMap, uv + vec2(0.0, 0.004)).a;
    float aD = texture2D(uMap, uv - vec2(0.0, 0.004)).a;
    float rim = clamp(tex.a - min(min(aL, aR), min(aU, aD)), 0.0, 1.0);

    vec3 col = tex.rgb * 0.92;
    float l = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(l) * vec3(1.04, 0.96, 1.12), 0.24);
    col *= scan * grain;
    vec3 rimCol = mix(vec3(0.42, 0.80, 1.0), uAccent, smoothstep(0.08, 0.92, vUv.x));
    col += rimCol * rim * 0.62;
    col *= mix(0.72, 1.0, smoothstep(0.0, 0.22, vUv.y));
    col += uAccent * line * 0.55 * tex.a;
    col += mix(uAccent, vec3(1.0), 0.35) * sw * 1.2 * tex.a;

    float alpha = tex.a * uOpacity * (0.84 + 0.16 * scan);
    gl_FragColor = vec4(col, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const beamVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const beamFrag = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float fade = smoothstep(0.0, 0.12, vUv.y) * (1.0 - smoothstep(0.68, 1.0, vUv.y));
    fade *= smoothstep(0.0, 0.16, vUv.x) * (1.0 - smoothstep(0.84, 1.0, vUv.x));
    float streak = 0.58 + 0.42 * sin(vUv.x * 6.2831853 * 18.0 + uTime * 0.85);
    streak *= 0.7 + 0.3 * sin(vUv.x * 6.2831853 * 5.0 - uTime * 0.4);
    float scan = 0.86 + 0.14 * sin((vUv.y - uTime * 0.18) * 44.0);
    vec3 col = mix(uColor, vec3(1.0), 0.22 * vUv.y) * fade * streak * scan * 0.28;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const dustVert = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uPix;
  varying float vA;
  varying float vSeed;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * 0.10 + aSeed * 4.2, 4.5) - 0.35;
    p.x += sin(uTime * 0.35 + aSeed * 20.0) * 0.13;
    p.z += cos(uTime * 0.29 + aSeed * 13.0) * 0.13;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uPix * aSize * (8.0 / max(-mv.z, 1.0));
    gl_Position = projectionMatrix * mv;
    vA = smoothstep(0.0, 0.55, p.y + 0.35) * (1.0 - smoothstep(3.0, 4.25, p.y));
    vSeed = aSeed;
  }
`;

const dustFrag = /* glsl */ `
  uniform vec3 uColor;
  varying float vA;
  varying float vSeed;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    vec3 col = mix(vec3(0.92, 0.94, 1.0), uColor, 0.55 + 0.35 * vSeed);
    float a = smoothstep(0.5, 0.0, r) * vA * 0.62;
    gl_FragColor = vec4(col, a);
  }
`;

const blurFrag = /* glsl */ `
  uniform sampler2D tMap;
  uniform vec2 uDir;
  varying vec2 vUv;
  void main() {
    vec3 a = texture2D(tMap, vUv - uDir * 2.2).rgb * 0.08;
    a += texture2D(tMap, vUv - uDir * 1.2).rgb * 0.20;
    a += texture2D(tMap, vUv).rgb * 0.44;
    a += texture2D(tMap, vUv + uDir * 1.2).rgb * 0.20;
    a += texture2D(tMap, vUv + uDir * 2.2).rgb * 0.08;
    gl_FragColor = vec4(a, 1.0);
  }
`;

const blitVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const compFrag = /* glsl */ `
  uniform sampler2D tMap;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(tMap, vUv);
    gl_FragColor = vec4(c.rgb * uStrength, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export async function createHoloStage({ canvas, wrap, onProgress, reducedMotion = false }) {
  const steps = [];
  const report = (p, label) => {
    steps.push(label + ':' + p.toFixed(2));
    window.__HOLO_STEPS__ = steps.slice();
    if (typeof onProgress === 'function') onProgress(p, label);
  };
  report(0.02, 'INIT');

  const glProbe = document.createElement('canvas');
  const gl = glProbe.getContext('webgl2') || glProbe.getContext('webgl');
  if (!gl) throw new Error('no-webgl');
  gl.getExtension('WEBGL_lose_context')?.loseContext();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x08070b, 0.028);

  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 60);
  camera.position.set(0, 2.5, 10.4);
  camera.layers.enable(1);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.minDistance = 7.6;
  controls.maxDistance = 14;
  controls.minPolarAngle = 1.06;
  controls.maxPolarAngle = 1.44;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = 0.34;
  controls.target.set(0, 1.42, -0.05);

  const isNarrow = () => (wrap.clientWidth || window.innerWidth) < 720;
  if (window.matchMedia('(pointer: coarse)').matches || isNarrow()) {
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.enabled = false;
    controls.disconnect();
    canvas.style.touchAction = 'pan-y';
  }

  const clock = { t: 0 };
  let raf = 0;
  let running = false;
  let last = 0;
  let frames = 0;
  let disposed = false;
  let modeIndex = 0;
  let pulse = 0;
  let sweepT = 0;
  let scrollP = 0;
  let resizeObserver = null;

  const stageRoot = new THREE.Group();
  const portraitGroup = new THREE.Group();
  const sigilGroup = new THREE.Group();
  scene.add(stageRoot, portraitGroup, sigilGroup);

  const accent = new THREE.Color(ACCENTS[0]);
  const accent2 = new THREE.Color('#7fd4ff');
  const ringMats = [];
  const orbGlowMats = [];

  /* ---------- lights ---------- */
  scene.add(new THREE.AmbientLight(0x2a2038, 1.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.25);
  key.position.set(4, 6.5, 5);
  scene.add(key);
  const p1 = new THREE.PointLight(0xb47cff, 1.7, 20, 2);
  p1.position.set(-4.2, 2.3, 3.2);
  scene.add(p1);
  const p2 = new THREE.PointLight(0x7fd4ff, 1.2, 18, 2);
  p2.position.set(4.4, 1.2, -2.2);
  scene.add(p2);

  /* ---------- textures ---------- */
  report(0.08, 'DECODE');
  const [portraitTex, auraTex, ringTex, floorTex] = await Promise.all([
    loadTexture('assets/grokko-holo.webp'),
    Promise.resolve(radialTexture(512, '180,124,255', 0.02)),
    Promise.resolve(tickTexture()),
    Promise.resolve(radialTexture(512, '150,110,255', 0.0)),
  ]);
  renderer.initTexture(portraitTex);
  renderer.initTexture(auraTex);
  renderer.initTexture(ringTex);
  renderer.initTexture(floorTex);
  report(0.22, 'TEXTURES');

  /* ---------- pedestal ---------- */
  const profile = [
    [0, -1.38], [2.16, -1.38], [2.28, -1.31], [2.28, -1.18], [2.18, -1.12],
    [1.96, -1.12], [1.96, -0.82], [2.06, -0.76], [2.06, -0.65], [1.86, -0.59],
    [1.56, -0.57], [1.5, -0.45], [0, -0.45],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const pedestal = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 112),
    new THREE.MeshStandardMaterial({
      color: 0x15121c,
      metalness: 0.88,
      roughness: 0.32,
      emissive: 0x0a0614,
      emissiveIntensity: 0.7,
    })
  );
  pedestal.layers.set(0);
  stageRoot.add(pedestal);

  const edgeGeo = new THREE.TorusGeometry(1, 0.007, 6, 180);
  const edges = [
    [2.27, -1.25, 0.85], [2.05, -0.78, 0.7], [1.86, -0.6, 0.8], [1.52, -0.458, 0.95],
  ];
  edges.forEach(([r, y, o]) => {
    const m = new THREE.Mesh(edgeGeo, new THREE.MeshBasicMaterial({
      color: accent, transparent: true, opacity: o * 0.62, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    m.scale.set(r, r, 1);
    m.rotation.x = Math.PI / 2;
    m.position.y = y;
    m.layers.set(1);
    ringMats.push(m.material);
    stageRoot.add(m);
  });

  const deck = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 3.5),
    new THREE.MeshBasicMaterial({
      map: ringTex, color: accent, transparent: true, opacity: 0.52,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    })
  );
  deck.renderOrder = 1;
  deck.rotation.x = -Math.PI / 2;
  deck.position.y = -0.438;
  deck.layers.set(1);
  ringMats.push(deck.material);
  stageRoot.add(deck);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9),
    new THREE.MeshBasicMaterial({
      map: floorTex, color: accent, transparent: true, opacity: 0.18,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.4;
  floor.layers.set(1);
  stageRoot.add(floor);

  // tick ring
  const tickCount = 72;
  const tickGeo = new THREE.BoxGeometry(0.012, 0.065, 0.012);
  const tickMat = new THREE.MeshBasicMaterial({
    color: accent, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const tickRing = new THREE.InstancedMesh(tickGeo, tickMat, tickCount);
  const tmpM = new THREE.Matrix4();
  const tmpQ = new THREE.Quaternion();
  const tmpS = new THREE.Vector3(1, 1, 1);
  const tmpP = new THREE.Vector3();
  for (let i = 0; i < tickCount; i++) {
    const a = (i / tickCount) * TAU;
    const r = 1.52;
    tmpP.set(Math.cos(a) * r, -0.43 + (i % 6 === 0 ? 0.02 : 0), Math.sin(a) * r);
    tmpQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a);
    tmpM.compose(tmpP, tmpQ, tmpS);
    tickRing.setMatrixAt(i, tmpM);
  }
  tickRing.instanceMatrix.needsUpdate = true;
  tickRing.layers.set(1);
  ringMats.push(tickMat);
  stageRoot.add(tickRing);

  // projector orb
  const orb = new THREE.Group();
  orb.position.set(0, -0.2, 1.05);
  const orbBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.23, 40, 28),
    new THREE.MeshStandardMaterial({ color: 0x07060a, metalness: 0.55, roughness: 0.18 })
  );
  orb.add(orbBody);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf4f1ff });
  [-0.075, 0.075].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.034, 14, 10), eyeMat);
    eye.position.set(x, 0.035, 0.212);
    eye.layers.set(1);
    orb.add(eye);
  });
  const orbRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.285, 0.006, 6, 80),
    new THREE.MeshBasicMaterial({
      color: accent, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  orbRing.position.z = 0.05;
  orbRing.layers.set(1);
  orbGlowMats.push(orbRing.material);
  orb.add(orbRing);
  stageRoot.add(orb);

  report(0.38, 'STAGE');
  await renderer.compileAsync(scene, camera);
  report(0.46, 'STAGE-COMPILED');
  await nextFrame();

  /* ---------- portrait ---------- */
  const portraitMat = new THREE.ShaderMaterial({
    vertexShader: portraitVert,
    fragmentShader: portraitFrag,
    uniforms: {
      uMap: { value: portraitTex },
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uSweep: { value: -0.2 },
      uSweepOn: { value: 0 },
      uOpacity: { value: 1 },
      uAccent: { value: accent.clone() },
      uAber: { value: 0.7 },
    },
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
  });
  const portrait = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 4.133), portraitMat);
  portrait.position.set(0, 1.63, 0);
  portrait.renderOrder = 10;
  portraitGroup.add(portrait);

  const aura = new THREE.Sprite(new THREE.SpriteMaterial({
    map: auraTex,
    color: accent,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  }));
  aura.scale.set(4.3, 5.5, 1);
  aura.position.set(0, 1.66, -0.16);
  aura.renderOrder = 1;
  aura.layers.set(0);
  portraitGroup.add(aura);

  /* ---------- sigil ---------- */
  const coreMat = new THREE.MeshBasicMaterial({
    color: accent, wireframe: true, transparent: true, opacity: 0.17,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.18, 1), coreMat);
  core.position.set(0, 1.96, -1.42);
  core.renderOrder = 1;
  core.layers.set(1);
  sigilGroup.add(core);

  const dotsGeo = new THREE.BufferGeometry();
  const coreVerts = core.geometry.attributes.position.array;
  const dots = new Float32Array(coreVerts.length);
  for (let i = 0; i < coreVerts.length; i += 3) {
    dots[i] = coreVerts[i] * 1.01;
    dots[i + 1] = coreVerts[i + 1] * 1.01 + 1.96;
    dots[i + 2] = coreVerts[i + 2] * 1.01 - 1.42;
  }
  dotsGeo.setAttribute('position', new THREE.BufferAttribute(dots, 3));
  const dotMat = new THREE.PointsMaterial({
    color: 0xe4d8ff, size: 0.034, transparent: true, opacity: 0.8,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const dotField = new THREE.Points(dotsGeo, dotMat);
  dotField.layers.set(1);
  sigilGroup.add(dotField);

  const ring1Mat = new THREE.MeshBasicMaterial({
    color: accent, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.58, 0.005, 6, 180), ring1Mat);
  ring1.position.set(0, 1.86, -0.9);
  ring1.rotation.set(1.12, 0.18, 0.1);
  ring1.renderOrder = 1;
  ring1.layers.set(1);
  ringMats.push(ring1Mat);

  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0x7fd4ff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.92, 0.004, 6, 200), ring2Mat);
  ring2.position.set(0, 1.5, -1.0);
  ring2.rotation.set(-1.18, 0, 0.42);
  ring2.renderOrder = 1;
  ring2.layers.set(1);
  ringMats.push(ring2Mat);
  sigilGroup.add(ring1, ring2);

  /* ---------- dust ---------- */
  const N = 170;
  const pos = new Float32Array(N * 3);
  const seed = new Float32Array(N);
  const size = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * TAU;
    const r = 0.5 + Math.random() * 2.1;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.random() * 4.2;
    pos[i * 3 + 2] = Math.sin(a) * r * 0.55;
    seed[i] = Math.random();
    size[i] = 0.5 + Math.random() * 1.5;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  dustGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  const dustMat = new THREE.ShaderMaterial({
    vertexShader: dustVert,
    fragmentShader: dustFrag,
    uniforms: {
      uTime: { value: 0 },
      uPix: { value: Math.min(window.devicePixelRatio || 1, 1.5) },
      uColor: { value: accent.clone() },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.layers.set(1);
  sigilGroup.add(dust);

  report(0.62, 'PORTRAIT');
  await renderer.compileAsync(scene, camera);
  report(0.7, 'PORTRAIT-COMPILED');
  await nextFrame();

  /* ---------- selective bloom ---------- */
  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const blurMat = new THREE.ShaderMaterial({
    vertexShader: blitVert,
    fragmentShader: blurFrag,
    uniforms: { tMap: { value: null }, uDir: { value: new THREE.Vector2() } },
    depthTest: false,
    depthWrite: false,
  });
  const compMat = new THREE.ShaderMaterial({
    vertexShader: blitVert,
    fragmentShader: compFrag,
    uniforms: { tMap: { value: null }, uStrength: { value: 0.28 } },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const blurScene = new THREE.Scene();
  blurScene.add(new THREE.Mesh(quadGeo, blurMat));
  const compScene = new THREE.Scene();
  compScene.add(new THREE.Mesh(quadGeo, compMat));

  let rtA = null;
  let rtB = null;
  function makeRT(w, h) {
    const rt = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      depthBuffer: false,
      stencilBuffer: false,
    });
    rt.texture.generateMipmaps = false;
    return rt;
  }
  await renderer.compileAsync(blurScene, quadCam);
  await renderer.compileAsync(compScene, quadCam);
  report(0.8, 'BLOOM-COMPILED');

  /* ---------- size ---------- */
  function sizeNow() {
    const w = Math.max(280, Math.floor(wrap.clientWidth || 800));
    const h = Math.max(300, Math.floor(wrap.clientHeight || 600));
    return { w, h };
  }

  function resize() {
    if (disposed) return;
    const { w, h } = sizeNow();
    const dpr = Math.min(window.devicePixelRatio || 1, isNarrow() ? 1.5 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.85 ? 35 : 33;
    camera.updateProjectionMatrix();
    const d = camera.aspect < 0.85 ? 10.9 : 10.3;
    if (Math.abs(camera.position.length() - d) > 0.6) {
      const dir = camera.position.clone().sub(controls.target).normalize();
      camera.position.copy(controls.target).addScaledVector(dir, d);
    }
    controls.update();
    const bw = Math.max(64, Math.floor(w * dpr * 0.5));
    const bh = Math.max(64, Math.floor(h * dpr * 0.5));
    if (!rtA) {
      rtA = makeRT(bw, bh);
      rtB = makeRT(bw, bh);
    } else {
      rtA.setSize(bw, bh);
      rtB.setSize(bw, bh);
    }
    dustMat.uniforms.uPix.value = Math.min(window.devicePixelRatio || 1, 1.5);
    if (raf) renderOnce();
  }

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(wrap);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  /* ---------- render ---------- */
  function renderOnce() {
    camera.updateMatrixWorld();
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(scene, camera);

    const mask = camera.layers.mask;
    camera.layers.set(1);
    renderer.setRenderTarget(rtA);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(scene, camera);
    camera.layers.mask = mask;

    blurMat.uniforms.tMap.value = rtA.texture;
    blurMat.uniforms.uDir.value.set(1 / rtA.width, 0);
    renderer.setRenderTarget(rtB);
    renderer.render(blurScene, quadCam);

    blurMat.uniforms.tMap.value = rtB.texture;
    blurMat.uniforms.uDir.value.set(0, 1 / rtA.height);
    renderer.setRenderTarget(rtA);
    renderer.render(blurScene, quadCam);

    renderer.setRenderTarget(null);
    compMat.uniforms.tMap.value = rtA.texture;
    renderer.autoClear = false;
    renderer.render(compScene, quadCam);
    renderer.autoClear = true;
    frames += 1;
  }

  function tick(now) {
    if (!running || disposed) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    clock.t += dt;
    const t = clock.t;

    portraitMat.uniforms.uTime.value = t;
    dustMat.uniforms.uTime.value = t;

    if (sweepT > 0) {
      sweepT = Math.min(1.05, sweepT + dt);
      portraitMat.uniforms.uSweep.value = -0.12 + (sweepT / 0.95) * 1.36;
      portraitMat.uniforms.uSweepOn.value = sweepT < 1.02 ? 1 : 0;
    }

    pulse = Math.max(0, pulse - dt * 1.6);
    const boost = 1 + pulse * 2.4;
    core.rotation.y += dt * 0.16 * boost;
    core.rotation.x = Math.sin(t * 0.21) * 0.16;
    ring1.rotation.z += dt * 0.10 * boost;
    ring2.rotation.z -= dt * 0.075 * boost;
    orbRing.rotation.z += dt * 0.5;
    deck.rotation.z = -t * 0.035;
    tickRing.rotation.y = t * 0.045;
    aura.material.opacity = 0.3 + 0.05 * Math.sin(t * 1.1);

    ringMats.forEach((m) => {
      if (!m || m.opacity === undefined) return;
      if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = m.opacity;
      m.opacity = Math.min(0.8, m.userData.baseOpacity + pulse * 0.22);
    });

    stageRoot.position.y = -scrollP * 0.18;
    portraitGroup.position.y = Math.sin(t * 0.55) * 0.022 - scrollP * 0.06;
    sigilGroup.rotation.y = Math.sin(t * 0.12) * 0.08;

    if (!reducedMotion) controls.update();
    renderOnce();
  }

  function start() {
    if (running || disposed) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function onVisibility() {
    if (document.visibilityState === 'hidden') stop();
    else if (inView) start();
  }
  let inView = false;
  const io = new IntersectionObserver((entries) => {
    inView = entries.some((e) => e.isIntersecting);
    if (inView && document.visibilityState !== 'hidden') start();
    else stop();
  }, { rootMargin: '80px 0px', threshold: 0.01 });
  io.observe(wrap);
  document.addEventListener('visibilitychange', onVisibility);

  function onContextLost(e) {
    e.preventDefault();
    stop();
  }
  function onContextRestored() {
    if (disposed) return;
    renderer.resetState?.();
    start();
  }
  canvas.addEventListener('webglcontextlost', onContextLost, false);
  canvas.addEventListener('webglcontextrestored', onContextRestored, false);

  function setMode(i) {
    modeIndex = i % ACCENTS.length;
    const color = new THREE.Color(ACCENTS[modeIndex]);
    accent.copy(color);
    portraitMat.uniforms.uAccent.value.copy(color);
    dustMat.uniforms.uColor.value.copy(color);
    coreMat.color.copy(color);
    deck.material.color.copy(color);
    tickMat.color.copy(color);
    ring1Mat.color.copy(color);
    ring2Mat.color.copy(color);
    ringMats.forEach((m) => { if (m && m.color) m.color.copy(color); });
    orbGlowMats.forEach((m) => m.color.copy(color));
    aura.material.color.copy(color);
    floor.material.color.copy(color);
    p1.color.copy(color);
    pulse = 1;
    sweepT = 0.001;
    portraitMat.uniforms.uSweep.value = -0.12;
    portraitMat.uniforms.uSweepOn.value = 1;
    if (!running && document.visibilityState !== 'hidden') {
      renderOnce();
    }
  }

  function setScroll(p) {
    scrollP = Math.max(0, Math.min(1, p));
  }

  function reveal(v) {
    portraitMat.uniforms.uReveal.value = v;
  }

  function getDiagnostics() {
    return {
      ready: true,
      frames,
      mode: modeIndex,
      webgl2: renderer.capabilities.isWebGL2,
      dpr: renderer.getPixelRatio(),
      width: renderer.domElement.width,
      height: renderer.domElement.height,
      triangles: renderer.info.render.triangles,
      calls: renderer.info.render.calls,
    };
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    stop();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('resize', resize);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    canvas.removeEventListener('webglcontextrestored', onContextRestored);
    if (resizeObserver) resizeObserver.disconnect();
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      }
    });
    rtA?.dispose();
    rtB?.dispose();
    quadGeo.dispose();
    blurMat.dispose();
    compMat.dispose();
    renderer.dispose();
  }

  setMode(0);
  report(1, 'READY');
  return {
    start,
    stop,
    setMode,
    setScroll,
    reveal,
    resize,
    getDiagnostics,
    dispose,
    get mode() { return modeIndex; },
  };
}
