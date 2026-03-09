"use client";
import { useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { Card, Badge } from "@/components/ui/index";
import { Upload, X, FileText, Clock, CheckCircle, AlertTriangle, Send } from "lucide-react";

const mockHomework = [
  { id: "1", title: "حل تمارين المعادلات التربيعية", subject: "رياضيات", teacher: "أ. محمد أحمد", due: "2024-03-16", maxGrade: 20, description: "حل التمارين من 1 إلى 15 في صفحة 87 من الكتاب المدرسي مع إظهار خطوات الحل.", status: "pending" },
  { id: "2", title: "تحليل نص قصيدة المتنبي", subject: "عربي", teacher: "أ. فاطمة علي", due: "2024-03-14", maxGrade: 15, description: "اكتب تحليلاً أدبياً لقصيدة المتنبي المقررة مع ذكر الأساليب البلاغية.", status: "submitted", grade: 13, feedback: "عمل ممتاز! التحليل دقيق ومنظم." },
  { id: "3", title: "تجربة الضوء والعدسات", subject: "علوم", teacher: "أ. خالد إبراهيم", due: "2024-03-18", maxGrade: 25, description: "اكتب تقريراً عن تجربة انعكاس الضوء باستخدام العدسات المحدبة والمقعرة.", status: "late" },
  { id: "4", title: "ترجمة فقرة إنجليزية", subject: "إنجليزي", teacher: "أ. سارة محمود", due: "2024-03-20", maxGrade: 10, description: "Translate the given paragraph from Unit 5 and write it in proper Arabic.", status: "graded", grade: 9, feedback: "Excellent translation!" },
];

const statusConfig = {
  pending: { label: "معلق", variant: "warning" as const, icon: Clock },
  submitted: { label: "مُسلَّم", variant: "info" as const, icon: CheckCircle },
  late: { label: "متأخر", variant: "danger" as const, icon: AlertTriangle },
  graded: { label: "مُصحَّح", variant: "success" as const, icon: CheckCircle },
};

export default function StudentHomework() {
  const [activeHw, setActiveHw] = useState<typeof mockHomework[0] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => { setActiveHw(null); setSubmitted(false); setFile(null); setTextAnswer(""); }, 2000);
  };

  const daysLeft = (due: string) => {
    const diff = Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
    if (diff < 0) return `متأخر ${Math.abs(diff)} يوم`;
    if (diff === 0) return "اليوم";
    return `${diff} يوم متبقي`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">الواجبات المنزلية 📝</h1>
          <p className="page-subtitle">{mockHomework.filter(h => h.status === "pending" || h.status === "late").length} واجبات تحتاج تسليماً</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 w-fit shadow-sm">
          {["الكل", "معلق", "مُسلَّم", "مُصحَّح"].map(tab => (
            <button key={tab} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all first:bg-primary-500 first:text-white hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mockHomework.map(hw => {
            const config = statusConfig[hw.status as keyof typeof statusConfig];
            const StatusIcon = config.icon;
            const days = daysLeft(hw.due);
            const isUrgent = hw.status === "pending" && days.includes("يوم") && parseInt(days) <= 2;
            return (
              <div key={hw.id} className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-5 card-hover ${isUrgent || hw.status === "late" ? "border-red-200 dark:border-red-800/30" : "border-gray-100 dark:border-gray-700"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-1">{hw.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="text-primary-600 dark:text-primary-400 font-semibold">{hw.subject}</span>
                      <span>·</span><span>{hw.teacher}</span>
                    </div>
                  </div>
                  <Badge variant={config.variant}><StatusIcon size={11} className="ml-1" />{config.label}</Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">{hw.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-1.5 text-xs font-semibold ${hw.status === "late" ? "text-red-500" : isUrgent ? "text-amber-500" : "text-gray-400"}`}>
                    <Clock size={12} />
                    <span>{days} · {new Date(hw.due).toLocaleDateString("ar-SA")}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{hw.maxGrade} درجة</span>
                </div>
                {hw.grade !== undefined && (
                  <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">درجتك</span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400">{hw.grade}/{hw.maxGrade}</span>
                    </div>
                    {hw.feedback && <p className="text-xs text-emerald-600 dark:text-emerald-500 italic">"{hw.feedback}"</p>}
                  </div>
                )}
                {(hw.status === "pending" || hw.status === "late") && (
                  <button onClick={() => setActiveHw(hw)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${hw.status === "late" ? "bg-red-500 hover:bg-red-600 text-white" : "btn-primary"}`}>
                    <Send size={14} /> {hw.status === "late" ? "تسليم متأخر" : "تسليم الواجب"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Modal */}
        {activeHw && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setActiveHw(null)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-bold text-gray-900 dark:text-white">تسليم الواجب</h2>
                <button onClick={() => setActiveHw(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">{activeHw.title}</h3>
                  <p className="text-sm text-gray-500">{activeHw.subject} · {activeHw.maxGrade} درجة</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">رفع ملف (PDF أو صورة)</label>
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-5 text-center hover:border-primary-300 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("hw-file")?.click()}>
                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText size={20} className="text-primary-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{file.name}</span>
                        <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }} className="text-red-400 hover:text-red-500"><X size={14} /></button>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">انقر لرفع ملف · PDF, JPG, PNG</p>
                      </>
                    )}
                    <input id="hw-file" type="file" className="hidden" accept=".pdf,image/*"
                      onChange={e => setFile(e.target.files?.[0] || null)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">أو اكتب إجابتك نصياً</label>
                  <textarea value={textAnswer} onChange={e => setTextAnswer(e.target.value)}
                    className="input-field resize-none" rows={4} placeholder="اكتب إجابتك هنا..." />
                </div>
                <button type="submit" disabled={submitting || submitted || (!file && !textAnswer)}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-50 ${submitted ? "bg-emerald-500" : "bg-primary-600 hover:bg-primary-700"}`}>
                  {submitted ? <><CheckCircle size={18} /> تم التسليم!</>
                    : submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري التسليم...</>
                    : <><Send size={18} /> تسليم الواجب</>}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
