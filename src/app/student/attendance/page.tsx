"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/hooks/useData";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

const GOLD = "#c9970c";
const SC: Record<string, string> = { حاضر: "#10b981", غائب: "#ef4444", متأخر: "#f59e0b", مستأذن: "#3b82f6" };

const ChartTip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="chart-tooltip"><p className="text-xs font-black mb-1" style={{ color: GOLD }}>{label}</p>{payload.map((p: any) => <p key={p.name} className="text-xs text-white">{p.name}: <strong>{p.value}</strong></p>)}</div>
) : null;

export default function StudentAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"all" | "month" | "term">("all");

  useEffect(() => { if (user?.national_id) load(); }, [user]);

  async function load() {
    const { data } = await supabase.from("attendance").select("*").eq("student_national_id", user!.national_id).order("date");
    setAttendance(data || []);
    setLoading(false);
  }

  const filtered = attendance.filter(a => {
    if (period === "all") return true;
    const d = new Date(a.date);
    const now = new Date();
    if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === "term") {
      const month = d.getMonth();
      const termMonths = month >= 8 ? [8, 9, 10, 11] : month >= 1 && month <= 4 ? [1, 2, 3, 4] : [5, 6, 7];
      return termMonths.includes(month);
    }
    return true;
  });

  const present = filtered.filter(a => a.status === "حاضر").length;
  const absent = filtered.filter(a => a.status === "غائب").length;
  const late = filtered.filter(a => a.status === "متأخر").length;
  const excused = filtered.filter(a => a.status === "مستأذن").length;
  const total = filtered.length;
  const presentPct = total ? Math.round(((present + late) / total) * 100) : 0;

  // Monthly breakdown
  const monthly = () => {
    const map: Record<string, any> = {};
    filtered.forEach(a => {
      const m = a.date?.slice(0, 7) || "";
      if (!map[m]) map[m] = { month: m, حاضر: 0, غائب: 0, متأخر: 0 };
      map[m][a.status] = (map[m][a.status] || 0) + 1;
    });
    return Object.values(map).sort((a: any, b: any) => a.month.localeCompare(b.month));
  };

  // Weekly calendar view (last 5 weeks)
  const calendarDays = () => {
    const map: Record<string, string> = {};
    filtered.forEach(a => { map[a.date] = a.status; });
    return map;
  };

  const pieData = [
    { name: "حاضر", value: present, color: "#10b981" },
    { name: "غائب", value: absent, color: "#ef4444" },
    { name: "متأخر", value: late, color: "#f59e0b" },
    { name: "مستأذن", value: excused, color: "#3b82f6" },
  ].filter(d => d.value > 0);

  const monthlyData = monthly();
  const calData = calendarDays();
  const recentDays = [...filtered].reverse().slice(0, 30);

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="spinner" /></div></DashboardLayout>;
  if (attendance.length === 0) return (
    <DashboardLayout>
      <div className="card animate-fade-up">
        <div className="empty-state"><div className="empty-state-icon">📅</div><div className="empty-state-title">لا يوجد سجل حضور بعد</div><div className="empty-state-sub">سيظهر حضورك هنا بعد تسجيله من المعلم</div></div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--text-1)" }}>سجل حضوري</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>{total} يوم مسجّل</p>
          </div>
          <div className="tabs">
            {[{ v: "all", l: "الكل" }, { v: "month", l: "هذا الشهر" }, { v: "term", l: "هذا الفصل" }].map(p => (
              <button key={p.v} onClick={() => setPeriod(p.v as any)} className={`tab ${period === p.v ? "active" : ""}`}>{p.l}</button>
            ))}
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "نسبة الحضور", value: presentPct + "%", color: presentPct >= 85 ? "#10b981" : presentPct >= 70 ? "#f59e0b" : "#ef4444", icon: "📊" },
            { label: "حاضر", value: present, color: "#10b981", icon: "✅" },
            { label: "غائب", value: absent, color: "#ef4444", icon: "❌" },
            { label: "متأخر", value: late, color: "#f59e0b", icon: "⏰" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-black" style={{ color: "var(--text-1)" }}>{s.value}</div>
              <div className="text-xs mt-1 font-semibold" style={{ color: s.color }}>{s.label}</div>
              {typeof s.value === "number" && total > 0 && (
                <div className="progress-bar mt-3">
                  <div className="progress-fill" style={{ width: Math.round((s.value / total) * 100) + "%", background: s.color }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 lg:col-span-2">
            <div className="section-title mb-4">الحضور الشهري</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fill: "var(--text-3)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--text-3)", fontSize: 11 }} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="حاضر" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="متأخر" stackId="a" fill="#f59e0b" />
                <Bar dataKey="غائب" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-6">
            <div className="section-title mb-4">التوزيع العام</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<ChartTip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs flex-1" style={{ color: "var(--text-2)" }}>{d.name}</span>
                  <span className="text-xs font-black" style={{ color: d.color }}>{total ? Math.round((d.value / total) * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar dots */}
        <div className="card p-6">
          <div className="section-title mb-4">السجل التفصيلي — آخر 30 يوم</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {recentDays.map(a => {
              const c = SC[a.status] || "#aaa";
              const d = new Date(a.date);
              return (
                <div key={a.id} title={`${a.date} — ${a.status}`}
                  className="w-10 h-10 rounded-xl flex flex-col items-center justify-center cursor-default text-center"
                  style={{ background: c + "15", border: `1px solid ${c}30` }}>
                  <span className="text-xs font-black" style={{ color: c }}>{d.getDate()}</span>
                  <span className="text-xs" style={{ color: c, fontSize: "9px" }}>{a.status === "حاضر" ? "✓" : a.status === "غائب" ? "✗" : a.status === "متأخر" ? "~" : "◎"}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 text-xs" style={{ color: "var(--text-3)" }}>
            {Object.entries(SC).map(([s, c]) => <span key={s}><span style={{ color: c }}>■</span> {s}</span>)}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b" style={{ borderColor: "hsl(var(--border))" }}>
            <div className="section-title">السجل الكامل ({filtered.length} يوم)</div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>التاريخ</th><th>اليوم</th><th>الحالة</th><th>ملاحظات</th></tr></thead>
              <tbody>
                {[...filtered].reverse().map(a => {
                  const c = SC[a.status] || "#aaa";
                  const day = new Date(a.date).toLocaleDateString("ar-SA", { weekday: "long" });
                  return (
                    <tr key={a.id}>
                      <td className="font-bold" style={{ fontFamily: "monospace", color: "var(--text-1)" }}>{a.date}</td>
                      <td style={{ color: "var(--text-3)" }}>{day}</td>
                      <td><span className="badge" style={{ background: c + "15", color: c }}>{a.status}</span></td>
                      <td style={{ color: "var(--text-3)" }}>{a.notes || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
