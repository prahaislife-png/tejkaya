import { rangeDays } from "../lib/dates";
import type { JournalEntry } from "./fields";

export interface Trend {
  label: string;
  value: string;
  detail: string;
}

function nums(entries: JournalEntry[], key: "hydration" | "movement" | "discomfort" | "stoolComfort"): number[] {
  return entries.map((e) => e[key]).filter((n): n is number => typeof n === "number");
}

function avg(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function summarise(entries: JournalEntry[], days: number, endIso: string): Trend[] {
  const window = new Set(rangeDays(endIso, days));
  const slice = entries.filter((e) => window.has(e.date));
  const logged = slice.length;
  const hyd = avg(nums(slice, "hydration"));
  const move = avg(nums(slice, "movement"));
  const disc = avg(nums(slice, "discomfort"));
  const comfort = avg(nums(slice, "stoolComfort"));
  const night = slice.filter((e) => e.nightUrine === "2" || e.nightUrine === "3plus").length;
  return [
    {
      label: "Days logged",
      value: `${logged} / ${days}`,
      detail: "Count of days you saved an entry in this window."
    },
    {
      label: "Hydration noted",
      value: hyd == null ? "—" : `${hyd.toFixed(1)} glasses`,
      detail: "Average of the glasses you entered — not a medical target."
    },
    {
      label: "Movement noted",
      value: move == null ? "—" : `${Math.round(move)} min`,
      detail: "Average of minutes you recorded."
    },
    {
      label: "Discomfort (your scale)",
      value: disc == null ? "—" : disc.toFixed(1),
      detail: "Average of scores you typed. Not a diagnosis."
    },
    {
      label: "Stool comfort (your scale)",
      value: comfort == null ? "—" : comfort.toFixed(1),
      detail: "Average of scores you typed."
    },
    {
      label: "Nights with 2+ urinations logged",
      value: String(night),
      detail: "A count of your notes only. Persistent change belongs with a clinician."
    }
  ];
}
