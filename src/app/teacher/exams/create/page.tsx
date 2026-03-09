"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Plus, X, Save, FileText, Trash2, Eye, EyeOff } from "lucide-react";
const GOLD = "#d4a017";
const TERMS = ["الفصل الأول", "الفصل الثاني", "الفصل الثالث"];

export default function TeacherExams() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ class_id: "", subject_id: "", title: "", instructions: "", start_time: "", duration_minutes: 60, max_grade: 100, is_published: false, term: TERMS[0] });

  useEffect(() => { if (user?.id) loadAll(); }, [user]);

  async function loadAll() {
    const [{ data: asgns }, { data: ex }] = await Promise.all([
      supabase.from("teacher_class_subjects").select("*, classes(id,name), subjects(id,name)").eq("teacher_id", user!.id),
      supabase.from("exams").select("*, classes(name), subjects(name)").eq("teacher_id", user!.id).order("created_at", { ascending: false }),
    ]);
    setAssignments(asgns || []);
    setExams(ex || []);
    setLoading(false);
  }

  async function submit() {
    if (!form.class_id || !form.subject_id || !form.title) { setMsg("❌ أكمل الحقول المطلوبة"); return; }
    setSaving(true);
    const payload: any = { ...form, teacher_id: user!.id };
    if (!payload.start_time) delete payload.start_time;
    const { error } = await supabase.from("exams").insert(payload);
    if (error) setMsg("❌ " + error.message);
    else {
      setMsg("✅ تم إنشاء الاختبار");
      setShowForm(false);
      setForm({ class_id: "", subject_id: "", title: "", instructions: "", start_time: "", duration_minutes: 60, max_grade: 100, is_published: false, term: TERMS[0] });
      await loadAll();
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function togglePublish(id: string, current: boolean) {
    await supabase.from("exams").update({ is_published: !current }).eq("id", id);
    setExams(p => p.map(e => e.id === id ? { ...e, is_published: !current } : e));
  }

  async function del(id: string) {
    if (!confirm("حذف هذا الاختبار؟")) return;
    await supabase.from("exams").delete().eq("id", id);
    setExams(p => p.filter(e => e.id !== id));
  }

  const myClasses = [...new Map(assignments.map(a => [a.class_id, a.classes])).values()];
  const formSubjects = assignments.filter(a => a.class_id === form.class_id).map(a => a.subjects);
  const now = new Date();
  const filteredExams = exams.filter(ex => {
    if (filter === "published") return ex.is_published;
    if (filter === "draft") return !ex.is_published;
    if (filter === "upcoming") return ex.start_time && new Date(ex.start_time) > now;
    return true;
  });

  const stats = {
    total: exams.length,
    published: exams.filter(e => e.is_published).length,
    draft: exams.filter(e => !e.is_published).length,
  };

  if (loading) return <DashboardLayout><div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="animate-fade-up" dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div><h1 className="page-title">الاختبارات</h1><p className="page-subtitle">إنشاء وجدولة الاختبارات</p></div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ gap: 6 }}><Plus size={14} />اختبار جديد</button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[
            { label: "إجمالي", value: stats.total, color: GOLD },
            { label: "منشور", value: stats.published, color: "#10d9a0" },
            { label: "مسودة", value: stats.draft, color: "#475569" },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 3, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {msg && <div style={{ padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: 13, fontWeight: 700, background: msg.startsWith("✅") ? "rgba(16,217,160,0.1)" : "rgba(255,77,109,0.1)", border: `1px solid ${msg.startsWith("✅") ? "rgba(16,217,160,0.3)" : "rgba(255,77,109,0.3)"}`, color: msg.startsWith("✅") ? "#10d9a0" : "#ff4d6d" }}>{msg}</div>}

        {showForm && (
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#f0f4ff" }}>إنشاء اختبار جديد</div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569" }}><X size={16} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>الفصل *</label>
                <select className="input-field" style={{ fontSize: 12 }} value={form.class_id} onChange={e => setForm(p => ({ ...p, class_id: e.target.value, subject_id: "" }))}>
                  <option value="">اختر الفصل</option>
                  {myClasses.map((c: any) => <option key={c?.id} value={c?.id}>{c?.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>المادة *</label>
                <select className="input-field" style={{ fontSize: 12 }} value={form.subject_id} onChange={e => setForm(p => ({ ...p, subject_id: e.target.value }))} disabled={!form.class_id}>
                  <option value="">اختر المادة</option>
                  {formSubjects.map((s: any) => <option key={s?.id} value={s?.id}>{s?.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>عنوان الاختبار *</label>
                <input className="input-field" style={{ fontSize: 12 }} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="مثال: اختبار منتصف الفصل" />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>التعليمات</label>
                <textarea className="input-field" style={{ fontSize: 12, resize: "vertical", minHeight: 70 }} value={form.instructions} onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))} placeholder="تعليمات الاختبار للطلاب..." />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>موعد الاختبار</label>
                <input type="datetime-local" className="input-field" style={{ fontSize: 12 }} value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>المدة (دقيقة)</label>
                <input type="number" className="input-field" style={{ fontSize: 12 }} value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: Number(e.target.value) }))} min={10} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>الدرجة الكاملة</label>
                <input type="number" className="input-field" style={{ fontSize: 12 }} value={form.max_grade} onChange={e => setForm(p => ({ ...p, max_grade: Number(e.target.value) }))} min={1} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>الفصل الزمني</label>
                <select className="input-field" style={{ fontSize: 12 }} value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))}>
                  {TERMS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "0.5rem 0.75rem", background: form.is_published ? "rgba(16,217,160,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.is_published ? "rgba(16,217,160,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 10 }}>
                  <input type="checkbox" checked={form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} style={{ accentColor: "#10d9a0" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: form.is_published ? "#10d9a0" : "#64748b" }}>نشر للطلاب</span>
                </label>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={submit} disabled={saving} className="btn-primary"><Save size={13} />حفظ الاختبار</button>
              <button onClick={() => setShowForm(false)} className="btn btn-secondary">إلغاء</button>
            </div>
          </div>
        )}

        <div className="tabs" style={{ width: "fit-content" }}>
          {[["all", `الكل (${stats.total})`], ["published", `منشور (${stats.published})`], ["draft", `مسودة (${stats.draft})`]].map(([k, l]) => (
            <button key={k} className={`tab ${filter === k ? "active" : ""}`} onClick={() => setFilter(k as string)}>{l}</button>
          ))}
        </div>

        {filteredExams.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">📝</div><div className="empty-state-title">لا توجد اختبارات</div></div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredExams.map(ex => (
              <div key={ex.id} className="card" style={{ padding: "1.125rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FileText size={15} color="#a78bfa" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#f0f4ff" }}>{ex.title}</span>
                      <span className="badge" style={{ background: `${GOLD}15`, color: GOLD }}>{(ex as any).subjects?.name}</span>
                      <span className="badge" style={{ background: "rgba(59,158,255,0.15)", color: "#3b9eff" }}>{(ex as any).classes?.name}</span>
                      <span className="badge" style={{ background: ex.is_published ? "rgba(16,217,160,0.15)" : "rgba(255,255,255,0.05)", color: ex.is_published ? "#10d9a0" : "#475569" }}>
                        {ex.is_published ? "منشور" : "مسودة"}
                      </span>
                    </div>
                    {ex.instructions && <p style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>{ex.instructions}</p>}
                    <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#475569", flexWrap: "wrap" }}>
                      {ex.start_time && <span>📅 {new Date(ex.start_time).toLocaleString("ar-SA")}</span>}
                      <span>⏱ {ex.duration_minutes} دقيقة</span>
                      <span>🏆 {ex.max_grade} درجة</span>
                      <span>📋 {ex.term}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => togglePublish(ex.id, ex.is_published)} style={{ padding: "0.35rem 0.6rem", borderRadius: 8, border: `1px solid ${ex.is_published ? "rgba(255,183,3,0.3)" : "rgba(16,217,160,0.3)"}`, background: ex.is_published ? "rgba(255,183,3,0.08)" : "rgba(16,217,160,0.08)", color: ex.is_published ? "#ffb703" : "#10d9a0", cursor: "pointer" }}>
                      {ex.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button onClick={() => del(ex.id)} style={{ padding: "0.35rem 0.6rem", borderRadius: 8, border: "1px solid rgba(255,77,109,0.2)", background: "rgba(255,77,109,0.08)", color: "#ff4d6d", cursor: "pointer" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </DashboardLayout>
  );
}
