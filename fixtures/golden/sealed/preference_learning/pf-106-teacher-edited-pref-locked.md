---
id: pf-106-teacher-edited-pref-locked
task: preference_learning
difficulty: hard
persona: "Community college history instructor"
why_hard: "The teacher edited a learned preference by hand, which locks it. Later edits that look like the old learned pattern (full references) are situational and must not overwrite her version; meanwhile a different, consistent habit should be learned."
existing_preferences:
  - "Citations: author and year in the slide footer (teacher; she edited this by hand from the learned 'Citations: full reference on a final slide')"
  - "Tone: warm (learned)"
removed_preferences: []
edits:
  - lesson: "Reconstruction"
    did: "Expanded the footer citation on slide 6 to a full archive reference, because students must find that letter in the library's special collections"
  - lesson: "Reconstruction"
    did: "Added a final 'Discussion question' slide"
  - lesson: "The Gilded Age"
    did: "Moved all citations to a final references slide, for the copy she is submitting to the curriculum committee"
  - lesson: "The Gilded Age"
    did: "Added a final 'Discussion question' slide"
  - lesson: "Progressive Era reforms"
    did: "Added a final 'Discussion question' slide"
expect:
  should_learn:
    - "End each lecture with a discussion question slide"
  must_not_learn:
    - "Any change to the citation preference she set by hand (her edit wins over learning)"
    - "Citations: full reference on a final slide"
notes: ""
---
