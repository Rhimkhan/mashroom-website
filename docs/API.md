# 🔌 AKHIL FOODS — API Reference & Endpoints

This document describes the internal RESTful API endpoints available in **AKHIL FOODS**, including request payloads, query parameters, expected responses, status codes, and rate limit thresholds.

---

## 📑 Endpoints Overview

| Method | Endpoint | Description | Rate Limit |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System and database health diagnostic | 60 req / min |
| `GET` | `/api/products` | Retrieve active product catalog | 120 req / min |
| `POST`| `/api/orders` | Place a customer purchase order | 20 req / 10 min |
| `POST`| `/api/orders/track` | Track consignment by order ID & phone | 30 req / 5 min |
| `GET` | `/api/reviews` | Fetch approved product reviews | 120 req / min |
| `POST`| `/api/reviews` | Submit new customer product review | 5 req / hour |
| `POST`| `/api/wholesale` | Submit B2B wholesale distribution inquiry | 10 req / hour |
| `POST`| `/api/contact` | Submit general customer support message | 10 req / hour |
| `POST`| `/api/admin/login` | Staff back-office authentication | 5 attempts / 15 min |
| `POST`| `/api/admin/logout`| Terminate staff session cookie | Unrestricted |
| `GET` | `/api/admin/me` | Verify staff authentication status | 60 req / min |
| `POST`| `/api/razorpay/create-order` | Generate Razorpay order ID | 30 req / 10 min |
| `POST`| `/api/razorpay/verify-payment` | Verify HMAC payment signature | 20 req / 10 min |
| `POST`| `/api/razorpay/webhook` | Inbound payment event webhook | Unrestricted (HMAC verified) |

---

## 1. System Health

### `GET /api/health`
Performs an infrastructure and database ping. Verifies Supabase responsiveness if credentials are configured.

**Response `200 OK`:**
```json
{
  "ok": true
}
```

**Response `503 Service Unavailable`:**
```json
{
  "ok": false
}
```

---

## 2. Storefront Catalog

### `GET /api/products`
Returns all active product entries with pricing options, stock levels, and review metrics.

**Response `200 OK`:**
```json
{
  "products": [
    {
      "id": "prod-mushroom-mela",
      "name": "Mushroom Mela Oyster Mushroom Pickle",
      "slug": "mushroom-mela-oyster-mushroom-pickle",
      "flavour": "Oyster Mushroom",
      "sizes": [
        { "size": "400g", "price": 399, "originalPrice": 399, "inStock": true }
      ],
      "stockCount": 100,
      "rating": 5.0,
      "reviewsCount": 1
    }
  ]
}
```

---

## 3. Orders & Tracking

### `POST /api/orders`
Creates a purchase order (Cash on Delivery or UPI).

**Request Body:**
```json
{
  "customerName": "Rohan Malhotra",
  "email": "rohan@example.com",
  "phone": "9810123456",
  "address": "B-42, Gulmohar Enclave",
  "landmark": "Near Central Park",
  "city": "New Delhi",
  "state": "Delhi",
  "pincode": "110049",
  "items": [
    {
      "productId": "prod-mushroom-mela",
      "name": "Mushroom Mela Oyster Mushroom Pickle",
      "size": "400g",
      "price": 399,
      "quantity": 1,
      "image": "/images/products/mushroom-mela-front.jpg"
    }
  ],
  "subtotal": 399,
  "shipping": 60,
  "discount": 0,
  "total": 459,
  "paymentMethod": "Cash on Delivery",
  "paymentStatus": "Pending",
  "utr": ""
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "order": {
    "id": "ord-7192",
    "orderNumber": "AF-9821",
    "total": 459,
    "orderStatus": "New"
  }
}
```

---

### `POST /api/orders/track`
Queries order pipeline status using the customer order reference and telephone number.

**Request Body:**
```json
{
  "orderNumber": "AF-9821",
  "phone": "9810123456"
}
```

**Response `200 OK`:**
```json
{
  "order": {
    "orderNumber": "AF-9821",
    "orderStatus": "Shipped",
    "trackingNumber": "BD982736451IN",
    "courierName": "BlueDart Express",
    "total": 459,
    "createdAt": "2026-10-30T10:00:00.000Z",
    "items": [
      { "name": "Mushroom Mela Oyster Mushroom Pickle", "size": "400g", "quantity": 1 }
    ]
  }
}
```

---

## 4. Customer Reviews

### `GET /api/reviews?productId=prod-mushroom-mela`
Retrieves public approved reviews for a given product.

**Response `200 OK`:**
```json
{
  "reviews": [
    {
      "id": "rev-101",
      "customerName": "Ananya S.",
      "rating": 5,
      "comment": "Authentic taste of mustard oil and oyster mushrooms!",
      "createdAt": "2026-10-25T14:20:00.000Z"
    }
  ]
}
```

### `POST /api/reviews`
Submits a customer review for moderation. Requires a valid prior order number and matching phone number.

**Request Body:**
```json
{
  "productId": "prod-mushroom-mela",
  "orderNumber": "AF-9821",
  "customerName": "Ananya S.",
  "phone": "9988776655",
  "rating": 5,
  "comment": "Very tasty and fresh!"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Review submitted successfully and is pending verification."
}
```

---

## 5. Wholesale & Inquiries

### `POST /api/wholesale`
Accepts B2B bulk distribution and retail inquiries.

**Request Body:**
```json
{
  "businessName": "Bundelkhand Organic Stores",
  "contactName": "Deepak Patel",
  "phone": "9876543210",
  "email": "deepak@bundelkhand.org",
  "city": "Jhansi",
  "state": "Uttar Pradesh",
  "quantity": "100-250 Jars",
  "notes": "Looking for regular monthly shipment."
}
```

**Response `200 OK`:**
```json
{
  "success": true
}
```

---

## 6. Staff Administrative Authentication

### `POST /api/admin/login`
Authenticates store staff using constant-time password comparison and sets a signed `httpOnly` session cookie.

**Request Body:**
```json
{
  "password": "your-admin-password"
}
```

**Response `200 OK`:**
```json
{
  "success": true
}
```

### `POST /api/admin/logout`
Clears the `akhil_admin_session` cookie.

**Response `200 OK`:**
```json
{
  "success": true
}
```
