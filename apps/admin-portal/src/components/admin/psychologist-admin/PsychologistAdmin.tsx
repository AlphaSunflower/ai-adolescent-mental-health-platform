"use client";

import { useState, useEffect, useCallback } from "react";
import { httpClient } from "@/lib/api-admin";

const s = {
  primary: "#409eff", text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff", danger: "#f56c6c",
  success: "#67c23a", warning: "#e6a23c", radius: "4px", shadow: "0 2px 12px rgba(0,0,0,0.06)",
};

type PageResult<T> = { total: number; records: T[]; current: number; size: number; pages: number };

function getOnlineLabel(v: number) { return v === 1 ? "在线" : "离线"; }
function getOnlineColor(v: number) { return v === 1 ? s.success : s.text3; }
function getStatusLabel(v: number) { return v === 1 ? "正常" : "禁用"; }
function getStatusColor(v: number) { return v === 1 ? s.success : s.danger; }

export function PsychologistAdmin() {
  const [data, setData] = useState<PageResult<Record<string,unknown>>>({ total:0, records:[], current:1, size:20, pages:0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchData = useCallback(async (page = 1) => {
    try {
      const query: Record<string, string | number | boolean | null | undefined> = { page, size: 20, keyword: search };
      if (statusFilter !== "") query.status = Number(statusFilter);
      const res = await httpClient.get<PageResult<Record<string,unknown>>>("/admin/psychologist/list", { query });
      setData(res);
    } catch { /* ignore */ }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = {
    total: data.total,
    enabled: data.records.filter(r => (r.status as number) === 1).length,
    disabled: data.records.filter(r => (r.status as number) === 0).length,
    avgRating: data.records.length > 0
      ? (data.records.reduce((sum, r) => sum + (Number(r.ratingScore) || 0), 0) / data.records.length).toFixed(1)
      : "0.0",
  };

  const handleStatusToggle = async (row: Record<string,unknown>) => {
    const enabled = (row.status as number) === 1 ? false : true;
    try {
      await httpClient.post(`/admin/psychologist/${row.id}/status`, null, { query: { enabled: String(enabled) } });
      fetchData();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: unknown) => {
    if (!confirm("确认删除？")) return;
    try { await httpClient.delete(`/admin/psychologist/${id}`); fetchData(); } catch { /* ignore */ }
  };

  // Detail dialog
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<Record<string,unknown>|null>(null);
  const [psychFields, setPsychFields] = useState<Record<string,unknown>[]>([]);
  const [psychQuals, setPsychQuals] = useState<Record<string,unknown>[]>([]);
  const [fieldOptions, setFieldOptions] = useState<Record<string,unknown>[]>([]);
  const [qualOptions, setQualOptions] = useState<Record<string,unknown>[]>([]);

  const loadDetailRelations = async (psychologistId: number) => {
    try {
      const [fRes, qRes, foRes, qoRes] = await Promise.all([
        httpClient.get<Record<string,unknown>[]>(`/admin/psychologist/${psychologistId}/fields`),
        httpClient.get<Record<string,unknown>[]>(`/admin/psychologist/${psychologistId}/qualifications`),
        httpClient.get<Record<string,unknown>[]>("/admin/psychologist/fields/options"),
        httpClient.get<Record<string,unknown>[]>("/admin/psychologist/qualifications/options"),
      ]);
      setPsychFields(fRes || []);
      setPsychQuals(qRes || []);
      setFieldOptions(foRes || []);
      setQualOptions(qoRes || []);
    } catch { /* ignore */ }
  };

  const viewDetail = (item: Record<string,unknown>) => {
    setCurrentItem(item);
    setDetailVisible(true);
    loadDetailRelations(item.id as number);
  };

  // Field management
  const [fieldDialogVisible, setFieldDialogVisible] = useState(false);
  const [fieldForm, setFieldForm] = useState({ id: null as number|null, fieldId: null as number|null, subTags: "" });
  const [fieldSaving, setFieldSaving] = useState(false);

  const openFieldDialog = (row?: Record<string,unknown>) => {
    if (row) {
      setFieldForm({ id: row.id as number, fieldId: row.fieldId as number, subTags: (row.subTags as string) || "" });
    } else {
      setFieldForm({ id: null, fieldId: null, subTags: "" });
    }
    setFieldDialogVisible(true);
  };

  const saveField = async () => {
    if (!fieldForm.fieldId) { alert("请选择咨询领域"); return; }
    setFieldSaving(true);
    try {
      if (fieldForm.id) {
        await httpClient.put(`/admin/psychologist/fields/${fieldForm.id}`, { fieldId: fieldForm.fieldId, subTags: fieldForm.subTags });
      } else {
        await httpClient.post(`/admin/psychologist/${currentItem!.id}/fields`, { fieldId: fieldForm.fieldId, subTags: fieldForm.subTags });
      }
      setFieldDialogVisible(false);
      loadDetailRelations(currentItem!.id as number);
    } catch { /* ignore */ }
    finally { setFieldSaving(false); }
  };

  const deleteField = async (id: number) => {
    if (!confirm("确认删除该擅长领域？")) return;
    try {
      await httpClient.delete(`/admin/psychologist/fields/${id}`);
      loadDetailRelations(currentItem!.id as number);
    } catch { /* ignore */ }
  };

  // Qualification management
  const [qualDialogVisible, setQualDialogVisible] = useState(false);
  const [qualForm, setQualForm] = useState({ id: null as number|null, qualificationId: null as number|null, certificateUrl: "", isVerified: 0 });
  const [qualSaving, setQualSaving] = useState(false);

  const openQualDialog = (row?: Record<string,unknown>) => {
    if (row) {
      setQualForm({ id: row.id as number, qualificationId: row.qualificationId as number, certificateUrl: (row.certificateUrl as string) || "", isVerified: (row.isVerified as number) || 0 });
    } else {
      setQualForm({ id: null, qualificationId: null, certificateUrl: "", isVerified: 0 });
    }
    setQualDialogVisible(true);
  };

  const saveQualification = async () => {
    if (!qualForm.qualificationId) { alert("请选择资质类型"); return; }
    setQualSaving(true);
    try {
      if (qualForm.id) {
        await httpClient.put(`/admin/psychologist/qualifications/${qualForm.id}`, { qualificationId: qualForm.qualificationId, certificateUrl: qualForm.certificateUrl, isVerified: qualForm.isVerified });
      } else {
        await httpClient.post(`/admin/psychologist/${currentItem!.id}/qualifications`, { qualificationId: qualForm.qualificationId, certificateUrl: qualForm.certificateUrl, isVerified: qualForm.isVerified });
      }
      setQualDialogVisible(false);
      loadDetailRelations(currentItem!.id as number);
    } catch { /* ignore */ }
    finally { setQualSaving(false); }
  };

  const deleteQualification = async (id: number) => {
    if (!confirm("确认删除该资质？")) return;
    try {
      await httpClient.delete(`/admin/psychologist/qualifications/${id}`);
      loadDetailRelations(currentItem!.id as number);
    } catch { /* ignore */ }
  };

  // Add/Edit dialog
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<"add"|"edit">("add");
  const [formSaving, setFormSaving] = useState(false);
  const [form, setForm] = useState({
    id: null as number|null, userId: null as number|null, realName: "", sex: 0, headPath: "",
    yearsExperience: 0, consultationPrice: 0, qualificationIds: [] as number[], fieldIds: [] as number[], status: 1,
  });
  const [userOptions, setUserOptions] = useState<Record<string,unknown>[]>([]);
  const [editFieldOptions, setEditFieldOptions] = useState<Record<string,unknown>[]>([]);
  const [editQualOptions, setEditQualOptions] = useState<Record<string,unknown>[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<number|null>(null);
  const [selectedQualId, setSelectedQualId] = useState<number|null>(null);

  const loadUserOptions = async () => {
    if (userOptions.length > 0) return;
    try {
      const res = await httpClient.get<PageResult<Record<string,unknown>>>("/admin/users", { query: { page: 1, size: 100 } });
      setUserOptions(res.records || []);
    } catch { /* ignore */ }
  };

  const loadEditOptions = async () => {
    try {
      const [foRes, qoRes] = await Promise.all([
        httpClient.get<Record<string,unknown>[]>("/admin/psychologist/fields/options"),
        httpClient.get<Record<string,unknown>[]>("/admin/psychologist/qualifications/options"),
      ]);
      setEditFieldOptions(foRes || []);
      setEditQualOptions(qoRes || []);
    } catch { /* ignore */ }
  };

  const openAddDialog = () => {
    setFormMode("add");
    setForm({ id: null, userId: null, realName: "", sex: 0, headPath: "", yearsExperience: 0, consultationPrice: 0, qualificationIds: [], fieldIds: [], status: 1 });
    setSelectedFieldId(null);
    setSelectedQualId(null);
    setFormVisible(true);
    loadUserOptions();
    loadEditOptions();
  };

  const openEditDialog = (row: Record<string,unknown>) => {
    setFormMode("edit");
    setForm({
      id: row.id as number, userId: row.userId as number|null, realName: (row.realName as string) || "",
      sex: (row.sex as number) || 0, headPath: (row.headPath as string) || "",
      yearsExperience: (row.yearsExperience as number) || 0, consultationPrice: (row.consultationPrice as number) || 0,
      qualificationIds: (row.qualificationIds as number[]) || [], fieldIds: (row.fieldIds as number[]) || [],
      status: (row.status as number) ?? 1,
    });
    setSelectedFieldId(null);
    setSelectedQualId(null);
    setFormVisible(true);
    loadEditOptions();
  };

  const submitForm = async () => {
    if (!form.realName.trim()) { alert("请输入咨询师姓名"); return; }
    setFormSaving(true);
    try {
      const payload = { realName: form.realName, sex: form.sex, headPath: form.headPath, yearsExperience: form.yearsExperience, consultationPrice: form.consultationPrice, qualificationIds: form.qualificationIds, fieldIds: form.fieldIds, status: form.status };
      if (formMode === "add") {
        if (!form.userId) { alert("请选择关联用户"); setFormSaving(false); return; }
        await httpClient.post("/admin/psychologist", { ...payload, userId: form.userId });
      } else {
        await httpClient.put(`/admin/psychologist/${form.id}`, payload);
      }
      setFormVisible(false);
      fetchData();
    } catch { /* ignore */ }
    finally { setFormSaving(false); }
  };

  const getFieldName = (fid: number) => { const f = editFieldOptions.find(i => i.id === fid); return f ? f.name as string : ""; };
  const getQualName = (qid: number) => { const q = editQualOptions.find(i => i.id === qid); return q ? q.name as string : ""; };

  return (
    <div style={{ padding:"20px", backgroundColor:s.bg, minHeight:"100%" }}>
      {/* Statistics Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"16px", marginBottom:"20px" }}>
        {[
          { label:"咨询师总数", value: stats.total, color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
          { label:"已启用", value: stats.enabled, color: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
          { label:"已禁用", value: stats.disabled, color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
          { label:"平均评分", value: stats.avgRating, color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
        ].map((card, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", padding:"20px", background:s.white, borderRadius:"8px", boxShadow:s.shadow }}>
            <div style={{ width:"50px", height:"50px", borderRadius:"8px", background:card.color, marginRight:"15px", flexShrink:0 }} />
            <div>
              <div style={{ fontSize:"24px", fontWeight:600, color:s.text }}>{card.value}</div>
              <div style={{ fontSize:"14px", color:s.text3, marginTop:"4px" }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor:s.white, borderRadius:"8px", boxShadow:s.shadow, padding:"20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"20px" }}>
          <div style={{ display:"flex", gap:"10px" }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              style={{ height:"36px", padding:"0 8px", border:`1px solid ${s.border}`, borderRadius:s.radius, fontSize:"13px", color:s.text2 }}>
              <option value="">全部状态</option>
              <option value="1">已启用</option>
              <option value="0">已禁用</option>
            </select>
            <input placeholder="搜索咨询师..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key==="Enter"&&fetchData()}
              style={{ height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, width:"240px", outline:"none" }} />
            <button onClick={() => fetchData()} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>搜索</button>
          </div>
          <button onClick={openAddDialog} style={{ height:"36px", padding:"0 20px", backgroundColor:"#67c23a", color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>新增咨询师</button>
        </div>

        <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #ebeef5" }}>
          <thead>
            <tr style={{ backgroundColor:"#f5f7fa" }}>
              {["ID","姓名","昵称","手机号","咨询价格","评分","咨询次数","在线状态","状态","操作"].map(h => <th key={h} style={{ padding:"12px 8px", textAlign:"left", fontSize:"13px", color:s.text3, fontWeight:600, borderBottom:"1px solid #ebeef5" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.records.map((row, i) => (
              <tr key={i} style={{ backgroundColor: i%2===0?"#fff":"#fafafa" }}>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.id as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.realName as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.userNickname as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.phone as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>¥{Number(row.consultationPrice || 0).toFixed(2)}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{Number(row.ratingScore || 0).toFixed(2)}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>{row.consultationCount as string}</td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>
                  <span style={{ color: getOnlineColor(row.onlineStatus as number) }}>{getOnlineLabel(row.onlineStatus as number)}</span>
                </td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5", fontSize:"13px" }}>
                  <span style={{ color: getStatusColor(row.status as number) }}>{row.statusText as string || getStatusLabel(row.status as number)}</span>
                </td>
                <td style={{ padding:"12px 8px", borderBottom:"1px solid #ebeef5" }}>
                  <button onClick={() => viewDetail(row)} style={{ color:s.text2, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>详情</button>
                  <button onClick={() => openEditDialog(row)} style={{ color:s.warning, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>编辑</button>
                  <button onClick={() => handleStatusToggle(row)} style={{ color: (row.status as number)===1?s.warning:s.success, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>{(row.status as number)===1?"禁用":"启用"}</button>
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

      {/* Detail Dialog */}
      {detailVisible && currentItem && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:1000 }} onClick={() => setDetailVisible(false)}>
          <div style={{ backgroundColor:s.white, borderRadius:"8px", padding:"24px", width:"900px", maxHeight:"85vh", overflow:"auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin:"0 0 16px", fontSize:"18px", color:s.text }}>咨询师详情</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"20px" }}>
              {[
                ["ID", currentItem.id as string], ["姓名", currentItem.realName as string], ["昵称", currentItem.userNickname as string],
                ["手机号", currentItem.phone as string], ["性别", (currentItem.sex as number)===1?"男":(currentItem.sex as number)===2?"女":"未知"],
                ["从业年限", `${currentItem.yearsExperience as string} 年`], ["咨询价格", `¥${Number(currentItem.consultationPrice || 0).toFixed(2)}`],
                ["评分", Number(currentItem.ratingScore || 0).toFixed(2)], ["咨询次数", currentItem.consultationCount as string],
                ["创建时间", currentItem.createTime as string],
              ].map(([label, value], i) => (
                <div key={i} style={{ fontSize:"13px" }}><span style={{ color:s.text3 }}>{label}：</span><span>{value || "-"}</span></div>
              ))}
              <div style={{ fontSize:"13px" }}><span style={{ color:s.text3 }}>在线状态：</span><span style={{ color:getOnlineColor(currentItem.onlineStatus as number) }}>{getOnlineLabel(currentItem.onlineStatus as number)}</span></div>
              <div style={{ fontSize:"13px" }}><span style={{ color:s.text3 }}>状态：</span><span style={{ color:getStatusColor(currentItem.status as number) }}>{currentItem.statusText as string || getStatusLabel(currentItem.status as number)}</span></div>
            </div>

            {/* Fields Section */}
            <div style={{ marginBottom:"20px", padding:"16px", background:"#f5f7fa", borderRadius:"8px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                <h4 style={{ margin:0, fontSize:"14px", color:s.text }}>擅长领域</h4>
                <button onClick={() => openFieldDialog()} style={{ height:"28px", padding:"0 12px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer", fontSize:"12px" }}>+ 添加</button>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #ebeef5", background:s.white }}>
                <thead><tr style={{ backgroundColor:"#f5f7fa" }}>{["领域名称","领域代码","细分标签","操作"].map(h => <th key={h} style={{ padding:"8px", textAlign:"left", fontSize:"12px", color:s.text3, fontWeight:600, borderBottom:"1px solid #ebeef5" }}>{h}</th>)}</tr></thead>
                <tbody>
                  {psychFields.map((f, i) => (
                    <tr key={i}><td style={{ padding:"8px", fontSize:"12px", borderBottom:"1px solid #ebeef5" }}>{f.fieldName as string}</td><td style={{ padding:"8px", fontSize:"12px", borderBottom:"1px solid #ebeef5" }}>{f.fieldCode as string}</td><td style={{ padding:"8px", fontSize:"12px", borderBottom:"1px solid #ebeef5" }}>{f.subTags as string || "-"}</td><td style={{ padding:"8px", borderBottom:"1px solid #ebeef5" }}><button onClick={() => openFieldDialog(f)} style={{ color:s.primary, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>编辑</button><button onClick={() => deleteField(f.id as number)} style={{ color:s.danger, border:"none", background:"none", cursor:"pointer" }}>删除</button></td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Qualifications Section */}
            <div style={{ marginBottom:"20px", padding:"16px", background:"#f5f7fa", borderRadius:"8px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                <h4 style={{ margin:0, fontSize:"14px", color:s.text }}>资质证书</h4>
                <button onClick={() => openQualDialog()} style={{ height:"28px", padding:"0 12px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer", fontSize:"12px" }}>+ 添加</button>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #ebeef5", background:s.white }}>
                <thead><tr style={{ backgroundColor:"#f5f7fa" }}>{["资质名称","资质代码","证书图片","认证状态","操作"].map(h => <th key={h} style={{ padding:"8px", textAlign:"left", fontSize:"12px", color:s.text3, fontWeight:600, borderBottom:"1px solid #ebeef5" }}>{h}</th>)}</tr></thead>
                <tbody>
                  {psychQuals.map((q, i) => (
                    <tr key={i}><td style={{ padding:"8px", fontSize:"12px", borderBottom:"1px solid #ebeef5" }}>{q.qualificationName as string}</td><td style={{ padding:"8px", fontSize:"12px", borderBottom:"1px solid #ebeef5" }}>{q.qualificationCode as string}</td><td style={{ padding:"8px", fontSize:"12px", borderBottom:"1px solid #ebeef5" }}>{(q.certificateUrl as string) || "-"}</td><td style={{ padding:"8px", fontSize:"12px", borderBottom:"1px solid #ebeef5" }}><span style={{ color: (q.isVerified as number)===1?s.success:s.text3 }}>{(q.isVerified as number)===1?"已认证":"未认证"}</span></td><td style={{ padding:"8px", borderBottom:"1px solid #ebeef5" }}><button onClick={() => openQualDialog(q)} style={{ color:s.primary, border:"none", background:"none", cursor:"pointer", marginRight:"8px" }}>编辑</button><button onClick={() => deleteQualification(q.id as number)} style={{ color:s.danger, border:"none", background:"none", cursor:"pointer" }}>删除</button></td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <button onClick={() => setDetailVisible(false)} style={{ height:"36px", padding:"0 20px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* Field Dialog */}
      {fieldDialogVisible && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:1100 }} onClick={() => setFieldDialogVisible(false)}>
          <div style={{ backgroundColor:s.white, borderRadius:"8px", padding:"24px", width:"500px" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin:"0 0 16px", fontSize:"16px", color:s.text }}>{fieldForm.id ? "编辑擅长领域" : "添加擅长领域"}</h3>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", marginBottom:"4px", fontSize:"13px", color:s.text2 }}>咨询领域</label><select value={fieldForm.fieldId ?? ""} onChange={(e) => setFieldForm({...fieldForm, fieldId: Number(e.target.value)||null})} style={{ width:"100%", height:"36px", padding:"0 8px", border:`1px solid ${s.border}`, borderRadius:s.radius }}><option value="">请选择</option>{fieldOptions.map(o => <option key={o.id as number} value={o.id as number}>{o.name as string}</option>)}</select></div>
            <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"4px", fontSize:"13px", color:s.text2 }}>细分标签</label><input value={fieldForm.subTags} onChange={(e) => setFieldForm({...fieldForm, subTags:e.target.value})} placeholder="多个标签用逗号分隔" style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px" }}>
              <button onClick={() => setFieldDialogVisible(false)} style={{ height:"36px", padding:"0 20px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>取消</button>
              <button onClick={saveField} disabled={fieldSaving} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>确定</button>
            </div>
          </div>
        </div>
      )}

      {/* Qualification Dialog */}
      {qualDialogVisible && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:1100 }} onClick={() => setQualDialogVisible(false)}>
          <div style={{ backgroundColor:s.white, borderRadius:"8px", padding:"24px", width:"500px" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin:"0 0 16px", fontSize:"16px", color:s.text }}>{qualForm.id ? "编辑资质" : "添加资质"}</h3>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", marginBottom:"4px", fontSize:"13px", color:s.text2 }}>资质类型</label><select value={qualForm.qualificationId ?? ""} onChange={(e) => setQualForm({...qualForm, qualificationId: Number(e.target.value)||null})} style={{ width:"100%", height:"36px", padding:"0 8px", border:`1px solid ${s.border}`, borderRadius:s.radius }}><option value="">请选择</option>{qualOptions.map(o => <option key={o.id as number} value={o.id as number}>{o.name as string}</option>)}</select></div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", marginBottom:"4px", fontSize:"13px", color:s.text2 }}>证书图片URL</label><input value={qualForm.certificateUrl} onChange={(e) => setQualForm({...qualForm, certificateUrl:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
            <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"4px", fontSize:"13px", color:s.text2 }}>认证状态</label><div style={{ display:"flex", gap:"16px" }}><label style={{ fontSize:"13px", cursor:"pointer" }}><input type="radio" checked={qualForm.isVerified===1} onChange={() => setQualForm({...qualForm, isVerified:1})} /> 已认证</label><label style={{ fontSize:"13px", cursor:"pointer" }}><input type="radio" checked={qualForm.isVerified===0} onChange={() => setQualForm({...qualForm, isVerified:0})} /> 未认证</label></div></div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px" }}>
              <button onClick={() => setQualDialogVisible(false)} style={{ height:"36px", padding:"0 20px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>取消</button>
              <button onClick={saveQualification} disabled={qualSaving} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>确定</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      {formVisible && (
        <div style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:1000 }} onClick={() => setFormVisible(false)}>
          <div style={{ backgroundColor:s.white, borderRadius:"8px", padding:"24px", width:"600px", maxHeight:"85vh", overflow:"auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin:"0 0 16px", fontSize:"18px", color:s.text }}>{formMode === "add" ? "新增咨询师" : "编辑咨询师"}</h3>
            {formMode === "add" && (
              <div style={{ marginBottom:"12px" }}>
                <label style={{ display:"block", marginBottom:"4px", fontSize:"13px", color:s.text2 }}>关联用户 *</label>
                <select value={form.userId ?? ""} onChange={(e) => setForm({...form, userId: Number(e.target.value)||null})} onFocus={loadUserOptions}
                  style={{ width:"100%", height:"36px", padding:"0 8px", border:`1px solid ${s.border}`, borderRadius:s.radius }}>
                  <option value="">请选择用户</option>
                  {userOptions.map(u => <option key={u.id as number} value={u.id as number}>{u.nickname as string || u.username as string} ({u.username as string})</option>)}
                </select>
              </div>
            )}
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", marginBottom:"4px", fontSize:"13px", color:s.text2 }}>姓名 *</label><input value={form.realName} onChange={(e) => setForm({...form, realName:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", marginBottom:"4px", fontSize:"13px", color:s.text2 }}>性别</label><div style={{ display:"flex", gap:"16px" }}>{[{v:1,l:"男"},{v:2,l:"女"},{v:0,l:"未知"}].map(o => <label key={o.v} style={{ fontSize:"13px", cursor:"pointer" }}><input type="radio" checked={form.sex===o.v} onChange={() => setForm({...form, sex:o.v})} /> {o.l}</label>)}</div></div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", marginBottom:"4px", fontSize:"13px", color:s.text2 }}>头像URL</label><input value={form.headPath} onChange={(e) => setForm({...form, headPath:e.target.value})} style={{ width:"100%", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", marginBottom:"4px", fontSize:"13px", color:s.text2 }}>咨询价格</label><input type="number" value={form.consultationPrice} onChange={(e) => setForm({...form, consultationPrice: Number(e.target.value)||0})} style={{ width:"200px", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} /></div>
            <div style={{ marginBottom:"12px" }}><label style={{ display:"block", marginBottom:"4px", fontSize:"13px", color:s.text2 }}>从业年限</label><input type="number" value={form.yearsExperience} onChange={(e) => setForm({...form, yearsExperience: Number(e.target.value)||0})} style={{ width:"120px", height:"36px", padding:"0 12px", border:`1px solid ${s.border}`, borderRadius:s.radius, boxSizing:"border-box" }} /></div>

            {/* Qualifications */}
            <div style={{ marginBottom:"12px" }}>
              <label style={{ display:"block", marginBottom:"4px", fontSize:"13px", color:s.text2 }}>专业认证</label>
              <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
                <select value={selectedQualId ?? ""} onChange={(e) => setSelectedQualId(Number(e.target.value)||null)} style={{ height:"36px", padding:"0 8px", border:`1px solid ${s.border}`, borderRadius:s.radius, width:"200px" }}>
                  <option value="">选择资质类型</option>
                  {editQualOptions.map(o => <option key={o.id as number} value={o.id as number}>{o.name as string}</option>)}
                </select>
                <button onClick={() => { if (selectedQualId && !form.qualificationIds.includes(selectedQualId)) setForm({...form, qualificationIds: [...form.qualificationIds, selectedQualId]}); setSelectedQualId(null); }} style={{ height:"36px", padding:"0 16px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>添加</button>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                {form.qualificationIds.map(qid => (
                  <span key={qid} style={{ display:"inline-flex", alignItems:"center", gap:"4px", padding:"2px 8px", background:"#ecf5ff", color:s.primary, borderRadius:"3px", fontSize:"12px", border:`1px solid ${s.primary}33` }}>
                    {getQualName(qid) || String(qid)}
                    <button onClick={() => setForm({...form, qualificationIds: form.qualificationIds.filter(id => id !== qid)})} style={{ border:"none", background:"none", cursor:"pointer", color:s.primary, fontSize:"14px", padding:0, lineHeight:1 }}>×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div style={{ marginBottom:"12px" }}>
              <label style={{ display:"block", marginBottom:"4px", fontSize:"13px", color:s.text2 }}>擅长领域</label>
              <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
                <select value={selectedFieldId ?? ""} onChange={(e) => setSelectedFieldId(Number(e.target.value)||null)} style={{ height:"36px", padding:"0 8px", border:`1px solid ${s.border}`, borderRadius:s.radius, width:"200px" }}>
                  <option value="">选择擅长领域</option>
                  {editFieldOptions.map(o => <option key={o.id as number} value={o.id as number}>{o.name as string}</option>)}
                </select>
                <button onClick={() => { if (selectedFieldId && !form.fieldIds.includes(selectedFieldId)) setForm({...form, fieldIds: [...form.fieldIds, selectedFieldId]}); setSelectedFieldId(null); }} style={{ height:"36px", padding:"0 16px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>添加</button>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                {form.fieldIds.map(fid => (
                  <span key={fid} style={{ display:"inline-flex", alignItems:"center", gap:"4px", padding:"2px 8px", background:"#ecf5ff", color:s.primary, borderRadius:"3px", fontSize:"12px", border:`1px solid ${s.primary}33` }}>
                    {getFieldName(fid) || String(fid)}
                    <button onClick={() => setForm({...form, fieldIds: form.fieldIds.filter(id => id !== fid)})} style={{ border:"none", background:"none", cursor:"pointer", color:s.primary, fontSize:"14px", padding:0, lineHeight:1 }}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:"16px" }}><label style={{ display:"block", marginBottom:"4px", fontSize:"13px", color:s.text2 }}>状态</label><div style={{ display:"flex", gap:"16px" }}>{[{v:1,l:"启用"},{v:0,l:"禁用"}].map(o => <label key={o.v} style={{ fontSize:"13px", cursor:"pointer" }}><input type="radio" checked={form.status===o.v} onChange={() => setForm({...form, status:o.v})} /> {o.l}</label>)}</div></div>

            <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px" }}>
              <button onClick={() => setFormVisible(false)} style={{ height:"36px", padding:"0 20px", border:`1px solid ${s.border}`, borderRadius:s.radius, background:s.white, cursor:"pointer" }}>取消</button>
              <button onClick={submitForm} disabled={formSaving} style={{ height:"36px", padding:"0 20px", backgroundColor:s.primary, color:"#fff", border:"none", borderRadius:s.radius, cursor:"pointer" }}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
