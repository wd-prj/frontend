"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  UserCheck,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { api } from "@/lib/api";
import { InvitationDetails } from "@/lib/types";

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [details, setDetails] = useState<InvitationDetails | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No invitation token provided. Please use the link provided in your invitation email.");
      setIsLoading(false);
      return;
    }

    api.getInvitationDetails(token)
      .then((data) => {
        setDetails(data);
        setError(null);
      })
      .catch((err: any) => {
        setError(err.message || "Invalid or expired invitation token.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await api.acceptInvitation(token, password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="px-6 sm:px-12 py-4 flex items-center justify-between border-b border-slate-200/90 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
        <Logo size="md" />
        <Link
          href="/login"
          className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          Return to Sign In
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto px-6 py-12 flex items-center justify-center">
        <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full blur-3xl pointer-events-none" />

          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                Verifying secure organization invitation...
              </p>
            </div>
          ) : error && !details ? (
            <div className="py-8 text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">Invitation Unavailable</h2>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                  {error}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm"
                >
                  <span>Go to Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="py-10 text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">Account Activated!</h2>
                <p className="text-xs text-slate-500">
                  Welcome to ZenithHR. Redirecting you to your enterprise workspace...
                </p>
              </div>
            </div>
          ) : details ? (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Authorized Organization Invitation</span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Welcome, {details.full_name}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  You have been provisioned as an enterprise <span className="text-indigo-600 font-bold">{details.role}</span>. Complete your profile by setting a password.
                </p>
              </div>

              {/* Organization Assignment Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-2">
                  Organizational Assignment
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      Department
                    </span>
                    <p className="font-bold text-slate-900">{details.department_name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      Team
                    </span>
                    <p className="font-bold text-slate-900">{details.team_name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      Manager
                    </span>
                    <p className="font-bold text-slate-900">{details.manager_name || "HR Leadership"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      Location
                    </span>
                    <p className="font-bold text-slate-900">{details.location_name}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-relaxed">
                  {error}
                </div>
              )}

              {/* Password Setting Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Set Account Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 text-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Activating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Activate & Enter Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 sm:px-12 py-4 border-t border-slate-200/90 bg-white text-center text-xs text-slate-500 shadow-2xs">
        © 2026 ZenithHR Technologies, Inc. All rights reserved.
      </footer>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700 text-sm">
          Loading invitation...
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
