---
id: se-112-pvalue-gap
task: source_extraction
difficulty: hard
persona: "Intro statistics instructor at a state university (non-majors section), notes for the first hypothesis-testing lecture"
why_hard: "A real gap: the notes lean on H0 and 'assuming H0 is true' throughout but never define the null hypothesis, which a beginner can't do without. They also include a common misconception the teacher half-wrote as a question. The digest must name the gap and not fill it silently."
source:
  kind: text
  title: "Lecture 14 notes - p-values"
  visibility: private
  inline: "Source"
expect:
  must_extract:
    - "A p-value is the probability of getting a result at least as extreme as the one observed, assuming H0 is true"
    - "Small p-value means the observed data would be surprising if H0 were true; the class uses a significance level of alpha = 0.05 decided before looking at data"
    - "If p is at or below alpha, reject H0; if not, 'fail to reject', which is not the same as proving H0"
    - "Worked example in the notes: a coin flipped 100 times lands heads 61 times; the notes give p of about 0.035 (two-sided) and conclude reject H0 at 0.05"
    - "Statistical significance is not practical importance; a tiny effect can be significant with a huge sample"
  should_flag_gaps:
    - "The null hypothesis is never defined (nor the alternative hypothesis), though every step depends on it; the lesson needs a plain definition and, for the coin, what H0 is (the coin is fair)"
    - "The note 'p < .05 means 95% sure the hypothesis is true??' is a misconception; the digest should flag it as wrong rather than list it as a fact"
  reading_level: intermediate
notes: "Coin example check: 61 heads in 100 fair flips has a two-sided exact binomial p of about 0.035, so the notes' number and conclusion are right."
---

## Source
L14 - p values (STAT 1040, MWF)

recap q from last time? (sampling distributions) - maybe skip if behind

- p-value = P(result at least as extreme as what we saw | H0 true)
- small p -> data would be surprising if H0 were true -> evidence against H0
- alpha = .05 for this class, decide BEFORE looking at data (stress this, they always want to pick after)
- p <= alpha -> reject H0
- p > alpha -> "fail to reject" H0. NOT "accept". NOT proof H0 true.

coin ex: flip 100x, 61 heads. p ≈ 0.035 (2-sided). reject H0 at .05
  - do the sim in class? applet from last yr, check link still works

p < .05 means 95% sure the hypothesis is true?? (students say this every term, address it)

significance ≠ importance. huge n -> tiny effect still "significant". (drug lowers BP by 0.5 mmHg w/ n=50,000 kind of ex)

hw: 9.1-9.3 odds
