"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Plus,
  Edit3,
  CheckCircle2,
  Calendar,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  ArrowLeft,
  Users,
  FileText,
  Clock,
  Award,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  FullLeaveTypeConfiguration,
  LeaveConfigOverview,
  UserProfile,
  TeamMemberInfo,
} from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input, Textarea } from "@/components/ui/input";

export default function PoliciesPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [configs, setConfigs] = useState<FullLeaveTypeConfiguration[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [members, setMembers] = useState<TeamMemberInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1. Create Leave Type Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createCode, setCreateCode] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createColor, setCreateColor] = useState("#4f46e5");
  const [createEntitlement, setCreateEntitlement] = useState(12);
  const [createCarryForward, setCreateCarryForward] = useState(0);
  const [createFrequency, setCreateFrequency] = useState<"YEARLY" | "MONTHLY" | "QUARTERLY">("YEARLY");
  const [createMaxConsecutive, setCreateMaxConsecutive] = useState(10);
  const [createNoticeDays, setCreateNoticeDays] = useState(1);
  const [createDocDays, setCreateDocDays] = useState<number | undefined>(undefined);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // 2. Edit Policy Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedLT, setSelectedLT] = useState<FullLeaveTypeConfiguration | null>(null);
  const [editEntitlement, setEditEntitlement] = useState(18);
  const [editCarryForward, setEditCarryForward] = useState(5);
  const [editFrequency, setEditFrequency] = useState<"YEARLY" | "MONTHLY" | "QUARTERLY">("YEARLY");
  const [editMaxConsecutive, setEditMaxConsecutive] = useState(10);
  const [editNoticeDays, setEditNoticeDays] = useState(0);
  const [editDocDays, setEditDocDays] = useState<number | undefined>(undefined);
  const [syncEmployees, setSyncEmployees] = useState(true);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // 3. Adjust Employee Balance Modal State
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustEmpId, setAdjustEmpId] = useState("");
  const [adjustLeaveTypeId, setAdjustLeaveTypeId] = useState("");
  const [adjustDays, setAdjustDays] = useState(1);
  const [adjustReason, setAdjustReason] = useState("Management compensatory award");
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const profile = await api.getMe();
      setUser(profile);
      if (profile.role === "HR_ADMIN") {
        const overview = await api.getLeaveConfigurations();
        setConfigs(overview.leave_types);
        setLocations(overview.locations);

        const memList = await api.getTeamMembers();
        setMembers(memList);
        if (memList.length > 0) setAdjustEmpId(memList[0].user_id);
        if (overview.leave_types.length > 0) setAdjustLeaveTypeId(overview.leave_types[0].id);
      }
    } catch (err) {
      console.error("Failed to load policy configurations", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Create Leave Type
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCreate(true);
    setFeedback(null);

    try {
      await api.createLeaveType({
        name: createName,
        code: createCode,
        description: createDesc,
        color_code: createColor,
        is_paid: true,
        annual_entitlement: Number(createEntitlement),
        max_carry_forward: Number(createCarryForward),
        frequency: createFrequency,
        max_consecutive_days: Number(createMaxConsecutive),
        advance_notice_days: Number(createNoticeDays),
        requires_document_after_days: createDocDays ? Number(createDocDays) : undefined,
      });

      setFeedback({
        type: "success",
        message: `Leave type '${createName}' (${createCode.toUpperCase()}) created with ${createEntitlement} days annual entitlement!`,
      });
      setIsCreateOpen(false);
      resetCreateForm();
      loadData();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to create leave type",
      });
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const resetCreateForm = () => {
    setCreateName("");
    setCreateCode("");
    setCreateDesc("");
    setCreateColor("#4f46e5");
    setCreateEntitlement(12);
    setCreateCarryForward(0);
    setCreateFrequency("YEARLY");
    setCreateMaxConsecutive(10);
    setCreateNoticeDays(1);
    setCreateDocDays(undefined);
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (lt: FullLeaveTypeConfiguration) => {
    setSelectedLT(lt);
    const ap = lt.accrual_policies[0];
    const lp = lt.leave_policies[0];

    setEditEntitlement(ap ? ap.annual_entitlement : 18);
    setEditCarryForward(ap ? ap.max_carry_forward : 5);
    setEditFrequency((ap?.frequency as "YEARLY" | "MONTHLY" | "QUARTERLY") || "YEARLY");
    setEditMaxConsecutive(lp?.max_consecutive_days || 10);
    setEditNoticeDays(lp?.advance_notice_days || 0);
    setEditDocDays(lp?.requires_document_after_days || undefined);
    setSyncEmployees(true);
    setIsEditOpen(true);
  };

  // Handle Edit Policy Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLT) return;
    setIsSubmittingEdit(true);
    setFeedback(null);

    try {
      // Update each location accrual policy
      for (const ap of selectedLT.accrual_policies) {
        await api.updateAccrualPolicy(ap.id, {
          annual_entitlement: Number(editEntitlement),
          max_carry_forward: Number(editCarryForward),
          frequency: editFrequency,
          sync_existing_employees: syncEmployees,
        });
      }

      // Update each location leave policy
      for (const lp of selectedLT.leave_policies) {
        await api.updateLeavePolicy(lp.id, {
          max_consecutive_days: Number(editMaxConsecutive),
          advance_notice_days: Number(editNoticeDays),
          requires_document_after_days: editDocDays ? Number(editDocDays) : undefined,
          carry_forward_limit: Number(editCarryForward),
          allow_negative_balance: false,
        });
      }

      setFeedback({
        type: "success",
        message: `Successfully updated '${selectedLT.name}' entitlement to ${editEntitlement} days/yr and carry-forward to ${editCarryForward} days!`,
      });
      setIsEditOpen(false);
      loadData();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update policy",
      });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Balance Adjustment Submit
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAdjust(true);
    setFeedback(null);

    try {
      const res = await api.adjustEmployeeBalance({
        employee_id: adjustEmpId,
        leave_type_id: adjustLeaveTypeId,
        adjustment_days: Number(adjustDays),
        reason: adjustReason,
      });

      setFeedback({
        type: "success",
        message: res.message,
      });
      setIsAdjustOpen(false);
      setAdjustReason("Management compensatory award");
      loadData();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to adjust balance",
      });
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  if (!isLoading && user && user.role !== "HR_ADMIN") {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">HR Administrator Access Required</h2>
        <p className="text-sm text-slate-600">
          Leave and Accrual Policy Governance allows modifying corporate quotas and is restricted exclusively to authorized HR Administrators.
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-indigo-600" />
            Leave Policies & Accrual Governance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure annual PTO quotas, carry-forward rules, and create custom leave categories with live employee sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsAdjustOpen(true)}
            className="gap-2 text-xs font-semibold rounded-xl border-slate-200 shadow-2xs"
          >
            <Award className="w-4 h-4 text-amber-600" />
            Adjust Quota
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Create Leave Type
          </Button>
        </div>
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-sm font-medium flex items-center justify-between shadow-2xs ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            {feedback.message}
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold uppercase opacity-60 hover:opacity-100 cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Leave Types Matrix */}
      {isLoading ? (
        <div className="p-16 text-center text-sm text-slate-400">Loading policy configurations...</div>
      ) : configs.length === 0 ? (
        <div className="p-14 text-center text-sm text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300">
          No leave types configured yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {configs.map((lt) => {
            const ap = lt.accrual_policies[0];
            const lp = lt.leave_policies[0];

            return (
              <Card
                key={lt.id}
                className="rounded-3xl border-slate-200/90 shadow-2xs hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full shadow-2xs shrink-0"
                          style={{ backgroundColor: lt.color_code }}
                        />
                        <div>
                          <CardTitle className="text-base font-bold text-slate-900">{lt.name}</CardTitle>
                          <span className="text-[11px] font-mono font-bold text-slate-400 tracking-wide uppercase">
                            CODE: {lt.code}
                          </span>
                        </div>
                      </div>
                      <Badge variant={lt.is_paid ? "success" : "gray"} size="sm">
                        {lt.is_paid ? "Paid Leave" : "Unpaid"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-4">
                    <p className="text-xs text-slate-600 min-h-[32px] leading-relaxed">
                      {lt.description || "Company policy managed leave quota."}
                    </p>

                    {/* Accrual Parameters Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Baseline Quota
                        </span>
                        <p className="text-base font-extrabold text-slate-900 mt-0.5">
                          {ap ? `${ap.annual_entitlement} d` : "—"}
                        </p>
                        <span className="text-[10px] text-slate-500 font-medium">per year</span>
                      </div>

                      <div className="border-x border-slate-200/70 px-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Carry Forward
                        </span>
                        <p className="text-base font-extrabold text-indigo-700 mt-0.5">
                          {ap ? `${ap.max_carry_forward} d` : "—"}
                        </p>
                        <span className="text-[10px] text-slate-500 font-medium">max roll-over</span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Frequency
                        </span>
                        <p className="text-xs font-bold text-slate-800 mt-1 uppercase">
                          {ap?.frequency || "YEARLY"}
                        </p>
                        <span className="text-[10px] text-slate-500 font-medium">accrual cycle</span>
                      </div>
                    </div>

                    {/* Policy Rules Badges */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Workflow & Compliance Rules
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-700">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 font-medium text-slate-700 border border-slate-200/80">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Max {lp?.max_consecutive_days ?? 10} days consecutive
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 font-medium text-slate-700 border border-slate-200/80">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {lp?.advance_notice_days ?? 0} days advance notice
                        </span>
                        {lp?.requires_document_after_days && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 font-medium text-amber-800 border border-amber-200">
                            <FileText className="w-3.5 h-3.5 text-amber-600" />
                            Medical cert after {lp.requires_document_after_days}d
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-0">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenEdit(lt)}
                    className="w-full gap-2 text-xs font-semibold rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Configure Quota & Accrual Rules
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 1. Modal: Create Leave Type */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Enterprise Leave Type"
        description="Add a new leave category with automated location accruals and policy thresholds."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Leave Name *</label>
              <Input
                placeholder="e.g. Compensatory Off"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category Code *</label>
              <Input
                placeholder="e.g. COMP_OFF"
                value={createCode}
                onChange={(e) => setCreateCode(e.target.value.toUpperCase())}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <Textarea
              placeholder="Explain policy guidelines and eligibility..."
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Annual Quota (Days) *</label>
              <Input
                type="number"
                step="0.5"
                min="0"
                max="365"
                value={createEntitlement}
                onChange={(e) => setCreateEntitlement(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Carry Forward (Days) *</label>
              <Input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={createCarryForward}
                onChange={(e) => setCreateCarryForward(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Accrual Frequency</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-2xs font-medium"
                value={createFrequency}
                onChange={(e) => setCreateFrequency(e.target.value as "YEARLY" | "MONTHLY" | "QUARTERLY")}
              >
                <option value="YEARLY">Yearly Upfront</option>
                <option value="MONTHLY">Monthly Accrual</option>
                <option value="QUARTERLY">Quarterly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Consecutive Days</label>
              <Input
                type="number"
                min="1"
                value={createMaxConsecutive}
                onChange={(e) => setCreateMaxConsecutive(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Advance Notice (Days)</label>
              <Input
                type="number"
                min="0"
                value={createNoticeDays}
                onChange={(e) => setCreateNoticeDays(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Color Theme</label>
              <div className="flex items-center gap-2 mt-1">
                {["#4f46e5", "#059669", "#d97706", "#db2777", "#8b5cf6", "#0284c7"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCreateColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                      createColor === c ? "ring-2 ring-offset-2 ring-indigo-600 scale-110" : "opacity-80"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmittingCreate} className="bg-indigo-600 text-white hover:bg-indigo-700">
              {isSubmittingCreate ? "Creating..." : "Save & Provision Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Modal: Edit Policy & Entitlements */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Configure Quota: ${selectedLT?.name || ""}`}
        description="Update annual baseline entitlements, carry-forward caps, and synchronize active employee balances."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Annual Entitlement (Days) *</label>
              <Input
                type="number"
                step="0.5"
                min="0"
                max="365"
                value={editEntitlement}
                onChange={(e) => setEditEntitlement(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Carry Forward (Days) *</label>
              <Input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={editCarryForward}
                onChange={(e) => setEditCarryForward(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Accrual Frequency</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-2xs font-medium"
                value={editFrequency}
                onChange={(e) => setEditFrequency(e.target.value as "YEARLY" | "MONTHLY" | "QUARTERLY")}
              >
                <option value="YEARLY">Yearly Upfront</option>
                <option value="MONTHLY">Monthly Accrual</option>
                <option value="QUARTERLY">Quarterly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Consecutive Days</label>
              <Input
                type="number"
                min="1"
                value={editMaxConsecutive}
                onChange={(e) => setEditMaxConsecutive(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Advance Notice (Days)</label>
              <Input
                type="number"
                min="0"
                value={editNoticeDays}
                onChange={(e) => setEditNoticeDays(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Medical Doc Trigger (Days)</label>
              <Input
                type="number"
                min="1"
                placeholder="Optional (e.g. 2)"
                value={editDocDays || ""}
                onChange={(e) => setEditDocDays(e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Sync Checkbox */}
          <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100 flex items-start gap-3">
            <input
              type="checkbox"
              id="syncEmployees"
              checked={syncEmployees}
              onChange={(e) => setSyncEmployees(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <div>
              <label htmlFor="syncEmployees" className="text-xs font-bold text-indigo-950 cursor-pointer">
                Synchronize Active Employee Balances
              </label>
              <p className="text-[11px] text-indigo-700 mt-0.5 leading-snug">
                Automatically update current 2026 baseline quotas for all active employees across all company offices.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmittingEdit} className="bg-indigo-600 text-white hover:bg-indigo-700">
              {isSubmittingEdit ? "Updating..." : "Save Policy Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Modal: Adjust Employee Balance */}
      <Modal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        title="Manual Employee Balance Adjustment"
        description="Award bonus days or compensatory off for an individual team member with audit tracking."
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Employee *</label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-2xs font-medium"
              value={adjustEmpId}
              onChange={(e) => setAdjustEmpId(e.target.value)}
              required
            >
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.full_name} ({m.email}) — {m.role}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Leave Category *</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-2xs font-medium"
                value={adjustLeaveTypeId}
                onChange={(e) => setAdjustLeaveTypeId(e.target.value)}
                required
              >
                {configs.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name} ({lt.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Adjustment (Days) *</label>
              <Input
                type="number"
                step="0.5"
                value={adjustDays}
                onChange={(e) => setAdjustDays(Number(e.target.value))}
                required
              />
              <span className="text-[10px] text-slate-400">Use positive (+2) to add, negative (-1) to deduct</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Audit Reason *</label>
            <Textarea
              placeholder="e.g. Weekend production on-call compensatory allowance"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              required
              rows={2}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmittingAdjust} className="bg-indigo-600 text-white hover:bg-indigo-700">
              {isSubmittingAdjust ? "Applying..." : "Apply Adjustment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
