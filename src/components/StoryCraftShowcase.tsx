import React from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { BRAND } from "@/lib/brand";

export default function StoryCraftShowcase() {
  const steps = [
    {
      step: "01",
      title: "Fresh Oyster Harvest & Prep",
      desc: "Selected fresh oyster mushrooms are hand-trimmed, washed in filtered water, and gently prepared to lock in tenderness and meaty texture.",
      image: "/images/jhansi-harvest.jpg",
    },
    {
      step: "02",
      title: "Pure Mustard Oil & Whole Spices",
      desc: "Steeped in pure cold-pressed mustard oil with roasted coriander seeds, mustard, fennel, fenugreek, cumin, turmeric, ajwain, fresh ginger, and garlic.",
      image: "/images/spices-mustard-oil.jpg",
    },
    {
      step: "03",
      title: "Artisanal Curing in Moth, Jhansi",
      desc: "Slowly aged in traditional batches under the Uttar Pradesh sun to achieve the unmistakable deep tangy, savoury flavor profile.",
      image: "/images/clay-pot-aging.jpg",
    },
  ];

  return (
    <div className="space-y-8 my-8">
      {/* 3 Step Visual Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((item) => (
          <div
            key={item.step}
            className="rounded-2xl overflow-hidden bg-[#FDFBF7] border border-[#E8DEC8] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1C130E]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C130E]/80 via-transparent to-transparent" />
              <span className="absolute top-3.5 left-3.5 bg-[#1C130E]/90 text-[#FAF6EE] text-xs font-bold px-3 py-1 rounded-full shadow-md border border-[#C89B3C]/40 backdrop-blur-sm">
                Step {item.step}
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#211612] group-hover:text-[#A87B28] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-[#3D2C24]/80 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#A87B28]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Homemade Process</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Craft Banner */}
      <div className="bg-[#1C130E] text-[#FAF6EE] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#C89B3C]/30 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#2A1D17] text-[#C89B3C] border border-[#C89B3C]/30 flex items-center justify-center font-serif font-black text-xl shadow-md shrink-0">
            🌾
          </div>
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#FAF6EE]">
              Handcrafted in Village Nandsiya, Moth, Jhansi
            </h3>
            <p className="text-xs text-[#FAF6EE]/75 mt-0.5">
              Operating with active FSSAI License No. {BRAND.fssaiNumber} under strict food hygiene standards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="bg-[#2A1D17] text-[#C89B3C] text-xs font-semibold px-4 py-2 rounded-full border border-[#C89B3C]/30">
            No Artificial Shortcuts
          </span>
        </div>
      </div>
    </div>
  );
}
