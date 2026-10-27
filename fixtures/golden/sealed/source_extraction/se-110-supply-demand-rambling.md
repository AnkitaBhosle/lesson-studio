---
id: se-110-supply-demand-rambling
task: source_extraction
difficulty: hard
persona: "High-school economics teacher who typed these notes in a hurry between classes"
why_hard: "Rambling, out-of-order notes with repeats, a tangent, and one spot where the teacher mixes up a change in demand with a change in quantity demanded; the digest must reorganize the content and not repeat the mix-up as fact."
source:
  kind: text
  title: "S&D notes for Thurs"
  visibility: private
  inline: "Source"
expect:
  must_extract:
    - "Law of demand: when price rises, the quantity people want to buy falls, all else equal; demand curve slopes down (price on the vertical axis, quantity on the horizontal)"
    - "Law of supply: when price rises, sellers offer more; supply curve slopes up"
    - "Equilibrium is where the curves cross: the price at which quantity demanded equals quantity supplied; above it there's a surplus, below it a shortage"
    - "A change in the item's own price moves along the curve (change in quantity demanded); other factors shift the whole curve: income, tastes, price of related goods (the notes' example: hot dogs and buns), expectations, number of buyers"
    - "Planned class example: concert tickets sold below equilibrium leading to a shortage and resale at higher prices"
  should_flag_gaps:
    - "One line says 'price of pizza goes up so demand for pizza goes down', which is a change in quantity demanded, not demand; the digest should flag it rather than repeat it"
    - "Supply shifters are promised ('do the supply list too') but never listed"
  reading_level: intermediate
notes: ""
---

## Source
S&D thurs - per 2 + 5

start w/ the concert tix thing?? or end with it. prob start. tickets $40, everyone wants them, sold out in 2 min, resellers $300. why?? -> shortage b/c price below equilib. (come back to this at end)

law of demand - price up, qty demanded down. ceteris paribus (say "all else equal" not latin, they glaze over)
graph: P on vertical, Q horiz. ALWAYS label axes, last yr half of them flipped it

law of supply - price up, sellers want to sell more. upward slope. farmers example? lemonade stand is easier

equilibrium = where they cross. Qd = Qs. above it -> surplus (stuff sitting there, price falls). below -> shortage (lines, price goes up) -> tie back to concert

!! big confusion every yr: movement along vs shift.
own price change = movement along curve = "change in quantity demanded"
everything else = SHIFT. determinants: income, tastes, related goods (subs + complements, hot dogs/buns), expectations, # of buyers
ex: price of pizza goes up so demand for pizza goes down  <- use this one

side note - minimum wage is a price floor, save for next wk, DON'T get into it thurs, 2nd period will derail

do the supply list too (shifters)

exit ticket: draw a shift + label it. 3 q's max
