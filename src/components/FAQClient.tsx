"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, MessageCircle, HelpCircle, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { FAQ_DATA } from "@/lib/faq-data";

export default function FAQClient() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = [
    { key: "all", label: "All Questions" },
    { key: "ingredients", label: "Ingredients & Purity" },
    { key: "preparation", label: "Preparation & Location" },
    { key: "storage", label: "Shelf Life & Care" },
    { key: "shipping", label: "Packaging & Delivery" },
  ];

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-12 sm:py-20 bg-[#FAF6EE] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-[#FAF6EE] bg-[#1C130E] px-4 py-1.5 rounded-full border border-[#C89B3C]/40 inline-flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span>Customer Knowledge Base</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#211612]">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-[#3D2C24]/80 max-w-xl mx-auto">
            Everything you need to know about our Mushroom Mela Oyster Mushroom Pickle, ingredients, certifications, and delivery.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search questions (e.g. oil, shelf life, shipping, vegan)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#FDFBF7] border border-[#E8DEC8] text-sm text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612] shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setActiveCategory(cat.key);
                setOpenIndex(0);
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat.key
                  ? "bg-[#211612] text-[#FAF6EE] border border-[#C89B3C]/40 shadow-sm scale-105"
                  : "bg-[#FDFBF7] text-[#211612] hover:bg-[#FAF6EE] border border-[#E8DEC8]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-[#FDFBF7] rounded-3xl border border-[#E8DEC8] p-8 space-y-3">
              <p className="text-sm text-[#3D2C24]/80">No questions matched &ldquo;{search}&rdquo;.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("all");
                }}
                className="text-sm font-bold text-[#211612] underline"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#FDFBF7] rounded-2xl border border-[#E8DEC8] overflow-hidden shadow-sm transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between font-serif font-bold text-sm sm:text-base text-[#211612] hover:bg-[#FAF6EE]/60 transition-colors gap-4"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#A87B28] shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-sm text-[#3D2C24]/85 leading-relaxed border-t border-[#E8DEC8] bg-[#FAF6EE]/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions CTA */}
        <div className="bg-[#1C130E] p-8 sm:p-10 rounded-3xl border border-[#C89B3C]/30 text-center space-y-4 shadow-xl text-[#FAF6EE]">
          <HelpCircle className="w-10 h-10 text-[#C89B3C] mx-auto" />
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#FAF6EE]">Still Have Any Questions?</h2>
            <p className="text-sm text-[#FAF6EE]/80 max-w-md mx-auto leading-relaxed">
              Our team in Jhansi is always happy to discuss ingredients, certificates, and delivery statuses directly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={`https://wa.me/${BRAND.whatsappNumber}?text=Hi%20Akhil%20Foods,%20I%20have%20a%20question%20about%20your%20oyster%20mushroom%20pickles.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3 rounded-full bg-[#25D366] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#20ba59] transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Ask on WhatsApp Directly</span>
            </a>
            <Link
              href="/contact"
              className="px-7 py-3 rounded-full bg-[#211612] hover:bg-[#2A1D17] text-[#FAF6EE] border border-[#C89B3C]/40 font-bold text-sm transition-colors"
            >
              Contact Support Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
