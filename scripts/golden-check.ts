import { coverage, loadGolden } from "../fixtures/golden/golden";

const { cases, problems } = loadGolden();
console.log("Golden set coverage\n");
console.log("task                  easy  medium  hard  total / target");
for (const r of coverage(cases)) {
  console.log(`${r.task.padEnd(22)}${String(r.easy).padStart(4)}${String(r.medium).padStart(8)}${String(r.hard).padStart(6)}${String(r.total).padStart(7)} / ${r.target}`);
}
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems) console.log(`- ${p}`);
  process.exit(1);
}
console.log(`\nAll ${cases.length} cases are valid.`);
