"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { ChevronDown, ChevronUp, Users, BookOpen } from "lucide-react";
const GOLD = "#d4a017";

export default function AdminClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<Record<string,any[]>>({});
  const [expanded, setExpanded] = useState<string|null>(null);
  const [counts, setCounts] = useState<Record<string,number>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"classes"|"subjects">("classes");

  useEffect(()=>{ loadAll(); },[]);

  async function loadAll() {
    const [{ data: cls },{ data: subs }] = await Promise.all([
      supabase.from("classes").select("*").order("grade").order("section"),
      supabase.from("subjects").select("*,classes(name)").order("name"),
    ]);
    setClasses(cls||[]);
    setSubjects(subs||[]);
    // Count students per class
    if(cls&&cls.length) {
      const cnts:Record<string,number> = {};
      await Promise.all(cls.map(async (c)=>{
        const {count} = await supabase.from("users").select("*",{count:"exact",head:true}).eq("class_id",c.id).eq("role","student");
        cnts[c.id]=count||0;
      }));
      setCounts(cnts);
    }
    setLoading(false);
  }

  async function toggleClass(id:string) {
    if(expanded===id){ setExpanded(null); return; }
    setExpanded(id);
    if(!students[id]) {
      const {data} = await supabase.from("users").select("national_id,full_name").eq("class_id",id).eq("role","student").order("full_name");
      setStudents(p=>({...p,[id]:data||[]}));
    }
  }

  // Group classes by grade
  const byGrade:Record<string,any[]> = {};
  classes.forEach(c=>{ if(!byGrade[c.grade])byGrade[c.grade]=[]; byGrade[c.grade].push(c); });

  const gradeColors:Record<string,string> = { "العاشر":"#3b9eff","الحادي عشر":GOLD,"الثاني عشر":"#10d9a0" };

  if(loading) return <DashboardLayout><div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300}}><div className="spinner"/></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="animate-fade-up" dir="rtl" style={{display:"flex",flexDirection:"column",gap:20}}>

        <div>
          <h1 className="page-title">الفصول الدراسية</h1>
          <p className="page-subtitle">{classes.length} فصل دراسي — {Object.values(counts).reduce((a,b)=>a+b,0)} طالب إجمالاً</p>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{width:"fit-content"}}>
          <button className={`tab ${tab==="classes"?"active":""}`} onClick={()=>setTab("classes")}>الفصول</button>
          <button className={`tab ${tab==="subjects"?"active":""}`} onClick={()=>setTab("subjects")}>المواد الدراسية</button>
        </div>

        {tab==="classes"&&(
          <div style={{display:"flex",flexDirection:"column",gap:24}}>
            {Object.entries(byGrade).map(([grade,gradeClasses])=>{
              const color = gradeColors[grade]||GOLD;
              return (
                <div key={grade}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                    <div style={{height:1,flex:1,background:"rgba(255,255,255,0.05)"}}/>
                    <span style={{fontSize:12,fontWeight:800,color,padding:"0.2rem 0.875rem",background:`${color}12`,border:`1px solid ${color}25`,borderRadius:999}}>
                      {grade} — {gradeClasses.length} فصل
                    </span>
                    <div style={{height:1,flex:1,background:"rgba(255,255,255,0.05)"}}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
                    {gradeClasses.map(c=>{
                      const isExp = expanded===c.id;
                      const sts = students[c.id]||[];
                      return (
                        <div key={c.id} className="card" style={{overflow:"visible"}}>
                          <div style={{padding:"1rem"}}>
                            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                              <div style={{width:44,height:44,borderRadius:12,background:`${color}18`,border:`1px solid ${color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color,flexShrink:0}}>
                                {c.section}
                              </div>
                              <div style={{flex:1}}>
                                <div style={{fontSize:13,fontWeight:800,color:"#f0f4ff"}}>{c.name}</div>
                                <div style={{fontSize:11,color:"#475569",marginTop:2}}>{c.track||"عام"} — {c.academic_year}</div>
                              </div>
                            </div>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                              <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#94a3b8"}}>
                                <Users size={13}/>
                                <span style={{fontWeight:700,color}}>{counts[c.id]||0}</span>
                                <span>طالب</span>
                              </div>
                              <button onClick={()=>toggleClass(c.id)} style={{display:"flex",alignItems:"center",gap:4,padding:"0.3rem 0.75rem",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:`${color}12`,border:`1px solid ${color}20`,color,fontFamily:"'Cairo',sans-serif"}}>
                                {isExp?"إخفاء":"عرض الطلاب"}
                                {isExp?<ChevronUp size={12}/>:<ChevronDown size={12}/>}
                              </button>
                            </div>
                          </div>
                          {isExp&&(
                            <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",padding:"0.875rem",maxHeight:240,overflowY:"auto"}}>
                              {sts.length===0
                                ? <p style={{fontSize:12,color:"#475569",textAlign:"center",padding:"1rem"}}>لا يوجد طلاب</p>
                                : sts.map((s,i)=>(
                                  <div key={s.national_id} style={{display:"flex",alignItems:"center",gap:8,padding:"0.35rem 0",borderBottom:i<sts.length-1?"1px solid rgba(255,255,255,0.03)":"none"}}>
                                    <div style={{width:6,height:6,borderRadius:"50%",background:color,opacity:0.6,flexShrink:0}}/>
                                    <span style={{fontSize:12,color:"#94a3b8",flex:1}}>{s.full_name}</span>
                                    <span style={{fontSize:10,color:"#475569",fontFamily:"monospace"}}>{s.national_id}</span>
                                  </div>
                                ))
                              }
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {classes.length===0&&<div className="empty-state"><div className="empty-state-icon">🏫</div><div className="empty-state-title">لا توجد فصول</div><div className="empty-state-sub">أضف الفصول من قاعدة البيانات</div></div>}
          </div>
        )}

        {tab==="subjects"&&(
          <div>
            {subjects.length===0
              ? <div className="empty-state"><div className="empty-state-icon">📚</div><div className="empty-state-title">لا توجد مواد</div></div>
              : <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>#</th><th>اسم المادة</th><th>الفصل المرتبط</th></tr></thead>
                  <tbody>
                    {subjects.map((s,i)=>(
                      <tr key={s.id}>
                        <td style={{color:"#475569",fontSize:11}}>{i+1}</td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:30,height:30,borderRadius:8,background:`${GOLD}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                              <BookOpen size={13} color={GOLD}/>
                            </div>
                            <span style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{s.name}</span>
                          </div>
                        </td>
                        <td style={{fontSize:12,color:"#94a3b8"}}>{(s as any).classes?.name||"عامة"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
