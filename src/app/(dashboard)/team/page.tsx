"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Building2,
  MapPin,
  Shield,
  Clock,
  CheckCircle2,
  RotateCw,
  Search,
  Plus,
  X,
  Sparkles,
  Send,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  UserProfile,
  TeamMemberInfo,
  TeamInfo,
  OrgOption,
} from "@/lib/types";

export default function TeamManagementPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [members, setMembers] = useState<TeamMemberInfo[]>([]);
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [departments, setDepartments] = useState<OrgOption[]>([]);
  const [locations, setLocations] = useState<OrgOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [provisionType, setProvisionType] = useState<"EMPLOYEE" | "MANAGER">("EMPLOYEE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [createdInviteInfo, setCreatedInviteInfo] = useState<{ email: string; invite_url: string } | null>(null);

  // Provision Form State
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    department_id: "",
    team_id: "",
    team_name: "", // for new manager provisioning
    location_id: "",
    designation: "",
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [u, mems, tms, meta] = await Promise.all([
        api.getMyProfile(),
        api.getTeamMembers(),
        api.getTeams(),
        api.getOrgMetadata(),
      ]);
      setUser(u);
      setMembers(mems);
      setTeams(tms);
      setDepartments(meta.departments);
      setLocations(meta.locations);
    } catch (err: any) {
      console.error("Failed to load team data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openProvisionModal = (type: "EMPLOYEE" | "MANAGER") => {
    setProvisionType(type);
    setModalError(null);
    setCreatedInviteInfo(null);
    setFormData({
      full_name: "",
      email: "",
      department_id: departments[0]?.id || "",
      team_id: teams[0]?.id || "",
      team_name: type === "MANAGER" ? "New Product Team" : "",
      location_id: locations[0]?.id || "",
      designation: type === "MANAGER" ? "Engineering Manager" : "Software Engineer",
    });
    setIsModalOpen(true);
  };

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.full_name.trim() || !formData.email.trim()) {
      setModalError("Please provide both full name and a valid corporate email.");
      return;
    }

    try {
      setIsSubmitting(true);
      let inviteUrl = "";

      if (provisionType === "MANAGER") {
        const res = await api.inviteManager({
          full_name: formData.full_name,
          email: formData.email,
          department_id: formData.department_id,
          team_name: formData.team_name,
          location_id: formData.location_id,
          designation: formData.designation,
        });
        inviteUrl = res.invite_url || "";
      } else {
        const res = await api.inviteEmployee({
          full_name: formData.full_name,
          email: formData.email,
          department_id: formData.department_id,
          team_id: formData.team_id,
          location_id: formData.location_id,
          designation: formData.designation,
        });
        inviteUrl = res.invite_url || "";
      }

      if (inviteUrl) {
        setCreatedInviteInfo({ email: formData.email, invite_url: inviteUrl });
      } else {
        setSuccessToast(`Invitation dispatched to ${formData.email}.`);
        setIsModalOpen(false);
      }

      await loadData();
    } catch (err: any) {
      setModalError(err.message || "Failed to provision account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyInvite = async (userId: string, email: string) => {
    try {
      setCopiedId(userId);
      const res = await api.resendInvite(userId);
      if (res.invite_url) {
        await navigator.clipboard.writeText(res.invite_url);
        setSuccessToast(`Secure invitation link with token copied for ${email}!`);
      } else {
        throw new Error("Invitation token URL was not generated. Please try again.");
      }
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err: any) {
      alert(err.message || "Failed to copy invite link.");
      setCopiedId(null);
    }
  };

  const handleResend = async (userId: string, email: string) => {
    try {
      const res = await api.resendInvite(userId);
      setSuccessToast(res.message || `Fresh invitation email sent to ${email}`);
    } catch (err: any) {
      alert(err.message || "Failed to resend invite.");
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.team_name && m.team_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = statusFilter === "ALL" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === "ACTIVE").length;
  const invitedCount = members.filter((m) => m.status === "INVITED").length;

  const isHRAdmin = user?.role === "HR_ADMIN";
  const isManager = user?.role === "MANAGER";

  return (
    <div className="space-y-8 pb-12">
      {/* Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Organization Directory & Provisioning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Team & Account Orchestration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Controlled organizational hierarchy. Provision managers and team members with single-use invitation tokens and automated email dispatches.
          </p>
        </div>

        {/* Provision Buttons */}
        <div className="flex items-center gap-3">
          {isHRAdmin && (
            <button
              onClick={() => openProvisionModal("MANAGER")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Provision Manager</span>
            </button>
          )}

          {(isHRAdmin || isManager) && (
            <button
              onClick={() => openProvisionModal("EMPLOYEE")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Team Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Workforce</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalCount}</span>
            <span className="text-xs font-semibold text-slate-500">provisioned accounts</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Active Members</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{activeCount}</span>
            <span className="text-xs font-semibold text-slate-500">passwords configured</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending Invitations</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">{invitedCount}</span>
            <span className="text-xs font-semibold text-slate-500">awaiting setup</span>
          </div>
        </div>
      </div>

      {/* Members Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, role, or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {["ALL", "ACTIVE", "INVITED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st === "ALL" ? "All Statuses" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Department & Team</th>
                <th className="py-3 px-4">Direct Manager</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <RotateCw className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Loading team directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No workforce members match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Member */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          {m.first_name ? m.first_name.slice(0, 2).toUpperCase() : "EM"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{m.full_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{m.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          m.role === "HR_ADMIN"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : m.role === "MANAGER"
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {m.role}
                      </span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">
                        {m.designation}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {m.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          ACTIVE
                        </span>
                      ) : m.status === "INVITED" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                          <Clock className="w-3 h-3" />
                          INVITED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                          {m.status}
                        </span>
                      )}
                    </td>

                    {/* Dept & Team */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{m.department_name}</div>
                      <div className="text-[11px] text-slate-500">{m.team_name || "General Team"}</div>
                    </td>

                    {/* Direct Manager */}
                    <td className="py-3.5 px-4">
                      <span className="text-slate-700 font-medium">
                        {m.manager_name || "HR Leadership"}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {m.location_name}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {m.status === "INVITED" && (
                        <div className="inline-flex items-center gap-1.5">
                          {/* Copy Link Button */}
                          <button
                            onClick={() => handleCopyInvite(m.user_id, m.email)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] transition-colors cursor-pointer border border-indigo-200/60"
                            title="Copy single-use invitation link to clipboard"
                          >
                            {copiedId === m.user_id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-indigo-600" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          {/* Resend Email Button */}
                          <button
                            onClick={() => handleResend(m.user_id, m.email)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors cursor-pointer"
                            title="Resend invitation email"
                          >
                            <Send className="w-3 h-3 text-slate-500" />
                            <span>Resend</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provisioning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* If Invitation was created and URL is available, show direct copy card */}
            {createdInviteInfo ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Invitation Created!</h3>
                    <p className="text-xs text-slate-500">Email dispatched to {createdInviteInfo.email}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Direct Single-Use Invitation Link
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdInviteInfo.invite_url}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(createdInviteInfo.invite_url);
                        setSuccessToast("Invitation link copied to clipboard!");
                      }}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    This link expires in 48 hours and can be used to set up the password and activate the account.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Enterprise Provisioning</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {provisionType === "MANAGER" ? "Provision Engineering Manager" : "Invite Team Member"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Generates a secure 48-hour single-use token and dispatches an invitation email via Resend.
                  </p>
                </div>

                {modalError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {modalError}
                  </div>
                )}

                <form onSubmit={handleProvisionSubmit} className="space-y-4">
                  {/* Context pill for Manager */}
                  {!isHRAdmin && (
                    <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-indigo-900 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {user?.department_name || "Engineering"} • {user?.location_name || "Office HQ"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                        Direct Team Reporting
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. David Miller"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="david@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Only HR Admins configure global department and office location */}
                  {isHRAdmin && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Department
                        </label>
                        <select
                          value={formData.department_id}
                          onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        >
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Office Location
                        </label>
                        <select
                          value={formData.location_id}
                          onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        >
                          {locations.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Designation / Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Software Engineer"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>

                    {provisionType === "MANAGER" ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          New Team Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Infrastructure Platform"
                          value={formData.team_name}
                          onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Assigned Team
                        </label>
                        <select
                          value={formData.team_id}
                          onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        >
                          {(isHRAdmin
                            ? teams
                            : teams.filter((t) => !user?.department_id || t.department_id === user?.department_id)
                          ).map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? "Dispatching..." : "Dispatch Invitation"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
