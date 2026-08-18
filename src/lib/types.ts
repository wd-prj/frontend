export type UserRole = "EMPLOYEE" | "MANAGER" | "HR_ADMIN";

export type LeaveRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type ApprovalStepStatus = "PENDING" | "APPROVED" | "REJECTED" | "SKIPPED";

export interface UserProfile {
  user_id: string;
  email: string;
  role: UserRole;
  employee_id?: string;
  employee_name?: string;
  location_id?: string;
  location_name?: string;
  department_id?: string;
  department_name?: string;
  designation?: string;
}

export interface OrgOption {
  id: string;
  name: string;
}

export interface OrgMetaResponse {
  departments: OrgOption[];
  locations: OrgOption[];
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  designation?: string;
  department_id?: string;
  location_id?: string;
  role?: UserRole;
}

export interface PersonaOption {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  department_name: string;
  location_name: string;
  avatar_url?: string;
  description: string;
}

export interface LocationInfo {
  id: string;
  name: string;
  country: string;
  timezone: string;
  description?: string;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface HolidayInfo {
  id: string;
  name: string;
  date: string;
  is_mandatory: boolean;
  description?: string;
}

export interface LeaveTypeInfo {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_paid: boolean;
  color_code: string;
  is_active: boolean;
}

export interface LeaveBalanceInfo {
  leave_type_id: string;
  leave_type_name: string;
  leave_type_code: string;
  color_code: string;
  annual_entitlement: number;
  carried_over: number;
  manual_adjustments: number;
  total_accrued: number;
  approved_used: number;
  pending_reserved: number;
  available_balance: number;
}

export interface DayDetail {
  date: string;
  day_name: string;
  is_weekend: boolean;
  is_holiday: boolean;
  holiday_name?: string;
  is_working_day: boolean;
}

export interface PeerAbsence {
  employee_id: string;
  employee_name: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  working_days: number;
  status: string;
}

export interface ConflictAnalysis {
  has_conflicts: boolean;
  conflicting_absences: PeerAbsence[];
  team_total_members: number;
  concurrent_absences_count: number;
  team_absence_percentage: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  risk_summary: string;
}

export interface PreValidationResponse {
  is_valid: boolean;
  calendar_days: number;
  weekend_days: number;
  holiday_days: number;
  working_days: number;
  available_balance_before: number;
  available_balance_after: number;
  has_overlapping_request: boolean;
  policy_violations: string[];
  warnings: string[];
  approval_route: string[];
  day_breakdown: DayDetail[];
  conflict_analysis?: ConflictAnalysis;
}

export interface ApprovalStepInfo {
  id: string;
  step_order: number;
  required_role: UserRole | string;
  approver_id: string;
  approver_name: string;
  approver_email: string;
  status: ApprovalStepStatus;
  comments?: string;
  actioned_at?: string;
}

export interface LeaveRequestInfo {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  department_name: string;
  location_name: string;
  leave_type_id: string;
  leave_type_name: string;
  leave_type_code: string;
  leave_type_color: string;
  start_date: string;
  end_date: string;
  calendar_days: number;
  weekend_days: number;
  holiday_days: number;
  working_days: number;
  reason: string;
  status: LeaveRequestStatus;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  approval_steps: ApprovalStepInfo[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  actor_id?: string;
  actor_email?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  previous_state?: Record<string, unknown>;
  new_state?: Record<string, unknown>;
  ai_rationale?: string;
  ip_address?: string;
  created_at: string;
}

export interface DepartmentLeaveStat {
  department_id: string;
  department_name: string;
  total_employees: number;
  active_absences: number;
  utilization_rate: number;
  total_days_taken: number;
}

export interface LocationLeaveStat {
  location_id: string;
  location_name: string;
  total_employees: number;
  active_absences: number;
  total_days_taken: number;
}

export interface LeaveTypeDistribution {
  leave_type_name: string;
  color_code: string;
  total_requests: number;
  total_working_days: number;
}

export interface UpcomingAbsenceItem {
  id: string;
  employee_name: string;
  employee_email: string;
  designation: string;
  department_name: string;
  location_name: string;
  leave_type_name: string;
  leave_type_color: string;
  start_date: string;
  end_date: string;
  working_days: number;
  status: string;
}

export interface CoverageRiskAlert {
  department_name: string;
  location_name: string;
  start_date: string;
  end_date: string;
  absent_count: number;
  team_size: number;
  absence_percentage: number;
  risk_level: string;
  message: string;
}

export interface WorkforceIntelligenceOverview {
  total_employees: number;
  currently_on_leave: number;
  pending_approvals_count: number;
  avg_annual_leave_utilization: number;
  department_stats: DepartmentLeaveStat[];
  location_stats: LocationLeaveStat[];
  leave_type_distribution: LeaveTypeDistribution[];
  upcoming_absences: UpcomingAbsenceItem[];
  coverage_risk_alerts: CoverageRiskAlert[];
}

export interface GroundedToolCall {
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_output: unknown;
}

export interface GroundedBreakdown {
  calendar_days?: number;
  weekend_days?: number;
  holiday_days?: number;
  working_days?: number;
  balance_before?: number;
  balance_after?: number;
  approval_route?: string[];
}

export interface AIChatResponse {
  reply: string;
  recommendation?: string;
  reason?: string;
  breakdown?: GroundedBreakdown;
  tool_calls_executed: GroundedToolCall[];
  is_grounded: boolean;
}
