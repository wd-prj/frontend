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
    { name: "My Requests & What-If", href: "/requests", icon: History },
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
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
          W
        </div>
        <div>
          <span className="font-bold text-white text-sm tracking-tight block">
            Workforce PTO
          </span>
          <span className="text-[10px] text-indigo-300 font-medium tracking-wider uppercase block">
            AI Orchestration
          </span>
        </div>
      </div>

      {/* AI Assistant Quick Launcher Card */}
      <div className="p-4">
        <button
          onClick={onOpenAIChat}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 p-3 text-left text-white shadow-md hover:from-indigo-500 hover:to-indigo-600 transition-all group flex items-center justify-between border border-indigo-400/30"
        >
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-xs text-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              Ask AI Assistant
            </div>
            <p className="text-[11px] text-indigo-200 mt-0.5">
              Verify policies & balances
            </p>
          </div>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-md text-white font-medium group-hover:bg-white/30">
            Open
          </span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors",
                isActive
                  ? "bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4", isActive ? "text-indigo-400" : "text-slate-400")} />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Profile Section */}
      {user && (
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-semibold text-xs border border-slate-600">
              {user.employee_name?.slice(0, 2).toUpperCase() || "ME"}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-white truncate block">
                {user.employee_name || user.email}
              </span>
              <span className="text-[10px] text-slate-400 truncate block">
                {user.role} • {user.location_name || "HQ"}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
