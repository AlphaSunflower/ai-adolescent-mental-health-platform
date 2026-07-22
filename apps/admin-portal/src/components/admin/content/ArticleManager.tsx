"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { httpClient } from "@/lib/api-admin";
import { getStoredUser } from "@/lib/session";
import { tokens } from "@/lib/design-tokens";

type PageResult<T> = { total: number; records: T[]; current: number; size: number; pages: number };

function renderTableBody(
  loading: boolean,
  error: string | null,
  records: Record<string, unknown>[],
  fetchData: () => void,
  handleDelete: (id: unknown) => void,
  handleEdit: (id: unknown) => void,
) {
  if (loading) {
    return (
      <tr key="ld">
        <td colSpan={6} style={{
          padding: tokens.spacing3xl,
          textAlign: "center",
          color: tokens.textSecondary,
          fontSize: tokens.fontSizeSm,
          borderBottom: `1px solid ${tokens.borderLight}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            加载中...
          </div>
        </td>
      </tr>
    );
  }
  if (error) {
    return (
      <tr key="err">
        <td colSpan={6} style={{
          padding: tokens.spacing3xl,
          textAlign: "center",
          color: tokens.danger,
          fontSize: tokens.fontSizeSm,
          borderBottom: `1px solid ${tokens.borderLight}`,
        }}>
          {error}{" "}
          <button onClick={fetchData} style={{
            color: tokens.primary,
            border: "none",
            background: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}>
            重试
          </button>
        </td>
      </tr>
    );
  }
  if (records.length === 0) {
    return (
      <tr key="empty">
        <td colSpan={6} style={{
          padding: tokens.spacing3xl,
          textAlign: "center",
          color: tokens.textSecondary,
          fontSize: tokens.fontSizeSm,
          borderBottom: `1px solid ${tokens.borderLight}`,
        }}>
          暂无数据
        </td>
      </tr>
    );
  }
  return records.map((row, i) => (
    <tr key={i} style={{
      backgroundColor: i % 2 === 0 ? tokens.bgCard : tokens.bgPage,
      transition: "background-color 0.1s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.primaryLight; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = i % 2 === 0 ? tokens.bgCard : tokens.bgPage; }}
    >
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${tokens.borderLight}`, fontSize: tokens.fontSizeSm, color: tokens.textSecondary }}>
        {row.id as string}
      </td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${tokens.borderLight}`, fontSize: tokens.fontSizeSm, color: tokens.textPrimary, fontWeight: 500 }}>
        {row.title as string}
      </td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${tokens.borderLight}`, fontSize: tokens.fontSizeSm, color: tokens.textRegular }}>
        {row.author as string}
      </td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${tokens.borderLight}`, fontSize: tokens.fontSizeSm }}>
        <span style={{
          display: "inline-block",
          padding: "2px 8px",
          borderRadius: tokens.radiusSm,
          fontSize: tokens.fontSizeXs,
          fontWeight: 600,
          ...((row.status as number) === 1
            ? { color: tokens.success, backgroundColor: tokens.successLight }
            : (row.status as number) === 0
            ? { color: tokens.warning, backgroundColor: tokens.warningLight }
            : { color: tokens.textSecondary, backgroundColor: tokens.bgHover }),
        }}>
          {(row.status as number) === 1 ? "已发布" : (row.status as number) === 0 ? "草稿" : "已下架"}
        </span>
      </td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${tokens.borderLight}`, fontSize: tokens.fontSizeSm, color: tokens.textSecondary }}>
        {row.publishTime as string}
      </td>
      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${tokens.borderLight}` }}>
        <button
          onClick={() => handleEdit(row.id)}
          style={{
            color: tokens.primary,
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: tokens.fontSizeSm,
            padding: "2px 8px",
            borderRadius: tokens.radiusSm,
            marginRight: "4px",
            transition: "background-color 0.1s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.primaryLight; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          编辑
        </button>
        <button
          onClick={() => handleDelete(row.id)}
          style={{
            color: tokens.danger,
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: tokens.fontSizeSm,
            padding: "2px 8px",
            borderRadius: tokens.radiusSm,
            transition: "background-color 0.1s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.dangerLight; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          删除
        </button>
      </td>
    </tr>
  )) as React.ReactNode;
}

export function ArticleManager() {
  const router = useRouter();
  const [data, setData] = useState<PageResult<Record<string, unknown>>>({ total: 0, records: [], current: 1, size: 20, pages: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = getStoredUser<Record<string, unknown>>();
  const role = (user?.role as number) ?? undefined;

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const query: Record<string, string | number | boolean | null | undefined> = { page, size: 20, title: search };
      if (role !== undefined) query.role = role;
      const res = await httpClient.get<PageResult<Record<string, unknown>>>("/content/admin/articles", { query });
      if (res.records) res.records = [...res.records].sort((a, b) => Number(b.id) - Number(a.id));
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
    <div>
      <div style={{ marginBottom: tokens.spacingXl }}>
        <h2 style={{ margin: 0, fontSize: tokens.fontSizeXl, fontWeight: 700, color: tokens.textPrimary }}>
          文章管理
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: tokens.fontSizeSm, color: tokens.textSecondary }}>
          管理平台内容文章
        </p>
      </div>

      <div style={{
        backgroundColor: tokens.bgCard,
        borderRadius: tokens.radiusLg,
        boxShadow: tokens.shadowSm,
        border: `1px solid ${tokens.borderLight}`,
        overflow: "hidden",
      }}>
        {/* Toolbar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: `${tokens.spacingBase} ${tokens.spacingXl}`,
          borderBottom: `1px solid ${tokens.borderLight}`,
        }}>
          <div style={{ display: "flex", gap: tokens.spacingSm }}>
            <input
              placeholder="搜索文章..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
              style={{
                height: tokens.inputHeight,
                padding: "0 12px",
                border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radiusSm,
                width: "240px",
                outline: "none",
                fontSize: tokens.fontSizeSm,
                color: tokens.textPrimary,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = tokens.borderFocus; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = tokens.border; }}
            />
            <button
              onClick={() => fetchData()}
              style={{
                height: tokens.inputHeight,
                padding: "0 16px",
                backgroundColor: tokens.primary,
                color: "#fff",
                border: "none",
                borderRadius: tokens.radiusSm,
                cursor: "pointer",
                fontSize: tokens.fontSizeSm,
                fontWeight: 500,
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.primaryHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = tokens.primary; }}
            >
              搜索
            </button>
          </div>
          <button
            onClick={() => router.push("/admin/content/articles/new")}
            style={{
              height: tokens.inputHeight,
              padding: "0 20px",
              backgroundColor: tokens.accent,
              color: "#fff",
              border: "none",
              borderRadius: tokens.radiusSm,
              cursor: "pointer",
              fontSize: tokens.fontSizeSm,
              fontWeight: 600,
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.accentHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = tokens.accent; }}
          >
            + 新增文章
          </button>
        </div>

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: tokens.bgPage }}>
              {["ID", "标题", "作者", "状态", "发布时间", "操作"].map(h => (
                <th key={h} style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  fontSize: tokens.fontSizeXs,
                  color: tokens.textSecondary,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  borderBottom: `2px solid ${tokens.border}`,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {renderTableBody(loading, error, data.records, fetchData, handleDelete, (id) => router.push("/admin/content/articles/" + id + "/edit"))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: tokens.spacingSm,
          padding: `${tokens.spacingMd} ${tokens.spacingXl}`,
          borderTop: `1px solid ${tokens.borderLight}`,
        }}>
          <span style={{ fontSize: tokens.fontSizeSm, color: tokens.textSecondary }}>
            共 {data.total} 条
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={() => fetchData(data.current - 1)}
              disabled={data.current <= 1}
              style={{
                padding: "5px 12px",
                border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radiusSm,
                background: tokens.bgCard,
                cursor: data.current <= 1 ? "not-allowed" : "pointer",
                fontSize: tokens.fontSizeSm,
                color: data.current <= 1 ? tokens.textDisabled : tokens.textRegular,
                transition: "all 0.15s",
              }}
            >
              上一页
            </button>
            <span style={{
              padding: "5px 12px",
              fontSize: tokens.fontSizeSm,
              color: tokens.textPrimary,
              fontWeight: 600,
            }}>
              {data.current} / {data.pages || 1}
            </span>
            <button
              onClick={() => fetchData(data.current + 1)}
              disabled={data.current >= data.pages}
              style={{
                padding: "5px 12px",
                border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radiusSm,
                background: tokens.bgCard,
                cursor: data.current >= data.pages ? "not-allowed" : "pointer",
                fontSize: tokens.fontSizeSm,
                color: data.current >= data.pages ? tokens.textDisabled : tokens.textRegular,
                transition: "all 0.15s",
              }}
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
