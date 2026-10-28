import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { FSSAI_NUMBER, GST_NUMBER } from "@/lib/config";

export const metadata: Metadata = {
  title: `Terms and Conditions | ${BRAND.name}`,
  description: `Terms and Conditions for purchasing Mushroom Mela oyster mushroom pickle from Akhil Foods, Village Nandsiya, Karguwan Road, Near Ambedkar Murti, Moth, Jhansi, Uttar Pradesh 284303.`,
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: `Terms and Conditions | ${BRAND.name}`,
    description: `Plain terms and conditions for Akhil Foods: orders, payments, delivery, cancellations, refunds, food safety, and governing law at Jhansi, Uttar Pradesh.`,
    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://akhil-mushroom-pickle.vercel.app"}/terms`,
    type: "website",
  },
};

export default function TermsPage() {
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
              <Scale className="w-3.5 h-3.5 text-[#A87B28]" />
              <span>Customer Agreement</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif text-[#211612] font-normal">
              Terms and Conditions
            </h1>
            <p className="text-xs text-[#736b63]">
              Akhil Foods, Village Nandsiya, Karguwan Road, Near Ambedkar Murti, Moth, Jhansi, Uttar Pradesh 284303
            </p>
          </div>
        </div>

        {/* Business Details Strip */}
        <div className="bg-[#FDFBF7] rounded-[6px] p-6 border border-[#E8DEC8] text-sm text-[#3D2C24] space-y-2 leading-relaxed">
          <p>
            These Terms and Conditions govern your use of this website and purchases of Mushroom Mela oyster mushroom pickle from <strong>Akhil Foods</strong>. By placing an order with us, you agree to these terms in full.
          </p>
          <p>
            Business details: Akhil Foods, Village Nandsiya, Karguwan Road, Near Ambedkar Murti, Moth, Jhansi, Uttar Pradesh 284303. Proprietor: Abhishek Kumar. FSSAI Lic. No. 22726293000001, GSTIN 09FTOPD3011E1ZZ. WhatsApp: +91 63864 23865. Email: abhishekkumarnandsiya@gmail.com.
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-[#FDFBF7] rounded-[6px] p-6 sm:p-10 border border-[#E8DEC8] shadow-sm space-y-8 text-sm sm:text-base leading-relaxed text-[#3D2C24]">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              1. Orders and Acceptance
            </h2>
            <p>
              When you place an order through our website or on WhatsApp, you make an offer to purchase the specified quantities of Mushroom Mela oyster mushroom pickle.
            </p>
            <p>
              Order acceptance occurs when we confirm your order after payment receipt (for online or UPI payments) or upon order verification by phone or WhatsApp (for Cash on Delivery orders). We reserve the right to decline or cancel an order if the product is out of stock, if the delivery address cannot be reached by reliable couriers, or in cases of suspected fraud or pricing errors. If payment has already been collected for a cancelled order, it will be refunded promptly to the source account.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              2. Prices in INR Inclusive of Taxes
            </h2>
            <p>
              All prices displayed on this website are in Indian Rupees (INR) and are inclusive of all applicable taxes (GST). Delivery charges, if applicable, are shown separately during the checkout process before you confirm your order. The Maximum Retail Price (MRP) for our 400 g jar is Rs 399.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              3. Payment Methods
            </h2>
            <p>
              We accept three payment methods:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li><strong>Cash on Delivery (COD):</strong> Payment in cash or UPI is collected by the courier executive at the time of delivery.</li>
              <li><strong>Pay by UPI QR:</strong> Direct transfer to our bank account via UPI QR code. You must provide the 12-digit UTR reference number from your UPI receipt for verification.</li>
              <li><strong>Online Payment Gateway:</strong> Secure digital payments via debit cards, credit cards, or net banking processed through our payment gateway partner.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              4. Delivery Depends on Courier and Location
            </h2>
            <p>
              All orders are packed and dispatched from our kitchen in Village Nandsiya, Moth, Jhansi, Uttar Pradesh.
            </p>
            <p>
              Delivery time depends strictly on the courier partner and your delivery location and pincode. We do not offer guaranteed delivery days or fixed delivery timelines. Transit times vary depending on the destination: deliveries within Uttar Pradesh and nearby northern states are typically faster than deliveries to southern, western, eastern, or northeastern regions. Severe weather, holidays, or courier route disruptions can affect delivery schedules.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              5. Cancellations and Refunds
            </h2>
            <p>
              Because our product is a perishable food item packed for human consumption, the following strict policy applies:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li><strong>No returns of opened food:</strong> Once the seal of a pickle jar has been broken or opened by the customer, it cannot be returned or refunded under any circumstances due to hygiene and food safety regulations.</li>
              <li><strong>Order cancellation before dispatch:</strong> You may cancel your order free of charge at any time before it is handed over to the courier partner by messaging us on WhatsApp (+91 63864 23865) with your order number. Any prepaid amount will be refunded immediately.</li>
              <li><strong>Damaged or wrong items:</strong> If your package arrives damaged, leaking, broken in transit, or if an incorrect item was delivered, you must notify us within 48 hours of delivery with clear photographs of the package, shipping label, and damaged item.</li>
              <li><strong>Resolution:</strong> Upon verification of photos reported within 48 hours, we will either dispatch a free replacement jar or issue a full refund to your original payment method or UPI account within 3 to 7 working days.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              6. Food Safety and Storage per Label
            </h2>
            <p>
              Mushroom Mela oyster mushroom pickle is manufactured under FSSAI registration number 22726293000001.
            </p>
            <p>
              Ingredients: mushroom, mustard oil, vinegar, salt, red chilli, coriander, mustard, fennel, fenugreek, cumin, turmeric, ajwain, ginger, garlic, and permitted additives.
            </p>
            <p>
              Storage instructions per label: Store in a cool, dry place away from direct sunlight. Always use a clean and dry spoon when serving to prevent spoilage. Ensure the surface of the pickle remains covered with oil.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              7. Limitation of Liability
            </h2>
            <p>
              Akhil Foods shall not be liable for any indirect, incidental, or consequential damages arising out of the purchase, delivery, or consumption of our products beyond the total invoice amount paid by you for the specific order. We are not responsible for delays or failures caused by courier mishandling, incorrect addresses provided by the customer, or events beyond our reasonable control.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              8. Governing Law and Jurisdiction
            </h2>
            <p>
              These Terms and Conditions and any contracts entered into with Akhil Foods are governed by the laws of India. Any legal dispute, controversy, or claim arising out of or related to these terms or our products shall be subject to the exclusive jurisdiction of the courts located at <strong>Jhansi, Uttar Pradesh, India</strong>.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#211612]">
              9. Contact Information
            </h2>
            <div className="bg-[#FAF6EE] p-5 rounded-[6px] border border-[#E8DEC8] space-y-1.5 text-xs sm:text-sm">
              <p><strong>Business Name:</strong> Akhil Foods</p>
              <p><strong>Proprietor:</strong> Abhishek Kumar</p>
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
