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
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    department_id: "",
    team_id: "",
    team_name: "",
    location_id: "",
    designation: "Software Engineer",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [profile, membersList, teamsList, meta] = await Promise.all([
        api.getMyProfile(),
        api.getTeamMembers(),
        api.getTeams(),
        api.getOrgMetadata(),
      ]);
      setUser(profile);
      setMembers(membersList);
      setTeams(teamsList);
      setDepartments(meta.departments);
      setLocations(meta.locations);

      // Default form values
      if (meta.departments.length > 0 && meta.locations.length > 0) {
        setFormData((prev) => ({
          ...prev,
          department_id: prev.department_id || meta.departments[0].id,
          location_id: prev.location_id || meta.locations[0].id,
          team_id: prev.team_id || (teamsList.length > 0 ? teamsList[0].id : ""),
        }));
      }
    } catch (err) {
      console.error("Error loading team data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (type: "EMPLOYEE" | "MANAGER") => {
    setProvisionType(type);
    setModalError(null);
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
    setIsSubmitting(true);

    try {
      if (provisionType === "MANAGER") {
        await api.inviteManager({
          full_name: formData.full_name,
          email: formData.email,
          department_id: formData.department_id,
          team_name: formData.team_name,
          location_id: formData.location_id,
          designation: formData.designation,
        });
      } else {
        await api.inviteEmployee({
          full_name: formData.full_name,
          email: formData.email,
          department_id: formData.department_id,
          team_id: formData.team_id,
          location_id: formData.location_id,
          designation: formData.designation,
        });
      }

      setSuccessToast(`Invitation email dispatched to ${formData.email} via Resend.`);
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setModalError(err.message || "Failed to provision account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (userId: string, email: string) => {
    try {
      await api.resendInvite(userId);
      setSuccessToast(`Fresh invitation email sent to ${email}`);
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Organization & Team Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isHRAdmin ? "Organization Directory & Provisioning" : "Team Members & Provisioning"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isHRAdmin
              ? "Enterprise-wide directory, organizational teams, and authorized account provisioning."
              : "Manage your direct reports, team assignments, and provision new team members."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {isHRAdmin && (
            <button
              onClick={() => handleOpenModal("MANAGER")}
              className="px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>+ Provision Manager</span>
            </button>
          )}
          {(isHRAdmin || isManager) && (
            <button
              onClick={() => handleOpenModal("EMPLOYEE")}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Invite Team Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Members</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Assigned to organization</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Accounts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">{activeCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Completed invitation</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Invites</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">{invitedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting password setup</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Teams</span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2">{teams.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across {departments.length} departments</div>
        </div>
      </div>

      {/* Directory Table Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, role, or team..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "ACTIVE", "INVITED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {st === "ALL" ? "All Statuses" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Department & Team</th>
                <th className="py-3.5 px-4">Direct Manager</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading directory...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No team members found matching your search.
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
                        <button
                          onClick={() => handleResend(m.user_id, m.email)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors cursor-pointer"
                          title="Resend invitation email"
                        >
                          <Send className="w-3 h-3 text-indigo-600" />
                          <span>Resend Email</span>
                        </button>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. David Miller"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="david@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Office Location</label>
                  <select
                    value={formData.location_id}
                    onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {provisionType === "MANAGER" ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Team Name</label>
                  <input
                    type="text"
                    required
                    value={formData.team_name}
                    onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                    placeholder="e.g. Infrastructure Platform"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Team</label>
                  <select
                    value={formData.team_id}
                    onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.department_name})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation / Title</label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Invitation...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Invitation Email</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
