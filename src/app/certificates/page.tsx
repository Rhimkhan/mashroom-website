import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  ExternalLink,
  CheckCircle2,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  Leaf,
  Building2,
  FileText,
  Factory,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { FSSAI_NUMBER, FSSAI_VALIDITY, GST_NUMBER, UDYAM_NUMBER } from "@/lib/config";

export const metadata: Metadata = {
  title: `Certificates & Authenticity | ${BRAND.name} - FSSAI, GST, Udyam`,
  description: `Official government certifications for ${BRAND.name}, Village Nandsiya, Moth, Jhansi, Uttar Pradesh. FSSAI Lic. No. ${FSSAI_NUMBER}, GSTIN ${GST_NUMBER}, Udyam ${UDYAM_NUMBER}.`,
  openGraph: {
    title: `Certificates & Government Accreditations | ${BRAND.name}`,
    description: `Verified FSSAI, GST, and Udyam certifications for Mushroom Mela oyster mushroom pickle, Moth, Jhansi.`,
    url: `${BRAND.url}/certificates`,
    type: "website",
  },
};

export default function CertificatesPage() {
  return (
    <div className="bg-[#FAF6EE] min-h-screen py-14 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-[#A87B28] bg-[#EFE8DD] px-3.5 py-1.5 rounded-[6px] border border-[#DDD3C4] inline-flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#A87B28]" />
            <span>Official Government Registrations</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#211612] font-normal">
            Certifications & Food Safety
          </h1>
          <p className="text-sm sm:text-base text-[#3D2C24] max-w-2xl mx-auto font-light leading-relaxed">
            Mushroom Mela is made by Akhil Foods in Village Nandsiya, Moth, Jhansi, Uttar Pradesh. Our operations are fully registered with the relevant statutory authorities.
          </p>
        </div>

        {/* Narrative Box */}
        <div className="bg-[#1C130E] text-[#FAF6EE] rounded-xl p-8 sm:p-12 border border-[#C89B3C]/30 shadow-xl space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Ingredients & Preparation</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal">
              Made in Jhansi with Mustard Oil and Spices.
            </h2>
            <p className="text-sm sm:text-base text-[#FAF6EE]/90 leading-relaxed max-w-3xl font-light">
              In Bundelkhand, oyster mushrooms are harvested, inspected, washed, and trimmed to maintain texture and cleanliness.
            </p>
            <p className="text-sm sm:text-base text-[#FAF6EE]/90 leading-relaxed max-w-3xl font-light">
              We blend the mushrooms with pure virgin mustard oil, coriander, mustard seeds, fenugreek, fennel, cumin, turmeric, ajwain, ginger, and garlic per the registered formula.
            </p>
          </div>

          <div className="pt-6 border-t border-[#C89B3C]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-[#EADBB6]/80 font-light">
              <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>{BRAND.legalName}, {BRAND.address}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[#2A1D17] text-[#D4AF37] border border-[#C89B3C]/30 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Registered Food Processing Unit</span>
            </div>
          </div>
        </div>

        {/* 3 Seals of Government Integrity & Compliance */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A87B28]">Official Accreditations</span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#211612] font-normal">
              Government Registrations
            </h2>
            <p className="text-sm text-[#3D2C24] font-light">
              All registrations are verified and active under Government of India departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Seal 1: FSSAI Food Safety */}
            <div className="bg-[#FDFBF7] rounded-xl p-7 sm:p-8 border border-[#E8DEC8] shadow-sm flex flex-col justify-between">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-[6px] bg-[#EFE8DD] border border-[#DDD3C4] flex items-center justify-center text-[#211612]">
                  <Building2 className="w-6 h-6 text-[#A87B28]" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-[#A87B28] font-bold block uppercase tracking-wider">
                    Food Safety
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#211612]">
                    FSSAI Registration
                  </h3>
                </div>

                <div className="bg-[#FAF6EE] p-3.5 rounded-[6px] border border-[#E8DEC8] space-y-1">
                  <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                    Registration Number
                  </p>
                  <p className="font-mono text-base font-bold text-[#211612] select-all">
                    {FSSAI_NUMBER}
                  </p>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-[#3D2C24] leading-relaxed font-light">
                  <p>
                    <strong className="text-[#211612] font-medium">Authority:</strong> Food Safety and Standards Authority of India, Ministry of Health and Family Welfare.
                  </p>
                  <div className="flex items-center gap-1.5 text-stone-600 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-[#A87B28]" />
                    <span>Valid through: <strong>{FSSAI_VALIDITY}</strong></span>
                  </div>
                  <p className="text-stone-600 text-xs pt-1">
                    Registered for mushroom pickle preparation, packaging in sealed 400 g jars, and courier fulfillment.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E8DEC8] mt-6">
                <a
                  href="/certificates/fssai-certificate.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-[6px] bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] text-xs font-semibold uppercase tracking-wider transition-colors border border-[#211612]"
                >
                  <span>View FSSAI Certificate (PDF)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Seal 2: GST Commercial Compliance */}
            <div className="bg-[#FDFBF7] rounded-xl p-7 sm:p-8 border border-[#E8DEC8] shadow-sm flex flex-col justify-between">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-[6px] bg-[#EFE8DD] border border-[#DDD3C4] flex items-center justify-center text-[#211612]">
                  <FileText className="w-6 h-6 text-[#A87B28]" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-[#A87B28] font-bold block uppercase tracking-wider">
                    Commercial Tax
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#211612]">
                    GST Registration
                  </h3>
                </div>

                <div className="bg-[#FAF6EE] p-3.5 rounded-[6px] border border-[#E8DEC8] space-y-1">
                  <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                    GSTIN
                  </p>
                  <p className="font-mono text-base font-bold text-[#211612] select-all">
                    {GST_NUMBER}
                  </p>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-[#3D2C24] leading-relaxed font-light">
                  <p>
                    <strong className="text-[#211612] font-medium">Authority:</strong> Goods and Services Tax Network, Department of Revenue, Ministry of Finance.
                  </p>
                  <p className="text-stone-600 text-xs">
                    <strong className="text-[#211612] font-medium">Jurisdiction:</strong> Uttar Pradesh (State Code 09).
                  </p>
                  <p className="text-stone-600 text-xs pt-1">
                    Verified entity ensuring compliant billing and nationwide courier shipments.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E8DEC8] mt-6">
                <a
                  href="/certificates/gst-certificate.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-[6px] bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] text-xs font-semibold uppercase tracking-wider transition-colors border border-[#211612]"
                >
                  <span>View GST Certificate (PDF)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Seal 3: Udyam MSME Recognition */}
            <div className="bg-[#FDFBF7] rounded-xl p-7 sm:p-8 border border-[#E8DEC8] shadow-sm flex flex-col justify-between">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-[6px] bg-[#EFE8DD] border border-[#DDD3C4] flex items-center justify-center text-[#211612]">
                  <Factory className="w-6 h-6 text-[#A87B28]" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-[#A87B28] font-bold block uppercase tracking-wider">
                    MSME Enterprise
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#211612]">
                    Udyam Registration
                  </h3>
                </div>

                <div className="bg-[#FAF6EE] p-3.5 rounded-[6px] border border-[#E8DEC8] space-y-1">
                  <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                    Udyam Certificate No.
                  </p>
                  <p className="font-mono text-base font-bold text-[#211612] select-all">
                    {UDYAM_NUMBER}
                  </p>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-[#3D2C24] leading-relaxed font-light">
                  <p>
                    <strong className="text-[#211612] font-medium">Authority:</strong> Ministry of Micro, Small and Medium Enterprises, Government of India.
                  </p>
                  <p className="text-stone-600 text-xs">
                    <strong className="text-[#211612] font-medium">Classification:</strong> Micro Enterprise (Food Processing).
                  </p>
                  <p className="text-stone-600 text-xs pt-1">
                    Registered rural production unit located in Village Nandsiya, Moth, Jhansi, Uttar Pradesh.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E8DEC8] mt-6">
                <a
                  href="/certificates/udyam-certificate.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-[6px] bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] text-xs font-semibold uppercase tracking-wider transition-colors border border-[#211612]"
                >
                  <span>View Udyam Certificate (PDF)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Commitment Box */}
        <div className="bg-[#1C130E] rounded-xl p-8 sm:p-12 text-[#FAF6EE] text-center space-y-5 border border-[#C89B3C]/30 shadow-xl">
          <div className="w-12 h-12 rounded-[6px] bg-[#2A1D17] text-[#D4AF37] border border-[#C89B3C]/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl text-white font-normal">
              Direct from Nandsiya, Moth, Jhansi
            </h2>
            <p className="text-sm sm:text-base text-[#EADBB6]/90 max-w-xl mx-auto font-light">
              Every 400 g jar of Mushroom Mela is packed in a sealed jar and dispatched directly from our unit in Jhansi.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-[6px] bg-[#C89B3C] hover:bg-[#D4AF37] text-[#211612] font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <span>Shop now (Rs 399)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
