# Golden set

The test cases every model is judged on: in the bakeoff (M12), and before any prompt, model or routing change ships.

## The owner's part (about 45 minutes in total)
1. **Skim `CASES.md` (15 min).** One line per case. Strike what doesn't sound real, add any real situation you know. Claude writes every case from it.
2. **Approve `DECISION-RULE.md` (5 min).** Defaults are filled in; change a number or say yes.
3. **After the run, rate 15 outputs (20 min).** Good / OK / Bad, model names hidden, in the Lab. That calibrates the automatic judge: if it agrees with you less than 80% of the time, Claude fixes the rubric and reruns before any decision.

Everything else is Claude's, split so the builder can't grade its own work (below).

## Who writes what (keeping the builder honest)
- **`sealed/`: the golden set, all 57 cases.** Written by a separate agent that never sees the prompts or code. The builder never opens these files; the runner reports only aggregate scores and failure categories (e.g. "3 ungrounded claims on hard planning cases"), never case contents. Bakeoff and release decisions use only this set.
- **`dev/`: a handful of cases the builder may read** while writing prompts, plus the two hero lessons. Small on purpose: it's for debugging, not for scoring.
- **Judges come from a different model family than the output they score,** and mechanical checks (valid output, citations that exist, required points, forbidden content) count before any judge score.
- **Your 15 blind ratings** are drawn mostly from sealed hard cases and decide whether the judge can be trusted.

## Sources: public first
- Readings, lecture notes, transcripts and handouts come from public, openly licensed or public-domain material wherever possible: OpenStax (CC BY), US government pages (public domain, e.g. CDC, NIH, Investor.gov), MIT OpenCourseWare and similar (real lecture notes; stored by URL when the license isn't CC BY).
- Synthetic only where the material is private by nature or constructed by design: voice-memo transcripts, revision notes, preference edit histories, and planted errors (applied to real material).
- `sealed/SOURCES.md` lists every source with its license. Files Claude can't download (mostly PDFs) are marked "owner to fetch": download them and attach them in the chat.

**Validation:** `npm run golden:check` validates every case and prints a coverage table (cases per task and difficulty). It also runs as part of `npm test`.

## How a case is written (reference for Claude, or if you want to add one yourself)
1. Copy the template for the task from `_templates/` into that task's folder under `sealed/` or `dev/`, e.g. `sealed/planning/`.
2. Name the file after its id: `planning/pl-007-nursing-handwashing.md` with `id: pl-007-nursing-handwashing`.
3. Fill in the front matter (between the `---` lines) and the sections below it.
4. Put PDFs or other files in that split's `files/` folder and reference them as `files/<name>.pdf`.
5. Run `npm run golden:check`.

You can edit these in the GitHub web editor; the check runs again on the next build.

## Targets
| Task | Folder | Target | What it tests |
|---|---|---|---|
| Source extraction | `source_extraction/` | 15 | Facts with locators, summary, gaps, reading level |
| Planning (first draft) | `planning/` | 20 | Story, slides, grounding, audience fit, guidelines, angles, recap |
| Revision | `revision/` | 8 | Does what the note asks, leaves the rest alone |
| Self-check | `self_check/` | 8 | Finds a planted problem in a plan |
| Preference learning | `preference_learning/` | 6 | Learns the right preference from edits, and nothing it shouldn't |

Aim for about a third each easy, medium and hard.

## Difficulty guide
- **Easy:** one clean source, a common topic, a clear request.
- **Medium:** two or three sources, a specific audience, a guideline or two, a length constraint.
- **Hard:** at least one of: a dense or long source; messy or rambling notes; sources that disagree; a real gap the plan must flag rather than fill; a vague note ("make it better"); a note that conflicts with a guideline; a topic where a confident wrong answer is tempting. Say which in `why_hard`.

## Spread
- Go beyond the two heroes: add 3–4 other teachers (e.g. a nursing instructor, a high-school history teacher, a corporate trainer, a yoga teacher) so we don't tune to Maya and Dr. Ortiz.
- Mix both Starters: `detailed_explainer` (video) and `live_lecture` (deck).

## Content rule
Write sources yourself, or use openly licensed material (e.g. OpenStax, CC BY) referenced by URL with a short summary in your own words. Never paste paywalled or copyrighted text.

## Writing "what good looks like"
Keep it short and checkable. "Must cover: why fees compound" is checkable; "should be engaging" isn't. Put taste in the rubric (`RUBRIC.md`), not in cases.
