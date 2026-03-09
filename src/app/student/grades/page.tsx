"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/hooks/useData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Award, TrendingUp } from "lucide-react";
const GOLD = "#c9970c";
const TERMS = ["الفصل الأول", "الفصل الثاني", "الفصل الثالث"];
export default function StudentGrades() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (user?.national_id) load(); }, [user]);
  async function load() {
    const { data } = await supabase.from("grades").select("*, subjects(name)").eq("student_national_id", user!.national_id).order("term").order("created_at");
    setGrades(data || []);
    setLoading(false);
  }
  const filtered = selectedTerm === "all" ? grades : grades.filter(g => g.term === selectedTerm);
  const subjectAvgs = () => {
    const map: Record<string, any> = {};
    filtered.forEach(g => {
      const n = g.subjects?.name || "غير محدد";
      if (!map[n]) map[n] = { subject: n, total: 0, count: 0 };
      map[n].total += (g.marks_obtained / g.max_marks) * 100; map[n].count++;
    });
    return Object.values(map).map((v: any) => ({ subject: v.subject, avg: Math.round(v.total / v.count) })).sort((a: any, b: any) => b.avg - a.avg);
  };
  const overall = filtered.length ? Math.round(filtered.reduce((a, g) => a + (g.marks_obtained / g.max_marks) * 100, 0) / filtered.length) : null;
  const subAvgs = subjectAvgs();
  const gc = (pct: number) => pct >= 90 ? "#16a34a" : pct >= 80 ? GOLD : pct >= 70 ? "#3b82f6" : pct >= 60 ? "#f59e0b" : "#ef4444";
  const gl = (pct: number) => pct >= 90 ? "ممتاز" : pct >= 80 ? "جيد جداً" : pct >= 70 ? "جيد" : pct >= 60 ? "مقبول" : "ضعيف";
  const Tip = ({ active, payload, label }: any) => active && payload?.length ? <div className="rounded-xl p-3 text-sm" style={{ background: "#0a0a0a", border: "1px solid rgba(184,134,11,0.3)", color: "#fff" }}><p style={{ color: GOLD }}>{label}</p>{payload.map((p: any) => <p key={p.name}>{p.name}: <strong>{p.value}%</strong></p>)}</div> : null;
  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: GOLD, borderTopColor: "transparent" }} /></div></DashboardLayout>;
  if (grades.length === 0) return <DashboardLayout><div className="text-center py-24" dir="rtl"><div className="text-5xl mb-4">📊</div><h2 className="text-xl font-black mb-2">لا توجد درجات بعد</h2><p style={{ color: "#888" }}>ستظهر درجاتك هنا بعد تسجيلها من قبل المعلم</p></div></DashboardLayout>;
  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div><h1 className="text-2xl font-black" style={{ color: "#0a0a0a" }}>درجاتي</h1><p className="text-sm mt-1" style={{ color: "#888" }}>سجل كامل بتقييماتك الأكاديمية</p></div>
          <select className="input-field text-sm" value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} style={{ width: "auto" }}>
            <option value="all">جميع الفصول</option>
            {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "المعدل العام", value: overall !== null ? overall + "%" : "—", color: overall !== null ? gc(overall) : "#aaa" },
            { label: "عدد التقييمات", value: filtered.length, color: "#3b82f6" },
            { label: "التقدير", value: overall !== null ? gl(overall) : "—", color: GOLD },
            { label: "أعلى درجة", value: filtered.length ? Math.max(...filtered.map(g => Math.round((g.marks_obtained / g.max_marks) * 100))) + "%" : "—", color: "#16a34a" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #e8e8e8" }}>
              <div className="text-2xl font-black" style={{ color: "#0a0a0a" }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: "#888" }}>{s.label}</div>
              <div className="w-full h-1 rounded-full mt-3" style={{ background: s.color + "20" }}><div className="h-full rounded-full" style={{ width: "100%", background: s.color }} /></div>
            </div>
          ))}
        </div>
        {/* Chart */}
        {subAvgs.length > 0 && (
          <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e8e8e8" }}>
            <h3 className="font-black mb-4" style={{ color: "#0a0a0a" }}>متوسط درجاتك بالمادة</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subAvgs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="subject" tick={{ fill: "#888", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#888", fontSize: 11 }} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="avg" fill={GOLD} radius={[6, 6, 0, 0]} name="متوسطك %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {/* Detailed table by subject */}
        {subAvgs.map(sub => {
          const subGrades = filtered.filter(g => g.subjects?.name === sub.subject);
          return (
            <div key={sub.subject} className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e8e8e8" }}>
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "#f0f0f0" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: gc(sub.avg) + "15", color: gc(sub.avg) }}>{sub.avg}%</div>
                  <div>
                    <div className="font-black text-sm" style={{ color: "#0a0a0a" }}>{sub.subject}</div>
                    <div className="text-xs" style={{ color: "#aaa" }}>{subGrades.length} تقييم</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: gc(sub.avg) + "15", color: gc(sub.avg) }}>{gl(sub.avg)}</span>
              </div>
              <table className="w-full">
                <thead><tr style={{ background: "#fafafa" }}>{["نوع التقييم", "الفصل", "الدرجة", "من", "النسبة", "التقدير"].map(h => <th key={h} className="px-4 py-2.5 text-right text-xs font-black" style={{ color: "#aaa" }}>{h}</th>)}</tr></thead>
                <tbody>
                  {subGrades.map(g => {
                    const pct = Math.round((g.marks_obtained / g.max_marks) * 100);
                    return (
                      <tr key={g.id} style={{ borderTop: "1px solid #f5f5f5" }}>
                        <td className="px-4 py-2.5 text-sm font-semibold" style={{ color: "#333" }}>{g.exam_type}</td>
                        <td className="px-4 py-2.5 text-xs" style={{ color: "#888" }}>{g.term}</td>
                        <td className="px-4 py-2.5 text-sm font-black" style={{ color: gc(pct) }}>{g.marks_obtained}</td>
                        <td className="px-4 py-2.5 text-sm" style={{ color: "#aaa" }}>{g.max_marks}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 rounded-full" style={{ background: "#f0f0f0" }}><div className="h-full rounded-full" style={{ width: pct + "%", background: gc(pct) }} /></div>
                            <span className="text-xs font-bold" style={{ color: gc(pct) }}>{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: gc(pct) + "15", color: gc(pct) }}>{gl(pct)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
