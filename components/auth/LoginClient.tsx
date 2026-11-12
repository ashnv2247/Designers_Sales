"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, AlertCircle, Eye, EyeOff, ShieldCheck, Sparkles, HelpCircle } from "lucide-react";

export const LoginClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const existing = localStorage.getItem("ds_curator_session");
    if (existing) {
      try {
        const user = JSON.parse(existing);
        if (user && user.email) {
          router.replace(redirectTarget);
        }
      } catch (e) {
        localStorage.removeItem("ds_curator_session");
      }
    }
  }, [router, redirectTarget]);

  const handleAutofill = () => {
    setEmail("curator@designersale.com.au");
    setPassword("curator123");
    setErrorMessage(null);
  };

  const executeLogin = async (loginEmail: string, loginPass: string, isDemo = false) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass, isDemo }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Authentication failed. Please verify your credentials.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Authentication successful. Redirecting to Curatorial Studio...");
      localStorage.setItem("ds_curator_session", JSON.stringify(data.user));

      setTimeout(() => {
        router.push(redirectTarget);
      }, 700);
    } catch (err) {
      setErrorMessage("Network error occurred while connecting to authentication service.");
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Please enter your curator email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your account password.");
      return;
    }
    executeLogin(email, password, false);
  };

  const handleInstantDemo = () => {
    setEmail("curator@designersale.com.au");
    setPassword("curator123");
    executeLogin("curator@designersale.com.au", "curator123", true);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      setForgotEmail("");
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex flex-col justify-between selection:bg-[#EFE9DF]">
      {/* Top Navigation Strip */}
      <header className="w-full py-4 px-6 sm:px-10 border-b border-stone-200/80 bg-white/70 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-editorial-serif text-2xl tracking-tight text-stone-950 inline-flex items-center">
            <span className="italic font-light">DS</span>
            <span className="font-light text-base ml-0.5 opacity-80">/</span>
          </Link>
          <span className="text-[9px] uppercase tracking-[0.24em] font-editorial-sans text-stone-500 font-medium">
            EDITORIAL ACCESS PORTAL
          </span>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.20em] font-editorial-sans font-medium text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO DIRECTORY</span>
        </Link>
      </header>

      {/* Main Login Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[460px] bg-white border border-stone-200/90 shadow-xl shadow-stone-900/5 p-7 sm:p-9">
          {/* Header Title */}
          <div className="text-center pb-6 border-b border-stone-100">
            <span className="text-[9px] uppercase tracking-[0.26em] font-editorial-sans font-semibold text-stone-500 block mb-1.5">
              CURATORIAL & ADMINISTRATIVE ACCESS
            </span>
            <h1 className="text-2xl sm:text-3xl font-editorial-serif font-normal text-stone-950">
              Sign In to DS/ Studio
            </h1>
            <p className="font-editorial-serif italic text-xs text-stone-600 mt-1.5 max-w-sm mx-auto">
              Manage Australian boutique profiles, update city guide itineraries, and dispatch architectural journal stories.
            </p>
          </div>

          {/* 1-Click Instant Demo Box */}
          <div className="mt-6 p-4 bg-[#F7F4EE] border border-[#E9E2D5] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.22em] font-editorial-sans font-bold text-stone-800">
                <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                1-CLICK INSTANT DEMO CURATOR
              </span>
              <button
                type="button"
                onClick={handleAutofill}
                className="text-[9px] uppercase tracking-[0.18em] font-editorial-sans text-stone-600 hover:text-stone-950 underline decoration-dotted"
                title="Populate form inputs with demo credentials"
              >
                Auto-fill inputs
              </button>
            </div>
            <p className="text-[11px] text-stone-600 font-editorial-sans leading-relaxed">
              Login immediately with full editorial privileges as <strong className="text-stone-900">Elena Roche (Chief Curator)</strong>.
            </p>
            <button
              type="button"
              onClick={handleInstantDemo}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-stone-900 text-stone-50 text-[10px] uppercase tracking-[0.22em] font-editorial-sans font-semibold hover:bg-stone-800 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>LAUNCH DEMO CURATOR STUDIO</span>
            </button>
          </div>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <span className="relative bg-white px-3 text-[9px] uppercase tracking-[0.24em] font-editorial-sans text-stone-400">
              OR SIGN IN WITH CREDENTIALS
            </span>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-[11px] font-editorial-sans">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-[11px] font-editorial-sans">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[9px] uppercase tracking-[0.20em] font-editorial-sans font-semibold text-stone-700 mb-1">
                Curator Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="curator@designersale.com.au"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[9px] uppercase tracking-[0.20em] font-editorial-sans font-semibold text-stone-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[9px] uppercase tracking-[0.16em] font-editorial-sans text-stone-500 hover:text-stone-900 transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-stone-50 border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 text-stone-900 border-stone-300 rounded focus:ring-0"
                />
                <span className="text-[10px] uppercase tracking-[0.16em] font-editorial-sans text-stone-600">
                  Remember session
                </span>
              </label>

              <span className="text-[9px] uppercase tracking-[0.18em] font-editorial-sans text-stone-400">
                TLS 256-BIT ENCRYPTION
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-2.5 px-4 bg-stone-900 text-white text-[10px] uppercase tracking-[0.24em] font-editorial-sans font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? "AUTHENTICATING..." : "SIGN IN TO STUDIO"}
            </button>
          </form>

          {/* Footer Assistance */}
          <div className="mt-7 pt-5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500 font-editorial-sans">
            <span className="inline-flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
              <span>Need editorial credentials?</span>
            </span>
            <Link href="/directory" className="uppercase tracking-[0.18em] text-stone-800 hover:underline font-medium">
              Submit Boutique
            </Link>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-stone-200 p-6 shadow-2xl">
            <h3 className="font-editorial-serif text-xl font-normal text-stone-950 mb-1">
              Reset Curator Password
            </h3>
            <p className="text-xs text-stone-600 font-editorial-sans mb-4">
              Enter your curator email address. We will transmit a secure access token to re-authorize your studio credentials.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-editorial-sans flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Recovery instructions transmitted to your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  placeholder="curator@designersale.com.au"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="px-3 py-2 bg-stone-50 border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] font-editorial-sans text-stone-600 hover:text-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-stone-900 text-white text-[9px] uppercase tracking-[0.20em] font-editorial-sans font-semibold hover:bg-stone-800"
                  >
                    Transmit Reset
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[9px] uppercase tracking-[0.26em] font-editorial-sans text-stone-400 border-t border-stone-200/60">
        DESIGNERSALE AUSTRALIA · CURATORIAL SYSTEM v2.4
      </footer>
    </div>
  );
};

export default LoginClient;
