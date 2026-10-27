import type { Artifact, CourseKnowledge, Lesson } from "@ls/schema";
import { T0 } from "./people";
import { mayaDraft2, ortizDraft1 } from "./plans";

const base = (id: string) => ({ id, createdAt: T0, updatedAt: T0 });
const spend = (limitCredits: number, estimatedCredits = 0, spentCredits = 0) => ({ limitCredits, estimatedCredits, spentCredits });

export const lessons: Lesson[] = [
  { ...base("lsn_index"), courseId: "crs_inv101", title: "How index funds work", teachingGoal: "Viewers can explain what an index fund is and why fees and patience matter",
    format: "explainer_video", targetDurationSec: 155, starterId: "str_detailed", templateId: "tpl_maya", audienceId: "aud_inv",
    sourceIds: ["src_maya_outline", "src_maya_memo", "src_maya_gov"], currentPlanId: "pln_idx_v2", artifactIds: [], sourcesCard: { show: true },
    status: "plan_review", spend: spend(600, 412) },
  { ...base("lsn_compound"), courseId: "crs_inv101", title: "Compound interest in 2 minutes", teachingGoal: "Viewers can explain compounding with one example",
    format: "explainer_video", targetDurationSec: 120, starterId: "str_detailed", templateId: "tpl_maya", audienceId: "aud_inv",
    sourceIds: [], artifactIds: [], sourcesCard: { show: true }, status: "ready", spend: spend(600, 655, 581) },
  { ...base("lsn_etf"), courseId: "crs_inv101", title: "What is an ETF?", teachingGoal: "Viewers can tell an ETF from a mutual fund",
    format: "explainer_video", targetDurationSec: 150, starterId: "str_detailed", templateId: "tpl_maya", audienceId: "aud_inv",
    sourceIds: [], artifactIds: [], sourcesCard: { show: true }, status: "ready", spend: spend(600, 430, 401) },

  { ...base("lsn_membranes"), courseId: "crs_bio101", title: "Week 4 · Cell membranes", teachingGoal: "Students can describe membrane structure and transport",
    format: "lecture_deck", targetDurationSec: 3000, starterId: "str_lecture", templateId: "tpl_univ", audienceId: "aud_bio",
    sourceIds: [], artifactIds: [], sourcesCard: { show: true }, status: "ready", spend: spend(800, 470, 452) },
  { ...base("lsn_resp"), courseId: "crs_bio101", title: "Week 5 · Cellular respiration", teachingGoal: "Students can trace how cells release energy from sugar",
    format: "lecture_deck", targetDurationSec: 3000, starterId: "str_lecture", templateId: "tpl_univ", audienceId: "aud_bio",
    sourceIds: [], artifactIds: [], sourcesCard: { show: true }, status: "ready", spend: spend(800, 470, 463) },
  { ...base("lsn_photo"), courseId: "crs_bio101", title: "Week 6 · Photosynthesis", teachingGoal: "Students can explain both stages of photosynthesis and where the oxygen comes from",
    format: "lecture_deck", targetDurationSec: 3000, starterId: "str_lecture", templateId: "tpl_univ", audienceId: "aud_bio",
    sourceIds: ["src_ortiz_notes", "src_ortiz_bio2e", "src_ortiz_concepts", "src_ortiz_c4"], currentPlanId: "pln_photo_v1", artifactIds: [], sourcesCard: { show: true },
    status: "plan_review", spend: spend(800, 540) },
  { ...base("lsn_genetics"), courseId: "crs_bio101", title: "Week 7 · Mendelian genetics", teachingGoal: "Students can predict simple inheritance patterns",
    format: "lecture_deck", targetDurationSec: 3000, starterId: "str_lecture", templateId: "tpl_univ", audienceId: "aud_bio",
    sourceIds: [], artifactIds: [], sourcesCard: { show: true }, status: "draft", spend: spend(800) },
];

export const courseKnowledge: CourseKnowledge[] = [
  { courseId: "crs_bio101", updatedAt: T0, covered: [
    { lessonId: "lsn_membranes", lessonTitle: "Week 4 · Cell membranes", concepts: ["Phospholipid bilayer", "Membrane proteins", "Diffusion and osmosis"] },
    { lessonId: "lsn_resp", lessonTitle: "Week 5 · Cellular respiration", concepts: ["Glycolysis", "Krebs cycle", "Electron transport chain", "ATP as the energy currency"] },
  ] },
  { courseId: "crs_inv101", updatedAt: T0, covered: [
    { lessonId: "lsn_compound", lessonTitle: "Compound interest in 2 minutes", concepts: ["Compounding", "Starting early"] },
    { lessonId: "lsn_etf", lessonTitle: "What is an ETF?", concepts: ["ETFs vs mutual funds", "Trading during the day"] },
  ] },
];

const art = (id: string, a: Omit<Artifact, "id" | "createdAt" | "updatedAt" | "versionNumber" | "chosen" | "origin"> & Partial<Pick<Artifact, "versionNumber" | "chosen" | "origin">>): Artifact => ({
  ...base(id), versionNumber: 1, chosen: true, origin: "rendered", ...a,
});

// Draft preview artifacts. URIs use the placeholder: scheme, rendered from the template until the demo cache exists (M8).
export const artifacts: Artifact[] = [
  ...mayaDraft2.slides.flatMap((s) => [
    art(`art_idx_narr_${s.order}`, { lessonId: "lsn_index", courseId: "crs_inv101", kind: "narration_audio", stage: "draft", uri: `placeholder:narration/${s.slideId}`, slideId: s.slideId, origin: "generated" }),
    art(`art_idx_vis_${s.order}_v1`, { lessonId: "lsn_index", courseId: "crs_inv101", kind: s.visualType === "generated_clip" ? "clip" : "image", stage: "draft", uri: `placeholder:visual/${s.slideId}/1`, slideId: s.slideId,
      chosen: s.order !== 1, origin: s.visualType === "diagram" || s.visualType === "title_card" ? "rendered" : "generated" }),
  ]),
  art("art_idx_vis_1_v2", { lessonId: "lsn_index", courseId: "crs_inv101", kind: "clip", stage: "draft", uri: "placeholder:visual/sld_idx_1/2", slideId: "sld_idx_1", versionNumber: 2, chosen: true, versionNote: "warmer colors", origin: "generated" }),
  art("art_compound_final", { lessonId: "lsn_compound", courseId: "crs_inv101", kind: "explainer_video", stage: "final", uri: "placeholder:video/lsn_compound" }),
  art("art_etf_final", { lessonId: "lsn_etf", courseId: "crs_inv101", kind: "explainer_video", stage: "final", uri: "placeholder:video/lsn_etf" }),
  art("art_membranes_pdf", { lessonId: "lsn_membranes", courseId: "crs_bio101", kind: "pdf_export", stage: "final", uri: "placeholder:pdf/lsn_membranes" }),
  art("art_resp_pdf", { lessonId: "lsn_resp", courseId: "crs_bio101", kind: "pdf_export", stage: "final", uri: "placeholder:pdf/lsn_resp" }),
  ...ortizDraft1.slides.filter((s) => s.visualType === "still_image" || s.visualType === "generated_clip").map((s) =>
    art(`art_photo_vis_${s.order}`, { lessonId: "lsn_photo", courseId: "crs_bio101", kind: s.visualType === "generated_clip" ? "clip" : "image", stage: "draft", uri: `placeholder:visual/${s.slideId}/1`, slideId: s.slideId, origin: "generated" })),
];
