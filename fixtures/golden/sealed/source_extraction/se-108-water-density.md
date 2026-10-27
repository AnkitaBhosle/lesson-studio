---
id: se-108-water-density
task: source_extraction
difficulty: medium
persona: "7th-grade science teacher building a density lab; this is the background reading she assigns"
why_hard: ""
source:
  kind: url
  title: "USGS Water Science School: Water Density"
  url: https://www.usgs.gov/water-science-school/science/water-density
  visibility: cited
  license: "Public domain (US government work, USGS)"
expect:
  must_extract:
    - "Density is mass per unit volume; pure water is about 1 gram per cubic centimeter (1 g/mL)"
    - "Water's density changes with temperature and is greatest at about 4 °C (39.2 °F); warmer water is less dense (the page's table shows about 0.958 g/cm³ at 100 °C)"
    - "Ice is roughly 9–10% less dense than liquid water because its molecules lock into a spaced-out lattice, so ice floats and about a tenth of an iceberg sits above the water"
    - "Because the densest water sinks, lakes freeze from the top down rather than the bottom up"
    - "Dissolved substances such as salt make water denser, so seawater is denser than fresh water; a hydrometer measures a liquid's density (specific gravity) by how high it floats"
  should_flag_gaps:
    - "No classroom procedure: the page doesn't explain how students would measure mass and volume to calculate density themselves"
    - "No densities of other everyday materials to compare against water"
  reading_level: intermediate
notes: "The page has a side note that ice made from heavy water sinks; including it is fine but not required."
---
