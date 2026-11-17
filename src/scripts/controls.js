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

  var motion = !reduce && hasIO;   // trying the rule always works; movement only when it is welcome
  doc.classList.add("ix");
  if (motion) doc.classList.add("js");

  // Hero: the visitor tries to approve their own request, and the workflow refuses.
  (function () {
    var box = $("#tryBox"), btn = $("#tryApprove"), hint = $("#tryHint");
    box.classList.add("ready");
    hint.textContent = "Try it: approve your own request.";
    btn.addEventListener("click", function () {
      box.classList.remove("ready"); box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake");
      btn.setAttribute("aria-disabled", "true");
      hint.textContent = "The workflow refused. Nobody approves their own request.";
    });
  })();

  // A link to one rule (for example #c-08) opens its group and brings the rule into view.
  (function () {
    var go = function () {
      var el = window.location.hash.indexOf("#c-") === 0 ? document.getElementById(window.location.hash.slice(1)) : null;
      if (!el) return;
      var group = el.closest("details");
      if (group) group.open = true;
      window.setTimeout(function () { el.scrollIntoView({ block: "center" }); }, 80);
    };
    go(); window.addEventListener("hashchange", go);
  })();

  if (!motion) return;   // everything below is movement

  // Reveals: words slide up, pictures fade in.
  $$(".rv, .pv").forEach(function (el) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); el.classList.add("seen"); } });
    }, { threshold: 0.12 });
    io.observe(el);
  });
})();
