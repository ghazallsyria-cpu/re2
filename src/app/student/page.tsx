"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/hooks/useData";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const GOLD = "#c9970c";
const gc = (p: number) => p >= 90 ? "#10b981" : p >= 80 ? GOLD : p >= 70 ? "#3b82f6" : p >= 60 ? "#f59e0b" : "#ef4444";
const gl = (p: number) => p >= 90 ? "ممتاز" : p >= 80 ? "جيد جداً" : p >= 70 ? "جيد" : p >= 60 ? "مقبول" : "ضعيف";
const ChartTip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="chart-tooltip"><p className="text-xs font-black mb-1" style={{ color: GOLD }}>{label}</p>{payload.map((p: any) => <p key={p.name} className="text-xs text-white">{p.name}: <strong>{p.value}%</strong></p>)}</div>
) : null;

export default function StudentDashboard() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user?.national_id) load(); }, [user]);

  async function load() {
    const [{ data: gr }, { data: att }, { data: cls }, { data: notifs }] = await Promise.all([
      supabase.from("grades").select("*, subjects(name)").eq("student_national_id", user!.national_id),
      supabase.from("attendance").select("*").eq("student_national_id", user!.national_id).order("date", { ascending: false }).limit(30),
      user?.class_id ? supabase.from("classes").select("*").eq("id", user!.class_id!).single() : Promise.resolve({ data: null }),
      supabase.from("notifications").select("*").or(`target_role.eq.all,target_role.eq.student${user?.class_id ? `,target_class_id.eq.${user.class_id}` : ""}`).order("created_at", { ascending: false }).limit(4),
    ]);
    setGrades(gr || []);
    setAttendance(att || []);
    setClassInfo(cls);
    setNotifications(notifs || []);
    setLoading(false);
  }

  const subjectAvgs = () => {
    const map: Record<string, any> = {};
    grades.forEach(g => {
      const n = g.subjects?.name || "غير محدد";
      if (!map[n]) map[n] = { subject: n, total: 0, count: 0 };
      map[n].total += (g.marks_obtained / g.max_marks) * 100; map[n].count++;
    });
    return Object.values(map).map((v: any) => ({ subject: v.subject, avg: Math.round(v.total / v.count) }));
  };

  const overall = grades.length ? Math.round(grades.reduce((a, g) => a + (g.marks_obtained / g.max_marks) * 100, 0) / grades.length) : null;
  const presentDays = attendance.filter(a => a.status === "حاضر" || a.status === "متأخر").length;
  const attendPct = attendance.length ? Math.round((presentDays / attendance.length) * 100) : null;
  const subAvgs = subjectAvgs();
  const recent5Grades = [...grades].reverse().slice(0, 5);
  const NTYPES: Record<string, string> = { exam: "📝", homework: "📋", announcement: "📢", grade: "🏆", general: "💬", attendance: "✅" };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up" dir="rtl">
        {/* Welcome */}
        <div className="card p-6" style={{ background: "linear-gradient(135deg, #080c14 0%, #0f1a2e 100%)", border: "1px solid rgba(201,151,12,0.2)" }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm" style={{ color: "#94a3b8" }}>أهلاً بك،</p>
              <h1 className="text-2xl font-black text-white mt-1">{user?.full_name?.split(" ").slice(0, 2).join(" ")}</h1>
              <p className="text-sm mt-1" style={{ color: "#c9970c" }}>{classInfo ? `${classInfo.name} — ${classInfo.grade} ${classInfo.track !== "عام" ? classInfo.track : ""}` : "لم يتم تعيين فصل"}</p>
            </div>
            {overall !== null && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center" style={{ background: gc(overall) + "20", border: `2px solid ${gc(overall)}40` }}>
                  <div className="text-2xl font-black" style={{ color: gc(overall) }}>{overall}%</div>
                  <div className="text-xs mt-0.5" style={{ color: gc(overall) }}>{gl(overall)}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "المعدل العام", value: overall !== null ? overall + "%" : "—", color: overall !== null ? gc(overall) : "#aaa", sub: overall !== null ? gl(overall) : "لا توجد درجات" },
            { label: "نسبة الحضور", value: attendPct !== null ? attendPct + "%" : "—", color: attendPct !== null ? (attendPct >= 80 ? "#10b981" : "#ef4444") : "#aaa", sub: `${attendance.length} يوم مسجّل` },
            { label: "المواد", value: subAvgs.length || "—", color: GOLD, sub: "مادة مُقيَّمة" },
            { label: "التقييمات", value: grades.length || "—", color: "#3b82f6", sub: "اختبار وواجب" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="text-2xl font-black" style={{ color: "var(--text-1)" }}>{s.value}</div>
              <div className="text-xs mt-1 font-semibold" style={{ color: s.color }}>{s.label}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar */}
          {subAvgs.length > 0 && (
            <div className="card p-6">
              <div className="section-header">
                <div><div className="section-title">أداؤك بالمواد</div><div className="section-sub">متوسط درجاتك</div></div>
                <Link href="/student/grades" className="text-xs font-bold flex items-center gap-1" style={{ color: GOLD }}>التفاصيل <ChevronLeft size={13} /></Link>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={subAvgs}>
                  <PolarGrid stroke="hsl(var(--border))" /><PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-2)", fontSize: 11 }} />
                  <Radar dataKey="avg" stroke={GOLD} fill={GOLD} fillOpacity={0.2} name="متوسطك %" />
                  <Tooltip content={<ChartTip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent grades */}
          <div className="card p-6">
            <div className="section-header">
              <div><div className="section-title">آخر الدرجات</div></div>
              <Link href="/student/grades" className="text-xs font-bold flex items-center gap-1" style={{ color: GOLD }}>الكل <ChevronLeft size={13} /></Link>
            </div>
            {recent5Grades.length === 0 ? (
              <div className="empty-state py-8"><div className="empty-state-icon" style={{ fontSize: "32px" }}>📊</div><div className="empty-state-sub">لا توجد درجات بعد</div></div>
            ) : (
              <div className="space-y-3">
                {recent5Grades.map(g => {
                  const pct = Math.round((g.marks_obtained / g.max_marks) * 100);
                  return (
                    <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid hsl(var(--border))" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: gc(pct) + "15", color: gc(pct) }}>{pct}%</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate" style={{ color: "var(--text-1)" }}>{g.subjects?.name}</div>
                        <div className="text-xs" style={{ color: "var(--text-3)" }}>{g.exam_type} — {g.term}</div>
                      </div>
                      <span className="badge" style={{ background: gc(pct) + "15", color: gc(pct) }}>{gl(pct)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="card p-6">
            <div className="section-header">
              <div><div className="section-title">آخر الإشعارات</div></div>
              <Link href="/student/notifications" className="text-xs font-bold flex items-center gap-1" style={{ color: GOLD }}>الكل <ChevronLeft size={13} /></Link>
            </div>
            <div className="space-y-2">
              {notifications.map(n => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
                  <span className="text-xl">{NTYPES[n.type] || "💬"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate" style={{ color: "var(--text-1)" }}>{n.title}</div>
                    <div className="text-xs truncate mt-0.5" style={{ color: "var(--text-3)" }}>{n.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance dots */}
        {attendance.length > 0 && (
          <div className="card p-6">
            <div className="section-header">
              <div><div className="section-title">سجل الحضور الأخير</div><div className="section-sub">آخر 30 يوم</div></div>
              <Link href="/student/attendance" className="text-xs font-bold flex items-center gap-1" style={{ color: GOLD }}>التفاصيل <ChevronLeft size={13} /></Link>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[...attendance].reverse().slice(0, 30).map(a => {
                const c = { حاضر: "#10b981", غائب: "#ef4444", متأخر: "#f59e0b", مستأذن: "#3b82f6" }[a.status] || "#aaa";
                return <div key={a.id} title={`${a.date} — ${a.status}`} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c + "15", border: `1px solid ${c}25` }}><span className="text-xs font-black" style={{ color: c }}>{a.status === "حاضر" ? "✓" : a.status === "غائب" ? "✗" : "~"}</span></div>;
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
