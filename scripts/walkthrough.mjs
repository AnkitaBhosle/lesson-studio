// Clicks through both hero flows in a real browser against a running studio.
// Usage: node scripts/walkthrough.mjs [baseUrl] [screenshotDir]
import { createRequire } from "node:module";
import fs from "node:fs";

// Playwright is preinstalled globally in the build environment; it is not a project dependency.
const { chromium } = createRequire(import.meta.url)("playwright");

const base = process.argv[2] ?? "http://localhost:3000";
const shots = process.argv[3];
if (shots) fs.mkdirSync(shots, { recursive: true });

// Behind a proxy (as in the build sandbox), route the browser through it.
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
const browser = await chromium.launch({ proxy });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ignoreHTTPSErrors: Boolean(proxy) });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => { if (r.url().includes("/api/") && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

let n = 0;
async function shot(name) {
  if (shots) await page.screenshot({ path: `${shots}/${String(++n).padStart(2, "0")}-${name}.png`, fullPage: true });
}
const click = (name, role = "button") => page.getByRole(role, { name, exact: false }).first().click();
// "networkidle" never settles on some hosts (analytics beacons), so wait for load plus a short pause.
const settle = async () => { await page.waitForLoadState("load"); await page.waitForTimeout(600); };
async function step(name, fn) {
  try { await fn(); await settle(); console.log(`ok  ${name}`); }
  catch (e) { console.log(`FAIL ${name}: ${e.message.split("\n")[0]}`); errors.push(name); }
}

// ---------- Maya ----------
await page.request.post(`${base}/reset`);
await page.goto(`${base}/switch?to=usr_maya`); await settle(); await shot("maya-home");
await step("open sources", async () => { await click("Start lesson", "link"); await page.waitForURL(/sources/); await shot("maya-sources"); });
await step("cite the outline", async () => { await page.getByRole("switch", { name: /Index funds outline/ }).click(); });
await step("plan", async () => { await click("Plan the lesson", "link"); await page.waitForURL(/plan/); await shot("maya-plan"); });
await step("revise from a note", async () => {
  await page.getByLabel("Tell me what to change").fill("Make the hook punchier");
  await click("Revise the plan"); await page.getByText(/Draft 3 is ready/).waitFor();
});
await step("pick another angle", async () => { await click("Explore angles"); await click("Start with your story"); await page.getByText("New story picked").waitFor(); });
await step("check the flagged slide", async () => { await click("Looks right"); await page.getByText("Checked by you").waitFor(); await shot("maya-plan-revised"); });
await step("approve the plan", async () => { await click("Approve plan and make a preview"); await page.waitForURL(/preview/); await shot("maya-preview"); });
await step("re-record a slide", async () => {
  await page.getByRole("button", { name: /Slide 3:/ }).click();
  await page.getByLabel("Narrative").fill("Small fees, big gap. Here is why.");
  await click("Re-record this slide"); await page.getByText(/Re-recorded/).waitFor();
});
await step("make a new visual version", async () => { await page.getByLabel(/What should change/).fill("warmer colors"); await click("Make a new version"); await page.getByRole("button", { name: /Version 2/ }).waitFor(); });
await step("switch back to version 1", async () => { await page.getByRole("button", { name: /^Version 1/ }).click(); });
await step("finish the video", async () => { await click("Looks good, finish the video"); await page.waitForURL(/final/); await shot("maya-final"); });
await step("sources card toggles", async () => { await page.getByRole("switch", { name: /Recording, Oct 24/ }).click(); await page.getByText("Leave the sources card out").click(); });

// ---------- Dr. Ortiz ----------
await page.goto(`${base}/switch?to=usr_ortiz`); await settle(); await shot("ortiz-course");
await step("open the lecture", async () => { await click("New lesson", "link"); await page.waitForURL(/sources/); await shot("ortiz-sources"); });
await step("use the suggested source", async () => { await click("Use this source"); await page.getByText("Suggested · approved by you").waitFor(); });
await step("plan the lecture", async () => { await click("Plan the lecture", "link"); await page.waitForURL(/plan/); await shot("ortiz-plan"); });
await step("add the recap", async () => { await click("Add the recap"); await page.getByText(/recap at the start/).waitFor(); });
await step("dictate a change", async () => {
  await page.getByRole("button", { name: "Dictate your changes" }).click(); await page.getByRole("button", { name: "Stop" }).first().click();
  await page.getByLabel("Tell me what to change").and(page.locator(":not(:empty)")).waitFor().catch(() => {});
  await click("Revise the outline"); await page.getByText(/Draft \d is ready/).waitFor();
});
await step("check slide 8", async () => { await click("Looks right"); });
await step("approve the outline", async () => { await click("Approve outline and build the deck"); await page.waitForURL(/preview/); await shot("ortiz-preview"); });
await step("edit speaker notes", async () => { await page.getByLabel(/Speaker notes/).fill("Ask the room first."); await page.getByLabel(/Speaker notes/).blur(); });
await step("finish the deck", async () => { await click("Looks good, finish the deck"); await page.waitForURL(/final/); await shot("ortiz-final"); });

for (const p of ["/templates", "/settings"]) { await page.goto(base + p); await settle(); await shot(p.slice(1)); }
await step("edit a preference", async () => { await click("Edit"); await page.getByLabel("Edit preference").fill("Short speaker notes, in full sentences"); await click("Save"); });

await browser.close();
console.log(errors.length ? `\n${errors.length} problem(s):\n${errors.join("\n")}` : "\nBoth flows passed.");
process.exit(errors.length ? 1 : 0);
