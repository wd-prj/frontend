"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  Send,
  Sparkles,
  Info,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import { LeaveTypeInfo, PreValidationResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { PreValidationBreakdown } from "@/components/leave/PreValidationBreakdown";

export default function ApplyLeavePage() {
  const router = useRouter();
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeInfo[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("2026-08-24");
  const [endDate, setEndDate] = useState<string>("2026-08-28");
  const [reason, setReason] = useState<string>("Personal time off and planned travel");
  
  const [validation, setValidation] = useState<PreValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  useEffect(() => {
    api.getLeaveTypes().then((types) => {
      setLeaveTypes(types);
      if (types.length > 0) {
        setSelectedTypeId(types[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedTypeId || !startDate || !endDate) return;
    if (startDate > endDate) {
      setValidation(null);
      return;
    }

    let isCurrent = true;
    setIsValidating(true);

    api
      .validateLeave({
        leave_type_id: selectedTypeId,
        start_date: startDate,
        end_date: endDate,
      })
      .then((res) => {
        if (isCurrent) {
          setValidation(res);
          setSubmitError("");
        }
      })
      .catch((err) => {
        if (isCurrent) {
          console.warn("Validation error:", err);
        }
      })
      .finally(() => {
        if (isCurrent) setIsValidating(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedTypeId, startDate, endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation?.is_valid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await api.submitLeave({
        leave_type_id: selectedTypeId,
        start_date: startDate,
        end_date: endDate,
        reason: reason.trim(),
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/requests");
      }, 1200);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit leave request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPreset = (s: string, e: string, desc: string) => {
    setStartDate(s);
    setEndDate(e);
    setReason(desc);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Leave Application</h1>
        <p className="text-sm text-slate-500 mt-1">
          Select dates with instant real-time pre-validation and deterministic policy verification.
        </p>
      </div>

      {submitSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold">Leave Request Submitted Successfully!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Status set to PENDING. Approval workflow steps have been dispatched to your manager. Redirecting...
            </p>
          </div>
        </div>
      )}

      {submitError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-center gap-3 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs font-semibold">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Inputs (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="rounded-2xl border-slate-200/90 shadow-2xs">
            <CardHeader className="border-b border-slate-100 pb-3.5">
              <CardTitle className="text-base font-bold text-slate-900">1. Select Leave Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {leaveTypes.map((type) => {
                  const isSelected = selectedTypeId === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedTypeId(type.id)}
                      className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-500"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: type.color_code }}
                        />
                        <span className="text-sm font-bold text-slate-900">
                          {type.name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 mt-2 block leading-relaxed">
                        {type.description || "Company policy quota"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Date Presets */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Quick Date Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPreset(
                        "2026-08-24",
                        "2026-08-28",
                        "Upcoming full week Monday to Friday"
                      )
                    }
                    className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-semibold transition-colors"
                  >
                    📅 Next Week (Aug 24–28)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPreset(
                        "2026-09-07",
                        "2026-09-11",
                        "Full workweek Monday to Friday"
                      )
                    }
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-semibold transition-colors"
                  >
                    📅 September Mon – Fri (5d)
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/90 shadow-2xs">
            <CardHeader className="border-b border-slate-100 pb-3.5">
              <CardTitle className="text-base font-bold text-slate-900">2. Date Range & Reason</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <Textarea
                label="Reason / Notes"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide context for your manager regarding coverage or handover..."
                rows={3}
              />

              <div className="pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!validation?.is_valid || isSubmitting || submitSuccess}
                  isLoading={isSubmitting}
                  className="w-full py-3 text-sm font-bold rounded-xl shadow-xs"
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Submit Leave Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Deterministic Pre-Validation Breakdown (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Live Impact & Policy Breakdown
            </span>
            <span className="text-xs font-semibold text-indigo-600">
              Deterministic Verification
            </span>
          </div>

          <PreValidationBreakdown
            validation={validation}
            isLoading={isValidating}
          />
        </div>
      </div>
    </div>
  );
}
