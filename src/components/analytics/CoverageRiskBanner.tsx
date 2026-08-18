"use client";

import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { CoverageRiskAlert } from "@/lib/types";
import { formatDateRange } from "@/lib/utils";

interface CoverageRiskBannerProps {
  alerts: CoverageRiskAlert[];
}

export const CoverageRiskBanner: React.FC<CoverageRiskBannerProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-emerald-900">Workforce Capacity Stable</h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            No critical team leave concentration or department coverage bottlenecks detected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className={`rounded-xl border p-4 flex items-start gap-3.5 ${
            alert.risk_level === "HIGH"
              ? "border-rose-200 bg-rose-50/70 text-rose-900"
              : "border-amber-200 bg-amber-50/70 text-amber-900"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              alert.risk_level === "HIGH"
                ? "bg-rose-100 text-rose-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">
                {alert.department_name} ({alert.location_name}) – {alert.risk_level} Coverage Risk
              </h4>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/80 border border-current">
                {formatDateRange(alert.start_date, alert.end_date)}
              </span>
            </div>
            <p className="text-xs mt-1 opacity-90">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
