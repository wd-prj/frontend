"use client";

import React from "react";
import { Card, Metric, Text, ProgressBar } from "@tremor/react";
import { LeaveBalanceInfo } from "@/lib/types";
import { formatDays } from "@/lib/utils";

interface LeaveKpiCardProps {
  balance: LeaveBalanceInfo;
}

export const LeaveKpiCard: React.FC<LeaveKpiCardProps> = ({ balance }) => {
  const {
    leave_type_name,
    available_balance,
    approved_used,
    pending_reserved,
    total_accrued,
    color_code,
  } = balance;

  const usedPercentage =
    total_accrued > 0 ? Math.min(100, Math.round((approved_used / total_accrued) * 100)) : 0;

  const availablePercentage =
    total_accrued > 0 ? Math.round((available_balance / total_accrued) * 100) : 0;

  return (
    <Card className="ring-1 ring-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow bg-white rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: color_code || "#4f46e5" }}
            />
            <Text className="font-bold text-slate-700 text-xs tracking-wider uppercase">
              {leave_type_name}
            </Text>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <Metric className="text-3xl font-extrabold text-slate-900">{formatDays(available_balance)}</Metric>
            <span className="text-xs font-semibold text-slate-500">days available</span>
          </div>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-bold"
          style={{
            backgroundColor: `${color_code || "#4f46e5"}18`,
            color: color_code || "#4f46e5",
          }}
        >
          {availablePercentage}% Left
        </span>
      </div>

      <div className="mt-4 pt-1">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-semibold">
          <span>Used: {formatDays(approved_used)}d</span>
          <span>Pending: {formatDays(pending_reserved)}d</span>
          <span>Total: {formatDays(total_accrued)}d</span>
        </div>
        <ProgressBar
          value={usedPercentage}
          color={usedPercentage > 80 ? "rose" : "indigo"}
          className="h-2 rounded-full"
        />
      </div>
    </Card>
  );
};
