"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { Search, Filter, User, GraduationCap, BookOpen } from "lucide-react";
const GOLD = "#d4a017";
const RC: Record<string,string> = { student:"#3b9eff", teacher:GOLD, admin:"#10d9a0" };
const RL: Record<string,string> = { student:"طالب", teacher:"معلم", admin:"مدير" };

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [page, setPage] = useState(0);
  const PER = 20;

  useEffect(()=>{ loadAll(); },[]);

  async function loadAll() {
    const [{ data: us }, { data: cls }] = await Promise.all([
      supabase.from("users").select("national_id,full_name,role,email,phone,class_id,created_at,classes(name,grade)").order("created_at",{ascending:false}),
      supabase.from("classes").select("id,name,grade").order("grade"),
    ]);
    setUsers(us||[]);
    setClasses(cls||[]);
    setLoading(false);
  }

  const filtered = users.filter(u=>{
    const matchSearch = !search || u.full_name?.includes(search) || u.national_id?.includes(search);
    const matchRole = roleFilter==="all" || u.role===roleFilter;
    const matchClass = classFilter==="all" || u.class_id===classFilter;
    return matchSearch && matchRole && matchClass;
  });
  const paged = filtered.slice(page*PER, (page+1)*PER);
  const pages = Math.ceil(filtered.length/PER);

  const counts = { all:users.length, student:users.filter(u=>u.role==="student").length, teacher:users.filter(u=>u.role==="teacher").length, admin:users.filter(u=>u.role==="admin").length };

  if(loading) return <DashboardLayout><div style={{display:"flex",alignItems:"center",justifyContent:"center",height:300}}><div className="spinner"/></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="animate-fade-up" dir="rtl" style={{display:"flex",flexDirection:"column",gap:20}}>

        {/* Header */}
        <div>
          <h1 className="page-title">إدارة المستخدمين</h1>
          <p className="page-subtitle">عرض جميع الطلاب والمعلمين والمديرين</p>
        </div>

        {/* Role tabs */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[
            {key:"all",label:`الكل (${counts.all})`,color:"#94a3b8"},
            {key:"student",label:`الطلاب (${counts.student})`,color:"#3b9eff"},
            {key:"teacher",label:`المعلمون (${counts.teacher})`,color:GOLD},
            {key:"admin",label:`المديرون (${counts.admin})`,color:"#10d9a0"},
          ].map(r=>(
            <button key={r.key} onClick={()=>{setRoleFilter(r.key);setPage(0);}} style={{
              padding:"0.4rem 1rem",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",
              fontFamily:"'Cairo',sans-serif",transition:"all 0.2s",
              background:roleFilter===r.key?`${r.color}18`:"rgba(255,255,255,0.04)",
              border:`1px solid ${roleFilter===r.key?r.color:"rgba(255,255,255,0.08)"}`,
              color:roleFilter===r.key?r.color:"#64748b",
            }}>{r.label}</button>
          ))}
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:1,minWidth:200}}>
            <Search size={14} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"#475569"}}/>
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} placeholder="بحث بالاسم أو رقم الهوية..." className="input-field" style={{paddingRight:36}}/>
          </div>
          {roleFilter==="student"&&(
            <div style={{position:"relative",minWidth:200}}>
              <Filter size={14} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"#475569"}}/>
              <select value={classFilter} onChange={e=>{setClassFilter(e.target.value);setPage(0);}} className="input-field" style={{paddingRight:36,appearance:"none"}}>
                <option value="all">جميع الفصول</option>
                {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div style={{padding:"0.75rem 1rem",background:"rgba(212,160,23,0.05)",border:"1px solid rgba(212,160,23,0.1)",borderRadius:12,fontSize:12,color:"#94a3b8",fontWeight:600}}>
          عرض {filtered.length} من {users.length} مستخدم
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>رقم الهوية</th>
                <th>الدور</th>
                <th>الفصل</th>
                <th>تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {paged.length===0
                ? <tr><td colSpan={5} style={{textAlign:"center",padding:"3rem",color:"#475569"}}>لا توجد نتائج</td></tr>
                : paged.map(u=>(
                  <tr key={u.national_id}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:34,height:34,borderRadius:9,background:`${RC[u.role]||GOLD}18`,border:`1px solid ${RC[u.role]||GOLD}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:RC[u.role]||GOLD,flexShrink:0}}>
                          {u.full_name?.charAt(0)||"؟"}
                        </div>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:"#f0f4ff"}}>{u.full_name}</div>
                          <div style={{fontSize:11,color:"#475569"}}>{u.email||u.phone||"—"}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{fontFamily:"monospace",fontSize:12,color:"#94a3b8"}}>{u.national_id}</span></td>
                    <td>
                      <span className="badge" style={{background:`${RC[u.role]||GOLD}15`,color:RC[u.role]||GOLD}}>
                        {RL[u.role]||u.role}
                      </span>
                    </td>
                    <td style={{fontSize:12,color:"#94a3b8"}}>{(u as any).classes?.name||"—"}</td>
                    <td style={{fontSize:11,color:"#475569"}}>{u.created_at?new Date(u.created_at).toLocaleDateString("ar-SA"):"—"}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages>1&&(
          <div style={{display:"flex",justifyContent:"center",gap:8}}>
            <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{padding:"0.4rem 0.875rem",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Cairo',sans-serif",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:page===0?"#1e293b":"#94a3b8"}}>السابق</button>
            {Array.from({length:Math.min(pages,8)},(_,i)=>(
              <button key={i} onClick={()=>setPage(i)} style={{padding:"0.4rem 0.75rem",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Cairo',sans-serif",background:page===i?`${GOLD}18`:"rgba(255,255,255,0.04)",border:`1px solid ${page===i?GOLD:"rgba(255,255,255,0.08)"}`,color:page===i?GOLD:"#94a3b8"}}>{i+1}</button>
            ))}
            <button onClick={()=>setPage(p=>Math.min(pages-1,p+1))} disabled={page===pages-1} style={{padding:"0.4rem 0.875rem",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Cairo',sans-serif",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:page===pages-1?"#1e293b":"#94a3b8"}}>التالي</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
