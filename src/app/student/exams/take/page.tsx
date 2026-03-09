"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, AlertTriangle, CheckCircle, ChevronRight, ChevronLeft, Flag } from "lucide-react";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  type: "multiple_choice" | "true_false" | "short_answer";
  text: string;
  points: number;
  options: Option[];
  imageUrl?: string;
}

const mockExam = {
  title: "اختبار الرياضيات - الفصل الأول",
  subject: "رياضيات",
  duration: 60,
  instructions: "اقرأ الأسئلة بعناية وأجب عنها جميعاً. الاختبار يتكون من 5 أسئلة بإجمالي 20 درجة.",
  questions: [
    { id: "1", type: "multiple_choice" as const, text: "ما هو ناتج ضرب (x + 2)(x - 2)؟", points: 4, options: [{ id: "a", text: "x² - 4" }, { id: "b", text: "x² + 4" }, { id: "c", text: "x² - 2x + 4" }, { id: "d", text: "x + 4" }] },
    { id: "2", type: "multiple_choice" as const, text: "حل المعادلة: 2x + 6 = 14", points: 4, options: [{ id: "a", text: "x = 2" }, { id: "b", text: "x = 4" }, { id: "c", text: "x = 6" }, { id: "d", text: "x = 10" }] },
    { id: "3", type: "true_false" as const, text: "مجموع زوايا المثلث يساوي 180 درجة", points: 2, options: [{ id: "t", text: "صح" }, { id: "f", text: "خطأ" }] },
    { id: "4", type: "multiple_choice" as const, text: "إذا كان نصف قطر الدائرة 7 سم، فما مساحتها تقريباً؟ (π ≈ 22/7)", points: 5, options: [{ id: "a", text: "44 سم²" }, { id: "b", text: "154 سم²" }, { id: "c", text: "22 سم²" }, { id: "d", text: "49 سم²" }] },
    { id: "5", type: "true_false" as const, text: "العدد √2 عدد نسبي", points: 2, options: [{ id: "t", text: "صح" }, { id: "f", text: "خطأ" }] },
    { id: "6", type: "multiple_choice" as const, text: "ما هو المشتق الأول للدالة f(x) = 3x²?", points: 3, options: [{ id: "a", text: "6x" }, { id: "b", text: "3x" }, { id: "c", text: "6" }, { id: "d", text: "x²" }] },
  ],
};

export default function TakeExam() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(mockExam.duration * 60);
  const [submitted, setSubmitted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [score, setScore] = useState<{ earned: number; total: number; percentage: number } | null>(null);

  const correctAnswers: Record<string, string> = { "1": "a", "2": "b", "3": "t", "4": "b", "5": "f", "6": "a" };

  useEffect(() => {
    if (submitted || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(p => {
      if (p <= 1) { clearInterval(t); handleSubmit(); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [submitted]);

  const handleSubmit = useCallback(() => {
    let earned = 0, total = 0;
    mockExam.questions.forEach(q => {
      total += q.points;
      if (answers[q.id] === correctAnswers[q.id]) earned += q.points;
    });
    setScore({ earned, total, percentage: Math.round((earned / total) * 100) });
    setSubmitted(true);
  }, [answers]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isUrgent = timeLeft < 300;
  const currentQuestion = mockExam.questions[currentQ];
  const answeredCount = Object.keys(answers).length;

  if (submitted && score) {
    const gradeLabel = score.percentage >= 90 ? "ممتاز 🌟" : score.percentage >= 75 ? "جيد جداً ✨" : score.percentage >= 60 ? "جيد 👍" : score.percentage >= 50 ? "مقبول" : "راسب";
    const gradeColor = score.percentage >= 90 ? "text-emerald-600" : score.percentage >= 75 ? "text-blue-600" : score.percentage >= 60 ? "text-amber-600" : "text-red-600";
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">تم التسليم! 🎉</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{mockExam.title}</p>
          <div className={`text-6xl font-black mb-2 ${gradeColor}`}>{score.percentage}%</div>
          <div className={`text-xl font-bold mb-1 ${gradeColor}`}>{gradeLabel}</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            {score.earned} من {score.total} درجة
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
              <div className="text-2xl font-black text-gray-800 dark:text-gray-100">{answeredCount}</div>
              <div className="text-xs text-gray-400 mt-1">سؤال أُجيب عنه</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
              <div className="text-2xl font-black text-gray-800 dark:text-gray-100">{mockExam.questions.length - answeredCount}</div>
              <div className="text-xs text-gray-400 mt-1">سؤال لم يُجب عنه</div>
            </div>
          </div>
          <button onClick={() => window.location.href = "/student/exams"}
            className="w-full btn-primary py-3.5">
            العودة للاختبارات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir="rtl">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-20 px-4 py-3 shadow-sm border-b transition-colors ${isUrgent ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-black text-gray-900 dark:text-white text-sm sm:text-base">{mockExam.title}</h1>
            <p className="text-xs text-gray-400">{mockExam.subject}</p>
          </div>
          <div className={`flex items-center gap-2 font-black text-xl px-4 py-2 rounded-xl ${isUrgent ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse" : "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"}`}>
            <Clock size={18} />
            <span dir="ltr">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto pt-20 pb-24 px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Question */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black flex-shrink-0">
                {currentQ + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                    {currentQuestion.points} درجة
                  </span>
                  {flagged.has(currentQuestion.id) && (
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full">🚩 محدد</span>
                  )}
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white leading-relaxed">{currentQuestion.text}</p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt, oi) => {
                const isSelected = answers[currentQuestion.id] === opt.id;
                const letters = ["أ", "ب", "ج", "د"];
                return (
                  <button key={opt.id}
                    onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: opt.id }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-right transition-all ${isSelected ? "border-primary-400 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm" : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 transition-colors ${isSelected ? "bg-primary-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                      {currentQuestion.type === "multiple_choice" ? letters[oi] : (oi === 0 ? "✓" : "✗")}
                    </div>
                    <span className={`font-medium text-base ${isSelected ? "text-primary-700 dark:text-primary-300 font-semibold" : "text-gray-700 dark:text-gray-300"}`}>
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button disabled={currentQ === 0} onClick={() => setCurrentQ(p => p - 1)}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <ChevronRight size={16} /> السابق
            </button>
            <button onClick={() => setFlagged(prev => {
              const n = new Set(prev);
              n.has(currentQuestion.id) ? n.delete(currentQuestion.id) : n.add(currentQuestion.id);
              return n;
            })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${flagged.has(currentQuestion.id) ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700" : "border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
              <Flag size={14} /> {flagged.has(currentQuestion.id) ? "مُحدد" : "تحديد"}
            </button>
            {currentQ < mockExam.questions.length - 1 ? (
              <button onClick={() => setCurrentQ(p => p + 1)}
                className="flex items-center gap-2 btn-primary px-5 py-2.5 text-sm">
                التالي <ChevronLeft size={16} />
              </button>
            ) : (
              <button onClick={() => setShowSubmitConfirm(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                <CheckCircle size={16} /> تسليم
              </button>
            )}
          </div>
        </div>

        {/* Question Map */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sticky top-20">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-3">خريطة الأسئلة</h3>
            <div className="grid grid-cols-4 lg:grid-cols-3 gap-2 mb-4">
              {mockExam.questions.map((q, i) => (
                <button key={q.id} onClick={() => setCurrentQ(i)}
                  className={`w-full aspect-square rounded-xl text-sm font-black transition-all ${i === currentQ ? "bg-primary-500 text-white shadow-md scale-110" : answers[q.id] ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : flagged.has(q.id) ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/30" /><span>تم الإجابة ({answeredCount})</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700" /><span>لم يُجب ({mockExam.questions.length - answeredCount})</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-900/20" /><span>محدد ({flagged.size})</span></div>
            </div>
            {answeredCount >= mockExam.questions.length && (
              <button onClick={() => setShowSubmitConfirm(true)}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                تسليم الاختبار
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirm */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <AlertTriangle size={40} className="text-amber-500 mx-auto mb-4" />
            <h3 className="font-black text-xl text-gray-900 dark:text-white mb-2">هل أنت متأكد؟</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
              أجبت عن <strong className="text-gray-700 dark:text-gray-200">{answeredCount}</strong> من أصل <strong className="text-gray-700 dark:text-gray-200">{mockExam.questions.length}</strong> سؤال
            </p>
            {answeredCount < mockExam.questions.length && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-700 dark:text-amber-400 text-xs font-medium">
                ⚠️ لا يزال لديك {mockExam.questions.length - answeredCount} سؤال بدون إجابة
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleSubmit}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors">
                تسليم
              </button>
              <button onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl py-3 font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
