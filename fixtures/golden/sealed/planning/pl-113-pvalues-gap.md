---
id: pl-113-pvalues-gap
task: planning
difficulty: hard
persona: "Intro statistics instructor at a state university, non-majors section"
why_hard: "A real gap the plan must flag rather than fill: the notes never define the null hypothesis (or the alternative), yet every slide depends on it. The notes also contain a misconception written as a question. A plan that quietly writes its own definition and presents it as the teacher's material fails."
teacher:
  starter: live_lecture
  audience: "Non-majors in intro stats; know sampling distributions and the normal curve; many are anxious about math"
  length_minutes: 50
  guidelines:
    - "Use one running example through the whole lecture"
    - "Flag anything not in my notes so I can check it"
request: "Lecture 14: p-values, what they mean and what they don't"
sources:
  - title: "Lecture 14 notes"
    kind: text
    visibility: private
    inline: "Source: notes"
already_known:
  - "Lecture 13: Sampling distributions and the Central Limit Theorem"
expect:
  slides_min: 17
  slides_max: 25
  must_cover:
    - "The p-value: the probability of a result at least as extreme as the one observed, assuming H0 is true"
    - "The significance level alpha = 0.05, chosen before looking at the data"
    - "Reject H0 when p is at or below alpha; otherwise 'fail to reject', which is not proof that H0 is true"
    - "The coin running example: 61 heads in 100 flips, p about 0.035 two-sided, reject at 0.05"
    - "Statistical significance is not practical importance (the huge-sample example)"
    - "A slide that corrects the misconception that p < 0.05 means '95% sure the hypothesis is true'"
  must_not:
    - "Present a definition of the null hypothesis as if it came from the notes"
    - "Say the p-value is the probability that the null hypothesis is true"
  should_flag:
    - "The definition of the null and alternative hypotheses, which the notes never give; the plan should say it's missing and offer a draft for the teacher to confirm"
  recap_expected: true
notes: "Recap is reasonable: p-values are computed from the sampling distribution covered in Lecture 13."
---

## Source: notes
L14 p-values. same coin all lecture.

- recap sampling dist? 5 min max
- coin: 100 flips, 61 heads. is the coin fair?? -> set up H0
- p-value = P(at least as extreme as observed | H0 true)
- for coin p ≈ 0.035 two sided
- alpha .05 picked BEFORE (they always want to pick after, stop that)
- p <= alpha -> reject H0. p > alpha -> fail to reject. not "accept"!!
- "p < .05 means 95% sure the hypothesis is true"?? - students say this, fix it
- sig ≠ important. n = 50,000, BP drops 0.5 mmHg, "significant" but who cares
- applet sim if wifi works
- hw 9.1-9.3
