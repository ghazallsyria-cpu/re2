"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Plus, X, Save, Trash2, Clock } from "lucide-react";
const GOLD = "#d4a017";

export default function TeacherHomework() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ class_id: "", subject_id: "", title: "", description: "", due_date: "", max_grade: 20 });

  useEffect(() => { if (user?.id) loadAll(); }, [user]);

  async function loadAll() {
    const [{ data: asgns }, { data: hw }] = await Promise.all([
      supabase.from("teacher_class_subjects").select("*, classes(id,name), subjects(id,name)").eq("teacher_id", user!.id),
      supabase.from("homework").select("*, classes(name), subjects(name)").eq("teacher_id", user!.id).order("created_at", { ascending: false }),
    ]);
    setAssignments(asgns || []);
    setHomeworks(hw || []);
    setLoading(false);
  }

  async function submit() {
    if (!form.class_id || !form.subject_id || !form.title || !form.due_date) {
      setMsg("❌ أكمل الحقول المطلوبة"); return;
    }
    setSaving(true);
    const { error } = await supabase.from("homework").insert({ ...form, teacher_id: user!.id });
    if (error) setMsg("❌ " + error.message);
    else {
      setMsg("✅ تم إنشاء الواجب");
      setShowForm(false);
      setForm({ class_id: "", subject_id: "", title: "", description: "", due_date: "", max_grade: 20 });
      await loadAll();
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 4000);
  }

  async function del(id: string) {
    if (!confirm("حذف هذا الواجب؟")) return;
    await supabase.from("homework").delete().eq("id", id);
    setHomeworks(p => p.filter(h => h.id !== id));
  }

  const myClasses = [...new Map(assignments.map(a => [a.class_id, a.classes])).values()];
  const formSubjects = assignments.filter(a => a.class_id === form.class_id).map(a => a.subjects);

  const now = new Date();
  const filteredHW = homeworks.filter(hw => {
    if (filter === "upcoming") return hw.due_date && new Date(hw.due_date) > now;
    if (filter === "overdue") return hw.due_date && new Date(hw.due_date) < now;
    return true;
  });

  const stats = {
    total: homeworks.length,
    upcoming: homeworks.filter(h => h.due_date && new Date(h.due_date) > now).length,
    overdue: homeworks.filter(h => h.due_date && new Date(h.due_date) < now).length,
  };

  if (loading) return <DashboardLayout><div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="animate-fade-up" dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div><h1 className="page-title">الواجبات المنزلية</h1><p className="page-subtitle">إنشاء ومتابعة الواجبات</p></div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ gap: 6 }}>
            <Plus size={14} />واجب جديد
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[
            { label: "إجمالي الواجبات", value: stats.total, color: GOLD },
            { label: "قادمة", value: stats.upcoming, color: "#10d9a0" },
            { label: "منتهية", value: stats.overdue, color: "#ff4d6d" },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 3, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {msg && <div style={{ padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: 13, fontWeight: 700, background: msg.startsWith("✅") ? "rgba(16,217,160,0.1)" : "rgba(255,77,109,0.1)", border: `1px solid ${msg.startsWith("✅") ? "rgba(16,217,160,0.3)" : "rgba(255,77,109,0.3)"}`, color: msg.startsWith("✅") ? "#10d9a0" : "#ff4d6d" }}>{msg}</div>}

        {/* Form */}
        {showForm && (
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#f0f4ff" }}>إنشاء واجب جديد</div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569" }}><X size={16} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>الفصل *</label>
                <select className="input-field" style={{ fontSize: 12 }} value={form.class_id}
                  onChange={e => setForm(p => ({ ...p, class_id: e.target.value, subject_id: "" }))}>
                  <option value="">اختر الفصل</option>
                  {myClasses.map((c: any) => <option key={c?.id} value={c?.id}>{c?.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>المادة *</label>
                <select className="input-field" style={{ fontSize: 12 }} value={form.subject_id}
                  onChange={e => setForm(p => ({ ...p, subject_id: e.target.value }))} disabled={!form.class_id}>
                  <option value="">اختر المادة</option>
                  {formSubjects.map((s: any) => <option key={s?.id} value={s?.id}>{s?.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>عنوان الواجب *</label>
                <input className="input-field" style={{ fontSize: 12 }} value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="مثال: حل تمارين الوحدة الثانية" />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>وصف الواجب</label>
                <textarea className="input-field" style={{ fontSize: 12, resize: "vertical", minHeight: 70 }} value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="تفاصيل الواجب..." />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>تاريخ التسليم *</label>
                <input type="date" className="input-field" style={{ fontSize: 12 }} value={form.due_date}
                  onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>الدرجة الكاملة</label>
                <input type="number" className="input-field" style={{ fontSize: 12 }} value={form.max_grade}
                  onChange={e => setForm(p => ({ ...p, max_grade: Number(e.target.value) }))} min={1} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={submit} disabled={saving} className="btn-primary"><Save size={13} />حفظ الواجب</button>
              <button onClick={() => setShowForm(false)} className="btn btn-secondary">إلغاء</button>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="tabs" style={{ width: "fit-content" }}>
          <button className={`tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>الكل ({stats.total})</button>
          <button className={`tab ${filter === "upcoming" ? "active" : ""}`} onClick={() => setFilter("upcoming")}>قادمة ({stats.upcoming})</button>
          <button className={`tab ${filter === "overdue" ? "active" : ""}`} onClick={() => setFilter("overdue")}>منتهية ({stats.overdue})</button>
        </div>

        {/* Homework list */}
        {filteredHW.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">لا توجد واجبات</div><div className="empty-state-sub">أنشئ واجباً جديداً من الزر أعلاه</div></div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredHW.map(hw => {
              const overdue = hw.due_date && new Date(hw.due_date) < now;
              return (
                <div key={hw.id} className="card" style={{ padding: "1.125rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: overdue ? "rgba(255,77,109,0.15)" : `${GOLD}15`, border: `1px solid ${overdue ? "rgba(255,77,109,0.3)" : `${GOLD}25`}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Clock size={15} color={overdue ? "#ff4d6d" : GOLD} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#f0f4ff" }}>{hw.title}</span>
                        <span className="badge" style={{ background: `${GOLD}15`, color: GOLD }}>{(hw as any).subjects?.name}</span>
                        <span className="badge" style={{ background: "rgba(59,158,255,0.15)", color: "#3b9eff" }}>{(hw as any).classes?.name}</span>
                        {overdue
                          ? <span className="badge" style={{ background: "rgba(255,77,109,0.15)", color: "#ff4d6d" }}>منتهي</span>
                          : <span className="badge" style={{ background: "rgba(16,217,160,0.15)", color: "#10d9a0" }}>نشط</span>}
                      </div>
                      {hw.description && <p style={{ fontSize: 12, color: "#475569", marginBottom: 6, lineHeight: 1.6 }}>{hw.description}</p>}
                      <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#475569" }}>
                        <span>📅 التسليم: <strong style={{ color: overdue ? "#ff4d6d" : "#94a3b8" }}>{hw.due_date}</strong></span>
                        <span>🏆 <strong style={{ color: GOLD }}>{hw.max_grade}</strong> درجة</span>
                      </div>
                    </div>
                    <button onClick={() => del(hw.id)} style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: 9, padding: "0.35rem 0.6rem", cursor: "pointer", color: "#ff4d6d", flexShrink: 0 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        }
      </div>
    </DashboardLayout>
  );
}
