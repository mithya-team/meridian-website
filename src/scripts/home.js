(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var later = function (fn, ms) { return window.setTimeout(fn, ms); };

  // When a block first comes into view, run fn once.
  function onSeen(el, fn, threshold) {
    if (!el) return;
    if (!hasIO) { fn(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn(); } });
    }, { threshold: threshold || 0.35 });
    io.observe(el);
  }

  // Nav gains a hairline once the page has scrolled.
  var nav = $("#nav");
  var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  var motion = !reduce && hasIO;   // interaction always works; movement only when it is welcome
  doc.classList.add("ix");
  if (motion) doc.classList.add("js");

  // Reveals: words slide up, pictures fade in.
  if (motion) $$(".rv, .pv").forEach(function (el) { onSeen(el, function () { el.classList.add("seen"); }, 0.15); });

  // 1. Hero: the record fills in step by step, then the confirmations pop in.
  if (motion) (function () {
    var rows = $$("#heroRec .rec-rows li"), status = $("#heroRec [data-status]"), foot = $("#heroRec .rec-f");
    var chips = $$(".hero .chip"), names = ["Submitted", "Qualified", "Approved"];
    rows.forEach(function (r, i) { if (i > 0) r.classList.add("wait"); });
    rows[0].classList.add("wait"); foot.classList.add("wait"); chips.forEach(function (c) { c.classList.add("wait"); });
    status.textContent = "Draft"; status.classList.add("w");
    rows.forEach(function (r, i) {
      later(function () {
        r.classList.remove("wait"); status.textContent = names[i];
        if (i === 2) status.classList.remove("w");
      }, 700 + i * 900);
    });
    later(function () { chips[0].classList.remove("wait"); }, 3000);
    later(function () { chips[1].classList.remove("wait"); foot.classList.remove("wait"); }, 3500);
  })();

  // 2. Ten tools: labels drift and swap names, then gather into the record as you scroll.
  if (motion) (function () {
    var sec = $("#tools"), labels = $$(".t", sec);
    labels.forEach(function (t) {
      var a = t.textContent, b = t.getAttribute("data-alt");
      t.textContent = ""; var s = document.createElement("b"); s.textContent = a; t.appendChild(s);
      t._names = [a, b]; t._i = 0;
    });
    var k = 0;
    window.setInterval(function () {
      var t = labels[k % labels.length]; k += 1;
      t.classList.add("swap");
      later(function () { t._i = 1 - t._i; t.firstChild.textContent = t._names[t._i]; t.classList.remove("swap"); }, 450);
    }, 1600);
    var ticking = false;
    var update = function () {
      ticking = false;
      var r = sec.getBoundingClientRect(), vh = window.innerHeight;
      // 0 while the section is centred or lower; 1 once its lower third reaches mid-screen
      var p = (vh * 0.45 - r.top) / (r.height * 0.6);
      sec.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }, { passive: true });
    update();
  })();

  // 3. Journey: six stops. Click, use arrow keys, or let it play. The flag lights once you pass Approve.
  (function () {
    var wrap = $("#railwrap"), rail = $(".rail"), tabs = $$('[role="tab"]', rail), timer = null, touched = false;
    var APPROVE = 3;
    var select = function (i, focus) {
      tabs.forEach(function (t, j) {
        var on = j === i;
        t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1;
        t.classList.toggle("done", j < i);
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      rail.style.setProperty("--n", i);
      wrap.classList.toggle("past", i > APPROVE);
      if (focus) tabs[i].focus();
    };
    var current = function () { return tabs.findIndex(function (t) { return t.getAttribute("aria-selected") === "true"; }); };
    var stop = function () { touched = true; window.clearInterval(timer); };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { stop(); select(i, false); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") n = 0; if (e.key === "End") n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); stop(); select(n, true); }
      });
    });
    select(current(), false);
    var stage = $(".stage");
    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () { select((current() + 1) % tabs.length, false); }, 4200);
    }
    if (motion) {
      stage.addEventListener("pointerenter", function () { window.clearInterval(timer); });
      stage.addEventListener("pointerleave", function () { if (!touched) play(); });
      onSeen(stage, function () { select(0, false); play(); }, 0.5);
    }

    // The visitor can give the last approval themselves.
    var btn = $("#approveBtn");
    btn.addEventListener("click", function () {
      stop();
      btn.hidden = true; $("#samRow .ok").hidden = false;
      $("#samRow small").textContent = "Regional VP · approved just now";
      $("#approveChip span").textContent = "All three approved";
      $("#tryHint").textContent = "Approved. Next, both sides sign.";
      later(function () { if (current() === APPROVE) select(APPROVE + 1, false); }, 1700);
    });
  })();

  // 4. Rules: each tile acts out its rule once when it comes into view.
  if (motion) (function () {
    var a = $("#tileA"), b = $("#tileB"), c = $("#tileC");
    [a, b, c].forEach(function (t) { t.classList.add("pre"); });
    var refuse = function () { a.classList.remove("shake"); void a.offsetWidth; a.classList.add("shake"); a.classList.remove("pre"); };
    onSeen(a, function () { later(refuse, 900); }, 0.6);
    $(".dis", a).addEventListener("pointerenter", refuse);
    onSeen(b, function () { later(function () { b.classList.remove("pre"); }, 700); }, 0.6);
    onSeen(c, function () {
      var nums = $$("[data-count]", c), end = 23410, t0 = null, dur = 1100;
      var fmt = function (v) { return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
      nums.forEach(function (n) { n.textContent = fmt(0); });
      later(function () {
        var step = function (ts) {
          if (!t0) t0 = ts;
          var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          nums.forEach(function (n) { n.textContent = fmt(Math.round(end * e)); });
          if (k < 1) window.requestAnimationFrame(step); else c.classList.remove("pre");
        };
        window.requestAnimationFrame(step);
      }, 600);
    }, 0.6);
  })();

  // 5. The glass record leans towards the pointer.
  if (motion) (function () {
    var obj = $("#obj"), glass = $(".glass", obj);
    if (!window.matchMedia("(hover: hover)").matches) return;
    obj.addEventListener("pointermove", function (e) {
      var r = obj.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      glass.style.setProperty("--ry", (-10 + x * 22).toFixed(1) + "deg");
      glass.style.setProperty("--rx", (4 - y * 16).toFixed(1) + "deg");
    });
    obj.addEventListener("pointerleave", function () { glass.style.removeProperty("--ry"); glass.style.removeProperty("--rx"); });
  })();

  // 6. Roles: choose a column and it widens while the open one narrows.
  (function () {
    var roles = $$(".role");
    roles.forEach(function (r) {
      $(".role-t", r).addEventListener("click", function () {
        if (r.classList.contains("open")) return;
        roles.forEach(function (o) {
          var on = o === r;
          o.classList.toggle("open", on);
          $(".role-t", o).setAttribute("aria-expanded", on ? "true" : "false");
        });
      });
    });
  })();
})();
