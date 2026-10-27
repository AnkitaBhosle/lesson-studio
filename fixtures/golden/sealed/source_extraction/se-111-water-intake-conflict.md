---
id: se-111-water-intake-conflict
task: source_extraction
difficulty: hard
persona: "High-school health teacher who pasted together what she found while prepping a hydration lesson"
why_hard: "Sources that disagree: the notes combine a staff wellness newsletter's fixed 'eight glasses of plain water for everyone' rule with the National Academies' total-water figures (which include food and all drinks and offer no glasses rule) and a CDC page that gives no single number. The digest must surface the disagreement instead of averaging or picking one silently."
source:
  kind: text
  title: "Hydration lesson - what I found"
  visibility: private
  inline: "Source"
expect:
  must_extract:
    - "National Academies (2004 report, per the notes): about 2.7 liters a day of total water for women and 3.7 liters for men, counting all drinks and the water in food; roughly 20% comes from food"
    - "National Academies (per the notes): most healthy people meet their needs by letting thirst guide them, and the report gives no rule of thumb in glasses"
    - "CDC page (per the notes): no single daily amount; needs vary with age, sex, activity, hot weather, illness, pregnancy and breastfeeding"
    - "Staff wellness newsletter (no author, no source): everyone needs eight 8-ounce glasses (64 oz) of plain water a day, and coffee doesn't count"
  should_flag_gaps:
    - "The three sources disagree: a fixed plain-water rule versus total-water estimates that include food and all drinks versus 'no single number'; the digest must say so explicitly"
    - "The newsletter's claims have no source; they should be marked unsupported rather than treated as facts"
    - "The notes give no teen-specific figures, though the class is 15–17 year olds"
  reading_level: intermediate
notes: "Real sources behind the notes: https://www.nationalacademies.org/news/report-sets-dietary-intake-levels-for-water-salt-and-potassium-to-maintain-health-and-reduce-chronic-disease-risk and https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/index.html (both read Oct 2026). The newsletter is invented for the case."
---

## Source
hydration lesson, 10th gr health. stuff I found:

1) staff wellness newsletter (the Sept one from district HR, no author listed):
"8 glasses a day!!" 8 x 8oz = 64 oz of PLAIN water, for everyone. says coffee + soda don't count bc they dehydrate you. this is the one the kids have all heard

2) National Academies report 2004 (found the press release, nationalacademies.org):
- women ~2.7 L/day, men ~3.7 L/day TOTAL water
- total = all drinks + water in food. ~80% drinks, ~20% food
- most healthy ppl are fine just letting thirst guide them
- they literally say they don't give a "how many glasses" rule
- no upper limit set, too much is rare

3) CDC water + healthier drinks page:
- does NOT give one number
- depends on age, sex, how active, hot weather, sick (fever/vomiting/diarrhea), pregnant/breastfeeding
- water good bc 0 calories, swap for sugary drinks

?? so which do I teach. 64 oz vs 2.7 L (that's like 91 oz?) vs "it depends"
kids will ask about sports practice too
