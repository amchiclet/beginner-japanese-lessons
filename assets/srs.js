/* ============================================================
   SRS-lite flashcard drill for Tourist Japanese.
   Repeatable + randomizable, self-testing. No dependencies.

   A card: { jp:'これ', romaji:'kore', en:'this', thai:'(optional Thai hook)' }

   Usage:
     SRS.deck('drill-1', CARDS, { title:'Drill', direction:'recognise' });

   Modes (toggle in the UI):
     recognise  — see Japanese, recall meaning   (reading track)
     produce    — see English,  recall Japanese  (speaking track)

   Loop: flip to check yourself, then mark "Got it" or "Again".
   "Again" cards are requeued so you keep hitting them until they stick.
   Restart reshuffles the whole deck. Order is randomised every round.
   ============================================================ */
(function (global) {
  "use strict";

  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }

  // Fisher–Yates shuffle (browser Math.random is fine here)
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function deck(containerId, cards, opts) {
    var root = document.getElementById(containerId);
    if (!root) return;
    opts = opts || {};
    root.classList.add("srs");

    var direction = opts.direction || "recognise";
    var queue = [];        // indices still to answer this round
    var mastered = 0;
    var flipped = false;
    var cur = null;

    // ---- controls bar ----
    var bar = el("div", "srs-bar");
    var title = el("div", "srs-title", opts.title || "Flashcard drill");
    var dirBtn = el("button", "srs-toggle", ""); dirBtn.type = "button";
    var restart = el("button", "srs-toggle", "↻ Restart"); restart.type = "button";
    bar.appendChild(title);
    var ctrls = el("div", "srs-ctrls"); ctrls.appendChild(dirBtn); ctrls.appendChild(restart);
    bar.appendChild(ctrls);

    var counter = el("div", "srs-counter", "");
    var stage = el("div", "srs-stage");
    var actions = el("div", "srs-actions");

    root.appendChild(bar);
    root.appendChild(counter);
    root.appendChild(stage);
    root.appendChild(actions);

    function dirLabel() { return direction === "recognise" ? "Mode: read 日本語 → meaning" : "Mode: English → say it"; }

    function newRound() {
      queue = shuffle(cards.map(function (_, i) { return i; }));
      mastered = 0;
      next();
    }

    function next() {
      flipped = false;
      dirBtn.textContent = dirLabel();
      if (queue.length === 0) { finish(); return; }
      cur = cards[queue[0]];
      render();
      counter.textContent = "Mastered " + mastered + " / " + cards.length +
                            " · " + queue.length + " left in the pile";
    }

    function faceFront(c) {
      return direction === "recognise"
        ? '<div class="jp jp-xl">' + c.jp + '</div>'
        : '<div class="srs-en">' + c.en + '</div>';
    }
    function faceBack(c) {
      var thai = c.thai ? '<div class="srs-thai">🇹🇭 ' + c.thai + '</div>' : '';
      return direction === "recognise"
        ? '<div class="romaji srs-romaji">' + c.romaji + '</div><div class="srs-en">' + c.en + '</div>' + thai
        : '<div class="jp jp-xl">' + c.jp + '</div><div class="romaji srs-romaji">' + c.romaji + '</div>' + thai;
    }

    function render() {
      stage.innerHTML = "";
      var card = el("div", "srs-card");
      card.innerHTML = flipped
        ? faceFront(cur) + '<hr class="srs-div">' + faceBack(cur)
        : faceFront(cur) + '<div class="srs-hint">tap to check</div>';
      card.addEventListener("click", function () { if (!flipped) { flipped = true; render(); drawActions(); } });
      // 🔊 speak button, if speak.js is loaded (recorded clip, else live voice)
      if (global.Speak && (cur.audio || cur.jp)) {
        card.appendChild(global.Speak.button({ file: cur.audio, jp: cur.jp }));
      }
      stage.appendChild(card);
      drawActions();
    }

    function drawActions() {
      actions.innerHTML = "";
      if (!flipped) return;
      var again = el("button", "srs-again", "Again"); again.type = "button";
      var got = el("button", "srs-got", "Got it ✓"); got.type = "button";
      again.addEventListener("click", function () {
        var id = queue.shift();
        var pos = Math.min(queue.length, 3);   // reinsert a few cards back
        queue.splice(pos, 0, id);
        next();
      });
      got.addEventListener("click", function () {
        queue.shift(); mastered++;
        next();
      });
      actions.appendChild(again); actions.appendChild(got);
    }

    function finish() {
      stage.innerHTML = "";
      var done = el("div", "srs-done",
        "🎉 Round complete — " + cards.length + " cards mastered.<br>" +
        "<span class='srs-hint'>Come back tomorrow: spacing is what turns this into long-term memory.</span>");
      stage.appendChild(done);
      actions.innerHTML = "";
      counter.textContent = "";
    }

    dirBtn.addEventListener("click", function () {
      direction = direction === "recognise" ? "produce" : "recognise";
      newRound();
    });
    restart.addEventListener("click", newRound);

    newRound();
  }

  global.SRS = { deck: deck };
})(window);
