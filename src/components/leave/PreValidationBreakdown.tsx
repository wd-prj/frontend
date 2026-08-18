"use client";

import React from "react";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Users,
} from "lucide-react";
import { PreValidationResponse } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface PreValidationBreakdownProps {
  validation: PreValidationResponse | null;
  isLoading?: boolean;
}

export const PreValidationBreakdown: React.FC<PreValidationBreakdownProps> = ({
  validation,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 rounded-md w-1/3" />
        <div className="grid grid-cols-4 gap-3">
          <div className="h-16 bg-slate-200 rounded-lg" />
          <div className="h-16 bg-slate-200 rounded-lg" />
          <div className="h-16 bg-slate-200 rounded-lg" />
          <div className="h-16 bg-slate-200 rounded-lg" />
        </div>
        <div className="h-12 bg-slate-200 rounded-lg" />
      </div>
    );
  }

  if (!validation) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h4 className="text-sm font-medium text-slate-700">Deterministic Impact Engine</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Select a leave type and date range above to view instant live calculation of working days,
          location holidays, dynamic balance impact, and multi-tier approval routing.
        </p>
      </div>
    );
  }

  const {
    is_valid,
    calendar_days,
    weekend_days,
    holiday_days,
    working_days,
    available_balance_before,
    available_balance_after,
    policy_violations,
    warnings,
    approval_route,
    day_breakdown,
    conflict_analysis,
  } = validation;

  return (
    <div
      className={`rounded-xl border p-5 transition-all space-y-5 ${
        is_valid
          ? "border-slate-200 bg-white shadow-xs"
          : "border-rose-200 bg-rose-50/30"
      }`}
    >
      {/* Top Header & Status */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          {is_valid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span className="text-sm font-semibold text-slate-900">
            {is_valid ? "Pre-Validation Successful" : "Policy Conflict Detected"}
          </span>
        </div>
        <Badge variant={is_valid ? "success" : "error"} withDot>
          {is_valid ? "Eligible to Submit" : "Submission Blocked"}
        </Badge>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <span className="text-xs font-medium text-slate-500 block">Calendar Days</span>
          <span className="text-xl font-bold text-slate-800">{calendar_days}d</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <span className="text-xs font-medium text-slate-500 block">Weekends</span>
          <span className="text-xl font-bold text-slate-600">-{weekend_days}d</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <span className="text-xs font-medium text-slate-500 block">Location Holidays</span>
          <span className="text-xl font-bold text-amber-600">-{holiday_days}d</span>
        </div>
        <div className="bg-indigo-50/70 rounded-lg p-3 border border-indigo-100">
          <span className="text-xs font-medium text-indigo-700 block">Net Working Days</span>
          <span className="text-xl font-bold text-indigo-900">{working_days}d</span>
        </div>
      </div>

      {/* Dynamic Balance Impact Bar */}
      <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-200/80 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 block font-medium">Dynamic Balance Impact</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold text-slate-800">
              {available_balance_before} days
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span
              className={`text-sm font-bold ${
                available_balance_after < 0 ? "text-rose-600" : "text-emerald-700"
              }`}
            >
              {available_balance_after} days
            </span>
            <span className="text-xs text-slate-400">
              (-{working_days}d pending reserve)
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block font-medium">Approval Routing</span>
          <span className="text-xs font-semibold text-slate-700 mt-1 inline-block">
            {approval_route && approval_route.length > 0
              ? approval_route.join(" → ")
              : "Direct Manager"}
          </span>
        </div>
      </div>

      {/* Day Breakdown itemization pills */}
      {day_breakdown && day_breakdown.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-slate-700 block mb-2">
            Calendar Itemization:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {day_breakdown.map((d, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-1 rounded-md border font-medium flex items-center gap-1 ${
                  d.is_working_day
                    ? "bg-indigo-50 border-indigo-200 text-indigo-800"
                    : d.is_holiday
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-slate-100 border-slate-200 text-slate-600"
                }`}
              >
                <span>{d.date.slice(5)}</span>
                <span className="text-[10px] opacity-75">
                  ({d.day_name.slice(0, 3)})
                </span>
                {d.is_holiday && (
                  <span className="text-[10px] bg-amber-200/80 px-1 rounded text-amber-900">
                    {d.holiday_name}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Policy Violations (if any) */}
      {policy_violations && policy_violations.length > 0 && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
            <ShieldAlert className="w-4 h-4" />
            <span>Policy Violations</span>
          </div>
          <ul className="text-xs text-rose-700 space-y-1 pl-6 list-disc">
            {policy_violations.map((v, idx) => (
              <li key={idx}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Conflict & Coverage Analysis */}
      {conflict_analysis && conflict_analysis.has_conflicts && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
              <Users className="w-4 h-4 text-amber-700" />
              <span>Team Coverage Notice</span>
            </div>
            <Badge variant="warning">{conflict_analysis.risk_level} Risk</Badge>
          </div>
          <p className="text-xs text-amber-800">{conflict_analysis.risk_summary}</p>
          <div className="space-y-1 pt-1">
            {conflict_analysis.conflicting_absences.map((c, i) => (
              <div
                key={i}
                className="text-[11px] bg-white/80 rounded px-2 py-1 border border-amber-100 text-slate-700 flex justify-between"
              >
                <span>{c.employee_name}</span>
                <span className="text-slate-500 font-medium">
                  {c.start_date} to {c.end_date} ({c.working_days}d {c.status})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
