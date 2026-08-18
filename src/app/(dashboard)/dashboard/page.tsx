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
  MapPin,
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
import { formatDate, formatDateRange, getStatusBadgeVariant, formatDays } from "@/lib/utils";

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
        <div className="h-24 bg-white rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome Card */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs">
              {profile?.department_name || "Engineering"}
            </span>
            <span className="text-xs text-indigo-100 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {profile?.location_name} Office
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            Welcome back, {profile?.employee_name || profile?.full_name || profile?.first_name || (profile?.email ? profile.email.split('@')[0] : "Colleague")}
          </h1>
          <p className="text-sm text-indigo-100 mt-1.5 max-w-xl leading-relaxed">
            Dynamic balances automatically reserve pending days and calculate exact regional
            holidays and multi-tier approval workflows in real time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/apply">
            <Button
              variant="secondary"
              className="bg-white text-indigo-950 hover:bg-slate-50 font-bold border-transparent shadow-sm px-5 py-2.5 rounded-xl text-sm"
              leftIcon={<CalendarPlus className="w-4 h-4 text-indigo-600" />}
            >
              Apply Leave
            </Button>
          </Link>
          <Link href="/requests">
            <Button
              variant="secondary"
              className="bg-indigo-800/60 hover:bg-indigo-800 text-white border-white/20 font-semibold px-4 py-2.5 rounded-xl text-sm"
            >
              My History
            </Button>
          </Link>
        </div>
      </div>

      {/* Dynamic Leave Balances Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Verified Leave Quotas & Balances
          </h2>
          <span className="text-xs font-medium text-slate-500">
            Available = Accrued − Approved Used − Pending Reserved
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {balances.map((b) => (
            <LeaveKpiCard key={b.leave_type_id} balance={b} />
          ))}
        </div>
      </div>

      {/* Grid: Recent Requests Table & Upcoming Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Requests Table */}
        <Card className="lg:col-span-2 shadow-2xs border-slate-200/90 rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Recent Leave Activity</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Your submitted, approved, and pending time-off requests
              </p>
            </div>
            <Link href="/requests" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
              View All History
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentRequests.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-400">
                No leave requests filed yet. Click &quot;Apply Leave&quot; above to submit your first request.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">Leave Type</th>
                      <th className="px-6 py-3.5 font-bold">Dates</th>
                      <th className="px-6 py-3.5 font-bold">Working Days</th>
                      <th className="px-6 py-3.5 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: req.leave_type_color }}
                          />
                          {req.leave_type_name}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {formatDateRange(req.start_date, req.end_date)}
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-bold">
                          {formatDays(req.working_days)}d
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeVariant(
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
        <Card className="shadow-2xs border-slate-200/90 rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Upcoming Holidays</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                {profile?.location_name} Regional Calendar (2026)
              </p>
            </div>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 max-h-84 overflow-y-auto">
              {holidays.map((h) => (
                <div key={h.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">
                      {h.name}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      {formatDate(h.date)}
                    </span>
                  </div>
                  {h.is_mandatory && (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
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
