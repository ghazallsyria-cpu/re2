"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, Award,
  Bell, Calendar, LogOut, Menu, X, GraduationCap,
  ClipboardCheck, FileText, Settings, ChevronRight, Sparkles, Zap, UserCog,
} from "lucide-react";

const GOLD = "#d4a017";

const studentNav = [
  { href:"/student",               label:"الرئيسية",      icon:LayoutDashboard, color:"#d4a017" },
  { href:"/student/grades",        label:"درجاتي",        icon:Award,           color:"#10d9a0" },
  { href:"/student/attendance",    label:"الحضور",        icon:ClipboardCheck,  color:"#3b9eff" },
  { href:"/student/lessons",       label:"الدروس",        icon:BookOpen,        color:"#a78bfa" },
  { href:"/student/homework",      label:"الواجبات",      icon:ClipboardList,   color:"#fb923c" },
  { href:"/student/schedule",      label:"الجدول",        icon:Calendar,        color:"#34d399" },
  { href:"/student/notifications", label:"الإشعارات",     icon:Bell,            color:"#f472b6" },
  { href:"/student/exams",         label:"الاختبارات",    icon:FileText,        color:"#60a5fa" },
];

const teacherNav = [
  { href:"/teacher",               label:"الرئيسية",      icon:LayoutDashboard, color:"#d4a017" },
  { href:"/teacher/classes",       label:"فصولي",         icon:Users,           color:"#10d9a0" },
  { href:"/teacher/grades",        label:"الدرجات",       icon:Award,           color:"#3b9eff" },
  { href:"/teacher/attendance",    label:"الحضور",        icon:ClipboardCheck,  color:"#a78bfa" },
  { href:"/teacher/homework",      label:"الواجبات",      icon:ClipboardList,   color:"#fb923c" },
  { href:"/teacher/lessons/create",label:"الدروس",        icon:BookOpen,        color:"#34d399" },
  { href:"/teacher/exams/create",  label:"الاختبارات",    icon:FileText,        color:"#f472b6" },
];

const adminNav = [
  { href:"/admin",           label:"الرئيسية",     icon:LayoutDashboard, color:"#d4a017" },
  { href:"/admin/users",     label:"الطلاب",       icon:Users,           color:"#3b9eff" },
  { href:"/admin/teachers",  label:"المعلمون",     icon:UserCog,         color:"#10d9a0" },
  { href:"/admin/classes",   label:"الفصول",       icon:GraduationCap,   color:"#a78bfa" },
  { href:"/admin/settings",  label:"الإعدادات",    icon:Settings,        color:GOLD },
];

function NavItem({ href, label, icon: Icon, color, active, onClick }: any) {
  return (
    <Link href={href} onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:10,
      padding:"0.55rem 0.875rem", borderRadius:14,
      textDecoration:"none", transition:"all 0.2s cubic-bezier(0.16,1,0.3,1)",
      position:"relative",
      background: active ? `${color}12` : "transparent",
      border: `1px solid ${active ? `${color}25` : "transparent"}`,
      marginBottom:2,
    }}>
      {active && <div style={{ position:"absolute", right:0, top:"20%", bottom:"20%", width:3, borderRadius:"999px 0 0 999px", background:color, boxShadow:`0 0 8px ${color}` }}/>}
      <div style={{ width:32, height:32, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background: active ? `${color}20` : "rgba(255,255,255,0.04)", border:`1px solid ${active ? `${color}30` : "rgba(255,255,255,0.06)"}`, flexShrink:0, transition:"all 0.2s" }}>
        <Icon size={15} color={active ? color : "#475569"} />
      </div>
      <span style={{ fontSize:13, fontWeight:700, color: active ? color : "#64748b", fontFamily:"'Cairo',sans-serif", transition:"color 0.2s" }}>{label}</span>
      {active && <ChevronRight size={12} style={{ marginRight:"auto", color, opacity:0.7 }} />}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"}));
    tick(); const id = setInterval(tick, 60000); return () => clearInterval(id);
  }, []);

  const nav = user?.role === "teacher" ? teacherNav : user?.role === "admin" ? adminNav : studentNav;
  const roleLabel = user?.role === "teacher" ? "معلم" : user?.role === "admin" ? "مدير" : "طالب";
  const roleColor = user?.role === "teacher" ? GOLD : user?.role === "admin" ? "#10d9a0" : "#3b9eff";
  const roleIcon  = user?.role === "teacher" ? "📚" : user?.role === "admin" ? "🏫" : "🎓";

  const isActive = (href: string) =>
    href === "/student" || href === "/teacher" || href === "/admin"
      ? pathname === href : pathname.startsWith(href);

  const currentPage = nav.find(n => isActive(n.href));

  return (
    <div dir="rtl" style={{ minHeight:"100vh", background:"#070b12", color:"#f0f4ff", fontFamily:"'Cairo',sans-serif" }}>

      {sidebarOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:40, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)" }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside style={{
        position:"fixed", top:0, right:0, height:"100%", width:256, zIndex:50,
        display:"flex", flexDirection:"column",
        background:"#04060a", borderLeft:"1px solid rgba(212,160,23,0.12)",
        transform: sidebarOpen ? "translateX(0)" : "translateX(100%)",
        transition:"transform 0.3s cubic-bezier(0.16,1,0.3,1)",
      }} className="lg-sidebar">

        {/* Logo */}
        <div style={{ padding:"1.125rem", borderBottom:"1px solid rgba(212,160,23,0.1)", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:11, background:"linear-gradient(135deg,rgba(212,160,23,0.2),rgba(212,160,23,0.05))", border:"1px solid rgba(212,160,23,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, fontWeight:900, color:GOLD, boxShadow:"0 0 20px rgba(212,160,23,0.12)", flexShrink:0 }}>ر</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:900, color:"#f0f4ff" }}>مدرسة الرفعة</div>
            <div style={{ fontSize:10, color:GOLD, fontWeight:700, letterSpacing:"0.05em" }}>النموذجية • ٢٠٢٦</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"#475569", padding:4 }} className="lg-hidden"><X size={16}/></button>
        </div>

        {/* User */}
        <div style={{ margin:"0.75rem", padding:"0.875rem", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:14, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, right:0, width:60, height:60, background:`radial-gradient(circle at top right,${roleColor}12,transparent)` }}/>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:`${roleColor}18`, border:`1px solid ${roleColor}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>{roleIcon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:800, color:"#f0f4ff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {user?.full_name?.split(" ").slice(0,2).join(" ") || "..."}
              </div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:4, marginTop:3, padding:"1px 7px", background:`${roleColor}15`, border:`1px solid ${roleColor}22`, borderRadius:999, fontSize:9, fontWeight:700, color:roleColor }}>
                <Sparkles size={7}/>{roleLabel}
              </div>
            </div>
          </div>
          {time && (
            <div style={{ marginTop:8, paddingTop:8, borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:10, color:"#475569", fontWeight:600 }}>الوقت الحالي</span>
              <span style={{ fontSize:11, color:GOLD, fontWeight:800, fontFamily:"monospace" }}>{time}</span>
            </div>
          )}
        </div>

        <div style={{ height:1, background:`linear-gradient(90deg,transparent,${GOLD}25,transparent)`, margin:"0 1rem 0.5rem" }}/>

        {/* Nav */}
        <nav style={{ flex:1, overflowY:"auto", padding:"0.25rem 0.75rem" }}>
          <div style={{ fontSize:9, fontWeight:800, color:"#1e293b", letterSpacing:"0.15em", padding:"0.4rem 0.875rem", marginBottom:4 }}>NAVIGATION</div>
          {nav.map(item => <NavItem key={item.href} {...item} active={isActive(item.href)} onClick={() => setSidebarOpen(false)} />)}
        </nav>

        {/* Bottom */}
        <div style={{ padding:"0.875rem", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ padding:"0.5rem 0.875rem", background:"rgba(212,160,23,0.05)", border:"1px solid rgba(212,160,23,0.1)", borderRadius:10, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
            <Zap size={11} color={GOLD}/>
            <span style={{ fontSize:10, color:"#64748b", fontWeight:700 }}>العام الدراسي 2025/2026</span>
          </div>
          <button onClick={signOut} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"0.6rem 0.875rem", background:"rgba(255,77,109,0.08)", border:"1px solid rgba(255,77,109,0.15)", borderRadius:10, fontSize:13, fontWeight:700, color:"#ff4d6d", cursor:"pointer", fontFamily:"'Cairo',sans-serif", transition:"all 0.2s" }}
            onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,77,109,0.15)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,77,109,0.08)")}>
            <LogOut size={13}/> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-content" style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>

        {/* Header */}
        <header style={{ position:"sticky", top:0, zIndex:30, display:"flex", alignItems:"center", gap:12, padding:"0.625rem 1.25rem", background:"rgba(7,11,18,0.92)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(212,160,23,0.07)", boxShadow:"0 4px 20px rgba(0,0,0,0.3)" }}>
          <button onClick={() => setSidebarOpen(true)} style={{ display:"flex", alignItems:"center", justifyContent:"center", width:34, height:34, borderRadius:9, background:"rgba(212,160,23,0.08)", border:"1px solid rgba(212,160,23,0.15)", cursor:"pointer", color:GOLD }} className="lg-hidden">
            <Menu size={16}/>
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {currentPage && <><currentPage.icon size={13} color={currentPage.color}/><span style={{ fontSize:13, fontWeight:800, color:"#94a3b8" }}>{currentPage.label}</span></>}
          </div>
          <div style={{ marginRight:"auto", display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, padding:"0.25rem 0.7rem", background:"rgba(16,217,160,0.08)", border:"1px solid rgba(16,217,160,0.15)", borderRadius:999 }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:"#10d9a0", boxShadow:"0 0 6px #10d9a0", animation:"pulse-live 2s infinite" }}/>
              <span style={{ fontSize:10, fontWeight:700, color:"#10d9a0" }}>متصل</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:7, padding:"0.25rem 0.75rem 0.25rem 0.4rem", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:999 }}>
              <div style={{ width:24, height:24, borderRadius:7, background:`${roleColor}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>{roleIcon}</div>
              <span style={{ fontSize:12, fontWeight:700, color:"#94a3b8" }}>{user?.full_name?.split(" ")[0]}</span>
            </div>
          </div>
        </header>

        <main style={{ flex:1, padding:"1.25rem" }}>{children}</main>

        <footer style={{ padding:"0.625rem 1.25rem", borderTop:"1px solid rgba(255,255,255,0.04)", display:"flex", justifyContent:"center" }}>
          <span style={{ fontSize:9, color:"#1e293b", fontWeight:700, letterSpacing:"0.08em" }}>RIFA SCHOOL © 2026 — POWERED BY AI</span>
        </footer>
      </div>

      <style>{`
        @media(min-width:1024px){
          .lg-sidebar{transform:translateX(0)!important;}
          .main-content{padding-right:256px;}
          .lg-hidden{display:none!important;}
        }
        @keyframes pulse-live{0%,100%{opacity:1;box-shadow:0 0 6px #10d9a0;}50%{opacity:0.6;box-shadow:0 0 12px #10d9a0;}}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>
    </div>
  );
}
