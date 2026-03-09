"use client";
import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { supabase } from "@/lib/supabase";
import {
  Plus, X, Save, Search, ChevronDown, ChevronUp,
  BookOpen, Users, Trash2, CheckCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

const GOLD = "#d4a017";

const ChartTip = ({ active, payload, label }: any) =>
  active && payload?.length ? (
    <div className="chart-tooltip">
      <p style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: 12, color: p.fill, fontWeight: 700 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  ) : null;

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Assignment form state
  const [assignForm, setAssignForm] = useState<{
    teacherId: string; classId: string; subjectId: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const [{ data: ts }, { data: cls }, { data: subs }, { data: asgns }] =
      await Promise.all([
        supabase.from("users").select("id,national_id,full_name,email,phone,created_at").eq("role", "teacher").order("full_name"),
        supabase.from("classes").select("id,name,grade,section").order("grade").order("section"),
        supabase.from("subjects").select("id,name,class_id").order("name"),
        supabase.from("teacher_class_subjects").select("id,teacher_id,class_id,subject_id,classes(id,name,grade),subjects(id,name)"),
      ]);
    setTeachers(ts || []);
    setClasses(cls || []);
    setSubjects(subs || []);
    setAssignments(asgns || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addAssignment() {
    if (!assignForm?.teacherId || !assignForm.classId || !assignForm.subjectId) {
      setMsg("❌ اختر الفصل والمادة");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("teacher_class_subjects").insert({
      teacher_id: assignForm.teacherId,
      class_id: assignForm.classId,
      subject_id: assignForm.subjectId,
    });
    if (error) {
      setMsg(error.code === "23505" ? "⚠️ هذا الإسناد موجود مسبقاً" : "❌ " + error.message);
    } else {
      setMsg("✅ تم الإسناد بنجاح");
      setAssignForm(f => f ? { ...f, subjectId: "" } : null);
      await load();
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function removeAssignment(id: string) {
    await supabase.from("teacher_class_subjects").delete().eq("id", id);
    setAssignments(a => a.filter(x => x.id !== id));
  }

  const filtered = teachers.filter(t =>
    !search || t.full_name?.includes(search) || t.national_id?.includes(search)
  );

  // Chart data
  const chartData = teachers.map(t => ({
    name: t.full_name?.split(" ").slice(0, 2).join(" "),
    فصول: [...new Set(assignments.filter(a => a.teacher_id === t.id).map(a => a.class_id))].length,
    مواد: assignments.filter(a => a.teacher_id === t.id).length,
  })).filter(d => d.فصول > 0);

  const getTeacherAssignments = (tid: string) =>
    assignments.filter(a => a.teacher_id === tid);

  // Subjects filtered to selected class
  const filteredSubjects = assignForm?.classId
    ? subjects.filter(s => s.class_id === assignForm.classId)
    : [];

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div className="spinner" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="animate-fade-up" dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="page-title">إدارة المعلمين</h1>
            <p className="page-subtitle">{teachers.length} معلم — إسناد الفصول والمواد</p>
          </div>
          <div style={{ position: "relative", width: 240 }}>
            <Search size={13} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو الهوية..." className="input-field" style={{ paddingRight: 34, fontSize: 12 }} />
          </div>
        </div>

        {/* Alert */}
        {msg && (
          <div style={{
            padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: 13, fontWeight: 700,
            background: msg.startsWith("✅") ? "rgba(16,217,160,0.1)" : msg.startsWith("⚠️") ? "rgba(255,183,3,0.1)" : "rgba(255,77,109,0.1)",
            border: `1px solid ${msg.startsWith("✅") ? "rgba(16,217,160,0.3)" : msg.startsWith("⚠️") ? "rgba(255,183,3,0.3)" : "rgba(255,77,109,0.3)"}`,
            color: msg.startsWith("✅") ? "#10d9a0" : msg.startsWith("⚠️") ? "#ffb703" : "#ff4d6d",
          }}>{msg}</div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="card" style={{ padding: "1.25rem" }}>
            <div className="section-header">
              <div>
                <div className="section-title">إحصائيات الإسناد</div>
                <div className="section-sub">عدد الفصول والمواد لكل معلم</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 9 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
                <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="فصول" name="فصول" radius={[4, 4, 0, 0]} fill="#10d9a0" />
                <Bar dataKey="مواد" name="مواد" radius={[4, 4, 0, 0]} fill={GOLD} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Teachers list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">👨‍🏫</div>
              <div className="empty-state-title">لا يوجد معلمون</div>
              <div className="empty-state-sub">أضف المعلمين من قاعدة البيانات</div>
            </div>
          )}

          {filtered.map(teacher => {
            const tAssigns = getTeacherAssignments(teacher.id);
            const tClasses = [...new Set(tAssigns.map(a => a.class_id))];
            const isExpanded = expanded === teacher.id;

            return (
              <div key={teacher.id} className="card" style={{ overflow: "hidden" }}>
                {/* Teacher row */}
                <div style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>

                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                    background: `${GOLD}18`, border: `1px solid ${GOLD}28`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 900, color: GOLD,
                  }}>
                    {teacher.full_name?.charAt(0)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#f0f4ff", marginBottom: 4 }}>{teacher.full_name}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: "#475569" }}>{teacher.national_id}</span>
                      {teacher.phone && <span style={{ fontSize: 10, color: "#475569" }}>• {teacher.phone}</span>}
                    </div>
                  </div>

                  {/* Stats badges */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ padding: "0.3rem 0.75rem", background: "rgba(16,217,160,0.1)", border: "1px solid rgba(16,217,160,0.2)", borderRadius: 999 }}>
                      <span style={{ fontSize: 11, color: "#10d9a0", fontWeight: 700 }}>{tClasses.length} فصل</span>
                    </div>
                    <div style={{ padding: "0.3rem 0.75rem", background: `${GOLD}12`, border: `1px solid ${GOLD}22`, borderRadius: 999 }}>
                      <span style={{ fontSize: 11, color: GOLD, fontWeight: 700 }}>{tAssigns.length} مادة</span>
                    </div>
                  </div>

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : teacher.id)}
                    style={{ padding: "0.45rem 0.875rem", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Cairo',sans-serif", display: "flex", alignItems: "center", gap: 6, background: isExpanded ? `${GOLD}15` : "rgba(255,255,255,0.04)", border: `1px solid ${isExpanded ? GOLD : "rgba(255,255,255,0.08)"}`, color: isExpanded ? GOLD : "#64748b", transition: "all 0.2s", flexShrink: 0 }}>
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {isExpanded ? "إخفاء" : "إدارة الإسناد"}
                  </button>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>

                    {/* Current assignments */}
                    <div style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", letterSpacing: "0.05em", marginBottom: 10 }}>
                        الإسنادات الحالية
                      </div>

                      {tAssigns.length === 0 ? (
                        <p style={{ fontSize: 12, color: "#475569", fontStyle: "italic" }}>لم يتم إسناد أي فصل أو مادة لهذا المعلم بعد</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {tAssigns.map(a => (
                            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 7, background: `${GOLD}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <BookOpen size={12} color={GOLD} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f4ff" }}>{a.subjects?.name}</span>
                                <span style={{ fontSize: 11, color: "#475569", marginRight: 8 }}>← {a.classes?.name}</span>
                              </div>
                              <button onClick={() => removeAssignment(a.id)} style={{ padding: "0.25rem 0.5rem", borderRadius: 7, border: "1px solid rgba(255,77,109,0.2)", background: "rgba(255,77,109,0.08)", color: "#ff4d6d", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                <Trash2 size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="glow-line" style={{ margin: "0 1.25rem" }} />

                    {/* Add assignment form */}
                    <div style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", letterSpacing: "0.05em", marginBottom: 12 }}>
                        <Plus size={11} style={{ display: "inline", marginLeft: 4 }} />
                        إضافة إسناد جديد
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                        {/* Class selector */}
                        <div>
                          <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>الفصل الدراسي</label>
                          <select
                            className="input-field"
                            style={{ fontSize: 12, padding: "0.5rem 0.75rem" }}
                            value={assignForm?.teacherId === teacher.id ? assignForm.classId : ""}
                            onChange={e => setAssignForm({ teacherId: teacher.id, classId: e.target.value, subjectId: "" })}
                          >
                            <option value="">اختر الفصل</option>
                            {classes.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Subject selector */}
                        <div>
                          <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>المادة الدراسية</label>
                          <select
                            className="input-field"
                            style={{ fontSize: 12, padding: "0.5rem 0.75rem" }}
                            value={assignForm?.teacherId === teacher.id ? assignForm.subjectId : ""}
                            onChange={e => setAssignForm(f => f ? { ...f, subjectId: e.target.value } : null)}
                            disabled={!assignForm?.classId || assignForm.teacherId !== teacher.id}
                          >
                            <option value="">اختر المادة</option>
                            {(assignForm?.teacherId === teacher.id ? filteredSubjects : []).map((s: any) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Save button */}
                        <div style={{ display: "flex", alignItems: "flex-end" }}>
                          <button
                            onClick={addAssignment}
                            disabled={saving || !assignForm?.subjectId || assignForm.teacherId !== teacher.id}
                            className="btn-primary"
                            style={{ width: "100%", justifyContent: "center" }}
                          >
                            <CheckCircle size={13} />
                            {saving ? "..." : "تأكيد الإسناد"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
