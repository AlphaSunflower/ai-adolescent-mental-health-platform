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

interface Department {
  id: number; name: string; description: string; doctorCount: number;
}

interface PageData {
  total: number; current: number; pages: number; records: Department[];
}

interface DepartmentForm { name: string; description: string; }

const emptyForm: DepartmentForm = { name: "", description: "" };

export function DepartmentList() {
  const [data, setData] = useState<PageData>({ total: 0, current: 1, pages: 1, records: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [form, setForm] = useState<DepartmentForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = (p: number) => {
    setLoading(true); setError(null);
    httpClient.get<PageData>("/hospital/department/list", { query: { page: p, size, keyword } })
      .then((res) => { setData(res); setPage(p); })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : "Unknown error"); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(1); }, [keyword]);

  const handleSearch = () => { setKeyword(searchInput); };
  const openCreate = () => { setForm(emptyForm); setEditingId(null); setDialogVisible(true); };
  const openEdit = (row: Department) => { setForm({ name: row.name, description: row.description ?? "" }); setEditingId(row.id); setDialogVisible(true); };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      if (editingId !== null) await httpClient.put("/hospital/department/" + editingId, form);
      else await httpClient.post("/hospital/department", form);
      setDialogVisible(false); fetchData(page);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Unknown error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确认删除该科室？")) return;
    try { await httpClient.delete("/hospital/department/" + id); fetchData(page); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Unknown error"); }
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
        {error && (
          <div style={{ marginBottom: "16px", padding: "10px 16px", backgroundColor: "#fef0f0", color: s.red, borderRadius: s.radius, fontSize: "13px" }}>
            {error}
            <button onClick={() => setError(null)} style={{ marginLeft: "12px", color: s.red, border: "none", background: "none", cursor: "pointer" }}>关闭</button>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <input placeholder="搜索科室名称..." value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              style={{ height: "36px", padding: "0 12px", border: "1px solid " + s.border, borderRadius: s.radius, width: "240px" }} />
            <button onClick={handleSearch} style={{ height: "36px", padding: "0 20px", backgroundColor: s.primary, color: s.white, border: "none", borderRadius: s.radius, cursor: "pointer" }}>搜索</button>
          </div>
          <button onClick={openCreate} style={{ height: "36px", padding: "0 20px", backgroundColor: s.primary, color: s.white, border: "none", borderRadius: s.radius, cursor: "pointer" }}>新增科室</button>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: s.text3 }}>加载中...</div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ebeef5" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f7fa" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>科室名称</th>
                  <th style={thStyle}>描述</th>
                  <th style={thStyle}>医生数</th>
                  <th style={thStyle}>操作</th>
                </tr>
              </thead>
              <tbody>
                {data.records.length === 0 ? (
                  <tr><td colSpan={5} style={{ ...tdStyle, textAlign: "center", color: s.text3 }}>暂无数据</td></tr>
                ) : (
                  data.records.map((row, i) => (
                    <tr key={row.id} style={{ backgroundColor: i % 2 === 0 ? s.white : "#fafafa" }}>
                      <td style={tdStyle}>{row.id}</td>
                      <td style={tdStyle}>{row.name}</td>
                      <td style={{ ...tdStyle, maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.description ?? "-"}</td>
                      <td style={tdStyle}>{row.doctorCount ?? 0}</td>
                      <td style={tdStyle}>
                        <button onClick={() => openEdit(row)} style={{ color: s.primary, border: "none", background: "none", cursor: "pointer", marginRight: "8px" }}>编辑</button>
                        <button onClick={() => handleDelete(row.id)} style={{ color: s.red, border: "none", background: "none", cursor: "pointer" }}>删除</button>
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

      {dialogVisible && (
        <>
          <div onClick={() => setDialogVisible(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 999 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: s.white, borderRadius: "8px", boxShadow: "0 4px 24px rgba(0,0,0,0.15)", padding: "24px", zIndex: 1000, width: "480px" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: 600, color: s.text }}>{editingId !== null ? "编辑科室" : "新增科室"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: s.text2, marginBottom: "4px" }}>科室名称</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid " + s.border, borderRadius: s.radius, fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: s.text2, marginBottom: "4px" }}>描述</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid " + s.border, borderRadius: s.radius, fontSize: "13px", boxSizing: "border-box", resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button onClick={() => setDialogVisible(false)} style={{ height: "36px", padding: "0 20px", border: "1px solid " + s.border, borderRadius: s.radius, background: s.white, cursor: "pointer", fontSize: "13px" }}>取消</button>
              <button onClick={handleSave} disabled={saving} style={{ height: "36px", padding: "0 20px", backgroundColor: s.primary, color: s.white, border: "none", borderRadius: s.radius, cursor: "pointer", fontSize: "13px", opacity: saving ? 0.7 : 1 }}>{saving ? "保存中..." : "保存"}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
