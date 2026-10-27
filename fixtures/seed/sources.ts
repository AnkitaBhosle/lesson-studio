import type { Source } from "@ls/schema";
import { T0 } from "./people";

const base = (id: string) => ({ id, createdAt: T0, updatedAt: T0 });
const facts = (prefix: string, items: [string, string][]) => items.map(([text, locator], i) => ({ factId: `${prefix}_f${i + 1}`, text, locator }));

export const MAYA_OUTLINE = `Index funds, the beginner version.
1. What an index is: a list of companies chosen by a simple rule, like the biggest companies in a market.
2. Why low fees matter: a fund that just follows a list needs no stock pickers, so it usually costs less to run. A small yearly fee looks harmless, but it comes out every year, on everything you have invested, for decades.
3. Diversification: one fund, a small slice of every company on the list. If one company stumbles, it is a small part of what you own.
4. How to buy your first one: open a brokerage account, search the fund, buy an amount you are comfortable leaving alone, and set up automatic monthly buys.
5. Mistakes beginners make: selling when the market drops, chasing last year's winners, checking the balance every day, and paying for advice they don't need.`;

export const MAYA_MEMO = `Okay, quick voice memo for the index fund video. The thing I want people to get is this: stop hunting for the needle. Just buy the haystack. Everyone thinks investing means finding the one amazing company before anyone else does, and honestly almost nobody does that well, including professionals. When I bought my first index fund I remember being weirdly disappointed that it was so boring. One purchase and I owned a tiny piece of hundreds of companies. No research rabbit hole, no stress. And then the market dropped that spring and I really, really wanted to sell. I didn't, mostly because I forgot my password for a week, and by the time I got back in it had recovered. So the lesson I learned by accident is the lesson I want to teach on purpose: the hard part isn't picking, it's staying put. Also, say something about fees. People don't believe a small percentage matters until they see two lines drift apart over thirty years. Keep it warm, keep it simple, don't make anyone feel dumb for not knowing this stuff.`;

export const ORTIZ_NOTES = `Week 6 · Photosynthesis · 50 min
Open: where does a tree's mass come from? Take guesses (most will say soil). Don't correct yet.
1. Why it matters: light energy into chemical energy; every food chain starts here. Overall equation. Two stages hide inside it.
2. Chloroplast: leaf → mesophyll cell → chloroplast. Membranes, stroma, thylakoids, grana. Pigments. Quick vote: where do the light reactions happen?
3. Light-dependent reactions: inputs and outputs first (light, water in; ATP, NADPH, oxygen out). Photosystems II and I, splitting water, electron transport, making ATP. Oxygen comes from water, not CO2.
4. Calvin cycle: follow the carbon. Fixation, reduction, regeneration. What the plant does with the sugar.
5. Close: back to the tree; most of the mass came from the air. Light vs Calvin side by side. Misconceptions. Exit question.
Mention C4 plants briefly if time allows (hot, dry climates).`;

export const sources: Source[] = [
  { ...base("src_maya_outline"), courseId: "crs_inv101", lessonIds: ["lsn_index"], kind: "text", title: "Index funds outline", origin: "user_paste", rawRef: "inline", extractedText: MAYA_OUTLINE, status: "ready", approvedForUse: true, visibility: "private",
    digest: { summary: "Five parts: what an index is, why low fees matter over time, diversification, how to buy your first index fund, and the mistakes beginners make.",
      keyConcepts: [{ name: "Index", explanation: "A list of companies chosen by a simple rule." }, { name: "Diversification", explanation: "Owning a small slice of many companies." }],
      quotableFacts: facts("out", [
        ["An index is a list of companies chosen by a simple rule.", "part 1"], ["Index funds need no stock pickers, so they usually cost less to run.", "part 2"],
        ["A yearly fee comes out every year, on everything invested.", "part 2"], ["One index fund holds a small slice of every company on its list.", "part 3"],
        ["If one company stumbles, it is a small part of what you own.", "part 3"], ["Buying starts with a brokerage account.", "part 4"],
        ["Automatic monthly buys remove the need to time the market.", "part 4"], ["Selling when the market drops is a common beginner mistake.", "part 5"],
        ["Chasing last year's winners is a common beginner mistake.", "part 5"], ["Checking the balance every day encourages panic selling.", "part 5"],
        ["Beginners often pay for advice they don't need.", "part 5"], ["Buy an amount you are comfortable leaving alone.", "part 4"],
      ]), figures: [], readingLevel: "beginner" } },
  { ...base("src_maya_memo"), courseId: "crs_inv101", lessonIds: ["lsn_index"], kind: "voice_memo", title: "Recording, Oct 24", origin: "user_upload", rawRef: "fixtures/audio/maya-memo.m4a", extractedText: MAYA_MEMO, status: "ready", approvedForUse: true, visibility: "private",
    digest: { summary: "Maya's \"buy the whole haystack instead of hunting for the needle\" analogy, plus the story of her first investment.",
      keyConcepts: [{ name: "Buy the haystack", explanation: "Own the whole market instead of searching for one winner." }],
      quotableFacts: facts("memo", [
        ["Stop hunting for the needle. Just buy the haystack.", "00:00:08"], ["Her first index fund made her a part-owner of hundreds of companies with one purchase.", "00:00:31"],
        ["She wanted to sell during a market drop and didn't; the market recovered.", "00:00:52"], ["The hard part isn't picking, it's staying put.", "00:01:10"],
      ]), figures: [], readingLevel: "beginner" } },
  { ...base("src_maya_gov"), courseId: "crs_inv101", lessonIds: ["lsn_index"], kind: "url", title: "Investor.gov guide to index funds", origin: "url", rawRef: "https://www.investor.gov", status: "ready", approvedForUse: true, visibility: "cited",
    digest: { summary: "A plain-English government explainer. Good for the definitions and the \"costs add up over time\" point.",
      keyConcepts: [{ name: "Index fund", explanation: "A fund that tries to match the performance of a market index." }],
      quotableFacts: facts("gov", [
        ["An index fund aims to track the performance of a specific market index.", "section: Definition"], ["Index funds are a type of mutual fund or ETF.", "section: Definition"],
        ["Passively managed funds typically have lower costs.", "section: Fees"], ["Fees and expenses reduce the value of an investment over time.", "section: Fees"],
        ["Small differences in fees can make a large difference over many years.", "section: Fees"], ["An index fund holds the securities in its index.", "section: How they work"],
        ["Index funds offer broad diversification.", "section: Benefits"], ["All investments carry risk, including index funds.", "section: Risks"],
        ["Investors should consider their goals and time horizon.", "section: Before you invest"],
      ]), figures: [], readingLevel: "beginner" } },

  { ...base("src_ortiz_notes"), courseId: "crs_bio101", lessonIds: ["lsn_photo"], kind: "text", title: "Week 6 lecture notes", origin: "user_upload", rawRef: "fixtures/docs/ortiz-week6-notes.docx", extractedText: ORTIZ_NOTES, status: "ready", approvedForUse: true, visibility: "private",
    digest: { summary: "Your outline for the hour: why photosynthesis matters, the chloroplast, the light-dependent reactions, the Calvin cycle, and a closing question on where the oxygen comes from.",
      keyConcepts: [{ name: "Two stages", explanation: "Light-dependent reactions and the Calvin cycle." }],
      quotableFacts: facts("notes", [
        ["Open with: where does a tree's mass come from?", "open"], ["Most students guess soil.", "open"], ["Every food chain starts with photosynthesis.", "1"],
        ["Path: leaf, mesophyll cell, chloroplast.", "2"], ["Light reactions take in light and water and release ATP, NADPH and oxygen.", "3"],
        ["The oxygen comes from water, not carbon dioxide.", "3"], ["Calvin cycle: fixation, reduction, regeneration.", "4"],
        ["Most of a tree's mass comes from carbon in the air.", "5"], ["C4 plants are adapted to hot, dry climates.", "5"],
        ["Students confuse the light reactions with the Calvin cycle.", "5"], ["End with an exit question.", "5"], ["The lecture runs 50 minutes.", "header"],
        ["Ask students to vote on where the light reactions happen.", "2"], ["Pigments capture light energy.", "2"],
      ]), figures: [], readingLevel: "intermediate" } },
  { ...base("src_ortiz_bio2e"), courseId: "crs_bio101", lessonIds: ["lsn_photo"], kind: "pdf", title: "Open textbook, Biology: Photosynthesis chapter", origin: "url", rawRef: "https://openstax.org/details/books/biology-2e", status: "ready", approvedForUse: true, visibility: "cited",
    digest: { summary: "The main reading. Clear figures of the chloroplast and both stages, each with a section reference to cite on the slide.",
      keyConcepts: [{ name: "Chloroplast", explanation: "The organelle where photosynthesis takes place." }, { name: "Calvin cycle", explanation: "Uses ATP and NADPH to fix carbon into sugar." }],
      quotableFacts: facts("b2e", [
        ["Photosynthesis converts light energy into chemical energy stored in sugars.", "§8.1"], ["In plants, photosynthesis takes place in chloroplasts.", "§8.1"],
        ["Chloroplasts are concentrated in mesophyll cells of leaves.", "§8.1"], ["Thylakoids are stacked into grana.", "§8.1"],
        ["The stroma is the fluid surrounding the thylakoids.", "§8.1"], ["Photosynthesis has two stages: the light-dependent reactions and the Calvin cycle.", "§8.1"],
        ["The light-dependent reactions occur in the thylakoid membranes.", "§8.2"], ["The light-dependent reactions produce ATP and NADPH.", "§8.2"],
        ["Water is split in the light-dependent reactions, releasing oxygen.", "§8.2"], ["Pigments such as chlorophyll absorb light energy.", "§8.2"],
        ["Photosystem II and photosystem I work in sequence.", "§8.2"], ["An electron transport chain moves electrons between the photosystems.", "§8.2"],
        ["A hydrogen ion gradient drives ATP synthase.", "§8.2"], ["The Calvin cycle takes place in the stroma.", "§8.3"],
        ["The Calvin cycle has three stages: fixation, reduction and regeneration.", "§8.3"], ["Rubisco catalyzes the fixation of carbon dioxide.", "§8.3"],
        ["The Calvin cycle uses ATP and NADPH from the light reactions.", "§8.3"], ["G3P is the product of the reduction stage.", "§8.3"],
        ["Some G3P leaves the cycle to build glucose.", "§8.3"], ["Regeneration rebuilds RuBP so the cycle can continue.", "§8.3"],
        ["Plants use sugars for energy and to build structures.", "§8.3"], ["Most of a plant's dry mass comes from carbon fixed from the air.", "§8.3"],
        ["Photosynthesis and cellular respiration are linked.", "§8.3"], ["Autotrophs make their own food.", "§8.1"],
        ["Heterotrophs depend on autotrophs for energy.", "§8.1"], ["The overall equation combines carbon dioxide and water into sugar and oxygen.", "§8.1"],
        ["Light energy excites electrons in chlorophyll.", "§8.2"], ["NADPH carries high-energy electrons to the Calvin cycle.", "§8.2"],
        ["ATP provides energy for the Calvin cycle.", "§8.3"], ["Stomata let carbon dioxide into the leaf.", "§8.1"], ["Oxygen leaves the leaf through stomata.", "§8.1"],
      ]), figures: [
        { description: "Leaf to chloroplast zoom", locator: "§8.1 figure" }, { description: "Chloroplast structure", locator: "§8.1 figure" },
        { description: "Overview of the two stages", locator: "§8.1 figure" }, { description: "Photosystems in the thylakoid membrane", locator: "§8.2 figure" },
        { description: "ATP synthase", locator: "§8.2 figure" }, { description: "Calvin cycle", locator: "§8.3 figure" },
      ], readingLevel: "intermediate" } },
  { ...base("src_ortiz_concepts"), courseId: "crs_bio101", lessonIds: ["lsn_photo"], kind: "pdf", title: "Open textbook, Concepts of Biology: Photosynthesis", origin: "url", rawRef: "https://openstax.org/details/books/concepts-biology", status: "ready", approvedForUse: true, visibility: "cited",
    digest: { summary: "A shorter, plainer version. Useful for the opening and for check-for-understanding questions.",
      keyConcepts: [{ name: "Light energy", explanation: "The energy source for photosynthesis." }],
      quotableFacts: facts("cob", Array.from({ length: 18 }, (_, i) => [[
        "Photosynthesis is the main source of energy for nearly all life.", "Plants, algae and some bacteria photosynthesize.", "Sunlight provides the energy.",
        "Chlorophyll gives plants their green color.", "The light reactions need light; the Calvin cycle does not directly.", "Oxygen released by plants comes from water.",
        "Glucose stores chemical energy.", "Carbon dioxide enters through stomata.", "The two stages are linked by ATP and NADPH.",
        "Food chains begin with producers.", "Leaves are adapted to capture light.", "Thylakoid membranes hold the pigments.",
        "The stroma holds the enzymes of the Calvin cycle.", "Photosynthesis removes carbon dioxide from the air.", "Respiration releases the energy stored by photosynthesis.",
        "Different pigments absorb different wavelengths.", "Plants store extra sugar as starch.", "Most life on Earth depends on photosynthesis.",
      ][i]!, i < 6 ? "§5.1" : i < 12 ? "§5.2" : "§5.3"] as [string, string])),
      figures: [{ description: "Simple two-stage diagram", locator: "§5.1 figure" }, { description: "Leaf cross-section", locator: "§5.2 figure" }, { description: "Energy flow", locator: "§5.3 figure" }],
      readingLevel: "beginner" } },
  { ...base("src_ortiz_c4"), courseId: "crs_bio101", lessonIds: ["lsn_photo"], kind: "suggested", title: "Open textbook: plants in hot, dry climates", origin: "agent_suggested", rawRef: "https://openstax.org/details/books/biology-2e", status: "awaiting_user_approval", approvedForUse: false, visibility: "cited",
    digest: { summary: "Covers C4 and CAM plants, the gap in your readings.", keyConcepts: [{ name: "C4 and CAM", explanation: "Adaptations that reduce water loss in hot climates." }],
      quotableFacts: facts("c4", [
        ["C4 plants separate carbon fixation from the Calvin cycle in space.", "§8.3"], ["CAM plants separate the steps in time, opening stomata at night.", "§8.3"],
        ["These adaptations reduce water loss.", "§8.3"], ["Corn and sugarcane are C4 plants.", "§8.3"], ["Cacti and pineapples use CAM.", "§8.3"],
        ["Hot, dry conditions favor these adaptations.", "§8.3"], ["Rubisco can bind oxygen instead of carbon dioxide.", "§8.3"],
      ]), figures: [], readingLevel: "intermediate" } },
];
