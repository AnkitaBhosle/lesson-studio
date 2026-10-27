import { describe, expect, it } from "vitest";
import { SCHEMA_VERSION } from "./index";

describe("schema package", () => {
  it("exports a version", () => {
    expect(SCHEMA_VERSION).toBe(1);
  });
});
