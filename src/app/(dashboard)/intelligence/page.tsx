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
import { formatDateRange, getStatusBadgeVariant } from "@/lib/utils";

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
    return <div className="p-12 text-center text-xs text-slate-400">Loading workforce intelligence...</div>;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Workforce Leave Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time workforce analytics, department utilization trends, and team absence coverage risks.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
          Enterprise Analytics Engine
        </span>
      </div>

      {/* Top Tremor Metric Cards */}
      <Grid numItemsSm={2} numItemsLg={4} className="gap-4">
        <Card className="ring-1 ring-slate-200 shadow-xs bg-white rounded-xl">
          <Text className="text-xs text-slate-500 font-medium uppercase">Total Workforce</Text>
          <Metric className="text-2xl font-bold text-slate-900 mt-1">{total_employees}</Metric>
          <Text className="text-xs text-slate-500 mt-1">Active employees</Text>
        </Card>

        <Card className="ring-1 ring-slate-200 shadow-xs bg-white rounded-xl">
          <Text className="text-xs text-slate-500 font-medium uppercase">On Leave Today</Text>
          <Metric className="text-2xl font-bold text-emerald-600 mt-1">{currently_on_leave}</Metric>
          <Text className="text-xs text-slate-500 mt-1">Scheduled absences</Text>
        </Card>

        <Card className="ring-1 ring-slate-200 shadow-xs bg-white rounded-xl">
          <Text className="text-xs text-slate-500 font-medium uppercase">Pending Reviews</Text>
          <Metric className="text-2xl font-bold text-amber-600 mt-1">{pending_approvals_count}</Metric>
          <Text className="text-xs text-slate-500 mt-1">Awaiting manager action</Text>
        </Card>

        <Card className="ring-1 ring-slate-200 shadow-xs bg-white rounded-xl">
          <Text className="text-xs text-slate-500 font-medium uppercase">Avg Quota Utilization</Text>
          <Metric className="text-2xl font-bold text-indigo-600 mt-1">{avg_annual_leave_utilization}%</Metric>
          <Text className="text-xs text-slate-500 mt-1">Annual leave burn rate</Text>
        </Card>
      </Grid>

      {/* Coverage Risk Alerts */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Capacity & Coverage Insights
        </h3>
        <CoverageRiskBanner alerts={coverage_risk_alerts} />
      </div>

      {/* Tremor Visualizations */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Utilization Trends & Breakdown
        </h3>
        <DepartmentUtilizationChart
          deptStats={department_stats}
          leaveTypeDist={leave_type_distribution}
        />
      </div>

      {/* Upcoming Absences Schedule */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Upcoming Scheduled Absences (Next 30 Days)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Workforce availability across Chennai and Bangalore offices
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {upcoming_absences.length} Scheduled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3 font-semibold">Employee</th>
                <th className="px-6 py-3 font-semibold">Department</th>
                <th className="px-6 py-3 font-semibold">Location</th>
                <th className="px-6 py-3 font-semibold">Leave Type</th>
                <th className="px-6 py-3 font-semibold">Dates</th>
                <th className="px-6 py-3 font-semibold">Working Days</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcoming_absences.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-semibold text-slate-900">
                    {u.employee_name}
                  </td>
                  <td className="px-6 py-3 text-slate-600">{u.department_name}</td>
                  <td className="px-6 py-3 text-slate-600">{u.location_name}</td>
                  <td className="px-6 py-3 font-medium text-slate-800 flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: u.leave_type_color }}
                    />
                    {u.leave_type_name}
                  </td>
                  <td className="px-6 py-3 text-slate-600 font-medium">
                    {formatDateRange(u.start_date, u.end_date)}
                  </td>
                  <td className="px-6 py-3 text-slate-900 font-bold">{u.working_days}d</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getStatusBadgeVariant(
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
