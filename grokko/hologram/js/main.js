import { createHoloStage } from './scene.js';

const DATA = [
  {
    cn: '写清楚', en: 'WRITE', accent: '#b47cff',
    line: '把散点、会议记录、一堆链接，压成能直接发的稿。',
    out: '一篇有标题、有开头、有结尾的成稿；不是“要点罗列”。',
    ask: '给谁看、发在哪、要多长、哪句必须保留。',
    not: '不编引语，不把没核过的数字写进正文。',
  },
  {
    cn: '搭页面', en: 'BUILD', accent: '#7fd4ff',
    line: '从参考到能跑的响应式页面，手机先过。',
    out: '可打开的 HTML/CSS/JS；桌面和 390 宽都不横溢。',
    ask: '给谁用、第一屏要看到什么、有没有必须用的素材。',
    not: '不套模板充原创，不把“能打开”说成“已上线”。',
  },
  {
    cn: '查资料', en: 'RESEARCH', accent: '#7fd4ff',
    line: '先找源，再下结论；找不到就写找不到。',
    out: '一条能点回去的证据链，和一段说人话的结论。',
    ask: '要几手源、时间范围、哪些说法必须核。',
    not: '不拿标题卡当证据，不把推断写成事实。',
  },
  {
    cn: '跑工作流', en: 'FLOW', accent: '#b47cff',
    line: '把每周重复的步骤，串成一条能复用的线。',
    out: '一套步骤、每步的输入输出、失败时的停点。',
    ask: '哪一步最烦、哪一步绝不能自动、谁来按最后一下。',
    not: '不在没有确认的情况下替你发、替你删、替你登录。',
  },
  {
    cn: '读图表', en: 'READ', accent: '#7fd4ff',
    line: '把财报、表格、长图，读成几句能转述的话。',
    out: '三到五句结论；关键数字带出处，不堆术语。',
    ask: '看的是哪一期、口径是什么、跟谁比。',
    not: '不把“同比”说成“增长”，不给你买卖建议。',
  },
  {
    cn: '做视觉', en: 'MAKE', accent: '#ff9a5a',
    line: '把一种风格锁成一套能复用的资产，而不是一张好看的图。',
    out: '色板、字号层级、组件状态、能交付的源文件。',
    ask: '给哪个平台、要不要动、有没有不能动的角色设定。',
    not: '不混用两套画风，不拿别人的角色图当自己的。',
  },
];

const $ = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGsap = !!(window.gsap && window.ScrollTrigger);

const tabs = window.gsap ? window.gsap.utils.toArray('.mode') : $$('.mode');
const els = {
  floatIdx: $('#float-idx'),
  floatTitle: $('#float-title'),
  floatTag: $('#float-tag'),
  siIndex: $('#si-index'),
  siTag: $('#si-tag'),
  siTitle: $('#si-title'),
  siLine: $('#si-line'),
  siOut: $('#si-out'),
  siAsk: $('#si-ask'),
  siNot: $('#si-not'),
  cycleBar: $('#cycle-bar'),
  info: $('#stage-info'),
};

let current = 0;
let stage = null;
let stageReady = false;
let stageFailed = false;
let stageVisible = false;
let cycleTimer = 0;
let autoPausedUntil = 0;
let bootDone = false;
const CYCLE_MS = 7000;
const MANUAL_PAUSE = 20000;

/* ---------- boot ---------- */
const boot = $('#boot');
const bootBar = $('#boot-bar');
const bootLog = $$('#boot-log li');

function bootProgress(p) {
  if (!bootBar) return;
  const v = Math.max(0.04, Math.min(1, p));
  bootBar.style.transform = `scaleX(${v})`;
}
bootLog.forEach((li, i) => {
  setTimeout(() => li.classList.add('in'), 180 + i * 260);
});
bootProgress(0.08);

function finishBoot() {
  if (bootDone) return;
  bootDone = true;
  root.dataset.ready = '1';
  bootProgress(1);
  const bootEl = document.getElementById('boot');
  if (bootEl) bootEl.remove();

  const heroItems = $$('.hero-inner .rv');
  if (hasGsap && !reduced) {
    const tl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.addLabel('open', 0)
      .to('#holo', { autoAlpha: 1, duration: 0.9 }, 'open')
      .to(heroItems, { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.08 }, 'open+=0.08');
    if (stage) {
      window.gsap.to({ v: 0 }, {
        v: 1, duration: 1.45, ease: 'power2.inOut',
        onUpdate() { stage.reveal(this.targets()[0].v); },
      });
    }
    window.gsap.fromTo('.stage-info', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7, delay: 0.25 });
  } else {
    heroItems.forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
    stage?.reveal(1);
  }
  scheduleCycle();
}

/* ---------- mode ---------- */
function paintMode(i) {
  const d = DATA[i];
  root.style.setProperty('--accent', d.accent);
  els.floatIdx.textContent = String(i + 1).padStart(2, '0');
  els.floatTitle.textContent = d.cn;
  els.floatTag.textContent = d.en;
  els.siIndex.textContent = `${String(i + 1).padStart(2, '0')} / 06`;
  els.siTag.textContent = d.en;
  els.siTitle.textContent = d.cn;
  els.siLine.textContent = d.line;
  els.siOut.textContent = d.out;
  els.siAsk.textContent = d.ask;
  els.siNot.textContent = d.not;
  tabs.forEach((t, k) => {
    t.setAttribute('aria-selected', k === i ? 'true' : 'false');
    t.tabIndex = k === i ? 0 : -1;
  });
  const list = document.querySelector('.mode-tabs');
  const active = tabs[i];
  if (list && active) {
    const r = active.getBoundingClientRect();
    const lr = list.getBoundingClientRect();
    if (r.left < lr.left + 8 || r.right > lr.right - 8) {
      const left = active.offsetLeft - list.clientWidth / 2 + active.clientWidth / 2;
      list.scrollTo({ left: Math.max(0, left), behavior: reduced ? 'auto' : 'smooth' });
    }
  }
}

function setMode(i, { manual = false, auto = false } = {}) {
  const next = ((i % DATA.length) + DATA.length) % DATA.length;
  const changed = next !== current;
  current = next;
  paintMode(current);
  stage?.setMode(current);

  if (changed && hasGsap && !reduced) {
    window.gsap.fromTo(
      [els.siTitle, els.siLine, els.siOut, els.siAsk, els.siNot],
      { y: 7, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.42, stagger: 0.035, ease: 'power2.out', overwrite: true }
    );
  }
  if (manual) autoPausedUntil = Date.now() + MANUAL_PAUSE;
  if (!auto) scheduleCycle();
}

function animateBar(ms) {
  if (!els.cycleBar || !hasGsap || reduced) return;
  window.gsap.killTweensOf(els.cycleBar);
  els.cycleBar.style.transform = 'scaleX(0)';
  window.gsap.fromTo(els.cycleBar, { scaleX: 0 }, { scaleX: 1, duration: ms / 1000, ease: 'none' });
}

function stopBar() {
  if (!els.cycleBar || !hasGsap) return;
  window.gsap.killTweensOf(els.cycleBar);
  els.cycleBar.style.transform = 'scaleX(0)';
}

function scheduleCycle() {
  clearTimeout(cycleTimer);
  stopBar();
  if (reduced || !stageVisible || document.visibilityState === 'hidden' || !bootDone) return;
  const wait = Math.max(0, autoPausedUntil - Date.now());
  if (wait > 0) {
    cycleTimer = window.setTimeout(scheduleCycle, wait + 40);
    return;
  }
  animateBar(CYCLE_MS);
  cycleTimer = window.setTimeout(() => {
    setMode(current + 1, { auto: true });
  }, CYCLE_MS);
}

tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => setMode(i, { manual: true }));
  tab.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    let n = i;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = tabs.length - 1;
    tabs[n].focus();
    setMode(n, { manual: true });
  });
});

$$('.rec-cta').forEach((btn) => {
  btn.addEventListener('click', () => {
    const i = Number(btn.dataset.jump || 0);
    setMode(i, { manual: true });
    const target = $('#stage');
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  });
});

/* ---------- stage visibility / cycle ---------- */
const stageWrap = $('#stage-wrap');
const stageSec = $('#stage');
if ('IntersectionObserver' in window) {
  new IntersectionObserver((entries) => {
    stageVisible = entries.some((e) => e.isIntersecting);
    if (stageVisible) scheduleCycle();
    else clearTimeout(cycleTimer);
  }, { threshold: 0.08 }).observe(stageSec);
} else {
  stageVisible = true;
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') clearTimeout(cycleTimer);
  else scheduleCycle();
});

/* ---------- init ---------- */
async function init() {
  const fallback = $('#stage-fallback');
  if (reduced) {
    root.classList.add('reduced');
  }
  try {
    stage = await createHoloStage({
      canvas: $('#holo'),
      wrap: stageWrap,
      reducedMotion: reduced,
      onProgress(p, label) {
        bootProgress(0.1 + p * 0.82);
        if (label === 'STAGE' || label === 'PORTRAIT') {
          const el = bootLog.find((x) => x.dataset.i === '2');
          el?.classList.add('in');
        }
      },
    });
    stageReady = true;
    root.dataset.stage = 'ok';
  } catch (err) {
    stageFailed = true;
    root.dataset.stage = 'fallback';
    if (fallback) fallback.hidden = false;
    const c = $('#holo');
    if (c) c.hidden = true;
    // no console.error: a missing WebGL is a handled fallback
    console.warn('[holo] fallback:', err && err.message ? err.message : err);
  }

  if (stage && reduced) stage.reveal(1);
  finishBoot();
  setTimeout(() => window.ScrollTrigger?.refresh?.(), 320);
}

/* ---------- scroll ---------- */
function initScroll() {
  if (!hasGsap || reduced) {
    $$('.reveal').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.batch('.reveal', {
    start: 'top 90%',
    onEnter: (batch) => gsap.fromTo(batch,
      { y: 24, opacity: 0.001 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: 'power3.out', overwrite: true, clearProps: 'transform,opacity' }
    ),
  });

  gsap.to('.hero-inner', {
    yPercent: 7, autoAlpha: 0.32, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  ScrollTrigger.create({
    trigger: '#stage',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => stage?.setScroll(self.progress),
  });

  ScrollTrigger.batch('.record', {
    start: 'top 91%',
    onEnter: (batch) => gsap.from(batch, {
      y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.07, ease: 'power2.out', overwrite: true,
    }),
  });

  ScrollTrigger.refresh();
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

initScroll();

init().catch((err) => {
  // last-resort: still show a readable page
  root.dataset.stage = 'fallback';
  const fallback = $('#stage-fallback');
  if (fallback) fallback.hidden = false;
  const c = $('#holo');
  if (c) c.hidden = true;
  console.warn('[holo] init:', err && err.message ? err.message : err);
  finishBoot();
});

/* ---------- lifecycle ---------- */
window.addEventListener('pagehide', () => {
  stage?.dispose();
  stage = null;
}, { once: true });

window.addEventListener('pageshow', (e) => {
  if (e.persisted) window.location.reload();
});

/* ---------- diagnostics ---------- */
window.__HOLO_QA__ = {
  get errors() { return window.__ERRORS__.slice(); },
  get stage() { return stage ? stage.getDiagnostics() : null; },
  get mode() { return current; },
  get ready() { return stageReady; },
  get failed() { return stageFailed; },
};

if (new URLSearchParams(location.search).has('diag')) {
  setTimeout(() => {
    const el = document.createElement('pre');
    el.id = 'diag-data';
    el.hidden = true;
    el.textContent = JSON.stringify({
      errors: window.__ERRORS__,
      stage: stage ? stage.getDiagnostics() : null,
      stageFailed,
      mode: current,
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      canvas: (() => {
        const c = document.getElementById('holo');
        if (!c) return null;
        const r = c.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height), hidden: !!c.hidden };
      })(),
      bootVisible: !!document.getElementById('boot')?.isConnected,
      fonts: document.fonts ? document.fonts.status : 'n/a',
    });
    document.body.appendChild(el);
  }, 3500);
}

/* expose a tiny bit for manual QA */
window.__HOLO_SET_MODE__ = (i) => setMode(i, { manual: true });
