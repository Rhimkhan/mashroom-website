import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Phone, Mail, MapPin, ArrowLeft } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { PHONE_DISPLAY, WHATSAPP_NUMBER, TEL_LINK, FSSAI_NUMBER, GST_NUMBER } from "@/lib/config";

export const metadata: Metadata = {
  title: `Privacy Policy | ${BRAND.name}`,
  description: `Privacy Policy for ${BRAND.name}, Village Nandsiya, Karguwan Road, Near Ambedkar Murti, Moth, Jhansi, Uttar Pradesh 284303. Compliance with Digital Personal Data Protection Act 2023 and Consumer Protection (E-Commerce) Rules 2020.`,
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: `Privacy Policy | ${BRAND.name}`,
    description: `Privacy Policy for Akhil Foods, Village Nandsiya, Moth, Jhansi. Information on data collection, storage, courier partners, and grievance handling.`,
    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app"}/privacy-policy`,
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FAF6EE] min-h-screen py-12 sm:py-20 text-[#211612]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A87B28] hover:text-[#211612] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>

          <div className="space-y-2">
            <span className="text-xs font-bold text-[#A87B28] bg-[#EFE8DD] px-3.5 py-1 rounded-[6px] border border-[#DDD3C4] inline-flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#A87B28]" />
              <span>Statutory Compliance</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif text-[#211612] font-normal">
              Privacy Policy
            </h1>
            <p className="text-xs text-[#736b63]">
              Akhil Foods, Village Nandsiya, Karguwan Road, Near Ambedkar Murti, Moth, Jhansi, Uttar Pradesh 284303
            </p>
          </div>
        </div>

        {/* Business Details Strip */}
        <div className="bg-[#FDFBF7] rounded-[6px] p-6 border border-[#E8DEC8] text-sm text-[#3D2C24] space-y-2 leading-relaxed">
          <p>
            This Privacy Policy explains how <strong>Akhil Foods</strong> collects, uses, stores, and protects your personal information when you visit our website or place an order for Mushroom Mela oyster mushroom pickle.
          </p>
          <p>
            We process personal data in accordance with India&apos;s Digital Personal Data Protection Act 2023 (DPDP Act 2023) and the Consumer Protection (E-Commerce) Rules 2020.
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-[#FDFBF7] rounded-[6px] p-6 sm:p-10 border border-[#E8DEC8] shadow-sm space-y-8 text-sm sm:text-base leading-relaxed text-[#3D2C24]">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              1. What We Collect
            </h2>
            <p>
              When you use our website or place an order, we collect only the information necessary to fulfill your purchase and provide customer service:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li><strong>Name:</strong> To identify the recipient and address the parcel.</li>
              <li><strong>Phone number:</strong> To send order confirmation, courier tracking updates, and allow the delivery courier to contact you.</li>
              <li><strong>Email address:</strong> To deliver electronic order receipts, invoice copies, and customer support responses.</li>
              <li><strong>Delivery address:</strong> House number, street, landmark, city, state, and 6-digit postal pincode to deliver your parcel.</li>
              <li><strong>Order details:</strong> Items selected, jar quantities, total order value, and chosen payment method.</li>
              <li><strong>Payment status:</strong> Payment confirmation, transaction reference number, or UPI reference number (UTR). We do not collect or store debit card numbers, credit card numbers, CVVs, or UPI PINs.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              2. Why We Collect This Information
            </h2>
            <p>
              We collect and use your data solely for lawful business operations:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Processing, packing, and dispatching your pickle orders from our kitchen in Jhansi.</li>
              <li>Communicating order status, dispatch updates, and delivery confirmations via SMS, WhatsApp, or email.</li>
              <li>Verifying payments and preventing fraudulent transactions or spam orders.</li>
              <li>Complying with statutory tax obligations (GST invoice generation) and food safety record-keeping requirements under FSSAI regulations.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              3. Who Your Data Is Shared With
            </h2>
            <p>
              We never sell, rent, monetize, or trade your personal information to third parties, advertisers, or marketing agencies. We share necessary data only with service providers required to run our business:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li><strong>Courier and delivery partners:</strong> Such as India Post, Delhivery, DTDC, or regional courier services to deliver the shipment to your address.</li>
              <li><strong>Payment gateway providers:</strong> Authorized RBI-regulated payment aggregators (such as Razorpay) to process online payments securely over encrypted channels.</li>
              <li><strong>Supabase:</strong> Cloud database infrastructure used for secure order record storage and authentication.</li>
              <li><strong>Vercel:</strong> Web hosting platform used to serve our website securely.</li>
              <li><strong>Statutory authorities:</strong> Government, tax, or law enforcement bodies only if required under applicable Indian laws or valid legal process.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              4. How Long Data Is Kept
            </h2>
            <p className="text-sm">
              We retain customer order records for as long as necessary to fulfill the order, address warranty or return inquiries, and comply with statutory legal, tax, and accounting retention requirements under Indian law (typically up to 7 years for financial and tax records). Technical server logs are retained for up to 90 days for security and spam prevention.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              5. No Selling of Data
            </h2>
            <p className="text-sm">
              Akhil Foods does not sell customer personal data under any circumstances. Your phone number and email address are never added to external advertising lists.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              6. How to Request Correction or Deletion
            </h2>
            <p className="text-sm">
              You have the right to review the personal data we hold about you, request corrections to inaccurate information, or request deletion of your records where retention is no longer required by law. To make a request, send an email to <a href="mailto:abhishekkumarnandsiya@gmail.com" className="underline font-medium text-[#211612]">abhishekkumarnandsiya@gmail.com</a> or message us on WhatsApp at +91 63864 23865 with your name and order number. We will respond within 30 days.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              7. Cookies in Plain Words
            </h2>
            <p className="text-sm">
              Our website uses basic functional cookies only. These cookies remember what items are in your shopping cart and keep you logged in if you create an account. We do not use third-party advertising tracking cookies or spyware to follow your browsing across other sites.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              8. Grievance Contact
            </h2>
            <p className="text-sm">
              In accordance with the Consumer Protection (E-Commerce) Rules 2020 and the Digital Personal Data Protection Act 2023, the details of our Grievance Officer and designated business contact are:
            </p>
            <div className="bg-[#FAF6EE] p-5 rounded-[6px] border border-[#E8DEC8] space-y-1.5 text-xs sm:text-sm">
              <p><strong>Grievance Officer:</strong> Abhishek Kumar</p>
              <p><strong>Business Name:</strong> Akhil Foods</p>
              <p><strong>Address:</strong> Village Nandsiya, Karguwan Road, Near Ambedkar Murti, Moth, Jhansi, Uttar Pradesh 284303</p>
              <p><strong>WhatsApp / Phone:</strong> +91 63864 23865</p>
              <p><strong>Email:</strong> abhishekkumarnandsiya@gmail.com</p>
              <p><strong>FSSAI Registration:</strong> 22726293000001</p>
              <p><strong>GSTIN:</strong> 09FTOPD3011E1ZZ</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
