export type PaymentProviderName = "razorpay" | "none";

export interface CheckoutRequest {
  sku: string;
  amountPaise: number;
  currency: string;
}

/**
 * Payments are not live. This module is the seam for Razorpay later.
 * It must never report a successful charge.
 */
export async function startCheckout(_request: CheckoutRequest): Promise<never> {
  throw new Error(
    "Payments are not open yet. Tej Kaya will not create a fake successful transaction."
  );
}

export function paymentsLive(): boolean {
  return false;
}
