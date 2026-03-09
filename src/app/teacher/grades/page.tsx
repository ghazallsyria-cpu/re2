"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Save, Search, BarChart2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";

const GOLD = "#d4a017";
const TERMS = ["الفصل الأول", "الفصل الثاني", "الفصل الثالث"];
const TYPES = ["اختبار تحريري", "اختبار شفهي", "واجب", "نشاط", "مشروع", "اختبار نهائي"];
const GC = (p: number) => p >= 90 ? "#10d9a0" : p >= 80 ? GOLD : p >= 70 ? "#3b9eff" : p >= 60 ? "#ffb703" : "#ff4d6d";
const GL = (p: number) => p >= 90 ? "ممتاز" : p >= 80 ? "جيد جداً" : p >= 70 ? "جيد" : p >= 60 ? "مقبول" : "ضعيف";

export default function TeacherGrades() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selClass, setSelClass] = useState("");
  const [selSubject, setSelSubject] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [existing, setExisting] = useState<any[]>([]);
  const [term, setTerm] = useState(TERMS[0]);
  const [examType, setExamType] = useState(TYPES[0]);
  const [maxMarks, setMaxMarks] = useState(100);
  const [marksMap, setMarksMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"entry" | "view">("entry");
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user?.id) loadAssignments(); }, [user]);
  useEffect(() => { if (selClass && selSubject) { loadStudents(); } }, [selClass, selSubject]);
  useEffect(() => { if (selClass && selSubject && students.length) loadGrades(); }, [term, examType, students]);

  async function loadAssignments() {
    const { data } = await supabase.from("teacher_class_subjects")
      .select("*, classes(id,name), subjects(id,name)")
      .eq("teacher_id", user!.id);
    setAssignments(data || []);
    setLoading(false);
  }

  async function loadStudents() {
    const { data } = await supabase.from("users").select("national_id,full_name")
      .eq("class_id", selClass).eq("role", "student").order("full_name");
    setStudents(data || []);
    const init: Record<string, string> = {};
    (data || []).forEach((s: any) => init[s.national_id] = "");
    setMarksMap(init);
  }

  async function loadGrades() {
    const ids = students.map(s => s.national_id);
    if (!ids.length) return;
    const { data } = await supabase.from("grades").select("*")
      .in("student_national_id", ids).eq("subject_id", selSubject)
      .eq("term", term).eq("exam_type", examType);
    setExisting(data || []);
    const m: Record<string, string> = {};
    (data || []).forEach((g: any) => m[g.student_national_id] = String(g.marks_obtained));
    setMarksMap(prev => ({ ...prev, ...m }));
  }

  async function save() {
    setSaving(true); setMsg("");
    let saved = 0, errors = 0;
    for (const [sid, mark] of Object.entries(marksMap)) {
      if (mark === "") continue;
      const val = parseFloat(mark);
      if (isNaN(val) || val < 0 || val > maxMarks) continue;
      const ex = existing.find(g => g.student_national_id === sid);
      if (ex) {
        const { error } = await supabase.from("grades")
          .update({ marks_obtained: val, max_marks: maxMarks }).eq("id", ex.id);
        if (!error) saved++; else errors++;
      } else {
        const { error } = await supabase.from("grades").insert({
          student_national_id: sid, subject_id: selSubject,
          marks_obtained: val, max_marks: maxMarks,
          term, exam_type: examType, teacher_id: user!.id,
        });
        if (!error) saved++; else errors++;
      }
    }
    setMsg(`✅ تم حفظ ${saved} درجة${errors > 0 ? ` — ${errors} خطأ` : ""}`);
    await loadGrades();
    setSaving(false);
    setTimeout(() => setMsg(""), 4000);
  }

  const myClasses = [...new Map(assignments.map(a => [a.class_id, a.classes])).values()];
  const mySubjects = assignments.filter(a => a.class_id === selClass).map(a => a.subjects);
  const filtered = students.filter(s => !search || s.full_name?.includes(search));

  // Chart data
  const chartData = filtered.map(s => {
    const v = marksMap[s.national_id];
    const val = v !== "" && v !== undefined ? parseFloat(v) : null;
    const pct = val !== null && !isNaN(val) ? Math.round((val / maxMarks) * 100) : null;
    return { name: s.full_name?.split(" ")[0], pct, val, color: pct !== null ? GC(pct) : "#1e293b" };
  }).filter(d => d.pct !== null);

  const distData = [
    { name: "ممتاز", value: chartData.filter(d => d.pct! >= 90).length, color: "#10d9a0" },
    { name: "جيد جداً", value: chartData.filter(d => d.pct! >= 80 && d.pct! < 90).length, color: GOLD },
    { name: "جيد", value: chartData.filter(d => d.pct! >= 70 && d.pct! < 80).length, color: "#3b9eff" },
    { name: "مقبول", value: chartData.filter(d => d.pct! >= 60 && d.pct! < 70).length, color: "#ffb703" },
    { name: "ضعيف", value: chartData.filter(d => d.pct! < 60).length, color: "#ff4d6d" },
  ].filter(d => d.value > 0);

  const avg = chartData.length ? Math.round(chartData.reduce((a, d) => a + d.pct!, 0) / chartData.length) : null;

  if (loading) return <DashboardLayout><div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="animate-fade-up" dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h1 className="page-title">رصد الدرجات</h1>
          <p className="page-subtitle">أدخل وتتبع درجات الطلاب</p>
        </div>

        {/* Controls */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>الفصل الدراسي</label>
              <select className="input-field" style={{ fontSize: 12, padding: "0.5rem 0.75rem" }} value={selClass}
                onChange={e => { setSelClass(e.target.value); setSelSubject(""); }}>
                <option value="">اختر الفصل</option>
                {myClasses.map((c: any) => <option key={c?.id} value={c?.id}>{c?.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>المادة</label>
              <select className="input-field" style={{ fontSize: 12, padding: "0.5rem 0.75rem" }} value={selSubject}
                onChange={e => setSelSubject(e.target.value)} disabled={!selClass}>
                <option value="">اختر المادة</option>
                {mySubjects.map((s: any) => <option key={s?.id} value={s?.id}>{s?.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>الفصل الزمني</label>
              <select className="input-field" style={{ fontSize: 12, padding: "0.5rem 0.75rem" }} value={term} onChange={e => setTerm(e.target.value)}>
                {TERMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>نوع التقييم</label>
              <select className="input-field" style={{ fontSize: 12, padding: "0.5rem 0.75rem" }} value={examType} onChange={e => setExamType(e.target.value)}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>الدرجة الكاملة</label>
              <input type="number" className="input-field" style={{ fontSize: 12, padding: "0.5rem 0.75rem" }}
                value={maxMarks} onChange={e => setMaxMarks(Number(e.target.value))} min={1} max={200} />
            </div>
          </div>
        </div>

        {selClass && selSubject && (
          <>
            {/* Tabs */}
            <div className="tabs" style={{ width: "fit-content" }}>
              <button className={`tab ${tab === "entry" ? "active" : ""}`} onClick={() => setTab("entry")}>إدخال الدرجات</button>
              <button className={`tab ${tab === "view" ? "active" : ""}`} onClick={() => setTab("view")}>
                <BarChart2 size={12} style={{ display: "inline", marginLeft: 4 }} />
                الإحصائيات
              </button>
            </div>

            {tab === "entry" && (
              <>
                {/* Summary bar */}
                {avg !== null && (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ padding: "0.4rem 0.875rem", background: `${GC(avg)}12`, border: `1px solid ${GC(avg)}25`, borderRadius: 999 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: GC(avg) }}>المتوسط: {avg}%</span>
                    </div>
                    {distData.map(d => (
                      <div key={d.name} style={{ padding: "0.4rem 0.875rem", background: `${d.color}10`, border: `1px solid ${d.color}20`, borderRadius: 999 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.name}: {d.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search */}
                <div style={{ position: "relative", maxWidth: 280 }}>
                  <Search size={12} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث باسم الطالب..."
                    className="input-field" style={{ paddingRight: 30, fontSize: 12, padding: "0.5rem 0.75rem", paddingRight: 30 }} />
                </div>

                {/* Table */}
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>اسم الطالب</th>
                        <th>رقم الهوية</th>
                        <th>الدرجة (من {maxMarks})</th>
                        <th>النسبة</th>
                        <th>التقدير</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0
                        ? <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#475569" }}>لا يوجد طلاب</td></tr>
                        : filtered.map((s, i) => {
                          const val = marksMap[s.national_id] ?? "";
                          const pct = val !== "" ? Math.round((parseFloat(val) / maxMarks) * 100) : null;
                          const color = pct !== null ? GC(pct) : "#475569";
                          return (
                            <tr key={s.national_id}>
                              <td style={{ color: "#475569", fontSize: 11 }}>{i + 1}</td>
                              <td style={{ fontWeight: 700, color: "#f0f4ff", fontSize: 13 }}>{s.full_name}</td>
                              <td style={{ fontFamily: "monospace", fontSize: 11, color: "#475569" }}>{s.national_id}</td>
                              <td>
                                <input
                                  type="number" value={val}
                                  onChange={e => setMarksMap(p => ({ ...p, [s.national_id]: e.target.value }))}
                                  min={0} max={maxMarks} placeholder="—"
                                  style={{
                                    width: 80, padding: "0.3rem 0.5rem",
                                    background: "rgba(255,255,255,0.05)",
                                    border: `1px solid ${val ? `${color}50` : "rgba(255,255,255,0.1)"}`,
                                    borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#f0f4ff",
                                    outline: "none", fontFamily: "monospace", textAlign: "center",
                                    transition: "border-color 0.2s",
                                  }}
                                />
                              </td>
                              <td>
                                {pct !== null
                                  ? <span style={{ fontSize: 12, fontWeight: 800, color }}>{pct}%</span>
                                  : <span style={{ color: "#1e293b" }}>—</span>}
                              </td>
                              <td>
                                {pct !== null && (
                                  <span className="badge" style={{ background: `${color}15`, color }}>{GL(pct)}</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={save} disabled={saving || students.length === 0} className="btn-primary">
                    <Save size={14} />
                    {saving ? "جاري الحفظ..." : "حفظ الدرجات"}
                  </button>
                  {msg && (
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#10d9a0", padding: "0.4rem 0.875rem", background: "rgba(16,217,160,0.1)", border: "1px solid rgba(16,217,160,0.2)", borderRadius: 8 }}>
                      {msg}
                    </div>
                  )}
                </div>
              </>
            )}

            {tab === "view" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {chartData.length === 0 ? (
                  <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-sub">لا توجد درجات مدخلة بعد</div></div>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
                      <div className="card" style={{ padding: "1.25rem" }}>
                        <div className="section-title" style={{ marginBottom: 12 }}>درجات الطلاب</div>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 9 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" />
                            <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: "#0c1220", border: "1px solid rgba(212,160,23,0.3)", borderRadius: 10, fontSize: 11 }} />
                            <Bar dataKey="pct" name="%" radius={[5, 5, 0, 0]}>
                              {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="card" style={{ padding: "1.25rem" }}>
                        <div className="section-title" style={{ marginBottom: 12 }}>توزيع التقديرات</div>
                        <ResponsiveContainer width="100%" height={140}>
                          <PieChart>
                            <Pie data={distData} cx="50%" cy="50%" innerRadius={35} outerRadius={58} paddingAngle={3} dataKey="value">
                              {distData.map((d, i) => <Cell key={i} fill={d.color} strokeWidth={0} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: "#0c1220", border: "1px solid rgba(212,160,23,0.3)", borderRadius: 10, fontSize: 11 }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          {distData.map(d => (
                            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ width: 7, height: 7, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                              <span style={{ fontSize: 11, color: "#94a3b8", flex: 1 }}>{d.name}</span>
                              <span style={{ fontSize: 11, fontWeight: 800, color: d.color }}>{d.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {avg !== null && (
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {[
                          { label: "المتوسط العام", value: `${avg}%`, color: GC(avg) },
                          { label: "أعلى درجة", value: `${Math.max(...chartData.map(d => d.pct!))}%`, color: "#10d9a0" },
                          { label: "أدنى درجة", value: `${Math.min(...chartData.map(d => d.pct!))}%`, color: "#ff4d6d" },
                          { label: "عدد الطلاب", value: chartData.length, color: "#3b9eff" },
                        ].map(item => (
                          <div key={item.label} className="card" style={{ padding: "1rem 1.25rem", flex: 1, minWidth: 120 }}>
                            <div style={{ fontSize: 22, fontWeight: 900, color: item.color }}>{item.value}</div>
                            <div style={{ fontSize: 11, color: "#475569", marginTop: 4, fontWeight: 600 }}>{item.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {(!selClass || !selSubject) && (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-title">اختر الفصل والمادة</div>
            <div className="empty-state-sub">لعرض قائمة الطلاب وإدخال الدرجات</div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
