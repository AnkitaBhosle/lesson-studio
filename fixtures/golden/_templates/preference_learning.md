---
id: pf-000-short-name
task: preference_learning
difficulty: easy
persona: ""
why_hard: ""
existing_preferences: []         # e.g. "Tone: warm (learned)"
removed_preferences: []          # values the teacher removed; must never be relearned
edits:                           # what the teacher did, across lessons, in order
  - lesson: "Lesson title"
    did: "Shortened every bullet on slides 2–6 to under eight words"
expect:
  should_learn:                  # preference text a good answer would produce, or [] for none
    - ""
  must_not_learn: []             # e.g. one-off edits that shouldn't become preferences
notes: ""
---
