"use client";

import { useEffect, useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Upload, X } from "lucide-react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/session";
import type { PatientContact } from "@ai-adolescent-mental-health/domain";

const RELATION_OPTIONS = ["本人", "父母", "子女", "亲戚", "其他"];

type RecordItem = {
  id: number;
  patientContactId: number;
  visitDate: string;
  department: string;
  hospital: string;
  symptoms: string;
  remarks: string;
  images: string[];
};

export function PatientsPage() {
  const [patients, setPatients] = useState<PatientContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePatientId, setActivePatientId] = useState("");
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // Patient dialog
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [patientForm, setPatientForm] = useState<Record<string, unknown>>({});
  const [patientSaving, setPatientSaving] = useState(false);

  // Record dialog
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [recordViewOnly, setRecordViewOnly] = useState(false);
  const [recordForm, setRecordForm] = useState<Record<string, unknown>>({});
  const [recordFiles, setRecordFiles] = useState<File[]>([]);
  const [recordExistingImages, setRecordExistingImages] = useState<string[]>([]);
  const [recordSaving, setRecordSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateAge = (birthday: string) => {
    if (!birthday) return 0;
    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  useEffect(() => {
    api.patient.list()
      .then((p) => {
        setPatients(p);
        if (p.length > 0) {
          setActivePatientId(String(p[0].id));
          fetchRecords(String(p[0].id));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fetchRecords = async (patientId: string) => {
    setRecordsLoading(true);
    try {
      const data = await api.medicalRecord.list(Number(patientId));
      setRecords(data as RecordItem[]);
    } catch {
      setRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleTabChange = (val: string) => {
    setActivePatientId(val);
    fetchRecords(val);
  };

  // Patient dialog
  const openPatientDialog = (patient?: PatientContact) => {
    if (patient) {
      setPatientForm({ ...patient });
    } else {
      setPatientForm({ name: "", sex: 1, birthday: "", relationship: "" });
    }
    setPatientDialogOpen(true);
  };

  const submitPatient = async () => {
    if (!patientForm.name || !patientForm.birthday || !patientForm.relationship) {
      toast.error("请填写完整信息");
      return;
    }
    setPatientSaving(true);
    try {
      if (patientForm.id) {
        await api.patient.update(patientForm as PatientContact);
      } else {
        await api.patient.add(patientForm as unknown as Omit<PatientContact, "id">);
      }
      toast.success("保存成功");
      setPatientDialogOpen(false);
      const p = await api.patient.list();
      setPatients(p);
    } catch {
      toast.error("保存失败");
    } finally {
      setPatientSaving(false);
    }
  };

  const deletePatient = async (id: number) => {
    if (!confirm("确定要删除该就诊人吗？")) return;
    try {
      await api.patient.delete(id);
      toast.success("删除成功");
      setActivePatientId("");
      const p = await api.patient.list();
      setPatients(p);
    } catch {
      toast.error("删除失败");
    }
  };

  // Record dialog
  const openAddRecord = () => {
    setRecordViewOnly(false);
    setRecordFiles([]);
    setRecordExistingImages([]);
    setRecordForm({
      patientContactId: Number(activePatientId),
      visitDate: new Date().toISOString().split("T")[0],
      department: "",
      hospital: "",
      symptoms: "",
      remarks: "",
    });
    setRecordDialogOpen(true);
  };

  const openViewRecord = (record: RecordItem) => {
    setRecordViewOnly(true);
    setRecordFiles([]);
    setRecordExistingImages(record.images ?? []);
    setRecordForm({ ...record });
    setRecordDialogOpen(true);
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const f of files) {
      if (f.size > 3 * 1024 * 1024) {
        toast.error("图片大小不能超过 3MB");
        return;
      }
    }
    setRecordFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (idx: number) => {
    setRecordFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (url: string) => {
    setRecordExistingImages((prev) => prev.filter((u) => u !== url));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "medical-record");
    const token = getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}/common/upload`, {
      method: "POST",
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json() as { code: number; data: string; message?: string };
    if (data.code !== 200) throw new Error(data.message ?? "上传失败");
    return data.data;
  };

  const submitRecord = async () => {
    if (!recordForm.visitDate || !recordForm.department || !recordForm.symptoms) {
      toast.error("请填写必填项");
      return;
    }
    setRecordSaving(true);
    try {
      let newUrls: string[] = [];
      if (recordFiles.length > 0) {
        for (const file of recordFiles) {
          const url = await uploadFile(file);
          newUrls.push(url);
        }
      }
      const finalImages = [...recordExistingImages, ...newUrls];
      const payload = {
        id: recordForm.id as number | undefined,
        patientContactId: recordForm.patientContactId as number,
        visitDate: recordForm.visitDate as string,
        department: recordForm.department as string,
        hospital: recordForm.hospital as string,
        symptoms: recordForm.symptoms as string,
        remarks: recordForm.remarks as string,
      };
      if (recordForm.id) {
        await api.medicalRecord.update(payload, finalImages);
      } else {
        await api.medicalRecord.add(payload, finalImages);
      }
      toast.success("保存成功");
      setRecordDialogOpen(false);
      fetchRecords(activePatientId);
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "保存失败");
    } finally {
      setRecordSaving(false);
    }
  };

  const deleteRecord = async (id: number) => {
    if (!confirm("确定要删除该病历记录吗？")) return;
    try {
      await api.medicalRecord.delete(id);
      toast.success("删除成功");
      fetchRecords(activePatientId);
    } catch {
      toast.error("删除失败");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const currentPatient = patients.find((p) => String(p.id) === activePatientId);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">就诊人病历管理</h1>
        <Button variant="primary" size="sm" onClick={() => openPatientDialog()}>
          <Plus className="size-4 mr-1" />添加就诊人
        </Button>
      </div>

      {patients.length === 0 ? (
        <div className="py-20 text-center text-cosmic-muted">暂无就诊人信息，请添加</div>
      ) : (
        <>
          <Tabs value={activePatientId} onValueChange={handleTabChange}>
            <TabsList className="mb-4 flex-wrap">
              {patients.map((p) => (
                <TabsTrigger key={p.id} value={String(p.id)}>{p.name}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activePatientId}>
              {currentPatient && (
                <>
                  <div className="cosmic-card mb-6 p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-cosmic-dim">姓名：</span>
                        <span className="text-white">{currentPatient.name}</span>
                      </div>
                      <div>
                        <span className="text-cosmic-dim">年龄：</span>
                        <span className="text-white">{calculateAge(currentPatient.birthday)}岁</span>
                      </div>
                      <div>
                        <span className="text-cosmic-dim">性别：</span>
                        <span className="text-white">{currentPatient.sex === 1 ? "男" : "女"}</span>
                      </div>
                      <div>
                        <span className="text-cosmic-dim">关系：</span>
                        <span className="text-white">{currentPatient.relationship}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-4 flex gap-2">
                        <Button variant="ghost" size="xs" onClick={() => openPatientDialog(currentPatient)}>修改</Button>
                        <Button variant="ghost" size="xs" className="text-red-400 hover:text-red-300" onClick={() => deletePatient(currentPatient.id)}>删除</Button>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-white">就诊经历</h3>
                    <Button variant="primary" size="sm" onClick={openAddRecord}>
                      <Plus className="size-4 mr-1" />新增就诊经历
                    </Button>
                  </div>

                  {recordsLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                    </div>
                  ) : records.length === 0 ? (
                    <div className="py-12 text-center text-cosmic-muted">暂无就诊记录</div>
                  ) : (
                    <div className="cosmic-card overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/5 text-left text-cosmic-dim">
                            <th className="px-4 py-3 font-medium w-[120px]">就诊日期</th>
                            <th className="px-4 py-3 font-medium w-[120px]">科室</th>
                            <th className="px-4 py-3 font-medium">医院</th>
                            <th className="px-4 py-3 font-medium">病症</th>
                            <th className="px-4 py-3 font-medium w-[150px]">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.map((r) => (
                            <tr key={r.id} className="border-b border-white/5 last:border-0">
                              <td className="px-4 py-3 text-cosmic-dim">{r.visitDate}</td>
                              <td className="px-4 py-3 text-white">{r.department}</td>
                              <td className="px-4 py-3 text-white">{r.hospital}</td>
                              <td className="px-4 py-3 text-cosmic-muted max-w-[200px] truncate">{r.symptoms}</td>
                              <td className="px-4 py-3 flex gap-2">
                                <Button variant="ghost" size="xs" onClick={() => openViewRecord(r)}>详情</Button>
                                <Button variant="ghost" size="xs" className="text-red-400 hover:text-red-300" onClick={() => deleteRecord(r.id)}>删除</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Patient Dialog */}
      <Dialog open={patientDialogOpen} onOpenChange={setPatientDialogOpen}>
        <DialogContent className="!max-w-sm">
          <DialogTitle>{patientForm.id ? "修改就诊人" : "添加就诊人"}</DialogTitle>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">姓名</label>
              <input
                value={String(patientForm.name ?? "")}
                onChange={(e) => setPatientForm((f) => ({ ...f, name: e.target.value }))}
                className="cosmic-input w-full rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-cosmic-dim">性别</label>
              <div className="flex gap-4">
                {[{ value: 1, label: "男" }, { value: 2, label: "女" }].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-1.5 text-sm text-cosmic-muted cursor-pointer">
                    <input
                      type="radio"
                      name="patientSex"
                      value={opt.value}
                      checked={Number(patientForm.sex) === opt.value}
                      onChange={() => setPatientForm((f) => ({ ...f, sex: opt.value }))}
                      className="accent-cosmic-blue"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">出生日期</label>
              <input
                type="date"
                value={String(patientForm.birthday ?? "")}
                onChange={(e) => setPatientForm((f) => ({ ...f, birthday: e.target.value }))}
                className="cosmic-input w-full rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">关系</label>
              <select
                value={String(patientForm.relationship ?? "")}
                onChange={(e) => setPatientForm((f) => ({ ...f, relationship: e.target.value }))}
                className="cosmic-input w-full rounded-lg px-3 py-2 text-sm"
              >
                <option value="">请选择关系</option>
                {RELATION_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setPatientDialogOpen(false)}>取消</Button>
              <Button variant="primary" size="sm" onClick={submitPatient} disabled={patientSaving}>
                {patientSaving ? "保存中..." : "确定"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Record Dialog */}
      <Dialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen}>
        <DialogContent className="!max-w-lg">
          <DialogTitle>{recordViewOnly ? "病历详情" : "新增就诊经历"}</DialogTitle>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">就诊日期</label>
              <input
                type="date"
                value={String(recordForm.visitDate ?? "")}
                onChange={(e) => setRecordForm((f) => ({ ...f, visitDate: e.target.value }))}
                className="cosmic-input w-full rounded-lg px-3 py-2 text-sm"
                disabled={recordViewOnly}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">就诊科室</label>
              <input
                value={String(recordForm.department ?? "")}
                onChange={(e) => setRecordForm((f) => ({ ...f, department: e.target.value }))}
                className="cosmic-input w-full rounded-lg px-3 py-2 text-sm"
                disabled={recordViewOnly}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">就诊医院</label>
              <input
                value={String(recordForm.hospital ?? "")}
                onChange={(e) => setRecordForm((f) => ({ ...f, hospital: e.target.value }))}
                className="cosmic-input w-full rounded-lg px-3 py-2 text-sm"
                disabled={recordViewOnly}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">病症</label>
              <textarea
                value={String(recordForm.symptoms ?? "")}
                onChange={(e) => setRecordForm((f) => ({ ...f, symptoms: e.target.value }))}
                rows={3}
                className="cosmic-input w-full rounded-lg px-3 py-2 text-sm resize-none"
                disabled={recordViewOnly}
              />
            </div>
            {!recordViewOnly && (
              <div>
                <label className="mb-1 block text-sm text-cosmic-dim">病历单图片</label>
                <div className="flex flex-wrap gap-2">
                  {recordExistingImages.map((url, i) => (
                    <div key={`existing-${i}`} className="relative size-16 rounded-lg overflow-hidden bg-white/5">
                      <img src={url} alt="" className="size-16 object-cover" />
                      <button
                        onClick={() => removeExistingImage(url)}
                        className="absolute top-0 right-0 size-5 rounded-bl-lg bg-red-500/80 flex items-center justify-center"
                      >
                        <X className="size-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {recordFiles.map((file, i) => (
                    <div key={`new-${i}`} className="relative size-16 rounded-lg overflow-hidden bg-white/5">
                      <img src={URL.createObjectURL(file)} alt="" className="size-16 object-cover" />
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute top-0 right-0 size-5 rounded-bl-lg bg-red-500/80 flex items-center justify-center"
                      >
                        <X className="size-3 text-white" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="size-16 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-cosmic-dim hover:border-cosmic-sky/50 transition-colors"
                  >
                    <Upload className="size-5" />
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={addFiles} className="hidden" />
                <p className="mt-1 text-xs text-cosmic-dim">支持 JPG/PNG，单张不超过 3MB</p>
              </div>
            )}
            {recordViewOnly && recordExistingImages.length > 0 && (
              <div>
                <label className="mb-1 block text-sm text-cosmic-dim">病历单图片</label>
                <div className="flex flex-wrap gap-2">
                  {recordExistingImages.map((url, i) => (
                    <img key={i} src={url} alt="" className="size-16 rounded-lg object-cover" />
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm text-cosmic-dim">备注</label>
              <textarea
                value={String(recordForm.remarks ?? "")}
                onChange={(e) => setRecordForm((f) => ({ ...f, remarks: e.target.value }))}
                rows={2}
                className="cosmic-input w-full rounded-lg px-3 py-2 text-sm resize-none"
                disabled={recordViewOnly}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setRecordDialogOpen(false)}>
                {recordViewOnly ? "关闭" : "取消"}
              </Button>
              {!recordViewOnly && (
                <Button variant="primary" size="sm" onClick={submitRecord} disabled={recordSaving}>
                  {recordSaving ? "保存中..." : "确定"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
