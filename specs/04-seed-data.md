# Spec 04 — Seed Data

> The content the demo opens with. Lives in `fixtures/seed/` as JSON files that validate against Spec 02. All teacher-written text below is original to this project. Readings are openly licensed (OpenStax, CC BY 4.0) and referenced by URL and section; the seed stores our own digests of them, never copied passages. Locators use section numbers (e.g. "§8.2"), not page numbers.

## 1. Users and courses
| User | Persona | Course | Audience | Template |
|---|---|---|---|---|
| Maya (`usr_maya`) | course_creator | Investing 101 (`crs_inv101`) | Beginner investors, 25–40, paid course, beginner level | Maya's brand |
| Maya | course_creator | Free YouTube series (`crs_yt`) | Curious beginners, social feed | Maya's brand |
| Dr. Elena Ortiz (`usr_ortiz`) | lecturer | BIO 101 · Introduction to Biology (`crs_bio101`) | First-year undergrads, live lecture, beginner level | University classic |
| Dr. Elena Ortiz | lecturer | BIO 220 Ecology (`crs_bio220`), no lessons | Second-year undergrads | University classic |

## 2. Starters (6)
| Name | Persona | Format | Buildable | Default length |
|---|---|---|---|---|
| Detailed explainer | course_creator | explainer_video | yes | 150s |
| Live lecture | lecturer | lecture_deck | yes | 3000s |
| 45-second explainer for social | social_creator | explainer_video | card only | 45s |
| Study recap | tutor | explainer_video | card only | 60s |
| Training visual aid | trainer | lecture_deck | card only | 1200s |
| Podcast explainer | course_creator | podcast_audio | card only | 600s |

Card copy is the copy on the mock's Home screen.

## 3. Templates (5)
| Name | Origin | Colors (primary / secondary / accent / background / text) | Fonts (heading / body) | Voice and tone |
|---|---|---|---|---|
| Maya's brand | from_brand (Maya) | #2A9D8F / #264653 / #E76F51 / #FFF8F1 / #264653 | Nunito / Plus Jakarta Sans | Warm, plain English, define every term |
| University classic | curated | #1F2A44 / #8D9AB8 / #E2B84B / #FFFFFF / #1F2A44 | Source Serif 4 / Plus Jakarta Sans | Clear, academic, cites as it goes |
| Bright explainer | curated | #3442C9 / #1B1F27 / #FFD166 / #FFFFFF / #1B1F27 | Plus Jakarta Sans / Plus Jakarta Sans | Upbeat, short sentences |
| Calm minimal | curated | #2B2F36 / #7A9E7E / #7A9E7E / #F4F4F0 / #2B2F36 | Plus Jakarta Sans / Plus Jakarta Sans | Quiet, one idea per screen |
| Field briefing | curated | #2F3A2F / #D8C27A / #D8C27A / #2F3A2F / #FFFFFF | Plus Jakarta Sans / Plus Jakarta Sans | Direct, numbered steps |

## 4. Guidelines
- Investing 101: "Never give individual investment advice" (must), "Define every term on first use" (must), "End with a disclaimer card" (must).
- BIO 101: "Cite a source on every factual slide" (must), "Alt text for every image" (must).

## 5. Preferences
- **Maya, general:** tone warm and encouraging (learned, "from your answers in 4 lessons"); keep bullets under 8 words (learned, "you shortened bullets in 3 lessons"); prefer real photos over illustrations (learned, "you swapped illustrations for photos in 2 lessons"); define every term the first time it appears (teacher); citations short, in the footer (teacher).
- **Maya, Investing 101:** end every video with an invite to the full course (teacher); tone playful (teacher, overrides general tone).
- **Maya, Free YouTube series:** keep videos under 90 seconds (teacher); no sources card at the end (learned, "from 3 lessons in this course").
- **Dr. Ortiz, general:** short speaker notes (learned).
- **Dr. Ortiz, BIO 101:** speaker notes in full sentences (teacher, overrides general).

## 6. Sources

### Maya · "How index funds work"
| Source | Kind | Visibility | Fixture content |
|---|---|---|---|
| Index funds outline | text | private | Five parts: what an index is; why low fees matter over time; diversification; how to buy your first index fund; mistakes beginners make. ~300 words written for the seed. |
| Recording, Oct 24 (5 min) | voice_memo | private | Fixture transcript (~600 words) in Maya's voice, including "Stop hunting for the needle. Just buy the haystack." and the story of her first index fund purchase. |
| Investor.gov guide to index funds | url | cited | URL to the Investor.gov index-fund explainer; seed stores our own digest (definitions, costs add up over time), 9 facts with locators like "section: Fees". |

Gap: expense ratios not covered (drives the gap card and the general-knowledge flag on slide 4).

### Dr. Ortiz · "Week 6 · Photosynthesis"
| Source | Kind | Visibility | Fixture content |
|---|---|---|---|
| Week 6 lecture notes | text | private | Her outline for the hour (~500 words, written for the seed), ending with "where does the oxygen come from?" Mentions C4 plants. |
| OpenStax Biology 2e, Ch. 8 Photosynthesis | pdf (URL ref) | cited | Our digest: 31 facts, 6 figures, locators §8.1–§8.3. |
| OpenStax Concepts of Biology, Ch. 5 Photosynthesis | pdf (URL ref) | cited | Our digest: 18 facts, 3 figures, locators §5.1–§5.3. |
| Suggested: plants in hot, dry climates | suggested | cited, `approvedForUse: false` | Our digest: 7 facts on C4 and CAM plants. Appears as the "Use this source?" card. |

### Prior lessons (BIO 101, ready)
- Week 4 · Cell membranes (24 slides): concepts — phospholipid bilayer, membrane proteins, diffusion and osmosis.
- Week 5 · Cellular respiration (26 slides): concepts — glycolysis, Krebs cycle, electron transport chain, ATP as the energy currency.
These produce CourseKnowledge and the ATP recap suggestion.

## 7. Plans

### Maya · Draft 1 (7 slides, ~2:35) and Draft 2
Use the mock's Plan screen content verbatim for Draft 1: story ("Flip the instinct"), three angles ("Flip the instinct", "Start with your story", "Start with a question"), three learning goals, and slides 1–7 (Hook; What an index fund is; Why low fees matter; What an expense ratio is [general knowledge, flagged]; A real example; The common mistake; Recap and next step). Questions: who's watching, how long, tone, with defaults. Assumption: "ends with an invite to your Investing 101 course".
Draft 2 (revision note: "Make it punchier and add an example about fees") changes slides 3 and 6 to the mock's Draft 2 text; all other slides identical; `changeReason: "plan_revision"`.

### Dr. Ortiz · Draft 1 (27 slides, 50 minutes)
Story angles: "Start with a puzzle" (current), "Follow one carbon atom", "Start from a misconception". Four learning goals as in the mock. Questions: lecture length, where students get stuck.
| Section | Slides |
|---|---|
| — | 1 Title: Photosynthesis |
| 1 Why photosynthesis matters (4) | Where does a tree get its mass? (question) · Light energy becomes chemical energy · Every food chain starts here · Two stages at a glance |
| 2 Inside the chloroplast (5) | Where photosynthesis happens (clip) · Parts of the chloroplast · Chloroplasts began as bacteria (general knowledge, flagged) · Pigments catch light · Quick check (question) |
| 3 The light-dependent reactions (7) | Light in, ATP and NADPH out · Photosystems II and I · Splitting water · Where the oxygen comes from (clip) · The electron transport chain · Making ATP · Quick check (question) |
| 4 The Calvin cycle (6) | Following the carbon · Fixation · Reduction · Regeneration · What the plant does with sugar · Quick check (question) |
| 5 Putting it together (4) | Back to the tree (question) · The two stages side by side · Common misconceptions · Exit question (question) |

Recap suggestion (pending, 2 slides, from Week 5): "Remember ATP?" and "Today: the other direction".

## 8. Artifacts and demo cache
- Maya: draft preview artifacts for all 7 slides (narration, visuals; slide 1 has two visual versions), captions, thumbnail; final video manifest for the "Compound interest in 2 minutes" and "What is an ETF?" ready lessons (thumbnails only).
- Dr. Ortiz: deck preview for all 27 slides (8 with images, 2 clips); final PDF for Weeks 4 and 5 (placeholder files).
- Until M8 builds the real cache, artifacts point to placeholder images rendered from the template (title + visual description), so the demo is complete on day one.

## 9. Ledger and Lab sample data
Seed CostEvents and EvalRuns that reproduce the mock Lab's sample numbers, flagged `sample: true` in a seed note so the Lab labels them "Sample data" until real runs replace them.
