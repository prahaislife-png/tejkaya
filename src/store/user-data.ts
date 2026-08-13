import { uid } from "../lib/crypto";
import { idbGet, idbGetAllByIndex, idbPut } from "./idb";
import type { RitualResult } from "../ritual-finder/scoring";
import { emptyEntry, type JournalEntry } from "../journal/fields";

export interface SavedRitual extends RitualResult {
  userId: string;
}

export interface DayLog {
  completedAt: string;
  notice?: string;
}

export interface ProgramState {
  userId: string;
  startedAt: string;
  days: Record<string, DayLog>;
  updatedAt: string;
}

export interface PersonalRitual {
  id: string;
  userId: string;
  createdAt: string;
  habitIds: string[];
  morning: string;
  evening: string;
  notes: string;
}

export async function saveRitual(userId: string, result: RitualResult): Promise<SavedRitual> {
  const row: SavedRitual = { ...result, userId, id: result.id || uid("ritual") };
  await idbPut("rituals", row);
  return row;
}

export async function latestRitual(userId: string): Promise<SavedRitual | undefined> {
  const rows = await idbGetAllByIndex<SavedRitual>("rituals", "userId", userId);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export async function saveJournal(entry: JournalEntry): Promise<JournalEntry> {
  const row = { ...entry, updatedAt: new Date().toISOString() };
  await idbPut("journal", row);
  return row;
}

export async function getJournal(userId: string, date: string): Promise<JournalEntry> {
  const rows = await idbGetAllByIndex<JournalEntry>("journal", "userId", userId);
  return rows.find((r) => r.date === date) ?? emptyEntry(userId, date);
}

export async function allJournal(userId: string): Promise<JournalEntry[]> {
  const rows = await idbGetAllByIndex<JournalEntry>("journal", "userId", userId);
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getProgram(userId: string): Promise<ProgramState> {
  const row = await idbGet<ProgramState>("program", userId);
  return (
    row ?? {
      userId,
      startedAt: new Date().toISOString(),
      days: {},
      updatedAt: new Date().toISOString()
    }
  );
}

export async function saveProgram(state: ProgramState): Promise<void> {
  await idbPut("program", { ...state, updatedAt: new Date().toISOString() });
}

export async function savePersonalRitual(ritual: PersonalRitual): Promise<void> {
  await idbPut("personalRituals", ritual);
}

export async function latestPersonalRitual(userId: string): Promise<PersonalRitual | undefined> {
  const rows = await idbGetAllByIndex<PersonalRitual>("personalRituals", "userId", userId);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export function mergeJournal(
  current: JournalEntry,
  patch: Partial<JournalEntry> & { source?: string }
): JournalEntry {
  return { ...current, ...patch, id: current.id, userId: current.userId, date: current.date };
}
