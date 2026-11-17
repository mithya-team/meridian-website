(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Nav gains a hairline once the page has scrolled.
  var nav = $("#nav");
  var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  if (reduce || !hasIO) return;   // everything below is motion; the page is complete without it
  doc.classList.add("js");

  // Reveals: words slide up, pictures fade in.
  $$(".rv, .pv").forEach(function (el) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); el.classList.add("seen"); } });
    }, { threshold: 0.15 });
    io.observe(el);
  });

  // The history: the line draws itself down as you scroll, each decision fills in as the line
  // reaches it, and the note beside the sheet changes to match the decision you've reached.
  var sheet = $("#sheet"), line = $(".eline", sheet), evs = $$(".ev", sheet);
  var list = $("#notes"), notes = $$(".sn", list);
  var wide = window.matchMedia("(min-width: 901px)");
  var ticking = false;
  var update = function () {
    ticking = false;
    var mark = window.innerHeight * 0.64, r = line.getBoundingClientRect();
    var p = Math.max(0, Math.min(1, (mark - r.top) / r.height));
    sheet.style.setProperty("--p", p.toFixed(4));
    var reached = -1;
    evs.forEach(function (e, i) {
      var on = e.getBoundingClientRect().top + 14 < mark;
      e.classList.toggle("on", on);
      if (on) reached = i;
    });
    var done = reached === evs.length - 1 && p >= 0.995;
    var active = reached < 0 || done ? -1 : Number(evs[reached].getAttribute("data-note"));
    list.classList.toggle("live", wide.matches && active >= 0);
    notes.forEach(function (n, i) { n.classList.toggle("on", i === active); });
  };
  var request = function () { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } };
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  update();
})();
