"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Calendar,
  Sparkles,
  ChevronRight,
  XCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
} from "lucide-react";
import { api } from "@/lib/api";
import { LeaveRequestInfo, LeaveTypeInfo, PreValidationResponse } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { PreValidationBreakdown } from "@/components/leave/PreValidationBreakdown";
import { formatDate, formatDateRange, getStatusBadgeVariant } from "@/lib/utils";

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<"history" | "whatif">("history");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [requests, setRequests] = useState<LeaveRequestInfo[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // What-If State
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeInfo[]>([]);
  const [whatIfTypeId, setWhatIfTypeId] = useState<string>("");
  const [whatIfStart, setWhatIfStart] = useState<string>("2026-10-15");
  const [whatIfEnd, setWhatIfEnd] = useState<string>("2026-10-22");
  const [whatIfResult, setWhatIfResult] = useState<PreValidationResponse | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyRequests(statusFilter === "ALL" ? undefined : statusFilter);
      setRequests(data);
    } catch (err) {
      console.error("Error loading requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  useEffect(() => {
    api.getLeaveTypes().then((types) => {
      setLeaveTypes(types);
      if (types.length > 0) setWhatIfTypeId(types[0].id);
    });
  }, []);

  const handleRunSimulation = async () => {
    if (!whatIfTypeId || !whatIfStart || !whatIfEnd) return;
    setIsSimulating(true);
    try {
      const res = await api.whatIfSimulation({
        leave_type_id: whatIfTypeId,
        start_date: whatIfStart,
        end_date: whatIfEnd,
      });
      setWhatIfResult(res);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to cancel this pending leave request?")) return;
    try {
      await api.cancelRequest(requestId);
      loadRequests();
      setSelectedRequest(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Cancellation failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave History & Projections</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track historical leave status or run hypothetical absence projections.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "history"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            My Requests History
          </button>
          <button
            onClick={() => {
              setActiveTab("whatif");
              if (!whatIfResult) handleRunSimulation();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === "whatif"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            What-If Simulator
          </button>
        </div>
      </div>

      {activeTab === "history" ? (
        <div className="space-y-4">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  statusFilter === st
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Table */}
          <Card className="rounded-2xl border-slate-200/90 shadow-2xs">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-12 text-center text-sm text-slate-400">Loading requests...</div>
              ) : requests.length === 0 ? (
                <div className="p-12 text-center text-sm text-slate-400">
                  No requests matching this filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-4 font-bold">Leave Type</th>
                        <th className="px-6 py-4 font-bold">Date Range</th>
                        <th className="px-6 py-4 font-bold">Working Days</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold">Submitted</th>
                        <th className="px-6 py-4 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {requests.map((req) => (
                        <tr
                          key={req.id}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                          onClick={() => setSelectedRequest(req)}
                        >
                          <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: req.leave_type_color }}
                            />
                            {req.leave_type_name}
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">
                            {formatDateRange(req.start_date, req.end_date)}
                          </td>
                          <td className="px-6 py-4 text-slate-900 font-extrabold">
                            {req.working_days}d
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeVariant(
                                req.status
                              )}`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-medium">
                            {formatDate(req.created_at)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 text-xs">
                              Details <ChevronRight className="w-3.5 h-3.5" />
                            </span>
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
      ) : (
        /* What-If Simulation Tab */
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  Read-Only Projection Mode
                </h4>
                <p className="text-xs text-indigo-800 mt-0.5 font-medium">
                  Simulate future absences to compute calendar exclusions, projected balance after,
                  and approval routes without modifying the database.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
              <Card className="rounded-2xl border-slate-200/90 shadow-2xs">
                <CardHeader className="border-b border-slate-100 pb-3.5">
                  <CardTitle className="text-base font-bold text-slate-900">Simulation Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Leave Type
                    </label>
                    <select
                      value={whatIfTypeId}
                      onChange={(e) => setWhatIfTypeId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {leaveTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={whatIfStart}
                        onChange={(e) => setWhatIfStart(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={whatIfEnd}
                        onChange={(e) => setWhatIfEnd(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleRunSimulation}
                    isLoading={isSimulating}
                    className="w-full text-sm font-bold py-2.5 rounded-xl shadow-xs"
                  >
                    Simulate Leave Impact
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-7">
              <PreValidationBreakdown
                validation={whatIfResult}
                isLoading={isSimulating}
              />
            </div>
          </div>
        </div>
      )}

      {/* Request Details Slide-over Drawer */}
      <Drawer
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Leave Request Details"
        description={`ID: ${selectedRequest?.id}`}
        width="lg"
      >
        {selectedRequest && (
          <div className="space-y-6 text-sm">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-base font-bold text-slate-900 block">
                  {selectedRequest.leave_type_name}
                </span>
                <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                  {formatDateRange(selectedRequest.start_date, selectedRequest.end_date)}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeVariant(
                  selectedRequest.status
                )}`}
              >
                {selectedRequest.status}
              </span>
            </div>

            {/* Impact stats */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <div>
                <span className="text-xs text-slate-500 font-bold block">Calendar Days</span>
                <span className="text-lg font-extrabold text-slate-800">
                  {selectedRequest.calendar_days}d
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block">Non-Working</span>
                <span className="text-lg font-extrabold text-slate-800">
                  {selectedRequest.weekend_days + selectedRequest.holiday_days}d
                </span>
              </div>
              <div>
                <span className="text-xs text-indigo-700 font-bold block">
                  Net Deducted
                </span>
                <span className="text-lg font-extrabold text-indigo-900">
                  {selectedRequest.working_days}d
                </span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <span className="font-bold text-slate-700 text-xs uppercase tracking-wider block mb-1.5">
                Reason:
              </span>
              <p className="p-3.5 bg-slate-50 rounded-xl text-slate-800 border border-slate-200/80 leading-relaxed text-sm font-medium">
                {selectedRequest.reason}
              </p>
            </div>

            {/* Rejection Reason if any */}
            {selectedRequest.rejection_reason && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-800">
                <span className="font-bold text-xs uppercase tracking-wider block mb-1">
                  Rejection Reason:
                </span>
                <p className="text-sm font-medium">{selectedRequest.rejection_reason}</p>
              </div>
            )}

            {/* Approval Workflow Steps Timeline */}
            <div>
              <span className="font-bold text-slate-700 text-xs uppercase tracking-wider block mb-3">
                Multi-Tier Approval Timeline:
              </span>
              <div className="space-y-4 pl-3 border-l-2 border-indigo-200">
                {selectedRequest.approval_steps.map((step) => (
                  <div key={step.id} className="relative pl-5">
                    <span
                      className={`absolute -left-[19px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                        step.status === "APPROVED"
                          ? "border-emerald-500 text-emerald-500"
                          : step.status === "REJECTED"
                          ? "border-rose-500 text-rose-500"
                          : "border-amber-500 text-amber-500"
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        Step {step.step_order}: {step.required_role} ({step.approver_name})
                      </span>
                      <Badge
                        variant={
                          step.status === "APPROVED"
                            ? "success"
                            : step.status === "REJECTED"
                            ? "error"
                            : "warning"
                        }
                      >
                        {step.status}
                      </Badge>
                    </div>
                    {step.comments && (
                      <p className="text-slate-600 text-xs mt-1 italic">
                        &quot;{step.comments}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cancel Action if Pending */}
            {selectedRequest.status === "PENDING" && (
              <div className="pt-4 border-t border-slate-100">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleCancelRequest(selectedRequest.id)}
                  leftIcon={<XCircle className="w-4 h-4" />}
                  className="w-full font-bold py-2.5 rounded-xl"
                >
                  Cancel Pending Request
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
