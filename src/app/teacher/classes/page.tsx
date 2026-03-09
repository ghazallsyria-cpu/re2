"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { ChevronDown, ChevronUp, Users, Search } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const GOLD = "#d4a017";
const COLORS = ["#10d9a0", GOLD, "#3b9eff", "#a78bfa", "#fb923c", "#f472b6"];

export default function TeacherClasses() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [students, setStudents] = useState<Record<string, any[]>>({});
  const [search, setSearch] = useState<Record<string, string>>({});
  const [attendStats, setAttendStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user?.id) load(); }, [user]);

  async function load() {
    const { data } = await supabase
      .from("teacher_class_subjects")
      .select("*, classes(id,name,section,grade), subjects(id,name)")
      .eq("teacher_id", user!.id);
    setAssignments(data || []);
    setLoading(false);
  }

  async function toggle(classId: string) {
    if (expanded === classId) { setExpanded(null); return; }
    setExpanded(classId);
    if (!students[classId]) {
      const { data } = await supabase
        .from("users").select("national_id,full_name")
        .eq("class_id", classId).eq("role", "student").order("full_name");
      setStudents(p => ({ ...p, [classId]: data || [] }));

      // Attendance stats for pie
      const ids = (data || []).map((s: any) => s.national_id);
      if (ids.length) {
        const { data: att } = await supabase.from("attendance")
          .select("status").in("student_national_id", ids).eq("class_id", classId);
        const stat: Record<string, number> = { حاضر: 0, غائب: 0, متأخر: 0, مستأذن: 0 };
        (att || []).forEach((a: any) => { stat[a.status] = (stat[a.status] || 0) + 1; });
        setAttendStats(p => ({ ...p, [classId]: stat }));
      }
    }
  }

  // Group by class
  const byClass: Record<string, any[]> = {};
  assignments.forEach(a => {
    if (!byClass[a.class_id]) byClass[a.class_id] = [];
    byClass[a.class_id].push(a);
  });

  const attColors: Record<string, string> = { حاضر: "#10d9a0", غائب: "#ff4d6d", متأخر: "#ffb703", مستأذن: "#3b9eff" };

  if (loading) return <DashboardLayout><div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}><div className="spinner" /></div></DashboardLayout>;

  if (assignments.length === 0) return (
    <DashboardLayout>
      <div className="empty-state">
        <div className="empty-state-icon">🏫</div>
        <div className="empty-state-title">لم يتم إسناد فصول بعد</div>
        <div className="empty-state-sub">يقوم المدير بإسناد الفصول والمواد من لوحة الإدارة</div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="animate-fade-up" dir="rtl" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h1 className="page-title">فصولي الدراسية</h1>
          <p className="page-subtitle">{Object.keys(byClass).length} فصل — {assignments.length} مادة مُسندة</p>
        </div>

        {Object.entries(byClass).map(([classId, asgns], idx) => {
          const cls = asgns[0].classes;
          const isExp = expanded === classId;
          const sts = students[classId] || [];
          const q = search[classId] || "";
          const filtered = q ? sts.filter(s => s.full_name?.includes(q)) : sts;
          const attStat = attendStats[classId] || {};
          const attData = Object.entries(attStat).filter(([, v]) => (v as number) > 0)
            .map(([name, value]) => ({ name, value }));
          const color = COLORS[idx % COLORS.length];

          return (
            <div key={classId} className="card" style={{ overflow: "hidden" }}>
              {/* Header */}
              <button
                onClick={() => toggle(classId)}
                style={{ width: "100%", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 14, background: "none", border: "none", cursor: "pointer", fontFamily: "'Cairo',sans-serif", flexWrap: "wrap" }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 13, background: `${color}18`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color, flexShrink: 0 }}>
                  {cls?.section}
                </div>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#f0f4ff" }}>{cls?.name}</div>
                  <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
                    {asgns.map((a: any) => (
                      <span key={a.id} style={{ fontSize: 10, padding: "2px 8px", background: `${color}12`, border: `1px solid ${color}20`, borderRadius: 999, color }}>
                        {a.subjects?.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  {sts.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
                      <Users size={13} />
                      <span style={{ fontWeight: 700 }}>{sts.length}</span>
                    </div>
                  )}
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: isExp ? `${color}15` : "rgba(255,255,255,0.04)", border: `1px solid ${isExp ? color : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isExp ? <ChevronUp size={14} color={color} /> : <ChevronDown size={14} color="#475569" />}
                  </div>
                </div>
              </button>

              {/* Expanded content */}
              {isExp && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: attData.length ? "2fr 1fr" : "1fr", gap: 0 }}>

                    {/* Student list */}
                    <div style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", letterSpacing: "0.05em" }}>
                          قائمة الطلاب ({sts.length})
                        </div>
                        <div style={{ position: "relative" }}>
                          <Search size={11} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
                          <input
                            value={q}
                            onChange={e => setSearch(p => ({ ...p, [classId]: e.target.value }))}
                            placeholder="بحث..."
                            style={{ width: 140, padding: "0.3rem 0.6rem 0.3rem 0.5rem", paddingRight: 24, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, fontSize: 11, color: "#94a3b8", outline: "none", fontFamily: "'Cairo',sans-serif" }}
                          />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 6, maxHeight: 260, overflowY: "auto" }} className="scrollbar-thin">
                        {filtered.length === 0 ? (
                          <p style={{ fontSize: 12, color: "#475569", padding: "1rem" }}>لا يوجد طلاب</p>
                        ) : filtered.map((s, i) => (
                          <div key={s.national_id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.4rem 0.625rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 9 }}>
                            <div style={{ width: 22, height: 22, borderRadius: 6, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color, flexShrink: 0 }}>{i + 1}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.full_name}</div>
                              <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace" }}>{s.national_id}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Attendance pie */}
                    {attData.length > 0 && (
                      <div style={{ padding: "1rem 1.25rem", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", letterSpacing: "0.05em", marginBottom: 8 }}>إجمالي الحضور</div>
                        <ResponsiveContainer width="100%" height={130}>
                          <PieChart>
                            <Pie data={attData} cx="50%" cy="50%" outerRadius={50} paddingAngle={3} dataKey="value">
                              {attData.map((d: any) => <Cell key={d.name} fill={attColors[d.name] || GOLD} strokeWidth={0} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: "#0c1220", border: "1px solid rgba(212,160,23,0.3)", borderRadius: 10, fontSize: 11 }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {attData.map((d: any) => (
                            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: attColors[d.name], flexShrink: 0 }} />
                              <span style={{ fontSize: 10, color: "#94a3b8", flex: 1 }}>{d.name}</span>
                              <span style={{ fontSize: 11, fontWeight: 800, color: attColors[d.name] }}>{d.value as number}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
