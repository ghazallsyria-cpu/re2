"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/hooks/useData";
import { Bell, Clock, CheckCheck } from "lucide-react";

const TYPES: Record<string, { label: string; icon: string; color: string }> = {
  exam: { label: "اختبار", icon: "📝", color: "#8b5cf6" },
  homework: { label: "واجب", icon: "📋", color: "#3b82f6" },
  announcement: { label: "إعلان", icon: "📢", color: "#c9970c" },
  grade: { label: "درجات", icon: "🏆", color: "#10b981" },
  attendance: { label: "حضور", icon: "✅", color: "#f59e0b" },
  general: { label: "عام", icon: "💬", color: "#6b7280" },
};

export default function StudentNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) load(); }, [user]);

  async function load() {
    setLoading(true);
    // Get notifications for student (all + student role + their class)
    const { data: notifs } = await supabase
      .from("notifications")
      .select("*")
      .or(`target_role.eq.all,target_role.eq.student${user?.class_id ? `,target_class_id.eq.${user.class_id}` : ""}`)
      .order("created_at", { ascending: false })
      .limit(50);

    // Get read status
    const { data: reads } = await supabase
      .from("notification_reads")
      .select("notification_id")
      .eq("user_id", user!.national_id || user!.id);

    setNotifications(notifs || []);
    setReadIds(new Set((reads || []).map((r: any) => r.notification_id)));
    setLoading(false);
  }

  async function markRead(notifId: string) {
    if (readIds.has(notifId)) return;
    await supabase.from("notification_reads").upsert({ notification_id: notifId, user_id: user!.national_id || user!.id });
    setReadIds(prev => new Set([...prev, notifId]));
  }

  async function markAllRead() {
    const unread = notifications.filter(n => !readIds.has(n.id));
    for (const n of unread) {
      await supabase.from("notification_reads").upsert({ notification_id: n.id, user_id: user!.national_id || user!.id });
    }
    setReadIds(new Set(notifications.map(n => n.id)));
  }

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "الآن";
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `منذ ${hrs} ساعة`;
    return `منذ ${Math.floor(hrs / 24)} يوم`;
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-up" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--text-1)" }}>الإشعارات</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
              {unreadCount > 0 ? <span style={{ color: "#c9970c", fontWeight: 800 }}>{unreadCount} إشعار جديد</span> : "جميع الإشعارات مقروءة"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn btn-secondary btn-sm flex items-center gap-2">
              <CheckCheck size={14} /> تحديد الكل كمقروء
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-state-icon">🔕</div><div className="empty-state-title">لا توجد إشعارات</div><div className="empty-state-sub">ستظهر هنا الإشعارات من المعلمين والإدارة</div></div></div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const t = TYPES[n.type] || TYPES.general;
              const isRead = readIds.has(n.id);
              return (
                <div key={n.id} onClick={() => markRead(n.id)}
                  className={`notif-card cursor-pointer ${!isRead ? "unread" : ""}`}
                  style={{ borderRightColor: !isRead ? t.color : undefined }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl" style={{ background: t.color + "15" }}>{t.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm" style={{ color: "var(--text-1)" }}>{n.title}</span>
                        {!isRead && <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />}
                        <span className="badge" style={{ background: t.color + "15", color: t.color }}>{t.label}</span>
                      </div>
                      <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--text-2)" }}>{n.body}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: "var(--text-3)" }}>
                        <Clock size={11} /> {timeAgo(n.created_at)}
                        {isRead && <span className="mr-2 flex items-center gap-1" style={{ color: "#10b981" }}><CheckCheck size={11} /> مقروء</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
