"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  UserProfile,
  LeaveBalanceInfo,
  HolidayInfo,
  LeaveRequestInfo,
} from "@/lib/types";
import { LeaveKpiCard } from "@/components/analytics/LeaveKpiCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateRange, getStatusBadgeVariant } from "@/lib/utils";

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [balances, setBalances] = useState<LeaveBalanceInfo[]>([]);
  const [holidays, setHolidays] = useState<HolidayInfo[]>([]);
  const [recentRequests, setRecentRequests] = useState<LeaveRequestInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prof, bals, hols, reqs] = await Promise.all([
          api.getMyProfile(),
          api.getMyBalances(),
          api.getMyHolidays(),
          api.getMyRequests(),
        ]);
        setProfile(prof);
        setBalances(bals);
        setHolidays(hols);
        setRecentRequests(reqs.slice(0, 5));
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-200 rounded-xl" />
          <div className="h-32 bg-slate-200 rounded-xl" />
          <div className="h-32 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {profile?.department_name || "Engineering"}
            </span>
            <span className="text-xs text-slate-400">
              • {profile?.location_name} Office
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-2">
            Welcome back, {profile?.employee_name || "Colleague"}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Dynamic balances automatically reserve pending days and calculate exact location
            holidays and multi-tier approval workflows in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/apply">
            <Button variant="primary" leftIcon={<CalendarPlus className="w-4 h-4" />}>
              Apply Leave
            </Button>
          </Link>
          <Link href="/requests">
            <Button
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              My History
            </Button>
          </Link>
        </div>
      </div>

      {/* Dynamic Leave Balances Section (Tremor KPI Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Verified Leave Quotas & Balances
          </h2>
          <span className="text-xs text-slate-500">
            Formula: Available = Accrued − Approved − Pending
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {balances.map((b) => (
            <LeaveKpiCard key={b.leave_type_id} balance={b} />
          ))}
        </div>
      </div>

      {/* Grid: Upcoming Holidays & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Requests Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Recent Leave Activity</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Your submitted, approved, and pending time-off requests
              </p>
            </div>
            <Link href="/requests" className="text-xs font-semibold text-indigo-600 hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No leave requests filed yet. Click &quot;Apply Leave&quot; above to submit your first request.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Type</th>
                      <th className="px-6 py-3 font-semibold">Dates</th>
                      <th className="px-6 py-3 font-semibold">Working Days</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right 1 Col: Location Holidays */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Upcoming Holidays</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                {profile?.location_name} Regional Calendar (2026)
              </p>
            </div>
            <Calendar className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {holidays.map((h) => (
                <div key={h.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      {h.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {formatDate(h.date)}
                    </span>
                  </div>
                  {h.is_mandatory && (
                    <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                      Official
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
