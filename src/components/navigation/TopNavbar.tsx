"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Sparkles,
  LogOut,
  MapPin,
  Building2,
  User as UserIcon,
  Check,
} from "lucide-react";
import { UserProfile, NotificationItem } from "@/lib/types";
import { api } from "@/lib/api";

interface TopNavbarProps {
  user: UserProfile | null;
  onOpenAIChat: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  user,
  onOpenAIChat,
}) => {
  const router = useRouter();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    api.getNotifications().then(setNotifications).catch(() => {});
  }, []);

  const handleToggleNotifications = () => {
    const nextState = !isNotificationsOpen;
    setIsNotificationsOpen(nextState);

    if (nextState && unreadNotificationsCount > 0) {
      // Immediately clear the red dot in UI
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      // Persist read status in backend
      api.markAllNotificationsRead().catch(() => {});
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Organization Context */}
      <div className="flex items-center gap-3">
        {user?.location_name && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100/90 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            {user.location_name} Office
          </span>
        )}
        {user?.department_name && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100/90 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            {user.department_name}
          </span>
        )}
      </div>

      {/* Right: Actions, AI Copilot & User Profile */}
      <div className="flex items-center gap-3">
        {/* AI Assistant Button */}
        <button
          onClick={onOpenAIChat}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>AI Copilot</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={handleToggleNotifications}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-84 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {notifications.length} total
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3.5 hover:bg-slate-50/80 text-left transition-colors">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-800">{n.title}</h5>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {n.created_at ? n.created_at.slice(11, 16) : ""}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile capsule & Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
              {user.employee_name ? user.employee_name.slice(0, 2).toUpperCase() : "ME"}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {user.employee_name || user.email}
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight font-medium">
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
