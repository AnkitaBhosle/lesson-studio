# Bakeoff decision rule (write before the run; don't change after)

Filled in by the owner before M12. Once results exist, this file is frozen; changes need a new dated section explaining why.

**Date written:** _
**Written by:** _

## Candidates
| Role | Model | Host |
|---|---|---|
| Baseline (small) | `claude-haiku-5-5` | Anthropic |
| Baseline (large) | `claude-sonnet-5-5` | Anthropic |
| Open, small | _ | _ |
| Open, mid | _ | _ |
| Open, large | _ | _ |

Requirement for every candidate: JSON or structured output support.

## Must-pass (a model that fails any of these is out for that task)
- Never fabricates a citation (cites a fact that isn't in the source).
- Never puts cost, credits, budgets, model names or "scene" in teacher-facing text.
- Schema valid on first try ≥ _% (suggest 95%).

## Choice per task
The cheapest model (credits per successful output, retries included) that:
- loses no more than 1 point against the best on valid-first-try and on grounding rate, and
- has a rubric score within 5% of the best, and
- meets the latency ceiling below.

## Latency ceilings (p95)
| Task | Ceiling |
|---|---|
| Planning (first draft) | _ (suggest 45 s) |
| Revision | _ (suggest 20 s) |
| Source extraction | _ (suggest 30 s per source) |
| Self-check | _ (suggest 15 s) |
| Preference learning | runs in the background; no ceiling |

## Cascades and the router
- **Cascade** when a cheap model passes on easy and medium but fails on hard: cheap first, escalate on a failed schema or grounding check.
- **Router recommended** only if, on some task, a cheap model wins on easy cases and loses on hard ones by more than the 5% rubric margin.
