---
id: se-101-heat-illness-signs
task: source_extraction
difficulty: easy
persona: "Day-camp director training summer counselors (most are 17–20) before the first heat wave"
why_hard: ""
source:
  kind: url
  title: "CDC NIOSH: Heat-related Illnesses"
  url: https://www.cdc.gov/niosh/heat-stress/about/illnesses.html
  visibility: cited
  license: "Public domain (US government work, CDC/NIOSH)"
expect:
  must_extract:
    - "Heat stroke is the most serious heat illness: body temperature can climb to 106°F or higher within 10 to 15 minutes, and it can cause death or permanent disability without emergency care (Heat stroke)"
    - "Heat stroke first aid: call 911, stay with the person, move them somewhere cool and shaded, remove outer clothing, and cool them fast with cold water, wet cloths or ice on the head, neck, armpits and groin (Heat stroke, First aid)"
    - "Heat exhaustion is the body's response to losing too much water and salt through sweating; signs include headache, nausea, dizziness, weakness, irritability, thirst, heavy sweating and making less urine (Heat exhaustion)"
    - "Heat exhaustion first aid: get the person out of the heat and to medical care, don't leave them alone, remove extra clothing, cool them with cold compresses or water, and encourage frequent small sips of cool water (Heat exhaustion, First aid)"
    - "Milder conditions are listed separately with their own first aid: heat cramps (water plus an electrolyte drink every 15–20 minutes, no salt tablets), heat syncope (fainting or dizziness; sit or lie down somewhere cool and sip fluids), heat rash (keep it dry, powder, no creams), and rhabdomyolysis (dark urine and muscle pain; stop activity and get care)"
  should_flag_gaps:
    - "The page is written for workers; it says nothing about children or campers specifically, so anything about kids needs another source"
    - "Prevention (getting used to the heat gradually, scheduled water, rest and shade breaks) is not on this page"
  reading_level: beginner
notes: "Clean, well-structured page. A good digest keeps heat stroke and heat exhaustion clearly distinct, since mixing up which one needs 911 is the classic error."
---
