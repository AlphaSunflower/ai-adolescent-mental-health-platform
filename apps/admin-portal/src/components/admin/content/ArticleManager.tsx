"use client";

import { useState, useEffect, useCallback } from "react";
import { httpClient } from "@/lib/api-admin";
import { getStoredUser } from "@/lib/session";

const s = {
  primary: "#409eff", text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff", danger: "#f56c6c",
  success: "#67c23a", warning: "#e6a23c", radius: "4px", shadow: "0 2px 12px rgba(0,0,0,0.06)",
};

type PageResult<T> = { total: number; records: T[]; current: number; size: number; pages: number };

function renderTableBody(
  loading: boolean,
  error: string | null,
  records: Record<string, unknown>[],
  fetchData: () => void,
  handleDelete: (id: unknown) => void,
) {
  if (loading) {
    return <tr key="ld"><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: s.text3, fontSize: "13px", borderBottom: "1px solid #ebeef5" }}>加载中...</td></tr>;
  }
  if (error) {
    return <tr key="err"><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: s.danger, fontSize: "13px", borderBottom: "1px solid #ebeef5" }}>{error} <button onClick={fetchData} style={{ color: s.primary, border: "none", background: "none", cursor: "pointer", textDecoration: "underline" }}>重试</button></td></tr>;
  }
  if (records.length === 0) {
    return <tr key="empty"><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: s.text3, fontSize: "13px", borderBottom: "1px solid #ebeef5" }}>暂无数据</td></tr>;
  }
  return records.map((row, i) => (
    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa" }}>
      <td style={{ padding: "12px 8px", borderBottom: "1px solid #ebeef5", fontSize: "13px" }}>{row.id as string}</td>
      <td style={{ padding: "12px 8px", borderBottom: "1px solid #ebeef5", fontSize: "13px" }}>{row.title as string}</td>
      <td style={{ padding: "12px 8px", borderBottom: "1px solid #ebeef5", fontSize: "13px" }}>{row.author as string}</td>
      <td style={{ padding: "12px 8px", borderBottom: "1px solid #ebeef5", fontSize: "13px" }}>
        <span style={{ color: (row.status as number) === 1 ? "#67c23a" : (row.status as number) === 0 ? "#e6a23c" : "#909399" }}>
          {(row.status as number) === 1 ? "已发布" : (row.status as number) === 0 ? "草稿" : "已下架"}
        </span>
      </td>
      <td style={{ padding: "12px 8px", borderBottom: "1px solid #ebeef5", fontSize: "13px" }}>{row.publishTime as string}</td>
      <td style={{ padding: "12px 8px", borderBottom: "1px solid #ebeef5" }}>
        <a href={"/admin/content/articles/" + (row.id as string) + "/edit"} style={{ color: "#409eff", border: "none", background: "none", cursor: "pointer", marginRight: "8px", textDecoration: "none" }}>编辑</a>
        <button onClick={() => handleDelete(row.id)} style={{ color: "#f56c6c", border: "none", background: "none", cursor: "pointer" }}>删除</button>
      </td>
    </tr>
  )) as React.ReactNode;
}

export function ArticleManager() {
  const [data, setData] = useState<PageResult<Record<string, unknown>>>({ total: 0, records: [], current: 1, size: 20, pages: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = getStoredUser<Record<string, unknown>>();
  const role = (user?.role as number) ?? undefined;

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const query: Record<string, string | number | boolean | null | undefined> = { page, size: 20, keyword: search };
      if (role !== undefined) query.role = role;
      const res = await httpClient.get<PageResult<Record<string, unknown>>>("/content/admin/articles", { query });
      if (res.records) res.records.sort((a, b) => Number(b.id) - Number(a.id));
      setData(res);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "加载文章列表失败"); }
    finally { setLoading(false); }
  }, [search, role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: unknown) => {
    if (!confirm("确认删除？")) return;
    try { await httpClient.delete("/content/article/" + id); fetchData(); } catch { /* ignore */ }
  };

  return (
    <div style={{ padding: "20px", backgroundColor: s.bg, minHeight: "100%" }}>
      <div style={{ backgroundColor: s.white, borderRadius: "8px", boxShadow: s.shadow, padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <input placeholder="搜索文章..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchData()}
              style={{ height: "36px", padding: "0 12px", border: "1px solid #dcdfe6", borderRadius: "4px", width: "240px", outline: "none" }} />
            <button onClick={() => fetchData()} style={{ height: "36px", padding: "0 20px", backgroundColor: "#409eff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>搜索</button>
          </div>
          <a href="/admin/content/articles/new" style={{ height: "36px", padding: "0 20px", backgroundColor: "#409eff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", display: "inline-flex", alignItems: "center", textDecoration: "none", fontSize: "14px" }}>新增文章</a>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ebeef5" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f7fa" }}>
              {["ID", "标题", "作者", "状态", "发布时间", "操作"].map(h => <th key={h} style={{ padding: "12px 8px", textAlign: "left", fontSize: "13px", color: "#909399", fontWeight: 600, borderBottom: "1px solid #ebeef5" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {renderTableBody(loading, error, data.records, fetchData, handleDelete)}
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: "#606266" }}>共 {data.total} 条</span>
          <button onClick={() => fetchData(data.current - 1)} disabled={data.current <= 1} style={{ padding: "6px 12px", border: "1px solid #dcdfe6", borderRadius: "4px", background: "#fff", cursor: "pointer" }}>上一页</button>
          <span style={{ fontSize: "13px", color: "#606266" }}>{data.current} / {data.pages || 1}</span>
          <button onClick={() => fetchData(data.current + 1)} disabled={data.current >= data.pages} style={{ padding: "6px 12px", border: "1px solid #dcdfe6", borderRadius: "4px", background: "#fff", cursor: "pointer" }}>下一页</button>
        </div>
      </div>
    </div>
  );
}
