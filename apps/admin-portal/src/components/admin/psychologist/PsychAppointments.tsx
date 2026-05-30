"use client";

import { useState, useEffect } from "react";
import { httpClient } from "@/lib/api-admin";

const s = {
  primary: "#409eff", green: "#67c23a", orange: "#e6a23c", red: "#f56c6c",
  text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff",
  radius: "4px", shadow: "0 2px 12px rgba(0,0,0,0.06)",
};

interface Appointment {
  id: number; orderNo: string; userId: number; psychologistId: number;
  userName: string; userHead: string; userPhone: string;
  serviceType: string; appointmentTime: string;
  fee: number; status: number; payStatus: number;
  rejectReason: string; videoLink: string; startTime: string; endTime: string;
  ratingScore: number; ratingContent: string;
  commissionRate: number; commissionAmount: number; psychologistIncome: number;
}

interface PageData {
  total: number; current: number; pages: number; records: Appointment[];
}

const STATUS_TABS = [
  { value: "", label: "全部" },
  { value: "0", label: "待审核" },
  { value: "1", label: "已确认" },
  { value: "2", label: "已拒绝" },
  { value: "3", label: "进行中" },
  { value: "4", label: "已完成" },
  { value: "7", label: "待进行" },
  { value: "8", label: "已评价" },
];

function getStatusLabel(st: number): string {
  const map: Record<number, string> = { 0: "待审核", 1: "已确认", 2: "已拒绝", 3: "进行中", 4: "已完成", 5: "已取消", 6: "已爽约", 7: "待进行", 8: "已评价" };
  return map[st] ?? String(st);
}

function getStatusColor(st: number): string {
  if (st === 0 || st === 7) return s.orange;
  if (st === 1 || st === 4 || st === 8) return s.green;
  if (st === 2 || st === 5 || st === 6) return s.red;
  if (st === 3) return s.primary;
  return s.text3;
}

function getServiceLabel(t: string): string {
  const map: Record<string, string> = { VIDEO: "视频", VOICE: "语音", TEXT: "文字", OFFLINE: "线下" };
  return map[t] ?? t ?? "-";
}

export function PsychAppointments() {
  const [data, setData] = useState<PageData>({ total: 0, current: 1, pages: 1, records: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [detailItem, setDetailItem] = useState<Appointment | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchData = (p: number) => {
    setLoading(true); setError(null);
    const query: Record<string, string | number | boolean | null | undefined> = { page: p, size };
    if (statusFilter) query.status = statusFilter;
    httpClient.get<PageData>("/psychologist/admin/appointments", { query })
      .then((res) => { setData(res); setPage(p); })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : "Unknown error"); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(1); }, [statusFilter]);

  const handleAccept = async (id: number) => {
    try { await httpClient.post(`/psychologist/admin/appointments/${id}/handle`, {}, { query: { accepted: "true" } }); fetchData(page); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Unknown error"); }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("请输入拒绝原因（可选）：");
    if (reason === null) return;
    try { await httpClient.post(`/psychologist/admin/appointments/${id}/handle`, {}, { query: { accepted: "false", rejectReason: reason || undefined } }); fetchData(page); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Unknown error"); }
  };

  const handleSendLink = async (id: number) => {
    const link = prompt("请输入视频链接或线下地址：");
    if (link === null) return;
    try {
      const now = new Date();
      const st = now.toISOString().slice(0, 16) + ":00";
      const et = new Date(now.getTime() + 3600000).toISOString().slice(0, 16) + ":00";
      await httpClient.post(`/psychologist/admin/appointments/${id}/video-link`, {}, { query: { videoLink: link, startTime: st, endTime: et } });
      fetchData(page);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Unknown error"); }
  };

  const handleStart = async (id: number) => {
    if (!confirm("确认开始咨询？")) return;
    try { await httpClient.post(`/psychologist/admin/appointments/${id}/start`, {}, { query: { startTime: new Date().toISOString().slice(0, 16) + ":00" } }); fetchData(page); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Unknown error"); }
  };

  const handleComplete = async (id: number) => {
    if (!confirm("确认完成咨询？")) return;
    try { await httpClient.post(`/psychologist/admin/appointments/${id}/complete`); fetchData(page); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Unknown error"); }
  };

  const viewDetail = async (id: number) => {
    setDetailOpen(true); setDetailLoading(true);
    try {
      const res = await httpClient.get<Appointment>(`/psychologist/admin/appointments/${id}/detail`);
      setDetailItem(res);
    } catch { /* ignore */ }
    finally { setDetailLoading(false); }
  };

  const thStyle: React.CSSProperties = {
    padding: "12px 8px", textAlign: "left" as const, fontSize: "13px",
    color: s.text3, fontWeight: 600, borderBottom: "1px solid #ebeef5",
  };
  const tdStyle: React.CSSProperties = {
    padding: "12px 8px", borderBottom: "1px solid #ebeef5", fontSize: "13px",
  };

  return (
    <div style={{ padding: "20px", backgroundColor: s.bg, minHeight: "100%" }}>
      <div style={{ backgroundColor: s.white, borderRadius: "8px", boxShadow: s.shadow, padding: "20px" }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: 600, color: s.text }}>预约管理</h3>

        {error && (
          <div style={{ marginBottom: "16px", padding: "10px 16px", backgroundColor: "#fef0f0", color: s.red, borderRadius: s.radius, fontSize: "13px" }}>
            {error}
            <button onClick={() => setError(null)} style={{ marginLeft: "12px", color: s.red, border: "none", background: "none", cursor: "pointer" }}>关闭</button>
          </div>
        )}

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
          {STATUS_TABS.map((tab) => (
            <button key={tab.value} onClick={() => { setStatusFilter(tab.value); }}
              style={{
                padding: "6px 14px", borderRadius: "16px", fontSize: "13px", border: "none", cursor: "pointer",
                backgroundColor: statusFilter === tab.value ? s.primary : s.bg,
                color: statusFilter === tab.value ? "#fff" : s.text2,
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: s.text3 }}>加载中...</div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ebeef5" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f7fa" }}>
                  {["ID", "来访者", "预约时间", "咨询方式", "费用", "状态", "操作"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.records.length === 0 ? (
                  <tr><td colSpan={7} style={{ ...tdStyle, textAlign: "center", color: s.text3 }}>暂无数据</td></tr>
                ) : (
                  data.records.map((row) => (
                    <tr key={row.id} style={{ backgroundColor: data.records.indexOf(row) % 2 === 0 ? s.white : "#fafafa" }}>
                      <td style={tdStyle}>{row.id}</td>
                      <td style={tdStyle}>{row.userName || "-"}</td>
                      <td style={tdStyle}>{row.appointmentTime || "-"}</td>
                      <td style={tdStyle}>{getServiceLabel(row.serviceType)}</td>
                      <td style={tdStyle}>¥{Number(row.fee || 0).toFixed(2)}</td>
                      <td style={tdStyle}>
                        <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: s.radius, color: getStatusColor(row.status), backgroundColor: getStatusColor(row.status) + "15", fontSize: "12px", fontWeight: 500 }}>
                          {getStatusLabel(row.status)}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button onClick={() => viewDetail(row.id)} style={{ color: s.text2, border: "none", background: "none", cursor: "pointer", marginRight: "6px" }}>详情</button>
                        {row.status === 0 && (
                          <>
                            <button onClick={() => handleAccept(row.id)} style={{ color: s.green, border: "none", background: "none", cursor: "pointer", marginRight: "6px" }}>接受</button>
                            <button onClick={() => handleReject(row.id)} style={{ color: s.red, border: "none", background: "none", cursor: "pointer" }}>拒绝</button>
                          </>
                        )}
                        {row.status === 1 && (
                          <>
                            <button onClick={() => handleSendLink(row.id)} style={{ color: s.primary, border: "none", background: "none", cursor: "pointer", marginRight: "6px" }}>发送链接</button>
                            <button onClick={() => handleStart(row.id)} style={{ color: s.green, border: "none", background: "none", cursor: "pointer" }}>开始</button>
                          </>
                        )}
                        {row.status === 7 && (
                          <button onClick={() => handleStart(row.id)} style={{ color: s.green, border: "none", background: "none", cursor: "pointer" }}>开始</button>
                        )}
                        {row.status === 3 && (
                          <button onClick={() => handleComplete(row.id)} style={{ color: s.orange, border: "none", background: "none", cursor: "pointer" }}>完成</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: s.text2 }}>共 {data.total} 条</span>
              <button onClick={() => fetchData(page - 1)} disabled={page <= 1}
                style={{ padding: "6px 12px", border: "1px solid " + s.border, borderRadius: s.radius, background: s.white, cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}>上一页</button>
              <span style={{ fontSize: "13px", color: s.text2 }}>{page} / {data.pages}</span>
              <button onClick={() => fetchData(page + 1)} disabled={page >= data.pages}
                style={{ padding: "6px 12px", border: "1px solid " + s.border, borderRadius: s.radius, background: s.white, cursor: page >= data.pages ? "not-allowed" : "pointer", opacity: page >= data.pages ? 0.5 : 1 }}>下一页</button>
            </div>
          </>
        )}
      </div>

      {/* Detail Dialog */}
      {(detailOpen || detailItem) && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => { setDetailItem(null); setDetailOpen(false); }}>
          <div style={{ backgroundColor: s.white, borderRadius: "8px", padding: "24px", width: "500px", maxHeight: "80vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 20px", fontSize: "18px", color: s.text }}>预约详情</h3>
            {detailLoading || !detailItem ? (
              <div style={{ textAlign: "center", padding: "40px", color: s.text3 }}>加载中...</div>
            ) : (
              <>
                <div style={{ marginBottom: "10px" }}><span style={{ fontSize: "13px", color: s.text3 }}>订单号：</span><span style={{ fontSize: "13px" }}>{detailItem.orderNo || "-"}</span></div>
                <div style={{ marginBottom: "10px" }}><span style={{ fontSize: "13px", color: s.text3 }}>来访者：</span><span style={{ fontSize: "13px" }}>{detailItem.userName || "-"}</span></div>
                <div style={{ marginBottom: "10px" }}><span style={{ fontSize: "13px", color: s.text3 }}>电话：</span><span style={{ fontSize: "13px" }}>{detailItem.userPhone || "-"}</span></div>
                <div style={{ marginBottom: "10px" }}><span style={{ fontSize: "13px", color: s.text3 }}>预约时间：</span><span style={{ fontSize: "13px" }}>{detailItem.appointmentTime || "-"}</span></div>
                <div style={{ marginBottom: "10px" }}><span style={{ fontSize: "13px", color: s.text3 }}>咨询方式：</span><span style={{ fontSize: "13px" }}>{getServiceLabel(detailItem.serviceType)}</span></div>
                <div style={{ marginBottom: "10px" }}><span style={{ fontSize: "13px", color: s.text3 }}>费用：</span><span style={{ fontSize: "13px" }}>¥{Number(detailItem.fee || 0).toFixed(2)}</span></div>
                <div style={{ marginBottom: "10px" }}><span style={{ fontSize: "13px", color: s.text3 }}>状态：</span><span style={{ fontSize: "13px", color: getStatusColor(detailItem.status) }}>{getStatusLabel(detailItem.status)}</span></div>
                {detailItem.status === 8 && (
                  <>
                    <div style={{ marginBottom: "10px" }}><span style={{ fontSize: "13px", color: s.text3 }}>评分：</span><span style={{ fontSize: "13px" }}>{detailItem.ratingScore != null ? Number(detailItem.ratingScore).toFixed(1) : "-"}</span></div>
                    <div style={{ marginBottom: "10px" }}><span style={{ fontSize: "13px", color: s.text3 }}>评价内容：</span><span style={{ fontSize: "13px" }}>{detailItem.ratingContent || "-"}</span></div>
                    <div style={{ marginBottom: "10px" }}><span style={{ fontSize: "13px", color: s.text3 }}>平台抽成：</span><span style={{ fontSize: "13px" }}>{detailItem.commissionRate != null ? `${(Number(detailItem.commissionRate) * 100).toFixed(0)}%` : "-"}</span></div>
                    <div style={{ marginBottom: "10px" }}><span style={{ fontSize: "13px", color: s.text3 }}>咨询师收入：</span><span style={{ fontSize: "13px" }}>¥{Number(detailItem.psychologistIncome || 0).toFixed(2)}</span></div>
                  </>
                )}
              </>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button onClick={() => setDetailItem(null)} style={{ height: "36px", padding: "0 20px", border: `1px solid ${s.border}`, borderRadius: s.radius, background: s.white, cursor: "pointer" }}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
