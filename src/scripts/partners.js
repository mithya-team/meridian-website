(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var later = function (fn, ms) { return window.setTimeout(fn, ms); };

  // Nav gains a hairline once the page has scrolled.
  var nav = $("#nav");
  var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  doc.classList.add("ix");
  if (reduce || !hasIO) return;   // everything below is movement; the page is complete without it
  doc.classList.add("js");

  // Reveals: words slide up, pictures fade in.
  $$(".rv, .pv").forEach(function (el) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); el.classList.add("seen"); } });
    }, { threshold: 0.12 });
    io.observe(el);
  });

  // Hero: the request's steps tick through once, then the next thing needed appears.
  (function () {
    var card = $("#fpcard"), steps = $$(".fpsteps li", card);
    var stopAt = steps.findIndex(function (s) { return s.classList.contains("now"); });
    var show = function (i) { steps.forEach(function (t, j) { t.className = j < i ? "done" : j === i ? "now" : ""; }); };
    card.classList.add("pre"); show(-1);
    for (var i = 0; i <= stopAt; i += 1) { (function (k) { later(function () { show(k); }, 700 + k * 550); })(i); }
    later(function () { card.classList.remove("pre"); }, 700 + stopAt * 550 + 450);
  })();

  // Six moments: the line draws down as you scroll, and each moment fills in as the line reaches it.
  (function () {
    var list = $("#fpl"), items = $$(".fpi", list), ticking = false;
    var update = function () {
      ticking = false;
      var mark = window.innerHeight * 0.68, r = list.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (mark - r.top - 8) / (r.height - 16)));
      list.style.setProperty("--p", p.toFixed(4));
      items.forEach(function (it) { it.classList.toggle("on", it.getBoundingClientRect().top + 14 < mark); });
    };
    var request = function () { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } };
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    update();
  })();
})();
