import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/lib/brand";
import {
  WHATSAPP_NUMBER,
  PHONE_DISPLAY,
  TEL_LINK,
  WHATSAPP_DEFAULT_MESSAGE,
  FSSAI_NUMBER,
  FSSAI_VALIDITY,
  GST_NUMBER,
  UDYAM_NUMBER,
} from "@/lib/config";
import {
  Mail,
  Phone,
  MapPin,
  Heart,
  Award,
  Sparkles,
  ShieldCheck,
  FileText,
  MessageSquare,
} from "lucide-react";

export default function Footer() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

  return (
    <footer className="bg-[#160E0A] text-[#FAF6EE] border-t border-[#C89B3C]/30 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-[#C89B3C]/20 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#2A1D17] flex items-center justify-center text-[#D4AF37] mb-3 shadow-sm border border-[#C89B3C]/25">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-semibold text-sm text-[#FAF6EE]">Made in Jhansi</h3>
            <p className="text-xs text-[#EADBB6]/70 mt-1 font-light">Village Nandsiya, Moth (UP)</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#2A1D17] flex items-center justify-center text-[#D4AF37] mb-3 shadow-sm border border-[#C89B3C]/25">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-semibold text-sm text-[#FAF6EE]">Pure Spices & Oil</h3>
            <p className="text-xs text-[#EADBB6]/70 mt-1 font-light">Mustard oil & whole spices</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#2A1D17] flex items-center justify-center text-[#D4AF37] mb-3 shadow-sm border border-[#C89B3C]/25">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-semibold text-sm text-[#FAF6EE]">Oyster Mushrooms</h3>
            <p className="text-xs text-[#EADBB6]/70 mt-1 font-light">Tender 400 g jar packaging</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#2A1D17] flex items-center justify-center text-[#D4AF37] mb-3 shadow-sm border border-[#C89B3C]/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-semibold text-sm text-[#FAF6EE]">FSSAI Registered</h3>
            <p className="text-xs text-[#EADBB6]/70 mt-1 font-light">Lic. No. {FSSAI_NUMBER}</p>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12">
          {/* Brand Info & Registrations */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#C89B3C]/50 bg-[#120B08]">
                <Image
                  src={BRAND.logo}
                  alt={`${BRAND.name} Logo`}
                  fill
                  loading="lazy"
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-wider text-[#FAF6EE]">
                  {BRAND.name}
                </span>
                <p className="text-xs font-serif text-[#D4AF37] tracking-[0.2em] uppercase">{BRAND.tagline}</p>
              </div>
            </div>
            <p className="text-sm text-[#EADBB6]/85 leading-relaxed font-light">
              Oyster mushroom pickle made in Jhansi with mustard oil and spices. Dedicated to honesty, safety, and authentic Indian taste.
            </p>

            {/* Government & Food Safety Registrations Box */}
            <div className="space-y-2 pt-1">
              <div className="text-xs text-[#D4AF37] font-serif bg-[#2A1D17] px-3.5 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1 border border-[#C89B3C]/30">
                <span className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>FSSAI Lic. No. {FSSAI_NUMBER}</span>
                </span>
                <span className="text-caption text-[#EADBB6]/80">(Valid till {FSSAI_VALIDITY})</span>
              </div>
              <div className="flex flex-wrap gap-2 text-caption font-serif text-[#EADBB6]">
                <span className="bg-[#2A1D17] px-3 py-1.5 rounded-lg border border-[#C89B3C]/20">
                  GSTIN: <strong className="text-[#D4AF37]">{GST_NUMBER}</strong>
                </span>
                <span className="bg-[#2A1D17] px-3 py-1.5 rounded-lg border border-[#C89B3C]/20">
                  Udyam: <strong className="text-[#D4AF37]">{UDYAM_NUMBER}</strong>
                </span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="pt-2">
              <p className="text-xs font-serif tracking-[0.18em] uppercase text-[#D4AF37] mb-2 font-medium">Connect with Us:</p>
              <div className="flex items-center gap-2.5">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#2A1D17] hover:bg-[#C89B3C] text-[#D4AF37] hover:text-[#211612] flex items-center justify-center transition-all border border-[#C89B3C]/30"
                  aria-label="WhatsApp"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>

                {process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
                  <a
                    href={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#2A1D17] hover:bg-[#C89B3C] text-[#D4AF37] hover:text-[#211612] flex items-center justify-center transition-all border border-[#C89B3C]/30"
                    aria-label="Instagram"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}

                {process.env.NEXT_PUBLIC_FACEBOOK_URL && (
                  <a
                    href={process.env.NEXT_PUBLIC_FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#2A1D17] hover:bg-[#C89B3C] text-[#D4AF37] hover:text-[#211612] flex items-center justify-center transition-all border border-[#C89B3C]/30"
                    aria-label="Facebook"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.8C10.5 0 9 1.5 9 4.5V8z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold text-[#D4AF37] tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-[#EADBB6]/80 font-light">
              <li>
                <Link href="/" className="hover:text-[#D4AF37] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#D4AF37] transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/our-story" className="hover:text-[#D4AF37] transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#D4AF37] transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#D4AF37] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#D4AF37] transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Certificates */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold text-[#D4AF37] tracking-wider">Policies & Certificates</h3>
            <ul className="space-y-2.5 text-sm text-[#EADBB6]/80 font-light">
              <li>
                <Link href="/privacy-policy" className="hover:text-[#D4AF37] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#D4AF37] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-[#D4AF37] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[#D4AF37] transition-colors">
                  Refund & Replacement
                </Link>
              </li>
              <li>
                <Link
                  href="/certificates"
                  className="hover:text-[#D4AF37] text-[#D4AF37] font-medium transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Certificates & Licences</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Address & Contact */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold text-[#D4AF37] tracking-wider">Business Address & Contact</h3>
            <ul className="space-y-2.5 text-sm text-[#EADBB6]/80 font-light">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{BRAND.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37]"
                >
                  WhatsApp: +91 63864 23865
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a href={TEL_LINK} className="hover:text-[#D4AF37]">
                  Phone: {PHONE_DISPLAY}
                </a>
              </li>
              {contactEmail && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <a href={`mailto:${contactEmail}`} className="hover:text-[#D4AF37]">
                    {contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom copyright & Mandatory Links Strip */}
        <div className="pt-8 border-t border-[#C89B3C]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-[#EADBB6]/70 gap-4 font-light">
          <p>© 2026 {BRAND.name}. All rights reserved. Made in Jhansi, Uttar Pradesh.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link href="/privacy-policy" className="hover:text-[#D4AF37]">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#D4AF37]">Terms</Link>
            <span>•</span>
            <Link href="/shipping-policy" className="hover:text-[#D4AF37]">Shipping</Link>
            <span>•</span>
            <Link href="/refund-policy" className="hover:text-[#D4AF37]">Refund</Link>
            <span>•</span>
            <Link href="/certificates" className="hover:text-[#D4AF37]">Certificates</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
