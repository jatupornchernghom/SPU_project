import type { PaymentMethod, PaymentStatus } from "@/types";

export type PaymentRequest = {
  amount: number;
  method: PaymentMethod;
};

export type PaymentResult = {
  status: PaymentStatus;
  transactionId: string;
};

/**
 * Mock payment gateway. Kept behind this single function so a real gateway
 * (Omise, 2C2P, PromptPay, etc.) can be dropped in later without touching
 * any caller — only this file needs to change.
 */
export async function processPayment(request: PaymentRequest): Promise<PaymentResult> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const transactionId = `MOCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  if (request.amount <= 0) {
    return { status: "FAILED", transactionId };
  }

  // Simulate a small failure rate so the UI's failure path is exercised too.
  const succeeded = Math.random() > 0.05;

  return {
    status: succeeded ? "PAID" : "FAILED",
    transactionId,
  };
}
