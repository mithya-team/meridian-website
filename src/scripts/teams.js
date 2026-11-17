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

  doc.classList.add("ix");

  // Roles: choose one on the left and its sheet shows on the right.
  (function () {
    var tabs = $$(".ttab"), sheets = $$(".tsheet");
    var show = function (id) {
      tabs.forEach(function (t) { t.setAttribute("aria-pressed", t.getAttribute("data-r") === id ? "true" : "false"); });
      sheets.forEach(function (s) { s.classList.toggle("on", s.getAttribute("data-r") === id); });
    };
    tabs.forEach(function (t) { t.addEventListener("click", function () { show(t.getAttribute("data-r")); }); });
    // A link to one role (for example #role-claims) shows that role.
    var fromHash = function () {
      var el = window.location.hash.indexOf("#role-") === 0 ? document.getElementById(window.location.hash.slice(1)) : null;
      if (el) { show(el.getAttribute("data-r")); $("#roles").scrollIntoView(); return true; }
      return false;
    };
    if (!fromHash()) show(tabs[0].getAttribute("data-r")); // opens on the first role listed (partner marketing manager)
    window.addEventListener("hashchange", fromHash);
  })();

  if (reduce || !hasIO) return;   // everything below is movement; the page is complete without it
  doc.classList.add("js");
  $$(".rv, .pv, .tart").forEach(function (el) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); el.classList.add("seen"); } });
    }, { threshold: 0.12 });
    io.observe(el);
  });
})();
