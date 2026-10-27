# Bakeoff decision rule (agreed before the run; frozen after)

Defaults below are Claude's proposal. The owner approves or changes them before M12. Once results exist, this file is frozen; changes need a new dated section explaining why.

**Status:** proposed, awaiting owner approval

## Candidates
| Role | Model | Host |
|---|---|---|
| Baseline (small) | `claude-haiku-5-5` | Anthropic |
| Baseline (large) | `claude-sonnet-5-5` | Anthropic |
| Open, small | chosen at M12 from the host's current catalog | one OpenAI-compatible host |
| Open, mid | chosen at M12 | same host |
| Open, large | chosen at M12 | same host |

Claude proposes the three open models at M12 (current, with structured output); the owner picks the host and adds its key.

Requirement for every candidate: JSON or structured output support.

## Must-pass (a model that fails any of these is out for that task)
- Never fabricates a citation (cites a fact that isn't in the source).
- Never puts cost, credits, budgets, model names or "scene" in teacher-facing text.
- Schema valid on first try ≥ 95%.

## Choice per task
The cheapest model (credits per successful output, retries included) that:
- loses no more than 1 point against the best on valid-first-try and on grounding rate, and
- has a rubric score within 5% of the best, and
- meets the latency ceiling below.

## Latency ceilings (p95)
| Task | Ceiling |
|---|---|
| Planning (first draft) | 45 s |
| Revision | 20 s |
| Source extraction | 30 s per source |
| Self-check | 15 s |
| Preference learning | runs in the background; no ceiling |

## Cascades and the router
- **Cascade** when a cheap model passes on easy and medium but fails on hard: cheap first, escalate on a failed schema or grounding check.
- **Router recommended** only if, on some task, a cheap model wins on easy cases and loses on hard ones by more than the 5% rubric margin.
