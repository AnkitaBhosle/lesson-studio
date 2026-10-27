---
id: pf-105-course-terse-tone
task: preference_learning
difficulty: hard
persona: "Hospital clinical educator who runs two courses: 'New nurse orientation' and 'Night-shift safety huddles'"
why_hard: "A general preference (warm tone) holds in one course but the teacher keeps making narration terse in the other. The right answer learns a course-level preference for that course only and leaves the general one alone."
existing_preferences:
  - "Tone: warm (learned, general)"
removed_preferences: []
edits:
  - lesson: "Night-shift safety huddles: Fall risk at 3 a.m."
    did: "Cut the greeting and the encouragement line; shortened every narration line to one short, direct sentence"
  - lesson: "New nurse orientation: Your first week"
    did: "Kept the warm narration and added a welcome line on slide 1"
  - lesson: "Night-shift safety huddles: IV pump alarms"
    did: "Removed 'Great job, everyone!' from the last slide; rewrote narration as short direct instructions"
  - lesson: "Night-shift safety huddles: Handoff checklist"
    did: "Shortened narration on all six slides to clipped, direct sentences"
  - lesson: "New nurse orientation: Finding your way around"
    did: "Changed 'cafeteria' to 'café' on slide 4"
expect:
  should_learn:
    - "Course preference for 'Night-shift safety huddles': tone brief and direct (overrides the general warm tone in that course only)"
  must_not_learn:
    - "Changing the general tone away from warm"
    - "Brief or terse tone for 'New nurse orientation'"
    - "Anything from the one-word café edit"
notes: ""
---
