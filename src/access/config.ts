export type DigitalProductKey = "ritualFinder" | "privateJournal" | "days21";

export type Entitlements = Record<DigitalProductKey, boolean>;

export const defaultEntitlements: Entitlements = {
  ritualFinder: true,
  privateJournal: true,
  days21: true
};

/** Flip enabled to true when Razorpay (or another provider) is wired. */
export const accessConfig = {
  requireAccountFor: ["privateJournal", "days21"] as DigitalProductKey[],
  paymentsEnabled: false,
  provider: "razorpay" as const,
  currency: "INR",
  products: {
    ritualFinder: { sku: "tej-ritual-finder", amountPaise: 0, entitledByDefault: true },
    privateJournal: { sku: "tej-private", amountPaise: 0, entitledByDefault: true },
    days21: { sku: "tej-21-days", amountPaise: 0, entitledByDefault: true }
  }
};

export function canUse(product: DigitalProductKey, entitlements: Entitlements): boolean {
  if (!accessConfig.paymentsEnabled) return entitlements[product] !== false;
  return Boolean(entitlements[product]);
}
