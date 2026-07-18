/* ============================================================
   speak.js — audio playback for Tourist Japanese lessons.

   Two sources, in order of preference:
     1. A pre-recorded local clip (made by assets/gen-audio.sh).
     2. The browser's built-in Japanese voice (Web Speech API) as a
        fallback — needs no files and speaks ANY sentence live.

   Markup: any element with class "say"
     <button class="say" data-file="audio/kore.m4a" data-jp="これ">🔊</button>
   On click it plays data-file; if that's missing or fails, it speaks
   data-jp with the browser's ja-JP voice. Either attribute alone works.

   Also exposed for other components (e.g. srs.js):
     Speak.play({ file, jp })   // element-free playback
     Speak.button({ file, jp }) // returns a ready 🔊 button
   ============================================================ */
(function (global) {
  "use strict";

  var jaVoice = null;
  function pickVoice() {
    if (!('speechSynthesis' in global)) return null;
    var vs = global.speechSynthesis.getVoices() || [];
    // Prefer Kyoko, else any ja voice.
    jaVoice = vs.filter(function (v) { return /Kyoko/i.test(v.name); })[0] ||
              vs.filter(function (v) { return /ja(-|_)JP/i.test(v.lang) || /^ja\b/i.test(v.lang); })[0] || null;
  }
  if ('speechSynthesis' in global) {
    pickVoice();
    global.speechSynthesis.onvoiceschanged = pickVoice;
  }

  function tts(text) {
    if (!text || !('speechSynthesis' in global)) return false;
    try {
      global.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      if (jaVoice) u.voice = jaVoice;
      u.rate = 0.85;              // a touch slow, for learning
      global.speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  }

  function play(opts) {
    opts = opts || {};
    if (opts.file) {
      try {
        var a = new Audio(opts.file);
        a.play().catch(function () { tts(opts.jp); });   // fall back if file 404s
        return;
      } catch (e) { /* fall through */ }
    }
    tts(opts.jp);
  }

  function button(opts) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'say';
    b.textContent = '🔊';
    b.setAttribute('aria-label', 'play audio');
    b.addEventListener('click', function (e) {
      e.stopPropagation();          // don't trigger card flips etc.
      play(opts);
    });
    return b;
  }

  function wire(root) {
    (root || document).querySelectorAll('.say').forEach(function (el) {
      if (el.dataset.wired) return;
      el.dataset.wired = '1';
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        play({ file: el.getAttribute('data-file'), jp: el.getAttribute('data-jp') });
      });
    });
  }

  if (document.readyState !== 'loading') wire();
  else document.addEventListener('DOMContentLoaded', function () { wire(); });

  global.Speak = { play: play, tts: tts, button: button, wire: wire };
})(window);
