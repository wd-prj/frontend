"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Shield,
  Lock,
  Mail,
  User,
  Building2,
  MapPin,
  Briefcase,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { OrgMetaResponse, UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [designation, setDesignation] = useState("Software Engineer");
  const [departmentId, setDepartmentId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [role, setRole] = useState<UserRole>("EMPLOYEE");

  // Org Metadata
  const [orgMeta, setOrgMeta] = useState<OrgMetaResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    api
      .getOrgMetadata()
      .then((meta) => {
        setOrgMeta(meta);
        if (meta.departments.length > 0) setDepartmentId(meta.departments[0].id);
        if (meta.locations.length > 0) setLocationId(meta.locations[0].id);
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.login(loginEmail, loginPassword);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.register({
        full_name: fullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        designation: designation.trim(),
        department_id: departmentId,
        location_id: locationId,
        role: role,
      });
      setSuccessMsg("Account registered successfully! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar Brand Header */}
      <header className="h-18 px-6 lg:px-12 flex items-center justify-between border-b border-slate-200/80 bg-white shadow-2xs">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Enterprise Service Online
          </span>
        </div>
      </header>

      {/* Main Grid: Visual Hero Card & Form */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-12 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          
          {/* Left Column: Visual Brand Showcase with Generated 3D Asset */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Next-Gen Workforce Leave Management
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
                Policy-Aware Leave Orchestration for Modern Enterprises.
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                Deterministic calculation of working days, location calendars, team coverage impact,
                and multi-tier approval paths with human-in-the-loop decision control.
              </p>
            </div>

            {/* Generated Hero 3D Graphic */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-white group">
              <img
                src="/images/auth-hero.jpg"
                alt="ZenithHR Platform Overview"
                className="w-full h-64 sm:h-76 object-cover transform group-hover:scale-101 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-xs">
                    Deterministic HR Engine
                  </span>
                  <span className="text-xs text-slate-200 font-medium">
                    Zero Hallucinations • Real-Time Accruals
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-1 text-white">
                  Intelligent Absence Planning & Approvals
                </h3>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <Zap className="w-4 h-4 text-amber-500 mb-1.5" />
                <h4 className="text-xs font-bold text-slate-900">Pre-Validation</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Instant working day exclusions</p>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <Layers className="w-4 h-4 text-indigo-600 mb-1.5" />
                <h4 className="text-xs font-bold text-slate-900">Multi-Tier Routing</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Automated policy workflows</p>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <Shield className="w-4 h-4 text-emerald-600 mb-1.5" />
                <h4 className="text-xs font-bold text-slate-900">Compliance Audit</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Immutable state logging</p>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-xl space-y-5">
              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className={`py-2.5 text-sm font-bold rounded-xl transition-all ${
                    mode === "login"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className={`py-2.5 text-sm font-bold rounded-xl transition-all ${
                    mode === "register"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Feedback Alerts */}
              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-800 animate-in fade-in-50">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {mode === "login" ? (
                /* Sign In Form */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        placeholder="name@company.com"
                        className="w-full rounded-xl bg-slate-50 border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full rounded-xl bg-slate-50 border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      className="w-full justify-center text-sm py-3 font-bold rounded-xl shadow-xs"
                    >
                      Sign In to Workspace
                    </Button>
                  </div>
                </form>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="Alex Morgan"
                        className="w-full rounded-xl bg-slate-50 border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        placeholder="alex.morgan@company.com"
                        className="w-full rounded-xl bg-slate-50 border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        required
                        placeholder="Staff Engineer"
                        className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                        Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      >
                        <option value="EMPLOYEE">Employee (IC)</option>
                        <option value="MANAGER">Manager</option>
                        <option value="HR_ADMIN">HR Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                        Department
                      </label>
                      <select
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      >
                        {orgMeta?.departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                        Location
                      </label>
                      <select
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      >
                        {orgMeta?.locations.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        placeholder="Create strong password"
                        className="w-full rounded-xl bg-slate-50 border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      className="w-full justify-center text-sm py-3 font-bold rounded-xl shadow-xs"
                    >
                      Create Account & Enter
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 px-6 lg:px-12 flex items-center justify-between border-t border-slate-200 bg-white text-xs text-slate-400">
        <span>© 2026 ZenithHR Technologies, Inc. All rights reserved.</span>
        <span>Deterministic HR & PTO Automation</span>
      </footer>
    </div>
  );
}
