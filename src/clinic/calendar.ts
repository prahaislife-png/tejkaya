import { CLINIC, type VisitMode } from "./config";

export interface Slot {
  start: Date;
  end: Date;
  label: string;
  dateIso: string;
  time: string;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function atHours(day: Date, h: number, m: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m, 0, 0);
}

/** Mon–Sat, 10:00–20:00 IST-style local clock, 30-minute visits, last start 19:30. */
export function slotsForDay(day: Date, _mode: VisitMode): Slot[] {
  if (day.getDay() === 0) return [];
  const out: Slot[] = [];
  for (let h = 10; h <= 19; h++) {
    for (const m of [0, 30]) {
      if (h === 19 && m === 30) continue;
      const start = atHours(day, h, m);
      if (start.getTime() <= Date.now() + 30 * 60 * 1000) continue;
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      out.push({
        start,
        end,
        dateIso: `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`,
        time: `${pad(h)}:${pad(m)}`,
        label: `${pad(h)}:${pad(m)}–${pad(end.getHours())}:${pad(end.getMinutes())}`
      });
    }
  }
  return out;
}

export function upcomingDays(count = 14): Date[] {
  const days: Date[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 21 && days.length < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d.getDay() !== 0) days.push(d);
  }
  return days;
}

export function googleCalendarUrl(input: {
  title: string;
  details: string;
  location: string;
  start: Date;
  end: Date;
}): string {
  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${fmt(input.start)}/${fmt(input.end)}`,
    details: input.details,
    location: input.location,
    ctz: CLINIC.timezone
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function icsEvent(input: {
  title: string;
  details: string;
  location: string;
  start: Date;
  end: Date;
}): string {
  const stamp = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const uid = `${stamp(input.start)}@tejkaya.com`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tej Kaya//Shree Urocare//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART;TZID=${CLINIC.timezone}:${stamp(input.start)}`,
    `DTEND;TZID=${CLINIC.timezone}:${stamp(input.end)}`,
    `SUMMARY:${input.title.replace(/\n/g, " ")}`,
    `DESCRIPTION:${input.details.replace(/\n/g, "\\n")}`,
    `LOCATION:${input.location.replace(/\n/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
    ""
  ].join("\r\n");
}

export function whatsappHref(text: string): string {
  return `https://wa.me/${CLINIC.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function upiHref(amountInr: number, note: string): string {
  const q = new URLSearchParams({
    pa: CLINIC.upiId,
    pn: CLINIC.name,
    am: String(amountInr),
    cu: "INR",
    tn: note.slice(0, 50)
  });
  return `upi://pay?${q.toString()}`;
}
