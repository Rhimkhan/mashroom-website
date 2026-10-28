"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, Menu, X, PhoneCall, User as UserIcon, Package, LogOut, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { WHATSAPP_NUMBER, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/config";

function NavbarContent() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const { totalItemsCount, setIsDrawerOpen } = useCart();
  const { user, openAuthModal, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const leftNav = [
    { href: "/our-story", label: "OUR STORY" },
    { href: "/shop", label: "SHOP" },
  ];

  const rightNav = [
    { href: "/certificates", label: "CERTIFICATES" },
    { href: "/gallery", label: "GALLERY" },
  ];

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Account";

  return (
    <>
      {/* Top clean information strip */}
      <div className="bg-[#1A110D] text-[#EADBB6] text-xs py-1.5 px-4 text-center font-serif tracking-[0.28em] uppercase flex items-center justify-center gap-3 border-b border-[#C89B3C]/20">
        <span>Jhansi, Uttar Pradesh</span>
        <span className="text-[#C89B3C]/40">•</span>
        <span>Oyster Mushroom Pickle</span>
      </div>

      {/* Main Luxury Navigation Bar with Centered Gold & Espresso Logo */}
      <header
        className={`sticky top-0 w-full transition-all duration-500 z-40 ${
          isScrolled
            ? "bg-[#FAF6EE]/95 backdrop-blur-md shadow-md py-3 border-b border-[#E6DCBF]"
            : "bg-[#FAF6EE] py-4 border-b border-[#ECE2C8]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Desktop Left: Navigation */}
            <nav className="hidden lg:flex items-center space-x-7 text-xs font-serif tracking-[0.22em] text-[#211612]">
              {/* HOME in a thin, rounded dark-espresso button */}
              <Link
                href="/"
                className={`btn-pill ${
                  pathname === "/"
                    ? "bg-[#211612] text-[#FAF6EE] border border-[#211612] shadow"
                    : "bg-[#211612] text-[#FAF6EE] hover:bg-[#34221A] border border-[#211612]"
                }`}
              >
                HOME
              </Link>

              {leftNav.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors py-1 relative group ${
                      isActive
                        ? "text-[#211612] font-bold border-b-2 border-[#211612]"
                        : "text-[#211612]/80 hover:text-[#C89B3C]"
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Top Center: Centered Gold & Deep Espresso-Brown Logo */}
            <div className="flex-1 lg:flex-initial text-center lg:px-8">
              <Link href="/" className="inline-flex flex-col items-center group">
                <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-[0.25em] text-[#211612] group-hover:text-[#A87B28] transition-colors">
                  AKHIL FOODS
                </span>
                <span className="font-serif text-xs tracking-[0.2em] text-[#A87B28] font-medium mt-0.5">
                  Jhansi, Uttar Pradesh
                </span>
              </Link>
            </div>

            {/* Desktop Right: Navigation */}
            <nav className="hidden lg:flex items-center space-x-7 text-xs font-serif tracking-[0.22em] text-[#211612]">
              {rightNav.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors py-1 relative group ${
                      isActive
                        ? "text-[#211612] font-bold border-b-2 border-[#211612]"
                        : "text-[#211612]/80 hover:text-[#C89B3C]"
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Top Right: User Account, Search & Shopping Cart Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Toggle Icon */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="btn-icon"
                aria-label="Search Collection"
                title="Search Collection"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Shopping Bag Trigger Icon */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="btn-icon relative group"
                aria-label="View Shopping Bag"
                title="View Basket"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-105 transition-transform" />
                {totalItemsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#211612] text-[#FAF6EE] text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {totalItemsCount}
                  </span>
                )}
              </button>

              {/* Customer Account Button / Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                {!user ? (
                  <button
                    type="button"
                    onClick={() => openAuthModal("signin")}
                    className="btn-pill bg-transparent text-[#211612] border border-[#DDD3C4] hover:bg-[#EDE3C8] hover:border-[#211612]"
                    title="Login / Sign up"
                    aria-label="Login or Sign up"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#211612]" />
                    <span className="hidden sm:inline">Login / Sign up</span>
                  </button>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="btn-pill bg-[#FDFBF7] text-[#211612] border border-[#DDD3C4] shadow-sm hover:bg-[#EDE3C8]"
                      aria-label="User Account Menu"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#A87B28]" />
                      <span className="max-w-[100px] truncate hidden sm:inline capitalize">
                        {displayName}
                      </span>
                      <ChevronDown className="w-3 h-3 text-[#211612]/60" />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#FAF6EE] border border-[#DDD3C4] shadow-2xl py-2 z-50 animate-in fade-in-50">
                        <div className="px-4 py-2 border-b border-[#E8DEC8]">
                          <p className="text-xs uppercase font-serif tracking-widest text-[#A87B28] font-bold">
                            Customer Account
                          </p>
                          <p className="text-xs font-medium text-[#211612] truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>

                        <Link
                          href="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#211612] hover:bg-[#EDE3C8] transition-colors font-serif"
                        >
                          <Package className="w-4 h-4 text-[#A87B28]" />
                          <span>My Orders</span>
                        </Link>

                        <div className="border-t border-[#E8DEC8] my-1" />

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            signOut();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-700 hover:bg-red-50 transition-colors font-serif text-left"
                        >
                          <LogOut className="w-4 h-4 text-red-600" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg lg:hidden text-[#211612] hover:bg-[#EDE3C8] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#211612]"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Expandable Search Input Bar */}
          {searchOpen && (
            <div className="pt-3 pb-1 border-t border-[#E6DCBF] mt-3 animate-in fade-in-50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
                className="flex items-center gap-2 max-w-md mx-auto"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#211612]/50 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search pickle, ingredients, spices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF6EE] text-[#211612] rounded-lg border border-[#D5C6A0] focus:outline-none focus:ring-1 focus:ring-[#211612]"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#211612] text-[#FAF6EE] text-xs font-serif tracking-wider uppercase hover:bg-[#34221A] transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF6EE] border-t border-[#E6DCBF] px-5 pt-5 pb-7 space-y-5 shadow-2xl animate-in slide-in-from-top-2">
            {/* Mobile Customer Authentication Section */}
            <div className="p-3 bg-[#FDFBF7] rounded-2xl border border-[#DDD3C4]">
              {!user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("signin");
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#211612] text-[#FAF6EE] text-xs font-serif tracking-wider uppercase font-bold flex items-center justify-center gap-2 shadow"
                >
                  <UserIcon className="w-4 h-4 text-[#C89B3C]" />
                  <span>Login / Sign up</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8DEC8]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#211612] text-[#FAF6EE] flex items-center justify-center text-xs font-bold uppercase">
                        {displayName.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-[#211612] leading-none capitalize">
                          {displayName}
                        </p>
                        <p className="text-xs text-[#3D2C24]/60 truncate max-w-[170px] mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 px-3 rounded-lg bg-[#FAF6EE] border border-[#DDD3C4] text-xs font-serif text-[#211612] flex items-center justify-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5 text-[#A87B28]" />
                      <span>My Orders</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut();
                      }}
                      className="py-2 px-3 rounded-lg bg-red-50 border border-red-200 text-xs font-serif text-red-700 flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1 font-serif tracking-[0.2em] text-xs">
              <span className="text-xs tracking-[0.3em] uppercase font-sans text-[#211612]/50 px-3 block mb-1">
                Navigation
              </span>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                  pathname === "/"
                    ? "bg-[#211612] text-[#FAF6EE] font-bold"
                    : "text-[#211612] hover:bg-[#EDE3C8]"
                }`}
              >
                HOME
              </Link>
              {[...leftNav, ...rightNav].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                    pathname === link.href
                      ? "bg-[#211612] text-[#FAF6EE] font-bold"
                      : "text-[#211612] hover:bg-[#EDE3C8]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Client Services & Utilities */}
            <div className="pt-3 border-t border-[#E6DCBF] space-y-1 text-xs">
              <span className="text-xs tracking-[0.3em] uppercase font-sans text-[#211612]/50 px-3 block mb-1">
                Client Services
              </span>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2 rounded-xl transition-all ${
                  pathname === "/account"
                    ? "bg-[#211612] text-[#FAF6EE] font-bold"
                    : "text-[#211612]/80 hover:bg-[#EDE3C8]"
                }`}
              >
                Customer Account & Orders
              </Link>
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2 rounded-xl transition-all ${
                  pathname === "/track-order"
                    ? "bg-[#211612] text-[#FAF6EE] font-bold"
                    : "text-[#211612]/80 hover:bg-[#EDE3C8]"
                }`}
              >
                Track Order
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2 rounded-xl transition-all ${
                  pathname === "/faq"
                    ? "bg-[#211612] text-[#FAF6EE] font-bold"
                    : "text-[#211612]/80 hover:bg-[#EDE3C8]"
                }`}
              >
                FAQ & Storage
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2 rounded-xl transition-all ${
                  pathname === "/contact"
                    ? "bg-[#211612] text-[#FAF6EE] font-bold"
                    : "text-[#211612]/80 hover:bg-[#EDE3C8]"
                }`}
              >
                Contact
              </Link>
            </div>

            {/* WhatsApp Order */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-[#211612] text-[#FAF6EE] text-xs font-serif tracking-[0.2em] uppercase font-bold flex items-center justify-center gap-2 border border-[#211612] shadow"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#C89B3C]" />
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 w-full z-40 bg-[#FAF6EE] py-4 border-b border-[#ECE2C8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <span className="font-serif text-2xl font-bold tracking-[0.25em] text-[#211612]">
              AKHIL FOODS
            </span>
          </div>
        </header>
      }
    >
      <NavbarContent />
    </Suspense>
  );
}
