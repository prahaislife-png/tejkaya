import { CATEGORIES, QUESTIONS, type CategoryId, type Question } from "./questions";

export type Answers = Record<string, string>;

export interface CategoryScore {
  id: CategoryId;
  label: string;
  raw: number;
  max: number;
  percent: number;
}

export interface Habit {
  id: string;
  category: CategoryId;
  title: string;
  body: string;
}

export interface RitualResult {
  id: string;
  createdAt: string;
  firstName: string;
  email: string;
  answers: Answers;
  scores: CategoryScore[];
  habits: Habit[];
}

const HABITS: Array<{
  id: string;
  category: CategoryId;
  when: (percent: number, answers: Answers) => boolean;
  title: string;
  body: string;
}> = [
  {
    id: "water-first",
    category: "hydration",
    when: (p) => p < 70,
    title: "A glass before the kettle",
    body: "Keep a filled glass by the bed. Drink it before tea or coffee. This is a rhythm, not a quota."
  },
  {
    id: "sip-desk",
    category: "hydration",
    when: (p, a) => p < 85 || a["water-glasses"] === "0-2" || a["water-glasses"] === "3-4",
    title: "Water where you work",
    body: "Place a bottle in the room you actually sit in. Refill at lunch. Forgotten water does not count."
  },
  {
    id: "meal-hours",
    category: "rhythm",
    when: (p) => p < 75,
    title: "Name your meal hours",
    body: "Choose a lunch hour and a kitchen-closed hour you can keep most weekdays. Regular timing is a kindness to digestion."
  },
  {
    id: "morning-shape",
    category: "rhythm",
    when: (_p, a) => a.morning === "rush" || a.morning === "fog" || a.routine === "none",
    title: "Three-beat morning",
    body: "On waking: water, a window or balcony for two minutes, then the first screen. That order is the ritual."
  },
  {
    id: "fibre-plate",
    category: "digestion",
    when: (_p, a) => a.fibre === "rare" || a.fibre === "few" || a["after-meals"] === "heavy",
    title: "One plant at lunch",
    body: "Add a katori of cooked vegetables, salad, or fruit to the meal you already eat. Increase fibre gradually, with water."
  },
  {
    id: "walk-after",
    category: "digestion",
    when: (_p, a) => a["after-meals"] === "heavy" || a["last-meal"] === "late",
    title: "Ten minutes after the main meal",
    body: "A slow indoor or courtyard walk after lunch or dinner. Not exercise — unfinished conversation with your food."
  },
  {
    id: "kitchen-close",
    category: "digestion",
    when: (_p, a) => a["last-meal"] === "late" || a["last-meal"] === "close",
    title: "Close the kitchen earlier",
    body: "Bring the last substantial plate twenty to thirty minutes earlier this week. Notice sleep, not perfection."
  },
  {
    id: "stand-hour",
    category: "movement",
    when: (p, a) => p < 70 || a.sitting === "long" || a.movement === "0-10",
    title: "Stand at the hour",
    body: "When the clock hits a new hour, stand, roll the shoulders, walk to a window. Sitting less begins as punctuation."
  },
  {
    id: "walk-date",
    category: "movement",
    when: (_p, a) => a.movement === "0-10" || a.movement === "11-20",
    title: "A walking appointment",
    body: "Put a 15-minute walk in the calendar as if it were a guest. Same time, most days."
  },
  {
    id: "lights-down",
    category: "rest",
    when: (p, a) => p < 70 || a["sleep-hours"] === "under5" || a["sleep-hours"] === "5-6",
    title: "A dimmer last hour",
    body: "Lower lights and leave the brightest screen in another room for the final hour. Sleep arrives more willingly."
  },
  {
    id: "pause-tea",
    category: "rest",
    when: (_p, a) => a.stress === "most" || a.stress === "half" || a.pause === "no",
    title: "One unhurried pause",
    body: "Eight minutes with tea or warm water and no phone. The day may remain full. This minute still belongs to you."
  },
  {
    id: "night-note",
    category: "rest",
    when: (_p, a) => a["night-urine"] === "3+" || a["night-urine"] === "2",
    title: "Evening fluids, without panic",
    body: "Take most of your water earlier in the day. If night waking is new, frequent, or worrying, speak with a clinician — this is not a diagnosis."
  }
];

export function maxForCategory(questions: Question[], id: CategoryId): number {
  return questions.reduce((sum, q) => {
    const peak = Math.max(0, ...q.choices.map((c) => c.scores[id] ?? 0));
    return sum + peak;
  }, 0);
}

export function scoreAnswers(answers: Answers, questions: Question[] = QUESTIONS): CategoryScore[] {
  const raw: Record<CategoryId, number> = {
    rhythm: 0,
    hydration: 0,
    digestion: 0,
    movement: 0,
    rest: 0
  };
  for (const q of questions) {
    const value = answers[q.id];
    const choice = q.choices.find((c) => c.value === value);
    if (!choice) continue;
    for (const [cat, n] of Object.entries(choice.scores) as Array<[CategoryId, number]>) {
      raw[cat] += n;
    }
  }
  return CATEGORIES.map((cat) => {
    const max = maxForCategory(questions, cat.id) || 1;
    const value = raw[cat.id];
    return {
      id: cat.id,
      label: cat.label,
      raw: value,
      max,
      percent: Math.round((value / max) * 100)
    };
  });
}

export function habitsFor(scores: CategoryScore[], answers: Answers): Habit[] {
  const byId = Object.fromEntries(scores.map((s) => [s.id, s.percent])) as Record<CategoryId, number>;
  const picked: Habit[] = [];
  for (const rule of HABITS) {
    if (rule.when(byId[rule.category], answers)) {
      picked.push({
        id: rule.id,
        category: rule.category,
        title: rule.title,
        body: rule.body
      });
    }
    if (picked.length >= 6) break;
  }
  if (picked.length < 4) {
    for (const rule of HABITS) {
      if (picked.some((h) => h.id === rule.id)) continue;
      picked.push({
        id: rule.id,
        category: rule.category,
        title: rule.title,
        body: rule.body
      });
      if (picked.length >= 4) break;
    }
  }
  return picked.slice(0, 6);
}

export function buildResult(input: {
  firstName: string;
  email: string;
  answers: Answers;
  id?: string;
}): RitualResult {
  const scores = scoreAnswers(input.answers);
  return {
    id: input.id ?? `ritual_${Date.now()}`,
    createdAt: new Date().toISOString(),
    firstName: input.firstName.trim(),
    email: input.email.trim().toLowerCase(),
    answers: { ...input.answers },
    scores,
    habits: habitsFor(scores, input.answers)
  };
}
