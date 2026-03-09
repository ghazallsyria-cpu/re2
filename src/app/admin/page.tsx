"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { Users, GraduationCap, BookOpen, Award, TrendingUp, UserCog } from "lucide-react";
import Link from "next/link";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, RadialBarChart, RadialBar,
} from "recharts";
const GOLD="#d4a017"; const G2="#f0c040";

const Tip = ({active,payload,label}:any) => active&&payload?.length ? (
  <div style={{background:"#0c1220",border:"1px solid rgba(212,160,23,0.3)",borderRadius:12,padding:"0.75rem 1rem"}}>
    {label&&<p style={{fontSize:11,color:"#64748b",marginBottom:4}}>{label}</p>}
    {payload.map((p:any,i:number)=><p key={i} style={{fontSize:12,color:p.color||"#f0f4ff",fontWeight:700}}>{p.name}: {p.value}</p>)}
  </div>
) : null;

export default function AdminDashboard() {
  const [stats,setStats]=useState({students:0,teachers:0,classes:0,subjects:0});
  const [recent,setRecent]=useState<any[]>([]);
  const [gradeDist,setGradeDist]=useState<any[]>([]);
  const [attendanceTrend,setAttendanceTrend]=useState<any[]>([]);
  const [classStats,setClassStats]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{load();},[]);

  async function load(){
    const [{count:sc},{count:tc},{count:cc},{count:sbc},{data:rs},{data:grades},{data:attData},{data:clsList}] = await Promise.all([
      supabase.from("users").select("*",{count:"exact",head:true}).eq("role","student"),
      supabase.from("users").select("*",{count:"exact",head:true}).eq("role","teacher"),
      supabase.from("classes").select("*",{count:"exact",head:true}),
      supabase.from("subjects").select("*",{count:"exact",head:true}),
      supabase.from("users").select("national_id,full_name,classes(name)").eq("role","student").order("created_at",{ascending:false}).limit(6),
      supabase.from("grades").select("marks_obtained,max_marks,term").limit(2000),
      supabase.from("attendance").select("date,status").order("date",{ascending:false}).limit(500),
      supabase.from("classes").select("id,name,grade").order("grade"),
    ]);
    setStats({students:sc||0,teachers:tc||0,classes:cc||0,subjects:sbc||0});
    setRecent(rs||[]);

    // Grade distribution for Pie
    const b:Record<string,number>={"ممتاز":0,"جيد جداً":0,"جيد":0,"مقبول":0,"ضعيف":0};
    (grades||[]).forEach((g:any)=>{
      const p=(g.marks_obtained/g.max_marks)*100;
      if(p>=90)b["ممتاز"]++;else if(p>=80)b["جيد جداً"]++;
      else if(p>=70)b["جيد"]++;else if(p>=60)b["مقبول"]++;else b["ضعيف"]++;
    });
    setGradeDist(Object.entries(b).map(([name,value])=>({name,value})));

    // Attendance by day (last 7 days)
    const byDate:Record<string,{حاضر:number,غائب:number,متأخر:number}> = {};
    (attData||[]).forEach((a:any)=>{
      if(!byDate[a.date])byDate[a.date]={حاضر:0,غائب:0,متأخر:0};
      if(a.status==="حاضر")byDate[a.date].حاضر++;
      else if(a.status==="غائب")byDate[a.date].غائب++;
      else if(a.status==="متأخر")byDate[a.date].متأخر++;
    });
    const trend=Object.entries(byDate).slice(0,7).map(([date,v])=>({date:date.slice(5),...v})).reverse();
    setAttendanceTrend(trend);

    // Class student counts for bar
    if(clsList){
      const cls=clsList.slice(0,8);
      const counts=await Promise.all(cls.map(async(c)=>{
        const {count}=await supabase.from("users").select("*",{count:"exact",head:true}).eq("class_id",c.id).eq("role","student");
        return {name:c.name.replace("الثاني عشر","١٢").replace("الحادي عشر","١١").replace("العاشر","١٠"),count:count||0};
      }));
      setClassStats(counts);
    }
    setLoading(false);
  }

  if(loading) return <DashboardLayout><div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300}}><div className="spinner"/></div></DashboardLayout>;

  const COLORS=["#10d9a0",GOLD,"#3b9eff","#ffb703","#ff4d6d"];
  const cards=[
    {label:"إجمالي الطلاب",value:stats.students,icon:Users,color:"#3b9eff",link:"/admin/users"},
    {label:"المعلمون",value:stats.teachers,icon:UserCog,color:GOLD,link:"/admin/teachers"},
    {label:"الفصول",value:stats.classes,icon:GraduationCap,color:"#10d9a0",link:"/admin/classes"},
    {label:"المواد",value:stats.subjects,icon:BookOpen,color:"#a78bfa",link:"/admin/classes"},
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-up" dir="rtl" style={{display:"flex",flexDirection:"column",gap:20}}>

        {/* Hero */}
        <div style={{padding:"1.25rem 1.75rem",background:"linear-gradient(135deg,#0c1220,#111827)",border:"1px solid rgba(212,160,23,0.2)",borderRadius:20,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-30,left:-30,width:200,height:200,background:"radial-gradient(circle,rgba(212,160,23,0.06),transparent)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:-40,right:100,width:180,height:180,background:"radial-gradient(circle,rgba(59,158,255,0.05),transparent)",pointerEvents:"none"}}/>
          <p style={{fontSize:11,color:"#475569",fontWeight:700,marginBottom:4,letterSpacing:"0.05em"}}>RIFA SCHOOL ADMIN — 2026</p>
          <h1 style={{fontSize:22,fontWeight:900,color:"#f0f4ff",letterSpacing:"-0.02em"}}>نظرة عامة على المدرسة</h1>
          <p style={{fontSize:12,color:GOLD,marginTop:4}}>العام الدراسي 2025/2026 — مدرسة الرفعة النموذجية</p>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:12}}>
          {cards.map((c,i)=>(
            <Link key={c.label} href={c.link} style={{textDecoration:"none"}}>
              <div className="stat-card" style={{animationDelay:`${i*70}ms`}}>
                <div style={{width:40,height:40,borderRadius:10,background:`${c.color}15`,border:`1px solid ${c.color}25`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
                  <c.icon size={18} color={c.color}/>
                </div>
                <div style={{fontSize:30,fontWeight:900,color:"#f0f4ff",letterSpacing:"-0.02em"}}>{c.value.toLocaleString()}</div>
                <div style={{fontSize:11,fontWeight:700,color:c.color,marginTop:3}}>{c.label}</div>
                <div style={{marginTop:8,height:1,background:`linear-gradient(90deg,transparent,${c.color}40,transparent)`}}/>
              </div>
            </Link>
          ))}
        </div>

        {/* Row 1: Pie + Area */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:16}}>

          {/* Pie: Grade Distribution */}
          <div className="card" style={{padding:"1.25rem"}}>
            <div className="section-header">
              <div><div className="section-title">توزيع التقديرات</div><div className="section-sub">نسب درجات الطلاب</div></div>
              <Award size={14} color={GOLD}/>
            </div>
            {gradeDist.every(d=>d.value===0)
              ? <div className="empty-state" style={{padding:"2rem"}}><div className="empty-state-icon">📊</div><div className="empty-state-sub">لا توجد درجات بعد</div></div>
              : <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={gradeDist} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {gradeDist.map((_,i)=><Cell key={i} fill={COLORS[i]} strokeWidth={0}/>)}
                    </Pie>
                    <Tooltip content={<Tip/>}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
                  {gradeDist.map((d,i)=>(
                    <div key={d.name} style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:COLORS[i],flexShrink:0}}/>
                      <span style={{fontSize:11,color:"#94a3b8",flex:1}}>{d.name}</span>
                      <span style={{fontSize:11,fontWeight:800,color:COLORS[i]}}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            }
          </div>

          {/* Area: Attendance trend */}
          <div className="card" style={{padding:"1.25rem"}}>
            <div className="section-header">
              <div><div className="section-title">سجل الحضور — آخر الأيام</div><div className="section-sub">حضور وغياب الطلاب</div></div>
              <TrendingUp size={14} color="#10d9a0"/>
            </div>
            {attendanceTrend.length===0
              ? <div className="empty-state" style={{padding:"2rem"}}><div className="empty-state-icon">📅</div><div className="empty-state-sub">لا يوجد سجل حضور بعد</div></div>
              : <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={attendanceTrend} margin={{top:5,right:5,left:-20,bottom:0}}>
                  <defs>
                    <linearGradient id="gcPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10d9a0" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10d9a0" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gcAbsent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="date" tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<Tip/>}/>
                  <Area type="monotone" dataKey="حاضر" stroke="#10d9a0" fill="url(#gcPresent)" strokeWidth={2} dot={false} name="حاضر"/>
                  <Area type="monotone" dataKey="غائب" stroke="#ff4d6d" fill="url(#gcAbsent)" strokeWidth={2} dot={false} name="غائب"/>
                </AreaChart>
              </ResponsiveContainer>
            }
          </div>
        </div>

        {/* Row 2: Bar + Recent */}
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>

          {/* Bar: Students per class */}
          <div className="card" style={{padding:"1.25rem"}}>
            <div className="section-header">
              <div><div className="section-title">عدد الطلاب بكل فصل</div><div className="section-sub">توزيع الطلاب على الفصول</div></div>
            </div>
            {classStats.length===0
              ? <div className="empty-state" style={{padding:"2rem"}}><div className="empty-state-icon">🏫</div><div className="empty-state-sub">لا توجد فصول</div></div>
              : <ResponsiveContainer width="100%" height={200}>
                <BarChart data={classStats} margin={{top:5,right:5,left:-20,bottom:20}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="name" tick={{fill:"#475569",fontSize:9}} axisLine={false} tickLine={false} angle={-35} textAnchor="end"/>
                  <YAxis tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="count" name="عدد الطلاب" radius={[6,6,0,0]}>
                    {classStats.map((_,i)=><Cell key={i} fill={`hsl(${200+i*12},70%,60%)`}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            }
          </div>

          {/* Recent students */}
          <div className="card" style={{padding:"1.25rem"}}>
            <div className="section-header">
              <div><div className="section-title">آخر الطلاب</div></div>
              <Link href="/admin/users" style={{fontSize:11,fontWeight:700,color:GOLD,textDecoration:"none"}}>الكل ←</Link>
            </div>
            {recent.length===0
              ? <div className="empty-state" style={{padding:"1.5rem"}}><div className="empty-state-icon">👥</div><div className="empty-state-sub">لا يوجد طلاب</div></div>
              : <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {recent.map((s)=>(
                  <div key={s.national_id} style={{display:"flex",alignItems:"center",gap:8,padding:"0.5rem",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:10}}>
                    <div style={{width:30,height:30,borderRadius:8,background:`${GOLD}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:GOLD,flexShrink:0}}>{s.full_name?.charAt(0)||"؟"}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#f0f4ff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.full_name}</div>
                      <div style={{fontSize:10,color:"#475569"}}>{(s as any).classes?.name||"—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>

        {/* Quick nav */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
          {[
            {href:"/admin/users",icon:"👥",label:"الطلاب",desc:"عرض وبحث",color:"#3b9eff"},
            {href:"/admin/teachers",icon:"👨‍🏫",label:"المعلمون",desc:"إدارة والإسناد",color:"#10d9a0"},
            {href:"/admin/classes",icon:"🏫",label:"الفصول",desc:"الفصول والمواد",color:GOLD},
            {href:"/admin/settings",icon:"⚙️",label:"الإعدادات",desc:"إعدادات النظام",color:"#a78bfa"},
          ].map(item=>(
            <Link key={item.href} href={item.href} style={{textDecoration:"none"}}>
              <div className="card" style={{padding:"1rem",cursor:"pointer"}}>
                <div style={{fontSize:20,marginBottom:6}}>{item.icon}</div>
                <div style={{fontSize:12,fontWeight:800,color:"#f0f4ff"}}>{item.label}</div>
                <div style={{fontSize:10,color:"#475569",marginTop:2}}>{item.desc}</div>
                <div style={{marginTop:10,fontSize:10,color:item.color,fontWeight:700}}>دخول ←</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
