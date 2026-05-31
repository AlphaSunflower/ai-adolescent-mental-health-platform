"use client";

import { useState, useEffect } from "react";
import { httpClient } from "@/lib/api-admin";

const s = {
  primary: "#409eff", green: "#67c23a", orange: "#e6a23c", red: "#f56c6c",
  text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff",
  radius: "4px", shadow: "0 2px 12px rgba(0,0,0,0.06)",
};

interface ScheduleDay {
  date: string; dayOfWeek: string; slots: ScheduleSlot[];
}

interface ScheduleSlot {
  id: number; scheduleDate: string; timeSlot: string;
  startTime: string; endTime: string; maxAppointments: number;
  bookedCount: number; status: number;
}

const TIME_LABELS: Record<string, string> = {
  MORNING: "上午 (09:00-12:00)",
  AFTERNOON: "下午 (14:00-18:00)",
  EVENING: "晚上 (19:00-22:00)",
};

function getStatusLabel(st: number) { return st === 1 ? "可预约" : "休息"; }
function getStatusColor(st: number) { return st === 1 ? s.green : s.text3; }

export function ScheduleManager() {
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [doctorId, setDoctorId] = useState<number | null>(null);

  useEffect(() => {
    httpClient.get<Record<string, unknown>>("/doctor/me")
      .then((res) => setDoctorId(res.doctorId as number))
      .catch(() => { setError("无法获取医生信息"); setLoading(false); });
  }, []);

  const fetchSchedules = () => {
    if (!doctorId) return;
    setLoading(true); setError(null);
    const now = new Date();
    const startDate = now.toISOString().slice(0, 10);
    const end = new Date(now);
    end.setDate(end.getDate() + 6);
    const endDate = end.toISOString().slice(0, 10);
    httpClient.get<ScheduleDay[]>("/consultation/schedules", { query: { doctorId, startDate, endDate } })
      .then((res) => setDays(Array.isArray(res) ? res : []))
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : "Unknown error"); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (doctorId) fetchSchedules(); }, [doctorId]);

  return (
    <div style={{ padding: "20px", backgroundColor: s.bg, minHeight: "100%" }}>
      <div style={{ backgroundColor: s.white, borderRadius: "8px", boxShadow: s.shadow, padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: s.text }}>排班管理</h3>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {days.map((day) => (
              <div key={day.date} style={{ border: `1px solid ${s.border}`, borderRadius: s.radius, padding: "16px", background: s.white }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: s.text, marginBottom: "12px" }}>
                  {day.date} {day.dayOfWeek}
                </div>
                {day.slots.map((slot) => (
                  <div key={slot.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 12px", marginBottom: "8px",
                    backgroundColor: slot.status === 1 ? s.green + "10" : s.bg,
                    borderRadius: s.radius, border: `1px solid ${slot.status === 1 ? s.green + "30" : s.border}`,
                  }}>
                    <div>
                      <div style={{ fontSize: "13px", color: s.text2 }}>
                        {TIME_LABELS[slot.timeSlot] || slot.timeSlot}
                      </div>
                      <div style={{ fontSize: "12px", color: s.text3, marginTop: "2px" }}>
                        已约 {slot.bookedCount}/{slot.maxAppointments}
                      </div>
                    </div>
                    <span style={{
                      display: "inline-block", padding: "2px 10px", borderRadius: "10px",
                      fontSize: "12px", fontWeight: 500,
                      color: getStatusColor(slot.status),
                      backgroundColor: slot.status === 1 ? s.green + "15" : s.bg,
                    }}>
                      {getStatusLabel(slot.status)}
                    </span>
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
    </div>
  );
}
