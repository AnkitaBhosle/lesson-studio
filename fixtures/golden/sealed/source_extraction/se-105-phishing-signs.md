---
id: se-105-phishing-signs
task: source_extraction
difficulty: medium
persona: "Corporate trainer who runs the annual security-awareness session for a 300-person logistics company"
why_hard: ""
source:
  kind: url
  title: "FTC: How To Recognize and Avoid Phishing Scams"
  url: https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams
  visibility: cited
  license: "Public domain (US government work, Federal Trade Commission)"
expect:
  must_extract:
    - "Phishing uses email or text messages to trick people into giving up passwords, account numbers or Social Security numbers, which scammers use to get into accounts or sell"
    - "Common stories: suspicious activity or login attempts, a problem with your account or payment details, a request to confirm personal information, an invoice you don't recognize, a link to make a payment, a government refund, or a free coupon"
    - "Signs in the FTC's sample email: a generic greeting, a claim the account is on hold over billing, a link to update payment details, and a real-looking company logo; real companies don't email or text links to update payment information"
    - "Protection: spam filters, security software and phone software set to update automatically, multi-factor authentication (something you know, have, or are), and backups of computers and phones"
    - "If unsure, ask whether you have an account with the sender; if yes, contact the company using a phone number or website you know is real, not the one in the message. Report phishing emails to reportphishing@apwg.org, texts to 7726 (SPAM), and any attempt to ReportFraud.ftc.gov"
  should_flag_gaps:
    - "This is consumer guidance: it says nothing about reporting to a company's own IT or security team, which a workplace training needs"
  reading_level: beginner
notes: ""
---
