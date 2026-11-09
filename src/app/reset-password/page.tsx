"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { BRAND } from "@/lib/brand";
import {
  Lock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Authentication service is currently unavailable. Please try again shortly.");
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#FAF6EE] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#211612] tracking-wider">
              {BRAND.name}
            </span>
          </Link>
          <p className="text-xs font-serif tracking-[0.2em] uppercase text-[#A87B28]">
            Set New Password
          </p>
        </div>

        <div className="bg-[#FDFBF7] p-6 sm:p-8 rounded-md border border-[#E8DEC8] shadow-sm space-y-6">
          {success ? (
            <div className="text-center space-y-4 py-3">
              <div className="w-12 h-12 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#211612]">
                Password Updated Successfully
              </h2>
              <p className="text-sm text-[#3D2C24]/85">
                Your new password has been securely saved. You can now access your account and continue shopping.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full py-3 rounded-md bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] text-xs font-serif font-bold uppercase tracking-[0.18em] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Sign In to Continue</span>
                  <ArrowRight className="w-4 h-4 text-[#C89B3C]" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <p className="text-xs text-[#3D2C24]/85 leading-relaxed">
                Choose a strong new password with at least 8 characters for your account.
              </p>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-xs sm:text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#211612] block">
                  New Password (min. 8 characters) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#3D2C24]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Enter at least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-[#E8DEC8] bg-[#FAF6EE] text-sm text-[#211612] focus:outline-none focus:ring-2 focus:ring-[#211612]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#211612] block">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-[#3D2C24]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Re-enter new password"
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
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Save New Password</span>
                    <ArrowRight className="w-4 h-4 text-[#C89B3C]" />
                  </>
                )}
              </button>

              {/* Mandatory Assistance Note */}
              <div className="pt-3 border-t border-[#E8DEC8] text-center space-y-1.5">
                <p className="text-xs text-[#3D2C24]/80">
                  If you do not receive an email, message us on WhatsApp +91 63864 23865.
                </p>
                <a
                  href="https://wa.me/916386423865?text=Hello%20Akhil%20Foods,%20I%20need%20assistance%20with%20password%20reset."
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
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF6EE] p-4">
          <div className="w-8 h-8 border-2 border-[#211612] border-t-transparent rounded-md animate-spin mx-auto" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

