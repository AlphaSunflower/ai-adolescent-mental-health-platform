"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { httpClient } from "@/lib/api-admin";

import { s } from "@/lib/design-tokens";

type PageResult<T> = { total: number; records: T[]; current: number; size: number; pages: number };

function getStatusLabel(status: number) { return status === 1 ? "上架" : "下架"; }
function getStatusColor(status: number) { return status === 1 ? s.success : s.text3; }

export function BookManager() {
  const [data, setData] = useState<PageResult<Record<string,unknown>>>({ total:0, records:[], current:1, size:20, pages:0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const router = useRouter();

  const fetchData = useCallback(async (page = 1) => {
    try {
      const query: Record<string, string | number | boolean | null | undefined> = { page, size: 20, keyword: search };
      if (statusFilter !== "") query.status = Number(statusFilter);
      const res = await httpClient.get<PageResult<Record<string,unknown>>>("/admin/book/list", { query });
      setData(res);
    } catch { /* ignore */ }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggleStatus = async (row: Record<string,unknown>) => {
    const newStatus = (row.status as number) === 1 ? 0 : 1;
    try {
      await httpClient.put(`/admin/book/${row.id}`, { status: newStatus });
      fetchData();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: unknown) => {
    if (!confirm("确认删除？")) return;
    try { await httpClient.delete(`/admin/book/${id}`); fetchData(); } catch { /* ignore */ }
  };

  // Comment management state
  const [commentVisible, setCommentVisible] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [comments, setComments] = useState<Record<string,unknown>[]>([]);
  const [currentBookId, setCurrentBookId] = useState<number | null>(null);
  const [currentBookTitle, setCurrentBookTitle] = useState("");
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotal, setCommentTotal] = useState(0);

  const fetchComments = async (page = 1) => {
    if (!currentBookId) return;
    fetchCommentsForBook(currentBookId, page);
  };

  const handleViewComments = (row: Record<string,unknown>) => {
    const bookId = row.id as number;
    setCurrentBookId(bookId);
    setCurrentBookTitle(row.title as string);
    setCommentVisible(true);
    fetchCommentsForBook(bookId, 1);
  };

  const fetchCommentsForBook = async (bookId: number, page = 1) => {
    setCommentLoading(true);
    try {
      const res = await httpClient.get<PageResult<Record<string,unknown>>>(`/book/${bookId}/comment/list`, { query: { page, size: 10 } });
      setComments(res.records);
      setCommentTotal(res.total);
      setCommentPage(page);
    } catch { /* ignore */ }
    finally { setCommentLoading(false); }
  };

  const handleDeleteComment = async (commentId: unknown) => {
    if (!confirm("确认删除该评论？")) return;
    try {
      await httpClient.delete(`/admin/book/comment/${commentId}`);
      fetchComments(commentPage);
      setData(prev => ({
        ...prev,
        records: prev.records.map(r => r.id === currentBookId ? { ...r, commentCount: Math.max(0, ((r.commentCount as number) ?? 0) - 1) } : r),
      }));
    } catch { /* ignore */ }
  };

  return (
    <div style={{ padding:"20px", backgroundColor:s.bg, minHeight:"100%" }}>
      <div style={{ backgroundColor:s.white, borderRadius:"8px", boxShadow:s.shadow, padding:"20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"20px" }}>
          <div style={{ display:"flex", gap:"10px" }}>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); }}
              style={{ height:"36px", padding:"0 8px", border:`1px solid ${s.border}`, borderRadius:s.radius, fontSize:"13px", color:s.text2 }}>
              <option value="">全部状态</option>
              <option value="1">上架</option>
              <option value="0">下架</option>
            </select>
            <input placeholder="搜索书籍..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key==="Enter"&&fetchData()}
              style={{ height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, width:"240px", outline:"none" }} />
            <button onClick={() => fetchData()} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>搜索</button>
          </div>
          <button onClick={() => router.push("/admin/content/books/new")} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>新增书籍</button>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", border:`1px solid ${s.border}` }}>
          <thead>
            <tr style={{ backgroundColor:s.bg }}>
              {["ID","封面","书名","简介","浏览数","评论数","排序","状态","创建时间","操作"].map(h => <th key={h} style={{ padding:"12px 8px", textAlign:"left", fontSize:"13px", color:s.text3, fontWeight:600, borderBottom:`1px solid ${s.border}` }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.records.map((row, i) => (
              <tr key={i} style={{ backgroundColor: i%2===0?"#fff":s.bg }}>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.id as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}` }}>
                  {row.coverUrl ? <img src={row.coverUrl as string} alt="" style={{ width:"60px", height:"80px", objectFit:"cover", borderRadius:s.radius }} /> : <span style={{ color:s.text3, fontSize:"13px" }}>-</span>}
                </td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.title as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px", maxWidth:"200px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.description as string || "-"}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.viewCount as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.commentCount as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.sortOrder as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>
                  <span style={{ color: getStatusColor(row.status as number) }}>{getStatusLabel(row.status as number)}</span>
                </td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{row.createTime as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:`1px solid ${s.border}` }}>
                  <button onClick={() => router.push(`/admin/content/books/${row.id}/edit`)} style={{ color:s.primary, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>编辑</button>
                  <button onClick={() => handleViewComments(row)} style={{ color:s.text2, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>评论管理</button>
                  <button onClick={() => handleToggleStatus(row)} style={{ color:s.warning, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>{(row.status as number)===1?"下架":"上架"}</button>
                  <button onClick={() => handleDelete(row.id)} style={{ color:s.danger, border:"none", background:"none", cursor:"pointer" }}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"16px", gap:"8px", alignItems:"center" }}>
          <span style={{ fontSize:"13px", color:s.text2 }}>共 {data.total} 条</span>
          <button onClick={() => fetchData(data.current-1)} disabled={data.current<=1} style={{ padding:"6px 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>上一页</button>
          <span style={{ fontSize:"13px", color:s.text2 }}>{data.current} / {data.pages||1}</span>
          <button onClick={() => fetchData(data.current+1)} disabled={data.current>=data.pages} style={{ padding:"6px 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>下一页</button>
        </div>
      </div>

      {/* Comment Management Dialog */}
      {commentVisible && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:1000 }} onClick={() => setCommentVisible(false)}>
          <div style={{ backgroundColor:s.white, borderRadius:"8px", padding:"24px", width:"800px", maxHeight:"80vh", overflow:"auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin:"0 0 16px", fontSize:"18px", color:s.text }}>评论管理 - 《{currentBookTitle}》</h3>
            {commentLoading ? (
              <div style={{ textAlign:"center", padding:"40px", color:s.text3 }}>加载中...</div>
            ) : (
              <>
                <table style={{ width:"100%", borderCollapse:"collapse", border:`1px solid ${s.border}` }}>
                  <thead>
                    <tr style={{ backgroundColor:s.bg }}>
                      {["ID","用户","评论内容","评论时间","操作"].map(h => <th key={h} style={{ padding:"10px 8px", textAlign:"left", fontSize:"13px", color:s.text3, fontWeight:600, borderBottom:`1px solid ${s.border}` }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {comments.map((c, i) => (
                      <tr key={i} style={{ backgroundColor: i%2===0?"#fff":s.bg }}>
                        <td style={{ padding:"10px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{c.id as string}</td>
                        <td style={{ padding:"10px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{c.userNickname as string}</td>
                        <td style={{ padding:"10px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{c.content as string}</td>
                        <td style={{ padding:"10px 8px", borderBottom:`1px solid ${s.border}`, fontSize:"13px" }}>{c.createTime as string}</td>
                        <td style={{ padding:"10px 8px", borderBottom:`1px solid ${s.border}` }}>
                          <button onClick={() => handleDeleteComment(c.id)} style={{ color:s.danger, border:"none", background:"none", cursor:"pointer" }}>删除</button>
                        </td>
                      </tr>
                    ))}
                    {comments.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign:"center", padding:"20px", color:s.text3, fontSize:"13px" }}>暂无评论</td></tr>
                    )}
                  </tbody>
                </table>
                <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"12px", gap:"8px", alignItems:"center" }}>
                  <span style={{ fontSize:"13px", color:s.text2 }}>共 {commentTotal} 条</span>
                  <button onClick={() => fetchComments(commentPage-1)} disabled={commentPage<=1} style={{ padding:"6px 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>上一页</button>
                  <span style={{ fontSize:"13px", color:s.text2 }}>{commentPage} / {Math.max(1, Math.ceil(commentTotal/10))}</span>
                  <button onClick={() => fetchComments(commentPage+1)} disabled={commentPage>=Math.ceil(commentTotal/10)} style={{ padding:"6px 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>下一页</button>
                </div>
              </>
            )}
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"16px" }}>
              <button onClick={() => setCommentVisible(false)} style={{ height:"36px", padding:"0 20px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
