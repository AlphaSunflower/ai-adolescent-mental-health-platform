"use client";

import { useState, useEffect } from "react";
import { httpClient } from "@/lib/api-admin";

const s = {
  primary: "#409eff", green: "#67c23a", orange: "#e6a23c", red: "#f56c6c",
  text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff",
  radius: "4px", shadow: "0 2px 12px rgba(0,0,0,0.06)",
  statCardBg: "#fff",
};

const WEEKDAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const TIME_SLOTS = ["08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"];

interface ScheduleSlot {
  id: number; weekday: number; timeSlot: string; available: boolean;
}

export function ScheduleManager() {
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSchedules = () => {
    setLoading(true); setError(null);
    httpClient.get<ScheduleSlot[]>("/doctor/schedule/list")
      .then(setSchedules)
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : "Unknown error"); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSchedules(); }, []);

  const isAvailable = (weekday: number, timeSlot: string) => {
    return schedules.some((s) => s.weekday === weekday && s.timeSlot === timeSlot && s.available);
  };

  const handleToggle = async (weekday: number, timeSlot: string) => {
    setSaving(true);
    try {
      const existing = schedules.find((s) => s.weekday === weekday && s.timeSlot === timeSlot);
      if (existing) {
        await httpClient.put("/doctor/schedule/" + existing.id, { available: !existing.available });
      } else {
        await httpClient.post("/doctor/schedule", { weekday, timeSlot, available: true });
      }
      fetchSchedules();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally { setSaving(false); }
  };

  const cellStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px", textAlign: "center", fontSize: "12px",
    cursor: saving ? "not-allowed" : "pointer",
    backgroundColor: active ? s.green + "20" : s.bg,
    color: active ? s.green : s.text3,
    border: "1px solid " + (active ? s.green + "40" : s.border),
    borderRadius: s.radius, transition: "all 0.15s",
    userSelect: "none" as const, minWidth: "70px",
  });

  return (
    <div style={{ padding: "20px", backgroundColor: s.bg, minHeight: "100%" }}>
      <div style={{ backgroundColor: s.white, borderRadius: "8px", boxShadow: s.shadow, padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: s.text }}>排班管理</h3>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ width: "12px", height: "12px", borderRadius: "2px", backgroundColor: s.green + "20", border: "1px solid " + s.green + "40" }}></span>
            <span style={{ fontSize: "12px", color: s.text2 }}>可预约</span>
            <span style={{ width: "12px", height: "12px", borderRadius: "2px", backgroundColor: s.bg, border: "1px solid " + s.border }}></span>
            <span style={{ fontSize: "12px", color: s.text2 }}>不可预约</span>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: "16px", padding: "10px 16px", backgroundColor: "#fef0f0", color: s.red, borderRadius: s.radius, fontSize: "13px" }}>
            {error}
            <button onClick={() => setError(null)} style={{ marginLeft: "12px", color: s.red, border: "none", background: "none", cursor: "pointer" }}>关闭</button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: s.text3 }}>加载中...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "10px 8px", textAlign: "center", fontSize: "13px", color: s.text3, fontWeight: 600, borderBottom: "2px solid " + s.border }}></th>
                  {WEEKDAYS.map((day) => (
                    <th key={day} style={{ padding: "10px 8px", textAlign: "center", fontSize: "13px", color: s.text2, fontWeight: 600, borderBottom: "2px solid " + s.border }}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot}>
                    <td style={{ padding: "10px 8px", textAlign: "center", fontSize: "12px", color: s.text2, fontWeight: 500, borderBottom: "1px solid " + s.border }}>{slot}</td>
                    {WEEKDAYS.map((_, idx) => {
                      const active = isAvailable(idx + 1, slot);
                      return (
                        <td key={idx} style={{ padding: "6px", borderBottom: "1px solid " + s.border }}>
                          <div onClick={() => handleToggle(idx + 1, slot)} style={cellStyle(active)}>
                            {active ? "可约" : "休息"}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
