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

  return (
    <DashboardLayout>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
          <div className="spinner" />
        </div>
      ) : (
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

          {/* بقية الملف كما هو (Tabs, Table, Charts, إلخ) */}
        </div>
      )}
    </DashboardLayout>
  );
}
