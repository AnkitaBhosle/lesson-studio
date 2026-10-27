import { coverage, loadGolden, type Split } from "../fixtures/golden/golden";

// Prints counts and validation problems only, never case contents, so it is safe to run on the sealed set.
let failed = false;
for (const split of ["sealed", "dev"] as Split[]) {
  const { cases, problems } = loadGolden(split);
  console.log(`\n${split === "sealed" ? "Sealed golden set" : "Dev cases"}\n`);
  console.log("task                  easy  medium  hard  total" + (split === "sealed" ? " / target" : ""));
  for (const r of coverage(cases)) {
    console.log(`${r.task.padEnd(22)}${String(r.easy).padStart(4)}${String(r.medium).padStart(8)}${String(r.hard).padStart(6)}${String(r.total).padStart(7)}${split === "sealed" ? ` / ${r.target}` : ""}`);
  }
  if (problems.length) { failed = true; console.log(`\n${problems.length} problem(s):`); for (const p of problems) console.log(`- ${p}`); }
}
process.exit(failed ? 1 : 0);
