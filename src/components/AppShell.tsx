"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { SessionUser } from "@/lib/auth";

interface Props {
  user: SessionUser;
  children: React.ReactNode;
}

export default function AppShell({ user, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          user={user}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
