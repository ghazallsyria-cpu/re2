"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Users, BookOpen, Award, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
  AreaChart, Area,
} from "recharts";

const GOLD = "#d4a017";
const COLORS = ["#10d9a0", GOLD, "#3b9eff", "#a78bfa", "#fb923c", "#f472b6"];

const ChartTip = ({ active, payload, label }: any) =>
  active && payload?.length ? (
    <div className="chart-tooltip">
      {label && <p style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: 12, color: p.color || p.fill || GOLD, fontWeight: 700 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  ) : null;

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [gradesCount, setGradesCount] = useState(0);
  const [classAvgs, setClassAvgs] = useState<any[]>([]);
  const [gradeDist, setGradeDist] = useState<any[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) load();
  }, [user]);

  async function load() {
    // teacher_class_subjects uses teacher_id (UUID)
    const { data: asgns } = await supabase
      .from("teacher_class_subjects")
      .select("*, classes(id,name,section,grade), subjects(id,name)")
      .eq("teacher_id", user!.id);

    setAssignments(asgns || []);
    const classIds = [...new Set((asgns || []).map((a: any) => a.class_id))];

    if (classIds.length > 0) {
      // Student count
      const { count } = await supabase.from("users").select("*", { count: "exact", head: true })
        .in("class_id", classIds).eq("role", "student");
      setStudentsCount(count || 0);

      // Grades count
      const { count: gc } = await supabase.from("grades").select("*", { count: "exact", head: true })
        .eq("teacher_id", user!.id);
      setGradesCount(gc || 0);

      // Per-class averages for BarChart
      const avgs: any[] = [];
      for (const cid of classIds) {
        const cls = (asgns || []).find((a: any) => a.class_id === cid)?.classes;
        const { data: sts } = await supabase.from("users").select("national_id")
          .eq("class_id", cid).eq("role", "student");
        const ids = (sts || []).map((s: any) => s.national_id);
        if (ids.length) {
          const { data: gr } = await supabase.from("grades").select("marks_obtained,max_marks")
            .in("student_national_id", ids).eq("teacher_id", user!.id);
          if (gr && gr.length) {
            const avg = Math.round(gr.reduce((a: number, g: any) => a + (g.marks_obtained / g.max_marks) * 100, 0) / gr.length);
            avgs.push({ name: cls?.name?.replace("الثاني عشر", "١٢").replace("الحادي عشر", "١١").replace("العاشر", "١٠") || cid, avg });
          }
        }
      }
      setClassAvgs(avgs);

      // Grade distribution PieChart
      const { data: allGrades } = await supabase.from("grades").select("marks_obtained,max_marks")
        .eq("teacher_id", user!.id).limit(500);
      const b: Record<string, number> = { "ممتاز": 0, "جيد جداً": 0, "جيد": 0, "مقبول": 0, "ضعيف": 0 };
      (allGrades || []).forEach((g: any) => {
        const p = (g.marks_obtained / g.max_marks) * 100;
        if (p >= 90) b["ممتاز"]++; else if (p >= 80) b["جيد جداً"]++;
        else if (p >= 70) b["جيد"]++; else if (p >= 60) b["مقبول"]++; else b["ضعيف"]++;
      });
      setGradeDist(Object.entries(b).map(([name, value]) => ({ name, value })));

      // Attendance summary (last 7 days)
      const { data: attData } = await supabase.from("attendance").select("date,status")
        .in("class_id", classIds).order("date", { ascending: false }).limit(200);
      const byDate: Record<string, Record<string, number>> = {};
      (attData || []).forEach((a: any) => {
        if (!byDate[a.date]) byDate[a.date] = { حاضر: 0, غائب: 0, متأخر: 0 };
        byDate[a.date][a.status] = (byDate[a.date][a.status] || 0) + 1;
      });
      const trend = Object.entries(byDate).slice(0, 7)
        .map(([date, v]) => ({ date: date.slice(5), ...v })).reverse();
      setAttendanceSummary(trend);
    }
    setLoading(false);
  }

  const myClasses = [...new Map(assignments.map(a => [a.class_id, a.classes])).values()];

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div className="spinner" />
      </div>
    </DashboardLayout>
  );

  const stats = [
    { label: "فصولي", value: myClasses.length, icon: BookOpen, color: GOLD },
    { label: "طلابي", value: studentsCount, icon: Users, color: "#3b9eff" },
    { label: "درجات مرصودة", value: gradesCount, icon: Award, color: "#10d9a0" },
    { label: "المواد", value: [...new Set(assignments.map((a: any) => a.subject_id))].length, icon: ClipboardCheck, color: "#a78bfa" },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-up" dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Welcome hero */}
        <div style={{ padding: "1.25rem 1.75rem", background: "linear-gradient(135deg,#0c1220,#111827)", border: "1px solid rgba(212,160,23,0.2)", borderRadius: 20, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, left: -30, width: 180, height: 180, background: "radial-gradient(circle,rgba(212,160,23,0.07),transparent)", pointerEvents: "none" }} />
          <p style={{ fontSize: 11, color: "#475569", fontWeight: 700, marginBottom: 4 }}>لوحة المعلم — 2026</p>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#f0f4ff" }}>
            أهلاً، {user?.full_name?.split(" ").slice(0, 2).join(" ")} 👋
          </h1>
          <p style={{ fontSize: 12, color: GOLD, marginTop: 4 }}>العام الدراسي 2025/2026</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`, border: `1px solid ${s.color}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <s.icon size={16} color={s.color} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#f0f4ff" }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.color, marginTop: 3 }}>{s.label}</div>
              <div style={{ marginTop: 8, height: 1, background: `linear-gradient(90deg,transparent,${s.color}40,transparent)` }} />
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>

          {/* Area: attendance trend */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <div className="section-header">
              <div>
                <div className="section-title">سجل الحضور — آخر الأيام</div>
                <div className="section-sub">حضور وغياب طلابك</div>
              </div>
              <Link href="/teacher/attendance" style={{ fontSize: 11, color: GOLD, textDecoration: "none", fontWeight: 700 }}>تسجيل ←</Link>
            </div>
            {attendanceSummary.length === 0 ? (
              <div className="empty-state" style={{ padding: "2rem" }}>
                <div className="empty-state-icon">📅</div>
                <div className="empty-state-sub">لا يوجد سجل حضور بعد</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={attendanceSummary} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10d9a0" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10d9a0" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="حاضر" stroke="#10d9a0" fill="url(#gPresent)" strokeWidth={2} dot={false} name="حاضر" />
                  <Area type="monotone" dataKey="غائب" stroke="#ff4d6d" fill="url(#gAbsent)" strokeWidth={2} dot={false} name="غائب" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie: grade distribution */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <div className="section-header">
              <div>
                <div className="section-title">توزيع التقديرات</div>
                <div className="section-sub">نسب درجاتك</div>
              </div>
            </div>
            {gradeDist.every(d => d.value === 0) ? (
              <div className="empty-state" style={{ padding: "1.5rem" }}>
                <div className="empty-state-icon">📊</div>
                <div className="empty-state-sub">لا توجد درجات بعد</div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={gradeDist} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value">
                      {gradeDist.map((_, i) => <Cell key={i} fill={COLORS[i]} strokeWidth={0} />)}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {gradeDist.filter(d => d.value > 0).map((d, i) => (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS[i], flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "#94a3b8", flex: 1 }}>{d.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: COLORS[i] }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bar: class averages */}
        {classAvgs.length > 0 && (
          <div className="card" style={{ padding: "1.25rem" }}>
            <div className="section-header">
              <div>
                <div className="section-title">متوسط الدرجات بكل فصل</div>
                <div className="section-sub">مقارنة أداء الفصول</div>
              </div>
              <Link href="/teacher/grades" style={{ fontSize: 11, color: GOLD, textDecoration: "none", fontWeight: 700 }}>رصد الدرجات ←</Link>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={classAvgs} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="avg" name="المتوسط %" radius={[6, 6, 0, 0]}>
                  {classAvgs.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* My classes */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div className="section-header">
            <div>
              <div className="section-title">فصولي الدراسية</div>
              <div className="section-sub">{myClasses.length} فصل مُسند</div>
            </div>
            <Link href="/teacher/classes" style={{ fontSize: 11, color: GOLD, textDecoration: "none", fontWeight: 700 }}>عرض الكل ←</Link>
          </div>
          {myClasses.length === 0 ? (
            <div className="empty-state" style={{ padding: "2rem" }}>
              <div className="empty-state-icon">🏫</div>
              <div className="empty-state-title">لم يتم إسناد فصول بعد</div>
              <div className="empty-state-sub">يقوم المدير بإسناد الفصول والمواد من لوحته</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
              {myClasses.map((cls: any, i) => {
                const subs = assignments.filter(a => a.class_id === cls?.id);
                return (
                  <div key={cls?.id} style={{ padding: "0.875rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${COLORS[i % COLORS.length]}18`, border: `1px solid ${COLORS[i % COLORS.length]}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: COLORS[i % COLORS.length] }}>
                        {cls?.section}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#f0f4ff" }}>{cls?.name}</div>
                        <div style={{ fontSize: 10, color: "#475569" }}>{cls?.grade}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {subs.map((a: any) => (
                        <span key={a.id} style={{ fontSize: 10, padding: "2px 7px", background: `${COLORS[i % COLORS.length]}12`, border: `1px solid ${COLORS[i % COLORS.length]}20`, borderRadius: 999, color: COLORS[i % COLORS.length] }}>
                          {a.subjects?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
          {[
            { href: "/teacher/grades", icon: "📊", label: "رصد الدرجات", color: "#10d9a0" },
            { href: "/teacher/attendance", icon: "✅", label: "تسجيل الحضور", color: "#3b9eff" },
            { href: "/teacher/homework", icon: "📋", label: "الواجبات", color: "#fb923c" },
            { href: "/teacher/lessons/create", icon: "📖", label: "الدروس", color: "#a78bfa" },
            { href: "/teacher/exams/create", icon: "📝", label: "الاختبارات", color: "#f472b6" },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div className="card" style={{ padding: "1rem", cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#f0f4ff" }}>{item.label}</div>
                <div style={{ marginTop: 8, height: 2, background: `linear-gradient(90deg,transparent,${item.color},transparent)`, opacity: 0.5 }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
