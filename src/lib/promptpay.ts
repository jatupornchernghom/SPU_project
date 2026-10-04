/**
 * Thai QR Payment (PromptPay) payload generator — EMV QR Code for Payment
 * Systems, Thailand's PromptPay profile. Pure string/CRC math, no network
 * calls: the resulting payload is rendered as a QR code client-side (see
 * `PromptPayQr`). Scanning it with any Thai banking app shows the configured
 * recipient and the exact order amount.
 *
 * This only generates the payload — it does not confirm payment. Confirming
 * an order still goes through `payment.service.ts`'s mock flow, same as
 * before. Swap that service for a real gateway (with a webhook) once one is
 * wired up, without touching this file.
 */

function tlv(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

// CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) — the checksum algorithm
// mandated by the EMV QR Code specification for the trailing tag "63".
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i += 1) {
    crc ^= data.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export class PromptPayError extends Error {}

/**
 * Normalizes a PromptPay target into its EMV sub-tag + value.
 * Accepts a mobile number (e.g. "081-234-5678"), a 13-digit national/tax ID,
 * or a 15-digit e-Wallet ID.
 */
function normalizeTarget(rawId: string): { tag: "01" | "02" | "03"; value: string } {
  const digits = rawId.replace(/[^0-9]/g, "");

  if (/^0[0-9]{9}$/.test(digits)) {
    // Mobile number -> country-code-prefixed 13-digit form: 0066XXXXXXXXX
    return { tag: "01", value: `0066${digits.slice(1)}` };
  }
  if (/^[0-9]{13}$/.test(digits)) {
    return { tag: "02", value: digits };
  }
  if (/^[0-9]{15}$/.test(digits)) {
    return { tag: "03", value: digits };
  }

  throw new PromptPayError(
    "PromptPay ID ต้องเป็นเบอร์โทร 10 หลัก, เลขบัตรประชาชน 13 หลัก, หรือ e-Wallet ID 15 หลัก"
  );
}

/** True if `rawId` is a syntactically valid PromptPay target (phone/national ID/e-Wallet). */
export function isValidPromptPayId(rawId: string): boolean {
  try {
    normalizeTarget(rawId);
    return true;
  } catch {
    return false;
  }
}

/** Formats a PromptPay ID for display, e.g. "0812345678" -> "081-234-5678". */
export function formatPromptPayId(rawId: string): string {
  const digits = rawId.replace(/[^0-9]/g, "");
  if (/^0[0-9]{9}$/.test(digits)) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

/**
 * Builds the PromptPay EMV QR payload string for a fixed amount.
 * @param promptPayId mobile number, national/tax ID, or e-Wallet ID
 * @param amount order total in THB, rounded to 2 decimal places
 */
export function buildPromptPayPayload(promptPayId: string, amount: number): string {
  if (!(amount > 0)) {
    throw new PromptPayError("จำนวนเงินต้องมากกว่า 0");
  }

  const target = normalizeTarget(promptPayId);
  const merchantAccountInfo = tlv("00", "A000000677010111") + tlv(target.tag, target.value);

  const body =
    tlv("00", "01") + // Payload Format Indicator
    tlv("01", "12") + // Point of Initiation Method: 12 = dynamic (has amount)
    tlv("29", merchantAccountInfo) + // Merchant Account Information — PromptPay
    tlv("53", "764") + // Transaction Currency: 764 = THB
    tlv("54", amount.toFixed(2)) + // Transaction Amount
    tlv("58", "TH"); // Country Code

  const withCrcTag = `${body}6304`;
  return `${body}${tlv("63", crc16(withCrcTag))}`;
}
