# 🗄️ AKHIL FOODS — Database Architecture & Schema Reference

This document details the PostgreSQL database schema hosted on **Supabase** for the **AKHIL FOODS** platform, including table definitions, column types, default values, indexes, and Row Level Security (RLS) policies.

---

## 📑 Database Overview

AKHIL FOODS utilizes PostgreSQL on Supabase with a secure access model:
- **Public / Anonymous Role (`anon`):** Can read published products and approved customer reviews. Cannot read customer orders or customer phone numbers.
- **Server Runtime (`service_role`):** Used exclusively by serverless Next.js API route handlers to create orders, verify payments, moderate reviews, and fetch administrative analytics.

---

## 🏗️ Table Schemas

### 1. `public.products`
Stores product catalog information, inventory levels, sizes, and presentation media.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Unique product identifier (e.g. `prod-mushroom-mela`). |
| `name` | `TEXT` | `NOT NULL` | Product commercial display name. |
| `slug` | `TEXT` | `UNIQUE NOT NULL` | URL-friendly unique slug for routing. |
| `subtitle` | `TEXT` | | Editorial short subtitle. |
| `flavour` | `TEXT` | `NOT NULL` | Primary flavor classification (e.g. `Oyster Mushroom`). |
| `description` | `TEXT` | | Detailed product narrative description. |
| `ingredients` | `TEXT[]` | `DEFAULT '{}'` | Array of culinary ingredients. |
| `shelf_life` | `TEXT` | | Storage advice and expiry guidelines. |
| `image_url` | `TEXT` | `NOT NULL` | Primary product photography asset URL. |
| `image` | `TEXT` | | Fallback image path. |
| `sizes` | `JSONB` | `NOT NULL` | Array of packaging options `[{ size, price, originalPrice, inStock }]`. |
| `stock` | `INT` | `DEFAULT 50` | Total units available for purchase. |
| `stock_count` | `INT` | `DEFAULT 50` | Operational stock counter for real-time inventory tracking. |
| `rating` | `NUMERIC(2,1)`| `DEFAULT 0.0` | Aggregated customer satisfaction score (0.0 - 5.0). |
| `reviews_count`| `INT` | `DEFAULT 0` | Total count of verified approved reviews. |
| `gallery` | `TEXT[]` | `DEFAULT '{}'` | Array of high-resolution showcase image URLs. |
| `spice_level` | `TEXT` | `DEFAULT 'Medium'` | Flavor heat level (`Mild`, `Medium`, `Spicy`). |
| `is_featured` | `BOOLEAN` | `DEFAULT true` | Flag indicating storefront hero placement. |
| `badges` | `TEXT[]` | `DEFAULT '{}'` | Visual badge chips (e.g. `['Oyster Mushroom', 'FSSAI Registered']`). |
| `created_at` | `TIMESTAMPTZ`| `DEFAULT now()` | Timestamp of record insertion. |

---

### 2. `public.orders`
Stores customer purchase orders, shipping destinations, financial totals, and fulfillment tracking.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Internal order record ID (e.g. `ord-1001` or UUID). |
| `order_number` | `TEXT` | `UNIQUE NOT NULL` | Customer-facing reference code (e.g. `AF-8921`). |
| `customer_name`| `TEXT` | `NOT NULL` | Recipient full name. |
| `email` | `TEXT` | `NOT NULL` | Customer email address for order notifications. |
| `phone` | `TEXT` | `NOT NULL` | 10-digit Indian contact phone number. |
| `address` | `TEXT` | `NOT NULL` | Street address, building number, and locality. |
| `landmark` | `TEXT` | | Nearby geographic reference. |
| `city` | `TEXT` | `NOT NULL` | Destination city. |
| `state` | `TEXT` | `NOT NULL` | Destination Indian State or Union Territory. |
| `pincode` | `TEXT` | `NOT NULL` | 6-digit postal code. |
| `items` | `JSONB` | `NOT NULL` | JSON array of purchased items `[{ productId, name, size, price, quantity, image }]`. |
| `subtotal` | `NUMERIC` | `NOT NULL` | Line-item sum before shipping and promotional deductions. |
| `shipping` | `NUMERIC` | `NOT NULL` | Shipping charge applied to the order. |
| `discount` | `NUMERIC` | `DEFAULT 0` | Total monetary savings from applied coupons. |
| `coupon_code` | `TEXT` | | Promo code used (e.g. `AKHIL10`). |
| `total` | `NUMERIC` | `NOT NULL` | Final amount payable. |
| `payment_method`| `TEXT` | `NOT NULL` | `Cash on Delivery`, `UPI Direct Transfer`, or `Razorpay Online`. |
| `payment_status`| `TEXT` | `DEFAULT 'Pending'`| `Pending`, `Paid`, or `Failed`. |
| `order_status` | `TEXT` | `DEFAULT 'New'` | Current fulfillment stage (`New`, `Packed`, `Shipped`, `Delivered`, `Cancelled`). |
| `tracking_number`| `TEXT` | | Courier AWB tracking number. |
| `courier_name` | `TEXT` | | Logistics courier partner (e.g. `BlueDart`, `Delhivery`). |
| `notes` | `TEXT` | | Special delivery instructions from customer. |
| `created_at` | `TIMESTAMPTZ`| `DEFAULT now()` | Order timestamp. |

---

### 3. `public.reviews`
Stores customer ratings and feedback submitted after delivery.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Unique review ID. |
| `product_id` | `TEXT` | `NOT NULL` | Foreign identifier referencing `public.products(id)`. |
| `order_number` | `TEXT` | `NOT NULL` | Associated purchase order number. |
| `customer_name`| `TEXT` | `NOT NULL` | Reviewer display name. |
| `phone` | `TEXT` | `NOT NULL` | Phone number used for verification. |
| `rating` | `INT` | `CHECK (1-5)` | Star rating awarded. |
| `comment` | `TEXT` | `NOT NULL` | Sanitized feedback comment. |
| `photo_url` | `TEXT` | | Optional image uploaded by customer. |
| `status` | `TEXT` | `DEFAULT 'pending'` | Moderation state (`pending`, `approved`, `rejected`). |
| `created_at` | `TIMESTAMPTZ`| `DEFAULT now()` | Submission timestamp. |

---

### 4. `public.wholesale_inquiries`
Stores B2B commercial requests for bulk pickle distribution.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Unique inquiry identifier. |
| `business_name`| `TEXT` | `NOT NULL` | Registered firm or distributor name. |
| `contact_name` | `TEXT` | `NOT NULL` | Primary representative full name. |
| `phone` | `TEXT` | `NOT NULL` | Commercial phone number. |
| `email` | `TEXT` | | Commercial email address. |
| `city` | `TEXT` | `NOT NULL` | Distribution city. |
| `state` | `TEXT` | `NOT NULL` | Distribution state. |
| `quantity` | `TEXT` | `NOT NULL` | Estimated volume demand (e.g. `50-100 Jars`, `500+ Jars`). |
| `notes` | `TEXT` | | Specific commercial inquiry details. |
| `status` | `TEXT` | `DEFAULT 'New'` | Staff follow-up status (`New`, `Contacted`, `Closed`). |
| `created_at` | `TIMESTAMPTZ`| `DEFAULT now()` | Submission timestamp. |

---

### 5. `public.contact_messages`
Stores customer inquiries submitted via `/contact`.

| Column | Type | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Unique message identifier. |
| `name` | `TEXT` | `NOT NULL` | Sender name. |
| `phone` | `TEXT` | `NOT NULL` | Contact number. |
| `email` | `TEXT` | | Contact email address. |
| `subject` | `TEXT` | | Inquiry subject line. |
| `message` | `TEXT` | `NOT NULL` | Message body. |
| `created_at` | `TIMESTAMPTZ`| `DEFAULT now()` | Submission timestamp. |

---

## 🔒 Row Level Security (RLS) Policies

Row Level Security is enabled on **all tables** to prevent unauthorized data access:

```sql
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
```

### Access Matrix

| Table | Anon / Public Read | Anon / Public Write | Service Role (Server) |
| :--- | :---: | :---: | :---: |
| `products` | ✅ Allowed (`SELECT true`) | ❌ Revoked | ✅ Full Access |
| `orders` | ❌ Denied | ❌ Denied | ✅ Full Access (via API) |
| `reviews` | ✅ Only `status = 'approved'` | ❌ Denied | ✅ Full Access |
| `wholesale_inquiries` | ❌ Denied | ❌ Denied | ✅ Full Access (via API) |
| `contact_messages` | ❌ Denied | ❌ Denied | ✅ Full Access (via API) |

---

## 🚀 Migration Execution Order

When initializing a new Supabase database, execute the SQL files in this exact sequence:

1. **`supabase_schema.sql`**: Creates `products` and `orders` tables, seeds the initial product catalog.
2. **`supabase_security.sql`**: Creates `contact_messages` table, enables strict RLS policies, and revokes anonymous write permissions.
3. **`supabase_features.sql`**: Creates `reviews` and `wholesale_inquiries` tables, adds indexes, and enforces review moderation policies.
