import { describe, expect, it } from "vitest";
import { summarise } from "./stats";
import { emptyEntry } from "./fields";
import { PROGRAM_DAYS } from "../days21/content";

describe("journal trends", () => {
  it("averages only entered numbers", () => {
    const a = emptyEntry("u", "2026-08-01");
    a.hydration = 4;
    const b = emptyEntry("u", "2026-08-02");
    b.hydration = 6;
    const trends = summarise([a, b], 30, "2026-08-13");
    const hyd = trends.find((t) => t.label === "Hydration noted");
    expect(hyd?.value).toContain("5.0");
  });
});

describe("21 days", () => {
  it("has twenty-one complete days", () => {
    expect(PROGRAM_DAYS).toHaveLength(21);
    expect(PROGRAM_DAYS[20]?.title).toMatch(/Ritual/i);
    for (const d of PROGRAM_DAYS) {
      expect(d.read.length).toBeGreaterThan(40);
      expect(d.do.length).toBeGreaterThan(10);
      expect(d.notice.length).toBeGreaterThan(10);
    }
  });
});
