"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { MenuItem } from "@/lib/role-utils";
import { getMenuByRole } from "@/lib/role-utils";

/* ---------- Simple SVG icons ---------- */
const icons: Record<string, React.ReactElement> = {
  DataBoard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  OfficeBuilding: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="9" y1="18" x2="9" y2="18.01"/><line x1="15" y1="18" x2="15" y2="18.01"/></svg>,
  UserFilled: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Service: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  Collection: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Medal: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  DocumentChecked: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg>,
  Reading: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Money: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Warning: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Sunny: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  ChatDotSquare: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="12" cy="10" r="1"/></svg>,
  Grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Monitor: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Document: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Tickets: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H4v4a2 2 0 0 1 0 4v4h16v-4"/><path d="M20 12a2 2 0 0 0 0-4V8"/></svg>,
  ChatLineSquare: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/></svg>,
  User: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

interface AdminSidebarProps {
  role: number;
  isPsychologist: boolean;
}

export function AdminSidebar({ role, isPsychologist }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(["内容管理"]));
  const menu = getMenuByRole(role, isPsychologist);

  const toggleExpand = (label: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const isActive = (path?: string) => path && pathname === path;
  const isParentActive = (item: MenuItem) =>
    item.children?.some((c) => isActive(c.path)) ?? false;

  const sidebarBg = "#304156";
  const textColor = "#bfcbd9";
  const hoverBg = "#263445";
  const activeText = "#409eff";
  const subMenuBg = "#1f2d3d";

  return (
    <div style={{ height: "100vh", backgroundColor: sidebarBg, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      {/* Logo / Brand */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "6px",
          background: "linear-gradient(135deg, #409eff, #67c23a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "18px",
          fontWeight: 700,
          flexShrink: 0,
        }}>
          心
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: "15px", fontWeight: 600, lineHeight: 1.3 }}>管理后台</div>
          <div style={{ color: textColor, fontSize: "11px", lineHeight: 1.3 }}>心愈智联</div>
        </div>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: "8px 0" }}>
        {menu.map((item) => {
          if (item.children && item.children.length > 0) {
            const expanded = expandedMenus.has(item.label) || isParentActive(item);
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleExpand(item.label)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 20px",
                    border: "none",
                    background: "none",
                    color: isParentActive(item) ? "#fff" : textColor,
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "background-color 0.2s, color 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hoverBg; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <span style={{ display: "inline-flex", marginRight: "10px", flexShrink: 0 }}>
                    {icons[item.icon ?? ""] ?? null}
                  </span>
                  <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                {expanded && (
                  <div style={{ backgroundColor: subMenuBg }}>
                    {item.children.map((child) => (
                      <button
                        key={child.path}
                        onClick={() => child.path && router.push(child.path)}
                        style={{
                          width: "100%",
                          display: "block",
                          padding: "10px 20px 10px 48px",
                          border: "none",
                          background: "none",
                          color: isActive(child.path) ? activeText : textColor,
                          fontSize: "13px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => { if (!isActive(child.path)) e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { if (!isActive(child.path)) e.currentTarget.style.color = textColor; }}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => item.path && router.push(item.path)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                padding: "12px 20px",
                border: "none",
                background: "none",
                color: isActive(item.path) ? activeText : textColor,
                fontSize: "14px",
                cursor: "pointer",
                transition: "background-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hoverBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <span style={{ display: "inline-flex", marginRight: "10px", flexShrink: 0 }}>
                {icons[item.icon ?? ""] ?? null}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
