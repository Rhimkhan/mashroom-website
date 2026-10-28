"use client";

import React, { useState } from "react";
import { CheckCircle2, Building2, Send } from "lucide-react";

export default function WholesaleForm() {
  const [formData, setFormData] = useState({
    businessName: "",
    contactPerson: "",
    phone: "",
    city: "",
    quantityNeeded: "",
    message: "",
    website_url: "", // Honeypot field
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side quick check
    if (
      !formData.businessName.trim() ||
      !formData.contactPerson.trim() ||
      !formData.phone.trim() ||
      !formData.city.trim() ||
      !formData.quantityNeeded.trim() ||
      !formData.message.trim()
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/wholesale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || "Failed to submit wholesale inquiry. Please try again.");
      }
    } catch (err) {
      console.error("Wholesale submit error:", err);
      setErrorMessage("An unexpected network error occurred. Please try again or contact us on WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FDFBF7] p-8 sm:p-10 rounded-3xl border border-[#E8DEC8] shadow-sm space-y-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A87B28]">
          <Building2 className="w-4 h-4 text-[#A87B28]" />
          <span>B2B & Bulk Orders</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#211612]">
          Wholesale Inquiry Form
        </h2>
        <p className="text-xs sm:text-sm text-[#3D2C24]/80 font-light leading-relaxed">
          Supplying authentic oyster mushroom pickles for retail distribution, restaurants, and corporate gifting. Dispatched directly from Jhansi.
        </p>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-2xl text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="font-serif text-2xl font-bold">Inquiry Received</h3>
          <p className="text-sm text-[#3D2C24]/80 max-w-md mx-auto leading-relaxed">
            Thank you for your interest. Our wholesale coordinator will review your requirements and reach out on your mobile number with quantity pricing.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  businessName: "",
                  contactPerson: "",
                  phone: "",
                  city: "",
                  quantityNeeded: "",
                  message: "",
                  website_url: "",
                });
              }}
              className="px-6 py-2.5 rounded-full bg-[#211612] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider hover:bg-[#34221A] transition-colors"
            >
              Submit Another Inquiry
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Honeypot field (hidden from real users) */}
          <div style={{ display: "none" }} aria-hidden="true">
            <label htmlFor="wholesale_website_url">Do not fill this</label>
            <input
              type="text"
              id="wholesale_website_url"
              tabIndex={-1}
              autoComplete="off"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#211612] mb-1.5">
                Business / Enterprise Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bundelkhand Retailers"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] focus:outline-none focus:border-[#C89B3C] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#211612] mb-1.5">
                Contact Person *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Suresh Verma"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] focus:outline-none focus:border-[#C89B3C] text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#211612] mb-1.5">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] focus:outline-none focus:border-[#C89B3C] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#211612] mb-1.5">
                City / Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kanpur, Lucknow, Delhi"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] focus:outline-none focus:border-[#C89B3C] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#211612] mb-1.5">
              Estimated Quantity Needed *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 50 jars, 100 kg, or monthly standing requirement"
              value={formData.quantityNeeded}
              onChange={(e) => setFormData({ ...formData, quantityNeeded: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] focus:outline-none focus:border-[#C89B3C] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#211612] mb-1.5">
              Message / Specific Requirements *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Tell us about your distribution channel, delivery timeline or custom packaging requirements..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] focus:outline-none focus:border-[#C89B3C] text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] font-serif text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 border border-[#C89B3C]/30 disabled:opacity-50"
          >
            {loading ? (
              <span>Submitting Inquiry...</span>
            ) : (
              <>
                <span>Submit Wholesale Inquiry</span>
                <Send className="w-4 h-4 text-[#C89B3C]" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
