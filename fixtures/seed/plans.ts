import type { Claim, Slide, TeachingPlan } from "@ls/schema";
import { T0 } from "./people";
import { sources } from "./sources";

const factText = (sourceId: string, factId: string) =>
  sources.find((x) => x.id === sourceId)?.digest?.quotableFacts.find((f) => f.factId === factId)?.text;

const base = (id: string) => ({ id, createdAt: T0, updatedAt: T0 });
const cite = (sourceId: string, factId: string, locator: string): Claim["citations"][number] => ({ sourceId, factId, locator });
const claim = (text: string, citations: Claim["citations"], status: Claim["status"] = "grounded"): Claim => ({ text, citations, status });

// ---------- Maya · How index funds work ----------
const mayaSlide = (n: number, role: Slide["role"], title: string, narrative: string, visual: string, visualType: Slide["visualType"], secs: number, claims: Claim[], estCredits: number): Slide => ({
  slideId: `sld_idx_${n}`, order: n, role, title, narrative, estDurationSec: secs, bullets: [], visual, visualType, claims, estCredits,
  visualPrompt: visual, whyThisVisual: visualType === "generated_clip" ? "Motion makes the idea land" : "A still or diagram teaches this equally well",
});

const MAYA_SLIDES: Slide[] = [
  mayaSlide(1, "hook", "Hook", "Most people think investing means finding the next big stock. What if the smarter move is to stop hunting for the needle and buy the whole haystack?",
    "A haystack with one glinting needle. The view pulls back to reveal the whole field.", "generated_clip", 15, [claim("Stop hunting for the needle; buy the haystack.", [cite("src_maya_memo", "memo_f1", "00:00:08")])], 105),
  mayaSlide(2, "context", "What an index fund is", "An index is just a list, like the biggest companies in a market. An index fund buys everything on the list, so you own a small slice of all of them.",
    "A diagram: company tiles flowing into one basket.", "diagram", 25, [claim("An index fund aims to track a market index.", [cite("src_maya_gov", "gov_f1", "section: Definition"), cite("src_maya_outline", "out_f1", "part 1")])], 0),
  mayaSlide(3, "concept", "Why low fees matter", "Nobody is paid to pick stocks, so index funds usually cost less to run. Small yearly costs add up over decades.",
    "Two growth lines that start together and slowly drift apart.", "diagram", 30, [claim("Passively managed funds typically have lower costs.", [cite("src_maya_gov", "gov_f3", "section: Fees")])], 0),
  mayaSlide(4, "concept", "What an expense ratio is", "That yearly cost has a name: the expense ratio. It is a percentage of what you have invested, taken out each year.",
    "A receipt with one highlighted line: expense ratio.", "still_image", 20, [claim("The expense ratio is a yearly percentage of assets.", [], "general_knowledge_flagged")], 8),
  mayaSlide(5, "example", "A real example", "When I bought my first index fund, one purchase made me a part-owner of hundreds of companies.",
    "A phone screen where one purchase splits into many small tiles.", "still_image", 25, [claim("One purchase, hundreds of companies.", [cite("src_maya_memo", "memo_f2", "00:00:31")])], 8),
  mayaSlide(6, "misconception", "The common mistake", "The most common mistake? Selling when the market drops. Index investing works because you stay in for the long run.",
    "A bumpy line that still climbs, with a “hold on” marker at the dip.", "generated_clip", 20, [claim("Selling during drops is a common mistake.", [cite("src_maya_outline", "out_f8", "part 5")])], 105),
  mayaSlide(7, "cta", "Recap and next step", "Buy the haystack, keep costs low, stay in. My Investing 101 course walks you through your first purchase.",
    "Your logo, a three-point recap, then the disclaimer card: education, not individual investment advice.", "title_card", 20, [], 0),
];

const MAYA_ANGLES = [
  { angleId: "ang_flip", label: "Flip the instinct", story: "Start with the instinct to pick winners, then flip it: you can own the whole haystack instead. Show why low costs and staying put do the heavy lifting, and end with a clear next step into your course." },
  { angleId: "ang_story", label: "Start with your story", story: "Open with your first investment: one purchase, hundreds of companies. Then explain why that works, why fees matter, and why staying put is the hard part." },
  { angleId: "ang_question", label: "Start with a question", story: "Open with a question: what if one small purchase made you part-owner of the biggest companies? Answer it step by step, then name the one mistake that undoes it." },
];

const planCommon = {
  format: "explainer_video" as const,
  chosenAngleId: "ang_flip",
  learningObjectives: ["Explain what an index fund is in one sentence", "Say why fees matter more than they look", "Name the most common beginner mistake"],
  assumptions: ["This ends with an invite to your Investing 101 course"],
  guidelineChecks: [
    { guidelineId: "gdl_noadvice", passed: true, note: "No individual investment advice" },
    { guidelineId: "gdl_define", passed: true, note: "Every term defined on first use" },
    { guidelineId: "gdl_disclaimer", passed: true, note: "Ends with a disclaimer card" },
  ],
  costEstimate: { totalCredits: 412, byType: { generated_clip: 210, still_image: 16, diagram: 0, title_card: 0 }, llmCredits: 38, ttsCredits: 148, withinEnvelope: true, downgradesApplied: ["slide 5: clip → illustration"] },
};

const DRAFT2_CHANGES: Record<number, string> = {
  3: "Picture two friends who invest the same amount. One pays a little more in yearly fees. Thirty years later, that small difference is a big gap.",
  6: "The biggest mistake? Panicking when the market drops. The people who do well are usually the ones who did nothing.",
};

export const mayaDraft1: TeachingPlan = {
  ...base("pln_idx_v1"), lessonId: "lsn_index", version: 1, ...planCommon, story: MAYA_ANGLES[0]!.story, angles: MAYA_ANGLES, slides: MAYA_SLIDES, status: "superseded",
};

export const mayaDraft2: TeachingPlan = {
  ...base("pln_idx_v2"), lessonId: "lsn_index", version: 2, parentPlanId: "pln_idx_v1",
  revisionRequest: { text: "Make it punchier and add an example about fees", via: "typed" },
  ...planCommon, story: MAYA_ANGLES[0]!.story, angles: MAYA_ANGLES, status: "awaiting_approval",
  slides: MAYA_SLIDES.map((s) => (DRAFT2_CHANGES[s.order] ? { ...s, narrative: DRAFT2_CHANGES[s.order], changedInVersion: 2, changeReason: "plan_revision" as const } : s)),
};

// ---------- Dr. Ortiz · Week 6 Photosynthesis ----------
type Row = [section: string, title: string, role: Slide["role"], visual: string, visualType: Slide["visualType"], cite: [string, string, string] | null, flag?: boolean];
const B = "src_ortiz_bio2e", C = "src_ortiz_concepts", N = "src_ortiz_notes";

const ROWS: Row[] = [
  ["", "Photosynthesis", "title", "Title slide in University classic", "title_card", null],
  ["Why photosynthesis matters", "Where does a tree get its mass?", "question", "A full-bleed photo of a large oak, one question on screen", "still_image", [N, "notes_f1", "open"]],
  ["Why photosynthesis matters", "Light energy becomes chemical energy", "concept", "The overall equation, inputs and outputs in two colors", "diagram", [B, "b2e_f1", "§8.1"]],
  ["Why photosynthesis matters", "Every food chain starts here", "concept", "A simple food chain starting with a leaf", "diagram", [C, "cob_f10", "§5.2"]],
  ["Why photosynthesis matters", "Two stages at a glance", "concept", "Two linked boxes: light reactions and the Calvin cycle", "diagram", [B, "b2e_f6", "§8.1"]],
  ["Inside the chloroplast", "Where photosynthesis happens", "concept", "A zoom from a leaf into a single chloroplast", "generated_clip", [B, "b2e_f3", "§8.1"]],
  ["Inside the chloroplast", "Parts of the chloroplast", "concept", "A labelled cross-section of a chloroplast", "still_image", [B, "b2e_f4", "§8.1"]],
  ["Inside the chloroplast", "Chloroplasts began as bacteria", "concept", "One cell taking in another, in two steps", "diagram", null, true],
  ["Inside the chloroplast", "Pigments catch light", "concept", "Chlorophyll absorbing some colors and reflecting green", "still_image", [B, "b2e_f10", "§8.2"]],
  ["Inside the chloroplast", "Quick check", "question", "The cross-section with four lettered labels to vote on", "diagram", [B, "b2e_f7", "§8.2"]],
  ["The light-dependent reactions", "Light in, ATP and NADPH out", "concept", "A thylakoid membrane with light arriving and two products leaving", "diagram", [B, "b2e_f8", "§8.2"]],
  ["The light-dependent reactions", "Photosystems II and I", "concept", "Two photosystems side by side in the membrane", "still_image", [B, "b2e_f11", "§8.2"]],
  ["The light-dependent reactions", "Splitting water", "concept", "A water molecule pulled apart", "diagram", [B, "b2e_f9", "§8.2"]],
  ["The light-dependent reactions", "Where the oxygen comes from", "misconception", "A water molecule splitting, oxygen drifting away", "generated_clip", [C, "cob_f6", "§5.1"]],
  ["The light-dependent reactions", "The electron transport chain", "concept", "Electrons hopping along membrane proteins", "diagram", [B, "b2e_f12", "§8.2"]],
  ["The light-dependent reactions", "Making ATP", "concept", "ATP synthase turning like a turbine", "still_image", [B, "b2e_f13", "§8.2"]],
  ["The light-dependent reactions", "Quick check", "question", "Three products, one is wrong: which?", "diagram", [B, "b2e_f8", "§8.2"]],
  ["The Calvin cycle", "Following the carbon", "concept", "A three-step cycle diagram, one step highlighted at a time", "diagram", [B, "b2e_f15", "§8.3"]],
  ["The Calvin cycle", "Fixation", "concept", "Carbon dioxide joining RuBP, helped by rubisco", "diagram", [B, "b2e_f16", "§8.3"]],
  ["The Calvin cycle", "Reduction", "concept", "ATP and NADPH turning molecules into G3P", "diagram", [B, "b2e_f18", "§8.3"]],
  ["The Calvin cycle", "Regeneration", "concept", "The cycle closing back to RuBP", "diagram", [B, "b2e_f20", "§8.3"]],
  ["The Calvin cycle", "What the plant does with sugar", "concept", "Sugar becoming starch, cellulose and energy", "still_image", [B, "b2e_f21", "§8.3"]],
  ["The Calvin cycle", "Quick check", "question", "Put the three steps in order", "diagram", [B, "b2e_f15", "§8.3"]],
  ["Putting it together", "Back to the tree", "question", "The oak again, with the answer revealed", "still_image", [B, "b2e_f22", "§8.3"]],
  ["Putting it together", "The two stages side by side", "concept", "Light reactions and Calvin cycle in two columns", "diagram", [B, "b2e_f17", "§8.3"]],
  ["Putting it together", "Common misconceptions", "misconception", "Three myths, each crossed out with the fix", "diagram", [N, "notes_f10", "5"]],
  ["Putting it together", "Exit question", "question", "One question to answer on the way out", "title_card", [N, "notes_f11", "5"]],
];

const ortizSlides: Slide[] = ROWS.map(([section, title, role, visual, visualType, c, flag], i) => ({
  slideId: `sld_photo_${i + 1}`, order: i + 1, section: section || undefined, role, title,
  bullets: role === "title" ? ["Week 6 · BIO 101"] : [c ? factText(c[0], c[1]) ?? title : "Most biologists think chloroplasts began as free-living bacteria"],
  speakerNotes: role === "question" ? "Give the room a minute to think, then take two or three answers before moving on."
    : role === "title" ? "Welcome everyone and put the opening question on the board."
    : `Explain this in plain words, then point to the figure. Check that the room is with you before the next slide.`,
  layout: role === "title" ? "title" : role === "question" ? "question" : visualType === "generated_clip" ? "clip" : "image_left",
  visual, visualType, visualPrompt: visual,
  claims: flag ? [{ text: "Chloroplasts likely descend from free-living photosynthetic bacteria.", citations: [], status: "general_knowledge_flagged" as const }]
    : c ? [{ text: title, citations: [{ sourceId: c[0], factId: c[1], locator: c[2] }], status: "grounded" as const }] : [],
  estCredits: visualType === "generated_clip" ? 105 : visualType === "still_image" ? 8 : 0,
}));

const ORTIZ_ANGLES = [
  { angleId: "ang_puzzle", label: "Start with a puzzle", story: "Open with a question students can’t yet answer: where does a tree’s mass come from? Walk into the chloroplast, take the two stages one at a time, and close by answering the opening question, then where the oxygen comes from." },
  { angleId: "ang_carbon", label: "Follow one carbon atom", story: "Follow a single carbon atom from the air into a leaf, through the Calvin cycle and into sugar. Introduce each structure and stage only when the atom reaches it." },
  { angleId: "ang_myth", label: "Start from a misconception", story: "Open with the common belief that plants get their food from soil. Test it with a classic experiment, then use the chloroplast and the two stages to explain what really happens." },
];

const recapSlides: Slide[] = [
  { slideId: "sld_recap_1", order: 0, section: "Recap", role: "recap", title: "Remember ATP?", bullets: ["ATP stores energy cells can spend", "Last week it came from breaking down sugar"], speakerNotes: "Ask: where did ATP come from last week?",
    visual: "Your Week 5 ATP diagram, reused", visualType: "source_excerpt", claims: [], fromRecap: { lessonId: "lsn_resp" }, estCredits: 0 },
  { slideId: "sld_recap_2", order: 0, section: "Recap", role: "recap", title: "Today: the other direction", bullets: ["Plants make the sugar in the first place", "And make ATP along the way"], speakerNotes: "This bridges straight into section 1.",
    visual: "Two arrows: respiration one way, photosynthesis the other", visualType: "diagram", claims: [], fromRecap: { lessonId: "lsn_resp" }, estCredits: 0 },
];

export const ortizDraft1: TeachingPlan = {
  ...base("pln_photo_v1"), lessonId: "lsn_photo", version: 1, format: "lecture_deck",
  story: ORTIZ_ANGLES[0]!.story, chosenAngleId: "ang_puzzle", angles: ORTIZ_ANGLES,
  learningObjectives: ["Label the parts of a chloroplast and say what happens where", "Explain what the light-dependent reactions produce and why", "Trace carbon through the Calvin cycle in three steps", "Say where the oxygen released by plants comes from"],
  assumptions: ["You want a short question at the end of each section, like in your Week 5 deck"],
  recap: { fromLessonId: "lsn_resp", summary: "Open with a 3-minute recap of ATP from Week 5. It sets up the light-dependent reactions.", slides: recapSlides, decision: "pending" },
  slides: ortizSlides,
  costEstimate: { totalCredits: 540, byType: { generated_clip: 210, still_image: 64, diagram: 0, title_card: 0 }, llmCredits: 62, ttsCredits: 0, withinEnvelope: true, downgradesApplied: [] },
  guidelineChecks: [
    { guidelineId: "gdl_cite", passed: true, note: "A source on every factual slide" },
    { guidelineId: "gdl_alt", passed: true, note: "Alt text for every image" },
  ],
  status: "awaiting_approval",
};

export const plans: TeachingPlan[] = [mayaDraft1, mayaDraft2, ortizDraft1];
