import type { Audience, Course, Guideline, Integration, Preferences, ScheduledTask, Starter, Template, User } from "@ls/schema";

export const T0 = "2026-10-20T09:00:00.000Z";
const base = (id: string) => ({ id, createdAt: T0, updatedAt: T0 });

export const users: User[] = [
  { ...base("usr_maya"), name: "Maya", email: "maya@example.com", persona: "course_creator" },
  { ...base("usr_ortiz"), name: "Dr. Elena Ortiz", email: "eortiz@example.edu", persona: "lecturer" },
];

export const starters: Starter[] = [
  { ...base("str_detailed"), name: "Detailed explainer", persona: "course_creator", format: "explainer_video", buildable: true,
    defaultAudience: { level: "beginner", context: "paid_course", priorKnowledge: "None assumed" },
    teachingStructure: ["hook", "context", "concept", "example", "misconception", "recap", "cta"],
    defaultGuidelines: ["Define every term on first use"], defaultTargetDurationSec: 150, suggestedTemplateIds: ["tpl_maya", "tpl_bright"] },
  { ...base("str_lecture"), name: "Live lecture", persona: "lecturer", format: "lecture_deck", buildable: true,
    defaultAudience: { level: "beginner", context: "live_lecture", priorKnowledge: "Earlier lessons in the course" },
    teachingStructure: ["title", "concept", "question", "recap"],
    defaultGuidelines: ["Cite a source on every factual slide"], defaultTargetDurationSec: 3000, suggestedTemplateIds: ["tpl_univ", "tpl_calm"] },
  { ...base("str_social"), name: "45-second explainer for social", persona: "social_creator", format: "explainer_video", buildable: false,
    defaultAudience: { level: "beginner", context: "social_feed", priorKnowledge: "None" },
    teachingStructure: ["hook", "concept", "cta"], defaultGuidelines: [], defaultTargetDurationSec: 45, suggestedTemplateIds: ["tpl_bright"] },
  { ...base("str_recap"), name: "Study recap", persona: "tutor", format: "explainer_video", buildable: false,
    defaultAudience: { level: "beginner", context: "self_study", priorKnowledge: "Just had the lesson" },
    teachingStructure: ["recap", "question"], defaultGuidelines: [], defaultTargetDurationSec: 60, suggestedTemplateIds: ["tpl_calm"] },
  { ...base("str_training"), name: "Training visual aid", persona: "trainer", format: "lecture_deck", buildable: false,
    defaultAudience: { level: "intermediate", context: "training_session", priorKnowledge: "Role basics" },
    teachingStructure: ["title", "concept", "example", "question"], defaultGuidelines: [], defaultTargetDurationSec: 1200, suggestedTemplateIds: ["tpl_field"] },
  { ...base("str_podcast"), name: "Podcast explainer", persona: "course_creator", format: "podcast_audio", buildable: false,
    defaultAudience: { level: "beginner", context: "self_study", priorKnowledge: "None assumed" },
    teachingStructure: ["hook", "concept", "example", "recap"], defaultGuidelines: [], defaultTargetDurationSec: 600, suggestedTemplateIds: ["tpl_calm"] },
];

const tpl = (id: string, name: string, origin: "curated" | "from_brand", formats: Template["formats"], colors: Template["colors"], fonts: Template["fonts"], voiceAndTone: string, visualStyle: string, motionStyle: string, ownerId?: string): Template => ({
  ...base(id), name, origin, ownerId, formats, colors, fonts, slideLayouts: ["title", "bullets", "image_left", "image_full", "two_column", "quote", "clip", "question"],
  visualStyle, motionStyle, narrationVoice: origin === "from_brand" ? "voice_maya_warm" : "voice_neutral", voiceAndTone, thumbnailUrl: `/templates/${id}.png`,
});

export const templates: Template[] = [
  tpl("tpl_maya", "Maya's brand", "from_brand", ["explainer_video", "podcast_audio"],
    { primary: "#2A9D8F", secondary: "#264653", accent: "#E76F51", background: "#FFF8F1", text: "#264653" },
    { heading: "Nunito", body: "Plus Jakarta Sans" }, "Warm, plain English, define every term", "clean flat illustration, teal and coral, soft shadows", "slow push-ins, no fast cuts", "usr_maya"),
  tpl("tpl_univ", "University classic", "curated", ["lecture_deck"],
    { primary: "#1F2A44", secondary: "#8D9AB8", accent: "#E2B84B", background: "#FFFFFF", text: "#1F2A44" },
    { heading: "Source Serif 4", body: "Plus Jakarta Sans" }, "Clear, academic, cites as it goes", "precise scientific illustration, navy and gold accents", "gentle zooms, labelled diagrams"),
  tpl("tpl_bright", "Bright explainer", "curated", ["explainer_video"],
    { primary: "#3442C9", secondary: "#1B1F27", accent: "#FFD166", background: "#FFFFFF", text: "#1B1F27" },
    { heading: "Plus Jakarta Sans", body: "Plus Jakarta Sans" }, "Upbeat, short sentences", "bold friendly shapes, indigo and yellow", "snappy but readable"),
  tpl("tpl_calm", "Calm minimal", "curated", ["explainer_video", "lecture_deck", "podcast_audio"],
    { primary: "#2B2F36", secondary: "#7A9E7E", accent: "#7A9E7E", background: "#F4F4F0", text: "#2B2F36" },
    { heading: "Plus Jakarta Sans", body: "Plus Jakarta Sans" }, "Quiet, one idea per screen", "minimal line art, lots of space", "slow and steady"),
  tpl("tpl_field", "Field briefing", "curated", ["lecture_deck"],
    { primary: "#2F3A2F", secondary: "#D8C27A", accent: "#D8C27A", background: "#2F3A2F", text: "#FFFFFF" },
    { heading: "Plus Jakarta Sans", body: "Plus Jakarta Sans" }, "Direct, numbered steps", "high-contrast photos and icons", "static, step by step"),
];

export const audiences: Audience[] = [
  { ...base("aud_inv"), ownerId: "usr_maya", name: "Beginner investors, 25–40", level: "beginner", ageBand: "adult", priorKnowledge: "Has a bank account; has never bought a fund", context: "paid_course" },
  { ...base("aud_yt"), ownerId: "usr_maya", name: "Curious beginners", level: "beginner", ageBand: "adult", priorKnowledge: "None", context: "social_feed" },
  { ...base("aud_bio"), ownerId: "usr_ortiz", name: "First-year undergrads, live lecture", level: "beginner", ageBand: "college", priorKnowledge: "High-school biology", context: "live_lecture" },
  { ...base("aud_eco"), ownerId: "usr_ortiz", name: "Second-year undergrads", level: "intermediate", ageBand: "college", priorKnowledge: "BIO 101", context: "live_lecture" },
];

export const courses: Course[] = [
  { ...base("crs_inv101"), ownerId: "usr_maya", title: "Investing 101", description: "Maya's paid course for first-time investors.", defaultAudienceId: "aud_inv", defaultTemplateId: "tpl_maya", defaultStarterId: "str_detailed" },
  { ...base("crs_yt"), ownerId: "usr_maya", title: "Free YouTube series", description: "Short free explainers that lead into the paid course.", defaultAudienceId: "aud_yt", defaultTemplateId: "tpl_maya", defaultStarterId: "str_detailed" },
  { ...base("crs_bio101"), ownerId: "usr_ortiz", title: "BIO 101 · Introduction to Biology", description: "Fall 2026, ~200 first-year students.", defaultAudienceId: "aud_bio", defaultTemplateId: "tpl_univ", defaultStarterId: "str_lecture" },
  { ...base("crs_bio220"), ownerId: "usr_ortiz", title: "BIO 220 Ecology", description: "Spring 2027.", defaultAudienceId: "aud_eco", defaultTemplateId: "tpl_univ", defaultStarterId: "str_lecture" },
];

const gl = (id: string, scopeId: string, kind: Guideline["kind"], text: string): Guideline => ({ ...base(id), scope: "course", scopeId, kind, text, severity: "must" });
export const guidelines: Guideline[] = [
  gl("gdl_noadvice", "crs_inv101", "do_not", "Never give individual investment advice"),
  gl("gdl_define", "crs_inv101", "content_rule", "Define every term on first use"),
  gl("gdl_disclaimer", "crs_inv101", "content_rule", "End with a disclaimer card"),
  gl("gdl_cite", "crs_bio101", "accuracy_rule", "Cite a source on every factual slide"),
  gl("gdl_alt", "crs_bio101", "accessibility", "Alt text for every image"),
];

const item = (itemId: string, kind: "tone" | "citation_style" | "note", value: string, origin: "learned" | "teacher", evidence?: string, overridesItemId?: string) => ({ itemId, kind, value, origin, evidence, overridesItemId });
export const preferences: Preferences[] = [
  { ...base("prf_maya_general"), userId: "usr_maya", scope: "general", removedItemValues: [], items: [
    item("pi_tone", "tone", "Warm and encouraging", "learned", "From your answers in 4 lessons"),
    item("pi_bullets", "note", "Keep bullets under 8 words", "learned", "You shortened bullets in 3 lessons"),
    item("pi_photos", "note", "Prefer real photos over illustrations", "learned", "You swapped illustrations for photos in 2 lessons"),
    item("pi_define", "note", "Define every term the first time it appears", "teacher"),
    item("pi_cite", "citation_style", "Short, in the footer", "teacher"),
  ] },
  { ...base("prf_maya_inv101"), userId: "usr_maya", scope: "course", courseId: "crs_inv101", removedItemValues: [], items: [
    item("pi_invite", "note", "End every video with an invite to the full course", "teacher"),
    item("pi_playful", "tone", "Playful", "teacher", undefined, "pi_tone"),
  ] },
  { ...base("prf_maya_yt"), userId: "usr_maya", scope: "course", courseId: "crs_yt", removedItemValues: [], items: [
    item("pi_short", "note", "Keep videos under 90 seconds", "teacher"),
    item("pi_nocard", "note", "No sources card at the end", "learned", "From 3 lessons in this course"),
  ] },
  { ...base("prf_ortiz_general"), userId: "usr_ortiz", scope: "general", removedItemValues: [], items: [
    item("pi_shortnotes", "note", "Short speaker notes", "learned", "You trimmed speaker notes in 3 lessons"),
  ] },
  { ...base("prf_ortiz_bio101"), userId: "usr_ortiz", scope: "course", courseId: "crs_bio101", removedItemValues: [], items: [
    item("pi_fullnotes", "note", "Speaker notes in full sentences", "teacher", undefined, "pi_shortnotes"),
  ] },
];

const providers = ["google_drive", "youtube", "canvas", "google_classroom", "kajabi", "teachable", "dropbox", "notion"] as const;
const connectedFor: Record<string, string[]> = { usr_maya: ["google_drive", "youtube"], usr_ortiz: ["google_drive", "canvas"] };
export const integrations: Integration[] = Object.entries(connectedFor).flatMap(([ownerId, on]) => providers.map((provider) => ({
  ...base(`int_${ownerId.slice(4)}_${provider}`), ownerId, provider, status: on.includes(provider) ? "connected" as const : "not_connected" as const,
})));

export const scheduledTasks: ScheduledTask[] = [
  { ...base("sch_maya_draft"), ownerId: "usr_maya", courseId: "crs_inv101", name: "Draft next week's lesson", cadence: "Every Friday at 9am", action: "draft_next_lesson", enabled: true },
  { ...base("sch_maya_recap"), ownerId: "usr_maya", courseId: "crs_inv101", name: "Weekly recap video", cadence: "Every Sunday at 6pm", action: "weekly_recap", enabled: false },
  { ...base("sch_ortiz_draft"), ownerId: "usr_ortiz", courseId: "crs_bio101", name: "Draft next week's lecture", cadence: "Every Friday at 9am", action: "draft_next_lesson", enabled: true },
];
