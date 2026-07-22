"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, clearSession } from "@/lib/session";
import { tokens } from "@/lib/design-tokens";

export function AdminHeader() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = getStoredUser<Record<string, unknown>>();
  const nickname = (user?.nickname as string) ?? "管理员";
  const headPath = (user?.headPath as string) ?? "";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "100%",
      padding: "0 24px",
      backgroundColor: tokens.bgCard,
      borderBottom: `1px solid ${tokens.border}`,
    }}>
      {/* 左侧：面包屑占位 */}
      <div style={{ fontSize: tokens.fontSizeSm, color: tokens.textSecondary }}>
        心愈智联 · 管理后台
      </div>

      {/* 右侧：用户 */}
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 10px",
            border: "none",
            background: "none",
            cursor: "pointer",
            color: tokens.textRegular,
            fontSize: tokens.fontSizeBase,
            borderRadius: tokens.radiusMd,
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.bgHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          {/* Avatar */}
          <span style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})`,
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {headPath ? (
              <img src={headPath} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              (nickname || "管").charAt(0)
            )}
          </span>
          <span style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {nickname}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {dropdownOpen && (
          <div style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "4px",
            backgroundColor: tokens.bgCard,
            border: `1px solid ${tokens.border}`,
            borderRadius: tokens.radiusMd,
            boxShadow: tokens.shadowLg,
            minWidth: "140px",
            zIndex: 2000,
            overflow: "hidden",
          }}>
            <button
              onClick={() => {
                setDropdownOpen(false);
                router.push("/admin/dashboard");
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: "13px",
                color: tokens.textRegular,
                textAlign: "left",
                borderBottom: `1px solid ${tokens.borderLight}`,
                transition: "background-color 0.1s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.bgHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              管理后台
            </button>
            <button
              onClick={() => {
                setDropdownOpen(false);
                handleLogout();
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: "13px",
                color: tokens.danger,
                textAlign: "left",
                transition: "background-color 0.1s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.dangerLight; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              退出登录
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
