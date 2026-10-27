---
id: pf-104-one-off-deletions
task: preference_learning
difficulty: medium
persona: "Compliance trainer at a regional hospital system"
why_hard: ""
existing_preferences:
  - "Tone: warm (learned)"
removed_preferences: []
edits:
  - lesson: "Privacy basics for new staff"
    did: "Deleted slide 5, which duplicated slide 4 after an earlier edit"
  - lesson: "Fire safety refresher"
    did: "Deleted slide 8, the map of extinguisher locations, because each unit posts its own"
expect:
  should_learn: []
  must_not_learn:
    - "Make lessons shorter or use fewer slides"
    - "Leave out maps or location slides"
    - "Any preference about duplicate content (from one cleanup)"
notes: "Two unrelated one-off deletions with different reasons; the right answer is to learn nothing."
---
