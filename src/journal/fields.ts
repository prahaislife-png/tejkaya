export const JOURNAL_FIELDS = [
  {
    id: "hydration",
    label: "Hydration",
    kind: "number" as const,
    min: 0,
    max: 16,
    unit: "glasses",
    help: "About 250 ml per glass."
  },
  {
    id: "fibre",
    label: "Fibre intake",
    kind: "select" as const,
    options: [
      { value: "", label: "Not noted" },
      { value: "none", label: "Little or none" },
      { value: "some", label: "Some" },
      { value: "plenty", label: "A plentiful plate" }
    ]
  },
  {
    id: "bowel",
    label: "Bowel regularity",
    kind: "select" as const,
    options: [
      { value: "", label: "Not noted" },
      { value: "none", label: "None today" },
      { value: "once", label: "Once" },
      { value: "twice", label: "Twice" },
      { value: "more", label: "More than twice" }
    ]
  },
  {
    id: "stoolComfort",
    label: "Stool comfort",
    kind: "range" as const,
    min: 0,
    max: 5,
    help: "0 = not noted, 1 = difficult, 5 = easy. Your words, not a clinic score."
  },
  {
    id: "straining",
    label: "Straining",
    kind: "select" as const,
    options: [
      { value: "", label: "Not noted" },
      { value: "no", label: "No" },
      { value: "some", label: "Some" },
      { value: "yes", label: "Yes" }
    ]
  },
  {
    id: "discomfort",
    label: "Discomfort",
    kind: "range" as const,
    min: 0,
    max: 10,
    help: "0 = none noted, 10 = severe. This is your private scale."
  },
  {
    id: "urinaryFrequency",
    label: "Urinary frequency (day)",
    kind: "select" as const,
    options: [
      { value: "", label: "Not noted" },
      { value: "less", label: "Less than usual for me" },
      { value: "usual", label: "Usual for me" },
      { value: "more", label: "More than usual for me" }
    ]
  },
  {
    id: "nightUrine",
    label: "Nighttime urination",
    kind: "select" as const,
    options: [
      { value: "", label: "Not noted" },
      { value: "0", label: "None" },
      { value: "1", label: "Once" },
      { value: "2", label: "Twice" },
      { value: "3plus", label: "Three or more" }
    ]
  },
  {
    id: "movement",
    label: "Movement",
    kind: "number" as const,
    min: 0,
    max: 300,
    unit: "minutes"
  },
  {
    id: "notes",
    label: "Private notes",
    kind: "text" as const,
    help: "Only you can see this on this device, in your Tej Kaya account."
  }
] as const;

export type FieldId = (typeof JOURNAL_FIELDS)[number]["id"];

export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  hydration: number | null;
  fibre: string;
  bowel: string;
  stoolComfort: number | null;
  straining: string;
  discomfort: number | null;
  urinaryFrequency: string;
  nightUrine: string;
  movement: number | null;
  notes: string;
  updatedAt: string;
  source?: string;
}

export function emptyEntry(userId: string, date: string): JournalEntry {
  return {
    id: `${userId}_${date}`,
    userId,
    date,
    hydration: null,
    fibre: "",
    bowel: "",
    stoolComfort: null,
    straining: "",
    discomfort: null,
    urinaryFrequency: "",
    nightUrine: "",
    movement: null,
    notes: "",
    updatedAt: new Date().toISOString()
  };
}
