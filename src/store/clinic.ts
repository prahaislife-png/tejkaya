import { uid } from "../lib/crypto";
import { idbGet, idbGetAll, idbGetAllByIndex, idbPut } from "./idb";
import type { ConsultSku, VisitMode } from "../clinic/config";

export type BookingStatus = "requested" | "confirmed" | "completed" | "cancelled";
export type PayStatus = "unpaid" | "upi-sent" | "paid-at-clinic" | "paid";

export interface Booking {
  id: string;
  createdAt: string;
  userId?: string;
  firstName: string;
  email: string;
  phone: string;
  skuId: string;
  packId?: string;
  mode: VisitMode;
  reason: string;
  notes: string;
  dateIso: string;
  time: string;
  startIso: string;
  endIso: string;
  status: BookingStatus;
  payStatus: PayStatus;
  priceInr: number;
}

export interface ConsultPack {
  id: string;
  createdAt: string;
  userId?: string;
  email: string;
  skuId: string;
  title: string;
  visitsTotal: number;
  visitsUsed: number;
  priceInr: number;
  payStatus: PayStatus;
}

export interface Prescription {
  bookingId: string;
  updatedAt: string;
  findings: string;
  plan: string;
  medicines: string;
  followUp: string;
}

export async function saveBooking(row: Booking): Promise<void> {
  await idbPut("bookings", row);
}

export async function allBookings(): Promise<Booking[]> {
  const rows = await idbGetAll<Booking>("bookings");
  return rows.sort((a, b) => a.startIso.localeCompare(b.startIso));
}

export async function bookingsForUser(userId: string): Promise<Booking[]> {
  const rows = await idbGetAllByIndex<Booking>("bookings", "userId", userId);
  return rows.sort((a, b) => b.startIso.localeCompare(a.startIso));
}

export async function savePack(row: ConsultPack): Promise<void> {
  await idbPut("packs", row);
}

export async function getPack(id: string): Promise<ConsultPack | undefined> {
  return idbGet<ConsultPack>("packs", id);
}

export async function savePrescription(row: Prescription): Promise<void> {
  await idbPut("prescriptions", row);
}

export async function getPrescription(bookingId: string): Promise<Prescription | undefined> {
  return idbGet<Prescription>("prescriptions", bookingId);
}

export function takenKeys(bookings: Booking[]): Set<string> {
  return new Set(
    bookings
      .filter((b) => b.status !== "cancelled")
      .map((b) => `${b.dateIso}|${b.time}|${b.mode}`)
  );
}

export function createPackFromSku(
  sku: ConsultSku,
  input: { email: string; userId?: string }
): ConsultPack {
  return {
    id: uid("pack"),
    createdAt: new Date().toISOString(),
    userId: input.userId,
    email: input.email,
    skuId: sku.id,
    title: sku.title,
    visitsTotal: sku.visits,
    visitsUsed: 0,
    priceInr: sku.priceInr,
    payStatus: "unpaid"
  };
}
