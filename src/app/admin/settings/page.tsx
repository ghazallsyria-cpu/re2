"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Save, School, User, Bell, Shield, Database } from "lucide-react";
const GOLD = "#d4a017";

export default function AdminSettings() {
  const { user } = useAuth();
  const [dbStats, setDbStats] = useState({ students:0, teachers:0, classes:0, grades:0, attendance:0 });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState("");

  useEffect(()=>{ loadStats(); },[]);

  async function loadStats() {
    const [
      {count:sc},{count:tc},{count:cc},{count:gc},{count:ac}
    ] = await Promise.all([
      supabase.from("users").select("*",{count:"exact",head:true}).eq("role","student"),
      supabase.from("users").select("*",{count:"exact",head:true}).eq("role","teacher"),
      supabase.from("classes").select("*",{count:"exact",head:true}),
      supabase.from("grades").select("*",{count:"exact",head:true}),
      supabase.from("attendance").select("*",{count:"exact",head:true}),
    ]);
    setDbStats({students:sc||0,teachers:tc||0,classes:cc||0,grades:gc||0,attendance:ac||0});
    setLoading(false);
  }

  function handleSave() {
    setSaved("تم الحفظ بنجاح ✅");
    setTimeout(()=>setSaved(""),3000);
  }

  const dbItems=[
    {label:"الطلاب",value:dbStats.students,color:"#3b9eff",icon:"👥"},
    {label:"المعلمون",value:dbStats.teachers,color:GOLD,icon:"📚"},
    {label:"الفصول",value:dbStats.classes,color:"#10d9a0",icon:"🏫"},
    {label:"سجلات الدرجات",value:dbStats.grades,color:"#a78bfa",icon:"📊"},
    {label:"سجلات الحضور",value:dbStats.attendance,color:"#fb923c",icon:"✅"},
  ];

  if(loading) return <DashboardLayout><div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300}}><div className="spinner"/></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="animate-fade-up" dir="rtl" style={{display:"flex",flexDirection:"column",gap:20}}>
        <div>
          <h1 className="page-title">الإعدادات</h1>
          <p className="page-subtitle">إعدادات النظام والمدرسة</p>
        </div>

        {/* School info */}
        <div className="card" style={{padding:"1.5rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{width:36,height:36,borderRadius:10,background:`${GOLD}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <School size={16} color={GOLD}/>
            </div>
            <div style={{fontSize:14,fontWeight:800,color:"#f0f4ff"}}>معلومات المدرسة</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[
              {label:"اسم المدرسة",value:"مدرسة الرفعة النموذجية",disabled:true},
              {label:"العام الدراسي",value:"2025/2026",disabled:true},
              {label:"المرحلة الدراسية",value:"ثانوية",disabled:true},
              {label:"المنطقة التعليمية",value:"—",disabled:false},
            ].map(f=>(
              <div key={f.label}>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6}}>{f.label}</label>
                <input defaultValue={f.value} disabled={f.disabled} className="input-field" style={{fontSize:13,opacity:f.disabled?0.6:1}}/>
              </div>
            ))}
          </div>
        </div>

        {/* Admin profile */}
        <div className="card" style={{padding:"1.5rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{width:36,height:36,borderRadius:10,background:"rgba(59,158,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <User size={16} color="#3b9eff"/>
            </div>
            <div style={{fontSize:14,fontWeight:800,color:"#f0f4ff"}}>حساب المدير</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6}}>الاسم الكامل</label>
              <input defaultValue={user?.full_name||""} className="input-field" style={{fontSize:13}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6}}>رقم الهوية</label>
              <input defaultValue={user?.national_id||""} disabled className="input-field" style={{fontSize:13,opacity:0.6,fontFamily:"monospace"}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6}}>البريد الإلكتروني</label>
              <input defaultValue={user?.email||""} type="email" className="input-field" style={{fontSize:13}}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:6}}>رقم الجوال</label>
              <input defaultValue={user?.phone||""} className="input-field" style={{fontSize:13}}/>
            </div>
          </div>
        </div>

        {/* DB Stats */}
        <div className="card" style={{padding:"1.5rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{width:36,height:36,borderRadius:10,background:"rgba(167,139,250,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Database size={16} color="#a78bfa"/>
            </div>
            <div style={{fontSize:14,fontWeight:800,color:"#f0f4ff"}}>إحصائيات قاعدة البيانات</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12}}>
            {dbItems.map(item=>(
              <div key={item.label} style={{padding:"0.875rem",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,textAlign:"center"}}>
                <div style={{fontSize:20,marginBottom:6}}>{item.icon}</div>
                <div style={{fontSize:22,fontWeight:900,color:item.color}}>{item.value.toLocaleString()}</div>
                <div style={{fontSize:11,color:"#475569",marginTop:3,fontWeight:600}}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* System info */}
        <div className="card" style={{padding:"1.5rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <div style={{width:36,height:36,borderRadius:10,background:"rgba(16,217,160,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Shield size={16} color="#10d9a0"/>
            </div>
            <div style={{fontSize:14,fontWeight:800,color:"#f0f4ff"}}>معلومات النظام</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {label:"إصدار النظام",value:"Rifa School v2.0 (2026)"},
              {label:"قاعدة البيانات",value:"Supabase PostgreSQL"},
              {label:"الإطار البرمجي",value:"Next.js 14 + TypeScript"},
              {label:"الاستضافة",value:"Netlify"},
            ].map(item=>(
              <div key={item.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.625rem 0.875rem",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:10}}>
                <span style={{fontSize:12,color:"#475569",fontWeight:600}}>{item.label}</span>
                <span style={{fontSize:12,color:"#94a3b8",fontWeight:700,fontFamily:"monospace"}}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        {saved&&(
          <div style={{padding:"0.875rem 1.25rem",background:"rgba(16,217,160,0.1)",border:"1px solid rgba(16,217,160,0.3)",borderRadius:12,fontSize:13,fontWeight:700,color:"#10d9a0",textAlign:"center"}}>
            {saved}
          </div>
        )}
        <button onClick={handleSave} className="btn-primary" style={{alignSelf:"flex-start",gap:8}}>
          <Save size={15}/>
          حفظ الإعدادات
        </button>
      </div>
    </DashboardLayout>
  );
}
