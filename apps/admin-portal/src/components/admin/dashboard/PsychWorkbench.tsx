"use client";

import { useRouter } from "next/navigation";

interface QuickAction {
  label: string;
  description: string;
  path: string;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "查看预约",
    description: "查看和管理您的咨询预约",
    path: "/psychologist-admin/appointments",
    color: "#409eff",
  },
  {
    label: "排班管理",
    description: "设置您的可预约时间段",
    path: "/psychologist-admin/schedule",
    color: "#67c23a",
  },
  {
    label: "收入查看",
    description: "查看您的咨询收入明细",
    path: "/psychologist-admin/income",
    color: "#e6a23c",
  },
  {
    label: "在线咨询",
    description: "进入在线咨询会话",
    path: "/psychologist-admin/chat",
    color: "#f56c6c",
  },
];

/* ========== PsychWorkbench ========== */

export function PsychWorkbench() {
  const router = useRouter();

  return (
    <div>
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        padding: "32px 24px",
        marginBottom: "16px",
        backgroundImage: "linear-gradient(135deg, #409eff08 0%, #67c23a08 100%)",
      }}>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 600, color: "#303133" }}>
          欢迎来到咨询师工作台
        </h2>
        <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#909399", lineHeight: 1.6 }}>
          在这里您可以管理预约、查看收入、进行在线咨询等操作
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.path}
            onClick={() => router.push(action.path)}
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              padding: "24px 20px",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              transition: "box-shadow 0.2s, transform 0.2s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              backgroundColor: `${action.color}18`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: 700,
              color: action.color,
              flexShrink: 0,
              lineHeight: 1,
            }}>
              {action.label.charAt(0)}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#303133" }}>{action.label}</div>
              <div style={{ fontSize: "13px", color: "#909399", marginTop: "4px" }}>{action.description}</div>
            </div>
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="#c0c4cc" strokeWidth="2"
              style={{ marginLeft: "auto", flexShrink: 0 }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
