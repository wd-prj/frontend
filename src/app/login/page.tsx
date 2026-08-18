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
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="px-6 sm:px-12 py-4 flex items-center justify-between border-b border-slate-200/90 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
        <Logo size="md" />
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100/90 px-3.5 py-1.5 rounded-full border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Enterprise Service Online</span>
        </div>
      </header>

      {/* Main Content: Split Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-12 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Platform Value Showcase & 3D Hero */}
        <div className="lg:col-span-7 space-y-7">
          <div className="space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Next-Gen Workforce Leave Management</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Policy-Aware Leave Orchestration for Modern Enterprises.
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Deterministic calculation of working days, location calendars, team coverage impact, and multi-tier approval paths with human-in-the-loop decision control.
            </p>
          </div>

          {/* 3D Visual Hero Asset */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-xl group">
            <div className="relative h-56 sm:h-72 w-full">
              <Image
                src="/images/auth-hero.jpg"
                alt="ZenithHR Platform Overview"
                fill
                priority
                className="object-cover object-center group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            </div>

            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Deterministic HR Engine</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    Zero Hallucinations • Real-Time Accruals
                  </span>
                </div>
                <h3 className="text-xs text-slate-600 font-medium mt-0.5">
                  Intelligent Absence Planning & Organization Provisioning
                </h3>
              </div>
            </div>
          </div>

          {/* Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
                <CalendarCheck2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Pre-Validation</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Instant working day exclusions</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
                <Users2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Multi-Tier Routing</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Automated policy workflows</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Compliance Audit</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Immutable state logging</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Enterprise Sign In Card */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl pointer-events-none" />

            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-slate-900">Sign In to ZenithHR</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your company credentials to access your enterprise workspace.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-relaxed">
                {error}
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 text-xs transition-all disabled:opacity-50 cursor-pointer"
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
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed text-left">
                <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Organization-Controlled Provisioning</span>
                </div>
                ZenithHR accounts are issued via email invitation from authorized HR Administrators and Managers. Received an invite? Follow the secure link in your email to set your password.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 sm:px-12 py-4 border-t border-slate-200/90 bg-white text-center sm:flex sm:justify-between sm:items-center text-xs text-slate-500 shadow-2xs">
        <div>© 2026 ZenithHR Technologies, Inc. All rights reserved.</div>
        <div className="mt-2 sm:mt-0 font-medium text-slate-500">
          Deterministic HR & PTO Automation
        </div>
      </footer>
    </div>
  );
}
