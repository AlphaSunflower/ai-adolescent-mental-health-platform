"use client";

import { useState, useEffect } from "react";
import { httpClient } from "@/lib/api-admin";

/* ========== Design tokens ========== */

const s = {
  primary: "#409eff", green: "#67c23a", orange: "#e6a23c", red: "#f56c6c",
  text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff",
  radius: "4px", shadow: "0 2px 12px rgba(0,0,0,0.06)",
  statCardBg: "#fff",
};

/* ========== Types ========== */

interface Doctor {
  id: number;
  realName: string;
  title: string;
  departmentId: number;
  departmentName: string;
  introduction: string;
  consultationEnabled: boolean;
}

interface Department {
  id: number;
  name: string;
}

interface PageData {
  total: number;
  current: number;
  pages: number;
  records: Doctor[];
}

interface DoctorForm {
  realName: string;
  title: string;
  departmentId: number | null;
  introduction: string;
  consultationEnabled: boolean;
}

const emptyForm: DoctorForm = {
  realName: "",
  title: "",
  departmentId: null,
  introduction: "",
  consultationEnabled: false,
};

/* ========== Component ========== */

export function DoctorList() {
  const [data, setData] = useState<PageData>({ total: 0, current: 1, pages: 1, records: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [form, setForm] = useState<DoctorForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = (p: number) => {
    setLoading(true);
    setError(null);
    httpClient
      .get<PageData>("/hospital/doctor/list", { query: { page: p, size, keyword } })
      .then((res) => { setData(res); setPage(p); })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  const fetchDepartments = () => {
    httpClient
      .get<Department[]>("/hospital/department/list", { query: {} })
      .then(setDepartments)
      .catch(() => {});
  };

  useEffect(() => { fetchData(1); }, [keyword]);
  useEffect(() => { if (dialogVisible) fetchDepartments(); }, [dialogVisible]);

  const handleSearch = () => { setKeyword(searchInput); };

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setDialogVisible(true); };

  const openEdit = (row: Doctor) => {
    setForm({
      realName: row.realName, title: row.title,
      departmentId: row.departmentId, introduction: row.introduction ?? "",
      consultationEnabled: row.consultationEnabled,
    });
    setEditingId(row.id);
    setDialogVisible(true);
  };

  const handleSave = async () => {
    if (!form.realName || !form.title || form.departmentId === null) return;
    setSaving(true);
    try {
      if (editingId !== null) {
        await httpClient.put("/hospital/doctor/" + editingId, form);
      } else {
        await httpClient.post("/hospital/doctor", form);
      }
      setDialogVisible(false);
      fetchData(page);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确认删除该医生？")) return;
    try { await httpClient.delete("/hospital/doctor/" + id); fetchData(page); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Unknown error"); }
  };

  const handleToggleConsult = async (row: Doctor) => {
    try {
      await httpClient.put("/hospital/doctor/" + row.id, { consultationEnabled: !row.consultationEnabled });
      fetchData(page);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Unknown error"); }
  };

  const thStyle: React.CSSProperties = {
    padding: "12px 8px", textAlign: "left" as const, fontSize: "13px",
    color: s.text3, fontWeight: 600, borderBottom: "1px solid #ebeef5",
  };
  const tdStyle: React.CSSProperties = {
    padding: "12px 8px", borderBottom: "1px solid #ebeef5", fontSize: "13px",
  };

  return (
    <div style={{ padding: "20px", backgroundColor: s.bg, minHeight: "100
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: s.text2 }}>共 {data.total} 条</span>
              <button onClick={() => fetchData(page - 1)} disabled={page <= 1}
                style={{ padding: "6px 12px", border: "1px solid " + s.border, borderRadius: s.radius, background: s.white, cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}>
                上一页
              </button>
              <span style={{ fontSize: "13px", color: s.text2 }}>{page} / {data.pages}</span>
              <button onClick={() => fetchData(page + 1)} disabled={page >= data.pages}
                style={{ padding: "6px 12px", border: "1px solid " + s.border, borderRadius: s.radius, background: s.white, cursor: page >= data.pages ? "not-allowed" : "pointer", opacity: page >= data.pages ? 0.5 : 1 }}>
                下一页
              </button>
            </div>
          </>
        )}
      </div>

      {dialogVisible && (
        <>
          <div onClick={() => setDialogVisible(false)}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 999 }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            backgroundColor: s.white, borderRadius: "8px", boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            padding: "24px", zIndex: 1000, width: "480px", maxHeight: "80vh", overflow: "auto",
          }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: 600, color: s.text }}>
              {editingId !== null ? "编辑医生" : "新增医生"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: s.text2, marginBottom: "4px" }}>医生姓名</label>
                <input value={form.realName} onChange={(e) => setForm({ ...form, realName: e.target.value })}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid " + s.border, borderRadius: s.radius, fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: s.text2, marginBottom: "4px" }}>职称</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid " + s.border, borderRadius: s.radius, fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: s.text2, marginBottom: "4px" }}>科室</label>
                <select value={form.departmentId ?? ""} onChange={(e) => setForm({ ...form, departmentId: e.target.value ? Number(e.target.value) : null })}
                  style={{ width: "100%", height: "36px", padding: "0 12px", border: "1px solid " + s.border, borderRadius: s.radius, fontSize: "13px", boxSizing: "border-box" }}>
                  <option value="">请选择科室</option>
                  {departments.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: s.text2, marginBottom: "4px" }}>简介</label>
                <textarea value={form.introduction} onChange={(e) => setForm({ ...form, introduction: e.target.value })} rows={3}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid " + s.border, borderRadius: s.radius, fontSize: "13px", boxSizing: "border-box", resize: "vertical" }} />
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: s.text2, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.consultationEnabled} onChange={(e) => setForm({ ...form, consultationEnabled: e.target.checked })} />
                  开启在线咨询
                </label>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button onClick={() => setDialogVisible(false)}
                style={{ height: "36px", padding: "0 20px", border: "1px solid " + s.border, borderRadius: s.radius, background: s.white, cursor: "pointer", fontSize: "13px" }}>取消</button>
              <button onClick={handleSave} disabled={saving}
                style={{ height: "36px", padding: "0 20px", backgroundColor: s.primary, color: s.white, border: "none", borderRadius: s.radius, cursor: "pointer", fontSize: "13px", opacity: saving ? 0.7 : 1 }}>
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
