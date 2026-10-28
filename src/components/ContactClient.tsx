"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, Clock, Sparkles, Navigation, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import WholesaleForm from "@/components/WholesaleForm";
import {
  PHONE_DISPLAY,
  WHATSAPP_NUMBER,
  TEL_LINK,
  WHATSAPP_DEFAULT_MESSAGE,
  FSSAI_NUMBER,
  FSSAI_VALIDITY,
  GST_NUMBER,
  UDYAM_NUMBER,
} from "@/lib/config";

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Order Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setErrorMessage("Please fill in all required fields (Name, Phone, and Message).");
      return;
    }

    setLoading(true);
    // Simulate contact dispatch
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="py-12 sm:py-20 bg-[#FAF6EE] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#FAF6EE] bg-[#1C130E] px-4 py-1.5 rounded-full border border-[#C89B3C]/40 inline-flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span>Dedicated Customer Care</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#211612]">
            Get In Touch With Our Kitchen
          </h1>
          <p className="text-sm text-[#3D2C24]/80">
            Have questions about ingredients, bulk family orders, wedding gifting, or courier delivery? We are right here in Moth, Jhansi, UP.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-[#1C130E] text-[#FAF6EE] p-8 sm:p-10 rounded-3xl shadow-xl space-y-8 flex flex-col justify-between relative overflow-hidden border border-[#C89B3C]/30">
            <div className="space-y-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF6EE]">
                Our Kitchen & Workshop
              </h2>
              <p className="text-sm text-[#FAF6EE]/80 leading-relaxed">
                Handcrafting authentic Oyster Mushroom Pickles in Village Nandsiya, Moth, Jhansi, Uttar Pradesh.
              </p>

              <div className="space-y-4 pt-2 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2A1D17] text-[#C89B3C] flex items-center justify-center shrink-0 border border-[#C89B3C]/30">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#FAF6EE] text-sm">Kitchen & Farm Address</h3>
                    <p className="text-[#FAF6EE]/80 mt-0.5 leading-relaxed text-sm">{BRAND.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2A1D17] text-[#C89B3C] flex items-center justify-center shrink-0 border border-[#C89B3C]/30">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#FAF6EE] text-sm">Phone & Direct Care</h3>
                    <a href={TEL_LINK} className="text-[#FAF6EE]/80 hover:text-[#C89B3C] underline mt-0.5 block text-sm font-semibold">
                      {PHONE_DISPLAY}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2A1D17] text-[#C89B3C] flex items-center justify-center shrink-0 border border-[#C89B3C]/30">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#FAF6EE] text-sm">Official Email</h3>
                    <a href={`mailto:${BRAND.email}`} className="text-[#FAF6EE]/80 hover:text-[#C89B3C] underline mt-0.5 block text-sm">
                      {BRAND.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2A1D17] text-[#C89B3C] flex items-center justify-center shrink-0 border border-[#C89B3C]/30">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#FAF6EE] text-sm">Operating Hours</h3>
                    <p className="text-[#FAF6EE]/80 mt-0.5 text-sm">Mon - Sat: 9:00 AM - 7:00 PM IST (Sun Closed)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Box */}
            <div className="bg-[#2A1D17] p-5 rounded-2xl border border-[#C89B3C]/30 space-y-2.5 text-sm">
              <span className="font-bold text-[#FAF6EE] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                <span>Instant WhatsApp Live Desk</span>
              </span>
              <p className="text-[#FAF6EE]/75 text-xs leading-relaxed">
                Connect directly with our culinary team. Average response time under 10 minutes.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-2.5 rounded-full bg-[#25D366] text-white font-bold hover:bg-[#20ba59] transition-colors shadow-md text-sm"
              >
                Chat on WhatsApp (+91 69665 58899)
              </a>
            </div>

            {/* Official Government Registrations & Certification Box */}
            <div className="bg-[#2A1D17] p-5 rounded-2xl border border-[#C89B3C]/30 space-y-3 text-sm">
              <span className="font-bold text-[#FAF6EE] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C89B3C]" />
                <span>Government Registrations</span>
              </span>
              <div className="space-y-2 text-xs text-[#FAF6EE]/85 font-mono">
                <div className="bg-[#1C130E] p-2.5 rounded-xl border border-[#C89B3C]/20">
                  <div className="text-[#C89B3C] font-bold">FSSAI Food Safety Registration</div>
                  <div className="text-white font-semibold text-xs mt-0.5">No. {FSSAI_NUMBER}</div>
                  <div className="text-xs text-[#FAF6EE]/70 mt-0.5">Valid till: {FSSAI_VALIDITY}</div>
                </div>
                <div className="bg-[#1C130E] p-2.5 rounded-xl border border-[#C89B3C]/20">
                  <div className="text-[#C89B3C] font-bold">GSTIN Certificate</div>
                  <div className="text-white font-semibold text-xs mt-0.5">{GST_NUMBER}</div>
                </div>
                <div className="bg-[#1C130E] p-2.5 rounded-xl border border-[#C89B3C]/20">
                  <div className="text-[#C89B3C] font-bold">Udyam MSME Registration</div>
                  <div className="text-white font-semibold text-xs mt-0.5">{UDYAM_NUMBER}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-[#FDFBF7] p-8 sm:p-10 rounded-3xl border border-[#E8DEC8] shadow-sm space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#211612]">
              Send Us an Official Message
            </h2>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-2xl text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-2xl font-bold">Message Received!</h3>
                <p className="text-sm text-[#3D2C24]/80 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out to <strong>{BRAND.name}</strong>. A member of our family team will contact you via phone or email within a few hours.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        subject: "Order Inquiry",
                        message: "",
                      });
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#211612] text-[#FAF6EE] border border-[#C89B3C]/40 text-sm font-bold hover:bg-[#1C130E] transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#211612]">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DEC8] focus:outline-none focus:ring-2 focus:ring-[#211612] bg-[#FAF6EE] text-sm text-[#211612]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#211612]">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 6966558899"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8DEC8] focus:outline-none focus:ring-2 focus:ring-[#211612] bg-[#FAF6EE] text-sm text-[#211612]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#211612]">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. priya@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E8DEC8] focus:outline-none focus:ring-2 focus:ring-[#211612] bg-[#FAF6EE] text-sm text-[#211612]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#211612]">Inquiry Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E8DEC8] focus:outline-none focus:ring-2 focus:ring-[#211612] bg-[#FAF6EE] text-sm text-[#211612]"
                  >
                    <option value="Order Inquiry">Order Inquiry / Delivery Status Tracking</option>
                    <option value="Bulk Order">Bulk Family / Wedding Gifting / Corporate Hampers</option>
                    <option value="Recipe & Ingredients">Recipe, Spices & Ingredients Question</option>
                    <option value="Production Inquiry">Kitchen & Production Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#211612]">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you would like to know or request..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E8DEC8] focus:outline-none focus:ring-2 focus:ring-[#211612] bg-[#FAF6EE] text-sm text-[#211612]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-[#211612] hover:bg-[#1C130E] text-[#FAF6EE] border border-[#C89B3C]/40 font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-[#C89B3C]" />
                  <span>{loading ? "Sending Message..." : "Submit Message"}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Google Maps Location Card (No iframe) */}
        <div className="bg-[#FDFBF7] p-8 rounded-3xl border border-[#E8DEC8] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#211612]">
              Kitchen & Packing Address
            </h2>
            <p className="text-sm text-[#3D2C24]/80">
              Village Nandsiya, Karguwan Road, Moth, Jhansi 284303
            </p>
          </div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Village+Nandsiya,+Karguwan+Road,+Moth,+Jhansi+284303"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] text-xs font-bold uppercase tracking-wider transition-colors shadow-sm shrink-0 border border-[#211612]"
          >
            <Navigation className="w-4 h-4 text-[#C89B3C]" />
            <span>Open in Google Maps</span>
          </a>
        </div>

        {/* Wholesale Inquiries Section */}
        <div id="wholesale" className="pt-2">
          <WholesaleForm />
        </div>
      </div>
    </div>
  );
}
