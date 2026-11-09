// Centralized store contact and WhatsApp configuration
export const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "916386423865"
).replace(/\D/g, "");

export const PHONE_RAW = `+${WHATSAPP_NUMBER}`;
export const PHONE_DISPLAY =
  WHATSAPP_NUMBER.length === 12 && WHATSAPP_NUMBER.startsWith("91")
    ? `+91 ${WHATSAPP_NUMBER.slice(2, 7)} ${WHATSAPP_NUMBER.slice(7)}`
    : `+${WHATSAPP_NUMBER}`;
export const TEL_LINK = `tel:+${WHATSAPP_NUMBER}`;
export const WHATSAPP_DEFAULT_MESSAGE = "Hi, I want to order mushroom pickle";
export const WHATSAPP_ORDER_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`;

/**
 * Formats a customer phone number into international format with 91 country code (removes spaces, +, leading zeroes).
 * - 10 digits: prepends 91 -> 91XXXXXXXXXX
 * - 12 digits starting with 91: returns as-is
 * - Other lengths: extracts last 10 digits and prepends 91
 */
export function formatCustomerWhatsAppNumber(phone: string | undefined | null): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length > 10) return `91${digits.slice(-10)}`;
  return `91${digits}`;
}

/**
 * Builds a direct customer WhatsApp URL (wa.me/91XXXXXXXXXX?text=...)
 */
export function getCustomerWhatsAppUrl(phone: string | undefined | null, text?: string): string {
  const formatted = formatCustomerWhatsAppNumber(phone);
  const base = `https://wa.me/${formatted}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/**
 * Builds the official business WhatsApp URL (wa.me/916386423865?text=...)
 */
export function getBusinessWhatsAppUrl(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

// Government & Food Safety Registrations
export const FSSAI_NUMBER = "22726293000001";
export const FSSAI_VALIDITY = "31-12-2026";
export const FSSAI_DISPLAY = `FSSAI Reg. No. ${FSSAI_NUMBER}`;
export const GST_NUMBER = "09FTOPD3011E1ZZ";
export const UDYAM_NUMBER = "UDYAM-UP-39-0059446";
