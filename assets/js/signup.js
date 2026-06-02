/* ===========================================================
   TankopaniJam — Team Sign-Up form
   Dynamic 2–5 member rows, client-side validation, and a
   submit that (1) saves to localStorage, (2) downloads a JSON
   receipt, and (3) optionally POSTs to a backend endpoint.

   To receive submissions for real, set SUBMIT_ENDPOINT to your
   form backend (Formspree, a serverless function, etc.). Until
   then the form works fully offline and stores locally.
   =========================================================== */
(function () {
  var SUBMIT_ENDPOINT = ""; // e.g. "https://formspree.io/f/xxxxxxx"
  var MIN_MEMBERS = 2;
  var MAX_MEMBERS = 5;
  var ROLES = ["Lead / Producer", "Programmer", "Artist", "Designer", "Audio", "Generalist"];

  var form = document.getElementById("signup-form");
  if (!form) return;

  var membersEl = document.getElementById("members");
  var addBtn = document.getElementById("add-member");
  var statusEl = document.getElementById("form-status");
  var memberCount = 0;

  function roleOptions() {
    return '<option value="">Role…</option>' +
      ROLES.map(function (r) { return '<option value="' + r + '">' + r + "</option>"; }).join("");
  }

  function addMember(focus) {
    if (memberCount >= MAX_MEMBERS) return;
    memberCount++;
    var n = memberCount;
    var row = document.createElement("div");
    row.className = "member-row";
    row.innerHTML =
      '<span class="idx">Member ' + n + '</span>' +
      '<div class="field"><input type="text" name="member-name" placeholder="Full name *" aria-label="Member ' + n + ' name"></div>' +
      '<div class="field"><input type="email" name="member-email" placeholder="Email *" aria-label="Member ' + n + ' email"></div>' +
      '<div class="field"><select name="member-role" aria-label="Member ' + n + ' role">' + roleOptions() + '</select></div>' +
      '<button type="button" class="member-remove" aria-label="Remove member ' + n + '">✕</button>';
    membersEl.appendChild(row);

    row.querySelector(".member-remove").addEventListener("click", function () {
      if (memberCount <= MIN_MEMBERS) {
        flashMembersError("Teams need at least " + MIN_MEMBERS + " members.");
        return;
      }
      row.remove();
      memberCount--;
      relabel();
      updateAddBtn();
    });

    updateAddBtn();
    if (focus) row.querySelector("input").focus();
  }

  function relabel() {
    membersEl.querySelectorAll(".member-row .idx").forEach(function (el, i) {
      el.textContent = "Member " + (i + 1);
    });
  }

  function updateAddBtn() {
    addBtn.disabled = memberCount >= MAX_MEMBERS;
    addBtn.textContent = memberCount >= MAX_MEMBERS
      ? "Maximum of " + MAX_MEMBERS + " members"
      : "+ Add member";
  }

  function flashMembersError(msg) {
    setError("members", msg);
    setTimeout(function () { setError("members", ""); }, 2500);
  }

  // ---- validation helpers ----
  function setError(forName, msg) {
    var el = form.querySelector('.field__error[data-for="' + forName + '"]') ||
             document.querySelector('.field__error[data-for="' + forName + '"]');
    if (el) el.textContent = msg || "";
  }
  function markField(input, ok) {
    var field = input.closest(".field");
    if (field) field.classList.toggle("field--invalid", !ok);
  }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function validate() {
    var errors = [];

    // simple required text/select/email fields
    [
      ["teamName", "Team name is required."],
      ["school", "School is required."],
      ["engine", "Pick a game engine."],
      ["platform", "Pick a target platform."],
      ["sponsorName", "Sponsor name is required."],
      ["sponsorType", "Pick a sponsor type."]
    ].forEach(function (pair) {
      var input = form.elements[pair[0]];
      var ok = !!input.value.trim();
      markField(input, ok);
      setError(pair[0], ok ? "" : pair[1]);
      if (!ok) errors.push(pair[0]);
    });

    // sponsor email
    var se = form.elements["sponsorEmail"];
    var seOk = isEmail(se.value.trim());
    markField(se, seOk);
    setError("sponsorEmail", seOk ? "" : "Enter a valid email.");
    if (!seOk) errors.push("sponsorEmail");

    // members
    var rows = Array.prototype.slice.call(membersEl.querySelectorAll(".member-row"));
    var memberErr = "";
    if (rows.length < MIN_MEMBERS) {
      memberErr = "Add at least " + MIN_MEMBERS + " members.";
    } else {
      rows.forEach(function (row) {
        var name = row.querySelector('[name="member-name"]');
        var email = row.querySelector('[name="member-email"]');
        var nameOk = !!name.value.trim();
        var emailOk = isEmail(email.value.trim());
        markField(name, nameOk);
        markField(email, emailOk);
        if (!nameOk || !emailOk) memberErr = "Every member needs a name and a valid email.";
      });
    }
    setError("members", memberErr);
    if (memberErr) errors.push("members");

    // attestations
    var checks = ["gpa", "present", "legal"];
    var attestOk = checks.every(function (id) { return form.elements[id].checked; });
    setError("attest", attestOk ? "" : "Please confirm all three statements.");
    if (!attestOk) errors.push("attest");

    return errors;
  }

  function collect() {
    var members = Array.prototype.slice.call(membersEl.querySelectorAll(".member-row")).map(function (row) {
      return {
        name: row.querySelector('[name="member-name"]').value.trim(),
        email: row.querySelector('[name="member-email"]').value.trim(),
        role: row.querySelector('[name="member-role"]').value
      };
    });
    return {
      teamName: form.elements["teamName"].value.trim(),
      school: form.elements["school"].value.trim(),
      engine: form.elements["engine"].value,
      platform: form.elements["platform"].value,
      members: members,
      sponsor: {
        name: form.elements["sponsorName"].value.trim(),
        type: form.elements["sponsorType"].value,
        email: form.elements["sponsorEmail"].value.trim(),
        fundraisingGoal: Number(form.elements["fundraisingGoal"].value) || 200
      },
      attestations: { gpa: true, present: true, sharedOwnership: true },
      submittedAt: new Date().toISOString()
    };
  }

  function saveLocal(reg) {
    try {
      var key = "tankopani_registrations";
      var list = JSON.parse(localStorage.getItem(key) || "[]");
      list.push(reg);
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) { /* storage may be unavailable on file:// in some browsers */ }
  }

  function downloadReceipt(reg) {
    try {
      var blob = new Blob([JSON.stringify(reg, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      var safe = reg.teamName.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "team";
      a.href = url;
      a.download = "tankopanijam-" + safe + ".json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    } catch (e) { /* ignore */ }
  }

  function showSuccess(reg) {
    form.hidden = true;
    var ok = document.getElementById("success");
    var dl = document.getElementById("summary");
    dl.innerHTML =
      '<dt>Team</dt><dd>' + esc(reg.teamName) + " · " + esc(reg.school) + "</dd>" +
      '<dt>Members (' + reg.members.length + ')</dt><dd>' +
        reg.members.map(function (m) { return esc(m.name) + (m.role ? " — " + esc(m.role) : ""); }).join("<br>") + "</dd>" +
      '<dt>Engine / Platform</dt><dd>' + esc(reg.engine) + " · " + esc(reg.platform) + "</dd>" +
      '<dt>Sponsor</dt><dd>' + esc(reg.sponsor.name) + " (" + esc(reg.sponsor.type) + ") · goal $" + reg.sponsor.fundraisingGoal + "</dd>";
    ok.hidden = false;
    ok.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.className = "form-status";

    var errors = validate();
    if (errors.length) {
      statusEl.textContent = "Please fix the highlighted fields.";
      statusEl.className = "form-status err";
      var first = form.querySelector(".field--invalid input, .field--invalid select") ||
                  form.querySelector('.field__error[data-for="' + errors[0] + '"]');
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    var reg = collect();
    saveLocal(reg);
    downloadReceipt(reg);

    if (SUBMIT_ENDPOINT) {
      statusEl.textContent = "Submitting…";
      statusEl.className = "form-status";
      fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(reg)
      }).then(function (r) {
        if (!r.ok) throw new Error("bad status");
        showSuccess(reg);
      }).catch(function () {
        // Saved locally + downloaded regardless, so still confirm.
        showSuccess(reg);
      });
    } else {
      showSuccess(reg);
    }
  });

  document.getElementById("register-another").addEventListener("click", function () {
    location.reload();
  });

  // seed the minimum number of member rows
  for (var i = 0; i < MIN_MEMBERS; i++) addMember(false);
  addBtn.addEventListener("click", function () { addMember(true); });
})();
