"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  User,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { LeaveRequestInfo } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/input";
import { formatDate, formatDateRange } from "@/lib/utils";

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<LeaveRequestInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Action Modal State
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestInfo | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadApprovals = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPendingApprovals();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load approvals", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleOpenActionModal = (req: LeaveRequestInfo, type: "APPROVE" | "REJECT") => {
    setSelectedRequest(req);
    setActionType(type);
    setComments(type === "APPROVE" ? "Approved. Coverage verified." : "Declined due to coverage constraints.");
    setActionError("");
  };

  const handleExecuteAction = async () => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    setActionError("");

    try {
      // Find active pending step
      const pendingStep = selectedRequest.approval_steps.find((s) => s.status === "PENDING");
      const stepId = pendingStep?.id || selectedRequest.approval_steps[0]?.id;

      if (!stepId) throw new Error("Approval step not found");

      await api.actionApproval(stepId, actionType, comments);
      setSelectedRequest(null);
      loadApprovals();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to execute action");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manager & HR Approval Queue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative review portal for pending employee leave applications with AI explainability
            and conflict analysis.
          </p>
        </div>

        <Badge variant={requests.length > 0 ? "warning" : "success"} withDot size="lg">
          {requests.length} Pending Approvals
        </Badge>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading approval queue...</div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-800">Inbox Zero</h3>
          <p className="text-xs text-slate-500 mt-1">
            All pending leave requests have been reviewed and actioned.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="overflow-hidden border-slate-200 hover:border-slate-300 transition-colors">
              <CardContent className="p-6 space-y-4">
                {/* Employee Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center border border-indigo-200 shrink-0">
                      {req.employee_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {req.employee_name}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({req.employee_email})
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block">
                        {req.department_name} • {req.location_name} Office
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleOpenActionModal(req, "REJECT")}
                      leftIcon={<XCircle className="w-4 h-4" />}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenActionModal(req, "APPROVE")}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Approve
                    </Button>
                  </div>
                </div>

                {/* Impact Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 block font-medium">Leave Type</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: req.leave_type_color }}
                      />
                      {req.leave_type_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Date Range</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {formatDateRange(req.start_date, req.end_date)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Calculation Math</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {req.calendar_days} cal − {req.weekend_days} wknd − {req.holiday_days} hol
                    </span>
                  </div>
                  <div>
                    <span className="text-indigo-700 block font-medium">Net Working Impact</span>
                    <span className="text-sm font-bold text-indigo-900 mt-0.5 block">
                      {req.working_days} working days
                    </span>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1">
                    Employee Reason:
                  </span>
                  <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                    {req.reason}
                  </p>
                </div>

                {/* AI Explainability & Policy Route Breakdown */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      AI Decision Explainability & Grounding
                    </span>
                    <span className="text-[10px] text-indigo-600 font-mono">
                      deterministic-hr-verified
                    </span>
                  </div>
                  <p className="text-xs text-indigo-900">
                    Request for <strong>{req.working_days} working days</strong> ({req.calendar_days} calendar days spanning {req.location_name} holidays).
                    Dynamic balance has pre-reserved {req.working_days} days. Configured policy directs this request to multi-level approval steps.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-semibold text-indigo-800">
                      Approval Path:
                    </span>
                    {req.approval_steps.map((s, idx) => (
                      <span key={s.id} className="inline-flex items-center gap-1 text-xs">
                        <span className="px-2 py-0.5 rounded bg-white font-medium text-slate-700 border border-indigo-200 text-[11px]">
                          Step {s.step_order}: {s.required_role} ({s.status})
                        </span>
                        {idx < req.approval_steps.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-indigo-400" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Modal (Approve / Reject) */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={actionType === "APPROVE" ? "Approve Leave Request" : "Reject Leave Request"}
        description={
          selectedRequest
            ? `${selectedRequest.employee_name} • ${selectedRequest.working_days} working days (${selectedRequest.start_date} to ${selectedRequest.end_date})`
            : undefined
        }
      >
        <div className="space-y-4">
          {actionError && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
              {actionError}
            </div>
          )}

          <Textarea
            label="Manager Comments / Feedback"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add comments visible to the employee and logged in audit history..."
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setSelectedRequest(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "APPROVE" ? "primary" : "destructive"}
              onClick={handleExecuteAction}
              isLoading={isSubmitting}
            >
              Confirm {actionType === "APPROVE" ? "Approval" : "Rejection"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
