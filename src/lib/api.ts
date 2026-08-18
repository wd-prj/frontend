import {
  UserProfile,
  OrgMetaResponse,
  LeaveTypeInfo,
  LeaveBalanceInfo,
  HolidayInfo,
  PreValidationResponse,
  LeaveRequestInfo,
  WorkforceIntelligenceOverview,
  NotificationItem,
  AuditLogItem,
  TeamInfo,
  TeamMemberInfo,
  InvitationDetails,
  InviteManagerPayload,
  InviteEmployeePayload,
  AIChatResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://zenithhr-backend.onrender.com/api/v1";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Attach Bearer token fallback if available in localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("zenith_token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Send and receive HTTP-only cookies
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorMessage = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();

  // If response contains access_token, save it to localStorage
  if (data && typeof data === "object" && "access_token" in data && typeof window !== "undefined") {
    localStorage.setItem("zenith_token", (data as any).access_token);
  }

  return data as T;
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await request<UserProfile & { access_token?: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.access_token && typeof window !== "undefined") {
      localStorage.setItem("zenith_token", res.access_token);
    }
    return res;
  },

  getOrgMetadata: () => request<OrgMetaResponse>("/auth/org-metadata"),

  logout: async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("zenith_token");
    }
    return request<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  },

  getMe: () => request<UserProfile>("/auth/me"),

  // Invitations (Public Token Validation & Redemption)
  getInvitationDetails: (token: string) =>
    request<InvitationDetails>(`/auth/invitation-details?token=${encodeURIComponent(token)}`),

  acceptInvitation: async (token: string, password: string) => {
    const res = await request<UserProfile & { access_token?: string }>("/auth/accept-invitation", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
    if (res.access_token && typeof window !== "undefined") {
      localStorage.setItem("zenith_token", res.access_token);
    }
    return res;
  },

  // Provisioning & Team Hierarchy (HR Admin / Manager)
  inviteManager: (payload: InviteManagerPayload) =>
    request<{ message: string; employee_id: string; invitation_id: string; team_id: string }>(
      "/provisioning/invite-manager",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  inviteEmployee: (payload: InviteEmployeePayload) =>
    request<{ message: string; employee_id: string; invitation_id: string }>(
      "/provisioning/invite-employee",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  getTeamMembers: () => request<TeamMemberInfo[]>("/provisioning/members"),

  getTeams: () => request<TeamInfo[]>("/provisioning/teams"),

  resendInvite: (userId: string) =>
    request<{ message: string }>("/provisioning/resend-invite", {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    }),

  // Employee
  getMyProfile: () => request<UserProfile>("/employee/profile"),

  getMyBalances: (year?: number) =>
    request<LeaveBalanceInfo[]>(`/employee/balances${year ? `?year=${year}` : ""}`),

  getMyHolidays: (year?: number) =>
    request<HolidayInfo[]>(`/employee/holidays${year ? `?year=${year}` : ""}`),

  // Leave
  getLeaveTypes: () => request<LeaveTypeInfo[]>("/leave/types"),

  validateLeave: (data: { leave_type_id: string; start_date: string; end_date: string }) =>
    request<PreValidationResponse>("/leave/validate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  submitLeave: (data: { leave_type_id: string; start_date: string; end_date: string; reason: string }) =>
    request<LeaveRequestInfo>("/leave/submit", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMyRequests: (status?: string) =>
    request<LeaveRequestInfo[]>(`/leave/my-requests${status ? `?status=${status}` : ""}`),

  whatIfSimulation: (data: { leave_type_id: string; start_date: string; end_date: string }) =>
    request<PreValidationResponse>("/leave/what-if", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  cancelRequest: (requestId: string) =>
    request<LeaveRequestInfo>(`/leave/${requestId}/cancel`, {
      method: "POST",
    }),

  // Manager & Approvals
  getPendingApprovals: () => request<LeaveRequestInfo[]>("/manager/pending-requests"),

  actionApproval: (stepId: string, action: "APPROVE" | "REJECT", comments?: string) =>
    request<LeaveRequestInfo>(`/manager/approvals/${stepId}/action`, {
      method: "POST",
      body: JSON.stringify({ action, comments }),
    }),

  getTeamRequests: () => request<LeaveRequestInfo[]>("/manager/team-requests"),

  // Workforce Intelligence
  getIntelligenceOverview: () => request<WorkforceIntelligenceOverview>("/intelligence/overview"),

  // Notifications
  getNotifications: () => request<NotificationItem[]>("/notifications/"),

  markNotificationRead: (id: string) =>
    request<{ message: string }>(`/notifications/${id}/read`, {
      method: "POST",
    }),

  markAllNotificationsRead: () =>
    request<{ marked_count: number }>("/notifications/read-all", {
      method: "POST",
    }),

  // Admin & Audit
  getAuditTrail: (limit = 50) =>
    request<AuditLogItem[]>(`/admin/audit-trail?limit=${limit}`),

  // AI Assistant
  chatAI: (message: string, history: Array<{ role: string; content: string }> = []) =>
    request<AIChatResponse>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),
};
