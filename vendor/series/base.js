/* shared motion: load-in + scroll reveal + word-by-word tagline.
   GSAP is optional; without it the page stays fully readable. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';

  // tagline words light up one by one, independent of GSAP
  var words = document.querySelectorAll('.tagline .w');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('lit');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -14% 0px', threshold: 0.01 });
    words.forEach(function (w) { io.observe(w); });
  } else {
    words.forEach(function (w) { w.classList.add('lit'); });
  }

  if (!hasGSAP) return;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (reduce) return;

  var hero = document.querySelectorAll('[data-hero]');
  if (hero.length) {
    gsap.from(hero, {
      y: 10, opacity: 0, filter: 'blur(3px)',
      duration: 1.05, ease: 'power3.out', stagger: 0.07, clearProps: 'filter'
    });
  }

  if (window.ScrollTrigger) {
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.from(el, {
        y: 24, opacity: 0, duration: 0.95, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }
})();
