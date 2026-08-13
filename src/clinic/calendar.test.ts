import { CLINIC } from "./config";
import { slotsForDay } from "./calendar";
import { describe, expect, it } from "vitest";

describe("clinic slots", () => {
  it("skips Sundays", () => {
    const sunday = new Date();
    sunday.setDate(sunday.getDate() + ((7 - sunday.getDay()) % 7 || 7));
    expect(sunday.getDay()).toBe(0);
    expect(slotsForDay(sunday, "clinic")).toHaveLength(0);
  });

  it("offers weekday 30-minute starts", () => {
    const monday = new Date();
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() + 14);
    while (monday.getDay() !== 1) monday.setDate(monday.getDate() + 1);
    const slots = slotsForDay(monday, "video");
    expect(slots.length).toBeGreaterThan(8);
    expect(slots[0]?.time).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe("clinic copy", () => {
  it("names the doctor and clinic", () => {
    expect(CLINIC.doctor).toMatch(/Rajeshree/);
    expect(CLINIC.name).toMatch(/Urocare/);
  });
});
