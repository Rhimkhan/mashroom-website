# 🏺 AKHIL FOODS — Artisanal Mushroom Pickles Store

> **Great Food, Better Life.** Handcrafted Artisanal Oyster Mushroom Pickles made with pure mustard oil, whole stone-ground spices, and zero chemical shortcuts. Prepared in Village Nandsiya, Moth, Jhansi, Uttar Pradesh.

---

## 📋 Table of Contents
- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [Key Features](#-key-features)
- [Getting Started Locally](#-getting-started-locally)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Available Scripts](#-available-scripts)
- [Legal & Business Compliance](#-legal--business-compliance)

---

## 🌟 Overview
**AKHIL FOODS** is a full-stack, direct-to-consumer (D2C) e-commerce web application for artisanal oyster mushroom pickles produced in Bundelkhand, Uttar Pradesh. It features a luxury editorial design, full mobile responsiveness, dual persistence (in-memory/localStorage fallback and production Supabase PostgreSQL), multi-channel payments (Cash on Delivery, UPI QR with deep linking, and Razorpay), and a password-protected administrative back-office.

---

## 🛠 Tech Stack
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with custom luxury theme tokens
- **Animations:** [Framer Motion](https://www.framer.com/motion/) & [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Payments:** Razorpay, direct UPI payment with dynamic QR codes (`qrcode`), and Cash on Delivery
- **Email Notifications:** [Resend](https://resend.com/) transactional email service
- **Hosting & CI/CD:** [Vercel](https://vercel.com/)

---

## 📁 Project Architecture & Directory Structure

```text
├── docs/                      # Architectural, security, and deployment documentation
├── public/                    # Static assets (product images, brand logos, certificates)
├── src/
│   ├── app/                   # Next.js App Router (pages and API endpoints)
│   │   ├── (store)/           # Storefront routes: /, /shop, /cart, /checkout
│   │   ├── account/           # Customer account and authentication
│   │   ├── admin/             # Secure staff administrative portal
│   │   ├── api/               # Serverless API routes (orders, products, admin, webhooks)
│   │   ├── certificates/      # FSSAI, GSTIN, and Udyam certification displays
│   │   ├── contact/           # Customer contact form and location embed
│   │   ├── faq/               # Searchable frequently asked questions
│   │   ├── gallery/           # Visual culinary showcase
│   │   ├── order-success/     # Post-purchase confetti, tracking, and receipts
│   │   ├── our-story/         # Brand heritage narrative
│   │   ├── product/[slug]/    # Dynamic product detail pages
│   │   ├── track-order/       # Real-time order tracking pipeline
│   │   └── wholesale/         # B2B bulk inquiry intake
│   ├── components/            # Reusable UI components (Navbar, Footer, CartDrawer, etc.)
│   └── lib/                   # Utilities, Contexts, Database clients, and Types
├── supabase_schema.sql        # Core database schema
├── supabase_security.sql      # Row Level Security policies
└── supabase_features.sql      # Additional schema enhancements
```

---

## ✨ Key Features
1. **Interactive Storefront (`/shop`):**
   - Multi-angle high-resolution product photography (front, side, ingredients label, back instructions).
   - Dynamic sticky purchase bar for mobile conversions.
   - Comprehensive ingredients listing, nutritional info, and verified community reviews.

2. **Cart & Slide-in Drawer (`/cart`):**
   - Smooth slide-in animations powered by Framer Motion.
   - Persistent basket with `localStorage` fallback.
   - Dynamic Free Shipping Progress Meter (threshold: ₹699).
   - Instant coupon discount validation (e.g. `AKHIL10`, `FREESHIP`).

3. **Multi-Rail Checkout (`/checkout`):**
   - Address validation and instant postal delivery verification for 19,000+ Indian pincodes.
   - Cash on Delivery (COD) with automated validation.
   - Direct UPI QR Code generation with one-click app deep-linking and UTR transaction input.
   - Razorpay integration with cryptographic HMAC verification and webhook handling.

4. **Order Tracking & Post-Purchase:**
   - Real-time pipeline order tracker (`/track-order`) querying by Order ID or phone number.
   - Instant WhatsApp dispatch confirmation button with pre-filled order receipt details.
   - Printable GST-compliant order invoice.

5. **Staff Administrative Portal (`/admin`):**
   - Secure server-side session authentication with timing-safe password verification.
   - Live revenue metrics, order pipeline management (`New` → `Packed` → `Shipped` → `Delivered`), and AWB courier assignment.
   - Customer review moderation and B2B wholesale inquiry management.
   - CSV export for fulfillment logistics.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18.18+ (Node 20 or 22 LTS recommended)
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/Rhimkhan/mashroom-website.git
cd mashroom-website
npm install
```

### 2. Configure Environment
Copy the example environment template:
```bash
cp .env.example .env.local
```
Fill in the configuration parameters in `.env.local` according to the reference below. The application can run in offline mode with in-memory persistence without third-party services.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

The table below lists all supported environment variables. **Never commit real secret keys into version control.**

| Variable Name | Required | Description |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_BRAND_NAME` | Optional | Display name of the store (default: `AKHIL FOODS`). |
| `NEXT_PUBLIC_BRAND_TAGLINE` | Optional | Store motto (default: `Great Food, Better Life`). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Recommended | 12-digit international WhatsApp number for customer support. |
| `NEXT_PUBLIC_APP_URL` | Recommended | Canonical base URL used for metadata, sitemaps, and redirects. |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project API URL (e.g. `https://xyz.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Public anonymous API key for Supabase client queries. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server-only administrative key for privileged database operations. |
| `NEXT_PUBLIC_UPI_ID` | Recommended | UPI Virtual Payment Address (VPA) for receiving direct bank transfers. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Optional | Razorpay public key ID. If absent, checkout defaults to COD & UPI. |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay secret key used to cryptographically verify signatures. |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Secret key for verifying inbound Razorpay webhook events. |
| `RESEND_API_KEY` | Optional | Resend API key for automated transactional order emails. |
| `EMAIL_FROM` | Optional | Sender email header (e.g. `Akhil Foods <orders@akhilfoods.com>`). |
| `RESEND_FROM_EMAIL` | Optional | Fallback sender email address for Resend. |
| `ADMIN_NOTIFICATION_EMAIL` | Optional | Destination email address for new order notification alerts. |
| `ADMIN_PASSWORD` | Recommended | Password string required to access the `/admin` portal. |
| `ADMIN_SESSION_SECRET` | Recommended | Cryptographically random string (32+ chars) to sign admin cookies. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional | Store contact email shown in customer communication. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional | Google Search Console ownership verification token. |
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics 4 Measurement ID (e.g. `G-XXXXXXXXXX`). |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Optional | Official Instagram brand profile link. |
| `NEXT_PUBLIC_FACEBOOK_URL` | Optional | Official Facebook brand page link. |

---

## 🚢 Deployment

### Deploying to Vercel
1. Push your repository to GitHub.
2. Import the project into the [Vercel Dashboard](https://vercel.com).
3. In **Project Settings → Environment Variables**, populate the required production keys from `.env.example`.
4. Click **Deploy**. Detailed instructions are available in [docs/DEPLOY.md](docs/DEPLOY.md).

### Supabase Database Setup
1. Create a project at [supabase.com](https://supabase.com).
2. Execute `supabase_schema.sql`, `supabase_security.sql`, and `supabase_features.sql` in the Supabase SQL Editor.
3. Configure Row Level Security (RLS) policies as documented in [docs/DATABASE.md](docs/DATABASE.md).

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server at `localhost:3000`. |
| `npm run build` | Builds optimized production bundle. |
| `npm run start` | Starts Next.js production server. |
| `npm run lint` | Runs ESLint analysis across the repository. |
| `npm run typecheck` | Executes TypeScript type checking (`tsc --noEmit`). |

---

## 🏛 Legal & Business Compliance

- **Brand:** AKHIL FOODS
- **Tagline:** Great Food, Better Life
- **Registered Kitchen & Facility:** Village Nandsiya, Karguwan Road, Near Ambedkar Murti, Moth, Jhansi, Uttar Pradesh - 284303
- **FSSAI License No.:** 22726293000001
- **GSTIN:** 09FTOPD3011E1ZZ
- **Udyam Registration:** UDYAM-UP-39-0059446
- **Customer Support Phone / WhatsApp:** +91 63864 23865
