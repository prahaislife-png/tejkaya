export type CategoryId = "rhythm" | "hydration" | "digestion" | "movement" | "rest";

export interface Choice {
  value: string;
  label: string;
  scores: Partial<Record<CategoryId, number>>;
}

export interface Question {
  id: string;
  area: string;
  prompt: string;
  help?: string;
  choices: Choice[];
}

export const CATEGORIES: Array<{ id: CategoryId; label: string }> = [
  { id: "rhythm", label: "Rhythm" },
  { id: "hydration", label: "Hydration" },
  { id: "digestion", label: "Digestion" },
  { id: "movement", label: "Movement" },
  { id: "rest", label: "Rest" }
];

export const QUESTIONS: Question[] = [
  {
    id: "water-glasses",
    area: "Hydration",
    prompt: "On a typical day, how many glasses of water do you usually drink?",
    help: "A glass here is about 250 ml. Tea and coffee can wait — this is water.",
    choices: [
      { value: "0-2", label: "0–2 glasses", scores: { hydration: 0 } },
      { value: "3-4", label: "3–4 glasses", scores: { hydration: 1 } },
      { value: "5-7", label: "5–7 glasses", scores: { hydration: 2 } },
      { value: "8+", label: "8 or more", scores: { hydration: 3 } }
    ]
  },
  {
    id: "thirst",
    area: "Hydration",
    prompt: "How often do you notice thirst only after you already feel dry or headachy?",
    choices: [
      { value: "often", label: "Often", scores: { hydration: 0 } },
      { value: "sometimes", label: "Sometimes", scores: { hydration: 1 } },
      { value: "rarely", label: "Rarely", scores: { hydration: 2 } },
      { value: "seldom", label: "Almost never — I sip through the day", scores: { hydration: 3 } }
    ]
  },
  {
    id: "after-meals",
    area: "Digestion",
    prompt: "After a usual meal, how does your body feel?",
    choices: [
      { value: "heavy", label: "Heavy, dull, or uncomfortable", scores: { digestion: 0 } },
      { value: "mixed", label: "It depends on the meal", scores: { digestion: 1 } },
      { value: "fine", label: "Mostly comfortable", scores: { digestion: 2 } },
      { value: "light", label: "Light and settled", scores: { digestion: 3 } }
    ]
  },
  {
    id: "fibre",
    area: "Digestion",
    prompt: "How often do vegetables, fruit, dals or whole grains appear on your plate?",
    choices: [
      { value: "rare", label: "Rarely", scores: { digestion: 0 } },
      { value: "few", label: "A few times a week", scores: { digestion: 1 } },
      { value: "daily", label: "Most days", scores: { digestion: 2 } },
      { value: "every", label: "At most meals", scores: { digestion: 3 } }
    ]
  },
  {
    id: "bowel",
    area: "Digestion",
    prompt: "How would you describe the regularity of your bowel habits in a typical week?",
    help: "This is for your own awareness. It is not a medical assessment.",
    choices: [
      { value: "irregular", label: "Quite irregular or often delayed", scores: { digestion: 0, rhythm: 0 } },
      { value: "variable", label: "Variable from day to day", scores: { digestion: 1, rhythm: 1 } },
      { value: "fairly", label: "Fairly regular", scores: { digestion: 2, rhythm: 2 } },
      { value: "steady", label: "Steady and comfortable", scores: { digestion: 3, rhythm: 2 } }
    ]
  },
  {
    id: "meal-timing",
    area: "Meal timing",
    prompt: "Do you eat your main meals at roughly similar hours each day?",
    choices: [
      { value: "chaotic", label: "Hours wander a great deal", scores: { rhythm: 0, digestion: 0 } },
      { value: "loose", label: "A loose pattern", scores: { rhythm: 1, digestion: 1 } },
      { value: "mostly", label: "Mostly similar hours", scores: { rhythm: 2, digestion: 2 } },
      { value: "anchored", label: "Anchored, with room for life", scores: { rhythm: 3, digestion: 2 } }
    ]
  },
  {
    id: "last-meal",
    area: "Meal timing",
    prompt: "How close to sleep is your last substantial meal, typically?",
    choices: [
      { value: "late", label: "Within an hour of lying down", scores: { digestion: 0, rest: 0 } },
      { value: "close", label: "About 1–2 hours before", scores: { digestion: 1, rest: 1 } },
      { value: "gap", label: "About 2–3 hours before", scores: { digestion: 2, rest: 2 } },
      { value: "early", label: "Three hours or more", scores: { digestion: 3, rest: 3 } }
    ]
  },
  {
    id: "routine",
    area: "Daily routine",
    prompt: "Does your day have a recognisable shape — waking, meals, work, wind-down?",
    choices: [
      { value: "none", label: "Very little shape", scores: { rhythm: 0 } },
      { value: "some", label: "Some days yes, some days no", scores: { rhythm: 1 } },
      { value: "mostly", label: "Most days have a shape", scores: { rhythm: 2 } },
      { value: "held", label: "A held rhythm I return to", scores: { rhythm: 3 } }
    ]
  },
  {
    id: "sleep-hours",
    area: "Sleep",
    prompt: "How many hours of sleep do you usually get?",
    choices: [
      { value: "under5", label: "Under 5", scores: { rest: 0 } },
      { value: "5-6", label: "5–6 hours", scores: { rest: 1 } },
      { value: "7-8", label: "7–8 hours", scores: { rest: 2 } },
      { value: "8+", label: "More than 8", scores: { rest: 3 } }
    ]
  },
  {
    id: "sleep-quality",
    area: "Sleep",
    prompt: "How restored do you feel on a typical morning?",
    choices: [
      { value: "wrecked", label: "Unrested", scores: { rest: 0 } },
      { value: "fog", label: "A little foggy", scores: { rest: 1 } },
      { value: "ok", label: "Adequately rested", scores: { rest: 2 } },
      { value: "clear", label: "Clear and ready", scores: { rest: 3 } }
    ]
  },
  {
    id: "movement",
    area: "Movement",
    prompt: "How many minutes do you usually move with intention (walk, yoga, sport) in a day?",
    choices: [
      { value: "0-10", label: "0–10 minutes", scores: { movement: 0 } },
      { value: "11-20", label: "11–20 minutes", scores: { movement: 1 } },
      { value: "21-40", label: "21–40 minutes", scores: { movement: 2 } },
      { value: "40+", label: "40 minutes or more", scores: { movement: 3 } }
    ]
  },
  {
    id: "sitting",
    area: "Movement",
    prompt: "How long do you typically sit without standing or stretching?",
    choices: [
      { value: "long", label: "Three hours or more", scores: { movement: 0 } },
      { value: "mid", label: "About two hours", scores: { movement: 1 } },
      { value: "hour", label: "About an hour", scores: { movement: 2 } },
      { value: "often", label: "I break sitting often", scores: { movement: 3 } }
    ]
  },
  {
    id: "energy",
    area: "Energy",
    prompt: "How is your energy across a usual afternoon?",
    choices: [
      { value: "crash", label: "A sharp slump", scores: { rest: 0, rhythm: 0 } },
      { value: "dip", label: "A noticeable dip", scores: { rest: 1, rhythm: 1 } },
      { value: "steadyish", label: "Mostly steady", scores: { rest: 2, rhythm: 2 } },
      { value: "even", label: "Even enough to finish the day kindly", scores: { rest: 3, rhythm: 2 } }
    ]
  },
  {
    id: "stress",
    area: "Stress",
    prompt: "How often does the day feel tightly wound — jaw, shoulders, hurry?",
    choices: [
      { value: "most", label: "Most days", scores: { rest: 0, rhythm: 0 } },
      { value: "half", label: "Several days a week", scores: { rest: 1, rhythm: 1 } },
      { value: "few", label: "Occasionally", scores: { rest: 2, rhythm: 2 } },
      { value: "rare", label: "Rarely", scores: { rest: 3, rhythm: 3 } }
    ]
  },
  {
    id: "pause",
    area: "Stress",
    prompt: "Do you have even one unhurried pause in the day that belongs only to you?",
    choices: [
      { value: "no", label: "Almost never", scores: { rest: 0, rhythm: 0 } },
      { value: "try", label: "I try, and it slips", scores: { rest: 1, rhythm: 1 } },
      { value: "yes", label: "Most days, a small one", scores: { rest: 2, rhythm: 2 } },
      { value: "held", label: "Yes — I protect it", scores: { rest: 3, rhythm: 3 } }
    ]
  },
  {
    id: "urinary-day",
    area: "General urinary habits",
    prompt: "During waking hours, how would you describe bathroom visits for urine?",
    help: "A general lifestyle question only. Frequency varies with water, tea, and weather. This is not a clinical screen.",
    choices: [
      { value: "unsure", label: "I have not paid attention", scores: { hydration: 1 } },
      { value: "infrequent", label: "Infrequent, even when I drink", scores: { hydration: 1 } },
      { value: "ordinary", label: "An ordinary pattern for me", scores: { hydration: 2 } },
      { value: "often", label: "Quite often — I drink a great deal or notice urgency", scores: { hydration: 1 } }
    ]
  },
  {
    id: "night-urine",
    area: "General urinary habits",
    prompt: "How often do you wake at night specifically to urinate?",
    help: "Night waking has many causes. If it is new, frequent, or distressing, speak with a clinician.",
    choices: [
      { value: "3+", label: "Three or more times", scores: { rest: 0 } },
      { value: "2", label: "About twice", scores: { rest: 1 } },
      { value: "1", label: "Once, sometimes", scores: { rest: 2 } },
      { value: "rare", label: "Rarely or not at all", scores: { rest: 3 } }
    ]
  },
  {
    id: "morning",
    area: "Daily routine",
    prompt: "How does your morning usually begin?",
    choices: [
      { value: "rush", label: "Straight into screens and hurry", scores: { rhythm: 0, rest: 0 } },
      { value: "fog", label: "Slow, unplanned, a little scattered", scores: { rhythm: 1 } },
      { value: "simple", label: "A simple sequence I repeat", scores: { rhythm: 2, rest: 2 } },
      { value: "composed", label: "Composed: water, light, a first gesture", scores: { rhythm: 3, rest: 2 } }
    ]
  }
];
