# Golden set

The test cases every model is judged on: in the bakeoff (M12), and before any prompt, model or routing change ships. One file per case. A good case is a realistic teacher situation plus a short note on what a good answer must and must not do.

**Check your work:** `npm run golden:check` validates every case and prints a coverage table (cases per task and difficulty). It also runs as part of `npm test`.

## How to add a case
1. Copy the template for the task from `_templates/` into that task's folder, e.g. `planning/`.
2. Name the file after its id: `planning/pl-007-nursing-handwashing.md` with `id: pl-007-nursing-handwashing`.
3. Fill in the front matter (between the `---` lines) and the sections below it.
4. Put PDFs or other files in `files/` and reference them as `files/<name>.pdf`.
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
