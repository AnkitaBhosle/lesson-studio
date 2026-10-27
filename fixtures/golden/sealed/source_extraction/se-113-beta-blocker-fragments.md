---
id: se-113-beta-blocker-fragments
task: source_extraction
difficulty: hard
persona: "Nursing pharmacology instructor (ADN program); these are her old slide texts, pasted in"
why_hard: "Slide text that is mostly bullet fragments, arrows and abbreviations (BB, HTN, MI, HF, DM, AE, ppx); the digest must expand them correctly, keep facts traceable to the slide they came from, and must not invent dosages or hold parameters that the slides leave blank."
source:
  kind: text
  title: "Old slides: beta blockers"
  visibility: private
  inline: "Source"
expect:
  must_extract:
    - "Beta blockers (names usually end in -olol) block beta-1 receptors in the heart, and some also block beta-2 receptors in the lungs, lowering heart rate, force of contraction and blood pressure (Slide 2)"
    - "Cardioselective (beta-1) examples are metoprolol and atenolol; propranolol is non-selective (Slide 3)"
    - "Uses: high blood pressure, angina, after a heart attack, some heart failure, arrhythmias; propranolol also for migraine prevention and tremor (Slide 4)"
    - "Adverse effects: slow heart rate, low blood pressure, fatigue, dizziness, bronchospasm (especially with non-selective drugs), and masking the fast heart rate that warns of low blood sugar in people with diabetes (Slide 5)"
    - "Nursing care: take an apical pulse for a full minute before giving; hold and notify per parameters; don't stop the drug suddenly because of rebound fast heart rate or angina; have patients stand up slowly (Slide 6)"
  should_flag_gaps:
    - "No dosages anywhere: slide 8 says 'dosing -> see drug guide (TBD)'; the digest must say dosing is missing, not supply numbers"
    - "Hold parameters are left as 'per parameters (?? facility)', with no heart-rate or blood-pressure thresholds"
    - "'HF (some)' doesn't say which beta blockers are used in heart failure"
  reading_level: advanced
notes: ""
---

## Source
SLIDE 1: Beta blockers (BBs) - "olol"

SLIDE 2: MOA: block β1 (heart) ± β2 (lungs) -> ↓HR, ↓contractility, ↓BP

SLIDE 3: cardiosel. (β1): metoprolol, atenolol // non-sel: propranolol

SLIDE 4: Uses: HTN, angina, post-MI, HF (some), arrhythmias. propranolol also: migraine ppx, tremor

SLIDE 5: AE: brady, hypoTN, fatigue, dizzy, bronchospasm (non-sel!!), masks hypoglycemia sx (tachy) in DM pts

SLIDE 6: Nsg: apical pulse x1 full min before admin. hold + notify per parameters (?? facility). no abrupt d/c -> rebound tachy/angina. rise slowly

SLIDE 7: Pt teach: same as 6 + check own pulse? (ask Pam if we still teach this)

SLIDE 8: dosing -> see drug guide (TBD)
