"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { UserProfile } from "@/lib/types";
import { Sidebar } from "@/components/navigation/Sidebar";
import { TopNavbar } from "@/components/navigation/TopNavbar";
import { AIChatDrawer } from "@/components/ai/AIChatDrawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const profile = await api.getMyProfile();
      setUser(profile);

      if (profile.role === "MANAGER" || profile.role === "HR_ADMIN") {
        try {
          const pending = await api.getPendingApprovals();
          setPendingApprovalsCount(pending.length);
        } catch {
          // ignore
        }
      }
    } catch {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span>Verifying secure enterprise session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Untitled UI Sidebar */}
      <Sidebar
        user={user}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <TopNavbar
          user={user}
          onOpenAIChat={() => setIsAIChatOpen(true)}
          onPersonaSwitched={fetchUserData}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Global AI Leave Assistant Drawer */}
      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
    </div>
  );
}
