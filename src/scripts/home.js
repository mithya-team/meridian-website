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

  // 2. Ten tools: labels drift and swap names; as you scroll, each one travels into the record,
  //    one after another, and the record answers every arrival with a bop and a ring.
  if (motion) (function () {
    var sec = $("#tools"), layer = $(".floaters", sec), card = $(".one", sec), labels = $$(".t", sec);
    var narrow = window.matchMedia("(max-width: 900px)");
    labels.forEach(function (t) {
      var a = t.textContent, b = t.getAttribute("data-alt");
      t.textContent = ""; var s = document.createElement("b"); s.textContent = a; t.appendChild(s);
      t._names = [a, b]; t._i = 0; t._in = false;
    });
    var k = 0;
    window.setInterval(function () {
      var t = labels[k % labels.length]; k += 1;
      if (t._q > 0.05) return;  // leave a label alone once it's on its way
      t.classList.add("swap");
      later(function () { t._i = 1 - t._i; t.firstChild.textContent = t._names[t._i]; t.classList.remove("swap"); }, 450);
    }, 1600);

    // The order they arrive in: nearest first, so the card fills up steadily.
    var order = labels.slice();
    var ease = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
    var clamp = function (x) { return Math.max(0, Math.min(1, x)); };
    var arrived = 0;

    var bop = function () {
      card.classList.remove("bop"); void card.offsetWidth; card.classList.add("bop");
    };
    var reset = function () {
      labels.forEach(function (t) { t.style.transform = ""; t.style.opacity = ""; t.classList.remove("moving"); t._in = false; t._q = 0; });
      card.classList.remove("full"); arrived = 0;
    };

    var ticking = false;
    var update = function () {
      ticking = false;
      if (narrow.matches) { reset(); return; }
      var vh = window.innerHeight, L = layer.getBoundingClientRect(), C = card.getBoundingClientRect();
      // Timed by the record itself: 0 while it is still a screen below view, 1 once it sits just above the middle.
      var p = clamp((vh * 1.25 - (C.top + C.height / 2)) / (vh * 0.68));
      sec.style.setProperty("--p", p.toFixed(3));
      var cx = C.left + C.width / 2 - L.left, cy = C.top + C.height / 2 - L.top;
      order.forEach(function (t, i) {
        var q = clamp((p - i * 0.075) / 0.55);
        t._q = q;
        var x0 = t.offsetLeft + t.offsetWidth / 2, y0 = t.offsetTop + t.offsetHeight / 2;
        var e = ease(q);
        var shrink = clamp((q - 0.78) / 0.22);              // visible and full size until the last stretch
        var rot = parseFloat(getComputedStyle(t).getPropertyValue("--r")) || 0;
        t.style.transform = "translate(" + ((cx - x0) * e).toFixed(1) + "px," + ((cy - y0) * e).toFixed(1) + "px) rotate(" + (rot * (1 - e)).toFixed(2) + "deg) scale(" + (1 - 0.8 * shrink).toFixed(3) + ")";
        t.style.opacity = (1 - shrink).toFixed(3);
        t.classList.toggle("moving", q > 0);
        if (q >= 0.98 && !t._in) { t._in = true; arrived += 1; bop(); }
        else if (q < 0.9 && t._in) { t._in = false; arrived -= 1; }
      });
      card.classList.toggle("full", arrived === labels.length);
    };
    var go = function () { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } };
    window.addEventListener("scroll", go, { passive: true });
    window.addEventListener("resize", go);
    // Measure nearest-first once the layout has settled.
    var sortByDistance = function () {
      var L = layer.getBoundingClientRect(), C = card.getBoundingClientRect();
      var cx = C.left + C.width / 2 - L.left, cy = C.top + C.height / 2 - L.top;
      order.sort(function (a, b) {
        var da = Math.hypot(a.offsetLeft + a.offsetWidth / 2 - cx, a.offsetTop + a.offsetHeight / 2 - cy);
        var db = Math.hypot(b.offsetLeft + b.offsetWidth / 2 - cx, b.offsetTop + b.offsetHeight / 2 - cy);
        return da - db;
      });
      update();
    };
    if (document.readyState === "complete") sortByDistance(); else window.addEventListener("load", sortByDistance);
    update();
  })();

  // 3. Journey: six stops down the page. The list on the left shows which one you're reading,
  //    the flag lights as you pass the point where most tools go straight to the claim,
  //    and the visitor can give the RVP's approval themselves.
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

    var flag = $("#stopflag");
    if (hasIO) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); flag.classList.add("lit"); } });
      }, { rootMargin: "0px 0px -45% 0px", threshold: 1 });
      io.observe(flag);
    } else flag.classList.add("lit");

    var btn = $("#approveBtn");
    btn.addEventListener("click", function () {
      btn.hidden = true; $("#samRow .ok").hidden = false;
      $("#samRow small").textContent = "RVP · approved just now";
      $("#approveChip span").textContent = "Step 2 of 3 approved";
      $("#tryHint").textContent = "Approved. Next, the Channels leader.";
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
      var nums = $$("[data-count]", c), end = 22000, t0 = null, dur = 1100;
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

  // 5. The glass record leans toward the pointer.
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
    var roles = $$(".role"), stacked = window.matchMedia("(max-width: 900px)");
    var shut = function (o) { o.classList.remove("open"); $(".role-t", o).setAttribute("aria-expanded", "false"); };
    if (window.matchMedia("(max-width: 560px)").matches) roles.forEach(shut); // phones: all closed to start
    roles.forEach(function (r) {
      $(".role-t", r).addEventListener("click", function () {
        if (r.classList.contains("open")) { if (stacked.matches) shut(r); return; } // stacked: tap again to close
        roles.forEach(function (o) {
          var on = o === r;
          o.classList.toggle("open", on);
          $(".role-t", o).setAttribute("aria-expanded", on ? "true" : "false");
        });
      });
    });
  })();
})();
