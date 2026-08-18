import {
  UserProfile,
  RegisterData,
  OrgMetaResponse,
  LeaveTypeInfo,
  LeaveBalanceInfo,
  HolidayInfo,
  PreValidationResponse,
  LeaveRequestInfo,
  WorkforceIntelligenceOverview,
  NotificationItem,
  AuditLogItem,
  AIChatResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
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

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<UserProfile>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: RegisterData) =>
    request<UserProfile>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getOrgMetadata: () => request<OrgMetaResponse>("/auth/org-metadata"),

  logout: () =>
    request<{ message: string }>("/auth/logout", {
      method: "POST",
    }),

  getMe: () => request<UserProfile>("/auth/me"),

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
