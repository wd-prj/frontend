"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  CalendarCheck2,
  Users2,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await api.login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="px-6 sm:px-12 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        <Logo size="md" />
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/60">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Enterprise Service Online
        </div>
      </header>

      {/* Main Content: Split Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-12 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Platform Value Showcase & 3D Hero */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              Next-Gen Workforce Leave Management
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Policy-Aware Leave Orchestration for Modern Enterprises.
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
              Deterministic calculation of working days, location calendars, team coverage impact, and multi-tier approval paths with human-in-the-loop decision control.
            </p>
          </div>

          {/* 3D Visual Hero Asset */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl group">
            <div className="relative h-56 sm:h-72 w-full">
              <Image
                src="/images/auth-hero.jpg"
                alt="ZenithHR Platform Overview"
                fill
                priority
                className="object-cover object-center group-hover:scale-102 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            </div>

            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Deterministic HR Engine</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Zero Hallucinations • Real-Time Accruals
                  </span>
                </div>
                <h3 className="text-xs text-slate-300 font-medium mt-0.5">
                  Intelligent Absence Planning & Organization Provisioning
                </h3>
              </div>
            </div>
          </div>

          {/* Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-3">
              <CalendarCheck2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Pre-Validation</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Instant working day exclusions</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-3">
              <Users2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Multi-Tier Routing</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Automated policy workflows</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Compliance Audit</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Immutable state logging</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Enterprise Sign In Form */}
        <div className="lg:col-span-5">
          <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Sign In to ZenithHR</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your company credentials to access your enterprise workspace.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium leading-relaxed">
                {error}
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Enterprise Provisioning Notice */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed text-left">
                <div className="flex items-center gap-2 font-bold text-slate-300 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Organization-Controlled Provisioning</span>
                </div>
                ZenithHR accounts are issued via email invitation from authorized HR Administrators and Managers. Received an invite? Follow the secure link in your email to set your password.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 sm:px-12 py-5 border-t border-slate-800/80 bg-slate-950/40 text-center sm:flex sm:justify-between sm:items-center text-xs text-slate-400">
        <div>© 2026 ZenithHR Technologies, Inc. All rights reserved.</div>
        <div className="mt-2 sm:mt-0 font-medium text-slate-400">
          Deterministic HR & PTO Automation
        </div>
      </footer>
    </div>
  );
}
