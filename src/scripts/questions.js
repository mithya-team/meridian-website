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

  // Topics: choose one and the column shows its questions, with the first one open.
  (function () {
    var tabs = $$(".qtab"), groups = $$(".qg");
    var show = function (id, openId) {
      tabs.forEach(function (t) { t.setAttribute("aria-pressed", t.getAttribute("data-g") === id ? "true" : "false"); });
      groups.forEach(function (g) {
        var on = g.getAttribute("data-g") === id;
        g.classList.toggle("on", on);
        if (on) {
          var items = $$("details", g), target = openId ? document.getElementById(openId) : (window.matchMedia("(max-width: 560px)").matches ? null : items[0]);
          items.forEach(function (d) { d.open = d === target; });
        }
      });
    };
    tabs.forEach(function (t) { t.addEventListener("click", function () { show(t.getAttribute("data-g")); }); });
    // A link to one question (for example #q-paid) opens its topic and that question.
    var fromHash = function () {
      var el = window.location.hash.length > 1 ? document.getElementById(window.location.hash.slice(1)) : null;
      if (el && el.tagName === "DETAILS") { show(el.parentNode.getAttribute("data-g"), el.id); el.scrollIntoView({ block: "center" }); return true; }
      return false;
    };
    if (!fromHash()) show(groups[0].getAttribute("data-g"));
    window.addEventListener("hashchange", fromHash);
  })();

  if (reduce || !hasIO) return;   // everything below is movement; the page is complete without it
  doc.classList.add("js");
  $$(".rv, .pv").forEach(function (el) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); el.classList.add("seen"); } });
    }, { threshold: 0.12 });
    io.observe(el);
  });
})();
