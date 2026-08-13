export interface ProgramDay {
  day: number;
  title: string;
  read: string;
  do: string;
  notice: string;
  journalHint?: {
    label: string;
    patch: Record<string, string | number>;
  };
}

export const PROGRAM_DAYS: ProgramDay[] = [
  {
    day: 1,
    title: "Your rhythm",
    read: "Ayurveda, in the household sense, is less a doctrine than a clock. Days that begin and end at roughly recognisable hours tend to feel less jagged. You are not being asked to become severe. You are being asked to notice the shape you already live inside.",
    do: "Write tomorrow’s wake hour and kitchen-closed hour on paper. Keep them within thirty minutes, even if the rest of the day wanders.",
    notice: "Where did the day feel shapeless? Where did it already have a pulse?"
  },
  {
    day: 2,
    title: "Morning",
    read: "A composed morning is rarely elaborate. Water, light, and a first gesture before the inbox. Classical household advice often begins the day with warmth and quiet — not because dawn is magical, but because the first hour trains the rest.",
    do: "Drink a glass of water before tea or coffee. Open a window or step outside for two full minutes.",
    notice: "What did you reach for first today — water, a kettle, or a screen?"
  },
  {
    day: 3,
    title: "Hydration",
    read: "Thirst is a late messenger. Many of us drink in lumps — a litre at 4 p.m. — and call it care. Spreading water through the hours you are awake is ordinary wisdom. It is not a medical protocol and it is not a contest.",
    do: "Place a bottle where you actually sit. Finish it once by mid-afternoon, then refill.",
    notice: "When did you first think of water today?",
    journalHint: { label: "Log today’s glasses in Private", patch: { hydration: 4 } }
  },
  {
    day: 4,
    title: "Appetite",
    read: "Appetite is information: interest, not a moral score. Skipping until you are ravenous, then eating in a hurry, is a common modern pattern. A regular lunch does more for composure than a heroic fast you will not keep.",
    do: "Sit for lunch, even if it is twenty minutes. Put the phone face down for the first five.",
    notice: "Did you eat because the clock said so, because you were empty, or because the plate appeared?"
  },
  {
    day: 5,
    title: "Movement",
    read: "The body is not a project. It is a thing that stiffens when it is forgotten. Household Ayurveda has always liked walking — after meals, at dusk, without costume. Fifteen honest minutes outweigh an unused gym membership.",
    do: "Walk for fifteen minutes at a conversational pace. No headphones if you can bear it.",
    notice: "Where did the walk feel like errand, and where did it feel like air?",
    journalHint: { label: "Log today’s minutes in Private", patch: { movement: 15 } }
  },
  {
    day: 6,
    title: "Digestion",
    read: "Comfort after eating is a better teacher than any slogan. Heavy, rushed, very late, or very cold meals are simply harder work for some people. You are gathering your own pattern — not naming a disease.",
    do: "After your main meal, walk slowly for ten minutes indoors or in a courtyard.",
    notice: "How did the hour after eating feel: heavy, ordinary, or light?",
    journalHint: { label: "Note digestion comfort in Private", patch: { stoolComfort: 3 } }
  },
  {
    day: 7,
    title: "First week",
    read: "A week is long enough to see friction and short enough to forgive it. Consistency here means returning, not performing. If three of the seven days held a little water, a walk, a regular meal — that is already a house being built.",
    do: "Look back at Days 1–6. Circle one practice that felt possible. Drop one that felt like theatre.",
    notice: "Which practice are you willing to keep if nobody is watching?"
  },
  {
    day: 8,
    title: "Fibre",
    read: "Vegetables, dals, fruit, and husks such as isabgol are old kitchen facts. Increasing fibre suddenly can be uncomfortable; increasing it with water and patience is usually kinder. This is dietary common sense, not a treatment plan.",
    do: "Add one katori of cooked vegetables or a fruit to a meal you already eat.",
    notice: "What plant food is already easy in your kitchen?",
    journalHint: { label: "Log fibre in Private", patch: { fibre: "some" } }
  },
  {
    day: 9,
    title: "Sitting less",
    read: "Chairs are a modern invention we have taken personally. Breaking a long sit is not a workout. It is circulation, breath, and a reminder that you have legs. The hour-change is a decent bell.",
    do: "For the next four hours of work, stand or stretch each time the clock meets a new hour.",
    notice: "Which hour was hardest to interrupt?"
  },
  {
    day: 10,
    title: "Meal timing",
    read: "The same meal at wildly different hours is a different experience. Many households still eat the last plate well before late television. You do not need a perfect Ayurvedic clock. You need a last sitting that leaves sleep some room.",
    do: "Bring tonight’s last substantial meal forward by twenty minutes.",
    notice: "What usually delays the last plate — work, other people, or habit?"
  },
  {
    day: 11,
    title: "Mindful eating",
    read: "Attention is a seasoning. Screens borrow it. You are not required to chew in silence like a retreat. You are invited to taste the first three bites as if you paid for them, because you did.",
    do: "Eat the first five minutes of one meal without a screen.",
    notice: "What flavour appeared when you were actually present?"
  },
  {
    day: 12,
    title: "Energy",
    read: "Afternoon slumps have ordinary causes: a heavy lunch, little water, no daylight, poor sleep, too much sitting. Treat energy as weather you can dress for, not as a character flaw.",
    do: "Step into daylight for five minutes between 2 and 4 p.m., even at a doorway.",
    notice: "Did the slump arrive on schedule? What had you eaten and how long had you sat?"
  },
  {
    day: 13,
    title: "Stress",
    read: "Tight jaws and hurried shoulders are not a diagnosis. They are a day asking for a smaller room. Eight minutes that cannot be stolen — tea, breath, a balcony — will not empty the inbox. They will keep you from becoming only the inbox.",
    do: "Take an eight-minute pause with warm water or tea. Phone in another room.",
    notice: "What sensation left first when you stopped: the jaw, the chest, or the list?"
  },
  {
    day: 14,
    title: "Reset",
    read: "Midpoint. A reset is not a new personality. It is washing a cup, making the bed, drinking water, and choosing the next right hour. Household Ayurveda is full of such unglamorous repairs.",
    do: "Tidy one surface you see every morning. Fill a glass and leave it there for tomorrow.",
    notice: "Which mess was actually a postponed decision?"
  },
  {
    day: 15,
    title: "Evening",
    read: "Evenings either close the house or keep every lamp blazing. Dimming is a ritual older than electricity. You may still have work. You can still lower the lights you do not need.",
    do: "An hour before you intend to sleep, switch the brightest overhead light off. Use a lamp.",
    notice: "What usually keeps the house too bright — habit, other people, or fear of stopping?"
  },
  {
    day: 16,
    title: "Sleep",
    read: "Sleep is not a productivity hack. It is the night doing its work. Screens, late meals, and worry all bargain with it. If you cannot sleep, lying quietly in a dark room still counts as rest. Persistent insomnia belongs with a clinician.",
    do: "Leave the brightest phone charger outside the bedroom tonight.",
    notice: "How did the room feel without a lit rectangle?"
  },
  {
    day: 17,
    title: "Consistency",
    read: "The romantic version of discipline is daily perfection. The usable version is a short list you return to after you forget. Tej Kaya would rather you keep three gestures for a year than twelve for a week.",
    do: "Write three gestures you have actually kept in these seventeen days. Put the paper where you make tea.",
    notice: "Which of the three would still make sense on a travelling day?"
  },
  {
    day: 18,
    title: "Understanding Ayurveda",
    read: "In ordinary Indian homes, Ayurveda has often meant season, food, sleep, and not insulting the digestion — not a stack of uncited studies. Dinacharya is a Sanskrit word for daily conduct: waking, elimination, washing, meals, work, rest. Tej Kaya uses it as a household idea, not as a licence to diagnose. We will not invent quotations or clinical trials here. If you want classical texts, sit with a qualified teacher or physician. If you want a life, keep the clock kind.",
    do: "Explain, in one spoken sentence to yourself, what ‘daily conduct’ means in your own kitchen.",
    notice: "Which part of the day already looks like care, even if you never named it Ayurveda?"
  },
  {
    day: 19,
    title: "Personal ritual",
    read: "A personal ritual is a sequence you could keep if the house were quiet and nobody praised you. Morning water. A walk. A last plate that is not midnight. A dimmer hour. Choose from what you have lived these weeks, not from a prettier list.",
    do: "Draft two columns: Morning / Evening. Write one line in each that you are willing to keep for thirty days.",
    notice: "Which line did you write to impress an imaginary audience? Strike it."
  },
  {
    day: 20,
    title: "What to keep",
    read: "Editing is the luxury move. Keep what was light to carry. Release what required a speech. The physical vessels of Tej Kaya — when they arrive — will sit beside this clock. They are not a substitute for it.",
    do: "Choose no more than five habits from your weeks here. Say them aloud.",
    notice: "If you kept only one, which one would still change the feeling of the house?"
  },
  {
    day: 21,
    title: "Your Tej Kaya Ritual",
    read: "This is not a graduation. It is a threshold. You will compose a morning and an evening you can return to — then live them without an app watching. Save the page. Print it if paper helps. If the body has been trying to tell you something urgent these twenty-one days, take that message to a person who is qualified to hear it.",
    do: "Compose your ritual on the following page. Choose the habits you will actually keep.",
    notice: "What will you do tomorrow morning before you open a screen?"
  }
];

export const CONTINUING_HABITS = [
  { id: "water-first", label: "Water before tea" },
  { id: "meal-hours", label: "Named meal hours" },
  { id: "walk", label: "A daily walk" },
  { id: "plants", label: "A plant food at lunch" },
  { id: "stand", label: "Break long sitting" },
  { id: "kitchen", label: "Earlier last plate" },
  { id: "pause", label: "An unhurried pause" },
  { id: "dim", label: "A dimmer last hour" },
  { id: "phone-out", label: "Phone charged outside the bedroom" }
];
