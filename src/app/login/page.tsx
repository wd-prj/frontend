"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Shield, User, Building, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { PersonaOption } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [email, setEmail] = useState("arun.kumar@company.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getPersonas().then(setPersonas).catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPersona = async (personaId: string) => {
    setIsLoading(true);
    setError("");
    try {
      await api.switchPersona(personaId);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Persona switch failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-md">
          W
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
          Workforce PTO Orchestration
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          AI-Powered Leave Platform with Deterministic Policy Verification
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl px-4 sm:px-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-lg">
          {/* Quick Demo Persona Switcher (Left Column) */}
          <div className="md:col-span-7 space-y-4 border-b md:border-b-0 md:border-r border-slate-100 pb-8 md:pb-0 md:pr-8">
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Select Enterprise Persona</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore role-based boundaries, regional location rules (Chennai vs. Bangalore), and multi-tier approval workflows:
            </p>

            <div className="space-y-2.5 pt-1">
              {personas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPersona(p.id)}
                  disabled={isLoading}
                  className="w-full text-left p-3.5 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-300 transition-all flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-white text-indigo-700 font-bold text-sm flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                          {p.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100/80 text-indigo-800 border border-indigo-200/60">
                          {p.role}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        {p.designation} • {p.location_name} Office
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Direct Login Form (Right Column) */}
          <div className="md:col-span-5 flex flex-col justify-center space-y-5">
            <div className="flex items-center gap-2 text-slate-800 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Direct Sign-In</span>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-medium text-rose-800">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full justify-center text-sm py-2.5 rounded-xl shadow-xs"
                >
                  Sign In
                </Button>
              </div>

              <p className="text-xs text-center text-slate-500 pt-1">
                Default demo password: <code className="font-semibold text-slate-700">password123</code>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
