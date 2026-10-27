import { describe, expect, it } from "vitest";
import { loadGolden, TASKS } from "./golden";

describe("golden set", () => {
  it("every case is valid", () => {
    const { problems } = loadGolden();
    expect(problems).toEqual([]);
  });
  it("has at least one example per task", () => {
    const { cases } = loadGolden();
    for (const t of TASKS) expect(cases.some((c) => c.task === t), t).toBe(true);
  });
});
