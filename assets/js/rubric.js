/* ===========================================================
   TankopaniJam — interactive judging rubric / scorecard
   Renders the three measures from the deck (slide 9),
   live-totals the scores, persists to localStorage, and
   exports a JSON scorecard. Vanilla, no build step.
   =========================================================== */
(function () {
  var MAX = 5; // per-criterion scale 0–5

  var MEASURES = [
    {
      key: "alfred",
      title: "Alfred Measure",
      focus: "Technology",
      icon: "🤖",
      criteria: [
        "How was technology leveraged in the project?",
        "Does it create a new and interesting use of game mechanics, inputs, or new technology?",
        "Is the tech / game easy to use and navigate?",
        "Does it provide some kind of “magical moment” for players?"
      ]
    },
    {
      key: "jessie",
      title: "Jessie Measure",
      focus: "Education",
      icon: "📚",
      criteria: [
        "What educational aspects were used within the game?",
        "Did the educational aspects flow naturally within the game?",
        "Did the educational materials mesh well with the theme and requirements?"
      ]
    },
    {
      key: "alicia",
      title: "Alicia Measure",
      focus: "Design",
      icon: "🎨",
      criteria: [
        "Was it aesthetically pleasing to play the game?",
        "Does the game’s “feel” match the theme and mechanics?",
        "Were there elements that were eye-catching and fun to interact with?"
      ]
    }
  ];

  var STORE_KEY = "tankopani_rubric_draft";
  var container = document.getElementById("measures");
  if (!container) return;

  var grandEl = document.getElementById("grand");
  var grandMaxEl = document.getElementById("grandMax");
  var grandPctEl = document.getElementById("grandPct");
  var statusEl = document.getElementById("rubric-status");
  var judgeEl = document.getElementById("judgeName");
  var gameEl = document.getElementById("gameName");

  var totalMax = MEASURES.reduce(function (s, m) { return s + m.criteria.length * MAX; }, 0);
  grandMaxEl.textContent = totalMax;

  // ---- render ----
  MEASURES.forEach(function (m) {
    var measureMax = m.criteria.length * MAX;
    var block = document.createElement("section");
    block.className = "measure";
    block.dataset.key = m.key;
    block.innerHTML =
      '<div class="measure__head">' +
        '<div>' +
          '<h3 class="measure__title">' + m.icon + " " + m.title + "</h3>" +
          '<div class="measure__sub">' + m.focus + "</div>" +
        "</div>" +
        '<div class="measure__score"><b data-sub="' + m.key + '">0</b> / ' + measureMax + "</div>" +
      "</div>" +
      m.criteria.map(function (c, i) {
        var id = m.key + "-" + i;
        return '<div class="criterion">' +
                 '<label class="criterion__label" for="' + id + '">' + c + "</label>" +
                 '<div class="score-input">' +
                   '<input type="range" id="' + id + '" min="0" max="' + MAX + '" step="1" value="0" ' +
                          'data-measure="' + m.key + '">' +
                   '<output for="' + id + '">0</output>' +
                 "</div>" +
               "</div>";
      }).join("");
    container.appendChild(block);
  });

  var inputs = Array.prototype.slice.call(container.querySelectorAll('input[type="range"]'));

  function recalc() {
    var grand = 0;
    MEASURES.forEach(function (m) {
      var sub = 0;
      container.querySelectorAll('input[data-measure="' + m.key + '"]').forEach(function (inp) {
        sub += Number(inp.value);
      });
      container.querySelector('[data-sub="' + m.key + '"]').textContent = sub;
      grand += sub;
    });
    grandEl.textContent = grand;
    grandPctEl.textContent = totalMax ? Math.round((grand / totalMax) * 100) : 0;
  }

  function save() {
    try {
      var data = { judge: judgeEl.value, game: gameEl.value, scores: {} };
      inputs.forEach(function (inp) { data.scores[inp.id] = Number(inp.value); });
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (!data) return;
      judgeEl.value = data.judge || "";
      gameEl.value = data.game || "";
      inputs.forEach(function (inp) {
        if (data.scores && inp.id in data.scores) {
          inp.value = data.scores[inp.id];
          inp.nextElementSibling.value = inp.value;
        }
      });
    } catch (e) { /* ignore */ }
  }

  inputs.forEach(function (inp) {
    inp.addEventListener("input", function () {
      inp.nextElementSibling.value = inp.value; // update the <output>
      recalc();
      save();
    });
  });
  [judgeEl, gameEl].forEach(function (el) { el.addEventListener("input", save); });

  // ---- actions ----
  document.getElementById("reset").addEventListener("click", function () {
    inputs.forEach(function (inp) { inp.value = 0; inp.nextElementSibling.value = "0"; });
    recalc();
    save();
    flash("Scores reset.", "ok");
  });

  document.getElementById("export").addEventListener("click", function () {
    var grand = Number(grandEl.textContent);
    var card = {
      event: "TankopaniJam",
      judge: judgeEl.value.trim() || "(unnamed judge)",
      game: gameEl.value.trim() || "(unnamed game)",
      measures: MEASURES.map(function (m) {
        var scores = m.criteria.map(function (c, i) {
          return { criterion: c, score: Number(document.getElementById(m.key + "-" + i).value) };
        });
        return {
          measure: m.title,
          focus: m.focus,
          subtotal: scores.reduce(function (s, x) { return s + x.score; }, 0),
          max: m.criteria.length * MAX,
          scores: scores
        };
      }),
      total: grand,
      maxTotal: totalMax,
      percent: totalMax ? Math.round((grand / totalMax) * 100) : 0,
      scoredAt: new Date().toISOString()
    };
    try {
      var blob = new Blob([JSON.stringify(card, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      var safe = (card.game + "-" + card.judge).replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      a.href = url; a.download = "scorecard-" + safe + ".json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      flash("Scorecard exported (" + grand + "/" + totalMax + ").", "ok");
    } catch (e) {
      flash("Could not export in this browser.", "err");
    }
  });

  function flash(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = "form-status " + (kind || "");
    setTimeout(function () { statusEl.textContent = ""; statusEl.className = "form-status"; }, 3000);
  }

  load();
  recalc();
})();
