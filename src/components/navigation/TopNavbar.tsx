"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Sparkles,
  LogOut,
  MapPin,
  Building2,
  ChevronDown,
  Calendar,
  History,
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getNotifications().then(setNotifications).catch(() => {});
  }, []);

  // Robust document listener for closing on outside clicks
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  const handleToggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isNotificationsOpen;
    setIsNotificationsOpen(nextState);
    setIsUserMenuOpen(false);

    if (nextState && unreadNotificationsCount > 0) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      api.markAllNotificationsRead().catch(() => {});
    }
  };

  const handleToggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUserMenuOpen((prev) => !prev);
    setIsNotificationsOpen(false);
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    try {
      await api.logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      window.location.replace("/login");
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

      {/* Right: Actions, AI Copilot & User Dropdown */}
      <div className="flex items-center gap-3">
        {/* AI Assistant Button */}
        <button
          type="button"
          onClick={onOpenAIChat}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>AI Copilot</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={handleToggleNotifications}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 relative transition-colors cursor-pointer"
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

        {/* User Profile Menu with Dropdown */}
        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={handleToggleUserMenu}
              className="flex items-center gap-2.5 p-1.5 pl-2 rounded-2xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user.employee_name ? user.employee_name.slice(0, 2).toUpperCase() : "ME"}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {user.employee_name || user.email}
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight font-medium">
                  {user.designation || user.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in-50 zoom-in-95">
                {/* User Summary Header */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {user.employee_name ? user.employee_name.slice(0, 2).toUpperCase() : "ME"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {user.employee_name || "Employee"}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{user.department_name || "General"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{user.location_name || "HQ"}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Navigation Links */}
                <div className="p-1.5 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push("/apply");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Apply for Leave</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push("/requests");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <History className="w-4 h-4 text-indigo-600" />
                    <span>My Requests & Projections</span>
                  </button>
                </div>

                {/* Sign Out Button */}
                <div className="p-1.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
