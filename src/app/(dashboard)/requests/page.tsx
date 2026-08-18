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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Leave Requests & What-If Sandbox</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track historical leave status or run read-only hypothetical absence projections.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "whatif"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            What-If Simulator
          </button>
        </div>
      </div>

      {activeTab === "history" ? (
        <div className="space-y-4">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading requests...</div>
              ) : requests.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No requests matching this filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Type</th>
                        <th className="px-6 py-3 font-semibold">Date Range</th>
                        <th className="px-6 py-3 font-semibold">Working Days</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold">Submitted</th>
                        <th className="px-6 py-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {requests.map((req) => (
                        <tr
                          key={req.id}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                          onClick={() => setSelectedRequest(req)}
                        >
                          <td className="px-6 py-3.5 font-medium text-slate-900 flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: req.leave_type_color }}
                            />
                            {req.leave_type_name}
                          </td>
                          <td className="px-6 py-3.5 text-slate-600">
                            {formatDateRange(req.start_date, req.end_date)}
                          </td>
                          <td className="px-6 py-3.5 text-slate-900 font-semibold">
                            {req.working_days}d
                          </td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getStatusBadgeVariant(
                                req.status
                              )}`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-slate-500">
                            {formatDate(req.created_at)}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <span className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1">
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
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  Read-Only Projection Mode
                </h4>
                <p className="text-xs text-indigo-800 mt-0.5">
                  Simulate future time off. Computes calendar exclusions, projected balance after,
                  and approval routes without modifying the database.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Simulation Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Leave Type
                    </label>
                    <select
                      value={whatIfTypeId}
                      onChange={(e) => setWhatIfTypeId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={whatIfStart}
                        onChange={(e) => setWhatIfStart(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={whatIfEnd}
                        onChange={(e) => setWhatIfEnd(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleRunSimulation}
                    isLoading={isSimulating}
                    className="w-full text-xs py-2"
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
          <div className="space-y-6 text-xs">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {selectedRequest.leave_type_name}
                </span>
                <span className="text-slate-500">
                  {formatDateRange(selectedRequest.start_date, selectedRequest.end_date)}
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-md font-semibold border ${getStatusBadgeVariant(
                  selectedRequest.status
                )}`}
              >
                {selectedRequest.status}
              </span>
            </div>

            {/* Impact stats */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block">Calendar Days</span>
                <span className="text-sm font-bold text-slate-800">
                  {selectedRequest.calendar_days}d
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Non-Working Days</span>
                <span className="text-sm font-bold text-slate-800">
                  {selectedRequest.weekend_days + selectedRequest.holiday_days}d
                </span>
              </div>
              <div>
                <span className="text-[10px] text-indigo-700 font-semibold block">
                  Net Deducted
                </span>
                <span className="text-sm font-bold text-indigo-900">
                  {selectedRequest.working_days}d
                </span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <span className="font-semibold text-slate-700 block mb-1">Reason:</span>
              <p className="p-3 bg-slate-50 rounded-lg text-slate-700 border border-slate-100">
                {selectedRequest.reason}
              </p>
            </div>

            {/* Rejection Reason if any */}
            {selectedRequest.rejection_reason && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-800">
                <span className="font-semibold block mb-0.5">Rejection Reason:</span>
                <p>{selectedRequest.rejection_reason}</p>
              </div>
            )}

            {/* Approval Workflow Steps Timeline */}
            <div>
              <span className="font-semibold text-slate-700 block mb-2">
                Multi-Tier Approval Timeline:
              </span>
              <div className="space-y-3 pl-2 border-l-2 border-slate-200">
                {selectedRequest.approval_steps.map((step) => (
                  <div key={step.id} className="relative pl-4">
                    <span
                      className={`absolute -left-[13px] top-0.5 w-4 h-4 rounded-full border-2 bg-white ${
                        step.status === "APPROVED"
                          ? "border-emerald-500 text-emerald-500"
                          : step.status === "REJECTED"
                          ? "border-rose-500 text-rose-500"
                          : "border-amber-500 text-amber-500"
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
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
                      <p className="text-slate-500 text-[11px] mt-1 italic">
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
                  className="w-full"
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
