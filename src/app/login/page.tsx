"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Shield, User, Building, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { PersonaOption } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-lg border border-indigo-400/30">
          W
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">
          Workforce PTO Orchestration
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          AI-Powered, Policy-Aware Leave Platform with Deterministic HR Verification
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl px-4 sm:px-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Quick Demo Persona Switcher (Left Column) */}
          <div className="md:col-span-7 space-y-4 border-b md:border-b-0 md:border-r border-slate-700 pb-6 md:pb-0 md:pr-6">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>One-Click Hackathon Personas</span>
            </div>
            <p className="text-xs text-slate-300">
              Select an enterprise persona to evaluate role boundaries, location-specific policies
              (Chennai vs Bangalore), and multi-tier approval workflows:
            </p>

            <div className="space-y-2.5 pt-1">
              {personas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPersona(p.id)}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700 hover:border-indigo-500/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-indigo-300 font-bold text-xs flex items-center justify-center border border-slate-600 shrink-0">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {p.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-900/50 text-indigo-300 border border-indigo-700/50">
                          {p.role}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {p.designation} • {p.location_name}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Direct Login Form (Right Column) */}
          <div className="md:col-span-5 flex flex-col justify-center space-y-4">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Standard Enterprise Login</span>
            </div>

            {error && (
              <div className="rounded-lg bg-rose-950/60 border border-rose-800 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full justify-center text-xs py-2.5"
                >
                  Sign In
                </Button>
              </div>

              <p className="text-[11px] text-center text-slate-500 pt-1">
                Default demo password for all accounts: <code className="text-slate-400">password123</code>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
