"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  QrCode,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { BRAND } from "@/lib/brand";
import { FSSAI_NUMBER } from "@/lib/config";
import { PaymentMethod } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shipping, discount, total, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    landmark: "",
    city: "",
    state: "Delhi",
    pincode: "",
    notes: "",
    website_url: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || user.email || "",
        customerName: prev.customerName || (user.user_metadata?.full_name as string) || "",
      }));
    }
  }, [user]);

  // Razorpay configuration detection (if NEXT_PUBLIC_RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET are missing, hide online option)
  const [isRazorpayConfigured, setIsRazorpayConfigured] = useState<boolean>(false);

  useEffect(() => {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId || keyId.includes("YourTestKeyIdHere") || keyId.trim() === "") {
      setIsRazorpayConfigured(false);
      return;
    }

    fetch("/api/razorpay/create-order")
      .then((res) => res.json())
      .then((data) => {
        setIsRazorpayConfigured(Boolean(data?.configured));
      })
      .catch(() => setIsRazorpayConfigured(false));
  }, []);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash on Delivery");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UPI QR state
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "abhishekkumarnandsiya@okaxis";
  const [orderNumber, setOrderNumber] = useState("AF-8001");
  const [utrNumber, setUtrNumber] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    const unguessablePart = Math.random().toString(36).substring(2, 8).toUpperCase();
    setOrderNumber(`AF-${unguessablePart}`);
  }, []);

  // UPI Deep link: upi://pay?pa=<UPI_ID>&pn=Akhil%20Foods&am=<order total>&cu=INR&tn=<order number>
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("Akhil Foods")}&am=${total}&cu=INR&tn=${encodeURIComponent(orderNumber)}`;

  // Generate UPI QR Code on client
  useEffect(() => {
    if (paymentMethod === "Pay by UPI QR" && total > 0) {
      QRCode.toDataURL(upiDeepLink, {
        width: 240,
        margin: 1.5,
        color: {
          dark: "#211612",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error("QR Code generation error:", err));
    }
  }, [paymentMethod, upiDeepLink, total]);

  // Copy UPI ID helper
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Load Razorpay Checkout Script only if real keys are available
  useEffect(() => {
    if (isRazorpayConfigured) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isRazorpayConfigured]);

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
    "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  if (!isMounted) {
    return (
      <div className="py-12 sm:py-20 bg-[#FAF6EE] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
          <div className="h-4 w-32 bg-[#E8DEC8] rounded" />
          <div className="h-8 w-64 bg-[#E8DEC8] rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-[#FDFBF7] p-8 rounded-[6px] border border-[#E8DEC8] space-y-4">
              <div className="h-6 w-48 bg-[#E8DEC8] rounded" />
              <div className="h-12 bg-[#FAF6EE] rounded border border-[#E8DEC8]" />
              <div className="h-12 bg-[#FAF6EE] rounded border border-[#E8DEC8]" />
              <div className="h-20 bg-[#FAF6EE] rounded border border-[#E8DEC8]" />
            </div>
            <div className="lg:col-span-5 bg-[#FDFBF7] p-8 rounded-[6px] border border-[#E8DEC8] space-y-4">
              <div className="h-6 w-36 bg-[#E8DEC8] rounded" />
              <div className="h-20 bg-[#FAF6EE] rounded border border-[#E8DEC8]" />
              <div className="h-12 bg-[#211612]/20 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4 space-y-4 bg-[#FAF6EE] min-h-screen">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#211612]">Your cart is empty</h1>
        <p className="text-sm text-[#3D2C24]/80 font-sans">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="inline-block px-7 py-3 rounded-[6px] bg-[#211612] text-[#FAF6EE] border border-[#211612] text-sm font-semibold shadow-sm hover:bg-[#1C130E] transition-colors"
        >
          Shop now
        </Link>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Complete Order placement flow
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Form Validation
    const rawCustomerName = formData.customerName.trim();
    if (rawCustomerName.length < 2 || rawCustomerName.length > 60) {
      setErrorMsg("Please enter your full name (between 2 and 60 characters).");
      return;
    }
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMsg("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
      return;
    }
    const rawAddress = formData.address.trim();
    if (rawAddress.length < 10 || rawAddress.length > 250) {
      setErrorMsg("Please enter your complete delivery street address (between 10 and 250 characters).");
      return;
    }
    const cleanPincode = formData.pincode.replace(/\D/g, "");
    if (!/^\d{6}$/.test(cleanPincode)) {
      setErrorMsg("Please enter a valid 6-digit postal pincode.");
      return;
    }
    const rawEmail = formData.email.trim();
    if (rawEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (rawEmail.length > 100 || !emailRegex.test(rawEmail)) {
        setErrorMsg("Please enter a valid email address (e.g. yourname@example.com).");
        return;
      }
    }

    // UPI QR specific validation: 12-digit UTR is required
    let cleanUtr = "";
    if (paymentMethod === "Pay by UPI QR") {
      cleanUtr = utrNumber.replace(/\D/g, "");
      if (cleanUtr.length !== 12) {
        setErrorMsg("Please enter the complete 12-digit UPI reference / UTR transaction ID from your payment receipt.");
        return;
      }
    }

    setLoading(true);

    try {
      const orderPayload = {
        orderNumber,
        customerName: formData.customerName.trim(),
        email: formData.email.trim() || `${cleanPhone}@customer.order`,
        phone: cleanPhone,
        address: formData.address.trim(),
        landmark: formData.landmark.trim(),
        city: formData.city.trim() || "Delivery City",
        state: formData.state,
        pincode: cleanPincode,
        notes: formData.notes.trim(),
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          size: i.size,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        subtotal,
        shipping,
        discount,
        couponCode: appliedCoupon || undefined,
        total,
        paymentMethod,
        userId: user?.id || undefined,
        website_url: formData.website_url,
      };

      // 1. Cash on Delivery (COD) Flow
      if (paymentMethod === "Cash on Delivery") {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...orderPayload,
            paymentStatus: "Pending",
          }),
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Failed to place COD order");
        }

        clearCart();
        if (typeof window !== "undefined") {
          sessionStorage.setItem("akhil_placed_order_" + data.order.id, JSON.stringify(data.order));
          sessionStorage.setItem("akhil_last_placed_order", JSON.stringify(data.order));
        }
        router.push(`/order-success/${data.order.id}`);
        return;
      }

      // 2. Pay by UPI QR Flow (Awaiting verification with 12-digit UTR)
      if (paymentMethod === "Pay by UPI QR") {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...orderPayload,
            paymentStatus: "Awaiting verification",
            utr: cleanUtr,
            notes: `Paid via UPI to ${upiId} | UTR: ${cleanUtr}`,
          }),
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Failed to record UPI QR order");
        }

        clearCart();
        if (typeof window !== "undefined") {
          sessionStorage.setItem("akhil_placed_order_" + data.order.id, JSON.stringify(data.order));
          sessionStorage.setItem("akhil_last_placed_order", JSON.stringify(data.order));
        }
        router.push(`/order-success/${data.order.id}`);
        return;
      }

      // 3. Official Razorpay Online Flow (Strict Signature Verification)
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderPayload,
          paymentStatus: "Pending",
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to initiate online order");
      }
      const newOrder = orderData.order;

      // Create Razorpay server order
      const rzpRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: newOrder.id,
          amount: newOrder.total,
          receipt: newOrder.orderNumber,
          currency: "INR",
        }),
      });
      const rzpOrder = await rzpRes.json();
      if (!rzpOrder.success || !rzpOrder.orderId) {
        throw new Error(rzpOrder.error || "Payment gateway unavailable. Please choose COD or Pay by UPI QR.");
      }

      // Trigger official Razorpay Checkout SDK
      if (typeof window === "undefined" || !(window as any).Razorpay) {
        throw new Error("Razorpay payment window failed to load. Please try again or use UPI QR.");
      }

      const options = {
        key: rzpOrder.keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: BRAND.name,
        description: "Mushroom Mela oyster mushroom pickle",
        image: BRAND.logo,
        order_id: rzpOrder.orderId,
        prefill: {
          name: formData.customerName,
          email: formData.email,
          contact: cleanPhone,
        },
        theme: {
          color: "#211612",
        },
        handler: async function (response: any) {
          setLoading(true);
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: newOrder.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              throw new Error(verifyData.error || "Server payment verification failed");
            }

            clearCart();
            if (typeof window !== "undefined") {
              const paidOrder = { ...newOrder, paymentStatus: "Paid" };
              sessionStorage.setItem("akhil_placed_order_" + newOrder.id, JSON.stringify(paidOrder));
              sessionStorage.setItem("akhil_last_placed_order", JSON.stringify(paidOrder));
            }
            router.push(`/order-success/${newOrder.id}`);
          } catch (vErr: any) {
            setErrorMsg(vErr?.message || "Cryptographic payment verification failed.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.open();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while processing your payment. Please try again.";
      setErrorMsg(message);
      setLoading(false);
    }
  };

  return (
    <div className="py-10 sm:py-16 bg-[#FAF6EE] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#211612] hover:text-[#A87B28] mb-3 uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 text-[#A87B28]" />
            <span>Return to cart</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#211612]">
            Checkout & Payment
          </h1>
          <p className="text-sm text-[#3D2C24]/80 mt-1 font-sans">
            Choose your payment method: Cash on Delivery (COD) or Instant Direct UPI QR.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[6px] text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Honeypot Anti-spam */}
          <input
            type="text"
            name="website_url"
            value={formData.website_url}
            onChange={handleChange}
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {/* Customer & Shipping Form */}
          <div className="lg:col-span-7 bg-[#FDFBF7] p-6 sm:p-8 rounded-[6px] border border-[#E8DEC8] shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
              <h2 className="font-serif text-xl font-bold text-[#211612]">
                1. Delivery Address
              </h2>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-[4px] flex items-center gap-1 border border-emerald-200">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                256-Bit SSL Encrypted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#211612]">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#211612]">
                  Mobile Number (WhatsApp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] font-mono focus:outline-none focus:ring-2 focus:ring-[#211612]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#211612]">
                Delivery Street Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                required
                rows={2}
                placeholder="House / Flat No., Street, Colony, Village..."
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#211612]">Landmark (Optional)</label>
                <input
                  type="text"
                  name="landmark"
                  placeholder="e.g. Near Temple"
                  value={formData.landmark}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#211612]">City / District</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Jhansi"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#211612]">
                  Postal Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  name="pincode"
                  required
                  placeholder="6 Digits"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] font-mono focus:outline-none focus:ring-2 focus:ring-[#211612]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#211612]">State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-[6px] border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
              >
                {indianStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Mode Selector: COD, Pay by UPI QR & (Optional) Razorpay */}
            <div className="pt-4 space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#211612] pb-2 border-b border-[#E8DEC8]">
                2. Select Payment Option
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Cash on Delivery (COD) */}
                <label
                  className={`p-4 rounded-[6px] border cursor-pointer flex items-center gap-3 transition-all ${
                    paymentMethod === "Cash on Delivery"
                      ? "border-[#211612] bg-[#FAF6EE] shadow-sm ring-1 ring-[#211612]"
                      : "border-[#E8DEC8] bg-[#FDFBF7] hover:border-[#211612]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={paymentMethod === "Cash on Delivery"}
                    onChange={() => setPaymentMethod("Cash on Delivery")}
                    className="accent-[#211612] w-4 h-4"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-[#211612]">
                      <Banknote className="w-4 h-4 text-emerald-700" />
                      <span>Cash on Delivery (COD)</span>
                    </div>
                    <p className="text-xs text-[#3D2C24]/70 mt-0.5">Pay in cash or UPI upon delivery</p>
                  </div>
                </label>

                {/* Pay by UPI QR (Direct Bank Transfer) */}
                <label
                  className={`p-4 rounded-[6px] border cursor-pointer flex items-center gap-3 transition-all ${
                    paymentMethod === "Pay by UPI QR"
                      ? "border-[#211612] bg-[#FAF6EE] shadow-sm ring-1 ring-[#211612]"
                      : "border-[#E8DEC8] bg-[#FDFBF7] hover:border-[#211612]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Pay by UPI QR"
                    checked={paymentMethod === "Pay by UPI QR"}
                    onChange={() => setPaymentMethod("Pay by UPI QR")}
                    className="accent-[#211612] w-4 h-4"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-[#211612]">
                      <QrCode className="w-4 h-4 text-[#A87B28]" />
                      <span>Pay by UPI QR</span>
                    </div>
                    <p className="text-xs text-[#3D2C24]/70 mt-0.5">Instant GPay / PhonePe / Paytm</p>
                  </div>
                </label>

                {/* Razorpay Online (Only visible if real Razorpay keys are configured) */}
                {isRazorpayConfigured && (
                  <label
                    className={`p-4 rounded-[6px] border cursor-pointer flex items-center gap-3 transition-all sm:col-span-2 ${
                      paymentMethod.includes("Razorpay")
                        ? "border-[#211612] bg-[#FAF6EE] shadow-sm ring-1 ring-[#211612]"
                        : "border-[#E8DEC8] bg-[#FDFBF7] hover:border-[#211612]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Razorpay Online (UPI / Cards / Netbanking)"
                      checked={paymentMethod.includes("Razorpay")}
                      onChange={() => setPaymentMethod("Razorpay Online (UPI / Cards / Netbanking)")}
                      className="accent-[#211612] w-4 h-4"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-[#211612]">
                        <CreditCard className="w-4 h-4 text-[#A87B28]" />
                        <span>Razorpay Online Gateway (Cards & Netbanking)</span>
                      </div>
                      <p className="text-xs text-[#3D2C24]/70 mt-0.5">Secure payment via official Razorpay gateway</p>
                    </div>
                  </label>
                )}
              </div>

              {/* PAY BY UPI QR SECTION */}
              {paymentMethod === "Pay by UPI QR" && (
                <div className="mt-4 p-5 sm:p-6 rounded-[6px] bg-[#FAF6EE] border border-[#C89B3C]/40 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-[#A87B28]" />
                      <h3 className="font-serif font-bold text-base text-[#211612]">
                        Direct UPI Payment
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-[#A87B28] bg-[#EFE8DD] px-3 py-1 rounded-[4px] border border-[#DDD3C4]">
                      Amount: ₹{total}
                    </span>
                  </div>

                  <p className="text-xs text-[#3D2C24]/85 leading-relaxed">
                    Scan the QR code with any UPI app (Google Pay, PhonePe, Paytm, BHIM, CRED) or click below to launch your UPI app directly.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                    {/* Rendered QR Code */}
                    <div className="bg-white p-3 rounded-[6px] border border-[#E8DEC8] shadow-sm text-center">
                      {qrCodeDataUrl ? (
                        <Image
                          src={qrCodeDataUrl}
                          alt="Akhil Foods UPI Payment QR Code"
                          width={200}
                          height={200}
                          className="mx-auto rounded-[4px]"
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-xs text-stone-400">
                          Generating QR...
                        </div>
                      )}
                      <span className="text-[10px] text-stone-500 font-medium block mt-1">
                        Scan with any UPI app
                      </span>
                    </div>

                    {/* UPI Details & Mobile Intent Link */}
                    <div className="space-y-3.5 w-full sm:w-auto text-center sm:text-left">
                      <div>
                        <span className="text-xs text-stone-500 block">Beneficiary UPI ID:</span>
                        <div className="inline-flex items-center gap-2 bg-[#FDFBF7] px-3 py-1.5 rounded-[4px] border border-[#E8DEC8] mt-1 font-mono text-xs font-bold text-[#211612]">
                          <span>{upiId}</span>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="p-1 text-[#A87B28] hover:text-[#211612] transition-colors"
                            title="Copy UPI ID"
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-stone-500 block">Order Ref Number:</span>
                        <span className="font-mono text-xs font-bold text-[#211612]">{orderNumber}</span>
                      </div>

                      {/* Pay with UPI App button for mobile */}
                      <a
                        href={upiDeepLink}
                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-[6px] bg-[#211612] text-[#FAF6EE] text-xs font-bold tracking-wider uppercase hover:bg-[#34221A] transition-colors shadow-sm"
                      >
                        <span>Pay with UPI App</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#C89B3C]" />
                      </a>
                    </div>
                  </div>

                  {/* 12-digit UTR Input */}
                  <div className="pt-3 border-t border-[#E8DEC8] space-y-1.5">
                    <label className="text-xs font-bold text-[#211612] block">
                      Enter 12-Digit UPI Reference Number (UTR / Transaction ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      required={paymentMethod === "Pay by UPI QR"}
                      placeholder="e.g. 428192837465"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-2.5 rounded-[6px] border border-[#E8DEC8] bg-white text-sm font-mono tracking-widest text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
                    />
                    <p className="text-[11px] text-[#3D2C24]/70">
                      You will find this 12-digit number in Google Pay, PhonePe, or Paytm under transaction details.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Review & Placement Sidebar */}
          <div className="lg:col-span-5 bg-[#FDFBF7] p-6 sm:p-8 rounded-[6px] border border-[#E8DEC8] shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#211612] pb-3 border-b border-[#E8DEC8]">
              Order Items ({items.reduce((s, i) => s + i.quantity, 0)})
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex items-center justify-between text-sm py-2 border-b border-[#E8DEC8]/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-[4px] overflow-hidden bg-[#FAF6EE] shrink-0 border border-[#E8DEC8]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        loading="lazy"
                        sizes="48px"
                        className="object-contain p-0.5"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#211612] text-sm line-clamp-1">{item.name}</h3>
                      <p className="text-[#3D2C24]/70 text-xs">
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#211612]">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-sm text-[#3D2C24]/80 pt-2 border-t border-[#E8DEC8]">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-[#211612]">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Coupon ({appliedCoupon})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery charge</span>
                <span>{shipping === 0 ? <strong className="text-emerald-800 font-bold">FREE</strong> : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#211612] pt-3 border-t border-[#E8DEC8]">
                <span>Total Payable</span>
                <span className="font-serif text-2xl font-extrabold text-[#211612]">₹{total}</span>
              </div>
            </div>

            {/* Submit / Place Order Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-[6px] bg-[#211612] hover:bg-[#1C130E] text-[#FAF6EE] border border-[#211612] font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C89B3C]" />
                  <span>
                    {paymentMethod === "Pay by UPI QR"
                      ? "Recording UPI Payment Details..."
                      : paymentMethod.includes("Razorpay")
                      ? "Connecting to Gateway..."
                      : "Placing COD Order..."}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#C89B3C]" />
                  <span>
                    {paymentMethod === "Cash on Delivery"
                      ? `Place COD Order • ₹${total}`
                      : paymentMethod === "Pay by UPI QR"
                      ? `Submit UPI Order • ₹${total}`
                      : `Pay with Razorpay • ₹${total}`}
                  </span>
                </>
              )}
            </button>

            {/* Terms and Privacy policy agreement */}
            <p className="text-xs text-[#3D2C24]/80 text-center leading-relaxed">
              By placing this order you agree to the{" "}
              <Link href="/terms" className="underline hover:text-[#211612]">
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="underline hover:text-[#211612]">
                Privacy Policy
              </Link>.
            </p>

            {/* FSSAI License & Trust Line near checkout */}
            <div className="bg-[#FAF6EE] p-3.5 rounded-[6px] border border-[#E8DEC8] text-center space-y-1">
              <div className="text-xs font-mono font-bold text-[#211612] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>FSSAI Lic. No. {FSSAI_NUMBER}</span>
              </div>
              <p className="text-xs text-[#3D2C24]/70">
                {BRAND.legalName}, Village Nandsiya, Moth, Jhansi, UP 284303
              </p>
            </div>

            <div className="space-y-2 text-xs text-[#3D2C24]/70 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Truck className="w-4 h-4 text-[#A87B28]" />
                <span>Packed in sealed 400 g jar</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Mushroom Mela oyster mushroom pickle</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
