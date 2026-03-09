"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Save } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";

const GOLD = "#d4a017";
const STATUSES = ["حاضر", "غائب", "متأخر", "مستأذن"];
const SC: Record<string, string> = { حاضر: "#10d9a0", غائب: "#ff4d6d", متأخر: "#ffb703", مستأذن: "#3b9eff" };

export default function TeacherAttendance() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selClass, setSelClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<any[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"register" | "history" | "stats">("register");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => { if (user?.id) loadAssignments(); }, [user]);
  useEffect(() => { if (selClass) { loadStudents(); } }, [selClass, date]);
  useEffect(() => { if (tab === "history" && selClass) loadHistory(); }, [tab, selClass]);

  async function loadAssignments() {
    const { data } = await supabase.from("teacher_class_subjects")
      .select("*, classes(id,name)").eq("teacher_id", user!.id);
    setAssignments(data || []);
    setLoading(false);
  }

  async function loadStudents() {
    const { data: sts } = await supabase.from("users")
      .select("national_id,full_name").eq("class_id", selClass).eq("role", "student").order("full_name");
    setStudents(sts || []);
    const init: Record<string, string> = {};
    (sts || []).forEach((s: any) => init[s.national_id] = "حاضر");
    const ids = (sts || []).map((s: any) => s.national_id);
    if (ids.length) {
      const { data: att } = await supabase.from("attendance")
        .select("student_national_id,status,notes").in("student_national_id", ids)
        .eq("date", date).eq("class_id", selClass);
      const nm: Record<string, string> = {};
      (att || []).forEach((a: any) => { init[a.student_national_id] = a.status; nm[a.student_national_id] = a.notes || ""; });
      setNotesMap(nm);
    }
    setStatusMap(init);
  }

  async function loadHistory() {
    const { data: sts } = await supabase.from("users").select("national_id").eq("class_id", selClass).eq("role", "student");
    const ids = (sts || []).map((s: any) => s.national_id);
    if (!ids.length) return;
    const { data } = await supabase.from("attendance")
      .select("*, users!student_national_id(full_name)")
      .in("student_national_id", ids).order("date", { ascending: false }).limit(150);
    setHistory(data || []);
  }

  async function save() {
    setSaving(true); setMsg("");
    let saved = 0;
    for (const [sid, status] of Object.entries(statusMap)) {
      const { data: ex } = await supabase.from("attendance").select("id")
        .eq("student_national_id", sid).eq("date", date).eq("class_id", selClass).maybeSingle();
      if (ex) {
        await supabase.from("attendance").update({ status, notes: notesMap[sid] || "" }).eq("id", ex.id);
      } else {
        await supabase.from("attendance").insert({
          student_national_id: sid, class_id: selClass, date,
          status, notes: notesMap[sid] || "", recorded_by: user!.id,
        });
      }
      saved++;
    }
    setMsg(`✅ تم حفظ حضور ${saved} طالب`);
    setSaving(false);
    setTimeout(() => setMsg(""), 4000);
  }

  const myClasses = [...new Map(assignments.map(a => [a.class_id, a.classes])).values()];
  const counts = {
    حاضر: Object.values(statusMap).filter(s => s === "حاضر").length,
    غائب: Object.values(statusMap).filter(s => s === "غائب").length,
    متأخر: Object.values(statusMap).filter(s => s === "متأخر").length,
    مستأذن: Object.values(statusMap).filter(s => s === "مستأذن").length,
  };

  // History stats
  const histByDate: Record<string, Record<string, number>> = {};
  history.forEach(a => {
    if (!histByDate[a.date]) histByDate[a.date] = {};
    histByDate[a.date][a.status] = (histByDate[a.date][a.status] || 0) + 1;
  });
  const barData = Object.entries(histByDate).slice(0, 7)
    .map(([date, v]) => ({ date: date.slice(5), ...v })).reverse();

  if (loading) return <DashboardLayout><div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="animate-fade-up" dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div><h1 className="page-title">تسجيل الحضور</h1><p className="page-subtitle">رصد حضور وغياب الطلاب</p></div>

        {/* Controls */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>الفصل الدراسي</label>
              <select className="input-field" style={{ fontSize: 12, padding: "0.5rem 0.75rem" }} value={selClass} onChange={e => setSelClass(e.target.value)}>
                <option value="">اختر الفصل</option>
                {myClasses.map((c: any) => <option key={c?.id} value={c?.id}>{c?.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5 }}>التاريخ</label>
              <input type="date" className="input-field" style={{ fontSize: 12, padding: "0.5rem 0.75rem" }} value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
        </div>

        {selClass && (
          <>
            <div className="tabs" style={{ width: "fit-content" }}>
              <button className={`tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>تسجيل</button>
              <button className={`tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>السجل</button>
              <button className={`tab ${tab === "stats" ? "active" : ""}`} onClick={() => { setTab("stats"); if (!history.length) loadHistory(); }}>الإحصائيات</button>
            </div>

            {tab === "register" && (
              <>
                {/* Summary */}
                {students.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {STATUSES.map(s => (
                      <div key={s} style={{ padding: "0.35rem 0.75rem", background: `${SC[s]}10`, border: `1px solid ${SC[s]}25`, borderRadius: 999, fontSize: 11, fontWeight: 700, color: SC[s] }}>
                        {s}: {counts[s as keyof typeof counts]}
                      </div>
                    ))}
                  </div>
                )}

                {/* Table */}
                <div className="table-container">
                  <table className="data-table">
                    <thead><tr><th>#</th><th>اسم الطالب</th><th>الحالة</th><th>ملاحظة</th></tr></thead>
                    <tbody>
                      {students.length === 0
                        ? <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "#475569" }}>لا يوجد طلاب</td></tr>
                        : students.map((s, i) => {
                          const status = statusMap[s.national_id] || "حاضر";
                          return (
                            <tr key={s.national_id}>
                              <td style={{ color: "#475569", fontSize: 11 }}>{i + 1}</td>
                              <td style={{ fontWeight: 700, color: "#f0f4ff", fontSize: 13 }}>{s.full_name}</td>
                              <td>
                                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                  {STATUSES.map(st => (
                                    <button key={st} onClick={() => setStatusMap(p => ({ ...p, [s.national_id]: st }))}
                                      className={`att-btn ${status === st ? `active-${st === "حاضر" ? "present" : st === "غائب" ? "absent" : st === "متأخر" ? "late" : "excuse"}` : ""}`}>
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td>
                                <input value={notesMap[s.national_id] || ""} onChange={e => setNotesMap(p => ({ ...p, [s.national_id]: e.target.value }))}
                                  placeholder="ملاحظة..." style={{ width: "100%", maxWidth: 180, padding: "0.3rem 0.6rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 11, color: "#94a3b8", outline: "none", fontFamily: "'Cairo',sans-serif" }} />
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={save} disabled={saving || students.length === 0} className="btn-primary">
                    <Save size={14} />{saving ? "جاري الحفظ..." : "حفظ الحضور"}
                  </button>
                  {msg && <span style={{ fontSize: 12, fontWeight: 700, color: "#10d9a0" }}>{msg}</span>}
                </div>
              </>
            )}

            {tab === "history" && (
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>التاريخ</th><th>الطالب</th><th>الحالة</th><th>ملاحظة</th></tr></thead>
                  <tbody>
                    {history.length === 0
                      ? <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "#475569" }}>لا يوجد سجل</td></tr>
                      : history.map(a => (
                        <tr key={a.id}>
                          <td style={{ fontFamily: "monospace", fontSize: 12, color: "#94a3b8" }}>{a.date}</td>
                          <td style={{ fontWeight: 700, color: "#f0f4ff", fontSize: 13 }}>{(a as any).users?.full_name || a.student_national_id}</td>
                          <td><span className="badge" style={{ background: `${SC[a.status] || GOLD}15`, color: SC[a.status] || GOLD }}>{a.status}</span></td>
                          <td style={{ fontSize: 12, color: "#475569" }}>{a.notes || "—"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "stats" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
                  <div className="card" style={{ padding: "1.25rem" }}>
                    <div className="section-title" style={{ marginBottom: 12 }}>الحضور اليومي — آخر الأيام</div>
                    {barData.length === 0
                      ? <div className="empty-state" style={{ padding: "2rem" }}><div className="empty-state-icon">📅</div><div className="empty-state-sub">لا يوجد بيانات</div></div>
                      : <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: "#0c1220", border: "1px solid rgba(212,160,23,0.3)", borderRadius: 10, fontSize: 11 }} />
                          <Bar dataKey="حاضر" fill="#10d9a0" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="غائب" fill="#ff4d6d" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="متأخر" fill="#ffb703" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    }
                  </div>
                  <div className="card" style={{ padding: "1.25rem" }}>
                    <div className="section-title" style={{ marginBottom: 12 }}>نسبة الحضور</div>
                    {history.length === 0
                      ? <div className="empty-state" style={{ padding: "2rem" }}><div className="empty-state-icon">🥧</div><div className="empty-state-sub">لا يوجد بيانات</div></div>
                      : (() => {
                        const tot: Record<string, number> = {};
                        history.forEach(a => { tot[a.status] = (tot[a.status] || 0) + 1; });
                        const pd = Object.entries(tot).map(([name, value]) => ({ name, value }));
                        return (
                          <>
                            <ResponsiveContainer width="100%" height={140}>
                              <PieChart>
                                <Pie data={pd} cx="50%" cy="50%" outerRadius={55} paddingAngle={3} dataKey="value">
                                  {pd.map((d: any) => <Cell key={d.name} fill={SC[d.name] || GOLD} strokeWidth={0} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: "#0c1220", border: "1px solid rgba(212,160,23,0.3)", borderRadius: 10, fontSize: 11 }} />
                              </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              {pd.map((d: any) => (
                                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: SC[d.name] || GOLD, flexShrink: 0 }} />
                                  <span style={{ fontSize: 11, color: "#94a3b8", flex: 1 }}>{d.name}</span>
                                  <span style={{ fontSize: 11, fontWeight: 800, color: SC[d.name] || GOLD }}>{d.value}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })()
                    }
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!selClass && (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">اختر الفصل الدراسي</div>
            <div className="empty-state-sub">لعرض قائمة الطلاب وتسجيل الحضور</div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
