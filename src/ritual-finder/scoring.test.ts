import { scoreAnswers } from "./scoring";
import { QUESTIONS } from "./questions";
import { describe, expect, it } from "vitest";

describe("ritual scoring", () => {
  it("has 18 questions with four choices each", () => {
    expect(QUESTIONS).toHaveLength(18);
    for (const q of QUESTIONS) {
      expect(q.choices.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("scores high answers toward 100 percent", () => {
    const answers = Object.fromEntries(
      QUESTIONS.map((q) => [q.id, q.choices[q.choices.length - 1].value])
    );
    const scores = scoreAnswers(answers);
    for (const s of scores) {
      expect(s.percent).toBeGreaterThanOrEqual(60);
    }
  });

  it("scores low answers toward the floor", () => {
    const answers = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.choices[0].value]));
    const scores = scoreAnswers(answers);
    for (const s of scores) {
      expect(s.percent).toBeLessThanOrEqual(40);
    }
  });
});
