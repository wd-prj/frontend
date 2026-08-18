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
  const [startDate, setStartDate] = useState<string>("2026-08-20");
  const [endDate, setEndDate] = useState<string>("2026-08-25");
  const [reason, setReason] = useState<string>("Family vacation and personal downtime");
  
  const [validation, setValidation] = useState<PreValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Load Leave Types on Mount
  useEffect(() => {
    api.getLeaveTypes().then((types) => {
      setLeaveTypes(types);
      if (types.length > 0) {
        setSelectedTypeId(types[0].id);
      }
    });
  }, []);

  // Trigger real-time pre-validation whenever type or dates change
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
        <h1 className="text-xl font-bold text-slate-900">Smart Leave Application</h1>
        <p className="text-xs text-slate-500 mt-1">
          Select time-off parameters with instant pre-validation and deterministic policy verification
          before submission.
        </p>
      </div>

      {submitSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold">Leave Request Submitted Successfully!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Status set to PENDING. Approval workflow steps have been dispatched to your manager.
              Redirecting...
            </p>
          </div>
        </div>
      )}

      {submitError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-center gap-3 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs (7 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Select Leave Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {leaveTypes.map((type) => {
                  const isSelected = selectedTypeId === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedTypeId(type.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: type.color_code }}
                        />
                        <span className="text-xs font-semibold text-slate-900">
                          {type.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-2 block">
                        {type.description || "Company policy quota"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Demo Quick Presets */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Demo Fast Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPreset(
                        "2026-08-20",
                        "2026-08-25",
                        "Demo Scenario: August 20–25 (Includes weekend + holiday)"
                      )
                    }
                    className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-medium transition-colors"
                  >
                    🎯 Aug 20 – 25 (Primary Demo Flow)
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
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-medium transition-colors"
                  >
                    📅 Mon – Fri (5 working days)
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Date Range & Reason</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <Textarea
                label="Reason / Comments"
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
                  className="w-full py-2.5 text-xs"
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Submit Authoritative Leave Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Deterministic Pre-Validation Breakdown (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Live Impact & Policy Breakdown
            </span>
            <span className="text-[11px] text-slate-400">
              Verified by Deterministic Engine
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
