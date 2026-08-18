"use client";

import React from "react";
import { Card, Title, Text, BarChart, DonutChart } from "@tremor/react";
import { DepartmentLeaveStat, LeaveTypeDistribution } from "@/lib/types";

interface DepartmentUtilizationChartProps {
  deptStats: DepartmentLeaveStat[];
  leaveTypeDist: LeaveTypeDistribution[];
}

export const DepartmentUtilizationChart: React.FC<DepartmentUtilizationChartProps> = ({
  deptStats,
  leaveTypeDist,
}) => {
  const chartData = deptStats.map((d) => ({
    Department: d.department_name,
    "Days Taken": d.total_days_taken,
    "Active Absences": d.active_absences,
    "Utilization (%)": d.utilization_rate,
  }));

  const donutData = leaveTypeDist.map((l) => ({
    name: l.leave_type_name,
    days: l.total_working_days,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 ring-1 ring-slate-200 shadow-xs bg-white rounded-xl">
        <Title className="text-base font-semibold text-slate-900">
          Department Leave Utilization
        </Title>
        <Text className="text-xs text-slate-500 mt-0.5">
          Total working days taken by department across the current calendar year
        </Text>
        <BarChart
          className="mt-6 h-64"
          data={chartData}
          index="Department"
          categories={["Days Taken", "Active Absences"]}
          colors={["indigo", "amber"]}
          valueFormatter={(number: number) => `${number}`}
          yAxisWidth={48}
        />
      </Card>

      <Card className="ring-1 ring-slate-200 shadow-xs bg-white rounded-xl">
        <Title className="text-base font-semibold text-slate-900">
          Leave Type Distribution
        </Title>
        <Text className="text-xs text-slate-500 mt-0.5">
          Proportion of leave days taken by category
        </Text>
        <DonutChart
          className="mt-6 h-56"
          data={donutData}
          category="days"
          index="name"
          valueFormatter={(number: number) => `${number} days`}
          colors={["indigo", "emerald", "amber", "rose", "cyan"]}
        />
      </Card>
    </div>
  );
};
