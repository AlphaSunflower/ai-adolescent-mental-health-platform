"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { MenuItem } from "@/lib/role-utils";
import { getMenuByRole } from "@/lib/role-utils";
import { tokens } from "@/lib/design-tokens";

/* ---------- SVG icon set ---------- */
const icons: Record<string, React.ReactElement> = {
  DataBoard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  OfficeBuilding: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="9" y1="18" x2="9" y2="18.01"/><line x1="15" y1="18" x2="15" y2="18.01"/></svg>,
  UserFilled: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Service: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  Collection: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Medal: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  DocumentChecked: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg>,
  Reading: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Money: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Warning: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Sunny: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  ChatDotSquare: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="12" cy="10" r="1"/></svg>,
  Grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Monitor: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Document: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Tickets: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H4v4a2 2 0 0 1 0 4v4h16v-4"/><path d="M20 12a2 2 0 0 0 0-4V8"/></svg>,
  ChatLineSquare: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/></svg>,
  User: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
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

  return (
    <div style={{
      height: "100vh",
      backgroundColor: tokens.sidebarBg,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* 标志性元素：3px 暖色渐变线 — 山林与琥珀 */}
      <div style={{
        height: "3px",
        flexShrink: 0,
        background: `linear-gradient(90deg, ${tokens.primary} 0%, ${tokens.accent} 100%)`,
      }} />

      {/* Logo / Brand */}
      <div style={{
        padding: "18px 20px 16px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        {/* Logo mark: 潭绿 + 琥珀双色圆 */}
        <div style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "16px",
          fontWeight: 700,
          flexShrink: 0,
        }}>
          心
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: "14px", fontWeight: 600, lineHeight: 1.4, letterSpacing: "0.5px" }}>
            管理后台
          </div>
          <div style={{ color: tokens.sidebarText, fontSize: "11px", lineHeight: 1.3 }}>
            心愈智联
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: "4px 0" }}>
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
                    padding: "11px 20px",
                    border: "none",
                    background: "none",
                    color: isParentActive(item) ? "#fff" : tokens.sidebarText,
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "background-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.sidebarHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <span style={{ display: "inline-flex", marginRight: "10px", flexShrink: 0, opacity: 0.8 }}>
                    {icons[item.icon ?? ""] ?? null}
                  </span>
                  <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", opacity: 0.6 }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                {expanded && (
                  <div style={{ backgroundColor: tokens.sidebarSubBg, padding: "4px 0" }}>
                    {item.children.map((child) => (
                      <button
                        key={child.path}
                        onClick={() => child.path && router.push(child.path)}
                        style={{
                          width: "100%",
                          display: "block",
                          padding: "9px 20px 9px 48px",
                          border: "none",
                          background: "none",
                          color: isActive(child.path) ? tokens.sidebarActive : tokens.sidebarText,
                          fontSize: "13px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "color 0.15s",
                          position: "relative",
                        }}
                        onMouseEnter={(e) => { if (!isActive(child.path)) e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { if (!isActive(child.path)) e.currentTarget.style.color = tokens.sidebarText; }}
                      >
                        {/* 激活指示器 */}
                        {isActive(child.path) && (
                          <span style={{
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "3px",
                            height: "16px",
                            borderRadius: "0 2px 2px 0",
                            background: tokens.sidebarActive,
                          }} />
                        )}
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
                padding: "11px 20px",
                border: "none",
                background: "none",
                color: isActive(item.path) ? tokens.sidebarActive : tokens.sidebarText,
                fontSize: "13px",
                cursor: "pointer",
                transition: "background-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.sidebarHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <span style={{ display: "inline-flex", marginRight: "10px", flexShrink: 0, opacity: 0.8 }}>
                {icons[item.icon ?? ""] ?? null}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 底部品牌 */}
      <div style={{
        padding: "12px 20px",
        borderTop: `1px solid ${tokens.sidebarDivider}`,
        fontSize: "11px",
        color: tokens.sidebarText,
        opacity: 0.5,
        textAlign: "center",
      }}>
        心愈智联 v0.1
      </div>
    </div>
  );
}
