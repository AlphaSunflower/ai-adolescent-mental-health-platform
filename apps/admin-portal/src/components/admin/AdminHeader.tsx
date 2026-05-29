"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, clearSession } from "@/lib/session";

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

  const mainBg = "#ffffff";
  const borderColor = "#e4e7ed";
  const textColor = "#606266";

  return (
    <div style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      height: "100%",
      padding: "0 20px",
      backgroundColor: mainBg,
      borderBottom: `1px solid ${borderColor}`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px",
            border: "none",
            background: "none",
            cursor: "pointer",
            color: textColor,
            fontSize: "14px",
            borderRadius: "4px",
          }}
        >
          <span style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#409eff",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {headPath ? (
              <img src={headPath} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              (nickname || "管").charAt(0)
            )}
          </span>
          <span>{nickname}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
        </button>

        {dropdownOpen && (
          <div style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "4px",
            backgroundColor: "#fff",
            border: `1px solid ${borderColor}`,
            borderRadius: "4px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            minWidth: "140px",
            zIndex: 2000,
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
                color: "#606266",
                textAlign: "left",
                borderBottom: `1px solid ${borderColor}`,
              }}
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
                color: "#f56c6c",
                textAlign: "left",
              }}
            >
              退出登录
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
