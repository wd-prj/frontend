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
import { Badge } from "@/components/ui/badge";

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
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Organization context */}
      <div className="flex items-center gap-3">
        {user?.location_name && (
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            {user.location_name} Center
          </span>
        )}
        {user?.department_name && (
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            {user.department_name}
          </span>
        )}
      </div>

      {/* Right: Actions, Persona Switcher & User */}
      <div className="flex items-center gap-3">
        {/* Quick Persona Switcher for Hackathon Demo */}
        <div className="relative">
          <button
            onClick={() => setIsPersonaOpen(!isPersonaOpen)}
            disabled={isSwitching}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-900 text-xs font-semibold transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Switch Demo Persona</span>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
          </button>

          {isPersonaOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Select Demo User Persona
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Instantly switch roles, location rules & approval rights
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {personas.map((p) => {
                  const isCurrent = user?.email === p.email;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSwitchPersona(p.id)}
                      className={`w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                        isCurrent ? "bg-indigo-50/50" : ""
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-slate-200">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {p.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate">
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI Copilot</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <span className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
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
                    <div key={n.id} className="p-3 hover:bg-slate-50 text-left">
                      <h5 className="text-xs font-semibold text-slate-800">{n.title}</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
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
          title="Logout"
          className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
