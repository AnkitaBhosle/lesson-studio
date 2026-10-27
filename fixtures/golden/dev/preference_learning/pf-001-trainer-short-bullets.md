---
id: pf-001-trainer-short-bullets
task: preference_learning
difficulty: medium
persona: "Corporate security trainer"
why_hard: ""
existing_preferences:
  - "Tone: straight to the point (teacher)"
removed_preferences:
  - "Prefer illustrations over photos"
edits:
  - lesson: "Phishing basics"
    did: "Shortened bullets on slides 2–7 to under eight words each"
  - lesson: "Password managers"
    did: "Shortened bullets on slides 3–5; deleted the slide about browser extensions"
  - lesson: "Reporting an incident"
    did: "Shortened every bullet to under eight words; swapped one photo for an illustration"
expect:
  should_learn:
    - "Keep bullets under 8 words"
  must_not_learn:
    - "Remove slides about browser extensions (one-off edit)"
    - "Prefer illustrations over photos (previously removed by the teacher)"
notes: "One illustration swap must not relearn a preference the teacher removed."
---
