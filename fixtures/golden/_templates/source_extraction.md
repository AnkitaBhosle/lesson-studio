---
id: se-000-short-name            # must match the file name
task: source_extraction
difficulty: easy                 # easy | medium | hard
persona: "Who wrote or assigned this source, e.g. high-school history teacher"
why_hard: ""                     # for hard cases: what makes it hard
source:
  kind: text                     # text | pdf | url
  title: "What the teacher would call it"
  inline: "Source"               # text: the heading of the section below that holds it
  # file: files/your-file.pdf    # pdf: put the file in files/
  # url: https://...             # url: openly licensed pages only
expect:
  must_extract:                  # 3–5 facts a good digest must contain, in your words
    - ""
  should_flag_gaps:              # what's missing that a learner would need (can be empty)
    - ""
  reading_level: beginner        # beginner | intermediate | advanced
notes: ""
---

## Source
Paste or write the teacher's text here (your own words or openly licensed).
