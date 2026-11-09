"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { BRAND } from "@/lib/brand";
import { WHATSAPP_NUMBER, PHONE_DISPLAY } from "@/lib/config";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";

function validateNextParam(nextParam: string | null): string {
  if (!nextParam) return "/shop";
  const trimmed = nextParam.trim();
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\") &&
    !trimmed.includes("://")
  ) {
    return trimmed;
  }
  return "/shop";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const safeNext = validateNextParam(nextParam);

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "forgot">("signin");

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, redirect to safe next route
  React.useEffect(() => {
    if (user) {
      router.replace(safeNext);
    }
  }, [user, safeNext, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Authentication service is currently offline. Please try again shortly.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const lowerMsg = error.message.toLowerCase();
        if (lowerMsg.includes("invalid login credentials")) {
          setErrorMsg("Invalid email or wrong password.");
        } else if (lowerMsg.includes("email not confirmed")) {
          setErrorMsg("Please verify your email address to continue.");
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        window.location.href = safeNext;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during sign in.";
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (!cleanEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Authentication service is currently offline. Please try again shortly.");
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      if (error) {
        const lowerMsg = error.message.toLowerCase();
        if (lowerMsg.includes("already registered") || lowerMsg.includes("already in use")) {
          setErrorMsg("This email is already registered. Please sign in instead.");
        } else if (lowerMsg.includes("password should be at least") || lowerMsg.includes("weak")) {
          setErrorMsg("Password is too weak. Please use at least 8 characters.");
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        // Logged in immediately
        window.location.href = safeNext;
      } else if (data.user) {
        setSuccessMsg("Account created successfully. Please check your inbox for confirmation instructions, or sign in now.");
        setActiveTab("signin");
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during registration.";
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg("Please enter your email address to receive password reset instructions.");
      return;
    }

    setLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Authentication service is currently offline. Please try again shortly.");
      }

      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, "");
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${appUrl}/reset-password`,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(
          "Password reset link has been dispatched to your email. Please check your inbox to choose a new password."
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to request password reset.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FAF6EE] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#211612] tracking-wider">
              {BRAND.name}
            </span>
          </Link>
          <p className="text-xs font-serif tracking-[0.2em] uppercase text-[#A87B28]">
            Customer Account Portal
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-md border border-[#E8DEC8] shadow-sm space-y-6">
          {/* Tabs Navigation */}
          {activeTab !== "forgot" ? (
            <div className="grid grid-cols-2 border-b border-[#E8DEC8] text-center text-sm font-serif">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signin");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`pb-3 font-bold transition-colors ${
                  activeTab === "signin"
                    ? "border-b-2 border-[#211612] text-[#211612]"
                    : "text-[#3D2C24]/60 hover:text-[#211612]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signup");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`pb-3 font-bold transition-colors ${
                  activeTab === "signup"
                    ? "border-b-2 border-[#211612] text-[#211612]"
                    : "text-[#3D2C24]/60 hover:text-[#211612]"
                }`}
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-3 text-sm font-serif">
              <span className="font-bold text-[#211612]">Reset Password</span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signin");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-[#A87B28] hover:text-[#211612] underline"
              >
                Back to Sign in
              </button>
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-md text-xs sm:text-sm flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Sign In Form */}
          {activeTab === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#211612] block">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#3D2C24]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#211612]">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("forgot");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-[#A87B28] hover:text-[#211612] underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#3D2C24]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-md bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] text-xs font-serif font-bold uppercase tracking-[0.18em] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C89B3C]" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 text-[#C89B3C]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Create Account Form */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#211612] block">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#3D2C24]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#211612] block">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#3D2C24]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#211612] block">
                  Password (min. 8 characters) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#3D2C24]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#211612] block">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-[#3D2C24]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-md bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] text-xs font-serif font-bold uppercase tracking-[0.18em] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C89B3C]" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 text-[#C89B3C]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {activeTab === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#211612] block">
                  Account Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#3D2C24]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-md bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] text-xs font-serif font-bold uppercase tracking-[0.18em] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C89B3C]" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-[#C89B3C]" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>

              {/* Mandatory Assistance Note */}
              <div className="pt-3 border-t border-[#E8DEC8] text-center space-y-1.5">
                <p className="text-xs text-[#3D2C24]/80">
                  If you do not receive an email, message us on WhatsApp {PHONE_DISPLAY}.
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Akhil Foods, I need help resetting my account password.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Message Support on WhatsApp</span>
                </a>
              </div>
            </form>
          )}
        </div>

        {/* Security Assurance Footer */}
        <div className="text-center text-xs text-[#3D2C24]/70 space-y-1">
          <p>
            Secure Supabase Authentication. Passwords are encrypted and never stored in plain text.
          </p>
          <p>
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[#211612]">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="underline hover:text-[#211612]">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF6EE] p-4">
          <div className="w-8 h-8 border-2 border-[#211612] border-t-transparent rounded-md animate-spin mx-auto" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
