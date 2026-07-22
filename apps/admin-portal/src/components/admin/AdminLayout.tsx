"use client";

import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { FilingFooter } from "./FilingFooter";
import { tokens } from "@/lib/design-tokens";

interface AdminLayoutProps {
  children: ReactNode;
  role: number;
  isPsychologist: boolean;
}

export function AdminLayout({ children, role, isPsychologist }: AdminLayoutProps) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{ width: tokens.sidebarWidth, flexShrink: 0, overflow: "hidden" }}>
        <AdminSidebar role={role} isPsychologist={isPsychologist} />
      </aside>

      {/* Right section */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <header style={{ height: tokens.headerHeight, flexShrink: 0 }}>
          <AdminHeader />
        </header>

        {/* Main content */}
        <main style={{
          flex: 1,
          overflow: "auto",
          backgroundColor: tokens.bgPage,
          padding: tokens.spacingXl,
        }}>
          {children}
        </main>

        <FilingFooter />
      </div>
    </div>
  );
}
