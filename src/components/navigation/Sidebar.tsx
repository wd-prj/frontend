"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarPlus,
  History,
  CheckSquare,
  BarChart3,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/lib/types";

interface SidebarProps {
  user: UserProfile | null;
  onOpenAIChat: () => void;
  pendingApprovalsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  onOpenAIChat,
  pendingApprovalsCount = 0,
}) => {
  const pathname = usePathname();
  const isManagerOrAdmin = user?.role === "MANAGER" || user?.role === "HR_ADMIN";

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Apply Leave", href: "/apply", icon: CalendarPlus },
    { name: "My Requests & Projections", href: "/requests", icon: History },
    ...(isManagerOrAdmin
      ? [
          {
            name: "Approvals Inbox",
            href: "/approvals",
            icon: CheckSquare,
            badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          },
          { name: "Workforce Intelligence", href: "/intelligence", icon: BarChart3 },
        ]
      : []),
    { name: "Audit Trail", href: "/audit", icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col shrink-0 h-screen sticky top-0 shadow-2xs z-20">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100 bg-white">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
          W
        </div>
        <div>
          <span className="font-bold text-slate-900 text-sm tracking-tight block">
            Workforce PTO
          </span>
          <span className="text-[11px] text-indigo-600 font-semibold tracking-wider uppercase block">
            Orchestration
          </span>
        </div>
      </div>

      {/* AI Assistant Quick Launcher Banner */}
      <div className="p-4">
        <button
          onClick={onOpenAIChat}
          className="w-full rounded-xl bg-gradient-to-br from-indigo-50 via-white to-indigo-50/70 p-3.5 text-left border border-indigo-200/80 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-900">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              AI Copilot
            </div>
            <span className="text-[10px] font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded-full group-hover:bg-indigo-700 transition-colors">
              Ask
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-snug">
            Verify policies, balances & scenarios
          </p>
        </button>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Workspace
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 shadow-2xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Current Logged-in User Profile Bar */}
      {user && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200 shrink-0">
              {user.employee_name ? user.employee_name.slice(0, 2).toUpperCase() : "ME"}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate block">
                {user.employee_name || user.email}
              </span>
              <span className="text-[11px] text-slate-500 truncate block">
                {user.role} • {user.location_name || "HQ"}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
