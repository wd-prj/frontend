"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { AuditLogItem, UserProfile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default function AuditPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getMe()
      .then((profile) => {
        setUser(profile);
        if (profile.role === "HR_ADMIN") {
          return api.getAuditTrail(100).then(setLogs);
        } else {
          setError("Access Restricted: Only HR Administrators have permission to view the compliance audit trail.");
        }
      })
      .catch((err) => {
        console.error("Audit load error", err);
        setError("Failed to load audit trail.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && user && user.role !== "HR_ADMIN") {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">HR Administrator Access Required</h2>
        <p className="text-sm text-slate-600">
          The Enterprise Compliance Audit Trail contains immutable system-wide logs and is restricted exclusively to authorized HR Administrators.
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/90 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise HR Audit Trail</h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable record of authoritative human state changes, validations, and workflow decisions.
          </p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
          HR Admin Compliance
        </span>
      </div>

      <Card className="rounded-2xl border-slate-200/90 shadow-2xs">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-14 text-center text-sm text-slate-400">Loading audit trail...</div>
          ) : error ? (
            <div className="p-14 text-center text-sm text-rose-500 font-medium">{error}</div>
          ) : logs.length === 0 ? (
            <div className="p-14 text-center text-sm text-slate-400">No audit events recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5 font-bold">Timestamp</th>
                    <th className="px-6 py-3.5 font-bold">Actor</th>
                    <th className="px-6 py-3.5 font-bold">Action</th>
                    <th className="px-6 py-3.5 font-bold">Entity Type</th>
                    <th className="px-6 py-3.5 font-bold">Entity ID</th>
                    <th className="px-6 py-3.5 font-bold">State Changes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs whitespace-nowrap font-medium">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {log.actor_email || "System"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold border ${
                            log.action.includes("APPROVE")
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : log.action.includes("REJECT")
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : log.action.includes("SUBMIT")
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-semibold">
                        {log.entity_type}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400 font-medium">
                        {log.entity_id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs max-w-xs truncate">
                        {log.new_state ? JSON.stringify(log.new_state) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
