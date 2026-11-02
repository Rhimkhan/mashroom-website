# 📋 Changelog

All notable changes to the **AKHIL FOODS** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Developer documentation suite (`docs/DEPLOY.md`, `docs/SECURITY.md`, `docs/DATABASE.md`).
- Explicit comments for every variable in `.env.example`.
- Comprehensive project overview and architecture reference in `README.md`.

---

## [0.2.0] - 2026-10-30

### Added
- Direct UPI payment integration with dynamic QR codes, one-tap mobile app deep-linking, and UTR transaction logging.
- Real-time order tracking pipeline at `/track-order` searchable by Order ID or phone number.
- Automated customer and administrator email dispatch notifications via Resend API.
- Customer review moderation system and B2B wholesale inquiry management in the `/admin` portal.
- Full compliance and legal policy suite: `/privacy-policy`, `/terms`, `/shipping-policy`, `/refund-policy`, and `/certificates`.
- Interactive Google Maps location embed for Village Nandsiya, Moth, Jhansi on `/contact`.
- Dynamic XML sitemap generation (`/sitemap.xml`) and `robots.txt` configuration.
- Server health check API endpoint at `/api/health`.

### Changed
- Refactored storefront design with luxury warm cream, deep espresso, and gold theme tokens.
- Hardened Content-Security-Policy (CSP) and HTTP security headers in `next.config.ts`.
- Enforced strict Supabase Row Level Security (RLS) policies on orders, reviews, and contact messages.

### Fixed
- Fixed unclosed `robots` metadata configuration bracket in `src/app/layout.tsx` that previously failed Turbopack builds.
- Fixed telephone and contact number formatting across navbar, footer, and checkout trust badges.
- Enhanced input sanitization on public API endpoints with `escapeAndTrim()` to prevent HTML entity injection.

---

## [0.1.0] - 2026-10-18

### Added
- Initial project scaffolding with Next.js App Router, TypeScript, and Tailwind CSS.
- Signature product catalog featuring *Mushroom Mela Oyster Mushroom Pickle* (400g jar).
- Multi-angle high-resolution product photography gallery.
- Persistent shopping cart with Framer Motion slide-in drawer and coupon code system.
- Multi-rail checkout supporting Cash on Delivery (COD) and Razorpay online gateway.
- Indian postal code checker validating delivery coverage across 19,000+ pincodes.
- Password-authenticated staff administrative portal at `/admin` with live sales metrics and order fulfillment updates.
- Dual storage architecture supporting offline in-memory operation alongside Supabase PostgreSQL persistence.
