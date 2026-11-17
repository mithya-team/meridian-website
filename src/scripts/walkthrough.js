// Request a walkthrough: checks the form, then sends it to the address in data-endpoint.
// While data-endpoint is empty (not connected yet), it says so instead of pretending to send.
(function () {
  var form = document.getElementById("wtForm");
  if (!form) return;
  var err = document.getElementById("wtErr");
  var done = document.getElementById("wtDone");
  var off = document.getElementById("wtOff");
  var send = form.querySelector(".wt-send");
  var source = document.getElementById("wt-source");

  // Which page the visitor came from, if it was one of ours (helps the team know what they read).
  try {
    if (document.referrer && new URL(document.referrer).host === location.host) source.value = new URL(document.referrer).pathname;
  } catch (e) {}

  var names = { name: "your full name", email: "a work email", company: "your company", team: "your team", consent: "your agreement to be contacted" };

  function invalidFields() {
    var bad = [];
    [].forEach.call(form.elements, function (el) {
      if (!el.name || el.type === "hidden" || el.closest(".wt-trap")) return;
      var ok = el.checkValidity();
      if (el.type !== "checkbox") el.setAttribute("aria-invalid", ok ? "false" : "true");
      if (!ok) bad.push(el);
    });
    return bad;
  }

  function show(panel) {
    form.hidden = true;
    panel.hidden = false;
    panel.focus();
  }

  form.addEventListener("input", function (e) {
    if (e.target.getAttribute("aria-invalid") === "true" && e.target.checkValidity()) e.target.setAttribute("aria-invalid", "false");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = invalidFields();
    if (bad.length) {
      var list = bad.map(function (el) { return el.type === "email" && el.value ? "a valid work email" : names[el.name] || el.name; });
      err.textContent = "Please add " + list.join(", ").replace(/, ([^,]*)$/, " and $1") + ".";
      err.hidden = false;
      bad[0].focus();
      return;
    }
    err.hidden = true;
    if (form.elements.website.value) return; // filled in by a bot: drop it quietly

    var endpoint = form.getAttribute("data-endpoint");
    if (!endpoint) { show(off); return; }

    send.disabled = true;
    fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        var first = (form.elements.name.value || "").trim().split(/\s+/)[0];
        document.getElementById("wtWho").textContent = first ? ", " + first : "";
        show(done);
      })
      .catch(function () {
        err.textContent = "That didn't go through. Please try again in a moment.";
        err.hidden = false;
        send.disabled = false;
      });
  });

  document.getElementById("wtBack").addEventListener("click", function () {
    off.hidden = true;
    form.hidden = false;
    send.focus();
  });
})();
