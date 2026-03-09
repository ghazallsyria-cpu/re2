"use client";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { Card } from "@/components/ui/index";

const schedule = {
  "الأحد":    [{ time: "08:00-09:00", subject: "رياضيات",      teacher: "أ. محمد",  room: "101", color: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300" }, { time: "09:00-10:00", subject: "عربي",          teacher: "أ. فاطمة", room: "205", color: "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300" }, { time: "10:30-11:30", subject: "علوم",          teacher: "أ. خالد",  room: "مختبر", color: "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-300" }, { time: "11:30-12:30", subject: "إنجليزي",       teacher: "أ. سارة",  room: "102", color: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300" }],
  "الاثنين":  [{ time: "08:00-09:00", subject: "تاريخ",        teacher: "أ. عمر",   room: "301", color: "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700 text-orange-800 dark:text-orange-300" }, { time: "09:00-10:00", subject: "رياضيات",      teacher: "أ. محمد",  room: "101", color: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300" }, { time: "10:30-11:30", subject: "جغرافيا",      teacher: "أ. نورة",  room: "302", color: "bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-700 text-pink-800 dark:text-pink-300" }],
  "الثلاثاء": [{ time: "08:00-09:00", subject: "علوم",          teacher: "أ. خالد",  room: "مختبر", color: "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-300" }, { time: "09:00-10:00", subject: "عربي",          teacher: "أ. فاطمة", room: "205", color: "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300" }, { time: "10:30-11:30", subject: "تربية إسلامية", teacher: "أ. عبدالله", room: "103", color: "bg-teal-100 dark:bg-teal-900/30 border-teal-200 dark:border-teal-700 text-teal-800 dark:text-teal-300" }, { time: "11:30-12:30", subject: "رياضيات",      teacher: "أ. محمد",  room: "101", color: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300" }],
  "الأربعاء": [{ time: "08:00-09:00", subject: "إنجليزي",       teacher: "أ. سارة",  room: "102", color: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300" }, { time: "09:00-10:00", subject: "تاريخ",        teacher: "أ. عمر",   room: "301", color: "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700 text-orange-800 dark:text-orange-300" }, { time: "10:30-11:30", subject: "رياضيات",      teacher: "أ. محمد",  room: "101", color: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300" }],
  "الخميس":   [{ time: "08:00-09:00", subject: "عربي",          teacher: "أ. فاطمة", room: "205", color: "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300" }, { time: "09:00-10:00", subject: "علوم",          teacher: "أ. خالد",  room: "مختبر", color: "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-300" }, { time: "10:30-11:30", subject: "جغرافيا",      teacher: "أ. نورة",  room: "302", color: "bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-700 text-pink-800 dark:text-pink-300" }],
};

const today = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"][new Date().getDay()];

export default function StudentSchedule() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">الجدول الدراسي 📅</h1>
          <p className="page-subtitle">الفصل الدراسي الثاني 2024-2025 · الصف الأول أ</p>
        </div>

        {/* Today highlight */}
        {schedule[today as keyof typeof schedule] && (
          <div className="bg-gradient-to-l from-primary-600 to-primary-800 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📍</span>
              <span className="font-bold text-lg">اليوم — {today}</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
              {schedule[today as keyof typeof schedule].map((cls, i) => (
                <div key={i} className="bg-white/15 backdrop-blur-sm rounded-xl p-3 min-w-[140px] border border-white/20 flex-shrink-0">
                  <div className="text-xs opacity-80 mb-1 font-mono" dir="ltr">{cls.time}</div>
                  <div className="font-bold text-sm">{cls.subject}</div>
                  <div className="text-xs opacity-70 mt-0.5">{cls.teacher} · {cls.room}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Week Grid */}
        <div className="space-y-4">
          {Object.entries(schedule).map(([day, classes]) => (
            <Card key={day} className={day === today ? "border-primary-200 dark:border-primary-700 shadow-md" : ""}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${day === today ? "bg-primary-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                  {["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"].indexOf(day) + 1}
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">{day}</span>
                  {day === today && <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold mr-2">اليوم</span>}
                </div>
                <span className="text-xs text-gray-400 mr-auto">{classes.length} حصص</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {classes.map((cls, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${cls.color}`}>
                    <div className="text-[11px] font-mono opacity-70 mb-1" dir="ltr">{cls.time}</div>
                    <div className="font-bold text-sm leading-tight">{cls.subject}</div>
                    <div className="text-[11px] mt-1 opacity-70">{cls.teacher}</div>
                    <div className="text-[11px] opacity-60">قاعة {cls.room}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
