"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Sparkles,
  Users,
  LogOut,
  Check,
  MapPin,
  Building2,
  ChevronDown,
} from "lucide-react";
import { UserProfile, PersonaOption, NotificationItem } from "@/lib/types";
import { api } from "@/lib/api";

interface TopNavbarProps {
  user: UserProfile | null;
  onOpenAIChat: () => void;
  onPersonaSwitched: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  user,
  onOpenAIChat,
  onPersonaSwitched,
}) => {
  const router = useRouter();
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    api.getPersonas().then(setPersonas).catch(() => {});
    api.getNotifications().then(setNotifications).catch(() => {});
  }, []);

  const handleSwitchPersona = async (userId: string) => {
    setIsSwitching(true);
    setIsPersonaOpen(false);
    try {
      await api.switchPersona(userId);
      onPersonaSwitched();
      router.refresh();
    } catch (err) {
      console.error("Failed to switch persona", err);
    } finally {
      setIsSwitching(false);
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
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100/90 text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            {user.location_name} Center
          </span>
        )}
        {user?.department_name && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100/90 text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            {user.department_name}
          </span>
        )}
      </div>

      {/* Right: Actions, Persona Switcher & User */}
      <div className="flex items-center gap-3">
        {/* Quick Role & Identity Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsPersonaOpen(!isPersonaOpen)}
            disabled={isSwitching}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-950 text-xs font-bold transition-all shadow-2xs"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Switch Role / User</span>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
          </button>

          {isPersonaOpen && (
            <div className="absolute right-0 mt-2 w-84 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 tracking-tight block">
                  Select User Persona
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Switch roles, location policies (Chennai/Bangalore) & approvals
                </span>
              </div>
              <div className="max-h-76 overflow-y-auto py-1.5 divide-y divide-slate-50">
                {personas.map((p) => {
                  const isCurrent = user?.email === p.email;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSwitchPersona(p.id)}
                      className={`w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-slate-50 transition-colors ${
                        isCurrent ? "bg-indigo-50/50" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-slate-200">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {p.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                          {p.designation} • {p.location_name}
                        </span>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Button */}
        <button
          onClick={onOpenAIChat}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>AI Copilot</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 relative transition-colors"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                    {unreadNotificationsCount} unread
                  </span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3.5 hover:bg-slate-50 text-left">
                      <h5 className="text-xs font-bold text-slate-800">{n.title}</h5>
                      <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  );
};
