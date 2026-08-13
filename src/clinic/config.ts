export const CLINIC = {
  name: "Shree Urocare",
  doctor: "Dr Rajeshree Amilkanthwar Bompilwar",
  credentials: "BAMS (Ayurveda) · MS (General Surgery)",
  role: "Consultant proctologist, urologist & Ayurvedic physician",
  hindi: "मूत्रविकार, गुदविकार, मुळव्याध, भगंदर तज्ञ",
  city: "Chinchwad Gaon, Pune",
  address:
    "Saykar Sadan, Bhoi Ali, Chapekar Chowk Flyover, near New English School, Chinchwad Gaon, Pune, Maharashtra 411033",
  hours: "Mon–Sat, 11:00–20:00",
  hoursNote: "Sunday closed",
  phoneDisplay: "+91 87883 29648",
  whatsapp: "918788329648",
  email: "drrajeshree@shreeurocare.in",
  site: "https://www.shreeurocare.in/",
  instagram: "https://www.instagram.com/shree_urocare",
  linkedin: "https://www.linkedin.com/in/dr-rajeshree-amilkanthwar-19b0303a5",
  maps: "https://share.google/U5MafLz8r2G5PAH0A",
  /** Replace with the clinic UPI ID before taking live payments. */
  upiId: "shreeurocare@upi",
  /** Change this PIN before handing the desk to the clinic. */
  deskPin: "urocare",
  timezone: "Asia/Kolkata"
};

export type VisitMode = "clinic" | "video";

export interface ConsultSku {
  id: string;
  mode: VisitMode;
  visits: number;
  priceInr: number;
  title: string;
  blurb: string;
  instagramNote: string;
}

export const CONSULT_SKUS: ConsultSku[] = [
  {
    id: "clinic-1",
    mode: "clinic",
    visits: 1,
    priceInr: 700,
    title: "In-clinic visit",
    blurb: "See Dr Rajeshree at Shree Urocare, Chinchwad. 30 minutes.",
    instagramNote: "Local Pune. Best for examination and procedures."
  },
  {
    id: "video-1",
    mode: "video",
    visits: 1,
    priceInr: 1200,
    title: "Video consult",
    blurb: "India-wide video appointment. 30 minutes with the doctor.",
    instagramNote: "Higher ticket. Easier to sell on Instagram outside Pune."
  },
  {
    id: "video-3",
    mode: "video",
    visits: 3,
    priceInr: 3000,
    title: "Video follow-up pack (3 visits)",
    blurb: "Three video visits with Dr Rajeshree — first consult plus two follow-ups. Use for ongoing piles, prostate, or urinary care as a doctor visit, not as a product claim.",
    instagramNote: "₹3,000 vs ₹3,600 if booked one by one."
  }
];

export const VISIT_REASONS = [
  { id: "piles", label: "Piles / fissure / fistula / pilonidal sinus" },
  { id: "urinary", label: "UTI / urinary habits / burning / frequency" },
  { id: "kidney", label: "Kidney care" },
  { id: "prostate", label: "Prostate / male health" },
  { id: "female", label: "Female wellness / PCOS / ovarian cysts" },
  { id: "fertility", label: "Fertility / garbhasanskar / ANC / post-delivery" },
  { id: "suvarna", label: "Suvarnaprashan sanskar (children)" },
  { id: "agnikarma", label: "Agnikarma — mole / चामखीर" },
  { id: "general", label: "General Ayurvedic consult" },
  { id: "other", label: "Something else (tell us in notes)" }
] as const;

/** Services listed on shreeurocare.in — shown as clinic offerings, not Tej Kaya product claims. */
export const CLINIC_SERVICES: Array<{ group: string; items: string[] }> = [
  {
    group: "Anorectal",
    items: ["Piles", "Fissure", "Fistula", "Pilonidal sinus"]
  },
  {
    group: "Urinary & kidney",
    items: ["UTI care", "Kidney care", "Uttarbasti"]
  },
  {
    group: "Male health",
    items: ["Prostate", "Male wellness", "Fertility"]
  },
  {
    group: "Women & children",
    items: [
      "Female wellness",
      "PCOS / ovarian cysts",
      "Garbhasanskar",
      "ANC / post-delivery care",
      "Suvarnaprashan sanskar"
    ]
  },
  {
    group: "Clinic procedures",
    items: ["Agnikarma (mole / चामखीर)", "Kansya thali foot massage"]
  }
];

export function formatInr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function skuById(id: string): ConsultSku | undefined {
  return CONSULT_SKUS.find((s) => s.id === id);
}

export const CLINIC_MEDICAL_NOTE =
  "This is a booking with Dr Rajeshree at Shree Urocare. Tej Kaya does not diagnose, prescribe, or treat disease. Only the doctor may examine, advise, and write a plan or prescription in her name.";
