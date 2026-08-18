"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Layers, Clock, User, Filter } from "lucide-react";
import { api } from "@/lib/api";
import { AuditLogItem } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .getAuditTrail(100)
      .then(setLogs)
      .catch((err) => console.error("Audit load error", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Enterprise HR Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of authoritative human state changes, validations, and workflow decisions.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
          Compliance & Traceability
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading audit trail...</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No audit events recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Timestamp</th>
                    <th className="px-6 py-3 font-semibold">Actor</th>
                    <th className="px-6 py-3 font-semibold">Action</th>
                    <th className="px-6 py-3 font-semibold">Entity Type</th>
                    <th className="px-6 py-3 font-semibold">Entity ID</th>
                    <th className="px-6 py-3 font-semibold">State Changes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-800">
                        {log.actor_email || "System"}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${
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
                      <td className="px-6 py-3.5 text-slate-600 font-medium">
                        {log.entity_type}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-[10px] text-slate-400">
                        {log.entity_id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 font-mono text-[10px] max-w-xs truncate">
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
