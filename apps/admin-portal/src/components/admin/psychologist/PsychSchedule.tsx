"use client";

import { useState, useEffect } from "react";
import { httpClient } from "@/lib/api-admin";

const s = {
  primary: "#409eff", green: "#67c23a", orange: "#e6a23c", red: "#f56c6c",
  text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff",
  radius: "4px", shadow: "0 2px 12px rgba(0,0,0,0.06)",
};

interface ScheduleSlot {
  id: number; psychologistId: number; scheduleDate: string;
  timeSlot: string; startTime: string; endTime: string;
  maxAppointments: number; bookedCount: number; status: number;
}

interface ScheduleDay {
  date: string; dayOfWeek: string; slots: ScheduleSlot[];
}

const TIME_LABELS: Record<string, string> = {
  MORNING: "上午 (09:00-12:00)",
  AFTERNOON: "下午 (14:00-18:00)",
  EVENING: "晚上 (19:00-22:00)",
};

function getStatusText(s: number) { return s === 1 ? "可预约" : "休息"; }

export function PsychSchedule() {
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editSlot, setEditSlot] = useState<ScheduleSlot | null>(null);
  const [editMax, setEditMax] = useState(5);

  const fetchSchedules = () => {
    setLoading(true); setError(null);
    const now = new Date();
    const startDate = now.toISOString().slice(0, 10);
    const end = new Date(now);
    end.setDate(end.getDate() + 6);
    const endDate = end.toISOString().slice(0, 10);
    httpClient.get<ScheduleDay[]>("/psychologist/admin/schedules", { query: { startDate, endDate } })
      .then((res) => setDays(Array.isArray(res) ? res : []))
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : "Unknown error"); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSchedules(); }, []);

  const handleToggleStatus = async (slot: ScheduleSlot) => {
    setSaving(true);
    try {
      const newStatus = slot.status === 1 ? 0 : 1;
      await httpClient.post("/psychologist/admin/schedule/status", null, { query: { scheduleId: String(slot.id), status: String(newStatus) } });
      fetchSchedules();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Unknown error"); }
    finally { setSaving(false); }
  };

  const openEditMax = (slot: ScheduleSlot) => {
    setEditSlot(slot);
    setEditMax(slot.maxAppointments);
  };

  const saveMax = async () => {
    if (!editSlot) return;
    setSaving(true);
    try {
      await httpClient.put("/psychologist/admin/schedule", null, { query: { scheduleId: String(editSlot.id), maxAppointments: String(editMax) } });
      setEditSlot(null);
      fetchSchedules();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Unknown error"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ padding: "20px", backgroundColor: s.bg, minHeight: "100%" }}>
      <div style={{ backgroundColor: s.white, borderRadius: "8px", boxShadow: s.shadow, padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: s.text }}>排班管理</h3>
          <button onClick={fetchSchedules} style={{ height: "32px", padding: "0 16px", border: `1px solid ${s.border}`, borderRadius: s.radius, background: s.white, cursor: "pointer", fontSize: "13px" }}>刷新</button>
        </div>

        {error && (
          <div style={{ marginBottom: "16px", padding: "10px 16px", backgroundColor: "#fef0f0", color: s.red, borderRadius: s.radius, fontSize: "13px" }}>
            {error}
            <button onClick={() => setError(null)} style={{ marginLeft: "12px", color: s.red, border: "none", background: "none", cursor: "pointer" }}>关闭</button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: s.text3 }}>加载中...</div>
        ) : days.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: s.text3 }}>暂无排班数据</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {days.map((day) => (
              <div key={day.date} style={{ border: `1px solid ${s.border}`, borderRadius: s.radius, padding: "16px", background: s.white }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: s.text, marginBottom: "12px" }}>{day.date} {day.dayOfWeek}</div>
                {day.slots.map((slot) => (
                  <div key={slot.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 12px", marginBottom: "8px",
                    backgroundColor: slot.status === 1 ? s.green + "10" : s.bg,
                    borderRadius: s.radius, border: `1px solid ${slot.status === 1 ? s.green + "30" : s.border}`,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", color: s.text2 }}>{TIME_LABELS[slot.timeSlot] || slot.timeSlot}</div>
                      <div style={{ fontSize: "12px", color: s.text3, marginTop: "2px" }}>已约 {slot.bookedCount}/{slot.maxAppointments}</div>
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <button onClick={() => handleToggleStatus(slot)} disabled={saving}
                        style={{
                          padding: "2px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: 500, border: "none", cursor: "pointer",
                          color: slot.status === 1 ? s.orange : s.green,
                          backgroundColor: slot.status === 1 ? s.orange + "15" : s.green + "15",
                        }}>
                        {slot.status === 1 ? "设为休息" : "设为可约"}
                      </button>
                      <button onClick={() => openEditMax(slot)}
                        style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "12px", border: `1px solid ${s.border}`, background: s.white, cursor: "pointer", color: s.text2 }}>
                        设置上限
                      </button>
                    </div>
                  </div>
                ))}
                {day.slots.length === 0 && (
                  <div style={{ color: s.text3, fontSize: "13px", textAlign: "center", padding: "10px" }}>当天无排班</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Max Dialog */}
      {editSlot && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setEditSlot(null)}>
          <div style={{ backgroundColor: s.white, borderRadius: "8px", padding: "24px", width: "400px" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: s.text }}>设置最大预约数</h3>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: s.text2 }}>
                {editSlot.scheduleDate} {TIME_LABELS[editSlot.timeSlot] || editSlot.timeSlot}
              </label>
              <input type="number" value={editMax} onChange={(e) => setEditMax(Number(e.target.value) || 1)} min={1} max={50}
                style={{ width: "100%", height: "36px", padding: "0 12px", border: `1px solid ${s.border}`, borderRadius: s.radius, fontSize: "13px", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setEditSlot(null)} style={{ height: "36px", padding: "0 20px", border: `1px solid ${s.border}`, borderRadius: s.radius, background: s.white, cursor: "pointer" }}>取消</button>
              <button onClick={saveMax} disabled={saving} style={{ height: "36px", padding: "0 20px", backgroundColor: s.primary, color: "#fff", border: "none", borderRadius: s.radius, cursor: "pointer" }}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
