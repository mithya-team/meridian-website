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

  var motion = !reduce && hasIO;   // choosing things always works; movement only when it is welcome
  doc.classList.add("ix");
  if (motion) doc.classList.add("js");

  // The list beside the stages shows which stage you are reading.
  (function () {
    var links = $$("#idx a"), stages = links.map(function (a) { return $(a.getAttribute("href")); });
    var ticking = false;
    var update = function () {
      ticking = false;
      var mark = window.innerHeight * 0.45, cur = 0;
      stages.forEach(function (s, i) { if (s.getBoundingClientRect().top < mark) cur = i; });
      links.forEach(function (a, i) {
        a.classList.toggle("on", i === cur); a.classList.toggle("done", i < cur);
        if (i === cur) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }, { passive: true });
    update();
  })();

  // Start small: one switch, and the set-up grows.
  (function () {
    var box = $("#growBox"), btns = $$(".seg button");
    var set = function (size, bump) {
      box.setAttribute("data-size", size);
      btns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-size") === size ? "true" : "false"); });
      $$(".gstats [data-one]", box).forEach(function (el) {
        var next = el.getAttribute("data-" + size);
        if (bump && motion && el.tagName === "B" && el.textContent !== next) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
        el.textContent = next;
      });
    };
    btns.forEach(function (b) { b.addEventListener("click", function () { set(b.getAttribute("data-size"), true); }); });
    set("one", false);
  })();

  // Who does what: choose a role, and the column shows only that role's steps, stage by stage.
  (function () {
    var picks = $$(".rp"), groups = $$(".wg"), sum = $("#whoSum");
    var words = { D: ["d", "Does"], V: ["v", "Sees"], E: ["e", "Told"] };
    var plural = function (n, one, many) { return n + " " + (n === 1 ? one : many); };
    groups.forEach(function (g) {
      g._rows = $$(".wr", g); g._count = $(".wn", g); g._none = $(".wnone", g);
      g._rows.forEach(function (r) {
        r._m = r.getAttribute("data-m").split(",");
        var s = document.createElement("b"); s.className = "mk"; r.insertBefore(s, r.firstChild); r._mk = s;
      });
    });
    var choose = function (i) {
      var n = { D: 0, V: 0, E: 0 }, opened = false;
      picks.forEach(function (p, j) { p.setAttribute("aria-pressed", j === i ? "true" : "false"); });
      groups.forEach(function (g) {
        var here = 0;
        g._rows.forEach(function (r) {
          var c = r._m[i], w = words[c];
          r.classList.toggle("off", !w);
          if (w) { r._mk.className = "mk " + w[0]; r._mk.textContent = w[1]; n[c] += 1; here += 1; }
        });
        g.classList.toggle("none", here === 0);
        g._none.hidden = here !== 0;
        g._count.textContent = here === 0 ? "No part here" : plural(here, "step", "steps");
        g.open = here > 0 && !opened;
        if (g.open) opened = true;
      });
      var parts = [];
      if (n.D) parts.push("does " + plural(n.D, "step", "steps"));
      if (n.V) parts.push("sees " + n.V);
      if (n.E) parts.push("is told about " + n.E);
      sum.innerHTML = "";
      var b = document.createElement("b"); b.textContent = picks[i].textContent;
      sum.appendChild(b); sum.appendChild(document.createTextNode(" " + parts.join(", ").replace(/, ([^,]*)$/, " and $1") + "."));
    };
    picks.forEach(function (p, i) { p.addEventListener("click", function () { choose(i); }); });
    choose(1);
  })();

  if (!motion) return;   // everything below is movement

  // Reveals: words slide up, pictures fade in.
  $$(".rv, .pv").forEach(function (el) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); el.classList.add("seen"); } });
    }, { threshold: 0.15 });
    io.observe(el);
  });

  // Hero: the record moves through its thirteen states once, then rests at Closed.
  (function () {
    var items = $$("#states .sts li"), now = $("#stNow"), count = $("#stCount");
    var show = function (i) {
      items.forEach(function (li, j) { li.classList.toggle("wait", j > i); li.classList.toggle("now", j === i); });
      now.textContent = items[i].textContent; now.classList.toggle("w", i < items.length - 1);
      count.textContent = (i + 1) + " of " + items.length;
    };
    show(0);
    items.forEach(function (li, i) { if (i > 0) later(function () { show(i); }, 900 + i * 520); });
  })();

  // The flag lights as you pass the point where other tools end.
  (function () {
    var flag = $("#stopflag");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); flag.classList.add("lit"); } });
    }, { rootMargin: "0px 0px -45% 0px", threshold: 1 });
    io.observe(flag);
  })();
})();
