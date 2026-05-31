"use client";

import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { FilingFooter } from "./FilingFooter";

interface AdminLayoutProps {
  children: ReactNode;
  role: number;
  isPsychologist: boolean;
}

export function AdminLayout({ children, role, isPsychologist }: AdminLayoutProps) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{ width: "220px", flexShrink: 0, overflow: "hidden" }}>
        <AdminSidebar role={role} isPsychologist={isPsychologist} />
      </aside>

      {/* Right section */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <header style={{ height: "60px", flexShrink: 0 }}>
          <AdminHeader />
        </header>

        {/* Main content */}
        <main style={{
          flex: 1,
          overflow: "auto",
          backgroundColor: "#f0f2f5",
          padding: "20px",
        }}>
          {children}
        </main>

        <FilingFooter />
      </div>
    </div>
  );
}
