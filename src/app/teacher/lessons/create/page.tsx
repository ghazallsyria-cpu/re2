"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Plus, X, Save, BookOpen, Eye, EyeOff, Trash2 } from "lucide-react";
const GOLD = "#d4a017";

export default function TeacherLessons() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [selClass, setSelClass] = useState("all");
  const [form, setForm] = useState({ class_id: "", subject_id: "", title: "", content: "", order_index: 1, is_published: true });

  useEffect(() => { if (user?.id) loadAll(); }, [user]);

  async function loadAll() {
    const [{ data: asgns }, { data: ls }] = await Promise.all([
      supabase.from("teacher_class_subjects").select("*, classes(id,name), subjects(id,name)").eq("teacher_id", user!.id),
      supabase.from("lessons").select("*, classes(name), subjects(name)").eq("teacher_id", user!.id).order("created_at", { ascending: false }),
    ]);
    setAssignments(asgns || []);
    setLessons(ls || []);
    setLoading(false);
  }

  async function submit() {
    if (!form.class_id || !form.subject_id || !form.title) { setMsg("❌ أكمل الحقول المطلوبة"); return; }
    setSaving(true);
    const { error } = await supabase.from("lessons").insert({ ...form, teacher_id: user!.id });
    if (error) setMsg("❌ " + error.message);
    else {
      setMsg("✅ تم نشر الدرس");
      setShowForm(false);
      setForm({ class_id: "", subject_id: "", title: "", content: "", order_index: 1, is_published: true });
      await loadAll();
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function togglePublish(id: string, current: boolean) {
    await supabase.from("lessons").update({ is_published: !current }).eq("id", id);
    setLessons(p => p.map(l => l.id === id ? { ...l, is_published: !current } : l));
  }

  async function del(id: string) {
    if (!confirm("حذف هذا الدرس؟")) return;
    await supabase.from("lessons").delete().eq("id", id);
    setLessons(p => p.filter(l => l.id !== id));
  }

  const myClasses = [...new Map(assignments.map(a => [a.class_id, a.classes])).values()];
  const formSubjects = assignments.filter(a => a.class_id === form.class_id).map(a => a.subjects);
  const filtered = selClass === "all" ? lessons : lessons.filter(l => l.class_id === selClass);

  if (loading) return <DashboardLayout><div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="animate-fade-up" dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div><h1 className="page-title">الدروس</h1><p className="page-subtitle">{lessons.length} درس — {lessons.filter(l => l.is_published).length} منشور</p></div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ gap: 6 }}><Plus size={14} />درس جديد</button>
        </div>

        {msg && <div style={{ padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: 13, fontWeight: 700, background: msg.startsWith("✅") ? "rgba(16,217,160,0.1)" : "rgba(255,77,109,0.1)", border: `1px solid ${msg.startsWith("✅") ? "rgba(16,217,160,0.3)" : "rgba(255,77,109,0.3)"}`, color: msg.startsWith("✅") ? "#10d9a0" : "#ff4d6d" }}>{msg}</div>}

        {showForm && (
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#f0f4ff" }}>إنشاء درس جديد</div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569" }}><X size={16} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
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
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>عنوان الدرس *</label>
                <input className="input-field" style={{ fontSize: 12 }} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="مثال: المعادلات التفاضلية" />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>محتوى الدرس</label>
                <textarea className="input-field" style={{ fontSize: 12, resize: "vertical", minHeight: 100 }} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="ملخص أو محتوى الدرس..." />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>الترتيب</label>
                <input type="number" className="input-field" style={{ fontSize: 12 }} value={form.order_index} onChange={e => setForm(p => ({ ...p, order_index: Number(e.target.value) }))} min={1} />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "0.5rem 0.75rem", background: form.is_published ? "rgba(16,217,160,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${form.is_published ? "rgba(16,217,160,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, transition: "all 0.2s" }}>
                  <input type="checkbox" checked={form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} style={{ accentColor: "#10d9a0" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: form.is_published ? "#10d9a0" : "#64748b" }}>نشر فوراً</span>
                </label>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={submit} disabled={saving} className="btn-primary"><Save size={13} />حفظ الدرس</button>
              <button onClick={() => setShowForm(false)} className="btn btn-secondary">إلغاء</button>
            </div>
          </div>
        )}

        {/* Filter by class */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button onClick={() => setSelClass("all")} style={{ padding: "0.3rem 0.75rem", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Cairo',sans-serif", background: selClass === "all" ? `${GOLD}15` : "rgba(255,255,255,0.04)", border: `1px solid ${selClass === "all" ? GOLD : "rgba(255,255,255,0.08)"}`, color: selClass === "all" ? GOLD : "#64748b" }}>الكل</button>
          {myClasses.map((c: any) => (
            <button key={c?.id} onClick={() => setSelClass(c?.id)} style={{ padding: "0.3rem 0.75rem", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Cairo',sans-serif", background: selClass === c?.id ? `${GOLD}15` : "rgba(255,255,255,0.04)", border: `1px solid ${selClass === c?.id ? GOLD : "rgba(255,255,255,0.08)"}`, color: selClass === c?.id ? GOLD : "#64748b" }}>{c?.name}</button>
          ))}
        </div>

        {/* Lessons */}
        {filtered.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">📖</div><div className="empty-state-title">لا توجد دروس</div><div className="empty-state-sub">أنشئ أول درس من الزر أعلاه</div></div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(ls => (
              <div key={ls.id} className="card" style={{ padding: "1.125rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: `${GOLD}15`, border: `1px solid ${GOLD}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <BookOpen size={15} color={GOLD} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#f0f4ff" }}>{ls.title}</span>
                      <span className="badge" style={{ background: `${GOLD}15`, color: GOLD }}>{(ls as any).subjects?.name}</span>
                      <span className="badge" style={{ background: "rgba(59,158,255,0.15)", color: "#3b9eff" }}>{(ls as any).classes?.name}</span>
                      <span className="badge" style={{ background: ls.is_published ? "rgba(16,217,160,0.15)" : "rgba(255,255,255,0.05)", color: ls.is_published ? "#10d9a0" : "#475569" }}>
                        {ls.is_published ? "منشور" : "مسودة"}
                      </span>
                    </div>
                    {ls.content && <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.6, marginBottom: 6 }}>{ls.content.slice(0, 150)}{ls.content.length > 150 ? "..." : ""}</p>}
                    <span style={{ fontSize: 10, color: "#1e293b" }}>📅 {ls.created_at?.slice(0, 10)}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => togglePublish(ls.id, ls.is_published)} style={{ padding: "0.35rem 0.6rem", borderRadius: 8, border: `1px solid ${ls.is_published ? "rgba(255,183,3,0.3)" : "rgba(16,217,160,0.3)"}`, background: ls.is_published ? "rgba(255,183,3,0.08)" : "rgba(16,217,160,0.08)", color: ls.is_published ? "#ffb703" : "#10d9a0", cursor: "pointer" }}>
                      {ls.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button onClick={() => del(ls.id)} style={{ padding: "0.35rem 0.6rem", borderRadius: 8, border: "1px solid rgba(255,77,109,0.2)", background: "rgba(255,77,109,0.08)", color: "#ff4d6d", cursor: "pointer" }}>
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
