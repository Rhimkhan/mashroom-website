"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [authModalMode, isAuthModalOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const res = await signInWithEmail(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        }
      } else {
        const res = await signUpWithEmail(email, password, fullName);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.message) {
          setSuccessMsg(res.message);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Google authentication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-50">
      <div
        className="relative w-full max-w-md bg-[#FAF6EE] border border-[#C89B3C]/40 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden animate-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient subtle warm gold glow in corner */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#C89B3C]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-[#211612]/60 hover:text-[#211612] hover:bg-[#EDE3C8] transition-colors focus:outline-none focus:ring-1 focus:ring-[#211612]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Title */}
        <div className="text-center mb-6">
          <span className="font-serif text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#A87B28] font-bold block mb-1">
            AKHIL FOODS • ATELIER ACCOUNT
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#211612]">
            {mode === "signin" ? "Welcome Back" : "Join The Atelier"}
          </h2>
          <p className="text-xs text-[#3D2C24]/80 mt-1 font-light">
            {mode === "signin"
              ? "Access your artisanal orders and track your deliveries."
              : "Create an account for one-click ordering and live order tracking."}
          </p>
        </div>

        {/* Tabs: Sign In / Create Account */}
        <div className="flex bg-[#EFE8DD] p-1 rounded-xl mb-6 border border-[#DDD3C4]">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-serif tracking-wider uppercase rounded-lg transition-all ${
              mode === "signin"
                ? "bg-[#211612] text-[#FAF6EE] font-bold shadow-sm"
                : "text-[#211612]/80 hover:text-[#211612]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-serif tracking-wider uppercase rounded-lg transition-all ${
              mode === "signup"
                ? "bg-[#211612] text-[#FAF6EE] font-bold shadow-sm"
                : "text-[#211612]/80 hover:text-[#211612]"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Google OAuth Quick Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-[#FDFBF7] hover:bg-[#FAF6EE] border border-[#DDD3C4] hover:border-[#C89B3C] text-xs font-serif text-[#211612] flex items-center justify-center gap-2.5 transition-all shadow-sm mb-4 group disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="tracking-wider">Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[#E8DEC8] w-full" />
          <span className="bg-[#FAF6EE] px-3 text-[11px] font-serif text-[#211612]/60 uppercase tracking-widest absolute">
            or with email
          </span>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3 bg-red-50/90 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2 mb-4 animate-in fade-in-50">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <p className="leading-tight">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2 mb-4 animate-in fade-in-50">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <p className="leading-tight">{successMsg}</p>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="block text-[11px] font-serif uppercase tracking-wider text-[#211612]/80 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#211612]/40 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FDFBF7] text-[#211612] rounded-xl border border-[#DDD3C4] focus:outline-none focus:ring-1 focus:ring-[#211612]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-serif uppercase tracking-wider text-[#211612]/80 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#211612]/40 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FDFBF7] text-[#211612] rounded-xl border border-[#DDD3C4] focus:outline-none focus:ring-1 focus:ring-[#211612]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-serif uppercase tracking-wider text-[#211612]/80 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#211612]/40 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FDFBF7] text-[#211612] rounded-xl border border-[#DDD3C4] focus:outline-none focus:ring-1 focus:ring-[#211612]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-[#211612] hover:bg-[#34221A] text-[#FAF6EE] font-serif font-bold text-xs tracking-[0.2em] uppercase shadow-lg transition-all flex items-center justify-center gap-2 border border-[#C89B3C]/40 hover:border-[#C89B3C] disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-[#FAF6EE] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === "signin" ? "Sign In to Atelier" : "Create My Account"}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C89B3C]" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle Note */}
        <div className="text-center mt-5 pt-4 border-t border-[#E8DEC8] text-xs text-[#3D2C24]/75">
          {mode === "signin" ? (
            <p>
              Don&apos;t have an account yet?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                }}
                className="font-bold text-[#211612] underline hover:text-[#A87B28] transition-colors"
              >
                Sign up here
              </button>
            </p>
          ) : (
            <p>
              Already an Atelier member?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg(null);
                }}
                className="font-bold text-[#211612] underline hover:text-[#A87B28] transition-colors"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
