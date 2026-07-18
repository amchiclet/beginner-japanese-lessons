# Beginner Japanese — Tourist Lessons

A short, practical Japanese course for travelling: speaking and reading just enough to order,
shop, find your way, and read signs. Built around three core sentence patterns plus
high-frequency vocabulary, with audio, flashcard drills, and light history asides.

**Live site:** open [`index.html`](index.html) locally, or via GitHub Pages once enabled.

## What's inside

- `index.html` — landing page linking every lesson and reference.
- `lessons/` — the lessons (`0001`…), each a self-contained HTML page with quizzes, a flashcard
  drill, and audio. `lessons/audio/` holds the generated pronunciation clips.
- `reference/` — cheat sheets to revisit: the 3 core patterns, glossary, katakana chart,
  survival kanji, a Thai-speaker's head start, backstories, and how-to-study notes.
- `assets/` — shared stylesheet and reusable components (`quiz.js`, `srs.js`, `speak.js`), plus
  `gen-audio.sh` for regenerating audio.

## The course in one glance

| Pattern | Meaning | Lesson |
|---|---|---|
| `___ をください` | request / order it | 1 |
| `___ はどこですか？` | where is it? | 4 |
| `___ はありますか？` | do you have it? | 5 |

Reading track (katakana → survival kanji) runs alongside in Lessons 2, 3, and onward.

## Audio

Pronunciation clips are generated locally with macOS text-to-speech (Kyoko voice):

```sh
assets/gen-audio.sh lessons/audio/lesson1.manifest lessons/audio
```

They're a guide, not native recordings.
