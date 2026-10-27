# Spec 02 — Domain Model

> Implement exactly as `packages/schema/src/index.ts` using **zod**; export both schemas and inferred TS types. Every agent input/output in Spec 03 references these types. Persistence: behind a tiny repository layer, so storage can change without touching UI or agents. Locally, JSON in `data/`; on Vercel, one Redis key per workspace (Spec 05 §1). A **workspace** is everything one access code sees in one mode: the whole `Store` below, live or guided.

## 1. User-facing vs internal
- **User-facing:** User, Course (with course settings), Lesson, Starter, Template, Audience, Source, Guideline, TeachingPlan (shown as a lesson outline, with drafts), Slide, Artifact (with visual versions), Integration, ScheduledTask.
- **Learned and editable:** Preferences, at two levels: general (Settings) and course (that course's settings). Teacher edits override what was learned; a course preference overrides a general one for that course.
- **Derived:** CourseKnowledge (what earlier lessons in a course covered), recomputed when a lesson becomes `ready`.
- **Internal only (never rendered in the educator UI):** SpendEnvelope, costEstimate on plans, CostEvent, AgentRun (including routing decisions), Approval (audit log), model choices, EvalCase, EvalRun, BakeoffResult. The Lab app reads these.
- **Site-level, outside any workspace (owner only, managed in Lab):** AccessCode, SiteLimits, SpendCounters.

## 2. Conventions
- IDs: string with prefix, e.g. `crs_…`, `lsn_…`, `src_…`, `art_…`, `str_…`, `tpl_…`, `pln_…`, `sld_…` (use `nanoid`).
- Timestamps: ISO strings. Internal cost unit: **credits** as integers, 1 credit = $0.01, covering both media and LLM costs in one ledger.
- All entities have `id`, `createdAt`, `updatedAt`.
- **Terminology:** the unit of every lesson is a **Slide**, for decks and explainer videos alike. There is no separate "scene" type.

## 3. Schemas

```ts
import { z } from "zod";

const Base = z.object({ id: z.string(), createdAt: z.string(), updatedAt: z.string() });

export const Persona = z.enum(["course_creator", "lecturer", "tutor", "trainer", "social_creator"]);
export const OutputFormat = z.enum(["explainer_video", "lecture_deck", "podcast_audio"]); // podcast_audio: Starter card only in MVP

// ---------- People & settings ----------
export const User = Base.extend({
  name: z.string(),
  email: z.string().email(),
  persona: Persona,
});

// Learned from the teacher's edits and answers AND editable. Two scopes:
// general (Settings) and course (that course's settings). Course overrides general for that course.
// Anything the teacher set or edited is locked against relearning. Never includes cost, budget, or model choices.
const PrefOrigin = z.enum(["learned", "teacher"]);
export const PreferenceItem = z.object({
  itemId: z.string(),
  kind: z.enum(["tone", "citation_style", "note"]),
  value: z.string(),                 // "warm", "inline_short", or free text like "Keep bullets under 8 words"
  origin: PrefOrigin,
  evidence: z.string().optional(),   // learned items: "you shortened bullets in 3 lessons"
  overridesItemId: z.string().optional(), // course item that overrides a general item
});
export const Preferences = Base.extend({
  userId: z.string(),
  scope: z.enum(["general", "course"]),
  courseId: z.string().optional(),   // required when scope = course
  items: z.array(PreferenceItem).default([]),
  removedItemValues: z.array(z.string()).default([]), // removed items are never relearned
});

// Starter = WHAT you're making and for whom.
export const Starter = Base.extend({
  name: z.string(),                  // "Live lecture"
  persona: Persona,
  format: OutputFormat,
  buildable: z.boolean(),            // false = card only in MVP
  defaultAudience: z.object({ level: z.string(), context: z.string(), priorKnowledge: z.string() }),
  teachingStructure: z.array(z.string()), // e.g. ["hook","context","concept","example","misconception","recap","cta"]
  defaultGuidelines: z.array(z.string()),
  defaultTargetDurationSec: z.number().int(),
  suggestedTemplateIds: z.array(z.string()),
});

// Template = HOW it looks and sounds. Curated; teachers can make one from their brand.
export const Template = Base.extend({
  name: z.string(),                  // "University classic", "Bright explainer", "Maya's brand"
  origin: z.enum(["curated", "from_brand"]),
  ownerId: z.string().optional(),
  formats: z.array(OutputFormat),
  colors: z.object({ primary: z.string(), secondary: z.string(), accent: z.string(), background: z.string(), text: z.string() }),
  fonts: z.object({ heading: z.string(), body: z.string() }),
  logoAssetUrl: z.string().optional(),
  slideLayouts: z.array(z.string()),
  visualStyle: z.string(),           // prompt suffix for generated images/clips
  motionStyle: z.string(),
  narrationVoice: z.string(),        // TTS voice id
  voiceAndTone: z.string(),
  thumbnailUrl: z.string(),
});

export const Guideline = Base.extend({
  scope: z.enum(["user", "course", "lesson"]),
  scopeId: z.string(),
  kind: z.enum(["content_rule", "accuracy_rule", "accessibility", "brand_usage", "do_not"]),
  text: z.string(),
  severity: z.enum(["must", "should"]).default("must"),
});

export const Integration = Base.extend({ // UI only in MVP
  ownerId: z.string(),
  provider: z.enum(["google_drive", "youtube", "canvas", "google_classroom", "kajabi", "teachable", "dropbox", "notion"]),
  status: z.enum(["connected", "not_connected"]),
});

export const ScheduledTask = Base.extend({ // UI only in MVP
  ownerId: z.string(),
  courseId: z.string(),
  name: z.string(),
  cadence: z.string(),
  action: z.enum(["draft_next_lesson", "refresh_sources", "weekly_recap"]),
  enabled: z.boolean(),
});

// ---------- Course structure ----------
export const Audience = Base.extend({
  ownerId: z.string(),
  name: z.string(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  ageBand: z.enum(["k12", "college", "adult", "mixed"]),
  priorKnowledge: z.string(),
  context: z.enum(["live_lecture", "self_study", "social_feed", "paid_course", "training_session", "personal"]),
  notes: z.string().optional(),
});

export const Course = Base.extend({ // its settings: defaults, guidelines (via Guideline scope=course), course Preferences, ScheduledTasks
  ownerId: z.string(),
  title: z.string(),
  description: z.string(),
  defaultAudienceId: z.string(),
  defaultTemplateId: z.string(),
  defaultStarterId: z.string(),
});

// Derived from the course's ready lessons; feeds Planning so it never asks what it can infer.
export const CourseKnowledge = z.object({
  courseId: z.string(),
  covered: z.array(z.object({
    lessonId: z.string(),
    lessonTitle: z.string(),           // "Week 5 · Cellular respiration"
    concepts: z.array(z.string()),     // from that lesson's plan learning objectives and slide titles
  })),
  updatedAt: z.string(),
});

export const LessonStatus = z.enum([
  "draft", "sourcing", "planning", "plan_review", "generating_preview", "preview_review", "finalizing", "ready", "failed",
]);

// INTERNAL ONLY. Set by system policy per format (config), never shown to or set by the teacher.
export const SpendEnvelope = z.object({
  limitCredits: z.number().int(),
  estimatedCredits: z.number().int().default(0),
  spentCredits: z.number().int().default(0),
});

export const Lesson = Base.extend({
  courseId: z.string(),
  title: z.string(),
  teachingGoal: z.string(),
  format: OutputFormat,
  targetDurationSec: z.number().int(),
  starterId: z.string(),
  templateId: z.string(),
  audienceId: z.string(),
  sourceIds: z.array(z.string()),
  currentPlanId: z.string().optional(), // latest draft or approved plan
  artifactIds: z.array(z.string()).default([]),
  sourcesCard: z.object({ show: z.boolean().default(true) }).default({ show: true }),
  status: LessonStatus,
  spend: SpendEnvelope,               // internal
});

// ---------- Sources ----------
export const SourceDigest = z.object({
  summary: z.string(),
  keyConcepts: z.array(z.object({ name: z.string(), explanation: z.string() })),
  quotableFacts: z.array(z.object({ factId: z.string(), text: z.string(), locator: z.string() })),
  figures: z.array(z.object({ description: z.string(), locator: z.string() })).default([]),
  readingLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

export const Source = Base.extend({
  courseId: z.string(),
  lessonIds: z.array(z.string()).default([]),
  kind: z.enum(["text", "pdf", "url", "voice_memo", "video", "slides", "suggested"]),
  title: z.string(),
  origin: z.enum(["user_upload", "user_paste", "url", "agent_suggested", "integration", "prior_lesson"]),
  rawRef: z.string(),
  extractedText: z.string().optional(),
  status: z.enum(["pending", "processing", "ready", "failed", "awaiting_user_approval"]),
  digest: SourceDigest.optional(),
  approvedForUse: z.boolean().default(true), // agent-suggested sources start false
  // Cited = shown to viewers on the sources card. Private = used to plan, never shown.
  // Default by kind: text/voice_memo/slides/video/prior_lesson → private; pdf/url/suggested → cited. Teacher can switch.
  visibility: z.enum(["cited", "private"]),
});

// ---------- Plan ----------
export const VisualType = z.enum([
  "title_card",        // text on template background (≈free)
  "diagram",           // code-rendered (≈free)
  "still_image",       // image generation (low cost, internal)
  "generated_clip",    // video generation (high cost, internal)
  "source_excerpt",    // quote/figure from a source (free)
  "teacher_upload",    // the teacher's own image or clip (free)
]);

export const Citation = z.object({ sourceId: z.string(), factId: z.string().optional(), locator: z.string() });

export const Claim = z.object({
  text: z.string(),
  citations: z.array(Citation),
  status: z.enum(["grounded", "general_knowledge_flagged", "general_knowledge_checked", "unsupported"]),
});

// One unit type for every format. Video slides use narrative + duration; deck slides use bullets + speaker notes.
export const Slide = z.object({
  slideId: z.string(),
  order: z.number().int(),
  section: z.string().optional(),     // deck sections; recap sections use "Recap"
  role: z.enum(["hook", "context", "concept", "example", "misconception", "recap", "cta", "title", "question"]),
  title: z.string(),
  narrative: z.string().optional(),   // explainer: what is said
  estDurationSec: z.number().optional(),
  bullets: z.array(z.string()).default([]),     // deck
  speakerNotes: z.string().optional(),          // deck
  layout: z.enum(["title", "bullets", "image_left", "image_full", "two_column", "quote", "clip", "question"]).optional(),
  visual: z.string(),                 // teacher-facing: what the viewer sees
  visualType: VisualType,             // internal
  visualPrompt: z.string().optional(), // internal
  claims: z.array(Claim),
  fromRecap: z.object({ lessonId: z.string() }).optional(), // slide recaps an earlier lesson
  changedInVersion: z.number().int().optional(), // marks "Changed in draft N"
  changeReason: z.enum(["teacher_edit", "plan_revision", "slide_rewrite"]).optional(),
  estCredits: z.number().int(),       // internal
  whyThisVisual: z.string().optional(), // internal
});

export const ClarifyingQuestion = z.object({
  qId: z.string(),
  question: z.string(),
  options: z.array(z.string()).min(2).max(4),
  defaultOption: z.string(),
  answer: z.string().optional(),
});

export const StoryAngle = z.object({ angleId: z.string(), label: z.string(), story: z.string() }); // "Follow one carbon atom"

export const RecapSuggestion = z.object({
  fromLessonId: z.string(),
  summary: z.string(),                // "Open with a 3-minute recap of ATP from Week 5"
  slides: z.array(Slide),
  decision: z.enum(["pending", "added", "skipped"]).default("pending"),
});

export const TeachingPlan = Base.extend({
  lessonId: z.string(),
  version: z.number().int(),          // Draft 1, Draft 2, …
  parentPlanId: z.string().optional(),
  revisionRequest: z.object({        // what produced this draft
    text: z.string(),                 // plain-language note, typed or dictated
    via: z.enum(["typed", "dictated"]),
    scopeSlideId: z.string().optional(), // set when only one slide was rewritten
  }).optional(),
  format: OutputFormat,
  story: z.string(),                  // 2–3 sentences
  chosenAngleId: z.string(),
  angles: z.array(StoryAngle).length(3), // current + two alternatives
  learningObjectives: z.array(z.string()).min(1).max(5),
  assumptions: z.array(z.string()),   // shown as "I assumed…"
  recap: RecapSuggestion.optional(),
  slides: z.array(Slide),
  costEstimate: z.object({            // INTERNAL ONLY
    totalCredits: z.number().int(),
    byType: z.record(VisualType, z.number().int()),
    llmCredits: z.number().int(),
    ttsCredits: z.number().int(),
    withinEnvelope: z.boolean(),
    downgradesApplied: z.array(z.string()), // e.g. "slide 5: clip → illustration"
  }),
  guidelineChecks: z.array(z.object({ guidelineId: z.string(), passed: z.boolean(), note: z.string() })),
  status: z.enum(["draft", "awaiting_approval", "approved", "superseded"]),
});

// ---------- Outputs ----------
export const Artifact = Base.extend({
  lessonId: z.string(),
  courseId: z.string(),
  kind: z.enum(["explainer_video", "lecture_deck", "narration_audio", "image", "clip", "captions", "thumbnail", "pdf_export", "sources_card"]),
  stage: z.enum(["draft", "final"]),
  uri: z.string(),
  parentId: z.string().optional(),
  slideId: z.string().optional(),
  // Visual versions: every version of a slide's visual is kept; one is chosen.
  versionNumber: z.number().int().default(1),
  chosen: z.boolean().default(true),
  versionNote: z.string().optional(), // "warmer colors, no needle"
  origin: z.enum(["generated", "teacher_upload", "rendered"]).default("generated"),
  generation: z.object({
    provider: z.string(),
    model: z.string(),
    requestHash: z.string(),
    credits: z.number().int(),
  }).optional(),
});

// ---------- Governance & telemetry ----------
export const Approval = Base.extend({
  lessonId: z.string(),
  gate: z.enum(["plan", "preview", "suggested_source"]),
  planVersion: z.number().int().optional(),
  decision: z.enum(["approved", "changes_requested", "rejected"]),
  edits: z.array(z.string()).default([]),
});

export const AgentRun = Base.extend({
  agent: z.enum(["source_intake", "planning", "creation", "preference_learning"]),
  lessonId: z.string(),
  inputRef: z.string(),
  outputRef: z.string().optional(),
  status: z.enum(["running", "succeeded", "failed", "needs_user"]),
  steps: z.array(z.object({ at: z.string(), kind: z.enum(["llm", "tool", "validation", "handoff", "user_gate", "escalation"]), detail: z.string() })),
  routing: z.object({
    task: z.enum(["source_extraction", "planning", "self_check", "preference_learning", "transcription"]),
    chosenModel: z.string(),
    reason: z.enum(["fixed_config", "cascade_escalation", "router_rule", "router_learned"]),
    requestFeatures: z.object({ format: z.string(), sourceTokens: z.number(), sourceCount: z.number(), conflictingSources: z.boolean() }).optional(),
    escalatedFrom: z.string().optional(),
  }).optional(),
  error: z.string().optional(),
});

export const CostEvent = Base.extend({ // the ledger; the Lab app reads only this
  lessonId: z.string(),
  agentRunId: z.string().optional(),
  provider: z.string(),
  operation: z.enum(["llm", "tts", "stt", "image", "video_draft", "video_final"]),
  model: z.string(),
  slideId: z.string().optional(),
  units: z.object({ inputTokens: z.number().optional(), outputTokens: z.number().optional(), seconds: z.number().optional(), images: z.number().optional(), characters: z.number().optional() }),
  credits: z.number().int(),
  cached: z.boolean(),
  originalCredits: z.number().int().optional(),
  outcome: z.enum(["kept", "new_version", "re_recorded", "failed"]).default("kept"),
});

// ---------- Evals & bakeoff (internal; Lab app only) ----------
export const EvalTask = z.enum(["source_extraction", "planning", "self_check", "preference_learning"]);

export const EvalCase = Base.extend({
  task: EvalTask,
  persona: z.enum(["course_creator", "lecturer"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  inputRef: z.string(),
  referenceRef: z.string().optional(),
  notes: z.string().optional(),
});

export const EvalRun = Base.extend({
  caseId: z.string(),
  task: EvalTask,
  model: z.string(),
  promptVersion: z.string(),
  schemaValidFirstTry: z.boolean(),
  repairAttempts: z.number().int(),
  groundingRate: z.number().optional(),
  rubricScore: z.number().optional(),
  humanSpotCheck: z.object({ score: z.number(), agreesWithJudge: z.boolean() }).optional(),
  latencyMs: z.number(),
  credits: z.number().int(),
});

export const BakeoffResult = Base.extend({
  task: EvalTask,
  candidates: z.array(z.object({
    model: z.string(),
    schemaValidRate: z.number(), groundingRate: z.number().optional(), rubricMean: z.number(),
    p50LatencyMs: z.number(), p95LatencyMs: z.number(),
    creditsPerSuccess: z.number(),
    byDifficulty: z.record(z.enum(["easy", "medium", "hard"]), z.object({ rubricMean: z.number(), creditsPerSuccess: z.number() })),
  })),
  decisionRule: z.string(),           // written before the run
  chosenModel: z.string(),
  cascade: z.object({ from: z.string(), to: z.string(), trigger: z.string() }).optional(),
  routerRecommended: z.boolean(),
});
```

### Access and spend (site-level, stored outside workspaces)
```ts
// One per recipient. The code string is also the workspace key.
export const AccessCode = z.object({
  code: z.string(),                   // e.g. "RW-PANEL-Q2"; case-insensitive on entry, stored upper-case
  label: z.string(),                  // "Runway, hiring manager"
  capCredits: z.number().int(),       // per-code cap; default 1500 (= $15)
  active: z.boolean(),
  createdAt: z.string(),
  firstSeenAt: z.string().optional(),
  lastSeenAt: z.string().optional(),
});

export const SiteLimits = z.object({
  totalCredits: z.number().int(),     // 20000 (= $200) to start
  dailyCredits: z.number().int(),     // 4000 (= $40)
  warnAtFraction: z.number(),         // 0.75
  liveEnabled: z.boolean(),           // owner's pause switch; also LIVE_ENABLED env
  clipsPerLesson: z.number().int(),   // 2
});

// Running totals, incremented after every paid call (the CostEvent is the detailed record).
export const SpendCounters = z.object({
  totalCredits: z.number(),
  byDay: z.record(z.string(), z.number()),   // "2026-10-27" → credits
  byCode: z.record(z.string(), z.number()),  // code → credits
});
```
CostEvent gains `code: z.string().optional()` so Lab can show spend per code. A live workspace's User is created on first entry (name "You", persona from the first Starter used); its first Course is created with its first lesson.

## 4. Lesson state machine (deterministic; owned by the orchestrator, not an agent)
```
draft → sourcing → planning → plan_review ──approve──▶ generating_preview → preview_review ──approve──▶ finalizing → ready
                      ▲             │ edit / revise / new angle             ▲              │ re-record slide / new visual version / upload
                      └─────────────┘ (new plan draft)                      └──────────────┘ (same preview, one slide at a time)
any → failed (with AgentRun.error); failed → previous stage on retry
```
Rules:
- No paid media call may run unless lesson status is `generating_preview`, `preview_review` (single-slide work only) or `finalizing`.
- Every plan revision creates a new TeachingPlan with `version + 1` and `parentPlanId`; the previous one becomes `superseded`. Earlier drafts stay readable.
- `finalizing` requires an `Approval{gate:"preview", decision:"approved"}`.
- On `ready`, recompute the course's CourseKnowledge.
- The spend envelope is enforced by the system (Spec 03), never by asking the teacher.
- Before any paid call (LLM or media) in live mode, the spend gate checks: site live switch on, total and daily site limits not reached, the code's cap not reached. If any fails, the call doesn't run and the lesson stays in its current status (no `failed`), with a plain message to the teacher.

## 5. Preference resolution
For a lesson in course C: Template and Starter defaults → general Preferences → course Preferences for C → edits within the lesson. Later layers win. Items with `origin: "teacher"` are never overwritten by learning; values in `removedItemValues` are never relearned.

## 6. Seed data (fixtures/seed)
- **Starters (6):** "Detailed explainer" (course_creator, explainer_video, buildable), "Live lecture" (lecturer, lecture_deck, buildable), "45-second explainer for social" (social_creator, explainer_video, card only), "Study recap" (tutor, explainer_video, card only), "Training visual aid" (trainer, lecture_deck, card only), "Podcast explainer" (course_creator, podcast_audio, card only).
- **Templates (5):** curated "Bright explainer", "University classic", "Calm minimal", "Field briefing"; plus "Maya's brand" (from_brand: teal/coral, rounded sans, her logo).
- **User Maya** (course_creator) → Course "Investing 101" → Audience "Beginner investors, 25–40" → Template "Maya's brand" → Guidelines: "Never give individual investment advice", "Define every term on first use", "End with a disclaimer card" → Sources: outline (text, private), voice memo (fixture transcript, private), Investor.gov article (url, cited) → Lesson "How index funds work" (explainer_video, 155s, 7 slides) with Draft 1 and Draft 2 plans and artifacts. General preferences: tone warm (learned), bullets under 8 words (learned), prefer real photos (learned), define every term (teacher), citations short in footer (teacher). Course preferences for Investing 101: end every video with the course invite (teacher); tone playful (teacher, overrides general tone).
- **User Dr. Elena Ortiz** (lecturer) → Course "BIO 101" with ready lessons Week 4 "Cell membranes" and Week 5 "Cellular respiration" (so CourseKnowledge includes ATP) → Audience "First-year undergrads, live lecture" → Template "University classic" → Guidelines: "Cite a source on every factual slide", "Alt text for every image" → Sources: lecture notes (text, private), two open-textbook readings (pdf, cited) → Lesson "Week 6: Photosynthesis" (lecture_deck, 3000s, 27 slides) with a plan including a pending ATP recap suggestion, and artifacts. Course preference for BIO 101: speaker notes in full sentences (overrides general "short speaker notes").
- **Spend envelopes (config):** explainer 600 credits, deck 800 credits.
