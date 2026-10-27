---
id: pf-101-removed-pref-not-relearned
task: preference_learning
difficulty: medium
persona: "High-school chemistry teacher who removed a learned preference last month"
why_hard: ""
existing_preferences:
  - "Tone: warm (learned)"
  - "Citations: short, in the footer (teacher)"
removed_preferences:
  - "Prefer real photos over illustrations"
edits:
  - lesson: "Unit 3: Counting atoms"
    did: "Swapped the illustration on slide 4 for a photo of the lab's actual balance"
  - lesson: "Unit 3: Counting atoms"
    did: "Added the learning goal to the title slide ('Today: count atoms using the mole')"
  - lesson: "Unit 4: Bonding"
    did: "Added the learning goal to the title slide"
  - lesson: "Unit 4: Bonding"
    did: "Swapped the illustration on slide 7 for a photo of table-salt crystals"
  - lesson: "Unit 5: Reactions"
    did: "Added the learning goal to the title slide"
  - lesson: "Unit 5: Reactions"
    did: "Fixed a typo in slide 9's equation (H2O2 changed to H2O)"
expect:
  should_learn:
    - "Put the lesson's learning goal on the title slide"
  must_not_learn:
    - "Prefer real photos over illustrations (removed by the teacher; must never be relearned, even though two photo swaps happened)"
    - "Anything from the one-off equation typo fix"
notes: ""
---
