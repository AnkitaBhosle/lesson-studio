---
id: se-103-emergency-fund-guide
task: source_extraction
difficulty: easy
persona: "Personal-finance creator making short videos for people in their first full-time job"
why_hard: ""
source:
  kind: url
  title: "CFPB: An essential guide to building an emergency fund"
  url: https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/
  visibility: cited
  license: "Public domain (US government work, Consumer Financial Protection Bureau)"
expect:
  must_extract:
    - "An emergency fund is cash set aside specifically for unplanned expenses or financial emergencies, such as car or home repairs, medical bills or a loss of income (What is an emergency fund?)"
    - "Without savings, even a small shock can push people onto credit cards or loans, or into their retirement savings, and that debt is harder to pay off (Why do I need it?)"
    - "How much to save depends on your situation; the guide suggests looking at the unexpected costs you've had before, and stresses that even a small amount helps (How much do I need in it?)"
    - "Savings strategies: build a habit (set a goal, contribute consistently, track progress, celebrate), manage cash flow (e.g. move bill due dates), save one-time money such as a tax refund, automate recurring transfers (watch for overdraft fees), and split a direct-deposit paycheck (Strategy sections)"
    - "Where to keep it: a bank or credit union account (described as generally one of the safest places), a prepaid card, or cash, which can be lost or stolen (Where should I keep it?)"
  should_flag_gaps:
    - "The guide gives no target amount (for example a number of months of expenses); any specific figure would have to come from another source and be flagged"
  reading_level: beginner
notes: "Tempting error: adding the popular '3 to 6 months of expenses' rule as if the CFPB said it. It does not appear on this page."
---
