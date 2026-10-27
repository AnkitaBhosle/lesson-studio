import { describe, expect, it } from "vitest";
import { loadGolden, TASKS } from "./golden";

describe("golden set", () => {
  it("dev and sealed cases are valid", () => {
    expect(loadGolden("dev").problems).toEqual([]);
    expect(loadGolden("sealed").problems).toEqual([]);
  });
  it("dev has at least one example per task", () => {
    const { cases } = loadGolden("dev");
    for (const t of TASKS) expect(cases.some((c) => c.task === t), t).toBe(true);
  });
});
