import { Order } from "./types";
import { BRAND } from "./brand";

export interface EmailResult {
  success: boolean;
  messageId?: string;
  recipient?: string;
  subject?: string;
  error?: string;
}

/**
 * Low-level Resend email dispatcher.
 * If RESEND_API_KEY is missing, skips silently and logs a warning.
 * Never throws an error so caller execution is never blocked.
 */
export async function sendEmailWithResend(
  to: string,
  subject: string,
  html: string
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey.includes("your_resend_api_key")) {
    console.warn("RESEND_API_KEY is missing, skipping email dispatch.");
    return { success: false, error: "missing_api_key" };
  }

  try {
    const fromEmail =
      process.env.EMAIL_FROM ||
      process.env.RESEND_FROM_EMAIL ||
      "Akhil Foods <onboarding@resend.dev>";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`[EMAIL DISPATCHED] "${subject}" to ${to} (id: ${data.id})`);
      return { success: true, messageId: data.id, recipient: to, subject };
    } else {
      console.warn(`[RESEND API ERROR] ${response.status}:`, data);
      return { success: false, error: JSON.stringify(data) };
    }
  } catch (err) {
    console.warn("Resend email dispatch exception:", err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Dispatches emails when an order is placed:
 * 1. Admin notification email to ADMIN_NOTIFICATION_EMAIL.
 * 2. Customer confirmation email (if valid customer email provided).
 */
export async function sendOrderNotificationEmail(order: Order): Promise<EmailResult> {
  const adminEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    "abhishekkumarnandsiya@gmail.com";

  const adminSubject = `[NEW ORDER #${order.orderNumber}] - Rs ${order.total} from ${order.customerName} (${order.paymentMethod.includes("Cash") ? "COD" : "Online"})`;

  const itemsListHtml = order.items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #E8DEC8; font-size: 13px;">
      <td style="padding: 10px 12px; font-weight: 500;">${item.name}</td>
      <td style="padding: 10px 12px; color: #211612; font-weight: bold;">${item.size}</td>
      <td style="padding: 10px 12px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px 12px; text-align: right; font-weight: bold;">Rs ${item.price * item.quantity}</td>
    </tr>
  `
    )
    .join("");

  // Admin Notification Template
  const adminHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Order Received</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF6EE; margin: 0; padding: 24px; color: #211612;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FDFBF7; border-radius: 6px; overflow: hidden; border: 1px solid #E8DEC8;">
    <div style="background-color: #1C130E; padding: 24px; text-align: center; color: #C89B3C;">
      <h1 style="margin: 0; font-size: 24px; font-family: Georgia, serif; color: #C89B3C;">${BRAND.name}</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; color: #FAF6EE;">Store Admin Notification</p>
    </div>
    <div style="background-color: #2A1D17; padding: 12px 24px; text-align: center; font-size: 13px; font-weight: bold; color: #C89B3C;">
      New order placed. Please pack and prepare for dispatch.
    </div>
    <div style="padding: 24px;">
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td style="font-size: 13px; color: #736b63;">Order Reference:</td><td style="font-size: 14px; font-weight: bold; text-align: right; font-family: monospace;">#${order.orderNumber}</td></tr>
        <tr><td style="font-size: 13px; color: #736b63;">Placed At:</td><td style="font-size: 13px; text-align: right;">${new Date(order.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td></tr>
        <tr><td style="font-size: 13px; color: #736b63;">Payment:</td><td style="font-size: 13px; font-weight: bold; text-align: right;">${order.paymentMethod} (${order.paymentStatus})</td></tr>
      </table>
      <div style="background-color: #FAF6EE; padding: 16px; border-radius: 6px; border: 1px solid #E8DEC8; margin-bottom: 20px;">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase;">Customer & Delivery</h3>
        <p style="margin: 0; font-size: 13px; line-height: 1.6;">
          <strong>Name:</strong> ${order.customerName}<br>
          <strong>Phone:</strong> ${order.phone}<br>
          <strong>Email:</strong> ${order.email}<br>
          <strong>Address:</strong> ${order.address} ${order.landmark ? `(Near ${order.landmark})` : ""}<br>
          <strong>Location:</strong> ${order.city}, ${order.state} - ${order.pincode}
        </p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #FAF6EE; text-align: left; font-size: 11px; text-transform: uppercase;">
            <th style="padding: 8px 12px;">Item</th><th>Size</th><th style="text-align: center;">Qty</th><th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsListHtml}</tbody>
      </table>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr><td style="padding: 4px 0; color: #736b63;">Subtotal:</td><td style="padding: 4px 0; text-align: right;">Rs ${order.subtotal}</td></tr>
        <tr><td style="padding: 4px 0; color: #736b63;">Shipping:</td><td style="padding: 4px 0; text-align: right;">${order.shipping === 0 ? "FREE" : `Rs ${order.shipping}`}</td></tr>
        <tr style="border-top: 2px solid #211612; font-weight: bold;"><td style="padding: 10px 0; font-size: 16px;">Total:</td><td style="padding: 10px 0; font-size: 16px; text-align: right;">Rs ${order.total}</td></tr>
      </table>
    </div>
  </div>
</body>
</html>
  `;

  // Dispatch admin notification
  const adminResult = await sendEmailWithResend(adminEmail, adminSubject, adminHtml);

  // If customer email provided, dispatch customer confirmation
  if (order.email && !order.email.includes("@akhilfoods.customer") && order.email.includes("@")) {
    const customerSubject = `Order Confirmation #${order.orderNumber} - ${BRAND.name}`;
    const customerHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF6EE; margin: 0; padding: 24px; color: #211612;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FDFBF7; border-radius: 6px; overflow: hidden; border: 1px solid #E8DEC8;">
    <div style="background-color: #1C130E; padding: 24px; text-align: center; color: #C89B3C;">
      <h1 style="margin: 0; font-size: 24px; font-family: Georgia, serif; color: #C89B3C;">${BRAND.name}</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; color: #FAF6EE;">Jhansi, Uttar Pradesh</p>
    </div>
    <div style="padding: 24px;">
      <h2 style="font-size: 18px; margin: 0 0 12px 0;">Thank you for your order, ${order.customerName}!</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #3D2C24; margin: 0 0 20px 0;">
        We have received your order <strong>#${order.orderNumber}</strong>. We will prepare your pickle fresh in our Jhansi kitchen and dispatch it directly to your address.
      </p>
      <div style="background-color: #FAF6EE; padding: 16px; border-radius: 6px; border: 1px solid #E8DEC8; margin-bottom: 20px;">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase;">Shipping Address</h3>
        <p style="margin: 0; font-size: 13px; line-height: 1.6;">
          ${order.customerName}<br>
          ${order.address} ${order.landmark ? `(Near ${order.landmark})` : ""}<br>
          ${order.city}, ${order.state} - ${order.pincode}<br>
          Phone: ${order.phone}
        </p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #FAF6EE; text-align: left; font-size: 11px; text-transform: uppercase;">
            <th style="padding: 8px 12px;">Item</th><th>Size</th><th style="text-align: center;">Qty</th><th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsListHtml}</tbody>
      </table>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr><td style="padding: 4px 0; color: #736b63;">Total Paid / Payable:</td><td style="padding: 4px 0; font-size: 16px; font-weight: bold; text-align: right;">Rs ${order.total}</td></tr>
        <tr><td style="padding: 4px 0; color: #736b63;">Payment Method:</td><td style="padding: 4px 0; text-align: right;">${order.paymentMethod}</td></tr>
      </table>
      <div style="margin-top: 24px; text-align: center;">
        <a href="${BRAND.url}/track-order" style="display: inline-block; background-color: #211612; color: #FAF6EE; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px;">
          Track Your Order
        </a>
      </div>
    </div>
  </div>
</body>
</html>
    `;
    await sendEmailWithResend(order.email, customerSubject, customerHtml);
  }

  return adminResult;
}

/**
 * Dispatches an order status update email to the customer when status changes to Packed, Shipped or Delivered.
 */
export async function sendOrderStatusEmail(
  order: Order,
  newStatus: "Packed" | "Shipped" | "Delivered",
  trackingNumber?: string,
  courierName?: string
): Promise<EmailResult> {
  if (!order.email || order.email.includes("@akhilfoods.customer") || !order.email.includes("@")) {
    return { success: false, error: "no_valid_customer_email" };
  }

  const subject = `Order #${order.orderNumber} Status Update: ${newStatus} - ${BRAND.name}`;

  let statusMessage = "";
  if (newStatus === "Packed") {
    statusMessage = "Your order has been carefully inspected and packed in our Jhansi kitchen, ready for courier pickup.";
  } else if (newStatus === "Shipped") {
    statusMessage = `Your order has been dispatched via ${courierName || "courier"}.`;
  } else if (newStatus === "Delivered") {
    statusMessage = "Your order has been marked as delivered. We hope you enjoy the authentic flavor!";
  }

  const trackingInfo = trackingNumber
    ? `
    <div style="background-color: #FAF6EE; padding: 16px; border-radius: 6px; border: 1px solid #E8DEC8; margin: 20px 0;">
      <h3 style="margin: 0 0 6px 0; font-size: 13px; text-transform: uppercase;">Consignment Tracking Details</h3>
      <p style="margin: 0; font-size: 13px; line-height: 1.6;">
        <strong>Courier Partner:</strong> ${courierName || "Standard Courier"}<br>
        <strong>Tracking Number:</strong> <span style="font-family: monospace; font-weight: bold;">${trackingNumber}</span>
      </p>
    </div>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Status Update</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF6EE; margin: 0; padding: 24px; color: #211612;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FDFBF7; border-radius: 6px; overflow: hidden; border: 1px solid #E8DEC8;">
    <div style="background-color: #1C130E; padding: 24px; text-align: center; color: #C89B3C;">
      <h1 style="margin: 0; font-size: 24px; font-family: Georgia, serif; color: #C89B3C;">${BRAND.name}</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; color: #FAF6EE;">Order Status: ${newStatus}</p>
    </div>
    <div style="padding: 24px;">
      <h2 style="font-size: 18px; margin: 0 0 12px 0;">Hello ${order.customerName},</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #3D2C24; margin: 0 0 16px 0;">
        ${statusMessage}
      </p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
        <tr><td style="color: #736b63; padding: 4px 0;">Order Reference:</td><td style="font-weight: bold; text-align: right; font-family: monospace;">#${order.orderNumber}</td></tr>
        <tr><td style="color: #736b63; padding: 4px 0;">Current Status:</td><td style="font-weight: bold; text-align: right; color: #1B5E20;">${newStatus}</td></tr>
      </table>
      ${trackingInfo}
      <div style="margin-top: 24px; text-align: center;">
        <a href="${BRAND.url}/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(order.phone)}" style="display: inline-block; background-color: #211612; color: #FAF6EE; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px;">
          Track Status Online
        </a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmailWithResend(order.email, subject, html);
}
