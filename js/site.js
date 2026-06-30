/* ============================================================
   Gridfolio — Site animations (site.js)
   Scroll-reveal for marketing pages. Respects reduced motion.
   ============================================================ */
(function () {
  // auto-tag common blocks so markup stays clean
  var AUTO = [".tile", ".theme-chip", ".section__head", ".cta-band", ".contact-info", ".contact-card"];
  AUTO.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) { el.classList.add("reveal"); });
  });

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var els = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (e) { e.classList.add("in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  els.forEach(function (e) { io.observe(e); });
})();
