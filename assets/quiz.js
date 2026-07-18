/* ============================================================
   Reusable interactive components for Tourist Japanese lessons.
   No dependencies. Tight feedback loop: answers self-check on tap.

   Usage in a lesson (after this script is loaded):

     Quiz.mc('quiz-1', {
       title: 'Check yourself',
       questions: [
         { prompt: 'How do you say "this"?',
           options: ['kore','sore','are','dore'],   // answer index 0
           answer: 0,
           because: 'これ (kore) = this, near the speaker.' },
       ]
     });

     Quiz.recall('recall-1', [
       { prompt: '"Excuse me / to get attention" =', accept: ['sumimasen'],
         show: 'すみません (sumimasen)' },
     ]);

     Quiz.cards('cards-1', [
       { front: 'これ', back: 'kore — this' },
     ]);

   Design rules honoured here:
   - Options are rendered in the given order but do NOT reveal the answer
     through formatting. (Keep option text equal-length in the lesson data.)
   - Feedback is immediate and explains *why*.
   ============================================================ */
(function (global) {
  "use strict";

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.innerHTML = txt;
    return e;
  }

  // ---- Multiple choice with immediate, explained feedback ----
  function mc(containerId, cfg) {
    var root = document.getElementById(containerId);
    if (!root) return;
    root.classList.add("quiz");
    if (cfg.title) root.appendChild(el("h3", null, cfg.title));

    var total = cfg.questions.length, answered = 0, correct = 0;
    var scoreEl = el("div", "score", "");

    cfg.questions.forEach(function (q) {
      var wrap = el("div", "q");
      wrap.appendChild(el("div", "prompt", q.prompt));
      var opts = el("div", "opts");
      var done = false;

      q.options.forEach(function (label, i) {
        var b = el("button", "opt", label);
        b.type = "button";
        b.addEventListener("click", function () {
          if (done) return;
          done = true; answered++;
          var fb = wrap.querySelector(".feedback");
          if (i === q.answer) {
            b.classList.add("correct"); correct++;
            fb.className = "feedback correct";
            fb.innerHTML = "✓ " + (q.because || "Correct.");
          } else {
            b.classList.add("wrong");
            var right = opts.children[q.answer];
            if (right) right.classList.add("correct");
            fb.className = "feedback wrong";
            fb.innerHTML = "✗ " + (q.because || "Not quite.");
          }
          Array.prototype.forEach.call(opts.children, function (c) { c.disabled = true; });
          scoreEl.textContent = "Score: " + correct + " / " + answered +
            (answered === total ? " — done" : "");
        });
        opts.appendChild(b);
      });

      wrap.appendChild(opts);
      wrap.appendChild(el("div", "feedback", ""));
      root.appendChild(wrap);
    });

    root.appendChild(scoreEl);
  }

  // ---- Type-in recall (storage-strength retrieval) ----
  function norm(s) {
    return (s || "").toLowerCase().trim()
      .replace(/[’'`]/g, "").replace(/\s+/g, " ")
      .replace(/[.。!?]/g, "");
  }
  function recall(containerId, items, title) {
    var root = document.getElementById(containerId);
    if (!root) return;
    root.classList.add("quiz");
    root.appendChild(el("h3", null, title || "Recall from memory"));

    items.forEach(function (it) {
      var wrap = el("div", "q recall");
      wrap.appendChild(el("div", "prompt", it.prompt));
      var input = el("input"); input.type = "text"; input.placeholder = "type romaji…";
      var check = el("button", "check", "Check"); check.type = "button";
      var reveal = el("button", "reveal", "show answer"); reveal.type = "button";
      var fb = el("div", "feedback", "");

      function judge() {
        var ok = (it.accept || []).some(function (a) { return norm(a) === norm(input.value); });
        if (ok) { fb.className = "feedback correct"; fb.innerHTML = "✓ " + (it.show || "Correct."); }
        else { fb.className = "feedback wrong"; fb.innerHTML = "✗ Try again, or reveal."; }
      }
      check.addEventListener("click", judge);
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") judge(); });
      reveal.addEventListener("click", function () {
        fb.className = "feedback"; fb.innerHTML = "→ " + (it.show || (it.accept && it.accept[0]));
      });

      var row = el("div"); row.appendChild(input); row.appendChild(check); row.appendChild(reveal);
      wrap.appendChild(row); wrap.appendChild(fb);
      root.appendChild(wrap);
    });
  }

  // ---- Flashcards: tap to flip (spacing + self-test) ----
  function cards(containerId, list, title) {
    var root = document.getElementById(containerId);
    if (!root) return;
    if (title) root.appendChild(el("h3", null, title));
    var grid = el("div", "cards");
    list.forEach(function (c) {
      var card = el("div", "card");
      card.appendChild(el("div", "front jp", c.front));
      card.appendChild(el("div", "back", c.back));
      card.addEventListener("click", function () { card.classList.toggle("flipped"); });
      grid.appendChild(card);
    });
    root.appendChild(grid);
  }

  global.Quiz = { mc: mc, recall: recall, cards: cards };
})(window);
