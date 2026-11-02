# 🚀 AKHIL FOODS — Production Deployment Guide

This guide covers complete end-to-end instructions for deploying **AKHIL FOODS** to production on **Vercel** with a **Supabase PostgreSQL** database.

---

## 📑 Table of Contents
1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Database Setup on Supabase](#2-database-setup-on-supabase)
3. [Deploying to Vercel](#3-deploying-to-vercel)
4. [Custom Domain & DNS Setup](#4-custom-domain--dns-setup)
5. [Configuring External Services](#5-configuring-external-services)
6. [Post-Deployment Verification](#6-post-deployment-verification)
7. [Troubleshooting Common Issues](#7-troubleshooting-common-issues)

---

## 1. Pre-Deployment Checklist

Before deploying, ensure you have:
- A GitHub repository with your latest code on `main`.
- An account on [Vercel](https://vercel.com).
- An account on [Supabase](https://supabase.com).
- (Optional) A verified account on [Resend](https://resend.com) for automated order receipts.
- (Optional) A verified merchant account on [Razorpay](https://dashboard.razorpay.com) for online card/netbanking payments.

---

## 2. Database Setup on Supabase

AKHIL FOODS includes a dual persistence layer: while the app runs out-of-the-box with in-memory / local storage fallbacks, production requires a robust PostgreSQL database.

### Step 2.1: Create a Supabase Project
1. Log in to [supabase.com/dashboard](https://supabase.com/dashboard).
2. Click **New Project**.
3. Choose a name (e.g. `akhil-foods-production`) and select the region closest to your customers (e.g., `South Asia (Mumbai) - ap-south-1`).
4. Set a strong database password and click **Create new project**.

### Step 2.2: Execute SQL Migrations
1. In your project dashboard, navigate to the **SQL Editor** tab (left sidebar).
2. Open `supabase_schema.sql` from this repository, paste its contents into the editor, and click **Run**.
3. Open `supabase_security.sql`, paste its contents, and click **Run** (this sets up Row Level Security policies).
4. (Optional) Open `supabase_features.sql`, paste its contents, and click **Run** (adds analytics and wholesale support).

### Step 2.3: Retrieve API Credentials
1. In Supabase, go to **Project Settings → API**.
2. Note the following values:
   - **Project URL:** `https://<project-ref>.supabase.co`
   - **anon / public key:** `sb_publishable_...` or JWT token
   - **service_role key:** `sb_secret_...` (Keep strictly confidential!)

---

## 3. Deploying to Vercel

### Step 3.1: Import GitHub Repository
1. Log in to [vercel.com](https://vercel.com) and click **Add New... → Project**.
2. Select your `mashroom-website` GitHub repository and click **Import**.

### Step 3.2: Configure Build Settings
- **Framework Preset:** Next.js
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Step 3.3: Set Environment Variables
In the **Environment Variables** section of the Vercel import screen, configure:

```ini
# Brand & URLs
NEXT_PUBLIC_BRAND_NAME="AKHIL FOODS"
NEXT_PUBLIC_BRAND_TAGLINE="Great Food, Better Life"
NEXT_PUBLIC_WHATSAPP_NUMBER="916386423865"
NEXT_PUBLIC_APP_URL="https://akhil-mushroom-pickle.vercel.app"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-supabase-anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<your-supabase-service-role-key>"

# Direct UPI Payment
NEXT_PUBLIC_UPI_ID="abhishekkumarnandsiya@okaxis"

# Admin Authentication
ADMIN_PASSWORD="<choose-a-strong-secret-password>"
ADMIN_SESSION_SECRET="<generate-random-32-char-string>"

# Optional: Resend Emails
RESEND_API_KEY="<your-resend-api-key>"
EMAIL_FROM="Akhil Foods <orders@akhilfoods.com>"
ADMIN_NOTIFICATION_EMAIL="admin@akhilfoods.com"

# Optional: Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID="<your-razorpay-key-id>"
RAZORPAY_KEY_SECRET="<your-razorpay-key-secret>"
RAZORPAY_WEBHOOK_SECRET="<your-razorpay-webhook-secret>"
```

### Step 3.4: Deploy
Click **Deploy**. Vercel will build and launch your site.

---

## 4. Custom Domain & DNS Setup

To link your custom domain (e.g. `akhilfoods.com`):
1. In Vercel, go to **Project Settings → Domains**.
2. Enter your domain name and click **Add**.
3. Configure your domain registrar's DNS records as shown in Vercel:
   - **Type A:** `@` → `76.76.21.21`
   - **Type CNAME:** `www` → `cname.vercel-dns.com`
4. Once verified, update `NEXT_PUBLIC_APP_URL` in Vercel Environment Variables to your custom domain and redeploy.

---

## 5. Configuring External Services

### Razorpay Webhooks (If using Razorpay)
1. Go to **Razorpay Dashboard → Settings → Webhooks → Add New Webhook**.
2. **Webhook URL:** `https://yourdomain.com/api/razorpay/webhook`
3. **Secret:** Match the value set in `RAZORPAY_WEBHOOK_SECRET`.
4. **Active Events:**
   - `order.paid`
   - `payment.captured`
   - `payment.failed`

### Resend Domain Verification (If using Resend)
1. In [Resend Dashboard](https://resend.com/domains), click **Add Domain**.
2. Add the DKIM, SPF, and MX verification records to your DNS provider.
3. Once verified, order confirmation emails will deliver directly to customer inboxes.

---

## 6. Post-Deployment Verification

Perform these health checks once the deployment is marked **Ready**:

1. **API Health Check:**
   Visit `https://yourdomain.com/api/health`. Expected response:
   ```json
   { "ok": true }
   ```
2. **Staff Portal Access:**
   Visit `https://yourdomain.com/admin` and log in with your configured `ADMIN_PASSWORD`.
3. **Test Checkout Flow:**
   - Add a 400g jar to the cart.
   - Navigate to `/checkout`, enter test delivery details, and place a Cash on Delivery or UPI order.
   - Confirm receipt generation and WhatsApp click-to-dispatch link on `/order-success`.
   - Verify the order appears inside `/admin`.

---

## 7. Troubleshooting Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **"A more recent deployment has been created"** | Trying to redeploy an old superseded commit. | Go to Deployments list, click on the newest deployment at the top, and redeploy that one. |
| **Database queries failing / 503 on health check** | SQL migrations haven't run or wrong credentials. | Re-run `supabase_schema.sql` in the Supabase SQL Editor and ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly. |
| **Admin login fails** | `ADMIN_PASSWORD` or `ADMIN_SESSION_SECRET` missing in Vercel. | Set both variables in Vercel Settings and redeploy. |
| **Emails not delivering** | Resend API key missing or unverified domain. | Check `RESEND_API_KEY` in Vercel settings and verify the sender domain in Resend. |
