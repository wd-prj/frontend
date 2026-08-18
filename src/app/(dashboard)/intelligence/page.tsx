"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Building,
  CheckCircle2,
} from "lucide-react";
import { Card, Metric, Text, Title, Grid } from "@tremor/react";
import { api } from "@/lib/api";
import { WorkforceIntelligenceOverview } from "@/lib/types";
import { DepartmentUtilizationChart } from "@/components/analytics/DepartmentUtilizationChart";
import { CoverageRiskBanner } from "@/components/analytics/CoverageRiskBanner";
import { formatDateRange, getStatusBadgeVariant, formatDays } from "@/lib/utils";

export default function IntelligencePage() {
  const [overview, setOverview] = useState<WorkforceIntelligenceOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .getIntelligenceOverview()
      .then(setOverview)
      .catch((err) => console.error("Intelligence load error", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !overview) {
    return <div className="p-14 text-center text-sm text-slate-400">Loading workforce intelligence...</div>;
  }

  const {
    total_employees,
    currently_on_leave,
    pending_approvals_count,
    avg_annual_leave_utilization,
    department_stats,
    leave_type_distribution,
    upcoming_absences,
    coverage_risk_alerts,
  } = overview;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/90 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workforce Leave Intelligence</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time workforce analytics, department utilization trends, and absence coverage risks.
          </p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
          Analytics Engine
        </span>
      </div>

      {/* Top Tremor Metric Cards */}
      <Grid numItemsSm={2} numItemsLg={4} className="gap-4">
        <Card className="ring-1 ring-slate-200/90 shadow-2xs bg-white rounded-2xl p-5">
          <Text className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Workforce</Text>
          <Metric className="text-3xl font-extrabold text-slate-900 mt-1.5">{total_employees}</Metric>
          <Text className="text-xs text-slate-500 font-medium mt-1">Active employees</Text>
        </Card>

        <Card className="ring-1 ring-slate-200/90 shadow-2xs bg-white rounded-2xl p-5">
          <Text className="text-xs text-slate-500 font-bold uppercase tracking-wider">On Leave Today</Text>
          <Metric className="text-3xl font-extrabold text-emerald-600 mt-1.5">{currently_on_leave}</Metric>
          <Text className="text-xs text-slate-500 font-medium mt-1">Scheduled absences</Text>
        </Card>

        <Card className="ring-1 ring-slate-200/90 shadow-2xs bg-white rounded-2xl p-5">
          <Text className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pending Reviews</Text>
          <Metric className="text-3xl font-extrabold text-amber-600 mt-1.5">{pending_approvals_count}</Metric>
          <Text className="text-xs text-slate-500 font-medium mt-1">Awaiting manager action</Text>
        </Card>

        <Card className="ring-1 ring-slate-200/90 shadow-2xs bg-white rounded-2xl p-5">
          <Text className="text-xs text-slate-500 font-bold uppercase tracking-wider">Avg Quota Burn Rate</Text>
          <Metric className="text-3xl font-extrabold text-indigo-600 mt-1.5">{avg_annual_leave_utilization}%</Metric>
          <Text className="text-xs text-slate-500 font-medium mt-1">Annual leave utilized</Text>
        </Card>
      </Grid>

      {/* Coverage Risk Alerts */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Capacity & Coverage Insights
        </h3>
        <CoverageRiskBanner alerts={coverage_risk_alerts} />
      </div>

      {/* Tremor Visualizations */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Utilization Trends & Category Breakdown
        </h3>
        <DepartmentUtilizationChart
          deptStats={department_stats}
          leaveTypeDist={leave_type_distribution}
        />
      </div>

      {/* Upcoming Absences Schedule */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Upcoming Scheduled Absences (Next 30 Days)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Workforce availability across Chennai and Bangalore offices
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {upcoming_absences.length} Scheduled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5 font-bold">Employee</th>
                <th className="px-6 py-3.5 font-bold">Department</th>
                <th className="px-6 py-3.5 font-bold">Location</th>
                <th className="px-6 py-3.5 font-bold">Leave Type</th>
                <th className="px-6 py-3.5 font-bold">Dates</th>
                <th className="px-6 py-3.5 font-bold">Working Days</th>
                <th className="px-6 py-3.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcoming_absences.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {u.employee_name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{u.department_name}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{u.location_name}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: u.leave_type_color }}
                    />
                    {u.leave_type_name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {formatDateRange(u.start_date, u.end_date)}
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-extrabold">{formatDays(u.working_days)}d</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeVariant(
                        u.status
                      )}`}
                    >
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
