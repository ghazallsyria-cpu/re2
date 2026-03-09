"use client";

import { useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { Card, Badge } from "@/components/ui/index";
import { Search, BookOpen, FileText, Video, Image, Download, Play, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

const lessons = [
  {
    id: "1", title: "المعادلات التربيعية", subject: "رياضيات", teacher: "أ. محمد أحمد",
    date: "12 مارس", duration: "45 دق", files: [
      { name: "شرح المعادلات.pdf", type: "pdf", size: "2.3 MB" },
      { name: "تمارين حل المعادلات.pdf", type: "pdf", size: "1.1 MB" },
    ],
    hasVideo: true, isNew: true, completed: false,
    preview: "في هذا الدرس سنتعلم كيفية حل المعادلات التربيعية باستخدام القانون العام والتحليل..."
  },
  {
    id: "2", title: "الأحياء الدقيقة", subject: "علوم", teacher: "أ. خالد إبراهيم",
    date: "10 مارس", duration: "60 دق", files: [
      { name: "صور المجهر.jpg", type: "image", size: "4.5 MB" },
    ],
    hasVideo: false, isNew: false, completed: true,
    preview: "سنستكشف عالم الأحياء الدقيقة والبكتيريا والفيروسات وأثرها على حياتنا..."
  },
  {
    id: "3", title: "النحو: المفعول به", subject: "اللغة العربية", teacher: "أ. فاطمة علي",
    date: "9 مارس", duration: "40 دق", files: [
      { name: "قواعد المفعول به.pdf", type: "pdf", size: "1.8 MB" },
      { name: "تمارين تطبيقية.pdf", type: "pdf", size: "0.9 MB" },
    ],
    hasVideo: true, isNew: false, completed: false,
    preview: "درس شامل عن المفعول به وأنواعه وإعرابه مع أمثلة تطبيقية..."
  },
  {
    id: "4", title: "الثورة الصناعية", subject: "التاريخ", teacher: "أ. عمر حسن",
    date: "7 مارس", duration: "50 دق", files: [
      { name: "خريطة أوروبا.jpg", type: "image", size: "3.2 MB" },
      { name: "ملخص الثورة الصناعية.pdf", type: "pdf", size: "2.1 MB" },
    ],
    hasVideo: false, isNew: false, completed: true,
    preview: "نستعرض أسباب ونتائج الثورة الصناعية في القرن الثامن عشر وتأثيرها على العالم..."
  },
];

const subjects = ["الكل", "رياضيات", "علوم", "اللغة العربية", "التاريخ", "إنجليزي"];

const fileIcons = {
  pdf: { icon: FileText, color: "text-red-500 bg-red-50 dark:bg-red-900/20" },
  image: { icon: Image, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
  video: { icon: Video, color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20" },
};

export default function StudentLessons() {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("الكل");

  const filtered = lessons.filter(l =>
    (selectedSubject === "الكل" || l.subject === selectedSubject) &&
    (l.title.includes(search) || l.subject.includes(search))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">دروسي 📖</h1>
          <p className="page-subtitle">{lessons.filter(l => l.completed).length} درس مكتمل من {lessons.length}</p>
        </div>

        {/* Search & Filter */}
        <Card>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="search" placeholder="البحث في الدروس..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pr-9 py-2.5" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {subjects.map(sub => (
                <button key={sub} onClick={() => setSelectedSubject(sub)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${selectedSubject === sub ? "bg-primary-500 text-white shadow-sm" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((lesson) => (
            <div key={lesson.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm card-hover overflow-hidden ${lesson.completed ? "border-gray-100 dark:border-gray-700" : "border-primary-100 dark:border-primary-800/30"}`}>
              {/* Header */}
              <div className={`p-4 border-b ${lesson.isNew ? "bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800/30" : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-gray-900 dark:text-white text-base">{lesson.title}</h3>
                      {lesson.isNew && <Badge variant="info">جديد</Badge>}
                      {lesson.completed && <Badge variant="success">مكتمل</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="font-semibold text-primary-600 dark:text-primary-400">{lesson.subject}</span>
                      <span>·</span>
                      <span>{lesson.teacher}</span>
                      <span>·</span>
                      <span>{lesson.date}</span>
                    </div>
                  </div>
                  {lesson.hasVideo && (
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                      <Video size={18} />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Preview */}
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{lesson.preview}</p>

                {/* Files */}
                {lesson.files.length > 0 && (
                  <div className="space-y-2">
                    {lesson.files.map((file, i) => {
                      const typeInfo = fileIcons[file.type as keyof typeof fileIcons] || fileIcons.pdf;
                      const Icon = typeInfo.icon;
                      return (
                        <button key={i}
                          className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700 group">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 text-right">
                            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{file.name}</div>
                            <div className="text-[10px] text-gray-400">{file.size}</div>
                          </div>
                          <Download size={14} className="text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/student/lessons/${lesson.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 btn-primary text-sm">
                    <BookOpen size={14} /> عرض الدرس
                  </Link>
                  {lesson.hasVideo && (
                    <button className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-semibold hover:bg-purple-100 transition-colors border border-purple-100 dark:border-purple-800">
                      <Play size={14} /> فيديو
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
