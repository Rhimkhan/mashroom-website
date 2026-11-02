# 🛡️ AKHIL FOODS — Security Architecture & Guidelines

This document outlines the defensive engineering practices, security headers, cryptographic safeguards, and authentication mechanisms implemented across the **AKHIL FOODS** platform.

> **Notice:** This document contains technical architectural descriptions only. It contains no real API keys, credentials, or private secrets.

---

## 📑 Security Architecture Summary

```text
┌────────────────────────────────────────────────────────┐
│                   Customer / Attacker                   │
└───────────────────────────┬────────────────────────────┘
                            │
              1. HTTP Strict Headers & CSP
                            ▼
┌────────────────────────────────────────────────────────┐
│           Next.js Edge / Reverse Proxy (Vercel)         │
│  - HSTS (max-age: 2 years, includeSubDomains, preload)  │
│  - X-Frame-Options: DENY (Anti-Clickjacking)           │
│  - X-Content-Type-Options: nosniff                      │
│  - Content-Security-Policy (Restricted Origins)        │
└───────────────────────────┬────────────────────────────┘
                            │
              2. Rate Limiting & Input Cleansing
                            ▼
┌────────────────────────────────────────────────────────┐
│                   API Route Handlers                    │
│  - Per-IP sliding window rate limiting (Map cache)      │
│  - escapeAndTrim() XSS sanitization                    │
│  - Timing-safe admin authentication (crypto.timingSafe) │
│  - Cryptographic Razorpay HMAC signature verification   │
└───────────────────────────┬────────────────────────────┘
                            │
              3. Isolated Server Secrets & RLS
                            ▼
┌────────────────────────────────────────────────────────┐
│           Supabase PostgreSQL Database Layer           │
│  - Strict Row Level Security (RLS) on all tables        │
│  - Anon key restricted to public read & order insert    │
│  - Service role key isolated to server environment only │
└────────────────────────────────────────────────────────┘
```

---

## 1. HTTP Security Headers

Configured centrally in `next.config.ts`, every HTTP response emitted by the application enforces strict headers:

- **Strict-Transport-Security (HSTS):** `max-age=63072000; includeSubDomains; preload` enforces HTTPS across all subdomains for 2 years.
- **X-Frame-Options:** `DENY` prohibits rendering inside iframes, completely neutralizing clickjacking vectors.
- **X-Content-Type-Options:** `nosniff` prevents MIME-type sniffing by user agents.
- **Referrer-Policy:** `strict-origin-when-cross-origin` protects sensitive URL paths from leaking across external origins.
- **Permissions-Policy:** Explicitly revokes unneeded browser capabilities (`camera=(), microphone=(), geolocation=()`).
- **Content-Security-Policy (CSP):**
  - Scripts restricted to `'self'`, `'unsafe-inline'`, `'unsafe-eval'`, and `https://checkout.razorpay.com`.
  - Styles restricted to `'self'`, `'unsafe-inline'`, and Google Fonts.
  - Image sources restricted to `'self'`, `data:`, `blob:`, authorized Supabase storage CDNs, and Razorpay asset domains.
  - Media & Frames restricted strictly to necessary payment gateway origins (`https://api.razorpay.com`, `https://checkout.razorpay.com`).
  - `object-src 'none'`, `base-uri 'self'`, and `form-action 'self'`.

---

## 2. Authentication & Admin Security

Access to the staff administrative portal (`/admin`) is fortified with multi-layered controls:

1. **Timing-Safe Comparison:** Password checks in `src/lib/admin-auth.ts` use `crypto.timingSafeEqual` with fixed-length buffer hashing to prevent timing attacks.
2. **HMAC-Signed Session Tokens:** Sessions are cryptographically signed using an HMAC-SHA256 signature generated with `ADMIN_SESSION_SECRET`.
3. **HTTP-Only, Secure Cookies:** The `admin_session` cookie is configured with:
   - `httpOnly: true` (inaccessible via JavaScript / XSS).
   - `secure: true` in production (transmitted only over TLS).
   - `sameSite: "lax"` (mitigates CSRF vulnerabilities).
   - Ephemeral session lifetime with automatic expiry.

---

## 3. Defense Against Injection & XSS

1. **HTML & Script Sanitization:** All text inputs received across order placement, reviews, wholesale inquiries, and contact forms pass through `escapeAndTrim()` in `src/lib/rate-limit.ts`. Special characters (`<`, `>`, `&`, `"`, `'`) are converted into their respective HTML entities before processing.
2. **Parameterized Database Operations:** All database interactions via the Supabase client utilize parameterized queries, eliminating SQL injection vectors.
3. **No Dynamic Code Evaluation:** The application does not execute arbitrary code via `eval()` or unvetted templating engines.

---

## 4. Rate Limiting & DoS Protection

To safeguard API endpoints from abuse, credential stuffing, and spam, sliding-window rate limiters are enforced on key routes:

- **Admin Login:** Throttled to prevent brute-force attacks.
- **Reviews Submission:** Throttled to prevent review spam.
- **Wholesale Inquiries & Contact Forms:** Throttled per IP address.
- **Health Check & Tracking:** Bounded to prevent infrastructure degradation.

---

## 5. Payment Security & Cryptographic Verification

- **Razorpay Order Verification:** When an online payment completes, the signature is cryptographically recalculated on the server using `crypto.createHmac("sha256", secret)` and validated before fulfilling the order.
- **Webhook Authenticity:** Inbound webhooks from payment processors verify signatures against `RAZORPAY_WEBHOOK_SECRET` before updating order status.
- **No Card Data Storage:** AKHIL FOODS never collects, processes, or stores raw payment card numbers, CVVs, or bank credentials. All transactions are handled by PCI-DSS Level 1 certified gateways.

---

## 6. Secret Isolation & Zero-Leakage Policy

- Client-side code accesses only `NEXT_PUBLIC_*` prefixed variables.
- All high-privilege keys (`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `RESEND_API_KEY`) remain strictly encapsulated on the server runtime.
- The health check endpoint (`/api/health`) verifies database connectivity without leaking configuration states or stack traces.

---

## 7. Reporting a Security Vulnerability

If you identify a security issue or vulnerability in AKHIL FOODS, please report it responsibly:
- **Email:** `contact@akhilfoods.com` or `admin@akhilfoods.com`
- **WhatsApp:** +91 63864 23865

Please provide detailed reproduction steps. We appreciate responsible disclosure and aim to acknowledge all security reports within 24 hours.
